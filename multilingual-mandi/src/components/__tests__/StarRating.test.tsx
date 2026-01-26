/**
 * Unit tests for StarRating component
 * Tests rating display and interactive functionality
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StarRating from '../StarRating';

describe('StarRating Component', () => {
  it('renders correct number of stars', () => {
    render(<StarRating rating={3} maxRating={5} />);
    
    const stars = screen.getAllByRole('button');
    expect(stars).toHaveLength(5);
  });

  it('displays rating value when showValue is true', () => {
    render(<StarRating rating={4.5} showValue />);
    
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('displays review count when showCount is true', () => {
    render(<StarRating rating={4} showCount count={25} />);
    
    expect(screen.getByText('(25 reviews)')).toBeInTheDocument();
  });

  it('handles singular review count correctly', () => {
    render(<StarRating rating={4} showCount count={1} />);
    
    expect(screen.getByText('(1 review)')).toBeInTheDocument();
  });

  it('calls onChange when interactive star is clicked', () => {
    const handleChange = jest.fn();
    render(<StarRating rating={0} interactive onChange={handleChange} />);
    
    const thirdStar = screen.getAllByRole('button')[2];
    fireEvent.click(thirdStar);
    
    expect(handleChange).toHaveBeenCalledWith(3);
  });

  it('does not call onChange when not interactive', () => {
    const handleChange = jest.fn();
    render(<StarRating rating={0} onChange={handleChange} />);
    
    const thirdStar = screen.getAllByRole('button')[2];
    fireEvent.click(thirdStar);
    
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('does not call onChange when disabled', () => {
    const handleChange = jest.fn();
    render(<StarRating rating={0} interactive disabled onChange={handleChange} />);
    
    const thirdStar = screen.getAllByRole('button')[2];
    fireEvent.click(thirdStar);
    
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('shows hover rating when hovering over stars', () => {
    const handleChange = jest.fn();
    render(<StarRating rating={2} interactive showValue onChange={handleChange} />);
    
    const fourthStar = screen.getAllByRole('button')[3];
    fireEvent.mouseEnter(fourthStar);
    
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('resets to original rating when mouse leaves', () => {
    const handleChange = jest.fn();
    render(<StarRating rating={2} interactive showValue onChange={handleChange} />);
    
    const fourthStar = screen.getAllByRole('button')[3];
    fireEvent.mouseEnter(fourthStar);
    
    const container = screen.getByText('4').closest('.star-rating');
    fireEvent.mouseLeave(container!);
    
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('applies correct CSS classes for different sizes', () => {
    const { rerender } = render(<StarRating rating={3} size="small" showValue />);
    const container = screen.getByText('3').closest('.star-rating');
    expect(container).toHaveClass('small');
    
    rerender(<StarRating rating={3} size="large" showValue />);
    const largeContainer = screen.getByText('3').closest('.star-rating');
    expect(largeContainer).toHaveClass('large');
  });

  it('formats decimal ratings correctly', () => {
    render(<StarRating rating={3.7} showValue />);
    expect(screen.getByText('3.7')).toBeInTheDocument();
  });

  it('formats whole number ratings without decimals', () => {
    render(<StarRating rating={4.0} showValue />);
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<StarRating rating={0} interactive />);
    
    const stars = screen.getAllByRole('button');
    stars.forEach((star, index) => {
      expect(star).toHaveAttribute('aria-label', `Rate ${index + 1} star${index === 0 ? '' : 's'}`);
    });
  });

  it('applies custom className', () => {
    render(<StarRating rating={3} className="custom-rating" showValue />);
    const container = screen.getByText('3').closest('.star-rating');
    expect(container).toHaveClass('custom-rating');
  });
});