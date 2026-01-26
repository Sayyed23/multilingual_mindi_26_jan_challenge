/**
 * Enhanced Price Card Component
 * Responsive price display with detailed information and actions
 * Supports Requirements: 2.1, 2.2, 2.3 - Price display with freshness indicators
 */

import React, { useState } from 'react';
import { PriceData } from '../types/price';
import './PriceCard.css';

interface PriceCardProps {
  priceData: PriceData;
  onAnalyze?: (commodityId: string, commodityName: string) => void;
  onVerify?: (commodityId: string, commodityName: string, price: number) => void;
  onCreateAlert?: (commodityId: string, commodityName: string) => void;
  compact?: boolean;
}

const PriceCard: React.FC<PriceCardProps> = ({
  priceData,
  onAnalyze,
  onVerify,
  onCreateAlert,
  compact = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return '📈';
      case 'falling': return '📉';
      case 'volatile': return '📊';
      default: return '➡️';
    }
  };

  const getTrendClass = (trend: string) => {
    switch (trend) {
      case 'rising': return 'positive';
      case 'falling': return 'negative';
      case 'volatile': return 'volatile';
      default: return 'stable';
    }
  };

  const getSourceBadge = (source: string) => {
    const sourceLabels = {
      'agmarknet': { label: 'AGMARKNET', class: 'official' },
      'vendor_submission': { label: 'Vendor', class: 'vendor' },
      'predicted': { label: 'AI Predicted', class: 'predicted' },
      'manual': { label: 'Manual', class: 'manual' }
    };
    return sourceLabels[source as keyof typeof sourceLabels] || { label: source, class: 'unknown' };
  };

  const getFreshnessIndicator = (data: PriceData) => {
    const metadata = data.metadata;
    if (metadata?.isStale) {
      return {
        icon: '⚠️',
        text: `Stale (${metadata.ageInHours}h)`,
        class: 'stale',
        title: `Data is ${metadata.ageInHours} hours old`
      };
    } else if (metadata?.freshnessIndicator === 'aging') {
      return {
        icon: '⏰',
        text: `Aging (${metadata.ageInHours}h)`,
        class: 'aging',
        title: `Data is ${metadata.ageInHours} hours old`
      };
    }
    return {
      icon: '✅',
      text: 'Fresh',
      class: 'fresh',
      title: 'Fresh data'
    };
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#28a745';
    if (confidence >= 0.6) return '#ffc107';
    return '#dc3545';
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  const sourceBadge = getSourceBadge(priceData.source);
  const freshness = getFreshnessIndicator(priceData);

  if (compact) {
    return (
      <div className="price-card compact">
        <div className="card-header">
          <h4 className="commodity-name">{priceData.commodity}</h4>
          <span className={`source-badge ${sourceBadge.class}`}>
            {sourceBadge.label}
          </span>
        </div>
        
        <div className="price-main">
          <span className="price">{formatPrice(priceData.price)}</span>
          <span className="unit">/{priceData.unit}</span>
        </div>
        
        <div className="card-footer">
          <span className={`trend ${getTrendClass(priceData.marketTrend)}`}>
            {getTrendIcon(priceData.marketTrend)} 
            {priceData.priceChange.percentage > 0 ? '+' : ''}{priceData.priceChange.percentage.toFixed(1)}%
          </span>
          <span className={`freshness ${freshness.class}`} title={freshness.title}>
            {freshness.icon}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`price-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="card-header">
        <div className="header-main">
          <h3 className="commodity-name">{priceData.commodity}</h3>
          <span className={`source-badge ${sourceBadge.class}`}>
            {sourceBadge.label}
          </span>
        </div>
        <button
          className="expand-button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>
      
      <div className="price-main">
        <div className="price-display">
          <span className="price">{formatPrice(priceData.price)}</span>
          <span className="unit">per {priceData.unit}</span>
        </div>
        <div className="confidence-indicator">
          <div className="confidence-bar">
            <div 
              className="confidence-fill"
              style={{ 
                width: `${priceData.confidence * 100}%`,
                backgroundColor: getConfidenceColor(priceData.confidence)
              }}
            ></div>
          </div>
          <span className="confidence-text">
            {Math.round(priceData.confidence * 100)}% confidence
          </span>
        </div>
      </div>
      
      <div className="price-details">
        <div className="location-info">
          <span className="location-icon">📍</span>
          <span className="location-text">{priceData.location}</span>
        </div>
        <div className="trend-info">
          <span className={`trend ${getTrendClass(priceData.marketTrend)}`}>
            {getTrendIcon(priceData.marketTrend)} 
            {priceData.priceChange.percentage > 0 ? '+' : ''}{priceData.priceChange.percentage.toFixed(1)}%
            <span className="trend-period">({priceData.priceChange.period})</span>
          </span>
        </div>
      </div>
      
      <div className="card-footer">
        <div className="timestamp-info">
          <span className={`freshness-indicator ${freshness.class}`} title={freshness.title}>
            {freshness.icon} {freshness.text}
          </span>
          <span className="timestamp">
            {formatTimestamp(priceData.timestamp)}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="expanded-content">
          {priceData.quality && (
            <div className="quality-info">
              <label>Quality:</label>
              <span>{priceData.quality}</span>
            </div>
          )}
          
          {priceData.metadata && (
            <div className="metadata-info">
              {priceData.metadata.minPrice && priceData.metadata.maxPrice && (
                <div className="price-range-info">
                  <label>Price Range:</label>
                  <span>
                    {formatPrice(priceData.metadata.minPrice)} - {formatPrice(priceData.metadata.maxPrice)}
                  </span>
                </div>
              )}
              
              {priceData.metadata.volume && (
                <div className="volume-info">
                  <label>Volume Traded:</label>
                  <span>{priceData.metadata.volume} {priceData.unit}</span>
                </div>
              )}
              
              {priceData.metadata.weatherConditions && (
                <div className="weather-info">
                  <label>Weather:</label>
                  <span>{priceData.metadata.weatherConditions}</span>
                </div>
              )}
              
              {priceData.metadata.marketConditions && (
                <div className="market-conditions-info">
                  <label>Market Conditions:</label>
                  <span>{priceData.metadata.marketConditions}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="card-actions">
        {onAnalyze && (
          <button 
            className="action-button analyze"
            onClick={() => onAnalyze(priceData.commodityId, priceData.commodity)}
          >
            📊 Analyze
          </button>
        )}
        
        {onVerify && (
          <button 
            className="action-button verify"
            onClick={() => onVerify(priceData.commodityId, priceData.commodity, priceData.price)}
          >
            🔍 Verify
          </button>
        )}
        
        {onCreateAlert && (
          <button 
            className="action-button alert"
            onClick={() => onCreateAlert(priceData.commodityId, priceData.commodity)}
          >
            🔔 Alert
          </button>
        )}
      </div>
    </div>
  );
};

export default PriceCard;