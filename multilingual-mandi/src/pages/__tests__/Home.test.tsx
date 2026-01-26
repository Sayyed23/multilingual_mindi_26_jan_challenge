import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../Home';
import { AuthProvider } from '../../contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Mock child components to avoid complexity in unit test
jest.mock('../../components/dashboard/Sidebar', () => () => <div data-testid="sidebar">Sidebar</div>);
jest.mock('../../components/dashboard/QuickActions', () => () => <div data-testid="quick-actions">Quick Actions</div>);
jest.mock('../../components/dashboard/MarketSnapshot', () => () => <div data-testid="market-snapshot">Market Snapshot</div>);
jest.mock('../../components/dashboard/ActiveNegotiations', () => () => <div data-testid="active-negotiations">Active Negotiations</div>);
jest.mock('../../components/dashboard/MarketIntelligence', () => () => <div data-testid="market-intelligence">Market Intelligence</div>);
jest.mock('../../components/dashboard/RecentChats', () => () => <div data-testid="recent-chats">Recent Chats</div>);

// Mock DashboardHeader which has navigation
jest.mock('../../components/dashboard/DashboardHeader', () => () => <div data-testid="dashboard-header">Dashboard Header</div>);

describe('Unit: Home Page Component', () => {
  const renderHome = () => {
    return render(
      <AuthProvider>
        <BrowserRouter>
          <Home />
        </BrowserRouter>
      </AuthProvider>
    );
  };

  it('renders the dashboard structure correctly', () => {
    renderHome();

    expect(screen.getByTestId('dashboard-header')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
    expect(screen.getByTestId('market-snapshot')).toBeInTheDocument();
    expect(screen.getByTestId('active-negotiations')).toBeInTheDocument();
    expect(screen.getByTestId('market-intelligence')).toBeInTheDocument();
    expect(screen.getByTestId('recent-chats')).toBeInTheDocument();
  });
});