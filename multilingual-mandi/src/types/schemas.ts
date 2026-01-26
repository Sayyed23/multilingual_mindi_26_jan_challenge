/**
 * Validation schemas for the Multilingual Mandi platform
 * Provides reusable validation rules and schema definitions
 */

import { SupportedLanguage, UserType, MessageType, DealStatus, PriceSource } from './index';

// Basic validation rules
export const ValidationRules = {
  // String validations
  required: (value: string): boolean => value.trim().length > 0,
  minLength: (min: number) => (value: string): boolean => value.length >= min,
  maxLength: (max: number) => (value: string): boolean => value.length <= max,
  email: (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  phoneNumber: (value: string): boolean => /^\+?[1-9]\d{9,14}$/.test(value),
  url: (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  
  // Number validations
  min: (min: number) => (value: number): boolean => value >= min,
  max: (max: number) => (value: number): boolean => value <= max,
  positive: (value: number): boolean => value > 0,
  nonNegative: (value: number): boolean => value >= 0,
  integer: (value: number): boolean => Number.isInteger(value),
  requiredNumber: (value: number): boolean => value !== undefined && value !== null && !isNaN(value),
  
  // Date validations
  futureDate: (value: Date): boolean => value > new Date(),
  pastDate: (value: Date): boolean => value < new Date(),
  dateRange: (start: Date, end: Date) => (value: Date): boolean => 
    value >= start && value <= end,
  
  // Array validations
  nonEmpty: <T>(value: T[]): boolean => value.length > 0,
  maxItems: (max: number) => <T>(value: T[]): boolean => value.length <= max,
  minItems: (min: number) => <T>(value: T[]): boolean => value.length >= min,
  
  // Enum validations
  isUserType: (value: string): value is UserType => 
    ['vendor', 'buyer', 'both'].includes(value),
  isMessageType: (value: string): value is MessageType =>
    ['text', 'voice', 'image', 'offer', 'system', 'deal_update', 'price_quote'].includes(value),
  isDealStatus: (value: string): value is DealStatus =>
    ['negotiating', 'agreed', 'confirmed', 'payment_pending', 'in_transit', 
     'delivered', 'completed', 'disputed', 'cancelled', 'expired'].includes(value),
  isPriceSource: (value: string): value is PriceSource =>
    ['agmarknet', 'vendor_submission', 'predicted', 'manual'].includes(value),
  isSupportedLanguage: (value: string): value is SupportedLanguage => {
    const languages = [
      'hi', 'en', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'or',
      'pa', 'as', 'ur', 'sd', 'ne', 'si', 'my', 'dz', 'ks', 'kok',
      'mni', 'sat', 'doi', 'bho', 'mai', 'mag', 'sck'
    ];
    return languages.includes(value as SupportedLanguage);
  },
  
  // Location validations
  latitude: (value: number): boolean => value >= -90 && value <= 90,
  longitude: (value: number): boolean => value >= -180 && value <= 180,
  pincode: (value: string): boolean => /^\d{6}$/.test(value),
  
  // Business validations
  gstNumber: (value: string): boolean => 
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value),
  
  // Price validations
  price: (value: number): boolean => value > 0 && value < 1000000, // Max 10 lakh
  quantity: (value: number): boolean => value > 0 && value < 100000, // Max 1 lakh units
  confidence: (value: number): boolean => value >= 0 && value <= 1,
  
  // File validations
  fileSize: (maxSizeInMB: number) => (file: File): boolean => 
    file.size <= maxSizeInMB * 1024 * 1024,
  fileType: (allowedTypes: string[]) => (file: File): boolean =>
    allowedTypes.includes(file.type),
  imageFile: (file: File): boolean => file.type.startsWith('image/'),
  audioFile: (file: File): boolean => file.type.startsWith('audio/'),
  documentFile: (file: File): boolean => 
    ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type),
};

