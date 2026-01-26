/**
 * Real-Time Updates Component
 * Manages real-time price updates and notifications
 * Supports Requirements: 2.1 - Real-time price discovery
 */

import React, { useState, useEffect } from 'react';
import './RealTimeUpdates.css';

interface RealTimeUpdatesProps {
  isActive: boolean;
  onToggle: () => void;
  lastUpdated?: Date;
  updateCount?: number;
  loading?: boolean;
}

const RealTimeUpdates: React.FC<RealTimeUpdatesProps> = ({
  isActive,
  onToggle,
  lastUpdated,
  updateCount = 0,
  loading = false
}) => {
  const [timeAgo, setTimeAgo] = useState<string>('');
  const [showNotification, setShowNotification] = useState(false);

  // Update time ago display
  useEffect(() => {
    if (!lastUpdated) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diff = now.getTime() - lastUpdated.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      if (seconds < 60) {
        setTimeAgo(`${seconds}s ago`);
      } else if (minutes < 60) {
        setTimeAgo(`${minutes}m ago`);
      } else {
        setTimeAgo(`${hours}h ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  // Show notification when updates occur
  useEffect(() => {
    if (updateCount > 0 && isActive) {
      setShowNotification(true);
      const timer = setTimeout(() => setShowNotification(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [updateCount, isActive]);

  const getStatusIcon = () => {
    if (loading) return '🔄';
    if (isActive) return '🟢';
    return '⚪';
  };

  const getStatusText = () => {
    if (loading) return 'Updating...';
    if (isActive) return 'Live Updates Active';
    return 'Live Updates Paused';
  };

  return (
    <div className="real-time-updates">
      <div className="updates-control">
        <button
          className={`updates-toggle ${isActive ? 'active' : ''}`}
          onClick={onToggle}
          disabled={loading}
          title={isActive ? 'Pause real-time updates' : 'Enable real-time updates'}
        >
          <span className="status-icon">{getStatusIcon()}</span>
          <span className="status-text">{getStatusText()}</span>
        </button>

        {lastUpdated && (
          <div className="last-updated">
            <span className="update-time">Last updated: {timeAgo}</span>
            {updateCount > 0 && (
              <span className="update-count">{updateCount} updates</span>
            )}
          </div>
        )}
      </div>

      {showNotification && (
        <div className="update-notification">
          <div className="notification-content">
            <span className="notification-icon">📊</span>
            <span className="notification-text">Price data updated!</span>
          </div>
        </div>
      )}

      {isActive && (
        <div className="live-indicator">
          <div className="pulse-dot"></div>
          <span>LIVE</span>
        </div>
      )}
    </div>
  );
};

export default RealTimeUpdates;