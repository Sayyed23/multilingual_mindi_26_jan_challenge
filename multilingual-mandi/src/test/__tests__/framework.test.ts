import * as fc from 'fast-check';
import { 
  createMockUser, 
  createMockPriceEntry, 
  createMockTranslationRequest,
  userGen,
  priceEntryGen,
  translationRequestGen,
  createFCConfig,
  ASSERTIONS,
  PBT_CONFIG
} from '../index';

describe('Testing Framework Configuration', () => {
  describe('Mock Data Generators', () => {
    it('should create valid mock users', () => {
      const user = createMockUser();
      
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('phoneNumber');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('preferredLanguage');
      expect(user).toHaveProperty('userType');
      expect(ASSERTIONS.validIndianPhoneNumber(user.phoneNumber)).toBe(true);
      expect(['vendor', 'buyer', 'both']).toContain(user.userType);
    });

    it('should create valid mock price entries', () => {
      const priceEntry = createMockPriceEntry();
      
      expect(priceEntry).toHaveProperty('id');
      expect(priceEntry).toHaveProperty('price');
      expect(priceEntry).toHaveProperty('commodityId');
      expect(ASSERTIONS.positivePrice(priceEntry.price)).toBe(true);
      expect(ASSERTIONS.validConfidence(priceEntry.confidence)).toBe(true);
    });

    it('should create valid mock translation requests', () => {
      const request = createMockTranslationRequest();
      
      expect(request).toHaveProperty('text');
      expect(request).toHaveProperty('targetLanguage');
      expect(request).toHaveProperty('context');
      expect(ASSERTIONS.nonEmptyString(request.text)).toBe(true);
      expect(['general', 'mandi', 'negotiation']).toContain(request.context);
    });
  });

  describe('Property-Based Test Generators', () => {
    it('should generate valid users with property-based testing', () => {
      fc.assert(
        fc.property(userGen, (user) => {
          // Validate user structure
          expect(user).toHaveProperty('id');
          expect(user).toHaveProperty('phoneNumber');
          expect(user).toHaveProperty('name');
          expect(user).toHaveProperty('preferredLanguage');
          expect(user).toHaveProperty('userType');
          expect(user).toHaveProperty('reputation');
          
          // Validate user data constraints
          expect(ASSERTIONS.nonEmptyString(user.id)).toBe(true);
          expect(ASSERTIONS.nonEmptyString(user.name)).toBe(true);
          expect(['vendor', 'buyer', 'both']).toContain(user.userType);
          expect(ASSERTIONS.withinRange(user.reputation.overall, 1, 5)).toBe(true);
          expect(ASSERTIONS.withinRange(user.reputation.punctuality, 1, 5)).toBe(true);
          expect(ASSERTIONS.withinRange(user.reputation.communication, 1, 5)).toBe(true);
          expect(ASSERTIONS.withinRange(user.reputation.productQuality, 1, 5)).toBe(true);
          
          // Validate location constraints
          expect(ASSERTIONS.validIndianCoordinates(
            user.location.latitude, 
            user.location.longitude
          )).toBe(true);
          
          return true;
        }),
        createFCConfig('unit')
      );
    });

    it('should generate valid price entries with property-based testing', () => {
      fc.assert(
        fc.property(priceEntryGen, (priceEntry) => {
          // Validate price entry structure
          expect(priceEntry).toHaveProperty('id');
          expect(priceEntry).toHaveProperty('commodityId');
          expect(priceEntry).toHaveProperty('price');
          expect(priceEntry).toHaveProperty('unit');
          expect(priceEntry).toHaveProperty('location');
          expect(priceEntry).toHaveProperty('source');
          expect(priceEntry).toHaveProperty('timestamp');
          expect(priceEntry).toHaveProperty('confidence');
          
          // Validate price entry constraints
          expect(ASSERTIONS.positivePrice(priceEntry.price)).toBe(true);
          expect(ASSERTIONS.validConfidence(priceEntry.confidence)).toBe(true);
          expect(['agmarknet', 'vendor_submission', 'predicted']).toContain(priceEntry.source);
          expect(['quintal', 'kg', 'ton', 'bag']).toContain(priceEntry.unit);
          
          // Validate location constraints
          expect(ASSERTIONS.validIndianCoordinates(
            priceEntry.location.coordinates.latitude,
            priceEntry.location.coordinates.longitude
          )).toBe(true);
          
          return true;
        }),
        createFCConfig('unit')
      );
    });

    it('should generate valid translation requests with property-based testing', () => {
      fc.assert(
        fc.property(translationRequestGen, (request) => {
          // Validate translation request structure
          expect(request).toHaveProperty('text');
          expect(request).toHaveProperty('targetLanguage');
          expect(request).toHaveProperty('context');
          
          // Validate translation request constraints
          expect(ASSERTIONS.nonEmptyString(request.text)).toBe(true);
          expect(request.text.length).toBeLessThanOrEqual(1000);
          expect(['general', 'mandi', 'negotiation']).toContain(request.context);
          
          // Validate language constraints
          if (request.sourceLanguage) {
            expect(request.sourceLanguage).not.toBe(request.targetLanguage);
          }
          
          return true;
        }),
        createFCConfig('unit')
      );
    });
  });

  describe('Test Configuration', () => {
    it('should have valid PBT configuration', () => {
      expect(PBT_CONFIG.numRuns).toBeGreaterThan(0);
      expect(PBT_CONFIG.timeout).toBeGreaterThan(0);
      expect(PBT_CONFIG.maxShrinkRounds).toBeGreaterThan(0);
      expect(typeof PBT_CONFIG.seed).toBe('number');
      expect(typeof PBT_CONFIG.verbose).toBe('boolean');
    });

    it('should create valid fast-check configurations', () => {
      const unitConfig = createFCConfig('unit');
      const integrationConfig = createFCConfig('integration');
      const performanceConfig = createFCConfig('performance');
      
      expect(unitConfig.numRuns).toBe(50);
      expect(unitConfig.timeout).toBe(10000);
      
      expect(integrationConfig.numRuns).toBe(30);
      expect(integrationConfig.timeout).toBe(20000);
      
      expect(performanceConfig.numRuns).toBe(10);
      expect(performanceConfig.timeout).toBe(60000);
    });
  });

  describe('Assertion Helpers', () => {
    it('should validate ranges correctly', () => {
      expect(ASSERTIONS.withinRange(5, 1, 10)).toBe(true);
      expect(ASSERTIONS.withinRange(0, 1, 10)).toBe(false);
      expect(ASSERTIONS.withinRange(15, 1, 10)).toBe(false);
    });

    it('should validate non-empty strings correctly', () => {
      expect(ASSERTIONS.nonEmptyString('hello')).toBe(true);
      expect(ASSERTIONS.nonEmptyString('')).toBe(false);
      expect(ASSERTIONS.nonEmptyString('   ')).toBe(true); // Whitespace is still content
    });

    it('should validate Indian phone numbers correctly', () => {
      expect(ASSERTIONS.validIndianPhoneNumber('+919876543210')).toBe(true);
      expect(ASSERTIONS.validIndianPhoneNumber('+911234567890')).toBe(false); // Invalid first digit
      expect(ASSERTIONS.validIndianPhoneNumber('9876543210')).toBe(false); // Missing country code
      expect(ASSERTIONS.validIndianPhoneNumber('+9198765432100')).toBe(false); // Too long
    });

    it('should validate confidence scores correctly', () => {
      expect(ASSERTIONS.validConfidence(0.5)).toBe(true);
      expect(ASSERTIONS.validConfidence(0)).toBe(true);
      expect(ASSERTIONS.validConfidence(1)).toBe(true);
      expect(ASSERTIONS.validConfidence(-0.1)).toBe(false);
      expect(ASSERTIONS.validConfidence(1.1)).toBe(false);
    });

    it('should validate positive prices correctly', () => {
      expect(ASSERTIONS.positivePrice(100)).toBe(true);
      expect(ASSERTIONS.positivePrice(0.01)).toBe(true);
      expect(ASSERTIONS.positivePrice(0)).toBe(false);
      expect(ASSERTIONS.positivePrice(-1)).toBe(false);
      expect(ASSERTIONS.positivePrice(Infinity)).toBe(false);
      expect(ASSERTIONS.positivePrice(NaN)).toBe(false);
    });

    it('should validate Indian coordinates correctly', () => {
      // Valid coordinates (Delhi)
      expect(ASSERTIONS.validIndianCoordinates(28.6139, 77.2090)).toBe(true);
      
      // Valid coordinates (Mumbai)
      expect(ASSERTIONS.validIndianCoordinates(19.0760, 72.8777)).toBe(true);
      
      // Invalid coordinates (outside India)
      expect(ASSERTIONS.validIndianCoordinates(40.7128, -74.0060)).toBe(false); // New York
      expect(ASSERTIONS.validIndianCoordinates(51.5074, -0.1278)).toBe(false); // London
    });
  });

  describe('Performance Thresholds', () => {
    it('should have realistic performance thresholds', () => {
      const { PERFORMANCE_THRESHOLDS } = require('../config');
      
      // Translation should be fast (2 seconds as per requirements)
      expect(PERFORMANCE_THRESHOLDS.translation.maxResponseTime).toBe(2000);
      expect(PERFORMANCE_THRESHOLDS.translation.minAccuracy).toBe(0.95);
      
      // Search should be fast (3 seconds as per requirements)
      expect(PERFORMANCE_THRESHOLDS.search.maxResponseTime).toBe(3000);
      expect(PERFORMANCE_THRESHOLDS.search.minResultCount).toBeGreaterThan(0);
      
      // Price oracle should handle complex queries
      expect(PERFORMANCE_THRESHOLDS.priceOracle.maxResponseTime).toBeGreaterThan(0);
      expect(PERFORMANCE_THRESHOLDS.priceOracle.minDataSources).toBeGreaterThanOrEqual(5);
    });
  });
});

// Feature: multilingual-mandi, Property Test Framework Validation
describe('Property-Based Testing Framework Validation', () => {
  it('should demonstrate property-based testing capabilities', () => {
    // **Validates: Testing Infrastructure**
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),
        fc.integer({ min: 1, max: 1000 }),
        (a, b) => {
          const sum = a + b;
          
          // Properties that should always hold
          expect(sum).toBeGreaterThan(a);
          expect(sum).toBeGreaterThan(b);
          expect(sum - a).toBe(b);
          expect(sum - b).toBe(a);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle edge cases in property-based tests', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(''),
          fc.string({ minLength: 1, maxLength: 1000 }),
          fc.string({ maxLength: 100 })
        ),
        (text) => {
          // Properties that should hold for any string
          expect(typeof text).toBe('string');
          expect(text.length).toBeGreaterThanOrEqual(0);
          
          // String operations should be consistent
          if (text.length > 0) {
            expect(text.charAt(0)).toBe(text[0]);
            expect(text.substring(0, 1)).toBe(text[0]);
          }
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});