/**
 * Custom hook for managing price data with search, filtering, and real-time updates
 * Supports Requirements: 2.1, 7.1 - Real-time price discovery and search functionality
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { priceService } from '../services/priceService';
import { PriceData, PriceQuery, PriceSource, MarketTrend } from '../types/price';

export interface PriceFilters {
  commodity?: string;
  location?: string;
  sources?: PriceSource[];
  minPrice?: number;
  maxPrice?: number;
  minConfidence?: number;
  marketTrend?: MarketTrend;
  dateRange?: {
    start: Date;
    end: Date;
  };
  radius?: number;
}

export interface UsePriceDataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  initialFilters?: PriceFilters;
  limit?: number;
}

export interface UsePriceDataReturn {
  priceData: PriceData[];
  loading: boolean;
  error: string | null;
  filters: PriceFilters;
  searchTerm: string;
  totalCount: number;
  hasMore: boolean;
  // Actions
  setSearchTerm: (term: string) => void;
  setFilters: (filters: Partial<PriceFilters>) => void;
  clearFilters: () => void;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  // Real-time updates
  startRealTimeUpdates: () => void;
  stopRealTimeUpdates: () => void;
  isRealTimeActive: boolean;
}

const DEFAULT_REFRESH_INTERVAL = 30000; // 30 seconds
const DEFAULT_LIMIT = 20;

export const usePriceData = (options: UsePriceDataOptions = {}): UsePriceDataReturn => {
  const {
    autoRefresh = false,
    refreshInterval = DEFAULT_REFRESH_INTERVAL,
    initialFilters = {},
    limit = DEFAULT_LIMIT
  } = options;

  // State
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<PriceFilters>(initialFilters);
  const [searchTerm, setSearchTermState] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);

  // Refs for managing intervals and preventing memory leaks
  const refreshIntervalRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Build query from current filters and search term
  const buildQuery = useCallback((offset = 0): PriceQuery => {
    const query: PriceQuery = {
      limit: limit,
      ...(searchTerm && { commodity: searchTerm }),
      ...(filters.dateRange && { dateRange: filters.dateRange }),
      ...(filters.sources && filters.sources.length > 0 && { sources: filters.sources }),
      ...(filters.minConfidence && { minConfidence: filters.minConfidence })
    };

    // Add location-based filtering if available
    if (filters.location && navigator.geolocation) {
      // In a real implementation, we would get user's location
      // For now, we'll use a default location or skip location filtering
    }

    return query;
  }, [searchTerm, filters, limit]);

  // Load price data
  const loadPriceData = useCallback(async (append = false) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    if (!append) {
      setLoading(true);
    }
    setError(null);

    try {
      const query = buildQuery(append ? priceData.length : 0);
      const data = await priceService.queryPrices(query);
      
      // Check data freshness
      const freshData = priceService.checkDataFreshness(data);
      
      // Apply client-side filters
      const filteredData = applyClientSideFilters(freshData);

      if (append) {
        setPriceData(prev => [...prev, ...filteredData]);
      } else {
        setPriceData(filteredData);
      }

      setTotalCount(filteredData.length);
      setHasMore(filteredData.length === limit);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled, don't update error state
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to load price data';
      setError(errorMessage);
      
      // Fallback to sample data on error
      if (!append) {
        setPriceData(getSamplePriceData());
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [buildQuery, priceData.length, limit]);

  // Apply client-side filters that can't be handled by the service
  const applyClientSideFilters = useCallback((data: PriceData[]): PriceData[] => {
    let filtered = data;

    // Filter by price range
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(item => item.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(item => item.price <= filters.maxPrice!);
    }

    // Filter by market trend
    if (filters.marketTrend) {
      filtered = filtered.filter(item => item.marketTrend === filters.marketTrend);
    }

    // Filter by location (simple string matching for now)
    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      filtered = filtered.filter(item => 
        item.location.toLowerCase().includes(locationLower)
      );
    }

    return filtered;
  }, [filters]);

  // Get sample data for fallback
  const getSamplePriceData = (): PriceData[] => [
    {
      commodity: 'Wheat',
      commodityId: 'wheat',
      price: 2150,
      unit: 'quintal',
      location: 'Delhi Mandi',
      source: 'agmarknet',
      timestamp: new Date(),
      confidence: 0.9,
      marketTrend: 'rising',
      priceChange: { amount: 50, percentage: 2.4, period: '24h' }
    },
    {
      commodity: 'Rice',
      commodityId: 'rice',
      price: 3200,
      unit: 'quintal',
      location: 'Punjab Mandi',
      source: 'vendor_submission',
      timestamp: new Date(),
      confidence: 0.8,
      marketTrend: 'falling',
      priceChange: { amount: -40, percentage: -1.2, period: '24h' }
    },
    {
      commodity: 'Onion',
      commodityId: 'onion',
      price: 1800,
      unit: 'quintal',
      location: 'Maharashtra Mandi',
      source: 'agmarknet',
      timestamp: new Date(),
      confidence: 0.85,
      marketTrend: 'stable',
      priceChange: { amount: 0, percentage: 0, period: '24h' }
    }
  ];

  // Public actions
  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term);
  }, []);

  const setFilters = useCallback((newFilters: Partial<PriceFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
    setSearchTermState('');
  }, []);

  const refresh = useCallback(async () => {
    await loadPriceData(false);
  }, [loadPriceData]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await loadPriceData(true);
  }, [hasMore, loading, loadPriceData]);

  const startRealTimeUpdates = useCallback(() => {
    if (refreshIntervalRef.current) return; // Already active

    setIsRealTimeActive(true);
    refreshIntervalRef.current = window.setInterval(() => {
      loadPriceData(false);
    }, refreshInterval);
  }, [loadPriceData, refreshInterval]);

  const stopRealTimeUpdates = useCallback(() => {
    if (refreshIntervalRef.current) {
      window.clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    setIsRealTimeActive(false);
  }, []);

  // Effects
  
  // Initial load and reload when filters/search change
  useEffect(() => {
    loadPriceData(false);
  }, [searchTerm, filters]);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh) {
      startRealTimeUpdates();
    }

    return () => {
      stopRealTimeUpdates();
    };
  }, [autoRefresh, startRealTimeUpdates, stopRealTimeUpdates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      stopRealTimeUpdates();
    };
  }, [stopRealTimeUpdates]);

  return {
    priceData,
    loading,
    error,
    filters,
    searchTerm,
    totalCount,
    hasMore,
    setSearchTerm,
    setFilters,
    clearFilters,
    refresh,
    loadMore,
    startRealTimeUpdates,
    stopRealTimeUpdates,
    isRealTimeActive
  };
};

export default usePriceData;