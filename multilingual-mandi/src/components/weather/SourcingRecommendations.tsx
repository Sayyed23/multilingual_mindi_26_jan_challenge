import React from 'react';

const SourcingRecommendations: React.FC = () => {
    return (
        <div className="widget-section">
            <h3>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '18px' }}>lightbulb</span>
                Sourcing Recommendations
            </h3>

            <div className="recommendation-card reco-primary">
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ padding: '8px', backgroundColor: 'rgba(19, 236, 73, 0.2)', borderRadius: '8px', color: 'var(--primary)' }}>
                        <span className="material-symbols-outlined">alt_route</span>
                    </div>
                    <div>
                        <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', margin: '0 0 4px 0' }}>Pivot Strategy Alpha</p>
                        <p style={{ fontSize: '11px', color: '#9db9a4', lineHeight: 1.5, margin: 0 }}>
                            Switch Onion procurement from <span style={{ color: 'white', fontWeight: 500 }}>Region Y</span> to <span style={{ color: 'white', fontWeight: 500 }}>Region X</span>. Predicted yield in Region X is +15% above average with stable logistics.
                        </p>
                        <button style={{ marginTop: '12px', background: 'none', border: 'none', color: 'var(--primary)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: 0 }}>
                            View Logistic Route <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="recommendation-card reco-dark">
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ padding: '8px', backgroundColor: '#28392c', borderRadius: '8px', color: '#9db9a4' }}>
                        <span className="material-symbols-outlined">history</span>
                    </div>
                    <div>
                        <p style={{ fontSize: '12px', fontWeight: 700, color: 'white', margin: '0 0 4px 0' }}>Forward Booking Alert</p>
                        <p style={{ fontSize: '11px', color: '#9db9a4', lineHeight: 1.5, margin: 0 }}>
                            Lock in Wheat futures for Q4. Upcoming frost in Northern territories likely to hike prices by 12% in the next 10 days.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SourcingRecommendations;
