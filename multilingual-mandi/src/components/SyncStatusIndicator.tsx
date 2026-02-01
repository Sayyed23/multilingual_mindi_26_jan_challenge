import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Clock, Wifi, WifiOff } from 'lucide-react';
import { offlineSyncService } from '../services/offlineSync';

interface SyncStatusIndicatorProps {
  className?: string;
  compact?: boolean;
}

interface SyncState {
  status: 'synced' | 'syncing' | 'pending' | 'offline' | 'error';
  lastSyncTime: Date | null;
  pendingCount: number;
  errorMessage?: string;
}

const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  className = '',
  compact = false
}) => {
  const [syncState, setSyncState] = useState<SyncState>({
    status: 'synced',
    lastSyncTime: null,
    pendingCount: 0
  });

  const updateSyncState = async () => {
    try {
      const status = await offlineSyncService.getSyncStatus();
      
      let newStatus: SyncState['status'] = 'synced';
      
      if (!status.isOnline) {
        newStatus = 'offline';
      } else if (status.syncInProgress) {
        newStatus = 'syncing';
      } else if (status.pendingActions > 0) {
        newStatus = 'pending';
      }

      setSyncState({
        status: newStatus,
        lastSyncTime: status.lastSyncTime,
        pendingCount: status.pendingActions
      });
    } catch (error) {
      setSyncState(prev => ({
        ...prev,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Sync error'
      }));
    }
  };

  useEffect(() => {
    updateSyncState();

    // Listen for network changes
    const handleOnline = () => updateSyncState();
    const handleOffline = () => updateSyncState();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Update periodically
    const interval = setInterval(updateSyncState, 15000); // Every 15 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const getStatusConfig = () => {
    switch (syncState.status) {
      case 'synced':
        return {
          icon: <CheckCircle size={16} />,
          text: 'Synced',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'syncing':
        return {
          icon: <RefreshCw size={16} className="animate-spin" />,
          text: 'Syncing...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'pending':
        return {
          icon: <AlertCircle size={16} />,
          text: `${syncState.pendingCount} pending`,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      case 'offline':
        return {
          icon: <WifiOff size={16} />,
          text: 'Offline',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'error':
        return {
          icon: <AlertCircle size={16} />,
          text: 'Sync error',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: <Wifi size={16} />,
          text: 'Unknown',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const formatLastSync = (lastSync: Date | null) => {
    if (!lastSync) return 'Never synced';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just synced';
    if (diffMins < 60) return `Synced ${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Synced ${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Synced ${diffDays}d ago`;
  };

  const config = getStatusConfig();

  if (compact) {
    return (
      <div className={`inline-flex items-center space-x-2 px-2 py-1 rounded-md border ${config.bgColor} ${config.borderColor} ${className}`}>
        <div className={config.color}>
          {config.icon}
        </div>
        <span className={`text-xs font-medium ${config.color}`}>
          {config.text}
        </span>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className={`px-4 py-3 border-b ${config.bgColor} ${config.borderColor}`}>
        <div className="flex items-center space-x-2">
          <div className={config.color}>
            {config.icon}
          </div>
          <span className={`font-medium ${config.color}`}>
            {config.text}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock size={14} />
          <span>{formatLastSync(syncState.lastSyncTime)}</span>
        </div>
        
        {syncState.status === 'offline' && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Working offline. Changes will sync when connection is restored.
            </p>
          </div>
        )}
        
        {syncState.status === 'error' && syncState.errorMessage && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              {syncState.errorMessage}
            </p>
          </div>
        )}
        
        {syncState.status === 'pending' && (
          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              {syncState.pendingCount} action{syncState.pendingCount > 1 ? 's' : ''} waiting to sync
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncStatusIndicator;