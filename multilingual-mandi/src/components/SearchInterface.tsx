/**
 * Search Interface Component
 * Comprehensive search functionality for commodities and vendors
 * Supports Requirements: 7.1, 7.2, 7.3 - Search with multilingual support and filtering
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { searchService } from '../services/searchService';
import { translationService } from '../services/translationService';
import { CommoditySearchResult } from '../types/commodity';
import { UserProfile } from '../types/user';
import { GeoLocation } from '../types/price';
import './SearchInterface.css';

interface SearchInterfaceProps {
  onCommoditySelect?: (commodity: CommoditySearchResult) => void;
  onVendorSelect?: (vendor: UserProfile) => void;
  searchType?: 'all' | 'commodities' | 'vendors';
  language?: string;
  location?: GeoLocation;
  className?: string;
}

interface SearchFilters {
  category?: string;
  priceRange?: { min: number; max: number };
  location?: GeoLocation;
  userType?: 'vendor' | 'buyer' | 'both';
  verified?: boolean;
  rating?: { min: number; max?: number };
}

const SearchInterface: React.FC<SearchInterfaceProps> = ({
  onCommoditySelect,
  onVendorSelect,
  searchType = 'all',
  language = 'en',
  location,
  className = ''
}) => {
  // State management
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    commodities: CommoditySearchResult[];
    vendors: (UserProfile & { relevanceScore: number; distance?: number })[];
  }>({ commodities: [], vendors: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'commodities' | 'vendors'>('commodities');
  const [totalResults, setTotalResults] = useState(0);
  const [searchTime, setSearchTime] = useState(0);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimeoutRef = useRef<number | null>(null);
  const suggestionsTimeoutRef = useRef<number | null>(null);

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (error) {
        console.warn('Failed to load search history:', error);
      }
    }
  }, []);

  // Save search history to localStorage
  const saveSearchHistory = useCallback((newQuery: string) => {
    if (!newQuery.trim() || newQuery.length < 2) return;
    
    const updated = [newQuery, ...searchHistory.filter(h => h !== newQuery)].slice(0, 10);
    setSearchHistory(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
  }, [searchHistory]);

  // Debounced search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults({ commodities: [], vendors: [] });
      setTotalResults(0);
      return;
    }

    setLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      const searchPromises: Promise<any>[] = [];

      // Search commodities
      if (searchType === 'all' || searchType === 'commodities') {
        searchPromises.push(
          searchService.searchCommodities({
            query: searchQuery,
            language,
            category: filters.category,
            location: filters.location || location ? {
              latitude: (filters.location || location)!.latitude,
              longitude: (filters.location || location)!.longitude,
              radius: (filters.location || location)?.radius || 50
            } : undefined,
            priceRange: filters.priceRange,
            page: 1,
            limit: 20
          }).catch(error => {
            console.warn('Commodity search failed:', error);
            return { results: [], total: 0 };
          })
        );
      } else {
        searchPromises.push(Promise.resolve({ results: [], total: 0 }));
      }

      // Search vendors
      if (searchType === 'all' || searchType === 'vendors') {
        searchPromises.push(
          searchService.searchVendors({
            searchQuery,
            language,
            userType: filters.userType,
            location: filters.location || location,
            verified: filters.verified,
            rating: filters.rating,
            limit: 20
          }).catch(error => {
            console.warn('Vendor search failed:', error);
            return { users: [], total: 0 };
          })
        );
      } else {
        searchPromises.push(Promise.resolve({ users: [], total: 0 }));
      }

      const [commodityResults, vendorResults] = await Promise.all(searchPromises);

      setResults({
        commodities: commodityResults.results || [],
        vendors: vendorResults.users || []
      });

      setTotalResults((commodityResults.total || 0) + (vendorResults.total || 0));
      setSearchTime(Date.now() - startTime);
      
      // Save successful search to history
      saveSearchHistory(searchQuery);
      
    } catch (error) {
      console.error('Search failed:', error);
      setError(error instanceof Error ? error.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }, [searchType, language, location, filters, saveSearchHistory]);

  // Handle search input change with debouncing
  const handleSearchChange = useCallback((value: string) => {
    setQuery(value);
    
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for search
    debounceTimeoutRef.current = window.setTimeout(() => {
      performSearch(value);
    }, 300);

    // Get suggestions with shorter delay
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }

    if (value.length >= 2) {
      suggestionsTimeoutRef.current = window.setTimeout(async () => {
        try {
          const suggestions = await searchService.getSearchSuggestions(value, language, 5);
          setSuggestions(suggestions);
          setShowSuggestions(true);
        } catch (error) {
          console.warn('Failed to get suggestions:', error);
        }
      }, 150);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [performSearch, language]);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    performSearch(suggestion);
  }, [performSearch]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Re-search with new filters
    if (query.trim().length >= 2) {
      performSearch(query);
    }
  }, [filters, query, performSearch]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults({ commodities: [], vendors: [] });
    setTotalResults(0);
    setError(null);
    setSuggestions([]);
    setShowSuggestions(false);
    
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`search-interface ${className}`}>
      {/* Search Input Section */}
      <div className="search-input-section">
        <div className="search-input-container">
          <div className="search-input-wrapper">
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Search ${searchType === 'commodities' ? 'commodities' : searchType === 'vendors' ? 'vendors' : 'commodities and vendors'}...`}
              className="search-input"
              disabled={loading}
            />
            
            {query && (
              <button
                onClick={clearSearch}
                className="clear-search-button"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
            
            <div className="search-actions">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`filter-toggle ${showFilters ? 'active' : ''}`}
                aria-label="Toggle filters"
              >
                🔍
              </button>
            </div>
          </div>

          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="suggestion-item"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search History */}
        {!query && searchHistory.length > 0 && (
          <div className="search-history">
            <span className="history-label">Recent searches:</span>
            {searchHistory.slice(0, 5).map((historyItem, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionSelect(historyItem)}
                className="history-item"
              >
                {historyItem}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="search-filters">
          <div className="filter-group">
            <label>Category:</label>
            <select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange({ category: e.target.value || undefined })}
            >
              <option value="">All Categories</option>
              <option value="Grains">Grains</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Spices">Spices</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Price Range:</label>
            <div className="price-range-inputs">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange?.min || ''}
                onChange={(e) => handleFilterChange({
                  priceRange: {
                    ...filters.priceRange,
                    min: e.target.value ? parseInt(e.target.value) : undefined
                  } as any
                })}
              />
              <span>to</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange?.max || ''}
                onChange={(e) => handleFilterChange({
                  priceRange: {
                    ...filters.priceRange,
                    max: e.target.value ? parseInt(e.target.value) : undefined
                  } as any
                })}
              />
            </div>
          </div>

          {(searchType === 'all' || searchType === 'vendors') && (
            <>
              <div className="filter-group">
                <label>User Type:</label>
                <select
                  value={filters.userType || ''}
                  onChange={(e) => handleFilterChange({ userType: e.target.value as any || undefined })}
                >
                  <option value="">All Types</option>
                  <option value="vendor">Vendors</option>
                  <option value="buyer">Buyers</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div className="filter-group">
                <label>
                  <input
                    type="checkbox"
                    checked={filters.verified || false}
                    onChange={(e) => handleFilterChange({ verified: e.target.checked || undefined })}
                  />
                  Verified only
                </label>
              </div>
            </>
          )}
        </div>
      )}

      {/* Search Status */}
      {(loading || totalResults > 0 || error) && (
        <div className="search-status">
          {loading && <span className="loading">Searching...</span>}
          {!loading && totalResults > 0 && (
            <span className="results-count">
              Found {totalResults} results in {searchTime}ms
            </span>
          )}
          {error && <span className="error">Error: {error}</span>}
        </div>
      )}

      {/* Results Tabs */}
      {searchType === 'all' && (results.commodities.length > 0 || results.vendors.length > 0) && (
        <div className="results-tabs">
          <button
            onClick={() => setActiveTab('commodities')}
            className={`tab ${activeTab === 'commodities' ? 'active' : ''}`}
          >
            Commodities ({results.commodities.length})
          </button>
          <button
            onClick={() => setActiveTab('vendors')}
            className={`tab ${activeTab === 'vendors' ? 'active' : ''}`}
          >
            Vendors ({results.vendors.length})
          </button>
        </div>
      )}

      {/* Search Results */}
      <div className="search-results">
        {/* Commodity Results */}
        {(searchType === 'commodities' || (searchType === 'all' && activeTab === 'commodities')) && (
          <div className="commodity-results">
            {results.commodities.map((result, index) => (
              <div
                key={result.commodity.id}
                className="result-item commodity-item"
                onClick={() => onCommoditySelect?.(result)}
              >
                <div className="result-header">
                  <h3>{result.commodity.name}</h3>
                  <span className="relevance-score">{Math.round(result.relevanceScore)}% match</span>
                </div>
                <div className="result-details">
                  <span className="category">{result.commodity.category} • {result.commodity.subcategory}</span>
                  <span className="price">₹{result.averagePrice}/{result.commodity.standardUnit}</span>
                </div>
                <div className="result-meta">
                  <span className="vendors">{result.availableVendors} vendors</span>
                  {result.distance && <span className="distance">{result.distance}km away</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Vendor Results */}
        {(searchType === 'vendors' || (searchType === 'all' && activeTab === 'vendors')) && (
          <div className="vendor-results">
            {results.vendors.map((vendor, index) => (
              <div
                key={vendor.userId}
                className="result-item vendor-item"
                onClick={() => onVendorSelect?.(vendor)}
              >
                <div className="result-header">
                  <h3>{vendor.name}</h3>
                  <span className="relevance-score">{Math.round(vendor.relevanceScore)}% match</span>
                </div>
                <div className="result-details">
                  <span className="user-type">{vendor.userType}</span>
                  {vendor.reputation && (
                    <span className="rating">★ {vendor.reputation.overall.toFixed(1)}</span>
                  )}
                  {vendor.isVerified && <span className="verified">✓ Verified</span>}
                </div>
                <div className="result-meta">
                  {vendor.businessInfo?.businessName && (
                    <span className="business">{vendor.businessInfo.businessName}</span>
                  )}
                  {vendor.distance && <span className="distance">{vendor.distance}km away</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && totalResults === 0 && query.length >= 2 && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No results found</h3>
            <p>Try different keywords or adjust your filters</p>
            {suggestions.length > 0 && (
              <div className="suggestions">
                <p>Did you mean:</p>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className="suggestion-button"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchInterface;