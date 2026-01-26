import React from 'react';

const DemandPrediction: React.FC = () => {
    return (
        <div className="chart-card" style={{ height: '100%', boxSizing: 'border-box' }}>
            <div className="prediction-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>psychology</span>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'white' }}>Demand Prediction</h3>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#9db9a4' }}>Confidence Score</span>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)' }}>94%</span>
                </div>

                <div className="pred-item">
                    <div className="pred-header">
                        <span>Sugar (Refined)</span>
                        <span>+22% Expected</span>
                    </div>
                    <div className="pred-bar-bg">
                        <div className="pred-bar-fill" style={{ width: '88%' }}></div>
                    </div>
                </div>

                <div className="pred-item">
                    <div className="pred-header">
                        <span>Vegetable Oil</span>
                        <span>+15% Expected</span>
                    </div>
                    <div className="pred-bar-bg">
                        <div className="pred-bar-fill" style={{ width: '65%' }}></div>
                    </div>
                </div>

                <div className="ai-insight">
                    <div className="insight-label">AI Insight</div>
                    <p className="insight-text">
                        "Sugar demand expected to spike 22% due to upcoming Diwali festivities. Recommended to secure inventory 15 days prior to Oct 24th."
                    </p>
                </div>

                <button className="full-report-btn">
                    <span className="material-symbols-outlined">analytics</span>
                    Full Prediction Model
                </button>
            </div>
        </div>
    );
};

export default DemandPrediction;
