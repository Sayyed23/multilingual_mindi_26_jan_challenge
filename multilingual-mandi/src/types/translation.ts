/**
 * Translation-related type definitions for the Multilingual Mandi platform
 * Supports Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

export type SupportedLanguage = 
  | 'hi' | 'en' | 'bn' | 'te' | 'mr' | 'ta' | 'gu' | 'kn' | 'ml' | 'or'
  | 'pa' | 'as' | 'ur' | 'sd' | 'ne' | 'si' | 'my' | 'dz' | 'ks' | 'kok'
  | 'mni' | 'sat' | 'doi' | 'bho' | 'mai' | 'mag' | 'sck';

export type TranslationContext = 'general' | 'mandi' | 'negotiation' | 'technical' | 'legal';
export type TranslationQuality = 'high' | 'medium' | 'low' | 'failed';

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  script: string;
  direction: 'ltr' | 'rtl';
  region: string[];
  speakers: number; // approximate number of speakers
  isSupported: boolean;
  hasVoiceSupport: boolean;
  hasKeyboard: boolean;
}

export interface TranslationRequest {
  text: string;
  sourceLanguage?: SupportedLanguage; // Auto-detect if not provided
  targetLanguage: SupportedLanguage;
  context: TranslationContext;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  userId?: string;
  sessionId?: string;
  metadata?: {
    messageId?: string;
    conversationId?: string;
    dealId?: string;
  };
}

export interface TranslationResponse {
  translatedText: string;
  confidence: number; // 0-1 scale
  sourceLanguageDetected: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  quality: TranslationQuality;
  requiresReview: boolean;
  alternativeTranslations?: string[];
  processingTime: number; // in milliseconds
  translationEngine: string;
  timestamp: Date;
  metadata: {
    wordCount: number;
    characterCount: number;
    complexityScore: number; // 0-1 scale
    contextMatches: number;
    vocabularyMatches: number;
  };
}

export interface VoiceTranslationRequest {
  audioData: Blob;
  sourceLanguage?: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  context: TranslationContext;
  quality?: 'low' | 'medium' | 'high'; // audio quality
  userId?: string;
  sessionId?: string;
}

export interface VoiceTranslationResponse {
  transcription: string;
  transcriptionConfidence: number;
  translatedText: string;
  translationConfidence: number;
  sourceLanguageDetected: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  audioUrl?: string; // URL to synthesized audio
  processingTime: number;
  requiresReview: boolean;
  metadata: {
    audioDuration: number; // in seconds
    audioQuality: number; // 0-1 scale
    backgroundNoise: number; // 0-1 scale
    speechRate: number; // words per minute
  };
}

export interface MandiVocabulary {
  term: string;
  category: 'commodity' | 'unit' | 'quality' | 'process' | 'location' | 'general';
  translations: {
    [language in SupportedLanguage]?: {
      primary: string;
      alternatives: string[];
      context?: string;
      usage?: string;
    };
  };
  confidence: number;
  frequency: number; // usage frequency
  lastUpdated: Date;
}

export interface TranslationCache {
  id: string;
  sourceText: string;
  sourceLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  translatedText: string;
  confidence: number;
  context: TranslationContext;
  hitCount: number;
  createdAt: Date;
  lastUsed: Date;
  expiresAt: Date;
}

export interface TranslationFeedback {
  translationId: string;
  userId: string;
  rating: number; // 1-5 scale
  feedback: 'accurate' | 'partially_accurate' | 'inaccurate' | 'inappropriate';
  suggestedCorrection?: string;
  context?: string;
  timestamp: Date;
}

export interface LanguageDetectionResult {
  detectedLanguage: SupportedLanguage;
  confidence: number;
  alternativeLanguages: {
    language: SupportedLanguage;
    confidence: number;
  }[];
  processingTime: number;
  textLength: number;
}

export interface TranslationMetrics {
  totalTranslations: number;
  averageConfidence: number;
  languagePairs: {
    source: SupportedLanguage;
    target: SupportedLanguage;
    count: number;
    averageConfidence: number;
  }[];
  contextDistribution: {
    [context in TranslationContext]: number;
  };
  qualityDistribution: {
    [quality in TranslationQuality]: number;
  };
  averageProcessingTime: number;
  cacheHitRate: number;
  userSatisfactionScore: number;
}

export interface TranslationSettings {
  autoTranslate: boolean;
  preferredLanguage: SupportedLanguage;
  fallbackLanguage: SupportedLanguage;
  showOriginalText: boolean;
  confidenceThreshold: number; // minimum confidence for auto-translation
  enableVoiceTranslation: boolean;
  enableOfflineTranslation: boolean;
  cacheTranslations: boolean;
  showAlternatives: boolean;
}