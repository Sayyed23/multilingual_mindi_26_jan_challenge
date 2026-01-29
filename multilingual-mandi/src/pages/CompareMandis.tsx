import React from 'react';
import { SearchBar } from '../components/dashboard/SearchBar';
import '../components/dashboard/Dashboard.css';

const mandiData = [
    {
        id: 1,
        name: 'Khanna Mandi',
        location: 'Punjab, Northern Region',
        price: 2125,
        change: 1.2,
        distance: '142 km',
        arrival: '450 MT',
        updated: '3 mins ago',
        bestValue: true
    },
    {
        id: 2,
        name: 'Indore Mandi',
        location: 'Madhya Pradesh',
        price: 2180,
        change: -0.5,
        distance: '620 km',
        arrival: '1,200 MT',
        updated: '12 mins ago',
        bestValue: false
    },
    {
        id: 3,
        name: 'Ganganagar Mandi',
        location: 'Rajasthan',
        price: 2145,
        change: 0,
        distance: '310 km',
        arrival: '890 MT',
        updated: '28 mins ago',
        bestValue: false
    },
    {
        id: 4,
        name: 'Ahmedabad Mandi',
        location: 'Gujarat',
        price: 2210,
        change: 2.1,
        distance: '945 km',
        arrival: '560 MT',
        updated: '1 hour ago',
        bestValue: false
    }
];

