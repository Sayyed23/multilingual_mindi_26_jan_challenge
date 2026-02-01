import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Pause } from 'lucide-react';
import { translationService } from '../services/translation';
import type { Language } from '../types';

interface SpeechToTextInputProps {
  language: Language;
  onTextResult?: (text: string) => void;
  onError?: (error: string) => void;
  placeholder?: string;
  maxDuration?: number;
  className?: string;
}

const SpeechToTextInput: React.FC<SpeechToTextInputProps> = ({
  language,
  onTextResult,
  onError,
  placeholder = 'Click to start recording...',
  maxDuration = 30,
  className = ''
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
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
      mediaRecorder.start(100);

      setIsRecording(true);
      setRecordingDuration(0);
      setRecognizedText('');

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

    } catch (error) {
      console.error('Failed to start recording:', error);
      onError?.('Microphone access denied or not available');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      // Stop all tracks to release microphone
      mediaRecorderRef.current.stream?.getTracks().forEach(track => track.stop());
    }
  };

  const handleRecordingStop = async () => {
    if (audioChunksRef.current.length === 0) return;

    const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);

    setAudioBlob(blob);
    setAudioUrl(url);
    audioChunksRef.current = [];

    // Process speech to text
    await processAudioToText(blob);
  };

  const processAudioToText = async (blob: Blob) => {
    setIsProcessing(true);

    try {
      // Use translation service to convert speech to text
      const result = await translationService.translateVoice(blob, language, language);
      const text = result.originalText;

      setRecognizedText(text);
      onTextResult?.(text);
    } catch (error) {
      console.error('Speech to text failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Speech recognition failed';
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
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

  const clearRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecognizedText('');
    setRecordingDuration(0);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">
          Speech to Text ({translationService.getLanguageName(language)})
        </h3>
        {audioBlob && (
          <button
            onClick={clearRecording}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        )}
      </div>

      {/* Recording Interface */}
      {!audioBlob ? (
        <div className="text-center space-y-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isRecording
              ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
              : 'bg-green-600 text-white hover:bg-green-700'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          <div className="space-y-2">
            <div className="text-lg font-mono text-gray-700">
              {formatDuration(recordingDuration)}
              {maxDuration && (
                <span className="text-sm text-gray-500 ml-2">
                  / {formatDuration(maxDuration)}
                </span>
              )}
            </div>

            {isRecording ? (
              <p className="text-sm text-gray-600">
                Recording... Speak clearly
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                {placeholder}
              </p>
            )}
          </div>
        </div>
      ) : (
        // Playback and Results Interface
        <div className="space-y-4">
          {/* Audio Controls */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={isPlaying ? pauseAudio : playAudio}
              className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>

            <div className="text-sm font-mono text-gray-700">
              {formatDuration(recordingDuration)}
            </div>
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              <span className="text-sm">Processing speech...</span>
            </div>
          )}

          {/* Recognized Text */}
          {recognizedText && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs font-medium text-gray-500 mb-1">
                Recognized Text:
              </div>
              <div className="text-gray-900">{recognizedText}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpeechToTextInput;