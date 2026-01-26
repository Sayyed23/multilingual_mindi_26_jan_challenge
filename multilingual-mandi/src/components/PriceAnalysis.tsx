/**
 * Price Analysis Component
 * Displays comprehensive price analysis including fair price ranges, trends, and alerts
 * Supports Requirements: 2.1, 2.2, 6.1, 6.2, 6.3, 6.4
 */

import React, { useState, useEffect } from 'react';
import { priceService } from '../services/priceService';
import { PriceRange, PriceTrend, PriceVerification, PriceAlert } from '../types/price';
import './PriceAnalysis.css';

interface PriceAnalysisProps {
  commodityId: string;
  commodityName: string;
  location?: { latitude: number; longitude: number; radius?: number };
  onClose?: () => void;
}

const PriceAnalysis: React.FC<PriceAnalysisProps> = ({
  commodityId,
  commodityName,
  location,
  onClose
}) => {
  const [priceRange, setPriceRange] = useState<PriceRange | null>(null);
  const [priceTrend, setPriceTrend] = useState<PriceTrend | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'range' | 'trend' | 'alerts'>('range');
  const [quotePrice, setQuotePrice] = useState<string>('');
  const [verification, setVerification] = useState<PriceVerification | null>(null);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);

  useEffect(() => {
    loadAnalysisData();
  }, [commodityId, location]);

  const loadAnalysisData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [rangeData, trendData] = await Promise.all([
        priceService.getPriceRange(commodityId, location),
        priceService.getPriceTrend(commodityId, '30d', location)
      ]);

      setPriceRange(rangeData);
      setPriceTrend(trendData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analysis data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyQuote = async () => {
    if (!quotePrice || isNaN(Number(quotePrice))) return;

    try {
      const result = await priceService.verifyPriceQuote(
        commodityId,
        Number(quotePrice),
        location
      );
      setVerification(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify price quote');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'fair': return '#28a745';
      case 'high': return '#fd7e14';
      case 'very_high': return '#dc3545';
      case 'low': return '#17a2b8';
      case 'very_low': return '#6f42c1';
      default: return '#6c757d';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return '📈';
      case 'falling': return '📉';
      case 'volatile': return '📊';
      default: return '➡️';
    }
  };

  if (loading) {
    return (
      <div className="price-analysis-modal">
        <div className="price-analysis-content">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading price analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="price-analysis-modal">
        <div className="price-analysis-content">
          <div className="error-message">
            <h3>Analysis Error</h3>
            <p>{error}</p>
            <button onClick={onClose} className="close-button">Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="price-analysis-modal">
      <div className="price-analysis-content">
        <div className="analysis-header">
          <h2>{commodityName} - Price Analysis</h2>
          {onClose && (
            <button onClick={onClose} className="close-button">×</button>
          )}
        </div>

        <div className="analysis-tabs">
          <button
            className={`tab-button ${activeTab === 'range' ? 'active' : ''}`}
            onClick={() => setActiveTab('range')}
          >
            Price Range
          </button>
          <button
            className={`tab-button ${activeTab === 'trend' ? 'active' : ''}`}
            onClick={() => setActiveTab('trend')}
          >
            Trend Analysis
          </button>
          <button
            className={`tab-button ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
            Price Verification
          </button>
        </div>

        <div className="analysis-content">
          {activeTab === 'range' && priceRange && (
            <div className="price-range-analysis">
              <div className="range-summary">
                <h3>Price Range Summary</h3>
                <div className="range-stats">
                  <div className="stat-item">
                    <label>Current Average</label>
                    <span className="stat-value">{formatPrice(priceRange.average)}</span>
                  </div>
                  <div className="stat-item">
                    <label>Median Price</label>
                    <span className="stat-value">{formatPrice(priceRange.median)}</span>
                  </div>
                  <div className="stat-item">
                    <label>Price Range</label>
                    <span className="stat-value">
                      {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
                    </span>
                  </div>
                  <div className="stat-item">
                    <label>Sample Size</label>
                    <span className="stat-value">{priceRange.sampleSize} markets</span>
                  </div>
                </div>
              </div>

              <div className="fair-price-range">
                <h3>Fair Price Range</h3>
                <div className="fair-range-display">
                  <div className="range-bar">
                    <div className="range-background">
                      <div 
                        className="fair-range-indicator"
                        style={{
                          left: `${((priceRange.fairPriceRange.lower - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`,
                          width: `${((priceRange.fairPriceRange.upper - priceRange.fairPriceRange.lower) / (priceRange.max - priceRange.min)) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="range-labels">
                    <span>Min: {formatPrice(priceRange.min)}</span>
                    <span className="fair-range-label">
                      Fair: {formatPrice(priceRange.fairPriceRange.lower)} - {formatPrice(priceRange.fairPriceRange.upper)}
                    </span>
                    <span>Max: {formatPrice(priceRange.max)}</span>
                  </div>
                  <div className="confidence-indicator">
                    <span>Confidence: {Math.round(priceRange.fairPriceRange.confidence * 100)}%</span>
                  </div>
                </div>
              </div>

              {priceRange.confidenceInterval && (
                <div className="confidence-interval">
                  <h3>Statistical Confidence Interval</h3>
                  <p>
                    {Math.round(priceRange.confidenceInterval.level * 100)}% confidence that the true average price is between{' '}
                    <strong>{formatPrice(priceRange.confidenceInterval.lower)}</strong> and{' '}
                    <strong>{formatPrice(priceRange.confidenceInterval.upper)}</strong>
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'trend' && priceTrend && (
            <div className="price-trend-analysis">
              <div className="trend-summary">
                <h3>Trend Analysis ({priceTrend.period})</h3>
                <div className="trend-indicators">
                  <div className="trend-item">
                    <span className="trend-icon">{getTrendIcon(priceTrend.trend)}</span>
                    <span className="trend-label">Market Trend: {priceTrend.trend}</span>
                  </div>
                  <div className="trend-item">
                    <span className="volatility-indicator">
                      Volatility: {Math.round(priceTrend.volatility * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="price-chart">
                <h4>Price Movement</h4>
                <div className="chart-container">
                  {priceTrend.dataPoints.map((point, index) => (
                    <div key={index} className="chart-point">
                      <div className="point-date">
                        {point.date.toLocaleDateString()}
                      </div>
                      <div className="point-price">
                        {formatPrice(point.price)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {priceTrend.forecast && (
                <div className="price-forecast">
                  <h4>Price Forecast</h4>
                  <div className="forecast-items">
                    <div className="forecast-item">
                      <label>Next Week</label>
                      <span>{formatPrice(priceTrend.forecast.nextWeek)}</span>
                    </div>
                    <div className="forecast-item">
                      <label>Next Month</label>
                      <span>{formatPrice(priceTrend.forecast.nextMonth)}</span>
                    </div>
                    <div className="forecast-confidence">
                      Forecast Confidence: {Math.round(priceTrend.forecast.confidence * 100)}%
                    </div>
                  </div>
                </div>
              )}

              {priceTrend.seasonalPattern && (
                <div className="seasonal-pattern">
                  <h4>Seasonal Pattern</h4>
                  <p>
                    <strong>Peak Months:</strong> {priceTrend.seasonalPattern.peakMonths.join(', ')}
                  </p>
                  <p>
                    <strong>Low Months:</strong> {priceTrend.seasonalPattern.lowMonths.join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="price-verification">
              <div className="quote-verification">
                <h3>Verify Price Quote</h3>
                <div className="verification-input">
                  <input
                    type="number"
                    placeholder="Enter quoted price"
                    value={quotePrice}
                    onChange={(e) => setQuotePrice(e.target.value)}
                    className="price-input"
                  />
                  <button onClick={handleVerifyQuote} className="verify-button">
                    Verify Price
                  </button>
                </div>
              </div>

              {verification && (
                <div className="verification-result">
                  <h4>Verification Result</h4>
                  <div className="verdict-display">
                    <div 
                      className="verdict-badge"
                      style={{ backgroundColor: getVerdictColor(verification.verdict) }}
                    >
                      {verification.verdict.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="deviation-info">
                      <p>
                        Deviation: {verification.deviation.amount > 0 ? '+' : ''}{formatPrice(verification.deviation.amount)} 
                        ({verification.deviation.percentage > 0 ? '+' : ''}{verification.deviation.percentage.toFixed(1)}%)
                      </p>
                      <p>Market Price: {formatPrice(verification.marketPrice)}</p>
                    </div>
                  </div>
                  
                  <div className="negotiation-suggestion">
                    <h5>Negotiation Suggestion</h5>
                    <p>{verification.negotiationSuggestion}</p>
                  </div>

                  <div className="comparable-markets">
                    <h5>Comparable Markets ({verification.comparableMarkets.length})</h5>
                    <div className="market-list">
                      {verification.comparableMarkets.slice(0, 3).map((market, index) => (
                        <div key={index} className="market-item">
                          <span className="market-location">{market.location}</span>
                          <span className="market-price">{formatPrice(market.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceAnalysis;