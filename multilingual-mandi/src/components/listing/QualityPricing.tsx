import React from 'react';

interface QualityPricingProps {
    data: {
        qualityGrade: 'A' | 'B' | 'C';
        pricePerUnit: number;
    };
    onChange: (field: string, value: any) => void;
}

const QualityPricing: React.FC<QualityPricingProps> = ({ data, onChange }) => {
    return (
        <div className="form-card">
            <h3 className="card-heading">
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>verified</span>
                Quality & Pricing
            </h3>

            <div className="input-group" style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label className="input-label">Quality Grade</label>
                    <button style={{ color: 'var(--primary)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>info</span>
                        Grade Criteria
                    </button>
                </div>

                <div className="grade-grid">
                    <button
                        type="button"
                        className={`grade-btn ${data.qualityGrade === 'A' ? 'active' : ''}`}
                        onClick={() => onChange('qualityGrade', 'A')}
                    >
                        <span className="grade-lg">Grade A</span>
                        <span className="grade-sm">Premium</span>
                    </button>

                    <button
                        type="button"
                        className={`grade-btn ${data.qualityGrade === 'B' ? 'active' : ''}`}
                        onClick={() => onChange('qualityGrade', 'B')}
                    >
                        <span className="grade-lg">Grade B</span>
                        <span className="grade-sm">Standard</span>
                    </button>

                    <button
                        type="button"
                        className={`grade-btn ${data.qualityGrade === 'C' ? 'active' : ''}`}
                        onClick={() => onChange('qualityGrade', 'C')}
                    >
                        <span className="grade-lg">Grade C</span>
                        <span className="grade-sm">Feed/Industrial</span>
                    </button>
                </div>
            </div>

            <div className="input-group">
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Price per Unit (USD)
                    <span style={{
                        backgroundColor: 'rgba(19, 236, 73, 0.2)',
                        color: 'var(--primary)',
                        fontSize: '10px',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        textTransform: 'uppercase'
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>auto_awesome</span>
                        AI Suggestion
                    </span>
                </label>

                <div className="price-input-wrapper">
                    <span className="currency-symbol">$</span>
                    <input
                        type="number"
                        className="price-field"
                        placeholder="245.50"
                        value={data.pricePerUnit || ''}
                        onChange={(e) => onChange('pricePerUnit', parseFloat(e.target.value))}
                    />
                    <div className="market-range">
                        Market: $242 - $251
                    </div>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--slate-500)', fontStyle: 'italic', margin: '4px 0 0 0' }}>
                    Based on current Chicago Board of Trade (CBOT) indexes for Grade A Wheat.
                </p>
            </div>
        </div>
    );
};

export default QualityPricing;
