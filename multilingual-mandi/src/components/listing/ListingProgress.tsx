import React from 'react';

const ListingProgress: React.FC = () => {
    return (
        <div className="progress-card">
            <div className="progress-header">
                <div className="progress-title">
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>analytics</span>
                    <p className="text-base font-semibold">Listing Completion</p>
                </div>
                <p className="step-info">Step 2 of 3: Quality & Pricing</p>
            </div>

            <div className="progress-track">
                <div className="progress-fill" style={{ width: '66%' }}></div>
            </div>

            <div className="progress-labels">
                <span className="label-basic">Basic Info</span>
                <span className="label-quality">Quality & Pricing</span>
                <span className="label-logistics">Logistics</span>
            </div>
        </div>
    );
};

export default ListingProgress;
