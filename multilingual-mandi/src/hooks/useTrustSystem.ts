// Custom hook for trust system management
// Provides state management and actions for trust indicators, verification, and reporting

import { useState, useEffect, useCallback } from 'react';
import { trustSystemService } from '../services/trustSystem';
import type {
  UserProfile,
  TrustIndicators,
  VerificationBadge,
  VerificationDocument,
  VerificationResult
} from '../types';

interface UseTrustSystemReturn {
  profile: UserProfile | null;
  trustIndicators: TrustIndicators | null;
  verificationBadges: VerificationBadge[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadUserProfile: (userId: string) => Promise<void>;
  reportUser: (reporterId: string, reportedId: string, reason: string) => Promise<void>;
  verifyUser: (userId: string, documents: VerificationDocument[]) => Promise<VerificationResult>;
  refresh: () => Promise<void>;
}

export const useTrustSystem = (userId?: string): UseTrustSystemReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trustIndicators, setTrustIndicators] = useState<TrustIndicators | null>(null);
  const [verificationBadges, setVerificationBadges] = useState<VerificationBadge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUserProfile = useCallback(async (targetUserId: string) => {
    try {
      setLoading(true);
      setError(null);

      const [userProfile, userTrustIndicators, userVerificationBadges] = await Promise.all([
        trustSystemService.getUserProfile(targetUserId),
        trustSystemService.getTrustIndicators(targetUserId),
        trustSystemService.getVerificationBadges(targetUserId)
      ]);

      setProfile(userProfile);
      setTrustIndicators(userTrustIndicators);
      setVerificationBadges(userVerificationBadges);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user profile');
      console.error('Failed to load user profile:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const reportUser = useCallback(async (reporterId: string, reportedId: string, reason: string) => {
    try {
      await trustSystemService.reportUser(reporterId, reportedId, reason);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to report user';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const verifyUser = useCallback(async (targetUserId: string, documents: VerificationDocument[]): Promise<VerificationResult> => {
    try {
      const result = await trustSystemService.verifyUser(targetUserId, documents);
      
      // Refresh verification badges after successful verification
      if (result.success && targetUserId === userId) {
        const updatedBadges = await trustSystemService.getVerificationBadges(targetUserId);
        setVerificationBadges(updatedBadges);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify user';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [userId]);

  const refresh = useCallback(async () => {
    if (userId) {
      await loadUserProfile(userId);
    }
  }, [userId, loadUserProfile]);

  useEffect(() => {
    if (userId) {
      loadUserProfile(userId);
    }
  }, [userId, loadUserProfile]);

  return {
    profile,
    trustIndicators,
    verificationBadges,
    loading,
    error,
    loadUserProfile,
    reportUser,
    verifyUser,
    refresh
  };
};

// Hook for trust score monitoring
export const useTrustScore = (userId?: string) => {
  const [trustScore, setTrustScore] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTrustScore = useCallback(async (targetUserId: string) => {
    try {
      setLoading(true);
      setError(null);

      const trustIndicators = await trustSystemService.getTrustIndicators(targetUserId);
      setTrustScore(trustIndicators.overallScore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trust score');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      loadTrustScore(userId);
    }
  }, [userId, loadTrustScore]);

  return {
    trustScore,
    loading,
    error,
    refresh: () => userId ? loadTrustScore(userId) : Promise.resolve()
  };
};

// Hook for verification status
export const useVerificationStatus = (userId?: string) => {
  const [verificationBadges, setVerificationBadges] = useState<VerificationBadge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVerificationStatus = useCallback(async (targetUserId: string) => {
    try {
      setLoading(true);
      setError(null);

      const badges = await trustSystemService.getVerificationBadges(targetUserId);
      setVerificationBadges(badges);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load verification status');
    } finally {
      setLoading(false);
    }
  }, []);

  const getVerificationSummary = useCallback(() => {
    const verifiedCount = verificationBadges.filter(badge => badge.verified).length;
    const totalCount = verificationBadges.length;
    const verificationLevel = totalCount > 0 ? (verifiedCount / totalCount) * 100 : 0;

    return {
      verifiedCount,
      totalCount,
      verificationLevel,
      isFullyVerified: verifiedCount === totalCount && totalCount > 0,
      hasAnyVerification: verifiedCount > 0
    };
  }, [verificationBadges]);

  useEffect(() => {
    if (userId) {
      loadVerificationStatus(userId);
    }
  }, [userId, loadVerificationStatus]);

  return {
    verificationBadges,
    loading,
    error,
    verificationSummary: getVerificationSummary(),
    refresh: () => userId ? loadVerificationStatus(userId) : Promise.resolve()
  };
};

// Hook for account restrictions
export const useAccountRestrictions = (userId?: string) => {
  const [restrictions, setRestrictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAccountRestrictions = useCallback(async (targetUserId: string) => {
    try {
      setLoading(true);
      setError(null);

      const accountRestrictions = await trustSystemService.getAccountRestrictions(targetUserId);
      setRestrictions(accountRestrictions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load account restrictions');
    } finally {
      setLoading(false);
    }
  }, []);

  const hasActiveRestrictions = useCallback(() => {
    return restrictions.some(restriction => {
      if (!restriction.endDate) return true; // Permanent restriction
      return new Date() < restriction.endDate; // Active restriction
    });
  }, [restrictions]);

  const getActiveRestrictions = useCallback(() => {
    return restrictions.filter(restriction => {
      if (!restriction.endDate) return true; // Permanent restriction
      return new Date() < restriction.endDate; // Active restriction
    });
  }, [restrictions]);

  useEffect(() => {
    if (userId) {
      loadAccountRestrictions(userId);
    }
  }, [userId, loadAccountRestrictions]);

  return {
    restrictions,
    loading,
    error,
    hasActiveRestrictions: hasActiveRestrictions(),
    activeRestrictions: getActiveRestrictions(),
    refresh: () => userId ? loadAccountRestrictions(userId) : Promise.resolve()
  };
};

// Hook for trust system statistics (for admin/moderator use)
export const useTrustSystemStats = () => {
  const [stats, setStats] = useState<{
    totalUsers: number;
    verifiedUsers: number;
    averageTrustScore: number;
    pendingVerifications: number;
    activeReports: number;
    suspendedUsers: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, this would call an admin service
      // For now, we'll simulate the stats
      const mockStats = {
        totalUsers: 1250,
        verifiedUsers: 890,
        averageTrustScore: 76.5,
        pendingVerifications: 45,
        activeReports: 12,
        suspendedUsers: 8
      };

      setStats(mockStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trust system stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refresh: loadStats
  };
};