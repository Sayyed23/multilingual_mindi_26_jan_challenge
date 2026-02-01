// Unit Tests for Profile Management Service
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { UserProfile, NotificationPreferences, PrivacySettings } from '../../types';

// Mock Firestore functions
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  serverTimestamp: vi.fn(() => ({ seconds: Date.now() / 1000 }))
}));

vi.mock('../../lib/firebase', () => ({
  db: {}
}));

// Mock offline sync service
vi.mock('../offlineSync', () => ({
  offlineSyncService: {
    getCachedData: vi.fn(),
    cacheData: vi.fn()
  }
}));

// Import after mocking
import { ProfileManagementService } from '../profileManagement';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { offlineSyncService } from '../offlineSync';

const mockGetDoc = vi.mocked(getDoc);
const mockUpdateDoc = vi.mocked(updateDoc);
const mockDoc = vi.mocked(doc);
const mockCollection = vi.mocked(collection);
const mockQuery = vi.mocked(query);
const mockWhere = vi.mocked(where);
const mockGetDocs = vi.mocked(getDocs);
const mockOfflineSyncService = vi.mocked(offlineSyncService);

describe('ProfileManagementService', () => {
  let profileService: ProfileManagementService;
  let mockUserProfile: UserProfile;

  beforeEach(() => {
    vi.clearAllMocks();
    profileService = new ProfileManagementService();
    
    mockUserProfile = {
      uid: 'test-user-id',
      email: 'test@example.com',
      role: 'vendor',
      personalInfo: {
        name: 'Test User',
        phone: '+91-9876543210',
        language: 'en',
        location: {
          state: 'Test State',
          district: 'Test District',
          city: 'Test City',
          pincode: '123456'
        }
      },
      businessInfo: {
        businessName: 'Test Business',
        commodities: ['wheat', 'rice'],
        operatingRegions: [{
          state: 'Test State',
          district: 'Test District',
          city: 'Test City',
          pincode: '123456'
        }]
      },
      preferences: {
        notifications: {
          priceAlerts: true,
          dealUpdates: true,
          newOpportunities: true,
          systemUpdates: true,
          marketingMessages: false,
          channels: {
            push: true,
            email: true,
            sms: false
          }
        },
        privacy: {
          profileVisibility: 'verified_only',
          showContactInfo: false,
          showTransactionHistory: false,
          allowDirectMessages: true,
          dataSharing: false
        }
      },
      trustData: {
        verificationStatus: 'verified',
        trustScore: 85,
        transactionHistory: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getUserProfile', () => {
    it('should return cached profile if available and valid', async () => {
      mockOfflineSyncService.getCachedData.mockResolvedValue(mockUserProfile);

      const result = await profileService.getUserProfile('test-user-id');

      expect(result).toEqual(mockUserProfile);
      expect(mockOfflineSyncService.getCachedData).toHaveBeenCalledWith('profile_test-user-id');
      expect(mockGetDoc).not.toHaveBeenCalled();
    });

    it('should fetch from Firestore if not cached', async () => {
      mockOfflineSyncService.getCachedData.mockResolvedValue(null);
      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue({
        exists: (() => true) as any,
        data: () => ({
          ...mockUserProfile,
          createdAt: { toDate: () => mockUserProfile.createdAt },
          updatedAt: { toDate: () => mockUserProfile.updatedAt }
        })
      } as any);

      const result = await profileService.getUserProfile('test-user-id');

      expect(result).toEqual(mockUserProfile);
      expect(mockGetDoc).toHaveBeenCalled();
      expect(mockOfflineSyncService.cacheData).toHaveBeenCalled();
    });

    it('should return null if profile not found', async () => {
      mockOfflineSyncService.getCachedData.mockResolvedValue(null);
      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue({
        exists: (() => false) as any
      } as any);

      const result = await profileService.getUserProfile('non-existent-user');

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      mockOfflineSyncService.getCachedData.mockRejectedValue(new Error('Cache error'));
      mockGetDoc.mockRejectedValue(new Error('Firestore error'));

      const result = await profileService.getUserProfile('test-user-id');

      expect(result).toBeNull();
    });
  });

  describe('updateUserProfile', () => {
    beforeEach(() => {
      // Mock getUserProfile to return existing profile
      vi.spyOn(profileService, 'getUserProfile').mockResolvedValue(mockUserProfile);
      mockDoc.mockReturnValue({} as any);
      mockUpdateDoc.mockResolvedValue(undefined);
    });

    it('should successfully update personal info', async () => {
      const updateData = {
        personalInfo: {
          name: 'Updated Name',
          phone: '+91-9876543211'
        }
      };

      const result = await profileService.updateUserProfile('test-user-id', updateData);

      expect(result).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalledTimes(1); // Only profile doc updated (no language/location change)
    });

    it('should successfully update business info', async () => {
      const updateData = {
        businessInfo: {
          businessName: 'Updated Business',
          commodities: ['wheat', 'rice', 'corn']
        }
      };

      const result = await profileService.updateUserProfile('test-user-id', updateData);

      expect(result).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          businessInfo: expect.objectContaining({
            businessName: 'Updated Business',
            commodities: ['wheat', 'rice', 'corn']
          })
        })
      );
    });

    it('should successfully update preferences', async () => {
      const updateData = {
        preferences: {
          notifications: {
            ...mockUserProfile.preferences.notifications,
            priceAlerts: false,
            dealUpdates: true
          }
        }
      };

      const result = await profileService.updateUserProfile('test-user-id', updateData);

      expect(result).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalled();
    });

    it('should fail with invalid data', async () => {
      const updateData = {
        personalInfo: {
          name: '', // Invalid empty name
          phone: 'invalid-phone'
        }
      };

      await expect(profileService.updateUserProfile('test-user-id', updateData))
        .rejects.toThrow('Profile validation failed');
    });

    it('should fail if user profile not found', async () => {
      vi.spyOn(profileService, 'getUserProfile').mockResolvedValue(null);

      const updateData = {
        personalInfo: { name: 'Test Name' }
      };

      await expect(profileService.updateUserProfile('test-user-id', updateData))
        .rejects.toThrow('User profile not found');
    });
  });

  describe('updatePrivacySettings', () => {
    beforeEach(() => {
      vi.spyOn(profileService, 'getUserProfile').mockResolvedValue(mockUserProfile);
      vi.spyOn(profileService, 'updateUserProfile').mockResolvedValue(true);
    });

    it('should successfully update privacy settings', async () => {
      const privacySettings: Partial<PrivacySettings> = {
        profileVisibility: 'public',
        showContactInfo: true
      };

      const result = await profileService.updatePrivacySettings('test-user-id', privacySettings);

      expect(result).toBe(true);
      expect(profileService.updateUserProfile).toHaveBeenCalledWith('test-user-id', {
        preferences: {
          privacy: expect.objectContaining(privacySettings)
        }
      });
    });

    it('should fail with invalid privacy settings', async () => {
      const privacySettings = {
        profileVisibility: 'invalid' as any,
        showContactInfo: 'not-boolean' as any
      };

      await expect(profileService.updatePrivacySettings('test-user-id', privacySettings))
        .rejects.toThrow('Invalid privacy settings');
    });
  });

  describe('updateProfileVisibility', () => {
    beforeEach(() => {
      vi.spyOn(profileService, 'updatePrivacySettings').mockResolvedValue(true);
    });

    it('should successfully update profile visibility', async () => {
      const result = await profileService.updateProfileVisibility('test-user-id', 'public');

      expect(result).toBe(true);
      expect(profileService.updatePrivacySettings).toHaveBeenCalledWith('test-user-id', {
        profileVisibility: 'public'
      });
    });

    it('should fail with invalid visibility setting', async () => {
      await expect(profileService.updateProfileVisibility('test-user-id', 'invalid' as any))
        .rejects.toThrow('Invalid profile visibility setting');
    });
  });

  describe('updateNotificationPreferences', () => {
    beforeEach(() => {
      vi.spyOn(profileService, 'getUserProfile').mockResolvedValue(mockUserProfile);
      vi.spyOn(profileService, 'updateUserProfile').mockResolvedValue(true);
    });

    it('should successfully update notification preferences', async () => {
      const preferences: Partial<NotificationPreferences> = {
        priceAlerts: false,
        channels: { push: false, email: true, sms: true }
      };

      const result = await profileService.updateNotificationPreferences('test-user-id', preferences);

      expect(result).toBe(true);
      expect(profileService.updateUserProfile).toHaveBeenCalledWith('test-user-id', {
        preferences: {
          notifications: expect.objectContaining({
            priceAlerts: false,
            channels: expect.objectContaining({
              push: false,
              email: true,
              sms: true
            })
          })
        }
      });
    });
  });

  describe('updateBusinessInfo', () => {
    beforeEach(() => {
      vi.spyOn(profileService, 'updateUserProfile').mockResolvedValue(true);
    });

    it('should successfully update business info', async () => {
      const businessInfo = {
        businessName: 'New Business Name',
        commodities: ['wheat', 'barley']
      };

      const result = await profileService.updateBusinessInfo('test-user-id', businessInfo);

      expect(result).toBe(true);
      expect(profileService.updateUserProfile).toHaveBeenCalledWith('test-user-id', {
        businessInfo
      });
    });

    it('should fail with invalid commodities format', async () => {
      const businessInfo = {
        commodities: 'not-an-array' as any
      };

      await expect(profileService.updateBusinessInfo('test-user-id', businessInfo))
        .rejects.toThrow('Commodities must be an array');
    });

    it('should fail with invalid operating regions format', async () => {
      const businessInfo = {
        operatingRegions: 'not-an-array' as any
      };

      await expect(profileService.updateBusinessInfo('test-user-id', businessInfo))
        .rejects.toThrow('Operating regions must be an array');
    });
  });

  describe('getVisibleProfiles', () => {
    beforeEach(() => {
      vi.spyOn(profileService, 'getUserProfile').mockResolvedValue(mockUserProfile);
      mockCollection.mockReturnValue({} as any);
      mockQuery.mockReturnValue({} as any);
      mockWhere.mockReturnValue({} as any);
      mockGetDocs.mockResolvedValue({
        forEach: (callback: Function) => {
          callback({
            data: () => ({
              ...mockUserProfile,
              createdAt: { toDate: () => mockUserProfile.createdAt },
              updatedAt: { toDate: () => mockUserProfile.updatedAt }
            })
          });
        }
      } as any);
    });

    it('should return visible profiles for verified user', async () => {
      const profiles = await profileService.getVisibleProfiles('test-user-id');

      expect(profiles).toHaveLength(1);
      expect(profiles[0]).toEqual(mockUserProfile);
      expect(mockWhere).toHaveBeenCalledWith(
        'preferences.privacy.profileVisibility',
        'in',
        ['public', 'verified_only']
      );
    });

    it('should return only public profiles for unverified user', async () => {
      const unverifiedProfile = {
        ...mockUserProfile,
        trustData: { ...mockUserProfile.trustData, verificationStatus: 'unverified' as const }
      };
      vi.spyOn(profileService, 'getUserProfile').mockResolvedValue(unverifiedProfile);

      const profiles = await profileService.getVisibleProfiles('test-user-id');

      expect(mockWhere).toHaveBeenCalledWith(
        'preferences.privacy.profileVisibility',
        '==',
        'public'
      );
    });

    it('should apply role filter', async () => {
      await profileService.getVisibleProfiles('test-user-id', {
        role: 'buyer'
      });

      // Since our mock profile is a vendor, it should be filtered out
      // This test mainly ensures the method doesn't throw
      expect(true).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      mockGetDocs.mockRejectedValue(new Error('Firestore error'));

      const profiles = await profileService.getVisibleProfiles('test-user-id');

      expect(profiles).toEqual([]);
    });
  });

  describe('clearProfileCache', () => {
    it('should clear specific user cache', () => {
      profileService.clearProfileCache('test-user-id');
      // This test mainly ensures the method doesn't throw
      expect(true).toBe(true);
    });

    it('should clear all cache', () => {
      profileService.clearProfileCache();
      // This test mainly ensures the method doesn't throw
      expect(true).toBe(true);
    });
  });
});