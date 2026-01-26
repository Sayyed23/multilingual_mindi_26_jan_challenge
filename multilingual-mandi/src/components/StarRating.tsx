/**
 * Star Rating Component - Displays and allows input of star ratings
 * Supports Requirements: 4.3, 4.4 - Rating display and input for reputation system
 */

import React, { useState } from 'react';
import './StarRating.css';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
  showValue?: boolean;
  showCount?: boolean;
  count?: number;
  onChange?: (rating: number) => void;
  disabled?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'medium',
  interactive = false,
  showValue = false,
  showCount = false,
  count,
  onChange,
  disabled = false,
  className = ''
}) => {
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isHovering, setIsHovering] = useState(false);

  const handleStarClick = (starRating: number) => {
    if (!interactive || disabled || !onChange) return;
    onChange(starRating);
  };

  const handleStarHover = (starRating: number) => {
    if (!interactive || disabled) return;
    setHoverRating(starRating);
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    if (!interactive || disabled) return;
    setIsHovering(false);
    setHoverRating(0);
  };

  const getStarClass = (starIndex: number): string => {
    const displayRating = isHovering ? hoverRating : rating;
    const classes = ['star'];
    
    if (starIndex <= displayRating) {
      classes.push('filled');
    } else if (starIndex - 0.5 <= displayRating) {
      classes.push('half-filled');
    } else {
      classes.push('empty');
    }
    
    if (interactive && !disabled) {
      classes.push('interactive');
    }
    
    if (disabled) {
      classes.push('disabled');
    }
    
    return classes.join(' ');
  };

  const formatRating = (value: number): string => {
    return value % 1 === 0 ? value.toString() : value.toFixed(1);
  };

  return (
    <div 
      className={`star-rating ${size} ${className}`}
      onMouseLeave={handleMouseLeave}
    >
      <div className="stars-container">
        {Array.from({ length: maxRating }, (_, index) => {
          const starIndex = index + 1;
          return (
            <button
              key={starIndex}
              type="button"
              className={getStarClass(starIndex)}
              onClick={() => handleStarClick(starIndex)}
              onMouseEnter={() => handleStarHover(starIndex)}
              disabled={!interactive || disabled}
              aria-label={`Rate ${starIndex} star${starIndex !== 1 ? 's' : ''}`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="star-icon"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          );
        })}
      </div>
      
      {(showValue || showCount) && (
        <div className="rating-info">
          {showValue && (
            <span className="rating-value">
              {formatRating(isHovering ? hoverRating : rating)}
            </span>
          )}
          {showCount && count !== undefined && (
            <span className="rating-count">
              ({count} review{count !== 1 ? 's' : ''})
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StarRating;