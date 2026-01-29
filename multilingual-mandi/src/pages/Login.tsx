import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      // Error is handled by context
    }
  };

  const fillDemoCredentials = () => {
    setEmail('demo@mandi.com');
    setPassword('password123');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="logo">
            <span className="logo-icon">🌾</span>
            <h1>Multilingual Mandi</h1>
          </div>
          <p>AI-powered agricultural marketplace</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Welcome back</h2>
          <p className="login-subtitle">Sign in to your account</p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="demo-credentials">
            <p>Demo credentials:</p>
            <div className="credentials-box">
              <span>Email: demo@mandi.com</span>
              <span>Password: password123</span>
            </div>
            <button
              type="button"
              className="fill-demo-btn"
              onClick={fillDemoCredentials}
            >
              Fill Demo Credentials
            </button>
          </div>
        </form>

        <div className="login-footer">
          <p>New to Multilingual Mandi? <a href="#signup">Create an account</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
