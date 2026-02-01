// Data Serialization Service
// Implements JSON serialization for all system data objects
// Provides data validation for user inputs, messages, and prices
// Handles parsing services for commodity data and translation requests

import type {
  Message,
  PriceData,
  QualityGrade,
  Language,
} from '../types';

// Serialization error types
export const SerializationErrorType = {
  INVALID_JSON: 'INVALID_JSON',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_DATA_TYPE: 'INVALID_DATA_TYPE',
  INVALID_ENUM_VALUE: 'INVALID_ENUM_VALUE',
  INVALID_DATE_FORMAT: 'INVALID_DATE_FORMAT',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  PARSING_FAILED: 'PARSING_FAILED',
} as const;

export type SerializationErrorTypeValue = typeof SerializationErrorType[keyof typeof SerializationErrorType];

export class SerializationError extends Error {
  public readonly type: SerializationErrorTypeValue;
  public readonly field?: string;
  public readonly originalError?: Error;

  constructor(
    type: SerializationErrorTypeValue,
    message: string,
    field?: string,
    originalError?: Error
  ) {
    super(message);
    this.name = 'SerializationError';
    this.type = type;
    this.field = field;
    this.originalError = originalError;
  }
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// Serialization options
export interface SerializationOptions {
  includeMetadata?: boolean;
  validateOnSerialize?: boolean;
  prettify?: boolean;
  dateFormat?: 'iso' | 'timestamp';
}

// Default serialization options
const DEFAULT_OPTIONS: SerializationOptions = {
  includeMetadata: true,
  validateOnSerialize: true,
  prettify: false,
  dateFormat: 'iso',
};

class DataSerializationService {
  /**
   * Serializes any system data object to JSON string
   */
  serialize<T>(
    data: T,
    options: SerializationOptions = DEFAULT_OPTIONS
  ): string {
    try {
      const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

      // Validate data before serialization if requested
      if (mergedOptions.validateOnSerialize) {
        const validationResult = this.validateData(data);
        if (!validationResult.isValid) {
          throw new SerializationError(
            SerializationErrorType.VALIDATION_FAILED,
            `Validation failed: ${validationResult.errors.join(', ')}`
          );
        }
      }

      // Prepare data for serialization
      const serializedData = this.prepareForSerialization(data, mergedOptions);

      // Convert to JSON string
      const jsonString = mergedOptions.prettify
        ? JSON.stringify(serializedData, null, 2)
        : JSON.stringify(serializedData);

      return jsonString;
    } catch (error) {
      if (error instanceof SerializationError) {
        throw error;
      }

      throw new SerializationError(
        SerializationErrorType.INVALID_JSON,
        'Failed to serialize data to JSON',
        undefined,
        error as Error
      );
    }
  }

  /**
   * Deserializes JSON string to typed object
   */
  deserialize<T>(
    jsonString: string,
    expectedType?: string
  ): T {
    try {
      if (!jsonString || jsonString.trim() === '') {
        throw new SerializationError(
          SerializationErrorType.INVALID_JSON,
          'JSON string cannot be empty'
        );
      }

      // Parse JSON
      const parsedData = JSON.parse(jsonString);

      // Restore dates and other special types
      const restoredData = this.restoreFromSerialization(parsedData);

      // Validate type if expected type is provided
      if (expectedType) {
        const validationResult = this.validateDataType(restoredData, expectedType);
        if (!validationResult.isValid) {
          throw new SerializationError(
            SerializationErrorType.INVALID_DATA_TYPE,
            `Data does not match expected type ${expectedType}: ${validationResult.errors.join(', ')}`
          );
        }
      }

      return restoredData as T;
    } catch (error) {
      if (error instanceof SerializationError) {
        throw error;
      }

      if (error instanceof SyntaxError) {
        throw new SerializationError(
          SerializationErrorType.INVALID_JSON,
          'Invalid JSON format',
          undefined,
          error
        );
      }

      throw new SerializationError(
        SerializationErrorType.PARSING_FAILED,
        'Failed to deserialize JSON data',
        undefined,
        error as Error
      );
    }
  }

  /**
   * Validates user input data
   */
  validateUserInput(input: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!input) {
      errors.push('Input cannot be null or undefined');
      return { isValid: false, errors, warnings };
    }

