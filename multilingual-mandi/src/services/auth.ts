// Authentication Service with Firebase Auth Integration
// Implements signIn, signUp, resetPassword, and signOut methods
// Handles role-based user creation with profile document generation
// Manages authentication state and session handling

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
  type AuthError
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type {
  AuthService,
  AuthResult,
  User,
  UserRole,
  UserProfile,
  Language,
  Location,
  Unsubscribe,
  NotificationPreferences,
  PrivacySettings
} from '../types';

class AuthenticationService implements AuthService {
  private currentUser: User | null = null;
  private authStateListeners: Array<(user: User | null) => void> = [];

  constructor() {
    // Initialize auth state listener
    this.initializeAuthStateListener();
  }

  private initializeAuthStateListener(): void {
    onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          // Fetch user profile from Firestore
          const userProfile = await this.fetchUserProfile(firebaseUser.uid);
          this.currentUser = userProfile;
        } catch (error) {
          console.error('Error fetching user profile:', error);
          this.currentUser = null;
        }
      } else {
        this.currentUser = null;
      }

      // Notify all listeners
      this.authStateListeners.forEach(callback => callback(this.currentUser));
    });
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      // Validate input
      if (!email || !password) {
        return {
          success: false,
          error: 'Email and password are required'
        };
      }

      if (!this.isValidEmail(email)) {
        return {
          success: false,
          error: 'Please enter a valid email address'
        };
      }

      // Attempt Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Fetch user profile
      const userProfile = await this.fetchUserProfile(firebaseUser.uid);

      if (!userProfile) {
        return {
          success: false,
          error: 'User profile not found. Please contact support.'
        };
      }

      this.currentUser = userProfile;

      return {
        success: true,
        user: userProfile
      };

    } catch (error) {
      const authError = error as AuthError;
      console.error('Sign in error:', authError.code);
      return {
        success: false,
        error: this.getAuthErrorMessage(authError)
      };
    }
  }

  async signUp(email: string, password: string, role: UserRole): Promise<AuthResult> {
    try {
      // Validate input
      if (!email || !password || !role) {
        return {
          success: false,
          error: 'Email, password, and role are required'
        };
      }

      if (!this.isValidEmail(email)) {
        return {
          success: false,
          error: 'Please enter a valid email address'
        };
      }

      if (password.length < 8) {
        return {
          success: false,
          error: 'Password must be at least 8 characters long'
        };
      }

      if (!['vendor', 'buyer', 'agent', 'admin'].includes(role)) {
        return {
          success: false,
          error: 'Invalid user role specified'
        };
      }

      // Check if user already exists
      const userExists = await this.checkUserExists(email);
      if (userExists) {
        return {
          success: false,
          error: 'An account with this email already exists'
        };
      }

      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Create user profile document - rollback auth user on failure
      let userProfile: User;
      try {
        userProfile = await this.createUserProfile(firebaseUser.uid, email, role);
      } catch (profileError) {
        // Rollback: delete the Firebase auth user
        try {
          await firebaseUser.delete();
        } catch (deleteError) {
          console.error('Failed to rollback user creation:', deleteError);
          // Attach rollback error to original error to preserve context
          if (profileError instanceof Error) {
            (profileError as any).rollbackError = deleteError;
          }
        }
        throw profileError;
      }

      this.currentUser = userProfile;

      return {
        success: true,
        user: userProfile
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: this.getAuthErrorMessage(error as AuthError)
      };
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      if (!email) {
        throw new Error('Email is required');
      }

      if (!this.isValidEmail(email)) {
        throw new Error('Please enter a valid email address');
      }

      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw new Error(this.getAuthErrorMessage(error as AuthError));
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
      this.currentUser = null;
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out. Please try again.');
    }
  }

  async refreshProfile(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      this.currentUser = null;
      this.authStateListeners.forEach(callback => callback(null));
      return null;
    }

    try {
      const userProfile = await this.fetchUserProfile(firebaseUser.uid);
      this.currentUser = userProfile;
      this.authStateListeners.forEach(callback => callback(this.currentUser));
      return userProfile;
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      return null;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe {
    this.authStateListeners.push(callback);

    // Immediately call with current state
    callback(this.currentUser);

    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  // Helper method to check if user exists
  private async checkUserExists(email: string): Promise<boolean> {
    try {
      // Check if a user document exists with this email
      // We'll check both the users collection and userProfiles collection
      const userDoc = doc(db, 'users', email);
      const docSnap = await getDoc(userDoc);
      return docSnap.exists();
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  }

  // Helper method to fetch user profile from Firestore
  private async fetchUserProfile(uid: string): Promise<User | null> {
    try {
      const userDoc = doc(db, 'users', uid);
      const docSnap = await getDoc(userDoc);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          uid: data.uid,
          email: data.email,
          role: data.role,
          language: data.language || 'en',
          location: data.location || this.getDefaultLocation(),
          onboardingCompleted: data.onboardingCompleted || false,
          verificationStatus: data.verificationStatus || 'unverified',

          createdAt: this.parseTimestamp(data.createdAt),
          updatedAt: this.parseTimestamp(data.updatedAt)
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Helper method to safe parse timestamps
  private parseTimestamp(value: unknown): Date {
    if (!value) return new Date();

    // Handle Firestore Timestamp objects (have toDate method)
    if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as any).toDate === 'function') {
      try {
        return (value as any).toDate();
      } catch (e) {
        console.warn('Failed to convert Firestore timestamp, formatting error:', e);
      }
    }

    // Handle strings or numbers (or Date objects)
    const date = new Date(value as any);

    // Validate result
    if (isNaN(date.getTime())) {
      return new Date();
    }

    return date;
  }

  // Helper method to create user profile document
  private async createUserProfile(uid: string, email: string, role: UserRole): Promise<User> {
    try {
      const defaultLocation = this.getDefaultLocation();
      const defaultLanguage: Language = 'en';

      const userProfile: User = {
        uid,
        email,
        role,
        language: defaultLanguage,
        location: defaultLocation,
        onboardingCompleted: false,
        verificationStatus: 'unverified',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Create user document in Firestore
      const userDoc = doc(db, 'users', uid);
      await setDoc(userDoc, {
        ...userProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Also create a detailed user profile document
      await this.createDetailedUserProfile(uid, email, role, defaultLanguage, defaultLocation);

      return userProfile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw new Error('Failed to create user profile');
    }
  }

  // Helper method to create detailed user profile
  private async createDetailedUserProfile(
    uid: string,
    email: string,
    role: UserRole,
    language: Language,
    location: Location
  ): Promise<void> {
    try {
      const defaultNotificationPreferences: NotificationPreferences = {
        priceAlerts: true,
        dealUpdates: true,
        newOpportunities: true,
        systemUpdates: true,
        marketingMessages: false,
        channels: {
          push: true,
          email: true,
          sms: false
        }
      };

      const defaultPrivacySettings: PrivacySettings = {
        profileVisibility: 'verified_only',
        showContactInfo: false,
        showTransactionHistory: false,
        allowDirectMessages: true,
        dataSharing: false
      };

      const userProfile: UserProfile = {
        uid,
        email,
        role,
        personalInfo: {
          name: '',
          phone: '',
          language,
          location
        },
        businessInfo: {
          businessName: '',
          commodities: [],
          operatingRegions: [location]
        },
        preferences: {
          notifications: defaultNotificationPreferences,
          privacy: defaultPrivacySettings
        },
        trustData: {
          verificationStatus: 'unverified',
          trustScore: 0,
          transactionHistory: []
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const profileDoc = doc(db, 'userProfiles', uid);
      await setDoc(profileDoc, {
        ...userProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating detailed user profile:', error);
      throw error;
    }
  }

  // Helper method to get default location
  private getDefaultLocation(): Location {
    return {
      state: '',
      district: '',
      city: '',
      pincode: ''
    };
  }

  // Helper method to validate email format
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Helper method to convert Firebase auth errors to user-friendly messages
  private getAuthErrorMessage(error: AuthError): string {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email address';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/invalid-email':
        return 'Please enter a valid email address';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/weak-password':
        return 'Password should be at least 8 characters';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      case 'auth/invalid-credential':
        return 'Invalid email or password';
      case 'auth/operation-not-allowed':
        return 'Email/Password sign-in is not enabled in the Firebase Console. Please enable it in the Authentication settings.';
      default:
        return error.message || 'An error occurred during authentication';
    }
  }

  // Method to check if user has role-based access
  async hasRoleAccess(userRole: UserRole, requiredFeatures: string[]): Promise<boolean> {
    const roleFeatures: Record<UserRole, string[]> = {
      vendor: ['sell', 'negotiate', 'manage_inventory', 'view_prices', 'receive_orders'],
      buyer: ['buy', 'negotiate', 'search_products', 'view_prices', 'place_orders'],
      agent: ['facilitate', 'negotiate', 'manage_deals', 'view_prices', 'commission_tracking'],
      admin: ['manage_users', 'resolve_disputes', 'view_analytics', 'manage_platform']
    };

    const userFeatures = roleFeatures[userRole] || [];
    return requiredFeatures.every(feature => userFeatures.includes(feature));
  }

  // Method to get role-specific features
  getRoleFeatures(role: UserRole): string[] {
    const roleFeatures: Record<UserRole, string[]> = {
      vendor: ['sell', 'negotiate', 'manage_inventory', 'view_prices', 'receive_orders'],
      buyer: ['buy', 'negotiate', 'search_products', 'view_prices', 'place_orders'],
      agent: ['facilitate', 'negotiate', 'manage_deals', 'view_prices', 'commission_tracking'],
      admin: ['manage_users', 'resolve_disputes', 'view_analytics', 'manage_platform']
    };

    return roleFeatures[role] || [];
  }
}

// Export singleton instance
export const authService = new AuthenticationService();

// Export the class for testing
export { AuthenticationService };