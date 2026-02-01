import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, RefreshCw, Clock, Database } from 'lucide-react';
import { pwaService } from '../services/pwaInit';
import { offlineSyncService } from '../services/offlineSync';

interface PWAStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: Date | null;
  pendingActions: number;
  cacheSize: number;
  syncInProgress: boolean;
  cacheStats?: {
    totalCaches: number;
    totalSize: number;
    storageUsage: number;
    storageQuota: number;
  };
}

export const PWAStatusIndicator: React.FC<PWAStatusIndicatorProps> = ({
  className = '',
  showDetails = false
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    lastSyncTime: null,
    pendingActions: 0,
    cacheSize: 0,
    syncInProgress: false
  });
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Network status listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA update listener
    const handleUpdateAvailable = () => setUpdateAvailable(true);
    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    // Sync status updates with enhanced cache information
    const updateSyncStatus = async () => {
      try {
        const status = await offlineSyncService.getSyncStatus();
        
        // Get additional cache stats from PWA service
        const cacheStats = await pwaService.getCacheStats();
        
        setSyncStatus({
          ...status,
          cacheStats
        });
      } catch (error) {
        console.error('Failed to get sync status:', error);
      }
    };

    // Update sync status periodically
    updateSyncStatus();
    const syncInterval = setInterval(updateSyncStatus, 10000); // Every 10 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
      clearInterval(syncInterval);
    };
  }, []);

  const handleUpdateApp = async () => {
    try {
      await pwaService.applyUpdate();
    } catch (error) {
      console.error('Failed to update app:', error);
    }
  };

  const handleOptimizeCaches = async () => {
    try {
      await pwaService.optimizeCaches();
      // Trigger a sync status update
      const status = await offlineSyncService.getSyncStatus();
      const cacheStats = await pwaService.getCacheStats();
      setSyncStatus({
        ...status,
        cacheStats
      });
    } catch (error) {
      console.error('Failed to optimize caches:', error);
    }
  };

  const handleForceSync = async () => {
    if (isOnline) {
      try {
        await offlineSyncService.forceSyncNow();
      } catch (error) {
        console.error('Failed to force sync:', error);
      }
    }
  };

  const formatStorageSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatLastSync = (lastSyncTime: Date | null): string => {
    if (!lastSyncTime) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-500';
    if (syncStatus.syncInProgress) return 'text-blue-500';
    if (syncStatus.pendingActions > 0) return 'text-orange-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-4 w-4" />;
    if (syncStatus.syncInProgress) return <RefreshCw className="h-4 w-4 animate-spin" />;
    return <Wifi className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (syncStatus.syncInProgress) return 'Syncing...';
    if (syncStatus.pendingActions > 0) return `${syncStatus.pendingActions} pending`;
    return 'Online';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Status Indicator */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        <div className={`${getStatusColor()}`}>
          {getStatusIcon()}
        </div>
        {showDetails && (
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        )}
        
        {/* Update Available Badge */}
        {updateAvailable && (
          <button
            onClick={handleUpdateApp}
            className="bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600 transition-colors"
            title="Update available - click to update"
          >
            <Download className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Detailed Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-50">
          <div className="space-y-2">
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Connection:</span>
              <div className={`flex items-center gap-1 ${getStatusColor()}`}>
                {getStatusIcon()}
                <span className="text-sm font-medium">{isOnline ? 'Online' : 'Offline'}</span>
              </div>
            </div>

            {/* Last Sync */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last sync:</span>
              <div className="flex items-center gap-1 text-gray-700">
                <Clock className="h-3 w-3" />
                <span className="text-sm">{formatLastSync(syncStatus.lastSyncTime)}</span>
              </div>
            </div>

            {/* Pending Actions */}
            {syncStatus.pendingActions > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending:</span>
                <span className="text-sm font-medium text-orange-600">
                  {syncStatus.pendingActions} actions
                </span>
              </div>
            )}

            {/* Cache Size and Storage Info */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cached items:</span>
              <div className="flex items-center gap-1 text-gray-700">
                <Database className="h-3 w-3" />
                <span className="text-sm">{syncStatus.cacheSize}</span>
              </div>
            </div>

            {/* Storage Usage */}
            {syncStatus.cacheStats && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Storage used:</span>
                  <span className="text-sm text-gray-700">
                    {formatStorageSize(syncStatus.cacheStats.storageUsage)} / {formatStorageSize(syncStatus.cacheStats.storageQuota)}
                  </span>
                </div>
                
                {/* Storage Usage Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      (syncStatus.cacheStats.storageUsage / syncStatus.cacheStats.storageQuota) > 0.8 
                        ? 'bg-red-500' 
                        : (syncStatus.cacheStats.storageUsage / syncStatus.cacheStats.storageQuota) > 0.6 
                        ? 'bg-orange-500' 
                        : 'bg-green-500'
                    }`}
                    style={{ 
                      width: `${Math.min(100, (syncStatus.cacheStats.storageUsage / syncStatus.cacheStats.storageQuota) * 100)}%` 
                    }}
                  />
                </div>
              </>
            )}

            {/* Actions */}
            <div className="pt-2 border-t border-gray-100 flex gap-2">
              {isOnline && (
                <button
                  onClick={handleForceSync}
                  disabled={syncStatus.syncInProgress}
                  className="flex-1 bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {syncStatus.syncInProgress ? 'Syncing...' : 'Sync Now'}
                </button>
              )}
              
              <button
                onClick={handleOptimizeCaches}
                className="flex-1 bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700 transition-colors"
              >
                Optimize
              </button>
              
              {updateAvailable && (
                <button
                  onClick={handleUpdateApp}
                  className="flex-1 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                >
                  Update App
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PWAStatusIndicator;