import React, { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BottomNavigation from './BottomNavigation';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';
import AuthModal from './AuthModal';

const Layout: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="app-layout">
      <ErrorBoundary>
        {/* Header */}
        <header className="app-header">
          <div className="header-content">
            <div className="header-left">
              <h1 className="app-title">Multilingual Mandi</h1>
            </div>
            
            <div className="header-right">
              {isAuthenticated && user ? (
                <div className="user-menu">
                  <span className="user-greeting">
                    Hello, {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="logout-button"
                    title="Logout"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="login-button"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="main-content">
          <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
            <Outlet />
          </Suspense>
        </main>
        
        <BottomNavigation />
        
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode="login"
          onAuthSuccess={() => setShowAuthModal(false)}
        />
      </ErrorBoundary>
    </div>
  );
};

export default Layout;