import React from 'react';
import './WeatherImpact.css';

const WeatherImpact: React.FC = () => {
  return (
    <div className="weather-page-container">
      <div className="weather-header-section">
        <div>
          <div className="page-tag">
            <span className="material-symbols-outlined">thunderstorm</span>
            <span>Weather Intelligence</span>
          </div>
          <h1>Weather Impact & Sourcing</h1>
          <p className="page-subtitle">Real-time weather risk analysis and procurement recommendations.</p>
        </div>
        <button className="download-btn">
          <span className="material-symbols-outlined">file_download</span>
          Download Report
        </button>
      </div>

      <div className="impact-stats">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Active Alerts</span>
            <span className="material-symbols-outlined warning-icon">warning</span>
          </div>
          <p className="stat-value">14</p>
          <p className="stat-change danger">
            <span className="material-symbols-outlined">trending_up</span>
            +12% vs last week
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Trade Volume at Risk</span>
            <span className="material-symbols-outlined warning-yellow">analytics</span>
          </div>
          <p className="stat-value">2.4M Tons</p>
          <p className="stat-change warning">
            <span className="material-symbols-outlined">trending_up</span>
            +5% impact
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Sourcing Alternatives</span>
            <span className="material-symbols-outlined success-icon">shuffle</span>
          </div>
          <p className="stat-value">8 Regions</p>
          <p className="stat-change success">
            <span className="material-symbols-outlined">check_circle</span>
            Optimized
          </p>
        </div>
      </div>

      <div className="weather-content-grid">
        <div className="weather-map-section">
          <div className="map-header">
            <h3>Risk Assessment Map</h3>
            <div className="map-controls-bar">
              <button className="filter-btn">
                <span className="material-symbols-outlined">tune</span>
                Filters
              </button>
              <button className="filter-btn">
                <span className="material-symbols-outlined">calendar_month</span>
                7-Day Outlook
              </button>
            </div>
          </div>
          <div className="map-placeholder">
            <div className="map-gradient"></div>
            <div className="map-markers">
              <div className="marker marker-red" style={{ top: '30%', left: '25%' }}>
                <div className="marker-pulse"></div>
              </div>
              <div className="marker marker-yellow" style={{ top: '50%', left: '60%' }}>
                <div className="marker-pulse"></div>
              </div>
              <div className="marker marker-green" style={{ top: '70%', left: '40%' }}>
                <div className="marker-pulse"></div>
              </div>
            </div>
            <div className="map-legend">
              <div className="legend-item">
                <span className="dot red"></span>
                <span>Heavy Rain</span>
              </div>
              <div className="legend-item">
                <span className="dot yellow"></span>
                <span>Heatwave</span>
              </div>
              <div className="legend-item">
                <span className="dot green"></span>
                <span>Stable</span>
              </div>
            </div>
          </div>
        </div>

        <div className="weather-widgets-section">
          <div className="widget-card">
            <h3>
              <span className="material-symbols-outlined">spa</span>
              Affected Commodities
            </h3>
            <div className="commodity-item critical">
              <div className="commodity-info">
                <p className="commodity-name">Onions (Red/Yellow)</p>
                <p className="commodity-impact">Impact: Severe Yield Loss</p>
              </div>
              <span className="severity-badge critical">CRITICAL</span>
            </div>
            <div className="commodity-item warning">
              <div className="commodity-info">
                <p className="commodity-name">Yellow Corn</p>
                <p className="commodity-impact">Impact: Quality Downgrade</p>
              </div>
              <span className="severity-badge warning">WARNING</span>
            </div>
          </div>

          <div className="widget-card">
            <h3>
              <span className="material-symbols-outlined">lightbulb</span>
              Sourcing Recommendations
            </h3>
            <div className="recommendation-item primary">
              <div className="rec-icon">
                <span className="material-symbols-outlined">alt_route</span>
              </div>
              <div className="rec-content">
                <p className="rec-title">Pivot Strategy Alpha</p>
                <p className="rec-description">Switch Onion procurement from Region Y to Region X. Predicted yield +15% above average.</p>
              </div>
            </div>
            <div className="recommendation-item">
              <div className="rec-icon secondary">
                <span className="material-symbols-outlined">history</span>
              </div>
              <div className="rec-content">
                <p className="rec-title">Forward Booking Alert</p>
                <p className="rec-description">Lock in Wheat futures for Q4. Prices likely to increase 12% in 10 days.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherImpact;
