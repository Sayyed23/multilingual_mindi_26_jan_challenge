/**
 * API request/response type definitions for the Multilingual Mandi platform
 * Supports all API interactions across the application
 */

import { User, UserRegistration, UserUpdate, AuthUser } from './user';
import { Commodity, CommoditySearchFilter, CommoditySearchResult } from './commodity';
import { PriceQuery, PriceData, PriceRange, PriceVerification, PriceTrend, PriceSubmission } from './price';
import { Message, Conversation, ConversationFilter, MessageSearchResult } from './message';
import { Deal, DealSummary, NegotiationSession, Offer, DealFilter, DealMetrics } from './deal';
import { TranslationRequest, TranslationResponse, VoiceTranslationRequest, VoiceTranslationResponse } from './translation';

// Base API Response Structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: Date;
  requestId: string;
  pagination?: PaginationInfo;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  field?: string; // for validation errors
  statusCode: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Authentication API Types
export interface LoginRequest {
  phoneNumber: string;
  otp?: string;
  deviceInfo?: {
    deviceId: string;
    platform: string;
    version: string;
  };
}

export interface LoginResponse {
  user: AuthUser;
  isNewUser: boolean;
  otpSent?: boolean;
  expiresIn: number; // token expiry in seconds
}

export interface OtpRequest {
  phoneNumber: string;
  purpose: 'login' | 'registration' | 'verification';
}

export interface OtpResponse {
  sent: boolean;
  expiresIn: number; // in seconds
  attemptsRemaining: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// User API Types
export interface CreateUserRequest extends UserRegistration { }

export interface CreateUserResponse {
  user: User;
  authTokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface UpdateUserRequest extends UserUpdate { }

export interface GetUserResponse {
  user: User;
}

export interface GetUsersRequest extends PaginationRequest {
  userType?: 'vendor' | 'buyer' | 'both';
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  verified?: boolean;
  searchQuery?: string;
}

export interface GetUsersResponse {
  users: User[];
}

// Commodity API Types
export interface GetCommoditiesRequest extends PaginationRequest {
  category?: string;
  subcategory?: string;
  searchQuery?: string;
  language?: string;
}

export interface GetCommoditiesResponse {
  commodities: Commodity[];
}

export interface SearchCommoditiesRequest extends CommoditySearchFilter, PaginationRequest {
  query: string;
  language?: string;
}

export interface SearchCommoditiesResponse {
  results: import('../types/commodity').CommoditySearchResult[];
  total: number;
  suggestions: string[];
  filters: {
    categories: string[];
    locations: string[];
    priceRanges: { min: number; max: number }[];
  };
}

// Price API Types
export interface GetPricesRequest extends PriceQuery, PaginationRequest { }

export interface GetPricesResponse {
  prices: PriceData[];
  priceRange: PriceRange;
  marketTrend: string;
  lastUpdated: Date;
}

export interface SubmitPriceRequest extends PriceSubmission { }

export interface SubmitPriceResponse {
  priceId: string;
  status: 'accepted' | 'pending_validation' | 'rejected';
  reason?: string;
}

export interface VerifyPriceRequest {
  commodityId: string;
  quotedPrice: number;
  quantity: number;
  unit: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface VerifyPriceResponse extends PriceVerification { }

export interface GetPriceTrendRequest {
  commodityId: string;
  period: '24h' | '7d' | '30d' | '90d' | '1y';
  location?: {
    latitude: number;
    longitude: number;
    radius?: number;
  };
}

export interface GetPriceTrendResponse extends PriceTrend { }

// Message API Types
export interface SendMessageRequest {
  conversationId?: string; // create new if not provided
  receiverId: string;
  content: string;
  messageType: 'text' | 'voice' | 'image' | 'offer';
  attachments?: File[];
  replyToMessageId?: string;
  autoTranslate?: boolean;
}

export interface SendMessageResponse {
  message: Message;
  conversationId: string;
}

export interface GetConversationsRequest extends PaginationRequest {
  filter?: ConversationFilter;
}

export interface GetConversationsResponse {
  conversations: Conversation[];
}

export interface GetMessagesRequest extends PaginationRequest {
  conversationId: string;
  before?: Date;
  after?: Date;
}

export interface GetMessagesResponse {
  messages: Message[];
  conversation: Conversation;
}

export interface SearchMessagesRequest extends PaginationRequest {
  query: string;
  conversationId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SearchMessagesResponse {
  results: MessageSearchResult[];
}

// Deal API Types
export interface CreateDealRequest {
  vendorId: string;
  buyerId: string;
  commodityId: string;
  quantity: number;
  unit: string;
  agreedPrice: number;
  qualitySpec: any;
  paymentTerms: any;
  deliveryTerms: any;
  negotiationSessionId?: string;
}

export interface CreateDealResponse {
  deal: Deal;
}

export interface GetDealsRequest extends PaginationRequest {
  filter?: DealFilter;
}

export interface GetDealsResponse {
  deals: DealSummary[];
}

export interface GetDealResponse {
  deal: Deal;
}

export interface UpdateDealRequest {
  dealId: string;
  status?: string;
  paymentUpdate?: any;
  deliveryUpdate?: any;
  notes?: string;
}

export interface UpdateDealResponse {
  deal: Deal;
}

export interface GetDealMetricsRequest {
  userId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  commodityId?: string;
}

export interface GetDealMetricsResponse extends DealMetrics { }

// Negotiation API Types
export interface StartNegotiationRequest {
  vendorId: string;
  buyerId: string;
  commodityId: string;
  quantity: number;
  unit: string;
  initialOffer?: number;
}

export interface StartNegotiationResponse {
  session: NegotiationSession;
}

export interface MakeOfferRequest {
  sessionId: string;
  price: number;
  quantity?: number;
  conditions?: string[];
  validUntil?: Date;
}

export interface MakeOfferResponse {
  offer: Offer;
  session: NegotiationSession;
  aiSuggestion?: {
    recommendation: string;
    confidence: number;
    marketComparison: any;
  };
}

export interface RespondToOfferRequest {
  offerId: string;
  response: 'accept' | 'reject' | 'counter';
  counterOffer?: {
    price: number;
    quantity?: number;
    conditions?: string[];
  };
  reason?: string;
}

export interface RespondToOfferResponse {
  offer: Offer;
  session: NegotiationSession;
  dealCreated?: Deal;
}

// Translation API Types
export interface TranslateTextRequest extends TranslationRequest { }

export interface TranslateTextResponse extends TranslationResponse { }

export interface TranslateVoiceRequest extends VoiceTranslationRequest { }

export interface TranslateVoiceResponse extends VoiceTranslationResponse { }

export interface DetectLanguageRequest {
  text: string;
}

export interface DetectLanguageResponse {
  detectedLanguage: string;
  confidence: number;
  alternatives: {
    language: string;
    confidence: number;
  }[];
}

// Search API Types
export interface GlobalSearchRequest extends PaginationRequest {
  query: string;
  type?: 'all' | 'commodities' | 'users' | 'deals' | 'messages';
  filters?: {
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
  };
  language?: string;
}

export interface GlobalSearchResponse {
  results: {
    type: 'commodity' | 'user' | 'deal' | 'message';
    item: any;
    relevanceScore: number;
    highlightedContent?: string;
  }[];
  suggestions?: string[];
  totalResults: number;
}

// Analytics API Types
export interface GetAnalyticsRequest {
  userId?: string;
  type: 'user' | 'market' | 'platform';
  period: '24h' | '7d' | '30d' | '90d' | '1y';
  metrics?: string[];
}

export interface GetAnalyticsResponse {
  metrics: {
    [key: string]: {
      value: number;
      change: number;
      trend: 'up' | 'down' | 'stable';
      data?: any[];
    };
  };
  insights: {
    title: string;
    description: string;
    actionable: boolean;
    priority: 'low' | 'medium' | 'high';
  }[];
}

// File Upload Types
export interface FileUploadRequest {
  file: File;
  type: 'profile_picture' | 'document' | 'voice_message' | 'product_image';
  metadata?: {
    [key: string]: any;
  };
}

export interface FileUploadResponse {
  fileId: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

// WebSocket Event Types
export interface WebSocketEvent<T = any> {
  type: string;
  data: T;
  timestamp: Date;
  userId?: string;
  conversationId?: string;
  dealId?: string;
}

export interface TypingEvent {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface MessageEvent {
  message: Message;
  conversationId: string;
}

export interface DealUpdateEvent {
  deal: Deal;
  updateType: 'status_change' | 'payment_update' | 'delivery_update';
  updatedBy: string;
}

export interface PriceUpdateEvent {
  commodityId: string;
  newPrice: PriceData;
  priceChange: {
    amount: number;
    percentage: number;
  };
}