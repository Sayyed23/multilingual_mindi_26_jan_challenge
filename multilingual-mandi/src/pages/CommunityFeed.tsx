import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface CommunityPost {
  id: string;
  author: string;
  role: string;
  avatar: string;
  timestamp: string;
  category: 'MARKET NEWS' | 'SUCCESS STORY' | 'EXPERT TIP';
  title: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
}

const CommunityFeed: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All Posts');
  const [newPostContent, setNewPostContent] = useState('');

  const communityPosts: CommunityPost[] = [
    {
      id: '1',
      author: 'Marcus Vane',
      role: 'Precision Farming Expert',
      avatar: '👨‍🌾',
      timestamp: '2h ago',
      category: 'MARKET NEWS',
      title: 'Global Wheat Prices Surge Amid Supply Chain Disruptions',
      content: 'Recent shifts in major export corridors have triggered a 4% increase in wheat futures this morning. Vendors should review logistics contracts and prepare for potential volatility in the coming weeks. #WheatMarket #AgricultureNews',
      likes: 124,
      comments: 18,
      shares: 0
    },
    {
      id: '2',
      author: 'Elena Rodriguez',
      role: 'Farm Owner',
      avatar: '👩‍🌾',
      timestamp: '5h ago',
      category: 'SUCCESS STORY',
      title: 'Scaling 200 Acres with New Hydroponic Systems',
      content: 'Incredibly proud to share that our vertical integration project is now fully operational! We\'ve seen a 30% reduction in water usage and a 15% increase in yield within just the first quarter. Data-driven farming works!',
      image: '/api/placeholder/600/300',
      likes: 312,
      comments: 45,
      shares: 0
    }
  ];

  const trendingTopics = [
    { tag: '#SmartIrrigation24', posts: '1.2k posts' },
    { tag: '#RegenerativeAg', posts: '856 posts' },
    { tag: '#SoybeanFutures', posts: '2k posts' },
    { tag: '#CarbonCredits', posts: '340 posts' }
  ];

  const whoToFollow = [
    { name: 'Arjun Patel', role: 'Grain Trader', avatar: '👨‍💼' },
    { name: 'Sarah Chen', role: 'Logistics Mgr', avatar: '👩‍💼' }
  ];

  const liveCommodities = [
    { name: 'Corn Futures', price: '$4.32', change: '+1.2%', trend: 'up' },
    { name: 'Soybeans', price: '$11.85', change: '-0.4%', trend: 'down' }
  ];

  const filterOptions = ['All Posts', 'Expert Tips', 'Market News', 'Success Stories'];

  return (
    <div className="community-feed-container">
      {/* Header */}
      <div className="community-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">🌾</span>
            <span className="logo-text">AgriMarket</span>
          </div>
          <nav className="header-nav">
            <span className="nav-item">Marketplace</span>
            <span className="nav-item">Commodities</span>
            <span className="nav-item active">Community</span>
            <span className="nav-item">Logistics</span>
          </nav>
        </div>
        <div className="header-right">
          <div className="search-bar">
            <input type="text" placeholder="Search insights..." />
          </div>
          <button className="notification-btn">🔔</button>
          <button className="messages-btn">💬</button>
          <div className="user-avatar">👨‍💼</div>
        </div>
      </div>

      <div className="community-content">
        {/* Left Sidebar */}
        <div className="left-sidebar">
          <div className="user-profile-card">
            <div className="profile-header">
              <div className="profile-avatar large">👨‍💼</div>
              <div className="profile-info">
                <div className="profile-name">John Doe</div>
                <div className="profile-role">Senior Agronomist</div>
              </div>
            </div>
            
            <nav className="profile-nav">
              <div className="nav-item active">
                <span className="nav-icon">🏠</span>
                <span className="nav-text">Home Feed</span>
              </div>
              <div className="nav-item">
                <span className="nav-icon">📝</span>
                <span className="nav-text">My Posts</span>
              </div>
              <div className="nav-item">
                <span className="nav-icon">🔖</span>
                <span className="nav-text">Saved</span>
              </div>
              <div className="nav-item">
                <span className="nav-icon">👥</span>
                <span className="nav-text">Groups</span>
              </div>
              <div className="nav-item">
                <span className="nav-icon">📊</span>
                <span className="nav-text">Analytics</span>
              </div>
            </nav>
            
            <button className="public-profile-btn">View Public Profile</button>
          </div>

          <div className="live-commodities-card">
            <h3>LIVE COMMODITIES</h3>
            <div className="commodity-list">
              {liveCommodities.map((commodity, index) => (
                <div key={index} className="commodity-item">
                  <div className="commodity-info">
                    <div className="commodity-name">{commodity.name}</div>
                    <div className="commodity-code">CBOT</div>
                  </div>
                  <div className="commodity-price">
                    <div className="price">{commodity.price}</div>
                    <div className={`change ${commodity.trend}`}>
                      {commodity.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Feed */}
        <div className="main-feed">
          <div className="feed-header">
            <h1>Community Feed Hub</h1>
            <p>Expert insights, market shifts, and agricultural success stories.</p>
          </div>

          {/* Create Post */}
          <div className="create-post-card">
            <div className="create-post-header">
              <div className="user-avatar">👨‍💼</div>
              <input
                type="text"
                placeholder="Share an agricultural tip, news, or success story..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="post-input"
              />
            </div>
            <div className="create-post-actions">
              <button className="action-btn">📷</button>
              <button className="action-btn">📎</button>
              <button className="action-btn">🏷️</button>
              <button className="post-btn">Post Now</button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs">
            {filterOptions.map((filter) => (
              <button
                key={filter}
                className={`filter-tab ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Posts */}
          <div className="posts-container">
            {communityPosts.map((post) => (
              <div key={post.id} className="post-card">
                <div className="post-header">
                  <div className="post-author">
                    <div className="author-avatar">{post.avatar}</div>
                    <div className="author-info">
                      <div className="author-name">{post.author}</div>
                      <div className="author-role">{post.role} • {post.timestamp}</div>
                    </div>
                  </div>
                  <div className={`post-category ${post.category.toLowerCase().replace(' ', '-')}`}>
                    {post.category}
                  </div>
                </div>

                <div className="post-content">
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-text">{post.content}</p>
                  {post.image && (
                    <div className="post-image">
                      <img src={post.image} alt="Post content" />
                    </div>
                  )}
                </div>

                <div className="post-actions">
                  <button className="action-btn">
                    👍 {post.likes}
                  </button>
                  <button className="action-btn">
                    💬 {post.comments}
                  </button>
                  <button className="action-btn">
                    🔄 {post.shares}
                  </button>
                  <button className="bookmark-btn">🔖</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="right-sidebar">
          <div className="trending-topics-card">
            <h3>TRENDING TOPICS</h3>
            <div className="trending-list">
              {trendingTopics.map((topic, index) => (
                <div key={index} className="trending-item">
                  <div className="trending-category">AGRICULTURE TECHNOLOGY</div>
                  <div className="trending-tag">{topic.tag}</div>
                  <div className="trending-count">{topic.posts}</div>
                </div>
              ))}
            </div>
            <button className="show-more-btn">Show More</button>
          </div>

          <div className="who-to-follow-card">
            <h3>WHO TO FOLLOW</h3>
            <div className="follow-list">
              {whoToFollow.map((user, index) => (
                <div key={index} className="follow-item">
                  <div className="follow-user">
                    <div className="follow-avatar">{user.avatar}</div>
                    <div className="follow-info">
                      <div className="follow-name">{user.name}</div>
                      <div className="follow-role">{user.role}</div>
                    </div>
                  </div>
                  <button className="follow-btn">Follow</button>
                </div>
              ))}
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-section">
              <a href="#" className="footer-link">About</a>
              <a href="#" className="footer-link">Terms of Service</a>
              <a href="#" className="footer-link">Privacy Policy</a>
              <a href="#" className="footer-link">Cookie Policy</a>
            </div>
            <div className="copyright">© 2024 AgriMarket Inc.</div>
          </div>
        </div>
      </div>

      <style>{`
        .community-feed-container {
          min-height: 100vh;
          background: #0a0e1a;
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .community-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: #0f1419;
          border-bottom: 1px solid #1e2329;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo-icon {
          font-size: 24px;
        }

        .logo-text {
          font-size: 18px;
          font-weight: 600;
          color: #00d4aa;
        }

        .header-nav {
          display: flex;
          gap: 24px;
        }

        .nav-item {
          color: #8b949e;
          cursor: pointer;
          transition: color 0.2s;
          padding: 8px 0;
          border-bottom: 2px solid transparent;
        }

        .nav-item:hover, .nav-item.active {
          color: #00d4aa;
          border-bottom-color: #00d4aa;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .search-bar input {
          background: #1e2329;
          border: 1px solid #2d3748;
          border-radius: 8px;
          padding: 8px 12px;
          color: white;
          width: 250px;
        }

        .notification-btn, .messages-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: background 0.2s;
        }

        .notification-btn:hover, .messages-btn:hover {
          background: #1e2329;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #2d3748;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-avatar.large {
          width: 48px;
          height: 48px;
          font-size: 20px;
        }

        .community-content {
          display: flex;
          max-width: 1400px;
          margin: 0 auto;
          min-height: calc(100vh - 73px);
        }

        .left-sidebar {
          width: 280px;
          background: #0f1419;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .user-profile-card {
          background: #1e2329;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #2d3748;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .profile-name {
          font-weight: 600;
          color: white;
        }

        .profile-role {
          font-size: 12px;
          color: #8b949e;
        }

        .profile-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
        }

        .profile-nav .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
          color: #8b949e;
          border-bottom: none;
        }

        .profile-nav .nav-item:hover {
          background: #2d3748;
          color: white;
        }

        .profile-nav .nav-item.active {
          background: #00d4aa;
          color: #0a0e1a;
        }

        .nav-icon {
          font-size: 16px;
        }

        .public-profile-btn {
          background: #00d4aa;
          color: #0a0e1a;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          transition: background 0.2s;
        }

        .public-profile-btn:hover {
          background: #00b894;
        }

        .live-commodities-card {
          background: #1e2329;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #2d3748;
        }

        .live-commodities-card h3 {
          font-size: 12px;
          font-weight: 600;
          color: #8b949e;
          margin: 0 0 16px 0;
          letter-spacing: 0.5px;
        }

        .commodity-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .commodity-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .commodity-name {
          font-weight: 500;
          color: white;
          font-size: 14px;
        }

        .commodity-code {
          font-size: 11px;
          color: #8b949e;
        }

        .commodity-price {
          text-align: right;
        }

        .price {
          font-weight: 600;
          color: white;
          font-size: 14px;
        }

        .change {
          font-size: 11px;
          font-weight: 600;
        }

        .change.up {
          color: #00d4aa;
        }

        .change.down {
          color: #ff6b6b;
        }

        .main-feed {
          flex: 1;
          padding: 24px;
          max-width: 600px;
        }

        .feed-header {
          margin-bottom: 24px;
        }

        .feed-header h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: white;
        }

        .feed-header p {
          color: #8b949e;
          margin: 0;
        }

        .create-post-card {
          background: #1e2329;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #2d3748;
          margin-bottom: 24px;
        }

        .create-post-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .post-input {
          flex: 1;
          background: #0a0e1a;
          border: 1px solid #2d3748;
          border-radius: 8px;
          padding: 12px;
          color: white;
          font-size: 14px;
        }

        .post-input:focus {
          outline: none;
          border-color: #00d4aa;
        }

        .create-post-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .action-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: background 0.2s;
          color: #8b949e;
        }

        .action-btn:hover {
          background: #2d3748;
        }

        .post-btn {
          background: #00d4aa;
          color: #0a0e1a;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .post-btn:hover {
          background: #00b894;
        }

        .filter-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 24px;
          background: #1e2329;
          border-radius: 8px;
          padding: 4px;
        }

        .filter-tab {
          background: none;
          border: none;
          color: #8b949e;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .filter-tab.active {
          background: #00d4aa;
          color: #0a0e1a;
        }

        .filter-tab:hover:not(.active) {
          color: white;
          background: #2d3748;
        }

        .posts-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .post-card {
          background: #1e2329;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #2d3748;
        }

        .post-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .post-author {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .author-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #2d3748;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .author-name {
          font-weight: 600;
          color: white;
        }

        .author-role {
          font-size: 12px;
          color: #8b949e;
        }

        .post-category {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          text-align: center;
        }

        .post-category.market-news {
          background: #3b82f6;
          color: white;
        }

        .post-category.success-story {
          background: #00d4aa;
          color: #0a0e1a;
        }

        .post-category.expert-tip {
          background: #fbbf24;
          color: #0a0e1a;
        }

        .post-title {
          font-size: 18px;
          font-weight: 600;
          color: white;
          margin: 0 0 12px 0;
        }

        .post-text {
          color: #8b949e;
          line-height: 1.5;
          margin: 0 0 16px 0;
        }

        .post-image {
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 16px;
        }

        .post-image img {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        .post-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .post-actions .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #8b949e;
        }

        .bookmark-btn {
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: background 0.2s;
          color: #8b949e;
          margin-left: auto;
        }

        .bookmark-btn:hover {
          background: #2d3748;
        }

        .right-sidebar {
          width: 320px;
          background: #0f1419;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .trending-topics-card, .who-to-follow-card {
          background: #1e2329;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #2d3748;
        }

        .trending-topics-card h3, .who-to-follow-card h3 {
          font-size: 12px;
          font-weight: 600;
          color: #8b949e;
          margin: 0 0 16px 0;
          letter-spacing: 0.5px;
        }

        .trending-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .trending-item {
          cursor: pointer;
          transition: background 0.2s;
          padding: 8px;
          border-radius: 6px;
        }

        .trending-item:hover {
          background: #2d3748;
        }

        .trending-category {
          font-size: 10px;
          color: #8b949e;
          margin-bottom: 4px;
        }

        .trending-tag {
          font-weight: 600;
          color: #00d4aa;
          margin-bottom: 4px;
        }

        .trending-count {
          font-size: 12px;
          color: #8b949e;
        }

        .show-more-btn {
          background: none;
          border: none;
          color: #00d4aa;
          cursor: pointer;
          font-weight: 500;
          padding: 8px 0;
          width: 100%;
          text-align: left;
        }

        .follow-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .follow-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .follow-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .follow-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #2d3748;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .follow-name {
          font-weight: 500;
          color: white;
          font-size: 14px;
        }

        .follow-role {
          font-size: 12px;
          color: #8b949e;
        }

        .follow-btn {
          background: #00d4aa;
          color: #0a0e1a;
          border: none;
          padding: 6px 16px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          font-size: 12px;
          transition: background 0.2s;
        }

        .follow-btn:hover {
          background: #00b894;
        }

        .footer-links {
          margin-top: auto;
        }

        .footer-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }

        .footer-link {
          color: #8b949e;
          text-decoration: none;
          font-size: 12px;
          transition: color 0.2s;
        }

        .footer-link:hover {
          color: #00d4aa;
        }

        .copyright {
          font-size: 11px;
          color: #8b949e;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .right-sidebar {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .left-sidebar {
            display: none;
          }
          
          .main-feed {
            max-width: none;
          }
          
          .header-nav {
            display: none;
          }
          
          .community-content {
            padding: 0 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default CommunityFeed;