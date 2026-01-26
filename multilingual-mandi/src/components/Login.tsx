/**
 * Login Component
 * Provides OTP-based login functionality
 * Supports Requirements: 4.1 - Mobile number verification through OTP
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import OtpInput from './OtpInput';
import LoadingSpinner from './LoadingSpinner';
import './Login.css';

interface LoginProps {
  onSwitchToRegister: () => void;
  onLoginSuccess?: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister, onLoginSuccess }) => {
  const { 
    requestOtp, 
    verifyOtpAndLogin, 
    isLoading, 
    error, 
    otpSent, 
    otpExpiresAt, 
    attemptsRemaining,
    clearError 
  } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [canResend, setCanResend] = useState(false);

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

  // Clear error when component unmounts or phone number changes
  useEffect(() => {
    clearError();
  }, [phoneNumber, clearError]);

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Limit to 10 digits (Indian mobile numbers)
    const limited = digits.slice(0, 10);
    
    // Format as XXX-XXX-XXXX
    if (limited.length >= 6) {
      return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
    } else if (limited.length >= 3) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    }
    return limited;
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const getCleanPhoneNumber = (): string => {
    return phoneNumber.replace(/\D/g, '');
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanPhone = getCleanPhoneNumber();
    if (cleanPhone.length !== 10) {
      return;
    }

    try {
      await requestOtp(`+91${cleanPhone}`, 'login');
    } catch (error) {
      console.error('Failed to request OTP:', error);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return;

    try {
      const cleanPhone = getCleanPhoneNumber();
      await verifyOtpAndLogin(`+91${cleanPhone}`, otp);
      onLoginSuccess?.();
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      setOtp(''); // Clear OTP on error
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    try {
      const cleanPhone = getCleanPhoneNumber();
      await requestOtp(`+91${cleanPhone}`, 'login');
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

  const isPhoneValid = getCleanPhoneNumber().length === 10;

  return (
    <div className="login-container">
      <div className="login-header">
        <h2>Welcome Back</h2>
        <p>Enter your mobile number to continue</p>
      </div>

      {!otpSent ? (
        <form onSubmit={handleRequestOtp} className="phone-form">
          <div className="input-group">
            <label htmlFor="phoneNumber">Mobile Number</label>
            <div className="phone-input-container">
              <span className="country-code">+91</span>
              <input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="XXX-XXX-XXXX"
                maxLength={12} // Including dashes
                disabled={isLoading}
                className={`phone-input ${!isPhoneValid && phoneNumber ? 'invalid' : ''}`}
                autoComplete="tel"
              />
            </div>
            {!isPhoneValid && phoneNumber && (
              <span className="error-text">Please enter a valid 10-digit mobile number</span>
            )}
          </div>

          <button
            type="submit"
            disabled={!isPhoneValid || isLoading}
            className="primary-button"
          >
            {isLoading ? <LoadingSpinner size="small" /> : 'Send OTP'}
          </button>
        </form>
      ) : (
        <div className="otp-form">
          <div className="otp-header">
            <h3>Enter OTP</h3>
            <p>
              We've sent a 6-digit code to<br />
              <strong>+91 {phoneNumber}</strong>
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

          <button
            type="button"
            onClick={handleVerifyOtp}
            disabled={otp.length !== 6 || isLoading}
            className="primary-button"
          >
            {isLoading ? <LoadingSpinner size="small" /> : 'Verify & Login'}
          </button>

          <button
            type="button"
            onClick={() => {
              setOtp('');
              // Reset to phone number entry
              window.location.reload();
            }}
            className="link-button"
            disabled={isLoading}
          >
            Change Number
          </button>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="login-footer">
        <p>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="link-button"
            disabled={isLoading}
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;