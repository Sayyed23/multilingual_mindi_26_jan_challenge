import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, MapPin, Clock, Star, AlertTriangle, Info, Sparkles } from 'lucide-react';
import { priceDiscoveryService } from '../services/priceDiscovery';
import type { PriceData, PriceTrend, PriceAnomaly } from '../types';

interface PriceDisplayProps {
  prices: PriceData[];
  commodity: string;
  showTrends?: boolean;
  showAnomalies?: boolean;
  className?: string;
}

interface PriceStats {
  min: number;
  max: number;
  average: number;
  count: number;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({
  prices,
  commodity,
  showTrends = true,
  showAnomalies = true,
  className = ''
}) => {
  const [trend, setTrend] = useState<PriceTrend | null>(null);
  const [anomalies, setAnomalies] = useState<PriceAnomaly[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'timestamp' | 'mandi'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Calculate price statistics
  const priceStats: PriceStats = React.useMemo(() => {
    if (prices.length === 0) {
      return { min: 0, max: 0, average: 0, count: 0 };
    }

    const priceValues = prices.map(p => p.price);
    return {
      min: Math.min(...priceValues),
      max: Math.max(...priceValues),
      average: priceValues.reduce((sum, price) => sum + price, 0) / priceValues.length,
      count: prices.length
    };
  }, [prices]);

  // Load trend data
  useEffect(() => {
    if (showTrends && commodity && prices.length > 0) {
      setLoading(true);
      priceDiscoveryService.getPriceTrends(commodity)
        .then(setTrend)
        .catch(error => console.error('Failed to load price trends:', error))
        .finally(() => setLoading(false));
    }
  }, [commodity, showTrends, prices.length]);

  // Detect anomalies
  useEffect(() => {
    if (showAnomalies && prices.length > 0) {
      const detectedAnomalies = priceDiscoveryService.detectPriceAnomalies(prices);
      setAnomalies(detectedAnomalies);
    }
  }, [prices, showAnomalies]);

  // Sort prices
  const sortedPrices = React.useMemo(() => {
    const sorted = [...prices].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'timestamp':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'mandi':
          comparison = a.mandi.localeCompare(b.mandi);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [prices, sortBy, sortOrder]);

  const handleSort = (field: 'price' | 'timestamp' | 'mandi') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'premium': return 'text-green-600 bg-green-50';
      case 'standard': return 'text-blue-600 bg-blue-50';
      case 'basic': return 'text-gray-600 bg-gray-50';
      case 'mixed': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (trendType: string) => {
    switch (trendType) {
      case 'rising': return <TrendingUp size={16} className="text-green-600" />;
      case 'falling': return <TrendingDown size={16} className="text-red-600" />;
      case 'stable': return <Minus size={16} className="text-gray-600" />;
      default: return <Minus size={16} className="text-gray-600" />;
    }
  };

  const getAnomalySeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (prices.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center ${className}`}>
        <div className="text-gray-500">
          <Info size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No prices found</h3>
          <p>Try searching for a different commodity or adjusting your filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Price Statistics Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {commodity} Prices ({priceStats.count} markets)
          </h2>
          {showTrends && trend && (
            <div className="flex items-center space-x-2 text-sm">
              {getTrendIcon(trend.trend)}
              <span className={`font-medium ${trend.trend === 'rising' ? 'text-green-600' :
                trend.trend === 'falling' ? 'text-red-600' : 'text-gray-600'
                }`}>
                {trend.changePercent > 0 ? '+' : ''}{trend.changePercent}% ({trend.timeframe})
              </span>
            </div>
          )}
        </div>

        {/* Price Range Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatPrice(priceStats.min)}</div>
            <div className="text-sm text-gray-500">Minimum</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{formatPrice(priceStats.average)}</div>
            <div className="text-sm text-gray-500">Average</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{formatPrice(priceStats.max)}</div>
            <div className="text-sm text-gray-500">Maximum</div>
          </div>
        </div>
      </div>

      {/* Anomalies Alert */}
      {showAnomalies && anomalies.length > 0 && (
        <div className="p-4 bg-yellow-50 border-b border-yellow-200">
          <div className="flex items-start space-x-2">
            <AlertTriangle size={20} className="text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Price Anomalies Detected</h3>
              <p className="text-sm text-yellow-700 mt-1">
                {anomalies.length} price{anomalies.length > 1 ? 's' : ''} outside normal range detected.
              </p>
              <div className="mt-2 space-y-1">
                {anomalies.slice(0, 3).map((anomaly, index) => (
                  <div key={index} className={`text-xs px-2 py-1 rounded border ${getAnomalySeverityColor(anomaly.severity)}`}>
                    <strong>{anomaly.commodity}</strong>: {formatPrice(anomaly.detectedPrice)} - {anomaly.explanation}
                  </div>
                ))}
                {anomalies.length > 3 && (
                  <div className="text-xs text-yellow-600">
                    +{anomalies.length - 3} more anomalies
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sort Controls */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <div className="flex space-x-2">
            {[
              { key: 'price', label: 'Price' },
              { key: 'timestamp', label: 'Time' },
              { key: 'mandi', label: 'Market' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleSort(key as 'price' | 'timestamp' | 'mandi')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${sortBy === key
                  ? 'bg-green-100 text-green-700'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {label}
                {sortBy === key && (
                  <span className="ml-1">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Price List */}
      <div className="divide-y divide-gray-100" data-testid="price-list">
        {sortedPrices.map((price, index) => {
          const isAnomaly = anomalies.some(a =>
            a.commodity === price.commodity &&
            Math.abs(a.detectedPrice - price.price) < 0.01
          );

          return (
            <div
              key={index}
              className={`p-4 hover:bg-gray-50 transition-colors ${isAnomaly ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="font-medium text-gray-900">{price.mandi}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(price.quality)}`}>
                      <Star size={12} className="inline mr-1" />
                      {price.quality}
                    </span>
                    {price.isAISourced && (
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1">
                        <Sparkles size={12} />
                        Gemini AI Estimate
                      </span>
                    )}
                    {isAnomaly && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <AlertTriangle size={12} className="inline mr-1" />
                        Anomaly
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{formatTimestamp(price.timestamp)}</span>
                    </div>
                    <span>per {price.unit}</span>
                    <span>Source: {price.source}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPrice(price.price)}
                  </div>
                  <div className="text-sm text-gray-500">
                    per {price.unit}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-4 text-center">
          <div className="inline-flex items-center space-x-2 text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
            <span>Loading trend data...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceDisplay;