import React, { useId } from 'react';
import type { SelectProps } from '../../types';
import { getInputClasses } from '../../utils/designSystem';
import Typography from './Typography';
import { ChevronDown } from 'lucide-react';

/**
 * Select Component
 * 
 * A fully accessible select dropdown component with proper labeling,
 * error handling, and keyboard navigation support.
 */
const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  'aria-describedby': ariaDescribedby,
  ...props
}) => {
  const selectId = useId();
  const errorId = useId();

  const selectClasses = getInputClasses(!!error, disabled);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  // Build aria-describedby string
  const describedBy = [
    error ? errorId : null,
    ariaDescribedby,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className="space-y-1">
      {/* Label */}
      <Typography
        variant="label"
        color="primary"
        className="block"
        htmlFor={selectId}
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </Typography>

      {/* Select Container */}
      <div className="relative">
        <select
          id={selectId}
          className={`${selectClasses} appearance-none pr-10`}
          value={value}
          onChange={handleChange}
          required={required}
          disabled={disabled}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          {...props}
        >
          <option value="" disabled>
            Select an option...
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Dropdown Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown
            className={`h-4 w-4 ${disabled ? 'text-gray-400' : 'text-gray-500'}`}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Typography
          variant="caption"
          color="error"
          className="mt-1"
          id={errorId}
          aria-live="polite"
        >
          {error}
        </Typography>
      )}
    </div>
  );
};

export default Select;