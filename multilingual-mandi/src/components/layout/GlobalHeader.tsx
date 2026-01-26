import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const GlobalHeader: React.FC = () => {
    const { user } = useAuth();

    // Using a consistent avatar for the demo
    const avatarUrl = user?.profilePicture || "https://lh3.googleusercontent.com/aida-public/AB6AXuAHJIZI-ARo2AczxiN_zBixOuq88WBfze785e-xRPX0QMpUMfUS4juIHV3G7_3aoENgRygp9xBaELh3YNsx53tzBXWtoGGX1twXomqo92TT9CiYTFrmOs9a4D5I_W_xuOB-q2uueK6jgXE2viBGCTJY7mFNW2W_jwx-CH_HCVB-q2uueK6jgXE2viBGCTJY7mFNW2W_jwx-CH_HCVAy2ql0PBKc4E8n23KpDNFPjLvdsw7wDqetZ2AO8pDvW0vncWyCtOY20sTV7zLqdPzEyhpb1ijzaLcllf24Fl4wEFTRazF-d2quPHz";

    return (
        <header className="global-header">
            <div className="gh-left">
                <div className="gh-brand">
                    <div className="gh-logo-box">
                        {/* Using the sapling icon from the screenshot/material symbols */}
                        <span className="material-symbols-outlined">potted_plant</span>
                    </div>
                    <h1 className="gh-brand-name">AgriMarket B2B</h1>
                </div>

                <nav className="gh-nav">
                    <NavLink to="/" className={({ isActive }) => `gh-nav-link ${isActive ? 'active' : ''}`}>
                        Marketplace
                    </NavLink>
                    <NavLink to="/festival-forecast" className={({ isActive }) => `gh-nav-link ${isActive ? 'active' : ''}`}>
                        Analytics
                    </NavLink>
                    <NavLink to="/logistics" className={({ isActive }) => `gh-nav-link ${isActive ? 'active' : ''}`}>
                        Logistics
                    </NavLink>
                    <NavLink to="/profile" className={({ isActive }) => `gh-nav-link ${isActive ? 'active' : ''}`}>
                        Portfolio
                    </NavLink>
                </nav>
            </div>

            <div className="gh-right">
                <div className="gh-search-wrapper">
                    <span className="material-symbols-outlined" style={{ color: '#64748b' }}>search</span>
                    <input
                        type="text"
                        className="gh-search-input"
                        placeholder="Search commodities or events"
                    />
                </div>

                <button className="gh-icon-btn" aria-label="Notifications">
                    <span className="material-symbols-outlined">notifications</span>
                </button>

                <button className="gh-icon-btn" aria-label="Settings">
                    <span className="material-symbols-outlined">settings</span>
                </button>

                <div
                    className="gh-user-avatar"
                    style={{ backgroundImage: `url('${avatarUrl}')` }}
                    aria-label="User Profile"
                ></div>
            </div>
        </header>
    );
};

export default GlobalHeader;
