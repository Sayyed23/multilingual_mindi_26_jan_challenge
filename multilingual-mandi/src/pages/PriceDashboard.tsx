import React, { useState } from 'react';
import { CategoryBrowser } from '../components/dashboard/CategoryBrowser';
import { LocationPriceTable } from '../components/dashboard/LocationPriceTable';
import { MarketIntelligence } from '../components/dashboard/MarketIntelligence';
import { SearchBar } from '../components/dashboard/SearchBar';
import './Dashboard.css'; // Updated import

interface PriceDashboardProps {
  className?: string;
}

export const PriceDashboard: React.FC<PriceDashboardProps> = ({ className }) => {
  const [selectedCategory, setSelectedCategory] = useState('vegetables');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState('Aurangabad');

  return (
    <div className={`price-dashboard ${className || ''}`}>
      {/* Top Navigation Bar */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-section">
              <div className="logo-icon">
                <span className="material-symbols-outlined">agriculture</span>
              </div>
              <h2 className="logo-text">AgriMarket B2B</h2>
            </div>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search commodities (e.g., Onion, Wheat)"
            />
          </div>

          <div className="header-right">
            <nav className="main-nav">
              <a href="#" className="nav-link">Spot Prices</a>
              <a href="#" className="nav-link">Future Estimates</a>
              <a href="#" className="nav-link">Analytics</a>
              <a href="#" className="nav-link">My Portfolio</a>
            </nav>

            <div className="header-actions">
              <button className="action-btn">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="action-btn">
                <span className="material-symbols-outlined">settings</span>
              </button>
            </div>

            <div className="user-avatar"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-grid">
          {/* Left Column: Main Content */}
          <div className="main-content">
            <CategoryBrowser
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />

            <LocationPriceTable
              location={currentLocation}
              onLocationChange={setCurrentLocation}
              searchQuery={searchQuery}
            />
          </div>

          {/* Right Column: Market Intelligence */}
          <aside className="sidebar-content">
            <MarketIntelligence />
          </aside>
        </div>
      </main>

      {/* Floating Action Button for Mobile */}
      <div className="mobile-fab">
        <button className="fab-button">
          <span className="material-symbols-outlined">query_stats</span>
        </button>
      </div>
    </div>
  );
};

export default PriceDashboard;
