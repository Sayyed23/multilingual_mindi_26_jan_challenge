/**
 * ProfileForm Component Tests
 * Tests profile form validation, submission, and user interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ProfileForm from '../ProfileForm';
import { User, UserUpdate } from '../../types/user';

// Mock user data
const mockUser: User = {
  id: '1',
  phoneNumber: '+919876543210',
  name: 'John Doe',
  email: 'john@example.com',
  preferredLanguage: 'hi',
  userType: 'vendor',
  location: {
    latitude: 28.6139,
    longitude: 77.2090,
    address: '123 Main Street, New Delhi',
    pincode: '110001',
    state: 'Delhi',
    district: 'Central Delhi'
  },
  businessProfile: undefined,
  reputation: {
    overall: 4.5,
    punctuality: 4.2,
    communication: 4.8,
    productQuality: 4.3,
    totalTransactions: 25,
    reviewCount: 20,
    lastUpdated: new Date()
  },
  isVerified: true,
  isPhoneVerified: true,
  isBusinessVerified: false,
  profilePicture: undefined,
  createdAt: new Date(),
  lastActiveAt: new Date(),
  settings: {
    notifications: {
      deals: true,
      messages: true,
      priceAlerts: true,
      marketUpdates: true
    },
    privacy: {
      showPhoneNumber: false,
      showLocation: true,
      allowDirectMessages: true
    },
    language: {
      preferred: 'hi',
      fallback: 'en',
      autoTranslate: true
    }
  }
};

describe('ProfileForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly in create mode', () => {
    render(
      <ProfileForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByRole('heading', { name: 'Create Profile' })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/preferred language/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/pincode/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
  });

  it('renders form fields correctly in edit mode with user data', () => {
    render(
      <ProfileForm
        user={mockUser}
        mode="edit"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByRole('heading', { name: 'Edit Profile' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123 Main Street, New Delhi')).toBeInTheDocument();
    expect(screen.getByDisplayValue('110001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Delhi')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();

    render(
      <ProfileForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /create profile/i });
    await user.click(submitButton);

    // Debug: log the DOM to see what's happening
    screen.debug();

    // Wait for validation errors to appear
    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters long')).toBeInTheDocument();
    }, { timeout: 5000 });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates name field correctly', async () => {
    const user = userEvent.setup();

    render(
      <ProfileForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByLabelText(/full name/i);

    // Test short name
    await user.type(nameInput, 'A');
    await user.tab(); // Trigger blur to show validation

    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters long')).toBeInTheDocument();
    });

    // Test long name
    await user.clear(nameInput);
    await user.type(nameInput, 'A'.repeat(51));
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('Name must be less than 50 characters')).toBeInTheDocument();
    });

    // Test valid name
    await user.clear(nameInput);
    await user.type(nameInput, 'John Doe');
    await user.tab();

    await waitFor(() => {
      expect(screen.queryByText(/name must be/i)).not.toBeInTheDocument();
    });
  });

  it('validates email field correctly', async () => {
    const user = userEvent.setup();

    render(
      <ProfileForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const emailInput = screen.getByLabelText(/email address/i);

    // Test invalid email
    await user.type(emailInput, 'invalid-email');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });

    // Test valid email
    await user.clear(emailInput);
    await user.type(emailInput, 'john@example.com');
    await user.tab();

    await waitFor(() => {
      expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
    });
  });

  it('validates pincode field correctly', async () => {
    const user = userEvent.setup();

    render(
      <ProfileForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const pincodeInput = screen.getByLabelText(/pincode/i);

    // Test invalid pincode
    await user.type(pincodeInput, '12345');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('Pincode must be 6 digits')).toBeInTheDocument();
    });

    // Test valid pincode
    await user.clear(pincodeInput);
    await user.type(pincodeInput, '110001');
    await user.tab();

    await waitFor(() => {
      expect(screen.queryByText('Pincode must be 6 digits')).not.toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();

    render(
      <ProfileForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Fill in all required fields using more specific selectors
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
    await user.selectOptions(screen.getByLabelText(/preferred language/i), 'hi');
    const addressField = screen.getByPlaceholderText('Enter your complete address');
    await user.type(addressField, '123 Main Street, New Delhi');
    await user.type(screen.getByLabelText(/pincode/i), '110001');
    await user.selectOptions(screen.getByLabelText(/state/i), 'Delhi');

    const submitButton = screen.getByRole('button', { name: /create profile/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        preferredLanguage: 'hi',
        location: {
          address: '123 Main Street, New Delhi',
          pincode: '110001',
          state: 'Delhi',
          district: '',
          latitude: 0,
          longitude: 0
        }
      });
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ProfileForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('clears errors when user starts typing', async () => {
    const user = userEvent.setup();

    render(
      <ProfileForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Submit to trigger validation errors
    const submitButton = screen.getByRole('button', { name: /create profile/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters long')).toBeInTheDocument();
    });

    // Start typing in name field
    const nameInput = screen.getByLabelText(/full name/i);
    await user.type(nameInput, 'J');

    await waitFor(() => {
      expect(screen.queryByText('Name must be at least 2 characters long')).not.toBeInTheDocument();
    });
  });

  it('handles geolocation when "Use Current Location" is clicked', async () => {
    const user = userEvent.setup();

    // Mock geolocation
    const mockGeolocation = {
      getCurrentPosition: jest.fn((success) => {
        success({
          coords: {
            latitude: 28.6139,
            longitude: 77.2090
          }
        });
      })
    };

    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true
    });

    render(
      <ProfileForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const locationButton = screen.getByRole('button', { name: /use current location/i });
    await user.click(locationButton);

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
  });

  it('disables form when isLoading is true', () => {
    render(
      <ProfileForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={true}
      />
    );

    const submitButton = screen.getByRole('button', { name: /create profile/i });
    expect(submitButton).toBeDisabled();
  });

  it('shows loading state when submitting', async () => {
    const user = userEvent.setup();

    // Mock a slow submission
    const slowSubmit = jest.fn(() => new Promise<void>(resolve => setTimeout(resolve, 100)));

    render(
      <ProfileForm
        mode="create"
        onSubmit={slowSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Fill in required fields using more specific selectors
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    const addressField = screen.getByPlaceholderText('Enter your complete address');
    await user.type(addressField, '123 Main Street, New Delhi');
    await user.type(screen.getByLabelText(/pincode/i), '110001');
    await user.selectOptions(screen.getByLabelText(/state/i), 'Delhi');

    const submitButton = screen.getByRole('button', { name: /create profile/i });
    await user.click(submitButton);

    // Check for loading state
    expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
  });
});