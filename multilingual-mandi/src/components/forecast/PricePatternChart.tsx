import React from 'react';

const PricePatternChart: React.FC = () => {
    return (
        <div className="chart-card">
            <div className="chart-header">
                <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 500, color: 'white', margin: 0 }}>Historical Price Patterns (3-Year Avg)</h3>
                    <p className="metric-lg">+18.5% Season Spike</p>
                    <div className="metric-context">
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--primary)' }}>trending_up</span>
                        <span style={{ color: '#9db9a4' }}>Last 12 Months comparison</span>
                        <span style={{ color: 'var(--primary)', fontWeight: 500 }}>+4.2% YoY</span>
                    </div>
                </div>
                <div className="chart-actions">
                    <button className="icon-btn-sm">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>filter_list</span>
                    </button>
                    <button className="icon-btn-sm">
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>more_vert</span>
                    </button>
                </div>
            </div>

            <div className="chart-vis">
                <svg className="w-full h-full" style={{ width: '100%', height: '100%', minHeight: '240px' }} fill="none" preserveAspectRatio="none" viewBox="0 0 478 150" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z" fill="url(#paint0_linear_1131_5935)"></path>
                    <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25" stroke="var(--primary)" strokeLinecap="round" strokeWidth="3"></path>
                    <defs>
                        <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1131_5935" x1="236" x2="236" y1="1" y2="149">
                            <stop stopColor="var(--primary)" stopOpacity="0.2"></stop>
                            <stop offset="1" stopColor="var(--primary)" stopOpacity="0"></stop>
                        </linearGradient>
                    </defs>
                </svg>

                {/* Tooltip mock */}
                <div style={{
                    position: 'absolute', top: '30px', left: '35%',
                    backgroundColor: '#28392c', border: '1px solid rgba(19, 236, 73, 0.4)',
                    borderRadius: '8px', padding: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                    pointerEvents: 'none'
                }}>
                    <p style={{ margin: 0, fontSize: '10px', color: '#9db9a4', fontWeight: 700 }}>MARCH PEAK</p>
                    <p style={{ margin: 0, color: 'white', fontWeight: 700, fontSize: '14px' }}>
                        $4,250 <span style={{ color: 'var(--primary)' }}>+12%</span>
                    </p>
                </div>
            </div>

            <div className="months-axis">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
            </div>
        </div>
    );
};

export default PricePatternChart;
