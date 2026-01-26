/**
 * Profile Management Component - Main component for user profile management
 * Supports Requirements: 4.2, 4.5 - Complete user profile management system
 */

import React, { useState, useEffect } from 'react';
import { User, UserUpdate, UserType, BusinessInfo } from '../types/user';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import ProfileForm from './ProfileForm';
import UserTypeSelector from './UserTypeSelector';
import ProfilePictureUpload from './ProfilePictureUpload';
import BusinessInfoForm from './BusinessInfoForm';
import LoadingSpinner from './LoadingSpinner';
import './ProfileManagement.css';

interface ProfileManagementProps {
  mode?: 'create' | 'edit';
  onComplete?: (user: User) => void;
  onCancel?: () => void;
}

type Step = 'user-type' | 'basic-info' | 'profile-picture' | 'business-info' | 'complete';

const ProfileManagement: React.FC<ProfileManagementProps> = ({
  mode = 'edit',
  onComplete,
  onCancel
}) => {
  const { user: authUser } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('basic-info');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data state
  const [selectedUserType, setSelectedUserType] = useState<UserType>('vendor');
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && authUser) {
      loadUserProfile();
    } else if (mode === 'create') {
      setCurrentStep('user-type');
      setIsLoading(false);
    }
  }, [mode, authUser]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const userProfile = await userService.getCurrentUserProfile();
      setUser(userProfile);
      setSelectedUserType(userProfile.userType);
      setProfilePictureUrl(userProfile.profilePicture || null);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      setError('Failed to load profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserTypeChange = (userType: UserType) => {
    setSelectedUserType(userType);
  };

  const handleUserTypeNext = () => {
    setCurrentStep('basic-info');
  };

  const handleBasicInfoSubmit = async (data: UserUpdate) => {
    try {
      setIsSaving(true);
      setError(null);

      const updateData = {
        ...data,
        userType: selectedUserType
      };

      let updatedUser: User;
      if (mode === 'create') {
        // For creation, we would typically call a different endpoint
        // For now, we'll update the current user
        updatedUser = await userService.updateCurrentUserProfile(updateData);
      } else {
        updatedUser = await userService.updateCurrentUserProfile(updateData);
      }

      setUser(updatedUser);
      
      // Move to next step based on user type
      if (selectedUserType === 'vendor' || selectedUserType === 'both') {
        setCurrentStep('business-info');
      } else {
        setCurrentStep('profile-picture');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfilePictureUpload = async (file: File): Promise<string> => {
    try {
      const url = await userService.uploadProfilePicture(file);
      await userService.updateCurrentUserProfile({ profilePicture: url });
      setProfilePictureUrl(url);
      return url;
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      throw new Error('Failed to upload profile picture');
    }
  };

  const handleProfilePictureRemove = async () => {
    try {
      await userService.updateCurrentUserProfile({ profilePicture: '' });
      setProfilePictureUrl(null);
    } catch (error) {
      console.error('Failed to remove profile picture:', error);
    }
  };

  const handleProfilePictureNext = () => {
    setCurrentStep('complete');
  };

  const handleBusinessInfoSubmit = async (data: Partial<BusinessInfo>) => {
    try {
      setIsSaving(true);
      setError(null);

      const updatedUser = await userService.updateCurrentUserBusinessInfo(data);
      setUser(updatedUser);
      setCurrentStep('profile-picture');
    } catch (error) {
      console.error('Failed to update business info:', error);
      setError('Failed to update business information. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = () => {
    if (user && onComplete) {
      onComplete(user);
    }
  };

  const handleStepBack = () => {
    switch (currentStep) {
      case 'basic-info':
        if (mode === 'create') {
          setCurrentStep('user-type');
        }
        break;
      case 'business-info':
        setCurrentStep('basic-info');
        break;
      case 'profile-picture':
        if (selectedUserType === 'vendor' || selectedUserType === 'both') {
          setCurrentStep('business-info');
        } else {
          setCurrentStep('basic-info');
        }
        break;
      case 'complete':
        setCurrentStep('profile-picture');
        break;
    }
  };

  const getStepTitle = (): string => {
    switch (currentStep) {
      case 'user-type':
        return 'Choose Your Role';
      case 'basic-info':
        return 'Basic Information';
      case 'business-info':
        return 'Business Information';
      case 'profile-picture':
        return 'Profile Picture';
      case 'complete':
        return 'Profile Complete';
      default:
        return 'Profile Setup';
    }
  };

  const getStepNumber = (): { current: number; total: number } => {
    const steps = ['user-type', 'basic-info', 'business-info', 'profile-picture', 'complete'];
    let totalSteps = mode === 'create' ? 4 : 3;
    
    if (selectedUserType === 'buyer') {
      totalSteps -= 1; // Skip business info for buyers
    }
    
    const currentIndex = steps.indexOf(currentStep);
    return { current: Math.min(currentIndex + 1, totalSteps), total: totalSteps };
  };

  if (isLoading) {
    return (
      <div className="profile-management loading">
        <LoadingSpinner />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-management">
      <div className="profile-management-header">
        <h1>{mode === 'create' ? 'Complete Your Profile' : 'Edit Profile'}</h1>
        
        {mode === 'create' && (
          <div className="step-indicator">
            <div className="step-info">
              <span>Step {getStepNumber().current} of {getStepNumber().total}</span>
              <h2>{getStepTitle()}</h2>
            </div>
            <div className="step-progress">
              <div 
                className="progress-bar"
                style={{ width: `${(getStepNumber().current / getStepNumber().total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="profile-management-content">
        {currentStep === 'user-type' && (
          <div className="step-content">
            <UserTypeSelector
              selectedType={selectedUserType}
              onTypeChange={handleUserTypeChange}
              disabled={isSaving}
            />
            <div className="step-actions">
              {onCancel && (
                <button onClick={onCancel} className="btn-secondary">
                  Cancel
                </button>
              )}
              <button onClick={handleUserTypeNext} className="btn-primary">
                Continue
              </button>
            </div>
          </div>
        )}

        {currentStep === 'basic-info' && (
          <ProfileForm
            user={user || undefined}
            onSubmit={handleBasicInfoSubmit}
            onCancel={mode === 'create' ? handleStepBack : onCancel}
            isLoading={isSaving}
            mode={mode}
          />
        )}

        {currentStep === 'business-info' && (
          <BusinessInfoForm
            businessInfo={user?.businessProfile}
            onSubmit={handleBusinessInfoSubmit}
            onCancel={handleStepBack}
            isLoading={isSaving}
            mode={mode}
          />
        )}

        {currentStep === 'profile-picture' && (
          <div className="step-content">
            <div className="profile-picture-step">
              <h2>Add Your Profile Picture</h2>
              <p>A profile picture helps build trust with other traders</p>
              
              <ProfilePictureUpload
                currentPicture={profilePictureUrl || undefined}
                userName={user?.name || 'User'}
                onUpload={handleProfilePictureUpload}
                onRemove={handleProfilePictureRemove}
                size="large"
              />
            </div>
            
            <div className="step-actions">
              <button onClick={handleStepBack} className="btn-secondary">
                Back
              </button>
              <button onClick={handleProfilePictureNext} className="btn-primary">
                {mode === 'create' ? 'Complete Profile' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="step-content">
            <div className="completion-message">
              <div className="success-icon">✅</div>
              <h2>Profile Complete!</h2>
              <p>Your profile has been successfully {mode === 'create' ? 'created' : 'updated'}.</p>
              
              {user && (
                <div className="profile-summary">
                  <div className="summary-item">
                    <strong>Name:</strong> {user.name}
                  </div>
                  <div className="summary-item">
                    <strong>Type:</strong> {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                  </div>
                  <div className="summary-item">
                    <strong>Location:</strong> {user.location.state}
                  </div>
                  {user.businessProfile && (
                    <div className="summary-item">
                      <strong>Business:</strong> {user.businessProfile.businessName}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="step-actions">
              <button onClick={handleComplete} className="btn-primary">
                {mode === 'create' ? 'Get Started' : 'Done'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileManagement;