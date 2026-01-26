/**
 * Unit tests for ReputationDisplay component
 * Tests reputation display in different variants
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReputationDisplay from '../ReputationDisplay';
import { ReputationScore } from '../../types/user';
import { ReputationMetrics } from '../../types/review';

const mockReputation: ReputationScore = {
  overall: 4.2,
  punctuality: 4.5,
  communication: 4.0,
  productQuality: 4.1,
  totalTransactions: 25,
  reviewCount: 18,
  lastUpdated: new Date('2024-01-15')
};

const mockMetrics: ReputationMetrics = {
  userId: 'user123',
  overallScore: 4.2,
  punctualityScore: 4.5,
  communicationScore: 4.0,
  productQualityScore: 4.1,
  totalTransactions: 25,
  completedTransactions: 23,
  successRate: 92,
  averageResponseTime: 45,
  onTimeDeliveryRate: 88,
  onTimePaymentRate: 95,
  disputeRate: 4,
  repeatCustomerRate: 35,
  lastUpdated: new Date('2024-01-15'),
  trustLevel: 'silver'
};

describe('ReputationDisplay Component', () => {
  it('renders compact variant correctly', () => {
    render(<ReputationDisplay reputation={mockReputation} variant="compact" />);
    
    expect(screen.getByText('4.2')).toBeInTheDocument();
    expect(screen.getByText('(18 reviews)')).toBeInTheDocument();
    expect(screen.getByText('New Trader')).toBeInTheDocument(); // Without metrics, defaults to 'new'
  });

  it('renders detailed variant with all categories', () => {
    render(<ReputationDisplay reputation={mockReputation} variant="detailed" />);
    
    expect(screen.getByText('Punctuality')).toBeInTheDocument();
    expect(screen.getByText('Communication')).toBeInTheDocument();
    expect(screen.getByText('Product Quality')).toBeInTheDocument();
    expect(screen.getByText('25 transactions')).toBeInTheDocument();
  });

  it('renders card variant with header', () => {
    render(<ReputationDisplay reputation={mockReputation} variant="card" />);
    
    expect(screen.getByText('Reputation')).toBeInTheDocument();
    expect(screen.getByText('Based on 18 reviews')).toBeInTheDocument();
  });

  it('shows metrics when showMetrics is true', () => {
    render(
      <ReputationDisplay 
        reputation={mockReputation} 
        metrics={mockMetrics}
        variant="card"
        showMetrics={true}
      />
    );
    
    expect(screen.getByText('92%')).toBeInTheDocument(); // Success Rate
    expect(screen.getByText('88%')).toBeInTheDocument(); // On-Time Delivery
    expect(screen.getByText('45m')).toBeInTheDocument(); // Avg Response
  });

  it('hides trust level when showTrustLevel is false', () => {
    render(
      <ReputationDisplay 
        reputation={mockReputation} 
        metrics={mockMetrics}
        showTrustLevel={false}
      />
    );
    
    expect(screen.queryByText('New Trader')).not.toBeInTheDocument();
  });

  it('formats response time correctly for hours', () => {
    const metricsWithLongResponse = {
      ...mockMetrics,
      averageResponseTime: 150 // 2.5 hours
    };
    
    render(
      <ReputationDisplay 
        reputation={mockReputation} 
        metrics={metricsWithLongResponse}
        variant="card"
        showMetrics={true}
      />
    );
    
    expect(screen.getByText('3h')).toBeInTheDocument();
  });

  it('displays last updated date', () => {
    render(<ReputationDisplay reputation={mockReputation} variant="detailed" />);
    
    expect(screen.getByText(/Updated/)).toBeInTheDocument();
  });

  it('handles zero reviews gracefully', () => {
    const zeroReviewsReputation = {
      ...mockReputation,
      reviewCount: 0,
      overall: 0
    };
    
    render(<ReputationDisplay reputation={zeroReviewsReputation} variant="compact" />);
    
    expect(screen.getByText('(0 reviews)')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <ReputationDisplay 
        reputation={mockReputation} 
        className="custom-reputation"
      />
    );
    
    const container = screen.getByText('4.2').closest('.reputation-display');
    expect(container).toHaveClass('custom-reputation');
  });

  it('shows trust level icon and description', () => {
    render(
      <ReputationDisplay 
        reputation={mockReputation} 
        metrics={mockMetrics}
        variant="detailed"
        showTrustLevel={true}
      />
    );
    
    expect(screen.getByText('🥈')).toBeInTheDocument(); // Silver icon
    expect(screen.getByText('Experienced trader with excellent reputation')).toBeInTheDocument();
  });

  it('handles missing metrics gracefully', () => {
    render(
      <ReputationDisplay 
        reputation={mockReputation} 
        variant="card"
        showMetrics={true}
      />
    );
    
    // Should not crash and should show basic reputation info
    expect(screen.getByText('4.2')).toBeInTheDocument();
  });
});