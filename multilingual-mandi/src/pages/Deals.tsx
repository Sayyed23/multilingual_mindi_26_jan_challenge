import React, { useState } from 'react';
import './Deals.css';

interface Deal {
  id: string;
  commodity: string;
  quantity: string;
  image: string;
  buyer: string;
  buyerAvatar: string;
  status: 'negotiating' | 'payment_pending' | 'confirmed' | 'completed' | 'cancelled';
  offeredPrice: number;
  marketPrice: number;
  totalValue: number;
  lastActivity: string;
  deliveryDate: string;
}

const mockDeals: Deal[] = [
  {
    id: '1',
    commodity: 'Wheat',
    quantity: '50 Quintals',
    image: '🌾',
    buyer: 'Rajesh Kumar',
    buyerAvatar: 'R',
    status: 'negotiating',
    offeredPrice: 2100,
    marketPrice: 2150,
    totalValue: 105000,
    lastActivity: '2 hours ago',
    deliveryDate: '15 Feb 2026'
  },
  {
    id: '2',
    commodity: 'Rice',
    quantity: '25 Quintals',
    image: '🍚',
    buyer: 'Suresh Patel',
    buyerAvatar: 'S',
    status: 'payment_pending',
    offeredPrice: 3200,
    marketPrice: 3150,
    totalValue: 80000,
    lastActivity: '1 day ago',
    deliveryDate: '20 Feb 2026'
  },
  {
    id: '3',
    commodity: 'Onions',
    quantity: '100 Quintals',
    image: '🧅',
    buyer: 'Meera Singh',
    buyerAvatar: 'M',
    status: 'confirmed',
    offeredPrice: 1800,
    marketPrice: 1750,
    totalValue: 180000,
    lastActivity: '3 days ago',
    deliveryDate: '18 Feb 2026'
  },
  {
    id: '4',
    commodity: 'Tomatoes',
    quantity: '30 Quintals',
    image: '🍅',
    buyer: 'Amit Sharma',
    buyerAvatar: 'A',
    status: 'completed',
    offeredPrice: 2500,
    marketPrice: 2450,
    totalValue: 75000,
    lastActivity: '1 week ago',
    deliveryDate: '10 Feb 2026'
  }
];

const Deals: React.FC = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [dealType, setDealType] = useState('all');

  const tabs = [
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'all', label: 'All' }
  ];

  const filteredDeals = mockDeals.filter(deal => {
    if (activeTab === 'active') {
      return ['negotiating', 'payment_pending', 'confirmed'].includes(deal.status);
    }
    if (activeTab === 'completed') return deal.status === 'completed';
    if (activeTab === 'cancelled') return deal.status === 'cancelled';
    return true;
  });

  const stats = {
    activeDeals: mockDeals.filter(d => ['negotiating', 'payment_pending', 'confirmed'].includes(d.status)).length,
    monthlyGMV: 440000,
    completed: mockDeals.filter(d => d.status === 'completed').length
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'negotiating': return 'Negotiating';
      case 'payment_pending': return 'Payment Pending';
      case 'confirmed': return 'Confirmed';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  return (
    <div className="deals-page">
      <div className="deals-header">
        <div className="deals-title-row">
          <h1>My Deals</h1>
          <button className="new-deal-btn">
            <span>+</span> Start New Deal
          </button>
        </div>
        <p>Track your ongoing and completed transactions</p>
      </div>

      <div className="quick-stats">
        <div className="quick-stat-card">
          <div className="quick-stat-icon green">📊</div>
          <div className="quick-stat-content">
            <h4>Active Deals</h4>
            <span className="quick-stat-value">{stats.activeDeals}</span>
          </div>
        </div>
        <div className="quick-stat-card">
          <div className="quick-stat-icon blue">💰</div>
          <div className="quick-stat-content">
            <h4>This Month GMV</h4>
            <span className="quick-stat-value">₹{(stats.monthlyGMV / 1000).toFixed(0)}K</span>
          </div>
        </div>
        <div className="quick-stat-card">
          <div className="quick-stat-icon yellow">✓</div>
          <div className="quick-stat-content">
            <h4>Completed</h4>
            <span className="quick-stat-value">{stats.completed}</span>
          </div>
        </div>
      </div>

      <div className="deals-filters">
        <div className="deals-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="deal-type-filter">
          <button 
            className={`filter-btn ${dealType === 'all' ? 'active' : ''}`}
            onClick={() => setDealType('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${dealType === 'buying' ? 'active' : ''}`}
            onClick={() => setDealType('buying')}
          >
            Buying
          </button>
          <button 
            className={`filter-btn ${dealType === 'selling' ? 'active' : ''}`}
            onClick={() => setDealType('selling')}
          >
            Selling
          </button>
        </div>
      </div>

      <div className="deals-list">
        {filteredDeals.map(deal => (
          <div key={deal.id} className="deal-card">
            <div className="deal-commodity">
              <span className="commodity-icon">{deal.image}</span>
              <div className="commodity-info">
                <h4>{deal.commodity}</h4>
                <span>{deal.quantity}</span>
              </div>
            </div>
            
            <div className="deal-party">
              <div className="party-avatar">{deal.buyerAvatar}</div>
              <div className="party-info">
                <span className="party-label">Buyer</span>
                <span className="party-name">{deal.buyer}</span>
              </div>
            </div>

            <div className="deal-price">
              <span className="price-label">Offer</span>
              <span className="price-value">₹{deal.offeredPrice}/Q</span>
              <span className={`price-diff ${deal.offeredPrice >= deal.marketPrice ? 'positive' : 'negative'}`}>
                {deal.offeredPrice >= deal.marketPrice ? '+' : ''}
                ₹{deal.offeredPrice - deal.marketPrice}/Q vs market
              </span>
            </div>

            <div className="deal-status-section">
              <span className={`deal-status ${deal.status}`}>
                {getStatusLabel(deal.status)}
              </span>
              <span className="deal-time">{deal.lastActivity}</span>
            </div>

            <div className="deal-actions">
              <button className="btn-secondary">View</button>
              {deal.status === 'negotiating' && (
                <button className="btn-primary">Continue Chat</button>
              )}
              {deal.status === 'payment_pending' && (
                <button className="btn-primary">Pay Now</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Deals;
