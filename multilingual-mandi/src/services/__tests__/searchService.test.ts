/**
 * Unit tests for SearchService
 * Tests Requirements: 7.1, 7.2, 7.3 - Search functionality with multilingual support
 */

import { searchService } from '../searchService';
import { translationService } from '../translationService';
import { priceService } from '../priceService';
import { userService } from '../userService';

// Mock dependencies
jest.mock('../translationService');
jest.mock('../priceService');
jest.mock('../userService');

const mockTranslationService = translationService as jest.Mocked<typeof translationService>;
const mockPriceService = priceService as jest.Mocked<typeof priceService>;
const mockUserService = userService as jest.Mocked<typeof userService>;

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('SearchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    // @ts-ignore - accessing private property for testing
    if (searchService.cache) searchService.cache.clear();
    // @ts-ignore
    searchService.isInitialized = false;
  });

  describe('searchCommodities', () => {
    it('searches commodities with English query', async () => {
      const mockResponse = {
        results: [
          {
            commodity: {
              id: 'wheat-001',
              name: 'Wheat',
              category: 'Grains',
              subcategory: 'Cereals'
            },
            relevanceScore: 95,
            availableVendors: 25,
            averagePrice: 2000
          }
        ],
        total: 1,
        page: 1,
        limit: 20
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockResponse })
      } as Response);

      const result = await searchService.searchCommodities({
        query: 'wheat',
        page: 1,
        limit: 20
      });

      expect(result.results).toHaveLength(1);
      expect(result.results[0].commodity.name).toBe('Wheat');
      // @ts-ignore
      expect(result.total).toBe(1);
    });

    it('translates query for multilingual search', async () => {
      mockTranslationService.translateText.mockResolvedValueOnce({
        translatedText: 'wheat',
        confidence: 0.9,
        sourceLanguageDetected: 'hi',
        requiresReview: false,
        targetLanguage: 'en',
        quality: 'high',
        processingTime: 100,
        translationEngine: 'google',
        timestamp: new Date(),
        metadata: {
          wordCount: 1,
          characterCount: 5,
          complexityScore: 0.1,
          contextMatches: 1,
          vocabularyMatches: 1
        }
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            results: [],
            total: 0,
            page: 1,
            limit: 20,
            suggestions: [],
            filters: { categories: [], locations: [], priceRanges: [] }
          }
        })
      } as Response);

      await searchService.searchCommodities({
        query: 'गेहूं',
        language: 'hi',
        page: 1,
        limit: 20
      });

      expect(mockTranslationService.translateText).toHaveBeenCalledWith({
        text: 'गेहूं',
        sourceLanguage: 'hi',
        targetLanguage: 'en',
        context: 'mandi'
      });
    });
  });
});
describe('searchVendors', () => {
  it('searches vendors with location filtering', async () => {
    const mockUsers = [
      {
        name: 'John Vendor',
        userType: 'vendor' as const,
        location: {
          latitude: 28.7041,
          longitude: 77.1025,
          address: 'Delhi',
          pincode: '110001',
          state: 'Delhi'
        },
        reputation: {
          overall: 4.5,
          punctuality: 4.2,
          communication: 4.8,
          productQuality: 4.3,
          totalTransactions: 150,
          reviewCount: 45,
          lastUpdated: new Date()
        },
        isVerified: true,
        userId: 'user-001',
        phoneNumber: '1234567890',
        preferredLanguage: 'en'
      }
    ];

    mockUserService.searchUsers.mockResolvedValueOnce(mockUsers);
    mockPriceService.queryPrices.mockResolvedValueOnce([
      {
        commodity: 'wheat',
        commodityId: 'wheat-001',
        price: 2000,
        unit: 'quintal',
        location: 'Delhi',
        source: 'vendor_submission',
        timestamp: new Date(),
        confidence: 0.9,
        marketTrend: 'stable',
        priceChange: { amount: 0, percentage: 0, period: '24h' }
      }
    ]);

    const result = await searchService.searchVendors({
      searchQuery: 'John',
      userType: 'vendor',
      location: {
        latitude: 28.7041,
        longitude: 77.1025,
        radius: 50
      },
      limit: 10
    });

    expect(result.users).toHaveLength(1);
    expect(result.users[0].name).toBe('John Vendor');
    expect(result.users[0].relevanceScore).toBeGreaterThan(0);
    expect(result.users[0].averagePrice).toBe(2000);
  });

  it('filters vendors by rating', async () => {
    const mockUsers = [
      {
        name: 'High Rated Vendor',
        userType: 'vendor' as const,
        reputation: { overall: 4.8, punctuality: 4.5, communication: 4.9, productQuality: 4.7, totalTransactions: 100, reviewCount: 30, lastUpdated: new Date() },
        isVerified: true,
        userId: 'user-001',
        phoneNumber: '1234567890',
        preferredLanguage: 'en',
        location: { latitude: 0, longitude: 0, address: '', pincode: '', state: '' }
      },
      {
        name: 'Low Rated Vendor',
        userType: 'vendor' as const,
        reputation: { overall: 2.5, punctuality: 2.0, communication: 3.0, productQuality: 2.8, totalTransactions: 20, reviewCount: 5, lastUpdated: new Date() },
        isVerified: false,
        userId: 'user-002',
        phoneNumber: '0987654321',
        preferredLanguage: 'en',
        location: { latitude: 0, longitude: 0, address: '', pincode: '', state: '' }
      }
    ];

    mockUserService.searchUsers.mockResolvedValueOnce(mockUsers);
    mockPriceService.queryPrices.mockResolvedValue([]);

    const result = await searchService.searchVendors({
      searchQuery: 'vendor',
      rating: { min: 4.0 },
      limit: 10
    });

    expect(result.users).toHaveLength(1);
    expect(result.users[0].name).toBe('High Rated Vendor');
    expect(result.users[0].reputation?.overall).toBeGreaterThanOrEqual(4.0);
  });
});

