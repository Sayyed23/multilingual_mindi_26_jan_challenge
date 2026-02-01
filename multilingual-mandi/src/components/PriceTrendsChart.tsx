import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Calendar, BarChart3 } from 'lucide-react';
import { priceDiscoveryService } from '../services/priceDiscovery';
import type { PriceHistory, PriceTrend } from '../types';

interface PriceTrendsChartProps {
  commodity: string;
  className?: string;
}

const PriceTrendsChart: React.FC<PriceTrendsChartProps> = ({
  commodity,
  className = ''
}) => {
  const [priceHistory, setPriceHistory] = useState<PriceHistory | null>(null);
  const [priceTrend, setPriceTrend] = useState<PriceTrend | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (!commodity) return;

    const loadTrendData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Calculate date range based on timeframe
        const endDate = new Date();
        const startDate = new Date();
        
        switch (timeframe) {
          case '7d':
            startDate.setDate(endDate.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(endDate.getDate() - 30);
            break;
          case '90d':
            startDate.setDate(endDate.getDate() - 90);
            break;
        }

        const [history, trend] = await Promise.all([
          priceDiscoveryService.getHistoricalPrices(commodity, { start: startDate, end: endDate }),
          priceDiscoveryService.getPriceTrends(commodity)
        ]);

        setPriceHistory(history);
        setPriceTrend(trend);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load trend data');
      } finally {
        setLoading(false);
      }
    };

    loadTrendData();
  }, [commodity, timeframe]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
        return <TrendingUp size={20} className="text-green-600" />;
      case 'falling':
        return <TrendingDown size={20} className="text-red-600" />;
      case 'stable':
        return <Minus size={20} className="text-gray-600" />;
      default:
        return <BarChart3 size={20} className="text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising':
        return 'text-green-600 bg-green-50';
      case 'falling':
        return 'text-red-600 bg-red-50';
      case 'stable':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  // Simple line chart using SVG
  const renderChart = () => {
    if (!priceHistory || priceHistory.data.length === 0) return null;

    const data = priceHistory.data;
    const prices = data.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    
    const chartWidth = 400;
    const chartHeight = 200;
    const padding = 40;
    
    const xStep = (chartWidth - 2 * padding) / (data.length - 1);
    
    const points = data.map((point, index) => {
      const x = padding + index * xStep;
      const y = chartHeight - padding - ((point.price - minPrice) / priceRange) * (chartHeight - 2 * padding);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="mt-4">
        <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="border border-gray-200 rounded-lg bg-white">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Price line */}
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            points={points}
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = padding + index * xStep;
            const y = chartHeight - padding - ((point.price - minPrice) / priceRange) * (chartHeight - 2 * padding);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="#10b981"
                className="hover:r-5 cursor-pointer"
              >
                <title>{`${formatDate(point.date)}: ${formatPrice(point.price)}`}</title>
              </circle>
            );
          })}
          
          {/* Y-axis labels */}
          <text x="10" y={padding} className="text-xs fill-gray-600">{formatPrice(maxPrice)}</text>
          <text x="10" y={chartHeight - padding + 5} className="text-xs fill-gray-600">{formatPrice(minPrice)}</text>
          
          {/* X-axis labels */}
          <text x={padding} y={chartHeight - 10} className="text-xs fill-gray-600">{formatDate(data[0].date)}</text>
          <text x={chartWidth - padding} y={chartHeight - 10} className="text-xs fill-gray-600 text-anchor-end">{formatDate(data[data.length - 1].date)}</text>
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-2">
          <BarChart3 size={20} className="animate-pulse text-gray-400" />
          <span className="text-gray-600">Loading trend data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-red-200 p-6 ${className}`}>
        <div className="text-center text-red-600">
          <BarChart3 size={24} className="mx-auto mb-2" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 size={20} className="text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Price Trends</h3>
          </div>
          
          {/* Timeframe Selector */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: '7d', label: '7D' },
              { key: '30d', label: '30D' },
              { key: '90d', label: '90D' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTimeframe(key as '7d' | '30d' | '90d')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  timeframe === key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trend Summary */}
      {priceTrend && (
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getTrendIcon(priceTrend.trend)}
              <div>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {priceTrend.trend} Trend
                </span>
                <div className="text-xs text-gray-500">
                  Over {priceTrend.timeframe}
                </div>
              </div>
            </div>
            
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getTrendColor(priceTrend.trend)}`}>
              {priceTrend.changePercent > 0 ? '+' : ''}{priceTrend.changePercent}%
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="p-6">
        {priceHistory && priceHistory.data.length > 0 ? (
          <>
            {renderChart()}
            
            {/* Data Summary */}
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-500">Highest</div>
                <div className="text-lg font-semibold text-green-600">
                  {formatPrice(Math.max(...priceHistory.data.map(d => d.price)))}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Average</div>
                <div className="text-lg font-semibold text-blue-600">
                  {formatPrice(priceHistory.data.reduce((sum, d) => sum + d.price, 0) / priceHistory.data.length)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Lowest</div>
                <div className="text-lg font-semibold text-red-600">
                  {formatPrice(Math.min(...priceHistory.data.map(d => d.price)))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Historical Data</h4>
            <p className="text-gray-600">
              Historical price data is not available for this commodity and timeframe.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceTrendsChart;