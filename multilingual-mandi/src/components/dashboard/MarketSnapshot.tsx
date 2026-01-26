import React from 'react';
import { useNavigate } from 'react-router-dom';

interface MarketItem {
    commodity: string;
    price: string;
    change: string;
    trend: 'up' | 'down';
    meta: string;
}

const MarketSnapshot: React.FC = () => {
    const navigate = useNavigate();

    const marketData: MarketItem[] = [
        {
            commodity: 'Wheat (SRW)',
            price: '$342.50',
            change: '+2.4%',
            trend: 'up',
            meta: 'Per Metric Tonne'
        },
        {
            commodity: 'Basmati Rice',
            price: '$1,250.00',
            change: '-0.8%',
            trend: 'down',
            meta: 'Per Metric Tonne'
        },
        {
            commodity: 'Tomatoes (Hybrid)',
            price: '$0.85',
            change: '+5.1%',
            trend: 'up',
            meta: 'Per Kg (Wholesale)'
        }
    ];

    const renderSparkline = (trend: 'up' | 'down') => {
        // SVG paths from the provided design
        if (trend === 'up') {
            return (
                <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <path d="M0 35 Q 25 38, 50 20 T 100 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3"></path>
                </svg>
            );
        } else {
            return (
                <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <path d="M0 5 Q 25 10, 50 15 T 100 35" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3"></path>
                </svg>
            );
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">Today's Market Snapshot</h3>
                <button className="view-all-link" onClick={() => navigate('/prices')}>
                    Full Market Report
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                </button>
            </div>
            <div className="snapshot-grid">
                {marketData.map((item, index) => (
                    <div key={index} className="mini-card">
                        <div className="mini-card-header">
                            <span className="commodity-label">{item.commodity}</span>
                            <span className={`percent-badge ${item.trend === 'up' ? 'positive' : 'negative'}`}>
                                {item.change}
                            </span>
                        </div>

                        <div className="price-display">
                            <div>
                                <p className="price-value">{item.price}</p>
                                <p className="unit-label">{item.meta}</p>
                            </div>
                            <div
                                className="sparkline-wrapper"
                                style={{ color: item.trend === 'up' ? 'var(--primary)' : '#f87171' }}
                            >
                                {renderSparkline(item.trend)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MarketSnapshot;
