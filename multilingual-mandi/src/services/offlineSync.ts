// Offline Sync Service with IndexedDB Integration
import Dexie, { type Table } from 'dexie';
import type {
  OfflineAction,
  SyncResult,
  CacheEntry,
  OfflineSyncService,
  PriceData,
  Deal,
  Message,
  User,
  UserProfile,
  Location,
  Notification
} from '../types';

// IndexedDB Database Schema
class MandiDatabase extends Dexie {
  // Cache tables for offline data
  priceCache!: Table<CacheEntry<PriceData>>;
  dealCache!: Table<CacheEntry<Deal>>;
  messageCache!: Table<CacheEntry<Message>>;
  userCache!: Table<CacheEntry<User>>;
  notificationCache!: Table<CacheEntry<Notification>>;

  // Offline action queue
  actionQueue!: Table<OfflineAction>;

  // Sync metadata
  syncMetadata!: Table<{ id?: number; key: string; value: any; timestamp: Date }>;

  constructor() {
    super('MandiOfflineDB');

    this.version(1).stores({
      priceCache: '++id, key, timestamp, ttl',
      dealCache: '++id, key, timestamp, ttl',
      messageCache: '++id, key, timestamp, ttl',
      userCache: '++id, key, timestamp, ttl',
      notificationCache: '++id, key, timestamp, ttl',
      actionQueue: '++id, type, timestamp, retryCount',
      syncMetadata: '++id, key, timestamp'
    });
  }
}

// Initialize database
const db = new MandiDatabase();

// Offline Sync Service Implementation
class OfflineSyncServiceImpl implements OfflineSyncService {
  private isOnlineStatus: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private maxRetries: number = 3;


  constructor() {
    this.initializeNetworkListeners();
    this.startPeriodicSync();
    this.startCacheManagement();
  }

