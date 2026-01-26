/**
 * Price-related type definitions for the Multilingual Mandi platform
 * Supports Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { Location } from './user';

export type PriceSource = 'agmarknet' | 'vendor_submission' | 'predicted' | 'manual';
export type MarketTrend = 'rising' | 'falling' | 'stable' | 'volatile';
export type DemandLevel = 'low' | 'medium' | 'high' | 'very_high';

export interface PriceLocation {
  mandiName: string;
  district: string;
  state: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  marketType: 'wholesale' | 'retail' | 'farmer_market' | 'online';
}

export interface PriceMetadata {
  weatherConditions?: string;
  marketConditions?: string;
  volume?: number; // quantity traded
  qualityGrade?: string;
  harvestSeason?: boolean;
  festivalSeason?: boolean;
  transportCost?: number;
  storageAvailable?: boolean;
  // Freshness indicators
  isStale?: boolean;
  ageInHours?: number;
  freshnessIndicator?: 'fresh' | 'aging' | 'stale';
  // Additional metadata fields
  minPrice?: number;
  maxPrice?: number;
  state?: string;
  district?: string;
  market?: string;
}

export interface PriceEntry {
  id: string;
  commodityId: string;
  commodityName: string;
  price: number;
  unit: string;
  location: PriceLocation;
  source: PriceSource;
  quality: string;
  timestamp: Date;
  confidence: number; // 0-1 scale
  validatedBy?: string;
  validatedAt?: Date;
  metadata: PriceMetadata;
  expiresAt?: Date;
}

export interface PriceRange {
  min: number;
  max: number;
  average: number;
  median: number;
  mode?: number;
  standardDeviation: number;
  fairPriceRange: {
    lower: number;
    upper: number;
    confidence: number;
  };
  confidenceInterval?: {
    lower: number;
    upper: number;
    level: number; // e.g., 0.95 for 95% confidence
  };
  sampleSize: number;
  lastUpdated: Date;
}

export interface PriceQuery {
  commodity?: string;
  location?: {
    latitude: number;
    longitude: number;
    radius?: number; // km, default 50
  };
  dateRange?: {
    start: Date;
    end: Date;
  };
  sources?: PriceSource[];
  qualityGrades?: string[];
  minConfidence?: number;
  limit?: number;
}

export interface PriceData {
  commodity: string;
  commodityId: string;
  price: number;
  unit: string;
  location: string;
  source: PriceSource;
  timestamp: Date;
  confidence: number;
  marketTrend: MarketTrend;
  priceChange: {
    amount: number;
    percentage: number;
    period: '24h' | '7d' | '30d';
  };
  quality?: string;
  metadata?: PriceMetadata;
}

export interface MarketContext {
  currentMarketPrice: number;
  priceRange: PriceRange;
  seasonalTrend: string;
  demandLevel: DemandLevel;
  supplyLevel: DemandLevel;
  marketVolatility: number; // 0-1 scale
  competitorCount: number;
  nearbyMarkets: PriceLocation[];
  historicalAverage: {
    '7d': number;
    '30d': number;
    '90d': number;
    '1y': number;
  };
}

export interface PriceAlert {
  id: string;
  userId: string;
  commodityId: string;
  targetPrice: number;
  condition: 'above' | 'below' | 'equals';
  tolerance: number; // percentage
  location?: {
    latitude: number;
    longitude: number;
    radius?: number;
  };
  radius?: number; // km
  isActive: boolean;
  createdAt: Date;
  triggeredAt?: Date;
  notificationSent: boolean;
}

export interface PriceVerification {
  quotedPrice: number;
  marketPrice: number;
  deviation: {
    amount: number;
    percentage: number;
  };
  verdict: 'fair' | 'high' | 'low' | 'very_high' | 'very_low';
  confidence: number;
  comparableMarkets: PriceData[];
  negotiationSuggestion: string;
  lastUpdated: Date;
}

export interface PriceTrend {
  commodityId: string;
  period: '24h' | '7d' | '30d' | '90d' | '1y';
  dataPoints: {
    date: Date;
    price: number;
    volume?: number;
  }[];
  trend: MarketTrend;
  volatility: number;
  seasonalPattern?: {
    peakMonths: number[];
    lowMonths: number[];
  };
  forecast?: {
    nextWeek: number;
    nextMonth: number;
    confidence: number;
  };
}

export interface PriceSubmission {
  commodityId: string;
  price: number;
  unit: string;
  quality: string;
  quantity: number;
  location: PriceLocation;
  vendorId: string;
  timestamp: Date;
  metadata?: Partial<PriceMetadata>;
  validUntil?: Date;
}