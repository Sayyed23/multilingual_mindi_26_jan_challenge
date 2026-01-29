import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ChatDetail.css';

interface Message {
  id: string;
  sender: 'me' | 'other';
  text: string;
  originalText?: string;
  translatedFrom?: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'deal' | 'ai-suggestion';
}

const ChatDetail: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const [messageInput, setMessageInput] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  const contact = {
    name: 'Rajesh Kumar',
    avatar: 'R',
    online: true,
    language: 'Hindi',
    rating: 4.7
  };

  const messages: Message[] = [
    {
      id: '1',
      sender: 'other',
      text: 'I need 10 quintals of wheat',
      originalText: 'मुझे 10 क्विंटल गेहूं चाहिए',
      translatedFrom: 'Hindi',
      timestamp: '10:30 AM',
      read: true,
      type: 'text'
    },
    {
      id: '2',
      sender: 'me',
      text: 'I have Grade A wheat available. What price are you looking for?',
      timestamp: '10:32 AM',
      read: true,
      type: 'text'
    },
    {
      id: '3',
      sender: 'other',
      text: 'Can you offer 2,100 per quintal?',
      originalText: 'क्या आप 2,100 प्रति क्विंटल दे सकते हैं?',
      translatedFrom: 'Hindi',
      timestamp: '10:35 AM',
      read: true,
      type: 'text'
    },
    {
      id: '4',
      sender: 'me',
      text: '',
      timestamp: '10:36 AM',
      read: true,
      type: 'ai-suggestion'
    },
    {
      id: '5',
      sender: 'other',
      text: '',
      timestamp: '10:40 AM',
      read: true,
      type: 'deal'
    }
  ];

  const quickReplies = [
    'Can you lower the price?',
    'When can you deliver?',
    "That's my final offer",
    "I'll take it",
    'Let me think about it'
  ];

  const handleSend = () => {
    if (messageInput.trim()) {
      setMessageInput('');
    }
  };

  const handleQuickReply = (reply: string) => {
    setMessageInput(reply);
    setShowQuickReplies(false);
  };

  return (
    <div className="chat-detail-page">
      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ←
        </button>
        <div className="contact-info">
          <div className="contact-avatar-wrapper">
            <div className="contact-avatar">{contact.avatar}</div>
            {contact.online && <span className="online-dot"></span>}
          </div>
          <div className="contact-details">
            <h3>{contact.name}</h3>
            <div className="contact-meta">
              <span className="language-indicator">🌐 {contact.language}</span>
              <span className="rating">⭐ {contact.rating}</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button className="header-btn">📞</button>
          <button className="header-btn">📹</button>
          <button className="header-btn">⋮</button>
        </div>
      </div>

      <div className="messages-container">
        {messages.map(message => (
          <div key={message.id} className={`message-wrapper ${message.sender}`}>
            {message.type === 'text' && (
              <div className="message-bubble">
                {message.translatedFrom && message.originalText && (
                  <div className="original-text">
                    {message.originalText}
                  </div>
                )}
                <div className="message-text">{message.text}</div>
                <div className="message-meta">
                  {message.translatedFrom && (
                    <span className="translated-badge">Translated from {message.translatedFrom}</span>
                  )}
                  <span className="message-time">{message.timestamp}</span>
                  {message.sender === 'me' && message.read && (
                    <span className="read-receipt">✓✓</span>
                  )}
                </div>
              </div>
            )}

            {message.type === 'ai-suggestion' && (
              <div className="ai-suggestion-bubble">
                <div className="ai-header">
                  <span className="ai-icon">💡</span>
                  <span>AI Suggestion</span>
                </div>
                <div className="ai-content">
                  <p>Market price is ₹2,150-2,200/quintal</p>
                  <p className="ai-recommendation">Suggest counter: ₹2,180/quintal</p>
                </div>
                <button className="use-suggestion-btn">Use This</button>
              </div>
            )}

            {message.type === 'deal' && message.sender === 'other' && (
              <div className="deal-proposal-bubble">
                <div className="deal-header">
                  <span className="deal-icon">📋</span>
                  <span>Deal Proposal</span>
                </div>
                <div className="deal-content">
                  <div className="deal-row">
                    <span>Commodity</span>
                    <span>Wheat (Grade A)</span>
                  </div>
                  <div className="deal-row">
                    <span>Quantity</span>
                    <span>10 Quintals</span>
                  </div>
                  <div className="deal-row highlight">
                    <span>Offered Price</span>
                    <span>₹2,150/Quintal</span>
                  </div>
                </div>
                <div className="deal-actions">
                  <button className="accept-btn">Accept</button>
                  <button className="counter-btn">Counter</button>
                  <button className="decline-btn">Decline</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="quick-actions-bar">
        <button className="quick-action" title="Share Price">📊</button>
        <button className="quick-action" title="Share Location">📍</button>
        <button className="quick-action" title="Share Photo">📷</button>
      </div>

      <div className="input-container">
        <button 
          className="emoji-btn"
          onClick={() => setShowQuickReplies(!showQuickReplies)}
        >
          😊
        </button>
        <input
          type="text"
          placeholder="Type a message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="voice-btn">🎤</button>
        <button className="attach-btn">📎</button>
        <button className="send-btn" onClick={handleSend}>
          ➤
        </button>
      </div>

      {showQuickReplies && (
        <div className="quick-replies-panel">
          <h4>Quick Replies</h4>
          <div className="quick-replies-list">
            {quickReplies.map((reply, index) => (
              <button 
                key={index}
                className="quick-reply-btn"
                onClick={() => handleQuickReply(reply)}
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatDetail;
