/**
 * Review and rating-related type definitions for the Multilingual Mandi platform
 * Supports Requirements: 4.3, 4.4 - Reputation system and user reviews
 */

export type ReviewCategory = 'punctuality' | 'communication' | 'productQuality' | 'overall';

export interface ReviewRating {
  category: ReviewCategory;
  score: number; // 1-5 scale
}

export interface Review {
  id: string;
  dealId: string;
  reviewerId: string;
  revieweeId: string;
  ratings: ReviewRating[];
  comment: string;
  isAnonymous: boolean;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt?: Date;
  metadata: {
    commodityId: string;
    commodityName: string;
    dealAmount: number;
    reviewerRole: 'vendor' | 'buyer';
    helpfulVotes: number;
    reportCount: number;
  };
}

export interface ReviewSummary {
  userId: string;
  overallRating: number;
  totalReviews: number;
  ratingDistribution: {
    [rating: number]: number; // rating (1-5) -> count
  };
  categoryAverages: {
    punctuality: number;
    communication: number;
    productQuality: number;
  };
  recentReviews: Review[];
  verifiedReviewsCount: number;
}

export interface ReviewSubmission {
  dealId: string;
  revieweeId: string;
  ratings: ReviewRating[];
  comment: string;
  isAnonymous?: boolean;
}

export interface ReviewFilter {
  rating?: number;
  category?: ReviewCategory;
  dateRange?: {
    start: Date;
    end: Date;
  };
  verifiedOnly?: boolean;
  sortBy?: 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating' | 'most_helpful';
}

export interface TransactionHistory {
  id: string;
  dealId: string;
  counterpartyId: string;
  counterpartyName: string;
  commodityName: string;
  quantity: number;
  unit: string;
  totalAmount: number;
  userRole: 'vendor' | 'buyer';
  status: 'completed' | 'disputed' | 'cancelled';
  completedAt: Date;
  paymentStatus: 'on_time' | 'late' | 'very_late' | 'defaulted';
  deliveryStatus: 'on_time' | 'late' | 'very_late' | 'failed';
  hasReview: boolean;
  reviewId?: string;
  disputeId?: string;
}

export interface ReputationMetrics {
  userId: string;
  overallScore: number; // 1-5 scale
  punctualityScore: number;
  communicationScore: number;
  productQualityScore: number;
  totalTransactions: number;
  completedTransactions: number;
  successRate: number; // percentage
  averageResponseTime: number; // in minutes
  onTimeDeliveryRate: number; // percentage
  onTimePaymentRate: number; // percentage
  disputeRate: number; // percentage
  repeatCustomerRate: number; // percentage
  lastUpdated: Date;
  trustLevel: 'new' | 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface ReviewResponse {
  id: string;
  reviewId: string;
  responderId: string;
  response: string;
  createdAt: Date;
  isOwnerResponse: boolean; // true if response is from the reviewed user
}