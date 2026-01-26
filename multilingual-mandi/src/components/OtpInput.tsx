/**
 * OTP Input Component
 * Provides a user-friendly OTP input interface
 * Supports Requirements: 4.1 - Mobile number verification through OTP
 */

import React, { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import './OtpInput.css';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  onComplete?: (otp: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  className?: string;
}

const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true,
  placeholder = '0',
  className = ''
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update internal state when value prop changes
  useEffect(() => {
    const otpArray = value.split('').slice(0, length);
    const paddedOtp = [...otpArray, ...new Array(length - otpArray.length).fill('')];
    setOtp(paddedOtp);
  }, [value, length]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, disabled]);

  const handleChange = (index: number, digit: string) => {
    // Only allow single digits
    if (digit.length > 1) {
      digit = digit.slice(-1);
    }

    // Only allow numeric input
    if (digit && !/^\d$/.test(digit)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    const otpString = newOtp.join('');
    onChange(otpString);

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete when OTP is fully entered
    if (otpString.length === length && onComplete) {
      onComplete(otpString);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      
      if (otp[index]) {
        // Clear current input
        handleChange(index, '');
      } else if (index > 0) {
        // Move to previous input and clear it
        inputRefs.current[index - 1]?.focus();
        handleChange(index - 1, '');
      }
    }
    
    // Handle arrow keys
    else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Handle paste
    else if (e.key === 'Enter' && otp.join('').length === length && onComplete) {
      onComplete(otp.join(''));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain');
    const digits = pastedData.replace(/\D/g, '').slice(0, length);
    
    if (digits) {
      const newOtp = digits.split('').concat(new Array(length - digits.length).fill(''));
      setOtp(newOtp);
      onChange(digits);
      
      // Focus the next empty input or the last input
      const nextIndex = Math.min(digits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      
      if (digits.length === length && onComplete) {
        onComplete(digits);
      }
    }
  };

  const handleFocus = (index: number) => {
    // Select all text when focusing
    inputRefs.current[index]?.select();
  };

  return (
    <div className={`otp-input-container ${className}`}>
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={digit}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          placeholder={placeholder}
          className={`otp-input ${digit ? 'filled' : ''} ${disabled ? 'disabled' : ''}`}
          aria-label={`OTP digit ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default OtpInput;