import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { pwaService } from '../services/pwaInit';

interface PWAInstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  onInstall,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('desktop');

  useEffect(() => {
    // Check if PWA is installable
    const checkInstallability = () => {
      if (pwaService.isInstallable() && !pwaService.isInstalled()) {
        setIsVisible(true);
      }
    };

    // Detect device type
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    setDeviceType(isMobile ? 'mobile' : 'desktop');

    // Listen for PWA install availability
    const handleInstallAvailable = () => {
      if (!pwaService.isInstalled()) {
        setIsVisible(true);
      }
    };

    const handleInstallCompleted = () => {
      setIsVisible(false);
      onInstall?.();
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-install-completed', handleInstallCompleted);

    // Initial check
    checkInstallability();

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-install-completed', handleInstallCompleted);
    };
  }, [onInstall]);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await pwaService.showInstallPrompt();
      if (success) {
        setIsVisible(false);
        onInstall?.();
      }
    } catch (error) {
      console.error('Failed to install PWA:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {deviceType === 'mobile' ? (
              <Smartphone className="h-5 w-5 text-green-600" />
            ) : (
              <Monitor className="h-5 w-5 text-green-600" />
            )}
            <h3 className="font-semibold text-gray-900">Install AgriMandi</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss install prompt"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Install AgriMandi for faster access, offline functionality, and push notifications.
        </p>

        <div className="flex gap-2">
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isInstalling ? 'Installing...' : 'Install'}
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Later
          </button>
        </div>

        {deviceType === 'mobile' && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Tip: You can also add to home screen from your browser menu
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAInstallPrompt;