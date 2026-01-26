/**
 * Review Form Component - Form for submitting reviews and ratings
 * Supports Requirements: 4.3, 4.4 - Review submission for reputation system
 */

import React, { useState } from 'react';
import { ReviewSubmission, ReviewRating } from '../types/review';
import StarRating from './StarRating';
import LoadingSpinner from './LoadingSpinner';
import './ReviewForm.css';

interface ReviewFormProps {
  dealId: string;
  revieweeId: string;
  revieweeName: string;
  commodityName: string;
  onSubmit: (review: ReviewSubmission) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  dealId,
  revieweeId,
  revieweeName,
  commodityName,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [ratings, setRatings] = useState<ReviewRating[]>([
    { category: 'overall', score: 0 },
    { category: 'punctuality', score: 0 },
    { category: 'communication', score: 0 },
    { category: 'productQuality', score: 0 }
  ]);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRatingChange = (category: string, score: number) => {
    setRatings(prev => 
      prev.map(rating => 
        rating.category === category 
          ? { ...rating, score }
          : rating
      )
    );
    
    // Clear error for this category
    if (errors[category]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[category];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Check if all ratings are provided
    ratings.forEach(rating => {
      if (rating.score === 0) {
        newErrors[rating.category] = 'Please provide a rating';
      }
    });

    // Check comment length
    if (comment.trim().length < 10) {
      newErrors.comment = 'Please provide a comment with at least 10 characters';
    } else if (comment.length > 500) {
      newErrors.comment = 'Comment must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const reviewData: ReviewSubmission = {
      dealId,
      revieweeId,
      ratings,
      comment: comment.trim(),
      isAnonymous
    };

    try {
      await onSubmit(reviewData);
    } catch (error) {
      console.error('Failed to submit review:', error);
      setErrors({ submit: 'Failed to submit review. Please try again.' });
    }
  };

  const getCategoryLabel = (category: string): string => {
    const labels = {
      overall: 'Overall Experience',
      punctuality: 'Punctuality',
      communication: 'Communication',
      productQuality: 'Product Quality'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getCategoryDescription = (category: string): string => {
    const descriptions = {
      overall: 'How would you rate your overall experience?',
      punctuality: 'Were they on time for deliveries and responses?',
      communication: 'How clear and responsive was their communication?',
      productQuality: 'How was the quality of the products/services?'
    };
    return descriptions[category as keyof typeof descriptions] || '';
  };

  return (
    <div className="review-form-container">
      <div className="review-form-header">
        <h2>Review Your Experience</h2>
        <p>
          Share your experience trading <strong>{commodityName}</strong> with{' '}
          <strong>{revieweeName}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="review-form">
        <div className="ratings-section">
          <h3>Rate Your Experience</h3>
          
          {ratings.map(rating => (
            <div key={rating.category} className="rating-item">
              <div className="rating-header">
                <label className="rating-label">
                  {getCategoryLabel(rating.category)}
                </label>
                <p className="rating-description">
                  {getCategoryDescription(rating.category)}
                </p>
              </div>
              
              <div className="rating-input">
                <StarRating
                  rating={rating.score}
                  interactive
                  size="large"
                  showValue
                  onChange={(score) => handleRatingChange(rating.category, score)}
                />
              </div>
              
              {errors[rating.category] && (
                <span className="error-message">{errors[rating.category]}</span>
              )}
            </div>
          ))}
        </div>

        <div className="comment-section">
          <label htmlFor="comment" className="comment-label">
            Share Your Experience
          </label>
          <p className="comment-description">
            Tell others about your experience. What went well? What could be improved?
          </p>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describe your experience with this trader..."
            className={`comment-textarea ${errors.comment ? 'error' : ''}`}
            rows={4}
            maxLength={500}
            disabled={isLoading}
          />
          <div className="comment-footer">
            <span className="character-count">
              {comment.length}/500 characters
            </span>
            {errors.comment && (
              <span className="error-message">{errors.comment}</span>
            )}
          </div>
        </div>

        <div className="options-section">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              disabled={isLoading}
            />
            <span className="checkbox-text">
              Submit this review anonymously
            </span>
          </label>
          <p className="option-description">
            Your name will not be shown with this review
          </p>
        </div>

        {errors.submit && (
          <div className="error-banner">
            {errors.submit}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="small" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;