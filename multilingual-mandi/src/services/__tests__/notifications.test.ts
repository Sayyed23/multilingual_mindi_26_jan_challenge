// Unit tests for notification service
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NotificationServiceImpl } from '../notifications';
import type { NotificationPreferences, PriceAlert, DealUpdate } from '../../types';

// Mock Firebase
vi.mock('../../lib/firebase', () => ({
  getMessagingInstance: vi.fn().mockResolvedValue({
    getToken: vi.fn().mockResolvedValue('mock-fcm-token'),
    onMessage: vi.fn().mockReturnValue(() => { }),
    deleteToken: vi.fn().mockResolvedValue(undefined)
  }),
  db: {},
  auth: {
    currentUser: { uid: 'test-user-id' }
  }
}));

// Mock Firestore functions
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn().mockResolvedValue({ id: 'mock-notification-id' }),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn().mockResolvedValue({
    empty: false,
    size: 5,
    docs: [
      {
        id: 'notification-1',
        data: () => ({
          userId: 'test-user-id',
          type: 'price_alert',
          title: 'Price Alert',
          message: 'Test message',
          read: false,
          createdAt: { toDate: () => new Date() }
        })
      }
    ],
    forEach: vi.fn()
  }),
  onSnapshot: vi.fn().mockReturnValue(() => { }),
  serverTimestamp: vi.fn().mockReturnValue('mock-timestamp'),
  Timestamp: {
    now: vi.fn().mockReturnValue('mock-timestamp')
  }
}));

// Mock Firebase messaging functions
vi.mock('firebase/messaging', () => ({
  getToken: vi.fn().mockResolvedValue('mock-fcm-token'),
  onMessage: vi.fn().mockReturnValue(() => { }),
  deleteToken: vi.fn().mockResolvedValue(undefined)
}));

// Mock offline sync service
vi.mock('../offlineSync', () => ({
  offlineSyncService: {
    cacheData: vi.fn().mockResolvedValue(undefined),
    getCachedData: vi.fn().mockResolvedValue(null),
    queueAction: vi.fn().mockResolvedValue(undefined),
    isOnline: vi.fn().mockReturnValue(true)
  }
}));

// Mock Notification API
const MockNotification = class {
  constructor(_title: string, _options?: NotificationOptions) {
    // Mock notification constructor
  }
  static requestPermission = vi.fn().mockResolvedValue('granted');
  static permission = 'granted';
};

// Only stub if not already defined
if (!globalThis.Notification) {
  vi.stubGlobal('Notification', MockNotification);
}

describe('NotificationService', () => {
  let notificationService: NotificationServiceImpl;

  beforeEach(() => {
    notificationService = new NotificationServiceImpl();
    vi.clearAllMocks();
  });

  afterEach(() => {
    notificationService.cleanup();
  });

  describe('sendPriceAlert', () => {
    it('should send price alert notification', async () => {
      const userId = 'test-user-id';
      const priceAlert: PriceAlert = {
        id: 'alert-1',
        userId,
        commodity: 'wheat',
        condition: 'above',
        threshold: 2000,
        active: true,
        createdAt: new Date()
      };

      await expect(notificationService.sendPriceAlert(userId, priceAlert)).resolves.not.toThrow();
    });

    it('should handle errors gracefully', async () => {
      const userId = 'test-user-id';
      const priceAlert: PriceAlert = {
        id: 'alert-1',
        userId,
        commodity: 'wheat',
        condition: 'above',
        threshold: 2000,
        active: true,
        createdAt: new Date()
      };

      // Mock addDoc to throw error
      const { addDoc } = await import('firebase/firestore');
      vi.mocked(addDoc).mockRejectedValueOnce(new Error('Firestore error'));

      await expect(notificationService.sendPriceAlert(userId, priceAlert)).rejects.toThrow();
    });
  });

  describe('sendDealUpdate', () => {
    it('should send deal update notification', async () => {
      const userId = 'test-user-id';
      const dealUpdate: DealUpdate = {
        dealId: 'deal-1',
        status: 'completed',
        message: 'Deal completed successfully'
      };

      await expect(notificationService.sendDealUpdate(userId, dealUpdate)).resolves.not.toThrow();
    });
  });

  describe('getNotificationHistory', () => {
    it('should return notification history', async () => {
      const userId = 'test-user-id';
      const notifications = await notificationService.getNotificationHistory(userId);

      expect(Array.isArray(notifications)).toBe(true);
    });

    it('should return cached notifications when offline', async () => {
      const { offlineSyncService } = await import('../offlineSync');
      vi.mocked(offlineSyncService.isOnline).mockReturnValue(false);
      vi.mocked(offlineSyncService.getCachedData).mockResolvedValue({
        id: 'cached-notification',
        userId: 'test-user-id',
        type: 'price_alert',
        title: 'Cached Alert',
        message: 'Cached message',
        read: false,
        createdAt: new Date()
      });

      const userId = 'test-user-id';
      const notifications = await notificationService.getNotificationHistory(userId);

      expect(Array.isArray(notifications)).toBe(true);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notificationId = 'notification-1';

      await expect(notificationService.markAsRead(notificationId)).resolves.not.toThrow();
    });

    it('should queue action when offline', async () => {
      const { offlineSyncService } = await import('../offlineSync');
      vi.mocked(offlineSyncService.isOnline).mockReturnValue(false);

      const notificationId = 'notification-1';
      await notificationService.markAsRead(notificationId);

      expect(offlineSyncService.queueAction).toHaveBeenCalled();
    });
  });

  describe('subscribeToNotifications', () => {
    it('should subscribe to notifications with preferences', async () => {
      const userId = 'test-user-id';
      const preferences: NotificationPreferences = {
        priceAlerts: true,
        dealUpdates: true,
        newOpportunities: false,
        systemUpdates: true,
        marketingMessages: false,
        channels: {
          push: true,
          email: false,
          sms: false
        }
      };

      await expect(notificationService.subscribeToNotifications(userId, preferences)).resolves.not.toThrow();
    });
  });

  describe('unsubscribeFromNotifications', () => {
    it('should unsubscribe from notifications', async () => {
      const userId = 'test-user-id';

      await expect(notificationService.unsubscribeFromNotifications(userId)).resolves.not.toThrow();
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread notification count', async () => {
      const userId = 'test-user-id';
      const count = await notificationService.getUnreadCount(userId);

      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });

    it('should return 0 on error', async () => {
      const { getDocs } = await import('firebase/firestore');
      vi.mocked(getDocs).mockRejectedValueOnce(new Error('Firestore error'));

      const userId = 'test-user-id';
      const count = await notificationService.getUnreadCount(userId);

      expect(count).toBe(0);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const userId = 'test-user-id';

      await expect(notificationService.markAllAsRead(userId)).resolves.not.toThrow();
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification', async () => {
      const notificationId = 'notification-1';

      await expect(notificationService.deleteNotification(notificationId)).resolves.not.toThrow();
    });
  });

  describe('updateNotificationPreferences', () => {
    it('should update notification preferences', async () => {
      const userId = 'test-user-id';
      const preferences: NotificationPreferences = {
        priceAlerts: false,
        dealUpdates: true,
        newOpportunities: true,
        systemUpdates: false,
        marketingMessages: false,
        channels: {
          push: true,
          email: true,
          sms: false
        }
      };

      await expect(notificationService.updateNotificationPreferences(userId, preferences)).resolves.not.toThrow();
    });

    it('should disable all notifications when all preferences are false', async () => {
      const userId = 'test-user-id';
      const preferences: NotificationPreferences = {
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

      await expect(notificationService.updateNotificationPreferences(userId, preferences)).resolves.not.toThrow();
    });
  });

  describe('optOutFromNotificationType', () => {
    it('should opt out from specific notification type', async () => {
      const userId = 'test-user-id';

      // Mock getNotificationPreferences to return current preferences
      vi.spyOn(notificationService, 'getNotificationPreferences').mockResolvedValue({
        priceAlerts: true,
        dealUpdates: true,
        newOpportunities: true,
        systemUpdates: true,
        marketingMessages: true,
        channels: {
          push: true,
          email: false,
          sms: false
        }
      });

      await expect(notificationService.optOutFromNotificationType(userId, 'price_alert')).resolves.not.toThrow();
    });

    it('should throw error for unknown notification type', async () => {
      const userId = 'test-user-id';

      vi.spyOn(notificationService, 'getNotificationPreferences').mockResolvedValue({
        priceAlerts: true,
        dealUpdates: true,
        newOpportunities: true,
        systemUpdates: true,
        marketingMessages: true,
        channels: {
          push: true,
          email: false,
          sms: false
        }
      });

      await expect(notificationService.optOutFromNotificationType(userId, 'unknown_type')).rejects.toThrow();
    });
  });

  describe('optOutFromAllNotifications', () => {
    it('should opt out from all notifications', async () => {
      const userId = 'test-user-id';

      await expect(notificationService.optOutFromAllNotifications(userId)).resolves.not.toThrow();
    });
  });

  describe('getNotificationStats', () => {
    it('should return notification statistics', async () => {
      const userId = 'test-user-id';
      const stats = await notificationService.getNotificationStats(userId);

      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('unread');
      expect(stats).toHaveProperty('byType');
      expect(typeof stats.total).toBe('number');
      expect(typeof stats.unread).toBe('number');
      expect(typeof stats.byType).toBe('object');
    });
  });

  describe('exportUserNotificationData', () => {
    it('should export user notification data', async () => {
      const userId = 'test-user-id';

      // Mock the methods that exportUserNotificationData calls
      vi.spyOn(notificationService, 'getNotificationHistory').mockResolvedValue([]);
      vi.spyOn(notificationService, 'getNotificationPreferences').mockResolvedValue({
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
      });
      vi.spyOn(notificationService, 'getNotificationStats').mockResolvedValue({
        total: 0,
        unread: 0,
        byType: {}
      });

      const exportData = await notificationService.exportUserNotificationData(userId);

      expect(exportData).toHaveProperty('notifications');
      expect(exportData).toHaveProperty('preferences');
      expect(exportData).toHaveProperty('stats');
      expect(Array.isArray(exportData.notifications)).toBe(true);
    });
  });

  describe('deleteAllUserNotificationData', () => {
    it('should delete all user notification data', async () => {
      const userId = 'test-user-id';

      await expect(notificationService.deleteAllUserNotificationData(userId)).resolves.not.toThrow();
    });
  });

  describe('hasOptedOut', () => {
    it('should check if user has opted out from notification type', async () => {
      const userId = 'test-user-id';

      vi.spyOn(notificationService, 'getNotificationPreferences').mockResolvedValue({
        priceAlerts: false,
        dealUpdates: true,
        newOpportunities: true,
        systemUpdates: true,
        marketingMessages: false,
        channels: {
          push: true,
          email: false,
          sms: false
        }
      });

      const hasOptedOut = await notificationService.hasOptedOut(userId, 'price_alert');
      expect(hasOptedOut).toBe(true);

      const hasNotOptedOut = await notificationService.hasOptedOut(userId, 'deal_update');
      expect(hasNotOptedOut).toBe(false);
    });

    it('should return false for unknown notification type', async () => {
      const userId = 'test-user-id';

      vi.spyOn(notificationService, 'getNotificationPreferences').mockResolvedValue({
        priceAlerts: true,
        dealUpdates: true,
        newOpportunities: true,
        systemUpdates: true,
        marketingMessages: true,
        channels: {
          push: true,
          email: false,
          sms: false
        }
      });

      const hasOptedOut = await notificationService.hasOptedOut(userId, 'unknown_type');
      expect(hasOptedOut).toBe(false);
    });
  });

  describe('cleanupExpiredNotifications', () => {
    it('should cleanup expired notifications', async () => {
      await expect(notificationService.cleanupExpiredNotifications()).resolves.not.toThrow();
    });
  });
});