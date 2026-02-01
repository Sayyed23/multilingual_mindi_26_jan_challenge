import React from 'react';
import { Globe, Loader2, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';

interface TranslationStatusIndicatorProps {
  status: 'idle' | 'translating' | 'translated' | 'failed';
  onRetry?: () => void;
  className?: string;
}

const TranslationStatusIndicator: React.FC<TranslationStatusIndicatorProps> = ({
  status,
  onRetry,
  className = ''
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'idle':
        return {
          icon: <Globe size={16} />,
          text: 'Ready to translate',
          color: 'text-gray-500',
          bgColor: 'bg-gray-50'
        };
      case 'translating':
        return {
          icon: <Loader2 size={16} className="animate-spin" />,
          text: 'Translating...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        };
      case 'translated':
        return {
          icon: <CheckCircle size={16} />,
          text: 'Translated',
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        };
      case 'failed':
        return {
          icon: <AlertCircle size={16} />,
          text: 'Translation failed',
          color: 'text-red-600',
          bgColor: 'bg-red-50'
        };
      default:
        return {
          icon: <Globe size={16} />,
          text: 'Unknown status',
          color: 'text-gray-500',
          bgColor: 'bg-gray-50'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${config.bgColor} ${className}`}>
      <div className={config.color}>
        {config.icon}
      </div>
      <span className={`text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
      {status === 'failed' && onRetry && (
        <button
          onClick={onRetry}
          className="ml-2 text-red-600 hover:text-red-700 transition-colors"
          title="Retry translation"
        >
          <RotateCcw size={14} />
        </button>
      )}
    </div>
  );
};

export default TranslationStatusIndicator;