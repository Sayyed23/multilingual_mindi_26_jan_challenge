import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { LanguageProvider } from './contexts/LanguageContext';

// Auth Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import OnboardingPage from './pages/OnboardingPage';

// Main App Pages
// Main App Pages
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import NegotiationPage from './pages/NegotiationPage';
import DealsPage from './pages/DealsPage';

// New Pages
import SearchPage from './pages/SearchPage';
import InventoryPage from './pages/InventoryPage';
import OrdersPage from './pages/OrdersPage';
import ChatsPage from './pages/ChatsPage';
import NotificationsPage from './pages/NotificationsPage';
import ScannerPage from './pages/ScannerPage';
import PriceDiscoveryPage from './pages/PriceDiscoveryPage'; // Market Page
import AdminDashboard from './pages/AdminDashboard'; // Admin Dashboard
import LandingPage from './pages/LandingPage'; // Landing Page

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Landing Page Route */}
          <Route path="/" element={<LandingPage />} />

          {/* Onboarding Route */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requireAuth={true} requireOnboarding={false}>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          {/* Protected App Routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute requireAuth={true} requireOnboarding={true}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />

            {/* Market & Search */}
            <Route path="market" element={<PriceDiscoveryPage />} />
            <Route
              path="search"
              element={
                <ProtectedRoute allowedRoles={['buyer', 'agent', 'vendor']}>
                  <SearchPage />
                </ProtectedRoute>
              }
            />
            <Route path="scanner" element={<ScannerPage />} />

            {/* Vendor Specific */}
            <Route
              path="inventory"
              element={
                <ProtectedRoute allowedRoles={['vendor']}>
                  <InventoryPage />
                </ProtectedRoute>
              }
            />

            {/* Buyer Specific */}
            <Route
              path="orders"
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />

            {/* Deals & Negotiations */}
            <Route
              path="deals"
              element={
                <ProtectedRoute allowedRoles={['vendor', 'buyer', 'agent']}>
                  <DealsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="negotiations/:negotiationId?"
              element={
                <ProtectedRoute allowedRoles={['vendor', 'buyer', 'agent']}>
                  <NegotiationPage />
                </ProtectedRoute>
              }
            />
            <Route path="chats" element={<ChatsPage />} />

            {/* User Features */}
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="profile" element={<ProfilePage />} />

            {/* Admin Routes */}
            <Route
              path="admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
};

export default App;
