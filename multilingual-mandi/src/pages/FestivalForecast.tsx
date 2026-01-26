import React from 'react';
import ForecastHeader from '../components/forecast/ForecastHeader';
import FilterChips from '../components/forecast/FilterChips';
import FestivalTimeline from '../components/forecast/FestivalTimeline';
import PricePatternChart from '../components/forecast/PricePatternChart';
import DemandPrediction from '../components/forecast/DemandPrediction';
import SmartThreshold from '../components/forecast/SmartThreshold';
import ForecastInfoCards from '../components/forecast/ForecastInfoCards';
import './FestivalForecast.css';

const FestivalForecast: React.FC = () => {
  return (
    <div className="forecast-page">
      {/* <ForecastHeader /> Removed for Global Layout */}

      <main className="forecast-main">
        <div className="page-heading">
          <div className="heading-content">
            <div className="heading-tag">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>auto_graph</span>
              <span className="tag-label">Market Intelligence</span>
            </div>
            <h1 className="page-title">Festival Forecast Analysis</h1>
            <p className="page-subtitle">Predictive modeling for agricultural commodity demand based on upcoming global cultural events and historical price cycles.</p>
          </div>

          <div className="heading-actions">
            <button className="action-btn btn-secondary">
              <span className="material-symbols-outlined">download</span>
              Export Report
            </button>
            <button className="action-btn btn-primary-action">
              <span className="material-symbols-outlined">alarm_add</span>
              Set Price Alert
            </button>
          </div>
        </div>

        <FilterChips />

        <FestivalTimeline />

        <div className="charts-grid">
          <PricePatternChart />

          <div className="prediction-card-column" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <DemandPrediction />
            <SmartThreshold />
          </div>
        </div>

        <ForecastInfoCards />
      </main>
    </div>
  );
};

export default FestivalForecast;