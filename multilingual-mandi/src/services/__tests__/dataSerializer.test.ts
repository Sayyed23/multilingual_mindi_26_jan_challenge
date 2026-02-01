// Data Serialization Service Tests
import { describe, it, expect } from 'vitest';
import { dataSerializer, SerializationError } from '../dataSerializer';
import type { Message, PriceData, Language, QualityGrade } from '../../types';

describe('DataSerializationService', () => {
  describe('serialize', () => {
    it('should serialize simple objects to JSON', () => {
      const data = { name: 'test', value: 123 };
      const result = dataSerializer.serialize(data);

      const parsed = JSON.parse(result);
      expect(parsed.name).toBe('test');
      expect(parsed.value).toBe(123);
      expect(parsed._metadata).toBeDefined();
      expect(parsed._metadata.version).toBe('1.0');
      expect(typeof parsed._metadata.serializedAt).toBe('string');
    });

    it('should handle Date objects correctly', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const data = { createdAt: date };
      const result = dataSerializer.serialize(data);

      const parsed = JSON.parse(result);
      expect(parsed.createdAt).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should serialize with prettify option', () => {
      const data = { name: 'test' };
      const result = dataSerializer.serialize(data, { prettify: true });

      expect(result).toContain('\n');
      expect(result).toContain('  ');
    });

    it('should serialize without metadata when option is false', () => {
      const data = { name: 'test' };
      const result = dataSerializer.serialize(data, { includeMetadata: false });

      const parsed = JSON.parse(result);
      expect(parsed._metadata).toBeUndefined();
    });

    it('should throw error for circular references', () => {
      const obj: any = { name: 'test' };
      obj.self = obj;

      expect(() => dataSerializer.serialize(obj)).toThrow(SerializationError);
    });
  });

  describe('deserialize', () => {
    it('should deserialize JSON string to object', () => {
      const original = { name: 'test', value: 123 };
      const serialized = JSON.stringify(original);
      const result = dataSerializer.deserialize<typeof original>(serialized);

      expect(result).toEqual(original);
    });

    it('should restore Date objects', () => {
      const original = { createdAt: '2024-01-01T00:00:00.000Z' };
      const serialized = JSON.stringify(original);
      const result = dataSerializer.deserialize<{ createdAt: Date }>(serialized);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdAt.toISOString()).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should handle timestamp fields', () => {
      const original = {
        updatedAt: '2024-01-01T00:00:00.000Z',
        timestamp: 1704067200000
      };
      const serialized = JSON.stringify(original);
      const result = dataSerializer.deserialize<{ updatedAt: Date; timestamp: Date }>(serialized);

      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it('should throw error for invalid JSON', () => {
      expect(() => dataSerializer.deserialize('invalid json')).toThrow(SerializationError);
    });

    it('should throw error for empty string', () => {
      expect(() => dataSerializer.deserialize('')).toThrow(SerializationError);
    });

    it('should validate expected type when provided', () => {
      const userData = {
        uid: 'test-uid',
        email: 'test@example.com',
        role: 'buyer'
      };
      const serialized = JSON.stringify(userData);

      expect(() => dataSerializer.deserialize(serialized, 'user')).not.toThrow();
      expect(() => dataSerializer.deserialize('{"invalid": "data"}', 'user')).toThrow(SerializationError);
    });
  });

  describe('validateUserInput', () => {
    it('should validate correct user input', () => {
      const input = {
        email: 'test@example.com',
        phone: '+1234567890',
        password: 'StrongPass123',
        text: 'Valid text content'
      };

      const result = dataSerializer.validateUserInput(input);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid email', () => {
      const input = { email: 'invalid-email' };
      const result = dataSerializer.validateUserInput(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

    it('should reject weak password', () => {
      const input = { password: 'weak' };
      const result = dataSerializer.validateUserInput(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject invalid phone number', () => {
      const input = { phone: 'invalid-phone' };
      const result = dataSerializer.validateUserInput(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid phone number format');
    });

    it('should reject null input', () => {
      const result = dataSerializer.validateUserInput(null);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Input cannot be null or undefined');
    });

    it('should warn about very long text', () => {
      const longText = 'a'.repeat(6000);
      const input = { text: longText };
      const result = dataSerializer.validateUserInput(input);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Text content is very long and may affect performance');
    });

    it('should reject extremely long text', () => {
      const extremelyLongText = 'a'.repeat(15000);
      const input = { text: extremelyLongText };
      const result = dataSerializer.validateUserInput(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Text content is too long (max 10000 characters)');
    });

    it('should detect potentially harmful content', () => {
      const input = { text: '<script>alert("xss")</script>' };
      const result = dataSerializer.validateUserInput(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Text content contains potentially harmful code');
    });
  });

  describe('validateMessage', () => {
    const validMessage: Partial<Message> = {
      senderId: 'sender-123',
      receiverId: 'receiver-456',
      content: {
        originalText: 'Hello world',
        originalLanguage: 'en' as Language,
        translations: {},
        messageType: 'text'
      },
      metadata: {
        timestamp: new Date(),
        readStatus: false
      }
    };

    it('should validate correct message', () => {
      const result = dataSerializer.validateMessage(validMessage);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require sender ID', () => {
      const message = { ...validMessage };
      delete message.senderId;

      const result = dataSerializer.validateMessage(message);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Sender ID is required');
    });

    it('should require receiver ID', () => {
      const message = { ...validMessage };
      delete message.receiverId;

      const result = dataSerializer.validateMessage(message);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Receiver ID is required');
    });

    it('should require message content', () => {
      const message = { ...validMessage };
      delete message.content;

      const result = dataSerializer.validateMessage(message);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Message content is required');
    });

    it('should validate original text in content', () => {
      const message = { ...validMessage };
      message.content!.originalText = '';

      const result = dataSerializer.validateMessage(message);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Original text is required');
    });

    it('should validate original language', () => {
      const message = { ...validMessage };
      message.content!.originalLanguage = 'invalid' as Language;

      const result = dataSerializer.validateMessage(message);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid original language');
    });

    it('should validate message type', () => {
      const message = { ...validMessage };
      message.content!.messageType = 'invalid' as any;

      const result = dataSerializer.validateMessage(message);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid message type');
    });
  });

  describe('validatePriceData', () => {
    const validPriceData: Partial<PriceData> = {
      commodity: 'Rice',
      mandi: 'Delhi Mandi',
      price: 2500,
      unit: 'quintal',
      quality: 'premium' as QualityGrade,
      timestamp: new Date(),
      source: 'Government Portal'
    };

    it('should validate correct price data', () => {
      const result = dataSerializer.validatePriceData(validPriceData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require commodity name', () => {
      const priceData = { ...validPriceData };
      delete priceData.commodity;

      const result = dataSerializer.validatePriceData(priceData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Commodity name is required');
    });

    it('should require mandi name', () => {
      const priceData = { ...validPriceData };
      delete priceData.mandi;

      const result = dataSerializer.validatePriceData(priceData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Mandi name is required');
    });

    it('should require positive price', () => {
      const priceData = { ...validPriceData };
      priceData.price = 0;

      const result = dataSerializer.validatePriceData(priceData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Price must be greater than zero');
    });

    it('should reject unreasonably high prices', () => {
      const priceData = { ...validPriceData };
      priceData.price = 2000000;

      const result = dataSerializer.validatePriceData(priceData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Price seems unreasonably high');
    });

    it('should require unit', () => {
      const priceData = { ...validPriceData };
      delete priceData.unit;

      const result = dataSerializer.validatePriceData(priceData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Unit is required');
    });

    it('should validate quality grade', () => {
      const priceData = { ...validPriceData };
      priceData.quality = 'invalid' as QualityGrade;

      const result = dataSerializer.validatePriceData(priceData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid quality grade');
    });

    it('should require timestamp', () => {
      const priceData = { ...validPriceData };
      delete priceData.timestamp;

      const result = dataSerializer.validatePriceData(priceData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Timestamp is required');
    });

    it('should reject future timestamps', () => {
      const priceData = { ...validPriceData };
      priceData.timestamp = new Date(Date.now() + 86400000); // Tomorrow

      const result = dataSerializer.validatePriceData(priceData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Timestamp cannot be in the future');
    });

    it('should reject very old timestamps', () => {
      const priceData = { ...validPriceData };
      priceData.timestamp = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000); // 35 days ago

      const result = dataSerializer.validatePriceData(priceData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Price data is too old (more than 30 days)');
    });

    it('should require source', () => {
      const priceData = { ...validPriceData };
      delete priceData.source;

      const result = dataSerializer.validatePriceData(priceData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Source is required');
    });
  });

  describe('parseCommodityData', () => {
    it('should parse array of commodity data', () => {
      const rawData = [
        {
          commodity: 'Rice',
          mandi: 'Delhi Mandi',
          price: 2500,
          unit: 'quintal',
          quality: 'premium',
          source: 'Government Portal'
        },
        {
          name: 'Wheat', // Alternative field name
          market: 'Mumbai Mandi', // Alternative field name
          rate: 2200, // Alternative field name
          grade: 'standard' // Alternative field name
        }
      ];

      const result = dataSerializer.parseCommodityData(rawData);
      expect(result).toHaveLength(2);
      expect(result[0].commodity).toBe('Rice');
      expect(result[1].commodity).toBe('Wheat');
      expect(result[1].mandi).toBe('Mumbai Mandi');
      expect(result[1].price).toBe(2200);
    });

    it('should parse single commodity object', () => {
      const rawData = {
        commodity: 'Rice',
        mandi: 'Delhi Mandi',
        price: 2500
      };

      const result = dataSerializer.parseCommodityData(rawData);
      expect(result).toHaveLength(1);
      expect(result[0].commodity).toBe('Rice');
    });

    it('should handle missing optional fields', () => {
      const rawData = {
        commodity: 'Rice',
        mandi: 'Delhi Mandi',
        price: 2500
        // Missing unit, quality, source
      };

      const result = dataSerializer.parseCommodityData(rawData);
      expect(result).toHaveLength(1);
      expect(result[0].unit).toBe('kg'); // Default
      expect(result[0].quality).toBe('standard'); // Default
      expect(result[0].source).toBe('unknown'); // Default
    });

    it('should skip invalid items', () => {
      const rawData = [
        {
          commodity: 'Rice',
          mandi: 'Delhi Mandi',
          price: 2500
        },
        {
          // Missing required fields
          commodity: 'Wheat'
          // Missing mandi and price
        },
        {
          commodity: 'Corn',
          mandi: 'Pune Mandi',
          price: 1800
        }
      ];

      const result = dataSerializer.parseCommodityData(rawData);
      expect(result).toHaveLength(2); // Only valid items
      expect(result[0].commodity).toBe('Rice');
      expect(result[1].commodity).toBe('Corn');
    });

    it('should throw error for null data', () => {
      expect(() => dataSerializer.parseCommodityData(null)).toThrow(SerializationError);
    });

    it('should throw error for invalid data format', () => {
      expect(() => dataSerializer.parseCommodityData('invalid')).toThrow(SerializationError);
    });
  });

  describe('parseTranslationRequest', () => {
    it('should parse valid translation request', () => {
      const rawData = {
        text: 'Hello world',
        fromLanguage: 'en',
        toLanguage: 'hi'
      };

      const result = dataSerializer.parseTranslationRequest(rawData);
      expect(result.text).toBe('Hello world');
      expect(result.fromLanguage).toBe('en');
      expect(result.toLanguage).toBe('hi');
    });

    it('should handle alternative field names', () => {
      const rawData = {
        content: 'Hello world', // Alternative to 'text'
        fromLang: 'en', // Alternative to 'fromLanguage'
        toLang: 'hi' // Alternative to 'toLanguage'
      };

      const result = dataSerializer.parseTranslationRequest(rawData);
      expect(result.text).toBe('Hello world');
      expect(result.fromLanguage).toBe('en');
      expect(result.toLanguage).toBe('hi');
    });

    it('should trim whitespace from text', () => {
      const rawData = {
        text: '  Hello world  ',
        fromLanguage: 'en',
        toLanguage: 'hi'
      };

      const result = dataSerializer.parseTranslationRequest(rawData);
      expect(result.text).toBe('Hello world');
    });

    it('should include options if provided', () => {
      const rawData = {
        text: 'Hello world',
        fromLanguage: 'en',
        toLanguage: 'hi',
        options: { confidence: 0.8 }
      };

      const result = dataSerializer.parseTranslationRequest(rawData);
      expect(result.options).toEqual({ confidence: 0.8 });
    });

    it('should throw error for missing text', () => {
      const rawData = {
        fromLanguage: 'en',
        toLanguage: 'hi'
      };

      expect(() => dataSerializer.parseTranslationRequest(rawData)).toThrow(SerializationError);
    });

    it('should throw error for invalid source language', () => {
      const rawData = {
        text: 'Hello world',
        fromLanguage: 'invalid',
        toLanguage: 'hi'
      };

      expect(() => dataSerializer.parseTranslationRequest(rawData)).toThrow(SerializationError);
    });

    it('should throw error for invalid target language', () => {
      const rawData = {
        text: 'Hello world',
        fromLanguage: 'en',
        toLanguage: 'invalid'
      };

      expect(() => dataSerializer.parseTranslationRequest(rawData)).toThrow(SerializationError);
    });

    it('should throw error for non-object input', () => {
      expect(() => dataSerializer.parseTranslationRequest('invalid')).toThrow(SerializationError);
    });
  });

  describe('round-trip serialization', () => {
    it('should maintain data integrity through serialize/deserialize cycle', () => {
      const originalData = {
        id: 'test-123',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        metadata: {
          version: 1,
          tags: ['user', 'test']
        }
      };

      const serialized = dataSerializer.serialize(originalData, { includeMetadata: false });
      const deserialized = dataSerializer.deserialize<typeof originalData>(serialized);

      expect(deserialized.id).toBe(originalData.id);
      expect(deserialized.name).toBe(originalData.name);
      expect(deserialized.email).toBe(originalData.email);
      expect(deserialized.createdAt).toEqual(originalData.createdAt);
      expect(deserialized.metadata).toEqual(originalData.metadata);
    });

    it('should handle complex nested objects', () => {
      const complexData = {
        user: {
          profile: {
            personal: {
              name: 'John Doe',
              birthDate: new Date('1990-01-01')
            },
            preferences: {
              language: 'en',
              notifications: true
            }
          }
        },
        transactions: [
          {
            id: 'tx-1',
            amount: 100.50,
            timestamp: new Date('2024-01-01T12:00:00.000Z')
          }
        ]
      };

      const serialized = dataSerializer.serialize(complexData, { includeMetadata: false });
      const deserialized = dataSerializer.deserialize<typeof complexData>(serialized);

      expect(deserialized).toEqual(complexData);
      expect(deserialized.user.profile.personal.birthDate).toBeInstanceOf(Date);
      expect(deserialized.transactions[0].timestamp).toBeInstanceOf(Date);
    });
  });
});