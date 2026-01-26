import React from 'react';

const Deals: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Deals</h1>
        <p>Track your ongoing and completed transactions</p>
      </div>
      <div className="page-content">
        <div className="deals-tabs">
          <button className="tab-button active">Active</button>
          <button className="tab-button">Completed</button>
          <button className="tab-button">Cancelled</button>
        </div>
        <div className="deals-list">
          <div className="deal-card">
            <div className="deal-header">
              <h4>Wheat - 50 Quintals</h4>
              <span className="deal-status negotiating">Negotiating</span>
            </div>
            <div className="deal-details">
              <p><strong>Buyer:</strong> Rajesh Kumar</p>
              <p><strong>Offered Price:</strong> ₹2,100/quintal</p>
              <p><strong>Market Price:</strong> ₹2,150/quintal</p>
              <p><strong>Expected Delivery:</strong> 15 Jan 2024</p>
            </div>
            <div className="deal-actions">
              <button className="btn-primary">Counter Offer</button>
              <button className="btn-secondary">View Chat</button>
            </div>
          </div>
          <div className="deal-card">
            <div className="deal-header">
              <h4>Rice - 25 Quintals</h4>
              <span className="deal-status agreed">Agreed</span>
            </div>
            <div className="deal-details">
              <p><strong>Buyer:</strong> Suresh Patel</p>
              <p><strong>Final Price:</strong> ₹3,200/quintal</p>
              <p><strong>Total Value:</strong> ₹80,000</p>
              <p><strong>Delivery Date:</strong> 20 Jan 2024</p>
            </div>
            <div className="deal-actions">
              <button className="btn-primary">Confirm Deal</button>
              <button className="btn-secondary">View Details</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deals;