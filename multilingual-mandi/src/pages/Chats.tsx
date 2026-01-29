import React, { useState } from 'react';
import './Chats.css';

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  dealStatus?: 'negotiating' | 'active' | 'completed';
  language: string;
}

const mockChats: Chat[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    avatar: 'R',
    lastMessage: 'मुझे 10 क्विंटल गेहूं चाहिए',
    time: '2 min ago',
    unread: 2,
    online: true,
    dealStatus: 'negotiating',
    language: 'Hindi'
  },
  {
    id: '2',
    name: 'Suresh Patel',
    avatar: 'S',
    lastMessage: 'Price negotiation for rice',
    time: '15 min ago',
    unread: 0,
    online: true,
    dealStatus: 'active',
    language: 'English'
  },
  {
    id: '3',
    name: 'Meera Singh',
    avatar: 'M',
    lastMessage: 'ਪਿਆਜ਼ ਦੀ ਕੀਮਤ ਕੀ ਹੈ?',
    time: '1 hour ago',
    unread: 0,
    online: false,
    language: 'Punjabi'
  },
  {
    id: '4',
    name: 'Amit Sharma',
    avatar: 'A',
    lastMessage: 'Deal confirmed for tomatoes',
    time: '2 hours ago',
    unread: 0,
    online: false,
    dealStatus: 'completed',
    language: 'Hindi'
  },
  {
    id: '5',
    name: 'Priya Devi',
    avatar: 'P',
    lastMessage: 'నేను మిరపకాయలు కొనాలనుకుంటున్నాను',
    time: '3 hours ago',
    unread: 1,
    online: true,
    language: 'Telugu'
  }
];

const Chats: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filters = [
    { id: 'all', label: 'All Chats' },
    { id: 'active', label: 'Active Deals' },
    { id: 'unread', label: 'Unread' },
    { id: 'archived', label: 'Archived' }
  ];

  const filteredChats = mockChats.filter(chat => {
    if (activeFilter === 'unread') return chat.unread > 0;
    if (activeFilter === 'active') return chat.dealStatus === 'negotiating' || chat.dealStatus === 'active';
    return true;
  }).filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="chats-page">
      <div className="chats-header">
        <div className="chats-title-row">
          <h1>Chats</h1>
          <button className="new-chat-btn">
            <span>+</span> New Chat
          </button>
        </div>
        <p>Multilingual conversations with buyers and sellers</p>
      </div>

      <div className="chats-search">
        <span className="search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="filter-tabs">
        {filters.map(filter => (
          <button
            key={filter.id}
            className={`filter-tab ${activeFilter === filter.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="chat-list">
        {filteredChats.map(chat => (
          <div key={chat.id} className="chat-item">
            <div className="chat-avatar-wrapper">
              <div className="chat-avatar">{chat.avatar}</div>
              {chat.online && <span className="online-indicator"></span>}
            </div>
            <div className="chat-info">
              <div className="chat-header-row">
                <h4>{chat.name}</h4>
                <span className="chat-time">{chat.time}</span>
              </div>
              <div className="chat-message-row">
                <p className="last-message">{chat.lastMessage}</p>
                {chat.unread > 0 && (
                  <span className="unread-badge">{chat.unread}</span>
                )}
              </div>
              <div className="chat-meta">
                <span className="language-badge">{chat.language}</span>
                {chat.dealStatus && (
                  <span className={`deal-indicator ${chat.dealStatus}`}>
                    {chat.dealStatus === 'negotiating' ? 'Negotiating' : 
                     chat.dealStatus === 'active' ? 'Active Deal' : 'Completed'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chats;
