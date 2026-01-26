/**
 * Tests for validation schemas and utilities
 */

import { ValidationRules, ValidationUtils, UserRegistrationSchema, MessageSchema } from '../schemas';

describe('ValidationRules', () => {
  describe('string validations', () => {
    test('required should validate non-empty strings', () => {
      expect(ValidationRules.required('hello')).toBe(true);
      expect(ValidationRules.required('  hello  ')).toBe(true);
      expect(ValidationRules.required('')).toBe(false);
      expect(ValidationRules.required('   ')).toBe(false);
    });

    test('email should validate email addresses', () => {
      expect(ValidationRules.email('test@example.com')).toBe(true);
      expect(ValidationRules.email('user.name+tag@domain.co.uk')).toBe(true);
      expect(ValidationRules.email('invalid-email')).toBe(false);
      expect(ValidationRules.email('test@')).toBe(false);
      expect(ValidationRules.email('@example.com')).toBe(false);
    });

    test('phoneNumber should validate phone numbers', () => {
      expect(ValidationRules.phoneNumber('+919876543210')).toBe(true);
      expect(ValidationRules.phoneNumber('919876543210')).toBe(true);
      expect(ValidationRules.phoneNumber('+1234567890')).toBe(true);
      expect(ValidationRules.phoneNumber('invalid-phone')).toBe(false);
      expect(ValidationRules.phoneNumber('123')).toBe(false);
      expect(ValidationRules.phoneNumber('+0123456789')).toBe(false); // starts with 0
    });

    test('minLength should validate minimum length', () => {
      const minLength5 = ValidationRules.minLength(5);
      expect(minLength5('hello')).toBe(true);
      expect(minLength5('hello world')).toBe(true);
      expect(minLength5('hi')).toBe(false);
      expect(minLength5('')).toBe(false);
    });

    test('maxLength should validate maximum length', () => {
      const maxLength10 = ValidationRules.maxLength(10);
      expect(maxLength10('hello')).toBe(true);
      expect(maxLength10('1234567890')).toBe(true);
      expect(maxLength10('12345678901')).toBe(false);
    });
  });

  describe('number validations', () => {
    test('positive should validate positive numbers', () => {
      expect(ValidationRules.positive(1)).toBe(true);
      expect(ValidationRules.positive(0.1)).toBe(true);
      expect(ValidationRules.positive(0)).toBe(false);
      expect(ValidationRules.positive(-1)).toBe(false);
    });

    test('nonNegative should validate non-negative numbers', () => {
      expect(ValidationRules.nonNegative(1)).toBe(true);
      expect(ValidationRules.nonNegative(0)).toBe(true);
      expect(ValidationRules.nonNegative(-1)).toBe(false);
    });

    test('min should validate minimum value', () => {
      const min10 = ValidationRules.min(10);
      expect(min10(10)).toBe(true);
      expect(min10(15)).toBe(true);
      expect(min10(5)).toBe(false);
    });

    test('max should validate maximum value', () => {
      const max100 = ValidationRules.max(100);
      expect(max100(50)).toBe(true);
      expect(max100(100)).toBe(true);
      expect(max100(150)).toBe(false);
    });

    test('integer should validate integers', () => {
      expect(ValidationRules.integer(5)).toBe(true);
      expect(ValidationRules.integer(0)).toBe(true);
      expect(ValidationRules.integer(-5)).toBe(true);
      expect(ValidationRules.integer(5.5)).toBe(false);
      expect(ValidationRules.integer(5.0)).toBe(true); // 5.0 is still an integer
    });
  });

  describe('location validations', () => {
    test('latitude should validate latitude values', () => {
      expect(ValidationRules.latitude(0)).toBe(true);
      expect(ValidationRules.latitude(90)).toBe(true);
      expect(ValidationRules.latitude(-90)).toBe(true);
      expect(ValidationRules.latitude(45.5)).toBe(true);
      expect(ValidationRules.latitude(91)).toBe(false);
      expect(ValidationRules.latitude(-91)).toBe(false);
    });

    test('longitude should validate longitude values', () => {
      expect(ValidationRules.longitude(0)).toBe(true);
      expect(ValidationRules.longitude(180)).toBe(true);
      expect(ValidationRules.longitude(-180)).toBe(true);
      expect(ValidationRules.longitude(77.2090)).toBe(true);
      expect(ValidationRules.longitude(181)).toBe(false);
      expect(ValidationRules.longitude(-181)).toBe(false);
    });

    test('pincode should validate Indian pincodes', () => {
      expect(ValidationRules.pincode('110001')).toBe(true);
      expect(ValidationRules.pincode('400001')).toBe(true);
      expect(ValidationRules.pincode('12345')).toBe(false); // too short
      expect(ValidationRules.pincode('1234567')).toBe(false); // too long
      expect(ValidationRules.pincode('11000a')).toBe(false); // contains letter
    });
  });

  describe('business validations', () => {
    test('gstNumber should validate GST numbers', () => {
      expect(ValidationRules.gstNumber('07AABCU9603R1ZX')).toBe(true);
      expect(ValidationRules.gstNumber('29AABCU9603R1ZX')).toBe(true);
      expect(ValidationRules.gstNumber('invalid-gst')).toBe(false);
      expect(ValidationRules.gstNumber('07AABCU9603R1Z')).toBe(false); // too short
    });
  });

  describe('enum validations', () => {
    test('isUserType should validate user types', () => {
      expect(ValidationRules.isUserType('vendor')).toBe(true);
      expect(ValidationRules.isUserType('buyer')).toBe(true);
      expect(ValidationRules.isUserType('both')).toBe(true);
      expect(ValidationRules.isUserType('invalid')).toBe(false);
    });

    test('isSupportedLanguage should validate supported languages', () => {
      expect(ValidationRules.isSupportedLanguage('hi')).toBe(true);
      expect(ValidationRules.isSupportedLanguage('en')).toBe(true);
      expect(ValidationRules.isSupportedLanguage('bn')).toBe(true);
      expect(ValidationRules.isSupportedLanguage('invalid')).toBe(false);
      expect(ValidationRules.isSupportedLanguage('fr')).toBe(false); // not supported
    });
  });
});

