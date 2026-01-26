import React from 'react';
import WeatherHeader from '../components/weather/WeatherHeader';
import WeatherSidebar from '../components/weather/WeatherSidebar';
import ImpactStats from '../components/weather/ImpactStats';
import WeatherMap from '../components/weather/WeatherMap';
import AffectedCommodities from '../components/weather/AffectedCommodities';
import SourcingRecommendations from '../components/weather/SourcingRecommendations';
import './WeatherImpact.css';

const WeatherImpact: React.FC = () => {
  return (
    <div className="weather-page">
      <WeatherHeader />

      <div className="weather-content-wrapper">
        <WeatherSidebar />

        <main className="weather-main">
          <div className="page-header-weather">
            <div className="ph-title">
              <h1>Weather Impact & Sourcing</h1>
              <p style={{ color: '#9db9a4', marginTop: '4px' }}>Real-time weather risk analysis and procurement recommendations.</p>
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', backgroundColor: '#28392c', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>file_download</span>
              Download Report
            </button>
          </div>

          <ImpactStats />

          <div style={{ flex: 1, display: 'flex', padding: '24px', gap: '24px', minHeight: '500px' }}>
            <WeatherMap />

            <div className="weather-widgets">
              <AffectedCommodities />
              <SourcingRecommendations />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WeatherImpact;