import * as fc from 'fast-check';

// Property-based testing configuration
export const PBT_CONFIG = {
  // Number of test iterations for property-based tests
  numRuns: 100,
  
  // Timeout for individual property tests (30 seconds)
  timeout: 30000,
  
  // Seed for reproducible test runs (can be overridden)
  seed: 42,
  
  // Maximum shrinking attempts when a test fails
  maxShrinkRounds: 1000,
  
  // Verbose output for debugging
  verbose: process.env.NODE_ENV === 'test' && process.env.VERBOSE === 'true',
  
  // Skip time-consuming tests in CI unless explicitly requested
  skipSlowTests: process.env.CI === 'true' && process.env.RUN_SLOW_TESTS !== 'true',
  
  // Configuration for different test categories
  categories: {
    unit: {
      numRuns: 50,
      timeout: 10000,
    },
    integration: {
      numRuns: 30,
      timeout: 20000,
    },
    performance: {
      numRuns: 10,
      timeout: 60000,
    },
    edge_cases: {
      numRuns: 200,
      timeout: 45000,
    },
  },
};

// Fast-check configuration for different test types
export const createFCConfig = (category: keyof typeof PBT_CONFIG.categories = 'unit') => {
  const config = PBT_CONFIG.categories[category];
  
  return {
    numRuns: config.numRuns,
    timeout: config.timeout,
    seed: PBT_CONFIG.seed,
    maxShrinkRounds: PBT_CONFIG.maxShrinkRounds,
    verbose: PBT_CONFIG.verbose,
  };
};

// Test data size configurations
export const TEST_DATA_SIZES = {
  small: 10,
  medium: 100,
  large: 1000,
  xlarge: 10000,
};

// Performance test thresholds
export const PERFORMANCE_THRESHOLDS = {
  translation: {
    maxResponseTime: 2000, // 2 seconds as per requirements
    minAccuracy: 0.95, // 95% accuracy for mandi terms
  },
  search: {
    maxResponseTime: 3000, // 3 seconds as per requirements
    minResultCount: 1,
  },
  priceOracle: {
    maxResponseTime: 5000, // 5 seconds for complex price queries
    minDataSources: 5, // At least 5 comparable mandis
  },
  offline: {
    maxSyncTime: 10000, // 10 seconds for offline sync
    maxCacheSize: 5 * 1024 * 1024, // 5MB cache limit
  },
};

