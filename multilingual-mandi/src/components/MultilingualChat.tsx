import { useState, useRef, useEffect, type FC } from 'react';
import { Send, Mic, MicOff, AlertCircle, CheckCircle, RotateCcw, Globe } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { translationService } from '../services/translation';
import type { Message, TranslationResult, Language } from '../types';

interface ChatMessage extends Omit<Message, 'id' | 'conversationId' | 'senderId' | 'receiverId'> {
  id: string;
  isOwn: boolean;
  translationStatus?: 'translating' | 'translated' | 'failed';
  translationError?: string;
}

interface MultilingualChatProps {
  recipientId?: string;
  recipientName?: string;
  recipientLanguage?: Language;
  onSendMessage?: (message: ChatMessage) => void;
  messages?: ChatMessage[];
  className?: string;
}

const MultilingualChat: FC<MultilingualChatProps> = ({
  recipientName = 'Chat Partner',
  recipientLanguage = 'hi',
  onSendMessage,
  messages = [],
  className = ''
}) => {
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [showTranslationOptions, setShowTranslationOptions] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(user?.language || 'en');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendText = async () => {
    if (!inputText.trim() || !user) return;

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newMessage: ChatMessage = {
      id: messageId,
      content: {
        originalText: inputText,
        originalLanguage: selectedLanguage,
        translations: {},
        messageType: 'text'
      },
      metadata: {
        timestamp: new Date(),
        readStatus: false
      },
      isOwn: true,
      translationStatus: 'translating'
    };

    // Add message immediately
    onSendMessage?.(newMessage);
    setInputText('');
    setIsTranslating(true);
    setTranslationError(null);

    try {
      // Translate to recipient's language if different
      if (selectedLanguage !== recipientLanguage) {
        const translation = await translationService.translateText(
          inputText,
          selectedLanguage,
          recipientLanguage
        );

        newMessage.content.translations[recipientLanguage] = translation.translatedText;
        newMessage.metadata.translationConfidence = translation.confidence;
      }

      newMessage.translationStatus = 'translated';
      onSendMessage?.(newMessage);
    } catch (error) {
      console.error('Translation failed:', error);
      newMessage.translationStatus = 'failed';
      newMessage.translationError = error instanceof Error ? error.message : 'Translation failed';
      onSendMessage?.(newMessage);
      setTranslationError('Translation failed. Message sent in original language.');
    } finally {
      setIsTranslating(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = handleRecordingStop;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      setTranslationError('Microphone access denied or not available');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop all tracks to release microphone
      mediaRecorderRef.current.stream?.getTracks().forEach(track => track.stop());
    }
  };

  const handleRecordingStop = async () => {
    if (audioChunksRef.current.length === 0) return;

    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    audioChunksRef.current = [];

    if (!user) return;

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newMessage: ChatMessage = {
      id: messageId,
      content: {
        originalText: '[Voice Message]',
        originalLanguage: selectedLanguage,
        translations: {},
        messageType: 'voice'
      },
      metadata: {
        timestamp: new Date(),
        readStatus: false,
        attachments: [{
          id: `audio_${messageId}`,
          type: 'audio',
          url: URL.createObjectURL(audioBlob),
          filename: `voice_${Date.now()}.webm`,
          size: audioBlob.size
        }]
      },
      isOwn: true,
      translationStatus: 'translating'
    };

    // Add message immediately
    onSendMessage?.(newMessage);
    setIsTranslating(true);
    setTranslationError(null);

    try {
      // Translate voice to text and then to recipient's language
      const translation = await translationService.translateVoice(
        audioBlob,
        selectedLanguage,
        recipientLanguage
      );

      newMessage.content.originalText = translation.originalText;
      newMessage.content.translations[recipientLanguage] = translation.translatedText;
      newMessage.metadata.translationConfidence = translation.confidence;
      newMessage.translationStatus = 'translated';

      onSendMessage?.(newMessage);
    } catch (error) {
      console.error('Voice translation failed:', error);
      newMessage.translationStatus = 'failed';
      newMessage.translationError = error instanceof Error ? error.message : 'Voice translation failed';
      onSendMessage?.(newMessage);
      setTranslationError('Voice translation failed. Voice message sent without translation.');
    } finally {
      setIsTranslating(false);
    }
  };

  const retryTranslation = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || !user) return;

    // Fix: Explicitly type as ChatMessage to avoid 'translating' literal narrowing from preventing updates
    const updatedMessage: ChatMessage = { ...message, translationStatus: 'translating' };

    onSendMessage?.(updatedMessage);
    setTranslationError(null);

    try {
      let translation: TranslationResult;

      if (message.content.messageType === 'voice' && message.metadata.attachments?.[0]) {
        // Re-fetch the audio blob for voice messages
        const audioUrl = message.metadata.attachments[0].url;
        const response = await fetch(audioUrl);
        const audioBlob = await response.blob();

        translation = await translationService.translateVoice(
          audioBlob,
          selectedLanguage,
          recipientLanguage
        );
      } else {
        translation = await translationService.translateText(
          message.content.originalText,
          selectedLanguage,
          recipientLanguage
        );
      }

      updatedMessage.content.translations[recipientLanguage] = translation.translatedText;
      updatedMessage.metadata.translationConfidence = translation.confidence;
      updatedMessage.translationStatus = 'translated';
      updatedMessage.translationError = undefined;

      onSendMessage?.(updatedMessage);
    } catch (error) {
      console.error('Retry translation failed:', error);
      updatedMessage.translationStatus = 'failed';
      updatedMessage.translationError = error instanceof Error ? error.message : 'Translation retry failed';
      onSendMessage?.(updatedMessage);
      setTranslationError('Translation retry failed.');
    }
  };

  const getConfidenceColor = (confidence?: number): string => {
    if (!confidence) return 'text-gray-400';
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceText = (confidence?: number): string => {
    if (!confidence) return 'Unknown';
    if (confidence >= 0.8) return 'High confidence';
    if (confidence >= 0.6) return 'Medium confidence';
    return 'Low confidence';
  };

  const renderMessage = (message: ChatMessage) => {
    const isVoice = message.content.messageType === 'voice';
    const displayText = message.isOwn
      ? message.content.originalText
      : (message.content.translations[user?.language || 'en'] || message.content.originalText);

    const confidence = message.metadata.translationConfidence;
    const hasTranslation = Object.keys(message.content.translations).length > 0;

    return (
      <div
        key={message.id}
        className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.isOwn
            ? 'bg-green-600 text-white'
            : 'bg-white text-gray-900 border border-gray-200'
            }`}
        >
          {/* Voice message audio player */}
          {isVoice && message.metadata.attachments?.[0] && (
            <div className="mb-2">
              <audio
                controls
                className="w-full h-8"
                src={message.metadata.attachments[0].url}
                data-testid="voice-message-player"
              >
                Your browser does not support audio playback.
              </audio>
            </div>
          )}

          {/* Message text */}
          <div className="text-sm">
            {displayText}
          </div>

          {/* Translation status and confidence indicators */}
          <div className="flex items-center justify-between mt-2 text-xs">
            <div className="flex items-center space-x-2">
              {/* Translation status */}
              {message.translationStatus === 'translating' && (
                <div className="flex items-center space-x-1 text-blue-400">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                  <span>Translating...</span>
                </div>
              )}

              {message.translationStatus === 'translated' && hasTranslation && (
                <div className="flex items-center space-x-1 text-green-400">
                  <CheckCircle size={12} />
                  <span>Translated</span>
                </div>
              )}

              {message.translationStatus === 'failed' && (
                <div className="flex items-center space-x-1 text-red-400">
                  <AlertCircle size={12} />
                  <span>Failed</span>
                  <button
                    onClick={() => retryTranslation(message.id)}
                    className="ml-1 hover:text-red-300"
                    title="Retry translation"
                  >
                    <RotateCcw size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Confidence indicator */}
            {confidence !== undefined && hasTranslation && (
              <div className={`flex items-center space-x-1 ${getConfidenceColor(confidence)}`}>
                <Globe size={10} />
                <span title={getConfidenceText(confidence)}>
                  {Math.round(confidence * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Translation error */}
          {message.translationError && (
            <div className="mt-1 text-xs text-red-400">
              {message.translationError}
            </div>
          )}

          {/* Timestamp */}
          <div className={`text-xs mt-1 ${message.isOwn ? 'text-green-100' : 'text-gray-500'}`}>
            {message.metadata.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
    );
  };

  const supportedLanguages: Array<{ code: Language; name: string }> = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'mr', name: 'मराठी' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'മലയാളം' },
    { code: 'or', name: 'ଓଡ଼ିଆ' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ' },
    { code: 'as', name: 'অসমীয়া' },
    { code: 'ur', name: 'اردو' }
  ];

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {recipientName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{recipientName}</h3>
            <p className="text-sm text-gray-500">
              Speaking {translationService.getLanguageName(recipientLanguage)}
            </p>
          </div>
        </div>

        {/* Language selector */}
        <div className="relative">
          <button
            onClick={() => setShowTranslationOptions(!showTranslationOptions)}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Globe size={16} />
            <span className="text-sm font-medium">
              {translationService.getLanguageName(selectedLanguage)}
            </span>
          </button>

          {showTranslationOptions && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <div className="p-2">
                <div className="text-xs font-semibold text-gray-500 mb-2 px-2">
                  Your Language
                </div>
                {supportedLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLanguage(lang.code);
                      setShowTranslationOptions(false);
                    }}
                    className={`w-full text-left px-2 py-2 text-sm rounded hover:bg-gray-100 ${selectedLanguage === lang.code ? 'bg-green-50 text-green-700' : 'text-gray-700'
                      }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <Globe size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Start a conversation</p>
            <p className="text-sm">
              Messages will be automatically translated between {translationService.getLanguageName(selectedLanguage)} and {translationService.getLanguageName(recipientLanguage)}
            </p>
          </div>
        ) : (
          messages.map(renderMessage)
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Translation error banner */}
      {translationError && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle size={16} />
            <span className="text-sm">{translationError}</span>
            <button
              onClick={() => setTranslationError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-end space-x-3">
          {/* Text input */}
          <div className="flex-1">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendText();
                }
              }}
              placeholder={`Type a message in ${translationService.getLanguageName(selectedLanguage)}...`}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={1}
              disabled={isTranslating}
            />
          </div>

          {/* Voice recording button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isTranslating}
            className={`p-3 rounded-lg transition-colors ${isRecording
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isRecording ? 'Stop recording' : 'Start voice recording'}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Send button */}
          <button
            onClick={handleSendText}
            disabled={!inputText.trim() || isTranslating}
            className={`p-3 rounded-lg transition-colors ${inputText.trim() && !isTranslating
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            title="Send message"
          >
            <Send size={20} />
          </button>
        </div>

        {/* Recording indicator */}
        {isRecording && (
          <div className="flex items-center justify-center mt-3 text-red-600">
            <div className="animate-pulse flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              <span className="text-sm font-medium">Recording...</span>
            </div>
          </div>
        )}

        {/* Translation indicator */}
        {isTranslating && (
          <div className="flex items-center justify-center mt-3 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
            <span className="text-sm">Translating message...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultilingualChat;