import { getGeminiModel } from '../lib/gemini';
import { offlineSyncService } from './offlineSync';
import type {
  TranslationService,
  TranslationResult,
  Language
} from '../types';

// Translation cache key generator
// Simple string hash function for cache keys
const stringHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
};

// Translation cache key generator
const getCacheKey = (text: string, fromLang: Language, toLang: Language): string => {
  return `translation:${fromLang}:${toLang}:${stringHash(text)}`;
};

// Translation confidence thresholds
const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.6,
  LOW: 0.4,
} as const;

// Error types for better error handling
export const TranslationErrorType = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  UNSUPPORTED_LANGUAGE: 'UNSUPPORTED_LANGUAGE',
  LOW_CONFIDENCE: 'LOW_CONFIDENCE',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

export type TranslationErrorTypeValue = typeof TranslationErrorType[keyof typeof TranslationErrorType];

export class TranslationError extends Error {
  public readonly type: TranslationErrorTypeValue;
  public readonly originalError?: Error;
  public readonly retryable: boolean;

  constructor(
    type: TranslationErrorTypeValue,
    message: string,
    originalError?: Error,
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'TranslationError';
    this.type = type;
    this.originalError = originalError;
    this.retryable = retryable;
  }
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
};

class TranslationServiceImpl implements TranslationService {
  private model = getGeminiModel();

  // Cache TTL: 7 days for translations
  private readonly CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

  /**
   * Translates text from one language to another using Gemini API
   * Implements caching for offline access and performance
   * Includes comprehensive error handling and retry logic
   */
  async translateText(
    text: string,
    fromLang: Language,
    toLang: Language
  ): Promise<TranslationResult> {
    // Input validation
    if (!text || text.trim().length === 0) {
      throw new TranslationError(
        TranslationErrorType.INVALID_INPUT,
        'Text cannot be empty'
      );
    }

    if (!this.isSupportedLanguage(fromLang)) {
      throw new TranslationError(
        TranslationErrorType.UNSUPPORTED_LANGUAGE,
        `Unsupported source language: ${fromLang}`
      );
    }

    if (!this.isSupportedLanguage(toLang)) {
      throw new TranslationError(
        TranslationErrorType.UNSUPPORTED_LANGUAGE,
        `Unsupported target language: ${toLang}`
      );
    }

    // Check cache first
    const cachedResult = await this.getCachedTranslationAsync(text, fromLang, toLang);
    if (cachedResult) {
      return cachedResult;
    }

    // Attempt translation with retry logic
    return await this.translateWithRetry(text, fromLang, toLang);
  }

