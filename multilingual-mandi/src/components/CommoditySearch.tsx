import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, MapPin, Calendar, Star, X } from 'lucide-react';
import { priceDiscoveryService } from '../services/priceDiscovery';
import type { PriceData, Location, QualityGrade } from '../types';

interface CommoditySearchProps {
  onPricesFound: (prices: PriceData[]) => void;
  onLoading: (loading: boolean) => void;
  onError: (error: string | null) => void;
  className?: string;
}

interface SearchFilters {
  location?: Location;
  dateRange?: {
    start: Date;
    end: Date;
  };
  qualityGrade?: QualityGrade;
  priceRange?: {
    min: number;
    max: number;
  };
}

const CommoditySearch: React.FC<CommoditySearchProps> = ({
  onPricesFound,
  onLoading,
  onError,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Common commodity suggestions
  const commonCommodities = [
    'Rice', 'Wheat', 'Onion', 'Potato', 'Tomato', 'Garlic', 'Ginger',
    'Turmeric', 'Coriander', 'Cumin', 'Mustard', 'Groundnut', 'Soybean',
    'Cotton', 'Sugarcane', 'Maize', 'Bajra', 'Jowar', 'Arhar', 'Moong'
  ];

  // Filter suggestions based on search term
  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = commonCommodities.filter(commodity =>
        commodity.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm]);

  const handleSearch = useCallback(async (commodity: string) => {
    if (!commodity.trim()) {
      onError('Please enter a commodity name');
      return;
    }

    onLoading(true);
    onError(null);

    try {
      const prices = await priceDiscoveryService.getCurrentPrices(
        commodity.trim(),
        filters.location
      );

      // Apply additional filters
      let filteredPrices = prices;

      if (filters.qualityGrade) {
        filteredPrices = filteredPrices.filter(price => price.quality === filters.qualityGrade);
      }

      if (filters.priceRange) {
        filteredPrices = filteredPrices.filter(price =>
          price.price >= (filters.priceRange?.min || 0) &&
          price.price <= (filters.priceRange?.max || Infinity)
        );
      }

      if (filters.dateRange) {
        filteredPrices = filteredPrices.filter(price => {
          const priceDate = new Date(price.timestamp);
          return priceDate >= (filters.dateRange?.start || new Date(0)) &&
            priceDate <= (filters.dateRange?.end || new Date());
        });
      }

      // If no prices found, attempt fallback to Gemini
      if (filteredPrices.length === 0) {
        console.log(`No local data for ${commodity}, falling back to Gemini...`);
        filteredPrices = await priceDiscoveryService.getGeminiPrices(
          commodity.trim(),
          filters.location
        );
      }

      onPricesFound(filteredPrices);
      onPricesFound(filteredPrices);
      setShowSuggestions(false);
    } catch (error) {
      console.warn('Firestore price search failed, attempting Gemini fallback...', error);

      try {
        // Fallback to Gemini on error
        const geminiPrices = await priceDiscoveryService.getGeminiPrices(
          commodity.trim(),
          filters.location
        );

        if (geminiPrices.length > 0) {
          console.log('Gemini fallback successful');
          onPricesFound(geminiPrices);
          setShowSuggestions(false);
          onLoading(false); // Ensure loading is cleared
          return; // Exit successfully
        } else {
          throw new Error('No prices found via Gemini fallback');
        }
      } catch (fallbackError) {
        console.error('Gemini fallback failed:', fallbackError);
        onError(error instanceof Error ? error.message : 'Failed to search prices');
      }
    } finally {
      onLoading(false);
    }
  }, [filters, onPricesFound, onLoading, onError]);

  const handleSuggestionClick = (commodity: string) => {
    setSearchTerm(commodity);
    setShowSuggestions(false);
    handleSearch(commodity);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchTerm);
    }
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.keys(filters).some(key =>
    filters[key as keyof SearchFilters] !== undefined
  );

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Search Input */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Search for commodities (e.g., Rice, Wheat, Onion)"
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md transition-colors ${showFilters || hasActiveFilters
                ? 'text-green-600 bg-green-50'
                : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <Filter size={18} />
            </button>
          </div>

          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {suggestions.map((commodity, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(commodity)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  <div className="flex items-center space-x-2">
                    <Search size={16} className="text-gray-400" />
                    <span>{commodity}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={() => handleSearch(searchTerm)}
          disabled={!searchTerm.trim()}
          className="mt-3 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Search Prices
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
              >
                <X size={14} />
                <span>Clear All</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} className="inline mr-1" />
                Location
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="State"
                  value={filters.location?.state || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    location: {
                      state: e.target.value,
                      district: prev.location?.district || '',
                      city: '',
                      pincode: ''
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="text"
                  placeholder="District"
                  value={filters.location?.district || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    location: {
                      state: prev.location?.state || '',
                      district: e.target.value,
                      city: '',
                      pincode: ''
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            {/* Quality Grade Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Star size={16} className="inline mr-1" />
                Quality Grade
              </label>
              <select
                value={filters.qualityGrade || ''}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  qualityGrade: e.target.value as QualityGrade || undefined
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Grades</option>
                <option value="premium">Premium</option>
                <option value="standard">Standard</option>
                <option value="basic">Basic</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-1" />
                Date Range
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={filters.dateRange?.start?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: {
                      start: new Date(e.target.value),
                      end: prev.dateRange?.end || new Date()
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="date"
                  value={filters.dateRange?.end?.toISOString().split('T')[0] || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: {
                      start: prev.dateRange?.start || new Date(),
                      end: new Date(e.target.value)
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range (₹)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange?.min || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: {
                      min: Number(e.target.value) || 0,
                      max: prev.priceRange?.max || Infinity
                    }
                  }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange?.max === Infinity ? '' : filters.priceRange?.max || ''}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: {
                      min: prev.priceRange?.min || 0,
                      max: Number(e.target.value) || Infinity
                    }
                  }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="p-3 bg-blue-50 border-b border-gray-100">
          <div className="flex flex-wrap gap-2">
            {filters.location?.state && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {filters.location.state}
                {filters.location.district && `, ${filters.location.district}`}
              </span>
            )}
            {filters.qualityGrade && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {filters.qualityGrade}
              </span>
            )}
            {filters.priceRange && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                ₹{filters.priceRange.min} - ₹{filters.priceRange.max === Infinity ? '∞' : filters.priceRange.max}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommoditySearch;