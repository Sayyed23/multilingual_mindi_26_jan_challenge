import React, { useState } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { usePWA } from '../utils/pwa';

interface PWAInstallPromptProps {
  onClose?: () => void;
  className?: string;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ 
  onClose, 
  className = '' 
}) => {
  const { installable, install, getInstructions, displayMode } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  if (!installable || displayMode === 'standalone') {
    return null;
  }

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await install();
      if (success) {
        onClose?.();
      } else {
        setShowInstructions(true);
      }
    } catch (error) {
      console.error('Installation failed:', error);
      setShowInstructions(true);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className={`bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4 rounded-lg shadow-lg ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Install Multilingual Mandi</h3>
            <p className="text-emerald-100 text-sm mt-1">
              Get the full app experience with offline access and faster loading
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
            aria-label="Close install prompt"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {!showInstructions ? (
        <div className="mt-4 flex items-center space-x-3">
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="bg-white text-emerald-700 px-4 py-2 rounded-lg font-medium hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>{isInstalling ? 'Installing...' : 'Install App'}</span>
          </button>
          <button
            onClick={() => setShowInstructions(true)}
            className="text-emerald-100 hover:text-white text-sm underline"
          >
            Manual install
          </button>
        </div>
      ) : (
        <div className="mt-4 p-3 bg-white/10 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Monitor className="w-4 h-4" />
            <span className="font-medium text-sm">Manual Installation</span>
          </div>
          <p className="text-emerald-100 text-sm">
            {getInstructions()}
          </p>
          <button
            onClick={() => setShowInstructions(false)}
            className="text-emerald-100 hover:text-white text-sm underline mt-2"
          >
            ← Back to auto install
          </button>
        </div>
      )}

      <div className="mt-3 flex items-center space-x-4 text-xs text-emerald-200">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
          <span>Works offline</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
          <span>Faster loading</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
          <span>Native app feel</span>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;