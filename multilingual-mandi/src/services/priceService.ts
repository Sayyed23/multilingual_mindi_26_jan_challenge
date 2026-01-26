/**
 * Price Data Service for market intelligence and price discovery
 * Supports Requirements: 2.1, 2.3, 2.4 - Real-time price discovery with AGMARKNET integration
 */

import {
  PriceQuery,
  PriceData,
  PriceEntry,
  PriceRange,
  PriceSubmission,
  PriceVerification,
  PriceTrend,
  PriceAlert,
  MarketContext,
  PriceSource,
  MarketTrend,
  DemandLevel,
  PriceLocation,
  GeoLocation
} from '../types/price';
import { Commodity } from '../types/commodity';
import { ApiResponse } from '../types/api';

const API_BASE_URL = (typeof window !== 'undefined' && (window as any).ENV?.VITE_API_BASE_URL) || 'http://localhost:3000/api';
const AGMARKNET_API_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

// Cache configuration
const PRICE_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const PRICE_DATA_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours
const MIN_CONFIDENCE_THRESHOLD = 0.6;

interface CachedPriceData {
  data: PriceData[];
  timestamp: Date;
  query: string;
  expiresAt: Date;
}

interface AGMARKNETResponse {
  records: Array<{
    state: string;
    district: string;
    market: string;
    commodity: string;
    variety: string;
    arrival_date: string;
    min_price: string;
    max_price: string;
    modal_price: string;
  }>;
  total: number;
  count: number;
  offset: number;
}

class PriceService {
  private cache = new Map<string, CachedPriceData>();
  private priceAlerts = new Map<string, PriceAlert[]>();
  private isInitialized = false;

  constructor() {
    this.startCacheCleanup();
  }

