// IndexedDB service for offline-first data storage
// Implements CRUD operations for all entity types with versioning and migration support

import type {
  User,
  Commodity,
  PriceRecord,
  Transaction,
  Message,
  Conversation,
  CacheEntry,
  SyncOperation,
  DatabaseSchema
} from '../types';

// Database configuration
const DB_NAME = 'MultilingualMandiDB';
const DB_VERSION = 1;

// Store names
export const STORES = {
  USERS: 'users',
  COMMODITIES: 'commodities',
  PRICE_RECORDS: 'priceRecords',
  TRANSACTIONS: 'transactions',
  MESSAGES: 'messages',
  CONVERSATIONS: 'conversations',
  CACHE: 'cache',
  SYNC_QUEUE: 'syncQueue',
  METADATA: 'metadata'
} as const;

// Database schema definition
const DATABASE_SCHEMA: DatabaseSchema = {
  version: DB_VERSION,
  stores: {
    [STORES.USERS]: {
      keyPath: 'id',
      indexes: {
        phoneNumber: { keyPath: 'phoneNumber', unique: true },
        role: { keyPath: 'role' },
        location: { keyPath: 'profile.location.state' },
        lastActive: { keyPath: 'lastActive' }
      }
    },
    [STORES.COMMODITIES]: {
      keyPath: 'id',
      indexes: {
        name: { keyPath: 'name' },
        category: { keyPath: 'category' },
        subcategory: { keyPath: 'subcategory' }
      }
    },
    [STORES.PRICE_RECORDS]: {
      keyPath: 'id',
      indexes: {
        commodityId: { keyPath: 'commodityId' },
        timestamp: { keyPath: 'timestamp' },
        location: { keyPath: 'location.state' },
        source: { keyPath: 'source.name' }
      }
    },
    [STORES.TRANSACTIONS]: {
      keyPath: 'id',
      indexes: {
        vendorId: { keyPath: 'vendorId' },
        buyerId: { keyPath: 'buyerId' },
        commodityId: { keyPath: 'commodityId' },
        status: { keyPath: 'status' },
        initiated: { keyPath: 'timestamps.initiated' }
      }
    },
    [STORES.MESSAGES]: {
      keyPath: 'id',
      indexes: {
        conversationId: { keyPath: 'conversationId' },
        senderId: { keyPath: 'senderId' },
        receiverId: { keyPath: 'receiverId' },
        timestamp: { keyPath: 'timestamp' },
        status: { keyPath: 'status' }
      }
    },
    [STORES.CONVERSATIONS]: {
      keyPath: 'id',
      indexes: {
        participants: { keyPath: 'participants', unique: false },
        lastActivity: { keyPath: 'lastActivity' },
        transactionId: { keyPath: 'transactionId' }
      }
    },
    [STORES.CACHE]: {
      keyPath: 'id',
      indexes: {
        timestamp: { keyPath: 'timestamp' },
        expiresAt: { keyPath: 'expiresAt' },
        syncStatus: { keyPath: 'syncStatus' }
      }
    },
    [STORES.SYNC_QUEUE]: {
      keyPath: 'id',
      indexes: {
        type: { keyPath: 'type' },
        entity: { keyPath: 'entity' },
        timestamp: { keyPath: 'timestamp' },
        status: { keyPath: 'status' }
      }
    },
    [STORES.METADATA]: {
      keyPath: 'key'
    }
  }
};

