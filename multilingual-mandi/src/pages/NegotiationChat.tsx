import React, { useState } from 'react';
import '../pages/NegotiationChat.css';

interface Message {
    id: number;
    type: 'text' | 'text_me' | 'proposal' | 'ai_suggestion';
    sender?: string;
    role?: string;
    avatar?: string;
    text?: string;
    translation?: string;
    time?: string;
    data?: {
        id: string;
        product: string;
        quantity: string;
        price: number;
        deliveryDate: string;
        status: string;
    };
}

const NegotiationChat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            sender: 'Carlos Mendez',
            role: 'Exporter',
            avatar: '👨🏽',
            text: 'Hola, ¿puedes entregar 50 toneladas de trigo para el viernes?',
            translation: 'Hello, can you deliver 50 tons of wheat by Friday?',
            time: '10:42 AM',
            type: 'text'
        },
        {
            id: 2,
            type: 'proposal',
            data: {
                id: '#2840',
                product: 'Hard Red Winter Wheat',
                quantity: '50 Tons',
                price: 14250.00,
                deliveryDate: 'Oct 27, 2023',
                status: 'pending'
            }
        },
        {
            id: 3,
            type: 'ai_suggestion',
            text: 'Current market price for Grade 1 Wheat in Rosario is $292/ton (+2.1% today). I suggest countering with $14,600.00 to match benchmark value.'
        },
        {
            id: 4,
            sender: 'You',
            role: 'Me',
            text: "I'm reviewing the shipping logistics for Friday. Can you confirm the port of origin?",
            time: '10:45 AM',
            type: 'text_me'
        }
    ]);

    return (
        <div className="negotiation-container">
            {/* 1. Left Sidebar - Navigation */}
            <div className="negotiation-sidebar">
                <div className="negotiation-brand">
                    <span>🚜</span> AgriTrade
                </div>
                <nav className="negotiation-nav">
                    <div className="nav-link">Dashboard</div>
                    <div className="nav-link">Marketplace</div>
                    <div className="nav-link active">Messages</div>
                    <div className="nav-link">Orders</div>
                    <div className="nav-link">Analytics</div>
                </nav>
                <div className="user-profile-mini">
                    <div className="user-avatar-mini"></div>
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Marco Rossi</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--success-color)' }}>● Verified Trader</div>
                    </div>
                </div>
            </div>

            {/* 2. Main Chat Area */}
            <div className="chat-area">
                {/* Chat Header */}
                <div className="chat-header">
                    <div className="chat-participant">
                        <div className="participant-avatar">👨🏽</div>
                        <div className="participant-info">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span className="name">Carlos Mendez</span>
                                <span className="role">Exporter</span>
                            </div>
                            <div className="participant-status">Online • Argentina (GMT-3)</div>
                        </div>
                    </div>
                    <div className="header-actions">
                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary-color)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                            📞 Voice Call
                        </button>
                        <button className="btn-icon">📹</button>
                        <button className="btn-icon">ℹ️</button>
                    </div>
                </div>

                {/* Message Feed */}
                <div className="chat-feed">
                    <div className="date-divider"><span className="date-badge">TODAY</span></div>

                    {messages.map(msg => {
                        if (msg.type === 'text') {
                            return (
                                <div key={msg.id} className="message-row">
                                    <div className="participant-avatar" style={{ width: 32, height: 32, fontSize: '1rem' }}>{msg.avatar}</div>
                                    <div>
                                        <div className="message-bubble">
                                            <div style={{ marginBottom: '0.5rem' }}>{msg.text}</div>
                                            <div className="translation-text">
                                                <span style={{ color: 'var(--primary-color)' }}>文A</span> {msg.translation}
                                            </div>
                                        </div>
                                        <div className="message-time">{msg.time}</div>
                                    </div>
                                </div>
                            );
                        }
                        if (msg.type === 'text_me') {
                            return (
                                <div key={msg.id} className="message-row me">
                                    <div style={{ maxWidth: '60%' }}>
                                        <div className="message-bubble">
                                            {msg.text}
                                        </div>
                                        <div className="message-time">{msg.time} ✓✓</div>
                                    </div>
                                </div>
                            );
                        }
                        if (msg.type === 'proposal') {
                            return (
                                <div key={msg.id} style={{ marginLeft: '48px', marginBottom: '1.5rem', maxWidth: '500px' }}>
                                    <div className="proposal-card">
                                        <div className="proposal-header">
                                            <span>NEW PROPOSAL {msg.data?.id}</span>
                                            <span>📦</span>
                                        </div>
                                        <div className="proposal-body">
                                            <div className="proposal-item">
                                                <div className="proposal-label">Product</div>
                                                <div className="proposal-value">{msg.data?.product}</div>
                                            </div>
                                            <div className="proposal-item">
                                                <div className="proposal-label">Quantity</div>
                                                <div className="proposal-value">{msg.data?.quantity}</div>
                                            </div>
                                            <div className="proposal-item">
                                                <div className="proposal-label">Total Price</div>
                                                <div className="proposal-value price">${msg.data?.price.toLocaleString()}</div>
                                            </div>
                                            <div className="proposal-item">
                                                <div className="proposal-label">Delivery</div>
                                                <div className="proposal-value">{msg.data?.deliveryDate}</div>
                                            </div>
                                        </div>
                                        <div className="proposal-actions">
                                            <button className="btn-proposal btn-accept">Accept Deal</button>
                                            <button className="btn-proposal btn-counter">Counter Offer</button>
                                            <button className="btn-proposal btn-decline">Decline</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        if (msg.type === 'ai_suggestion') {
                            return (
                                <div key={msg.id} style={{ marginLeft: '48px', marginBottom: '1.5rem', maxWidth: '500px' }}>
                                    <div className="ai-suggestion">
                                        <div className="ai-icon">✨</div>
                                        <div>
                                            <div className="ai-title">AI Assistant Suggestion</div>
                                            <div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>{msg.text}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>

                {/* Input Area */}
                <div className="chat-input-area">
                    <div className="quick-replies">
                        <span className="chip">When can you deliver?</span>
                        <span className="chip">Check inventory availability</span>
                        <span className="chip">Send inspection report</span>
                        <span className="chip">Request invoice</span>
                    </div>
                    <div className="input-row">
                        <button className="btn-icon">⊕</button>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                className="chat-input"
                                placeholder="Type a message or use / for commands..."
                            />
                            <span className="voice-icon">🎙️</span>
                        </div>
                        <button className="btn-send">➤</button>
                    </div>
                </div>
            </div>

            {/* 3. Right Sidebar - Stats Panel */}
            <div className="stats-panel">
                <div className="stats-header">
                    <span>Negotiation Stats</span>
                    <span style={{ color: 'var(--primary-color)' }}>📊</span>
                </div>

                {/* Deal Health Score */}
                <div className="stat-box">
                    <div className="proposal-label" style={{ marginBottom: '0.5rem' }}>Deal Health Score</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div className="deal-score">84%</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>HIGH LIKELIHOOD</span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '84%' }}></div>
                    </div>
                </div>

                {/* Market Benchmark */}
                <div className="stat-box">
                    <div className="proposal-label" style={{ marginBottom: '0.5rem' }}>Market Benchmark</div>
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.9rem' }}>Wheat Futures (W)</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>$285.50</span>
                            <span style={{ color: 'var(--success-color)', fontSize: '0.9rem' }}>↗ +1.2%</span>
                        </div>
                    </div>
                    <div style={{ height: '100px', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'end', padding: '0 4px', gap: '4px' }}>
                        {/* Simple CSS Bar Chart as placeholder/mock */}
                        <div style={{ flex: 1, background: 'var(--primary-color)', height: '30%', opacity: 0.5, borderRadius: '4px 4px 0 0' }}></div>
                        <div style={{ flex: 1, background: 'var(--primary-color)', height: '45%', opacity: 0.6, borderRadius: '4px 4px 0 0' }}></div>
                        <div style={{ flex: 1, background: 'var(--primary-color)', height: '40%', opacity: 0.7, borderRadius: '4px 4px 0 0' }}></div>
                        <div style={{ flex: 1, background: 'var(--primary-color)', height: '65%', opacity: 0.8, borderRadius: '4px 4px 0 0' }}></div>
                        <div style={{ flex: 1, background: 'var(--primary-color)', height: '80%', opacity: 1.0, borderRadius: '4px 4px 0 0' }}></div>
                    </div>
                </div>

                {/* Live Terms Status */}
                <div style={{ marginBottom: 'auto' }}>
                    <div className="proposal-label" style={{ marginBottom: '0.75rem' }}>Live Terms Status</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div className="proposal-item" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--success-color)' }}>●</span> Volume
                            </div>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>50 Tons</span>
                        </div>
                        <div className="proposal-item" style={{ display: 'flex', justifyContent: 'space-between', border: '1px solid var(--warning-color)' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--warning-color)' }}>●</span> Price
                            </div>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>$285.0/t</span>
                        </div>
                        <div className="proposal-item" style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--text-tertiary)' }}>●</span> Ship Date
                            </div>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Friday</span>
                        </div>
                    </div>
                </div>

                <button className="btn-contract">
                    Generate Contract Draft
                </button>

            </div>
        </div>
    );
};

export default NegotiationChat;
