import React from 'react';

const Chats: React.FC = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Chats</h1>
        <p>Multilingual conversations with buyers and sellers</p>
      </div>
      <div className="page-content">
        <div className="chat-list">
          <div className="chat-item">
            <div className="chat-avatar">R</div>
            <div className="chat-info">
              <h4>Rajesh Kumar</h4>
              <p className="last-message">मुझे 10 क्विंटल गेहूं चाहिए</p>
              <p className="chat-time">2 min ago</p>
            </div>
            <div className="unread-badge">2</div>
          </div>
          <div className="chat-item">
            <div className="chat-avatar">S</div>
            <div className="chat-info">
              <h4>Suresh Patel</h4>
              <p className="last-message">Price negotiation for rice</p>
              <p className="chat-time">15 min ago</p>
            </div>
          </div>
          <div className="chat-item">
            <div className="chat-avatar">M</div>
            <div className="chat-info">
              <h4>Meera Singh</h4>
              <p className="last-message">ਪਿਆਜ਼ ਦੀ ਕੀਮਤ ਕੀ ਹੈ?</p>
              <p className="chat-time">1 hour ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chats;