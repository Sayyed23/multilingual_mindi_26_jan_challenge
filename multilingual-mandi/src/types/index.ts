/**
 * Main types export file for the Multilingual Mandi platform
 * Provides centralized access to all type definitions
 */

// Import types for internal use
import type { SupportedLanguage } from './translation';
import type { CommodityUnit } from './commodity';

// User types
export type {
  UserType,
  Location,
  BusinessInfo,
  ReputationScore,
  User,
  UserSettings,
  UserProfile,
  AuthUser,
  UserRegistration,
  UserUpdate,
} from './user';

// Commodity types
export type {
  CommodityTranslation,
  CommoditySeasonality,
  QualityGrade,
  Commodity,
  CommodityCategory,
  CommoditySubcategory,
  CommoditySearchFilter,
  CommoditySearchResult,
  CommodityUnit,
} from './commodity';

// Price types
export type {
  PriceSource,
  MarketTrend,
  DemandLevel,
  PriceLocation,
  PriceMetadata,
  PriceEntry,
  PriceRange,
  PriceQuery,
  PriceData,
  MarketContext,
  PriceAlert,
  PriceVerification,
  PriceTrend,
  PriceSubmission,
} from './price';

// Message types
export type {
  MessageType,
  MessageStatus,
  ConversationStatus,
  MessageAttachment,
  TranslationData,
  VoiceData,
  OfferData,
  Message,
  Conversation,
  MessageDraft,
  TypingIndicator,
  MessageReaction,
  ConversationFilter,
  MessageSearchResult,
} from './message';

// Deal types
export type {
  DealStatus,
  PaymentMethod,
  PaymentStatus,
  DeliveryMethod,
  PaymentTerms,
  DeliveryTerms,
  QualitySpecification,
  AuditEntry,
  Deal,
  DealSummary,
  NegotiationSession,
  Offer,
  DealFilter,
  DealMetrics,
  DisputeReason,
  Dispute,
} from './deal';

// Translation types
export type {
  SupportedLanguage,
  TranslationContext,
  TranslationQuality,
  LanguageInfo,
  TranslationRequest,
  TranslationResponse,
  VoiceTranslationRequest,
  VoiceTranslationResponse,
  MandiVocabulary,
  TranslationCache,
  TranslationFeedback,
  LanguageDetectionResult,
  TranslationMetrics,
  TranslationSettings,
} from './translation';

// Review and reputation types
export type {
  ReviewCategory,
  ReviewRating,
  Review,
  ReviewSummary,
  ReviewSubmission,
  ReviewFilter,
  TransactionHistory,
  ReputationMetrics,
  ReviewResponse,
} from './review';

// API types
export type {
  ApiResponse,
  ApiError,
  PaginationInfo,
  PaginationRequest,
  LoginRequest,
  LoginResponse,
  OtpRequest,
  OtpResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  GetUserResponse,
  GetUsersRequest,
  GetUsersResponse,
  GetCommoditiesRequest,
  GetCommoditiesResponse,
  SearchCommoditiesRequest,
  SearchCommoditiesResponse,
  GetPricesRequest,
  GetPricesResponse,
  SubmitPriceRequest,
  SubmitPriceResponse,
  VerifyPriceRequest,
  VerifyPriceResponse,
  GetPriceTrendRequest,
  GetPriceTrendResponse,
  SendMessageRequest,
  SendMessageResponse,
  GetConversationsRequest,
  GetConversationsResponse,
  GetMessagesRequest,
  GetMessagesResponse,
  SearchMessagesRequest,
  SearchMessagesResponse,
  CreateDealRequest,
  CreateDealResponse,
  GetDealsRequest,
  GetDealsResponse,
  GetDealResponse,
  UpdateDealRequest,
  UpdateDealResponse,
  GetDealMetricsRequest,
  GetDealMetricsResponse,
  StartNegotiationRequest,
  StartNegotiationResponse,
  MakeOfferRequest,
  MakeOfferResponse,
  RespondToOfferRequest,
  RespondToOfferResponse,
  TranslateTextRequest,
  TranslateTextResponse,
  TranslateVoiceRequest,
  TranslateVoiceResponse,
  DetectLanguageRequest,
  DetectLanguageResponse,
  GlobalSearchRequest,
  GlobalSearchResponse,
  GetAnalyticsRequest,
  GetAnalyticsResponse,
  FileUploadRequest,
  FileUploadResponse,
  WebSocketEvent,
  TypingEvent,
  MessageEvent,
  DealUpdateEvent,
  PriceUpdateEvent,
} from './api';

// Type guards and validators
export {
  TypeGuards,
  Validators,
  type ValidationResult,
} from './guards';

// Validation schemas and utilities
export {
  ValidationRules,
  ValidationMessages,
  ValidationUtils,
  UserRegistrationSchema,
  MessageSchema,
  PriceSubmissionSchema,
  DealCreationSchema,
  FileUploadSchema,
  type ValidationSchema,
} from './schemas';

// Common utility types
export type ID = string;
export type Timestamp = Date;
export type Currency = 'INR' | 'USD' | 'EUR';
export type PhoneNumber = string;
export type EmailAddress = string;
export type URL = string;
export type Base64String = string;

// Status types used across the application
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'error' | 'offline';
export type ConnectionStatus = 'online' | 'offline' | 'connecting' | 'reconnecting';

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  userId?: string;
  context?: {
    component?: string;
    action?: string;
    data?: any;
  };
}

export interface NetworkError extends AppError {
  statusCode?: number;
  retryable: boolean;
  retryAfter?: number;
}

export interface ValidationError extends AppError {
  field: string;
  value: any;
  constraint: string;
}

// Configuration types
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  translation: {
    defaultLanguage: SupportedLanguage;
    fallbackLanguage: SupportedLanguage;
    confidenceThreshold: number;
    cacheEnabled: boolean;
    offlineEnabled: boolean;
  };
  price: {
    refreshInterval: number; // in minutes
    cacheExpiry: number; // in minutes
    maxDataAge: number; // in hours
    confidenceThreshold: number;
  };
  messaging: {
    maxMessageLength: number;
    maxAttachmentSize: number; // in bytes
    supportedFileTypes: string[];
    autoTranslate: boolean;
  };
  offline: {
    maxCacheSize: number; // in MB
    syncInterval: number; // in minutes
    maxRetryAttempts: number;
    conflictResolution: 'client' | 'server' | 'manual';
  };
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    badge: boolean;
  };
}

// Feature flags
export interface FeatureFlags {
  voiceTranslation: boolean;
  offlineMode: boolean;
  priceAlerts: boolean;
  negotiationAI: boolean;
  analytics: boolean;
  darkMode: boolean;
  betaFeatures: boolean;
}

// Theme types
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      bold: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

// Device and platform types
export interface DeviceInfo {
  platform: 'web' | 'android' | 'ios';
  version: string;
  userAgent: string;
  screenSize: {
    width: number;
    height: number;
  };
  networkType: '2g' | '3g' | '4g' | '5g' | 'wifi' | 'unknown';
  isOnline: boolean;
  language: string;
  timezone: string;
}

// Analytics types
export interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  deviceInfo: DeviceInfo;
}

export interface UserSession {
  id: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  pageViews: number;
  events: AnalyticsEvent[];
  deviceInfo: DeviceInfo;
}

// Search types
export interface SearchFilters {
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  categories?: string[];
  languages?: SupportedLanguage[];
  verified?: boolean;
  rating?: {
    min: number;
    max: number;
  };
}

export interface SearchResult<T = any> {
  item: T;
  type: string;
  relevanceScore: number;
  highlightedContent?: string;
  metadata?: Record<string, any>;
}

// Notification types
export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, any>;
  actions?: {
    action: string;
    title: string;
    icon?: string;
  }[];
}

export interface PushNotification {
  id: string;
  userId: string;
  type: 'message' | 'deal' | 'price_alert' | 'system';
  payload: NotificationPayload;
  scheduled?: Date;
  sent?: Date;
  read?: Date;
  clicked?: Date;
  dismissed?: Date;
}

// Utility types
export type {
  Optional,
  RequiredFields,
  Nullable,
  Maybe,
  DeepPartial,
  DeepRequired,
  AsyncData,
  CachedData,
  FormField,
  FormState,
  EventHandler,
  AsyncEventHandler,
  ComponentSize,
  ComponentVariant,
  ComponentState,
  Mapper,
  Filter,
  Reducer,
  Comparator,
  TimeUnit,
  Duration,
  DateRange,
  TimeWindow,
  Coordinates,
  BoundingBox,
  GeofenceRegion,
  FileType,
  FileInfo,
  MediaDimensions,
  AudioMetadata,
  VideoMetadata,
  ImageMetadata,
  NetworkQuality,
  ConnectionType,
  NetworkInfo,
  StorageType,
  StorageItem,
  StorageQuota,
  PermissionName,
  PermissionState,
  Permission,
  LocaleCode,
  TranslationKey,
  TranslationValues,
  LocalizedString,
  NumberFormat,
  DateFormat,
  PerformanceMetric,
  PerformanceMark,
  ErrorInfo,
  ErrorReport,
  MockData,
  TestScenario,
} from './utils';

// Utility functions
export { TypeUtils } from './utils';

// Export constants
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  'hi', 'en', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'or',
  'pa', 'as', 'ur', 'sd', 'ne', 'si', 'my', 'dz', 'ks', 'kok',
  'mni', 'sat', 'doi', 'bho', 'mai', 'mag', 'sck'
];

export const COMMODITY_UNITS: CommodityUnit[] = [
  'kg', 'quintal', 'ton', 'gram',
  'liter', 'ml', 'piece', 'dozen',
  'bag', 'sack', 'box', 'crate'
];

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc' as const,
};

export const API_ENDPOINTS = {
  AUTH: '/auth',
  USERS: '/users',
  COMMODITIES: '/commodities',
  PRICES: '/prices',
  MESSAGES: '/messages',
  DEALS: '/deals',
  NEGOTIATIONS: '/negotiations',
  TRANSLATIONS: '/translations',
  SEARCH: '/search',
  ANALYTICS: '/analytics',
  FILES: '/files',
} as const;