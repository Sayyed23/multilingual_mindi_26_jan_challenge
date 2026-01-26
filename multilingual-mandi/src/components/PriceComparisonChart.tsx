/**
 * Price Comparison Chart Component
 * Displays visual comparison of quoted price vs market prices from comparable markets
 * Supports Requirements: 6.3 - Show data from at least 5 comparable mandis
 */

import React from 'react';
import { PriceData } from '../types/price';
import './PriceComparisonChart.css';

interface PriceComparisonChartProps {
  quotedPrice: number;
  marketPrice: number;
  comparableMarkets: PriceData[];
}

const PriceComparisonChart: React.FC<PriceComparisonChartProps> = ({
  quotedPrice,
  marketPrice,
  comparableMarkets
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getLocationShort = (location: string) => {
    // Extract city/district name from full location string
    const parts = location.split(',');
    return parts[0].trim();
  };

  // Calculate price range for chart scaling
  const allPrices = [quotedPrice, marketPrice, ...comparableMarkets.map(m => m.price)];
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice;
  const chartMin = Math.max(0, minPrice - priceRange * 0.1);
  const chartMax = maxPrice + priceRange * 0.1;
  const chartRange = chartMax - chartMin;

  const getBarWidth = (price: number) => {
    return ((price - chartMin) / chartRange) * 100;
  };

  const getBarColor = (price: number, isQuoted: boolean = false) => {
    if (isQuoted) return '#007bff';
    
    const deviation = ((price - marketPrice) / marketPrice) * 100;
    if (Math.abs(deviation) <= 5) return '#28a745'; // Fair - green
    if (deviation > 10) return '#dc3545'; // High - red
    if (deviation > 5) return '#fd7e14'; // Slightly high - orange
    if (deviation < -10) return '#6f42c1'; // Very low - purple
    return '#17a2b8'; // Slightly low - cyan
  };

  return (
    <div className="price-comparison-chart">
      <div className="chart-header">
        <h3>📊 Price Comparison</h3>
        <p>Compare quoted price with {comparableMarkets.length} nearby markets</p>
      </div>

      <div className="chart-container">
        {/* Quoted Price Bar */}
        <div className="price-bar-item quoted-price">
          <div className="bar-info">
            <span className="bar-label">Your Quote</span>
            <span className="bar-price">{formatPrice(quotedPrice)}</span>
          </div>
          <div className="bar-container">
            <div 
              className="price-bar quoted"
              style={{ 
                width: `${getBarWidth(quotedPrice)}%`,
                backgroundColor: getBarColor(quotedPrice, true)
              }}
            >
              <span className="bar-value">Quote</span>
            </div>
          </div>
        </div>

        {/* Market Average Bar */}
        <div className="price-bar-item market-average">
          <div className="bar-info">
            <span className="bar-label">Market Average</span>
            <span className="bar-price">{formatPrice(marketPrice)}</span>
          </div>
          <div className="bar-container">
            <div 
              className="price-bar average"
              style={{ 
                width: `${getBarWidth(marketPrice)}%`,
                backgroundColor: '#28a745'
              }}
            >
              <span className="bar-value">Avg</span>
            </div>
          </div>
        </div>

        {/* Comparable Markets Bars */}
        {comparableMarkets.slice(0, 5).map((market, index) => (
          <div key={index} className="price-bar-item market-price">
            <div className="bar-info">
              <span className="bar-label">{getLocationShort(market.location)}</span>
              <span className="bar-price">{formatPrice(market.price)}</span>
            </div>
            <div className="bar-container">
              <div 
                className="price-bar market"
                style={{ 
                  width: `${getBarWidth(market.price)}%`,
                  backgroundColor: getBarColor(market.price)
                }}
              >
                <span className="bar-value">{getLocationShort(market.location)}</span>
              </div>
            </div>
            <div className="market-details">
              <span className="confidence">
                {Math.round(market.confidence * 100)}% confidence
              </span>
              <span className="source">{market.source}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Price Range Indicator */}
      <div className="price-range-indicator">
        <div className="range-labels">
          <span className="range-min">{formatPrice(chartMin)}</span>
          <span className="range-max">{formatPrice(chartMax)}</span>
        </div>
        <div className="range-bar">
          <div className="range-fill"></div>
        </div>
      </div>

      {/* Legend */}
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#007bff' }}></div>
          <span>Your Quote</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#28a745' }}></div>
          <span>Fair Price</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#fd7e14' }}></div>
          <span>Above Average</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#dc3545' }}></div>
          <span>High Price</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#17a2b8' }}></div>
          <span>Below Average</span>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="chart-summary">
        <div className="summary-item">
          <label>Lowest Price</label>
          <span>{formatPrice(Math.min(...allPrices))}</span>
        </div>
        <div className="summary-item">
          <label>Highest Price</label>
          <span>{formatPrice(Math.max(...allPrices))}</span>
        </div>
        <div className="summary-item">
          <label>Price Spread</label>
          <span>{formatPrice(maxPrice - minPrice)}</span>
        </div>
        <div className="summary-item">
          <label>Markets Compared</label>
          <span>{comparableMarkets.length}</span>
        </div>
      </div>
    </div>
  );
};

export default PriceComparisonChart;