  private initializeNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnlineStatus = true;
      this.syncPendingActions();
    });

    window.addEventListener('offline', () => {
      this.isOnlineStatus = false;
    });
  }

  private startPeriodicSync(): void {
    // Sync every 30 seconds when online
    setInterval(() => {
      if (this.isOnlineStatus && !this.syncInProgress) {
        this.syncPendingActions();
      }
    }, 30000);
  }

  private startCacheManagement(): void {
    // Manage cache storage every 5 minutes
    setInterval(() => {
      this.manageCacheStorage();
    }, 5 * 60 * 1000);
  }

  async cacheData(key: string, data: any, ttl?: number): Promise<void> {
    try {
      // Determine which cache table to use based on data type
      const table = this.getCacheTable(data);

      // Find existing entry to update
      const existing = await table.where('key').equals(key).first();

      const cacheEntry: CacheEntry<any> = {
        id: existing?.id, // Preserve id if exists for update
        key,
        data,
        timestamp: new Date(),
        ttl,
        version: (existing?.version ?? 0) + 1
      };

      await table.put(cacheEntry);

      // Clean up expired entries
      await this.cleanupExpiredEntries(table);
    } catch (error) {
      console.error('Failed to cache data:', error);
      throw new Error(`Failed to cache data for key: ${key}`);
    }
  }
  async getCachedData<T>(key: string): Promise<T | null> {
    const entry = await this.getCachedEntry<T>(key);
    return entry ? entry.data : null;
  }

  async getCachedEntry<T>(key: string): Promise<CacheEntry<T> | null> {
    try {
      // Search across all cache tables
      const tables = [
        db.priceCache,
        db.dealCache,
        db.messageCache,
        db.userCache,
        db.notificationCache
      ];

      for (const table of tables) {
        const entry = await table.where('key').equals(key).first();
        if (entry) {
          // Check if entry has expired
          const timestamp = entry.timestamp instanceof Date
            ? entry.timestamp
            : new Date(entry.timestamp);
          if (entry.ttl && Date.now() - timestamp.getTime() > entry.ttl) {
            if (entry.id) {
              await table.delete(entry.id);
            }
            continue;
          } return entry as CacheEntry<T>;
        }
      }

      return null;
    } catch (error) {
      console.error('Failed to retrieve cached entry:', error);
      return null;
    }
  }

  async queueAction(action: OfflineAction): Promise<void> {
    try {
      await db.actionQueue.add(action);
    } catch (error) {
      console.error('Failed to queue offline action:', error);
      throw new Error('Failed to queue offline action');
    }
  }

  async syncPendingActions(): Promise<SyncResult[]> {
    if (this.syncInProgress || !this.isOnlineStatus) {
      return [];
    }

    this.syncInProgress = true;
    const results: SyncResult[] = [];

    try {
      const pendingActions = await db.actionQueue.orderBy('timestamp').toArray();

      for (const action of pendingActions) {
        try {
          const result = await this.executeAction(action);
          results.push(result);

          if (result.success) {
            await db.actionQueue.delete(action.id);
          } else {
            // Increment retry count
            action.retryCount++;
            if (action.retryCount >= this.maxRetries) {
              // Remove action after max retries
              await db.actionQueue.delete(action.id);
              console.error(`Action ${action.id} failed after ${this.maxRetries} retries`);
            } else {
              // Update retry count and add delay
              await db.actionQueue.put(action);
              // Retry will happen on next sync cycle
            }
          }
        } catch (error) {
          console.error(`Failed to execute action ${action.id}:`, error);
          results.push({
            actionId: action.id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            syncedAt: new Date()
          });
        }
      }

      // Update last sync time
      await this.updateLastSyncTime();

    } catch (error) {
      console.error('Sync process failed:', error);
    } finally {
      this.syncInProgress = false;
    }

    return results;
  }

  async getLastSyncTime(): Promise<Date | null> {
    try {
      const entry = await db.syncMetadata.where('key').equals('lastSyncTime').first();
      if (entry && entry.value) {
        return new Date(entry.value);
      }
      return null;
    } catch (error) {
      console.error('Failed to get last sync time:', error);
      return null;
    }
  }

  isOnline(): boolean {
    return this.isOnlineStatus;
  }

  // Private helper methods

  private getCacheTable(data: any): Table<CacheEntry<any>> {
    // Simple type detection based on data structure
    if (data.commodity && data.price) return db.priceCache;
    if (data.buyerId && data.sellerId) return db.dealCache;
    return db.messageCache; // Default fallback
  }

  private async executeAction(action: OfflineAction): Promise<SyncResult> {
    try {
      switch (action.type) {
        case 'create_deal':
          await this.executeDealCreation(action.payload);
          break;
        case 'send_message':
          await this.executeMessageSend(action.payload);
          break;
        case 'update_profile':
          await this.executeProfileUpdate(action.payload);
          break;
        case 'rate_user':
          await this.executeUserRating(action.payload);
          break;
        case 'create_negotiation':
          await this.executeNegotiationCreation(action.payload);
          break;
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

      return {
        actionId: action.id,
        success: true,
        syncedAt: new Date()
      };
    } catch (error) {
      return {
        actionId: action.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        syncedAt: new Date()
      };
    }
  }

  private async executeDealCreation(payload: any): Promise<void> {
    // Import deal management service dynamically to avoid circular dependencies
    // Payload is dealData, which contains metadata.createdBy
    const createdBy = payload.metadata?.createdBy;
    const role = (payload.buyerId === createdBy) ? 'buyer' : (payload.sellerId === createdBy ? 'vendor' : 'agent');

    // Fallback if metadata missing (shouldn't happen for new deals)
    const user = {
      uid: createdBy || payload.buyerId || 'offline_user',
      role: role as 'vendor' | 'buyer' | 'agent'
    };

    const { dealManagementService } = await import('./dealManagement');
    await dealManagementService.createDeal(payload as any, user);
  }

  private async executeMessageSend(payload: any): Promise<void> {
    // Import messaging service dynamically to avoid circular dependencies
    const { messagingService } = await import('./messaging');
    await messagingService.sendMessage(payload.conversationId, payload.message);
  }

  private async executeProfileUpdate(payload: any): Promise<void> {
    // Import profile management service dynamically to avoid circular dependencies
    const { profileManagementService } = await import('./profileManagement');
    await profileManagementService.updateUserProfile(payload.userId, payload.updates);
  }

  private async executeUserRating(payload: any): Promise<void> {
    // Import deal management service dynamically to avoid circular dependencies
    const { dealCompletionManager } = await import('./dealManagement');
    await dealCompletionManager.submitRating(payload.dealId, payload.rating);
  }

  private async executeNegotiationCreation(payload: any): Promise<void> {
    // Import negotiation service dynamically to avoid circular dependencies
    const { negotiationService } = await import('./negotiation');
    // Reconstruct user from participants
    // Typically startNegotiation sets only one participant (the creator)
    let user = { uid: '', role: 'buyer' as any };

    if (payload.participants?.buyer) {
      user = { uid: payload.participants.buyer, role: 'buyer' };
    } else if (payload.participants?.seller) {
      user = { uid: payload.participants.seller, role: 'vendor' };
    } else if (payload.participants?.agent) {
      user = { uid: payload.participants.agent, role: 'agent' };
    }

    // Default to a placeholder if empty (should check validations)
    if (!user.uid) user = { uid: 'offline_user', role: 'buyer' };

    await negotiationService.startNegotiation(payload.dealProposal, user);
  }

  private async updateLastSyncTime(): Promise<void> {
    const existing = await db.syncMetadata.where('key').equals('lastSyncTime').first();
    await db.syncMetadata.put({
      id: existing?.id,
      key: 'lastSyncTime',
      value: new Date(),
      timestamp: new Date()
    });
  }
  /*private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }*/

  private async cleanupExpiredEntries(table: Table<CacheEntry<any>>): Promise<void> {
    try {
      const now = Date.now();
      const expiredEntries = await table.filter(entry => {
        if (!entry.ttl) return false;
        return (now - entry.timestamp.getTime()) > entry.ttl;
      }).toArray();

      if (expiredEntries.length > 0) {
        const expiredIds = expiredEntries.map(entry => entry.id).filter(id => id !== undefined) as number[];
        await table.bulkDelete(expiredIds);
      }
    } catch (error) {
      console.error('Failed to cleanup expired entries:', error);
    }
  }

  // Public utility methods

  async clearCache(): Promise<void> {
    try {
      await db.priceCache.clear();
      await db.dealCache.clear();
      await db.messageCache.clear();
      await db.userCache.clear();
      await db.notificationCache.clear();
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw new Error('Failed to clear cache');
    }
  }

  async getCacheSize(): Promise<number> {
    try {
      const counts = await Promise.all([
        db.priceCache.count(),
        db.dealCache.count(),
        db.messageCache.count(),
        db.userCache.count(),
        db.notificationCache.count()
      ]);

      return counts.reduce((total, count) => total + count, 0);
    } catch (error) {
      console.error('Failed to get cache size:', error);
      return 0;
    }
  }

  async getPendingActionsCount(): Promise<number> {
    try {
      return await db.actionQueue.count();
    } catch (error) {
      console.error('Failed to get pending actions count:', error);
      return 0;
    }
  }

  // Specialized caching methods for different data types

  async cachePriceData(commodity: string, location: Location, prices: PriceData[]): Promise<void> {
    const key = `prices:${commodity}:${location.state}:${location.district}`;
    await this.cacheData(key, prices, 5 * 60 * 1000); // 5 minutes TTL
  }

  async getCachedPriceData(commodity: string, location: Location): Promise<PriceData[] | null> {
    const key = `prices:${commodity}:${location.state}:${location.district}`;
    return await this.getCachedData<PriceData[]>(key);
  }

  async cacheUserProfile(userId: string, profile: UserProfile): Promise<void> {
    const key = `profile:${userId}`;
    await this.cacheData(key, profile, 30 * 60 * 1000); // 30 minutes TTL
  }

  async getCachedUserProfile(userId: string): Promise<UserProfile | null> {
    const key = `profile:${userId}`;
    return await this.getCachedData<UserProfile>(key);
  }

  async cacheDeals(userId: string, deals: Deal[]): Promise<void> {
    const key = `deals:${userId}`;
    await this.cacheData(key, deals, 10 * 60 * 1000); // 10 minutes TTL
  }

  async getCachedDeals(userId: string): Promise<Deal[] | null> {
    const key = `deals:${userId}`;
    return await this.getCachedData<Deal[]>(key);
  }

  async cacheMessages(conversationId: string, messages: Message[]): Promise<void> {
    const key = `messages:${conversationId}`;
    await this.cacheData(key, messages, 60 * 60 * 1000); // 1 hour TTL
  }

  async getCachedMessages(conversationId: string): Promise<Message[] | null> {
    const key = `messages:${conversationId}`;
    return await this.getCachedData<Message[]>(key);
  }

  async cacheNotifications(userId: string, notifications: Notification[]): Promise<void> {
    const key = `notifications:${userId}`;
    await this.cacheData(key, notifications, 15 * 60 * 1000); // 15 minutes TTL
  }

  async getCachedNotifications(userId: string): Promise<Notification[] | null> {
    const key = `notifications:${userId}`;
    return await this.getCachedData<Notification[]>(key);
  }

  // Sync status and indicators

  async getSyncStatus(): Promise<{
    isOnline: boolean;
    lastSyncTime: Date | null;
    pendingActions: number;
    cacheSize: number;
    syncInProgress: boolean;
  }> {
    return {
      isOnline: this.isOnlineStatus,
      lastSyncTime: await this.getLastSyncTime(),
      pendingActions: await this.getPendingActionsCount(),
      cacheSize: await this.getCacheSize(),
      syncInProgress: this.syncInProgress
    };
  }

  async forceSyncNow(): Promise<SyncResult[]> {
    if (!this.isOnlineStatus) {
      throw new Error('Cannot sync while offline');
    }
    return await this.syncPendingActions();
  }

  // Storage management for cache limits

  async manageCacheStorage(): Promise<void> {
    try {
      const cacheSize = await this.getCacheSize();
      const maxCacheSize = 1000; // Maximum number of cached entries

      if (cacheSize > maxCacheSize) {
        console.log('Cache size exceeded, cleaning up old entries...');

        // Clean up expired entries first
        await this.cleanupExpiredEntries(db.priceCache);
        await this.cleanupExpiredEntries(db.dealCache);
        await this.cleanupExpiredEntries(db.messageCache);
        await this.cleanupExpiredEntries(db.userCache);
        await this.cleanupExpiredEntries(db.notificationCache);

        // If still over limit, remove oldest entries
        const newCacheSize = await this.getCacheSize();
        if (newCacheSize > maxCacheSize) {
          await this.removeOldestEntries(maxCacheSize * 0.8); // Remove to 80% of max
        }
      }
    } catch (error) {
      console.error('Failed to manage cache storage:', error);
    }
  }

  private async removeOldestEntries(targetSize: number): Promise<void> {
    const tables = [db.priceCache, db.dealCache, db.messageCache, db.userCache, db.notificationCache];

    for (const table of tables) {
      const entries = await table.orderBy('timestamp').toArray();
      const entriesToRemove = Math.max(0, entries.length - Math.floor(targetSize / tables.length));

      if (entriesToRemove > 0) {
        const oldestEntries = entries.slice(0, entriesToRemove);
        const idsToDelete = oldestEntries.map(entry => entry.id).filter(id => id !== undefined) as number[];
        await table.bulkDelete(idsToDelete);
      }
    }
  }
}

// Export singleton instance
export const offlineSyncService = new OfflineSyncServiceImpl();

// Export database instance for direct access if needed
export { db as offlineDatabase };

// Export types for external use
export type { OfflineSyncService } from '../types';