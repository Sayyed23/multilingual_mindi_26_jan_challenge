import type { UserRole } from '../types';

/**
 * Design System Utilities
 * Provides consistent styling patterns and role-based theming
 */

// Role-based color mappings
export const roleColors = {
  vendor: {
    primary: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    secondary: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200',
    text: 'text-green-600',
    border: 'border-green-600',
    ring: 'focus:ring-green-500/50',
  },
  buyer: {
    primary: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
    text: 'text-blue-600',
    border: 'border-blue-600',
    ring: 'focus:ring-blue-500/50',
  },
  agent: {
    primary: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
    secondary: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200',
    text: 'text-purple-600',
    border: 'border-purple-600',
    ring: 'focus:ring-purple-500/50',
  },
  admin: {
    primary: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500',
    secondary: 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200',
    text: 'text-gray-600',
    border: 'border-gray-600',
    ring: 'focus:ring-gray-500/50',
  },
} as const;

// Admin colors (for admin role if needed)
export const adminColors = {
  primary: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500',
  secondary: 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200',
  text: 'text-gray-600',
  border: 'border-gray-600',
  ring: 'focus:ring-gray-500/50',
};

/**
 * Get role-based color classes
 */
export const getRoleColors = (role: UserRole) => {
  return roleColors[role] || roleColors.vendor;
};

/**
 * Standard container classes
 */
export const containerClasses = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';

/**
 * Standard card classes
 */
export const cardClasses = 'bg-white overflow-hidden shadow rounded-lg';

/**
 * Glass card classes (for modern UI elements)
 */
export const glassCardClasses = 'bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl';

/**
 * Button size variants
 */
export const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
} as const;

/**
 * Typography classes mapped to design tokens
 */
export const typographyClasses = {
  h1: 'text-3xl md:text-4xl font-bold font-display',
  h2: 'text-2xl md:text-3xl font-semibold font-display',
  h3: 'text-xl md:text-2xl font-semibold font-sans',
  h4: 'text-lg md:text-xl font-medium font-sans',
  body: 'text-base font-normal font-sans',
  caption: 'text-sm font-normal font-sans',
  label: 'text-sm font-medium font-sans',
} as const;

/**
 * Responsive breakpoint utilities
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Standard spacing values
 */
export const spacing = {
  xs: 'p-2',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-12',
} as const;

/**
 * Focus ring classes for accessibility
 */
export const focusRing = 'focus:outline-none focus:ring-2 focus:ring-offset-2';

/**
 * Transition classes for smooth animations
 */
export const transitions = {
  default: 'transition-colors duration-200',
  fast: 'transition-all duration-150',
  slow: 'transition-all duration-300',
} as const;

/**
 * Generate button classes based on variant, size, and role
 */
export const getButtonClasses = (
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger',
  size: 'sm' | 'md' | 'lg' = 'md',
  role?: UserRole,
  disabled = false
) => {
  const baseClasses = `inline-flex items-center justify-center font-medium rounded-md ${focusRing} ${transitions.default}`;
  const sizeClasses = buttonSizes[size];

  let variantClasses = '';

  if (disabled) {
    variantClasses = 'bg-gray-300 text-gray-500 cursor-not-allowed';
  } else {
    switch (variant) {
      case 'primary':
        if (role) {
          variantClasses = `${getRoleColors(role).primary} text-white`;
        } else {
          variantClasses = 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white';
        }
        break;
      case 'secondary':
        if (role) {
          variantClasses = getRoleColors(role).secondary;
        } else {
          variantClasses = 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200';
        }
        break;
      case 'outline':
        if (role) {
          variantClasses = `border ${getRoleColors(role).border} ${getRoleColors(role).text} hover:bg-gray-50`;
        } else {
          variantClasses = 'border border-gray-300 text-gray-700 hover:bg-gray-50';
        }
        break;
      case 'ghost':
        if (role) {
          variantClasses = `${getRoleColors(role).text} hover:bg-gray-50`;
        } else {
          variantClasses = 'text-gray-700 hover:bg-gray-50';
        }
        break;
      case 'danger':
        variantClasses = 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white';
        break;
    }
  }

  return `${baseClasses} ${sizeClasses} ${variantClasses}`;
};

/**
 * Generate input classes with error states
 */
export const getInputClasses = (hasError = false, disabled = false) => {
  const baseClasses = 'block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6';

  if (disabled) {
    return `${baseClasses} bg-gray-50 text-gray-500 ring-gray-200 cursor-not-allowed`;
  }

  if (hasError) {
    return `${baseClasses} ring-red-300 focus:ring-red-500`;
  }

  return `${baseClasses} ring-gray-300 focus:ring-green-600`;
};

/**
 * Status indicator colors
 */
export const statusColors = {
  success: 'text-green-600 bg-green-50 border-green-200',
  warning: 'text-orange-600 bg-orange-50 border-orange-200',
  error: 'text-red-600 bg-red-50 border-red-200',
  info: 'text-blue-600 bg-blue-50 border-blue-200',
  neutral: 'text-gray-600 bg-gray-50 border-gray-200',
} as const;

/**
 * Icon sizes for consistent usage
 */
export const iconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

/**
 * Accessibility helpers
 */
export const a11y = {
  screenReaderOnly: 'sr-only',
  skipLink: 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-white p-2 z-50',
  focusVisible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2',
} as const;

/**
 * Animation classes
 */
export const animations = {
  fadeIn: 'animate-in fade-in duration-200',
  fadeOut: 'animate-out fade-out duration-200',
  slideIn: 'animate-in slide-in-from-bottom duration-300',
  slideOut: 'animate-out slide-out-to-bottom duration-300',
  spin: 'animate-spin',
  pulse: 'animate-pulse',
} as const;