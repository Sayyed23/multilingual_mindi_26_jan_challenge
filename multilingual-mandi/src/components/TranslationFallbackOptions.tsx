import React, { useState } from 'react';
import { RotateCcw, Globe, AlertCircle, Wifi, WifiOff, Edit3, Languages } from 'lucide-react';
import { translationService } from '../services/translation';
import type { Language, TranslationResult } from '../types';

interface TranslationFallbackOptionsProps {
  originalText: string;
  fromLanguage: Language;
  toLanguage: Language;
  error?: Error;
  onRetry?: () => Promise<void>;
  onUseOriginal?: () => void;
  onEdit?: (newText: string) => void;
  onLanguageChange?: (newFromLang: Language, newToLang: Language) => void;
  onFallbackResult?: (result: TranslationResult) => void;
  className?: string;
}

const TranslationFallbackOptions: React.FC<TranslationFallbackOptionsProps> = ({
  originalText,
  fromLanguage,
  toLanguage,
  error,
  onRetry,
  onUseOriginal,
  onEdit,
  onLanguageChange,
  onFallbackResult,
  className = ''
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [editedText, setEditedText] = useState(originalText);
  const [showEditMode, setShowEditMode] = useState(false);
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);
  const [selectedFromLang, setSelectedFromLang] = useState(fromLanguage);
  const [selectedToLang, setSelectedToLang] = useState(toLanguage);

  const handleRetry = async () => {
    if (!onRetry) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleEditSubmit = () => {
    if (editedText.trim() && onEdit) {
      onEdit(editedText.trim());
      setShowEditMode(false);
    }
  };

  const handleLanguageChange = () => {
    if (onLanguageChange) {
      onLanguageChange(selectedFromLang, selectedToLang);
      setShowLanguageOptions(false);
    }
  };

  const trySimplifiedTranslation = async () => {
    try {
      // Simplify the text and try again
      const simplifiedText = originalText
        .replace(/[^\w\s]/g, '') // Remove special characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
        .toLowerCase();

      const result = await translationService.translateText(
        simplifiedText,
        fromLanguage,
        toLanguage
      );

      if (onFallbackResult) {
        onFallbackResult(result);
      }
    } catch (error) {
      console.error('Simplified translation failed:', error);
    }
  };

  const getErrorType = (): string => {
    if (!error) return 'unknown';
    
    const message = error.message.toLowerCase();
    if (message.includes('network') || message.includes('connection')) return 'network';
    if (message.includes('quota') || message.includes('limit')) return 'quota';
    if (message.includes('confidence') || message.includes('quality')) return 'confidence';
    if (message.includes('language') || message.includes('unsupported')) return 'language';
    if (message.includes('service') || message.includes('unavailable')) return 'service';
    return 'unknown';
  };

  const getErrorIcon = () => {
    const errorType = getErrorType();
    switch (errorType) {
      case 'network':
        return <WifiOff size={20} className="text-red-500" />;
      case 'quota':
        return <AlertCircle size={20} className="text-orange-500" />;
      case 'confidence':
        return <Globe size={20} className="text-yellow-500" />;
      case 'language':
        return <Languages size={20} className="text-blue-500" />;
      case 'service':
        return <Wifi size={20} className="text-gray-500" />;
      default:
        return <AlertCircle size={20} className="text-red-500" />;
    }
  };

  const getErrorTitle = (): string => {
    const errorType = getErrorType();
    switch (errorType) {
      case 'network':
        return 'Connection Issue';
      case 'quota':
        return 'Translation Limit Reached';
      case 'confidence':
        return 'Low Translation Quality';
      case 'language':
        return 'Language Not Supported';
      case 'service':
        return 'Service Temporarily Unavailable';
      default:
        return 'Translation Failed';
    }
  };

  const getErrorDescription = (): string => {
    const errorType = getErrorType();
    switch (errorType) {
      case 'network':
        return 'Please check your internet connection and try again.';
      case 'quota':
        return 'You\'ve reached your translation limit. Please try again later.';
      case 'confidence':
        return 'The translation quality was too low. Try rephrasing your message.';
      case 'language':
        return 'This language combination is not currently supported.';
      case 'service':
        return 'The translation service is temporarily down. Please try again later.';
      default:
        return error?.message || 'An unexpected error occurred during translation.';
    }
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
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      {/* Error Header */}
      <div className="flex items-start space-x-3 mb-4">
        {getErrorIcon()}
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-1">{getErrorTitle()}</h3>
          <p className="text-sm text-gray-600">{getErrorDescription()}</p>
        </div>
      </div>

      {/* Fallback Options */}
      <div className="space-y-3">
        {/* Primary actions */}
        <div className="flex flex-wrap gap-2">
          {/* Retry */}
          {onRetry && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw size={16} className={isRetrying ? 'animate-spin' : ''} />
              <span>{isRetrying ? 'Retrying...' : 'Try Again'}</span>
            </button>
          )}

          {/* Use Original */}
          {onUseOriginal && (
            <button
              onClick={onUseOriginal}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Globe size={16} />
              <span>Use Original</span>
            </button>
          )}

          {/* Edit Text */}
          {onEdit && (
            <button
              onClick={() => setShowEditMode(!showEditMode)}
              className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Edit3 size={16} />
              <span>Edit Text</span>
            </button>
          )}

          {/* Change Language */}
          {onLanguageChange && (
            <button
              onClick={() => setShowLanguageOptions(!showLanguageOptions)}
              className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Languages size={16} />
              <span>Change Language</span>
            </button>
          )}
        </div>

        {/* Secondary actions for specific error types */}
        {getErrorType() === 'confidence' && (
          <button
            onClick={trySimplifiedTranslation}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Try with simplified text
          </button>
        )}

        {/* Edit Mode */}
        {showEditMode && (
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Edit your message:
            </label>
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Enter your message..."
            />
            <div className="flex items-center justify-end space-x-2 mt-3">
              <button
                onClick={() => setShowEditMode(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={!editedText.trim()}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Changes
              </button>
            </div>
          </div>
        )}

        {/* Language Options */}
        {showLanguageOptions && (
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Language:
                </label>
                <select
                  value={selectedFromLang}
                  onChange={(e) => setSelectedFromLang(e.target.value as Language)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {supportedLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Language:
                </label>
                <select
                  value={selectedToLang}
                  onChange={(e) => setSelectedToLang(e.target.value as Language)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {supportedLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 mt-3">
              <button
                onClick={() => setShowLanguageOptions(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleLanguageChange}
                className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Apply Languages
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationFallbackOptions;