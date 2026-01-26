/**
 * Translation Service for multilingual communication
 * Supports Requirements: 1.1, 1.2, 1.4 - Real-time translation with mandi-specific vocabulary
 */

import {
  TranslationRequest,
  TranslationResponse,
  VoiceTranslationRequest,
  VoiceTranslationResponse,
  LanguageDetectionResult,
  MandiVocabulary,
  TranslationCache,
  SupportedLanguage,
  TranslationContext,
  TranslationQuality,
  LanguageInfo
} from '../types/translation';
import { ApiResponse } from '../types/api';

const API_BASE_URL = (typeof window !== 'undefined' && (window as any).ENV?.VITE_API_BASE_URL) || 'http://localhost:3000/api';

// Language information data
const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari', direction: 'ltr', region: ['IN'], speakers: 600000000, isSupported: true, hasVoiceSupport: true, hasKeyboard: true },
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin', direction: 'ltr', region: ['IN', 'US', 'GB'], speakers: 1500000000, isSupported: true, hasVoiceSupport: true, hasKeyboard: true },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali', direction: 'ltr', region: ['IN', 'BD'], speakers: 300000000, isSupported: true, hasVoiceSupport: true, hasKeyboard: true },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu', direction: 'ltr', region: ['IN'], speakers: 95000000, isSupported: true, hasVoiceSupport: true, hasKeyboard: true },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari', direction: 'ltr', region: ['IN'], speakers: 83000000, isSupported: true, hasVoiceSupport: true, hasKeyboard: true },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil', direction: 'ltr', region: ['IN', 'LK'], speakers: 78000000, isSupported: true, hasVoiceSupport: true, hasKeyboard: true },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati', direction: 'ltr', region: ['IN'], speakers: 56000000, isSupported: true, hasVoiceSupport: true, hasKeyboard: true },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada', direction: 'ltr', region: ['IN'], speakers: 44000000, isSupported: true, hasVoiceSupport: true, hasKeyboard: true },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam', direction: 'ltr', region: ['IN'], speakers: 38000000, isSupported: true, hasVoiceSupport: true, hasKeyboard: true },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', script: 'Odia', direction: 'ltr', region: ['IN'], speakers: 38000000, isSupported: true, hasVoiceSupport: true, hasKeyboard: true },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'Gurmukhi', direction: 'ltr', region: ['IN', 'PK'], speakers: 33000000, isSupported: true, hasVoiceSupport: true, hasKeyboard: true },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', script: 'Bengali', direction: 'ltr', region: ['IN'], speakers: 15000000, isSupported: true, hasVoiceSupport: false, hasKeyboard: true },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', script: 'Arabic', direction: 'rtl', region: ['IN', 'PK'], speakers: 70000000, isSupported: true, hasVoiceSupport: true, hasKeyboard: true },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', script: 'Arabic', direction: 'rtl', region: ['IN', 'PK'], speakers: 25000000, isSupported: true, hasVoiceSupport: false, hasKeyboard: true },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', script: 'Devanagari', direction: 'ltr', region: ['NP', 'IN'], speakers: 16000000, isSupported: true, hasVoiceSupport: false, hasKeyboard: true },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', script: 'Sinhala', direction: 'ltr', region: ['LK'], speakers: 17000000, isSupported: true, hasVoiceSupport: false, hasKeyboard: true },
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာ', script: 'Myanmar', direction: 'ltr', region: ['MM'], speakers: 33000000, isSupported: true, hasVoiceSupport: false, hasKeyboard: true },
  { code: 'dz', name: 'Dzongkha', nativeName: 'རྫོང་ཁ', script: 'Tibetan', direction: 'ltr', region: ['BT'], speakers: 170000, isSupported: true, hasVoiceSupport: false, hasKeyboard: false },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर', script: 'Devanagari', direction: 'ltr', region: ['IN'], speakers: 7000000, isSupported: true, hasVoiceSupport: false, hasKeyboard: true },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', script: 'Devanagari', direction: 'ltr', region: ['IN'], speakers: 2300000, isSupported: true, hasVoiceSupport: false, hasKeyboard: true },
  { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্', script: 'Bengali', direction: 'ltr', region: ['IN'], speakers: 1800000, isSupported: true, hasVoiceSupport: false, hasKeyboard: true },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', script: 'Ol Chiki', direction: 'ltr', region: ['IN'], speakers: 7000000, isSupported: true, hasVoiceSupport: false, hasKeyboard: false },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', script: 'Devanagari', direction: 'ltr', region: ['IN'], speakers: 2600000, isSupported: true, hasVoiceSupport: false, hasKeyboard: true },
  { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी', script: 'Devanagari', direction: 'ltr', region: ['IN'], speakers: 52000000, isSupported: true, hasVoiceSupport: false, hasKeyboard: true },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', script: 'Devanagari', direction: 'ltr', region: ['IN'], speakers: 13500000, isSupported: true, hasVoiceSupport: false, hasKeyboard: true },
  { code: 'mag', name: 'Magahi', nativeName: 'मगही', script: 'Devanagari', direction: 'ltr', region: ['IN'], speakers: 13000000, isSupported: true, hasVoiceSupport: false, hasKeyboard: true },
  { code: 'sck', name: 'Sadri', nativeName: 'सादरी', script: 'Devanagari', direction: 'ltr', region: ['IN'], speakers: 2000000, isSupported: true, hasVoiceSupport: false, hasKeyboard: true }
];

