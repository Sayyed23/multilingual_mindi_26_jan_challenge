import { useState } from 'react'
import './App.css'

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('')
  const [selectedUserType, setSelectedUserType] = useState<string>('')
  const [phoneNumber, setPhoneNumber] = useState<string>('')

  const languages = [
    { code: 'hi', name: 'हिंदी', english: 'Hindi' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ', english: 'Punjabi' },
    { code: 'mr', name: 'मराठी', english: 'Marathi' },
    { code: 'en', name: 'English', english: 'English' }
  ]

  const userTypes = [
    {
      type: 'farmer',
      icon: '🚜',
      title: 'Farmer / Vendor',
      description: 'I want to sell my crops and check daily prices',
      buttonText: 'SELECT'
    },
    {
      type: 'buyer',
      icon: '🏪',
      title: 'Buyer',
      description: 'I want to purchase crops in bulk from farmers',
      buttonText: 'SELECT'
    },
    {
      type: 'agent',
      icon: '🤝',
      title: 'Agent',
      description: 'I want to manage trades and facilitate connections',
      buttonText: 'SELECT'
    }
  ]

  const handleSendOTP = () => {
    if (phoneNumber.length >= 10) {
      console.log('Sending OTP to:', phoneNumber)
      // OTP logic will be implemented later
    }
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">📱</span>
            <span className="logo-text">Mandi Market</span>
          </div>
          <div className="header-right">
            <span className="live-market">🟢 LIVE MARKET</span>
            <span className="help-info">Help: 1800-123-4567</span>
            <span className="language-toggle">🌐</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-image">
            <div className="farmer-placeholder">
              <span className="farmer-icon">👨‍🌾</span>
            </div>
          </div>
          <div className="hero-text">
            <h1>Get Fair Prices for Your Crop</h1>
            <p>
              <span className="check-icon">✅</span>
              Direct trade with local buyers. Secure and transparent.
            </p>
            <button className="cta-button">
              <span className="audio-icon">🔊</span>
              Listen to Guide
            </button>
          </div>
        </div>
      </section>

      {/* Language Selection */}
      <section className="language-section">
        <h2>
          Select Your Language / भाषा चुनें
          <span className="audio-icon">🔊</span>
        </h2>
        <div className="language-grid">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`language-card ${selectedLanguage === lang.code ? 'selected' : ''}`}
              onClick={() => setSelectedLanguage(lang.code)}
            >
              <div className="language-name">{lang.name}</div>
              <div className="language-english">{lang.english}</div>
              <span className="language-icon">🌾</span>
            </button>
          ))}
        </div>
        <button className="check-prices-btn">
          <span className="arrow-icon">→</span>
          Check Mandi Prices
          <span className="arrow-icon">→</span>
        </button>
        <div className="login-link">Login / Sign Up</div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="feature">
          <span className="feature-icon">💰</span>
          <div>
            <div className="feature-title">Real Prices</div>
            <div className="feature-desc">Live daily updates</div>
          </div>
        </div>
        <div className="feature">
          <span className="feature-icon">🚫</span>
          <div>
            <div className="feature-title">No Middlemen</div>
            <div className="feature-desc">Sell directly to buyers</div>
          </div>
        </div>
        <div className="feature">
          <span className="feature-icon">🏠</span>
          <div>
            <div className="feature-title">Local Support</div>
            <div className="feature-desc">Help available 24/7</div>
          </div>
        </div>
      </section>

      {/* User Type Selection */}
      <section className="user-type-section">
        <h2>
          Who are you? / आप कौन हैं?
        </h2>
        <div className="user-type-grid">
          {userTypes.map((user) => (
            <div
              key={user.type}
              className={`user-type-card ${selectedUserType === user.type ? 'selected' : ''}`}
              onClick={() => setSelectedUserType(user.type)}
            >
              <div className="user-type-icon">{user.icon}</div>
              <div className="user-type-title">{user.title}</div>
              <div className="user-type-description">{user.description}</div>
              <button className="user-type-button">{user.buttonText}</button>
            </div>
          ))}
        </div>
      </section>

      {/* Phone Number Input */}
      <section className="phone-section">
        <div className="phone-input-container">
          <h3>
            Enter Phone Number
            <span className="audio-icon">🔊</span>
          </h3>
          <p>We will send a code to verify</p>
          <div className="phone-input-wrapper">
            <span className="country-code">+91</span>
            <input
              type="tel"
              placeholder="98765 43210"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="phone-input"
            />
            <button 
              className="send-otp-btn"
              onClick={handleSendOTP}
              disabled={phoneNumber.length < 10}
            >
              Send OTP
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="security-info">
            <div className="security-item">
              <span className="check-icon">✅</span>
              <span>Security & Permissions</span>
            </div>
            <div className="security-item">
              <span className="check-icon">✅</span>
              <span>Location is fine, nearby markets</span>
            </div>
            <div className="security-item">
              <span className="check-icon">✅</span>
              <span>SMS: To auto verify your login</span>
            </div>
          </div>
          <div className="footer-right">
            <div className="confused-text">Confused? / समझ नहीं आ रहा?</div>
            <button className="voice-help-btn">
              🎤 Get Voice Help
            </button>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 Mandi Market Platform. All rights reserved.</p>
          <div className="footer-links">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
