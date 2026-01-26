/**
 * Historical Trend Display Component
 * Shows historical price trends for the past 30 days with visual indicators
 * Supports Requirements: 6.4 - Provide historical price trends for the past 30 days
 */

import React from 'react';
import { PriceTrend } from '../types/price';
import './HistoricalTrendDisplay.css';

interface HistoricalTrendDisplayProps {
  trend: PriceTrend;
  commodityName: string;
}

const HistoricalTrendDisplay: React.FC<HistoricalTrendDisplayProps> = ({
  trend,
  commodityName
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getTrendIcon = (trendType: string) => {
    switch (trendType) {
      case 'rising': return '📈';
      case 'falling': return '📉';
      case 'volatile': return '📊';
      default: return '➡️';
    }
  };

  const getTrendColor = (trendType: string) => {
    switch (trendType) {
      case 'rising': return '#28a745';
      case 'falling': return '#dc3545';
      case 'volatile': return '#fd7e14';
      default: return '#6c757d';
    }
  };

  const getVolatilityLevel = (volatility: number) => {
    if (volatility < 0.05) return 'Low';
    if (volatility < 0.15) return 'Medium';
    if (volatility < 0.25) return 'High';
    return 'Very High';
  };

  const getVolatilityColor = (volatility: number) => {
    if (volatility < 0.05) return '#28a745';
    if (volatility < 0.15) return '#ffc107';
    if (volatility < 0.25) return '#fd7e14';
    return '#dc3545';
  };

  // Calculate price range for chart scaling
  const prices = trend.dataPoints.map(point => point.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  const chartMin = Math.max(0, minPrice - priceRange * 0.1);
  const chartMax = maxPrice + priceRange * 0.1;
  const chartRange = chartMax - chartMin;

  const getPointHeight = (price: number) => {
    return ((price - chartMin) / chartRange) * 100;
  };

  // Group data points by week for better visualization
  const weeklyData = trend.dataPoints.reduce((weeks, point, index) => {
    const weekIndex = Math.floor(index / 7);
    if (!weeks[weekIndex]) {
      weeks[weekIndex] = [];
    }
    weeks[weekIndex].push(point);
    return weeks;
  }, [] as Array<Array<typeof trend.dataPoints[0]>>);

  const weeklyAverages = weeklyData.map(week => {
    const avgPrice = week.reduce((sum, point) => sum + point.price, 0) / week.length;
    return {
      date: week[Math.floor(week.length / 2)].date, // Middle date of the week
      price: avgPrice,
      dataPoints: week.length
    };
  });

  return (
    <div className="historical-trend-display">
      <div className="trend-header">
        <h3>📈 Historical Price Trend</h3>
        <p>{commodityName} - Last {trend.period === '30d' ? '30 days' : trend.period}</p>
      </div>

      <div className="trend-summary">
        <div className="summary-cards">
          <div className="summary-card trend-direction">
            <div className="card-icon" style={{ color: getTrendColor(trend.trend) }}>
              {getTrendIcon(trend.trend)}
            </div>
            <div className="card-content">
              <label>Market Trend</label>
              <span style={{ color: getTrendColor(trend.trend) }}>
                {trend.trend.charAt(0).toUpperCase() + trend.trend.slice(1)}
              </span>
            </div>
          </div>

          <div className="summary-card volatility">
            <div className="card-icon" style={{ color: getVolatilityColor(trend.volatility) }}>
              📊
            </div>
            <div className="card-content">
              <label>Volatility</label>
              <span style={{ color: getVolatilityColor(trend.volatility) }}>
                {getVolatilityLevel(trend.volatility)}
              </span>
            </div>
          </div>

          <div className="summary-card price-range">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <label>Price Range</label>
              <span>{formatPrice(minPrice)} - {formatPrice(maxPrice)}</span>
            </div>
          </div>

          <div className="summary-card data-points">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <label>Data Points</label>
              <span>{trend.dataPoints.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Line Chart */}
      <div className="trend-chart">
        <div className="chart-container">
          <div className="y-axis">
            <span className="y-label max">{formatPrice(chartMax)}</span>
            <span className="y-label mid">{formatPrice((chartMax + chartMin) / 2)}</span>
            <span className="y-label min">{formatPrice(chartMin)}</span>
          </div>
          
          <div className="chart-area">
            <svg viewBox="0 0 100 100" className="price-chart-svg">
              {/* Grid lines */}
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e9ecef" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
              
              {/* Price line */}
              <polyline
                fill="none"
                stroke="#007bff"
                strokeWidth="2"
                points={trend.dataPoints.map((point, index) => 
                  `${(index / (trend.dataPoints.length - 1)) * 100},${100 - getPointHeight(point.price)}`
                ).join(' ')}
              />
              
              {/* Data points */}
              {trend.dataPoints.map((point, index) => (
                <circle
                  key={index}
                  cx={(index / (trend.dataPoints.length - 1)) * 100}
                  cy={100 - getPointHeight(point.price)}
                  r="1.5"
                  fill="#007bff"
                  className="data-point"
                >
                  <title>{formatDate(point.date)}: {formatPrice(point.price)}</title>
                </circle>
              ))}
            </svg>
          </div>
        </div>
        
        <div className="x-axis">
          {weeklyAverages.map((week, index) => (
            <span key={index} className="x-label">
              {formatDate(week.date)}
            </span>
          ))}
        </div>
      </div>

      {/* Seasonal Pattern */}
      {trend.seasonalPattern && (
        <div className="seasonal-pattern">
          <h4>🌾 Seasonal Pattern</h4>
          <div className="pattern-info">
            <div className="pattern-item">
              <label>Peak Season</label>
              <span>
                {trend.seasonalPattern.peakMonths.map(month => 
                  new Date(2024, month - 1).toLocaleDateString('en-IN', { month: 'short' })
                ).join(', ')}
              </span>
            </div>
            <div className="pattern-item">
              <label>Low Season</label>
              <span>
                {trend.seasonalPattern.lowMonths.map(month => 
                  new Date(2024, month - 1).toLocaleDateString('en-IN', { month: 'short' })
                ).join(', ')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Price Forecast */}
      {trend.forecast && (
        <div className="price-forecast">
          <h4>🔮 Price Forecast</h4>
          <div className="forecast-items">
            <div className="forecast-item">
              <label>Next Week</label>
              <span className="forecast-price">{formatPrice(trend.forecast.nextWeek)}</span>
            </div>
            <div className="forecast-item">
              <label>Next Month</label>
              <span className="forecast-price">{formatPrice(trend.forecast.nextMonth)}</span>
            </div>
            <div className="forecast-confidence">
              <label>Forecast Confidence</label>
              <div className="confidence-bar">
                <div 
                  className="confidence-fill"
                  style={{ width: `${trend.forecast.confidence * 100}%` }}
                ></div>
              </div>
              <span>{Math.round(trend.forecast.confidence * 100)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Key Insights */}
      <div className="trend-insights">
        <h4>💡 Key Insights</h4>
        <ul className="insights-list">
          <li>
            Price has {trend.trend === 'rising' ? 'increased' : trend.trend === 'falling' ? 'decreased' : 'remained stable'} over the past {trend.period}
          </li>
          <li>
            Market volatility is {getVolatilityLevel(trend.volatility).toLowerCase()}, indicating {
              trend.volatility < 0.1 ? 'stable pricing conditions' : 'fluctuating market conditions'
            }
          </li>
          {trend.seasonalPattern && (
            <li>
              Current month {trend.seasonalPattern.peakMonths.includes(new Date().getMonth() + 1) 
                ? 'is typically a peak season with higher prices'
                : trend.seasonalPattern.lowMonths.includes(new Date().getMonth() + 1)
                ? 'is typically a low season with lower prices'
                : 'shows normal seasonal pricing'
              }
            </li>
          )}
          <li>
            Based on {trend.dataPoints.length} data points from various markets across India
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HistoricalTrendDisplay;