// Admin Service for User Management and Audit Logging
// Implements admin dashboard with user management capabilities
// Provides audit logging for all administrative actions
// Supports bulk operations for user verification and content moderation

import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  writeBatch,
  serverTimestamp,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type {
  AdminUser,
  AuditLog,
  UserProfile,
  VerificationStatus,
  UserRole
} from '../types';

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingVerifications: number;
  openReports: number;
  totalDeals: number;
  recentActivity: AuditLog[];
}

export interface UserManagementFilters {
  role?: UserRole;
  verificationStatus?: VerificationStatus;
  searchTerm?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface BulkOperation {
  type: 'verify' | 'suspend' | 'delete' | 'update_role';
  userIds: string[];
  data?: any;
}

export interface BulkOperationResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors: Array<{
    userId: string;
    error: string;
  }>;
}

class AdminService {
  private currentAdmin: AdminUser | null = null;

  // Initialize admin user
  async initializeAdmin(uid: string): Promise<AdminUser | null> {
    try {
      const adminDoc = doc(db, 'admins', uid);
      const docSnap = await getDoc(adminDoc);

      if (docSnap.exists()) {
        const data = docSnap.data();
        this.currentAdmin = {
          uid: data.uid,
          role: data.role,
          permissions: data.permissions || [],
          createdAt: this.parseTimestamp(data.createdAt)
        };
        return this.currentAdmin;
      }

      return null;
    } catch (error) {
      console.error('Error initializing admin:', error);
      return null;
    }
  }

  // Get dashboard statistics
  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      // Get total users count
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      const totalUsers = usersSnapshot.size;

