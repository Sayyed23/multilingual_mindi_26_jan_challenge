// Content Moderation Service for Dispute Resolution and Analytics
// Implements content violation review and investigation tools
// Provides structured dispute resolution workflows
// Creates analytics and reporting tools for platform monitoring

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type {
  ContentReport,
  Dispute,
  AuditLog
} from '../types';

export interface ModerationStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  activeDisputes: number;
  resolvedDisputes: number;
  flaggedContent: number;
  moderationActions: number;
}

export interface ContentViolation {
  id: string;
  type: 'spam' | 'harassment' | 'fraud' | 'inappropriate_content' | 'fake_profile' | 'price_manipulation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: string[];
  reportedBy: string;
  targetId: string;
  targetType: 'user' | 'message' | 'deal' | 'price';
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  createdAt: Date;
  resolvedAt?: Date;
  resolution?: string;
  moderatorId?: string;
}

export interface DisputeResolution {
  id: string;
  disputeId: string;
  resolution: 'refund' | 'replacement' | 'partial_refund' | 'no_action' | 'escalate';
  reasoning: string;
  compensation?: {
    amount: number;
    recipient: string;
    method: string;
  };
  moderatorId: string;
  createdAt: Date;
}

export interface PlatformAnalytics {
  userActivity: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    newRegistrations: number;
  };
  transactionMetrics: {
    totalDeals: number;
    completedDeals: number;
    disputedDeals: number;
    averageDealValue: number;
    totalVolume: number;
  };
  contentMetrics: {
    totalMessages: number;
    translatedMessages: number;
    flaggedContent: number;
    moderationActions: number;
  };
  trustMetrics: {
    verifiedUsers: number;
    averageTrustScore: number;
    suspendedUsers: number;
    bannedUsers: number;
  };
}

class ContentModerationService {
  private currentModeratorId: string | null = null;

  // Initialize moderator
  setModerator(moderatorId: string): void {
    this.currentModeratorId = moderatorId;
  }

  // Get moderation statistics
  async getModerationStats(): Promise<ModerationStats> {
    try {
      // Get total reports
      const reportsQuery = query(collection(db, 'contentReports'));
      const reportsSnapshot = await getDocs(reportsQuery);
      const totalReports = reportsSnapshot.size;

      // Get pending reports
      const pendingReportsQuery = query(
        collection(db, 'contentReports'),
        where('status', '==', 'pending')
      );
      const pendingReportsSnapshot = await getDocs(pendingReportsQuery);
      const pendingReports = pendingReportsSnapshot.size;

      // Get resolved reports
      const resolvedReportsQuery = query(
        collection(db, 'contentReports'),
        where('status', '==', 'resolved')
      );
      const resolvedReportsSnapshot = await getDocs(resolvedReportsQuery);
      const resolvedReports = resolvedReportsSnapshot.size;

      // Get active disputes
      const activeDisputesQuery = query(
        collection(db, 'disputes'),
        where('status', 'in', ['open', 'investigating'])
      );
      const activeDisputesSnapshot = await getDocs(activeDisputesQuery);
      const activeDisputes = activeDisputesSnapshot.size;

      // Get resolved disputes
      const resolvedDisputesQuery = query(
        collection(db, 'disputes'),
        where('status', '==', 'resolved')
      );
      const resolvedDisputesSnapshot = await getDocs(resolvedDisputesQuery);
      const resolvedDisputes = resolvedDisputesSnapshot.size;

      // Get flagged content count
      const flaggedContentQuery = query(
        collection(db, 'contentViolations'),
        where('status', 'in', ['pending', 'investigating'])
      );
      const flaggedContentSnapshot = await getDocs(flaggedContentQuery);
      const flaggedContent = flaggedContentSnapshot.size;

      // Get moderation actions count (from audit logs)
      const moderationActionsQuery = query(
        collection(db, 'auditLogs'),
        where('action', 'in', ['suspend_user', 'delete_content', 'resolve_dispute', 'ban_user'])
      );
      const moderationActionsSnapshot = await getDocs(moderationActionsQuery);
      const moderationActions = moderationActionsSnapshot.size;

      return {
        totalReports,
        pendingReports,
        resolvedReports,
        activeDisputes,
        resolvedDisputes,
        flaggedContent,
        moderationActions
      };
    } catch (error) {
      console.error('Error getting moderation stats:', error);
      throw new Error('Failed to load moderation statistics');
    }
  }

