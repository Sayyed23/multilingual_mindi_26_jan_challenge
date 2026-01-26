/**
 * User-related type definitions for the Multilingual Mandi platform
 * Supports Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

export type UserType = 'vendor' | 'buyer' | 'both';

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  pincode: string;
  state: string;
  district?: string;
  mandiName?: string;
}

export interface BusinessInfo {
  businessName: string;
  businessType: string;
  gstNumber?: string;
  specializations: string[];
  operatingHours: string;
  verificationDocuments: string[];
}

export interface ReputationScore {
  overall: number; // 1-5 scale
  punctuality: number; // 1-5 scale
  communication: number; // 1-5 scale
  productQuality: number; // 1-5 scale
  totalTransactions: number;
  reviewCount: number;
  lastUpdated: Date;
}

export interface User {
  id: string;
  phoneNumber: string;
  name: string;
  email?: string;
  preferredLanguage: string;
  userType: UserType;
  location: Location;
  businessProfile?: BusinessInfo;
  reputation: ReputationScore;
  isVerified: boolean;
  isPhoneVerified: boolean;
  isBusinessVerified: boolean;
  profilePicture?: string;
  createdAt: Date;
  lastActiveAt: Date;
  settings: UserSettings;
}

export interface UserSettings {
  notifications: {
    deals: boolean;
    messages: boolean;
    priceAlerts: boolean;
    marketUpdates: boolean;
  };
  privacy: {
    showPhoneNumber: boolean;
    showLocation: boolean;
    allowDirectMessages: boolean;
  };
  language: {
    preferred: string;
    fallback: string;
    autoTranslate: boolean;
  };
}

export interface UserProfile {
  userId: string;
  phoneNumber: string;
  name: string;
  preferredLanguage: string;
  userType: UserType;
  businessInfo?: BusinessInfo;
  reputation: ReputationScore;
  isVerified: boolean;
  location: Location;
}

export interface AuthUser {
  id: string;
  phoneNumber: string;
  name: string;
  userType: UserType;
  isVerified: boolean;
  preferredLanguage: string;
  profilePicture?: string; // Added for UI display
  accessToken: string;
  refreshToken: string;
}

export interface UserRegistration {
  phoneNumber: string;
  name: string;
  preferredLanguage: string;
  userType: UserType;
  location: Location;
  businessInfo?: Partial<BusinessInfo>;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  preferredLanguage?: string;
  location?: Partial<Location>;
  businessProfile?: Partial<BusinessInfo>;
  settings?: Partial<UserSettings>;
  profilePicture?: string;
}