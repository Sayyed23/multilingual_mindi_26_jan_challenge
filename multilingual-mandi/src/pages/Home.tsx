import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import Sidebar from '../components/dashboard/Sidebar';
import QuickActions from '../components/dashboard/QuickActions';
import MarketSnapshot from '../components/dashboard/MarketSnapshot';
import ActiveNegotiations from '../components/dashboard/ActiveNegotiations';
import MarketIntelligence from '../components/dashboard/MarketIntelligence';
import RecentChats from '../components/dashboard/RecentChats';
import { CommoditySearchResult } from '../types/commodity';
import { UserProfile } from '../types/user';
import '../components/dashboard/Dashboard.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleCommoditySelect = (commodity: CommoditySearchResult) => {
    navigate(`/prices?commodity=${commodity.commodity.id}&name=${encodeURIComponent(commodity.commodity.name)}`);
  };

  const handleVendorSelect = (vendor: UserProfile) => {
    navigate(`/chats?vendor=${vendor.userId}&name=${encodeURIComponent(vendor.name)}`);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        {/* Header removed in favor of GlobalHeader */}
        <div className="main-scroll-area">
          <QuickActions />

          <div className="dashboard-grid">
            <div className="left-column">
              <MarketSnapshot />
              <ActiveNegotiations />
            </div>

            <div className="right-column">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <MarketIntelligence />
                <RecentChats />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;