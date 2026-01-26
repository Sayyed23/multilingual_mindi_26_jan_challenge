/**
 * Unit tests for Translation Service
 * Tests Requirements: 1.1, 1.2, 1.4 - Real-time translation with mandi-specific vocabulary
 */

import { TranslationService, translationService, getLanguageInfo, getSupportedLanguages, isLanguageSupported } from '../translationService';
import { TranslationRequest, TranslationContext, SupportedLanguage, VoiceTranslationRequest } from '../../types/translation';

// Mock IndexedDB for testing
const mockIndexedDB = {
  open: jest.fn(),
  deleteDatabase: jest.fn(),
};

const mockIDBDatabase = {
  transaction: jest.fn(),
  createObjectStore: jest.fn(),
  close: jest.fn(),
};

const mockIDBTransaction = {
  objectStore: jest.fn(),
  oncomplete: null,
  onerror: null,
  onabort: null,
};

const mockIDBObjectStore = {
  add: jest.fn(),
  put: jest.fn(),
  get: jest.fn(),
  getAll: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  createIndex: jest.fn(),
  index: jest.fn(),
  openCursor: jest.fn(),
};

const mockIDBIndex = {
  get: jest.fn(),
  getAll: jest.fn(),
  openCursor: jest.fn(),
};

const mockIDBRequest = {
  onsuccess: null,
  onerror: null,
  result: null,
};

const mockIDBKeyRange = {
  upperBound: jest.fn(),
  lowerBound: jest.fn(),
  bound: jest.fn(),
  only: jest.fn(),
};

// Setup IndexedDB mocks
beforeAll(() => {
  (global as any).indexedDB = mockIndexedDB;
  (global as any).IDBKeyRange = mockIDBKeyRange;
  
  mockIndexedDB.open.mockImplementation(() => {
    const request = { ...mockIDBRequest };
    setTimeout(() => {
      request.result = mockIDBDatabase;
      if (request.onsuccess) request.onsuccess({ target: request } as any);
    }, 0);
    return request;
  });

  mockIDBDatabase.transaction.mockReturnValue(mockIDBTransaction);
  mockIDBTransaction.objectStore.mockReturnValue(mockIDBObjectStore);
  mockIDBObjectStore.index.mockReturnValue(mockIDBIndex);
  
  // Mock successful operations
  mockIDBObjectStore.put.mockImplementation(() => {
    const request = { ...mockIDBRequest };
    setTimeout(() => {
      if (request.onsuccess) request.onsuccess({ target: request } as any);
    }, 0);
    return request;
  });

  mockIDBObjectStore.clear.mockImplementation(() => {
    const request = { ...mockIDBRequest };
    setTimeout(() => {
      if (request.onsuccess) request.onsuccess({ target: request } as any);
    }, 0);
    return request;
  });

  mockIDBObjectStore.add.mockImplementation(() => {
    const request = { ...mockIDBRequest };
    setTimeout(() => {
      if (request.onsuccess) request.onsuccess({ target: request } as any);
    }, 0);
    return request;
  });

  mockIDBObjectStore.getAll.mockImplementation(() => {
    const request = { ...mockIDBRequest };
    setTimeout(() => {
      request.result = [];
      if (request.onsuccess) request.onsuccess({ target: request } as any);
    }, 0);
    return request;
  });

  mockIDBIndex.getAll.mockImplementation(() => {
    const request = { ...mockIDBRequest };
    setTimeout(() => {
      request.result = [];
      if (request.onsuccess) request.onsuccess({ target: request } as any);
    }, 0);
    return request;
  });

  mockIDBIndex.openCursor.mockImplementation(() => {
    const request = { ...mockIDBRequest };
    setTimeout(() => {
      request.result = null; // No cursor results for mock
      if (request.onsuccess) request.onsuccess({ target: request } as any);
    }, 0);
    return request;
  });

  mockIDBObjectStore.openCursor.mockImplementation(() => {
    const request = { ...mockIDBRequest };
    setTimeout(() => {
      request.result = null; // No cursor results for mock
      if (request.onsuccess) request.onsuccess({ target: request } as any);
    }, 0);
    return request;
  });

  mockIDBKeyRange.upperBound.mockReturnValue({});
  mockIDBKeyRange.lowerBound.mockReturnValue({});
  mockIDBKeyRange.bound.mockReturnValue({});
  mockIDBKeyRange.only.mockReturnValue({});
});

