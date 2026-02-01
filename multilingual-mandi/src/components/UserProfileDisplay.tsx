// User Profile Display Component
// Shows comprehensive user profile with trust indicators and verification badges

import React, { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Building,
  Calendar,
  Shield,
  Flag,
  Eye,
  EyeOff,
  MessageCircle
} from 'lucide-react';
import { trustSystemService } from '../services/trustSystem';
import TrustIndicators from './TrustIndicators';
import type {
  UserProfile,
  TrustIndicators as ITrustIndicators,
  UserRole
} from '../types';

interface UserProfileDisplayProps {
  userId: string;
  currentUserId?: string;
  showActions?: boolean;
  showPrivateInfo?: boolean;
  compact?: boolean;
  className?: string;
}

export const UserProfileDisplay: React.FC<UserProfileDisplayProps> = ({
  userId,
  currentUserId,
  showActions = false,
  showPrivateInfo = false,
  compact = false,
  className = ''
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trustIndicators, setTrustIndicators] = useState<ITrustIndicators | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reporting, setReporting] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const [userProfile, userTrustIndicators] = await Promise.all([
        trustSystemService.getUserProfile(userId),
        trustSystemService.getTrustIndicators(userId)
      ]);

      setProfile(userProfile);
      setTrustIndicators(userTrustIndicators);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user profile');
      console.error('Failed to load user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReportUser = async () => {
    if (!currentUserId || !reportReason.trim()) return;

    try {
      setReporting(true);
      await trustSystemService.reportUser(currentUserId, userId, reportReason);
      setShowReportModal(false);
      setReportReason('');
      alert('User reported successfully. Our team will review this report.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to report user');
    } finally {
      setReporting(false);
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'vendor':
        return 'bg-green-100 text-green-800';
      case 'buyer':
        return 'bg-blue-100 text-blue-800';
      case 'agent':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile || !trustIndicators) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="text-center text-red-600">
          <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{error || 'Failed to load user profile'}</p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-3 bg-white rounded-lg border ${className}`}>
        {/* Avatar */}
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-gray-500" />
        </div>

        {/* Basic Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900">{profile.personalInfo.name}</h4>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(profile.role)}`}>
              {profile.role}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-3 h-3" />
            {profile.personalInfo.location.city}, {profile.personalInfo.location.state}
          </div>
        </div>

        {/* Trust Indicators */}
        <TrustIndicators trustIndicators={trustIndicators} compact />
      </div>
    );
  }

  return (
    <>
      <div className={`bg-white rounded-lg border ${className}`}>
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-gray-500" />
              </div>

              {/* Basic Info */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-semibold text-gray-900">{profile.personalInfo.name}</h2>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getRoleColor(profile.role)}`}>
                    {profile.role}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {profile.personalInfo.location.city}, {profile.personalInfo.location.state}
                  </div>
                  
                  {showPrivateInfo && (
                    <>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {profile.personalInfo.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {profile.email}
                      </div>
                    </>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Member since {formatDate(profile.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            {showActions && currentUserId && currentUserId !== userId && (
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  Message
                </button>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="flex items-center gap-2 px-3 py-2 border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                  <Flag className="w-4 h-4" />
                  Report
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Business Info */}
        {profile.businessInfo.businessName && (
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Business Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{profile.businessInfo.businessName}</span>
              </div>
              
              {profile.businessInfo.commodities.length > 0 && (
                <div>
                  <span className="text-sm text-gray-600">Commodities: </span>
                  <span className="text-sm">{profile.businessInfo.commodities.join(', ')}</span>
                </div>
              )}
              
              {profile.businessInfo.operatingRegions.length > 0 && (
                <div>
                  <span className="text-sm text-gray-600">Operating Regions: </span>
                  <span className="text-sm">
                    {profile.businessInfo.operatingRegions.map(region => 
                      `${region.city}, ${region.state}`
                    ).join('; ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Trust Indicators */}
        <div className="p-6">
          <TrustIndicators trustIndicators={trustIndicators} showDetails />
        </div>

        {/* Privacy Settings */}
        {showPrivateInfo && (
          <div className="p-6 border-t bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Privacy Settings</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                {profile.preferences.privacy.profileVisibility === 'public' ? (
                  <Eye className="w-4 h-4 text-green-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                )}
                <span>Profile Visibility: {profile.preferences.privacy.profileVisibility}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {profile.preferences.privacy.showContactInfo ? (
                  <Eye className="w-4 h-4 text-green-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                )}
                <span>Contact Info: {profile.preferences.privacy.showContactInfo ? 'Visible' : 'Hidden'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {profile.preferences.privacy.showTransactionHistory ? (
                  <Eye className="w-4 h-4 text-green-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                )}
                <span>Transaction History: {profile.preferences.privacy.showTransactionHistory ? 'Visible' : 'Hidden'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report User</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for reporting
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select a reason</option>
                  <option value="fraud">Fraudulent activity</option>
                  <option value="spam">Spam or unwanted messages</option>
                  <option value="harassment">Harassment or abuse</option>
                  <option value="fake_profile">Fake profile or information</option>
                  <option value="inappropriate_content">Inappropriate content</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleReportUser}
                  disabled={!reportReason.trim() || reporting}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {reporting ? 'Reporting...' : 'Submit Report'}
                </button>
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportReason('');
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfileDisplay;