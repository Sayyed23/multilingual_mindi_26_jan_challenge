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