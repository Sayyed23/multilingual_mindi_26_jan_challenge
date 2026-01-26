import React, { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';
import AuthModal from './AuthModal';

import GlobalHeader from './layout/GlobalHeader';
import GlobalFooter from './layout/GlobalFooter';
import './layout/Layout.css';

const Layout: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="app-layout">
      <ErrorBoundary>
        <GlobalHeader />

        <main className="main-content" style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column' }}>
          <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
            <Outlet />
          </Suspense>
        </main>

        <GlobalFooter />

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