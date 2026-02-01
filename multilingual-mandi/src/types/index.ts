// Core Data Models for Multilingual Mandi Platform

// ============================================================================
// User and Authentication Types
// ============================================================================

export type UserRole = 'vendor' | 'buyer' | 'agent';
export type Language = 'hi' | 'en' | 'bn' | 'te' | 'mr' | 'ta' | 'gu' | 'kn' | 'ml' | 'or' | 'pa' | 'as' | 'ur' | 'sd' | 'ne' | 'ks' | 'kok' | 'mni' | 'sat' | 'doi' | 'mai' | 'bho';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface Location {
  state: string;
  district: string;
  city: string;
  pincode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  language: Language;
  location: Location;
  onboardingCompleted: boolean;
  verificationStatus: VerificationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  personalInfo: {
    name: string;
    phone: string;
    language: Language;
    location: Location;
  };
  businessInfo: {
    businessName?: string;
    commodities: string[];
    operatingRegions: Location[];
  };
  preferences: {
    notifications: NotificationPreferences;
    privacy: PrivacySettings;
  };
  trustData: {
    verificationStatus: VerificationStatus;
    trustScore: number;
    transactionHistory: TransactionSummary[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

// ============================================================================
// Translation and Communication Types
// ============================================================================

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  confidence: number;
  fromLanguage: Language;
  toLanguage: Language;
  timestamp: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: {
    originalText: string;
    originalLanguage: Language;
    translations: Map<Language, string>;
    messageType: 'text' | 'voice' | 'image' | 'document';
  };
  metadata: {
    timestamp: Date;
    readStatus: boolean;
    translationConfidence?: number;
    attachments?: Attachment[];
  };
  context?: {
    negotiationId?: string;
    dealId?: string;
    priceReference?: PriceData;
  };
}

export interface Attachment {
  id: string;
  type: 'image' | 'document' | 'audio';
  url: string;
  filename: string;
  size: number;
}

// ============================================================================
// Price Discovery and Market Data Types
// ============================================================================

export type QualityGrade = 'premium' | 'standard' | 'basic' | 'mixed';

export interface QualitySpec {
  parameter: string;
  value: string;
  unit?: string;
}

export interface PriceData {
  commodity: string;
  mandi: string;
  price: number;
  unit: string;
  quality: QualityGrade;
  timestamp: Date;
  source: string;
}

export interface PriceEntry {
  id: string;
  commodity: {
    name: string;
    category: string;
    variety?: string;
  };
  market: {
    mandiName: string;
    location: Location;
    marketCode: string;
  };
  pricing: {
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
    modalPrice: number;
    unit: string;
  };
  quality: {
    grade: QualityGrade;
    specifications: QualitySpec[];
  };
  temporal: {
    date: Date;
    session: 'morning' | 'evening';
    lastUpdated: Date;
  };
  source: {
    provider: string;
    reliability: number;
    verificationStatus: boolean;
  };
}

export interface PriceHistory {
  commodity: string;
  location: Location;
  data: Array<{
    date: Date;
    price: number;
    volume?: number;
  }>;
}

export interface PriceTrend {
  commodity: string;
  trend: 'rising' | 'falling' | 'stable';
  changePercent: number;
  timeframe: string;
}

export interface PriceAnomaly {
  id: string;
  commodity: string;
  detectedPrice: number;
  expectedRange: {
    min: number;
    max: number;
  };
  explanation: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
}

export interface DateRange {
  start: Date;
  end: Date;
}

// ============================================================================
// Negotiation and Deal Types
// ============================================================================

export type DealStatus = 'draft' | 'active' | 'negotiating' | 'agreed' | 'paid' | 'delivered' | 'completed' | 'disputed' | 'cancelled';
export type TransactionStatus = 'initiated' | 'negotiating' | 'agreed' | 'payment_pending' | 'paid' | 'in_transit' | 'delivered' | 'completed' | 'disputed' | 'cancelled';
export type PaymentMethod = 'upi' | 'bank_transfer' | 'cash' | 'credit' | 'wallet';

export interface DealProposal {
  commodity: string;
  quantity: number;
  unit: string;
  proposedPrice: number;
  quality: QualityGrade;
  deliveryLocation: Location;
  deliveryDate: Date;
  additionalTerms?: string;
}

export interface DealTerms {
  commodity: string;
  quantity: number;
  unit: string;
  agreedPrice: number;
  quality: QualityGrade;
  deliveryTerms: DeliveryTerms;
  paymentTerms: PaymentTerms;
  additionalConditions?: string[];
}

export interface DeliveryTerms {
  location: Location;
  expectedDate: Date;
  method: 'pickup' | 'delivery' | 'transport_arranged';
  cost: number;
  responsibility: 'buyer' | 'seller' | 'shared';
}

export interface PaymentTerms {
  method: PaymentMethod;
  schedule: 'immediate' | 'on_delivery' | 'partial' | 'credit';
  dueDate?: Date;
  advanceAmount?: number;
}

export interface Deal {
  id: string;
  buyerId: string;
  sellerId: string;
  commodity: string;
  quantity: number;
  agreedPrice: number;
  deliveryTerms: DeliveryTerms;
  status: DealStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Negotiation {
  id: string;
  dealProposal: DealProposal;
  participants: {
    buyer: string;
    seller: string;
    agent?: string;
  };
  messages: Message[];
  currentOffer: number;
  status: 'active' | 'agreed' | 'rejected' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}

export interface NegotiationSuggestion {
  suggestedPrice: number;
  reasoning: string;
  marketData: MarketComparison;
  confidence: number;
}

export interface MarketComparison {
  commodity: string;
  currentMarketPrice: number;
  priceRange: {
    min: number;
    max: number;
    average: number;
  };
  nearbyMarkets: Array<{
    mandi: string;
    price: number;
    distance: number;
  }>;
  trend: PriceTrend;
}

// ============================================================================
// Transaction and Payment Types
// ============================================================================

export interface Transaction {
  id: string;
  type: 'deal' | 'negotiation' | 'payment';
  participants: {
    buyer: string;
    seller: string;
    agent?: string;
  };
  commodity: {
    name: string;
    category: string;
    quality: QualityGrade;
    quantity: number;
    unit: string;
  };
  pricing: {
    initialOffer: number;
    finalPrice: number;
    marketPrice: number;
    pricePerUnit: number;
  };
  timeline: {
    initiated: Date;
    negotiated?: Date;
    agreed?: Date;
    paid?: Date;
    delivered?: Date;
    completed?: Date;
  };
  status: TransactionStatus;
  metadata: {
    location: Location;
    paymentMethod?: PaymentMethod;
    deliveryTerms?: DeliveryTerms;
  };
}

export interface TransactionSummary {
  id: string;
  type: 'buy' | 'sell';
  commodity: string;
  amount: number;
  date: Date;
  counterparty: string;
  rating?: number;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  amount: number;
  method: PaymentMethod;
  timestamp: Date;
}

export interface DeliveryStatus {
  dealId: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'delayed' | 'failed';
  trackingInfo?: {
    currentLocation: Location;
    estimatedDelivery: Date;
    updates: Array<{
      timestamp: Date;
      status: string;
      location: Location;
    }>;
  };
}

export interface Dispute {
  id: string;
  dealId: string;
  raisedBy: string;
  reason: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'escalated';
  resolution?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

// ============================================================================
// Trust System and Verification Types
// ============================================================================

export interface TrustIndicators {
  overallScore: number;
  transactionCount: number;
  averageRating: number;
  verificationBadges: VerificationBadge[];
  recentFeedback: Feedback[];
}

export interface VerificationBadge {
  type: 'identity' | 'business' | 'address' | 'phone' | 'email' | 'bank';
  verified: boolean;
  verifiedAt?: Date;
  expiresAt?: Date;
}

export interface VerificationDocument {
  type: 'aadhar' | 'pan' | 'gst' | 'license' | 'bank_statement';
  documentUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: Date;
}

export interface VerificationResult {
  success: boolean;
  documentsProcessed: number;
  verificationBadges: VerificationBadge[];
  pendingRequirements?: string[];
}

export interface Feedback {
  id: string;
  fromUserId: string;
  toUserId: string;
  dealId: string;
  rating: number; // 1-5
  comment?: string;
  categories: {
    communication: number;
    reliability: number;
    quality: number;
    timeliness: number;
  };
  createdAt: Date;
}

// ============================================================================
// Notification Types
// ============================================================================

export interface NotificationPreferences {
  priceAlerts: boolean;
  dealUpdates: boolean;
  newOpportunities: boolean;
  systemUpdates: boolean;
  marketingMessages: boolean;
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'verified_only' | 'private';
  showContactInfo: boolean;
  showTransactionHistory: boolean;
  allowDirectMessages: boolean;
  dataSharing: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'price_alert' | 'deal_update' | 'new_opportunity' | 'system_update' | 'marketing';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

export interface PriceAlert {
  id: string;
  userId: string;
  commodity: string;
  condition: 'above' | 'below' | 'change';
  threshold: number;
  location?: Location;
  active: boolean;
  createdAt: Date;
}

export interface DealUpdate {
  dealId: string;
  status: DealStatus;
  message: string;
  actionRequired?: boolean;
  actionUrl?: string;
}

// ============================================================================
// Offline Sync and Cache Types
// ============================================================================

export type ActionType = 'create_deal' | 'send_message' | 'update_profile' | 'rate_user' | 'create_negotiation';

export interface OfflineAction {
  id: string;
  type: ActionType;
  payload: any;
  timestamp: Date;
  retryCount: number;
}

export interface SyncResult {
  actionId: string;
  success: boolean;
  error?: string;
  syncedAt: Date;
}

export interface CacheEntry<T> {
  key: string;
  data: T;
  timestamp: Date;
  ttl?: number; // Time to live in milliseconds
  version: number;
}

// ============================================================================
// Admin and Moderation Types
// ============================================================================

export interface AdminUser {
  uid: string;
  role: 'admin' | 'moderator' | 'support';
  permissions: string[];
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  targetType: 'user' | 'deal' | 'price' | 'content';
  targetId: string;
  details: any;
  timestamp: Date;
}

export interface ContentReport {
  id: string;
  reporterId: string;
  targetType: 'user' | 'message' | 'deal';
  targetId: string;
  reason: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: Date;
  resolvedAt?: Date;
  resolution?: string;
}

// ============================================================================
// Service Interface Types
// ============================================================================

export type Unsubscribe = () => void;

export interface AuthService {
  signIn(email: string, password: string): Promise<AuthResult>;
  signUp(email: string, password: string, role: UserRole): Promise<AuthResult>;
  resetPassword(email: string): Promise<void>;
  signOut(): Promise<void>;
  getCurrentUser(): User | null;
  onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe;
}

export interface TranslationService {
  translateText(text: string, fromLang: Language, toLang: Language): Promise<TranslationResult>;
  translateVoice(audioBlob: Blob, fromLang: Language, toLang: Language): Promise<TranslationResult>;
  getCachedTranslation(text: string, fromLang: Language, toLang: Language): TranslationResult | null;
  getConfidenceScore(translation: TranslationResult): number;
}

export interface PriceDiscoveryService {
  getCurrentPrices(commodity: string, location?: Location): Promise<PriceData[]>;
  getHistoricalPrices(commodity: string, dateRange: DateRange): Promise<PriceHistory>;
  getPriceTrends(commodity: string): Promise<PriceTrend>;
  detectPriceAnomalies(prices: PriceData[]): PriceAnomaly[];
  subscribeToPriceUpdates(commodity: string, callback: (price: PriceData) => void): Unsubscribe;
}

export interface NegotiationService {
  startNegotiation(deal: DealProposal): Promise<Negotiation>;
  sendMessage(negotiationId: string, message: Message): Promise<void>;
  getSuggestedCounterOffer(negotiation: Negotiation, currentOffer: number): Promise<NegotiationSuggestion>;
  getMarketComparison(commodity: string, price: number): Promise<MarketComparison>;
  finalizeAgreement(negotiationId: string, terms: DealTerms): Promise<Deal>;
}

export interface DealManagementService {
  createDeal(terms: DealTerms): Promise<Deal>;
  updateDealStatus(dealId: string, status: DealStatus): Promise<void>;
  initializePayment(dealId: string, paymentMethod: PaymentMethod): Promise<PaymentResult>;
  trackDelivery(dealId: string): Promise<DeliveryStatus>;
  raiseDispute(dealId: string, reason: string): Promise<Dispute>;
}

export interface TrustService {
  getUserProfile(userId: string): Promise<UserProfile>;
  updateTrustScore(userId: string, transaction: Transaction): Promise<void>;
  verifyUser(userId: string, documents: VerificationDocument[]): Promise<VerificationResult>;
  reportUser(reporterId: string, reportedId: string, reason: string): Promise<void>;
  getTrustIndicators(userId: string): Promise<TrustIndicators>;
}

export interface OfflineSyncService {
  cacheData(key: string, data: any, ttl?: number): Promise<void>;
  getCachedData<T>(key: string): Promise<T | null>;
  queueAction(action: OfflineAction): Promise<void>;
  syncPendingActions(): Promise<SyncResult[]>;
  getLastSyncTime(): Date | null;
  isOnline(): boolean;
}

export interface NotificationService {
  sendPriceAlert(userId: string, priceAlert: PriceAlert): Promise<void>;
  sendDealUpdate(userId: string, dealUpdate: DealUpdate): Promise<void>;
  subscribeToNotifications(userId: string, preferences: NotificationPreferences): Promise<void>;
  getNotificationHistory(userId: string): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<void>;
}