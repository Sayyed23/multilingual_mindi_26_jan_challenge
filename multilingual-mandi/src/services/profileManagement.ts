// User Profile Management Service
// Handles profile update functionality with validation
// Implements profile retrieval and caching mechanisms
// Manages privacy controls and profile visibility settings

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  setDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { offlineSyncService } from './offlineSync';
import type {
  UserProfile,
  User,
  Language,
  Location,
  NotificationPreferences,
  PrivacySettings,
  VerificationStatus,
  UserRole,
  TransactionSummary
} from '../types';

interface ProfileUpdateData {
  personalInfo?: Partial<UserProfile['personalInfo']>;
  businessInfo?: Partial<UserProfile['businessInfo']>;
  preferences?: Partial<UserProfile['preferences']>;
}

interface ProfileValidationResult {
  isValid: boolean;
  errors: string[];
}

interface CachedProfile {
  profile: UserProfile;
  cachedAt: Date;
  ttl: number; // Time to live in milliseconds
}

class ProfileManagementService {
  private profileCache = new Map<string, CachedProfile>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly CACHE_KEY_PREFIX = 'profile_';

  // Profile retrieval with caching
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Check memory cache first
      const cached = this.profileCache.get(userId);
      if (cached && this.isCacheValid(cached)) {
        return cached.profile;
      }

      // Check offline cache
      const offlineCacheKey = `${this.CACHE_KEY_PREFIX}${userId}`;
      const offlineCached = await offlineSyncService.getCachedData<UserProfile>(offlineCacheKey);
      if (offlineCached) {
        this.updateMemoryCache(userId, offlineCached);
        return offlineCached;
      }

      // Fetch from Firestore
      const profile = await this.fetchProfileFromFirestore(userId);
      if (profile) {
        // Update both caches
        this.updateMemoryCache(userId, profile);
        await offlineSyncService.cacheData(offlineCacheKey, profile, this.CACHE_TTL);
      }

