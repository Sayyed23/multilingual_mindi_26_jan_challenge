// Unit Tests for Price Discovery Service
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { priceDiscoveryService } from '../priceDiscovery';
import type { PriceData, PriceEntry, QualityGrade } from '../../types';

// Mock Firebase
vi.mock('../../lib/firebase', () => ({
  db: {},
  functions: {}
}));

// Mock offline sync service
vi.mock('../offlineSync', () => ({
  offlineSyncService: {
    getCachedData: vi.fn(),
    getCachedEntry: vi.fn(),
    cacheData: vi.fn(),
    isOnline: vi.fn(() => true),
    getCacheSize: vi.fn(() => Promise.resolve(10)),
    getLastSyncTime: vi.fn(() => Promise.resolve(new Date())),
    getPendingActionsCount: vi.fn(() => Promise.resolve(0))
  }
}));

// Mock Firestore functions
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn(),
  onSnapshot: vi.fn(),
  Timestamp: {
    fromDate: vi.fn((date) => ({ toDate: () => date })),
    now: vi.fn(() => ({ toDate: () => new Date() }))
  },
  doc: vi.fn(),
  getDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn()
}));

describe('PriceDiscoveryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any subscriptions
    priceDiscoveryService.destroy();
  });

  describe('Price Data Validation', () => {
    it('should validate correct price data', () => {
      const validPriceData: PriceData = {
        commodity: 'Rice',
        mandi: 'Delhi Mandi',
        price: 2500,
        unit: 'quintal',
        quality: 'standard',
        timestamp: new Date(),
        source: 'Government Portal'
      };

      const result = priceDiscoveryService.validatePriceData(validPriceData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject price data with missing commodity', () => {
      const invalidPriceData: PriceData = {
        commodity: '',
        mandi: 'Delhi Mandi',
        price: 2500,
        unit: 'quintal',
        quality: 'standard',
        timestamp: new Date(),
        source: 'Government Portal'
      };

      const result = priceDiscoveryService.validatePriceData(invalidPriceData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Commodity name is required');
    });

    it('should reject price data with zero or negative price', () => {
      const invalidPriceData: PriceData = {
        commodity: 'Rice',
        mandi: 'Delhi Mandi',
        price: 0,
        unit: 'quintal',
        quality: 'standard',
        timestamp: new Date(),
        source: 'Government Portal'
      };

      const result = priceDiscoveryService.validatePriceData(invalidPriceData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Price must be greater than zero');
    });

    it('should reject price data with unreasonably high price', () => {
      const invalidPriceData: PriceData = {
        commodity: 'Rice',
        mandi: 'Delhi Mandi',
        price: 2000000,
        unit: 'quintal',
        quality: 'standard',
        timestamp: new Date(),
        source: 'Government Portal'
      };

      const result = priceDiscoveryService.validatePriceData(invalidPriceData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Price seems unreasonably high');
    });

    it('should reject price data with invalid quality grade', () => {
      const invalidPriceData: PriceData = {
        commodity: 'Rice',
        mandi: 'Delhi Mandi',
        price: 2500,
        unit: 'quintal',
        quality: 'invalid' as QualityGrade,
        timestamp: new Date(),
        source: 'Government Portal'
      };

      const result = priceDiscoveryService.validatePriceData(invalidPriceData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid quality grade');
    });

    it('should reject price data with future timestamp', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
      const invalidPriceData: PriceData = {
        commodity: 'Rice',
        mandi: 'Delhi Mandi',
        price: 2500,
        unit: 'quintal',
        quality: 'standard',
        timestamp: futureDate,
        source: 'Government Portal'
      };

      const result = priceDiscoveryService.validatePriceData(invalidPriceData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid timestamp');
    });

    it('should reject price data that is too old', () => {
      const oldDate = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000); // 8 days ago
      const invalidPriceData: PriceData = {
        commodity: 'Rice',
        mandi: 'Delhi Mandi',
        price: 2500,
        unit: 'quintal',
        quality: 'standard',
        timestamp: oldDate,
        source: 'Government Portal'
      };

      const result = priceDiscoveryService.validatePriceData(invalidPriceData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Price data is too old');
    });
  });

  describe('Price Entry Validation', () => {
    it('should validate correct price entry', () => {
      const validPriceEntry: PriceEntry = {
        id: 'test-id',
        commodity: {
          name: 'Rice',
          category: 'Grains'
        },
        market: {
          mandiName: 'Delhi Mandi',
          location: {
            state: 'Delhi',
            district: 'New Delhi',
            city: 'Delhi',
            pincode: '110001'
          },
          marketCode: 'DL001'
        },
        pricing: {
          minPrice: 2000,
          maxPrice: 3000,
          avgPrice: 2500,
          modalPrice: 2500,
          unit: 'quintal'
        },
        quality: {
          grade: 'standard',
          specifications: []
        },
        temporal: {
          date: new Date(),
          session: 'morning',
          lastUpdated: new Date()
        },
        source: {
          provider: 'Government Portal',
          reliability: 0.9,
          verificationStatus: true
        }
      };

      const result = priceDiscoveryService.validatePriceEntry(validPriceEntry);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject price entry with invalid pricing ranges', () => {
      const invalidPriceEntry: PriceEntry = {
        id: 'test-id',
        commodity: {
          name: 'Rice',
          category: 'Grains'
        },
        market: {
          mandiName: 'Delhi Mandi',
          location: {
            state: 'Delhi',
            district: 'New Delhi',
            city: 'Delhi',
            pincode: '110001'
          },
          marketCode: 'DL001'
        },
        pricing: {
          minPrice: 3000,
          maxPrice: 2000, // Max less than min
          avgPrice: 2500,
          modalPrice: 2500,
          unit: 'quintal'
        },
        quality: {
          grade: 'standard',
          specifications: []
        },
        temporal: {
          date: new Date(),
          session: 'morning',
          lastUpdated: new Date()
        },
        source: {
          provider: 'Government Portal',
          reliability: 0.9,
          verificationStatus: true
        }
      };

      const result = priceDiscoveryService.validatePriceEntry(invalidPriceEntry);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Maximum price cannot be less than minimum price');
    });

    it('should reject price entry with average price outside range', () => {
      const invalidPriceEntry: PriceEntry = {
        id: 'test-id',
        commodity: {
          name: 'Rice',
          category: 'Grains'
        },
        market: {
          mandiName: 'Delhi Mandi',
          location: {
            state: 'Delhi',
            district: 'New Delhi',
            city: 'Delhi',
            pincode: '110001'
          },
          marketCode: 'DL001'
        },
        pricing: {
          minPrice: 2000,
          maxPrice: 3000,
          avgPrice: 3500, // Average outside range
          modalPrice: 2500,
          unit: 'quintal'
        },
        quality: {
          grade: 'standard',
          specifications: []
        },
        temporal: {
          date: new Date(),
          session: 'morning',
          lastUpdated: new Date()
        },
        source: {
          provider: 'Government Portal',
          reliability: 0.9,
          verificationStatus: true
        }
      };

      const result = priceDiscoveryService.validatePriceEntry(invalidPriceEntry);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Average price must be between minimum and maximum prices');
    });

    it('should reject price entry with invalid reliability score', () => {
      const invalidPriceEntry: PriceEntry = {
        id: 'test-id',
        commodity: {
          name: 'Rice',
          category: 'Grains'
        },
        market: {
          mandiName: 'Delhi Mandi',
          location: {
            state: 'Delhi',
            district: 'New Delhi',
            city: 'Delhi',
            pincode: '110001'
          },
          marketCode: 'DL001'
        },
        pricing: {
          minPrice: 2000,
          maxPrice: 3000,
          avgPrice: 2500,
          modalPrice: 2500,
          unit: 'quintal'
        },
        quality: {
          grade: 'standard',
          specifications: []
        },
        temporal: {
          date: new Date(),
          session: 'morning',
          lastUpdated: new Date()
        },
        source: {
          provider: 'Government Portal',
          reliability: 1.5, // Invalid reliability > 1
          verificationStatus: true
        }
      };

      const result = priceDiscoveryService.validatePriceEntry(invalidPriceEntry);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Source reliability must be between 0 and 1');
    });
  });

  describe('Price Anomaly Detection', () => {
    it('should detect no anomalies in normal price data', () => {
      const normalPrices: PriceData[] = [
        {
          commodity: 'Rice',
          mandi: 'Delhi Mandi',
          price: 2400,
          unit: 'quintal',
          quality: 'standard',
          timestamp: new Date(),
          source: 'Government Portal'
        },
        {
          commodity: 'Rice',
          mandi: 'Mumbai Mandi',
          price: 2500,
          unit: 'quintal',
          quality: 'standard',
          timestamp: new Date(),
          source: 'Government Portal'
        },
        {
          commodity: 'Rice',
          mandi: 'Kolkata Mandi',
          price: 2600,
          unit: 'quintal',
          quality: 'standard',
          timestamp: new Date(),
          source: 'Government Portal'
        }
      ];

      const anomalies = priceDiscoveryService.detectPriceAnomalies(normalPrices);
      expect(anomalies).toHaveLength(0);
    });

    it('should detect high price anomaly', () => {
      const pricesWithAnomaly: PriceData[] = [
        {
          commodity: 'Rice',
          mandi: 'Delhi Mandi',
          price: 2400,
          unit: 'quintal',
          quality: 'standard',
          timestamp: new Date(),
          source: 'Government Portal'
        },
        {
          commodity: 'Rice',
          mandi: 'Mumbai Mandi',
          price: 2500,
          unit: 'quintal',
          quality: 'standard',
          timestamp: new Date(),
          source: 'Government Portal'
        },
        {
          commodity: 'Rice',
          mandi: 'Anomaly Mandi',
          price: 5000, // Significantly higher
          unit: 'quintal',
          quality: 'standard',
          timestamp: new Date(),
          source: 'Government Portal'
        }
      ];

      const anomalies = priceDiscoveryService.detectPriceAnomalies(pricesWithAnomaly);
      expect(anomalies.length).toBeGreaterThan(0);

      // Find the anomaly with price 5000
      const highPriceAnomaly = anomalies.find(a => a.detectedPrice === 5000);
      expect(highPriceAnomaly).toBeDefined();
      expect(highPriceAnomaly!.severity).toBe('high');
    });

    it('should detect low price anomaly', () => {
      const pricesWithAnomaly: PriceData[] = [
        {
          commodity: 'Rice',
          mandi: 'Delhi Mandi',
          price: 2400,
          unit: 'quintal',
          quality: 'standard',
          timestamp: new Date(),
          source: 'Government Portal'
        },
        {
          commodity: 'Rice',
          mandi: 'Mumbai Mandi',
          price: 2500,
          unit: 'quintal',
          quality: 'standard',
          timestamp: new Date(),
          source: 'Government Portal'
        },
        {
          commodity: 'Rice',
          mandi: 'Anomaly Mandi',
          price: 500, // Significantly lower
          unit: 'quintal',
          quality: 'standard',
          timestamp: new Date(),
          source: 'Government Portal'
        }
      ];

      const anomalies = priceDiscoveryService.detectPriceAnomalies(pricesWithAnomaly);
      expect(anomalies.length).toBeGreaterThan(0);

      // Find the anomaly with price 500
      const lowPriceAnomaly = anomalies.find(a => a.detectedPrice === 500);
      expect(lowPriceAnomaly).toBeDefined();
      expect(lowPriceAnomaly!.severity).toBe('high');
    });

    it('should return empty array for insufficient data', () => {
      const insufficientPrices: PriceData[] = [
        {
          commodity: 'Rice',
          mandi: 'Delhi Mandi',
          price: 2400,
          unit: 'quintal',
          quality: 'standard',
          timestamp: new Date(),
          source: 'Government Portal'
        }
      ];

      const anomalies = priceDiscoveryService.detectPriceAnomalies(insufficientPrices);
      expect(anomalies).toHaveLength(0);
    });
  });

  describe('Cache Status and Management', () => {
    it('should return cache status with offline indicators', async () => {
      const status = await priceDiscoveryService.getPriceCacheStatus();

      expect(status).toHaveProperty('size');
      expect(status).toHaveProperty('lastUpdate');
      expect(status).toHaveProperty('offlineIndicators');
      expect(status.offlineIndicators).toHaveProperty('isOffline');
      expect(status.offlineIndicators).toHaveProperty('pendingSync');
      expect(status.offlineIndicators).toHaveProperty('lastSyncAttempt');
    });

    it('should perform data integrity check', async () => {
      const integrityCheck = await priceDiscoveryService.performDataIntegrityCheck();

      expect(integrityCheck).toHaveProperty('totalPrices');
      expect(integrityCheck).toHaveProperty('validPrices');
      expect(integrityCheck).toHaveProperty('invalidPrices');
      expect(integrityCheck).toHaveProperty('anomalies');
      expect(integrityCheck).toHaveProperty('errors');
      expect(Array.isArray(integrityCheck.errors)).toBe(true);
    });
  });
});