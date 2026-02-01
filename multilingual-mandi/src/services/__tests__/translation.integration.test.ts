// Translation Service Integration Tests
import { describe, it, expect } from 'vitest';
import { translationService } from '../translation';

describe('Translation Service Integration', () => {
  it('should be properly exported and instantiated', () => {
    expect(translationService).toBeDefined();
    expect(typeof translationService.translateText).toBe('function');
    expect(typeof translationService.translateVoice).toBe('function');
    expect(typeof translationService.getCachedTranslation).toBe('function');
    expect(typeof translationService.getConfidenceScore).toBe('function');
  });

  it('should have all required methods from TranslationService interface', () => {
    const requiredMethods = [
      'translateText',
      'translateVoice', 
      'getCachedTranslation',
      'getConfidenceScore'
    ];

    requiredMethods.forEach(method => {
      expect(translationService).toHaveProperty(method);
      expect(typeof (translationService as any)[method]).toBe('function');
    });
  });

  it('should have additional utility methods', () => {
    const utilityMethods = [
      'getConfidenceLevel',
      'isTranslationReliable',
      'getFallbackOptions',
      'isSupportedLanguage',
      'getLanguageName',
      'isServiceAvailable',
      'getServiceHealth',
      'getErrorMessage',
      'clearTranslationCache'
    ];

    utilityMethods.forEach(method => {
      expect(translationService).toHaveProperty(method);
      expect(typeof (translationService as any)[method]).toBe('function');
    });
  });

  it('should support all required Indian languages', () => {
    const requiredLanguages = [
      'hi', 'en', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'or', 'pa', 
      'as', 'ur', 'sd', 'ne', 'ks', 'kok', 'mni', 'sat', 'doi', 'mai', 'bho'
    ];

    requiredLanguages.forEach(lang => {
      expect(translationService.isSupportedLanguage(lang)).toBe(true);
      expect(translationService.getLanguageName(lang as any)).toBeTruthy();
    });
  });
});