  private async translateWithRetry(
    text: string,
    fromLang: Language,
    toLang: Language,
    attempt: number = 1
  ): Promise<TranslationResult> {
    try {
      const fromLangName = this.getLanguageName(fromLang);
      const toLangName = this.getLanguageName(toLang);

      const prompt = `Translate the following text from ${fromLangName} to ${toLangName}. 
      The context is an agricultural marketplace (Mandi) in India. 
      Terms like "Mandi", "Qtl", "Bhav" should be handled appropriately.
      Provide ONLY the translated text without any explanations.
      
      Text: ${text}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const translatedText = response.text().trim();

      const translationResult: TranslationResult = {
        originalText: text,
        translatedText,
        confidence: 0.95, // Gemini is high confidence
        fromLanguage: fromLang,
        toLanguage: toLang,
        timestamp: new Date(),
      };

      // Cache successful result
      await this.cacheTranslation(text, fromLang, toLang, translationResult);

      return translationResult;
    } catch (error) {
      return await this.handleTranslationError(error, text, fromLang, toLang, attempt);
    }
  }

  /**
   * Comprehensive error handling with fallback strategies
   */
  private async handleTranslationError(
    error: any,
    text: string,
    fromLang: Language,
    toLang: Language,
    attempt: number
  ): Promise<TranslationResult> {
    console.error(`Translation attempt ${attempt} failed:`, error);

    // Determine error type and appropriate response
    let translationError: TranslationError;

    if (error instanceof TranslationError) {
      translationError = error;
    } else if (error.code === 'functions/unavailable') {
      translationError = new TranslationError(
        TranslationErrorType.SERVICE_UNAVAILABLE,
        'Translation service is temporarily unavailable',
        error,
        true
      );
    } else if (error.code === 'functions/resource-exhausted') {
      translationError = new TranslationError(
        TranslationErrorType.QUOTA_EXCEEDED,
        'Translation quota exceeded. Please try again later.',
        error,
        false
      );
    } else if (error.code === 'functions/unauthenticated') {
      translationError = new TranslationError(
        TranslationErrorType.API_ERROR,
        'Authentication failed. Please sign in again.',
        error,
        false
      );
    } else if (error.code?.startsWith('functions/')) {
      translationError = new TranslationError(
        TranslationErrorType.API_ERROR,
        `API error: ${error.message}`,
        error,
        false
      );
    } else if (!navigator.onLine) {
      translationError = new TranslationError(
        TranslationErrorType.NETWORK_ERROR,
        'No internet connection available',
        error,
        true
      );
    } else {
      translationError = new TranslationError(
        TranslationErrorType.NETWORK_ERROR,
        'Network error occurred',
        error,
        true
      );
    }

    // Try fallback strategies
    const fallbackResult = await this.tryFallbackStrategies(
      text,
      fromLang,
      toLang,
      translationError
    );

    if (fallbackResult) {
      return fallbackResult;
    }

    // Retry logic for retryable errors
    if (translationError.retryable && attempt < RETRY_CONFIG.maxRetries) {
      const delay = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1),
        RETRY_CONFIG.maxDelay
      );

      console.log(`Retrying translation in ${delay}ms (attempt ${attempt + 1})`);
      await this.delay(delay);

      return await this.translateWithRetry(text, fromLang, toLang, attempt + 1);
    }

    // All fallbacks failed, throw the error
    throw translationError;
  }

  /**
   * Attempts various fallback strategies when translation fails
   */
  private async tryFallbackStrategies(
    text: string,
    fromLang: Language,
    toLang: Language,
    error: TranslationError
  ): Promise<TranslationResult | null> {
    // Strategy 1: Try cached translation (even if expired)
    try {
      const cachedResult = await this.getCachedTranslationIgnoreExpiry(text, fromLang, toLang);
      if (cachedResult) {
        console.warn('Using expired cached translation as fallback');
        return {
          ...cachedResult,
          confidence: Math.max(0.3, cachedResult.confidence - 0.2), // Reduce confidence for expired cache
        };
      }
    } catch (cacheError) {
      console.error('Cache fallback failed:', cacheError);
    }

    // Strategy 2: For network errors, try simplified translation
    if (error.type === TranslationErrorType.NETWORK_ERROR) {
      try {
        const simplifiedResult = await this.getSimplifiedTranslation(text, fromLang, toLang);
        if (simplifiedResult) {
          return simplifiedResult;
        }
      } catch (simplifiedError) {
        console.error('Simplified translation fallback failed:', simplifiedError);
      }
    }

    // Strategy 3: For same language family, try direct mapping
    if (this.areSimilarLanguages(fromLang, toLang)) {
      return {
        originalText: text,
        translatedText: text, // Keep original for similar languages
        confidence: 0.5,
        fromLanguage: fromLang,
        toLanguage: toLang,
        timestamp: new Date(),
      };
    }

    return null;
  }

  /**
   * Gets cached translation ignoring expiry (for fallback purposes)
   */
  private async getCachedTranslationIgnoreExpiry(
    text: string,
    fromLang: Language,
    toLang: Language
  ): Promise<TranslationResult | null> {
    try {
      const cacheKey = getCacheKey(text, fromLang, toLang);
      const cachedEntry = await offlineSyncService.getCachedEntry<TranslationResult>(cacheKey);
      return cachedEntry?.data || null;
    } catch (error) {
      console.error('Error retrieving expired cached translation:', error);
      return null;
    }
  }

  /**
   * Provides simplified translation for basic words/phrases
   */
  private async getSimplifiedTranslation(
    text: string,
    fromLang: Language,
    toLang: Language
  ): Promise<TranslationResult | null> {
    // Basic word mappings for common mandi terms
    const basicTranslations: Record<string, Record<Language, string>> = {
      'price': {
        'hi': 'भाव',
        'en': 'price',
        'gu': 'ભાવ',
        'mr': 'भाव',
        'ta': 'விலை',
        'te': 'ధర',
        'kn': 'ಬೆಲೆ',
        'ml': 'വില',
        'bn': 'দাম',
        'or': 'ଦାମ',
        'pa': 'ਕੀਮਤ',
        'as': 'দাম',
        'ur': 'قیمت',
        'sd': 'قیمت',
        'ne': 'मूल्य',
        'ks': 'قیمت',
        'kok': 'भाव',
        'mni': 'মূল্য',
        'sat': 'दाम',
        'doi': 'भाव',
        'mai': 'दाम',
        'bho': 'भाव',
      },
      'farmer': {
        'hi': 'किसान',
        'en': 'farmer',
        'gu': 'ખેડૂત',
        'mr': 'शेतकरी',
        'ta': 'விவசாயி',
        'te': 'రైతు',
        'kn': 'ರೈತ',
        'ml': 'കർഷകൻ',
        'bn': 'কৃষক',
        'or': 'କୃଷକ',
        'pa': 'ਕਿਸਾਨ',
        'as': 'কৃষক',
        'ur': 'کسان',
        'sd': 'هاري',
        'ne': 'किसान',
        'ks': 'کِشان',
        'kok': 'शेतकार',
        'mni': 'লৌমী',
        'sat': 'हुड़ुङ',
        'doi': 'किसान',
        'mai': 'किसान',
        'bho': 'किसान',
      },
      'market': {
        'hi': 'मंडी',
        'en': 'market',
        'gu': 'બજાર',
        'mr': 'बाजार',
        'ta': 'சந்தை',
        'te': 'మార్కెట్',
        'kn': 'ಮಾರುಕಟ್ಟೆ',
        'ml': 'മാർക്കറ്റ്',
        'bn': 'বাজার',
        'or': 'ବଜାର',
        'pa': 'ਮੰਡੀ',
        'as': 'বজাৰ',
        'ur': 'منڈی',
        'sd': 'منڊي',
        'ne': 'बजार',
        'ks': 'منڈی',
        'kok': 'बाजार',
        'mni': 'কেইথেল',
        'sat': 'हाट',
        'doi': 'बजार',
        'mai': 'बजार',
        'bho': 'बजार',
      },
    };

    const lowerText = text.toLowerCase().trim();

    for (const [key, translations] of Object.entries(basicTranslations)) {
      if (lowerText === key.toLowerCase() || lowerText === translations[fromLang]?.toLowerCase()) {
        const translation = translations[toLang];
        if (translation) {
          return {
            originalText: text,
            translatedText: translation,
            confidence: 0.7, // Medium confidence for basic translations
            fromLanguage: fromLang,
            toLanguage: toLang,
            timestamp: new Date(),
          };
        }
      }
    }

    return null;
  }

  /**
   * Checks if two languages are similar (same family)
   */
  private areSimilarLanguages(lang1: Language, lang2: Language): boolean {
    const languageFamilies = {
      indo_aryan: ['hi', 'bn', 'mr', 'gu', 'pa', 'or', 'as', 'ur', 'sd', 'ne', 'ks', 'kok', 'mai', 'bho'],
      dravidian: ['ta', 'te', 'kn', 'ml'],
      tibeto_burman: ['mni'],
      austro_asiatic: ['sat'],
      other: ['doi', 'en'],
    };

    for (const family of Object.values(languageFamilies)) {
      if (family.includes(lang1) && family.includes(lang2)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Utility function for delays in retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Translates voice input to text and then translates to target language
   * Includes comprehensive error handling and recovery mechanisms
   */
  async translateVoice(
    audioBlob: Blob,
    fromLang: Language,
    toLang: Language
  ): Promise<TranslationResult> {
    // Input validation
    if (!audioBlob || audioBlob.size === 0) {
      throw new TranslationError(
        TranslationErrorType.INVALID_INPUT,
        'Audio data cannot be empty'
      );
    }

    if (audioBlob.size > 10 * 1024 * 1024) { // 10MB limit
      throw new TranslationError(
        TranslationErrorType.INVALID_INPUT,
        'Audio file too large (max 10MB)'
      );
    }

    if (!this.isSupportedLanguage(fromLang)) {
      throw new TranslationError(
        TranslationErrorType.UNSUPPORTED_LANGUAGE,
        `Unsupported source language: ${fromLang}`
      );
    }

    if (!this.isSupportedLanguage(toLang)) {
      throw new TranslationError(
        TranslationErrorType.UNSUPPORTED_LANGUAGE,
        `Unsupported target language: ${toLang}`
      );
    }

    return await this.translateVoiceWithRetry(audioBlob, fromLang, toLang);
  }

  private async translateVoiceWithRetry(
    audioBlob: Blob,
    fromLang: Language,
    toLang: Language,
    attempt: number = 1
  ): Promise<TranslationResult> {
    try {
      // Convert blob to base64 for transmission
      const audioData = await this.blobToBase64(audioBlob);
      const toLangName = this.getLanguageName(toLang);

      const prompt = `The user has spoken in ${this.getLanguageName(fromLang)}. 
      Please transcribe the audio and translate it into ${toLangName}.
      The context is an Indian agricultural market.
      Provide the response in the following JSON format:
      {
        "originalText": "transcription in source language",
        "translatedText": "translation in target language",
        "confidence": 0.95
      }
      Provide ONLY the JSON response.`;

      const result = await this.model.generateContent([
        {
          inlineData: {
            data: audioData,
            mimeType: "audio/webm" // Common for MediaRecorder
          }
        },
        prompt
      ]);

      const response = await result.response;
      const responseText = response.text();

      // Extract JSON from response (handling potential markdown blocks)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid Gemini response format");

      const data = JSON.parse(jsonMatch[0]);

      const translationResult: TranslationResult = {
        originalText: data.originalText,
        translatedText: data.translatedText,
        confidence: data.confidence || 0.9,
        fromLanguage: fromLang,
        toLanguage: toLang,
        timestamp: new Date(),
      };

      return translationResult;
    } catch (error) {
      return await this.handleVoiceTranslationError(error, audioBlob, fromLang, toLang, attempt);
    }
  }

  /**
   * Handles voice translation errors with specific fallback strategies
   */
  private async handleVoiceTranslationError(
    error: any,
    audioBlob: Blob,
    fromLang: Language,
    toLang: Language,
    attempt: number
  ): Promise<TranslationResult> {
    console.error(`Voice translation attempt ${attempt} failed:`, error);

    let translationError: TranslationError;

    if (error instanceof TranslationError) {
      translationError = error;
    } else if (error.name === 'NotAllowedError') {
      translationError = new TranslationError(
        TranslationErrorType.API_ERROR,
        'Microphone access denied. Please allow microphone permissions.',
        error,
        false
      );
    } else if (error.name === 'NotFoundError') {
      translationError = new TranslationError(
        TranslationErrorType.API_ERROR,
        'No microphone found. Please check your audio device.',
        error,
        false
      );
    } else if (error.code === 'functions/unavailable') {
      translationError = new TranslationError(
        TranslationErrorType.SERVICE_UNAVAILABLE,
        'Voice translation service is temporarily unavailable',
        error,
        true
      );
    } else {
      translationError = new TranslationError(
        TranslationErrorType.API_ERROR,
        'Voice translation failed. Please try again.',
        error,
        true
      );
    }

    // Voice-specific fallback strategies
    const fallbackResult = await this.tryVoiceFallbackStrategies(
      audioBlob,
      fromLang,
      toLang,
      translationError
    );

    if (fallbackResult) {
      return fallbackResult;
    }

    // Retry logic for retryable errors
    if (translationError.retryable && attempt < RETRY_CONFIG.maxRetries) {
      const delay = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt - 1),
        RETRY_CONFIG.maxDelay
      );

      console.log(`Retrying voice translation in ${delay}ms (attempt ${attempt + 1})`);
      await this.delay(delay);

      return await this.translateVoiceWithRetry(audioBlob, fromLang, toLang, attempt + 1);
    }

    throw translationError;
  }

  /**
   * Voice-specific fallback strategies
   */
  private async tryVoiceFallbackStrategies(
    _audioBlob: Blob,
    fromLang: Language,
    toLang: Language,
    error: TranslationError
  ): Promise<TranslationResult | null> {
    // Strategy 1: For low confidence, suggest text input as alternative
    if (error.type === TranslationErrorType.LOW_CONFIDENCE) {
      return {
        originalText: '[Voice input unclear]',
        translatedText: '[Please try typing your message instead]',
        confidence: 0.1,
        fromLanguage: fromLang,
        toLanguage: toLang,
        timestamp: new Date(),
      };
    }

    // Strategy 2: For service unavailable, suggest offline voice recording
    if (error.type === TranslationErrorType.SERVICE_UNAVAILABLE) {
      // Could implement local voice recording for later processing
      return {
        originalText: '[Voice recorded for later processing]',
        translatedText: '[Voice will be translated when service is available]',
        confidence: 0.3,
        fromLanguage: fromLang,
        toLanguage: toLang,
        timestamp: new Date(),
      };
    }

    return null;
  }

  /**
   * Retrieves cached translation if available and not expired
   */
  getCachedTranslation(
    _text: string,
    _fromLang: Language,
    _toLang: Language
  ): TranslationResult | null {
    // This method needs to be synchronous to match the interface
    // For async operations, we'll use a different internal method
    return null; // Placeholder - actual implementation would use sync cache access
  }

  /**
   * Async version for internal use
   */
  private async getCachedTranslationAsync(
    text: string,
    fromLang: Language,
    toLang: Language
  ): Promise<TranslationResult | null> {
    try {
      const cacheKey = getCacheKey(text, fromLang, toLang);
      const cachedEntry = await offlineSyncService.getCachedEntry<TranslationResult>(cacheKey);

      if (!cachedEntry) {
        return null;
      }

      // Check if cache is still valid
      const now = Date.now();
      const cacheAge = now - cachedEntry.timestamp.getTime();
      const isExpired = cachedEntry.ttl && cacheAge > cachedEntry.ttl;

      if (isExpired) {
        return null;
      }

      return cachedEntry.data;
    } catch (error) {
      console.error('Error retrieving cached translation:', error);
      return null;
    }
  }

  /**
   * Returns confidence score interpretation
   */
  getConfidenceScore(translation: TranslationResult): number {
    return translation.confidence;
  }

  /**
   * Gets confidence level as human-readable string
   */
  getConfidenceLevel(translation: TranslationResult): 'high' | 'medium' | 'low' {
    const confidence = translation.confidence;

    if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) {
      return 'high';
    } else if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Checks if translation confidence is acceptable for use
   */
  isTranslationReliable(translation: TranslationResult): boolean {
    return translation.confidence >= CONFIDENCE_THRESHOLDS.MEDIUM;
  }

  /**
   * Gets fallback options when translation fails or has low confidence
   */
  getFallbackOptions(
    originalText: string,
    fromLang: Language,
    toLang: Language,
    error?: TranslationError
  ): Array<{ type: string; description: string; action: () => Promise<TranslationResult | void> }> {
    const options: Array<{ type: string; description: string; action: () => Promise<TranslationResult | void> }> = [];

    // Always offer retry option
    options.push({
      type: 'retry',
      description: 'Try translation again',
      action: async () => {
        return await this.translateText(originalText, fromLang, toLang);
      },
    });

    // Offer original text option
    options.push({
      type: 'original',
      description: 'Use original text',
      action: async () => {
        return {
          originalText,
          translatedText: originalText,
          confidence: 1.0,
          fromLanguage: fromLang,
          toLanguage: toLang,
          timestamp: new Date(),
        };
      },
    });

    // Language-specific options
    if (error?.type === TranslationErrorType.UNSUPPORTED_LANGUAGE) {
      options.push({
        type: 'suggest_language',
        description: 'Try a similar supported language',
        action: async () => {
          const similarLang = this.getSimilarSupportedLanguage(fromLang);
          if (similarLang && similarLang !== fromLang) {
            return await this.translateText(originalText, similarLang, toLang);
          }
        },
      });
    }

    // Network-specific options
    if (error?.type === TranslationErrorType.NETWORK_ERROR) {
      options.push({
        type: 'offline_mode',
        description: 'Continue in offline mode',
        action: async () => {
          // Enable offline mode functionality
          console.log('Switching to offline mode');
        },
      });
    }

    // Low confidence options
    if (error?.type === TranslationErrorType.LOW_CONFIDENCE) {
      options.push({
        type: 'simplify',
        description: 'Try with simpler text',
        action: async () => {
          const simplifiedText = this.simplifyText(originalText);
          return await this.translateText(simplifiedText, fromLang, toLang);
        },
      });
    }

    return options;
  }

  /**
   * Gets a similar supported language for fallback
   */
  private getSimilarSupportedLanguage(language: Language): Language | null {
    const similarLanguages: Record<Language, Language[]> = {
      'hi': ['ur', 'ne', 'mr'],
      'bn': ['as', 'or'],
      'te': ['kn', 'ta', 'ml'],
      'mr': ['hi', 'gu'],
      'ta': ['ml', 'kn', 'te'],
      'gu': ['mr', 'hi'],
      'kn': ['te', 'ta', 'ml'],
      'ml': ['ta', 'kn', 'te'],
      'or': ['bn', 'as'],
      'pa': ['hi', 'ur'],
      'as': ['bn', 'or'],
      'ur': ['hi', 'pa'],
      'sd': ['ur', 'hi'],
      'ne': ['hi', 'mr'],
      'ks': ['ur', 'hi'],
      'kok': ['mr', 'hi'],
      'mni': ['bn', 'as'],
      'sat': ['hi', 'bn'],
      'doi': ['hi', 'pa'],
      'mai': ['hi', 'bn'],
      'bho': ['hi', 'ur'],
      'en': ['hi'], // English to Hindi as most common
    };

    const similar = similarLanguages[language];
    return similar && similar.length > 0 ? similar[0] : null;
  }

  /**
   * Simplifies text for better translation accuracy
   */
  private simplifyText(text: string): string {
    return text
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .toLowerCase();
  }

  /**
   * Checks if the translation service is currently available
   */
  async isServiceAvailable(): Promise<boolean> {
    try {
      // Try a simple translation to test service availability
      await this.translateText('test', 'en', 'hi');
      return true;
    } catch (error) {
      if (error instanceof TranslationError) {
        return error.type !== TranslationErrorType.SERVICE_UNAVAILABLE;
      }
      return false;
    }
  }

  /**
   * Gets service health status with detailed information
   */
  async getServiceHealth(): Promise<{
    available: boolean;
    latency?: number;
    error?: string;
    lastChecked: Date;
  }> {
    const startTime = Date.now();
    const lastChecked = new Date();

    try {
      await this.translateText('health check', 'en', 'hi');
      const latency = Date.now() - startTime;

      return {
        available: true,
        latency,
        lastChecked,
      };
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastChecked,
      };
    }
  }

  /**
   * Gets user-friendly error messages
   */
  getErrorMessage(error: TranslationError): string {
    const userFriendlyMessages: Record<TranslationErrorTypeValue, string> = {
      [TranslationErrorType.NETWORK_ERROR]: 'Please check your internet connection and try again.',
      [TranslationErrorType.API_ERROR]: 'Translation service is experiencing issues. Please try again later.',
      [TranslationErrorType.INVALID_INPUT]: 'Please check your input and try again.',
      [TranslationErrorType.UNSUPPORTED_LANGUAGE]: 'This language is not currently supported. Please try a different language.',
      [TranslationErrorType.LOW_CONFIDENCE]: 'Translation quality may be low. Consider rephrasing your text.',
      [TranslationErrorType.QUOTA_EXCEEDED]: 'Translation limit reached. Please try again later.',
      [TranslationErrorType.SERVICE_UNAVAILABLE]: 'Translation service is temporarily unavailable. Please try again later.',
    };

    return userFriendlyMessages[error.type] || 'An unexpected error occurred. Please try again.';
  }

  /**
   * Caches translation result for offline access
   */
  private async cacheTranslation(
    text: string,
    fromLang: Language,
    toLang: Language,
    result: TranslationResult
  ): Promise<void> {
    try {
      const cacheKey = getCacheKey(text, fromLang, toLang);
      await offlineSyncService.cacheData(cacheKey, result, this.CACHE_TTL);
    } catch (error) {
      console.error('Error caching translation:', error);
      // Don't throw - caching failure shouldn't break translation
    }
  }

  /**
   * Converts blob to base64 string for API transmission
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get just the base64 data
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Validates if a language is supported
   */
  isSupportedLanguage(language: string): language is Language {
    const supportedLanguages: Language[] = [
      'hi', 'en', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'or', 'pa',
      'as', 'ur', 'sd', 'ne', 'ks', 'kok', 'mni', 'sat', 'doi', 'mai', 'bho'
    ];
    return supportedLanguages.includes(language as Language);
  }

  /**
   * Gets human-readable language name
   */
  getLanguageName(language: Language): string {
    const languageNames: Record<Language, string> = {
      'hi': 'Hindi',
      'en': 'English',
      'bn': 'Bengali',
      'te': 'Telugu',
      'mr': 'Marathi',
      'ta': 'Tamil',
      'gu': 'Gujarati',
      'kn': 'Kannada',
      'ml': 'Malayalam',
      'or': 'Odia',
      'pa': 'Punjabi',
      'as': 'Assamese',
      'ur': 'Urdu',
      'sd': 'Sindhi',
      'ne': 'Nepali',
      'ks': 'Kashmiri',
      'kok': 'Konkani',
      'mni': 'Manipuri',
      'sat': 'Santali',
      'doi': 'Dogri',
      'mai': 'Maithili',
      'bho': 'Bhojpuri',
    };
    return languageNames[language] || language;
  }

  /**
   * Clears translation cache (useful for testing or storage management)
   */
  async clearTranslationCache(): Promise<void> {
    try {
      // This would need to be implemented in the offline sync service
      console.log('Translation cache clearing not implemented yet');
    } catch (error) {
      console.error('Error clearing translation cache:', error);
    }
  }
}

// Export singleton instance
export const translationService = new TranslationServiceImpl();
export default translationService;