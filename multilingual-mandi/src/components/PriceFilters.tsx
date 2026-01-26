/**
 * Price Filters Component
 * Advanced filtering interface for price data
 * Supports Requirements: 7.1, 7.4 - Search and filtering functionality
 */

import React, { useState, useEffect } from 'react';
import { PriceSource, MarketTrend } from '../types/price';
import { PriceFilters } from '../hooks/usePriceData';
import './PriceFilters.css';

interface PriceFiltersProps {
  filters: PriceFilters;
  onFiltersChange: (filters: Partial<PriceFilters>) => void;
  onClearFilters: () => void;
  loading?: boolean;
}

const PriceFiltersComponent: React.FC<PriceFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  loading = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<PriceFilters>(filters);

  // Common commodities for quick filtering
  const commonCommodities = [
    'Wheat', 'Rice', 'Onion', 'Potato', 'Tomato', 'Sugar', 'Dal', 'Oil'
  ];

  // Common locations for quick filtering
  const commonLocations = [
    'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 
    'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
  ];

  const priceSourceOptions: { value: PriceSource; label: string }[] = [
    { value: 'agmarknet', label: 'AGMARKNET (Official)' },
    { value: 'vendor_submission', label: 'Vendor Submissions' },
    { value: 'predicted', label: 'AI Predicted' },
    { value: 'manual', label: 'Manual Entry' }
  ];

  const marketTrendOptions: { value: MarketTrend; label: string; icon: string }[] = [
    { value: 'rising', label: 'Rising', icon: '📈' },
    { value: 'falling', label: 'Falling', icon: '📉' },
    { value: 'stable', label: 'Stable', icon: '➡️' },
    { value: 'volatile', label: 'Volatile', icon: '📊' }
  ];

  // Sync local filters with props
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof PriceFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange({ [key]: value });
  };

  const handleSourceToggle = (source: PriceSource) => {
    const currentSources = localFilters.sources || [];
    const newSources = currentSources.includes(source)
      ? currentSources.filter(s => s !== source)
      : [...currentSources, source];
    
    handleFilterChange('sources', newSources.length > 0 ? newSources : undefined);
  };

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    const currentRange = localFilters.dateRange || {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date()
    };

    const newRange = {
      ...currentRange,
      [type]: new Date(value)
    };

    handleFilterChange('dateRange', newRange);
  };

  const handleQuickDateRange = (days: number) => {
    const end = new Date();
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    handleFilterChange('dateRange', { start, end });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.commodity) count++;
    if (localFilters.location) count++;
    if (localFilters.sources && localFilters.sources.length > 0) count++;
    if (localFilters.minPrice !== undefined) count++;
    if (localFilters.maxPrice !== undefined) count++;
    if (localFilters.minConfidence !== undefined) count++;
    if (localFilters.marketTrend) count++;
    if (localFilters.dateRange) count++;
    return count;
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="price-filters">
      <div className="filters-header">
        <button
          className="filters-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={loading}
        >
          <span className="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
          <span>Filters</span>
          {getActiveFiltersCount() > 0 && (
            <span className="active-count">{getActiveFiltersCount()}</span>
          )}
        </button>
        
        {getActiveFiltersCount() > 0 && (
          <button
            className="clear-filters"
            onClick={onClearFilters}
            disabled={loading}
          >
            Clear All
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="filters-content">
          {/* Quick Commodity Selection */}
          <div className="filter-group">
            <label className="filter-label">Quick Commodity Selection</label>
            <div className="commodity-chips">
              {commonCommodities.map(commodity => (
                <button
                  key={commodity}
                  className={`commodity-chip ${localFilters.commodity === commodity.toLowerCase() ? 'active' : ''}`}
                  onClick={() => handleFilterChange('commodity', 
                    localFilters.commodity === commodity.toLowerCase() ? undefined : commodity.toLowerCase()
                  )}
                  disabled={loading}
                >
                  {commodity}
                </button>
              ))}
            </div>
          </div>

          {/* Location Filter */}
          <div className="filter-group">
            <label className="filter-label">Location</label>
            <div className="location-filter">
              <input
                type="text"
                placeholder="Enter location or select from common locations"
                value={localFilters.location || ''}
                onChange={(e) => handleFilterChange('location', e.target.value || undefined)}
                className="location-input"
                disabled={loading}
              />
              <div className="location-chips">
                {commonLocations.map(location => (
                  <button
                    key={location}
                    className={`location-chip ${localFilters.location === location ? 'active' : ''}`}
                    onClick={() => handleFilterChange('location', 
                      localFilters.location === location ? undefined : location
                    )}
                    disabled={loading}
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div className="filter-group">
            <label className="filter-label">Price Range (₹ per quintal)</label>
            <div className="price-range">
              <input
                type="number"
                placeholder="Min price"
                value={localFilters.minPrice || ''}
                onChange={(e) => handleFilterChange('minPrice', 
                  e.target.value ? Number(e.target.value) : undefined
                )}
                className="price-input"
                min="0"
                disabled={loading}
              />
              <span className="range-separator">to</span>
              <input
                type="number"
                placeholder="Max price"
                value={localFilters.maxPrice || ''}
                onChange={(e) => handleFilterChange('maxPrice', 
                  e.target.value ? Number(e.target.value) : undefined
                )}
                className="price-input"
                min="0"
                disabled={loading}
              />
            </div>
          </div>

          {/* Data Sources */}
          <div className="filter-group">
            <label className="filter-label">Data Sources</label>
            <div className="source-checkboxes">
              {priceSourceOptions.map(option => (
                <label key={option.value} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={(localFilters.sources || []).includes(option.value)}
                    onChange={() => handleSourceToggle(option.value)}
                    disabled={loading}
                  />
                  <span className="checkbox-text">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Market Trend */}
          <div className="filter-group">
            <label className="filter-label">Market Trend</label>
            <div className="trend-options">
              <button
                className={`trend-option ${!localFilters.marketTrend ? 'active' : ''}`}
                onClick={() => handleFilterChange('marketTrend', undefined)}
                disabled={loading}
              >
                All Trends
              </button>
              {marketTrendOptions.map(option => (
                <button
                  key={option.value}
                  className={`trend-option ${localFilters.marketTrend === option.value ? 'active' : ''}`}
                  onClick={() => handleFilterChange('marketTrend', 
                    localFilters.marketTrend === option.value ? undefined : option.value
                  )}
                  disabled={loading}
                >
                  {option.icon} {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Confidence Level */}
          <div className="filter-group">
            <label className="filter-label">
              Minimum Confidence: {Math.round((localFilters.minConfidence || 0) * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={localFilters.minConfidence || 0}
              onChange={(e) => handleFilterChange('minConfidence', 
                Number(e.target.value) || undefined
              )}
              className="confidence-slider"
              disabled={loading}
            />
            <div className="confidence-labels">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Date Range */}
          <div className="filter-group">
            <label className="filter-label">Date Range</label>
            <div className="date-range">
              <div className="quick-date-buttons">
                <button
                  className="quick-date-btn"
                  onClick={() => handleQuickDateRange(1)}
                  disabled={loading}
                >
                  Last 24h
                </button>
                <button
                  className="quick-date-btn"
                  onClick={() => handleQuickDateRange(7)}
                  disabled={loading}
                >
                  Last 7 days
                </button>
                <button
                  className="quick-date-btn"
                  onClick={() => handleQuickDateRange(30)}
                  disabled={loading}
                >
                  Last 30 days
                </button>
              </div>
              <div className="custom-date-range">
                <input
                  type="date"
                  value={localFilters.dateRange ? formatDateForInput(localFilters.dateRange.start) : ''}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  className="date-input"
                  disabled={loading}
                />
                <span className="date-separator">to</span>
                <input
                  type="date"
                  value={localFilters.dateRange ? formatDateForInput(localFilters.dateRange.end) : ''}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  className="date-input"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceFiltersComponent;