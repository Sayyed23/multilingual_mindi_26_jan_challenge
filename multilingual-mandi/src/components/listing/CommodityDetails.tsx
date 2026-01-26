import React from 'react';

interface CommodityDetailsProps {
    data: {
        commodityType: string;
        quantity: number;
        unit: string;
    };
    onChange: (field: string, value: any) => void;
}

const CommodityDetails: React.FC<CommodityDetailsProps> = ({ data, onChange }) => {
    return (
        <div className="form-card">
            <h3 className="card-heading">
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>grass</span>
                Commodity Details
            </h3>

            <div className="input-group" style={{ marginBottom: '24px' }}>
                <label className="input-label">Commodity Type</label>
                <div className="input-with-icon">
                    <span className="material-symbols-outlined input-icon">agriculture</span>
                    <select
                        className="custom-select pl-12"
                        value={data.commodityType}
                        onChange={(e) => onChange('commodityType', e.target.value)}
                    >
                        <option value="">Select commodity...</option>
                        <option value="wheat">Soft Red Winter Wheat</option>
                        <option value="corn">Yellow Dent Corn</option>
                        <option value="soy">Soybeans</option>
                        <option value="barley">Malting Barley</option>
                    </select>
                </div>
            </div>

            <div className="grade-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="input-group">
                    <label className="input-label">Quantity</label>
                    <input
                        type="number"
                        className="custom-input"
                        placeholder="0.00"
                        value={data.quantity || ''}
                        onChange={(e) => onChange('quantity', parseFloat(e.target.value))}
                    />
                </div>
                <div className="input-group">
                    <label className="input-label">Unit</label>
                    <select
                        className="custom-select"
                        value={data.unit}
                        onChange={(e) => onChange('unit', e.target.value)}
                    >
                        <option value="tonnes">Metric Tonnes</option>
                        <option value="kg">Kilograms</option>
                        <option value="bushels">Bushels</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default CommodityDetails;
