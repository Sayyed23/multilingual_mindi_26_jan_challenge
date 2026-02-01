import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth';
import type { User, AuthResult, UserRole } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, role: UserRole) => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<User | null>;
}

export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setState(prev => ({
        ...prev,
        user,
        loading: false
      }));
    });

    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await authService.signIn(email, password);

      if (!result.success) {
        setState(prev => ({ ...prev, loading: false, error: result.error || 'Sign in failed' }));
      } else {
        setState(prev => ({ ...prev, loading: false, error: null }));
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, role: UserRole): Promise<AuthResult> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await authService.signUp(email, password, role);

      if (!result.success) {
        setState(prev => ({ ...prev, loading: false, error: result.error || 'Sign up failed' }));
      } else {
        setState(prev => ({ ...prev, loading: false, error: null }));
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    setState(prev => ({ ...prev, error: null }));

    try {
      await authService.resetPassword(email);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await authService.signOut();
      setState(prev => ({ ...prev, loading: false, error: null }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const refreshProfile = useCallback(async (): Promise<User | null> => {
    try {
      const updatedUser = await authService.refreshProfile();
      setState(prev => ({ ...prev, user: updatedUser }));
      return updatedUser;
    } catch (error) {
      console.error('Error in refreshProfile hook:', error);
      return null;
    }
  }, []);

  return {
    ...state,
    signIn,
    signUp,
    resetPassword,
    signOut,
    clearError,
    refreshProfile
  };
}