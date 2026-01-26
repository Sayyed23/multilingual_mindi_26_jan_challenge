/**
 * Unit tests for PriceAnalysis component
 * Tests price analysis functionality including range calculation, trend analysis, and verification
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import PriceAnalysis from '../PriceAnalysis';
import { priceService } from '../../services/priceService';
import { PriceRange, PriceTrend, PriceVerification } from '../../types/price';

// Mock the price service
jest.mock('../../services/priceService');
const mockPriceService = priceService as jest.Mocked<typeof priceService>;

describe('PriceAnalysis', () => {
  const mockProps = {
    commodityId: 'wheat',
    commodityName: 'Wheat',
    onClose: jest.fn()
  };

  const mockPriceRange: PriceRange = {
    min: 2000,
    max: 2400,
    average: 2200,
    median: 2180,
    standardDeviation: 120,
    fairPriceRange: {
      lower: 2080,
      upper: 2320,
      confidence: 0.85
    },
    confidenceInterval: {
      lower: 2150,
      upper: 2250,
      level: 0.95
    },
    sampleSize: 25,
    lastUpdated: new Date()
  };

  const mockPriceTrend: PriceTrend = {
    commodityId: 'wheat',
    period: '30d',
    dataPoints: [
      { date: new Date('2024-01-01'), price: 2100 },
      { date: new Date('2024-01-15'), price: 2150 },
      { date: new Date('2024-01-30'), price: 2200 }
    ],
    trend: 'rising',
    volatility: 0.08,
    forecast: {
      nextWeek: 2220,
      nextMonth: 2280,
      confidence: 0.75
    },
    seasonalPattern: {
      peakMonths: [4, 5, 6],
      lowMonths: [10, 11, 12]
    }
  };

  const mockVerification: PriceVerification = {
    quotedPrice: 2300,
    marketPrice: 2200,
    deviation: {
      amount: 100,
      percentage: 4.55
    },
    verdict: 'fair',
    confidence: 0.8,
    comparableMarkets: [
      {
        commodity: 'Wheat',
        commodityId: 'wheat',
        price: 2180,
        unit: 'quintal',
        location: 'Delhi Mandi',
        source: 'agmarknet',
        timestamp: new Date(),
        confidence: 0.9,
        marketTrend: 'stable',
        priceChange: { amount: 0, percentage: 0, period: '24h' }
      }
    ],
    negotiationSuggestion: 'Price is fair and within market range.',
    lastUpdated: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPriceService.getPriceRange.mockResolvedValue(mockPriceRange);
    mockPriceService.getPriceTrend.mockResolvedValue(mockPriceTrend);
    mockPriceService.verifyPriceQuote.mockResolvedValue(mockVerification);
  });

  it('should render loading state initially', () => {
    act(() => {
      render(<PriceAnalysis {...mockProps} />);
    });
    
    expect(screen.getByText('Loading price analysis...')).toBeInTheDocument();
  });

  it('should display price range analysis after loading', async () => {
    await act(async () => {
      render(<PriceAnalysis {...mockProps} />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Wheat - Price Analysis')).toBeInTheDocument();
    });

    // Check if price range data is displayed
    expect(screen.getByText('Price Range Summary')).toBeInTheDocument();
    expect(screen.getByText('₹2,200')).toBeInTheDocument(); // Average price
    expect(screen.getByText('₹2,180')).toBeInTheDocument(); // Median price
    expect(screen.getByText('25 markets')).toBeInTheDocument(); // Sample size
  });

  it('should display fair price range with confidence', async () => {
    render(<PriceAnalysis {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Fair Price Range')).toBeInTheDocument();
    });

    expect(screen.getByText('Fair: ₹2,080 - ₹2,320')).toBeInTheDocument();
    expect(screen.getByText('Confidence: 85%')).toBeInTheDocument();
  });

  it('should display confidence interval when available', async () => {
    render(<PriceAnalysis {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Statistical Confidence Interval')).toBeInTheDocument();
    });

    expect(screen.getByText(/95% confidence that the true average price is between/)).toBeInTheDocument();
    expect(screen.getByText('₹2,150')).toBeInTheDocument();
    expect(screen.getByText('₹2,250')).toBeInTheDocument();
  });

  it('should switch to trend analysis tab', async () => {
    render(<PriceAnalysis {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Wheat - Price Analysis')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Trend Analysis'));
    
    expect(screen.getByText('Trend Analysis (30d)')).toBeInTheDocument();
    expect(screen.getByText('Market Trend: rising')).toBeInTheDocument();
    expect(screen.getByText('Volatility: 8%')).toBeInTheDocument();
  });

  it('should display price forecast when available', async () => {
    render(<PriceAnalysis {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Wheat - Price Analysis')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Trend Analysis'));
    
    expect(screen.getByText('Price Forecast')).toBeInTheDocument();
    expect(screen.getByText('₹2,220')).toBeInTheDocument(); // Next week
    expect(screen.getByText('₹2,280')).toBeInTheDocument(); // Next month
    expect(screen.getByText('Forecast Confidence: 75%')).toBeInTheDocument();
  });

  it('should display seasonal pattern information', async () => {
    await act(async () => {
      render(<PriceAnalysis {...mockProps} />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Wheat - Price Analysis')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Trend Analysis'));
    });
    
    expect(screen.getByText('Seasonal Pattern')).toBeInTheDocument();
    expect(screen.getByText(/Peak Months:/)).toBeInTheDocument();
    expect(screen.getByText(/4, 5, 6/)).toBeInTheDocument();
    expect(screen.getByText(/Low Months:/)).toBeInTheDocument();
    expect(screen.getByText(/10, 11, 12/)).toBeInTheDocument();
  });

  it('should handle price quote verification', async () => {
    await act(async () => {
      render(<PriceAnalysis {...mockProps} />);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Wheat - Price Analysis')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Price Verification'));
    });
    
    const priceInput = screen.getByPlaceholderText('Enter quoted price');
    
    await act(async () => {
      fireEvent.change(priceInput, { target: { value: '2300' } });
    });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Verify Price'));
    });
    
    await waitFor(() => {
      expect(screen.getByText('Verification Result')).toBeInTheDocument();
    });

    expect(screen.getByText('FAIR')).toBeInTheDocument();
    expect(screen.getByText(/Deviation:/)).toBeInTheDocument();
    expect(screen.getByText(/\+₹100/)).toBeInTheDocument();
    expect(screen.getByText(/Market Price:/)).toBeInTheDocument();
    expect(screen.getByText(/₹2,200/)).toBeInTheDocument();
    expect(screen.getByText('Price is fair and within market range.')).toBeInTheDocument();
  });

  it('should display comparable markets in verification', async () => {
    render(<PriceAnalysis {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Wheat - Price Analysis')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Price Verification'));
    
    const priceInput = screen.getByPlaceholderText('Enter quoted price');
    fireEvent.change(priceInput, { target: { value: '2300' } });
    
    fireEvent.click(screen.getByText('Verify Price'));
    
    await waitFor(() => {
      expect(screen.getByText('Comparable Markets (1)')).toBeInTheDocument();
    });

    expect(screen.getByText('Delhi Mandi')).toBeInTheDocument();
    expect(screen.getByText('₹2,180')).toBeInTheDocument();
  });

  it('should handle close button click', async () => {
    render(<PriceAnalysis {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Wheat - Price Analysis')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('×'));
    
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should handle API errors gracefully', async () => {
    mockPriceService.getPriceRange.mockRejectedValue(new Error('API Error'));
    mockPriceService.getPriceTrend.mockRejectedValue(new Error('API Error'));
    
    render(<PriceAnalysis {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Analysis Error')).toBeInTheDocument();
    });

    expect(screen.getByText('API Error')).toBeInTheDocument();
  });

  it('should handle verification errors', async () => {
    mockPriceService.verifyPriceQuote.mockRejectedValue(new Error('Verification failed'));
    
    render(<PriceAnalysis {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Wheat - Price Analysis')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Price Verification'));
    
    const priceInput = screen.getByPlaceholderText('Enter quoted price');
    fireEvent.change(priceInput, { target: { value: '2300' } });
    
    fireEvent.click(screen.getByText('Verify Price'));
    
    // The error should be handled internally and not crash the component
    await waitFor(() => {
      expect(screen.getByText('Verify Price Quote')).toBeInTheDocument();
    });
  });

  it('should not verify invalid price inputs', async () => {
    render(<PriceAnalysis {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Wheat - Price Analysis')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Price Verification'));
    
    const priceInput = screen.getByPlaceholderText('Enter quoted price');
    fireEvent.change(priceInput, { target: { value: 'invalid' } });
    
    fireEvent.click(screen.getByText('Verify Price'));
    
    // Should not call the verification service with invalid input
    expect(mockPriceService.verifyPriceQuote).not.toHaveBeenCalled();
  });

  it('should format prices correctly in Indian currency format', async () => {
    render(<PriceAnalysis {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Wheat - Price Analysis')).toBeInTheDocument();
    });

    // Check that prices are formatted with ₹ symbol and Indian number format
    expect(screen.getByText('₹2,200')).toBeInTheDocument();
    expect(screen.getByText('₹2,000 - ₹2,400')).toBeInTheDocument();
  });

  it('should display trend icons correctly', async () => {
    render(<PriceAnalysis {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Wheat - Price Analysis')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Trend Analysis'));
    
    // Check for trend icon (rising trend should show 📈)
    expect(screen.getByText('📈')).toBeInTheDocument();
  });
});