class DatabaseService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the database connection and handle migrations
   */
  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.setupErrorHandling();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.handleUpgrade(db, event.oldVersion, event.newVersion || DB_VERSION);
      };
    });

    return this.initPromise;
  }

  /**
   * Handle database schema upgrades and migrations
   */
  private handleUpgrade(db: IDBDatabase, oldVersion: number, newVersion: number): void {
    console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);

    // Create object stores based on schema
    Object.entries(DATABASE_SCHEMA.stores).forEach(([storeName, storeConfig]) => {
      let store: IDBObjectStore;

      if (!db.objectStoreNames.contains(storeName)) {
        store = db.createObjectStore(storeName, {
          keyPath: storeConfig.keyPath,
          autoIncrement: storeConfig.autoIncrement || false
        });
      } else {
        // Store exists, get it from the transaction
        const transaction = (db as any).transaction || ((db as any).currentTransaction);
        store = transaction.objectStore(storeName);
      }

      // Create indexes
      if (storeConfig.indexes) {
        Object.entries(storeConfig.indexes).forEach(([indexName, indexConfig]) => {
          if (!store.indexNames.contains(indexName)) {
            store.createIndex(indexName, indexConfig.keyPath, {
              unique: indexConfig.unique || false
            });
          }
        });
      }
    });

    // Store schema version in metadata
    const metadataStore = db.objectStoreNames.contains(STORES.METADATA)
      ? ((db as any).transaction || ((db as any).currentTransaction)).objectStore(STORES.METADATA)
      : db.createObjectStore(STORES.METADATA, { keyPath: 'key' });

    metadataStore.put({ key: 'schema_version', value: newVersion, timestamp: new Date() });
  }

  /**
   * Setup error handling for database operations
   */
  private setupErrorHandling(): void {
    if (this.db) {
      this.db.onerror = (event) => {
        console.error('Database error:', event);
      };

      this.db.onversionchange = () => {
        this.db?.close();
        this.db = null;
        this.initPromise = null;
        console.warn('Database version changed, reinitializing...');
      };
    }
  }

  /**
   * Ensure database is initialized before operations
   */
  private async ensureInitialized(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  /**
   * Generic method to create a transaction
   */
  private async getInternalTransaction(
    storeNames: string | string[],
    mode: IDBTransactionMode = 'readonly'
  ): Promise<IDBTransaction> {
    const db = await this.ensureInitialized();
    return db.transaction(storeNames, mode);
  }

  /**
   * Generic CRUD operations
   */

  // CREATE
  async create<T extends { id: string }>(storeName: string, data: T): Promise<T> {
    const transaction = await this.getInternalTransaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.add(data);

      request.onsuccess = () => resolve(data);
      request.onerror = () => reject(new Error(`Failed to create record: ${request.error?.message}`));
    });
  }

  // READ
  async getById<T>(storeName: string, id: string): Promise<T | null> {
    const transaction = await this.getInternalTransaction(storeName);
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(new Error(`Failed to get record: ${request.error?.message}`));
    });
  }

  // READ ALL
  async getAll<T>(storeName: string, limit?: number): Promise<T[]> {
    const transaction = await this.getInternalTransaction(storeName);
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = limit ? store.getAll(undefined, limit) : store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(new Error(`Failed to get all records: ${request.error?.message}`));
    });
  }

  // UPDATE
  async update<T extends { id: string }>(storeName: string, data: T): Promise<T> {
    const transaction = await this.getInternalTransaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.put(data);

      request.onsuccess = () => resolve(data);
      request.onerror = () => reject(new Error(`Failed to update record: ${request.error?.message}`));
    });
  }

  // DELETE
  async delete(storeName: string, id: string): Promise<void> {
    const transaction = await this.getInternalTransaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to delete record: ${request.error?.message}`));
    });
  }

  // QUERY BY INDEX
  async getByIndex<T>(
    storeName: string,
    indexName: string,
    value: any,
    limit?: number
  ): Promise<T[]> {
    const transaction = await this.getInternalTransaction(storeName);
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);

    return new Promise((resolve, reject) => {
      const request = limit ? index.getAll(value, limit) : index.getAll(value);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(new Error(`Failed to query by index: ${request.error?.message}`));
    });
  }

  // RANGE QUERY
  async getByRange<T>(
    storeName: string,
    indexName: string,
    range: IDBKeyRange,
    limit?: number
  ): Promise<T[]> {
    const transaction = await this.getInternalTransaction(storeName);
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);

    return new Promise((resolve, reject) => {
      const results: T[] = [];
      const request = index.openCursor(range);
      let count = 0;

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && (!limit || count < limit)) {
          results.push(cursor.value);
          count++;
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(new Error(`Failed to query by range: ${request.error?.message}`));
    });
  }

  /**
   * Entity-specific methods
   */

  // User operations
  async createUser(user: User): Promise<User> {
    return this.create(STORES.USERS, user);
  }

  async getUserById(id: string): Promise<User | null> {
    return this.getById<User>(STORES.USERS, id);
  }

  async getUserByPhone(phoneNumber: string): Promise<User | null> {
    const users = await this.getByIndex<User>(STORES.USERS, 'phoneNumber', phoneNumber, 1);
    return users[0] || null;
  }

  async updateUser(user: User): Promise<User> {
    return this.update(STORES.USERS, user);
  }

  // Commodity operations
  async createCommodity(commodity: Commodity): Promise<Commodity> {
    return this.create(STORES.COMMODITIES, commodity);
  }

  async getCommodityById(id: string): Promise<Commodity | null> {
    return this.getById<Commodity>(STORES.COMMODITIES, id);
  }

  async getCommoditiesByCategory(category: string): Promise<Commodity[]> {
    return this.getByIndex<Commodity>(STORES.COMMODITIES, 'category', category);
  }

  // Price record operations
  async createPriceRecord(priceRecord: PriceRecord): Promise<PriceRecord> {
    return this.create(STORES.PRICE_RECORDS, priceRecord);
  }

  async getPriceRecordsByCommodity(commodityId: string, limit?: number): Promise<PriceRecord[]> {
    return this.getByIndex<PriceRecord>(STORES.PRICE_RECORDS, 'commodityId', commodityId, limit);
  }

  async getRecentPriceRecords(hours: number = 24): Promise<PriceRecord[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    const range = IDBKeyRange.lowerBound(since);
    return this.getByRange<PriceRecord>(STORES.PRICE_RECORDS, 'timestamp', range);
  }

  // Transaction operations
  async createTransaction(transaction: Transaction): Promise<Transaction> {
    return this.create(STORES.TRANSACTIONS, transaction);
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    return this.getById<Transaction>(STORES.TRANSACTIONS, id);
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    const vendorTransactions = await this.getByIndex<Transaction>(STORES.TRANSACTIONS, 'vendorId', userId);
    const buyerTransactions = await this.getByIndex<Transaction>(STORES.TRANSACTIONS, 'buyerId', userId);
    return [...vendorTransactions, ...buyerTransactions];
  }

  async updateTransaction(transaction: Transaction): Promise<Transaction> {
    return this.update(STORES.TRANSACTIONS, transaction);
  }

  // Message operations
  async createMessage(message: Message): Promise<Message> {
    return this.create(STORES.MESSAGES, message);
  }

  async getMessagesByConversation(conversationId: string, limit?: number): Promise<Message[]> {
    return this.getByIndex<Message>(STORES.MESSAGES, 'conversationId', conversationId, limit);
  }

  async updateMessage(message: Message): Promise<Message> {
    return this.update(STORES.MESSAGES, message);
  }

  // Conversation operations
  async createConversation(conversation: Conversation): Promise<Conversation> {
    return this.create(STORES.CONVERSATIONS, conversation);
  }

  async getConversationById(id: string): Promise<Conversation | null> {
    return this.getById<Conversation>(STORES.CONVERSATIONS, id);
  }

  async getConversationsByUser(userId: string): Promise<Conversation[]> {
    // This is a simplified approach - in production, you'd want a more efficient query
    const allConversations = await this.getAll<Conversation>(STORES.CONVERSATIONS);
    return allConversations.filter(conv => conv.participants.includes(userId));
  }

  async updateConversation(conversation: Conversation): Promise<Conversation> {
    return this.update(STORES.CONVERSATIONS, conversation);
  }

  // Cache operations
  async setCacheEntry<T>(key: string, data: T, expiresIn?: number): Promise<void> {
    const entry: CacheEntry<T> = {
      id: key,
      data,
      timestamp: new Date(),
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn) : undefined,
      syncStatus: 'synced'
    };
    await this.create(STORES.CACHE, entry);
  }

  async getCacheEntry<T>(key: string): Promise<T | null> {
    const entry = await this.getById<CacheEntry<T>>(STORES.CACHE, key);
    if (!entry) return null;

    // Check if expired
    if (entry.expiresAt && entry.expiresAt < new Date()) {
      await this.delete(STORES.CACHE, key);
      return null;
    }

    return entry.data;
  }

  // Sync queue operations
  async addToSyncQueue(operation: SyncOperation): Promise<void> {
    await this.create(STORES.SYNC_QUEUE, operation);
  }

  async getPendingSyncOperations(): Promise<SyncOperation[]> {
    return this.getByIndex<SyncOperation>(STORES.SYNC_QUEUE, 'status', 'pending');
  }

  async updateSyncOperation(operation: SyncOperation): Promise<SyncOperation> {
    return this.update(STORES.SYNC_QUEUE, operation);
  }

  async clearCompletedSyncOperations(): Promise<void> {
    const completed = await this.getByIndex<SyncOperation>(STORES.SYNC_QUEUE, 'status', 'completed');
    for (const op of completed) {
      await this.delete(STORES.SYNC_QUEUE, op.id);
    }
  }

  /**
   * Utility methods
   */

  // Clear all data (for testing or reset)
  async clearAllData(): Promise<void> {
    const db = await this.ensureInitialized();
    const storeNames = Array.from(db.objectStoreNames);
    const transaction = await this.getInternalTransaction(storeNames, 'readwrite');

    const promises = storeNames.map(storeName => {
      return new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore(storeName).clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });

    await Promise.all(promises);
  }

  // Get database statistics
  async getStats(): Promise<Record<string, number>> {
    const db = await this.ensureInitialized();
    const storeNames = Array.from(db.objectStoreNames);
    const stats: Record<string, number> = {};

    for (const storeName of storeNames) {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);

      const count = await new Promise<number>((resolve, reject) => {
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      stats[storeName] = count;
    }

    return stats;
  }

  // Close database connection
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
export default databaseService;