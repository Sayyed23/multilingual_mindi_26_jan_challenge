import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/Login'));
const Home = lazy(() => import('./pages/Home'));
const Prices = lazy(() => import('./pages/Prices'));
const Chats = lazy(() => import('./pages/Chats'));
const ChatDetail = lazy(() => import('./pages/ChatDetail'));
const Deals = lazy(() => import('./pages/Deals'));
const DealDetail = lazy(() => import('./pages/DealDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const CreateListing = lazy(() => import('./pages/CreateListing'));
const FestivalForecast = lazy(() => import('./pages/FestivalForecast'));
const WeatherImpact = lazy(() => import('./pages/WeatherImpact'));
const Logistics = lazy(() => import('./pages/Logistics'));
const CommunityFeed = lazy(() => import('./pages/CommunityFeed'));
const CommodityDetail = lazy(() => import('./pages/CommodityDetail'));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Suspense fallback={<div className="app-loading"><LoadingSpinner size="large" /></div>}>
          <div className="app">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="prices" element={<Prices />} />
                <Route path="commodity/:commodityId" element={<CommodityDetail />} />
                <Route path="create-listing" element={<CreateListing />} />
                <Route path="festival-forecast" element={<FestivalForecast />} />
                <Route path="weather-impact" element={<WeatherImpact />} />
                <Route path="logistics" element={<Logistics />} />
                <Route path="community-feed" element={<CommunityFeed />} />
                <Route
                  path="chats"
                  element={
                    <ProtectedRoute>
                      <Chats />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="chats/:chatId"
                  element={
                    <ProtectedRoute>
                      <ChatDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="deals"
                  element={
                    <ProtectedRoute>
                      <Deals />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="deals/:dealId"
                  element={
                    <ProtectedRoute>
                      <DealDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </div>
          </Suspense>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