      // Get active users (logged in within last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const activeUsersQuery = query(
        collection(db, 'users'),
        where('updatedAt', '>=', thirtyDaysAgo)
      );
      const activeUsersSnapshot = await getDocs(activeUsersQuery);
      const activeUsers = activeUsersSnapshot.size;

      // Get pending verifications
      const pendingVerificationsQuery = query(
        collection(db, 'userProfiles'),
        where('trustData.verificationStatus', '==', 'pending')
      );
      const pendingVerificationsSnapshot = await getDocs(pendingVerificationsQuery);
      const pendingVerifications = pendingVerificationsSnapshot.size;

      // Get open reports
      const openReportsQuery = query(
        collection(db, 'contentReports'),
        where('status', 'in', ['pending', 'investigating'])
      );
      const openReportsSnapshot = await getDocs(openReportsQuery);
      const openReports = openReportsSnapshot.size;

      // Get total deals
      const dealsQuery = query(collection(db, 'deals'));
      const dealsSnapshot = await getDocs(dealsQuery);
      const totalDeals = dealsSnapshot.size;

      // Get recent activity
      const recentActivityQuery = query(
        collection(db, 'auditLogs'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const recentActivitySnapshot = await getDocs(recentActivityQuery);
      const recentActivity = recentActivitySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: this.parseTimestamp(doc.data().timestamp)
      })) as AuditLog[];

      return {
        totalUsers,
        activeUsers,
        pendingVerifications,
        openReports,
        totalDeals,
        recentActivity
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw new Error('Failed to load dashboard statistics');
    }
  }

  // Get users with filtering and pagination
  async getUsers(
    filters: UserManagementFilters = {},
    pageSize: number = 20,
    lastDoc?: QueryDocumentSnapshot
  ): Promise<{
    users: UserProfile[];
    hasMore: boolean;
    lastDoc?: QueryDocumentSnapshot;
  }> {
    try {
      let userQuery = query(collection(db, 'userProfiles'));

      // Apply filters
      if (filters.role) {
        userQuery = query(userQuery, where('role', '==', filters.role));
      }

      if (filters.verificationStatus) {
        userQuery = query(userQuery, where('trustData.verificationStatus', '==', filters.verificationStatus));
      }

      if (filters.dateRange) {
        userQuery = query(
          userQuery,
          where('createdAt', '>=', filters.dateRange.start),
          where('createdAt', '<=', filters.dateRange.end)
        );
      }

      // Add ordering and pagination
      userQuery = query(userQuery, orderBy('createdAt', 'desc'), limit(pageSize));

      if (lastDoc) {
        userQuery = query(userQuery, startAfter(lastDoc));
      }

      const snapshot = await getDocs(userQuery);
      const users = snapshot.docs.map(doc => ({
        ...doc.data(),
        createdAt: this.parseTimestamp(doc.data().createdAt),
        updatedAt: this.parseTimestamp(doc.data().updatedAt)
      })) as UserProfile[];

      // Filter by search term if provided (client-side filtering for simplicity)
      let filteredUsers = users;
      if (filters.searchTerm) {
        const searchTerm = filters.searchTerm.toLowerCase();
        filteredUsers = users.filter(user =>
          user.email.toLowerCase().includes(searchTerm) ||
          user.personalInfo.name.toLowerCase().includes(searchTerm) ||
          user.personalInfo.phone.includes(searchTerm)
        );
      }

      return {
        users: filteredUsers,
        hasMore: snapshot.docs.length === pageSize,
        lastDoc: snapshot.docs[snapshot.docs.length - 1]
      };
    } catch (error) {
      console.error('Error getting users:', error);
      throw new Error('Failed to load users');
    }
  }

  // Update user verification status
  async updateUserVerification(
    userId: string,
    verificationStatus: VerificationStatus,
    reason?: string
  ): Promise<void> {
    try {
      if (!this.currentAdmin) {
        throw new Error('Admin authentication required');
      }

      const userProfileDoc = doc(db, 'userProfiles', userId);
      const userDoc = doc(db, 'users', userId);

      const batch = writeBatch(db);

      // Update user profile
      batch.update(userProfileDoc, {
        'trustData.verificationStatus': verificationStatus,
        updatedAt: serverTimestamp()
      });

      // Update user document
      batch.update(userDoc, {
        verificationStatus,
        updatedAt: serverTimestamp()
      });

      await batch.commit();

      // Log the action
      await this.logAdminAction(
        'update_verification',
        'user',
        userId,
        {
          newStatus: verificationStatus,
          reason,
          previousStatus: 'pending' // This could be fetched from the document
        }
      );
    } catch (error) {
      console.error('Error updating user verification:', error);
      throw new Error('Failed to update user verification status');
    }
  }

  // Suspend or unsuspend user
  async suspendUser(userId: string, suspend: boolean, reason: string): Promise<void> {
    try {
      if (!this.currentAdmin) {
        throw new Error('Admin authentication required');
      }

      const userDoc = doc(db, 'users', userId);
      await updateDoc(userDoc, {
        suspended: suspend,
        suspensionReason: suspend ? reason : null,
        updatedAt: serverTimestamp()
      });

      // Log the action
      await this.logAdminAction(
        suspend ? 'suspend_user' : 'unsuspend_user',
        'user',
        userId,
        { reason }
      );
    } catch (error) {
      console.error('Error suspending user:', error);
      throw new Error(`Failed to ${suspend ? 'suspend' : 'unsuspend'} user`);
    }
  }

  // Delete user account
  async deleteUser(userId: string, reason: string): Promise<void> {
    try {
      if (!this.currentAdmin) {
        throw new Error('Admin authentication required');
      }

      const batch = writeBatch(db);

      // Delete user documents
      const userDoc = doc(db, 'users', userId);
      const userProfileDoc = doc(db, 'userProfiles', userId);

      batch.delete(userDoc);
      batch.delete(userProfileDoc);

      await batch.commit();

      // Log the action
      await this.logAdminAction('delete_user', 'user', userId, { reason });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user account');
    }
  }

  // Bulk operations
  async performBulkOperation(operation: BulkOperation): Promise<BulkOperationResult> {
    try {
      if (!this.currentAdmin) {
        throw new Error('Admin authentication required');
      }

      const result: BulkOperationResult = {
        success: true,
        processedCount: 0,
        failedCount: 0,
        errors: []
      };

      for (const userId of operation.userIds) {
        try {
          switch (operation.type) {
            case 'verify':
              await this.updateUserVerification(userId, 'verified', 'Bulk verification');
              break;
            case 'suspend':
              await this.suspendUser(userId, true, operation.data?.reason || 'Bulk suspension');
              break;
            case 'delete':
              await this.deleteUser(userId, operation.data?.reason || 'Bulk deletion');
              break;
            case 'update_role':
              await this.updateUserRole(userId, operation.data?.role);
              break;
          }
          result.processedCount++;
        } catch (error) {
          result.failedCount++;
          result.errors.push({
            userId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      if (result.failedCount > 0) {
        result.success = false;
      }

      // Log bulk operation
      await this.logAdminAction(
        `bulk_${operation.type}`,
        'user',
        'multiple',
        {
          userCount: operation.userIds.length,
          processedCount: result.processedCount,
          failedCount: result.failedCount
        }
      );

      return result;
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      throw new Error('Failed to perform bulk operation');
    }
  }

  // Update user role
  async updateUserRole(userId: string, newRole: UserRole): Promise<void> {
    try {
      if (!this.currentAdmin) {
        throw new Error('Admin authentication required');
      }

      const batch = writeBatch(db);

      const userDoc = doc(db, 'users', userId);
      const userProfileDoc = doc(db, 'userProfiles', userId);

      batch.update(userDoc, {
        role: newRole,
        updatedAt: serverTimestamp()
      });

      batch.update(userProfileDoc, {
        role: newRole,
        updatedAt: serverTimestamp()
      });

      await batch.commit();

      // Log the action
      await this.logAdminAction('update_role', 'user', userId, { newRole });
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new Error('Failed to update user role');
    }
  }

  // Get audit logs
  async getAuditLogs(
    pageSize: number = 50,
    lastDoc?: QueryDocumentSnapshot
  ): Promise<{
    logs: AuditLog[];
    hasMore: boolean;
    lastDoc?: QueryDocumentSnapshot;
  }> {
    try {
      let logsQuery = query(
        collection(db, 'auditLogs'),
        orderBy('timestamp', 'desc'),
        limit(pageSize)
      );

      if (lastDoc) {
        logsQuery = query(logsQuery, startAfter(lastDoc));
      }

      const snapshot = await getDocs(logsQuery);
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: this.parseTimestamp(doc.data().timestamp)
      })) as AuditLog[];

      return {
        logs,
        hasMore: snapshot.docs.length === pageSize,
        lastDoc: snapshot.docs[snapshot.docs.length - 1]
      };
    } catch (error) {
      console.error('Error getting audit logs:', error);
      throw new Error('Failed to load audit logs');
    }
  }

  // Log admin action
  async logAdminAction(
    action: string,
    targetType: 'user' | 'deal' | 'price' | 'content',
    targetId: string,
    details: any
  ): Promise<void> {
    try {
      if (!this.currentAdmin) {
        throw new Error('Admin authentication required');
      }

      const auditLog: Omit<AuditLog, 'id'> = {
        adminId: this.currentAdmin.uid,
        action,
        targetType,
        targetId,
        details,
        timestamp: new Date()
      };

      const auditLogDoc = doc(collection(db, 'auditLogs'));
      await updateDoc(auditLogDoc, {
        ...auditLog,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging admin action:', error);
      // Don't throw error for logging failures to avoid breaking main operations
    }
  }

  // Check admin permissions
  hasPermission(permission: string): boolean {
    if (!this.currentAdmin) {
      return false;
    }

    return this.currentAdmin.permissions.includes(permission) ||
      this.currentAdmin.role === 'admin'; // Admins have all permissions
  }

  // Get current admin
  getCurrentAdmin(): AdminUser | null {
    return this.currentAdmin;
  }

  // Helper method to parse timestamps
  private parseTimestamp(value: unknown): Date {
    if (!value) return new Date();

    // Handle Firestore Timestamp objects
    if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as any).toDate === 'function') {
      try {
        return (value as any).toDate();
      } catch (e) {
        console.warn('Failed to convert Firestore timestamp:', e);
      }
    }

    // Handle strings, numbers, or Date objects
    const date = new Date(value as any);
    if (isNaN(date.getTime())) {
      return new Date();
    }

    return date;
  }
}

// Export singleton instance
export const adminService = new AdminService();

// Export the class for testing
export { AdminService };