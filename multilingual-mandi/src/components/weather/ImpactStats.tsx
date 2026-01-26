import React from 'react';

const ImpactStats: React.FC = () => {
    return (
        <div className="stats-row">
            <div className="stat-card-weather">
                <div className="stat-header">
                    <span style={{ fontSize: '14px', color: '#9db9a4', fontWeight: 500 }}>Active Alerts</span>
                    <span className="material-symbols-outlined" style={{ color: '#ef4444' }}>warning</span>
                </div>
                <p className="stat-value">14</p>
                <p style={{ fontSize: '12px', color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>trending_up</span>
                    +12% vs last week
                </p>
            </div>

            <div className="stat-card-weather">
                <div className="stat-header">
                    <span style={{ fontSize: '14px', color: '#9db9a4', fontWeight: 500 }}>Trade Volume at Risk</span>
                    <span className="material-symbols-outlined" style={{ color: '#facc15' }}>analytics</span>
                </div>
                <p className="stat-value">2.4M Tons</p>
                <p style={{ fontSize: '12px', color: '#facc15', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>trending_up</span>
                    +5% impact
                </p>
            </div>

            <div className="stat-card-weather">
                <div className="stat-header">
                    <span style={{ fontSize: '14px', color: '#9db9a4', fontWeight: 500 }}>Sourcing Alternatives</span>
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>shuffle</span>
                </div>
                <p className="stat-value">8 Regions</p>
                <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>check_circle</span>
                    Optimized
                </p>
            </div>
        </div>
    );
};

export default ImpactStats;
