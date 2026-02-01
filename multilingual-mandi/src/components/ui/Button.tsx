import React from 'react';
import type { ButtonProps } from '../../types';
import { getButtonClasses } from '../../utils/designSystem';

/**
 * Button Component
 * 
 * A flexible button component with role-based theming, multiple variants,
 * and full accessibility support following WCAG 2.1 AA guidelines.
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  role,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  'aria-label': ariaLabel,
  children,
  ...props
}) => {
  const buttonClasses = getButtonClasses(variant, size, role, disabled || loading);
  const widthClass = fullWidth ? 'w-full' : '';

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  return (
    <button
      className={`${buttonClasses} ${widthClass}`}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-disabled={disabled || loading}
      type="button"
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {!loading && icon && iconPosition === 'left' && (
        <span className="mr-2" aria-hidden="true">
          {icon}
        </span>
      )}

      <span>{children}</span>

      {!loading && icon && iconPosition === 'right' && (
        <span className="ml-2" aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  );
};

export default Button;