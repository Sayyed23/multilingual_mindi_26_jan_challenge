// Unit Tests for Authentication Service
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createMockUser } from './setup';
import type { UserRole } from '../../types';

// Mock Firebase Auth functions
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn()
}));

// Mock Firestore functions
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(() => ({ seconds: Date.now() / 1000 }))
}));

vi.mock('../../lib/firebase', () => ({
  auth: { currentUser: null },
  db: {}
}));

// Import after mocking
import { AuthenticationService } from '../auth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';

const mockSignInWithEmailAndPassword = vi.mocked(signInWithEmailAndPassword);
const mockCreateUserWithEmailAndPassword = vi.mocked(createUserWithEmailAndPassword);
const mockSendPasswordResetEmail = vi.mocked(sendPasswordResetEmail);
const mockSignOut = vi.mocked(signOut);
const mockOnAuthStateChanged = vi.mocked(onAuthStateChanged);
const mockGetDoc = vi.mocked(getDoc);
const mockSetDoc = vi.mocked(setDoc);
const mockDoc = vi.mocked(doc);

describe('AuthenticationService', () => {
  let authService: AuthenticationService;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthenticationService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('signIn', () => {
    it('should successfully sign in with valid credentials', async () => {
      const mockUser = createMockUser();
      const mockFirebaseUser = { uid: mockUser.uid } as any;

      mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockFirebaseUser } as any);
      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue({
        exists: (() => true) as any,
        data: () => ({
          ...mockUser,
          createdAt: { toDate: () => mockUser.createdAt },
          updatedAt: { toDate: () => mockUser.updatedAt }
        })
      } as any);

      const result = await authService.signIn('test@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
    });

    it('should fail with invalid email', async () => {
      const result = await authService.signIn('invalid-email', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Please enter a valid email address');
      expect(mockSignInWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it('should fail with empty credentials', async () => {
      const result = await authService.signIn('', '');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email and password are required');
      expect(mockSignInWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it('should handle Firebase auth errors', async () => {
      mockSignInWithEmailAndPassword.mockRejectedValue({
        code: 'auth/user-not-found',
        message: 'User not found'
      });

      const result = await authService.signIn('test@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('No account found with this email address');
    });
  });

  describe('signUp', () => {
    it('should successfully create a new user account', async () => {
      const mockFirebaseUser = { uid: 'new-user-id' } as any;
      const role: UserRole = 'vendor';

      mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: mockFirebaseUser } as any);
      mockDoc.mockReturnValue({} as any);
      mockGetDoc.mockResolvedValue({ exists: (() => false) as any } as any); // User doesn't exist
      mockSetDoc.mockResolvedValue(undefined);

      const result = await authService.signUp('newuser@example.com', 'password123', role);

      expect(result.success).toBe(true);
      expect(result.user?.uid).toBe('new-user-id');
      expect(result.user?.email).toBe('newuser@example.com');
      expect(result.user?.role).toBe(role);
      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'newuser@example.com',
        'password123'
      );
      expect(mockSetDoc).toHaveBeenCalledTimes(2); // User doc and profile doc
    });

    it('should fail with invalid role', async () => {
      const result = await authService.signUp('test@example.com', 'password123', 'invalid' as UserRole);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid user role specified');
      expect(mockCreateUserWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it('should fail with short password', async () => {
      const result = await authService.signUp('test@example.com', '123', 'vendor');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Password must be at least 8 characters long');
      expect(mockCreateUserWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it('should fail if user already exists', async () => {
      mockGetDoc.mockResolvedValue({ exists: (() => true) as any } as any); // User exists

      const result = await authService.signUp('existing@example.com', 'password123', 'vendor');

      expect(result.success).toBe(false);
      expect(result.error).toBe('An account with this email already exists');
      expect(mockCreateUserWithEmailAndPassword).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should successfully send password reset email', async () => {
      mockSendPasswordResetEmail.mockResolvedValue(undefined);

      await expect(authService.resetPassword('test@example.com')).resolves.not.toThrow();
      expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com'
      );
    });

    it('should fail with invalid email', async () => {
      await expect(authService.resetPassword('invalid-email')).rejects.toThrow(
        'Please enter a valid email address'
      );
      expect(mockSendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('should fail with empty email', async () => {
      await expect(authService.resetPassword('')).rejects.toThrow(
        'Email is required'
      );
      expect(mockSendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    it('should successfully sign out', async () => {
      mockSignOut.mockResolvedValue(undefined);

      await expect(authService.signOut()).resolves.not.toThrow();
      expect(mockSignOut).toHaveBeenCalled();
    });

    it('should handle sign out errors', async () => {
      mockSignOut.mockRejectedValue(new Error('Sign out failed'));

      await expect(authService.signOut()).rejects.toThrow(
        'Failed to sign out. Please try again.'
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no user is signed in', () => {
      const user = authService.getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('onAuthStateChanged', () => {
    it('should register auth state listener', () => {
      const callback = vi.fn();
      const unsubscribe = authService.onAuthStateChanged(callback);

      expect(typeof unsubscribe).toBe('function');
      expect(callback).toHaveBeenCalledWith(null); // Initial call with current state
    });

    it('should unsubscribe auth state listener', async () => {
      const callback = vi.fn();
      const unsubscribe = authService.onAuthStateChanged(callback);

      // Initial call with current state (null)
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(null);

      // Get the internal handler registered with Firebase
      const authStateHandler = mockOnAuthStateChanged.mock.calls[0][1] as any;

      // Simulate auth state change
      await authStateHandler(null); // Explicitly trigger with null
      expect(callback).toHaveBeenCalledTimes(2);

      unsubscribe();

      // Trigger another change after unsubscription
      await authStateHandler(null);

      // Should NOT be called again
      expect(callback).toHaveBeenCalledTimes(2);
    });
  });

  describe('hasRoleAccess', () => {
    it('should return true for vendor with sell access', async () => {
      const hasAccess = await authService.hasRoleAccess('vendor', ['sell']);
      expect(hasAccess).toBe(true);
    });

    it('should return false for buyer with sell access', async () => {
      const hasAccess = await authService.hasRoleAccess('buyer', ['sell']);
      expect(hasAccess).toBe(false);
    });

    it('should return true for agent with facilitate access', async () => {
      const hasAccess = await authService.hasRoleAccess('agent', ['facilitate']);
      expect(hasAccess).toBe(true);
    });

    it('should return false for invalid features', async () => {
      const hasAccess = await authService.hasRoleAccess('vendor', ['invalid_feature']);
      expect(hasAccess).toBe(false);
    });
  });

  describe('getRoleFeatures', () => {
    it('should return correct features for vendor role', () => {
      const features = authService.getRoleFeatures('vendor');
      expect(features).toContain('sell');
      expect(features).toContain('negotiate');
      expect(features).toContain('manage_inventory');
    });

    it('should return correct features for buyer role', () => {
      const features = authService.getRoleFeatures('buyer');
      expect(features).toContain('buy');
      expect(features).toContain('negotiate');
      expect(features).toContain('search_products');
    });

    it('should return correct features for agent role', () => {
      const features = authService.getRoleFeatures('agent');
      expect(features).toContain('facilitate');
      expect(features).toContain('negotiate');
      expect(features).toContain('commission_tracking');
    });
  });
});