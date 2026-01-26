/**
 * Profile Page - Main profile management interface
 * Supports Requirements: 4.2, 4.5 - User profile management and display
 */

import React, { useState, useEffect } from 'react';
import { User } from '../types/user';
import { ReputationMetrics } from '../types/review';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import { reputationService } from '../services/reputationService';
import ProfileManagement from '../components/ProfileManagement';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
import ReputationDisplay from '../components/ReputationDisplay';
import TransactionHistory from '../components/TransactionHistory';
import LoadingSpinner from '../components/LoadingSpinner';
import './Profile.css';

const Profile: React.FC = () => {
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [reputationMetrics, setReputationMetrics] = useState<ReputationMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reputation' | 'transactions'>('overview');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const [userProfile, metrics] = await Promise.all([
        userService.getCurrentUserProfile(),
        reputationService.getCurrentUserReputationMetrics().catch(() => null) // Don't fail if metrics unavailable
      ]);
      setUser(userProfile);
      setReputationMetrics(metrics);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setError('Failed to load profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleProfileComplete = (updatedUser: User) => {
    setUser(updatedUser);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleProfilePictureUpload = async (file: File): Promise<string> => {
    try {
      const url = await userService.uploadProfilePicture(file);
      await userService.updateCurrentUserProfile({ profilePicture: url });
      if (user) {
        setUser({ ...user, profilePicture: url });
      }
      return url;
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      throw new Error('Failed to upload profile picture');
    }
  };

  const handleProfilePictureRemove = async () => {
    try {
      await userService.updateCurrentUserProfile({ profilePicture: '' });
      if (user) {
        setUser({ ...user, profilePicture: undefined });
      }
    } catch (error) {
      console.error('Failed to remove profile picture:', error);
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="page-container loading">
        <LoadingSpinner />
        <p>Loading profile...</p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <ProfileManagement
        mode="edit"
        onComplete={handleProfileComplete}
        onCancel={handleCancelEdit}
      />
    );
  }

  if (!user) {
    return (
      <div className="page-container">
        <div className="error-state">
          <h2>Profile Not Found</h2>
          <p>Unable to load your profile information.</p>
          <button onClick={loadUserProfile} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Profile</h1>
        <p>Manage your account and business information</p>
      </div>
      
      <div className="page-content">
        {/* Profile Header Section */}
        <div className="profile-section">
          <div className="profile-avatar">
            <ProfilePictureUpload
              currentPicture={user.profilePicture}
              userName={user.name}
              onUpload={handleProfilePictureUpload}
              onRemove={user.profilePicture ? handleProfilePictureRemove : undefined}
              size="medium"
            />
          </div>
          
          <div className="profile-info">
            <h3>{user.name}</h3>
            <p className="user-type">
              {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
              {user.isVerified && ' • Verified ✓'}
            </p>
            <ReputationDisplay
              reputation={user.reputation}
              metrics={reputationMetrics || undefined}
              variant="compact"
              showTrustLevel={true}
            />
            <div className="location">
              📍 {user.location.district ? `${user.location.district}, ` : ''}{user.location.state}
            </div>
          </div>
          
          <button onClick={handleEditProfile} className="edit-profile-btn">
            Edit Profile
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'reputation' ? 'active' : ''}`}
            onClick={() => setActiveTab('reputation')}
          >
            Reputation
          </button>
          <button 
            className={`tab-button ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            Transaction History
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              {/* Business Information */}
              {user.businessProfile && (
                <div className="business-section">
                  <h3>Business Information</h3>
                  <div className="business-info">
                    <div className="info-item">
                      <strong>Business Name:</strong>
                      <span>{user.businessProfile.businessName}</span>
                    </div>
                    <div className="info-item">
                      <strong>Business Type:</strong>
                      <span>{user.businessProfile.businessType}</span>
                    </div>
                    {user.businessProfile.gstNumber && (
                      <div className="info-item">
                        <strong>GST Number:</strong>
                        <span>{user.businessProfile.gstNumber}</span>
                      </div>
                    )}
                    <div className="info-item">
                      <strong>Operating Hours:</strong>
                      <span>{user.businessProfile.operatingHours}</span>
                    </div>
                    {user.businessProfile.specializations.length > 0 && (
                      <div className="info-item specializations">
                        <strong>Specializations:</strong>
                        <div className="specialization-tags">
                          {user.businessProfile.specializations.map((spec, index) => (
                            <span key={index} className="specialization-tag">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Profile Stats */}
              <div className="profile-stats">
                <div className="stat-card">
                  <h4>Total Deals</h4>
                  <p className="stat-number">{user.reputation.totalTransactions}</p>
                </div>
                <div className="stat-card">
                  <h4>Punctuality</h4>
                  <p className="stat-number">{user.reputation.punctuality.toFixed(1)}/5</p>
                </div>
                <div className="stat-card">
                  <h4>Communication</h4>
                  <p className="stat-number">{user.reputation.communication.toFixed(1)}/5</p>
                </div>
                <div className="stat-card">
                  <h4>Product Quality</h4>
                  <p className="stat-number">{user.reputation.productQuality.toFixed(1)}/5</p>
                </div>
              </div>

              {/* Profile Menu */}
              <div className="profile-menu">
                <div className="menu-item" onClick={handleEditProfile}>
                  <span>Edit Profile</span>
                  <span>→</span>
                </div>
                <div className="menu-item">
                  <span>Language Preferences</span>
                  <span>→</span>
                </div>
                <div className="menu-item">
                  <span>Notification Settings</span>
                  <span>→</span>
                </div>
                <div className="menu-item">
                  <span>Privacy Settings</span>
                  <span>→</span>
                </div>
                <div className="menu-item">
                  <span>Help & Support</span>
                  <span>→</span>
                </div>
                <div className="menu-item logout" onClick={handleLogout}>
                  <span>Logout</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reputation' && (
            <div className="reputation-tab">
              <ReputationDisplay
                reputation={user.reputation}
                metrics={reputationMetrics || undefined}
                variant="card"
                showTrustLevel={true}
                showMetrics={true}
              />
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="transactions-tab">
              <TransactionHistory
                limit={10}
                showActions={true}
                variant="full"
              />
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
    </div>
  );
};

export default Profile;