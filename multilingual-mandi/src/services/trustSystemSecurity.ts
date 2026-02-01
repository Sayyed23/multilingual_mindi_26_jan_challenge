// Trust System Security Service
// Handles suspicious behavior detection, account restrictions, and privacy controls
// Implements security reporting, account flagging, and profile visibility management
// Provides audit logging and administrative security features

import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { trustSystemService } from './trustSystem';
import { profileManagementService } from './profileManagement';
import type {
  PrivacySettings,
} from '../types';

// Security-specific types
export interface SecurityAlert {
  id: string;
  userId: string;
  alertType: 'suspicious_activity' | 'account_flagged' | 'privacy_violation' | 'trust_violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  status: 'active' | 'investigating' | 'resolved' | 'dismissed';
  evidence?: any;
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface BehaviorPattern {
  userId: string;
  patternType: 'rapid_messaging' | 'fake_reviews' | 'price_manipulation' | 'spam_reporting' | 'account_farming';
  confidence: number; // 0-1
  evidence: string[];
  detectedAt: Date;
}

export interface PrivacyAuditEntry {
  userId: string;
  action: 'profile_view' | 'contact_access' | 'privacy_change' | 'data_export' | 'data_deletion';
  performedBy: string;
  details: any;
  timestamp: Date;
}

export type ProfileVisibility = 'public' | 'verified_only' | 'private' | 'restricted';
export type RestrictionType = 'warning' | 'limited' | 'suspended' | 'banned';

export class TrustSystemSecurityService {
  private readonly BEHAVIOR_ANALYSIS_WINDOW = 24 * 60 * 60 * 1000; // 24 hours
  private readonly AUTO_RESTRICTION_THRESHOLDS = {
    rapid_messaging: { confidence: 0.8, action: 'limited' as RestrictionType },
    fake_reviews: { confidence: 0.9, action: 'suspended' as RestrictionType },
    price_manipulation: { confidence: 0.85, action: 'suspended' as RestrictionType },
    spam_reporting: { confidence: 0.7, action: 'warning' as RestrictionType },
    account_farming: { confidence: 0.95, action: 'banned' as RestrictionType }
  };

  // Detect suspicious behavior patterns
  async detectSuspiciousBehavior(
    userId: string,
    activityType: string,
    activityData?: any
  ): Promise<void> {
    try {
      // Analyze behavior patterns
      const patterns = await this.analyzeBehaviorPatterns(userId, activityType, activityData);

      // Create security alerts for high-confidence patterns
      for (const pattern of patterns) {
        if (pattern.confidence > 0.6) {
          await this.createSecurityAlert({
            userId: pattern.userId,
            alertType: 'suspicious_activity',
            severity: this.mapConfidenceToSeverity(pattern.confidence),
            description: `Suspicious ${pattern.patternType} detected`,
            status: 'active',
            evidence: {
              pattern: pattern.patternType,
              confidence: pattern.confidence,
              evidence: pattern.evidence,
              activityType,
              activityData
            }
          });

          // Apply automatic restrictions for very high confidence patterns
          const threshold = this.AUTO_RESTRICTION_THRESHOLDS[pattern.patternType as keyof typeof this.AUTO_RESTRICTION_THRESHOLDS];
          if (threshold && pattern.confidence >= threshold.confidence) {
            await this.applyAutomaticRestrictions(userId, pattern, threshold.action);
          }
        }
      }
    } catch (error) {
      console.error('Error detecting suspicious behavior:', error);
      // Don't throw - this is a background security process
    }
  }

  // Flag account for manual review
  async flagAccountForReview(
    userId: string,
    reason: string,
    flaggedBy: string,
    evidence?: any
  ): Promise<void> {
    try {
      // Create security alert
      await this.createSecurityAlert({
        userId,
        alertType: 'account_flagged',
        severity: 'high',
        description: `Account flagged for review: ${reason}`,
        status: 'active',
        evidence: { reason, flaggedBy, evidence }
      });

      // Update user profile status
      const profileDoc = doc(db, 'userProfiles', userId);
      await updateDoc(profileDoc, {
        'trustData.accountStatus': 'under_review',
        'trustData.flaggedAt': serverTimestamp(),
        'trustData.flaggedBy': flaggedBy,
        'trustData.flagReason': reason,
        updatedAt: serverTimestamp()
      });

      // Notify administrators
      await this.notifyAdministrators('account_flagged', {
        userId,
        reason,
        flaggedBy,
        evidence
      });

      console.log(`Account ${userId} flagged for review by ${flaggedBy}: ${reason}`);
    } catch (error) {
      console.error('Error flagging account for review:', error);
      throw error;
    }
  }

  // Apply account restrictions
  async applyAccountRestrictions(
    userId: string,
    restrictionType: RestrictionType,
    reason: string,
    durationMs?: number
  ): Promise<void> {
    try {
      const startDate = new Date();
      const endDate = durationMs ? new Date(Date.now() + durationMs) : undefined;

      // Define restrictions based on type
      const restrictions = this.getRestrictionsForType(restrictionType);

      // Apply restriction through trust system
      await trustSystemService.applyAccountRestriction(userId, {
        type: restrictionType,
        reason,
        startDate,
        endDate,
        restrictions
      });

      // Log security action
      await this.logSecurityAction({
        userId,
        action: 'apply_restriction',
        details: {
          restrictionType,
          reason,
          duration: durationMs,
          restrictions
        }
      });

      // Penalize trust score
      await this.penalizeTrustScore(userId, restrictionType);

      console.log(`Account restrictions applied to ${userId}: ${restrictionType}`);
    } catch (error) {
      console.error('Error applying account restrictions:', error);
      throw error;
    }
  }

  // Update privacy controls with validation and audit
  async updatePrivacyControls(
    userId: string,
    privacySettings: Partial<PrivacySettings>,
    performedBy: string
  ): Promise<void> {
    try {
      // Validate privacy settings
      this.validatePrivacySettings(privacySettings);

      // Check permissions
      const hasPermission = await this.checkPrivacyModificationPermission(userId, performedBy);
      if (!hasPermission) {
        throw new Error('Insufficient permissions to modify privacy settings');
      }

      // Update privacy settings
      const success = await profileManagementService.updatePrivacySettings(userId, privacySettings);
      if (!success) {
        throw new Error('Failed to update privacy settings');
      }

      // Log privacy audit
      await this.logPrivacyAudit({
        userId,
        action: 'privacy_change',
        performedBy,
        details: { changes: privacySettings },
        timestamp: new Date()
      });

      console.log(`Privacy settings updated for user ${userId} by ${performedBy}`);
    } catch (error) {
      console.error('Error updating privacy controls:', error);
      throw error;
    }
  }

  // Get effective profile visibility considering restrictions and trust level
  async getEffectiveProfileVisibility(userId: string, viewerId: string): Promise<ProfileVisibility> {
    try {
      const profile = await profileManagementService.getUserProfile(userId);
      if (!profile) {
        return 'private';
      }

      // Check for account restrictions
      const restrictions = await trustSystemService.getAccountRestrictions(userId);
      const hasVisibilityRestriction = restrictions.some(r =>
        r.restrictions.includes('limited_visibility') || r.type === 'suspended' || r.type === 'banned'
      );

      if (hasVisibilityRestriction) {
        await this.logPrivacyAudit({
          userId,
          action: 'profile_view',
          performedBy: viewerId,
          details: { visibility: 'restricted', reason: 'account_restrictions' },
          timestamp: new Date()
        });
        return 'restricted';
      }

      // Check trust level for automatic visibility adjustment
      const trustIndicators = await trustSystemService.getTrustIndicators(userId);
      if (trustIndicators.overallScore < 30 && profile.preferences.privacy.profileVisibility === 'public') {
        // Low trust users get limited visibility even if they set public
        await this.logPrivacyAudit({
          userId,
          action: 'profile_view',
          performedBy: viewerId,
          details: {
            visibility: 'verified_only',
            reason: 'low_trust_score',
            trustScore: trustIndicators.overallScore
          },
          timestamp: new Date()
        });
        return 'verified_only';
      }

      // Return user's preference
      return profile.preferences.privacy.profileVisibility as ProfileVisibility;
    } catch (error) {
      console.error('Error getting effective profile visibility:', error);
      return 'private'; // Fail safe
    }
  }

  // Get security alerts for a user
  async getSecurityAlerts(userId: string, status?: string): Promise<SecurityAlert[]> {
    try {
      const alertsRef = collection(db, 'securityAlerts');
      let q = query(alertsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));

      if (status) {
        q = query(alertsRef, where('userId', '==', userId), where('status', '==', status), orderBy('createdAt', 'desc'));
      }

      const querySnapshot = await getDocs(q);
      const alerts: SecurityAlert[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        alerts.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          resolvedAt: data.resolvedAt?.toDate()
        } as SecurityAlert);
      });

      return alerts;
    } catch (error) {
      console.error('Error getting security alerts:', error);
      return [];
    }
  }

  // Resolve security alert
  async resolveSecurityAlert(
    alertId: string,
    status: 'resolved' | 'dismissed',
    resolvedBy: string,
    resolutionNotes?: string
  ): Promise<void> {
    try {
      const alertDoc = doc(db, 'securityAlerts', alertId);
      await updateDoc(alertDoc, {
        status,
        resolvedAt: serverTimestamp(),
        resolvedBy,
        resolutionNotes: resolutionNotes || ''
      });

      console.log(`Security alert ${alertId} ${status} by ${resolvedBy}`);
    } catch (error) {
      console.error('Error resolving security alert:', error);
      throw error;
    }
  }

  // Get privacy audit log
  async getPrivacyAuditLog(userId: string, limitCount: number = 50): Promise<PrivacyAuditEntry[]> {
    try {
      const auditRef = collection(db, 'privacyAuditLog');
      const q = query(
        auditRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const auditLog: PrivacyAuditEntry[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        auditLog.push({
          ...data,
          timestamp: data.timestamp.toDate()
        } as PrivacyAuditEntry);
      });

      return auditLog;
    } catch (error) {
      console.error('Error getting privacy audit log:', error);
      return [];
    }
  }

  // Private helper methods

  private async analyzeBehaviorPatterns(
    userId: string,
    activityType: string,
    activityData?: any
  ): Promise<BehaviorPattern[]> {
    const patterns: BehaviorPattern[] = [];
    const now = new Date();
    const windowStart = new Date(now.getTime() - this.BEHAVIOR_ANALYSIS_WINDOW);

    try {
      // Analyze rapid messaging pattern
      if (activityType === 'send_message') {
        const messageCount = activityData?.messageCount || 1;
        if (messageCount > 15) { // More than 15 messages in analysis window
          patterns.push({
            userId,
            patternType: 'rapid_messaging',
            confidence: Math.min(messageCount / 20, 1), // Scale confidence
            evidence: [`${messageCount} messages in ${this.BEHAVIOR_ANALYSIS_WINDOW / (60 * 1000)} minutes`],
            detectedAt: now
          });
        }
      }

      // Analyze fake reviews pattern
      if (activityType === 'submit_feedback') {
        const recentFeedback = await this.getRecentUserActivity(userId, 'feedback', windowStart);
        if (recentFeedback.length > 5) {
          // Check for suspicious patterns in feedback
          const suspiciousPatterns = this.detectFakeReviewPatterns(recentFeedback);
          if (suspiciousPatterns.length > 0) {
            patterns.push({
              userId,
              patternType: 'fake_reviews',
              confidence: 0.8,
              evidence: suspiciousPatterns,
              detectedAt: now
            });
          }
        }
      }

      // Analyze spam reporting pattern
      if (activityType === 'report_user') {
        const recentReports = await this.getRecentUserActivity(userId, 'reports', windowStart);
        if (recentReports.length > 3) {
          patterns.push({
            userId,
            patternType: 'spam_reporting',
            confidence: Math.min(recentReports.length / 5, 1),
            evidence: [`${recentReports.length} reports in 24 hours`],
            detectedAt: now
          });
        }
      }

      return patterns;
    } catch (error) {
      console.error('Error analyzing behavior patterns:', error);
      return [];
    }
  }

  private async createSecurityAlert(alert: Omit<SecurityAlert, 'id' | 'createdAt'>): Promise<void> {
    try {
      await addDoc(collection(db, 'securityAlerts'), {
        ...alert,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating security alert:', error);
      throw error;
    }
  }

  private mapConfidenceToSeverity(confidence: number): SecurityAlert['severity'] {
    if (confidence >= 0.9) return 'critical';
    if (confidence >= 0.7) return 'high';
    if (confidence >= 0.5) return 'medium';
    return 'low';
  }

  private async applyAutomaticRestrictions(
    userId: string,
    pattern: BehaviorPattern,
    restrictionType: RestrictionType
  ): Promise<void> {
    const duration = this.getRestrictionDuration(restrictionType);
    await this.applyAccountRestrictions(
      userId,
      restrictionType,
      `Automatic restriction: ${pattern.patternType} detected (confidence: ${pattern.confidence})`,
      duration
    );
  }

  private getRestrictionsForType(type: RestrictionType): string[] {
    switch (type) {
      case 'warning':
        return ['warning_issued'];
      case 'limited':
        return ['limited_messaging', 'limited_deals', 'limited_visibility'];
      case 'suspended':
        return ['no_deals', 'no_messaging', 'limited_visibility', 'no_reviews'];
      case 'banned':
        return ['no_access', 'no_deals', 'no_messaging', 'no_visibility'];
      default:
        return [];
    }
  }

  private getRestrictionDuration(type: RestrictionType): number | undefined {
    switch (type) {
      case 'warning':
        return undefined; // Permanent record
      case 'limited':
        return 7 * 24 * 60 * 60 * 1000; // 7 days
      case 'suspended':
        return 30 * 24 * 60 * 60 * 1000; // 30 days
      case 'banned':
        return undefined; // Permanent
      default:
        return undefined;
    }
  }

  private validatePrivacySettings(settings: Partial<PrivacySettings>): void {
    const validVisibilityOptions = ['public', 'verified_only', 'private'];

    if (settings.profileVisibility && !validVisibilityOptions.includes(settings.profileVisibility)) {
      throw new Error('Invalid privacy settings');
    }

    // Add more validation as needed
  }

  private async checkPrivacyModificationPermission(userId: string, performedBy: string): Promise<boolean> {
    // Users can modify their own privacy settings
    if (userId === performedBy) {
      return true;
    }

    // Check if performedBy is an admin (simplified check)
    try {
      const adminDoc = await getDoc(doc(db, 'adminUsers', performedBy));
      return adminDoc.exists();
    } catch (error) {
      console.error('Error checking admin permissions:', error);
      return false;
    }
  }

  private async logSecurityAction(action: {
    userId: string;
    action: string;
    details: any;
  }): Promise<void> {
    try {
      await addDoc(collection(db, 'securityAuditLog'), {
        ...action,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging security action:', error);
    }
  }

  private async logPrivacyAudit(entry: PrivacyAuditEntry): Promise<void> {
    try {
      await addDoc(collection(db, 'privacyAuditLog'), {
        ...entry,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging privacy audit:', error);
    }
  }

  private async penalizeTrustScore(userId: string, restrictionType: RestrictionType): Promise<void> {
    try {
      const penalties = {
        warning: 5,
        limited: 15,
        suspended: 30,
        banned: 50
      };

      const penalty = penalties[restrictionType];
      const profileDoc = doc(db, 'userProfiles', userId);

      // Get current trust score
      const profile = await profileManagementService.getUserProfile(userId);
      if (profile) {
        const newScore = Math.max(profile.trustData.trustScore - penalty, 0);
        await updateDoc(profileDoc, {
          'trustData.trustScore': newScore,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error penalizing trust score:', error);
    }
  }

  private async notifyAdministrators(eventType: string, data: any): Promise<void> {
    try {
      // Create admin notification
      await addDoc(collection(db, 'adminNotifications'), {
        eventType,
        data,
        status: 'pending',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error notifying administrators:', error);
    }
  }

  private async getRecentUserActivity(
    _userId: string,
    _activityType: string,
    _since: Date
  ): Promise<any[]> {
    try {
      // This would query specific activity collections based on type
      // Simplified implementation for demo
      const activities: any[] = [];
      return activities;
    } catch (error) {
      console.error('Error getting recent user activity:', error);
      return [];
    }
  }

  private detectFakeReviewPatterns(feedback: any[]): string[] {
    const patterns: string[] = [];

    // Check for identical ratings
    const ratings = feedback.map(f => f.rating);
    const uniqueRatings = new Set(ratings);
    if (uniqueRatings.size === 1 && feedback.length > 3) {
      patterns.push('Identical ratings across multiple reviews');
    }

    // Check for rapid submission
    const timestamps = feedback.map(f => f.timestamp).sort();
    for (let i = 1; i < timestamps.length; i++) {
      if (timestamps[i] - timestamps[i - 1] < 60000) { // Less than 1 minute apart
        patterns.push('Reviews submitted in rapid succession');
        break;
      }
    }

    return patterns;
  }
}

// Export singleton instance
export const trustSystemSecurityService = new TrustSystemSecurityService();