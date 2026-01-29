import React from 'react';
import './NewConversationModal.css';

interface Contact {
    id: number;
    name: string;
    role: string;
    company?: string;
    rating: number;
    avatar: string;
    online?: boolean;
    tags?: string[];
    type: 'recent' | 'suggested';
}

interface NewConversationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const NewConversationModal: React.FC<NewConversationModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const contacts: Contact[] = [
        {
            id: 1,
            name: 'Aman Gupta',
            role: 'Rice Exporters Ltd.',
            company: 'Rice Exporters Ltd.',
            rating: 4.8,
            avatar: '/_artifacts/avatar_aman_gupta.png',
            online: true,
            tags: ['Basmati Rice', 'Long Grain'],
            type: 'recent'
        },
        {
            id: 2,
            name: 'Sarah Jenkins',
            role: 'Global Grain Traders',
            company: 'Global Grain Traders',
            rating: 4.9,
            avatar: '/_artifacts/avatar_sarah_jenkins.png',
            online: false,
            tags: ['Corn', 'Wheat', 'Soybeans'],
            type: 'recent'
        },
        {
            id: 3,
            name: 'Marcus Thorne',
            role: 'Thorne Agriculture',
            company: 'Thorne Agriculture',
            rating: 4.5,
            avatar: '/_artifacts/avatar_marcus_thorne.png',
            online: true,
            tags: ['Organic Barley', 'Sorghum'],
            type: 'suggested'
        },
        {
            id: 4,
            name: 'Elena Rodriguez',
            role: 'Andes Produce Co.',
            company: 'Andes Produce Co.',
            rating: 4.7,
            avatar: '/_artifacts/avatar_elena_rodriguez.png',
            online: false,
            tags: ['Coffee Beans', 'Quinoa'],
            type: 'suggested'
        }
    ];

    const recentContacts = contacts.filter(c => c.type === 'recent');
    const suggestedVendors = contacts.filter(c => c.type === 'suggested');

    const renderContact = (contact: Contact) => (
        <div key={contact.id} className="contact-item">
            <div className="contact-info-wrapper">
                <div className="contact-avatar-wrapper">
                    <img src={contact.avatar} alt={contact.name} className="contact-avatar"
                        onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + contact.name }} />
                    {contact.online && <span className="status-dot"></span>}
                </div>
                <div>
                    <div className="contact-name-row">
                        <h4 className="contact-name">{contact.name}</h4>
                        <span className="contact-role">• {contact.role || contact.company}</span>
                    </div>
                    <div className="contact-meta">
                        <span className="rating-badge">
                            ★ {contact.rating}
                        </span>
                        <span className="meta-divider"></span>
                        <span className="tags">{contact.tags?.join(', ')}</span>
                    </div>
                </div>
            </div>
            <button className={`btn-select ${contact.id === 1 ? 'primary' : ''}`}>
                Select
            </button>
        </div>
    );

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                {/* Header */}
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">Start a New Conversation</h2>
                        <p className="modal-subtitle">Find traders and vendors to begin a negotiation.</p>
                    </div>
                    <button onClick={onClose} className="btn-close">×</button>
                </div>

                {/* Search Bar */}
                <div className="search-section">
                    <div className="search-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by name, company, or phone number..."
                            className="modal-search-input"
                        />
                    </div>
                </div>

                <div className="modal-divider"></div>

                {/* Content Area */}
                <div className="modal-content">

                    {/* Recent Contacts */}
                    <div style={{ marginBottom: '24px' }}>
                        <h3 className="section-title">Recent Contacts</h3>
                        <div className="contact-list">
                            {recentContacts.map(renderContact)}
                        </div>
                    </div>

                    {/* Suggested Vendors */}
                    <div>
                        <h3 className="section-title">Suggested Vendors</h3>
                        <div className="contact-list">
                            {suggestedVendors.map(renderContact)}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <span>ℹ Not finding who you're looking for?</span>
                    <a href="#" className="invite-link">Invite a new contact</a>
                </div>
            </div>
        </div>
    );
};

export default NewConversationModal;
