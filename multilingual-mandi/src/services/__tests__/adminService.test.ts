// Unit Tests for Admin Service
// Tests admin dashboard functionality, user management, and audit logging

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdminService } from '../adminService';
import type { AdminUser, VerificationStatus } from '../../types';
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
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
  writeBatch: vi.fn(),
  serverTimestamp: vi.fn()
}));

describe('AdminService', () => {
  let service: AdminService;
  let mockAdmin: AdminUser;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AdminService();

    mockAdmin = {
      uid: 'admin-123',
      role: 'admin',
      permissions: ['user_management', 'content_moderation'],
      createdAt: new Date()
    };

    // Mock batch operations
    const mockBatch = {
      update: vi.fn(),
      delete: vi.fn(),
      commit: vi.fn().mockResolvedValue(undefined)
    };
    vi.mocked(firestore.writeBatch).mockReturnValue(mockBatch as any);
    vi.mocked(firestore.serverTimestamp).mockReturnValue({ seconds: Date.now() / 1000 } as any);
  });

  describe('initializeAdmin', () => {
    it('should initialize admin user successfully', async () => {
      const mockDocSnap = {
        exists: () => true,
        data: () => ({
          uid: mockAdmin.uid,
          role: mockAdmin.role,
          permissions: mockAdmin.permissions,
          createdAt: { toDate: () => mockAdmin.createdAt }
        })
      };

      vi.mocked(firestore.getDoc).mockResolvedValue(mockDocSnap as any);

      const result = await service.initializeAdmin(mockAdmin.uid);

      expect(result).toEqual(mockAdmin);
      expect(firestore.doc).toHaveBeenCalledWith({}, 'admins', mockAdmin.uid);
      expect(firestore.getDoc).toHaveBeenCalled();
    });

    it('should return null for non-existent admin', async () => {
      const mockDocSnap = {
        exists: () => false
      };

      vi.mocked(firestore.getDoc).mockResolvedValue(mockDocSnap as any);

      const result = await service.initializeAdmin('non-existent');

      expect(result).toBeNull();
    });

    it('should handle initialization errors', async () => {
      vi.mocked(firestore.getDoc).mockRejectedValue(new Error('Database error'));

      const result = await service.initializeAdmin(mockAdmin.uid);

      expect(result).toBeNull();
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      // Mock various collection queries
      const mockUsersSnapshot = { size: 100 };
      const mockActiveUsersSnapshot = { size: 75 };
      const mockPendingVerificationsSnapshot = { size: 10 };
      const mockOpenReportsSnapshot = { size: 5 };
      const mockDealsSnapshot = { size: 50 };
      const mockRecentActivitySnapshot = {
        docs: [
          {
            id: 'log-1',
            data: () => ({
              adminId: 'admin-123',
              action: 'verify_user',
              targetType: 'user',
              targetId: 'user-123',
              details: {},
              timestamp: { toDate: () => new Date() }
            })
          }
        ]
      };

      vi.mocked(firestore.getDocs)
        .mockResolvedValueOnce(mockUsersSnapshot as any)
        .mockResolvedValueOnce(mockActiveUsersSnapshot as any)
        .mockResolvedValueOnce(mockPendingVerificationsSnapshot as any)
        .mockResolvedValueOnce(mockOpenReportsSnapshot as any)
        .mockResolvedValueOnce(mockDealsSnapshot as any)
        .mockResolvedValueOnce(mockRecentActivitySnapshot as any);

      const stats = await service.getDashboardStats();

      expect(stats).toEqual({
        totalUsers: 100,
        activeUsers: 75,
        pendingVerifications: 10,
        openReports: 5,
        totalDeals: 50,
        recentActivity: expect.arrayContaining([
          expect.objectContaining({
            id: 'log-1',
            action: 'verify_user'
          })
        ])
      });
    });

    it('should handle dashboard stats errors', async () => {
      vi.mocked(firestore.getDocs).mockRejectedValue(new Error('Database error'));

      await expect(service.getDashboardStats()).rejects.toThrow('Failed to load dashboard statistics');
    });
  });

  describe('getUsers', () => {
    it('should return users with filtering', async () => {
      const mockUsers = [
        {
          uid: 'user-1',
          email: 'user1@example.com',
          role: 'vendor',
          personalInfo: { name: 'User One', phone: '1234567890' },
          trustData: { verificationStatus: 'verified' },
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() }
        }
      ];

      const mockSnapshot = {
        docs: mockUsers.map(user => ({
          data: () => user
        }))
      };

      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot as any);

      const result = await service.getUsers({ role: 'vendor' }, 20);

      expect(result.users).toHaveLength(1);
      expect(result.users[0].role).toBe('vendor');
      expect(result.hasMore).toBe(false);
    });

    it('should filter users by search term', async () => {
      const mockUsers = [
        {
          uid: 'user-1',
          email: 'john@example.com',
          personalInfo: { name: 'John Doe', phone: '1234567890' },
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() }
        },
        {
          uid: 'user-2',
          email: 'jane@example.com',
          personalInfo: { name: 'Jane Smith', phone: '0987654321' },
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() }
        }
      ];

      const mockSnapshot = {
        docs: mockUsers.map(user => ({
          data: () => user
        }))
      };

      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot as any);

      const result = await service.getUsers({ searchTerm: 'john' }, 20);

      expect(result.users).toHaveLength(1);
      expect(result.users[0].personalInfo.name).toBe('John Doe');
    });
  });

  describe('updateUserVerification', () => {
    beforeEach(async () => {
      // Initialize admin first
      const mockDocSnap = {
        exists: () => true,
        data: () => ({
          uid: mockAdmin.uid,
          role: mockAdmin.role,
          permissions: mockAdmin.permissions,
          createdAt: { toDate: () => mockAdmin.createdAt }
        })
      };
      vi.mocked(firestore.getDoc).mockResolvedValue(mockDocSnap as any);
      await service.initializeAdmin(mockAdmin.uid);
    });

    it('should update user verification status', async () => {
      const userId = 'user-123';
      const status: VerificationStatus = 'verified';

      await service.updateUserVerification(userId, status, 'Admin approval');

      expect(firestore.writeBatch).toHaveBeenCalled();
    });

    it('should require admin authentication', async () => {
      const unauthenticatedService = new AdminService();

      await expect(
        unauthenticatedService.updateUserVerification('user-123', 'verified')
      ).rejects.toThrow('Failed to update user verification status');
    });
  });

  describe('suspendUser', () => {
    beforeEach(async () => {
      // Initialize admin first
      const mockDocSnap = {
        exists: () => true,
        data: () => ({
          uid: mockAdmin.uid,
          role: mockAdmin.role,
          permissions: mockAdmin.permissions,
          createdAt: { toDate: () => mockAdmin.createdAt }
        })
      };
      vi.mocked(firestore.getDoc).mockResolvedValue(mockDocSnap as any);
      await service.initializeAdmin(mockAdmin.uid);
    });

    it('should suspend user successfully', async () => {
      const userId = 'user-123';
      const reason = 'Policy violation';

      await service.suspendUser(userId, true, reason);

      // Verify user update
      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'doc', path: 'users', id: userId }),
        expect.objectContaining({
          suspended: true,
          suspensionReason: reason,
          updatedAt: expect.anything()
        })
      );
    });

    it('should unsuspend user successfully', async () => {
      const userId = 'user-123';
      const reason = 'Appeal approved';

      await service.suspendUser(userId, false, reason);

      // Verify user update
      expect(firestore.updateDoc).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'doc', path: 'users', id: userId }),
        expect.objectContaining({
          suspended: false,
          suspensionReason: null,
          updatedAt: expect.anything()
        })
      );
    });
  });

  describe('hasPermission', () => {
    beforeEach(async () => {
      // Initialize admin first
      const mockDocSnap = {
        exists: () => true,
        data: () => ({
          uid: mockAdmin.uid,
          role: mockAdmin.role,
          permissions: mockAdmin.permissions,
          createdAt: { toDate: () => mockAdmin.createdAt }
        })
      };
      vi.mocked(firestore.getDoc).mockResolvedValue(mockDocSnap as any);
      await service.initializeAdmin(mockAdmin.uid);
    });

    it('should return true for admin role', async () => {
      const hasPermission = service.hasPermission('any_permission');
      expect(hasPermission).toBe(true);
    });

    it('should return true for specific permissions', async () => {
      const hasPermission = service.hasPermission('user_management');
      expect(hasPermission).toBe(true);
    });

    it('should return false for missing permissions', async () => {
      // Create a moderator with limited permissions
      const moderatorService = new AdminService();
      const mockModeratorDocSnap = {
        exists: () => true,
        data: () => ({
          uid: 'mod-123',
          role: 'moderator',
          permissions: ['content_moderation'],
          createdAt: { toDate: () => new Date() }
        })
      };
      vi.mocked(firestore.getDoc).mockResolvedValue(mockModeratorDocSnap as any);
      await moderatorService.initializeAdmin('mod-123');

      const hasPermission = moderatorService.hasPermission('user_management');
      expect(hasPermission).toBe(false);
    });

    it('should return false when no admin is authenticated', async () => {
      const unauthenticatedService = new AdminService();
      const hasPermission = unauthenticatedService.hasPermission('any_permission');
      expect(hasPermission).toBe(false);
    });
  });

  describe('getAuditLogs', () => {
    it('should return audit logs with pagination', async () => {
      const mockLogs = [
        {
          id: 'log-1',
          adminId: 'admin-123',
          action: 'verify_user',
          targetType: 'user',
          targetId: 'user-123',
          details: {},
          timestamp: { toDate: () => new Date() }
        }
      ];

      const mockSnapshot = {
        docs: mockLogs.map(log => ({
          id: log.id,
          data: () => log
        }))
      };

      vi.mocked(firestore.getDocs).mockResolvedValue(mockSnapshot as any);

      const result = await service.getAuditLogs(50);

      expect(result.logs).toHaveLength(1);
      expect(result.logs[0].action).toBe('verify_user');
      expect(result.hasMore).toBe(false);
    });

    it('should handle audit logs errors', async () => {
      vi.mocked(firestore.getDocs).mockRejectedValue(new Error('Database error'));

      await expect(service.getAuditLogs()).rejects.toThrow('Failed to load audit logs');
    });
  });
});