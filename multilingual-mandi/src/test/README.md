# Testing Framework Documentation

This directory contains the comprehensive testing framework for the Multilingual Mandi PWA, including unit tests, property-based tests, and testing utilities.

## Overview

The testing framework is built on:
- **Jest** - Main testing framework
- **React Testing Library** - Component testing utilities
- **fast-check** - Property-based testing library
- **@testing-library/jest-dom** - Custom Jest matchers for DOM testing

## Directory Structure

```
src/test/
├── __tests__/           # Framework validation tests
├── setup.ts            # Jest setup and global mocks
├── utils.tsx           # Testing utilities and helpers
├── mockData.ts         # Mock data generators
├── generators.ts       # Property-based test generators
├── config.ts           # Test configuration and constants
├── index.ts            # Main exports
└── README.md           # This documentation
```

## Quick Start

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only property-based tests
npm run test:pbt

# Run only unit tests
npm run test:unit

# Run performance tests
npm run test:performance

# Run tests for CI
npm run test:ci
```

### Writing Tests

#### Basic Unit Test

```typescript
import { render, screen } from '../test';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
```

#### Property-Based Test

```typescript
import * as fc from 'fast-check';
import { userGen, createFCConfig } from '../test';

describe('User Validation', () => {
  it('Property: All generated users should have valid phone numbers', () => {
    fc.assert(
      fc.property(userGen, (user) => {
        expect(user.phoneNumber).toMatch(/^\+91[6-9]\d{9}$/);
        return true;
      }),
      createFCConfig('unit')
    );
  });
});
```

#### Using Mock Data

```typescript
import { createMockUser, createMockPriceEntry } from '../test';

describe('Price Comparison', () => {
  it('should compare prices correctly', () => {
    const user = createMockUser({ userType: 'buyer' });
    const priceEntry = createMockPriceEntry({ price: 2500 });
    
    // Your test logic here
  });
});
```

## Testing Patterns

### Property-Based Testing

Property-based tests verify that certain properties hold true across a wide range of inputs. They are particularly useful for testing business logic and data validation.

**Example: Translation Service**
```typescript
// Feature: multilingual-mandi, Property 1: Translation Performance and Accuracy
it('Property: Translation should preserve meaning across languages', () => {
  fc.assert(
    fc.property(translationRequestGen, async (request) => {
      const response = await translationService.translate(request);
      
      // Properties that should always hold
      expect(response.translatedText).toBeTruthy();
      expect(response.confidence).toBeGreaterThan(0.7);
      expect(response.sourceLanguageDetected).toBeTruthy();
      
      return true;
    }),
    createFCConfig('integration')
  );
});
```

### Unit Testing

Unit tests focus on individual functions and components in isolation.

**Example: Price Validation**
```typescript
describe('Price Validation', () => {
  it('Unit: should validate positive prices', () => {
    expect(validatePrice(100)).toBe(true);
    expect(validatePrice(0)).toBe(false);
    expect(validatePrice(-1)).toBe(false);
  });
});
```

### Integration Testing

Integration tests verify that different parts of the system work together correctly.

**Example: User Authentication Flow**
```typescript
describe('Authentication Flow', () => {
  it('Integration: should complete OTP verification', async () => {
    const phoneNumber = '+919876543210';
    
    // Send OTP
    await authService.sendOTP(phoneNumber);
    
    // Verify OTP
    const result = await authService.verifyOTP(phoneNumber, '123456');
    
    expect(result.success).toBe(true);
    expect(result.token).toBeTruthy();
  });
});
```

## Mock Data Generators

The framework provides comprehensive mock data generators for all major entities:

### Available Generators

- `createMockUser()` - Generate realistic user profiles
- `createMockCommodity()` - Generate commodity data
- `createMockPriceEntry()` - Generate price data
- `createMockMessage()` - Generate chat messages
- `createMockDeal()` - Generate deal records
- `createMockTranslationRequest()` - Generate translation requests

### Batch Generators

- `createMockUsers(count)` - Generate multiple users
- `createMockPriceHistory(commodityId, days)` - Generate price history
- `createMockConversation(messageCount)` - Generate conversation threads

### Property-Based Generators

- `userGen` - Property-based user generator
- `priceEntryGen` - Property-based price generator
- `messageGen` - Property-based message generator
- `dealGen` - Property-based deal generator

## Configuration

### Test Categories

The framework supports different test categories with specific configurations:

- **unit** - Fast, isolated tests (50 runs, 10s timeout)
- **integration** - Component interaction tests (30 runs, 20s timeout)
- **performance** - Performance validation tests (10 runs, 60s timeout)
- **edge_cases** - Edge case validation (200 runs, 45s timeout)

### Environment Variables

- `CI=true` - Enable CI mode
- `RUN_PERFORMANCE_TESTS=true` - Enable performance tests
- `RUN_SLOW_TESTS=true` - Enable slow tests
- `TAKE_SCREENSHOTS=true` - Enable screenshot capture
- `VERBOSE=true` - Enable verbose output

## Best Practices

### Property-Based Testing

1. **Start Simple** - Begin with basic properties and gradually add complexity
2. **Use Constraints** - Apply realistic constraints to generators
3. **Test Invariants** - Focus on properties that should always hold
4. **Handle Edge Cases** - Include generators for edge cases and invalid inputs

### Mock Data

1. **Realistic Data** - Use realistic Indian names, locations, and commodities
2. **Consistent Relationships** - Ensure related data is consistent
3. **Configurable** - Allow overriding specific fields when needed
4. **Performance** - Keep mock data generation fast for large test suites

### Test Organization

1. **Descriptive Names** - Use clear, descriptive test names
2. **Group Related Tests** - Use describe blocks to group related functionality
3. **Test One Thing** - Each test should verify one specific behavior
4. **Clean Setup/Teardown** - Properly clean up after tests

## Performance Testing

Performance tests validate that the application meets the specified performance requirements:

### Translation Performance
- Maximum response time: 2 seconds
- Minimum accuracy: 95% for mandi terms

### Search Performance
- Maximum response time: 3 seconds
- Minimum result count: 1

### Price Oracle Performance
- Maximum response time: 5 seconds
- Minimum data sources: 5 comparable mandis

### Example Performance Test

```typescript
describe('Translation Performance', () => {
  it('Performance: should translate within 2 seconds', async () => {
    const startTime = Date.now();
    
    const result = await translationService.translate({
      text: 'What is the price of rice?',
      sourceLanguage: 'en',
      targetLanguage: 'hi',
      context: 'mandi'
    });
    
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(2000);
    expect(result.confidence).toBeGreaterThan(0.95);
  });
});
```

## Coverage Requirements

The framework enforces minimum coverage thresholds:

- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

## Troubleshooting

### Common Issues

1. **Tests timing out** - Increase timeout in test configuration
2. **Mock data inconsistencies** - Check generator constraints
3. **Property test failures** - Review shrinking output for minimal failing case
4. **Coverage issues** - Ensure all code paths are tested

### Debugging

```bash
# Run tests in debug mode
npm run test:debug

# Run specific test file
npm test -- MyComponent.test.tsx

# Run tests with verbose output
VERBOSE=true npm test
```

## Contributing

When adding new tests:

1. Follow the established patterns and naming conventions
2. Add appropriate mock data generators for new entities
3. Include both unit and property-based tests for new functionality
4. Update this documentation for new testing utilities
5. Ensure tests are fast and reliable

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [fast-check Documentation](https://github.com/dubzzz/fast-check)
- [Property-Based Testing Guide](https://hypothesis.works/articles/what-is-property-based-testing/)