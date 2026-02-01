// Notification Service with Firebase Cloud Messaging
// Handles price alerts, deal updates, and opportunity notifications

import {
  getMessagingInstance,
  db,
  auth
} from '../lib/firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import {
  getToken,
  onMessage,
  deleteToken,
  type MessagePayload,
  type Unsubscribe as FCMUnsubscribe
} from 'firebase/messaging';
import { offlineSyncService } from './offlineSync';
import type {
  NotificationService,
  Notification,
  NotificationPreferences,
  PriceAlert,
  DealUpdate,
  Unsubscribe
} from '../types';

class NotificationServiceImpl implements NotificationService {
  private fcmToken: string | null = null;
  private messageUnsubscribe: FCMUnsubscribe | null = null;
  private notificationListeners: Map<string, Unsubscribe> = new Map();

  constructor() {
    this.initializeFCM();
  }

  /**
   * Initialize Firebase Cloud Messaging
   */
  private async initializeFCM(): Promise<void> {
    try {
      const messaging = await getMessagingInstance();
      if (!messaging) {
        console.warn('Firebase Cloud Messaging not supported in this environment');
        return;
      }

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return;
      }

      // Get FCM token
      this.fcmToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });

      if (this.fcmToken) {
        console.log('FCM token obtained:', this.fcmToken);
        await this.saveFCMToken(this.fcmToken);
      }

      // Listen for foreground messages
      this.messageUnsubscribe = onMessage(messaging, (payload) => {
        this.handleForegroundMessage(payload);
      });

    } catch (error) {
      console.error('Failed to initialize FCM:', error);
    }
  }

  /**
   * Save FCM token to user profile
   */
  private async saveFCMToken(token: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        fcmToken: token,
        fcmTokenUpdatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to save FCM token:', error);
    }
  }

  /**
   * Handle foreground messages
   */
  private handleForegroundMessage(payload: MessagePayload): void {
    console.log('Received foreground message:', payload);

    // Show browser notification for foreground messages
    if (payload.notification) {
      const { title, body, icon } = payload.notification;
      new Notification(title || 'Mandi Platform', {
        body: body || '',
        icon: icon || '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: payload.data?.type || 'general',
        requireInteraction: payload.data?.actionRequired === 'true'
      });
    }

    // Store notification in local database
    if (payload.data) {
      this.storeNotificationLocally(payload.data);
    }
  }

  /**
   * Store notification in local cache for offline access
   */
  private async storeNotificationLocally(data: any): Promise<void> {
    try {
      const notification: Notification = {
        id: data.id || `local_${Date.now()}`,
        userId: auth.currentUser?.uid || '',
        type: data.type || 'system_update',
        title: data.title || '',
        message: data.message || '',
        data: data.additionalData ? JSON.parse(data.additionalData) : undefined,
        read: false,
        createdAt: new Date(),
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined
      };

      await offlineSyncService.cacheData(
        `notification_${notification.id}`,
        notification,
        24 * 60 * 60 * 1000 // 24 hours TTL
      );
    } catch (error) {
      console.error('Failed to store notification locally:', error);
    }
  }

  /**
   * Send price alert notification
   */
  async sendPriceAlert(userId: string, priceAlert: PriceAlert): Promise<void> {
    try {
      const notification: Omit<Notification, 'id' | 'createdAt'> = {
        userId,
        type: 'price_alert',
        title: `Price Alert: ${priceAlert.commodity}`,
        message: `Price ${priceAlert.condition} ₹${priceAlert.threshold} per unit`,
        data: {
          alertId: priceAlert.id,
          commodity: priceAlert.commodity,
          threshold: priceAlert.threshold,
          condition: priceAlert.condition,
          location: priceAlert.location
        },
        read: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      };

      await this.createNotification(notification);
    } catch (error) {
      console.error('Failed to send price alert:', error);
      throw error;
    }
  }

  /**
   * Send deal update notification
   */
  async sendDealUpdate(userId: string, dealUpdate: DealUpdate): Promise<void> {
    try {
      const notification: Omit<Notification, 'id' | 'createdAt'> = {
        userId,
        type: 'deal_update',
        title: 'Deal Update',
        message: dealUpdate.message,
        data: {
          dealId: dealUpdate.dealId,
          status: dealUpdate.status,
          actionRequired: dealUpdate.actionRequired,
          actionUrl: dealUpdate.actionUrl
        },
        read: false,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      };

      await this.createNotification(notification);
    } catch (error) {
      console.error('Failed to send deal update:', error);
      throw error;
    }
  }

  /**
   * Create a new notification
   */
  private async createNotification(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<void> {
    try {
      // Store in Firestore
      const notificationRef = await addDoc(collection(db, 'notifications'), {
        ...notification,
        createdAt: serverTimestamp()
      });

      // Store locally for offline access
      const localNotification: Notification = {
        ...notification,
        id: notificationRef.id,
        createdAt: new Date()
      };

      await offlineSyncService.cacheData(
        `notification_${notificationRef.id}`,
        localNotification,
        30 * 24 * 60 * 60 * 1000 // 30 days TTL
      );

      // If offline, queue for later delivery
      if (!offlineSyncService.isOnline()) {
        await offlineSyncService.queueAction({
          id: `notification_${Date.now()}`,
          type: 'create_deal', // Using existing action type
          payload: { type: 'notification', data: notification },
          timestamp: new Date(),
          retryCount: 0
        });
      }
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  /**
   * Subscribe to notifications with user preferences
   */
  async subscribeToNotifications(userId: string, preferences: NotificationPreferences): Promise<void> {
    try {
      // Update user preferences in Firestore
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'preferences.notifications': preferences,
        notificationPreferencesUpdatedAt: serverTimestamp()
      });

      // Subscribe to real-time notifications
      const unsubscribe = this.subscribeToUserNotifications(userId);
      this.notificationListeners.set(userId, unsubscribe);

      console.log('Subscribed to notifications for user:', userId);
    } catch (error) {
      console.error('Failed to subscribe to notifications:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time notifications for a user
   */
  private subscribeToUserNotifications(userId: string): Unsubscribe {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const notification = {
            id: change.doc.id,
            ...change.doc.data(),
            createdAt: change.doc.data().createdAt?.toDate() || new Date()
          } as Notification;

          // Store locally
          this.storeNotificationLocally(notification);
        }
      });
    });
  }

  /**
   * Get notification history for a user
   */
  async getNotificationHistory(userId: string): Promise<Notification[]> {
    try {
      // Try to get from cache first (offline support)
      const cachedNotifications = await this.getCachedNotifications(userId);
      if (cachedNotifications.length > 0 && !offlineSyncService.isOnline()) {
        return cachedNotifications;
      }

      // Get from Firestore if online
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(q);
      const notifications: Notification[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        notifications.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          expiresAt: data.expiresAt?.toDate()
        } as Notification);
      });

      // Cache notifications for offline access
      for (const notification of notifications) {
        await offlineSyncService.cacheData(
          `notification_${notification.id}`,
          notification,
          30 * 24 * 60 * 60 * 1000 // 30 days TTL
        );
      }

      return notifications;
    } catch (error) {
      console.error('Failed to get notification history:', error);
      // Return cached notifications as fallback
      return this.getCachedNotifications(userId);
    }
  }

  /**
   * Get cached notifications for offline access
   */
  private async getCachedNotifications(userId: string): Promise<Notification[]> {
    try {
      // This is a simplified implementation - in a real app, you'd have a more sophisticated cache query
      const notifications: Notification[] = [];

      // Get all cached notification keys (this would be more efficient with proper indexing)
      for (let i = 0; i < 100; i++) {
        const cached = await offlineSyncService.getCachedData<Notification>(`notification_${i}`);
        if (cached && cached.userId === userId) {
          notifications.push(cached);
        }
      }

      return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Failed to get cached notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      // Update in Firestore
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      });

      // Update in cache
      const cached = await offlineSyncService.getCachedData<Notification>(`notification_${notificationId}`);
      if (cached) {
        cached.read = true;
        await offlineSyncService.cacheData(`notification_${notificationId}`, cached);
      }

      // If offline, queue the action
      if (!offlineSyncService.isOnline()) {
        await offlineSyncService.queueAction({
          id: `mark_read_${notificationId}_${Date.now()}`,
          type: 'create_deal', // Using existing action type
          payload: { type: 'mark_notification_read', notificationId },
          timestamp: new Date(),
          retryCount: 0
        });
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  /**
   * Send opportunity notification (new deals matching user preferences)
   */
  async sendOpportunityNotification(userId: string, opportunity: any): Promise<void> {
    try {
      const notification: Omit<Notification, 'id' | 'createdAt'> = {
        userId,
        type: 'new_opportunity',
        title: 'New Opportunity',
        message: `New ${opportunity.commodity} deal available in your area`,
        data: {
          dealId: opportunity.id,
          commodity: opportunity.commodity,
          price: opportunity.price,
          location: opportunity.location
        },
        read: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      };

      await this.createNotification(notification);
    } catch (error) {
      console.error('Failed to send opportunity notification:', error);
      throw error;
    }
  }

  /**
   * Send system update notification
   */
  async sendSystemUpdate(userId: string, title: string, message: string, data?: any): Promise<void> {
    try {
      const notification: Omit<Notification, 'id' | 'createdAt'> = {
        userId,
        type: 'system_update',
        title,
        message,
        data,
        read: false,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      };

      await this.createNotification(notification);
    } catch (error) {
      console.error('Failed to send system update:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from notifications
   */
  async unsubscribeFromNotifications(userId: string): Promise<void> {
    try {
      // Remove FCM token
      if (this.fcmToken) {
        const messaging = await getMessagingInstance();
        if (messaging) {
          await deleteToken(messaging);
        }
      }

      // Remove real-time listener
      const unsubscribe = this.notificationListeners.get(userId);
      if (unsubscribe) {
        unsubscribe();
        this.notificationListeners.delete(userId);
      }

      // Update user preferences
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        fcmToken: null,
        'preferences.notifications': {
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
        }
      });

      console.log('Unsubscribed from notifications for user:', userId);
    } catch (error) {
      console.error('Failed to unsubscribe from notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      const batch: Promise<void>[] = [];

      snapshot.forEach((doc) => {
        batch.push(updateDoc(doc.ref, {
          read: true,
          readAt: serverTimestamp()
        }));
      });

      await Promise.all(batch);

      // Update cache for all marked notifications
      snapshot.forEach(async (doc) => {
        const cached = await offlineSyncService.getCachedData<Notification>(`notification_${doc.id}`);
        if (cached) {
          cached.read = true;
          await offlineSyncService.cacheData(`notification_${doc.id}`, cached);
        }
      });

      console.log(`Marked ${batch.length} notifications as read for user: ${userId}`);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      // Delete from Firestore
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        deleted: true,
        deletedAt: serverTimestamp()
      });

      // Remove from cache
      await offlineSyncService.cacheData(`notification_${notificationId}`, null);

      // If offline, queue the action
      if (!offlineSyncService.isOnline()) {
        await offlineSyncService.queueAction({
          id: `delete_notification_${notificationId}_${Date.now()}`,
          type: 'create_deal', // Using existing action type
          payload: { type: 'delete_notification', notificationId },
          timestamp: new Date(),
          retryCount: 0
        });
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAllNotifications(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId)
      );

      const snapshot = await getDocs(q);
      const batch: Promise<void>[] = [];

      snapshot.forEach((doc) => {
        batch.push(updateDoc(doc.ref, {
          deleted: true,
          deletedAt: serverTimestamp()
        }));
      });

      await Promise.all(batch);

      // Clear from cache
      snapshot.forEach(async (doc) => {
        await offlineSyncService.cacheData(`notification_${doc.id}`, null);
      });

      console.log(`Deleted ${batch.length} notifications for user: ${userId}`);
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
      throw error;
    }
  }

  /**
   * Update notification preferences with privacy controls
   */
  async updateNotificationPreferences(userId: string, preferences: NotificationPreferences): Promise<void> {
    try {
      // Validate preferences
      const validatedPreferences = this.validateNotificationPreferences(preferences);

      // Update user preferences in Firestore
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'preferences.notifications': validatedPreferences,
        notificationPreferencesUpdatedAt: serverTimestamp()
      });

      // If user disabled all notifications, remove FCM token
      if (this.areAllNotificationsDisabled(validatedPreferences)) {
        await this.disableAllNotifications(userId);
      } else {
        // Re-subscribe if notifications were re-enabled
        await this.subscribeToNotifications(userId, validatedPreferences);
      }

      console.log('Notification preferences updated for user:', userId);
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      throw error;
    }
  }

  /**
   * Validate notification preferences
   */
  private validateNotificationPreferences(preferences: NotificationPreferences): NotificationPreferences {
    return {
      priceAlerts: Boolean(preferences.priceAlerts),
      dealUpdates: Boolean(preferences.dealUpdates),
      newOpportunities: Boolean(preferences.newOpportunities),
      systemUpdates: Boolean(preferences.systemUpdates),
      marketingMessages: Boolean(preferences.marketingMessages),
      channels: {
        push: Boolean(preferences.channels?.push),
        email: Boolean(preferences.channels?.email),
        sms: Boolean(preferences.channels?.sms)
      }
    };
  }

  /**
   * Check if all notifications are disabled
   */
  private areAllNotificationsDisabled(preferences: NotificationPreferences): boolean {
    return !preferences.priceAlerts &&
      !preferences.dealUpdates &&
      !preferences.newOpportunities &&
      !preferences.systemUpdates &&
      !preferences.marketingMessages &&
      !preferences.channels.push &&
      !preferences.channels.email &&
      !preferences.channels.sms;
  }

  /**
   * Disable all notifications for a user
   */
  async disableAllNotifications(userId: string): Promise<void> {
    try {
      // Remove FCM token
      if (this.fcmToken) {
        const messaging = await getMessagingInstance();
        if (messaging) {
          await deleteToken(messaging);
        }
      }

      // Remove real-time listener
      const unsubscribe = this.notificationListeners.get(userId);
      if (unsubscribe) {
        unsubscribe();
        this.notificationListeners.delete(userId);
      }

      // Update user document
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        fcmToken: null,
        notificationsDisabled: true,
        notificationsDisabledAt: serverTimestamp()
      });

      console.log('All notifications disabled for user:', userId);
    } catch (error) {
      console.error('Failed to disable all notifications:', error);
      throw error;
    }
  }

  /**
   * Get notification preferences for a user
   */
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {

      const userDoc = await getDocs(query(collection(db, 'users'), where('__name__', '==', userId)));

      if (userDoc.empty) {
        return null;
      }

      const userData = userDoc.docs[0].data();
      return userData.preferences?.notifications || null;
    } catch (error) {
      console.error('Failed to get notification preferences:', error);
      return null;
    }
  }

  /**
   * Get notification statistics for a user
   */
  async getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    lastReceived?: Date;
  }> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('deleted', '!=', true)
      );

      const snapshot = await getDocs(q);
      const stats = {
        total: 0,
        unread: 0,
        byType: {} as Record<string, number>,
        lastReceived: undefined as Date | undefined
      };

      let latestTimestamp = 0;

      snapshot.forEach((doc) => {
        const notification = doc.data() as Notification;
        stats.total++;

        if (!notification.read) {
          stats.unread++;
        }

        // Count by type
        const type = notification.type || 'unknown';
        stats.byType[type] = (stats.byType[type] || 0) + 1;

        // Track latest timestamp
        const timestamp = notification.createdAt instanceof Date
          ? notification.createdAt.getTime()
          : new Date(notification.createdAt).getTime();

        if (timestamp > latestTimestamp) {
          latestTimestamp = timestamp;
          stats.lastReceived = new Date(timestamp);
        }
      });

      return stats;
    } catch (error) {
      console.error('Failed to get notification stats:', error);
      return {
        total: 0,
        unread: 0,
        byType: {},
      };
    }
  }

  /**
   * Export user notification data (for privacy compliance)
   */
  async exportUserNotificationData(userId: string): Promise<{
    notifications: Notification[];
    preferences: NotificationPreferences | null;
    stats: any;
  }> {
    try {
      const [notifications, preferences, stats] = await Promise.all([
        this.getNotificationHistory(userId),
        this.getNotificationPreferences(userId),
        this.getNotificationStats(userId)
      ]);

      return {
        notifications,
        preferences,
        stats
      };
    } catch (error) {
      console.error('Failed to export user notification data:', error);
      throw error;
    }
  }

  /**
   * Delete all user notification data (for privacy compliance)
   */
  async deleteAllUserNotificationData(userId: string): Promise<void> {
    try {
      // Delete all notifications
      await this.deleteAllNotifications(userId);

      // Remove FCM token and preferences
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        fcmToken: null,
        'preferences.notifications': null,
        notificationDataDeleted: true,
        notificationDataDeletedAt: serverTimestamp()
      });

      // Remove from cache
      const notifications = await this.getCachedNotifications(userId);
      for (const notification of notifications) {
        await offlineSyncService.cacheData(`notification_${notification.id}`, null);
      }

      // Remove listeners
      const unsubscribe = this.notificationListeners.get(userId);
      if (unsubscribe) {
        unsubscribe();
        this.notificationListeners.delete(userId);
      }

      console.log('All notification data deleted for user:', userId);
    } catch (error) {
      console.error('Failed to delete all user notification data:', error);
      throw error;
    }
  }

  /**
   * Opt out from specific notification type
   */
  async optOutFromNotificationType(userId: string, notificationType: string): Promise<void> {
    try {
      const currentPreferences = await this.getNotificationPreferences(userId);
      if (!currentPreferences) {
        throw new Error('User preferences not found');
      }

      // Update the specific notification type
      const updatedPreferences = { ...currentPreferences };
      switch (notificationType) {
        case 'price_alert':
          updatedPreferences.priceAlerts = false;
          break;
        case 'deal_update':
          updatedPreferences.dealUpdates = false;
          break;
        case 'new_opportunity':
          updatedPreferences.newOpportunities = false;
          break;
        case 'system_update':
          updatedPreferences.systemUpdates = false;
          break;
        case 'marketing':
          updatedPreferences.marketingMessages = false;
          break;
        default:
          throw new Error(`Unknown notification type: ${notificationType}`);
      }

      await this.updateNotificationPreferences(userId, updatedPreferences);
      console.log(`User ${userId} opted out from ${notificationType} notifications`);
    } catch (error) {
      console.error('Failed to opt out from notification type:', error);
      throw error;
    }
  }

  /**
   * Opt out from all notifications (privacy-respecting)
   */
  async optOutFromAllNotifications(userId: string): Promise<void> {
    try {
      const disabledPreferences: NotificationPreferences = {
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
      };

      await this.updateNotificationPreferences(userId, disabledPreferences);
      await this.disableAllNotifications(userId);

      console.log(`User ${userId} opted out from all notifications`);
    } catch (error) {
      console.error('Failed to opt out from all notifications:', error);
      throw error;
    }
  }

  /**
   * Check if user has opted out from a specific notification type
   */
  async hasOptedOut(userId: string, notificationType: string): Promise<boolean> {
    try {
      const preferences = await this.getNotificationPreferences(userId);
      if (!preferences) return false;

      switch (notificationType) {
        case 'price_alert':
          return !preferences.priceAlerts;
        case 'deal_update':
          return !preferences.dealUpdates;
        case 'new_opportunity':
          return !preferences.newOpportunities;
        case 'system_update':
          return !preferences.systemUpdates;
        case 'marketing':
          return !preferences.marketingMessages;
        default:
          return false;
      }
    } catch (error) {
      console.error('Failed to check opt-out status:', error);
      return false;
    }
  }

  /**
   * Clean up expired notifications
   */
  async cleanupExpiredNotifications(): Promise<void> {
    try {
      const now = Timestamp.now();
      const q = query(
        collection(db, 'notifications'),
        where('expiresAt', '<', now)
      );

      const snapshot = await getDocs(q);
      const batch: Promise<void>[] = [];

      snapshot.forEach((doc) => {
        batch.push(deleteDoc(doc.ref));
      });

      await Promise.all(batch);
      console.log(`Cleaned up ${batch.length} expired notifications`);
    } catch (error) {
      console.error('Failed to cleanup expired notifications:', error);
    }
  }

  /**
   * Cleanup method to remove listeners
   */
  cleanup(): void {
    if (this.messageUnsubscribe) {
      this.messageUnsubscribe();
    }

    this.notificationListeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.notificationListeners.clear();
  }
}

// Export singleton instance
export const notificationService = new NotificationServiceImpl();

// Export for testing
export { NotificationServiceImpl };