import React from 'react';

const WeatherMap: React.FC = () => {
    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="toolbar-weather">
                <div className="filter-group">
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'transparent', color: '#9db9a4', border: 'none', cursor: 'pointer' }}>
                        <span className="material-symbols-outlined">tune</span> Filters
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'transparent', color: '#9db9a4', border: 'none', cursor: 'pointer' }}>
                        <span className="material-symbols-outlined">calendar_month</span> 7-Day Outlook
                    </button>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', backgroundColor: 'transparent', color: '#9db9a4', border: 'none', cursor: 'pointer' }}>
                        <span className="material-symbols-outlined">layers</span> Rainfall Overlay
                    </button>
                </div>

                <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', backgroundColor: 'var(--primary)', color: '#102215', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                    <span className="material-symbols-outlined">edit_document</span>
                    Adjust Procurement Plan
                </button>
            </div>

            <div className="map-layout">
                <div className="map-container-weather">
                    <div className="map-bg"></div>

                    {/* Visual Weather Overlays */}
                    <div className="glow-orb glow-red" style={{ top: '20%', left: '30%', width: '256px', height: '256px' }}></div>
                    <div className="glow-orb glow-yellow" style={{ top: '50%', right: '20%', width: '384px', height: '384px' }}></div>
                    <div className="glow-orb glow-primary" style={{ bottom: '20%', left: '10%', width: '192px', height: '192px' }}></div>

                    {/* Markers */}
                    <div style={{ position: 'absolute', top: '33%', left: '25%', cursor: 'pointer' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#ef4444', border: '4px solid rgba(239, 68, 68, 0.3)' }}></div>
                    </div>

                    <div style={{ position: 'absolute', top: '50%', right: '33%', cursor: 'pointer' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#facc15', border: '4px solid rgba(250, 204, 21, 0.3)' }}></div>
                    </div>

                    <div style={{ position: 'absolute', bottom: '33%', left: '50%', cursor: 'pointer' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--primary)', border: '4px solid rgba(19, 236, 73, 0.3)' }}></div>
                    </div>

                    {/* Controls */}
                    <div className="map-controls">
                        <button className="zoom-btn">+</button>
                        <button className="zoom-btn">-</button>
                    </div>

                    <div className="map-legend-overlay">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="dot red"></span>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: 'white' }}>Heavy Rain</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="dot yellow"></span>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: 'white' }}>Heatwave</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid #28392c', paddingLeft: '16px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#9db9a4' }}>schedule</span>
                            <span style={{ fontSize: '10px', color: '#9db9a4' }}>Updated 2m ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherMap;
