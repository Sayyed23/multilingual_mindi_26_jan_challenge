import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, Trash2, Info } from 'lucide-react';
import { useServiceWorker, formatCacheSize } from '../services/serviceWorker';

interface OfflineIndicatorProps {
  className?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className = '' }) => {
  const { status, updateServiceWorker, clearCache, getCacheInfo } = useServiceWorker();
  const [showDetails, setShowDetails] = useState(false);
  const [cacheInfo, setCacheInfo] = useState({ size: 0, entries: 0 });
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    // Load cache info when component mounts or when details are shown
    if (showDetails) {
      loadCacheInfo();
    }
  }, [showDetails]);

  const loadCacheInfo = async () => {
    try {
      const info = await getCacheInfo();
      setCacheInfo(info);
    } catch (error) {
      console.error('Failed to load cache info:', error);
    }
  };

  const handleUpdateApp = async () => {
    try {
      await updateServiceWorker();
    } catch (error) {
      console.error('Failed to update app:', error);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear all cached data? This will remove offline content.')) {
      return;
    }

    setIsClearing(true);
    try {
      await clearCache();
      await loadCacheInfo();
      alert('Cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      alert('Failed to clear cache');
    } finally {
      setIsClearing(false);
    }
  };

  if (!status.isSupported) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main indicator */}
      <div 
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
          status.isOnline 
            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
            : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
        }`}
        onClick={() => setShowDetails(!showDetails)}
      >
        {status.isOnline ? (
          <Wifi className="w-4 h-4" />
        ) : (
          <WifiOff className="w-4 h-4" />
        )}
        <span>
          {status.isOnline ? 'Online' : 'Offline'}
        </span>
        {status.hasUpdate && (
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        )}
      </div>

      {/* Update notification */}
      {status.hasUpdate && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg shadow-lg z-50 min-w-64">
          <div className="flex items-start gap-2">
            <Download className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                App Update Available
              </p>
              <p className="text-xs text-blue-700 mt-1">
                A new version of the app is ready to install.
              </p>
              <button
                onClick={handleUpdateApp}
                className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                Update Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details panel */}
      {showDetails && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-80">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-gray-600" />
              <h3 className="font-medium text-gray-900">PWA Status</h3>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Connection:</span>
                <span className={status.isOnline ? 'text-green-600' : 'text-orange-600'}>
                  {status.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Service Worker:</span>
                <span className={status.isRegistered ? 'text-green-600' : 'text-red-600'}>
                  {status.isRegistered ? 'Active' : 'Not Registered'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Cached Items:</span>
                <span className="text-gray-900">{cacheInfo.entries}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Cache Size:</span>
                <span className="text-gray-900">{formatCacheSize(cacheInfo.size)}</span>
              </div>
            </div>

            {!status.isOnline && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                <p className="text-xs text-orange-800">
                  <strong>Offline Mode:</strong> You can still browse cached content and compose messages. 
                  They will be sent when you're back online.
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-gray-200">
              <button
                onClick={handleClearCache}
                disabled={isClearing}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3" />
                {isClearing ? 'Clearing...' : 'Clear Cache'}
              </button>
              
              <button
                onClick={() => setShowDetails(false)}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 border border-gray-200 rounded hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;