// Validation error messages
export const ValidationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phoneNumber: 'Please enter a valid phone number',
  url: 'Please enter a valid URL',
  minLength: (min: number) => `Must be at least ${min} characters long`,
  maxLength: (max: number) => `Must be no more than ${max} characters long`,
  min: (min: number) => `Must be at least ${min}`,
  max: (max: number) => `Must be no more than ${max}`,
  positive: 'Must be a positive number',
  nonNegative: 'Must be zero or positive',
  integer: 'Must be a whole number',
  futureDate: 'Must be a future date',
  pastDate: 'Must be a past date',
  nonEmpty: 'Must contain at least one item',
  maxItems: (max: number) => `Must contain no more than ${max} items`,
  minItems: (min: number) => `Must contain at least ${min} items`,
  latitude: 'Must be a valid latitude (-90 to 90)',
  longitude: 'Must be a valid longitude (-180 to 180)',
  pincode: 'Must be a valid 6-digit pincode',
  gstNumber: 'Must be a valid GST number',
  price: 'Must be a valid price (greater than 0)',
  quantity: 'Must be a valid quantity (greater than 0)',
  confidence: 'Must be between 0 and 1',
  fileSize: (maxSizeInMB: number) => `File size must be less than ${maxSizeInMB}MB`,
  fileType: (allowedTypes: string[]) => `File type must be one of: ${allowedTypes.join(', ')}`,
  imageFile: 'Must be an image file',
  audioFile: 'Must be an audio file',
  documentFile: 'Must be a document file (PDF, DOC, DOCX)',
  userType: 'Must be vendor, buyer, or both',
  messageType: 'Must be a valid message type',
  dealStatus: 'Must be a valid deal status',
  priceSource: 'Must be a valid price source',
  supportedLanguage: 'Must be a supported language',
};

// Schema definitions for common entities
export type ValidationSchema<T> = {
  [K in keyof T]?: {
    rules: ((value: T[K]) => boolean)[];
    messages: string[];
    required?: boolean;
  };
};

// User registration schema
export const UserRegistrationSchema: ValidationSchema<{
  phoneNumber: string;
  name: string;
  preferredLanguage: string;
  userType: UserType;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    pincode: string;
    state: string;
  };
}> = {
  phoneNumber: {
    rules: [ValidationRules.required, ValidationRules.phoneNumber],
    messages: [ValidationMessages.required, ValidationMessages.phoneNumber],
    required: true,
  },
  name: {
    rules: [ValidationRules.required, ValidationRules.minLength(2), ValidationRules.maxLength(100)],
    messages: [ValidationMessages.required, ValidationMessages.minLength(2), ValidationMessages.maxLength(100)],
    required: true,
  },
  preferredLanguage: {
    rules: [ValidationRules.required, ValidationRules.isSupportedLanguage],
    messages: [ValidationMessages.required, ValidationMessages.supportedLanguage],
    required: true,
  },
  userType: {
    rules: [ValidationRules.required, ValidationRules.isUserType],
    messages: [ValidationMessages.required, ValidationMessages.userType],
    required: true,
  },
};

// Message schema
export const MessageSchema: ValidationSchema<{
  content: string;
  messageType: MessageType;
  receiverId: string;
}> = {
  content: {
    rules: [ValidationRules.required, ValidationRules.maxLength(5000)],
    messages: [ValidationMessages.required, ValidationMessages.maxLength(5000)],
    required: true,
  },
  messageType: {
    rules: [ValidationRules.required, ValidationRules.isMessageType],
    messages: [ValidationMessages.required, ValidationMessages.messageType],
    required: true,
  },
  receiverId: {
    rules: [ValidationRules.required],
    messages: [ValidationMessages.required],
    required: true,
  },
};

// Price submission schema
export const PriceSubmissionSchema: ValidationSchema<{
  commodityId: string;
  price: number;
  unit: string;
  quality: string;
  quantity: number;
}> = {
  commodityId: {
    rules: [ValidationRules.required],
    messages: [ValidationMessages.required],
    required: true,
  },
  price: {
    rules: [ValidationRules.requiredNumber, ValidationRules.price],
    messages: [ValidationMessages.required, ValidationMessages.price],
    required: true,
  },
  unit: {
    rules: [ValidationRules.required],
    messages: [ValidationMessages.required],
    required: true,
  },
  quality: {
    rules: [ValidationRules.required],
    messages: [ValidationMessages.required],
    required: true,
  },
  quantity: {
    rules: [ValidationRules.requiredNumber, ValidationRules.quantity],
    messages: [ValidationMessages.required, ValidationMessages.quantity],
    required: true,
  },
};

