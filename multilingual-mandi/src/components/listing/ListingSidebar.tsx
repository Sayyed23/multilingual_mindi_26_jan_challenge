import React from 'react';

interface ListingSidebarProps {
    data: {
        harvestDate: string;
        readyForPickup: string;
    };
    onChange: (field: string, value: any) => void;
}

const ListingSidebar: React.FC<ListingSidebarProps> = ({ data, onChange }) => {
    return (
        <div className="sidebar-column">
            {/* Market Trend */}
            <div className="widget-card">
                <div className="widget-header">
                    <span className="widget-title">Market Trend</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>+2.4% Today</span>
                </div>

                <div>
                    <div className="chart-container">
                        {[40, 55, 45, 70, 65, 85, 95].map((h, i) => (
                            <div
                                key={i}
                                className={`chart-bar ${i === 6 ? 'current' : ''}`}
                                style={{ height: `${h}%` }}
                            ></div>
                        ))}
                    </div>
                    <div className="chart-labels">
                        <span>Mon</span>
                        <span>Wed</span>
                        <span>Fri</span>
                        <span>Today</span>
                    </div>
                </div>

                <div className="insight-box">
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Insight: </span>
                    Export demand for Grade A wheat is rising in SE Asia. Prices are expected to peak in 10-14 days.
                </div>
            </div>

            {/* Availability */}
            <div className="widget-card">
                <div className="widget-header">
                    <span className="widget-title" style={{ textTransform: 'none', color: 'inherit', fontSize: '14px' }}>
                        <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '18px' }}>calendar_month</span>
                        Availability
                    </span>
                </div>

                <div className="input-group" style={{ marginBottom: '12px' }}>
                    <label className="input-label" style={{ fontSize: '12px' }}>Harvest Date</label>
                    <input
                        type="date"
                        className="custom-input"
                        style={{ padding: '8px' }}
                        value={data.harvestDate}
                        onChange={(e) => onChange('harvestDate', e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label className="input-label" style={{ fontSize: '12px' }}>Ready for Pick-up</label>
                    <input
                        type="date"
                        className="custom-input"
                        style={{ padding: '8px' }}
                        value={data.readyForPickup}
                        onChange={(e) => onChange('readyForPickup', e.target.value)}
                    />
                </div>
            </div>

            {/* Warehouse */}
            <div className="widget-card">
                <div className="widget-header">
                    <span className="widget-title" style={{ textTransform: 'none', color: 'inherit', fontSize: '14px' }}>
                        <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '18px' }}>location_on</span>
                        Warehouse
                    </span>
                </div>

                <div className="map-preview">
                    <div className="map-grid"></div>
                    <span className="material-symbols-outlined map-pin">location_on</span>
                    <div className="map-label">Chicago South Storage Hub #4</div>
                </div>
            </div>
        </div>
    );
};

export default ListingSidebar;