    // Check for common user input fields
    if (typeof input === 'object') {
      // Email validation
      if (input.email !== undefined) {
        if (!this.isValidEmail(input.email)) {
          errors.push('Invalid email format');
        }
      }

      // Phone validation
      if (input.phone !== undefined) {
        if (!this.isValidPhone(input.phone)) {
          errors.push('Invalid phone number format');
        }
      }

      // Password validation
      if (input.password !== undefined) {
        const passwordValidation = this.validatePassword(input.password);
        if (!passwordValidation.isValid) {
          errors.push(...passwordValidation.errors);
        }
      }

      // Text content validation
      if (input.text !== undefined || input.content !== undefined) {
        const text = input.text || input.content;
        const textValidation = this.validateTextContent(text);
        if (!textValidation.isValid) {
          errors.push(...textValidation.errors);
        }
        warnings.push(...(textValidation.warnings || []));
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates message data
   */
  validateMessage(message: Partial<Message>): ValidationResult {
    const errors: string[] = [];

    // Required fields
    if (!message.senderId) {
      errors.push('Sender ID is required');
    }

    if (!message.receiverId) {
      errors.push('Receiver ID is required');
    }

    if (!message.content) {
      errors.push('Message content is required');
    } else {
      // Validate content structure
      if (!message.content.originalText) {
        errors.push('Original text is required');
      }

      if (!message.content.originalLanguage) {
        errors.push('Original language is required');
      } else if (!this.isValidLanguage(message.content.originalLanguage)) {
        errors.push('Invalid original language');
      }

      if (!message.content.messageType) {
        errors.push('Message type is required');
      } else if (!['text', 'voice', 'image', 'document'].includes(message.content.messageType)) {
        errors.push('Invalid message type');
      }

      // Validate text content
      if (message.content.originalText) {
        const textValidation = this.validateTextContent(message.content.originalText);
        if (!textValidation.isValid) {
          errors.push(...textValidation.errors);
        }
      }
    }

    // Validate metadata
    if (message.metadata) {
      if (message.metadata.timestamp && !(message.metadata.timestamp instanceof Date)) {
        errors.push('Invalid timestamp format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates price data
   */
  validatePriceData(priceData: Partial<PriceData>): ValidationResult {
    const errors: string[] = [];

    // Required fields
    if (!priceData.commodity || priceData.commodity.trim() === '') {
      errors.push('Commodity name is required');
    }

    if (!priceData.mandi || priceData.mandi.trim() === '') {
      errors.push('Mandi name is required');
    }

    if (priceData.price === undefined || priceData.price === null) {
      errors.push('Price is required');
    } else {
      if (priceData.price <= 0) {
        errors.push('Price must be greater than zero');
      }

      if (priceData.price > 1000000) {
        errors.push('Price seems unreasonably high');
      }
    }

    if (!priceData.unit || priceData.unit.trim() === '') {
      errors.push('Unit is required');
    }

    if (!priceData.quality) {
      errors.push('Quality grade is required');
    } else if (!this.isValidQualityGrade(priceData.quality)) {
      errors.push('Invalid quality grade');
    }

    if (!priceData.timestamp) {
      errors.push('Timestamp is required');
    } else {
      if (!(priceData.timestamp instanceof Date)) {
        errors.push('Invalid timestamp format');
      } else {
        if (priceData.timestamp > new Date()) {
          errors.push('Timestamp cannot be in the future');
        }

        // Check if timestamp is too old (more than 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        if (priceData.timestamp < thirtyDaysAgo) {
          errors.push('Price data is too old (more than 30 days)');
        }
      }
    }

    if (!priceData.source || priceData.source.trim() === '') {
      errors.push('Source is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Parses commodity data from external sources
   */
  parseCommodityData(rawData: any): PriceData[] {
    try {
      if (!rawData) {
        throw new SerializationError(
          SerializationErrorType.PARSING_FAILED,
          'Raw commodity data cannot be null or undefined'
        );
      }

      const commodities: PriceData[] = [];

      // Handle different data formats
      if (Array.isArray(rawData)) {
        for (const item of rawData) {
          const parsed = this.parseSingleCommodityItem(item);
          if (parsed) {
            commodities.push(parsed);
          }
        }
      } else if (typeof rawData === 'object') {
        // Handle single commodity object
        const parsed = this.parseSingleCommodityItem(rawData);
        if (parsed) {
          commodities.push(parsed);
        }
      } else {
        throw new SerializationError(
          SerializationErrorType.PARSING_FAILED,
          'Invalid commodity data format'
        );
      }

      return commodities;
    } catch (error) {
      if (error instanceof SerializationError) {
        throw error;
      }

      throw new SerializationError(
        SerializationErrorType.PARSING_FAILED,
        'Failed to parse commodity data',
        undefined,
        error as Error
      );
    }
  }

  /**
   * Parses translation request data
   */
  parseTranslationRequest(rawData: any): {
    text: string;
    fromLanguage: Language;
    toLanguage: Language;
    options?: any;
  } {
    try {
      if (!rawData || typeof rawData !== 'object') {
        throw new SerializationError(
          SerializationErrorType.PARSING_FAILED,
          'Translation request data must be an object'
        );
      }

      // Extract required fields
      const text = rawData.text || rawData.originalText || rawData.content;
      const fromLanguage = rawData.fromLanguage || rawData.fromLang || rawData.source;
      const toLanguage = rawData.toLanguage || rawData.toLang || rawData.target;

      // Validate required fields
      if (!text || typeof text !== 'string') {
        throw new SerializationError(
          SerializationErrorType.MISSING_REQUIRED_FIELD,
          'Text is required for translation request',
          'text'
        );
      }

      if (!fromLanguage || !this.isValidLanguage(fromLanguage)) {
        throw new SerializationError(
          SerializationErrorType.INVALID_ENUM_VALUE,
          'Valid source language is required',
          'fromLanguage'
        );
      }

      if (!toLanguage || !this.isValidLanguage(toLanguage)) {
        throw new SerializationError(
          SerializationErrorType.INVALID_ENUM_VALUE,
          'Valid target language is required',
          'toLanguage'
        );
      }

      return {
        text: text.trim(),
        fromLanguage: fromLanguage as Language,
        toLanguage: toLanguage as Language,
        options: rawData.options
      };
    } catch (error) {
      if (error instanceof SerializationError) {
        throw error;
      }

      throw new SerializationError(
        SerializationErrorType.PARSING_FAILED,
        'Failed to parse translation request',
        undefined,
        error as Error
      );
    }
  }

  /**
   * Generic data validation
   */
  public validateData(data: any): ValidationResult {
    const errors: string[] = [];

    if (data === null || data === undefined) {
      errors.push('Data cannot be null or undefined');
      return { isValid: false, errors };
    }

    // Check for circular references
    try {
      JSON.stringify(data);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('circular')) {
        errors.push('Data contains circular references');
      } else {
        errors.push('Data is not serializable');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates data type against expected type
   */
  private validateDataType(data: any, expectedType: string): ValidationResult {
    const errors: string[] = [];

    switch (expectedType.toLowerCase()) {
      case 'user':
        if (!this.isValidUser(data)) {
          errors.push('Data does not match User interface');
        }
        break;
      case 'message':
        if (!this.isValidMessage(data)) {
          errors.push('Data does not match Message interface');
        }
        break;
      case 'pricedata':
        if (!this.isValidPriceData(data)) {
          errors.push('Data does not match PriceData interface');
        }
        break;
      case 'deal':
        if (!this.isValidDeal(data)) {
          errors.push('Data does not match Deal interface');
        }
        break;
      default:
        // Generic object validation
        if (typeof data !== 'object' || data === null) {
          errors.push(`Expected object type, got ${typeof data}`);
        }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Prepares data for serialization (handles dates, etc.)
   */
  private prepareForSerialization(data: any, options: SerializationOptions): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (data instanceof Date) {
      return options.dateFormat === 'timestamp' ? data.getTime() : data.toISOString();
    }

    if (Array.isArray(data)) {
      return data.map(item => this.prepareForSerialization(item, options));
    }

    if (typeof data === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(data)) {
        result[key] = this.prepareForSerialization(value, options);
      }

      // Add metadata if requested
      if (options.includeMetadata) {
        result._metadata = {
          serializedAt: new Date().toISOString(),
          version: '1.0'
        };
      }

      return result;
    }

    return data;
  }

  /**
   * Restores data from serialization (converts date strings back to dates, etc.)
   */
  private restoreFromSerialization(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.restoreFromSerialization(item));
    }

    if (typeof data === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Skip metadata
        if (key === '_metadata') {
          continue;
        }

        // Restore dates
        if (this.isDateField(key) && typeof value === 'string') {
          result[key] = new Date(value);
        } else if (this.isDateField(key) && typeof value === 'number') {
          result[key] = new Date(value);
        } else {
          result[key] = this.restoreFromSerialization(value);
        }
      }
      return result;
    }

    return data;
  }

  /**
   * Checks if a field name indicates a date field
   */
  private isDateField(fieldName: string): boolean {
    const dateFields = [
      'createdAt', 'updatedAt', 'timestamp', 'date', 'lastUpdated',
      'verifiedAt', 'expiresAt', 'resolvedAt', 'syncedAt', 'lastActivity'
    ];
    return dateFields.includes(fieldName) || fieldName.endsWith('At') || fieldName.endsWith('Date');
  }

  /**
   * Parses a single commodity item
   */
  private parseSingleCommodityItem(item: any): PriceData | null {
    try {
      if (!item || typeof item !== 'object') {
        return null;
      }

      // Map common field variations
      const commodity = item.commodity || item.name || item.product || item.crop;
      const mandi = item.mandi || item.market || item.location || item.place;
      const price = item.price || item.rate || item.cost || item.value;
      const unit = item.unit || item.measure || item.measurement || 'kg';
      const quality = item.quality || item.grade || 'standard';
      const source = item.source || item.provider || 'unknown';

      // Create timestamp
      let timestamp = new Date();
      if (item.timestamp) {
        timestamp = new Date(item.timestamp);
      } else if (item.date) {
        timestamp = new Date(item.date);
      }

      // Validate required fields
      if (!commodity || !mandi || price === undefined || price === null) {
        return null;
      }

      const priceData: PriceData = {
        commodity: String(commodity).trim(),
        mandi: String(mandi).trim(),
        price: Number(price),
        unit: String(unit).trim(),
        quality: this.normalizeQualityGrade(quality),
        timestamp,
        source: String(source).trim()
      };

      // Validate the parsed data
      const validation = this.validatePriceData(priceData);
      if (!validation.isValid) {
        console.warn('Invalid commodity data:', validation.errors);
        return null;
      }

      return priceData;
    } catch (error) {
      console.error('Error parsing commodity item:', error);
      return null;
    }
  }

  /**
   * Normalizes quality grade values
   */
  private normalizeQualityGrade(quality: any): QualityGrade {
    if (!quality) return 'standard';

    const qualityStr = String(quality).toLowerCase().trim();

    if (qualityStr.includes('premium') || qualityStr.includes('high') || qualityStr.includes('best')) {
      return 'premium';
    }
    if (qualityStr.includes('basic') || qualityStr.includes('low') || qualityStr.includes('poor')) {
      return 'basic';
    }
    if (qualityStr.includes('mixed') || qualityStr.includes('assorted')) {
      return 'mixed';
    }

    return 'standard';
  }

  // Validation helper methods
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  private validatePassword(password: string): ValidationResult {
    const errors: string[] = [];

    if (!password) {
      errors.push('Password is required');
    } else {
      if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
      if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateTextContent(text: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!text) {
      errors.push('Text content cannot be empty');
    } else {
      if (text.length > 10000) {
        errors.push('Text content is too long (max 10000 characters)');
      }
      if (text.length > 5000) {
        warnings.push('Text content is very long and may affect performance');
      }

      // Check for potentially harmful content
      const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(text)) {
          errors.push('Text content contains potentially harmful code');
          break;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private isValidLanguage(language: string): boolean {
    const supportedLanguages = [
      'hi', 'en', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'or', 'pa',
      'as', 'ur', 'sd', 'ne', 'ks', 'kok', 'mni', 'sat', 'doi', 'mai', 'bho'
    ];
    return supportedLanguages.includes(language);
  }

  private isValidQualityGrade(quality: string): boolean {
    return ['premium', 'standard', 'basic', 'mixed'].includes(quality);
  }

  // Type validation methods
  private isValidUser(data: any): boolean {
    return data &&
      typeof data.uid === 'string' &&
      typeof data.email === 'string' &&
      typeof data.role === 'string' &&
      ['vendor', 'buyer', 'agent'].includes(data.role);
  }

  private isValidMessage(data: any): boolean {
    return data &&
      typeof data.senderId === 'string' &&
      typeof data.receiverId === 'string' &&
      data.content &&
      typeof data.content.originalText === 'string';
  }

  private isValidPriceData(data: any): boolean {
    return data &&
      typeof data.commodity === 'string' &&
      typeof data.mandi === 'string' &&
      typeof data.price === 'number' &&
      data.price > 0;
  }

  private isValidDeal(data: any): boolean {
    return data &&
      typeof data.id === 'string' &&
      typeof data.buyerId === 'string' &&
      typeof data.sellerId === 'string' &&
      typeof data.commodity === 'string';
  }
}

// Export singleton instance
export const dataSerializer = new DataSerializationService();
export default dataSerializer;