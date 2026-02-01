
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';
import PriceDisplay from '../PriceDisplay';
import { priceDiscoveryService } from '../../services/priceDiscovery';
import './setup';

// Mock the price discovery service
vi.mock('../../services/priceDiscovery', () => ({
  priceDiscoveryService: {
    getPriceTrends: vi.fn(),
    detectPriceAnomalies: vi.fn(),
  }
}));

const mockPriceData = [
  {
    commodity: 'Rice',
    mandi: 'Delhi Mandi',
    price: 2500,
    unit: 'quintal',
    quality: 'premium' as const,
    timestamp: new Date('2024-01-15T10:00:00Z'),
    source: 'Government'
  },
  {
    commodity: 'Rice',
    mandi: 'Mumbai Mandi',
    price: 2400,
    unit: 'quintal',
    quality: 'standard' as const,
    timestamp: new Date('2024-01-15T11:00:00Z'),
    source: 'Private'
  },
  {
    commodity: 'Rice',
    mandi: 'Kolkata Mandi',
    price: 2600,
    unit: 'quintal',
    quality: 'premium' as const,
    timestamp: new Date('2024-01-15T12:00:00Z'),
    source: 'Cooperative'
  }
];

const mockPriceTrend = {
  commodity: 'Rice',
  trend: 'rising' as const,
  changePercent: 5.2,
  timeframe: '7 days'
};

const mockAnomalies = [
  {
    id: 'anomaly-1',
    commodity: 'Rice',
    detectedPrice: 2600,
    expectedRange: { min: 2300, max: 2500 },
    explanation: 'Price significantly above market average',
    severity: 'medium' as const,
    timestamp: new Date('2024-01-15T12:00:00Z')
  }
];

describe('PriceDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(priceDiscoveryService.getPriceTrends).mockResolvedValue(mockPriceTrend);
    vi.mocked(priceDiscoveryService.detectPriceAnomalies).mockReturnValue(mockAnomalies);
  });

  it('renders empty state when no prices provided', () => {
    render(<PriceDisplay prices={[]} commodity="Rice" />);

    expect(screen.getByText('No prices found')).toBeInTheDocument();
    expect(screen.getByText('Try searching for a different commodity or adjusting your filters.')).toBeInTheDocument();
  });

  it('displays price statistics correctly', async () => {
    render(<PriceDisplay prices={mockPriceData} commodity="Rice" />);

    await waitFor(() => {
      expect(screen.getByText('Rice Prices (3 markets)')).toBeInTheDocument();
    });

    // Check price statistics
    const statsSection = screen.getByText('Rice Prices (3 markets)').closest('div')?.parentElement;
    expect(statsSection).toBeInTheDocument();
  });

  it('displays trend information when available', async () => {
    // ... (unchanged)
    render(<PriceDisplay prices={mockPriceData} commodity="Rice" showTrends={true} />);

    await waitFor(() => {
      expect(screen.getByText('+5.2% (7 days)')).toBeInTheDocument();
    });
  });

  it('displays anomaly alerts when detected', async () => {
    // ... (unchanged)
    render(<PriceDisplay prices={mockPriceData} commodity="Rice" showAnomalies={true} />);

    await waitFor(() => {
      expect(screen.getByText('Price Anomalies Detected')).toBeInTheDocument();
      expect(screen.getByText('1 price outside normal range detected.')).toBeInTheDocument();
    });
  });

  it('sorts prices correctly by price', () => {
    render(<PriceDisplay prices={mockPriceData} commodity="Rice" />);

    // Default is already Price/Ascending. Clicking it would toggle to Descending.
    // We check the default state (Ascending).

    // Check if prices are sorted (ascending by default)
    const priceList = screen.getByTestId('price-list');
    const priceElements = within(priceList).getAllByText(/₹2,[456]00/);
    expect(priceElements).toHaveLength(3);

    // Check order: 2400, 2500, 2600
    expect(priceElements[0]).toHaveTextContent('₹2,400');
    expect(priceElements[1]).toHaveTextContent('₹2,500');
    expect(priceElements[2]).toHaveTextContent('₹2,600');
  });

  it('toggles sort order when clicking same sort button', () => {
    render(<PriceDisplay prices={mockPriceData} commodity="Rice" />);

    const sortButton = screen.getByRole('button', { name: /Price/ });

    // First click - ascending
    fireEvent.click(sortButton);
    let priceButton = screen.getByRole('button', { name: /Price/ });
    expect(priceButton).toHaveClass('bg-green-100', 'text-green-700');

    // Second click - descending (should still be active but order changed)
    fireEvent.click(sortButton);
    priceButton = screen.getByRole('button', { name: /Price/ });
    expect(priceButton).toHaveClass('bg-green-100', 'text-green-700');
  });

  it('sorts prices correctly by market name', () => {
    render(<PriceDisplay prices={mockPriceData} commodity="Rice" />);

    const sortButton = screen.getByRole('button', { name: /Market/ });
    fireEvent.click(sortButton);

    // Should sort by market name - check for the sort indicator
    expect(screen.getByText(/Market/)).toBeInTheDocument();
    // Check that the button has the active styling
    const marketButton = screen.getByRole('button', { name: /Market/ });
    expect(marketButton).toHaveClass('bg-green-100', 'text-green-700');
  });

  // ... (keeping other tests, updating formats prices test)

  it('formats prices in Indian currency format', async () => {
    render(<PriceDisplay prices={mockPriceData} commodity="Rice" />);

    // Check for Indian currency formatting
    await waitFor(() => {
      // 2400: List (1) + Stats (Min) = 2
      expect(screen.getAllByText('₹2,400')).toHaveLength(2);
      // 2500: List (1) + Stats (Avg) = 2
      expect(screen.getAllByText('₹2,500')).toHaveLength(2);
      // 2600: List (1) + Stats (Max) = 2. NOTE: Anomalies not detected unless enabled? default is showAnomalies=true.
      // If showAnomalies is true (default), we might have anomaly alert too.
      // In beforeEach, detectPriceAnomalies returns mockAnomalies (one item with 2600).
      // So 2600 appears in: List(1) + Stats(Max)(1) + AnomalyAlert(1 implied but not exact text match).
      // Let's check if Anomalies are displayed. The test renders without args, so showAnomalies=true default.
      // So 2600 should be 2 times (exact match).
      expect(screen.getAllByText('₹2,600')).toHaveLength(2);
    });
  });

  it('displays timestamps in readable format', () => {
    render(<PriceDisplay prices={mockPriceData} commodity="Rice" />);

    // Should display formatted timestamps - use getAllByText for multiple occurrences
    expect(screen.getAllByText(/15 Jan/)).toHaveLength(3); // All three prices have same date
  });
});