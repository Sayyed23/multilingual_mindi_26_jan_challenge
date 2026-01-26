/**
 * Reputation Service for managing user reputation, reviews, and transaction history
 * Supports Requirements: 4.3, 4.4 - Reputation system and user reviews
 */

import { 
  Review, 
  ReviewSummary, 
  ReviewSubmission, 
  ReviewFilter,
  TransactionHistory,
  ReputationMetrics,
  ReviewResponse
} from '../types/review';
import { ReputationScore } from '../types/user';
import { ApiResponse } from '../types/api';
import { authService } from './authService';

const API_BASE_URL = (typeof window !== 'undefined' && (window as any).ENV?.VITE_API_BASE_URL) || 'http://localhost:3000/api';

class ReputationService {
  /**
   * Submit a review for a completed deal
   */
  async submitReview(reviewData: ReviewSubmission): Promise<Review> {
    const response = await this.makeRequest<{ review: Review }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
    return response.data!.review;
  }

  /**
   * Get reviews for a specific user
   */
  async getUserReviews(
    userId: string, 
    filter?: ReviewFilter,
    page: number = 1,
    limit: number = 10
  ): Promise<{ reviews: Review[]; total: number; hasMore: boolean }> {
    const searchParams = new URLSearchParams();
    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());
    
    if (filter?.rating) searchParams.append('rating', filter.rating.toString());
    if (filter?.category) searchParams.append('category', filter.category);
    if (filter?.verifiedOnly) searchParams.append('verifiedOnly', 'true');
    if (filter?.sortBy) searchParams.append('sortBy', filter.sortBy);
    if (filter?.dateRange) {
      searchParams.append('startDate', filter.dateRange.start.toISOString());
      searchParams.append('endDate', filter.dateRange.end.toISOString());
    }

    const response = await this.makeRequest<{
      reviews: Review[];
      total: number;
      hasMore: boolean;
    }>(`/users/${userId}/reviews?${searchParams}`);
    
