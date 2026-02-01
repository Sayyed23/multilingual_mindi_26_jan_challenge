import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Pause, RotateCcw, Send, X, Volume2 } from 'lucide-react';
import { translationService } from '../services/translation';
import type { Language, TranslationResult } from '../types';

interface VoiceMessageRecorderProps {
  fromLanguage: Language;
  toLanguage: Language;
  onSend?: (audioBlob: Blob, translation: TranslationResult) => void;
  onCancel?: () => void;
  className?: string;
  maxDuration?: number; // in seconds
}

const VoiceMessageRecorder: React.FC<VoiceMessageRecorderProps> = ({
  fromLanguage,
  toLanguage,
  onSend,
  onCancel,
  className = '',
  maxDuration = 60
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translation, setTranslation] = useState<TranslationResult | null>(null);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Set up audio context for waveform visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = handleRecordingStop;
      mediaRecorder.start(100); // Collect data every 100ms

      setIsRecording(true);
      setRecordingDuration(0);
      setTranslation(null);
      setTranslationError(null);

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);

      // Start waveform visualization
      visualizeAudio();

    } catch (error) {
      console.error('Failed to start recording:', error);
      setTranslationError('Microphone access denied or not available');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop duration timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      // Stop waveform visualization
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // Stop all tracks to release microphone
      mediaRecorderRef.current.stream?.getTracks().forEach(track => track.stop());

      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    }
  };

  const handleRecordingStop = async () => {
    if (audioChunksRef.current.length === 0) return;

    const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);

    setAudioBlob(blob);
    setAudioUrl(url);
    audioChunksRef.current = [];

    // Auto-translate the recorded audio
    await translateAudio(blob);
  };

  const translateAudio = async (blob: Blob) => {
    setIsTranslating(true);
    setTranslationError(null);

    try {
      const result = await translationService.translateVoice(
        blob,
        fromLanguage,
        toLanguage
      );
      setTranslation(result);
    } catch (error) {
      console.error('Voice translation failed:', error);
      setTranslationError(
        error instanceof Error ? error.message : 'Voice translation failed'
      );
    } finally {
      setIsTranslating(false);
    }
  };

  const retryTranslation = async () => {
    if (!audioBlob) return;
    await translateAudio(audioBlob);
  };

  const playAudio = () => {
    if (!audioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onplay = () => setIsPlaying(true);
    audio.onpause = () => setIsPlaying(false);
    audio.onended = () => setIsPlaying(false);

    audio.play().catch(error => {
      console.error('Failed to play audio:', error);
      setIsPlaying(false);
    });
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleSend = () => {
    if (audioBlob && translation && onSend) {
      onSend(audioBlob, translation);
    }
  };

  const handleCancel = () => {
    if (isRecording) {
      stopRecording();
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    onCancel?.();
  };

  const visualizeAudio = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateWaveform = () => {
      if (!analyserRef.current || !isRecording) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      // Sample every 8th value for visualization
      const sampledData = [];
      for (let i = 0; i < bufferLength; i += 8) {
        sampledData.push(dataArray[i]);
      }

      setWaveformData(sampledData);
      animationFrameRef.current = requestAnimationFrame(updateWaveform);
    };

    updateWaveform();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceText = (confidence: number): string => {
    if (confidence >= 0.8) return 'High confidence';
    if (confidence >= 0.6) return 'Medium confidence';
    return 'Low confidence';
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Voice Message</h3>
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Recording/Playback Area */}
      <div className="text-center mb-6">
        {!audioBlob ? (
          // Recording interface
          <div className="space-y-4">
            {/* Waveform visualization */}
            {isRecording && (
              <div className="flex items-center justify-center h-16 space-x-1">
                {waveformData.map((value, index) => (
                  <div
                    key={index}
                    className="bg-green-500 rounded-full transition-all duration-100"
                    style={{
                      width: '3px',
                      height: `${Math.max(4, (value / 255) * 60)}px`
                    }}
                  />
                ))}
              </div>
            )}

            {/* Record button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isRecording
                  ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                  : 'bg-green-600 text-white hover:bg-green-700'
                }`}
            >
              {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
            </button>

            {/* Duration display */}
            <div className="text-lg font-mono text-gray-700">
              {formatDuration(recordingDuration)}
              {maxDuration && (
                <span className="text-sm text-gray-500 ml-2">
                  / {formatDuration(maxDuration)}
                </span>
              )}
            </div>

            {isRecording && (
              <p className="text-sm text-gray-600">
                Speak clearly in {translationService.getLanguageName(fromLanguage)}
              </p>
            )}
          </div>
        ) : (
          // Playback interface
          <div className="space-y-4">
            {/* Audio controls */}
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={isPlaying ? pauseAudio : playAudio}
                className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>

              <div className="text-lg font-mono text-gray-700">
                {formatDuration(recordingDuration)}
              </div>

              <button
                onClick={() => {
                  setAudioBlob(null);
                  setAudioUrl(null);
                  setTranslation(null);
                  setTranslationError(null);
                  if (audioUrl) {
                    URL.revokeObjectURL(audioUrl);
                  }
                }}
                className="w-12 h-12 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                title="Record again"
              >
                <RotateCcw size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Translation Section */}
      {audioBlob && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Translation</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{translationService.getLanguageName(fromLanguage)}</span>
              <span>→</span>
              <span>{translationService.getLanguageName(toLanguage)}</span>
            </div>
          </div>

          {isTranslating ? (
            <div className="flex items-center justify-center py-8 text-blue-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current mr-3"></div>
              <span>Translating voice message...</span>
            </div>
          ) : translation ? (
            <div className="space-y-3">
              {/* Original text */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs font-medium text-gray-500 mb-1">Original</div>
                <div className="text-gray-900">{translation.originalText}</div>
              </div>

              {/* Translated text */}
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-xs font-medium text-green-700 mb-1">Translation</div>
                <div className="text-gray-900">{translation.translatedText}</div>
              </div>

              {/* Confidence indicator */}
              <div className="flex items-center justify-between text-sm">
                <div className={`flex items-center space-x-1 ${getConfidenceColor(translation.confidence)}`}>
                  <Volume2 size={14} />
                  <span>{getConfidenceText(translation.confidence)}</span>
                  <span className="font-mono">({Math.round(translation.confidence * 100)}%)</span>
                </div>

                {translation.confidence < 0.6 && (
                  <button
                    onClick={retryTranslation}
                    className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                  >
                    <RotateCcw size={14} />
                    <span>Retry</span>
                  </button>
                )}
              </div>
            </div>
          ) : translationError ? (
            <div className="text-center py-6">
              <div className="text-red-600 mb-3">{translationError}</div>
              <button
                onClick={retryTranslation}
                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* Action Buttons */}
      {audioBlob && (
        <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSend}
            disabled={!translation || isTranslating}
            className={`px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors ${translation && !isTranslating
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
          >
            <Send size={16} />
            <span>Send Voice Message</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceMessageRecorder;