// Notification Bell Component
// Shows notification count and opens notification manager

import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationManager from './NotificationManager';

interface NotificationBellProps {
  userId: string | null;
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  userId,
  className = ''
}) => {
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const { unreadCount, loading } = useNotifications(userId);

  if (!userId) return null;

  return (
    <>
      <button
        onClick={() => setIsManagerOpen(true)}
        className={`relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors ${className}`}
        title="Notifications"
      >
        <Bell className="w-6 h-6" />
        
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Loading indicator */}
        {loading && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
        )}
      </button>

      <NotificationManager
        userId={userId}
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
      />
    </>
  );
};

export default NotificationBell;