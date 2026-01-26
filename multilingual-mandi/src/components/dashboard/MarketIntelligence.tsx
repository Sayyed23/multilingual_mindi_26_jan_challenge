import React from 'react';

interface IntelligenceItem {
    type: 'monsoon' | 'festival' | 'export';
    title: string;
    message: string;
}

const MarketIntelligence: React.FC = () => {
    const intelligenceData: IntelligenceItem[] = [
        {
            type: 'monsoon',
            title: 'Monsoon Alert',
            message: 'Heavy rains expected in Punjab. Logistics delays possible for next 72 hrs.'
        },
        {
            type: 'festival',
            title: 'Upcoming Holiday',
            message: 'Harvest Festival - National Market Holiday this Friday. Settlement delays expected.'
        },
        {
            type: 'export',
            title: 'Export Demand Surge',
            message: 'Rice export demand from SEA region is up by 15%. Consider adjusting reserve prices.'
        }
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'monsoon': return 'warning';
            case 'festival': return 'event';
            case 'export': return 'trending_up';
            default: return 'info';
        }
    };

    const getStyleClass = (type: string) => {
        switch (type) {
            case 'monsoon': return 'amber';
            case 'festival': return 'blue';
            case 'export': return 'primary';
            default: return 'gray';
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ color: '#f59e0b' }}>insights</span>
                    Market Intelligence
                </h3>
            </div>
            <div className="intelligence-content">
                {intelligenceData.map((item, index) => {
                    const styleClass = getStyleClass(item.type);
                    return (
                        <div key={index} className={`intel-item ${styleClass}`}>
                            <span className={`material-symbols-outlined ${styleClass}-text`} style={{ fontSize: '18px' }}>
                                {getIcon(item.type)}
                            </span>
                            <div className="intel-text">
                                <h4 className={`${styleClass}-text`}>{item.title}</h4>
                                <p className={`${styleClass}-text`}>{item.message}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MarketIntelligence;
