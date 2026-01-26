import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>मंडी</h1>
        <p>Welcome to Multilingual Mandi</p>
      </div>
      <div className="page-content">
        <div className="feature-grid">
          <div className="feature-card">
            <h3>Real-time Prices</h3>
            <p>Get current market prices from 100+ mandis</p>
          </div>
          <div className="feature-card">
            <h3>Multilingual Chat</h3>
            <p>Communicate in 22+ Indian languages</p>
          </div>
          <div className="feature-card">
            <h3>Smart Negotiations</h3>
            <p>AI-powered negotiation assistance</p>
          </div>
          <div className="feature-card">
            <h3>Deal Management</h3>
            <p>Track your deals and transactions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;