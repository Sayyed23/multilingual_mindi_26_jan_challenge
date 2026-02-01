import React from 'react';
import type { InputProps } from '../../types';
import { getInputClasses } from '../../utils/designSystem';
import Typography from './Typography';

/**
 * Input Component
 * 
 * A fully accessible input component with proper labeling, error handling,
 * and validation support following WCAG 2.1 AA guidelines.
 */
const Input: React.FC<InputProps> = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  'aria-describedby': ariaDescribedby,
  'aria-invalid': ariaInvalid,
  ...props
}) => {
  const { id } = props as any;
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const inputClasses = getInputClasses(!!error, disabled);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  // Build aria-describedby string
  // If an error exists, we assume the error message itself provides the description.
  // The error message Typography component no longer has an explicit ID,
  // so we only include ariaDescribedby if it's provided externally.
  const describedBy = ariaDescribedby || undefined;

  return (
    <div className="space-y-1">
      {/* Label */}
      <Typography
        variant="label"
        color="primary"
        className="block"
        htmlFor={inputId}
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </Typography>

      {/* Input */}
      <input
        id={inputId}
        type={type}
        className={inputClasses}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        aria-describedby={describedBy}
        aria-invalid={ariaInvalid || !!error}
        {...props}
      />

      {/* Error Message */}
      {error && (
        <Typography
          variant="caption"
          color="error"
          className="mt-1"
        >
          {error}
        </Typography>
      )}
    </div>
  );
};

export default Input;