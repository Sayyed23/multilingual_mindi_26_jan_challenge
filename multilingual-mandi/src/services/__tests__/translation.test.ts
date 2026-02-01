// Translation Service Tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { translationService, TranslationError, TranslationErrorType } from '../translation';
import type { Language, TranslationResult } from '../../types';

// Mock Firebase functions
vi.mock('../../lib/firebase', () => ({
  functions: {},
}));

// Mock Firebase functions httpsCallable
vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn(() => vi.fn()),
}));

// Mock offline sync service
vi.mock('../offlineSync', () => ({
  offlineSyncService: {
    getCachedEntry: vi.fn(),
    cacheData: vi.fn(),
  },
}));

describe('TranslationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Language Support', () => {
    it('should validate supported languages correctly', () => {
      expect(translationService.isSupportedLanguage('hi')).toBe(true);
      expect(translationService.isSupportedLanguage('en')).toBe(true);
      expect(translationService.isSupportedLanguage('invalid')).toBe(false);
    });

    it('should return correct language names', () => {
      expect(translationService.getLanguageName('hi')).toBe('Hindi');
      expect(translationService.getLanguageName('en')).toBe('English');
      expect(translationService.getLanguageName('ta')).toBe('Tamil');
    });
  });

  describe('Confidence Scoring', () => {
    it('should return confidence score from translation result', () => {
      const mockResult: TranslationResult = {
        originalText: 'Hello',
        translatedText: 'नमस्ते',
        confidence: 0.85,
        fromLanguage: 'en',
        toLanguage: 'hi',
        timestamp: new Date(),
      };

      expect(translationService.getConfidenceScore(mockResult)).toBe(0.85);
    });

    it('should determine confidence levels correctly', () => {
      const highConfidence: TranslationResult = {
        originalText: 'Hello',
        translatedText: 'नमस्ते',
        confidence: 0.9,
        fromLanguage: 'en',
        toLanguage: 'hi',
        timestamp: new Date(),
      };

      const mediumConfidence: TranslationResult = {
        originalText: 'Hello',
        translatedText: 'नमस्ते',
        confidence: 0.7,
        fromLanguage: 'en',
        toLanguage: 'hi',
        timestamp: new Date(),
      };

      const lowConfidence: TranslationResult = {
        originalText: 'Hello',
        translatedText: 'नमस्ते',
        confidence: 0.4,
        fromLanguage: 'en',
        toLanguage: 'hi',
        timestamp: new Date(),
      };

      expect(translationService.getConfidenceLevel(highConfidence)).toBe('high');
      expect(translationService.getConfidenceLevel(mediumConfidence)).toBe('medium');
      expect(translationService.getConfidenceLevel(lowConfidence)).toBe('low');
    });

    it('should determine translation reliability correctly', () => {
      const reliableTranslation: TranslationResult = {
        originalText: 'Hello',
        translatedText: 'नमस्ते',
        confidence: 0.7,
        fromLanguage: 'en',
        toLanguage: 'hi',
        timestamp: new Date(),
      };

      const unreliableTranslation: TranslationResult = {
        originalText: 'Hello',
        translatedText: 'नमस्ते',
        confidence: 0.5,
        fromLanguage: 'en',
        toLanguage: 'hi',
        timestamp: new Date(),
      };

      expect(translationService.isTranslationReliable(reliableTranslation)).toBe(true);
      expect(translationService.isTranslationReliable(unreliableTranslation)).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should create translation errors correctly', () => {
      const error = new TranslationError(
        TranslationErrorType.NETWORK_ERROR,
        'Network failed',
        new Error('Connection timeout'),
        true
      );

      expect(error.type).toBe(TranslationErrorType.NETWORK_ERROR);
      expect(error.message).toBe('Network failed');
      expect(error.retryable).toBe(true);
      expect(error.originalError).toBeInstanceOf(Error);
    });

    it('should provide user-friendly error messages', () => {
      const networkError = new TranslationError(
        TranslationErrorType.NETWORK_ERROR,
        'Network failed'
      );

      const apiError = new TranslationError(
        TranslationErrorType.API_ERROR,
        'API failed'
      );

      expect(translationService.getErrorMessage(networkError)).toContain('internet connection');
      expect(translationService.getErrorMessage(apiError)).toContain('service is experiencing issues');
    });
  });

  describe('Cache Operations', () => {
    it('should return null for cache operations (sync interface)', () => {
      const result = translationService.getCachedTranslation('test', 'en', 'hi');
      expect(result).toBeNull();
    });
  });

  describe('Fallback Options', () => {
    it('should provide fallback options for translation failures', () => {
      const options = translationService.getFallbackOptions(
        'Hello',
        'en',
        'hi',
        new TranslationError(TranslationErrorType.NETWORK_ERROR, 'Network failed')
      );

      expect(options).toHaveLength(3); // retry, original, offline_mode
      expect(options[0].type).toBe('retry');
      expect(options[1].type).toBe('original');
      expect(options[2].type).toBe('offline_mode');
    });

    it('should provide language-specific fallback options', () => {
      const options = translationService.getFallbackOptions(
        'Hello',
        'invalid' as Language,
        'hi',
        new TranslationError(TranslationErrorType.UNSUPPORTED_LANGUAGE, 'Unsupported language')
      );

      const suggestLanguageOption = options.find(opt => opt.type === 'suggest_language');
      expect(suggestLanguageOption).toBeDefined();
    });
  });

  describe('Service Health', () => {
    it('should check service availability', async () => {
      // Mock the translateText method to avoid actual API calls
      const originalTranslateText = translationService.translateText;
      translationService.translateText = vi.fn().mockResolvedValue({
        originalText: 'test',
        translatedText: 'परीक्षण',
        confidence: 0.9,
        fromLanguage: 'en',
        toLanguage: 'hi',
        timestamp: new Date(),
      });

      const isAvailable = await translationService.isServiceAvailable();
      expect(isAvailable).toBe(true);

      // Restore original method
      translationService.translateText = originalTranslateText;
    });
  });

  describe('Input Validation', () => {
    it('should validate text input correctly', async () => {
      await expect(
        translationService.translateText('', 'en', 'hi')
      ).rejects.toThrow('Text cannot be empty');

      await expect(
        translationService.translateText('   ', 'en', 'hi')
      ).rejects.toThrow('Text cannot be empty');
    });

    it('should validate language codes', async () => {
      await expect(
        translationService.translateText('Hello', 'invalid' as Language, 'hi')
      ).rejects.toThrow('Unsupported source language');

      await expect(
        translationService.translateText('Hello', 'en', 'invalid' as Language)
      ).rejects.toThrow('Unsupported target language');
    });
  });

  describe('Voice Translation', () => {
    it('should validate audio blob input', async () => {
      const emptyBlob = new Blob([], { type: 'audio/wav' });
      
      await expect(
        translationService.translateVoice(emptyBlob, 'en', 'hi')
      ).rejects.toThrow('Audio data cannot be empty');
    });

    it('should validate audio blob size', async () => {
      // Create a large blob (simulate > 10MB)
      const largeData = new Array(11 * 1024 * 1024).fill('a').join('');
      const largeBlob = new Blob([largeData], { type: 'audio/wav' });
      
      await expect(
        translationService.translateVoice(largeBlob, 'en', 'hi')
      ).rejects.toThrow('Audio file too large');
    });
  });
});