// Mandi-specific vocabulary dictionary
const MANDI_VOCABULARY: MandiVocabulary[] = [
  {
    term: 'mandi',
    category: 'location',
    translations: {
      'hi': { primary: 'मंडी', alternatives: ['बाज़ार', 'हाट'], context: 'agricultural market', usage: 'common' },
      'en': { primary: 'market', alternatives: ['marketplace', 'trading center'], context: 'agricultural market', usage: 'common' },
      'bn': { primary: 'মান্ডি', alternatives: ['বাজার', 'হাট'], context: 'agricultural market', usage: 'common' },
      'te': { primary: 'మండి', alternatives: ['మార్కెట్', 'సంత'], context: 'agricultural market', usage: 'common' },
      'ta': { primary: 'மண்டி', alternatives: ['சந்தை', 'பேட்டை'], context: 'agricultural market', usage: 'common' },
      'gu': { primary: 'મંડી', alternatives: ['બજાર', 'હાટ'], context: 'agricultural market', usage: 'common' },
      'mr': { primary: 'मंडी', alternatives: ['बाजार', 'हाट'], context: 'agricultural market', usage: 'common' }
    },
    confidence: 0.98,
    frequency: 1000,
    lastUpdated: new Date()
  },
  {
    term: 'quintal',
    category: 'unit',
    translations: {
      'hi': { primary: 'क्विंटल', alternatives: ['मन'], context: 'weight measurement', usage: 'common' },
      'en': { primary: 'quintal', alternatives: ['100 kg'], context: 'weight measurement', usage: 'common' },
      'bn': { primary: 'কুইন্টাল', alternatives: ['মন'], context: 'weight measurement', usage: 'common' },
      'te': { primary: 'క్వింటల్', alternatives: ['మనుగు'], context: 'weight measurement', usage: 'common' },
      'ta': { primary: 'குவிண்டல்', alternatives: ['மணம்'], context: 'weight measurement', usage: 'common' }
    },
    confidence: 0.95,
    frequency: 800,
    lastUpdated: new Date()
  },
  {
    term: 'wholesale',
    category: 'process',
    translations: {
      'hi': { primary: 'थोक', alternatives: ['होलसेल'], context: 'bulk trading', usage: 'common' },
      'en': { primary: 'wholesale', alternatives: ['bulk', 'trade'], context: 'bulk trading', usage: 'common' },
      'bn': { primary: 'পাইকারি', alternatives: ['থোক'], context: 'bulk trading', usage: 'common' },
      'te': { primary: 'టోకు', alternatives: ['హోల్‌సేల్'], context: 'bulk trading', usage: 'common' },
      'ta': { primary: 'மொத்த விற்பனை', alternatives: ['டோக்கு'], context: 'bulk trading', usage: 'common' }
    },
    confidence: 0.92,
    frequency: 600,
    lastUpdated: new Date()
  }
];

// IndexedDB configuration for caching
const DB_NAME = 'MandiTranslationCache';
const DB_VERSION = 1;
const CACHE_STORE_NAME = 'translations';
const VOCABULARY_STORE_NAME = 'vocabulary';

