import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Chat {
    id: number;
    name: string;
    company: string;
    message: string;
    time: string;
    avatar: string; // URL or initials
    isOnline?: boolean;
}

const RecentChats: React.FC = () => {
    const navigate = useNavigate();

    const recentChats: Chat[] = [
        {
            id: 1,
            name: 'Sarah Jenkins', // (AgriCorp) handled in render
            company: 'AgriCorp',
            message: 'Can we finalize the logistics terms for the wheat batch?',
            time: '2m ago',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzgilZNP79E2iqshDUassEdBF2FCscjk8HpV08iv-ntAvrR5RzUeAe034agaig5y-UO07AtD4O_BveFrDrIT9syHSjL0paqfiPZkmAZz5kTH2iyPLhhZxQa-J-fl_omDluduNBu5Uy5h5bhnd-8m1L6xCnuyTb5ntQBPzFqpW-UcGRce4_GbC_5TqScIKSP1dYNnrTo2jUUTWleIhip_MgvB6OROsJbPXrBxJKEKGrtS7YLQf0n4s0AUjKgZxqlHsptsU5DFEUqiaZ',
            isOnline: true
        },
        {
            id: 2,
            name: 'Marcus Thorne',
            company: 'GrainTech',
            message: "I've sent the updated invoice for the tomato shipment.",
            time: '1h ago',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYfdbQ56Ro3zbek_bOjehzvVKM2_GTOsKpoMC09c-1F0UPuZfg-gaTI9HT_TXfqphWm2CW5qeCDxwt9JEd37FgRRr38zfhzD7wuRaXuh9Z0hiSM5hdNj-5jzDlF79zVdxPT8kVqWzwQss9BV-R38LAkMSHIVbMLEbZaHXaAmXJ9BV7-GBQlDbYY-btVlyIRxOxn_MsIo9mCriJ5HZe9NevddP8ZCi-ZSjzowjaTs9SSNB6bVpLHOz-9wBZrl7n3s9bEywUvoxYlxwn'
        },
        {
            id: 3,
            name: 'Ken Baker',
            company: 'FarmCo',
            message: "Price seems fair. Let's proceed with the contract.",
            time: '4h ago',
            avatar: 'KB'
        }
    ];

    const renderAvatar = (chat: Chat) => {
        if (chat.avatar.length > 2) {
            return <img src={chat.avatar} alt={chat.name} />;
        }
        return (
            <div style={{
                width: '100%', height: '100%', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', fontSize: '12px', color: 'var(--slate-500)'
            }}>
                {chat.avatar}
            </div>
        );
    }

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="card-header">
                <h3 className="card-title">Recent Chats</h3>
                <span className="material-symbols-outlined" style={{ color: 'var(--slate-400)', cursor: 'pointer' }}>chat</span>
            </div>
            <div className="chats-content">
                {recentChats.map((chat) => (
                    <div
                        key={chat.id}
                        className="chat-row"
                        onClick={() => navigate(`/chats/${chat.id}`)}
                    >
                        <div className="chat-row-avatar">
                            <div className="profile-avatar">
                                {renderAvatar(chat)}
                            </div>
                            {chat.isOnline && <span className="online-dot"></span>}
                        </div>
                        <div className="chat-details">
                            <div className="chat-top">
                                <span className="chat-name-text">
                                    {chat.name} {chat.company !== 'FarmCo' && chat.company !== 'GrainTech' && <span style={{ fontWeight: 'normal' }}>({chat.company})</span>}
                                </span>
                                <span className="chat-time-text">{chat.time}</span>
                            </div>
                            <div className="chat-msg-text">{chat.message}</div>
                        </div>
                    </div>
                ))}
                <button
                    className="view-messages-btn"
                    onClick={() => navigate('/chats')}
                >
                    View All Messages
                </button>
            </div>
        </div>
    );
};

export default RecentChats;