  /**
   * Initialize the price service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Load cached data from localStorage if available
      this.loadCacheFromStorage();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize price service:', error);
      this.isInitialized = true; // Continue without cache
    }
  }

  /**
   * Query price data with filtering and aggregation
   * Requirement 2.1: Display current market prices from at least 100 different mandis
   */
  async queryPrices(query: PriceQuery): Promise<PriceData[]> {
    await this.initialize();
    
    const cacheKey = this.generateCacheKey(query);
    const cached = this.cache.get(cacheKey);
    
    // Return cached data if valid
    if (cached && cached.expiresAt > new Date()) {
      return cached.data;
    }

    try {
      // Fetch from multiple sources
      const [agmarknetData, vendorData, predictedData] = await Promise.allSettled([
        this.fetchFromAGMARKNET(query),
        this.fetchVendorSubmissions(query),
        this.fetchPredictedPrices(query)
      ]);

      const allPriceData: PriceData[] = [];

      // Process AGMARKNET data
      if (agmarknetData.status === 'fulfilled') {
        allPriceData.push(...agmarknetData.value);
      }

      // Process vendor submissions
      if (vendorData.status === 'fulfilled') {
        allPriceData.push(...vendorData.value);
      }

      // Process predicted prices
      if (predictedData.status === 'fulfilled') {
        allPriceData.push(...predictedData.value);
      }

      // Apply filters
      const filteredData = this.applyFilters(allPriceData, query);

      // Sort by relevance and confidence
      const sortedData = this.sortByRelevance(filteredData, query);

      // Cache the results
      this.cacheResults(cacheKey, sortedData, query);

      return sortedData;
    } catch (error) {
      console.error('Failed to query prices:', error);
      throw new Error(`Price query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get price range and statistics for a commodity
   * Requirement 2.2: Display fair price range with confidence intervals
   */
  async getPriceRange(commodityId: string, location?: GeoLocation): Promise<PriceRange> {
    await this.initialize();

    const query: PriceQuery = {
      commodity: commodityId,
      location,
      dateRange: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        end: new Date()
      },
      minConfidence: MIN_CONFIDENCE_THRESHOLD
    };

    const priceData = await this.queryPrices(query);
    
    if (priceData.length === 0) {
      throw new Error('No price data available for the specified commodity and location');
    }

    const prices = priceData.map(data => data.price);
    const sortedPrices = prices.sort((a, b) => a - b);
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const median = this.calculateMedian(sortedPrices);
    const standardDeviation = this.calculateStandardDeviation(prices, average);

    // Enhanced fair price range calculation with multiple methods
    const fairPriceRange = this.calculateFairPriceRange(prices, average, standardDeviation, priceData);
    
    // Calculate confidence intervals (95% confidence level)
    const confidenceInterval = this.calculateConfidenceInterval(prices, average, standardDeviation);

    return {
      min,
      max,
      average: Math.round(average),
      median: Math.round(median),
      standardDeviation: Math.round(standardDeviation),
      fairPriceRange: {
        lower: Math.round(fairPriceRange.lower),
        upper: Math.round(fairPriceRange.upper),
        confidence: fairPriceRange.confidence
      },
      confidenceInterval: {
        lower: Math.round(confidenceInterval.lower),
        upper: Math.round(confidenceInterval.upper),
        level: 0.95
      },
      sampleSize: priceData.length,
      lastUpdated: new Date()
    };
  }

  /**
   * Validate vendor-submitted price against market trends
   * Requirement 2.5: Validate vendor-submitted prices against market trends
   */
  async validatePrice(submission: PriceSubmission): Promise<{
    isValid: boolean;
    confidence: number;
    deviation: { amount: number; percentage: number };
    recommendation: string;
    marketContext: MarketContext;
  }> {
    await this.initialize();

    try {
      // Get current market context
      const locationCoords = {
        latitude: submission.location.coordinates.latitude,
        longitude: submission.location.coordinates.longitude
      };
      const marketContext = await this.getMarketContext(submission.commodityId, locationCoords);
      
      // Calculate deviation from market average
      const deviation = {
        amount: submission.price - marketContext.currentMarketPrice,
        percentage: ((submission.price - marketContext.currentMarketPrice) / marketContext.currentMarketPrice) * 100
      };

      // Determine if price is valid (within reasonable bounds)
      const isWithinFairRange = submission.price >= marketContext.priceRange.fairPriceRange.lower && 
                               submission.price <= marketContext.priceRange.fairPriceRange.upper;
      
      const isWithinExtendedRange = Math.abs(deviation.percentage) <= 50; // Allow up to 50% deviation
      
      const isValid = isWithinFairRange || (isWithinExtendedRange && this.hasValidJustification(submission));

      // Calculate confidence based on various factors
      let confidence = 0.5; // Base confidence
      
      if (isWithinFairRange) confidence += 0.3;
      if (Math.abs(deviation.percentage) <= 10) confidence += 0.2;
      if (submission.metadata?.weatherConditions) confidence += 0.1;
      if (submission.metadata?.marketConditions) confidence += 0.1;
      
      confidence = Math.min(0.99, confidence);

      // Generate recommendation
      let recommendation = '';
      if (!isValid) {
        if (deviation.percentage > 50) {
          recommendation = 'Price is significantly above market rate. Please verify or provide justification.';
        } else if (deviation.percentage < -50) {
          recommendation = 'Price is significantly below market rate. Please verify quality and conditions.';
        }
      } else if (Math.abs(deviation.percentage) > 20) {
        recommendation = 'Price deviates from market average. Consider market conditions.';
      } else {
        recommendation = 'Price is within acceptable market range.';
      }

      return {
        isValid,
        confidence,
        deviation,
        recommendation,
        marketContext
      };
    } catch (error) {
      console.error('Price validation failed:', error);
      throw new Error(`Price validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check data freshness and flag stale data
   * Requirement 2.3: Clearly indicate when price data is older than 24 hours
   */
  checkDataFreshness(priceData: PriceData[]): PriceData[] {
    const now = new Date();
    const maxAge = PRICE_DATA_MAX_AGE;

    return priceData.map(data => {
      const age = now.getTime() - data.timestamp.getTime();
      const isStale = age > maxAge;
      
      return {
        ...data,
        metadata: {
          ...data.metadata,
          isStale,
          ageInHours: Math.round(age / (60 * 60 * 1000)),
          freshnessIndicator: isStale ? 'stale' : age > maxAge / 2 ? 'aging' : 'fresh'
        }
      };
    });
  }

  /**
   * Verify price quote against market rates
   * Requirement 6.1, 6.2: Compare quoted prices against market rates and alert for deviations
   */
  async verifyPriceQuote(
    commodityId: string,
    quotedPrice: number,
    location?: GeoLocation
  ): Promise<PriceVerification> {
    await this.initialize();

    try {
      // Get current market data
      const marketContext = await this.getMarketContext(commodityId, location);
      const comparableMarkets = await this.getComparableMarkets(commodityId, location, 5);

      const deviation = {
        amount: quotedPrice - marketContext.currentMarketPrice,
        percentage: ((quotedPrice - marketContext.currentMarketPrice) / marketContext.currentMarketPrice) * 100
      };

      // Determine verdict
      let verdict: PriceVerification['verdict'];
      if (Math.abs(deviation.percentage) <= 5) {
        verdict = 'fair';
      } else if (deviation.percentage > 20) {
        verdict = 'very_high';
      } else if (deviation.percentage > 10) {
        verdict = 'high';
      } else if (deviation.percentage < -20) {
        verdict = 'very_low';
      } else {
        verdict = 'low';
      }

      // Calculate confidence
      const confidence = this.calculateVerificationConfidence(marketContext, comparableMarkets.length);

      // Generate negotiation suggestion
      const negotiationSuggestion = this.generateNegotiationSuggestion(verdict, deviation, marketContext);

      return {
        quotedPrice,
        marketPrice: marketContext.currentMarketPrice,
        deviation,
        verdict,
        confidence,
        comparableMarkets,
        negotiationSuggestion,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Price verification failed:', error);
      throw new Error(`Price verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get historical price trends
   * Requirement 6.4: Provide historical price trends for the past 30 days
   */
  async getPriceTrend(
    commodityId: string,
    period: '24h' | '7d' | '30d' | '90d' | '1y' = '30d',
    location?: GeoLocation
  ): Promise<PriceTrend> {
    await this.initialize();

    const periodDays = {
      '24h': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    };

    const days = periodDays[period];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const endDate = new Date();

    const query: PriceQuery = {
      commodity: commodityId,
      location,
      dateRange: { start: startDate, end: endDate },
      minConfidence: MIN_CONFIDENCE_THRESHOLD
    };

    const priceData = await this.queryPrices(query);
    
    // Group data by date and calculate daily averages
    const dailyPrices = this.groupPricesByDate(priceData);
    
    // Calculate trend
    const trend = this.calculateTrend(dailyPrices);
    const volatility = this.calculateVolatility(dailyPrices);

    // Generate forecast for short-term periods
    let forecast;
    if (period === '7d' || period === '30d') {
      forecast = await this.generatePriceForecast(commodityId, dailyPrices);
    }

    return {
      commodityId,
      period,
      dataPoints: dailyPrices,
      trend,
      volatility,
      seasonalPattern: await this.detectSeasonalPattern(commodityId),
      forecast
    };
  }

  /**
   * Submit price data from vendors
   */
  async submitPrice(submission: PriceSubmission): Promise<{ success: boolean; validationResult: any }> {
    await this.initialize();

    try {
      // Validate the submission
      const validationResult = await this.validatePrice(submission);
      
      if (!validationResult.isValid) {
        return {
          success: false,
          validationResult
        };
      }

      // Submit to backend API
      const response = await this.makeRequest<{ success: boolean }>('/prices/submit', {
        method: 'POST',
        body: JSON.stringify(submission)
      });

      // Clear relevant cache entries
      this.clearCacheForCommodity(submission.commodityId);

      return {
        success: response.data?.success || false,
        validationResult
      };
    } catch (error) {
      console.error('Price submission failed:', error);
      throw new Error(`Price submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get market context for a commodity
   */
  async getMarketContext(
    commodityId: string,
    location?: GeoLocation
  ): Promise<MarketContext> {
    await this.initialize();

    const [priceRange, recentPrices, nearbyMarkets] = await Promise.all([
      this.getPriceRange(commodityId, location),
      this.queryPrices({
        commodity: commodityId,
        location,
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          end: new Date()
        }
      }),
      this.getNearbyMarkets(location)
    ]);

    // Calculate demand and supply levels
    const demandLevel = this.calculateDemandLevel(recentPrices);
    const supplyLevel = this.calculateSupplyLevel(recentPrices);
    const marketVolatility = this.calculateVolatility(recentPrices.map(p => ({ date: p.timestamp, price: p.price })));

    // Get historical averages
    const historicalAverage = await this.getHistoricalAverages(commodityId, location);

    return {
      currentMarketPrice: priceRange.average,
      priceRange,
      seasonalTrend: await this.getSeasonalTrend(commodityId),
      demandLevel,
      supplyLevel,
      marketVolatility,
      competitorCount: nearbyMarkets.length,
      nearbyMarkets,
      historicalAverage
    };
  }

  // Private helper methods

  /**
   * Enhanced fair price range calculation using multiple statistical methods
   */
  private calculateFairPriceRange(
    prices: number[], 
    average: number, 
    standardDeviation: number, 
    priceData: PriceData[]
  ): { lower: number; upper: number; confidence: number } {
    // Method 1: Interquartile Range (IQR) method - more robust to outliers
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const q1Index = Math.floor(sortedPrices.length * 0.25);
    const q3Index = Math.floor(sortedPrices.length * 0.75);
    const q1 = sortedPrices[q1Index];
    const q3 = sortedPrices[q3Index];
    const iqr = q3 - q1;
    
    // Method 2: Standard deviation method
    const stdLower = average - standardDeviation;
    const stdUpper = average + standardDeviation;
    
    // Method 3: Confidence-weighted method based on data sources
    const weightedPrices = this.calculateWeightedPrices(priceData);
    const weightedAverage = weightedPrices.reduce((sum, wp) => sum + wp.price * wp.weight, 0) / 
                           weightedPrices.reduce((sum, wp) => sum + wp.weight, 0);
    
    // Combine methods for robust fair price range
    const iqrLower = q1 - 0.5 * iqr;
    const iqrUpper = q3 + 0.5 * iqr;
    
    // Take the most conservative (narrower) range for fair pricing
    const lower = Math.max(iqrLower, stdLower, Math.min(...prices));
    const upper = Math.min(iqrUpper, stdUpper, Math.max(...prices));
    
    // Calculate confidence based on data quality and consistency
    const confidence = this.calculateRangeConfidence(priceData);
    
    return { lower, upper, confidence };
  }

  /**
   * Calculate confidence interval for price estimates
   */
  private calculateConfidenceInterval(
    prices: number[], 
    mean: number, 
    standardDeviation: number, 
    confidenceLevel: number = 0.95
  ): { lower: number; upper: number } {
    const n = prices.length;
    const standardError = standardDeviation / Math.sqrt(n);
    
    // Use t-distribution for small samples, normal distribution for large samples
    let criticalValue: number;
    if (n < 30) {
      // Approximate t-value for 95% confidence (degrees of freedom = n-1)
      const tValues: { [key: number]: number } = {
        1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
        10: 2.228, 15: 2.131, 20: 2.086, 25: 2.060, 29: 2.045
      };
      const df = n - 1;
      criticalValue = tValues[df] || tValues[Math.min(...Object.keys(tValues).map(Number).filter(k => k <= df))] || 2.045;
    } else {
      // Z-value for 95% confidence
      criticalValue = 1.96;
    }
    
    const marginOfError = criticalValue * standardError;
    
    return {
      lower: mean - marginOfError,
      upper: mean + marginOfError
    };
  }

  /**
   * Calculate weighted prices based on data source reliability and freshness
   */
  private calculateWeightedPrices(priceData: PriceData[]): Array<{ price: number; weight: number }> {
    return priceData.map(data => {
      let weight = 1.0;
      
      // Weight by source reliability
      const sourceWeights = {
        'agmarknet': 1.0,
        'vendor_submission': 0.8,
        'predicted': 0.6,
        'manual': 0.7
      };
      weight *= sourceWeights[data.source] || 0.5;
      
      // Weight by confidence
      weight *= data.confidence;
      
      // Weight by freshness (reduce weight for older data)
      const ageHours = (Date.now() - data.timestamp.getTime()) / (1000 * 60 * 60);
      const freshnessWeight = Math.max(0.1, 1 - (ageHours / 48)); // Decay over 48 hours
      weight *= freshnessWeight;
      
      return { price: data.price, weight };
    });
  }

  /**
   * Enhanced price trend analysis with multiple indicators
   */
  async getAdvancedPriceTrend(
    commodityId: string,
    period: '24h' | '7d' | '30d' | '90d' | '1y' = '30d',
    location?: GeoLocation
  ): Promise<PriceTrend & {
    movingAverages: { ma7: number; ma14: number; ma30: number };
    volatilityIndex: number;
    trendStrength: number;
    supportResistance: { support: number; resistance: number };
  }> {
    const basicTrend = await this.getPriceTrend(commodityId, period, location);
    
    // Calculate moving averages
    const movingAverages = this.calculateMovingAverages(basicTrend.dataPoints);
    
    // Calculate volatility index (0-100 scale)
    const volatilityIndex = Math.min(100, basicTrend.volatility * 100);
    
    // Calculate trend strength (0-100 scale)
    const trendStrength = this.calculateTrendStrength(basicTrend.dataPoints);
    
    // Calculate support and resistance levels
    const supportResistance = this.calculateSupportResistance(basicTrend.dataPoints);
    
    return {
      ...basicTrend,
      movingAverages,
      volatilityIndex,
      trendStrength,
      supportResistance
    };
  }

  /**
   * Calculate moving averages for trend analysis
   */
  private calculateMovingAverages(dataPoints: Array<{ date: Date; price: number }>): {
    ma7: number; ma14: number; ma30: number;
  } {
    const prices = dataPoints.map(d => d.price);
    
    const calculateMA = (period: number): number => {
      if (prices.length < period) return prices[prices.length - 1] || 0;
      const recentPrices = prices.slice(-period);
      return recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;
    };
    
    return {
      ma7: Math.round(calculateMA(7)),
      ma14: Math.round(calculateMA(14)),
      ma30: Math.round(calculateMA(30))
    };
  }

  /**
   * Calculate trend strength indicator
   */
  private calculateTrendStrength(dataPoints: Array<{ date: Date; price: number }>): number {
    if (dataPoints.length < 2) return 0;
    
    const prices = dataPoints.map(d => d.price);
    let upMoves = 0;
    let downMoves = 0;
    
    for (let i = 1; i < prices.length; i++) {
      if (prices[i] > prices[i - 1]) upMoves++;
      else if (prices[i] < prices[i - 1]) downMoves++;
    }
    
    const totalMoves = upMoves + downMoves;
    if (totalMoves === 0) return 0;
    
    // Return strength as percentage (0-100)
    return Math.round(Math.abs(upMoves - downMoves) / totalMoves * 100);
  }

  /**
   * Calculate support and resistance levels
   */
  private calculateSupportResistance(dataPoints: Array<{ date: Date; price: number }>): {
    support: number; resistance: number;
  } {
    const prices = dataPoints.map(d => d.price);
    const sortedPrices = [...prices].sort((a, b) => a - b);
    
    // Simple support/resistance calculation using price clusters
    const priceRanges = this.groupPricesIntoRanges(sortedPrices);
    const mostFrequentRange = priceRanges.reduce((max, range) => 
      range.count > max.count ? range : max
    );
    
    return {
      support: Math.round(mostFrequentRange.min),
      resistance: Math.round(mostFrequentRange.max)
    };
  }

  /**
   * Group prices into ranges to find support/resistance levels
   */
  private groupPricesIntoRanges(sortedPrices: number[]): Array<{ min: number; max: number; count: number }> {
    if (sortedPrices.length === 0) return [];
    
    const ranges: Array<{ min: number; max: number; count: number }> = [];
    const rangeSize = (Math.max(...sortedPrices) - Math.min(...sortedPrices)) / 10; // 10 ranges
    
    for (let i = 0; i < 10; i++) {
      const min = Math.min(...sortedPrices) + i * rangeSize;
      const max = min + rangeSize;
      const count = sortedPrices.filter(price => price >= min && price < max).length;
      
      if (count > 0) {
        ranges.push({ min, max, count });
      }
    }
    
    return ranges;
  }

  /**
   * Create price deviation alerts for users
   */
  async createPriceAlert(
    userId: string,
    commodityId: string,
    targetPrice: number,
    condition: 'above' | 'below' | 'equals',
    tolerance: number = 5, // percentage
    location?: GeoLocation
  ): Promise<PriceAlert> {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const alert: PriceAlert = {
      id: alertId,
      userId,
      commodityId,
      targetPrice,
      condition,
      tolerance,
      location: location ? { ...location, radius: location.radius || 50 } : undefined,
      isActive: true,
      createdAt: new Date(),
      notificationSent: false
    };
    
    // Store alert (in production, this would be saved to database)
    if (!this.priceAlerts.has(userId)) {
      this.priceAlerts.set(userId, []);
    }
    this.priceAlerts.get(userId)!.push(alert);
    
    return alert;
  }

  /**
   * Check for price alerts and trigger notifications
   */
  async checkPriceAlerts(userId: string): Promise<PriceAlert[]> {
    const userAlerts = this.priceAlerts.get(userId) || [];
    const triggeredAlerts: PriceAlert[] = [];
    
    for (const alert of userAlerts.filter(a => a.isActive && !a.notificationSent)) {
      try {
        const currentPrices = await this.queryPrices({
          commodity: alert.commodityId,
          location: alert.location,
          dateRange: {
            start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            end: new Date()
          },
          limit: 10
        });
        
        if (currentPrices.length === 0) continue;
        
        const avgCurrentPrice = currentPrices.reduce((sum, p) => sum + p.price, 0) / currentPrices.length;
        const deviation = Math.abs(avgCurrentPrice - alert.targetPrice) / alert.targetPrice * 100;
        
        let shouldTrigger = false;
        
        switch (alert.condition) {
          case 'above':
            shouldTrigger = avgCurrentPrice > alert.targetPrice;
            break;
          case 'below':
            shouldTrigger = avgCurrentPrice < alert.targetPrice;
            break;
          case 'equals':
            shouldTrigger = deviation <= alert.tolerance;
            break;
        }
        
        if (shouldTrigger) {
          alert.triggeredAt = new Date();
          alert.notificationSent = true;
          triggeredAlerts.push(alert);
        }
      } catch (error) {
        console.error(`Failed to check alert ${alert.id}:`, error);
      }
    }
    
    return triggeredAlerts;
  }

  /**
   * Get user's active price alerts
   */
  getUserPriceAlerts(userId: string): PriceAlert[] {
    return this.priceAlerts.get(userId) || [];
  }

  /**
   * Deactivate a price alert
   */
  deactivatePriceAlert(userId: string, alertId: string): boolean {
    const userAlerts = this.priceAlerts.get(userId) || [];
    const alert = userAlerts.find(a => a.id === alertId);
    
    if (alert) {
      alert.isActive = false;
      return true;
    }
    
    return false;
  }

  private async fetchFromAGMARKNET(query: PriceQuery): Promise<PriceData[]> {
    try {
      // Build AGMARKNET API query
      const params = new URLSearchParams({
        'api-key': 'demo-key', // In production, this would be from environment variables
        format: 'json',
        limit: '100'
      });

      if (query.commodity) {
        params.append('filters[commodity]', query.commodity);
      }

      const response = await fetch(`${AGMARKNET_API_URL}?${params}`);
      
      if (!response.ok) {
        throw new Error(`AGMARKNET API error: ${response.status}`);
      }

      const data: AGMARKNETResponse = await response.json();
      
      return data.records.map(record => this.transformAGMARKNETRecord(record));
    } catch (error) {
      console.error('AGMARKNET fetch failed:', error);
      return []; // Return empty array on failure
    }
  }

  private transformAGMARKNETRecord(record: AGMARKNETResponse['records'][0]): PriceData {
    const modalPrice = parseFloat(record.modal_price) || 0;
    const minPrice = parseFloat(record.min_price) || modalPrice;
    const maxPrice = parseFloat(record.max_price) || modalPrice;

    return {
      commodity: record.commodity,
      commodityId: this.generateCommodityId(record.commodity),
      price: modalPrice,
      unit: 'quintal', // AGMARKNET typically uses quintal
      location: `${record.market}, ${record.district}, ${record.state}`,
      source: 'agmarknet',
      timestamp: new Date(record.arrival_date),
      confidence: 0.9, // High confidence for government data
      marketTrend: this.calculateTrendFromPriceRange(minPrice, maxPrice, modalPrice),
      priceChange: {
        amount: 0, // Would need historical data to calculate
        percentage: 0,
        period: '24h'
      },
      quality: record.variety,
      metadata: {
        minPrice,
        maxPrice,
        state: record.state,
        district: record.district,
        market: record.market
      }
    };
  }

  private async fetchVendorSubmissions(query: PriceQuery): Promise<PriceData[]> {
    try {
      const response = await this.makeRequest<PriceData[]>('/prices/vendor-submissions', {
        method: 'POST',
        body: JSON.stringify(query)
      });

      return response.data || [];
    } catch (error) {
      console.error('Vendor submissions fetch failed:', error);
      return [];
    }
  }

  private async fetchPredictedPrices(query: PriceQuery): Promise<PriceData[]> {
    try {
      const response = await this.makeRequest<PriceData[]>('/prices/predicted', {
        method: 'POST',
        body: JSON.stringify(query)
      });

      return response.data || [];
    } catch (error) {
      console.error('Predicted prices fetch failed:', error);
      return [];
    }
  }

  private applyFilters(data: PriceData[], query: PriceQuery): PriceData[] {
    let filtered = data;

    // Filter by commodity
    if (query.commodity) {
      filtered = filtered.filter(item => 
        item.commodity.toLowerCase().includes(query.commodity!.toLowerCase()) ||
        item.commodityId === query.commodity
      );
    }

    // Filter by location
    if (query.location) {
      filtered = filtered.filter(item => 
        this.isWithinRadius(item, query.location!)
      );
    }

    // Filter by date range
    if (query.dateRange) {
      filtered = filtered.filter(item => 
        item.timestamp >= query.dateRange!.start && 
        item.timestamp <= query.dateRange!.end
      );
    }

    // Filter by sources
    if (query.sources && query.sources.length > 0) {
      filtered = filtered.filter(item => 
        query.sources!.includes(item.source)
      );
    }

    // Filter by confidence
    if (query.minConfidence) {
      filtered = filtered.filter(item => 
        item.confidence >= query.minConfidence!
      );
    }

    // Apply limit
    if (query.limit) {
      filtered = filtered.slice(0, query.limit);
    }

    return filtered;
  }

  private sortByRelevance(data: PriceData[], query: PriceQuery): PriceData[] {
    return data.sort((a, b) => {
      // Sort by confidence first
      if (a.confidence !== b.confidence) {
        return b.confidence - a.confidence;
      }

      // Then by recency
      if (a.timestamp.getTime() !== b.timestamp.getTime()) {
        return b.timestamp.getTime() - a.timestamp.getTime();
      }

      // Then by source priority
      const sourcePriority = { 'agmarknet': 3, 'vendor_submission': 2, 'predicted': 1, 'manual': 0 };
      return (sourcePriority[b.source] || 0) - (sourcePriority[a.source] || 0);
    });
  }

  private generateCacheKey(query: PriceQuery): string {
    return JSON.stringify({
      commodity: query.commodity,
      location: query.location,
      dateRange: query.dateRange,
      sources: query.sources?.sort(),
      minConfidence: query.minConfidence
    });
  }

  private cacheResults(key: string, data: PriceData[], query: PriceQuery): void {
    const cached: CachedPriceData = {
      data,
      timestamp: new Date(),
      query: key,
      expiresAt: new Date(Date.now() + PRICE_CACHE_DURATION)
    };

    this.cache.set(key, cached);
    this.saveCacheToStorage();
  }

  private loadCacheFromStorage(): void {
    try {
      const stored = localStorage.getItem('priceServiceCache');
      if (stored) {
        const parsed = JSON.parse(stored);
        for (const [key, value] of Object.entries(parsed)) {
          const cached = value as any;
          cached.timestamp = new Date(cached.timestamp);
          cached.expiresAt = new Date(cached.expiresAt);
          cached.data = cached.data.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp)
          }));
          
          if (cached.expiresAt > new Date()) {
            this.cache.set(key, cached);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load cache from storage:', error);
    }
  }

  private saveCacheToStorage(): void {
    try {
      const cacheObject = Object.fromEntries(this.cache);
      localStorage.setItem('priceServiceCache', JSON.stringify(cacheObject));
    } catch (error) {
      console.error('Failed to save cache to storage:', error);
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
    }, 5 * 60 * 1000); // Clean up every 5 minutes
  }

  private clearCacheForCommodity(commodityId: string): void {
    for (const [key, cached] of this.cache.entries()) {
      if (cached.query.includes(commodityId)) {
        this.cache.delete(key);
      }
    }
    this.saveCacheToStorage();
  }

  private calculateMedian(sortedNumbers: number[]): number {
    const mid = Math.floor(sortedNumbers.length / 2);
    return sortedNumbers.length % 2 === 0
      ? (sortedNumbers[mid - 1] + sortedNumbers[mid]) / 2
      : sortedNumbers[mid];
  }

  private calculateStandardDeviation(numbers: number[], mean: number): number {
    const squaredDifferences = numbers.map(num => Math.pow(num - mean, 2));
    const avgSquaredDiff = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / numbers.length;
    return Math.sqrt(avgSquaredDiff);
  }

  private calculateRangeConfidence(priceData: PriceData[]): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on sample size
    if (priceData.length >= 50) confidence += 0.3;
    else if (priceData.length >= 20) confidence += 0.2;
    else if (priceData.length >= 10) confidence += 0.1;
    
    // Increase confidence based on data quality
    const avgConfidence = priceData.reduce((sum, data) => sum + data.confidence, 0) / priceData.length;
    confidence += (avgConfidence - 0.5) * 0.4;
    
    // Increase confidence based on source diversity
    const uniqueSources = new Set(priceData.map(data => data.source)).size;
    confidence += Math.min(uniqueSources * 0.05, 0.2);
    
    return Math.min(0.99, Math.max(0.1, confidence));
  }

  private hasValidJustification(submission: PriceSubmission): boolean {
    // Check if submission has valid metadata that could justify price deviation
    return !!(
      submission.metadata?.weatherConditions ||
      submission.metadata?.marketConditions ||
      submission.metadata?.qualityGrade ||
      submission.metadata?.harvestSeason ||
      submission.metadata?.festivalSeason
    );
  }

  private async getComparableMarkets(
    commodityId: string,
    location?: GeoLocation,
    limit: number = 5
  ): Promise<PriceData[]> {
    const query: PriceQuery = {
      commodity: commodityId,
      location: location ? { ...location, radius: (location.radius || 50) * 2 } : undefined,
      dateRange: {
        start: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Last 3 days
        end: new Date()
      },
      limit
    };

    return this.queryPrices(query);
  }

  private calculateVerificationConfidence(marketContext: MarketContext, comparableMarketsCount: number): number {
    let confidence = 0.6; // Base confidence
    
    // Increase confidence based on market data quality
    confidence += marketContext.priceRange.fairPriceRange.confidence * 0.2;
    
    // Increase confidence based on comparable markets
    confidence += Math.min(comparableMarketsCount * 0.05, 0.2);
    
    return Math.min(0.99, confidence);
  }

  private generateNegotiationSuggestion(
    verdict: PriceVerification['verdict'],
    deviation: { amount: number; percentage: number },
    marketContext: MarketContext
  ): string {
    switch (verdict) {
      case 'very_high':
        return `Price is ${Math.abs(deviation.percentage).toFixed(1)}% above market rate. Consider negotiating down to ₹${marketContext.priceRange.fairPriceRange.upper}.`;
      case 'high':
        return `Price is ${Math.abs(deviation.percentage).toFixed(1)}% above average. You may negotiate for a better rate.`;
      case 'fair':
        return 'Price is fair and within market range. Good deal!';
      case 'low':
        return `Price is ${Math.abs(deviation.percentage).toFixed(1)}% below average. Verify quality and conditions.`;
      case 'very_low':
        return `Price is ${Math.abs(deviation.percentage).toFixed(1)}% below market rate. Check for quality issues or special conditions.`;
      default:
        return 'Unable to provide negotiation suggestion.';
    }
  }

  private groupPricesByDate(priceData: PriceData[]): Array<{ date: Date; price: number; volume?: number }> {
    const grouped = new Map<string, { prices: number[]; volumes: number[] }>();
    
    for (const data of priceData) {
      const dateKey = data.timestamp.toISOString().split('T')[0];
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, { prices: [], volumes: [] });
      }
      
      grouped.get(dateKey)!.prices.push(data.price);
      if (data.metadata?.volume) {
        grouped.get(dateKey)!.volumes.push(data.metadata.volume);
      }
    }
    
    return Array.from(grouped.entries()).map(([dateStr, data]) => ({
      date: new Date(dateStr),
      price: data.prices.reduce((sum, price) => sum + price, 0) / data.prices.length,
      volume: data.volumes.length > 0 ? data.volumes.reduce((sum, vol) => sum + vol, 0) : undefined
    })).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private calculateTrend(dataPoints: Array<{ date: Date; price: number }>): MarketTrend {
    if (dataPoints.length < 2) return 'stable';
    
    const firstPrice = dataPoints[0].price;
    const lastPrice = dataPoints[dataPoints.length - 1].price;
    const change = ((lastPrice - firstPrice) / firstPrice) * 100;
    
    if (change > 5) return 'rising';
    if (change < -5) return 'falling';
    
    // Check for volatility
    const prices = dataPoints.map(d => d.price);
    const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const volatility = this.calculateStandardDeviation(prices, avg) / avg;
    
    return volatility > 0.1 ? 'volatile' : 'stable';
  }

  private calculateVolatility(dataPoints: Array<{ date: Date; price: number }>): number {
    if (dataPoints.length < 2) return 0;
    
    const prices = dataPoints.map(d => d.price);
    const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    return this.calculateStandardDeviation(prices, avg) / avg;
  }

  private async generatePriceForecast(
    commodityId: string,
    historicalData: Array<{ date: Date; price: number }>
  ): Promise<{ nextWeek: number; nextMonth: number; confidence: number }> {
    // Simple linear regression for demo purposes
    // In production, this would use more sophisticated ML models
    
    if (historicalData.length < 7) {
      return {
        nextWeek: historicalData[historicalData.length - 1]?.price || 0,
        nextMonth: historicalData[historicalData.length - 1]?.price || 0,
        confidence: 0.3
      };
    }
    
    const recentData = historicalData.slice(-14); // Last 14 days
    const trend = this.calculateTrend(recentData);
    const lastPrice = recentData[recentData.length - 1].price;
    
    let weeklyChange = 0;
    let monthlyChange = 0;
    
    switch (trend) {
      case 'rising':
        weeklyChange = 0.02; // 2% increase
        monthlyChange = 0.05; // 5% increase
        break;
      case 'falling':
        weeklyChange = -0.02; // 2% decrease
        monthlyChange = -0.05; // 5% decrease
        break;
      case 'volatile':
        weeklyChange = (Math.random() - 0.5) * 0.04; // ±2% random
        monthlyChange = (Math.random() - 0.5) * 0.08; // ±4% random
        break;
      default:
        weeklyChange = 0;
        monthlyChange = 0;
    }
    
    return {
      nextWeek: Math.round(lastPrice * (1 + weeklyChange)),
      nextMonth: Math.round(lastPrice * (1 + monthlyChange)),
      confidence: trend === 'stable' ? 0.7 : trend === 'volatile' ? 0.4 : 0.6
    };
  }

  private async detectSeasonalPattern(commodityId: string): Promise<{ peakMonths: number[]; lowMonths: number[] } | undefined> {
    // This would typically analyze historical data over multiple years
    // For demo purposes, return common seasonal patterns for major commodities
    
    const seasonalPatterns: { [key: string]: { peakMonths: number[]; lowMonths: number[] } } = {
      'wheat': { peakMonths: [4, 5, 6], lowMonths: [10, 11, 12] },
      'rice': { peakMonths: [10, 11, 12], lowMonths: [4, 5, 6] },
      'onion': { peakMonths: [3, 4, 5], lowMonths: [8, 9, 10] },
      'potato': { peakMonths: [2, 3, 4], lowMonths: [7, 8, 9] }
    };
    
    const commodityName = commodityId.toLowerCase();
    for (const [key, pattern] of Object.entries(seasonalPatterns)) {
      if (commodityName.includes(key)) {
        return pattern;
      }
    }
    
    return undefined;
  }

  private calculateDemandLevel(priceData: PriceData[]): DemandLevel {
    // Analyze recent price trends and volume to estimate demand
    const recentPrices = priceData.slice(-7); // Last 7 entries
    if (recentPrices.length < 2) return 'medium';
    
    const trend = this.calculateTrend(recentPrices.map(p => ({ date: p.timestamp, price: p.price })));
    const avgVolume = recentPrices
      .filter(p => p.metadata?.volume)
      .reduce((sum, p) => sum + (p.metadata?.volume || 0), 0) / recentPrices.length;
    
    if (trend === 'rising' && avgVolume > 1000) return 'very_high';
    if (trend === 'rising') return 'high';
    if (trend === 'falling') return 'low';
    return 'medium';
  }

  private calculateSupplyLevel(priceData: PriceData[]): DemandLevel {
    // Inverse relationship with demand for simplicity
    const demandLevel = this.calculateDemandLevel(priceData);
    const supplyMap: { [key in DemandLevel]: DemandLevel } = {
      'very_high': 'low',
      'high': 'medium',
      'medium': 'medium',
      'low': 'high'
    };
    return supplyMap[demandLevel];
  }

  private async getNearbyMarkets(location?: GeoLocation): Promise<PriceLocation[]> {
    // This would typically query a database of market locations
    // For demo purposes, return some sample markets
    
    return [
      {
        mandiName: 'Delhi Azadpur Mandi',
        district: 'Delhi',
        state: 'Delhi',
        coordinates: { latitude: 28.7041, longitude: 77.1025 },
        marketType: 'wholesale'
      },
      {
        mandiName: 'Mumbai APMC',
        district: 'Mumbai',
        state: 'Maharashtra',
        coordinates: { latitude: 19.0760, longitude: 72.8777 },
        marketType: 'wholesale'
      },
      {
        mandiName: 'Bangalore KR Market',
        district: 'Bangalore',
        state: 'Karnataka',
        coordinates: { latitude: 12.9716, longitude: 77.5946 },
        marketType: 'retail'
      }
    ];
  }

  private async getHistoricalAverages(
    commodityId: string,
    location?: GeoLocation
  ): Promise<{ '7d': number; '30d': number; '90d': number; '1y': number }> {
    // This would typically query historical data
    // For demo purposes, return calculated averages
    
    const basePrice = 2000; // Base price for calculation
    return {
      '7d': basePrice * 1.02,
      '30d': basePrice * 0.98,
      '90d': basePrice * 1.05,
      '1y': basePrice * 0.95
    };
  }

  private async getSeasonalTrend(commodityId: string): Promise<string> {
    const pattern = await this.detectSeasonalPattern(commodityId);
    const currentMonth = new Date().getMonth() + 1;
    
    if (pattern) {
      if (pattern.peakMonths.includes(currentMonth)) {
        return 'Peak season - prices typically higher';
      } else if (pattern.lowMonths.includes(currentMonth)) {
        return 'Off season - prices typically lower';
      }
    }
    
    return 'Normal season';
  }

  private calculateTrendFromPriceRange(min: number, max: number, modal: number): MarketTrend {
    const range = max - min;
    const position = (modal - min) / range;
    
    if (position > 0.7) return 'rising';
    if (position < 0.3) return 'falling';
    return 'stable';
  }

  private generateCommodityId(commodityName: string): string {
    return commodityName.toLowerCase().replace(/\s+/g, '-');
  }

  private isWithinRadius(item: PriceData, location: GeoLocation): boolean {
    // For demo purposes, assume all items are within radius
    // In production, this would calculate actual distance
    return true;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
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
      console.error('API request failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const priceService = new PriceService();
export default priceService;