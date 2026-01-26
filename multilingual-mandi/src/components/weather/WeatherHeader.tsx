import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const WeatherHeader: React.FC = () => {
    const { user } = useAuth();

    return (
        <header className="weather-header">
            <div className="brand-section-weather">
                <div className="brand-combo">
                    <div className="brand-logo-weather">
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fillRule="evenodd"></path>
                        </svg>
                    </div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>AgriMarket B2B</h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(40, 57, 44, 0.2)', borderRadius: '8px', border: '1px solid #28392c', height: '40px', padding: '0 12px', width: '256px' }}>
                    <span className="material-symbols-outlined" style={{ color: '#9db9a4' }}>search</span>
                    <input
                        type="text"
                        style={{ background: 'transparent', border: 'none', color: 'white', padding: '0 8px', width: '100%', outline: 'none' }}
                        placeholder="Search commodities..."
                    />
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                <nav style={{ display: 'flex', gap: '36px', fontSize: '14px', fontWeight: 500 }}>
                    <a href="#" style={{ color: '#9db9a4', textDecoration: 'none' }}>Marketplace</a>
                    <a href="#" style={{ color: '#9db9a4', textDecoration: 'none' }}>Analytics</a>
                    <a href="#" style={{ color: 'var(--primary)', borderBottom: '2px solid var(--primary)', paddingBottom: '4px', textDecoration: 'none' }}>Weather</a>
                    <a href="#" style={{ color: '#9db9a4', textDecoration: 'none' }}>Logistics</a>
                </nav>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#28392c', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <button style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#28392c', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                </div>

                <div
                    className="user-avatar-circle"
                    style={{
                        backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAHJIZI-ARo2AczxiN_zBixOuq88WBfze785e-xRPX0QMpUMfUS4juIHV3G7_3aoENgRygp9xBaELh3YNsx53tzBXWtoGGX1twXomqo92TT9CiYTFrmOs9a4D5I_W_xuOB-q2uueK6jgXE2viBGCTJY7mFNW2W_jwx-CH_HCVjAy2ql0PBKc4E8n23KpDNFPjLvdsw7wDqetZ2AO8pDvW0vncWyCtOY20sTV7zLqdPzEyhpb1ijzaLcllf24Fl4wEFTRazF-d2quPHz')",
                        border: '1px solid rgba(19, 236, 73, 0.5)',
                        width: '40px', height: '40px', borderRadius: '50%', backgroundSize: 'cover', backgroundPosition: 'center'
                    }}
                ></div>
            </div>
        </header>
    );
};

export default WeatherHeader;
