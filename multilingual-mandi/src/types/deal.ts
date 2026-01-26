/**
 * Deal and transaction-related type definitions for the Multilingual Mandi platform
 * Supports Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 3.1, 3.2, 3.3
 */

import { Location } from './user';
import { MarketContext } from './price';

export type DealStatus = 
  | 'negotiating' 
  | 'agreed' 
  | 'confirmed' 
  | 'payment_pending'
  | 'in_transit' 
  | 'delivered' 
  | 'completed' 
  | 'disputed' 
  | 'cancelled'
  | 'expired';

export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'credit' | 'escrow';
export type PaymentStatus = 'pending' | 'partial' | 'completed' | 'failed' | 'refunded';
export type DeliveryMethod = 'pickup' | 'delivery' | 'shipping' | 'self_transport';

export interface PaymentTerms {
  method: PaymentMethod;
  dueDate: Date;
  advanceAmount?: number;
  advancePercentage?: number;
  installments?: {
    amount: number;
    dueDate: Date;
    description: string;
  }[];
  lateFee?: number;
  currency: string;
}

export interface DeliveryTerms {
  method: DeliveryMethod;
  pickupLocation?: Location;
  deliveryLocation?: Location;
  expectedDate: Date;
  deliveryWindow?: {
    start: Date;
    end: Date;
  };
  transportCost?: number;
  packagingRequirements?: string[];
  insuranceRequired?: boolean;
  specialInstructions?: string;
}

export interface QualitySpecification {
  grade: string;
  description: string;
  inspectionRequired: boolean;
  qualityParameters: {
    [parameter: string]: {
      value: string | number;
      unit?: string;
      tolerance?: number;
    };
  };
  sampleRequired?: boolean;
  certificationRequired?: boolean;
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  action: string;
  performedBy: string;
  details: {
    [key: string]: any;
  };
  previousState?: any;
  newState?: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface Deal {
  id: string;
  vendorId: string;
  buyerId: string;
  commodityId: string;
  commodityName: string;
  quantity: number;
  unit: string;
  agreedPrice: number;
  totalAmount: number;
  qualitySpec: QualitySpecification;
  status: DealStatus;
  paymentTerms: PaymentTerms;
  deliveryTerms: DeliveryTerms;
  negotiationSessionId?: string;
  conversationId: string;
  createdAt: Date;
  updatedAt: Date;
  agreedAt?: Date;
  completedAt?: Date;
  expiresAt?: Date;
  auditTrail: AuditEntry[];
  metadata: {
    marketContext?: MarketContext;
    negotiationRounds?: number;
    originalAskingPrice?: number;
    finalDiscount?: number;
    referenceNumber: string;
    tags?: string[];
  };
}

export interface DealSummary {
  id: string;
  commodityName: string;
  quantity: number;
  unit: string;
  totalAmount: number;
  status: DealStatus;
  counterpartyName: string;
  counterpartyId: string;
  createdAt: Date;
  expectedDelivery?: Date;
  isVendor: boolean; // true if current user is vendor
}

export interface NegotiationSession {
  id: string;
  dealId?: string; // created after successful negotiation
  vendorId: string;
  buyerId: string;
  commodityId: string;
  commodityName: string;
  initialQuantity: number;
  currentQuantity: number;
  unit: string;
  offers: Offer[];
  currentOffer?: Offer;
  marketContext: MarketContext;
  status: 'active' | 'paused' | 'completed' | 'cancelled' | 'expired';
  startedAt: Date;
  lastActivityAt: Date;
  completedAt?: Date;
  expiresAt: Date;
  metadata: {
    negotiationRounds: number;
    averageResponseTime: number; // in minutes
    culturalContext?: string;
    communicationLanguages: string[];
  };
}

export interface Offer {
  id: string;
  sessionId: string;
  offeredBy: string; // user ID
  offerType: 'initial' | 'counter' | 'final' | 'compromise';
  price: number;
  quantity: number;
  conditions: string[];
  qualitySpec?: Partial<QualitySpecification>;
  deliveryTerms?: Partial<DeliveryTerms>;
  paymentTerms?: Partial<PaymentTerms>;
  validUntil: Date;
  timestamp: Date;
  response?: {
    status: 'accepted' | 'rejected' | 'countered';
    respondedBy: string;
    respondedAt: Date;
    reason?: string;
  };
  aiSuggestion?: {
    confidence: number;
    reasoning: string;
    marketComparison: {
      isAboveMarket: boolean;
      deviation: number;
      recommendation: string;
    };
  };
}

export interface DealFilter {
  status?: DealStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  commodityId?: string;
  counterpartyId?: string;
  amountRange?: {
    min: number;
    max: number;
  };
  userRole?: 'vendor' | 'buyer';
  searchQuery?: string;
}

export interface DealMetrics {
  totalDeals: number;
  completedDeals: number;
  totalValue: number;
  averageDealValue: number;
  successRate: number; // percentage of completed deals
  averageNegotiationTime: number; // in hours
  topCommodities: {
    commodityId: string;
    commodityName: string;
    dealCount: number;
    totalValue: number;
  }[];
  monthlyTrend: {
    month: string;
    dealCount: number;
    totalValue: number;
  }[];
}

export interface DisputeReason {
  category: 'quality' | 'quantity' | 'delivery' | 'payment' | 'other';
  description: string;
  evidence?: string[]; // URLs to supporting documents/images
}

export interface Dispute {
  id: string;
  dealId: string;
  raisedBy: string;
  reason: DisputeReason;
  status: 'open' | 'under_review' | 'resolved' | 'escalated';
  createdAt: Date;
  resolvedAt?: Date;
  resolution?: {
    decision: string;
    compensationAmount?: number;
    resolvedBy: string;
    notes: string;
  };
  messages: {
    id: string;
    senderId: string;
    content: string;
    timestamp: Date;
    attachments?: string[];
  }[];
}