describe('ValidationUtils', () => {
  describe('validateField', () => {
    test('should validate field with single rule', () => {
      const result = ValidationUtils.validateField(
        'test@example.com',
        [ValidationRules.email],
        ['Invalid email']
      );
      expect(result.isValid).toBe(true);
      expect(result.error).toBe(null);
    });

    test('should return error for invalid field', () => {
      const result = ValidationUtils.validateField(
        'invalid-email',
        [ValidationRules.email],
        ['Invalid email']
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid email');
    });

    test('should validate field with multiple rules', () => {
      const result = ValidationUtils.validateField(
        'hello',
        [ValidationRules.required, ValidationRules.minLength(3)],
        ['Required', 'Too short']
      );
      expect(result.isValid).toBe(true);
      expect(result.error).toBe(null);
    });

    test('should return first error for multiple failing rules', () => {
      const result = ValidationUtils.validateField(
        '',
        [ValidationRules.required, ValidationRules.minLength(3)],
        ['Required', 'Too short']
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Required');
    });
  });

  describe('validateObject', () => {
    test('should validate object with UserRegistrationSchema', () => {
      const validUser = {
        phoneNumber: '+919876543210',
        name: 'John Doe',
        preferredLanguage: 'en',
        userType: 'vendor' as const,
        location: {
          latitude: 28.6139,
          longitude: 77.2090,
          address: 'New Delhi, India',
          pincode: '110001',
          state: 'Delhi',
        },
      };

      const result = ValidationUtils.validateObject(validUser, UserRegistrationSchema);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    test('should return errors for invalid object', () => {
      const invalidUser = {
        phoneNumber: 'invalid-phone',
        name: '',
        preferredLanguage: 'invalid-lang',
        userType: 'invalid-type' as any,
        location: {
          latitude: 28.6139,
          longitude: 77.2090,
          address: 'New Delhi, India',
          pincode: '110001',
          state: 'Delhi',
        },
      };

      const result = ValidationUtils.validateObject(invalidUser, UserRegistrationSchema);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
      expect(result.errors.phoneNumber).toBeDefined();
      expect(result.errors.name).toBeDefined();
    });

    test('should validate message with MessageSchema', () => {
      const validMessage = {
        content: 'Hello, how are you?',
        messageType: 'text' as const,
        receiverId: 'user123',
      };

      const result = ValidationUtils.validateObject(validMessage, MessageSchema);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });
  });

  describe('utility functions', () => {
    test('sanitizeString should clean up strings', () => {
      expect(ValidationUtils.sanitizeString('  hello   world  ')).toBe('hello world');
      expect(ValidationUtils.sanitizeString('hello\n\nworld')).toBe('hello world');
      expect(ValidationUtils.sanitizeString('  ')).toBe('');
    });

    test('normalizePhoneNumber should format phone numbers', () => {
      expect(ValidationUtils.normalizePhoneNumber('9876543210')).toBe('+919876543210');
      expect(ValidationUtils.normalizePhoneNumber('919876543210')).toBe('+919876543210');
      expect(ValidationUtils.normalizePhoneNumber('+919876543210')).toBe('+919876543210');
      expect(ValidationUtils.normalizePhoneNumber('+1-234-567-8900')).toBe('+12345678900');
    });

    test('normalizeEmail should format emails', () => {
      expect(ValidationUtils.normalizeEmail('  TEST@EXAMPLE.COM  ')).toBe('test@example.com');
      expect(ValidationUtils.normalizeEmail('User@Domain.Com')).toBe('user@domain.com');
    });

    test('formatPrice should format prices correctly', () => {
      expect(ValidationUtils.formatPrice(1000)).toBe('₹1,000');
      expect(ValidationUtils.formatPrice(1000.5)).toBe('₹1,000.5');
      expect(ValidationUtils.formatPrice(1000000)).toBe('₹10,00,000');
    });

    test('formatQuantity should format quantities with units', () => {
      expect(ValidationUtils.formatQuantity(100, 'kg')).toBe('100 kg');
      expect(ValidationUtils.formatQuantity(1000, 'quintal')).toBe('1,000 quintal');
    });

    test('formatGSTNumber should format GST numbers', () => {
      expect(ValidationUtils.formatGSTNumber('07aabcu9603r1zx')).toBe('07AABCU9603R1ZX');
      expect(ValidationUtils.formatGSTNumber('07 AABCU 9603 R1ZX')).toBe('07AABCU9603R1ZX');
    });

    test('getValidationSummary should provide error summaries', () => {
      expect(ValidationUtils.getValidationSummary({})).toBe('All fields are valid');
      expect(ValidationUtils.getValidationSummary({ name: 'Required' })).toBe('1 field has an error');
      expect(ValidationUtils.getValidationSummary({ 
        name: 'Required', 
        email: 'Invalid' 
      })).toBe('2 fields have errors');
    });
  });
});