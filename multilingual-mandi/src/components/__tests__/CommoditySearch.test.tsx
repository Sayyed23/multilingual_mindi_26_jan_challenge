
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import CommoditySearch from '../CommoditySearch';
import { priceDiscoveryService } from '../../services/priceDiscovery';
import './setup';

// Mock the price discovery service
vi.mock('../../services/priceDiscovery', () => ({
  priceDiscoveryService: {
    getCurrentPrices: vi.fn(),
  }
}));

const mockPriceData = [
  {
    commodity: 'Rice',
    mandi: 'Delhi Mandi',
    price: 2500,
    unit: 'quintal',
    quality: 'premium' as const,
    timestamp: new Date(),
    source: 'Government'
  },
  {
    commodity: 'Rice',
    mandi: 'Mumbai Mandi',
    price: 2400,
    unit: 'quintal',
    quality: 'standard' as const,
    timestamp: new Date(),
    source: 'Private'
  }
];

describe('CommoditySearch', () => {
  const mockOnPricesFound = vi.fn();
  const mockOnLoading = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input and button', () => {
    render(
      <CommoditySearch
        onPricesFound={mockOnPricesFound}
        onLoading={mockOnLoading}
        onError={mockOnError}
      />
    );

    expect(screen.getByPlaceholderText(/search for commodities/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search prices/i })).toBeInTheDocument();
  });

  it('shows suggestions when typing', async () => {
    render(
      <CommoditySearch
        onPricesFound={mockOnPricesFound}
        onLoading={mockOnLoading}
        onError={mockOnError}
      />
    );

    const input = screen.getByPlaceholderText(/search for commodities/i);
    fireEvent.change(input, { target: { value: 'Ric' } });

    await waitFor(() => {
      expect(screen.getByText('Rice')).toBeInTheDocument();
    });
  });

  it('performs search when button is clicked', async () => {
    vi.mocked(priceDiscoveryService.getCurrentPrices).mockResolvedValue(mockPriceData);

    render(
      <CommoditySearch
        onPricesFound={mockOnPricesFound}
        onLoading={mockOnLoading}
        onError={mockOnError}
      />
    );

    const input = screen.getByPlaceholderText(/search for commodities/i);
    const searchButton = screen.getByRole('button', { name: /search prices/i });

    fireEvent.change(input, { target: { value: 'Rice' } });
    fireEvent.click(searchButton);

    expect(mockOnLoading).toHaveBeenCalledWith(true);

    await waitFor(() => {
      expect(priceDiscoveryService.getCurrentPrices).toHaveBeenCalledWith('Rice', undefined);
      expect(mockOnPricesFound).toHaveBeenCalledWith(mockPriceData);
      expect(mockOnLoading).toHaveBeenCalledWith(false);
    });
  });

  it('performs search when Enter key is pressed', async () => {
    vi.mocked(priceDiscoveryService.getCurrentPrices).mockResolvedValue(mockPriceData);

    render(
      <CommoditySearch
        onPricesFound={mockOnPricesFound}
        onLoading={mockOnLoading}
        onError={mockOnError}
      />
    );

    const input = screen.getByPlaceholderText(/search for commodities/i);
    fireEvent.change(input, { target: { value: 'Rice' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(priceDiscoveryService.getCurrentPrices).toHaveBeenCalledWith('Rice', undefined);
      expect(mockOnPricesFound).toHaveBeenCalledWith(mockPriceData);
    });
  });

  it('shows error when search fails', async () => {
    const errorMessage = 'Failed to fetch prices';
    vi.mocked(priceDiscoveryService.getCurrentPrices).mockRejectedValue(new Error(errorMessage));

    render(
      <CommoditySearch
        onPricesFound={mockOnPricesFound}
        onLoading={mockOnLoading}
        onError={mockOnError}
      />
    );

    const input = screen.getByPlaceholderText(/search for commodities/i);
    const searchButton = screen.getByRole('button', { name: /search prices/i });

    fireEvent.change(input, { target: { value: 'Rice' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(errorMessage);
      expect(mockOnLoading).toHaveBeenCalledWith(false);
    });
  });

  it('shows and hides filters panel', () => {
    render(
      <CommoditySearch
        onPricesFound={mockOnPricesFound}
        onLoading={mockOnLoading}
        onError={mockOnError}
      />
    );

    const filterButton = screen.getByRole('button', { name: '' }); // Filter button has no text
    fireEvent.click(filterButton);

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Quality Grade')).toBeInTheDocument();
  });

  it('applies quality filter correctly', async () => {
    vi.mocked(priceDiscoveryService.getCurrentPrices).mockResolvedValue(mockPriceData);

    render(
      <CommoditySearch
        onPricesFound={mockOnPricesFound}
        onLoading={mockOnLoading}
        onError={mockOnError}
      />
    );

    // Open filters
    const filterButton = screen.getByRole('button', { name: '' });
    fireEvent.click(filterButton);

    // Set quality filter
    const qualitySelect = screen.getByDisplayValue('All Grades');
    fireEvent.change(qualitySelect, { target: { value: 'premium' } });

    // Perform search
    const input = screen.getByPlaceholderText(/search for commodities/i);
    fireEvent.change(input, { target: { value: 'Rice' } });

    const searchButton = screen.getByRole('button', { name: /search prices/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      // Should only return premium quality prices
      const expectedFilteredPrices = mockPriceData.filter(price => price.quality === 'premium');
      expect(mockOnPricesFound).toHaveBeenCalledWith(expectedFilteredPrices);
    });
  });

  it('validates empty search input', async () => {
    render(
      <CommoditySearch
        onPricesFound={mockOnPricesFound}
        onLoading={mockOnLoading}
        onError={mockOnError}
      />
    );

    const input = screen.getByPlaceholderText(/search for commodities/i);
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Please enter a commodity name');
    });
  });

  it('clears filters when clear button is clicked', () => {
    render(
      <CommoditySearch
        onPricesFound={mockOnPricesFound}
        onLoading={mockOnLoading}
        onError={mockOnError}
      />
    );

    // Open filters
    const filterButton = screen.getByRole('button', { name: '' });
    fireEvent.click(filterButton);

    // Set a filter
    const qualitySelect = screen.getByDisplayValue('All Grades');
    fireEvent.change(qualitySelect, { target: { value: 'premium' } });

    // Clear filters
    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);

    // Quality should be reset
    expect(screen.getByDisplayValue('All Grades')).toBeInTheDocument();
  });
});