  // Get content reports with filtering
  async getContentReports(
    status?: 'pending' | 'investigating' | 'resolved' | 'dismissed',
    pageSize: number = 20,
    lastDoc?: QueryDocumentSnapshot
  ): Promise<{
    reports: ContentReport[];
    hasMore: boolean;
    lastDoc?: QueryDocumentSnapshot;
  }> {
    try {
      let reportsQuery = query(collection(db, 'contentReports'));

      if (status) {
        reportsQuery = query(reportsQuery, where('status', '==', status));
      }

      reportsQuery = query(reportsQuery, orderBy('createdAt', 'desc'), limit(pageSize));

      if (lastDoc) {
        reportsQuery = query(reportsQuery, startAfter(lastDoc));
      }

      const snapshot = await getDocs(reportsQuery);
      const reports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: this.parseTimestamp(doc.data().createdAt),
        resolvedAt: doc.data().resolvedAt ? this.parseTimestamp(doc.data().resolvedAt) : undefined
      })) as ContentReport[];

      return {
        reports,
        hasMore: snapshot.docs.length === pageSize,
        lastDoc: snapshot.docs[snapshot.docs.length - 1]
      };
    } catch (error) {
      console.error('Error getting content reports:', error);
      throw new Error('Failed to load content reports');
    }
  }

  // Create content violation report
  async createContentReport(
    reporterId: string,
    targetType: 'user' | 'message' | 'deal',
    targetId: string,
    reason: string,
    description: string
  ): Promise<string> {
    try {
      const report: Omit<ContentReport, 'id'> = {
        reporterId,
        targetType,
        targetId,
        reason,
        description,
        status: 'pending',
        createdAt: new Date()
      };

      const reportDoc = await addDoc(collection(db, 'contentReports'), {
        ...report,
        createdAt: serverTimestamp()
      });

      // Log the report creation
      await this.logModerationAction(
        'create_report',
        'content',
        reportDoc.id,
        { targetType, targetId, reason }
      );

      return reportDoc.id;
    } catch (error) {
      console.error('Error creating content report:', error);
      throw new Error('Failed to create content report');
    }
  }

  // Investigate content report
  async investigateReport(reportId: string, notes?: string): Promise<void> {
    try {
      if (!this.currentModeratorId) {
        throw new Error('Moderator authentication required');
      }

      const reportDoc = doc(db, 'contentReports', reportId);
      await updateDoc(reportDoc, {
        status: 'investigating',
        moderatorId: this.currentModeratorId,
        investigationNotes: notes,
        updatedAt: serverTimestamp()
      });

      // Log the investigation
      await this.logModerationAction(
        'investigate_report',
        'content',
        reportId,
        { notes }
      );
    } catch (error) {
      console.error('Error investigating report:', error);
      throw new Error('Failed to start investigation');
    }
  }

  // Resolve content report
  async resolveReport(
    reportId: string,
    resolution: string,
    action?: 'warn_user' | 'suspend_user' | 'delete_content' | 'no_action'
  ): Promise<void> {
    try {
      if (!this.currentModeratorId) {
        throw new Error('Moderator authentication required');
      }

      const reportDoc = doc(db, 'contentReports', reportId);
      await updateDoc(reportDoc, {
        status: 'resolved',
        resolution,
        moderatorAction: action,
        resolvedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Execute the action if specified
      if (action && action !== 'no_action') {
        await this.executeModerationAction(reportId, action);
      }

      // Log the resolution
      await this.logModerationAction(
        'resolve_report',
        'content',
        reportId,
        { resolution, action }
      );
    } catch (error) {
      console.error('Error resolving report:', error);
      throw new Error('Failed to resolve report');
    }
  }

  // Get disputes with filtering
  async getDisputes(
    status?: 'open' | 'investigating' | 'resolved' | 'escalated',
    pageSize: number = 20,
    lastDoc?: QueryDocumentSnapshot
  ): Promise<{
    disputes: Dispute[];
    hasMore: boolean;
    lastDoc?: QueryDocumentSnapshot;
  }> {
    try {
      let disputesQuery = query(collection(db, 'disputes'));

      if (status) {
        disputesQuery = query(disputesQuery, where('status', '==', status));
      }

      disputesQuery = query(disputesQuery, orderBy('createdAt', 'desc'), limit(pageSize));

      if (lastDoc) {
        disputesQuery = query(disputesQuery, startAfter(lastDoc));
      }

      const snapshot = await getDocs(disputesQuery);
      const disputes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: this.parseTimestamp(doc.data().createdAt),
        resolvedAt: doc.data().resolvedAt ? this.parseTimestamp(doc.data().resolvedAt) : undefined
      })) as Dispute[];

      return {
        disputes,
        hasMore: snapshot.docs.length === pageSize,
        lastDoc: snapshot.docs[snapshot.docs.length - 1]
      };
    } catch (error) {
      console.error('Error getting disputes:', error);
      throw new Error('Failed to load disputes');
    }
  }

  // Resolve dispute
  async resolveDispute(
    disputeId: string,
    resolution: 'refund' | 'replacement' | 'partial_refund' | 'no_action' | 'escalate',
    reasoning: string,
    compensation?: {
      amount: number;
      recipient: string;
      method: string;
    }
  ): Promise<void> {
    try {
      if (!this.currentModeratorId) {
        throw new Error('Moderator authentication required');
      }

      const disputeDoc = doc(db, 'disputes', disputeId);
      await updateDoc(disputeDoc, {
        status: resolution === 'escalate' ? 'escalated' : 'resolved',
        resolution: reasoning,
        resolvedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Create dispute resolution record
      const disputeResolution: Omit<DisputeResolution, 'id'> = {
        disputeId,
        resolution,
        reasoning,
        compensation,
        moderatorId: this.currentModeratorId,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'disputeResolutions'), {
        ...disputeResolution,
        createdAt: serverTimestamp()
      });

      // Log the resolution
      await this.logModerationAction(
        'resolve_dispute',
        'deal',
        disputeId,
        { resolution, reasoning, compensation }
      );
    } catch (error) {
      console.error('Error resolving dispute:', error);
      throw new Error('Failed to resolve dispute');
    }
  }

  // Get platform analytics
  async getPlatformAnalytics(_dateRange?: { start: Date; end: Date }): Promise<PlatformAnalytics> {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // User activity metrics
      const dailyActiveQuery = query(
        collection(db, 'users'),
        where('updatedAt', '>=', oneDayAgo)
      );
      const dailyActiveSnapshot = await getDocs(dailyActiveQuery);
      const dailyActiveUsers = dailyActiveSnapshot.size;

      const weeklyActiveQuery = query(
        collection(db, 'users'),
        where('updatedAt', '>=', oneWeekAgo)
      );
      const weeklyActiveSnapshot = await getDocs(weeklyActiveQuery);
      const weeklyActiveUsers = weeklyActiveSnapshot.size;

      const monthlyActiveQuery = query(
        collection(db, 'users'),
        where('updatedAt', '>=', oneMonthAgo)
      );
      const monthlyActiveSnapshot = await getDocs(monthlyActiveQuery);
      const monthlyActiveUsers = monthlyActiveSnapshot.size;

      const newRegistrationsQuery = query(
        collection(db, 'users'),
        where('createdAt', '>=', oneMonthAgo)
      );
      const newRegistrationsSnapshot = await getDocs(newRegistrationsQuery);
      const newRegistrations = newRegistrationsSnapshot.size;

      // Transaction metrics
      const dealsQuery = query(collection(db, 'deals'));
      const dealsSnapshot = await getDocs(dealsQuery);
      const totalDeals = dealsSnapshot.size;

      const completedDealsQuery = query(
        collection(db, 'deals'),
        where('status', '==', 'completed')
      );
      const completedDealsSnapshot = await getDocs(completedDealsQuery);
      const completedDeals = completedDealsSnapshot.size;

      const disputedDealsQuery = query(
        collection(db, 'deals'),
        where('status', '==', 'disputed')
      );
      const disputedDealsSnapshot = await getDocs(disputedDealsQuery);
      const disputedDeals = disputedDealsSnapshot.size;

      // Calculate average deal value and total volume
      let totalVolume = 0;
      let totalValue = 0;
      dealsSnapshot.docs.forEach(doc => {
        const deal = doc.data();
        const dealValue = deal.agreedPrice * deal.quantity;
        totalValue += dealValue;
        totalVolume += deal.quantity;
      });
      const averageDealValue = totalDeals > 0 ? totalValue / totalDeals : 0;

      // Content metrics
      const messagesQuery = query(collection(db, 'messages'));
      const messagesSnapshot = await getDocs(messagesQuery);
      const totalMessages = messagesSnapshot.size;

      const translatedMessagesQuery = query(
        collection(db, 'messages'),
        where('content.translations', '!=', null)
      );
      const translatedMessagesSnapshot = await getDocs(translatedMessagesQuery);
      const translatedMessages = translatedMessagesSnapshot.size;

      const flaggedContentQuery = query(
        collection(db, 'contentReports'),
        where('status', 'in', ['pending', 'investigating'])
      );
      const flaggedContentSnapshot = await getDocs(flaggedContentQuery);
      const flaggedContent = flaggedContentSnapshot.size;

      const moderationActionsQuery = query(
        collection(db, 'auditLogs'),
        where('action', 'in', ['suspend_user', 'delete_content', 'resolve_dispute'])
      );
      const moderationActionsSnapshot = await getDocs(moderationActionsQuery);
      const moderationActions = moderationActionsSnapshot.size;

      // Trust metrics
      const verifiedUsersQuery = query(
        collection(db, 'users'),
        where('verificationStatus', '==', 'verified')
      );
      const verifiedUsersSnapshot = await getDocs(verifiedUsersQuery);
      const verifiedUsers = verifiedUsersSnapshot.size;

      const suspendedUsersQuery = query(
        collection(db, 'users'),
        where('suspended', '==', true)
      );
      const suspendedUsersSnapshot = await getDocs(suspendedUsersQuery);
      const suspendedUsers = suspendedUsersSnapshot.size;

      // Calculate average trust score
      const userProfilesQuery = query(collection(db, 'userProfiles'));
      const userProfilesSnapshot = await getDocs(userProfilesQuery);
      let totalTrustScore = 0;
      let trustScoreCount = 0;
      userProfilesSnapshot.docs.forEach(doc => {
        const profile = doc.data();
        if (profile.trustData && profile.trustData.trustScore) {
          totalTrustScore += profile.trustData.trustScore;
          trustScoreCount++;
        }
      });
      const averageTrustScore = trustScoreCount > 0 ? totalTrustScore / trustScoreCount : 0;

      return {
        userActivity: {
          dailyActiveUsers,
          weeklyActiveUsers,
          monthlyActiveUsers,
          newRegistrations
        },
        transactionMetrics: {
          totalDeals,
          completedDeals,
          disputedDeals,
          averageDealValue,
          totalVolume
        },
        contentMetrics: {
          totalMessages,
          translatedMessages,
          flaggedContent,
          moderationActions
        },
        trustMetrics: {
          verifiedUsers,
          averageTrustScore,
          suspendedUsers,
          bannedUsers: 0 // This would need a separate banned status
        }
      };
    } catch (error) {
      console.error('Error getting platform analytics:', error);
      throw new Error('Failed to load platform analytics');
    }
  }

  // Execute moderation action
  private async executeModerationAction(reportId: string, action: string): Promise<void> {
    try {
      // Get the report to understand what needs to be acted upon
      const reportDoc = doc(db, 'contentReports', reportId);
      const reportSnap = await getDoc(reportDoc);

      if (!reportSnap.exists()) {
        throw new Error('Report not found');
      }

      const report = reportSnap.data() as ContentReport;

      switch (action) {
        case 'warn_user':
          await this.warnUser(report.targetId, `Content violation: ${report.reason}`);
          break;
        case 'suspend_user':
          await this.suspendUser(report.targetId, `Content violation: ${report.reason}`);
          break;
        case 'delete_content':
          await this.deleteContent(report.targetType, report.targetId);
          break;
      }
    } catch (error) {
      console.error('Error executing moderation action:', error);
      throw error;
    }
  }

  // Warn user
  private async warnUser(userId: string, reason: string): Promise<void> {
    // This would typically send a notification to the user
    // For now, we'll just log it
    await this.logModerationAction('warn_user', 'user', userId, { reason });
  }

  // Suspend user
  private async suspendUser(userId: string, reason: string): Promise<void> {
    const userDoc = doc(db, 'users', userId);
    await updateDoc(userDoc, {
      suspended: true,
      suspensionReason: reason,
      suspendedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await this.logModerationAction('suspend_user', 'user', userId, { reason });
  }

  // Delete content
  private async deleteContent(contentType: string, contentId: string): Promise<void> {
    let collectionName = '';
    switch (contentType) {
      case 'message':
        collectionName = 'messages';
        break;
      case 'deal':
        collectionName = 'deals';
        break;
      default:
        throw new Error(`Unsupported content type: ${contentType}`);
    }

    const contentDoc = doc(db, collectionName, contentId);
    await updateDoc(contentDoc, {
      deleted: true,
      deletedAt: serverTimestamp(),
      deletedBy: this.currentModeratorId
    });

    await this.logModerationAction('delete_content', contentType as any, contentId, {});
  }

  // Log moderation action
  private async logModerationAction(
    action: string,
    targetType: 'user' | 'deal' | 'price' | 'content',
    targetId: string,
    details: any
  ): Promise<void> {
    try {
      if (!this.currentModeratorId) {
        return;
      }

      const auditLog: Omit<AuditLog, 'id'> = {
        adminId: this.currentModeratorId,
        action,
        targetType,
        targetId,
        details,
        timestamp: new Date()
      };

      await addDoc(collection(db, 'auditLogs'), {
        ...auditLog,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging moderation action:', error);
    }
  }

  // Helper method to parse timestamps
  private parseTimestamp(value: unknown): Date {
    if (!value) return new Date();

    if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as any).toDate === 'function') {
      try {
        return (value as any).toDate();
      } catch (e) {
        console.warn('Failed to convert Firestore timestamp:', e);
      }
    }

    const date = new Date(value as any);
    if (isNaN(date.getTime())) {
      return new Date();
    }

    return date;
  }
}

// Export singleton instance
export const contentModerationService = new ContentModerationService();

// Export the class for testing
export { ContentModerationService };