// Test utilities and helpers
export * from './utils';
export * from './mockData';
export * from './generators';
export * from './config';

// Re-export commonly used testing libraries
export { default as fc } from 'fast-check';
export * from '@testing-library/react';
export * from '@testing-library/user-event';

// Common test patterns and helpers
export const testPatterns = {
  // Property-based test pattern
  property: (name: string, test: () => void) => {
    it(`Property: ${name}`, test);
  },
  
  // Unit test pattern
  unit: (name: string, test: () => void) => {
    it(`Unit: ${name}`, test);
  },
  
  // Integration test pattern
  integration: (name: string, test: () => void) => {
    it(`Integration: ${name}`, test);
  },
  
  // Performance test pattern
  performance: (name: string, test: () => void) => {
    it(`Performance: ${name}`, test);
  },
  
  // Edge case test pattern
  edge: (name: string, test: () => void) => {
    it(`Edge Case: ${name}`, test);
  },
};

// Common test setup and teardown
export const testSetup = {
  // Setup before all tests
  beforeAll: (setup: () => void | Promise<void>) => {
    beforeAll(setup);
  },
  
  // Setup before each test
  beforeEach: (setup: () => void | Promise<void>) => {
    beforeEach(setup);
  },
  
  // Cleanup after each test
  afterEach: (cleanup: () => void | Promise<void>) => {
    afterEach(cleanup);
  },
  
  // Cleanup after all tests
  afterAll: (cleanup: () => void | Promise<void>) => {
    afterAll(cleanup);
  },
};

// Test environment helpers
export const testEnv = {
  // Check if running in CI
  isCI: () => process.env.CI === 'true',
  
  // Check if running performance tests
  isPerformanceTest: () => process.env.RUN_PERFORMANCE_TESTS === 'true',
  
  // Check if running slow tests
  isSlowTest: () => process.env.RUN_SLOW_TESTS === 'true',
  
  // Check if taking screenshots
  shouldTakeScreenshots: () => process.env.TAKE_SCREENSHOTS === 'true',
  
  // Check if verbose output is enabled
  isVerbose: () => process.env.VERBOSE === 'true',
};