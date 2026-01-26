/**
 * Register Component
 * Provides user registration with OTP verification
 * Supports Requirements: 4.1, 4.2 - User registration and verification
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRegistration, UserType, Location } from '../types/user';
import OtpInput from './OtpInput';
import LoadingSpinner from './LoadingSpinner';
import './Register.css';

interface RegisterProps {
  onSwitchToLogin: () => void;
  onRegisterSuccess?: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin, onRegisterSuccess }) => {
  const { 
    requestOtp, 
    registerUser, 
    isLoading, 
    error, 
    otpSent, 
    otpExpiresAt, 
    attemptsRemaining,
    clearError 
  } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    phoneNumber: '',
    name: '',
    userType: 'buyer' as UserType,
    preferredLanguage: 'en',
    location: {
      address: '',
      pincode: '',
      state: '',
      district: '',
      latitude: 0,
      longitude: 0
    } as Location
  });

  const [otp, setOtp] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Basic Info, 2: Location, 3: OTP

  // Timer for OTP expiry
  useEffect(() => {
    if (otpExpiresAt) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const expiry = otpExpiresAt.getTime();
        const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
        
        setTimeRemaining(remaining);
        setCanResend(remaining === 0);
        
        if (remaining === 0) {
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [otpExpiresAt]);

  // Clear error when form data changes
  useEffect(() => {
    clearError();
  }, [formData, clearError]);

  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    const limited = digits.slice(0, 10);
    
    if (limited.length >= 6) {
      return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
    } else if (limited.length >= 3) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    }
    return limited;
  };

  const getCleanPhoneNumber = (): string => {
    return formData.phoneNumber.replace(/\D/g, '');
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'phoneNumber') {
      value = formatPhoneNumber(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const validateStep1 = (): boolean => {
    return !!(
      formData.name.trim() &&
      getCleanPhoneNumber().length === 10 &&
      formData.userType &&
      formData.preferredLanguage
    );
  };

  const validateStep2 = (): boolean => {
    return !!(
      formData.location.address.trim() &&
      formData.location.pincode.trim().length === 6 &&
      formData.location.state.trim()
    );
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      handleRequestOtp();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRequestOtp = async () => {
    try {
      const cleanPhone = getCleanPhoneNumber();
      await requestOtp(`+91${cleanPhone}`, 'registration');
      setCurrentStep(3);
    } catch (error) {
      console.error('Failed to request OTP:', error);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;

    try {
      const cleanPhone = getCleanPhoneNumber();
      const registrationData: UserRegistration = {
        phoneNumber: `+91${cleanPhone}`,
        name: formData.name.trim(),
        userType: formData.userType,
        preferredLanguage: formData.preferredLanguage,
        location: formData.location
      };

      await registerUser(registrationData, otp);
      onRegisterSuccess?.();
    } catch (error) {
      console.error('Failed to register:', error);
      setOtp(''); // Clear OTP on error
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    try {
      const cleanPhone = getCleanPhoneNumber();
      await requestOtp(`+91${cleanPhone}`, 'registration');
      setOtp(''); // Clear previous OTP
    } catch (error) {
      console.error('Failed to resend OTP:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'ml', name: 'മലയാളം (Malayalam)' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' }
  ];

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  return (
    <div className="register-container">
      <div className="register-header">
        <h2>Create Account</h2>
        <p>Join the Multilingual Mandi community</p>
        
        {/* Progress indicator */}
        <div className="progress-indicator">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1</div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2</div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3</div>
        </div>
      </div>

      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <div className="form-step">
          <h3>Basic Information</h3>
          
          <div className="input-group">
            <label htmlFor="name">Full Name *</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
              disabled={isLoading}
              className="form-input"
              autoComplete="name"
            />
          </div>

          <div className="input-group">
            <label htmlFor="phoneNumber">Mobile Number *</label>
            <div className="phone-input-container">
              <span className="country-code">+91</span>
              <input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="XXX-XXX-XXXX"
                maxLength={12}
                disabled={isLoading}
                className="phone-input"
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="userType">I am a *</label>
            <select
              id="userType"
              value={formData.userType}
              onChange={(e) => handleInputChange('userType', e.target.value)}
              disabled={isLoading}
              className="form-select"
            >
              <option value="buyer">Buyer</option>
              <option value="vendor">Vendor/Seller</option>
              <option value="both">Both Buyer & Seller</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="language">Preferred Language *</label>
            <select
              id="language"
              value={formData.preferredLanguage}
              onChange={(e) => handleInputChange('preferredLanguage', e.target.value)}
              disabled={isLoading}
              className="form-select"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleNextStep}
            disabled={!validateStep1() || isLoading}
            className="primary-button"
          >
            Next
          </button>
        </div>
      )}

      {/* Step 2: Location Information */}
      {currentStep === 2 && (
        <div className="form-step">
          <h3>Location Information</h3>
          
          <div className="input-group">
            <label htmlFor="address">Address *</label>
            <textarea
              id="address"
              value={formData.location.address}
              onChange={(e) => handleLocationChange('address', e.target.value)}
              placeholder="Enter your complete address"
              disabled={isLoading}
              className="form-textarea"
              rows={3}
            />
          </div>

          <div className="input-row">
            <div className="input-group">
              <label htmlFor="pincode">PIN Code *</label>
              <input
                id="pincode"
                type="text"
                value={formData.location.pincode}
                onChange={(e) => handleLocationChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                disabled={isLoading}
                className="form-input"
              />
            </div>

            <div className="input-group">
              <label htmlFor="state">State *</label>
              <select
                id="state"
                value={formData.location.state}
                onChange={(e) => handleLocationChange('state', e.target.value)}
                disabled={isLoading}
                className="form-select"
              >
                <option value="">Select State</option>
                {indianStates.map(state => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="district">District</label>
            <input
              id="district"
              type="text"
              value={formData.location.district || ''}
              onChange={(e) => handleLocationChange('district', e.target.value)}
              placeholder="Enter your district"
              disabled={isLoading}
              className="form-input"
            />
          </div>

          <div className="button-row">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={isLoading}
              className="secondary-button"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              disabled={!validateStep2() || isLoading}
              className="primary-button"
            >
              {isLoading ? <LoadingSpinner size="small" /> : 'Send OTP'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: OTP Verification */}
      {currentStep === 3 && (
        <div className="form-step">
          <div className="otp-header">
            <h3>Verify Mobile Number</h3>
            <p>
              We've sent a 6-digit code to<br />
              <strong>+91 {formData.phoneNumber}</strong>
            </p>
          </div>

          <OtpInput
            value={otp}
            onChange={setOtp}
            onComplete={handleVerifyOtp}
            disabled={isLoading}
            autoFocus
          />

          <div className="otp-info">
            {timeRemaining > 0 ? (
              <p className="timer">
                Resend OTP in {formatTime(timeRemaining)}
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading}
                className="link-button"
              >
                Resend OTP
              </button>
            )}
            
            {attemptsRemaining < 3 && (
              <p className="attempts-warning">
                {attemptsRemaining} attempts remaining
              </p>
            )}
          </div>

          <div className="button-row">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={isLoading}
              className="secondary-button"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || isLoading}
              className="primary-button"
            >
              {isLoading ? <LoadingSpinner size="small" /> : 'Create Account'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="register-footer">
        <p>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="link-button"
            disabled={isLoading}
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;