      return profile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Profile update with validation
  async updateUserProfile(userId: string, updateData: ProfileUpdateData): Promise<boolean> {
    try {
      // Validate update data
      const validation = this.validateProfileUpdate(updateData);
      if (!validation.isValid) {
        throw new Error(`Profile validation failed: ${validation.errors.join(', ')}`);
      }

      // Get current profile
      const currentProfile = await this.getUserProfile(userId);
      if (!currentProfile) {
        throw new Error('User profile not found');
      }

      // Merge update data with current profile
      const updatedProfile: UserProfile = {
        ...currentProfile,
        ...updateData.personalInfo && {
          personalInfo: { ...currentProfile.personalInfo, ...updateData.personalInfo }
        },
        ...updateData.businessInfo && {
          businessInfo: { ...currentProfile.businessInfo, ...updateData.businessInfo }
        },
        ...updateData.preferences && {
          preferences: {
            notifications: {
              ...currentProfile.preferences.notifications,
              ...updateData.preferences.notifications
            },
            privacy: {
              ...currentProfile.preferences.privacy,
              ...updateData.preferences.privacy
            }
          }
        },
        updatedAt: new Date()
      };

      // Update in Firestore
      const profileDoc = doc(db, 'userProfiles', userId);
      await updateDoc(profileDoc, {
        ...updateData.personalInfo && { personalInfo: updatedProfile.personalInfo },
        ...updateData.businessInfo && { businessInfo: updatedProfile.businessInfo },
        ...updateData.preferences && { preferences: updatedProfile.preferences },
        updatedAt: serverTimestamp()
      });

      // Update basic user document if personal info changed
      if (updateData.personalInfo?.language || updateData.personalInfo?.location) {
        const userDoc = doc(db, 'users', userId);
        await updateDoc(userDoc, {
          ...updateData.personalInfo.language && { language: updateData.personalInfo.language },
          ...updateData.personalInfo.location && { location: updateData.personalInfo.location },
          updatedAt: serverTimestamp()
        });
      }

      // Update caches
      this.updateMemoryCache(userId, updatedProfile);
      const cacheKey = `${this.CACHE_KEY_PREFIX}${userId}`;
      await offlineSyncService.cacheData(cacheKey, updatedProfile, this.CACHE_TTL);

      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Privacy controls management
  async updatePrivacySettings(userId: string, privacySettings: Partial<PrivacySettings>): Promise<boolean> {
    try {
      const currentProfile = await this.getUserProfile(userId);
      if (!currentProfile) {
        throw new Error('User profile not found');
      }

      const updatedPrivacySettings: PrivacySettings = {
        ...currentProfile.preferences.privacy,
        ...privacySettings
      };

      // Validate privacy settings
      if (!this.validatePrivacySettings(updatedPrivacySettings)) {
        throw new Error('Invalid privacy settings');
      }

      return await this.updateUserProfile(userId, {
        preferences: {
          privacy: updatedPrivacySettings
        }
      });
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      throw error;
    }
  }

  // Profile visibility management
  async updateProfileVisibility(userId: string, visibility: PrivacySettings['profileVisibility']): Promise<boolean> {
    try {
      if (!['public', 'verified_only', 'private'].includes(visibility)) {
        throw new Error('Invalid profile visibility setting');
      }

      return await this.updatePrivacySettings(userId, { profileVisibility: visibility });
    } catch (error) {
      console.error('Error updating profile visibility:', error);
      throw error;
    }
  }

  // Notification preferences management
  async updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<boolean> {
    try {
      const currentProfile = await this.getUserProfile(userId);
      if (!currentProfile) {
        throw new Error('User profile not found');
      }

      const updatedPreferences: NotificationPreferences = {
        ...currentProfile.preferences.notifications,
        ...preferences,
        channels: {
          ...currentProfile.preferences.notifications.channels,
          ...preferences.channels
        }
      };

      return await this.updateUserProfile(userId, {
        preferences: {
          notifications: updatedPreferences
        }
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  // Business information management
  async updateBusinessInfo(userId: string, businessInfo: Partial<UserProfile['businessInfo']>): Promise<boolean> {
    try {
      // Validate business info
      if (businessInfo.commodities && !Array.isArray(businessInfo.commodities)) {
        throw new Error('Commodities must be an array');
      }

      if (businessInfo.operatingRegions && !Array.isArray(businessInfo.operatingRegions)) {
        throw new Error('Operating regions must be an array');
      }

      return await this.updateUserProfile(userId, { businessInfo });
    } catch (error) {
      console.error('Error updating business info:', error);
      throw error;
    }
  }

  // Get profiles by visibility settings (for search/discovery)
  async getVisibleProfiles(requestingUserId: string, filters?: {
    role?: UserRole;
    location?: Partial<Location>;
    commodities?: string[];
  }): Promise<UserProfile[]> {
    try {
      const requestingUserProfile = await this.getUserProfile(requestingUserId);
      if (!requestingUserProfile) {
        return [];
      }

      // Build query based on requesting user's verification status
      const profilesRef = collection(db, 'userProfiles');
      let profileQuery = query(profilesRef);

      // Apply visibility filters
      if (requestingUserProfile.trustData.verificationStatus === 'verified') {
        // Verified users can see public and verified_only profiles
        profileQuery = query(profilesRef, where('preferences.privacy.profileVisibility', 'in', ['public', 'verified_only']));
      } else {
        // Unverified users can only see public profiles
        profileQuery = query(profilesRef, where('preferences.privacy.profileVisibility', '==', 'public'));
      }

      const querySnapshot = await getDocs(profileQuery);
      let profiles: UserProfile[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        profiles.push({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as UserProfile);
      });

      // Apply additional filters
      if (filters) {
        profiles = profiles.filter(profile => {
          if (filters.role && profile.role !== filters.role) return false;
          
          if (filters.location) {
            const locationMatch = Object.entries(filters.location).every(([key, value]) => 
              profile.personalInfo.location[key as keyof Location] === value
            );
            if (!locationMatch) return false;
          }

          if (filters.commodities && filters.commodities.length > 0) {
            const hasMatchingCommodity = filters.commodities.some(commodity =>
              profile.businessInfo.commodities.includes(commodity)
            );
            if (!hasMatchingCommodity) return false;
          }

          return true;
        });
      }

      return profiles;
    } catch (error) {
      console.error('Error getting visible profiles:', error);
      return [];
    }
  }

  // Clear profile cache
  clearProfileCache(userId?: string): void {
    if (userId) {
      this.profileCache.delete(userId);
    } else {
      this.profileCache.clear();
    }
  }

  // Private helper methods

  private async fetchProfileFromFirestore(userId: string): Promise<UserProfile | null> {
    try {
      const profileDoc = doc(db, 'userProfiles', userId);
      const docSnap = await getDoc(profileDoc);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching profile from Firestore:', error);
      return null;
    }
  }

  private updateMemoryCache(userId: string, profile: UserProfile): void {
    this.profileCache.set(userId, {
      profile,
      cachedAt: new Date(),
      ttl: this.CACHE_TTL
    });
  }

  private isCacheValid(cached: CachedProfile): boolean {
    const now = new Date().getTime();
    const cacheTime = cached.cachedAt.getTime();
    return (now - cacheTime) < cached.ttl;
  }

  private validateProfileUpdate(updateData: ProfileUpdateData): ProfileValidationResult {
    const errors: string[] = [];

    // Validate personal info
    if (updateData.personalInfo) {
      const { name, phone, language, location } = updateData.personalInfo;

      if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
        errors.push('Name must be a non-empty string');
      }

      if (phone !== undefined && (typeof phone !== 'string' || !this.isValidPhone(phone))) {
        errors.push('Phone number must be valid');
      }

      if (language !== undefined && !this.isValidLanguage(language)) {
        errors.push('Invalid language code');
      }

      if (location !== undefined && !this.isValidLocation(location)) {
        errors.push('Invalid location data');
      }
    }

    // Validate business info
    if (updateData.businessInfo) {
      const { businessName, commodities, operatingRegions } = updateData.businessInfo;

      if (businessName !== undefined && typeof businessName !== 'string') {
        errors.push('Business name must be a string');
      }

      if (commodities !== undefined && (!Array.isArray(commodities) || commodities.some(c => typeof c !== 'string'))) {
        errors.push('Commodities must be an array of strings');
      }

      if (operatingRegions !== undefined && (!Array.isArray(operatingRegions) || operatingRegions.some(r => !this.isValidLocation(r)))) {
        errors.push('Operating regions must be an array of valid locations');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validatePrivacySettings(settings: PrivacySettings): boolean {
    const validVisibilityOptions = ['public', 'verified_only', 'private'];
    return (
      validVisibilityOptions.includes(settings.profileVisibility) &&
      typeof settings.showContactInfo === 'boolean' &&
      typeof settings.showTransactionHistory === 'boolean' &&
      typeof settings.allowDirectMessages === 'boolean' &&
      typeof settings.dataSharing === 'boolean'
    );
  }

  private isValidPhone(phone: string): boolean {
    // Basic phone validation - can be enhanced based on requirements
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,15}$/;
    return phoneRegex.test(phone.trim());
  }

  private isValidLanguage(language: Language): boolean {
    const validLanguages: Language[] = [
      'hi', 'en', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'or', 'pa', 
      'as', 'ur', 'sd', 'ne', 'ks', 'kok', 'mni', 'sat', 'doi', 'mai', 'bho'
    ];
    return validLanguages.includes(language);
  }

  private isValidLocation(location: Location): boolean {
    return (
      typeof location.state === 'string' &&
      typeof location.district === 'string' &&
      typeof location.city === 'string' &&
      typeof location.pincode === 'string' &&
      location.pincode.length >= 5 &&
      location.pincode.length <= 10
    );
  }
}

// Export singleton instance
export const profileManagementService = new ProfileManagementService();

// Export the class for testing
export { ProfileManagementService };
export type { ProfileUpdateData, ProfileValidationResult };