// Trust Indicators Component
// Displays user trust score, verification badges, and transaction history

import React from 'react';
import {
  Shield,
  Star,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  MapPin,
  Building,
  CreditCard
} from 'lucide-react';
import type {
  TrustIndicators as ITrustIndicators,
  VerificationBadge
} from '../types';

interface TrustIndicatorsProps {
  trustIndicators: ITrustIndicators;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

export const TrustIndicators: React.FC<TrustIndicatorsProps> = ({
  trustIndicators,
  showDetails = false,
  compact = false,
  className = ''
}) => {
  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getTrustScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getVerificationIcon = (type: VerificationBadge['type']) => {
    switch (type) {
      case 'identity':
        return Shield;
      case 'business':
        return Building;
      case 'address':
        return MapPin;
      case 'phone':
        return Phone;
      case 'email':
        return Mail;
      case 'bank':
        return CreditCard;
      default:
        return Shield;
    }
  };

  const getVerificationLabel = (type: VerificationBadge['type']) => {
    switch (type) {
      case 'identity':
        return 'Identity';
      case 'business':
        return 'Business';
      case 'address':
        return 'Address';
      case 'phone':
        return 'Phone';
      case 'email':
        return 'Email';
      case 'bank':
        return 'Bank Account';
      default:
        return 'Unknown';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : i < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Trust Score */}
        <div className={`px-2 py-1 rounded-full border text-sm font-medium ${getTrustScoreColor(trustIndicators.overallScore)}`}>
          {trustIndicators.overallScore}
        </div>

        {/* Verification Badges */}
        <div className="flex items-center gap-1">
          {trustIndicators.verificationBadges
            .filter(badge => badge.verified)
            .slice(0, 3)
            .map((badge, index) => {
              const Icon = getVerificationIcon(badge.type);
              return (
                <Icon
                  key={index}
                  className="w-4 h-4 text-green-600"
                />
              );
            })}
          {trustIndicators.verificationBadges.filter(badge => badge.verified).length > 3 && (
            <span className="text-xs text-gray-500">+{trustIndicators.verificationBadges.filter(badge => badge.verified).length - 3}</span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {renderStars(trustIndicators.averageRating)}
          <span className="text-sm text-gray-600">({trustIndicators.transactionCount})</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Trust & Verification</h3>
        <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getTrustScoreColor(trustIndicators.overallScore)}`}>
          {getTrustScoreLabel(trustIndicators.overallScore)} ({trustIndicators.overallScore})
        </div>
      </div>

      {/* Trust Score Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">{trustIndicators.overallScore}</div>
          <div className="text-sm text-gray-600">Trust Score</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{trustIndicators.transactionCount}</div>
          <div className="text-sm text-gray-600">Transactions</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-1 mb-1">
            {renderStars(trustIndicators.averageRating)}
          </div>
          <div className="text-sm text-gray-600">{trustIndicators.averageRating.toFixed(1)} Average Rating</div>
        </div>
      </div>

      {/* Verification Badges */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-3">Verification Status</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {trustIndicators.verificationBadges.map((badge, index) => {
            const Icon = getVerificationIcon(badge.type);
            return (
              <div
                key={index}
                className={`flex items-center gap-2 p-3 rounded-lg border ${
                  badge.verified
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{getVerificationLabel(badge.type)}</div>
                  <div className="flex items-center gap-1 text-xs">
                    {badge.verified ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        Not Verified
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Feedback */}
      {showDetails && trustIndicators.recentFeedback.length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Recent Feedback</h4>
          <div className="space-y-3">
            {trustIndicators.recentFeedback.slice(0, 3).map((feedback, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {renderStars(feedback.rating)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {feedback.comment && (
                  <p className="text-sm text-gray-700">{feedback.comment}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>Communication: {feedback.categories.communication}/5</span>
                  <span>Reliability: {feedback.categories.reliability}/5</span>
                  <span>Quality: {feedback.categories.quality}/5</span>
                  <span>Timeliness: {feedback.categories.timeliness}/5</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrustIndicators;