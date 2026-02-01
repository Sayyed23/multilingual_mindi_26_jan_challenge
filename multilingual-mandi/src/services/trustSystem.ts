// Trust System Service
// Handles user verification, trust score calculation, and security reporting
// Implements verification badge management and account restrictions
// Manages suspicious behavior reporting and privacy controls

import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  arrayUnion
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { offlineSyncService } from './offlineSync';
import { profileManagementService } from './profileManagement';
import type {
  UserProfile,
  TrustIndicators,
  VerificationBadge,
  VerificationDocument,
  VerificationResult,
  Feedback,
  Transaction,
  ContentReport,
  TrustService as ITrustService
} from '../types';

interface TrustScoreFactors {
  transactionCount: number;
  averageRating: number;
  completionRate: number;
  disputeRate: number;
  verificationLevel: number;
  accountAge: number; // in days
}

interface AccountRestriction {
  type: 'warning' | 'limited' | 'suspended' | 'banned';
  reason: string;
  startDate: Date;
  endDate?: Date;
  restrictions: string[];
}

interface SuspiciousActivity {
  userId: string;
  activityType: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: Date;
  reportedBy?: string;
}

class TrustSystemService implements ITrustService {
  private readonly TRUST_SCORE_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  private readonly VERIFICATION_CACHE_TTL = 60 * 60 * 1000; // 1 hour

  // Get user profile with trust data
  async getUserProfile(userId: string): Promise<UserProfile> {
    const profile = await profileManagementService.getUserProfile(userId);
    if (!profile) {
      throw new Error('User profile not found');
    }
    return profile;
  }

  // Get comprehensive trust indicators for a user
  async getTrustIndicators(userId: string): Promise<TrustIndicators> {
    try {
      // Check cache first
      const cacheKey = `trust_indicators_${userId}`;
      const cached = await offlineSyncService.getCachedData<TrustIndicators>(cacheKey);
      if (cached) {
        return cached;
      }

      const profile = await this.getUserProfile(userId);
      const verificationBadges = await this.getVerificationBadges(userId);
      const recentFeedback = await this.getRecentFeedback(userId, 10);
      
      const trustIndicators: TrustIndicators = {
        overallScore: profile.trustData.trustScore,
        transactionCount: profile.trustData.transactionHistory.length,
        averageRating: this.calculateAverageRating(recentFeedback),
        verificationBadges,
        recentFeedback
      };

      // Cache the result
      await offlineSyncService.cacheData(cacheKey, trustIndicators, this.TRUST_SCORE_CACHE_TTL);
      
      return trustIndicators;
    } catch (error) {
      console.error('Error getting trust indicators:', error);
      throw error;
    }
  }

  // Update trust score based on transaction performance
  async updateTrustScore(userId: string, transaction: Transaction): Promise<void> {
    try {
      const currentFactors = await this.calculateTrustScoreFactors(userId);
      
      // Update factors based on new transaction
      const updatedFactors = this.updateFactorsWithTransaction(currentFactors, transaction);
      
      // Calculate new trust score
      const newTrustScore = this.calculateTrustScore(updatedFactors);
      
      // Update profile with new trust score
      const profileDoc = doc(db, 'userProfiles', userId);
      await updateDoc(profileDoc, {
        'trustData.trustScore': newTrustScore,
        'trustData.transactionHistory': arrayUnion({
          id: transaction.id,
          type: transaction.participants.buyer === userId ? 'buy' : 'sell',
          commodity: transaction.commodity.name,
          amount: transaction.pricing.finalPrice,
          date: transaction.timeline.completed || new Date(),
          counterparty: transaction.participants.buyer === userId 
            ? transaction.participants.seller 
            : transaction.participants.buyer
        }),
        updatedAt: serverTimestamp()
      });

      // Clear trust indicators cache
      const cacheKey = `trust_indicators_${userId}`;
      await offlineSyncService.cacheData(cacheKey, null, 0); // Clear cache

      console.log(`Trust score updated for user ${userId}: ${newTrustScore}`);
    } catch (error) {
      console.error('Error updating trust score:', error);
      throw error;
    }
  }

  // Verify user with documents
  async verifyUser(userId: string, documents: VerificationDocument[]): Promise<VerificationResult> {
    try {
      const verificationDoc = {
        userId,
        documents,
        status: 'pending' as const,
        submittedAt: serverTimestamp(),
        processedAt: null,
        processedBy: null,
        notes: ''
      };

      // Store verification request
      await addDoc(collection(db, 'verificationRequests'), verificationDoc);

      // Process documents (simplified - in real implementation would integrate with document verification service)
      const verificationBadges = await this.processVerificationDocuments(documents);
      
      // Update user profile with verification status
      const profileDoc = doc(db, 'userProfiles', userId);
      await updateDoc(profileDoc, {
        'trustData.verificationStatus': verificationBadges.length > 0 ? 'verified' : 'pending',
        updatedAt: serverTimestamp()
      });

      // Store verification badges
      await this.updateVerificationBadges(userId, verificationBadges);

      const result: VerificationResult = {
        success: true,
        documentsProcessed: documents.length,
        verificationBadges,
        pendingRequirements: this.getPendingVerificationRequirements(verificationBadges)
      };

      return result;
    } catch (error) {
      console.error('Error verifying user:', error);
      return {
        success: false,
        documentsProcessed: 0,
        verificationBadges: [],
        pendingRequirements: ['Verification failed. Please try again.']
      };
    }
  }

  // Report suspicious user behavior
  async reportUser(reporterId: string, reportedId: string, reason: string): Promise<void> {
    try {
      if (reporterId === reportedId) {
        throw new Error('Cannot report yourself');
      }

      // Check if reporter exists and is verified
      const reporterProfile = await this.getUserProfile(reporterId);
      if (reporterProfile.trustData.verificationStatus === 'unverified') {
        throw new Error('Only verified users can report suspicious behavior');
      }

      // Create report
      const report: ContentReport = {
        id: crypto.randomUUID(),
        reporterId,
        targetType: 'user',
        targetId: reportedId,
        reason,
        description: `User reported for: ${reason}`,
        status: 'pending',
        createdAt: new Date(),
        resolvedAt: undefined,
        resolution: undefined
      };

      // Store report
      await addDoc(collection(db, 'contentReports'), {
        ...report,
        createdAt: serverTimestamp()
      });

      // Log suspicious activity
      await this.logSuspiciousActivity({
        userId: reportedId,
        activityType: 'user_report',
        severity: this.determineSeverity(reason),
        description: `Reported by user ${reporterId} for: ${reason}`,
        timestamp: new Date(),
        reportedBy: reporterId
      });

      // Check if user should be automatically flagged
      await this.checkForAutomaticRestrictions(reportedId);

      console.log(`User ${reportedId} reported by ${reporterId} for: ${reason}`);
    } catch (error) {
      console.error('Error reporting user:', error);
      throw error;
    }
  }

  // Get verification badges for a user
  async getVerificationBadges(userId: string): Promise<VerificationBadge[]> {
    try {
      const cacheKey = `verification_badges_${userId}`;
      const cached = await offlineSyncService.getCachedData<VerificationBadge[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const badgesDoc = doc(db, 'verificationBadges', userId);
      const docSnap = await getDoc(badgesDoc);
      
      let badges: VerificationBadge[] = [];
      if (docSnap.exists()) {
        badges = docSnap.data().badges || [];
      }

      // Cache the result
      await offlineSyncService.cacheData(cacheKey, badges, this.VERIFICATION_CACHE_TTL);
      
      return badges;
    } catch (error) {
      console.error('Error getting verification badges:', error);
      return [];
    }
  }

  // Check if user has account restrictions
  async getAccountRestrictions(userId: string): Promise<AccountRestriction[]> {
    try {
      const restrictionsRef = collection(db, 'accountRestrictions');
      const q = query(restrictionsRef, where('userId', '==', userId), where('active', '==', true));
      const querySnapshot = await getDocs(q);
      
      const restrictions: AccountRestriction[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        restrictions.push({
          type: data.type,
          reason: data.reason,
          startDate: data.startDate.toDate(),
          endDate: data.endDate?.toDate(),
          restrictions: data.restrictions || []
        });
      });

      return restrictions;
    } catch (error) {
      console.error('Error getting account restrictions:', error);
      return [];
    }
  }

  // Apply account restriction
  async applyAccountRestriction(userId: string, restriction: AccountRestriction): Promise<void> {
    try {
      await addDoc(collection(db, 'accountRestrictions'), {
        userId,
        type: restriction.type,
        reason: restriction.reason,
        startDate: serverTimestamp(),
        endDate: restriction.endDate ? restriction.endDate : null,
        restrictions: restriction.restrictions,
        active: true,
        appliedBy: 'system', // In real implementation, would track admin user
        appliedAt: serverTimestamp()
      });

      // Update user profile to reflect restriction
      const profileDoc = doc(db, 'userProfiles', userId);
      await updateDoc(profileDoc, {
        'trustData.accountStatus': restriction.type,
        updatedAt: serverTimestamp()
      });

      console.log(`Account restriction applied to user ${userId}: ${restriction.type}`);
    } catch (error) {
      console.error('Error applying account restriction:', error);
      throw error;
    }
  }

