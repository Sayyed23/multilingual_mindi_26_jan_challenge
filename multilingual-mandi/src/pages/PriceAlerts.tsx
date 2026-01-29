import React, { useState } from 'react';
import '../components/dashboard/Dashboard.css'; // Reuse existing dashboard styles
import { PriceAlert } from '../types/price';

const PriceAlerts: React.FC = () => {
    // Mock data for initial display
    const [activeAlerts] = useState<PriceAlert[]>([
        {
            id: '1',
            userId: 'user1',
            commodityId: 'wheat-hard-red',
            targetPrice: 7.50,
            condition: 'above',
            tolerance: 0,
            isActive: true,
            createdAt: new Date(),
            notificationSent: false
        },
        {
            id: '2',
            userId: 'user1',
            commodityId: 'corn-yellow-2',
            targetPrice: 4.00,
            condition: 'below',
            tolerance: 0,
            isActive: false, // Paused
            createdAt: new Date(),
            notificationSent: false
        },
        {
            id: '3',
            userId: 'user1',
            commodityId: 'soybeans',
            targetPrice: 12.00,
            condition: 'above',
            tolerance: 0,
            isActive: true,
            createdAt: new Date(),
            notificationSent: false
        }
    ]);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Price Alerts Management</h1>
                <p>Monitor commodity volatility with real-time push and SMS notifications.</p>
                <button className="primary-button">
                    + Create New Alert
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-header">
                        <h3>ACTIVE ALERTS</h3>
                        <span className="icon-bell">🔔</span>
                    </div>
                    <div className="stat-value">12</div>
                    <div className="stat-trend positive">+2 this week</div>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <h3>NOTIFICATIONS TODAY</h3>
                        <span className="icon-send">➤</span>
                    </div>
                    <div className="stat-value">48</div>
                    <div className="stat-trend positive">+15% vs yesterday</div>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <h3>SUCCESS RATE</h3>
                        <span className="icon-check">✓</span>
                    </div>
                    <div className="stat-value">99.9%</div>
                    <div className="stat-trend negative">-0.1% latency</div>
                </div>
            </div>

            {/* Active Alerts Table */}
            <div className="dashboard-card" style={{ marginTop: '2rem' }}>
                <div className="card-header">
                    <h2>Active Alerts</h2>
                    <div className="card-actions">
                        <button className="icon-button">⚙️</button>
                        <button className="icon-button">⋮</button>
                    </div>
                </div>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>COMMODITY</th>
                                <th>CURRENT PRICE</th>
                                <th>TARGET PRICE</th>
                                <th>METHODS</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeAlerts.map(alert => (
                                <tr key={alert.id}>
                                    <td>
                                        <div className="commodity-info">
                                            <div className="commodity-icon">🌿</div>
                                            <div>
                                                <strong>{alert.commodityId === 'wheat-hard-red' ? 'Wheat (Hard Red Winter)' :
                                                    alert.commodityId === 'corn-yellow-2' ? 'Corn (Yellow #2)' : 'Soybeans'}</strong>
                                                <div className="text-secondary">Market Name Here</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>$7.42/bu</td> {/* Mock current price */}
                                    <td style={{ color: '#4ade80' }}>
                                        {alert.condition === 'above' ? '≥' : '≤'} ${alert.targetPrice.toFixed(2)}/bu
                                    </td>
                                    <td>
                                        <span className="badge badge-dark">PUSH</span>
                                        <span className="badge badge-dark" style={{ marginLeft: '4px' }}>SMS</span>
                                    </td>
                                    <td>
                                        <span className={`status-pill ${alert.isActive ? 'active' : 'paused'}`}>
                                            {alert.isActive ? '● Active' : '● Paused'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="icon-button">✎</button>
                                        <button className="icon-button">🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Section Grid */}
            <div className="grid-2-col" style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                {/* Create New Alert Form */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h2>Create New Alert</h2>
                    </div>
                    <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>Configure parameters for your next notification.</p>

                    <div className="form-group">
                        <label>Select Crop / Commodity</label>
                        <select className="form-select">
                            <option>Wheat - Hard Red Winter</option>
                            {/* Other options */}
                        </select>
                    </div>

                    <div className="form-row" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Threshold</label>
                            <select className="form-select">
                                <option>Price Above</option>
                                <option>Price Below</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Target ($)</label>
                            <input type="number" className="form-input" placeholder="0.00" />
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem' }}>
                        <label>Notification Methods</label>
                        <div className="toggle-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>📱</span>
                                <span>Push Notification</span>
                            </div>
                            <label className="switch">
                                <input type="checkbox" defaultChecked />
                                <span className="slider round"></span>
                            </label>
                        </div>
                        <div className="toggle-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>💬</span>
                                <span>SMS Message</span>
                            </div>
                            <label className="switch">
                                <input type="checkbox" />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>

                    <button className="primary-button" style={{ width: '100%', marginTop: '2rem', background: '#22c55e' }}>
                        Activate Alert
                    </button>
                </div>

                {/* Alert History */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h2>Alert History</h2>
                        <button className="text-button">Export CSV</button>
                    </div>

                    <div className="history-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        {/* History Item 1 */}
                        <div className="history-item" style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderLeft: '4px solid #22c55e', borderRadius: '4px' }}>
                            <div className="history-icon" style={{ background: '#22c55e', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📈</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong>Wheat Price Threshold Reached</strong>
                                    <span className="text-secondary text-sm">10:45 AM</span>
                                </div>
                                <p className="text-secondary text-sm" style={{ marginTop: '0.25rem' }}>
                                    Price hit <strong>$7.52</strong> (Target: $7.50). Push notification and SMS successfully sent to primary device.
                                </p>
                            </div>
                        </div>

                        {/* History Item 2 */}
                        <div className="history-item" style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderLeft: '4px solid #666', borderRadius: '4px' }}>
                            <div className="history-icon" style={{ background: '#666', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⏸️</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong>Alert Paused: Corn</strong>
                                    <span className="text-secondary text-sm">Yesterday</span>
                                </div>
                                <p className="text-secondary text-sm" style={{ marginTop: '0.25rem' }}>
                                    User manually paused price monitoring for Corn (Yellow #2).
                                </p>
                            </div>
                        </div>

                        {/* History Item 3 */}
                        <div className="history-item" style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderLeft: '4px solid #22c55e', borderRadius: '4px' }}>
                            <div className="history-icon" style={{ background: '#22c55e', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📉</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong>Soybeans Threshold Reached</strong>
                                    <span className="text-secondary text-sm">Oct 24, 2:15 PM</span>
                                </div>
                                <p className="text-secondary text-sm" style={{ marginTop: '0.25rem' }}>
                                    Price dropped to <strong>$11.75</strong> (Target: $11.80). Push notification triggered.
                                </p>
                            </div>
                        </div>
                        {/* History Item 4 */}
                        <div className="history-item" style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', borderRadius: '4px' }}>
                            <div className="history-icon" style={{ background: '#ef4444', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>❗</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <strong>SMS Delivery Failed</strong>
                                    <span className="text-secondary text-sm">Oct 23</span>
                                </div>
                                <p className="text-secondary text-sm" style={{ marginTop: '0.25rem' }}>
                                    Failed to deliver SMS to +1 (555) 0123 for Wheat alert. Check carrier settings.
                                </p>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <button className="text-button">View Full History ⌄</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PriceAlerts;
