import React from 'react';
import { Link } from 'react-router-dom';

const GlobalFooter: React.FC = () => {
    return (
        <footer className="global-footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <h2>
                        <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>potted_plant</span>
                        AgriMarket B2B
                    </h2>
                    <p className="footer-desc">
                        The world's leading agricultural B2B marketplace. Connecting farmers, traders, and logistics providers with real-time data and AI-driven insights.
                    </p>
                </div>

                <div className="footer-col">
                    <h3>Platform</h3>
                    <div className="footer-links">
                        <Link to="/" className="footer-link">Marketplace</Link>
                        <Link to="/festival-forecast" className="footer-link">Analytics</Link>
                        <Link to="/weather-impact" className="footer-link">Weather Risk</Link>
                        <Link to="/create-listing" className="footer-link">Sell Commodity</Link>
                    </div>
                </div>

                <div className="footer-col">
                    <h3>Company</h3>
                    <div className="footer-links">
                        <a href="#" className="footer-link">About Us</a>
                        <a href="#" className="footer-link">Careers</a>
                        <a href="#" className="footer-link">Press</a>
                        <a href="#" className="footer-link">Contact</a>
                    </div>
                </div>

                <div className="footer-col">
                    <h3>Support</h3>
                    <div className="footer-links">
                        <a href="#" className="footer-link">Help Center</a>
                        <a href="#" className="footer-link">Trading Rules</a>
                        <a href="#" className="footer-link">Dispute Resolution</a>
                        <a href="#" className="footer-link">Security</a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div>© 2026 AgriMarket B2B Inc. All rights reserved.</div>
                <div className="footer-bottom-links">
                    <a href="#" className="footer-link">Privacy Policy</a>
                    <a href="#" className="footer-link">Terms of Service</a>
                    <a href="#" className="footer-link">Cookie Settings</a>
                </div>
            </div>
        </footer>
    );
};

export default GlobalFooter;