  // Add feedback for a user
  async addFeedback(feedback: Omit<Feedback, 'id' | 'createdAt'>): Promise<void> {
    try {
      const feedbackDoc = {
        ...feedback,
        id: crypto.randomUUID(),
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'feedback'), feedbackDoc);

      // Update trust score based on new feedback
      const transaction: Transaction = {
        id: feedback.dealId,
        type: 'deal',
        participants: {
          buyer: feedback.fromUserId === feedback.toUserId ? 'unknown' : feedback.fromUserId,
          seller: feedback.toUserId
        },
        commodity: { name: 'unknown', category: 'unknown', quality: 'standard', quantity: 0, unit: 'kg' },
        pricing: { initialOffer: 0, finalPrice: 0, marketPrice: 0, pricePerUnit: 0 },
        timeline: { initiated: new Date(), completed: new Date() },
        status: 'completed',
        metadata: { location: { state: '', district: '', city: '', pincode: '' } }
      };

      await this.updateTrustScore(feedback.toUserId, transaction);
    } catch (error) {
      console.error('Error adding feedback:', error);
      throw error;
    }
  }

  // Private helper methods

  private async calculateTrustScoreFactors(userId: string): Promise<TrustScoreFactors> {
    const profile = await this.getUserProfile(userId);
    const feedback = await this.getRecentFeedback(userId, 50);
    const verificationBadges = await this.getVerificationBadges(userId);
    
    const transactionCount = profile.trustData.transactionHistory.length;
    const averageRating = this.calculateAverageRating(feedback);
    const completionRate = this.calculateCompletionRate(profile.trustData.transactionHistory);
    const disputeRate = await this.calculateDisputeRate(userId);
    const verificationLevel = this.calculateVerificationLevel(verificationBadges);
    const accountAge = Math.floor((new Date().getTime() - profile.createdAt.getTime()) / (1000 * 60 * 60 * 24));

    return {
      transactionCount,
      averageRating,
      completionRate,
      disputeRate,
      verificationLevel,
      accountAge
    };
  }

  private updateFactorsWithTransaction(factors: TrustScoreFactors, transaction: Transaction): TrustScoreFactors {
    return {
      ...factors,
      transactionCount: factors.transactionCount + 1,
      completionRate: transaction.status === 'completed' 
        ? (factors.completionRate * factors.transactionCount + 1) / (factors.transactionCount + 1)
        : (factors.completionRate * factors.transactionCount) / (factors.transactionCount + 1)
    };
  }

  private calculateTrustScore(factors: TrustScoreFactors): number {
    // Weighted trust score calculation
    const weights = {
      transactionCount: 0.2,
      averageRating: 0.25,
      completionRate: 0.2,
      disputeRate: -0.15, // Negative weight
      verificationLevel: 0.2,
      accountAge: 0.1
    };

    // Normalize factors to 0-1 scale
    const normalizedFactors = {
      transactionCount: Math.min(factors.transactionCount / 100, 1), // Cap at 100 transactions
      averageRating: factors.averageRating / 5, // Rating is 1-5
      completionRate: factors.completionRate,
      disputeRate: factors.disputeRate, // Already 0-1
      verificationLevel: factors.verificationLevel, // Already 0-1
      accountAge: Math.min(factors.accountAge / 365, 1) // Cap at 1 year
    };

    // Calculate weighted score
    let score = 0;
    score += normalizedFactors.transactionCount * weights.transactionCount;
    score += normalizedFactors.averageRating * weights.averageRating;
    score += normalizedFactors.completionRate * weights.completionRate;
    score += normalizedFactors.disputeRate * weights.disputeRate;
    score += normalizedFactors.verificationLevel * weights.verificationLevel;
    score += normalizedFactors.accountAge * weights.accountAge;

    // Convert to 0-100 scale and ensure minimum score
    return Math.max(Math.round(score * 100), 10);
  }

  private calculateAverageRating(feedback: Feedback[]): number {
    if (feedback.length === 0) return 3; // Default neutral rating
    const totalRating = feedback.reduce((sum, f) => sum + f.rating, 0);
    return totalRating / feedback.length;
  }

  private calculateCompletionRate(transactions: any[]): number {
    if (transactions.length === 0) return 1; // Default to 100% for new users
    const completedTransactions = transactions.filter(t => t.status === 'completed').length;
    return completedTransactions / transactions.length;
  }

  private async calculateDisputeRate(userId: string): Promise<number> {
    try {
      const disputesRef = collection(db, 'disputes');
      const q = query(disputesRef, where('participants', 'array-contains', userId));
      const querySnapshot = await getDocs(q);
      
      const profile = await this.getUserProfile(userId);
      const totalTransactions = profile.trustData.transactionHistory.length;
      
      if (totalTransactions === 0) return 0;
      return querySnapshot.size / totalTransactions;
    } catch (error) {
      console.error('Error calculating dispute rate:', error);
      return 0;
    }
  }

  private calculateVerificationLevel(badges: VerificationBadge[]): number {
    const verifiedBadges = badges.filter(b => b.verified).length;
    const totalPossibleBadges = 6; // identity, business, address, phone, email, bank
    return verifiedBadges / totalPossibleBadges;
  }

  private async getRecentFeedback(userId: string, limit: number): Promise<Feedback[]> {
    try {
      const feedbackRef = collection(db, 'feedback');
      const q = query(feedbackRef, where('toUserId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const feedback: Feedback[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        feedback.push({
          ...data,
          createdAt: data.createdAt.toDate()
        } as Feedback);
      });

      // Sort by date and limit
      return feedback
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting recent feedback:', error);
      return [];
    }
  }

  private async processVerificationDocuments(documents: VerificationDocument[]): Promise<VerificationBadge[]> {
    // Simplified verification logic - in real implementation would integrate with document verification service
    const badges: VerificationBadge[] = [];
    
    for (const doc of documents) {
      let badgeType: VerificationBadge['type'];
      
      switch (doc.type) {
        case 'aadhar':
          badgeType = 'identity';
          break;
        case 'pan':
          badgeType = 'identity';
          break;
        case 'gst':
          badgeType = 'business';
          break;
        case 'license':
          badgeType = 'business';
          break;
        case 'bank_statement':
          badgeType = 'bank';
          break;
        default:
          continue;
      }

      // Simulate verification process
      const verified = Math.random() > 0.2; // 80% success rate for demo
      
      badges.push({
        type: badgeType,
        verified,
        verifiedAt: verified ? new Date() : undefined,
        expiresAt: verified ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : undefined // 1 year expiry
      });
    }

    return badges;
  }

  private async updateVerificationBadges(userId: string, badges: VerificationBadge[]): Promise<void> {
    const badgesDoc = doc(db, 'verificationBadges', userId);
    await setDoc(badgesDoc, { badges, updatedAt: serverTimestamp() }, { merge: true });
    
    // Clear cache
    const cacheKey = `verification_badges_${userId}`;
    await offlineSyncService.cacheData(cacheKey, null, 0);
  }

  private getPendingVerificationRequirements(badges: VerificationBadge[]): string[] {
    const requirements = [];
    const badgeTypes = badges.map(b => b.type);
    
    if (!badgeTypes.includes('identity')) {
      requirements.push('Identity verification (Aadhar/PAN)');
    }
    if (!badgeTypes.includes('phone')) {
      requirements.push('Phone number verification');
    }
    if (!badgeTypes.includes('email')) {
      requirements.push('Email verification');
    }
    if (!badgeTypes.includes('address')) {
      requirements.push('Address verification');
    }
    
    return requirements;
  }

  private async logSuspiciousActivity(activity: SuspiciousActivity): Promise<void> {
    try {
      await addDoc(collection(db, 'suspiciousActivities'), {
        ...activity,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging suspicious activity:', error);
    }
  }

  private determineSeverity(reason: string): 'low' | 'medium' | 'high' {
    const highSeverityKeywords = ['fraud', 'scam', 'fake', 'stolen', 'illegal'];
    const mediumSeverityKeywords = ['spam', 'harassment', 'inappropriate', 'misleading'];
    
    const lowerReason = reason.toLowerCase();
    
    if (highSeverityKeywords.some(keyword => lowerReason.includes(keyword))) {
      return 'high';
    }
    if (mediumSeverityKeywords.some(keyword => lowerReason.includes(keyword))) {
      return 'medium';
    }
    return 'low';
  }

  private async checkForAutomaticRestrictions(userId: string): Promise<void> {
    try {
      // Get recent reports for this user
      const reportsRef = collection(db, 'contentReports');
      const q = query(
        reportsRef, 
        where('targetId', '==', userId),
        where('targetType', '==', 'user'),
        where('status', '==', 'pending')
      );
      const querySnapshot = await getDocs(q);
      
      const recentReports = querySnapshot.size;
      
      // Apply automatic restrictions based on report count
      if (recentReports >= 5) {
        await this.applyAccountRestriction(userId, {
          type: 'limited',
          reason: 'Multiple user reports received',
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          restrictions: ['no_new_deals', 'limited_messaging']
        });
      } else if (recentReports >= 10) {
        await this.applyAccountRestriction(userId, {
          type: 'suspended',
          reason: 'Excessive user reports received',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          restrictions: ['no_deals', 'no_messaging', 'no_profile_updates']
        });
      }
    } catch (error) {
      console.error('Error checking for automatic restrictions:', error);
    }
  }
}

// Export singleton instance
export const trustSystemService = new TrustSystemService();

// Export the class for testing
export { TrustSystemService };
export type { TrustScoreFactors, AccountRestriction, SuspiciousActivity };