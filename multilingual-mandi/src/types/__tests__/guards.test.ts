/**
 * Tests for type guards and validation utilities
 */

import { TypeGuards, Validators } from '../guards';
import { User, Location, ReputationScore, UserSettings } from '../user';
import { PriceEntry } from '../price';
import { Message } from '../message';

describe('TypeGuards', () => {
  describe('primitive type guards', () => {
    test('isString should correctly identify strings', () => {
      expect(TypeGuards.isString('hello')).toBe(true);
      expect(TypeGuards.isString('')).toBe(true);
      expect(TypeGuards.isString(123)).toBe(false);
      expect(TypeGuards.isString(null)).toBe(false);
      expect(TypeGuards.isString(undefined)).toBe(false);
    });

    test('isNumber should correctly identify numbers', () => {
      expect(TypeGuards.isNumber(123)).toBe(true);
      expect(TypeGuards.isNumber(0)).toBe(true);
      expect(TypeGuards.isNumber(-123)).toBe(true);
      expect(TypeGuards.isNumber(123.45)).toBe(true);
      expect(TypeGuards.isNumber('123')).toBe(false);
      expect(TypeGuards.isNumber(NaN)).toBe(false);
    });

    test('isBoolean should correctly identify booleans', () => {
      expect(TypeGuards.isBoolean(true)).toBe(true);
      expect(TypeGuards.isBoolean(false)).toBe(true);
      expect(TypeGuards.isBoolean('true')).toBe(false);
      expect(TypeGuards.isBoolean(1)).toBe(false);
      expect(TypeGuards.isBoolean(0)).toBe(false);
    });

    test('isDate should correctly identify valid dates', () => {
      expect(TypeGuards.isDate(new Date())).toBe(true);
      expect(TypeGuards.isDate(new Date('2023-01-01'))).toBe(true);
      expect(TypeGuards.isDate(new Date('invalid'))).toBe(false);
      expect(TypeGuards.isDate('2023-01-01')).toBe(false);
      expect(TypeGuards.isDate(1234567890)).toBe(false);
    });
  });

  describe('enum type guards', () => {
    test('isUserType should validate user types', () => {
      expect(TypeGuards.isUserType('vendor')).toBe(true);
      expect(TypeGuards.isUserType('buyer')).toBe(true);
      expect(TypeGuards.isUserType('both')).toBe(true);
      expect(TypeGuards.isUserType('invalid')).toBe(false);
      expect(TypeGuards.isUserType('')).toBe(false);
      expect(TypeGuards.isUserType(null)).toBe(false);
    });

    test('isMessageType should validate message types', () => {
      expect(TypeGuards.isMessageType('text')).toBe(true);
      expect(TypeGuards.isMessageType('voice')).toBe(true);
      expect(TypeGuards.isMessageType('image')).toBe(true);
      expect(TypeGuards.isMessageType('offer')).toBe(true);
      expect(TypeGuards.isMessageType('system')).toBe(true);
      expect(TypeGuards.isMessageType('invalid')).toBe(false);
    });

    test('isPriceSource should validate price sources', () => {
      expect(TypeGuards.isPriceSource('agmarknet')).toBe(true);
      expect(TypeGuards.isPriceSource('vendor_submission')).toBe(true);
      expect(TypeGuards.isPriceSource('predicted')).toBe(true);
      expect(TypeGuards.isPriceSource('manual')).toBe(true);
      expect(TypeGuards.isPriceSource('invalid')).toBe(false);
    });
  });

  describe('complex type guards', () => {
    test('isLocation should validate location objects', () => {
      const validLocation: Location = {
        latitude: 28.6139,
        longitude: 77.2090,
        address: 'New Delhi, India',
        pincode: '110001',
        state: 'Delhi',
      };

      expect(TypeGuards.isLocation(validLocation)).toBe(true);

      // Invalid latitude
      expect(TypeGuards.isLocation({
        ...validLocation,
        latitude: 91,
      })).toBe(false);

      // Invalid longitude
      expect(TypeGuards.isLocation({
        ...validLocation,
        longitude: 181,
      })).toBe(false);

      // Missing required fields
      expect(TypeGuards.isLocation({
        latitude: 28.6139,
        longitude: 77.2090,
      })).toBe(false);
    });

    test('isReputationScore should validate reputation score objects', () => {
      const validReputation: ReputationScore = {
        overall: 4.5,
        punctuality: 4.0,
        communication: 5.0,
        productQuality: 4.2,
        totalTransactions: 25,
        reviewCount: 20,
        lastUpdated: new Date(),
      };

      expect(TypeGuards.isReputationScore(validReputation)).toBe(true);

      // Invalid score (out of range)
      expect(TypeGuards.isReputationScore({
        ...validReputation,
        overall: 6,
      })).toBe(false);

      // Negative transaction count
      expect(TypeGuards.isReputationScore({
        ...validReputation,
        totalTransactions: -1,
      })).toBe(false);
    });
  });
});

