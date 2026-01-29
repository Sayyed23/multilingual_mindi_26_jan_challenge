/**
 * Authentication Context for managing user authentication state
 * Supports simple email/password login with demo credentials
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// Demo user for testing
const DEMO_USER = {
  id: 'demo-user-1',
  email: 'demo@mandi.com',
  name: 'Demo User',
  phone: '+91 9876543210',
  userType: 'vendor' as const,
  preferredLanguage: 'en',
  location: {
    mandi: 'Aurangabad Mandi',
    state: 'Maharashtra',
    district: 'Aurangabad'
  },
  isVerified: true,
  rating: 4.8,
  totalDeals: 47,
  memberSince: '2024-01-15'
};

const DEMO_PASSWORD = 'password123';

// Auth User Interface
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  userType: 'vendor' | 'buyer' | 'both';
  preferredLanguage: string;
  location?: {
    mandi: string;
    state: string;
    district: string;
  };
  isVerified: boolean;
  rating?: number;
  totalDeals?: number;
  memberSince?: string;
  profilePicture?: string;
}

// Auth State Interface
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth Actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: AuthUser }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial State
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
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
        error: null
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
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
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Storage key for persisting auth
const AUTH_STORAGE_KEY = 'mandi_auth_user';

// Auth Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Initialize authentication state from localStorage
   */
  const initializeAuth = async () => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        const user = JSON.parse(storedUser) as AuthUser;
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * Login with email and password
   */
  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'AUTH_START' });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check demo credentials
    if (email.toLowerCase() === DEMO_USER.email && password === DEMO_PASSWORD) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_USER));
      dispatch({ type: 'AUTH_SUCCESS', payload: DEMO_USER });
    } else {
      dispatch({ type: 'AUTH_FAILURE', payload: 'Invalid email or password. Use demo@mandi.com / password123' });
      throw new Error('Invalid credentials');
    }
  };

  /**
   * Logout user
   */
  const logout = async (): Promise<void> => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    dispatch({ type: 'LOGOUT' });
  };

  /**
   * Clear error state
   */
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    clearError
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