const CompareMandis: React.FC = () => {
    return (
        <div className="price-dashboard"> {/* Reusing base dashboard layout */}
            {/* Top Header */}
            <header className="dashboard-header h-[72px]">
                <div className="header-content">
                    <div className="header-left">
                        <div className="logo-section">
                            <div className="logo-icon">
                                <span className="material-symbols-outlined">agriculture</span>
                            </div>
                            <h2 className="logo-text">AgriMarket Intelligence</h2>
                        </div>
                        <SearchBar
                            value=""
                            onChange={() => { }}
                            placeholder="Search Mandis..."
                        />
                    </div>

                    <div className="header-right">
                        <nav className="main-nav">
                            <a href="#" className="nav-link">Dashboard</a>
                            <a href="#" className="nav-link active">Market Prices</a>
                            <a href="#" className="nav-link">Logistics</a>
                            <a href="#" className="nav-link">Trends</a>
                        </nav>

                        <button className="chart-btn primary">Initiate Trade</button>
                        <div className="user-avatar"></div>
                    </div>
                </div>
            </header>

            <main className="dashboard-main">
                {/* Page Title & Breadcrumbs */}
                <div className="page-title-section">
                    <div className="title-left">
                        <p className="page-subtitle">Market Intelligence / <strong>Multi-Mandi Comparison</strong></p>
                        <div className="mt-4">
                            <h1 className="page-main-title">
                                Compare Mandis
                                <span className="live-badge">● Live Updates</span>
                            </h1>
                            <p className="text-slate-400 mt-2">Optimize your sourcing by comparing real-time prices across major wholesale markets.</p>
                        </div>
                    </div>
                    <button className="export-btn">
                        <span className="material-symbols-outlined">download</span>
                        Export Data
                    </button>
                </div>

                {/* Filters Bar */}
                <div className="filters-bar">
                    <div className="filter-group">
                        <span className="filter-label">Select Commodity</span>
                        <button className="commodity-select">
                            <span className="material-symbols-outlined">grain</span>
                            Wheat
                            <span className="material-symbols-outlined">expand_more</span>
                        </button>
                    </div>

                    <div className="filter-group flex-1">
                        <span className="filter-label">Selected Mandis (Max 5)</span>
                        <div className="mandi-tags">
                            {mandiData.map(mandi => (
                                <div key={mandi.id} className="mandi-tag">
                                    {mandi.name}
                                    <span className="material-symbols-outlined close-icon">close</span>
                                </div>
                            ))}
                            <button className="add-mandi-btn">
                                <span className="material-symbols-outlined">add</span>
                                ADD MANDI
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Comparison Grid */}
                <div className="comparison-grid">
                    {/* Table */}
                    <div className="comparison-list">
                        <div className="comparison-header">
                            <span className="col-header">Mandi Name</span>
                            <span className="col-header">Price (₹/Qtl)</span>
                            <span className="col-header">Distance</span>
                            <span className="col-header">Arrival</span>
                            <span className="col-header">Updated</span>
                        </div>

                        {mandiData.map(mandi => (
                            <div key={mandi.id} className="mandi-card">
                                <div className="mandi-info">
                                    <span className="name">
                                        {mandi.name}
                                        {mandi.bestValue && <span className="best-value-badge">BEST VALUE</span>}
                                    </span>
                                    <span className="location">{mandi.location}</span>
                                </div>
                                <div className="price-info">
                                    <div className="value">₹{mandi.price.toLocaleString()}</div>
                                    {mandi.change !== 0 ? (
                                        <div className={`change ${mandi.change > 0 ? 'positive' : 'negative'}`}>
                                            {mandi.change > 0 ? '+' : ''}{mandi.change}% since yesterday
                                        </div>
                                    ) : (
                                        <div className="change text-slate-500">No change today</div>
                                    )}
                                </div>
                                <div className="data-value">{mandi.distance}</div>
                                <div className="data-value">{mandi.arrival}</div>
                                <div className="data-sub">{mandi.updated}</div>
                            </div>
                        ))}
                    </div>

                    {/* Map */}
                    <div className="map-container">
                        {/* Visual Placeholder for map - using a dark map style image if available or just a div */}
                        <div style={{ width: '100%', height: '100%', backgroundColor: '#0f172a', position: 'relative' }}>
                            {/* Simulating Map Elements */}
                            <svg width="100%" height="100%" viewBox="0 0 400 600">
                                <path d="M100 100 L 200 250 L 300 150" stroke="#28392c" strokeWidth="2" fill="none" />
                                <circle cx="200" cy="250" r="4" fill="#13ec49" />

                                {/* Fake marker labels */}
                                <g transform="translate(180, 220)">
                                    <rect x="0" y="0" width="60" height="24" rx="4" fill="#13ec49" />
                                    <text x="30" y="16" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#000">₹2,125</text>
                                    <path d="M30 24 L 30 34" stroke="#13ec49" strokeWidth="2" />
                                    <circle cx="30" cy="34" r="4" fill="#000" stroke="#13ec49" strokeWidth="2" />
                                </g>

                                <g transform="translate(80, 150)">
                                    <rect x="0" y="0" width="50" height="20" rx="4" fill="#0f172a" stroke="#28392c" />
                                    <text x="25" y="14" textAnchor="middle" fontSize="10" fill="#ffffff">₹2,145</text>
                                </g>
                            </svg>

                            <div className="map-controls">
                                <button className="map-control-btn">+</button>
                                <button className="map-control-btn">-</button>
                                <button className="map-control-btn">
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>layers</span>
                                </button>
                            </div>

                            <div className="market-status-legend">
                                <div className="legend-title">Market Status</div>
                                <div className="legend-items">
                                    <div className="legend-item">
                                        <span className="dot" style={{ backgroundColor: '#13ec49' }}></span>
                                        Cheapest
                                    </div>
                                    <div className="legend-item">
                                        <span className="dot" style={{ backgroundColor: '#ffffff' }}></span>
                                        In Range
                                    </div>
                                    <div className="legend-item">
                                        <span className="dot" style={{ backgroundColor: '#ff4d4d' }}></span>
                                        High Volatility
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="bottom-grid">
                    <div className="info-card">
                        <div className="card-header">
                            <h3 className="card-title">Price Forecast</h3>
                            <span className="ai-badge">AI INSIGHT</span>
                        </div>
                        <div className="card-content">
                            <p>Prices in Punjab/Haryana likely to dip by 2-3% due to high arrival volume next week.</p>
                            <button className="action-btn-full btn-secondary">View Deep Analysis</button>
                        </div>
                    </div>

                    <div className="info-card">
                        <div className="card-header">
                            <h3 className="card-title">Logistics Estimate</h3>
                        </div>
                        <div className="card-content">
                            <div className="btn-row">
                                <span>Lowest Freight</span>
                                <strong className="text-white">₹280/MT (Khanna)</strong>
                            </div>
                            <div className="btn-row" style={{ marginBottom: '20px' }}>
                                <span>Fleet Availability</span>
                                <strong className="text-high">High (24+ Trucks)</strong>
                            </div>
                            <button className="action-btn-full btn-primary">Book Logistics Now</button>
                        </div>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="chart-section">
                    <div className="chart-header">
                        <div className="flex items-center gap-2">
                            <span className="dot" style={{ backgroundColor: '#13ec49' }}></span>
                            <h3 className="chart-title" style={{ fontSize: '1rem' }}>Comparing <strong>4 Mandis</strong> for <strong>Wheat</strong></h3>
                        </div>

                        <div className="chart-actions">
                            <button className="chart-btn">Historical Trends</button>
                            <button className="chart-btn primary">Initiate Multi-Trade</button>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-6">Price Trend (Last 30 Days)</h3>

                    <div className="chart-bars">
                        {[30, 40, 50, 50, 60, 70, 70, 85, 90, 100, 80, 50, 48, 45, 43].map((h, i) => (
                            <div
                                key={i}
                                className={`bar ${i === 14 ? 'highlight' : ''}`}
                                style={{ height: `${h}%` }}
                            ></div>
                        ))}
                    </div>
                    <div className="chart-labels">
                        <span>Aug 01</span>
                        <span>Aug 10</span>
                        <span>Aug 20</span>
                        <span>Today (Aug 28)</span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CompareMandis;