// Test environment configuration
export const TEST_ENV = {
  // Mock API endpoints
  apiEndpoints: {
    translation: 'http://localhost:3001/api/translate',
    priceOracle: 'http://localhost:3001/api/prices',
    agmarknet: 'http://localhost:3001/api/agmarknet',
    sms: 'http://localhost:3001/api/sms',
  },
  
  // Test database configuration
  database: {
    url: process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/multilingual-mandi-test',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  
  // Test user credentials
  testUsers: {
    vendor: {
      phoneNumber: '+919876543210',
      otp: '123456',
    },
    buyer: {
      phoneNumber: '+919876543211',
      otp: '123456',
    },
  },
  
  // Feature flags for testing
  features: {
    enableVoiceTranslation: true,
    enableOfflineMode: true,
    enablePropertyBasedTests: true,
    enablePerformanceTests: process.env.RUN_PERFORMANCE_TESTS === 'true',
  },
};

// Test utilities configuration
export const TEST_UTILS = {
  // Retry configuration for flaky tests
  retry: {
    attempts: 3,
    delay: 1000,
  },
  
  // Screenshot configuration for visual regression tests
  screenshots: {
    enabled: process.env.TAKE_SCREENSHOTS === 'true',
    directory: './test-screenshots',
    threshold: 0.1, // 10% difference threshold
  },
  
  // Coverage configuration
  coverage: {
    statements: 80,
    branches: 80,
    functions: 80,
    lines: 80,
  },
  
  // Accessibility testing configuration
  accessibility: {
    enabled: true,
    rules: {
      'color-contrast': { enabled: true },
      'keyboard-navigation': { enabled: true },
      'screen-reader': { enabled: true },
    },
  },
};

// Property-based test helpers
export const createPropertyTest = (
  name: string,
  property: fc.IProperty<any>,
  category: keyof typeof PBT_CONFIG.categories = 'unit'
) => {
  const config = createFCConfig(category);
  
  return {
    name,
    run: () => fc.assert(property, config),
    config,
  };
};

// Test data validation schemas
export const VALIDATION_SCHEMAS = {
  user: {
    required: ['id', 'phoneNumber', 'name', 'preferredLanguage', 'userType'],
    optional: ['email', 'businessProfile', 'verificationDocuments'],
  },
  commodity: {
    required: ['id', 'name', 'category', 'standardUnit'],
    optional: ['alternativeUnits', 'seasonality', 'translations'],
  },
  priceEntry: {
    required: ['id', 'commodityId', 'price', 'unit', 'location', 'source', 'timestamp'],
    optional: ['quality', 'confidence', 'validatedBy', 'metadata'],
  },
  message: {
    required: ['id', 'conversationId', 'senderId', 'receiverId', 'originalText', 'messageType', 'timestamp'],
    optional: ['translatedText', 'targetLanguage', 'translationConfidence', 'attachments'],
  },
  deal: {
    required: ['dealId', 'vendorId', 'buyerId', 'commodity', 'quantity', 'agreedPrice', 'status', 'createdAt'],
    optional: ['expectedDelivery', 'paymentTerms', 'auditTrail'],
  },
};

// Test assertion helpers
export const ASSERTIONS = {
  // Validate that a value is within expected range
  withinRange: (value: number, min: number, max: number) => 
    value >= min && value <= max,
  
  // Validate that a string is not empty
  nonEmptyString: (value: string) => 
    typeof value === 'string' && value.length > 0,
  
  // Validate that an array has minimum length
  minArrayLength: (array: any[], minLength: number) => 
    Array.isArray(array) && array.length >= minLength,
  
  // Validate that a date is recent (within last 30 days)
  recentDate: (date: Date) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return date >= thirtyDaysAgo && date <= new Date();
  },
  
  // Validate Indian phone number format
  validIndianPhoneNumber: (phoneNumber: string) => 
    /^\+91[6-9]\d{9}$/.test(phoneNumber),
  
  // Validate that confidence score is between 0 and 1
  validConfidence: (confidence: number) => 
    confidence >= 0 && confidence <= 1,
  
  // Validate that price is positive
  positivePrice: (price: number) => 
    price > 0 && isFinite(price),
  
  // Validate that coordinates are within India
  validIndianCoordinates: (lat: number, lng: number) => 
    lat >= 8.0 && lat <= 37.0 && lng >= 68.0 && lng <= 97.0,
};

// Test reporting configuration
export const REPORTING = {
  // JUnit XML output for CI integration
  junit: {
    enabled: process.env.CI === 'true',
    outputFile: './test-results/junit.xml',
  },
  
  // HTML coverage report
  coverage: {
    enabled: true,
    outputDirectory: './coverage',
    reporters: ['html', 'lcov', 'text-summary'],
  },
  
  // Performance metrics
  performance: {
    enabled: process.env.MEASURE_PERFORMANCE === 'true',
    outputFile: './test-results/performance.json',
  },
  
  // Property-based test statistics
  pbt: {
    enabled: true,
    outputFile: './test-results/pbt-stats.json',
    trackShrinking: true,
    trackCounterexamples: true,
  },
};

// Export default configuration
export default {
  PBT_CONFIG,
  TEST_DATA_SIZES,
  PERFORMANCE_THRESHOLDS,
  TEST_ENV,
  TEST_UTILS,
  VALIDATION_SCHEMAS,
  ASSERTIONS,
  REPORTING,
  createFCConfig,
  createPropertyTest,
};