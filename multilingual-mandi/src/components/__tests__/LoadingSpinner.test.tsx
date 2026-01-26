import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingSpinner from '../LoadingSpinner';

describe('Unit: LoadingSpinner Component', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('status', { hidden: true })).toHaveClass('loading-container', 'medium');
  });

  it('renders with custom message', () => {
    const customMessage = 'Please wait...';
    render(<LoadingSpinner message={customMessage} />);
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="small" />);
    expect(screen.getByRole('status', { hidden: true })).toHaveClass('loading-container', 'small');

    rerender(<LoadingSpinner size="large" />);
    expect(screen.getByRole('status', { hidden: true })).toHaveClass('loading-container', 'large');
  });

  it('renders without message when message is empty', () => {
    render(<LoadingSpinner message="" />);
    
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
  });

  it('contains spinner element', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('status', { hidden: true }).querySelector('.spinner');
    expect(spinner).toBeInTheDocument();
  });
});