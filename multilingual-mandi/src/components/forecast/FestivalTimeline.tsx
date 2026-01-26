import React from 'react';

const FestivalTimeline: React.FC = () => {
    const events = [
        {
            name: 'Diwali Preparation',
            date: 'Oct 24 - Nov 12',
            impact: 'High Impact',
            icon: 'cake', // closest to provided icon
            type: 'high',
            progress: 85
        },
        {
            name: 'Lunar New Year',
            date: 'Jan 15 - Feb 5',
            impact: 'Medium',
            icon: 'temple_hindu',
            type: 'medium',
            progress: 60
        },
        {
            name: 'Harvest Festival',
            date: 'Mar 10 - Mar 20',
            impact: 'Medium',
            icon: 'eco',
            type: 'medium',
            progress: 45
        },
        {
            name: 'Eid-al-Fitr',
            date: 'Apr 5 - Apr 15',
            impact: 'High Impact',
            icon: 'star_half',
            type: 'high',
            progress: 92
        }
    ];

    return (
        <div className="timeline-card">
            <div className="timeline-header">
                <h3 className="timeline-title">
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>calendar_month</span>
                    Upcoming Festival Pipeline
                </h3>
                <span className="tag-label" style={{ color: '#9db9a4' }}>Next 6 Months</span>
            </div>

            <div className="timeline-grid">
                {events.map((event, index) => (
                    <div key={index} className={`event-card ${event.type}`}>
                        <div className="event-top">
                            <span className="material-symbols-outlined" style={{ color: event.type === 'high' ? 'var(--primary)' : 'white' }}>
                                {event.icon}
                            </span>
                            <span className={`impact-badge ${event.type}`}>
                                {event.impact}
                            </span>
                        </div>
                        <p className="event-name">{event.name}</p>
                        <p className="event-date">{event.date}</p>
                        <div className="event-progress">
                            <div
                                className="event-bar"
                                style={{
                                    width: `${event.progress}%`,
                                    backgroundColor: event.type === 'high' ? 'var(--primary)' : '#94a3b8'
                                }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FestivalTimeline;
