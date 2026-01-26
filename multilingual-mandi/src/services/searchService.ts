/**
 * Search Service for commodity and vendor discovery
 * Supports Requirements: 7.1, 7.2, 7.3 - Search functionality with multilingual support
 */

import {
  Commodity,
  CommoditySearchFilter,
  CommoditySearchResult
} from '../types/commodity';
import { User, UserProfile } from '../types/user';
import { PriceData, GeoLocation } from '../types/price';
import {
  SearchCommoditiesRequest,
  SearchCommoditiesResponse,
  GlobalSearchRequest,
  GlobalSearchResponse,
  ApiResponse,
  PaginationRequest
} from '../types/api';
import { translationService } from './translationService';
import { priceService } from './priceService';
import { userService } from './userService';

const API_BASE_URL = (typeof window !== 'undefined' && (window as any).ENV?.VITE_API_BASE_URL) || 'http://localhost:3000/api';

// Cache configuration
const SEARCH_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_SEARCH_RESULTS = 50;
const MIN_QUERY_LENGTH = 2;

interface CachedSearchResult {
  results: any[];
  timestamp: Date;
  query: string;
  expiresAt: Date;
}

interface SearchFilters {
  location?: GeoLocation;
  priceRange?: { min: number; max: number };
  category?: string;
  userType?: 'vendor' | 'buyer' | 'both';
  verified?: boolean;
  rating?: { min: number; max?: number };
}

interface SearchResult<T = any> {
  id: string;
  item: T;
  type: 'commodity' | 'user' | 'deal' | 'message';
  relevanceScore: number;
  matchedFields: string[];
}

class SearchService {
  private cache = new Map<string, CachedSearchResult>();
  private isInitialized = false;

  constructor() {
    this.startCacheCleanup();
  }

  /**
   * Initialize the search service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load cached data from localStorage if available
      this.loadCacheFromStorage();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize search service:', error);
      this.isInitialized = true; // Continue without cache
    }
  }

  /**
   * Search commodities with multilingual support
   * Requirement 7.1: Return results within 3 seconds
   * Requirement 7.2: Support search in multiple Indian languages
   */
  async searchCommodities(request: SearchCommoditiesRequest): Promise<SearchCommoditiesResponse> {
    await this.initialize();

    // Validate query length
    if (!request.query || request.query.trim().length < MIN_QUERY_LENGTH) {
      throw new Error(`Search query must be at least ${MIN_QUERY_LENGTH} characters long`);
    }

    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('commodities', request);
    const cached = this.cache.get(cacheKey);

    // Return cached results if valid
    if (cached && cached.expiresAt > new Date()) {
      return cached.results as unknown as SearchCommoditiesResponse;
    }

    try {
      // Translate query if needed
      let searchQuery = request.query.trim();
      let translatedQueries: string[] = [searchQuery];

      if (request.language && request.language !== 'en') {
        try {
          const translationResult = await translationService.translateText({
            text: searchQuery,
            sourceLanguage: request.language as any,
            targetLanguage: 'en',
            context: 'mandi'
          });

          if (translationResult.confidence > 0.7) {
            translatedQueries.push(translationResult.translatedText);
          }
        } catch (translationError) {
          console.warn('Translation failed for search query:', translationError);
        }
      }

      // Search for commodities
      const commodityResults = await this.performCommoditySearch(translatedQueries, request);

      // Get price data for results
      const enrichedResults = await this.enrichCommodityResults(commodityResults);

      // Apply filters
      const filteredResults = this.applyCommodityFilters(enrichedResults, request);

      // Sort by relevance
      const sortedResults = this.sortCommodityResults(filteredResults, searchQuery);

      // Apply pagination
      const paginatedResults = this.paginateResults(sortedResults, request);

      // Generate suggestions and filters
      const suggestions = await this.generateSearchSuggestions(searchQuery, request.language);
      const availableFilters = this.generateAvailableFilters(enrichedResults);

      const response: SearchCommoditiesResponse = {
        results: paginatedResults,
        total: sortedResults.length,
        suggestions,
        filters: availableFilters
      };

      // Cache results
      this.cacheResults(cacheKey, response);

      // Check performance requirement (3 seconds)
      const duration = Date.now() - startTime;
      if (duration > 3000) {
        console.warn(`Search took ${duration}ms, exceeding 3-second requirement`);
      }

      return response;
    } catch (error) {
      console.error('Commodity search failed:', error);
      throw new Error(`Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search vendors/users with location-based filtering
   * Requirement 7.3: Display vendor ratings, distance, and current prices
   */
  async searchVendors(query: {
    searchQuery?: string;
    userType?: 'vendor' | 'buyer' | 'both';
    location?: GeoLocation;
    specializations?: string[];
    verified?: boolean;
    rating?: { min: number; max?: number };
    language?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    users: Array<UserProfile & {
      distance?: number;
      relevanceScore: number;
      matchedFields: string[];
      averagePrice?: number;
      commodityCount?: number;
    }>;
    total: number;
  }> {
    await this.initialize();

    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('vendors', query);
    const cached = this.cache.get(cacheKey);

    // Return cached results if valid
    if (cached && cached.expiresAt > new Date()) {
      return cached.results as any;
    }

    try {
      // Translate search query if needed
      let searchQueries: string[] = [];
      if (query.searchQuery) {
        searchQueries.push(query.searchQuery);

        if (query.language && query.language !== 'en') {
          try {
            const translationResult = await translationService.translateText({
              text: query.searchQuery,
              sourceLanguage: query.language as any,
              targetLanguage: 'en',
              context: 'general'
            });

            if (translationResult.confidence > 0.7) {
              searchQueries.push(translationResult.translatedText);
            }
          } catch (translationError) {
            console.warn('Translation failed for vendor search:', translationError);
          }
        }
      }

      // Search users
      const users = await userService.searchUsers({
        name: searchQueries.length > 0 ? searchQueries.join(' ') : undefined,
        userType: query.userType,
        location: query.location,
        verified: query.verified,
        limit: query.limit || 20,
        offset: query.offset || 0
      });

      // Enrich results with additional data
      const enrichedUsers = await Promise.all(
        users.map(async (user) => {
          const enrichedUser = user as UserProfile & {
            distance?: number;
            relevanceScore: number;
            matchedFields: string[];
            averagePrice?: number;
            commodityCount?: number;
          };

          // Calculate relevance score
          enrichedUser.relevanceScore = this.calculateUserRelevanceScore(user, searchQueries);
          enrichedUser.matchedFields = this.getMatchedUserFields(user, searchQueries);

          // Calculate distance if location provided
          if (query.location && user.location) {
            enrichedUser.distance = this.calculateDistance(
              query.location,
              {
                latitude: user.location.latitude,
                longitude: user.location.longitude
              }
            );
          }

          // Get average prices and commodity count for vendors
          if (user.userType === 'vendor' || user.userType === 'both') {
            try {
              const vendorPrices = await priceService.queryPrices({
                commodity: 'wheat', // Default commodity for demo
                dateRange: {
                  start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                  end: new Date()
                },
                limit: 100
              });

              if (vendorPrices.length > 0) {
                enrichedUser.averagePrice = Math.round(
                  vendorPrices.reduce((sum, price) => sum + price.price, 0) / vendorPrices.length
                );
                enrichedUser.commodityCount = new Set(vendorPrices.map(p => p.commodityId)).size;
              }
            } catch (error) {
              console.warn(`Failed to get price data for vendor ${user.userId}:`, error);
            }
          }

          return enrichedUser;
        })
      );

      // Apply additional filters
      let filteredUsers = enrichedUsers;

      if (query.rating) {
        filteredUsers = filteredUsers.filter(user => {
          const rating = user.reputation?.overall || 0;
          return rating >= query.rating!.min &&
            (query.rating!.max === undefined || rating <= query.rating!.max);
        });
      }

      if (query.specializations && query.specializations.length > 0) {
        filteredUsers = filteredUsers.filter(user => {
          const userSpecs = user.businessInfo?.specializations || [];
          return query.specializations!.some(spec =>
            userSpecs.some((userSpec: string) =>
              userSpec.toLowerCase().includes(spec.toLowerCase())
            )
          );
        });
      }

      // Sort by relevance and distance
      filteredUsers.sort((a, b) => {
        // Primary sort by relevance score
        if (a.relevanceScore !== b.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }

        // Secondary sort by distance (if available)
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }

        // Tertiary sort by reputation
        const aRating = a.reputation?.overall || 0;
        const bRating = b.reputation?.overall || 0;
        return bRating - aRating;
      });

      const result = {
        users: filteredUsers,
        total: filteredUsers.length
      };

      // Cache results
      this.cacheResults(cacheKey, result);

      // Check performance requirement
      const duration = Date.now() - startTime;
      if (duration > 3000) {
        console.warn(`Vendor search took ${duration}ms, exceeding 3-second requirement`);
      }

      return result;
    } catch (error) {
      console.error('Vendor search failed:', error);
      throw new Error(`Vendor search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Global search across all content types
   * Requirement 7.5: Suggest similar commodities or alternative vendors when no exact matches
   */
  async globalSearch(request: GlobalSearchRequest): Promise<GlobalSearchResponse> {
    await this.initialize();

    if (!request.query || request.query.trim().length < MIN_QUERY_LENGTH) {
      throw new Error(`Search query must be at least ${MIN_QUERY_LENGTH} characters long`);
    }

    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('global', request);
    const cached = this.cache.get(cacheKey);

    // Return cached results if valid
    if (cached && cached.expiresAt > new Date()) {
      return cached.results as unknown as GlobalSearchResponse;
    }

    try {
      const searchPromises: Promise<any>[] = [];

      // Search commodities if requested
      if (!request.type || request.type === 'all' || request.type === 'commodities') {
        searchPromises.push(
          this.searchCommodities({
            query: request.query,
            language: request.language,
            limit: request.limit || 10,
            page: 1
          }).then(result => ({
            type: 'commodities',
            results: result.results.map(item => ({
              type: 'commodity' as const,
              item,
              relevanceScore: item.relevanceScore
            }))
          })).catch(() => ({ type: 'commodities', results: [] }))
        );
      }

      // Search users if requested
      if (!request.type || request.type === 'all' || request.type === 'users') {
        searchPromises.push(
          this.searchVendors({
            searchQuery: request.query,
            language: request.language,
            limit: request.limit || 10
          }).then(result => ({
            type: 'users',
            results: result.users.map(item => ({
              type: 'user' as const,
              item,
              relevanceScore: item.relevanceScore
            }))
          })).catch(() => ({ type: 'users', results: [] }))
        );
      }

      // Wait for all searches to complete
      const searchResults = await Promise.all(searchPromises);

      // Combine and sort results
      const allResults: SearchResult[] = [];
      let totalResults = 0;

      for (const searchResult of searchResults) {
        allResults.push(...searchResult.results);
        totalResults += searchResult.results.length;
      }

      // Sort by relevance score
      allResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

      // Apply pagination
      const startIndex = ((request.page || 1) - 1) * (request.limit || 20);
      const endIndex = startIndex + (request.limit || 20);
      const paginatedResults = allResults.slice(startIndex, endIndex);

      // Generate suggestions if no results found
      let suggestions: string[] = [];
      if (allResults.length === 0) {
        suggestions = await this.generateSearchSuggestions(request.query, request.language);
      }

      const response: GlobalSearchResponse = {
        results: paginatedResults,
        totalResults: totalResults,
        suggestions
      };

      // Cache results
      this.cacheResults(cacheKey, response);

      return response;
    } catch (error) {
      console.error('Global search failed:', error);
      throw new Error(`Global search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get search suggestions based on query
   */
  async getSearchSuggestions(
    query: string,
    language?: string,
    limit: number = 5
  ): Promise<string[]> {
    await this.initialize();

    if (!query || query.trim().length < MIN_QUERY_LENGTH) {
      return [];
    }

    try {
      // Get suggestions from backend
      const response = await this.makeRequest<{ suggestions: string[] }>('/search/suggestions', {
        method: 'POST',
        body: JSON.stringify({ query, language, limit })
      });

      return response.data?.suggestions || [];
    } catch (error) {
      console.warn('Failed to get search suggestions:', error);
      return this.generateFallbackSuggestions(query);
    }
  }

  // Private helper methods

  private async performCommoditySearch(
    queries: string[],
    request: SearchCommoditiesRequest
  ): Promise<CommoditySearchResult[]> {
    try {
      const response = await this.makeRequest<SearchCommoditiesResponse>('/search/commodities', {
        method: 'POST',
        body: JSON.stringify({
          ...request,
          queries // Send all query variations
        })
      });

      return response.data?.results || [];
    } catch (error) {
      console.warn('Backend commodity search failed, using fallback:', error);
      return this.performFallbackCommoditySearch(queries[0], request);
    }
  }

  private async performFallbackCommoditySearch(
    query: string,
    request: SearchCommoditiesRequest
  ): Promise<CommoditySearchResult[]> {
    // Fallback search using mock data for demo purposes
    const mockCommodities: Partial<Commodity>[] = [
      {
        id: 'wheat-001',
        name: 'Wheat',
        category: 'Grains',
        subcategory: 'Cereals',
        standardUnit: 'quintal',
        alternativeUnits: ['kg', 'ton'],
        seasonality: { peakMonths: [4, 5, 6], offSeasonMonths: [10, 11, 12] },
        qualityGrades: [
          { grade: 'Grade A', description: 'Premium quality', priceMultiplier: 1.2 },
          { grade: 'Grade B', description: 'Good quality', priceMultiplier: 1.0 },
          { grade: 'Grade C', description: 'Standard quality', priceMultiplier: 0.8 }
        ],
        storageRequirements: ['Dry storage', 'Pest control'],
        perishable: false,
        translations: {
          'hi': { name: 'गेहूं', aliases: ['गेहूँ'] },
          'te': { name: 'గోధుమ', aliases: [] },
          'ta': { name: 'கோதుமை', aliases: [] }
        },
        metadata: {
          commonNames: ['wheat', 'gehun'],
          scientificName: 'Triticum aestivum'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'rice-001',
        name: 'Rice',
        category: 'Grains',
        subcategory: 'Cereals',
        standardUnit: 'quintal',
        alternativeUnits: ['kg', 'ton'],
        seasonality: { peakMonths: [10, 11, 12], offSeasonMonths: [4, 5, 6] },
        qualityGrades: [
          { grade: 'Basmati', description: 'Premium basmati rice', priceMultiplier: 1.5 },
          { grade: 'Non-Basmati', description: 'Regular rice', priceMultiplier: 1.0 },
          { grade: 'Broken', description: 'Broken rice', priceMultiplier: 0.6 }
        ],
        storageRequirements: ['Dry storage', 'Temperature control'],
        translations: {
          'hi': { name: 'चावल', aliases: ['धान'] },
          'te': { name: 'బియ్యం', aliases: [] },
          'ta': { name: 'அரிசி', aliases: [] }
        }
      }
    ];

    // Simple text matching for demo
    const matchedCommodities = mockCommodities.filter(commodity => {
      const searchLower = query.toLowerCase();
      return commodity.name?.toLowerCase().includes(searchLower) ||
        commodity.category?.toLowerCase().includes(searchLower) ||
        Object.values(commodity.translations || {}).some(trans =>
          trans.name.toLowerCase().includes(searchLower) ||
          trans.aliases.some(alias => alias.toLowerCase().includes(searchLower))
        );
    });

    return matchedCommodities.map(commodity => ({
      commodity: commodity as Commodity,
      relevanceScore: this.calculateCommodityRelevanceScore(commodity as Commodity, query),
      availableVendors: Math.floor(Math.random() * 50) + 10,
      averagePrice: Math.floor(Math.random() * 3000) + 1500,
      priceRange: {
        min: Math.floor(Math.random() * 1000) + 1000,
        max: Math.floor(Math.random() * 1000) + 2500
      },
      nearestLocation: 'Delhi Azadpur Mandi',
      distance: Math.floor(Math.random() * 100) + 5
    }));
  }

  private async enrichCommodityResults(
    results: CommoditySearchResult[]
  ): Promise<CommoditySearchResult[]> {
    // Enrich with real-time price data
    return Promise.all(
      results.map(async (result) => {
        try {
          const priceRange = await priceService.getPriceRange(result.commodity.id);
          return {
            ...result,
            averagePrice: priceRange.average,
            priceRange: {
              min: priceRange.min,
              max: priceRange.max
            }
          };
        } catch (error) {
          console.warn(`Failed to get price data for ${result.commodity.id}:`, error);
          return result;
        }
      })
    );
  }

  private applyCommodityFilters(
    results: CommoditySearchResult[],
    filters: SearchCommoditiesRequest
  ): CommoditySearchResult[] {
    let filtered = results;

    if (filters.category) {
      filtered = filtered.filter(result =>
        result.commodity.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }

    if (filters.subcategory) {
      filtered = filtered.filter(result =>
        result.commodity.subcategory.toLowerCase() === filters.subcategory!.toLowerCase()
      );
    }

    if (filters.priceRange) {
      filtered = filtered.filter(result =>
        result.averagePrice >= filters.priceRange!.min &&
        result.averagePrice <= filters.priceRange!.max
      );
    }

    if (filters.location) {
      filtered = filtered.filter(result =>
        !result.distance || result.distance <= (filters.location!.radius || 50)
      );
    }

    return filtered;
  }

  private sortCommodityResults(
    results: CommoditySearchResult[],
    query: string
  ): CommoditySearchResult[] {
    return results.sort((a, b) => {
      // Primary sort by relevance score
      if (a.relevanceScore !== b.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }

      // Secondary sort by available vendors
      if (a.availableVendors !== b.availableVendors) {
        return b.availableVendors - a.availableVendors;
      }

      // Tertiary sort by distance (if available)
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }

      return 0;
    });
  }

  private paginateResults<T>(
    results: T[],
    pagination: PaginationRequest
  ): T[] {
    const page = pagination.page || 1;
    const limit = Math.min(pagination.limit || 20, MAX_SEARCH_RESULTS);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return results.slice(startIndex, endIndex);
  }

  private async generateSearchSuggestions(
    query: string,
    language?: string
  ): Promise<string[]> {
    // Generate suggestions based on common commodities and search patterns
    const commonCommodities = [
      'wheat', 'rice', 'onion', 'potato', 'tomato', 'garlic', 'ginger',
      'turmeric', 'coriander', 'cumin', 'mustard', 'sesame', 'groundnut',
      'soybean', 'cotton', 'sugarcane', 'maize', 'barley', 'bajra', 'jowar'
    ];

    const suggestions = commonCommodities
      .filter(commodity =>
        commodity.toLowerCase().includes(query.toLowerCase()) ||
        query.toLowerCase().includes(commodity.toLowerCase())
      )
      .slice(0, 5);

    // Translate suggestions if needed
    if (language && language !== 'en' && suggestions.length > 0) {
      try {
        const translatedSuggestions = await Promise.all(
          suggestions.map(async (suggestion) => {
            try {
              const result = await translationService.translateText({
                text: suggestion,
                sourceLanguage: 'en',
                targetLanguage: language as any,
                context: 'mandi'
              });
              return result.confidence > 0.7 ? result.translatedText : suggestion;
            } catch {
              return suggestion;
            }
          })
        );
        return translatedSuggestions;
      } catch (error) {
        console.warn('Failed to translate suggestions:', error);
      }
    }

    return suggestions;
  }

  private generateAvailableFilters(
    results: CommoditySearchResult[]
  ): SearchCommoditiesResponse['filters'] {
    const categories = [...new Set(results.map(r => r.commodity.category))];
    const locations = [...new Set(results.map(r => r.nearestLocation))];

    const prices = results.map(r => r.averagePrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const priceRanges = [
      { min: minPrice, max: Math.floor((minPrice + maxPrice) / 3) },
      { min: Math.floor((minPrice + maxPrice) / 3), max: Math.floor(2 * (minPrice + maxPrice) / 3) },
      { min: Math.floor(2 * (minPrice + maxPrice) / 3), max: maxPrice }
    ];

    return {
      categories,
      locations,
      priceRanges
    };
  }

  private calculateCommodityRelevanceScore(commodity: Commodity, query: string): number {
    let score = 0;
    const queryLower = query.toLowerCase();

    // Exact name match
    if (commodity.name.toLowerCase() === queryLower) {
      score += 100;
    } else if (commodity.name.toLowerCase().includes(queryLower)) {
      score += 80;
    }

    // Category match
    if (commodity.category.toLowerCase().includes(queryLower)) {
      score += 60;
    }

    // Subcategory match
    if (commodity.subcategory.toLowerCase().includes(queryLower)) {
      score += 40;
    }

    // Translation matches
    for (const translation of Object.values(commodity.translations)) {
      if (translation.name.toLowerCase() === queryLower) {
        score += 90;
      } else if (translation.name.toLowerCase().includes(queryLower)) {
        score += 70;
      }

      for (const alias of translation.aliases) {
        if (alias.toLowerCase() === queryLower) {
          score += 85;
        } else if (alias.toLowerCase().includes(queryLower)) {
          score += 65;
        }
      }
    }

    return Math.min(score, 100);
  }

  private calculateUserRelevanceScore(user: UserProfile, queries: string[]): number {
    let score = 0;

    for (const query of queries) {
      const queryLower = query.toLowerCase();

      // Name match
      if (user.name.toLowerCase().includes(queryLower)) {
        score += 80;
      }

      // Business name match
      if (user.businessInfo?.businessName?.toLowerCase().includes(queryLower)) {
        score += 70;
      }

      // Specializations match
      if (user.businessInfo?.specializations) {
        for (const spec of user.businessInfo.specializations) {
          if (spec.toLowerCase().includes(queryLower)) {
            score += 60;
          }
        }
      }

      // Location match
      if (user.location?.address?.toLowerCase().includes(queryLower)) {
        score += 40;
      }
    }

    // Boost score for verified users
    if (user.isVerified) {
      score += 20;
    }

    // Boost score based on reputation
    if (user.reputation?.overall) {
      score += user.reputation.overall * 5;
    }

    return Math.min(score, 100);
  }

  private getMatchedUserFields(user: UserProfile, queries: string[]): string[] {
    const matchedFields: string[] = [];

    for (const query of queries) {
      const queryLower = query.toLowerCase();

      if (user.name.toLowerCase().includes(queryLower)) {
        matchedFields.push('name');
      }

      if (user.businessInfo?.businessName?.toLowerCase().includes(queryLower)) {
        matchedFields.push('businessName');
      }

      if (user.businessInfo?.specializations?.some((spec: string) =>
        spec.toLowerCase().includes(queryLower)
      )) {
        matchedFields.push('specializations');
      }

      if (user.location?.address?.toLowerCase().includes(queryLower)) {
        matchedFields.push('location');
      }
    }

    return [...new Set(matchedFields)];
  }

  private calculateDistance(
    location1: { latitude: number; longitude: number },
    location2: { latitude: number; longitude: number }
  ): number {
    // Haversine formula for calculating distance between two points
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(location2.latitude - location1.latitude);
    const dLon = this.toRadians(location2.longitude - location1.longitude);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(location1.latitude)) *
      Math.cos(this.toRadians(location2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private generateFallbackSuggestions(query: string): string[] {
    const commonSuggestions = [
      'wheat', 'rice', 'onion', 'potato', 'tomato',
      'garlic', 'ginger', 'turmeric', 'coriander'
    ];

    return commonSuggestions
      .filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase()) ||
        query.toLowerCase().includes(suggestion.toLowerCase())
      )
      .slice(0, 5);
  }

  private generateCacheKey(type: string, request: any): string {
    return `${type}_${JSON.stringify(request)}`;
  }

  private cacheResults(key: string, results: any): void {
    const cached: CachedSearchResult = {
      results,
      timestamp: new Date(),
      query: key,
      expiresAt: new Date(Date.now() + SEARCH_CACHE_DURATION)
    };

    this.cache.set(key, cached);
    this.saveCacheToStorage();
  }

  private loadCacheFromStorage(): void {
    try {
      const stored = localStorage.getItem('searchServiceCache');
      if (stored) {
        const parsed = JSON.parse(stored);
        for (const [key, value] of Object.entries(parsed)) {
          const cached = value as any;
          cached.timestamp = new Date(cached.timestamp);
          cached.expiresAt = new Date(cached.expiresAt);

          if (cached.expiresAt > new Date()) {
            this.cache.set(key, cached);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load search cache from storage:', error);
    }
  }

  private saveCacheToStorage(): void {
    try {
      const cacheObject = Object.fromEntries(this.cache);
      localStorage.setItem('searchServiceCache', JSON.stringify(cacheObject));
    } catch (error) {
      console.error('Failed to save search cache to storage:', error);
    }
  }

  private startCacheCleanup(): void {
    setInterval(() => {
      const now = new Date();
      for (const [key, cached] of this.cache.entries()) {
        if (cached.expiresAt <= now) {
          this.cache.delete(key);
        }
      }
      this.saveCacheToStorage();
    }, 2 * 60 * 1000); // Clean up every 2 minutes
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    const config: RequestInit = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('Search API request failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const searchService = new SearchService();
export default searchService;