    return response.data!;
  }

  /**
   * Get review summary for a user
   */
  async getUserReviewSummary(userId: string): Promise<ReviewSummary> {
    const response = await this.makeRequest<{ summary: ReviewSummary }>(`/users/${userId}/reviews/summary`);
    return response.data!.summary;
  }

  /**
   * Get transaction history for a user
   */
  async getTransactionHistory(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ transactions: TransactionHistory[]; total: number; hasMore: boolean }> {
    const searchParams = new URLSearchParams();
    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());

    const response = await this.makeRequest<{
      transactions: TransactionHistory[];
      total: number;
      hasMore: boolean;
    }>(`/users/${userId}/transactions?${searchParams}`);
    
    return response.data!;
  }

  /**
   * Get current user's transaction history
   */
  async getCurrentUserTransactionHistory(
    page: number = 1,
    limit: number = 20
  ): Promise<{ transactions: TransactionHistory[]; total: number; hasMore: boolean }> {
    const searchParams = new URLSearchParams();
    searchParams.append('page', page.toString());
    searchParams.append('limit', limit.toString());

    const response = await this.makeRequest<{
      transactions: TransactionHistory[];
      total: number;
      hasMore: boolean;
    }>(`/users/me/transactions?${searchParams}`);
    
    return response.data!;
  }

  /**
   * Get reputation metrics for a user
   */
  async getReputationMetrics(userId: string): Promise<ReputationMetrics> {
    const response = await this.makeRequest<{ metrics: ReputationMetrics }>(`/users/${userId}/reputation/metrics`);
    return response.data!.metrics;
  }

  /**
   * Get current user's reputation metrics
   */
  async getCurrentUserReputationMetrics(): Promise<ReputationMetrics> {
    const response = await this.makeRequest<{ metrics: ReputationMetrics }>('/users/me/reputation/metrics');
    return response.data!.metrics;
  }

  /**
   * Update reputation score based on transaction completion
   */
  async updateReputationScore(
    userId: string,
    transactionData: {
      dealId: string;
      wasOnTime: boolean;
      communicationRating: number;
      overallSatisfaction: number;
    }
  ): Promise<ReputationScore> {
    const response = await this.makeRequest<{ reputation: ReputationScore }>(`/users/${userId}/reputation/update`, {
      method: 'POST',
      body: JSON.stringify(transactionData)
    });
    return response.data!.reputation;
  }

  /**
   * Get pending reviews (deals that need to be reviewed)
   */
  async getPendingReviews(): Promise<{
    id: string;
    dealId: string;
    counterpartyId: string;
    counterpartyName: string;
    commodityName: string;
    completedAt: Date;
    daysRemaining: number;
  }[]> {
    const response = await this.makeRequest<{
      pendingReviews: {
        id: string;
        dealId: string;
        counterpartyId: string;
        counterpartyName: string;
        commodityName: string;
        completedAt: Date;
        daysRemaining: number;
      }[];
    }>('/users/me/reviews/pending');
    
    return response.data!.pendingReviews;
  }

  /**
   * Respond to a review
   */
  async respondToReview(reviewId: string, response: string): Promise<ReviewResponse> {
    const responseData = await this.makeRequest<{ response: ReviewResponse }>(`/reviews/${reviewId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response })
    });
    return responseData.data!.response;
  }

  /**
   * Report a review as inappropriate
   */
  async reportReview(reviewId: string, reason: string): Promise<void> {
    await this.makeRequest(`/reviews/${reviewId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  /**
   * Mark a review as helpful
   */
  async markReviewHelpful(reviewId: string): Promise<void> {
    await this.makeRequest(`/reviews/${reviewId}/helpful`, {
      method: 'POST'
    });
  }

  /**
   * Calculate trust level based on reputation metrics
   */
  calculateTrustLevel(metrics: ReputationMetrics): 'new' | 'bronze' | 'silver' | 'gold' | 'platinum' {
    const { totalTransactions, overallScore, successRate, disputeRate } = metrics;

    if (totalTransactions < 5) return 'new';
    
    if (totalTransactions >= 100 && overallScore >= 4.5 && successRate >= 95 && disputeRate <= 2) {
      return 'platinum';
    }
    
    if (totalTransactions >= 50 && overallScore >= 4.2 && successRate >= 90 && disputeRate <= 5) {
      return 'gold';
    }
    
    if (totalTransactions >= 20 && overallScore >= 3.8 && successRate >= 85 && disputeRate <= 10) {
      return 'silver';
    }
    
    if (totalTransactions >= 5 && overallScore >= 3.0 && successRate >= 75) {
      return 'bronze';
    }
    
    return 'new';
  }

  /**
   * Get trust level display information
   */
  getTrustLevelInfo(level: 'new' | 'bronze' | 'silver' | 'gold' | 'platinum') {
    const levels = {
      new: {
        name: 'New Trader',
        color: '#6B7280',
        icon: '🌱',
        description: 'Just getting started'
      },
      bronze: {
        name: 'Bronze Trader',
        color: '#CD7F32',
        icon: '🥉',
        description: 'Reliable trader with good feedback'
      },
      silver: {
        name: 'Silver Trader',
        color: '#C0C0C0',
        icon: '🥈',
        description: 'Experienced trader with excellent reputation'
      },
      gold: {
        name: 'Gold Trader',
        color: '#FFD700',
        icon: '🥇',
        description: 'Top-rated trader with outstanding performance'
      },
      platinum: {
        name: 'Platinum Trader',
        color: '#E5E4E2',
        icon: '💎',
        description: 'Elite trader with exceptional track record'
      }
    };
    
    return levels[level];
  }

  /**
   * Make authenticated API request
   */
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    // Add authorization header
    const accessToken = authService.getAccessToken();
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle token expiry
        if (response.status === 401 && accessToken) {
          try {
            await authService.refreshAccessToken();
            // Retry the original request with new token
            const newToken = authService.getAccessToken();
            if (newToken) {
              headers.Authorization = `Bearer ${newToken}`;
              const retryResponse = await fetch(url, { ...config, headers });
              return await retryResponse.json();
            }
          } catch (refreshError) {
            throw new Error('Authentication failed');
          }
        }
        
        throw new Error(data.error?.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const reputationService = new ReputationService();
export default reputationService;