class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private cleanupInterval: number | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create translations cache store
        if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
          const cacheStore = db.createObjectStore(CACHE_STORE_NAME, { keyPath: 'id' });
          cacheStore.createIndex('sourceText', 'sourceText', { unique: false });
          cacheStore.createIndex('languagePair', ['sourceLanguage', 'targetLanguage'], { unique: false });
          cacheStore.createIndex('context', 'context', { unique: false });
          cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
          cacheStore.createIndex('hitCount', 'hitCount', { unique: false });
          cacheStore.createIndex('lastUsed', 'lastUsed', { unique: false });
        }
        
        // Create vocabulary store
        if (!db.objectStoreNames.contains(VOCABULARY_STORE_NAME)) {
          const vocabStore = db.createObjectStore(VOCABULARY_STORE_NAME, { keyPath: 'term' });
          vocabStore.createIndex('category', 'category', { unique: false });
          vocabStore.createIndex('frequency', 'frequency', { unique: false });
        }
      };
    });
  }

  /**
   * Clean up expired cache entries
   */
  async cleanupExpiredCache(): Promise<number> {
    if (!this.db) return 0;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(CACHE_STORE_NAME);
      const index = store.index('expiresAt');
      const now = new Date();
      
      // Get all expired entries
      const request = index.openCursor(IDBKeyRange.upperBound(now));
      let deletedCount = 0;
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          resolve(deletedCount);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalEntries: number;
    expiredEntries: number;
    averageHitCount: number;
    cacheSize: number;
  }> {
    if (!this.db) return { totalEntries: 0, expiredEntries: 0, averageHitCount: 0, cacheSize: 0 };
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_STORE_NAME], 'readonly');
      const store = transaction.objectStore(CACHE_STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const entries = request.result as TranslationCache[];
        const now = new Date();
        const expiredEntries = entries.filter(entry => entry.expiresAt <= now).length;
        const totalHits = entries.reduce((sum, entry) => sum + entry.hitCount, 0);
        const averageHitCount = entries.length > 0 ? totalHits / entries.length : 0;
        
        // Estimate cache size (rough calculation)
        const cacheSize = entries.reduce((size, entry) => 
          size + entry.sourceText.length + entry.translatedText.length, 0
        );
        
        resolve({
          totalEntries: entries.length,
          expiredEntries,
          averageHitCount,
          cacheSize
        });
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Start automatic cache cleanup
   */
  startCacheCleanup(intervalMs: number = 24 * 60 * 60 * 1000): void { // Default: 24 hours
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.cleanupInterval = setInterval(async () => {
      try {
        const deletedCount = await this.cleanupExpiredCache();
        if (deletedCount > 0) {
          console.log(`Translation cache cleanup: removed ${deletedCount} expired entries`);
        }
      } catch (error) {
        console.error('Cache cleanup failed:', error);
      }
    }, intervalMs) as any;
  }

  /**
   * Stop automatic cache cleanup
   */
  stopCacheCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  async getCachedTranslation(sourceText: string, sourceLanguage: SupportedLanguage, targetLanguage: SupportedLanguage, context: TranslationContext): Promise<TranslationCache | null> {
    if (!this.db) return null;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_STORE_NAME], 'readonly');
      const store = transaction.objectStore(CACHE_STORE_NAME);
      const index = store.index('languagePair');
      const request = index.getAll([sourceLanguage, targetLanguage]);
      
      request.onsuccess = () => {
        const results = request.result as TranslationCache[];
        const match = results.find(cache => 
          cache.sourceText === sourceText && 
          cache.context === context &&
          cache.expiresAt > new Date()
        );
        resolve(match || null);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async cacheTranslation(cache: TranslationCache): Promise<void> {
    if (!this.db) return;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([CACHE_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(CACHE_STORE_NAME);
      const request = store.put(cache);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getVocabulary(): Promise<MandiVocabulary[]> {
    if (!this.db) return MANDI_VOCABULARY;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([VOCABULARY_STORE_NAME], 'readonly');
      const store = transaction.objectStore(VOCABULARY_STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const stored = request.result as MandiVocabulary[];
        resolve(stored.length > 0 ? stored : MANDI_VOCABULARY);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async updateVocabulary(vocabulary: MandiVocabulary[]): Promise<void> {
    if (!this.db) return;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([VOCABULARY_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(VOCABULARY_STORE_NAME);
      
      // Clear existing vocabulary
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => {
        // Add new vocabulary
        let completed = 0;
        vocabulary.forEach(vocab => {
          const addRequest = store.add(vocab);
          addRequest.onsuccess = () => {
            completed++;
            if (completed === vocabulary.length) {
              resolve();
            }
          };
          addRequest.onerror = () => reject(addRequest.error);
        });
      };
      
      clearRequest.onerror = () => reject(clearRequest.error);
    });
  }
}

class TranslationService {
  private dbManager: IndexedDBManager;
  private vocabulary: MandiVocabulary[] = [];
  private isInitialized = false;

  constructor() {
    this.dbManager = new IndexedDBManager();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await this.dbManager.init();
      this.vocabulary = await this.dbManager.getVocabulary();
      
      // Start automatic cache cleanup
      this.dbManager.startCacheCleanup();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize translation service:', error);
      // Fallback to in-memory vocabulary
      this.vocabulary = MANDI_VOCABULARY;
      this.isInitialized = true;
    }
  }

  /**
   * Detect the language of input text
   * Requirement 1.1: Language detection with confidence scoring
   */
  async detectLanguage(text: string): Promise<LanguageDetectionResult> {
    const startTime = Date.now();
    
    try {
      // For demo purposes, we'll implement a simple heuristic-based detection
      // In production, this would use a proper language detection API
      const detectedLanguage = this.heuristicLanguageDetection(text);
      const processingTime = Date.now() - startTime;
      
      return {
        detectedLanguage: detectedLanguage.language,
        confidence: detectedLanguage.confidence,
        alternativeLanguages: detectedLanguage.alternatives,
        processingTime,
        textLength: text.length
      };
    } catch (error) {
      console.error('Language detection failed:', error);
      // Fallback to English with low confidence
      return {
        detectedLanguage: 'en',
        confidence: 0.1,
        alternativeLanguages: [
          { language: 'hi', confidence: 0.05 },
          { language: 'bn', confidence: 0.05 }
        ],
        processingTime: Date.now() - startTime,
        textLength: text.length
      };
    }
  }

  /**
   * Translate text between supported languages
   * Requirements 1.1, 1.2: Real-time translation with mandi-specific vocabulary
   */
  async translateText(request: TranslationRequest): Promise<TranslationResponse> {
    await this.initialize();
    const startTime = Date.now();
    
    try {
      // Check cache first - ensure we have a source language
      let sourceLanguage: SupportedLanguage;
      if (request.sourceLanguage) {
        sourceLanguage = request.sourceLanguage;
      } else {
        const detection = await this.detectLanguage(request.text);
        sourceLanguage = detection.detectedLanguage;
      }
      
      const cachedTranslation = await this.dbManager.getCachedTranslation(
        request.text,
        sourceLanguage,
        request.targetLanguage,
        request.context
      );
      
      if (cachedTranslation) {
        // Update hit count and last used
        cachedTranslation.hitCount++;
        cachedTranslation.lastUsed = new Date();
        await this.dbManager.cacheTranslation(cachedTranslation);
        
        return {
          translatedText: cachedTranslation.translatedText,
          confidence: cachedTranslation.confidence,
          sourceLanguageDetected: sourceLanguage,
          targetLanguage: request.targetLanguage,
          quality: this.assessTranslationQuality(cachedTranslation.confidence),
          requiresReview: cachedTranslation.confidence < 0.8,
          alternativeTranslations: [],
          processingTime: Date.now() - startTime,
          translationEngine: 'cache',
          timestamp: new Date(),
          metadata: {
            wordCount: request.text.split(' ').length,
            characterCount: request.text.length,
            complexityScore: this.calculateComplexityScore(request.text),
            contextMatches: this.countContextMatches(request.text, request.context),
            vocabularyMatches: this.countVocabularyMatches(request.text)
          }
        };
      }

      // Perform translation with mandi-specific vocabulary enhancement
      const translationResult = await this.performTranslation(request, sourceLanguage);
      
      // Cache the result
      const cacheEntry: TranslationCache = {
        id: this.generateCacheId(request.text, sourceLanguage, request.targetLanguage, request.context),
        sourceText: request.text,
        sourceLanguage,
        targetLanguage: request.targetLanguage,
        translatedText: translationResult.translatedText,
        confidence: translationResult.confidence,
        context: request.context,
        hitCount: 1,
        createdAt: new Date(),
        lastUsed: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      };
      
      await this.dbManager.cacheTranslation(cacheEntry);
      
      return {
        ...translationResult,
        sourceLanguageDetected: sourceLanguage,
        processingTime: Date.now() - startTime,
        timestamp: new Date()
      };
      
    } catch (error) {
      console.error('Translation failed:', error);
      return this.createErrorResponse(request, error as Error, Date.now() - startTime);
    }
  }

  /**
   * Translate voice input
   * Requirement 1.3: Voice translation capabilities
   */
  async translateVoice(request: VoiceTranslationRequest): Promise<VoiceTranslationResponse> {
    await this.initialize();
    const startTime = Date.now();
    
    try {
      // Convert audio to text using Web Speech API
      const transcription = await this.speechToText(request.audioData, request.sourceLanguage);
      
      // Translate the transcribed text
      const detectedLanguage = transcription.detectedLanguage;
      const textTranslationRequest: TranslationRequest = {
        text: transcription.text,
        sourceLanguage: detectedLanguage,
        targetLanguage: request.targetLanguage,
        context: request.context,
        priority: 'high',
        userId: request.userId,
        sessionId: request.sessionId
      };
      
      const textTranslation = await this.translateText(textTranslationRequest);
      
      // Generate audio for translated text (optional)
      const audioUrl = await this.textToSpeech(textTranslation.translatedText, request.targetLanguage);
      
      return {
        transcription: transcription.text,
        transcriptionConfidence: transcription.confidence,
        translatedText: textTranslation.translatedText,
        translationConfidence: textTranslation.confidence,
        sourceLanguageDetected: detectedLanguage,
        targetLanguage: request.targetLanguage,
        audioUrl,
        processingTime: Date.now() - startTime,
        requiresReview: transcription.confidence < 0.7 || textTranslation.confidence < 0.8,
        metadata: {
          audioDuration: await this.getAudioDuration(request.audioData),
          audioQuality: request.quality === 'high' ? 0.9 : request.quality === 'medium' ? 0.7 : 0.5,
          backgroundNoise: 0.2, // Would be calculated from audio analysis
          speechRate: this.calculateSpeechRate(transcription.text, await this.getAudioDuration(request.audioData))
        }
      };
      
    } catch (error) {
      console.error('Voice translation failed:', error);
      throw new Error(`Voice translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): LanguageInfo[] {
    return SUPPORTED_LANGUAGES;
  }

  /**
   * Get language information by code
   */
  getLanguageInfo(code: SupportedLanguage): LanguageInfo | undefined {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
  }

  /**
   * Update mandi vocabulary
   */
  async updateVocabulary(newVocabulary: MandiVocabulary[]): Promise<void> {
    await this.initialize();
    this.vocabulary = newVocabulary;
    await this.dbManager.updateVocabulary(newVocabulary);
  }

  /**
   * Get current vocabulary
   */
  getVocabulary(): MandiVocabulary[] {
    return this.vocabulary;
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalEntries: number;
    expiredEntries: number;
    averageHitCount: number;
    cacheSize: number;
  }> {
    await this.initialize();
    return this.dbManager.getCacheStats();
  }

  /**
   * Clean up expired cache entries manually
   */
  async cleanupCache(): Promise<number> {
    await this.initialize();
    return this.dbManager.cleanupExpiredCache();
  }

  /**
   * Validate translation quality and suggest improvements
   */
  async validateTranslation(
    originalText: string,
    translatedText: string,
    sourceLanguage: SupportedLanguage,
    targetLanguage: SupportedLanguage,
    context: TranslationContext
  ): Promise<{
    isValid: boolean;
    confidence: number;
    suggestions: string[];
    issues: string[];
  }> {
    await this.initialize();
    
    const issues: string[] = [];
    const suggestions: string[] = [];
    
    // Check for obvious issues
    if (translatedText === originalText && sourceLanguage !== targetLanguage) {
      issues.push('Translation appears to be unchanged from original');
      suggestions.push('Consider using a different translation approach');
    }
    
    if (translatedText.length < originalText.length * 0.3) {
      issues.push('Translation appears too short compared to original');
      suggestions.push('Verify that all content has been translated');
    }
    
    if (translatedText.length > originalText.length * 3) {
      issues.push('Translation appears unusually long compared to original');
      suggestions.push('Consider more concise translation');
    }
    
    // Check for vocabulary matches
    const vocabularyMatches = this.countVocabularyMatches(originalText);
    const contextMatches = this.countContextMatches(originalText, context);
    
    if (vocabularyMatches === 0 && context === 'mandi') {
      suggestions.push('Consider using mandi-specific vocabulary for better accuracy');
    }
    
    // Calculate confidence based on various factors
    let confidence = 0.7; // Base confidence
    confidence += vocabularyMatches * 0.05;
    confidence += contextMatches * 0.03;
    confidence -= issues.length * 0.1;
    
    confidence = Math.max(0.1, Math.min(0.99, confidence));
    
    return {
      isValid: issues.length === 0 && confidence > 0.6,
      confidence,
      suggestions,
      issues
    };
  }

  /**
   * Get translation metrics for analytics
   */
  async getTranslationMetrics(): Promise<{
    totalTranslations: number;
    cacheHitRate: number;
    averageConfidence: number;
    languageDistribution: { [key: string]: number };
  }> {
    await this.initialize();
    const cacheStats = await this.dbManager.getCacheStats();
    
    // This would typically be stored in a separate analytics store
    // For now, we'll return basic metrics from cache
    return {
      totalTranslations: cacheStats.totalEntries,
      cacheHitRate: cacheStats.averageHitCount > 1 ? 0.8 : 0.2, // Estimated
      averageConfidence: 0.85, // Would be calculated from actual data
      languageDistribution: {
        'hi-en': 30,
        'en-hi': 25,
        'bn-en': 15,
        'te-en': 10,
        'other': 20
      }
    };
  }

  /**
   * Batch translate multiple texts
   */
  async batchTranslate(
    requests: TranslationRequest[]
  ): Promise<TranslationResponse[]> {
    await this.initialize();
    
    const results: TranslationResponse[] = [];
    
    // Process in batches to avoid overwhelming the system
    const batchSize = 10;
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchPromises = batch.map(request => this.translateText(request));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }

  /**
   * Preload common translations for offline use
   */
  async preloadCommonTranslations(
    commonPhrases: string[],
    sourceLanguage: SupportedLanguage,
    targetLanguages: SupportedLanguage[],
    context: TranslationContext = 'mandi'
  ): Promise<void> {
    await this.initialize();
    
    const requests: TranslationRequest[] = [];
    
    for (const phrase of commonPhrases) {
      for (const targetLanguage of targetLanguages) {
        if (sourceLanguage !== targetLanguage) {
          requests.push({
            text: phrase,
            sourceLanguage,
            targetLanguage,
            context,
            priority: 'low'
          });
        }
      }
    }
    
    // Translate and cache all common phrases
    await this.batchTranslate(requests);
  }

  /**
   * Dispose of resources and cleanup
   */
  dispose(): void {
    this.dbManager.stopCacheCleanup();
    this.isInitialized = false;
  }

  // Private helper methods

  private heuristicLanguageDetection(text: string): {
    language: SupportedLanguage;
    confidence: number;
    alternatives: { language: SupportedLanguage; confidence: number }[];
  } {
    // Simple heuristic based on character sets and common words
    const devanagariPattern = /[\u0900-\u097F]/;
    const bengaliPattern = /[\u0980-\u09FF]/;
    const tamilPattern = /[\u0B80-\u0BFF]/;
    const teluguPattern = /[\u0C00-\u0C7F]/;
    const gujaratiPattern = /[\u0A80-\u0AFF]/;
    const kannadaPattern = /[\u0C80-\u0CFF]/;
    const malayalamPattern = /[\u0D00-\u0D7F]/;
    const odiaPattern = /[\u0B00-\u0B7F]/;
    const gurmukhiPattern = /[\u0A00-\u0A7F]/;
    const arabicPattern = /[\u0600-\u06FF]/;
    
    const alternatives: { language: SupportedLanguage; confidence: number }[] = [];
    
    if (devanagariPattern.test(text)) {
      // Could be Hindi, Marathi, Nepali, etc.
      if (text.includes('है') || text.includes('का') || text.includes('की')) {
        return { language: 'hi', confidence: 0.9, alternatives: [{ language: 'mr', confidence: 0.1 }] };
      } else if (text.includes('आहे') || text.includes('च्या')) {
        return { language: 'mr', confidence: 0.9, alternatives: [{ language: 'hi', confidence: 0.1 }] };
      }
      return { language: 'hi', confidence: 0.7, alternatives: [{ language: 'mr', confidence: 0.2 }, { language: 'ne', confidence: 0.1 }] };
    }
    
    if (bengaliPattern.test(text)) {
      return { language: 'bn', confidence: 0.9, alternatives: [{ language: 'as', confidence: 0.1 }] };
    }
    
    if (tamilPattern.test(text)) {
      return { language: 'ta', confidence: 0.95, alternatives: [] };
    }
    
    if (teluguPattern.test(text)) {
      return { language: 'te', confidence: 0.95, alternatives: [] };
    }
    
    if (gujaratiPattern.test(text)) {
      return { language: 'gu', confidence: 0.95, alternatives: [] };
    }
    
    if (kannadaPattern.test(text)) {
      return { language: 'kn', confidence: 0.95, alternatives: [] };
    }
    
    if (malayalamPattern.test(text)) {
      return { language: 'ml', confidence: 0.95, alternatives: [] };
    }
    
    if (odiaPattern.test(text)) {
      return { language: 'or', confidence: 0.95, alternatives: [] };
    }
    
    if (gurmukhiPattern.test(text)) {
      return { language: 'pa', confidence: 0.95, alternatives: [] };
    }
    
    if (arabicPattern.test(text)) {
      return { language: 'ur', confidence: 0.8, alternatives: [{ language: 'sd', confidence: 0.2 }] };
    }
    
    // Default to English for Latin script
    return { language: 'en', confidence: 0.8, alternatives: [{ language: 'hi', confidence: 0.1 }, { language: 'bn', confidence: 0.1 }] };
  }

  private async performTranslation(request: TranslationRequest, sourceLanguage: SupportedLanguage): Promise<Omit<TranslationResponse, 'sourceLanguageDetected' | 'processingTime' | 'timestamp'>> {
    // Enhanced translation with mandi-specific vocabulary
    let translatedText = await this.basicTranslation(request.text, sourceLanguage, request.targetLanguage);
    
    // Apply mandi-specific vocabulary enhancements
    translatedText = this.enhanceWithMandiVocabulary(translatedText, sourceLanguage, request.targetLanguage, request.context);
    
    // Calculate confidence based on various factors
    const confidence = this.calculateTranslationConfidence(request.text, translatedText, sourceLanguage, request.targetLanguage, request.context);
    
    // Generate alternative translations for low confidence cases
    const alternativeTranslations = confidence < 0.8 ? await this.generateAlternatives(request.text, sourceLanguage, request.targetLanguage) : [];
    
    return {
      translatedText,
      confidence,
      targetLanguage: request.targetLanguage,
      quality: this.assessTranslationQuality(confidence),
      requiresReview: confidence < 0.8,
      alternativeTranslations,
      translationEngine: 'mandi-enhanced',
      metadata: {
        wordCount: request.text.split(' ').length,
        characterCount: request.text.length,
        complexityScore: this.calculateComplexityScore(request.text),
        contextMatches: this.countContextMatches(request.text, request.context),
        vocabularyMatches: this.countVocabularyMatches(request.text)
      }
    };
  }

  private async basicTranslation(text: string, sourceLanguage: SupportedLanguage, targetLanguage: SupportedLanguage): Promise<string> {
    // In a real implementation, this would call Google Translate API
    // For demo purposes, we'll simulate translation with vocabulary lookup
    
    if (sourceLanguage === targetLanguage) {
      return text;
    }
    
    // Simple vocabulary-based translation for demo
    let translatedText = text;
    
    for (const vocab of this.vocabulary) {
      const sourceTranslation = vocab.translations[sourceLanguage];
      const targetTranslation = vocab.translations[targetLanguage];
      
      if (sourceTranslation && targetTranslation) {
        // Replace primary term and alternatives
        const sourceTerms = [sourceTranslation.primary, ...sourceTranslation.alternatives];
        for (const sourceTerm of sourceTerms) {
          const regex = new RegExp(`\\b${this.escapeRegex(sourceTerm)}\\b`, 'gi');
          translatedText = translatedText.replace(regex, targetTranslation.primary);
        }
      }
    }
    
    // If no vocabulary matches found, return a placeholder translation
    if (translatedText === text) {
      translatedText = `[Translated from ${sourceLanguage} to ${targetLanguage}]: ${text}`;
    }
    
    return translatedText;
  }

  private enhanceWithMandiVocabulary(text: string, sourceLanguage: SupportedLanguage, targetLanguage: SupportedLanguage, context: TranslationContext): string {
    let enhancedText = text;
    
    // Apply context-specific enhancements
    if (context === 'mandi' || context === 'negotiation') {
      for (const vocab of this.vocabulary) {
        const targetTranslation = vocab.translations[targetLanguage];
        if (targetTranslation && vocab.category === 'commodity') {
          // Ensure commodity names are properly translated
          const regex = new RegExp(`\\b${this.escapeRegex(vocab.term)}\\b`, 'gi');
          enhancedText = enhancedText.replace(regex, targetTranslation.primary);
        }
      }
    }
    
    return enhancedText;
  }

  private calculateTranslationConfidence(sourceText: string, translatedText: string, sourceLanguage: SupportedLanguage, targetLanguage: SupportedLanguage, context: TranslationContext): number {
    let confidence = 0.7; // Base confidence
    
    // Increase confidence for vocabulary matches
    const vocabularyMatches = this.countVocabularyMatches(sourceText);
    confidence += vocabularyMatches * 0.05;
    
    // Increase confidence for context matches
    const contextMatches = this.countContextMatches(sourceText, context);
    confidence += contextMatches * 0.03;
    
    // Decrease confidence for very short or very long texts
    const wordCount = sourceText.split(' ').length;
    if (wordCount < 3) confidence -= 0.1;
    if (wordCount > 50) confidence -= 0.05;
    
    // Ensure confidence is within bounds
    return Math.max(0.1, Math.min(0.99, confidence));
  }

  private assessTranslationQuality(confidence: number): TranslationQuality {
    if (confidence >= 0.9) return 'high';
    if (confidence >= 0.7) return 'medium';
    if (confidence >= 0.5) return 'low';
    return 'failed';
  }

  private async generateAlternatives(text: string, sourceLanguage: SupportedLanguage, targetLanguage: SupportedLanguage): Promise<string[]> {
    // Generate alternative translations for low confidence cases
    const alternatives: string[] = [];
    
    // Try different vocabulary combinations
    for (const vocab of this.vocabulary.slice(0, 3)) { // Limit to top 3 for performance
      const sourceTranslation = vocab.translations[sourceLanguage];
      const targetTranslation = vocab.translations[targetLanguage];
      
      if (sourceTranslation && targetTranslation && targetTranslation.alternatives.length > 0) {
        let alternativeText = text;
        const regex = new RegExp(`\\b${this.escapeRegex(sourceTranslation.primary)}\\b`, 'gi');
        alternativeText = alternativeText.replace(regex, targetTranslation.alternatives[0]);
        
        if (alternativeText !== text) {
          alternatives.push(alternativeText);
        }
      }
    }
    
    return alternatives.slice(0, 3); // Return max 3 alternatives
  }

  private calculateComplexityScore(text: string): number {
    const wordCount = text.split(' ').length;
    const avgWordLength = text.replace(/\s/g, '').length / wordCount;
    const specialCharCount = (text.match(/[^\w\s]/g) || []).length;
    
    // Normalize to 0-1 scale
    const complexity = (avgWordLength / 10) + (specialCharCount / text.length) + (wordCount > 20 ? 0.2 : 0);
    return Math.min(1, complexity);
  }

  private countContextMatches(text: string, context: TranslationContext): number {
    const contextKeywords = {
      'mandi': ['market', 'price', 'sell', 'buy', 'trade', 'commodity', 'wholesale', 'retail'],
      'negotiation': ['offer', 'deal', 'negotiate', 'price', 'discount', 'final', 'accept', 'reject'],
      'general': [],
      'technical': ['specification', 'quality', 'grade', 'standard', 'measurement'],
      'legal': ['contract', 'agreement', 'terms', 'conditions', 'legal', 'binding']
    };
    
    const keywords = contextKeywords[context] || [];
    let matches = 0;
    
    for (const keyword of keywords) {
      if (text.toLowerCase().includes(keyword.toLowerCase())) {
        matches++;
      }
    }
    
    return matches;
  }

  private countVocabularyMatches(text: string): number {
    let matches = 0;
    
    for (const vocab of this.vocabulary) {
      if (text.toLowerCase().includes(vocab.term.toLowerCase())) {
        matches++;
      }
    }
    
    return matches;
  }

  private generateCacheId(text: string, sourceLanguage: SupportedLanguage, targetLanguage: SupportedLanguage, context: TranslationContext): string {
    const hash = this.simpleHash(text + sourceLanguage + targetLanguage + context);
    return `${sourceLanguage}-${targetLanguage}-${context}-${hash}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private createErrorResponse(request: TranslationRequest, error: Error, processingTime: number): TranslationResponse {
    return {
      translatedText: request.text, // Return original text as fallback
      confidence: 0.1,
      sourceLanguageDetected: request.sourceLanguage || 'en',
      targetLanguage: request.targetLanguage,
      quality: 'failed',
      requiresReview: true,
      alternativeTranslations: [],
      processingTime,
      translationEngine: 'error-fallback',
      timestamp: new Date(),
      metadata: {
        wordCount: request.text.split(' ').length,
        characterCount: request.text.length,
        complexityScore: 0,
        contextMatches: 0,
        vocabularyMatches: 0
      }
    };
  }

  // Voice-related helper methods

  private async speechToText(audioData: Blob, sourceLanguage?: SupportedLanguage): Promise<{ text: string; confidence: number; detectedLanguage: SupportedLanguage }> {
    // In a real implementation, this would use Web Speech API or a cloud service
    // For demo purposes, we'll simulate speech recognition
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          text: "Sample transcribed text from audio",
          confidence: 0.85,
          detectedLanguage: sourceLanguage || 'hi'
        });
      }, 1000);
    });
  }

  private async textToSpeech(text: string, language: SupportedLanguage): Promise<string | undefined> {
    // In a real implementation, this would use Web Speech API or a cloud service
    // For demo purposes, we'll return undefined (no audio generated)
    return undefined;
  }

  private async getAudioDuration(audioData: Blob): Promise<number> {
    // In a real implementation, this would analyze the audio blob
    // For demo purposes, we'll return a simulated duration
    return 3.5; // seconds
  }

  private calculateSpeechRate(text: string, duration: number): number {
    const wordCount = text.split(' ').length;
    return Math.round((wordCount / duration) * 60); // words per minute
  }
}

// Export singleton instance
export const translationService = new TranslationService();

// Export class for testing
export { TranslationService };

// Export utility functions
export const getLanguageInfo = (code: SupportedLanguage): LanguageInfo | undefined => {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
};

export const getSupportedLanguages = (): LanguageInfo[] => {
  return SUPPORTED_LANGUAGES;
};

export const isLanguageSupported = (code: string): code is SupportedLanguage => {
  return SUPPORTED_LANGUAGES.some(lang => lang.code === code);
};

export const getLanguagesByRegion = (region: string): LanguageInfo[] => {
  return SUPPORTED_LANGUAGES.filter(lang => lang.region.includes(region));
};

export const getLanguagesWithVoiceSupport = (): LanguageInfo[] => {
  return SUPPORTED_LANGUAGES.filter(lang => lang.hasVoiceSupport);
};

export const getLanguagesByScript = (script: string): LanguageInfo[] => {
  return SUPPORTED_LANGUAGES.filter(lang => lang.script === script);
};

export const getCommonMandiPhrases = (): string[] => {
  return [
    'What is the price?',
    'How much per quintal?',
    'Is this wholesale price?',
    'Can you give discount?',
    'What is the quality?',
    'When will you deliver?',
    'Payment terms?',
    'Final price?',
    'Deal confirmed',
    'Thank you'
  ];
};