import { lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Prices = lazy(() => import('./pages/Prices'));
const Chats = lazy(() => import('./pages/Chats'));
const Deals = lazy(() => import('./pages/Deals'));
const Profile = lazy(() => import('./pages/Profile'));
const CreateListing = lazy(() => import('./pages/CreateListing'));
const FestivalForecast = lazy(() => import('./pages/FestivalForecast'));
const WeatherImpact = lazy(() => import('./pages/WeatherImpact'));
const Logistics = lazy(() => import('./pages/Logistics'));
const CommunityFeed = lazy(() => import('./pages/CommunityFeed'));

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="app">
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="prices" element={<Prices />} />
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
                  path="deals"
                  element={
                    <ProtectedRoute>
                      <Deals />
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
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
