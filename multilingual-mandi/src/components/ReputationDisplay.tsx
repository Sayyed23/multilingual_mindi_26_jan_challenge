/**
 * Reputation Display Component - Shows user reputation scores and trust level
 * Supports Requirements: 4.3, 4.4 - Reputation display in user profiles
 */

import React from 'react';
import { ReputationScore } from '../types/user';
import { ReputationMetrics } from '../types/review';
import { reputationService } from '../services/reputationService';
import StarRating from './StarRating';
import './ReputationDisplay.css';

interface ReputationDisplayProps {
  reputation: ReputationScore;
  metrics?: ReputationMetrics;
  variant?: 'compact' | 'detailed' | 'card';
  showTrustLevel?: boolean;
  showMetrics?: boolean;
  className?: string;
}

const ReputationDisplay: React.FC<ReputationDisplayProps> = ({
  reputation,
  metrics,
  variant = 'detailed',
  showTrustLevel = true,
  showMetrics = false,
  className = ''
}) => {
  const trustLevel = metrics ? reputationService.calculateTrustLevel(metrics) : 'new';
  const trustLevelInfo = reputationService.getTrustLevelInfo(trustLevel);

  const formatPercentage = (value: number): string => {
    return `${Math.round(value)}%`;
  };

  const formatResponseTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.round(minutes / 60);
    return `${hours}h`;
  };

  if (variant === 'compact') {
    return (
      <div className={`reputation-display compact ${className}`}>
        <div className="reputation-summary">
          <StarRating
            rating={reputation.overall}
            size="small"
            showValue
            showCount
            count={reputation.reviewCount}
          />
          {showTrustLevel && (
            <div className="trust-badge" style={{ color: trustLevelInfo.color }}>
              <span className="trust-icon">{trustLevelInfo.icon}</span>
              <span className="trust-name">{trustLevelInfo.name}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`reputation-display card ${className}`}>
        <div className="reputation-header">
          <h3>Reputation</h3>
          {showTrustLevel && (
            <div className="trust-badge" style={{ color: trustLevelInfo.color }}>
              <span className="trust-icon">{trustLevelInfo.icon}</span>
              <span className="trust-name">{trustLevelInfo.name}</span>
            </div>
          )}
        </div>

        <div className="overall-rating">
          <StarRating
            rating={reputation.overall}
            size="large"
            showValue
          />
          <div className="rating-details">
            <span className="review-count">
              Based on {reputation.reviewCount} review{reputation.reviewCount !== 1 ? 's' : ''}
            </span>
            <span className="transaction-count">
              {reputation.totalTransactions} transaction{reputation.totalTransactions !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="category-ratings">
          <div className="category-item">
            <span className="category-label">Punctuality</span>
            <StarRating rating={reputation.punctuality} size="small" showValue />
          </div>
          <div className="category-item">
            <span className="category-label">Communication</span>
            <StarRating rating={reputation.communication} size="small" showValue />
          </div>
          <div className="category-item">
            <span className="category-label">Product Quality</span>
            <StarRating rating={reputation.productQuality} size="small" showValue />
          </div>
        </div>

        {showMetrics && metrics && (
          <div className="reputation-metrics">
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-value">{formatPercentage(metrics.successRate)}</span>
                <span className="metric-label">Success Rate</span>
              </div>
              <div className="metric-item">
                <span className="metric-value">{formatPercentage(metrics.onTimeDeliveryRate)}</span>
                <span className="metric-label">On-Time Delivery</span>
              </div>
              <div className="metric-item">
                <span className="metric-value">{formatResponseTime(metrics.averageResponseTime)}</span>
                <span className="metric-label">Avg Response</span>
              </div>
              <div className="metric-item">
                <span className="metric-value">{formatPercentage(100 - metrics.disputeRate)}</span>
                <span className="metric-label">Dispute-Free</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default detailed variant
  return (
    <div className={`reputation-display detailed ${className}`}>
      <div className="reputation-header">
        <div className="overall-section">
          <StarRating
            rating={reputation.overall}
            size="medium"
            showValue
            showCount
            count={reputation.reviewCount}
          />
          <span className="transaction-info">
            {reputation.totalTransactions} transaction{reputation.totalTransactions !== 1 ? 's' : ''}
          </span>
        </div>
        
        {showTrustLevel && (
          <div className="trust-badge" style={{ color: trustLevelInfo.color }}>
            <span className="trust-icon">{trustLevelInfo.icon}</span>
            <div className="trust-info">
              <span className="trust-name">{trustLevelInfo.name}</span>
              <span className="trust-description">{trustLevelInfo.description}</span>
            </div>
          </div>
        )}
      </div>

      <div className="category-breakdown">
        <div className="category-item">
          <div className="category-header">
            <span className="category-label">Punctuality</span>
            <StarRating rating={reputation.punctuality} size="small" showValue />
          </div>
        </div>
        
        <div className="category-item">
          <div className="category-header">
            <span className="category-label">Communication</span>
            <StarRating rating={reputation.communication} size="small" showValue />
          </div>
        </div>
        
        <div className="category-item">
          <div className="category-header">
            <span className="category-label">Product Quality</span>
            <StarRating rating={reputation.productQuality} size="small" showValue />
          </div>
        </div>
      </div>

      {showMetrics && metrics && (
        <div className="additional-metrics">
          <div className="metrics-row">
            <div className="metric">
              <span className="metric-label">Success Rate</span>
              <span className="metric-value">{formatPercentage(metrics.successRate)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">On-Time Delivery</span>
              <span className="metric-value">{formatPercentage(metrics.onTimeDeliveryRate)}</span>
            </div>
          </div>
          <div className="metrics-row">
            <div className="metric">
              <span className="metric-label">Avg Response Time</span>
              <span className="metric-value">{formatResponseTime(metrics.averageResponseTime)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Repeat Customers</span>
              <span className="metric-value">{formatPercentage(metrics.repeatCustomerRate)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="reputation-footer">
        <span className="last-updated">
          Updated {new Date(reputation.lastUpdated).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default ReputationDisplay;