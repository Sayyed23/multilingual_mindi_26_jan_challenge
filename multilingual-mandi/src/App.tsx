import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Auth } from './pages/Auth';
import { Home } from './pages/Home';
import { Onboarding } from './pages/Onboarding';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { BuyerDashboard } from './pages/BuyerDashboard';
import { PriceDiscovery } from './pages/PriceDiscovery';
import { NegotiationPage } from './pages/NegotiationPage';
import { AlertsPage } from './pages/AlertsPage';
import { UserProfile } from './pages/UserProfile';
import { CommunityPage } from './pages/CommunityPage';
import { SettingsPage } from './pages/SettingsPage';
import { AppShell } from './components/AppShell';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/auth" element={<Auth />} />

        {/* App Shell Layout for authenticated routes */}
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<FarmerDashboard />} />
          <Route path="/price-discovery" element={<PriceDiscovery />} />
          <Route path="/dashboard/deals" element={<NegotiationPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/buyer/dashboard" element={<BuyerDashboard />} />

        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
