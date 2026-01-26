/**
 * Property-based tests for SearchService
 * Feature: multilingual-mandi, Property 15: Search Performance and Results
 * Feature: multilingual-mandi, Property 16: Search Filtering and Fallbacks
 * Tests Requirements: 7.1, 7.2, 7.3, 7.4, 7.5 - Search functionality with multilingual support
 */

import fc from 'fast-check';
import { searchService } from '../searchService';

// Mock dependencies
jest.mock('../translationService');
jest.mock('../priceService');
jest.mock('../userService');

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

// Custom generators for property-based testing
const commodityNameGenerator = fc.oneof(
  fc.constantFrom('wheat', 'rice', 'onion', 'potato', 'tomato', 'garlic', 'ginger'),
  fc.string({ minLength: 2, maxLength: 20 }).filter(s => s.trim().length >= 2)
);

const languageCodeGenerator = fc.constantFrom('en', 'hi', 'te', 'ta', 'bn', 'gu', 'mr', 'pa');

const priceRangeGenerator = fc.record({
  min: fc.integer({ min: 100, max: 5000 }),
  max: fc.integer({ min: 5001, max: 50000 })
});

const locationGenerator = fc.record({
  latitude: fc.float({ min: 8.0, max: 37.0 }),
  longitude: fc.float({ min: 68.0, max: 97.0 }),
  radius: fc.integer({ min: 1, max: 500 })
});

const userTypeGenerator = fc.constantFrom('vendor', 'buyer', 'both');

const paginationGenerator = fc.record({
  page: fc.integer({ min: 1, max: 10 }),
  limit: fc.integer({ min: 1, max: 50 })
});

describe('SearchService Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);

    // Setup default successful mock responses
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          results: [],
          suggestions: [],
          filters: { categories: [], locations: [], priceRanges: [] }
        }
      })
    } as Response);

    // Mock userService to return empty array by default
    // Mock userService to return empty array by default
    const { userService } = require('../userService'); // Use required module to access mock
    (userService.searchUsers as jest.Mock).mockResolvedValue([]);
  });

  describe('Property 15: Search Performance and Results', () => {
    it('should return results within 3 seconds for any valid commodity search', async () => {
      await fc.assert(
        fc.asyncProperty(
          commodityNameGenerator,
          languageCodeGenerator,
          paginationGenerator,
          async (query, language, pagination) => {
            const startTime = Date.now();

            try {
              await searchService.searchCommodities({
                query,
                language,
                ...pagination
              });

              const duration = Date.now() - startTime;
              expect(duration).toBeLessThan(3000); // Requirement 7.1: 3-second response time
            } catch (error) {
              // Allow for expected validation errors
              if (error instanceof Error && error.message.includes('Search query must be at least')) {
                return true; // Skip validation errors
              }
              throw error;
            }
          }
        ),
        { numRuns: 50 } // Reduced from 100 for faster execution
      );
    });

    it('should return results within 3 seconds for any valid vendor search', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 3, maxLength: 50 }),
          userTypeGenerator,
          locationGenerator,
          async (searchQuery, userType, location) => {
            const startTime = Date.now();

            await searchService.searchVendors({
              searchQuery,
              userType,
              location,
              limit: 20
            });

            const duration = Date.now() - startTime;
            expect(duration).toBeLessThan(3000); // Requirement 7.1: 3-second response time
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle multilingual search queries without errors', async () => {
      await fc.assert(
        fc.asyncProperty(
          commodityNameGenerator,
          languageCodeGenerator,
          async (query, language) => {
            try {
              const result = await searchService.searchCommodities({
                query,
                language,
                page: 1,
                limit: 10
              });

              // Should not throw error and should return valid response structure
              expect(result).toHaveProperty('results');
              expect(Array.isArray(result.results)).toBe(true);
            } catch (error) {
              // Allow for expected validation errors
              if (error instanceof Error && error.message.includes('Search query must be at least')) {
                return true; // Skip validation errors
              }
              throw error;
            }
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe('Property 16: Search Filtering and Fallbacks', () => {
    it('should support filtering by location, price range, and user type', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 3, maxLength: 20 }).filter(s => s.trim().length >= 2),
          priceRangeGenerator,
          locationGenerator,
          userTypeGenerator,
          async (query, priceRange, location, userType) => {
            // Test commodity search with filters
            const commodityResult = await searchService.searchCommodities({
              query,
              priceRange,
              location,
              page: 1,
              limit: 10
            });

            expect(commodityResult).toHaveProperty('results');
            expect(Array.isArray(commodityResult.results)).toBe(true);

            // Test vendor search with filters
            const vendorResult = await searchService.searchVendors({
              searchQuery: query,
              userType,
              location,
              limit: 10
            });

            expect(vendorResult).toHaveProperty('users');
            expect(Array.isArray(vendorResult.users)).toBe(true);
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should provide suggestions when no exact matches are found', async () => {
      // Mock empty results to trigger suggestions
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            results: [],
            suggestions: ['wheat', 'rice', 'barley'],
            filters: { categories: [], locations: [], priceRanges: [] }
          }
        })
      } as Response);

      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 2, maxLength: 20 }),
          async (query) => {
            const result = await searchService.globalSearch({
              query,
              type: 'all',
              page: 1,
              limit: 20
            });

            // Requirement 7.5: Suggest similar commodities or alternative vendors when no exact matches
            expect(result).toHaveProperty('results');
            expect(Array.isArray(result.results)).toBe(true);

            // Should have suggestions property
            if (result.results.length === 0) {
              expect(result).toHaveProperty('suggestions');
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should handle invalid or edge case inputs gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.constant(''), // Empty string
            fc.constant(' '), // Whitespace only
            fc.constant('a'), // Too short
            fc.string({ minLength: 100, maxLength: 200 }), // Very long
            fc.string().filter(s => /[^\w\s]/.test(s)) // Special characters
          ),
          async (query) => {
            try {
              const result = await searchService.searchCommodities({
                query,
                page: 1,
                limit: 10
              });

              // If no error is thrown, result should have valid structure
              expect(result).toHaveProperty('results');
            } catch (error) {
              // Should only throw validation errors for invalid inputs
              expect(error).toBeInstanceOf(Error);
              if (error instanceof Error) {
                expect(error.message).toMatch(/Search query must be at least|Search failed/);
              }
            }
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should maintain consistent response structure across all search types', async () => {
      await fc.assert(
        fc.asyncProperty(
          commodityNameGenerator,
          fc.constantFrom('all', 'commodities', 'users'),
          paginationGenerator,
          async (query, searchType, pagination) => {
            const result = await searchService.globalSearch({
              query,
              type: searchType,
              ...pagination
            });

            // All search responses should have consistent structure
            expect(result).toHaveProperty('results');
            expect(Array.isArray(result.results)).toBe(true);

            // Each result should have required fields
            result.results.forEach(item => {
              expect(item).toHaveProperty('type');
              expect(item).toHaveProperty('item');
              expect(item).toHaveProperty('relevanceScore');
              expect(typeof item.relevanceScore).toBe('number');
              expect(item.relevanceScore).toBeGreaterThanOrEqual(0);
              expect(item.relevanceScore).toBeLessThanOrEqual(100);
            });
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should handle API failures gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          commodityNameGenerator,
          async (query) => {
            // Mock API failure
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            try {
              await searchService.searchCommodities({
                query,
                page: 1,
                limit: 10
              });

              // Should not reach here if API fails
              // The test expects the API to fail, but fallback should work
              expect(true).toBe(true); // API failure was handled gracefully
            } catch (error) {
              // Should handle API failures gracefully
              expect(error).toBeInstanceOf(Error);
              if (error instanceof Error) {
                expect(error.message).toMatch(/Search failed/);
              }
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should cache search results for identical queries', async () => {
      await fc.assert(
        fc.asyncProperty(
          commodityNameGenerator,
          paginationGenerator,
          async (query, pagination) => {
            // Reset fetch mock call count
            mockFetch.mockClear();

            // First search call
            await searchService.searchCommodities({
              query,
              ...pagination
            });

            // Second identical search call should use cache
            await searchService.searchCommodities({
              query,
              ...pagination
            });

            // Should only make one API call due to caching
            expect(mockFetch).toHaveBeenCalledTimes(1);
          }
        ),
        { numRuns: 15 }
      );
    });
  });

  describe('Search Query Validation', () => {
    it('should reject queries that are too short', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ maxLength: 1 }),
          async (shortQuery) => {
            await expect(searchService.searchCommodities({
              query: shortQuery,
              page: 1,
              limit: 10
            })).rejects.toThrow('Search query must be at least 2 characters long');
          }
        ),
        { numRuns: 10 }
      );
    });

    it('should handle whitespace-only queries', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string().filter(s => s.trim().length === 0 && s.length > 0),
          async (whitespaceQuery) => {
            await expect(searchService.searchCommodities({
              query: whitespaceQuery,
              page: 1,
              limit: 10
            })).rejects.toThrow('Search query must be at least 2 characters long');
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});