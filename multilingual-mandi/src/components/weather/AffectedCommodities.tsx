import React from 'react';

const AffectedCommodities: React.FC = () => {
    return (
        <div className="widget-section">
            <h3>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '18px' }}>spa</span>
                Affected Commodities
            </h3>

            <div className="commodity-card border-red">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <p style={{ fontWeight: 700, fontSize: '14px', color: 'white', margin: 0 }}>Onions (Red/Yellow)</p>
                        <p style={{ fontSize: '10px', color: '#ef4444', margin: '4px 0 0 0' }}>Impact: Severe Yield Loss</p>
                    </div>
                    <span className="bg-red-soft" style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>CRITICAL</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#9db9a4' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
                    Region Y (Flooded)
                </div>
            </div>

            <div className="commodity-card border-yellow">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <p style={{ fontWeight: 700, fontSize: '14px', color: 'white', margin: 0 }}>Yellow Corn</p>
                        <p style={{ fontSize: '10px', color: '#facc15', margin: '4px 0 0 0' }}>Impact: Quality Downgrade</p>
                    </div>
                    <span className="bg-yellow-soft" style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>WARNING</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#9db9a4' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
                    Midwest Corridor
                </div>
            </div>
        </div>
    );
};

export default AffectedCommodities;