// Deal creation schema
export const DealCreationSchema: ValidationSchema<{
  vendorId: string;
  buyerId: string;
  commodityId: string;
  quantity: number;
  agreedPrice: number;
}> = {
  vendorId: {
    rules: [ValidationRules.required],
    messages: [ValidationMessages.required],
    required: true,
  },
  buyerId: {
    rules: [ValidationRules.required],
    messages: [ValidationMessages.required],
    required: true,
  },
  commodityId: {
    rules: [ValidationRules.required],
    messages: [ValidationMessages.required],
    required: true,
  },
  quantity: {
    rules: [ValidationRules.requiredNumber, ValidationRules.quantity],
    messages: [ValidationMessages.required, ValidationMessages.quantity],
    required: true,
  },
  agreedPrice: {
    rules: [ValidationRules.requiredNumber, ValidationRules.price],
    messages: [ValidationMessages.required, ValidationMessages.price],
    required: true,
  },
};

// File upload schema
export const FileUploadSchema: ValidationSchema<{
  file: File;
  type: string;
}> = {
  file: {
    rules: [
      (file: File) => file instanceof File,
      ValidationRules.fileSize(10), // 10MB max
    ],
    messages: [
      'Must be a valid file',
      ValidationMessages.fileSize(10),
    ],
    required: true,
  },
  type: {
    rules: [
      ValidationRules.required,
      (type: string) => ['profile_picture', 'document', 'voice_message', 'product_image'].includes(type),
    ],
    messages: [
      ValidationMessages.required,
      'Must be a valid file type',
    ],
    required: true,
  },
};

// Validation utility functions
export const ValidationUtils = {
  // Validate a single field
  validateField: <T>(
    value: T,
    rules: ((value: T) => boolean)[],
    messages: string[]
  ): { isValid: boolean; error: string | null } => {
    for (let i = 0; i < rules.length; i++) {
      if (!rules[i](value)) {
        return { isValid: false, error: messages[i] || 'Validation failed' };
      }
    }
    return { isValid: true, error: null };
  },

  // Validate an entire object against a schema
  validateObject: <T extends Record<string, any>>(
    obj: T,
    schema: ValidationSchema<T>
  ): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};
    let isValid = true;

    for (const key in schema) {
      const fieldSchema = schema[key];
      if (!fieldSchema) continue;

      const value = obj[key];
      
      // Check if required field is missing
      if (fieldSchema.required && (value === undefined || value === null || value === '')) {
        errors[key] = ValidationMessages.required;
        isValid = false;
        continue;
      }

      // Skip validation if field is not required and empty
      if (!fieldSchema.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Validate field
      const fieldResult = ValidationUtils.validateField(value, fieldSchema.rules, fieldSchema.messages);
      if (!fieldResult.isValid) {
        errors[key] = fieldResult.error!;
        isValid = false;
      }
    }

    return { isValid, errors };
  },

  // Sanitize input strings
  sanitizeString: (input: string): string => {
    return input.trim().replace(/\s+/g, ' ');
  },

  // Normalize phone number
  normalizePhoneNumber: (phone: string): string => {
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Add country code if missing
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return '+' + cleaned;
    } else if (cleaned.length === 10) {
      return '+91' + cleaned;
    } else if (cleaned.startsWith('+91') && cleaned.length === 13) {
      return cleaned;
    }
    
    return cleaned;
  },

  // Normalize email
  normalizeEmail: (email: string): string => {
    return email.toLowerCase().trim();
  },

  // Format price for display
  formatPrice: (price: number, currency: string = 'INR'): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  },

  // Format quantity with unit
  formatQuantity: (quantity: number, unit: string): string => {
    const formattedQuantity = new Intl.NumberFormat('en-IN').format(quantity);
    return `${formattedQuantity} ${unit}`;
  },

  // Validate and format GST number
  formatGSTNumber: (gst: string): string => {
    return gst.toUpperCase().replace(/\s/g, '');
  },

  // Generate validation summary
  getValidationSummary: (errors: Record<string, string>): string => {
    const errorCount = Object.keys(errors).length;
    if (errorCount === 0) return 'All fields are valid';
    if (errorCount === 1) return '1 field has an error';
    return `${errorCount} fields have errors`;
  },
};