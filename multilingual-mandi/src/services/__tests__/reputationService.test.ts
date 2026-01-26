/**
 * Unit tests for ReputationService
 * Tests reputation service functionality and API interactions
 */

import { reputationService } from '../reputationService';
import { authService } from '../authService';

// Mock the authService
jest.mock('../authService', () => ({
  authService: {
    getAccessToken: jest.fn(),
    refreshAccessToken: jest.fn()
  }
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('ReputationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authService.getAccessToken as jest.Mock).mockReturnValue('mock-token');
  });

  describe('submitReview', () => {
    it('submits review successfully', async () => {
      const mockReview = {
        id: 'review123',
        dealId: 'deal123',
        reviewerId: 'user1',
        revieweeId: 'user2',
        ratings: [
          { category: 'overall' as const, score: 4 },
          { category: 'punctuality' as const, score: 5 }
        ],
        comment: 'Great experience!',
        isAnonymous: false,
        isVerifiedPurchase: true,
        createdAt: new Date(),
        metadata: {
          commodityId: 'commodity1',
          commodityName: 'Rice',
          dealAmount: 5000,
          reviewerRole: 'buyer' as const,
          helpfulVotes: 0,
          reportCount: 0
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { review: mockReview } })
      });

      const reviewData = {
        dealId: 'deal123',
        revieweeId: 'user2',
        ratings: [
          { category: 'overall' as const, score: 4 },
          { category: 'punctuality' as const, score: 5 }
        ],
        comment: 'Great experience!',
        isAnonymous: false
      };

      const result = await reputationService.submitReview(reviewData);

      expect(result).toEqual(mockReview);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/reviews'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(reviewData)
        })
      );
    });
  });

  describe('getUserReviews', () => {
    it('fetches user reviews with filters', async () => {
      const mockReviews = [
        {
          id: 'review1',
          dealId: 'deal1',
          reviewerId: 'user1',
          revieweeId: 'user2',
          ratings: [{ category: 'overall' as const, score: 4 }],
          comment: 'Good',
          isAnonymous: false,
          isVerifiedPurchase: true,
          createdAt: new Date(),
          metadata: {
            commodityId: 'commodity1',
            commodityName: 'Rice',
            dealAmount: 5000,
            reviewerRole: 'buyer' as const,
            helpfulVotes: 2,
            reportCount: 0
          }
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            reviews: mockReviews,
            total: 1,
            hasMore: false
          }
        })
      });

      const filter = {
        rating: 4,
        category: 'overall' as const,
        verifiedOnly: true,
        sortBy: 'newest' as const
      };

      const result = await reputationService.getUserReviews('user123', filter, 1, 10);

      expect(result.reviews).toEqual(mockReviews);
      expect(result.total).toBe(1);
      expect(result.hasMore).toBe(false);
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('rating=4&category=overall&verifiedOnly=true&sortBy=newest'),
        expect.any(Object)
      );
    });
  });

  describe('calculateTrustLevel', () => {
    it('returns "new" for users with less than 5 transactions', () => {
      const metrics = {
        userId: 'user1',
        overallScore: 4.5,
        punctualityScore: 4.5,
        communicationScore: 4.5,
        productQualityScore: 4.5,
        totalTransactions: 3,
        completedTransactions: 3,
        successRate: 100,
        averageResponseTime: 30,
        onTimeDeliveryRate: 100,
        onTimePaymentRate: 100,
        disputeRate: 0,
        repeatCustomerRate: 50,
        lastUpdated: new Date(),
        trustLevel: 'new' as const
      };

      const level = reputationService.calculateTrustLevel(metrics);
      expect(level).toBe('new');
    });

    it('returns "platinum" for exceptional traders', () => {
      const metrics = {
        userId: 'user1',
        overallScore: 4.8,
        punctualityScore: 4.8,
        communicationScore: 4.8,
        productQualityScore: 4.8,
        totalTransactions: 150,
        completedTransactions: 148,
        successRate: 98,
        averageResponseTime: 15,
        onTimeDeliveryRate: 97,
        onTimePaymentRate: 99,
        disputeRate: 1,
        repeatCustomerRate: 75,
        lastUpdated: new Date(),
        trustLevel: 'platinum' as const
      };

      const level = reputationService.calculateTrustLevel(metrics);
      expect(level).toBe('platinum');
    });

    it('returns "gold" for top-rated traders', () => {
      const metrics = {
        userId: 'user1',
        overallScore: 4.3,
        punctualityScore: 4.3,
        communicationScore: 4.3,
        productQualityScore: 4.3,
        totalTransactions: 60,
        completedTransactions: 55,
        successRate: 92,
        averageResponseTime: 25,
        onTimeDeliveryRate: 90,
        onTimePaymentRate: 95,
        disputeRate: 3,
        repeatCustomerRate: 60,
        lastUpdated: new Date(),
        trustLevel: 'gold' as const
      };

      const level = reputationService.calculateTrustLevel(metrics);
      expect(level).toBe('gold');
    });

    it('returns "silver" for experienced traders', () => {
      const metrics = {
        userId: 'user1',
        overallScore: 3.9,
        punctualityScore: 3.9,
        communicationScore: 3.9,
        productQualityScore: 3.9,
        totalTransactions: 25,
        completedTransactions: 22,
        successRate: 88,
        averageResponseTime: 45,
        onTimeDeliveryRate: 85,
        onTimePaymentRate: 90,
        disputeRate: 8,
        repeatCustomerRate: 40,
        lastUpdated: new Date(),
        trustLevel: 'silver' as const
      };

      const level = reputationService.calculateTrustLevel(metrics);
      expect(level).toBe('silver');
    });

    it('returns "bronze" for reliable traders', () => {
      const metrics = {
        userId: 'user1',
        overallScore: 3.2,
        punctualityScore: 3.2,
        communicationScore: 3.2,
        productQualityScore: 3.2,
        totalTransactions: 8,
        completedTransactions: 6,
        successRate: 75,
        averageResponseTime: 60,
        onTimeDeliveryRate: 75,
        onTimePaymentRate: 80,
        disputeRate: 12,
        repeatCustomerRate: 25,
        lastUpdated: new Date(),
        trustLevel: 'bronze' as const
      };

      const level = reputationService.calculateTrustLevel(metrics);
      expect(level).toBe('bronze');
    });
  });

  describe('getTrustLevelInfo', () => {
    it('returns correct info for each trust level', () => {
      const newInfo = reputationService.getTrustLevelInfo('new');
      expect(newInfo.name).toBe('New Trader');
      expect(newInfo.icon).toBe('🌱');
      expect(newInfo.color).toBe('#6B7280');

      const platinumInfo = reputationService.getTrustLevelInfo('platinum');
      expect(platinumInfo.name).toBe('Platinum Trader');
      expect(platinumInfo.icon).toBe('💎');
      expect(platinumInfo.color).toBe('#E5E4E2');
    });
  });

  describe('error handling', () => {
    it('handles API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: { message: 'Bad request' } })
      });

      await expect(
        reputationService.submitReview({
          dealId: 'deal123',
          revieweeId: 'user2',
          ratings: [],
          comment: 'Test'
        })
      ).rejects.toThrow('Bad request');
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        reputationService.submitReview({
          dealId: 'deal123',
          revieweeId: 'user2',
          ratings: [],
          comment: 'Test'
        })
      ).rejects.toThrow('Network error');
    });

    it('handles token refresh on 401 error', async () => {
      // First call returns 401
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: { message: 'Unauthorized' } })
      });

      // Mock successful token refresh
      (authService.refreshAccessToken as jest.Mock).mockResolvedValueOnce(undefined);
      (authService.getAccessToken as jest.Mock).mockReturnValueOnce('new-token');

      // Second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { review: { id: 'review123' } } })
      });

      const result = await reputationService.submitReview({
        dealId: 'deal123',
        revieweeId: 'user2',
        ratings: [],
        comment: 'Test'
      });

      expect(authService.refreshAccessToken).toHaveBeenCalled();
      expect(result).toEqual({ id: 'review123' });
    });
  });
});