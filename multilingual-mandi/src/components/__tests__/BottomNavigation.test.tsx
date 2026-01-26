import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import BottomNavigation from '../BottomNavigation';

// Wrapper component for router context
const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Unit: BottomNavigation Component', () => {
  it('renders all navigation items', () => {
    render(
      <RouterWrapper>
        <BottomNavigation />
      </RouterWrapper>
    );

    // Check that all navigation items are present
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Prices')).toBeInTheDocument();
    expect(screen.getByText('Chats')).toBeInTheDocument();
    expect(screen.getByText('Deals')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('renders navigation icons', () => {
    render(
      <RouterWrapper>
        <BottomNavigation />
      </RouterWrapper>
    );

    // Check that icons are present (using emoji icons)
    expect(screen.getByText('🏠')).toBeInTheDocument();
    expect(screen.getByText('💰')).toBeInTheDocument();
    expect(screen.getByText('💬')).toBeInTheDocument();
    expect(screen.getByText('🤝')).toBeInTheDocument();
    expect(screen.getByText('👤')).toBeInTheDocument();
  });

  it('has correct navigation links', () => {
    render(
      <RouterWrapper>
        <BottomNavigation />
      </RouterWrapper>
    );

    // Check that links have correct href attributes
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /prices/i })).toHaveAttribute('href', '/prices');
    expect(screen.getByRole('link', { name: /chats/i })).toHaveAttribute('href', '/chats');
    expect(screen.getByRole('link', { name: /deals/i })).toHaveAttribute('href', '/deals');
    expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute('href', '/profile');
  });

  it('applies correct CSS classes', () => {
    render(
      <RouterWrapper>
        <BottomNavigation />
      </RouterWrapper>
    );

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('bottom-navigation');

    const navItems = screen.getAllByRole('link');
    navItems.forEach(item => {
      expect(item).toHaveClass('nav-item');
    });
  });
});