describe('globalSearch', () => {
  it('performs global search across all content types', async () => {
    // Mock commodity search
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          results: [{
            commodity: { id: 'wheat-001', name: 'Wheat' },
            relevanceScore: 90
          }],
          total: 1,
          page: 1,
          limit: 10
        }
      })
    } as Response);

    // Mock user search
    mockUserService.searchUsers.mockResolvedValueOnce([{
      name: 'Wheat Vendor',
      userType: 'vendor',
      reputation: { overall: 4.5, punctuality: 4.0, communication: 4.8, productQuality: 4.2, totalTransactions: 50, reviewCount: 15, lastUpdated: new Date() },
      isVerified: true,
      userId: 'user-001',
      phoneNumber: '1234567890',
      preferredLanguage: 'en',
      location: { latitude: 0, longitude: 0, address: '', pincode: '', state: '' }
    }]);

    mockPriceService.queryPrices.mockResolvedValue([]);

    const result = await searchService.globalSearch({
      query: 'wheat',
      type: 'all',
      page: 1,
      limit: 20
    });

    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results.some(r => r.type === 'commodity')).toBe(true);
    expect(result.results.some(r => r.type === 'user')).toBe(true);
  });

  it('returns suggestions when no results found', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          results: [],
          total: 0,
          page: 1,
          limit: 20,
          suggestions: [],
          filters: { categories: [], locations: [], priceRanges: [] }
        }
      })
    } as Response);

    mockUserService.searchUsers.mockResolvedValueOnce([]);

    const result = await searchService.globalSearch({
      query: 'nonexistent',
      page: 1,
      limit: 20
    });

    expect(result.results).toHaveLength(0);
    expect(result.suggestions).toBeDefined();
  });
});

describe('getSearchSuggestions', () => {
  it('returns search suggestions', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          suggestions: ['wheat', 'rice', 'barley']
        }
      })
    } as Response);

    const suggestions = await searchService.getSearchSuggestions('wh');

    expect(suggestions).toEqual(['wheat', 'rice', 'barley']);
  });

  it('returns fallback suggestions when API fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API Error'));

    const suggestions = await searchService.getSearchSuggestions('wh');

    expect(suggestions).toContain('wheat');
  });

  it('returns empty array for short queries', async () => {
    const suggestions = await searchService.getSearchSuggestions('w');

    expect(suggestions).toEqual([]);
  });
});

describe('performance requirements', () => {
  it('completes commodity search within 3 seconds', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          results: [],
          total: 0,
          page: 1,
          limit: 20,
          suggestions: [],
          filters: { categories: [], locations: [], priceRanges: [] }
        }
      })
    } as Response);

    const startTime = Date.now();

    await searchService.searchCommodities({
      query: 'wheat',
      page: 1,
      limit: 20
    });

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(3000); // 3 seconds requirement
  });

  it('completes vendor search within 3 seconds', async () => {
    mockUserService.searchUsers.mockResolvedValueOnce([]);

    const startTime = Date.now();

    await searchService.searchVendors({
      searchQuery: 'vendor',
      limit: 10
    });

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(3000); // 3 seconds requirement
  });
});

describe('caching', () => {
  it('caches search results', async () => {
    const mockResponse = {
      results: [{ commodity: { id: 'wheat-001', name: 'Wheat' }, relevanceScore: 90 }],
      total: 1,
      page: 1,
      limit: 20,
      suggestions: [],
      filters: { categories: [], locations: [], priceRanges: [] }
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockResponse })
    } as Response);

    // First call
    await searchService.searchCommodities({
      query: 'wheat',
      page: 1,
      limit: 20
    });

    // Second call should use cache
    const result = await searchService.searchCommodities({
      query: 'wheat',
      page: 1,
      limit: 20
    });

    expect(mockFetch).toHaveBeenCalledTimes(1); // Only called once due to caching
    expect(result.results).toHaveLength(1);
  });
});

describe('error handling', () => {
  it('handles API errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(searchService.searchCommodities({
      query: 'wheat',
      page: 1,
      limit: 20
    })).rejects.toThrow('Search failed');
  });

  it('validates query length', async () => {
    await expect(searchService.searchCommodities({
      query: 'w', // Too short
      page: 1,
      limit: 20
    })).rejects.toThrow('Search query must be at least 2 characters long');
  });

  it('handles translation service failures', async () => {
    mockTranslationService.translateText.mockRejectedValueOnce(new Error('Translation failed'));

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          results: [],
          total: 0,
          page: 1,
          limit: 20,
          suggestions: [],
          filters: { categories: [], locations: [], priceRanges: [] }
        }
      })
    } as Response);

    // Should not throw error, should continue with original query
    const result = await searchService.searchCommodities({
      query: 'गेहूं',
      language: 'hi',
      page: 1,
      limit: 20
    });

    expect(result).toBeDefined();
  });
});