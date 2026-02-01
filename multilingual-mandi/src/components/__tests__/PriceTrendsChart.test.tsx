import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import PriceTrendsChart from '../PriceTrendsChart';
import { priceDiscoveryService } from '../../services/priceDiscovery';
import './setup';

// Mock the price discovery service
vi.mock('../../services/priceDiscovery', () => ({
  priceDiscoveryService: {
    getHistoricalPrices: vi.fn(),
    getPriceTrends: vi.fn(),
  }
}));

const mockPriceHistory = {
  commodity: 'Rice',
  location: { state: '', district: '', city: '', pincode: '' },
  data: [
    { date: new Date('2024-01-01'), price: 2400 },
    { date: new Date('2024-01-02'), price: 2450 },
    { date: new Date('2024-01-03'), price: 2500 },
    { date: new Date('2024-01-04'), price: 2480 },
    { date: new Date('2024-01-05'), price: 2520 },
  ]
};

const mockPriceTrend = {
  commodity: 'Rice',
  trend: 'rising' as const,
  changePercent: 5.2,
  timeframe: '30 days'
};

describe('PriceTrendsChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(priceDiscoveryService.getHistoricalPrices).mockResolvedValue(mockPriceHistory);
    vi.mocked(priceDiscoveryService.getPriceTrends).mockResolvedValue(mockPriceTrend);
  });

  it('renders loading state initially', () => {
    render(<PriceTrendsChart commodity="Rice" />);

    expect(screen.getByText('Loading trend data...')).toBeInTheDocument();
  });

  it('displays price trends chart when data loads', async () => {
    render(<PriceTrendsChart commodity="Rice" />);

    await waitFor(() => {
      expect(screen.getByText('Price Trends')).toBeInTheDocument();
      expect(screen.getByText(/rising.*Trend/i)).toBeInTheDocument();
      expect(screen.getByText('+5.2%')).toBeInTheDocument();
    });
  });

  it('displays timeframe selector', async () => {
    render(<PriceTrendsChart commodity="Rice" />);

    await waitFor(() => {
      expect(screen.getByText('7D')).toBeInTheDocument();
      expect(screen.getByText('30D')).toBeInTheDocument();
      expect(screen.getByText('90D')).toBeInTheDocument();
    });
  });

  it('changes timeframe when selector is clicked', async () => {
    render(<PriceTrendsChart commodity="Rice" />);

    await waitFor(() => {
      const sevenDayButton = screen.getByText('7D');
      fireEvent.click(sevenDayButton);
    });

    // Should call the service with new date range
    expect(priceDiscoveryService.getHistoricalPrices).toHaveBeenCalledTimes(2); // Initial + after click
  });

  it('displays chart data summary', async () => {
    render(<PriceTrendsChart commodity="Rice" />);

    await waitFor(() => {
      expect(screen.getByText('Highest')).toBeInTheDocument();
      expect(screen.getByText('Average')).toBeInTheDocument();
      expect(screen.getByText('Lowest')).toBeInTheDocument();
      expect(screen.getAllByText('₹2,520')).toHaveLength(2); // Chart and summary
      expect(screen.getAllByText('₹2,400')).toHaveLength(2); // Chart and summary
    });
  });

  it('displays trend icon correctly for rising trend', async () => {
    render(<PriceTrendsChart commodity="Rice" />);

    await waitFor(() => {
      expect(screen.getByText(/rising.*Trend/i)).toBeInTheDocument();
    });
  });

  it('displays trend icon correctly for falling trend', async () => {
    const fallingTrend = { ...mockPriceTrend, trend: 'falling' as const, changePercent: -3.2 };
    vi.mocked(priceDiscoveryService.getPriceTrends).mockResolvedValue(fallingTrend);

    render(<PriceTrendsChart commodity="Rice" />);

    await waitFor(() => {
      expect(screen.getByText(/falling.*Trend/i)).toBeInTheDocument();
      expect(screen.getByText('-3.2%')).toBeInTheDocument();
    });
  });

  it('displays trend icon correctly for stable trend', async () => {
    const stableTrend = { ...mockPriceTrend, trend: 'stable' as const, changePercent: 0.1 };
    vi.mocked(priceDiscoveryService.getPriceTrends).mockResolvedValue(stableTrend);

    render(<PriceTrendsChart commodity="Rice" />);

    await waitFor(() => {
      expect(screen.getByText(/stable.*Trend/i)).toBeInTheDocument();
      expect(screen.getByText('+0.1%')).toBeInTheDocument();
    });
  });

  it('handles error state gracefully', async () => {
    vi.mocked(priceDiscoveryService.getHistoricalPrices).mockRejectedValue(new Error('Failed to load data'));

    render(<PriceTrendsChart commodity="Rice" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load data')).toBeInTheDocument();
    });
  });

  it('displays no data message when historical data is empty', async () => {
    const emptyHistory = { ...mockPriceHistory, data: [] };
    vi.mocked(priceDiscoveryService.getHistoricalPrices).mockResolvedValue(emptyHistory);

    render(<PriceTrendsChart commodity="Rice" />);

    await waitFor(() => {
      expect(screen.getByText('No Historical Data')).toBeInTheDocument();
      expect(screen.getByText('Historical price data is not available for this commodity and timeframe.')).toBeInTheDocument();
    });
  });

  it('does not load data when commodity is empty', () => {
    render(<PriceTrendsChart commodity="" />);

    expect(priceDiscoveryService.getHistoricalPrices).not.toHaveBeenCalled();
    expect(priceDiscoveryService.getPriceTrends).not.toHaveBeenCalled();
  });

  it('reloads data when commodity changes', async () => {
    const { rerender } = render(<PriceTrendsChart commodity="Rice" />);

    await waitFor(() => {
      expect(priceDiscoveryService.getHistoricalPrices).toHaveBeenCalledWith('Rice', expect.any(Object));
    });

    // Change commodity
    rerender(<PriceTrendsChart commodity="Wheat" />);

    await waitFor(() => {
      expect(priceDiscoveryService.getHistoricalPrices).toHaveBeenCalledWith('Wheat', expect.any(Object));
    });
  });

  it('formats prices correctly in chart summary', async () => {
    render(<PriceTrendsChart commodity="Rice" />);

    await waitFor(() => {
      // Check for Indian currency formatting - use getAllByText for multiple occurrences
      expect(screen.getAllByText('₹2,520')).toHaveLength(2); // Chart and summary
      expect(screen.getAllByText('₹2,400')).toHaveLength(2); // Chart and summary
      expect(screen.getByText('₹2,470')).toBeInTheDocument(); // Average (only in summary)
    });
  });

  it('renders SVG chart when data is available', async () => {
    render(<PriceTrendsChart commodity="Rice" />);

    await waitFor(() => {
      // Look for the SVG element directly
      const svgElement = document.querySelector('svg');
      expect(svgElement).toBeInTheDocument();
    });
  });
});