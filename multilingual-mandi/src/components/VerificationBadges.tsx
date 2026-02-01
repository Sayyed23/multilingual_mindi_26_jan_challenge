// Verification Badges Component
// Displays verification status badges for different user verification types

import React from 'react';
import {
  Shield,
  Phone,
  Mail,
  MapPin,
  Building,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import type { VerificationBadge } from '../types';

interface VerificationBadgesProps {
  badges: VerificationBadge[];
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'vertical' | 'grid';
  className?: string;
}

export const VerificationBadges: React.FC<VerificationBadgesProps> = ({
  badges,
  showLabels = true,
  size = 'md',
  layout = 'horizontal',
  className = ''
}) => {
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

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          icon: 'w-4 h-4',
          text: 'text-xs',
          padding: 'p-2',
          gap: 'gap-1'
        };
      case 'lg':
        return {
          icon: 'w-6 h-6',
          text: 'text-sm',
          padding: 'p-4',
          gap: 'gap-3'
        };
      default:
        return {
          icon: 'w-5 h-5',
          text: 'text-sm',
          padding: 'p-3',
          gap: 'gap-2'
        };
    }
  };

  const getLayoutClasses = () => {
    switch (layout) {
      case 'vertical':
        return 'flex flex-col';
      case 'grid':
        return 'grid grid-cols-2 md:grid-cols-3';
      default:
        return 'flex flex-wrap';
    }
  };

  const getBadgeStyle = (badge: VerificationBadge) => {
    const isExpired = badge.expiresAt && new Date() > badge.expiresAt;
    
    if (badge.verified && !isExpired) {
      return {
        container: 'bg-green-50 border-green-200 text-green-800',
        icon: 'text-green-600',
        status: CheckCircle,
        statusColor: 'text-green-600'
      };
    } else if (badge.verified && isExpired) {
      return {
        container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        icon: 'text-yellow-600',
        status: AlertCircle,
        statusColor: 'text-yellow-600'
      };
    } else {
      return {
        container: 'bg-gray-50 border-gray-200 text-gray-600',
        icon: 'text-gray-500',
        status: XCircle,
        statusColor: 'text-gray-500'
      };
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const sizeClasses = getSizeClasses();
  const layoutClasses = getLayoutClasses();

  if (badges.length === 0) {
    return (
      <div className={`text-center text-gray-500 ${className}`}>
        <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No verification badges</p>
      </div>
    );
  }

  return (
    <div className={`${layoutClasses} ${sizeClasses.gap} ${className}`}>
      {badges.map((badge, index) => {
        const Icon = getVerificationIcon(badge.type);
        const style = getBadgeStyle(badge);
        const StatusIcon = style.status;
        const isExpired = badge.expiresAt && new Date() > badge.expiresAt;

        return (
          <div
            key={index}
            className={`flex items-center ${sizeClasses.gap} ${sizeClasses.padding} rounded-lg border ${style.container} ${
              layout === 'horizontal' ? 'flex-shrink-0' : ''
            }`}
            title={
              badge.verified
                ? isExpired
                  ? `${getVerificationLabel(badge.type)} - Expired on ${formatDate(badge.expiresAt!)}`
                  : `${getVerificationLabel(badge.type)} - Verified on ${formatDate(badge.verifiedAt!)}`
                : `${getVerificationLabel(badge.type)} - Not verified`
            }
          >
            <Icon className={`${sizeClasses.icon} ${style.icon}`} />
            
            {showLabels && (
              <div className="flex-1 min-w-0">
                <div className={`font-medium ${sizeClasses.text}`}>
                  {getVerificationLabel(badge.type)}
                </div>
                <div className={`flex items-center ${sizeClasses.gap} ${sizeClasses.text} opacity-75`}>
                  <StatusIcon className="w-3 h-3" />
                  <span>
                    {badge.verified
                      ? isExpired
                        ? 'Expired'
                        : 'Verified'
                      : 'Not Verified'
                    }
                  </span>
                </div>
                
                {badge.verified && badge.verifiedAt && (
                  <div className={`${sizeClasses.text} opacity-60 mt-1`}>
                    {formatDate(badge.verifiedAt)}
                  </div>
                )}
                
                {badge.verified && badge.expiresAt && (
                  <div className={`${sizeClasses.text} opacity-60`}>
                    {isExpired ? 'Expired' : 'Expires'}: {formatDate(badge.expiresAt)}
                  </div>
                )}
              </div>
            )}
            
            {!showLabels && (
              <StatusIcon className={`w-3 h-3 ${style.statusColor}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// Compact version for inline display
export const VerificationBadgesCompact: React.FC<{
  badges: VerificationBadge[];
  maxVisible?: number;
  className?: string;
}> = ({ badges, maxVisible = 4, className = '' }) => {
  const verifiedBadges = badges.filter(badge => badge.verified);
  const visibleBadges = verifiedBadges.slice(0, maxVisible);
  const remainingCount = verifiedBadges.length - maxVisible;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {visibleBadges.map((badge, index) => {
        const Icon = getVerificationIcon(badge.type);
        const isExpired = badge.expiresAt && new Date() > badge.expiresAt;
        
        return (
          <Icon
            key={index}
            className={`w-4 h-4 ${
              isExpired ? 'text-yellow-500' : 'text-green-600'
            }`}
          />
        );
      })}
      
      {remainingCount > 0 && (
        <span className="text-xs text-gray-500 ml-1">
          +{remainingCount}
        </span>
      )}
      
      {verifiedBadges.length === 0 && (
        <span className="text-xs text-gray-400">No verifications</span>
      )}
    </div>
  );
};

// Helper function for external use
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

export { getVerificationIcon, getVerificationLabel };
export default VerificationBadges;