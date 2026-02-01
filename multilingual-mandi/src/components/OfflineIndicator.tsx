import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Clock, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { offlineSyncService } from '../services/offlineSync';

interface OfflineIndicatorProps {
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: Date | null;
  pendingActions: number;
  cacheSize: number;
  syncInProgress: boolean;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  className = '',
  showDetails = false,
  compact = false
}) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSyncTime: null,
    pendingActions: 0,
    cacheSize: 0,
    syncInProgress: false
  });
  const [showDetailedStatus, setShowDetailedStatus] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Update sync status
  const updateSyncStatus = async () => {
    try {
      const status = await offlineSyncService.getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('Failed to get sync status:', error);
    }
  };

  // Initialize and set up listeners
  useEffect(() => {
    updateSyncStatus();

    // Listen for online/offline events
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      updateSyncStatus();
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update status periodically
    const interval = setInterval(updateSyncStatus, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const handleManualSync = async () => {
    if (!syncStatus.isOnline || syncing) return;

    setSyncing(true);
    try {
      await offlineSyncService.forceSyncNow();
      await updateSyncStatus();
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const formatLastSync = (lastSync: Date | null) => {
    if (!lastSync) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getStatusColor = () => {
    if (!syncStatus.isOnline) return 'text-red-600 bg-red-50 border-red-200';
    if (syncStatus.pendingActions > 0) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getStatusIcon = () => {
    if (syncStatus.syncInProgress || syncing) {
      return <RefreshCw size={16} className="animate-spin" />;
    }
    if (!syncStatus.isOnline) {
      return <WifiOff size={16} />;
    }
    if (syncStatus.pendingActions > 0) {
      return <AlertCircle size={16} />;
    }
    return <Wifi size={16} />;
  };

  const getStatusText = () => {
    if (syncStatus.syncInProgress || syncing) return 'Syncing...';
    if (!syncStatus.isOnline) return 'Offline';
    if (syncStatus.pendingActions > 0) return `${syncStatus.pendingActions} pending`;
    return 'Online';
  };

  // Compact indicator for mobile/small spaces
  if (compact || (!showDetails && !showDetailedStatus)) {
    return (
      <button
        onClick={() => setShowDetailedStatus(true)}
        className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${getStatusColor()} ${className}`}
      >
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </button>
    );
  }

  // Detailed status panel
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b border-gray-100 ${getStatusColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="font-medium">{getStatusText()}</span>
          </div>
          {!showDetails && (
            <button
              onClick={() => setShowDetailedStatus(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Status Details */}
      <div className="p-4 space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {syncStatus.isOnline ? (
              <CheckCircle size={16} className="text-green-600" />
            ) : (
              <WifiOff size={16} className="text-red-600" />
            )}
            <span className="text-sm font-medium">Connection</span>
          </div>
          <span className={`text-sm ${syncStatus.isOnline ? 'text-green-600' : 'text-red-600'}`}>
            {syncStatus.isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Last Sync */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock size={16} className="text-gray-400" />
            <span className="text-sm font-medium">Last Sync</span>
          </div>
          <span className="text-sm text-gray-600">
            {formatLastSync(syncStatus.lastSyncTime)}
          </span>
        </div>

        {/* Pending Actions */}
        {syncStatus.pendingActions > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle size={16} className="text-orange-500" />
              <span className="text-sm font-medium">Pending Actions</span>
            </div>
            <span className="text-sm text-orange-600">
              {syncStatus.pendingActions}
            </span>
          </div>
        )}

        {/* Cache Size */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database size={16} className="text-gray-400" />
            <span className="text-sm font-medium">Cached Items</span>
          </div>
          <span className="text-sm text-gray-600">
            {syncStatus.cacheSize}
          </span>
        </div>

        {/* Manual Sync Button */}
        {syncStatus.isOnline && (
          <button
            onClick={handleManualSync}
            disabled={syncing || syncStatus.syncInProgress}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
            <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        )}

        {/* Offline Message */}
        {!syncStatus.isOnline && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <WifiOff size={16} className="text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Working Offline</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Your actions will be saved and synced when connection is restored.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sync in Progress */}
        {(syncStatus.syncInProgress || syncing) && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <RefreshCw size={16} className="text-blue-600 animate-spin" />
              <p className="text-sm font-medium text-blue-800">Synchronizing data...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;