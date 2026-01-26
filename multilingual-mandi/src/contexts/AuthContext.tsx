/**
 * Authentication Context for managing user authentication state
 * Supports Requirements: 4.1 - User authentication and session management
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthUser, UserRegistration } from '../types/user';
import { LoginResponse, CreateUserResponse, OtpResponse } from '../types/api';
import { authService } from '../services/authService';

// Auth State Interface
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  otpSent: boolean;
  otpExpiresAt: Date | null;
  attemptsRemaining: number;
}

// Auth Actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: AuthUser }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'OTP_SENT'; payload: { expiresAt: Date; attemptsRemaining: number } }
  | { type: 'OTP_VERIFIED' }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial State
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  otpSent: false,
  otpExpiresAt: null,
  attemptsRemaining: 3
};

// Auth Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        otpSent: false,
        otpExpiresAt: null
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        otpSent: false,
        otpExpiresAt: null
      };

    case 'OTP_SENT':
      return {
        ...state,
        otpSent: true,
        otpExpiresAt: action.payload.expiresAt,
        attemptsRemaining: action.payload.attemptsRemaining,
        isLoading: false,
        error: null
      };

    case 'OTP_VERIFIED':
      return {
        ...state,
        otpSent: false,
        otpExpiresAt: null,
        error: null
      };

    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    default:
      return state;
  }
}

// Auth Context Interface
interface AuthContextType extends AuthState {
  requestOtp: (phoneNumber: string, purpose?: 'login' | 'registration') => Promise<void>;
  verifyOtpAndLogin: (phoneNumber: string, otp: string) => Promise<void>;
  registerUser: (userData: UserRegistration, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshToken: () => Promise<void>;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Initialize authentication state from stored tokens
   */
  const initializeAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        const user = authService.getCurrentUser();
        if (user) {
          dispatch({ 
            type: 'AUTH_SUCCESS', 
            payload: {
              ...user,
              accessToken: authService.getAccessToken() || '',
              refreshToken: ''
            } as AuthUser
          });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * Request OTP for phone number
   */
  const requestOtp = async (
    phoneNumber: string, 
    purpose: 'login' | 'registration' = 'login'
  ): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response: OtpResponse = await authService.requestOtp(phoneNumber, purpose);
      
      const expiresAt = new Date(Date.now() + response.expiresIn * 1000);
      
      dispatch({ 
        type: 'OTP_SENT', 
        payload: { 
          expiresAt, 
          attemptsRemaining: response.attemptsRemaining 
        } 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  /**
   * Verify OTP and login user
   */
  const verifyOtpAndLogin = async (phoneNumber: string, otp: string): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response: LoginResponse = await authService.verifyOtpAndLogin(phoneNumber, otp);
      
      dispatch({ type: 'OTP_VERIFIED' });
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid OTP';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  /**
   * Register new user
   */
  const registerUser = async (userData: UserRegistration, otp: string): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response: CreateUserResponse = await authService.registerUser(userData, otp);
      
      const authUser: AuthUser = {
        ...response.user,
        accessToken: response.authTokens.accessToken,
        refreshToken: response.authTokens.refreshToken
      };
      
      dispatch({ type: 'OTP_VERIFIED' });
      dispatch({ type: 'AUTH_SUCCESS', payload: authUser });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      // Still dispatch logout to clear local state
      dispatch({ type: 'LOGOUT' });
    }
  };

  /**
   * Clear error state
   */
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  /**
   * Refresh authentication token
   */
  const refreshToken = async (): Promise<void> => {
    try {
      await authService.refreshAccessToken();
      const user = authService.getCurrentUser();
      if (user) {
        dispatch({ 
          type: 'AUTH_SUCCESS', 
          payload: {
            ...user,
            accessToken: authService.getAccessToken() || '',
            refreshToken: ''
          } as AuthUser
        });
      }
    } catch (error) {
      dispatch({ type: 'LOGOUT' });
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    requestOtp,
    verifyOtpAndLogin,
    registerUser,
    logout,
    clearError,
    refreshToken
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;