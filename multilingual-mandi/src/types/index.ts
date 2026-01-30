// Core data models for the Multilingual Mandi PWA
// Based on the design document specifications

export type UserRole = 'vendor' | 'buyer' | 'commission_agent';
export type TransactionStatus = 'initiated' | 'negotiating' | 'agreed' | 'delivered' | 'completed' | 'disputed' | 'cancelled';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';
export type MessageType = 'text' | 'voice' | 'negotiation_offer';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface Location {
  state: string;
  district: string;
  mandis: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  timezone: string;
}

export interface MeasurementUnits {
  weight: string; // 'kg' | 'quintal' | 'ton'
  volume: string; // 'liter' | 'gallon'
  area: string; // 'acre' | 'hectare'
}

export interface NotificationSettings {
  priceAlerts: boolean;
  negotiationUpdates: boolean;
  marketNews: boolean;
  smsBackup: boolean;
}

export interface PrivacySettings {
  showLocation: boolean;
  showTransactionHistory: boolean;
  allowDataCollection: boolean;
}

export interface QualityGrade {
  name: string;
  description: string;
  priceMultiplier: number;
}

export interface SeasonalPattern {
  peakMonths: number[];
  lowMonths: number[];
  averageYield: number;
}

export interface StorageInfo {
  temperature: string;
  humidity: string;
  shelfLife: number; // days
}

export interface LanguageTranslations {
  [languageCode: string]: string;
}

export interface DataSource {
  name: string;
  type: 'government' | 'private' | 'cooperative';
  reliability: number; // 0-1
  lastUpdated: Date;
}

export interface DeliveryTerms {
  method: string;
  location: string;
  timeframe: string;
  cost: number;
}

export interface PaymentTerms {
  method: string;
  schedule: string;
  advancePercentage: number;
}

export interface Rating {
  score: number; // 1-5
  comment?: string;
  timestamp: Date;
}

export interface Attachment {
  id: string;
  type: 'image' | 'document' | 'audio';
  url: string;
  size: number;
}

export interface CulturalNorms {
  bargainingStyle: string;
  commonPhrases: string[];
  respectfulApproach: string;
}

// Core Entity Interfaces

export interface User {
  id: string;
  phoneNumber: string;
  role: UserRole;
  profile: {
    name: string;
    location: Location;
    primaryLanguage: string;
    secondaryLanguages: string[];
    commodityInterests: string[];
    businessType: string;
    verificationStatus: VerificationStatus;
  };
  reputation: {
    score: number;
    totalTransactions: number;
    successfulDeals: number;
    averageRating: number;
    badges: string[];
  };
  preferences: {
    units: MeasurementUnits;
    currency: string;
    notifications: NotificationSettings;
    privacy: PrivacySettings;
  };
  createdAt: Date;
  lastActive: Date;
}

export interface Commodity {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  standardUnits: string[];
  qualityGrades: QualityGrade[];
  seasonality: SeasonalPattern;
  storageRequirements: StorageInfo;
  translations: LanguageTranslations;
  marketClassification: string;
}

export interface PriceRecord {
  id: string;
  commodityId: string;
  price: number;
  unit: string;
  currency: string;
  qualityGrade: string;
  location: Location;
  source: DataSource;
  timestamp: Date;
  volume?: number;
  confidence: number;
  metadata: {
    weatherConditions?: string;
    marketConditions?: string;
    seasonalFactor?: number;
  };
}

export interface NegotiationStep {
  id: string;
  timestamp: Date;
  userId: string;
  action: 'offer' | 'counter_offer' | 'accept' | 'reject' | 'message';
  amount?: number;
  message?: string;
}

export interface Transaction {
  id: string;
  vendorId: string;
  buyerId: string;
  commodityId: string;
  details: {
    quantity: number;
    unit: string;
    qualityGrade: string;
    agreedPrice: number;
    totalAmount: number;
    deliveryTerms: DeliveryTerms;
    paymentTerms: PaymentTerms;
  };
  negotiationHistory: NegotiationStep[];
  status: TransactionStatus;
  ratings: {
    vendorRating?: Rating;
    buyerRating?: Rating;
  };
  timestamps: {
    initiated: Date;
    agreed: Date;
    delivered?: Date;
    completed?: Date;
  };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: {
    originalText: string;
    originalLanguage: string;
    translatedText?: string;
    targetLanguage?: string;
    messageType: MessageType;
  };
  metadata: {
    translationConfidence?: number;
    speechToTextConfidence?: number;
    attachments?: Attachment[];
  };
  timestamp: Date;
  status: MessageStatus;
}

export interface Conversation {
  id: string;
  participants: string[]; // User IDs
  lastMessage?: Message;
  lastActivity: Date;
  isActive: boolean;
  transactionId?: string;
}

// Supporting interfaces for search and discovery
export interface SearchFilters {
  priceRange?: {
    min: number;
    max: number;
  };
  locationRadius?: number;
  qualityGrades?: string[];
  vendorTypes?: UserRole[];
  availability?: boolean;
}

export interface SearchResult {
  id: string;
  type: 'commodity' | 'vendor' | 'transaction';
  title: string;
  description: string;
  relevanceScore: number;
  metadata: Record<string, any>;
}

// Negotiation context for AI assistant
export interface NegotiationContext {
  commodity: string;
  quantity: number;
  qualityGrade: string;
  marketPrice: {
    min: number;
    max: number;
    average: number;
  };
  regionalNorms: CulturalNorms;
  userProfiles: {
    vendor: Partial<User>;
    buyer: Partial<User>;
  };
  negotiationHistory: NegotiationStep[];
}

// Cache and sync interfaces for offline functionality
export interface CacheEntry<T> {
  id: string;
  data: T;
  timestamp: Date;
  expiresAt?: Date;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  entityId: string;
  data: any;
  timestamp: Date;
  retryCount: number;
  status: 'pending' | 'completed' | 'failed';
}

// Database schema version for migrations
export interface DatabaseSchema {
  version: number;
  stores: {
    [storeName: string]: {
      keyPath: string;
      autoIncrement?: boolean;
      indexes?: {
        [indexName: string]: {
          keyPath: string | string[];
          unique?: boolean;
        };
      };
    };
  };
}