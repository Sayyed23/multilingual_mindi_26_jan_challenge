import React from 'react';
import { AlertTriangle, CheckCircle, AlertCircle, Globe, RotateCcw } from 'lucide-react';
import type { TranslationResult } from '../types';

interface TranslationConfidenceIndicatorProps {
  translation: TranslationResult;
  onRetry?: () => void;
  showDetails?: boolean;
  className?: string;
}

const TranslationConfidenceIndicator: React.FC<TranslationConfidenceIndicatorProps> = ({
  translation,
  onRetry,
  showDetails = false,
  className = ''
}) => {
  const getConfidenceLevel = (confidence: number): 'high' | 'medium' | 'low' => {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBgColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'bg-green-50 border-green-200';
    if (confidence >= 0.6) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle size={16} />;
    if (confidence >= 0.6) return <AlertTriangle size={16} />;
    return <AlertCircle size={16} />;
  };

  const getConfidenceText = (confidence: number): string => {
    if (confidence >= 0.8) return 'High confidence';
    if (confidence >= 0.6) return 'Medium confidence';
    return 'Low confidence';
  };

  const getConfidenceDescription = (confidence: number): string => {
    if (confidence >= 0.8) {
      return 'Translation is highly accurate and reliable.';
    }
    if (confidence >= 0.6) {
      return 'Translation is generally accurate but may have minor issues.';
    }
    return 'Translation quality is uncertain. Consider rephrasing or using simpler language.';
  };

  const confidenceLevel = getConfidenceLevel(translation.confidence);
  const confidencePercentage = Math.round(translation.confidence * 100);

  if (!showDetails) {
    // Compact indicator
    return (
      <div className={`flex items-center space-x-1 ${getConfidenceColor(translation.confidence)} ${className}`}>
        <Globe size={12} />
        <span className="text-xs font-medium">{confidencePercentage}%</span>
      </div>
    );
  }

  // Detailed indicator
  return (
    <div className={`rounded-lg border p-3 ${getConfidenceBgColor(translation.confidence)} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <div className={getConfidenceColor(translation.confidence)}>
            {getConfidenceIcon(translation.confidence)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`font-medium ${getConfidenceColor(translation.confidence)}`}>
                {getConfidenceText(translation.confidence)}
              </span>
              <span className={`text-sm font-mono ${getConfidenceColor(translation.confidence)}`}>
                ({confidencePercentage}%)
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {getConfidenceDescription(translation.confidence)}
            </p>
          </div>
        </div>

        {/* Retry button for low confidence */}
        {confidenceLevel === 'low' && onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
            title="Retry translation"
          >
            <RotateCcw size={14} />
            <span>Retry</span>
          </button>
        )}
      </div>

      {/* Confidence bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Translation Quality</span>
          <span>{confidencePercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              confidenceLevel === 'high'
                ? 'bg-green-500'
                : confidenceLevel === 'medium'
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${confidencePercentage}%` }}
          />
        </div>
      </div>

      {/* Additional details */}
      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>
            {translation.fromLanguage.toUpperCase()} → {translation.toLanguage.toUpperCase()}
          </span>
          <span>
            {translation.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TranslationConfidenceIndicator;