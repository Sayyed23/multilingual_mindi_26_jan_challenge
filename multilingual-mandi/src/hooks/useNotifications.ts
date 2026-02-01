// Custom hook for notification management
// Provides state management and actions for notifications

import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notifications';
import type { 
  Notification, 
  NotificationPreferences 
} from '../types';

interface UseNotificationsReturn {
  notifications: Notification[];
  preferences: NotificationPreferences | null;
  unreadCount: number;
  loading: boolean;
  error: string | null;
  
  // Actions
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  updatePreferences: (preferences: NotificationPreferences) => Promise<void>;
  optOutFromType: (type: string) => Promise<void>;
  optOutFromAll: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useNotifications = (userId: string | null): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const [notificationHistory, userPreferences, count] = await Promise.all([
        notificationService.getNotificationHistory(userId),
        notificationService.getNotificationPreferences(userId),
        notificationService.getUnreadCount(userId)
      ]);

      setNotifications(notificationHistory);
      setPreferences(userPreferences);
      setUnreadCount(count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      await notificationService.markAllAsRead(userId);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read');
      throw err;
    }
  }, [userId]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
      throw err;
    }
  }, [notifications]);

  const updatePreferences = useCallback(async (newPreferences: NotificationPreferences) => {
    if (!userId) return;

    try {
      await notificationService.updateNotificationPreferences(userId, newPreferences);
      setPreferences(newPreferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      throw err;
    }
  }, [userId]);

  const optOutFromType = useCallback(async (type: string) => {
    if (!userId) return;

    try {
      await notificationService.optOutFromNotificationType(userId, type);
      // Reload preferences to get updated state
      const updatedPreferences = await notificationService.getNotificationPreferences(userId);
      setPreferences(updatedPreferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to opt out from notification type');
      throw err;
    }
  }, [userId]);

  const optOutFromAll = useCallback(async () => {
    if (!userId) return;

    try {
      await notificationService.optOutFromAllNotifications(userId);
      // Clear all data since user opted out completely
      setNotifications([]);
      setPreferences({
        priceAlerts: false,
        dealUpdates: false,
        newOpportunities: false,
        systemUpdates: false,
        marketingMessages: false,
        channels: {
          push: false,
          email: false,
          sms: false
        }
      });
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to opt out from all notifications');
      throw err;
    }
  }, [userId]);

  const refresh = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  return {
    notifications,
    preferences,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    optOutFromType,
    optOutFromAll,
    refresh
  };
};

// Hook for notification subscription and real-time updates
export const useNotificationSubscription = (userId: string | null) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const subscribeToNotifications = async () => {
      try {
        // Get current preferences or use defaults
        const preferences = await notificationService.getNotificationPreferences(userId) || {
          priceAlerts: true,
          dealUpdates: true,
          newOpportunities: true,
          systemUpdates: true,
          marketingMessages: false,
          channels: {
            push: true,
            email: false,
            sms: false
          }
        };

        await notificationService.subscribeToNotifications(userId, preferences);
        setIsSubscribed(true);
        setSubscriptionError(null);
      } catch (error) {
        setSubscriptionError(error instanceof Error ? error.message : 'Failed to subscribe to notifications');
        setIsSubscribed(false);
      }
    };

    subscribeToNotifications();

    // Cleanup on unmount
    return () => {
      notificationService.cleanup();
    };
  }, [userId]);

  return {
    isSubscribed,
    subscriptionError
  };
};

// Hook for notification permission management
export const useNotificationPermission = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    if (permission === 'granted') {
      return 'granted';
    }

    try {
      setRequesting(true);
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      throw error;
    } finally {
      setRequesting(false);
    }
  }, [permission]);

  return {
    permission,
    requesting,
    requestPermission,
    isSupported: 'Notification' in window
  };
};