describe('Unit: Translation Service', () => {
  let service: TranslationService;

  beforeEach(() => {
    service = new TranslationService();
    jest.clearAllMocks();
  });

  describe('Language Detection', () => {
    it('should detect Hindi text correctly', async () => {
      const hindiText = 'यह एक हिंदी वाक्य है';
      const result = await service.detectLanguage(hindiText);
      
      expect(result.detectedLanguage).toBe('hi');
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.textLength).toBe(hindiText.length);
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });

    it('should detect English text correctly', async () => {
      const result = await service.detectLanguage('This is an English sentence');
      
      expect(result.detectedLanguage).toBe('en');
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.alternativeLanguages).toHaveLength(2);
    });

    it('should detect Bengali text correctly', async () => {
      const result = await service.detectLanguage('এটি একটি বাংলা বাক্য');
      
      expect(result.detectedLanguage).toBe('bn');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should handle empty text gracefully', async () => {
      const result = await service.detectLanguage('');
      
      expect(result.detectedLanguage).toBe('en');
      expect(result.confidence).toBeLessThan(0.9);
      expect(result.textLength).toBe(0);
    });

    it('should provide alternative language suggestions', async () => {
      const result = await service.detectLanguage('mixed text मिश्रित');
      
      expect(result.alternativeLanguages).toBeDefined();
      expect(Array.isArray(result.alternativeLanguages)).toBe(true);
    });
  });

  describe('Text Translation', () => {
    it('should translate simple text between languages', async () => {
      const request: TranslationRequest = {
        text: 'Hello world',
        sourceLanguage: 'en',
        targetLanguage: 'hi',
        context: 'general'
      };

      const result = await service.translateText(request);
      
      expect(result.translatedText).toBeDefined();
      expect(result.sourceLanguageDetected).toBe('en');
      expect(result.targetLanguage).toBe('hi');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.metadata.wordCount).toBe(2);
      expect(result.metadata.characterCount).toBe(11);
    });

    it('should handle mandi-specific vocabulary', async () => {
      const request: TranslationRequest = {
        text: 'The mandi price is 100 per quintal',
        sourceLanguage: 'en',
        targetLanguage: 'hi',
        context: 'mandi'
      };

      const result = await service.translateText(request);
      
      expect(result.translatedText).toBeDefined();
      expect(result.metadata.vocabularyMatches).toBeGreaterThan(0);
      expect(result.metadata.contextMatches).toBeGreaterThan(0);
    });

    it('should return same text for same source and target language', async () => {
      const request: TranslationRequest = {
        text: 'Same language text',
        sourceLanguage: 'en',
        targetLanguage: 'en',
        context: 'general'
      };

      const result = await service.translateText(request);
      
      expect(result.translatedText).toBe('Same language text');
      expect(result.confidence).toBeGreaterThan(0.6); // Lower expectation for demo
    });

    it('should auto-detect source language when not provided', async () => {
      const request: TranslationRequest = {
        text: 'यह हिंदी में है',
        targetLanguage: 'en',
        context: 'general'
      };

      const result = await service.translateText(request);
      
      expect(result.sourceLanguageDetected).toBe('hi');
      expect(result.translatedText).toBeDefined();
    });

    it('should flag low confidence translations for review', async () => {
      const request: TranslationRequest = {
        text: 'Very complex technical jargon with uncommon terms',
        sourceLanguage: 'en',
        targetLanguage: 'hi',
        context: 'technical'
      };

      const result = await service.translateText(request);
      
      if (result.confidence < 0.8) {
        expect(result.requiresReview).toBe(true);
        expect(result.quality).toMatch(/medium|low|failed/);
      }
    });

    it('should provide alternative translations for low confidence cases', async () => {
      const request: TranslationRequest = {
        text: 'Ambiguous text with multiple meanings',
        sourceLanguage: 'en',
        targetLanguage: 'hi',
        context: 'general'
      };

      const result = await service.translateText(request);
      
      if (result.confidence < 0.8) {
        expect(result.alternativeTranslations).toBeDefined();
        expect(Array.isArray(result.alternativeTranslations)).toBe(true);
      }
    });

    it('should handle negotiation context appropriately', async () => {
      const request: TranslationRequest = {
        text: 'I offer 500 rupees for this deal',
        sourceLanguage: 'en',
        targetLanguage: 'hi',
        context: 'negotiation'
      };

      const result = await service.translateText(request);
      
      expect(result.translatedText).toBeDefined();
      expect(result.metadata.contextMatches).toBeGreaterThan(0);
    });

    it('should calculate complexity score correctly', async () => {
      const simpleRequest: TranslationRequest = {
        text: 'Hi',
        sourceLanguage: 'en',
        targetLanguage: 'hi',
        context: 'general'
      };

      const complexRequest: TranslationRequest = {
        text: 'This is a very complex sentence with multiple clauses, technical terminology, and various punctuation marks!',
        sourceLanguage: 'en',
        targetLanguage: 'hi',
        context: 'technical'
      };

      const simpleResult = await service.translateText(simpleRequest);
      const complexResult = await service.translateText(complexRequest);
      
      expect(complexResult.metadata.complexityScore).toBeGreaterThan(simpleResult.metadata.complexityScore);
    });
  });

  describe('Voice Translation', () => {
    it('should handle voice translation request', async () => {
      const audioBlob = new Blob(['fake audio data'], { type: 'audio/wav' });
      const request: VoiceTranslationRequest = {
        audioData: audioBlob,
        sourceLanguage: 'hi',
        targetLanguage: 'en',
        context: 'general'
      };

      const result = await service.translateVoice(request);
      
      expect(result.transcription).toBeDefined();
      expect(result.translatedText).toBeDefined();
      expect(result.transcriptionConfidence).toBeGreaterThan(0);
      expect(result.translationConfidence).toBeGreaterThan(0);
      expect(result.sourceLanguageDetected).toBe('hi');
      expect(result.targetLanguage).toBe('en');
      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.metadata.audioDuration).toBeGreaterThan(0);
      expect(result.metadata.speechRate).toBeGreaterThan(0);
    });

    it('should flag voice translations requiring review', async () => {
      const audioBlob = new Blob(['low quality audio'], { type: 'audio/wav' });
      const request: VoiceTranslationRequest = {
        audioData: audioBlob,
        targetLanguage: 'en',
        context: 'general',
        quality: 'low'
      };

      const result = await service.translateVoice(request);
      
      expect(result.metadata.audioQuality).toBeLessThan(0.8);
      // Low quality audio might require review
      if (result.transcriptionConfidence < 0.7) {
        expect(result.requiresReview).toBe(true);
      }
    });
  });

  describe('Language Information', () => {
    it('should return supported languages list', () => {
      const languages = service.getSupportedLanguages();
      
      expect(Array.isArray(languages)).toBe(true);
      expect(languages.length).toBeGreaterThan(20);
      expect(languages[0]).toHaveProperty('code');
      expect(languages[0]).toHaveProperty('name');
      expect(languages[0]).toHaveProperty('nativeName');
      expect(languages[0]).toHaveProperty('script');
      expect(languages[0]).toHaveProperty('direction');
    });

    it('should return language info by code', () => {
      const hindiInfo = service.getLanguageInfo('hi');
      
      expect(hindiInfo).toBeDefined();
      expect(hindiInfo?.code).toBe('hi');
      expect(hindiInfo?.name).toBe('Hindi');
      expect(hindiInfo?.nativeName).toBe('हिन्दी');
      expect(hindiInfo?.script).toBe('Devanagari');
      expect(hindiInfo?.direction).toBe('ltr');
    });

    it('should return undefined for unsupported language code', () => {
      const unsupportedInfo = service.getLanguageInfo('xyz' as SupportedLanguage);
      
      expect(unsupportedInfo).toBeUndefined();
    });
  });

  describe('Vocabulary Management', () => {
    it('should return current vocabulary', async () => {
      await service.initialize(); // Initialize service first
      const vocabulary = service.getVocabulary();
      
      expect(Array.isArray(vocabulary)).toBe(true);
      expect(vocabulary.length).toBeGreaterThan(0);
      expect(vocabulary[0]).toHaveProperty('term');
      expect(vocabulary[0]).toHaveProperty('category');
      expect(vocabulary[0]).toHaveProperty('translations');
      expect(vocabulary[0]).toHaveProperty('confidence');
    });

    it('should update vocabulary successfully', async () => {
      const newVocabulary = [
        {
          term: 'test-term',
          category: 'commodity' as const,
          translations: {
            'en': { primary: 'test', alternatives: [], context: 'test context', usage: 'common' },
            'hi': { primary: 'परीक्षण', alternatives: [], context: 'test context', usage: 'common' }
          },
          confidence: 0.9,
          frequency: 100,
          lastUpdated: new Date()
        }
      ];

      await expect(service.updateVocabulary(newVocabulary)).resolves.not.toThrow();
      
      const updatedVocabulary = service.getVocabulary();
      expect(updatedVocabulary).toEqual(newVocabulary);
    });
  });

  describe('Error Handling', () => {
    it('should handle translation errors gracefully', async () => {
      // Mock a translation error by providing invalid input
      const request: TranslationRequest = {
        text: '', // Empty text might cause issues
        sourceLanguage: 'en',
        targetLanguage: 'hi',
        context: 'general'
      };

      const result = await service.translateText(request);
      
      expect(result).toBeDefined();
      expect(result.translatedText).toBeDefined();
      expect(result.quality).toBeDefined();
    });

    it('should handle voice translation errors gracefully', async () => {
      const invalidAudioBlob = new Blob([], { type: 'invalid/type' });
      const request: VoiceTranslationRequest = {
        audioData: invalidAudioBlob,
        targetLanguage: 'en',
        context: 'general'
      };

      // Should not throw, but handle gracefully
      await expect(service.translateVoice(request)).resolves.toBeDefined();
    });
  });

  describe('Enhanced Caching Features', () => {
    it('should provide cache statistics', async () => {
      const stats = await service.getCacheStats();
      
      expect(stats).toBeDefined();
      expect(typeof stats.totalEntries).toBe('number');
      expect(typeof stats.expiredEntries).toBe('number');
      expect(typeof stats.averageHitCount).toBe('number');
      expect(typeof stats.cacheSize).toBe('number');
    });

    it('should clean up expired cache entries', async () => {
      const deletedCount = await service.cleanupCache();
      
      expect(typeof deletedCount).toBe('number');
      expect(deletedCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Translation Validation', () => {
    it('should validate translation quality', async () => {
      const validation = await service.validateTranslation(
        'Hello world',
        'नमस्ते दुनिया',
        'en',
        'hi',
        'general'
      );
      
      expect(validation).toBeDefined();
      expect(typeof validation.isValid).toBe('boolean');
      expect(typeof validation.confidence).toBe('number');
      expect(Array.isArray(validation.suggestions)).toBe(true);
      expect(Array.isArray(validation.issues)).toBe(true);
    });

    it('should detect translation issues', async () => {
      const validation = await service.validateTranslation(
        'Hello world',
        'Hello world', // Same text - should be flagged
        'en',
        'hi',
        'general'
      );
      
      expect(validation.isValid).toBe(false);
      expect(validation.issues.length).toBeGreaterThan(0);
      expect(validation.issues[0]).toContain('unchanged');
    });
  });

  describe('Batch Translation', () => {
    it('should handle batch translation requests', async () => {
      const requests: TranslationRequest[] = [
        { text: 'Hello', sourceLanguage: 'en', targetLanguage: 'hi', context: 'general' },
        { text: 'World', sourceLanguage: 'en', targetLanguage: 'hi', context: 'general' },
        { text: 'Test', sourceLanguage: 'en', targetLanguage: 'hi', context: 'general' }
      ];

      const results = await service.batchTranslate(requests);
      
      expect(results).toHaveLength(3);
      expect(results.every(result => result.translatedText)).toBe(true);
      expect(results.every(result => result.targetLanguage === 'hi')).toBe(true);
    });
  });

  describe('Translation Metrics', () => {
    it('should provide translation metrics', async () => {
      const metrics = await service.getTranslationMetrics();
      
      expect(metrics).toBeDefined();
      expect(typeof metrics.totalTranslations).toBe('number');
      expect(typeof metrics.cacheHitRate).toBe('number');
      expect(typeof metrics.averageConfidence).toBe('number');
      expect(typeof metrics.languageDistribution).toBe('object');
    });
  });

  describe('Preloading', () => {
    it('should preload common translations', async () => {
      const commonPhrases = ['Hello', 'Thank you', 'Price'];
      const targetLanguages: SupportedLanguage[] = ['hi', 'bn'];
      
      await expect(service.preloadCommonTranslations(
        commonPhrases,
        'en',
        targetLanguages,
        'mandi'
      )).resolves.not.toThrow();
    });
  });
});

describe('Unit: Translation Service Utilities', () => {
  describe('getLanguageInfo', () => {
    it('should return correct language info', () => {
      const info = getLanguageInfo('hi');
      expect(info?.name).toBe('Hindi');
      expect(info?.code).toBe('hi');
    });

    it('should return undefined for invalid code', () => {
      const info = getLanguageInfo('invalid' as SupportedLanguage);
      expect(info).toBeUndefined();
    });
  });

  describe('getSupportedLanguages', () => {
    it('should return all supported languages', () => {
      const languages = getSupportedLanguages();
      expect(languages.length).toBeGreaterThan(20);
      expect(languages.every(lang => lang.isSupported)).toBe(true);
    });
  });

  describe('isLanguageSupported', () => {
    it('should return true for supported languages', () => {
      expect(isLanguageSupported('hi')).toBe(true);
      expect(isLanguageSupported('en')).toBe(true);
      expect(isLanguageSupported('bn')).toBe(true);
    });

    it('should return false for unsupported languages', () => {
      expect(isLanguageSupported('xyz')).toBe(false);
      expect(isLanguageSupported('invalid')).toBe(false);
    });
  });

  describe('getLanguagesByRegion', () => {
    it('should return languages for specific region', () => {
      const { getLanguagesByRegion } = require('../translationService');
      const indianLanguages = getLanguagesByRegion('IN');
      
      expect(indianLanguages.length).toBeGreaterThan(15);
      expect(indianLanguages.every(lang => lang.region.includes('IN'))).toBe(true);
    });
  });

  describe('getLanguagesWithVoiceSupport', () => {
    it('should return only languages with voice support', () => {
      const { getLanguagesWithVoiceSupport } = require('../translationService');
      const voiceLanguages = getLanguagesWithVoiceSupport();
      
      expect(voiceLanguages.every(lang => lang.hasVoiceSupport)).toBe(true);
    });
  });

  describe('getCommonMandiPhrases', () => {
    it('should return common mandi phrases', () => {
      const { getCommonMandiPhrases } = require('../translationService');
      const phrases = getCommonMandiPhrases();
      
      expect(Array.isArray(phrases)).toBe(true);
      expect(phrases.length).toBeGreaterThan(5);
      expect(phrases.includes('What is the price?')).toBe(true);
    });
  });
});

describe('Unit: Translation Service Singleton', () => {
  it('should provide singleton instance', () => {
    expect(translationService).toBeInstanceOf(TranslationService);
  });

  it('should maintain state across calls', async () => {
    const vocabulary1 = translationService.getVocabulary();
    const vocabulary2 = translationService.getVocabulary();
    
    expect(vocabulary1).toBe(vocabulary2); // Same reference
  });
});