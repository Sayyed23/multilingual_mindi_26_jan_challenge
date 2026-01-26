import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../Home';

describe('Unit: Home Page Component', () => {
  it('renders the page header', () => {
    render(<Home />);
    
    expect(screen.getByText('मंडी')).toBeInTheDocument();
    expect(screen.getByText('Welcome to Multilingual Mandi')).toBeInTheDocument();
  });

  it('renders all feature cards', () => {
    render(<Home />);
    
    expect(screen.getByText('Real-time Prices')).toBeInTheDocument();
    expect(screen.getByText('Multilingual Chat')).toBeInTheDocument();
    expect(screen.getByText('Smart Negotiations')).toBeInTheDocument();
    expect(screen.getByText('Deal Management')).toBeInTheDocument();
  });

  it('renders feature descriptions', () => {
    render(<Home />);
    
    expect(screen.getByText('Get current market prices from 100+ mandis')).toBeInTheDocument();
    expect(screen.getByText('Communicate in 22+ Indian languages')).toBeInTheDocument();
    expect(screen.getByText('AI-powered negotiation assistance')).toBeInTheDocument();
    expect(screen.getByText('Track your deals and transactions')).toBeInTheDocument();
  });

  it('has correct page structure', () => {
    render(<Home />);
    
    const pageContainer = screen.getByText('मंडी').closest('.page-container');
    expect(pageContainer).toBeInTheDocument();
    
    const featureGrid = screen.getByText('Real-time Prices').closest('.feature-grid');
    expect(featureGrid).toBeInTheDocument();
  });
});