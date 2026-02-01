import React, { useState, useEffect } from 'react';
import {
  Star,
  MessageSquare,
  User,
  Calendar,
  Package,
  DollarSign,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { dealManagementService, dealCompletionManager } from '../services/dealManagement';
import { useAuth } from '../hooks/useAuth';
import type { Deal, Feedback } from '../types';

interface RatingReviewProps {
  dealId: string;
  onRatingSubmitted?: (feedback: Feedback) => void;
  showExistingReviews?: boolean;
}

interface RatingCategory {
  key: keyof Feedback['categories'];
  label: string;
  description: string;
}

const ratingCategories: RatingCategory[] = [
  {
    key: 'communication',
    label: 'Communication',
    description: 'How well did they communicate throughout the deal?'
  },
  {
    key: 'reliability',
    label: 'Reliability',
    description: 'Did they meet their commitments and deadlines?'
  },
  {
    key: 'quality',
    label: 'Quality',
    description: 'How was the quality of goods/service provided?'
  },
  {
    key: 'timeliness',
    label: 'Timeliness',
    description: 'Were they punctual with deliveries and responses?'
  }
];

const RatingReview: React.FC<RatingReviewProps> = ({
  dealId,
  onRatingSubmitted,
  showExistingReviews = true
}) => {
  const { user } = useAuth();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [overallRating, setOverallRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({
    communication: 0,
    reliability: 0,
    quality: 0,
    timeliness: 0
  });
  const [comment, setComment] = useState('');
  const [existingFeedback, setExistingFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'rate' | 'reviews'>('rate');

  useEffect(() => {
    loadDeal();
    if (showExistingReviews) {
      loadExistingReviews();
    }
  }, [dealId]);

  const loadDeal = async () => {
    try {
      setLoading(true);
      const dealData = await dealManagementService.getDeal(dealId);
      setDeal(dealData);
    } catch (error) {
      console.error('Failed to load deal:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingReviews = async () => {
    try {
      // In a real implementation, this would fetch reviews for the deal participants
      const mockReviews: Feedback[] = [
        {
          id: 'feedback-1',
          fromUserId: 'buyer-123',
          toUserId: 'seller-456',
          dealId,
          rating: 4,
          comment: 'Great quality wheat, delivered on time. Very professional seller.',
          categories: {
            communication: 5,
            reliability: 4,
            quality: 5,
            timeliness: 4
          },
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'feedback-2',
          fromUserId: 'seller-456',
          toUserId: 'buyer-123',
          dealId,
          rating: 5,
          comment: 'Excellent buyer, prompt payment and clear communication throughout.',
          categories: {
            communication: 5,
            reliability: 5,
            quality: 5,
            timeliness: 5
          },
          createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
        }
      ];

      setExistingFeedback(mockReviews);
    } catch (error) {
      console.error('Failed to load existing reviews:', error);
    }
  };

  const handleStarClick = (rating: number, category?: string) => {
    if (category) {
      setCategoryRatings(prev => ({
        ...prev,
        [category]: rating
      }));
    } else {
      setOverallRating(rating);
    }
  };

  const submitRating = async () => {
    if (!deal || !user || overallRating === 0) return;

    try {
      setLoading(true);

      const ratingData = {
        overallRating,
        categories: {
          communication: categoryRatings.communication,
          reliability: categoryRatings.reliability,
          quality: categoryRatings.quality,
          timeliness: categoryRatings.timeliness
        },
        comment: comment.trim()
      };

      const feedback = await dealCompletionManager.submitRating(dealId, ratingData);
      
      setSubmitted(true);
      onRatingSubmitted?.(feedback);
      
      // Add to existing feedback list
      setExistingFeedback(prev => [feedback, ...prev]);
      
    } catch (error) {
      console.error('Failed to submit rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, onStarClick?: (rating: number) => void, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    };

    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onStarClick?.(star)}
            disabled={!onStarClick}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } ${onStarClick ? 'hover:text-yellow-400 cursor-pointer' : 'cursor-default'}`}
          >
            <Star className="w-full h-full" />
          </button>
        ))}
      </div>
    );
  };

  const getCounterpartyRole = () => {
    if (!deal || !user) return '';
    return deal.buyerId === user.uid ? 'seller' : 'buyer';
  };

  const canSubmitRating = () => {
    return deal?.status === 'completed' && !submitted && user;
  };

  if (loading && !deal) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">Deal not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Rate & Review</h2>
            <p className="text-gray-500 mt-1">
              Share your experience with this {getCounterpartyRole()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-900">{deal.commodity}</div>
            <div className="text-sm text-gray-500">
              ₹{(deal.agreedPrice * deal.quantity).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Deal Summary */}
      <div className="bg-gray-50 p-4 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center">
            <Package className="h-4 w-4 mr-2 text-gray-400" />
            <span>{deal.quantity} {deal.unit}</span>
          </div>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
            <span>₹{deal.agreedPrice} per {deal.unit}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            <span>{deal.deliveryTerms.expectedDate.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            <span className="capitalize">{deal.status}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      {showExistingReviews && (
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['rate', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'rate' ? 'Rate & Review' : 'All Reviews'}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {activeTab === 'rate' && (
          <div className="space-y-6">
            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Thank you for your feedback!
                </h3>
                <p className="text-gray-600">
                  Your rating has been submitted and will help other users make informed decisions.
                </p>
              </div>
            ) : canSubmitRating() ? (
              <>
                {/* Overall Rating */}
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    How would you rate your overall experience?
                  </h3>
                  <div className="flex justify-center mb-2">
                    {renderStars(overallRating, setOverallRating, 'lg')}
                  </div>
                  <p className="text-sm text-gray-500">
                    {overallRating === 0 && 'Click to rate'}
                    {overallRating === 1 && 'Poor'}
                    {overallRating === 2 && 'Fair'}
                    {overallRating === 3 && 'Good'}
                    {overallRating === 4 && 'Very Good'}
                    {overallRating === 5 && 'Excellent'}
                  </p>
                </div>

                {/* Category Ratings */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Rate specific aspects
                  </h3>
                  <div className="space-y-4">
                    {ratingCategories.map((category) => (
                      <div key={category.key} className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{category.label}</h4>
                          <p className="text-sm text-gray-500">{category.description}</p>
                        </div>
                        <div className="ml-4">
                          {renderStars(
                            categoryRatings[category.key],
                            (rating) => handleStarClick(rating, category.key)
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-lg font-medium text-gray-900 mb-2">
                    Share your experience (optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell others about your experience with this trader..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    maxLength={500}
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {comment.length}/500 characters
                  </div>
                </div>

                {/* Submit Button */}
                <div className="text-center">
                  <button
                    onClick={submitRating}
                    disabled={overallRating === 0 || loading}
                    className="bg-yellow-500 text-white py-3 px-8 rounded-lg font-medium hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Star className="h-4 w-4 mr-2" />
                    )}
                    Submit Rating
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">
                  {deal.status !== 'completed' 
                    ? 'You can rate this deal once it is completed'
                    : 'You have already rated this deal'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {existingFeedback.length > 0 ? (
              <>
                {/* Reviews Summary */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">
                        {(existingFeedback.reduce((sum, f) => sum + f.rating, 0) / existingFeedback.length).toFixed(1)}
                      </div>
                      <div className="flex justify-center mb-1">
                        {renderStars(Math.round(existingFeedback.reduce((sum, f) => sum + f.rating, 0) / existingFeedback.length))}
                      </div>
                      <div className="text-sm text-gray-500">
                        {existingFeedback.length} review{existingFeedback.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = existingFeedback.filter(f => f.rating === rating).length;
                        const percentage = existingFeedback.length > 0 ? (count / existingFeedback.length) * 100 : 0;
                        return (
                          <div key={rating} className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{rating}</span>
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-8">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="space-y-3">
                      {ratingCategories.map((category) => {
                        const avgRating = existingFeedback.length > 0
                          ? existingFeedback.reduce((sum, f) => sum + f.categories[category.key], 0) / existingFeedback.length
                          : 0;
                        return (
                          <div key={category.key} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{category.label}</span>
                            <div className="flex items-center space-x-2">
                              {renderStars(Math.round(avgRating), undefined, 'sm')}
                              <span className="text-sm text-gray-600">{avgRating.toFixed(1)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Individual Reviews */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Reviews</h3>
                  {existingFeedback.map((feedback) => (
                    <div key={feedback.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {feedback.fromUserId.substring(0, 12)}...
                            </div>
                            <div className="text-sm text-gray-500">
                              {feedback.createdAt.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {renderStars(feedback.rating)}
                          <span className="text-sm font-medium text-gray-900">
                            {feedback.rating}.0
                          </span>
                        </div>
                      </div>
                      
                      {feedback.comment && (
                        <p className="text-gray-700 mb-3">{feedback.comment}</p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        {ratingCategories.map((category) => (
                          <div key={category.key} className="flex items-center justify-between">
                            <span className="text-gray-600">{category.label}</span>
                            <div className="flex items-center space-x-1">
                              {renderStars(feedback.categories[category.key], undefined, 'sm')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No reviews yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingReview;