/**
 * Profile Form Component for creating and editing user profiles
 * Supports Requirements: 4.2, 4.5 - User profile creation and editing
 */

import React, { useState, useEffect } from 'react';
import { User, UserUpdate, UserType, Location } from '../types/user';
import { SUPPORTED_LANGUAGES } from '../types';
import './ProfileForm.css';

interface ProfileFormProps {
  user?: User;
  onSubmit: (data: UserUpdate) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  user,
  onSubmit,
  onCancel,
  isLoading = false,
  mode
}) => {
  const [formData, setFormData] = useState<UserUpdate>({
    name: user?.name || '',
    email: user?.email || '',
    preferredLanguage: user?.preferredLanguage || 'hi',
    location: {
      address: user?.location?.address || '',
      pincode: user?.location?.pincode || '',
      state: user?.location?.state || '',
      district: user?.location?.district || '',
      latitude: user?.location?.latitude || 0,
      longitude: user?.location?.longitude || 0
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Language options with display names
  const languageOptions = [
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'en', name: 'English' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'ml', name: 'മലയാളം (Malayalam)' },
    { code: 'or', name: 'ଓଡ଼ିଆ (Odia)' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
    { code: 'as', name: 'অসমীয়া (Assamese)' },
    { code: 'ur', name: 'اردو (Urdu)' }
  ];

  // Indian states
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep', 'Andaman and Nicobar Islands'
  ];

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('location.')) {
      const locationField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }

    // Email validation (optional)
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Location validation
    if (!formData.location?.address || formData.location.address.trim().length < 10) {
      newErrors['location.address'] = 'Address must be at least 10 characters long';
    }

    if (!formData.location?.pincode || !/^\d{6}$/.test(formData.location.pincode)) {
      newErrors['location.pincode'] = 'Pincode must be 6 digits';
    }

    if (!formData.location?.state) {
      newErrors['location.state'] = 'Please select a state';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Profile update failed:', error);
      setErrors({ submit: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <div className="profile-form">
      <div className="form-header">
        <h2>{mode === 'create' ? 'Create Profile' : 'Edit Profile'}</h2>
        <p>Please provide your basic information</p>
      </div>

      <form onSubmit={handleSubmit} className="form">
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'error' : ''}
              placeholder="Enter your full name"
              required
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email address (optional)"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="preferredLanguage">Preferred Language *</label>
            <select
              id="preferredLanguage"
              value={formData.preferredLanguage || 'hi'}
              onChange={(e) => handleInputChange('preferredLanguage', e.target.value)}
              required
            >
              {languageOptions.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location Information */}
        <div className="form-section">
          <h3>Location Information</h3>
          
          <div className="form-group">
            <label htmlFor="address">Address *</label>
            <textarea
              id="address"
              value={formData.location?.address || ''}
              onChange={(e) => handleInputChange('location.address', e.target.value)}
              className={errors['location.address'] ? 'error' : ''}
              placeholder="Enter your complete address"
              rows={3}
              required
            />
            {errors['location.address'] && (
              <span className="error-message">{errors['location.address']}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pincode">Pincode *</label>
              <input
                type="text"
                id="pincode"
                value={formData.location?.pincode || ''}
                onChange={(e) => handleInputChange('location.pincode', e.target.value)}
                className={errors['location.pincode'] ? 'error' : ''}
                placeholder="123456"
                maxLength={6}
                required
              />
              {errors['location.pincode'] && (
                <span className="error-message">{errors['location.pincode']}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="district">District</label>
              <input
                type="text"
                id="district"
                value={formData.location?.district || ''}
                onChange={(e) => handleInputChange('location.district', e.target.value)}
                placeholder="Enter district"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="state">State *</label>
            <select
              id="state"
              value={formData.location?.state || ''}
              onChange={(e) => handleInputChange('location.state', e.target.value)}
              className={errors['location.state'] ? 'error' : ''}
              required
            >
              <option value="">Select State</option>
              {indianStates.map(state => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            {errors['location.state'] && (
              <span className="error-message">{errors['location.state']}</span>
            )}
          </div>

          <button
            type="button"
            onClick={getCurrentLocation}
            className="location-btn"
          >
            📍 Use Current Location
          </button>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Profile' : 'Save Changes'}
          </button>
        </div>

        {errors.submit && (
          <div className="error-message submit-error">{errors.submit}</div>
        )}
      </form>
    </div>
  );
};

export default ProfileForm;