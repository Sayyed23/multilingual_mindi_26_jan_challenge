// React hook for database operations and state management
// Provides a convenient interface for components to interact with IndexedDB

import { useState, useEffect, useCallback } from 'react';
import { databaseService } from '../services/database';
import { dbInitService } from '../services/init';
import type { InitializationResult } from '../services/init';
import type {
  User,
  Commodity,
  PriceRecord,
  Transaction,
  Message,
  Conversation
} from '../types';

export interface DatabaseState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  stats: Record<string, number>;
}

export interface DatabaseOperations {
  // Initialization
  initialize: (options?: { seedData?: boolean }) => Promise<InitializationResult>;
  reset: () => Promise<InitializationResult>;

  // User operations
  createUser: (user: User) => Promise<User>;
  getUserById: (id: string) => Promise<User | null>;
  getUserByPhone: (phoneNumber: string) => Promise<User | null>;
  updateUser: (user: User) => Promise<User>;

  // Commodity operations
  getCommodityById: (id: string) => Promise<Commodity | null>;
  getCommoditiesByCategory: (category: string) => Promise<Commodity[]>;
  getAllCommodities: () => Promise<Commodity[]>;

  // Price operations
  getPriceRecordsByCommodity: (commodityId: string, limit?: number) => Promise<PriceRecord[]>;
  getRecentPriceRecords: (hours?: number) => Promise<PriceRecord[]>;
  createPriceRecord: (priceRecord: PriceRecord) => Promise<PriceRecord>;

  // Transaction operations
  createTransaction: (transaction: Transaction) => Promise<Transaction>;
  getTransactionById: (id: string) => Promise<Transaction | null>;
  getTransactionsByUser: (userId: string) => Promise<Transaction[]>;
  updateTransaction: (transaction: Transaction) => Promise<Transaction>;

  // Message operations
  createMessage: (message: Message) => Promise<Message>;
  getMessagesByConversation: (conversationId: string, limit?: number) => Promise<Message[]>;
  updateMessage: (message: Message) => Promise<Message>;

  // Conversation operations
  createConversation: (conversation: Conversation) => Promise<Conversation>;
  getConversationById: (id: string) => Promise<Conversation | null>;
  getConversationsByUser: (userId: string) => Promise<Conversation[]>;
  updateConversation: (conversation: Conversation) => Promise<Conversation>;

  // Cache operations
  setCacheEntry: <T>(key: string, data: T, expiresIn?: number) => Promise<void>;
  getCacheEntry: <T>(key: string) => Promise<T | null>;

  // Utility operations
  getStats: () => Promise<Record<string, number>>;
  clearAllData: () => Promise<void>;
}

/**
 * Main database hook
 */
export function useDatabase(): DatabaseState & DatabaseOperations {
  const [state, setState] = useState<DatabaseState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    stats: {}
  });

  // Initialize database on mount
  useEffect(() => {
    const initDb = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await dbInitService.initialize({
          runMigrations: true,
          seedData: false, // Don't auto-seed in production
          validateIntegrity: true
        });

        if (result.success) {
          const stats = await databaseService.getStats();
          setState(prev => ({
            ...prev,
            isInitialized: true,
            isLoading: false,
            stats
          }));
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: result.message
          }));
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Database initialization failed'
        }));
      }
    };

    initDb();
  }, []);

  // Wrapped operations with error handling
  const wrapOperation = useCallback(<T extends any[], R>(
    operation: (...args: T) => Promise<R>
  ) => {
    return async (...args: T): Promise<R> => {
      try {
        setState(prev => ({ ...prev, error: null }));
        return await operation(...args);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Operation failed';
        setState(prev => ({ ...prev, error: errorMessage }));
        throw error;
      }
    };
  }, []);

  // Operations
  const operations: DatabaseOperations = {
    // Initialization
    initialize: wrapOperation(async (options?: { seedData?: boolean }) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await dbInitService.initialize({
        runMigrations: true,
        seedData: options?.seedData || false,
        validateIntegrity: true
      });

      if (result.success) {
        const stats = await databaseService.getStats();
        setState(prev => ({
          ...prev,
          isInitialized: true,
          isLoading: false,
          stats
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.message
        }));
      }

      return result;
    }),

    reset: wrapOperation(async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await dbInitService.reset({ seedData: true });

      if (result.success) {
        const stats = await databaseService.getStats();
        setState(prev => ({
          ...prev,
          isInitialized: true,
          isLoading: false,
          stats
        }));
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.message
        }));
      }

      return result;
    }),

    // User operations
    createUser: wrapOperation(databaseService.createUser.bind(databaseService)),
    getUserById: wrapOperation(databaseService.getUserById.bind(databaseService)),
    getUserByPhone: wrapOperation(databaseService.getUserByPhone.bind(databaseService)),
    updateUser: wrapOperation(databaseService.updateUser.bind(databaseService)),

    // Commodity operations
    getCommodityById: wrapOperation(databaseService.getCommodityById.bind(databaseService)),
    getCommoditiesByCategory: wrapOperation(databaseService.getCommoditiesByCategory.bind(databaseService)),
    getAllCommodities: wrapOperation(() => databaseService.getAll('commodities')),

    // Price operations
    getPriceRecordsByCommodity: wrapOperation(databaseService.getPriceRecordsByCommodity.bind(databaseService)),
    getRecentPriceRecords: wrapOperation(databaseService.getRecentPriceRecords.bind(databaseService)),
    createPriceRecord: wrapOperation(databaseService.createPriceRecord.bind(databaseService)),

    // Transaction operations
    createTransaction: wrapOperation(databaseService.createTransaction.bind(databaseService)),
    getTransactionById: wrapOperation(databaseService.getTransactionById.bind(databaseService)),
    getTransactionsByUser: wrapOperation(databaseService.getTransactionsByUser.bind(databaseService)),
    updateTransaction: wrapOperation(databaseService.updateTransaction.bind(databaseService)),

    // Message operations
    createMessage: wrapOperation(databaseService.createMessage.bind(databaseService)),
    getMessagesByConversation: wrapOperation(databaseService.getMessagesByConversation.bind(databaseService)),
    updateMessage: wrapOperation(databaseService.updateMessage.bind(databaseService)),

    // Conversation operations
    createConversation: wrapOperation(databaseService.createConversation.bind(databaseService)),
    getConversationById: wrapOperation(databaseService.getConversationById.bind(databaseService)),
    getConversationsByUser: wrapOperation(databaseService.getConversationsByUser.bind(databaseService)),
    updateConversation: wrapOperation(databaseService.updateConversation.bind(databaseService)),

    // Cache operations
    setCacheEntry: <T>(key: string, data: T, expiresIn?: number) =>
      wrapOperation(() => databaseService.setCacheEntry<T>(key, data, expiresIn))(),
    getCacheEntry: <T>(key: string) =>
      wrapOperation(() => databaseService.getCacheEntry<T>(key))(),

    // Utility operations
    getStats: wrapOperation(databaseService.getStats.bind(databaseService)),
    clearAllData: wrapOperation(databaseService.clearAllData.bind(databaseService))
  };

  return {
    ...state,
    ...operations
  };
}

/**
 * Hook for user-specific operations
 */
export function useUserData(userId?: string) {
  const db = useDatabase();
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUserData = useCallback(async (id: string) => {
    if (!db.isInitialized) return;

    setLoading(true);
    try {
      const [userData, userTransactions, userConversations] = await Promise.all([
        db.getUserById(id),
        db.getTransactionsByUser(id),
        db.getConversationsByUser(id)
      ]);

      setUser(userData);
      setTransactions(userTransactions);
      setConversations(userConversations);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    if (userId && db.isInitialized) {
      loadUserData(userId);
    }
  }, [userId, db.isInitialized, loadUserData]);

  return {
    user,
    transactions,
    conversations,
    loading,
    refreshUserData: userId ? () => loadUserData(userId) : undefined
  };
}

/**
 * Hook for commodity and price data
 */
export function useCommodityData() {
  const db = useDatabase();
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [recentPrices, setRecentPrices] = useState<PriceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCommodityData = useCallback(async () => {
    if (!db.isInitialized) return;

    setLoading(true);
    try {
      const [commodityData, priceData] = await Promise.all([
        db.getAllCommodities(),
        db.getRecentPriceRecords(24) // Last 24 hours
      ]);

      setCommodities(commodityData);
      setRecentPrices(priceData);
    } catch (error) {
      console.error('Failed to load commodity data:', error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    if (db.isInitialized) {
      loadCommodityData();
    }
  }, [db.isInitialized, loadCommodityData]);

  const getPricesForCommodity = useCallback(async (commodityId: string, limit?: number) => {
    return db.getPriceRecordsByCommodity(commodityId, limit);
  }, [db]);

  return {
    commodities,
    recentPrices,
    loading,
    refreshCommodityData: loadCommodityData,
    getPricesForCommodity
  };
}

/**
 * Hook for development and testing
 */
export function useDatabaseDev() {
  const db = useDatabase();

  const seedDatabase = useCallback(async () => {
    return db.initialize({ seedData: true });
  }, [db]);

  const resetDatabase = useCallback(async () => {
    return db.reset();
  }, [db]);

  const getStatus = useCallback(async () => {
    return dbInitService.getStatus();
  }, []);

  return {
    seedDatabase,
    resetDatabase,
    getStatus,
    clearAllData: db.clearAllData,
    getStats: db.getStats
  };
}