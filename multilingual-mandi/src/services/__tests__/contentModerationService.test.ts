// Unit Tests for Content Moderation Service
// Tests content reports, dispute resolution, and platform analytics

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContentModerationService } from '../contentModerationService';
import * as firestore from 'firebase/firestore';

// Mock Firebase
vi.mock('../../lib/firebase', () => ({
  db: {},
  auth: {}
}));

// Mock Firestore functions
vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db, path) => ({ type: 'collection', path })),
  doc: vi.fn((_db, path, id) => ({ type: 'doc', path, id })),
  getDocs: vi.fn(),
  getDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
  serverTimestamp: vi.fn()
}));

describe('ContentModerationService', () => {
  let service: ContentModerationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ContentModerationService();
    service.setModerator('moderator-123');

    vi.mocked(firestore.serverTimestamp).mockReturnValue({ seconds: Date.now() / 1000 } as any);
  });

  describe('getModerationStats', () => {
    it('should return moderation statistics', async () => {
      // Mock various collection queries
      const mockReportsSnapshot = { size: 25 };
      const mockPendingReportsSnapshot = { size: 10 };
      const mockResolvedReportsSnapshot = { size: 15 };
      const mockActiveDisputesSnapshot = { size: 5 };
      const mockResolvedDisputesSnapshot = { size: 8 };
      const mockFlaggedContentSnapshot = { size: 12 };
      const mockModerationActionsSnapshot = { size: 30 };

      vi.mocked(firestore.getDocs)
        .mockResolvedValueOnce(mockReportsSnapshot as any)
        .mockResolvedValueOnce(mockPendingReportsSnapshot as any)
        .mockResolvedValueOnce(mockResolvedReportsSnapshot as any)
        .mockResolvedValueOnce(mockActiveDisputesSnapshot as any)
        .mockResolvedValueOnce(mockResolvedDisputesSnapshot as any)
        .mockResolvedValueOnce(mockFlaggedContentSnapshot as any)
        .mockResolvedValueOnce(mockModerationActionsSnapshot as any);

      const stats = await service.getModerationStats();

      expect(stats).toEqual({
        totalReports: 25,
        pendingReports: 10,
        resolvedReports: 15,
        activeDisputes: 5,
        resolvedDisputes: 8,
        flaggedContent: 12,
        moderationActions: 30
      });
    });

    it('should handle moderation stats errors', async () => {
      vi.mocked(firestore.getDocs).mockRejectedValue(new Error('Database error'));

      await expect(service.getModerationStats()).rejects.toThrow('Failed to load moderation statistics');
    });
  });

  describe('getContentReports', () => {
    it('should return content reports with filtering', async () => {
      const mockReports = [
        {
          id: 'report-1',
          reporterId: 'user-123',
          targetType: 'message',
          targetId: 'msg-456',
          reason: 'spam',
          description: 'Spam message',
          status: 'pending',
          createdAt: { toDate: () => new Date() }
        }
      ];

      const mockSnapshot = {
        docs: mockReports.map(report => ({
          id: report.id,
          data: () => report
        }))
      };

      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot as any);

      const result = await service.getContentReports('pending', 20);

      expect(result.reports).toHaveLength(1);
      expect(result.reports[0].status).toBe('pending');
      expect(result.hasMore).toBe(false);
    });

    it('should handle content reports errors', async () => {
      vi.mocked(firestore.getDocs).mockRejectedValue(new Error('Database error'));

      await expect(service.getContentReports()).rejects.toThrow('Failed to load content reports');
    });
  });

  describe('createContentReport', () => {
    it('should create content report successfully', async () => {
      const mockDocRef = { id: 'report-123' };
      vi.mocked(firestore.addDoc).mockResolvedValue(mockDocRef as any);

      const reportId = await service.createContentReport(
        'reporter-123',
        'message',
        'msg-456',
        'spam',
        'This is spam content'
      );

      expect(reportId).toBe('report-123');
      expect(firestore.addDoc).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'collection', path: 'contentReports' }),
        expect.objectContaining({
          reporterId: 'reporter-123',
          targetType: 'message',
          targetId: 'msg-456',
          reason: 'spam',
          description: 'This is spam content',
          status: 'pending',
          createdAt: expect.anything()
        })
      );
    });

    it('should handle report creation errors', async () => {
      vi.mocked(firestore.addDoc).mockRejectedValue(new Error('Database error'));

      await expect(
        service.createContentReport('reporter-123', 'message', 'msg-456', 'spam', 'Spam content')
      ).rejects.toThrow('Failed to create content report');
    });
  });

  describe('investigateReport', () => {
    it('should start investigation successfully', async () => {
      await service.investigateReport('report-123', 'Starting investigation');

      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'doc', path: 'contentReports', id: 'report-123' }),
        expect.objectContaining({
          status: 'investigating',
          moderatorId: 'moderator-123',
          investigationNotes: 'Starting investigation',
          updatedAt: expect.anything()
        })
      );
    });

    it('should require moderator authentication', async () => {
      const unauthenticatedService = new ContentModerationService();

      await expect(
        unauthenticatedService.investigateReport('report-123')
      ).rejects.toThrow('Failed to start investigation');
    });
  });

  describe('resolveReport', () => {
    it('should resolve report successfully', async () => {
      const mockReportSnap = {
        exists: () => true,
        data: () => ({
          targetId: 'msg-123',
          targetType: 'message',
          reason: 'spam'
        })
      };
      vi.mocked(firestore.getDoc).mockResolvedValue(mockReportSnap as any);

      await service.resolveReport(
        'report-123',
        'Report resolved - content removed',
        'delete_content'
      );

      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'doc', path: 'contentReports', id: 'report-123' }),
        expect.objectContaining({
          status: 'resolved',
          resolution: 'Report resolved - content removed',
          moderatorAction: 'delete_content',
          resolvedAt: expect.anything(),
          updatedAt: expect.anything()
        })
      );
    });

    it('should resolve report without action', async () => {
      await service.resolveReport(
        'report-123',
        'Report dismissed - no violation found'
      );

      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'doc', path: 'contentReports', id: 'report-123' }),
        expect.objectContaining({
          status: 'resolved',
          resolution: 'Report dismissed - no violation found',
          moderatorAction: undefined,
          resolvedAt: expect.anything(),
          updatedAt: expect.anything()
        })
      );
    });
  });

  describe('getDisputes', () => {
    it('should return disputes with filtering', async () => {
      const mockDisputes = [
        {
          id: 'dispute-1',
          dealId: 'deal-123',
          raisedBy: 'user-456',
          reason: 'Product quality issue',
          description: 'Product not as described',
          status: 'open',
          createdAt: { toDate: () => new Date() }
        }
      ];

      const mockSnapshot = {
        docs: mockDisputes.map(dispute => ({
          id: dispute.id,
          data: () => dispute
        }))
      };

      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot as any);

      const result = await service.getDisputes('open', 20);

      expect(result.disputes).toHaveLength(1);
      expect(result.disputes[0].status).toBe('open');
      expect(result.hasMore).toBe(false);
    });
  });

  describe('resolveDispute', () => {
    it('should resolve dispute with refund', async () => {
      const compensation = {
        amount: 1000,
        recipient: 'user-456',
        method: 'upi'
      };

      const mockDocRef = { id: 'resolution-123' };
      vi.mocked(firestore.addDoc).mockResolvedValue(mockDocRef as any);

      await service.resolveDispute(
        'dispute-123',
        'refund',
        'Full refund approved due to product quality issues',
        compensation
      );

      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'doc', path: 'disputes', id: 'dispute-123' }),
        expect.objectContaining({
          status: 'resolved',
          resolution: 'Full refund approved due to product quality issues',
          resolvedAt: expect.anything(),
          updatedAt: expect.anything()
        })
      );

      expect(firestore.addDoc).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'collection', path: 'disputeResolutions' }),
        expect.objectContaining({
          disputeId: 'dispute-123',
          resolution: 'refund',
          reasoning: 'Full refund approved due to product quality issues',
          compensation,
          moderatorId: 'moderator-123',
          createdAt: expect.anything()
        })
      );
    });

    it('should escalate dispute', async () => {
      await service.resolveDispute(
        'dispute-123',
        'escalate',
        'Complex case requiring senior review'
      );

      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'doc', path: 'disputes', id: 'dispute-123' }),
        expect.objectContaining({
          status: 'escalated',
          resolution: 'Complex case requiring senior review',
          resolvedAt: expect.anything(),
          updatedAt: expect.anything()
        })
      );
    });
  });

  describe('getPlatformAnalytics', () => {
    it('should return comprehensive platform analytics', async () => {
      // Mock user activity queries
      const mockDailyActiveSnapshot = { size: 150 };
      const mockWeeklyActiveSnapshot = { size: 500 };
      const mockMonthlyActiveSnapshot = { size: 1200 };
      const mockNewRegistrationsSnapshot = { size: 80 };

      // Mock transaction queries
      const mockDealsSnapshot = {
        size: 2, // Matches docs length for average calculation
        docs: [
          { data: () => ({ agreedPrice: 1000, quantity: 10 }) }, // 10000
          { data: () => ({ agreedPrice: 2000, quantity: 5 }) }   // 10000
        ]
      };
      const mockCompletedDealsSnapshot = { size: 180 };
      const mockDisputedDealsSnapshot = { size: 5 };

      // Mock content queries
      const mockMessagesSnapshot = { size: 5000 };
      const mockTranslatedMessagesSnapshot = { size: 3000 };
      const mockFlaggedContentSnapshot = { size: 25 };
      const mockModerationActionsSnapshot = { size: 40 };

      // Mock trust queries
      const mockVerifiedUsersSnapshot = { size: 800 };
      const mockSuspendedUsersSnapshot = { size: 10 };
      const mockUserProfilesSnapshot = {
        docs: [
          { data: () => ({ trustData: { trustScore: 4.5 } }) },
          { data: () => ({ trustData: { trustScore: 3.8 } }) },
          { data: () => ({ trustData: { trustScore: 4.2 } }) }
        ]
      };

      vi.mocked(firestore.getDocs)
        .mockResolvedValueOnce(mockDailyActiveSnapshot as any)
        .mockResolvedValueOnce(mockWeeklyActiveSnapshot as any)
        .mockResolvedValueOnce(mockMonthlyActiveSnapshot as any)
        .mockResolvedValueOnce(mockNewRegistrationsSnapshot as any)
        .mockResolvedValueOnce(mockDealsSnapshot as any)
        .mockResolvedValueOnce(mockCompletedDealsSnapshot as any)
        .mockResolvedValueOnce(mockDisputedDealsSnapshot as any)
        .mockResolvedValueOnce(mockMessagesSnapshot as any)
        .mockResolvedValueOnce(mockTranslatedMessagesSnapshot as any)
        .mockResolvedValueOnce(mockFlaggedContentSnapshot as any)
        .mockResolvedValueOnce(mockModerationActionsSnapshot as any)
        .mockResolvedValueOnce(mockVerifiedUsersSnapshot as any)
        .mockResolvedValueOnce(mockSuspendedUsersSnapshot as any)
        .mockResolvedValueOnce(mockUserProfilesSnapshot as any);

      const analytics = await service.getPlatformAnalytics();

      expect(analytics).toEqual({
        userActivity: {
          dailyActiveUsers: 150,
          weeklyActiveUsers: 500,
          monthlyActiveUsers: 1200,
          newRegistrations: 80
        },
        transactionMetrics: {
          totalDeals: 2,
          completedDeals: 180,
          disputedDeals: 5,
          averageDealValue: 10000,
          totalVolume: 15
        },
        contentMetrics: {
          totalMessages: 5000,
          translatedMessages: 3000,
          flaggedContent: 25,
          moderationActions: 40
        },
        trustMetrics: {
          verifiedUsers: 800,
          averageTrustScore: expect.closeTo(4.1667, 4),
          suspendedUsers: 10,
          bannedUsers: 0
        }
      });
    });

    it('should handle analytics errors', async () => {
      vi.mocked(firestore.getDocs).mockRejectedValue(new Error('Database error'));

      await expect(service.getPlatformAnalytics()).rejects.toThrow('Failed to load platform analytics');
    });
  });

  describe('private methods', () => {
    it('should parse timestamps correctly', async () => {
      const mockReport = {
        id: 'report-1',
        reporterId: 'user-123',
        targetType: 'message',
        targetId: 'msg-456',
        reason: 'spam',
        description: 'Spam message',
        status: 'pending',
        createdAt: { toDate: () => new Date('2024-01-01') }
      };

      const mockSnapshot = {
        docs: [{
          id: mockReport.id,
          data: () => mockReport
        }]
      };

      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot as any);

      const result = await service.getContentReports();

      expect(result.reports[0].createdAt).toBeInstanceOf(Date);
      expect(result.reports[0].createdAt.getFullYear()).toBe(2024);
    });

    it('should handle invalid timestamps gracefully', async () => {
      const mockReport = {
        id: 'report-1',
        reporterId: 'user-123',
        targetType: 'message',
        targetId: 'msg-456',
        reason: 'spam',
        description: 'Spam message',
        status: 'pending',
        createdAt: 'invalid-timestamp'
      };

      const mockSnapshot = {
        docs: [{
          id: mockReport.id,
          data: () => mockReport
        }]
      };

      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot as any);

      const result = await service.getContentReports();

      expect(result.reports[0].createdAt).toBeInstanceOf(Date);
    });
  });
});