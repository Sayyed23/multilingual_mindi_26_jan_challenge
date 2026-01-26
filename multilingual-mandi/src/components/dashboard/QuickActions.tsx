import React from 'react';
import { useNavigate } from 'react-router-dom';

const QuickActions: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="quick-actions-section">
            <h3 className="section-label">Quick Actions</h3>
            <div className="qa-buttons">
                <button
                    className="qa-btn primary"
                    onClick={() => navigate('/prices')}
                >
                    <span className="material-symbols-outlined">payments</span>
                    Check Price
                </button>
                <button
                    className="qa-btn primary"
                    onClick={() => navigate('/create-listing')}
                >
                    <span className="material-symbols-outlined">add_box</span>
                    Post Listing
                </button>
                <button
                    className="qa-btn secondary"
                    onClick={() => navigate('/deals')}
                >
                    <span className="material-symbols-outlined">handshake</span>
                    My Deals
                </button>
            </div>
        </div>
    );
};

export default QuickActions;
