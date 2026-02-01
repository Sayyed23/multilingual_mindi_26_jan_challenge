// Trust System Security Service Tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TrustSystemSecurityService } from '../trustSystemSecurity';
import { trustSystemService } from '../trustSystem';
import { profileManagementService } from '../profileManagement';
import type {
  UserProfile,
  PrivacySettings
} from '../../types';

// Mock dependencies
vi.mock('../trustSystem');
vi.mock('../profileManagement');
vi.mock('../../lib/firebase', () => ({
  db: { app: 'mock-app' }
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(() => ({ id: 'mock-doc-ref' })),
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  addDoc: vi.fn(),
  collection: vi.fn(() => ({ id: 'mock-collection-ref' })),
  query: vi.fn(() => ({ id: 'mock-query' })),
  where: vi.fn(() => ({ id: 'mock-where' })),
  orderBy: vi.fn(() => ({ id: 'mock-orderby' })),
  limit: vi.fn(() => ({ id: 'mock-limit' })),
  getDocs: vi.fn(),
  serverTimestamp: vi.fn(() => new Date())
}));

describe('TrustSystemSecurityService', () => {
  let service: TrustSystemSecurityService;
  let mockUserProfile: UserProfile;

  beforeEach(() => {
    service = new TrustSystemSecurityService();

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
        transactionHistory: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Reset mocks
    vi.clearAllMocks();
  });

  describe('detectSuspiciousBehavior', () => {
    it('should detect and create security alerts for suspicious patterns', async () => {
      const { addDoc } = await import('firebase/firestore');
      vi.mocked(addDoc).mockResolvedValue({ id: 'alert-id' } as any);

      // Mock behavior pattern analysis to return high-confidence pattern
      const analyzeBehaviorPatternsSpy = vi.spyOn(service as any, 'analyzeBehaviorPatterns')
        .mockResolvedValue([{
          userId: 'test-user-id',
          patternType: 'rapid_messaging',
          confidence: 0.8,
          evidence: ['20 messages in 60 seconds'],
          detectedAt: new Date()
        }]);

      await service.detectSuspiciousBehavior('test-user-id', 'send_message', { messageCount: 20 });

      expect(analyzeBehaviorPatternsSpy).toHaveBeenCalledWith('test-user-id', 'send_message', { messageCount: 20 });
      expect(addDoc).toHaveBeenCalled();
    });

    it('should apply automatic restrictions for high-confidence patterns', async () => {
      const { addDoc } = await import('firebase/firestore');
      vi.mocked(addDoc).mockResolvedValue({ id: 'alert-id' } as any);

      // Mock high-confidence pattern
      vi.spyOn(service as any, 'analyzeBehaviorPatterns').mockResolvedValue([{
        userId: 'test-user-id',
        patternType: 'fake_reviews',
        confidence: 0.95,
        evidence: ['Suspicious review patterns detected'],
        detectedAt: new Date()
      }]);

      const applyAutomaticRestrictionsSpy = vi.spyOn(service as any, 'applyAutomaticRestrictions')
        .mockResolvedValue(undefined);

      await service.detectSuspiciousBehavior('test-user-id', 'submit_feedback');

      expect(applyAutomaticRestrictionsSpy).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      vi.spyOn(service as any, 'analyzeBehaviorPatterns').mockRejectedValue(new Error('Analysis failed'));

      // Should not throw error
      await expect(service.detectSuspiciousBehavior('test-user-id', 'send_message')).resolves.toBeUndefined();
    });
  });

  describe('flagAccountForReview', () => {
    it('should create security alert and update profile status', async () => {
      const { addDoc, updateDoc } = await import('firebase/firestore');
      vi.mocked(addDoc).mockResolvedValue({ id: 'alert-id' } as any);
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      const notifyAdministratorsSpy = vi.spyOn(service as any, 'notifyAdministrators')
        .mockResolvedValue(undefined);

      await service.flagAccountForReview('test-user-id', 'Suspicious activity', 'admin-id', { evidence: 'test' });

      expect(addDoc).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalled();
      expect(notifyAdministratorsSpy).toHaveBeenCalledWith('account_flagged', {
        userId: 'test-user-id',
        reason: 'Suspicious activity',
        flaggedBy: 'admin-id',
        evidence: { evidence: 'test' }
      });
    });

    it('should handle errors and rethrow them', async () => {
      const { addDoc } = await import('firebase/firestore');
      vi.mocked(addDoc).mockRejectedValue(new Error('Database error'));

      await expect(service.flagAccountForReview('test-user-id', 'Test reason', 'admin-id'))
        .rejects.toThrow('Database error');
    });
  });

  describe('applyAccountRestrictions', () => {
    it('should apply restrictions and log security action', async () => {
      const applyAccountRestrictionSpy = vi.mocked(trustSystemService.applyAccountRestriction)
        .mockResolvedValue(undefined);

      const logSecurityActionSpy = vi.spyOn(service as any, 'logSecurityAction')
        .mockResolvedValue(undefined);

      const penalizeTrustScoreSpy = vi.spyOn(service as any, 'penalizeTrustScore')
        .mockResolvedValue(undefined);

      await service.applyAccountRestrictions('test-user-id', 'limited', 'Multiple violations', 7 * 24 * 60 * 60 * 1000);

      expect(applyAccountRestrictionSpy).toHaveBeenCalledWith('test-user-id', {
        type: 'limited',
        reason: 'Multiple violations',
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        restrictions: ['limited_messaging', 'limited_deals', 'limited_visibility']
      });
      expect(logSecurityActionSpy).toHaveBeenCalled();
      expect(penalizeTrustScoreSpy).toHaveBeenCalledWith('test-user-id', 'limited');
    });

    it('should handle permanent restrictions without end date', async () => {
      vi.mocked(trustSystemService.applyAccountRestriction).mockResolvedValue(undefined);
      vi.spyOn(service as any, 'logSecurityAction').mockResolvedValue(undefined);
      vi.spyOn(service as any, 'penalizeTrustScore').mockResolvedValue(undefined);

      await service.applyAccountRestrictions('test-user-id', 'banned', 'Severe violations');

      expect(trustSystemService.applyAccountRestriction).toHaveBeenCalledWith('test-user-id',
        expect.objectContaining({
          type: 'banned',
          endDate: undefined
        })
      );
    });
  });

  describe('updatePrivacyControls', () => {
    it('should update privacy settings for own account', async () => {
      const privacySettings: Partial<PrivacySettings> = {
        profileVisibility: 'verified_only',
        showContactInfo: false
      };

      vi.mocked(profileManagementService.updatePrivacySettings).mockResolvedValue(true);
      const logPrivacyAuditSpy = vi.spyOn(service as any, 'logPrivacyAudit').mockResolvedValue(undefined);

      await service.updatePrivacyControls('test-user-id', privacySettings, 'test-user-id');

      expect(profileManagementService.updatePrivacySettings).toHaveBeenCalledWith('test-user-id', privacySettings);
      expect(logPrivacyAuditSpy).toHaveBeenCalledWith({
        userId: 'test-user-id',
        action: 'privacy_change',
        performedBy: 'test-user-id',
        details: { changes: privacySettings },
        timestamp: expect.any(Date)
      });
    });

    it('should reject invalid privacy settings', async () => {
      const invalidSettings = {
        profileVisibility: 'invalid_setting' as any
      };

      await expect(service.updatePrivacyControls('test-user-id', invalidSettings, 'test-user-id'))
        .rejects.toThrow('Invalid privacy settings');
    });

    it('should reject unauthorized privacy modifications', async () => {
      const privacySettings: Partial<PrivacySettings> = {
        profileVisibility: 'private'
      };

      vi.spyOn(service as any, 'checkPrivacyModificationPermission').mockResolvedValue(false);

      await expect(service.updatePrivacyControls('test-user-id', privacySettings, 'other-user-id'))
        .rejects.toThrow('Insufficient permissions to modify privacy settings');
    });
  });

  describe('getEffectiveProfileVisibility', () => {
    it('should return restricted visibility for users with restrictions', async () => {
      vi.mocked(profileManagementService.getUserProfile).mockResolvedValue(mockUserProfile);
      vi.mocked(trustSystemService.getAccountRestrictions).mockResolvedValue([
        {
          type: 'suspended',
          reason: 'Policy violation',
          startDate: new Date(),
          restrictions: ['limited_visibility']
        }
      ]);

      const visibility = await service.getEffectiveProfileVisibility('test-user-id', 'viewer-id');

      expect(visibility).toBe('restricted');
    });

    it('should return limited visibility for low trust users', async () => {
      const lowTrustProfile = {
        ...mockUserProfile,
        preferences: {
          ...mockUserProfile.preferences,
          privacy: {
            ...mockUserProfile.preferences.privacy,
            profileVisibility: 'public' as const
          }
        }
      };

      vi.mocked(profileManagementService.getUserProfile).mockResolvedValue(lowTrustProfile);
      vi.mocked(trustSystemService.getAccountRestrictions).mockResolvedValue([]);
      vi.mocked(trustSystemService.getTrustIndicators).mockResolvedValue({
        overallScore: 25, // Low trust score
        transactionCount: 0,
        averageRating: 0,
        verificationBadges: [],
        recentFeedback: []
      });

      const logPrivacyAuditSpy = vi.spyOn(service as any, 'logPrivacyAudit').mockResolvedValue(undefined);

      const visibility = await service.getEffectiveProfileVisibility('test-user-id', 'viewer-id');

      expect(visibility).toBe('verified_only');
      expect(logPrivacyAuditSpy).toHaveBeenCalled();
    });

    it('should return private when profile not found', async () => {
      vi.mocked(profileManagementService.getUserProfile).mockResolvedValue(null);

      const visibility = await service.getEffectiveProfileVisibility('test-user-id', 'viewer-id');

      expect(visibility).toBe('private');
    });

    it('should return user preference for normal users', async () => {
      vi.mocked(profileManagementService.getUserProfile).mockResolvedValue(mockUserProfile);
      vi.mocked(trustSystemService.getAccountRestrictions).mockResolvedValue([]);
      vi.mocked(trustSystemService.getTrustIndicators).mockResolvedValue({
        overallScore: 75, // Good trust score
        transactionCount: 5,
        averageRating: 4.2,
        verificationBadges: [],
        recentFeedback: []
      });

      const visibility = await service.getEffectiveProfileVisibility('test-user-id', 'viewer-id');

      expect(visibility).toBe('public');
    });
  });

  describe('getSecurityAlerts', () => {
    it('should return security alerts for a user', async () => {
      const mockAlerts = [
        {
          id: 'alert1',
          userId: 'test-user-id',
          alertType: 'suspicious_activity',
          severity: 'medium',
          description: 'Rapid messaging detected',
          status: 'active',
          createdAt: { toDate: () => new Date() }
        }
      ];

      const { getDocs } = await import('firebase/firestore');
      vi.mocked(getDocs).mockResolvedValue({
        forEach: (callback: any) => {
          mockAlerts.forEach(alert => callback({
            data: () => alert
          }));
        }
      } as any);

      const alerts = await service.getSecurityAlerts('test-user-id');

      expect(alerts).toHaveLength(1);
      expect(alerts[0].alertType).toBe('suspicious_activity');
    });

    it('should filter alerts by status when provided', async () => {
      const { getDocs } = await import('firebase/firestore');
      vi.mocked(getDocs).mockResolvedValue({
        forEach: () => { }
      } as any);

      await service.getSecurityAlerts('test-user-id', 'resolved');

      expect(getDocs).toHaveBeenCalled();
    });

    it('should return empty array on error', async () => {
      const { getDocs } = await import('firebase/firestore');
      vi.mocked(getDocs).mockRejectedValue(new Error('Database error'));

      const alerts = await service.getSecurityAlerts('test-user-id');

      expect(alerts).toEqual([]);
    });
  });

  describe('resolveSecurityAlert', () => {
    it('should update alert status and resolution details', async () => {
      const { updateDoc } = await import('firebase/firestore');
      vi.mocked(updateDoc).mockResolvedValue(undefined);

      await service.resolveSecurityAlert('alert-id', 'resolved', 'admin-id', 'Issue resolved');

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          status: 'resolved',
          resolvedBy: 'admin-id',
          resolutionNotes: 'Issue resolved'
        })
      );
    });

    it('should handle errors and rethrow them', async () => {
      const { updateDoc } = await import('firebase/firestore');
      vi.mocked(updateDoc).mockRejectedValue(new Error('Update failed'));

      await expect(service.resolveSecurityAlert('alert-id', 'resolved', 'admin-id'))
        .rejects.toThrow('Update failed');
    });
  });

  describe('getPrivacyAuditLog', () => {
    it('should return privacy audit log entries', async () => {
      const mockAuditEntries = [
        {
          userId: 'test-user-id',
          action: 'profile_view',
          performedBy: 'viewer-id',
          details: { visibility: 'public' },
          timestamp: { toDate: () => new Date() }
        }
      ];

      const { getDocs } = await import('firebase/firestore');
      vi.mocked(getDocs).mockResolvedValue({
        forEach: (callback: any) => {
          mockAuditEntries.forEach(entry => callback({
            data: () => entry
          }));
        }
      } as any);

      const auditLog = await service.getPrivacyAuditLog('test-user-id');

      expect(auditLog).toHaveLength(1);
      expect(auditLog[0].action).toBe('profile_view');
    });

    it('should return empty array on error', async () => {
      const { getDocs } = await import('firebase/firestore');
      vi.mocked(getDocs).mockRejectedValue(new Error('Database error'));

      const auditLog = await service.getPrivacyAuditLog('test-user-id');

      expect(auditLog).toEqual([]);
    });
  });
});