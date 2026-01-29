import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CommodityDetail.css';

interface PricePoint {
  date: string;
  price: number;
}

interface MandiPrice {
  name: string;
  distance: string;
  price: number;
  difference: number;
}

const CommodityDetail: React.FC = () => {
  const { commodityId } = useParams<{ commodityId: string }>();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('7');

  const commodityData = {
    id: commodityId || 'onions',
    name: 'Onions',
    nameHindi: 'प्याज',
    icon: '🧅',
    currentPrice: 1850,
    unit: 'per Quintal',
    change: 5.2,
    changeDirection: 'up' as const,
    fairPriceMin: 1750,
    fairPriceMax: 1950,
    aiConfidence: 87,
    category: 'Vegetables'
  };

  const priceHistory: PricePoint[] = [
    { date: 'Jan 23', price: 1720 },
    { date: 'Jan 24', price: 1680 },
    { date: 'Jan 25', price: 1750 },
    { date: 'Jan 26', price: 1800 },
    { date: 'Jan 27', price: 1780 },
    { date: 'Jan 28', price: 1820 },
    { date: 'Jan 29', price: 1850 }
  ];

  const nearbyMandis: MandiPrice[] = [
    { name: 'Aurangabad Mandi', distance: '0 km', price: 1850, difference: 0 },
    { name: 'Jalna Mandi', distance: '65 km', price: 1780, difference: -70 },
    { name: 'Pune Mandi', distance: '230 km', price: 1920, difference: 70 },
    { name: 'Nashik Mandi', distance: '180 km', price: 1800, difference: -50 }
  ];

  const qualityGrades = [
    { grade: 'A', criteria: 'Uniform size (4-6 cm), No blemishes, Dry outer skin', priceMultiplier: 1.1 },
    { grade: 'B', criteria: 'Slight size variation, Minor blemishes allowed', priceMultiplier: 1.0 },
    { grade: 'C', criteria: 'Mixed sizes, Some damage acceptable', priceMultiplier: 0.85 }
  ];

  const forecast = {
    trend: 'rising' as const,
    nextWeekPrediction: 1920,
    confidence: 78,
    factors: ['Upcoming festival demand', 'Lower arrivals expected', 'Good storage conditions']
  };

  const periods = [
    { id: '7', label: '7 Days' },
    { id: '30', label: '30 Days' },
    { id: '90', label: '90 Days' },
    { id: '365', label: '1 Year' }
  ];

  const maxPrice = Math.max(...priceHistory.map(p => p.price));
  const minPrice = Math.min(...priceHistory.map(p => p.price));
  const priceRange = maxPrice - minPrice;

  return (
    <div className="commodity-detail-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back to Prices
      </button>

      <div className="commodity-header">
        <div className="commodity-title">
          <span className="commodity-icon-large">{commodityData.icon}</span>
          <div>
            <h1>{commodityData.name}</h1>
            <span className="commodity-hindi">{commodityData.nameHindi}</span>
          </div>
        </div>
        <div className="price-summary">
          <div className="current-price">
            <span className="price-label">Current Price</span>
            <span className="price-value">₹{commodityData.currentPrice.toLocaleString()}</span>
            <span className="price-unit">{commodityData.unit}</span>
          </div>
          <div className={`price-change ${commodityData.changeDirection}`}>
            {commodityData.changeDirection === 'up' ? '↑' : '↓'} {commodityData.change}%
            <span className="change-label">7-day change</span>
          </div>
        </div>
        <button className="alert-btn">🔔 Set Alert</button>
      </div>

      <div className="commodity-grid">
        <div className="main-content">
          <div className="card price-chart-card">
            <div className="card-header">
              <h3>Price History</h3>
              <div className="period-tabs">
                {periods.map(period => (
                  <button
                    key={period.id}
                    className={`period-tab ${selectedPeriod === period.id ? 'active' : ''}`}
                    onClick={() => setSelectedPeriod(period.id)}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="chart-container">
              <div className="simple-chart">
                {priceHistory.map((point, index) => (
                  <div key={index} className="chart-bar-wrapper">
                    <div 
                      className="chart-bar"
                      style={{ 
                        height: `${((point.price - minPrice) / priceRange) * 100 + 20}%`
                      }}
                    >
                      <span className="bar-value">₹{point.price}</span>
                    </div>
                    <span className="bar-label">{point.date.split(' ')[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card fair-price-card">
            <div className="card-header">
              <h3>Fair Price Range</h3>
              <span className="ai-badge">AI Powered</span>
            </div>
            <div className="fair-price-content">
              <div className="price-range-visual">
                <div className="range-bar">
                  <div 
                    className="current-marker"
                    style={{ 
                      left: `${((commodityData.currentPrice - commodityData.fairPriceMin) / 
                              (commodityData.fairPriceMax - commodityData.fairPriceMin)) * 100}%` 
                    }}
                  >
                    <span>Current</span>
                  </div>
                </div>
                <div className="range-labels">
                  <span>₹{commodityData.fairPriceMin}</span>
                  <span>₹{commodityData.fairPriceMax}</span>
                </div>
              </div>
              <div className="confidence-score">
                <span className="confidence-label">AI Confidence</span>
                <div className="confidence-bar">
                  <div 
                    className="confidence-fill"
                    style={{ width: `${commodityData.aiConfidence}%` }}
                  ></div>
                </div>
                <span className="confidence-value">{commodityData.aiConfidence}%</span>
              </div>
            </div>
          </div>

          <div className="card mandis-card">
            <div className="card-header">
              <h3>Nearby Mandis</h3>
              <button className="view-map-btn">📍 View on Map</button>
            </div>
            <div className="mandis-table">
              <div className="table-header">
                <span>Mandi</span>
                <span>Distance</span>
                <span>Price</span>
                <span>Difference</span>
              </div>
              {nearbyMandis.map((mandi, index) => (
                <div key={index} className="table-row">
                  <span className="mandi-name">{mandi.name}</span>
                  <span>{mandi.distance}</span>
                  <span className="mandi-price">₹{mandi.price}</span>
                  <span className={`price-diff ${mandi.difference >= 0 ? 'positive' : 'negative'}`}>
                    {mandi.difference >= 0 ? '+' : ''}₹{mandi.difference}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sidebar-content">
          <div className="card forecast-card">
            <div className="card-header">
              <h3>Price Forecast</h3>
              <span className="forecast-period">Next 7 Days</span>
            </div>
            <div className="forecast-content">
              <div className="forecast-prediction">
                <span className={`trend-icon ${forecast.trend}`}>
                  {forecast.trend === 'rising' ? '📈' : forecast.trend === 'falling' ? '📉' : '➡️'}
                </span>
                <div className="prediction-details">
                  <span className="predicted-price">₹{forecast.nextWeekPrediction}</span>
                  <span className="prediction-label">Predicted Price</span>
                </div>
              </div>
              <div className="forecast-confidence">
                <span>Confidence: {forecast.confidence}%</span>
              </div>
              <div className="forecast-factors">
                <h4>Key Factors</h4>
                <ul>
                  {forecast.factors.map((factor, index) => (
                    <li key={index}>{factor}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="card quality-card">
            <div className="card-header">
              <h3>Quality Standards</h3>
            </div>
            <div className="quality-grades">
              {qualityGrades.map((grade, index) => (
                <div key={index} className="grade-item">
                  <div className="grade-header">
                    <span className="grade-badge">Grade {grade.grade}</span>
                    <span className="grade-multiplier">
                      {grade.priceMultiplier > 1 ? '+' : ''}
                      {((grade.priceMultiplier - 1) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="grade-criteria">{grade.criteria}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommodityDetail;
