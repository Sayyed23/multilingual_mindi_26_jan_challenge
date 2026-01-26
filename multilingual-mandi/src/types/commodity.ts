/**
 * Commodity-related type definitions for the Multilingual Mandi platform
 * Supports Requirements: 2.1, 7.1, 7.2
 */

export interface CommodityTranslation {
  name: string;
  aliases: string[];
  description?: string;
}

export interface CommoditySeasonality {
  peakMonths: number[]; // 1-12 representing months
  offSeasonMonths: number[];
  harvestMonths?: number[];
}

export interface QualityGrade {
  grade: string;
  description: string;
  priceMultiplier: number; // Multiplier for base price
}

export interface Commodity {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  standardUnit: string;
  alternativeUnits: string[];
  seasonality: CommoditySeasonality;
  qualityGrades: QualityGrade[];
  storageRequirements: string[];
  shelfLife?: number; // in days
  perishable: boolean;
  translations: {
    [languageCode: string]: CommodityTranslation;
  };
  metadata: {
    hsCode?: string; // Harmonized System Code
    agmarknetCode?: string;
    commonNames: string[];
    scientificName?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CommodityCategory {
  id: string;
  name: string;
  description: string;
  subcategories: CommoditySubcategory[];
  translations: {
    [languageCode: string]: {
      name: string;
      description: string;
    };
  };
}

export interface CommoditySubcategory {
  id: string;
  name: string;
  description: string;
  parentCategoryId: string;
  commodityIds: string[];
  translations: {
    [languageCode: string]: {
      name: string;
      description: string;
    };
  };
}

export interface CommoditySearchFilter {
  category?: string;
  subcategory?: string;
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in km
  };
  seasonality?: 'peak' | 'off-season' | 'harvest';
  perishable?: boolean;
  qualityGrades?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface CommoditySearchResult {
  commodity: Commodity;
  relevanceScore: number;
  availableVendors: number;
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  nearestLocation: string;
  distance?: number; // in km
}

export type CommodityUnit = 
  | 'kg' | 'quintal' | 'ton' | 'gram'
  | 'liter' | 'ml' | 'piece' | 'dozen'
  | 'bag' | 'sack' | 'box' | 'crate';