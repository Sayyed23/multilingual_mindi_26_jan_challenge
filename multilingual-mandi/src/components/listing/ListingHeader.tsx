import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ListingHeader: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <header className="listing-header-bar">
            <div className="header-container">
                <div className="header-brand">
                    <div className="brand-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                        <svg className="brand-icon" fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fillRule="evenodd"></path>
                        </svg>
                        <h2 className="brand-name">AgriMarket B2B</h2>
                    </div>
                    <nav className="header-nav">
                        <a href="#" className="header-link">Marketplace</a>
                        <a href="#" className="header-link">Trends</a>
                        <a href="#" className="header-link">Logistics</a>
                        <a href="#" className="header-link">Inventory</a>
                    </nav>
                </div>

                <div className="header-actions">
                    <div className="header-search">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#94a3b8' }}>search</span>
                        <input type="text" placeholder="Search commodities..." />
                    </div>
                    <div
                        className="user-avatar-circle"
                        style={{
                            backgroundImage: user?.profilePicture
                                ? `url('${user.profilePicture}')`
                                : "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD48QxuRQud2GYEkpPltEq5jj5OtnVoDL_gpsoCA_zL9Bj7hw4NXJ59JRbPgrv3CKJHF-Gpc3dA-98bj3A9Eo_VAr2e2nTIwjAUZliiYdiLEytKb9G_mSpmDGhhUP9bgqPBFArPs2Mm241OQ3dwPBW1hWCk-y8EJWDf7ddH63zV_wL83C2FuQLf93yYl9FjKqgb1wXZlgJI9Elj8qUKrRnh14DWRJ-O44jUR8RrJ8OYe1cz5H8izoO9Er8zGsnAnLkK35rZoOusyxjm')"
                        }}
                    ></div>
                </div>
            </div>
        </header>
    );
};

export default ListingHeader;
