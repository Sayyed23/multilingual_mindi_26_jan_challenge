import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './DealDetail.css';

const DealDetail: React.FC = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const navigate = useNavigate();

  const deal = {
    id: dealId || '1',
    status: 'confirmed' as const,
    createdAt: 'Jan 20, 2026',
    lastUpdated: 'Jan 29, 2026',
    commodity: {
      name: 'Wheat',
      icon: '🌾',
      quantity: 50,
      unit: 'Quintals',
      grade: 'A',
      deliveryLocation: 'Aurangabad Mandi, Maharashtra'
    },
    pricing: {
      agreedPrice: 2150,
      marketPrice: 2180,
      totalAmount: 107500,
      platformFee: 537.5
    },
    buyer: {
      name: 'Rajesh Kumar',
      avatar: 'R',
      rating: 4.7,
      reviews: 42,
      verified: true
    },
    seller: {
      name: 'Your Business',
      avatar: 'Y',
      rating: 4.9,
      reviews: 87,
      verified: true
    },
    negotiationHistory: [
      { timestamp: 'Jan 20, 12:30 PM', event: 'Initial Offer', price: 2100, party: 'Buyer' },
      { timestamp: 'Jan 20, 2:15 PM', event: 'Counter Offer', price: 2200, party: 'Seller' },
      { timestamp: 'Jan 21, 10:00 AM', event: 'Counter Offer', price: 2120, party: 'Buyer' },
      { timestamp: 'Jan 22, 11:30 AM', event: 'Final Agreement', price: 2150, party: 'Both' }
    ],
    payment: {
      method: 'UPI',
      status: 'pending' as const,
      transactionId: null
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'negotiating': return 'amber';
      case 'confirmed': return 'primary';
      case 'payment_pending': return 'blue';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'primary';
    }
  };

  return (
    <div className="deal-detail-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back to Deals
      </button>

      <div className="deal-header-card">
        <div className="deal-id-row">
          <span className="deal-id">Deal #{deal.id}</span>
          <span className={`status-badge ${getStatusColor(deal.status)}`}>
            {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
          </span>
        </div>
        <div className="deal-dates">
          <span>Created: {deal.createdAt}</span>
          <span>Last Updated: {deal.lastUpdated}</span>
        </div>
      </div>

      <div className="deal-grid">
        <div className="deal-main">
          <div className="card commodity-details-card">
            <div className="card-header">
              <h3>Commodity Details</h3>
            </div>
            <div className="card-content">
              <div className="commodity-row">
                <span className="commodity-icon">{deal.commodity.icon}</span>
                <div className="commodity-info">
                  <h4>{deal.commodity.name}</h4>
                  <span>{deal.commodity.quantity} {deal.commodity.unit}</span>
                </div>
                <span className="quality-badge">Grade {deal.commodity.grade}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Delivery Location</span>
                <span className="detail-value">{deal.commodity.deliveryLocation}</span>
              </div>
            </div>
          </div>

          <div className="card pricing-card">
            <div className="card-header">
              <h3>Pricing Information</h3>
            </div>
            <div className="card-content">
              <div className="pricing-grid">
                <div className="pricing-item">
                  <span className="pricing-label">Agreed Price</span>
                  <span className="pricing-value primary">₹{deal.pricing.agreedPrice}/Q</span>
                </div>
                <div className="pricing-item">
                  <span className="pricing-label">Market Price</span>
                  <span className="pricing-value">₹{deal.pricing.marketPrice}/Q</span>
                </div>
                <div className="pricing-item highlight">
                  <span className="pricing-label">Total Amount</span>
                  <span className="pricing-value large">₹{deal.pricing.totalAmount.toLocaleString()}</span>
                </div>
                <div className="pricing-item">
                  <span className="pricing-label">Platform Fee (0.5%)</span>
                  <span className="pricing-value">₹{deal.pricing.platformFee}</span>
                </div>
              </div>
              <div className="savings-banner">
                ₹{(deal.pricing.marketPrice - deal.pricing.agreedPrice) * deal.commodity.quantity}/- saved vs market average
              </div>
            </div>
          </div>

          <div className="card negotiation-card">
            <div className="card-header">
              <h3>Negotiation History</h3>
            </div>
            <div className="card-content">
              <div className="timeline">
                {deal.negotiationHistory.map((event, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-event">{event.event}</span>
                        <span className="timeline-time">{event.timestamp}</span>
                      </div>
                      <div className="timeline-details">
                        <span className="timeline-party">{event.party}</span>
                        <span className="timeline-price">₹{event.price}/Q</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="ai-analysis">
                <span className="ai-icon">🤖</span>
                <span>Good negotiation! You saved ₹1,500 from the initial offer.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="deal-sidebar">
          <div className="card parties-card">
            <div className="card-header">
              <h3>Parties</h3>
            </div>
            <div className="card-content">
              <div className="party-section">
                <span className="party-label">Buyer</span>
                <div className="party-info">
                  <div className="party-avatar">{deal.buyer.avatar}</div>
                  <div className="party-details">
                    <span className="party-name">
                      {deal.buyer.name}
                      {deal.buyer.verified && <span className="verified-badge">✓</span>}
                    </span>
                    <span className="party-rating">⭐ {deal.buyer.rating} ({deal.buyer.reviews} reviews)</span>
                  </div>
                </div>
                <button className="view-profile-btn">View Profile</button>
              </div>
              <div className="party-divider"></div>
              <div className="party-section">
                <span className="party-label">Seller (You)</span>
                <div className="party-info">
                  <div className="party-avatar seller">{deal.seller.avatar}</div>
                  <div className="party-details">
                    <span className="party-name">
                      {deal.seller.name}
                      {deal.seller.verified && <span className="verified-badge">✓</span>}
                    </span>
                    <span className="party-rating">⭐ {deal.seller.rating} ({deal.seller.reviews} reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card payment-card">
            <div className="card-header">
              <h3>Payment Status</h3>
            </div>
            <div className="card-content">
              <div className="payment-status">
                <span className={`payment-badge ${deal.payment.status}`}>
                  {deal.payment.status === 'pending' ? '⏳ Pending' : 
                   deal.payment.status === 'completed' ? '✓ Completed' : '× Failed'}
                </span>
              </div>
              <div className="payment-method">
                <span className="detail-label">Method</span>
                <span className="detail-value">{deal.payment.method}</span>
              </div>
              {deal.payment.status === 'pending' && (
                <button className="pay-btn">Make Payment</button>
              )}
            </div>
          </div>

          <div className="card actions-card">
            <div className="card-header">
              <h3>Actions</h3>
            </div>
            <div className="card-content">
              <button className="action-btn primary">Continue Chat</button>
              <button className="action-btn secondary">Raise Dispute</button>
              <button className="action-btn danger">Cancel Deal</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealDetail;
