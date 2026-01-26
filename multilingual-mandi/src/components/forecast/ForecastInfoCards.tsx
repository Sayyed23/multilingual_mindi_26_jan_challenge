import React from 'react';

const ForecastInfoCards: React.FC = () => {
    return (
        <div className="secondary-grid">
            <div className="info-card">
                <div className="info-label">Global Logistics Shift</div>
                <div className="info-value">+12.4% Port Congestion</div>
                <p className="info-sub italic">Expect delays in Southeast Asia corridors during Feb peak.</p>
            </div>

            <div className="info-card">
                <div className="info-label">Stock Levels</div>
                <div className="info-value">Critically Low (Sugar)</div>
                <div className="status-bar">
                    <div style={{ width: '15%', height: '100%', backgroundColor: '#ef4444' }}></div>
                </div>
            </div>

            <div className="info-card">
                <div className="info-label">Currency Impact</div>
                <div className="info-value">USD/INR Trend</div>
                <p className="info-sub" style={{ color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_upward</span>
                    Favorable for Export
                </p>
            </div>

            <div className="info-card">
                <div className="info-label">Weather Factor</div>
                <div className="info-value">El Niño Moderate</div>
                <p className="info-sub">Historical data suggests price volatility in wheat during harvest.</p>
            </div>
        </div>
    );
};

export default ForecastInfoCards;
