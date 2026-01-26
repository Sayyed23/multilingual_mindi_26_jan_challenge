import React from 'react';

const WeatherSidebar: React.FC = () => {
    return (
        <aside className="weather-sidebar">
            <div className="sidebar-section">
                <div className="sidebar-title">
                    <h1>Impact Assessment</h1>
                    <p>V1.2 Active Monitoring</p>
                </div>

                <div className="sidebar-nav">
                    <div className="nav-item-weather">
                        <span className="material-symbols-outlined">public</span>
                        <span>Global Overview</span>
                    </div>
                    <div className="nav-item-weather">
                        <span className="material-symbols-outlined">inventory_2</span>
                        <span>My Sourcing</span>
                    </div>
                    <div className="nav-item-weather">
                        <span className="material-symbols-outlined">report_problem</span>
                        <span>Commodity Risk</span>
                    </div>
                    <div className="nav-item-weather active">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>thunderstorm</span>
                        <span style={{ fontWeight: 700 }}>Weather Alerts</span>
                    </div>
                    <div className="nav-item-weather">
                        <span className="material-symbols-outlined">local_shipping</span>
                        <span>Logistics Pivot</span>
                    </div>
                </div>
            </div>

            <div className="sidebar-section" style={{ gap: '16px' }}>
                <div className="legend-box">
                    <div className="legend-title">Severity Legend</div>
                    <div className="legend-item">
                        <span className="dot red"></span>
                        <span style={{ fontSize: '12px', color: '#9db9a4' }}>Critical Hazard</span>
                    </div>
                    <div className="legend-item">
                        <span className="dot yellow"></span>
                        <span style={{ fontSize: '12px', color: '#9db9a4' }}>High Risk Area</span>
                    </div>
                    <div className="legend-item">
                        <span className="dot green"></span>
                        <span style={{ fontSize: '12px', color: '#9db9a4' }}>Stable Conditions</span>
                    </div>
                </div>

                <div className="pro-card">
                    <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', margin: '0 0 4px 0' }}>PRO Feature</p>
                    <p style={{ fontSize: '11px', color: '#9db9a4', margin: '0 0 12px 0' }}>Get 14-day hyper-local predictive yield reports.</p>
                    <button style={{ width: '100%', padding: '8px', backgroundColor: 'var(--primary)', color: '#102215', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                        Upgrade Now
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default WeatherSidebar;
