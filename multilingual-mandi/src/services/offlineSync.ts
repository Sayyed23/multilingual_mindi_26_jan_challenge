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
  syncMetadata!: Table<{ key: string; value: any; timestamp: Date }>;

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
  private retryDelay: number = 1000; // 1 second base delay

  constructor() {
    this.initializeNetworkListeners();
    this.startPeriodicSync();
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

  async cacheData(key: string, data: any, ttl?: number): Promise<void> {
    const cacheEntry: CacheEntry<any> = {
      key,
      data,
      timestamp: new Date(),
      ttl,
      version: 1
    };

    try {
      // Determine which cache table to use based on data type
      const table = this.getCacheTable(data);
      await table.put(cacheEntry);
      
      // Clean up expired entries
      await this.cleanupExpiredEntries(table);
    } catch (error) {
      console.error('Failed to cache data:', error);
      throw new Error(`Failed to cache data for key: ${key}`);
    }
  }

  async getCachedData<T>(key: string): Promise<T | null> {
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
          if (entry.ttl && Date.now() - entry.timestamp.getTime() > entry.ttl) {
            await table.delete(entry.key);
            continue;
          }
          return entry.data as T;
        }
      }

      return null;
    } catch (error) {
      console.error('Failed to retrieve cached data:', error);
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
              await this.delay(this.retryDelay * action.retryCount);
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

  getLastSyncTime(): Date | null {
    // This will be implemented to retrieve from syncMetadata table
    // For now, return current time as placeholder
    return new Date();
  }

  isOnline(): boolean {
    return this.isOnlineStatus;
  }

  // Private helper methods

  private getCacheTable(data: any): Table<CacheEntry<any>> {
    // Simple type detection based on data structure
    if (data.commodity && data.price) return db.priceCache;
    if (data.buyerId && data.sellerId) return db.dealCache;
    if (data.senderId && data.receiverId) return db.messageCache;
    if (data.uid && data.email) return db.userCache;
    if (data.userId && data.type) return db.notificationCache;
    
    // Default to a generic cache (use priceCache as fallback)
    return db.priceCache;
  }

  private async cleanupExpiredEntries(table: Table<CacheEntry<any>>): Promise<void> {
    const now = Date.now();
    const expiredEntries = await table
      .filter(entry => entry.ttl !== undefined && (now - entry.timestamp.getTime()) > entry.ttl)
      .toArray();
    
    for (const entry of expiredEntries) {
      await table.delete(entry.key);
    }
  }

  private async executeAction(action: OfflineAction): Promise<SyncResult> {
    // This is a placeholder implementation
    // In a real implementation, this would dispatch actions to appropriate services
    try {
      switch (action.type) {
        case 'create_deal':
          // Would call DealManagementService.createDeal(action.payload)
          break;
        case 'send_message':
          // Would call messaging service
          break;
        case 'update_profile':
          // Would call user profile service
          break;
        case 'rate_user':
          // Would call trust service
          break;
        case 'create_negotiation':
          // Would call negotiation service
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

  private async updateLastSyncTime(): Promise<void> {
    await db.syncMetadata.put({
      key: 'lastSyncTime',
      value: new Date(),
      timestamp: new Date()
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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
}

// Export singleton instance
export const offlineSyncService = new OfflineSyncServiceImpl();

// Export database instance for direct access if needed
export { db as offlineDatabase };

// Export types for external use
export type { OfflineSyncService } from '../types';