/**
 * UserTypeSelector Component Tests
 * Tests user type selection functionality and interactions
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import UserTypeSelector from '../UserTypeSelector';
import { UserType } from '../../types/user';

describe('UserTypeSelector', () => {
  const mockOnTypeChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all user type options', () => {
    render(
      <UserTypeSelector
        selectedType="vendor"
        onTypeChange={mockOnTypeChange}
      />
    );

    expect(screen.getByText('What describes you best?')).toBeInTheDocument();
    expect(screen.getByText('Choose your role in the marketplace')).toBeInTheDocument();
    
    expect(screen.getByText('Vendor')).toBeInTheDocument();
    expect(screen.getByText('I want to sell agricultural products')).toBeInTheDocument();
    
    expect(screen.getByText('Buyer')).toBeInTheDocument();
    expect(screen.getByText('I want to buy agricultural products')).toBeInTheDocument();
    
    expect(screen.getByText('Both')).toBeInTheDocument();
    expect(screen.getByText('I want to both buy and sell products')).toBeInTheDocument();
  });

  it('displays vendor features correctly', () => {
    render(
      <UserTypeSelector
        selectedType="vendor"
        onTypeChange={mockOnTypeChange}
      />
    );

    expect(screen.getByText('List your products')).toBeInTheDocument();
    expect(screen.getByText('Manage inventory')).toBeInTheDocument();
    expect(screen.getByText('Receive orders')).toBeInTheDocument();
    expect(screen.getByText('Track sales')).toBeInTheDocument();
  });

  it('displays buyer features correctly', () => {
    render(
      <UserTypeSelector
        selectedType="buyer"
        onTypeChange={mockOnTypeChange}
      />
    );

    expect(screen.getByText('Browse products')).toBeInTheDocument();
    expect(screen.getByText('Compare prices')).toBeInTheDocument();
    expect(screen.getByText('Place orders')).toBeInTheDocument();
    expect(screen.getByText('Track purchases')).toBeInTheDocument();
  });

  it('displays both features correctly', () => {
    render(
      <UserTypeSelector
        selectedType="both"
        onTypeChange={mockOnTypeChange}
      />
    );

    expect(screen.getByText('All vendor features')).toBeInTheDocument();
    expect(screen.getByText('All buyer features')).toBeInTheDocument();
    expect(screen.getByText('Flexible trading')).toBeInTheDocument();
    expect(screen.getByText('Maximum opportunities')).toBeInTheDocument();
  });

  it('shows correct selection state', () => {
    render(
      <UserTypeSelector
        selectedType="vendor"
        onTypeChange={mockOnTypeChange}
      />
    );

    const vendorOption = screen.getByRole('radio', { name: 'vendor' });
    const buyerOption = screen.getByRole('radio', { name: 'buyer' });
    const bothOption = screen.getByRole('radio', { name: 'both' });

    expect(vendorOption).toBeChecked();
    expect(buyerOption).not.toBeChecked();
    expect(bothOption).not.toBeChecked();
  });

  it('calls onTypeChange when vendor option is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <UserTypeSelector
        selectedType="buyer"
        onTypeChange={mockOnTypeChange}
      />
    );

    const vendorOption = screen.getByText('Vendor').closest('.type-option');
    expect(vendorOption).toBeInTheDocument();
    
    await user.click(vendorOption!);

    expect(mockOnTypeChange).toHaveBeenCalledWith('vendor');
  });

  it('calls onTypeChange when buyer option is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <UserTypeSelector
        selectedType="vendor"
        onTypeChange={mockOnTypeChange}
      />
    );

    const buyerOption = screen.getByText('Buyer').closest('.type-option');
    expect(buyerOption).toBeInTheDocument();
    
    await user.click(buyerOption!);

    expect(mockOnTypeChange).toHaveBeenCalledWith('buyer');
  });

  it('calls onTypeChange when both option is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <UserTypeSelector
        selectedType="vendor"
        onTypeChange={mockOnTypeChange}
      />
    );

    const bothOption = screen.getByText('Both').closest('.type-option');
    expect(bothOption).toBeInTheDocument();
    
    await user.click(bothOption!);

    expect(mockOnTypeChange).toHaveBeenCalledWith('both');
  });

  it('calls onTypeChange when radio button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <UserTypeSelector
        selectedType="vendor"
        onTypeChange={mockOnTypeChange}
      />
    );

    const buyerRadio = screen.getByRole('radio', { name: 'buyer' });
    await user.click(buyerRadio);

    expect(mockOnTypeChange).toHaveBeenCalledWith('buyer');
  });

  it('shows special note for "both" selection', () => {
    render(
      <UserTypeSelector
        selectedType="both"
        onTypeChange={mockOnTypeChange}
      />
    );

    expect(screen.getByText(/choosing "both" gives you maximum flexibility/i)).toBeInTheDocument();
  });

  it('does not show special note for other selections', () => {
    render(
      <UserTypeSelector
        selectedType="vendor"
        onTypeChange={mockOnTypeChange}
      />
    );

    expect(screen.queryByText(/choosing "both" gives you maximum flexibility/i)).not.toBeInTheDocument();
  });

  it('disables interaction when disabled prop is true', async () => {
    const user = userEvent.setup();
    
    render(
      <UserTypeSelector
        selectedType="vendor"
        onTypeChange={mockOnTypeChange}
        disabled={true}
      />
    );

    const buyerOption = screen.getByText('Buyer').closest('.type-option');
    expect(buyerOption).toHaveClass('disabled');
    
    await user.click(buyerOption!);

    expect(mockOnTypeChange).not.toHaveBeenCalled();
  });

  it('disables radio buttons when disabled prop is true', () => {
    render(
      <UserTypeSelector
        selectedType="vendor"
        onTypeChange={mockOnTypeChange}
        disabled={true}
      />
    );

    const vendorRadio = screen.getByRole('radio', { name: 'vendor' });
    const buyerRadio = screen.getByRole('radio', { name: 'buyer' });
    const bothRadio = screen.getByRole('radio', { name: 'both' });

    expect(vendorRadio).toBeDisabled();
    expect(buyerRadio).toBeDisabled();
    expect(bothRadio).toBeDisabled();
  });

  it('applies selected class to the correct option', () => {
    render(
      <UserTypeSelector
        selectedType="buyer"
        onTypeChange={mockOnTypeChange}
      />
    );

    const vendorOption = screen.getByText('Vendor').closest('.type-option');
    const buyerOption = screen.getByText('Buyer').closest('.type-option');
    const bothOption = screen.getByText('Both').closest('.type-option');

    expect(vendorOption).not.toHaveClass('selected');
    expect(buyerOption).toHaveClass('selected');
    expect(bothOption).not.toHaveClass('selected');
  });

  it('renders with proper accessibility attributes', () => {
    render(
      <UserTypeSelector
        selectedType="vendor"
        onTypeChange={mockOnTypeChange}
      />
    );

    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons).toHaveLength(3);

    radioButtons.forEach(radio => {
      expect(radio).toHaveAttribute('name', 'userType');
    });
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(
      <UserTypeSelector
        selectedType="vendor"
        onTypeChange={mockOnTypeChange}
      />
    );

    const buyerRadio = screen.getByRole('radio', { name: 'buyer' });
    
    // Focus and press Enter/Space
    buyerRadio.focus();
    await user.keyboard('{Enter}');

    expect(mockOnTypeChange).toHaveBeenCalledWith('buyer');
  });
});