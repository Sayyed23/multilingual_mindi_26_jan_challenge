import React from 'react';

const Prices: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Market Prices</h1>
        <p>Real-time commodity prices from mandis across India</p>
      </div>
      <div className="page-content">
        <div className="search-section">
          <input 
            type="text" 
            placeholder="Search commodities..." 
            className="search-input"
          />
          <button className="search-button">Search</button>
        </div>
        <div className="price-list">
          <div className="price-card">
            <h3>Wheat</h3>
            <p className="price">₹2,150/quintal</p>
            <p className="location">Delhi Mandi</p>
            <p className="trend positive">↗ +2.5%</p>
          </div>
          <div className="price-card">
            <h3>Rice</h3>
            <p className="price">₹3,200/quintal</p>
            <p className="location">Punjab Mandi</p>
            <p className="trend negative">↘ -1.2%</p>
          </div>
          <div className="price-card">
            <h3>Onion</h3>
            <p className="price">₹1,800/quintal</p>
            <p className="location">Maharashtra Mandi</p>
            <p className="trend stable">→ 0.0%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prices;