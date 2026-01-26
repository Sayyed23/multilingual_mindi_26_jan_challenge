import React from 'react';

const ForecastHeader: React.FC = () => {
    return (
        <header className="forecast-header">
            <div className="header-inner">
                <div className="brand-section">
                    <div className="brand-logo-forecast">
                        <div className="logo-box-sm">
                            <span className="material-symbols-outlined">potted_plant</span>
                        </div>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'white', margin: 0 }}>AgriMarket B2B</h2>
                    </div>

                    <nav className="nav-links">
                        <a href="#" className="nav-link">Marketplace</a>
                        <a href="#" className="nav-link active">Analytics</a>
                        <a href="#" className="nav-link">Logistics</a>
                        <a href="#" className="nav-link">Portfolio</a>
                    </nav>
                </div>

                <div className="header-tools">
                    <div className="search-field-wrapper">
                        <span className="material-symbols-outlined" style={{ color: '#9db9a4' }}>search</span>
                        <input type="text" className="search-input" placeholder="Search commodities or events" />
                    </div>

                    <button className="tool-btn">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <button className="tool-btn">
                        <span className="material-symbols-outlined">settings</span>
                    </button>

                    <div
                        className="user-avatar-circle"
                        style={{
                            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAEO4Rfmarn0sfV0pLXC6MJ3pGxoY_-PcdfqhmJuz_9D4nwBse4wbuZwMb7h4NEhzSNFlBSEMl0XbfJ3PszTOYx2c5__y0Vm-cLQ-FBOF_v3Gj1dT_hYC2wTQvaGJQLgTnlh9MJk1vipw6e0JyIKJIDUv2-cNvRmiKxZdzeYMAicvmiNqiTcev4A1K3VoUJoEcMVcua1-8BFB0_1CYQgXiVFsGRyOmTRHFduK_6LJHPr5YgKaBgQAq97CBSZY_ZWtAh65WRc2ZqvYw-')",
                            border: '1px solid rgba(19, 236, 73, 0.3)'
                        }}
                    ></div>
                </div>
            </div>
        </header>
    );
};

export default ForecastHeader;
