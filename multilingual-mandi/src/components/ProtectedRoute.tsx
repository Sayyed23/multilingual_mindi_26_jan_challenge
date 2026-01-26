/**
 * Protected Route Component
 * Provides route protection based on authentication status
 * Supports Requirements: 4.1 - Authentication-based access control
 */

import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
  requireAuth = true,
  redirectTo
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="protected-route-loading">
        <LoadingSpinner size="large" />
        <p>Loading...</p>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Show custom fallback if provided
    if (fallback) {
      return <>{fallback}</>;
    }

    // Show auth modal by default
    return (
      <>
        <div className="protected-route-fallback">
          <div className="auth-required-message">
            <h2>Authentication Required</h2>
            <p>Please log in to access this feature.</p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="auth-button"
            >
              Login / Register
            </button>
          </div>
        </div>
        
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode="login"
          onAuthSuccess={() => setShowAuthModal(false)}
        />
      </>
    );
  }

  // If authentication is not required or user is authenticated, render children
  return <>{children}</>;
};

export default ProtectedRoute;