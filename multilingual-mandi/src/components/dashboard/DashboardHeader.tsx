import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CommoditySearchResult } from '../../types/commodity';
import { UserProfile } from '../../types/user';

interface DashboardHeaderProps {
    onCommoditySelect: (commodity: CommoditySearchResult) => void;
    onVendorSelect: (vendor: UserProfile) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <header className="dashboard-header">
            <div className="header-left">
                <h2>Marketplace</h2>
                <div className="search-container">
                    <div className="search-wrapper">
                        <span className="material-symbols-outlined search-icon">search</span>
                        <div className="header-search">
                            <input
                                type="text"
                                placeholder="Search commodities, deals, or vendors..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="header-right">
                <button className="icon-btn" aria-label="Notifications">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="notification-badge"></span>
                </button>
                <button className="icon-btn" aria-label="Settings">
                    <span className="material-symbols-outlined">settings</span>
                </button>
                <div className="divider"></div>
                <button
                    className="new-trade-btn"
                    onClick={() => navigate('/create-listing')}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
                    New Trade
                </button>
            </div>
        </header>
    );
};

export default DashboardHeader;
