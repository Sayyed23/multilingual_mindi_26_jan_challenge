// Trust System Service Tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TrustSystemService } from '../trustSystem';
import { profileManagementService } from '../profileManagement';
import { offlineSyncService } from '../offlineSync';
import type {
  UserProfile,
  TrustIndicators,
  VerificationBadge,
  VerificationDocument,
  Transaction,
  Feedback
} from '../../types';

// Mock dependencies
vi.mock('../profileManagement');
vi.mock('../offlineSync');
vi.mock('../../lib/firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  addDoc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
  increment: vi.fn(),
  arrayUnion: vi.fn(),
  arrayRemove: vi.fn()
}));

describe('TrustSystemService', () => {
  let service: TrustSystemService;
  let mockUserProfile: UserProfile;
  let mockTransaction: Transaction;

  beforeEach(() => {
    service = new TrustSystemService();

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
        operatingRegions: []
      },
      preferences: {
        notifications: {
          priceAlerts: true,
          dealUpdates: true,
          newOpportunities: true,
          systemUpdates: true,
          marketingMessages: false,
          channels: { push: true, email: true, sms: false }
        },
        privacy: {
          profileVisibility: 'public',
          showContactInfo: true,
          showTransactionHistory: true,
          allowDirectMessages: true,
          dataSharing: false
        }
      },
      trustData: {
        verificationStatus: 'verified',
        trustScore: 75,
        transactionHistory: [
          {
            id: 'tx1',
            type: 'sell',
            commodity: 'wheat',
            amount: 2500,
            date: new Date(),
            counterparty: 'buyer1'
          }
        ]
      },
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      updatedAt: new Date()
    };

    mockTransaction = {
      id: 'test-transaction',
      type: 'deal',
      participants: {
        buyer: 'buyer-id',
        seller: 'test-user-id'
      },
      commodity: {
        name: 'wheat',
        category: 'grains',
        quality: 'standard',
        quantity: 100,
        unit: 'kg'
      },
      pricing: {
        initialOffer: 2400,
        finalPrice: 2500,
        marketPrice: 2450,
        pricePerUnit: 25
      },
      timeline: {
        initiated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        completed: new Date()
      },
      status: 'completed',
      metadata: {
        location: {
          state: 'Test State',
          district: 'Test District',
          city: 'Test City',
          pincode: '123456'
        }
      }
    };

    // Reset mocks
    vi.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('should return user profile from profile management service', async () => {
      vi.mocked(profileManagementService.getUserProfile).mockResolvedValue(mockUserProfile);

      const result = await service.getUserProfile('test-user-id');

      expect(result).toEqual(mockUserProfile);
      expect(profileManagementService.getUserProfile).toHaveBeenCalledWith('test-user-id');
    });

    it('should throw error when profile not found', async () => {
      vi.mocked(profileManagementService.getUserProfile).mockResolvedValue(null);

      await expect(service.getUserProfile('test-user-id')).rejects.toThrow('User profile not found');
    });
  });

  describe('getTrustIndicators', () => {
    it('should return cached trust indicators if available', async () => {
      const mockTrustIndicators: TrustIndicators = {
        overallScore: 75,
        transactionCount: 1,
        averageRating: 4.5,
        verificationBadges: [],
        recentFeedback: []
      };

      vi.mocked(offlineSyncService.getCachedData).mockResolvedValue(mockTrustIndicators);

      const result = await service.getTrustIndicators('test-user-id');

      expect(result).toEqual(mockTrustIndicators);
      expect(offlineSyncService.getCachedData).toHaveBeenCalledWith('trust_indicators_test-user-id');
    });

    it('should calculate and cache trust indicators when not cached', async () => {
      vi.mocked(offlineSyncService.getCachedData).mockResolvedValue(null);
      vi.mocked(profileManagementService.getUserProfile).mockResolvedValue(mockUserProfile);

      // Mock getVerificationBadges and getRecentFeedback methods
      const mockBadges: VerificationBadge[] = [
        { type: 'identity', verified: true, verifiedAt: new Date() }
      ];
      const mockFeedback: Feedback[] = [
        {
          id: 'feedback1',
          fromUserId: 'buyer1',
          toUserId: 'test-user-id',
          dealId: 'deal1',
          rating: 4,
          categories: { communication: 4, reliability: 4, quality: 4, timeliness: 4 },
          createdAt: new Date()
        }
      ];

      // Mock private methods by spying on the service
      vi.spyOn(service, 'getVerificationBadges').mockResolvedValue(mockBadges);
      vi.spyOn(service as any, 'getRecentFeedback').mockResolvedValue(mockFeedback);

      const result = await service.getTrustIndicators('test-user-id');

      expect(result.overallScore).toBe(75);
      expect(result.transactionCount).toBe(1);
      expect(result.verificationBadges).toEqual(mockBadges);
      expect(result.recentFeedback).toEqual(mockFeedback);
      expect(offlineSyncService.cacheData).toHaveBeenCalled();
    });
  });

  describe('updateTrustScore', () => {
    it('should update trust score based on transaction performance', async () => {
      vi.mocked(profileManagementService.getUserProfile).mockResolvedValue(mockUserProfile);

      // Mock Firebase operations
      const { updateDoc, getDocs, getDoc } = await import('firebase/firestore');
      vi.mocked(updateDoc).mockResolvedValue(undefined);
      vi.mocked(getDocs).mockResolvedValue({
        forEach: () => { },
        size: 0
      } as any);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false
      } as any);

      await service.updateTrustScore('test-user-id', mockTransaction);

      expect(updateDoc).toHaveBeenCalled();
      expect(offlineSyncService.cacheData).toHaveBeenCalledWith('trust_indicators_test-user-id', null, 0);
    });

    it('should handle errors during trust score update', async () => {
      vi.mocked(profileManagementService.getUserProfile).mockRejectedValue(new Error('Profile not found'));

      await expect(service.updateTrustScore('test-user-id', mockTransaction)).rejects.toThrow();
    });
  });

  describe('verifyUser', () => {
    it('should process verification documents and return result', async () => {
      const mockDocuments: VerificationDocument[] = [
        {
          type: 'aadhar',
          documentUrl: 'https://example.com/aadhar.pdf',
          status: 'pending',
          uploadedAt: new Date()
        }
      ];

      // Mock Firebase operations
      const { addDoc, updateDoc } = await import('firebase/firestore');
      vi.mocked(addDoc).mockResolvedValue({ id: 'verification-request-id' } as any);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      const result = await service.verifyUser('test-user-id', mockDocuments);

      expect(result.success).toBe(true);
      expect(result.documentsProcessed).toBe(1);
      expect(addDoc).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalled();
    });

    it('should return failure result when verification fails', async () => {
      const mockDocuments: VerificationDocument[] = [
        {
          type: 'aadhar',
          documentUrl: 'https://example.com/aadhar.pdf',
          status: 'pending',
          uploadedAt: new Date()
        }
      ];

      // Mock Firebase operations to fail
      const { addDoc } = await import('firebase/firestore');
      vi.mocked(addDoc).mockRejectedValue(new Error('Database error'));

      const result = await service.verifyUser('test-user-id', mockDocuments);

      expect(result.success).toBe(false);
      expect(result.documentsProcessed).toBe(0);
      expect(result.pendingRequirements).toContain('Verification failed. Please try again.');
    });
  });

  describe('reportUser', () => {
    it('should create report and log suspicious activity', async () => {
      const reporterProfile = { ...mockUserProfile, uid: 'reporter-id' };
      vi.mocked(profileManagementService.getUserProfile).mockResolvedValue(reporterProfile);

      // Mock Firebase operations
      const { addDoc } = await import('firebase/firestore');
      vi.mocked(addDoc).mockResolvedValue({ id: 'report-id' } as any);

      await service.reportUser('reporter-id', 'reported-id', 'spam');

      expect(addDoc).toHaveBeenCalledTimes(2); // One for report, one for suspicious activity
    });

    it('should prevent self-reporting', async () => {
      await expect(service.reportUser('user-id', 'user-id', 'spam')).rejects.toThrow('Cannot report yourself');
    });

    it('should prevent unverified users from reporting', async () => {
      const unverifiedProfile = {
        ...mockUserProfile,
        uid: 'reporter-id',
        trustData: { ...mockUserProfile.trustData, verificationStatus: 'unverified' as const }
      };
      vi.mocked(profileManagementService.getUserProfile).mockResolvedValue(unverifiedProfile);

      await expect(service.reportUser('reporter-id', 'reported-id', 'spam'))
        .rejects.toThrow('Only verified users can report suspicious behavior');
    });
  });

  describe('getVerificationBadges', () => {
    it('should return cached verification badges if available', async () => {
      const mockBadges: VerificationBadge[] = [
        { type: 'identity', verified: true, verifiedAt: new Date() }
      ];

      vi.mocked(offlineSyncService.getCachedData).mockResolvedValue(mockBadges);

      const result = await service.getVerificationBadges('test-user-id');

      expect(result).toEqual(mockBadges);
      expect(offlineSyncService.getCachedData).toHaveBeenCalledWith('verification_badges_test-user-id');
    });

    it('should fetch from database and cache when not cached', async () => {
      vi.mocked(offlineSyncService.getCachedData).mockResolvedValue(null);

      const mockBadges: VerificationBadge[] = [
        { type: 'identity', verified: true, verifiedAt: new Date() }
      ];

      // Mock Firestore document
      const { getDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ badges: mockBadges })
      } as any);

      const result = await service.getVerificationBadges('test-user-id');

      expect(result).toEqual(mockBadges);
      expect(offlineSyncService.cacheData).toHaveBeenCalled();
    });

    it('should return empty array when no badges exist', async () => {
      vi.mocked(offlineSyncService.getCachedData).mockResolvedValue(null);

      // Mock Firestore document not existing
      const { getDoc } = await import('firebase/firestore');
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false
      } as any);

      const result = await service.getVerificationBadges('test-user-id');

      expect(result).toEqual([]);
    });
  });

  describe('getAccountRestrictions', () => {
    it('should return active account restrictions', async () => {
      const mockRestrictions = [
        {
          type: 'limited',
          reason: 'Multiple reports',
          startDate: new Date(),
          restrictions: ['no_new_deals']
        }
      ];

      // Mock Firestore query
      const { getDocs } = await import('firebase/firestore');
      vi.mocked(getDocs).mockResolvedValue({
        forEach: (callback: any) => {
          mockRestrictions.forEach((restriction) => {
            callback({
              data: () => ({
                ...restriction,
                startDate: { toDate: () => restriction.startDate }
              })
            });
          });
        }
      } as any);

      const result = await service.getAccountRestrictions('test-user-id');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('limited');
      expect(result[0].reason).toBe('Multiple reports');
    });

    it('should return empty array when no restrictions exist', async () => {
      // Mock empty Firestore query result
      const { getDocs } = await import('firebase/firestore');
      vi.mocked(getDocs).mockResolvedValue({
        forEach: () => { }
      } as any);

      const result = await service.getAccountRestrictions('test-user-id');

      expect(result).toEqual([]);
    });
  });

  describe('addFeedback', () => {
    it('should add feedback and update trust score', async () => {
      const mockFeedback = {
        fromUserId: 'buyer-id',
        toUserId: 'seller-id',
        dealId: 'deal-id',
        rating: 4,
        comment: 'Good transaction',
        categories: {
          communication: 4,
          reliability: 4,
          quality: 4,
          timeliness: 4
        }
      };

      // Mock Firebase operations
      const { addDoc, getDocs, getDoc, updateDoc } = await import('firebase/firestore');
      vi.mocked(addDoc).mockResolvedValue({ id: 'feedback-id' } as any);
      vi.mocked(updateDoc).mockResolvedValue(undefined);
      vi.mocked(getDocs).mockResolvedValue({
        forEach: () => { },
        size: 0
      } as any);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false
      } as any);

      // Mock updateTrustScore method
      const updateTrustScoreSpy = vi.spyOn(service, 'updateTrustScore').mockResolvedValue();

      await service.addFeedback(mockFeedback);

      expect(addDoc).toHaveBeenCalled();
      expect(updateTrustScoreSpy).toHaveBeenCalledWith('seller-id', expect.any(Object));
    });
  });
});