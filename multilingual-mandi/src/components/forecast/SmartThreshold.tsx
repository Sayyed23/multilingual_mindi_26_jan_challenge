import React from 'react';

const SmartThreshold: React.FC = () => {
    return (
        <div className="smart-card">
            <h3 style={{ color: 'white', fontWeight: 700, margin: '0 0 16px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>add_alert</span>
                Smart Threshold
            </h3>

            <div className="form-field">
                <label className="field-label">Commodity</label>
                <select className="field-select">
                    <option>Sugar (Refined)</option>
                    <option>Wheat (Grade A)</option>
                    <option>Palm Oil</option>
                </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-field">
                    <label className="field-label">Threshold ($)</label>
                    <input type="number" className="field-input" defaultValue="3850" />
                </div>
                <div className="form-field">
                    <label className="field-label">Timeline</label>
                    <select className="field-select">
                        <option>10 days before</option>
                        <option>20 days before</option>
                        <option>30 days before</option>
                    </select>
                </div>
            </div>

            <button className="set-alert-btn">
                Set Alert Notification
            </button>
        </div>
    );
};

export default SmartThreshold;