describe('Validators', () => {
  describe('validateUser', () => {
    const validUser: User = {
      id: 'user123',
      phoneNumber: '+919876543210',
      name: 'John Doe',
      email: 'john@example.com',
      preferredLanguage: 'en',
      userType: 'vendor',
      location: {
        latitude: 28.6139,
        longitude: 77.2090,
        address: 'New Delhi, India',
        pincode: '110001',
        state: 'Delhi',
      },
      reputation: {
        overall: 4.5,
        punctuality: 4.0,
        communication: 5.0,
        productQuality: 4.2,
        totalTransactions: 25,
        reviewCount: 20,
        lastUpdated: new Date(),
      },
      isVerified: true,
      isPhoneVerified: true,
      isBusinessVerified: false,
      createdAt: new Date(),
      lastActiveAt: new Date(),
      settings: {
        notifications: {
          deals: true,
          messages: true,
          priceAlerts: true,
          marketUpdates: false,
        },
        privacy: {
          showPhoneNumber: false,
          showLocation: true,
          allowDirectMessages: true,
        },
        language: {
          preferred: 'en',
          fallback: 'hi',
          autoTranslate: true,
        },
      },
    };

    test('should validate a correct user object', () => {
      const result = Validators.validateUser(validUser);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject invalid user objects', () => {
      const invalidUser = {
        ...validUser,
        id: '', // Empty ID
        phoneNumber: 'invalid-phone', // Invalid phone
      };

      const result = Validators.validateUser(invalidUser);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('User ID must be a non-empty string');
      expect(result.errors).toContain('Phone number must be a valid international format');
    });

    test('should reject non-object values', () => {
      const result = Validators.validateUser('not an object');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Value must be an object');
    });
  });

  describe('validatePriceEntry', () => {
    const validPriceEntry: PriceEntry = {
      id: 'price123',
      commodityId: 'commodity123',
      commodityName: 'Rice',
      price: 2500,
      unit: 'quintal',
      location: {
        mandiName: 'Delhi Mandi',
        district: 'New Delhi',
        state: 'Delhi',
        coordinates: {
          latitude: 28.6139,
          longitude: 77.2090,
        },
        marketType: 'wholesale',
      },
      source: 'agmarknet',
      quality: 'Grade A',
      timestamp: new Date(),
      confidence: 0.95,
      metadata: {},
    };

    test('should validate a correct price entry', () => {
      const result = Validators.validatePriceEntry(validPriceEntry);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject invalid price entries', () => {
      const invalidPriceEntry = {
        ...validPriceEntry,
        price: -100, // Negative price
        confidence: 1.5, // Invalid confidence
      };

      const result = Validators.validatePriceEntry(invalidPriceEntry);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Price must be a non-negative number');
      expect(result.errors).toContain('Confidence must be a number between 0 and 1');
    });
  });

  describe('validateMessage', () => {
    const validMessage: Message = {
      id: 'msg123',
      conversationId: 'conv123',
      senderId: 'user123',
      receiverId: 'user456',
      messageType: 'text',
      content: 'Hello, how are you?',
      timestamp: new Date(),
      status: 'sent',
      isRead: false,
      metadata: {
        clientTimestamp: new Date(),
      },
    };

    test('should validate a correct message', () => {
      const result = Validators.validateMessage(validMessage);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject invalid messages', () => {
      const invalidMessage = {
        ...validMessage,
        id: '', // Empty ID
        messageType: 'invalid', // Invalid message type
      };

      const result = Validators.validateMessage(invalidMessage);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Message ID must be a non-empty string');
      expect(result.errors).toContain('Message type must be a valid message type');
    });
  });
});