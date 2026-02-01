// Trust Indicators Component Tests


import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TrustIndicators from '../TrustIndicators';
import type { TrustIndicators as ITrustIndicators } from '../../types';

const mockTrustIndicators: ITrustIndicators = {
  overallScore: 85,
  transactionCount: 25,
  averageRating: 4.2,
  verificationBadges: [
    {
      type: 'identity',
      verified: true,
      verifiedAt: new Date('2024-01-15'),
      expiresAt: new Date('2025-01-15')
    },
    {
      type: 'phone',
      verified: true,
      verifiedAt: new Date('2024-01-10'),
      expiresAt: new Date('2025-01-10')
    },
    {
      type: 'email',
      verified: false
    }
  ],
  recentFeedback: [
    {
      id: '1',
      fromUserId: 'user1',
      toUserId: 'user2',
      dealId: 'deal1',
      rating: 5,
      comment: 'Excellent service and quality products',
      categories: {
        communication: 5,
        reliability: 5,
        quality: 5,
        timeliness: 4
      },
      createdAt: new Date('2024-01-20')
    },
    {
      id: '2',
      fromUserId: 'user3',
      toUserId: 'user2',
      dealId: 'deal2',
      rating: 4,
      categories: {
        communication: 4,
        reliability: 4,
        quality: 4,
        timeliness: 4
      },
      createdAt: new Date('2024-01-18')
    }
  ]
};

describe('TrustIndicators', () => {
  it('renders trust score and basic information', () => {
    render(<TrustIndicators trustIndicators={mockTrustIndicators} />);

    expect(screen.getByText('Trust & Verification')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
  });

  it('renders verification badges', () => {
    render(<TrustIndicators trustIndicators={mockTrustIndicators} />);

    expect(screen.getByText('Verification Status')).toBeInTheDocument();
    expect(screen.getByText('Identity')).toBeInTheDocument();
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('shows recent feedback when showDetails is true', () => {
    render(<TrustIndicators trustIndicators={mockTrustIndicators} showDetails />);

    expect(screen.getByText('Recent Feedback')).toBeInTheDocument();
    expect(screen.getByText('Excellent service and quality products')).toBeInTheDocument();
  });

  it('renders in compact mode', () => {
    render(<TrustIndicators trustIndicators={mockTrustIndicators} compact />);

    // In compact mode, should show trust score and verification badges inline
    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('(25)')).toBeInTheDocument();
  });

  it('displays correct trust score label', () => {
    const excellentTrustIndicators = { ...mockTrustIndicators, overallScore: 90 };
    render(<TrustIndicators trustIndicators={excellentTrustIndicators} />);

    expect(screen.getByText('Excellent (90)')).toBeInTheDocument();
  });

  it('shows average rating with stars', () => {
    render(<TrustIndicators trustIndicators={mockTrustIndicators} />);

    expect(screen.getByText('4.2 Average Rating')).toBeInTheDocument();
  });
});