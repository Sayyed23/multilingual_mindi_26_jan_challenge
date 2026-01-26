import React from 'react';
import './Logistics.css';

const Logistics: React.FC = () => {
    return (
        <div className="logistics-page">
            <div className="logistics-header">
                <div>
                    <h1>Logistics Command Center</h1>
                    <p>Real-time fleet tracking and route optimization.</p>
                </div>
                <div className="logistics-actions">
                    <button className="btn-secondary-log">
                        <span className="material-symbols-outlined">history</span>
                        History
                    </button>
                    <button className="btn-primary-log">
                        <span className="material-symbols-outlined">add</span>
                        New Shipment
                    </button>
                </div>
            </div>

            <div className="logistics-grid">
                {/* Stats Row */}
                <div className="stats-container">
                    <div className="stat-card-log">
                        <div className="stat-icon-wrapper blue">
                            <span className="material-symbols-outlined">local_shipping</span>
                        </div>
                        <div>
                            <p className="stat-label">Active Shipments</p>
                            <p className="stat-number">24</p>
                        </div>
                    </div>
                    <div className="stat-card-log">
                        <div className="stat-icon-wrapper amber">
                            <span className="material-symbols-outlined">schedule</span>
                        </div>
                        <div>
                            <p className="stat-label">Delayed</p>
                            <p className="stat-number">3</p>
                        </div>
                    </div>
                    <div className="stat-card-log">
                        <div className="stat-icon-wrapper green">
                            <span className="material-symbols-outlined">inventory_2</span>
                        </div>
                        <div>
                            <p className="stat-label">Delivered Today</p>
                            <p className="stat-number">18</p>
                        </div>
                    </div>
                </div>

                {/* Main Content: Map Placeholder & List */}
                <div className="logistics-content-row">
                    <div className="map-section">
                        <div className="map-placeholder">
                            <div className="map-overlay-text">
                                <span className="material-symbols-outlined" style={{ fontSize: '48px', marginBottom: '16px' }}>map</span>
                                <p>Live Fleet Map</p>
                                <button className="view-map-btn">View Fullscreen</button>
                            </div>
                        </div>
                    </div>

                    <div className="shipments-list">
                        <h3>Upcoming Deliveries</h3>
                        <div className="shipment-item">
                            <div className="shipment-info">
                                <span className="shipment-id">#SH-8821</span>
                                <span className="shipment-route">Mumbai → Pune</span>
                            </div>
                            <span className="status-badge in-transit">In Transit</span>
                        </div>
                        <div className="shipment-item">
                            <div className="shipment-info">
                                <span className="shipment-id">#SH-8822</span>
                                <span className="shipment-route">Delhi → Jaipur</span>
                            </div>
                            <span className="status-badge delayed">Delayed</span>
                        </div>
                        <div className="shipment-item">
                            <div className="shipment-info">
                                <span className="shipment-id">#SH-8824</span>
                                <span className="shipment-route">Nagpur → Indore</span>
                            </div>
                            <span className="status-badge pending">Scheduled</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Logistics;
