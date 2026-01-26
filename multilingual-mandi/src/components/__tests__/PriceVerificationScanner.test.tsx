/**
 * Unit tests for PriceVerificationScanner component
 * Tests price verification scanner functionality including input methods, verification logic, and results display
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PriceVerificationScanner from '../PriceVerificationScanner';
import { priceService } from '../../services/priceService';
import { PriceVerification, PriceTrend } from '../../types/price';

// Mock the price service
jest.mock('../../services/priceService');
const mockPriceService = priceService as jest.Mocked<typeof priceService>;

// Mock child components
jest.mock('../PriceComparisonChart', () => {
  return function MockPriceComparisonChart() {
    return <div data-testid="price-comparison-chart">Price Comparison Chart</div>;
  };
});

jest.mock('../HistoricalTrendDisplay', () => {
  return function MockHistoricalTrendDisplay() {
    return <div data-testid="historical-trend-display">Historical Trend Display</div>;
  };
});

jest.mock('../NegotiationStrategySuggestions', () => {
  return function MockNegotiationStrategySuggestions() {
    return <div data-testid="negotiation-strategies">Negotiation Strategies</div>;
  };
});

describe('PriceVerificationScanner', () => {
  const mockVerification: PriceVerification = {
    quotedPrice: 2300,
    marketPrice: 2200,
    deviation: {
      amount: 100,
      percentage: 4.5
    },
    verdict: 'fair',
    confidence: 0.85,
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

  const mockTrend: PriceTrend = {
    commodityId: 'wheat',
    period: '30d',
    dataPoints: [
      { date: new Date('2024-01-01'), price: 2100 },
      { date: new Date('2024-01-15'), price: 2150 },
      { date: new Date('2024-01-30'), price: 2200 }
    ],
    trend: 'rising',
    volatility: 0.05
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPriceService.verifyPriceQuote.mockResolvedValue(mockVerification);
    mockPriceService.getPriceTrend.mockResolvedValue(mockTrend);
  });

  it('renders scanner interface correctly', () => {
    render(<PriceVerificationScanner />);
    
    expect(screen.getByText('🔍 Price Verification Scanner')).toBeInTheDocument();
    expect(screen.getByText('Verify quoted prices against current market rates')).toBeInTheDocument();
    expect(screen.getByText('Input Method')).toBeInTheDocument();
    expect(screen.getByText('Select Commodity')).toBeInTheDocument();
    expect(screen.getByText('Enter Quoted Price')).toBeInTheDocument();
  });

  it('displays input method options', () => {
    render(<PriceVerificationScanner />);
    
    expect(screen.getByText('⌨️ Manual Entry')).toBeInTheDocument();
    expect(screen.getByText('📷 Scan Receipt')).toBeInTheDocument();
    expect(screen.getByText('🎤 Voice Input')).toBeInTheDocument();
  });

  it('displays common commodity options', () => {
    render(<PriceVerificationScanner />);
    
    expect(screen.getByText('Wheat')).toBeInTheDocument();
    expect(screen.getByText('Rice')).toBeInTheDocument();
    expect(screen.getByText('Onion')).toBeInTheDocument();
    expect(screen.getByText('Potato')).toBeInTheDocument();
  });

  it('handles commodity selection', () => {
    render(<PriceVerificationScanner />);
    
    const wheatButton = screen.getByText('Wheat');
    fireEvent.click(wheatButton);
    
    expect(wheatButton.closest('button')).toHaveClass('selected');
  });

  it('handles custom commodity input', () => {
    render(<PriceVerificationScanner />);
    
    const customInput = screen.getByPlaceholderText('Or enter custom commodity...');
    fireEvent.change(customInput, { target: { value: 'Barley' } });
    
    expect(customInput).toHaveValue('Barley');
  });

  it('handles price input', () => {
    render(<PriceVerificationScanner />);
    
    const priceInput = screen.getByPlaceholderText('Enter price per quintal');
    fireEvent.change(priceInput, { target: { value: '2300' } });
    
    expect(priceInput).toHaveValue(2300);
  });

  it('disables verify button when inputs are incomplete', () => {
    render(<PriceVerificationScanner />);
    
    const verifyButton = screen.getByText('🔍 Verify Price');
    expect(verifyButton).toBeDisabled();
  });

  it('enables verify button when inputs are complete', () => {
    render(<PriceVerificationScanner />);
    
    // Select commodity
    fireEvent.click(screen.getByText('Wheat'));
    
    // Enter price
    const priceInput = screen.getByPlaceholderText('Enter price per quintal');
    fireEvent.change(priceInput, { target: { value: '2300' } });
    
    const verifyButton = screen.getByText('🔍 Verify Price');
    expect(verifyButton).not.toBeDisabled();
  });

  it('performs price verification when verify button is clicked', async () => {
    render(<PriceVerificationScanner />);
    
    // Select commodity and enter price
    fireEvent.click(screen.getByText('Wheat'));
    const priceInput = screen.getByPlaceholderText('Enter price per quintal');
    fireEvent.change(priceInput, { target: { value: '2300' } });
    
    // Click verify
    const verifyButton = screen.getByText('🔍 Verify Price');
    fireEvent.click(verifyButton);
    
    await waitFor(() => {
      expect(mockPriceService.verifyPriceQuote).toHaveBeenCalledWith('wheat', 2300, undefined);
    });
  });

  it('displays verification results', async () => {
    render(<PriceVerificationScanner />);
    
    // Perform verification
    fireEvent.click(screen.getByText('Wheat'));
    const priceInput = screen.getByPlaceholderText('Enter price per quintal');
    fireEvent.change(priceInput, { target: { value: '2300' } });
    fireEvent.click(screen.getByText('🔍 Verify Price'));
    
    await waitFor(() => {
      expect(screen.getByText('Verification Result')).toBeInTheDocument();
      expect(screen.getByText('✅ FAIR')).toBeInTheDocument();
      expect(screen.getByText('₹2,300')).toBeInTheDocument();
      expect(screen.getByText('₹2,200')).toBeInTheDocument();
    });
  });

  it('displays child components after verification', async () => {
    render(<PriceVerificationScanner />);
    
    // Perform verification
    fireEvent.click(screen.getByText('Wheat'));
    const priceInput = screen.getByPlaceholderText('Enter price per quintal');
    fireEvent.change(priceInput, { target: { value: '2300' } });
    fireEvent.click(screen.getByText('🔍 Verify Price'));
    
    await waitFor(() => {
      expect(screen.getByTestId('price-comparison-chart')).toBeInTheDocument();
      expect(screen.getByTestId('historical-trend-display')).toBeInTheDocument();
      expect(screen.getByTestId('negotiation-strategies')).toBeInTheDocument();
    });
  });

  it('handles verification errors', async () => {
    mockPriceService.verifyPriceQuote.mockRejectedValue(new Error('Verification failed'));
    
    render(<PriceVerificationScanner />);
    
    // Perform verification
    fireEvent.click(screen.getByText('Wheat'));
    const priceInput = screen.getByPlaceholderText('Enter price per quintal');
    fireEvent.change(priceInput, { target: { value: '2300' } });
    fireEvent.click(screen.getByText('🔍 Verify Price'));
    
    await waitFor(() => {
      expect(screen.getByText('❌ Verification failed')).toBeInTheDocument();
    });
  });

  it('shows loading state during verification', async () => {
    // Mock a delayed response
    mockPriceService.verifyPriceQuote.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockVerification), 100))
    );
    
    render(<PriceVerificationScanner />);
    
    // Perform verification
    fireEvent.click(screen.getByText('Wheat'));
    const priceInput = screen.getByPlaceholderText('Enter price per quintal');
    fireEvent.change(priceInput, { target: { value: '2300' } });
    fireEvent.click(screen.getByText('🔍 Verify Price'));
    
    expect(screen.getByText('🔄 Verifying...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Verification Result')).toBeInTheDocument();
    });
  });

  it('handles close button when provided', () => {
    const mockOnClose = jest.fn();
    render(<PriceVerificationScanner onClose={mockOnClose} />);
    
    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles camera scan mode selection', () => {
    // Mock alert to avoid actual alert in tests
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<PriceVerificationScanner />);
    
    const cameraButton = screen.getByText('📷 Scan Receipt');
    fireEvent.click(cameraButton);
    
    expect(alertSpy).toHaveBeenCalledWith('Camera scanning not yet implemented. Please use manual entry.');
    
    alertSpy.mockRestore();
  });

  it('handles voice input mode selection', () => {
    // Mock alert to avoid actual alert in tests
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<PriceVerificationScanner />);
    
    const voiceButton = screen.getByText('🎤 Voice Input');
    fireEvent.click(voiceButton);
    
    expect(alertSpy).toHaveBeenCalledWith('Voice input not yet implemented. Please use manual entry.');
    
    alertSpy.mockRestore();
  });

  it('validates empty price input', async () => {
    render(<PriceVerificationScanner />);
    
    // Select commodity but don't enter price
    fireEvent.click(screen.getByText('Wheat'));
    
    const verifyButton = screen.getByText('🔍 Verify Price');
    // Button should be disabled because quotedPrice is empty
    expect(verifyButton).toBeDisabled();
  });

  it('validates missing commodity', async () => {
    render(<PriceVerificationScanner />);
    
    // Enter price but don't select commodity
    const priceInput = screen.getByPlaceholderText('Enter price per quintal');
    fireEvent.change(priceInput, { target: { value: '2300' } });
    
    const verifyButton = screen.getByText('🔍 Verify Price');
    // Button should be disabled because commodityId is empty
    expect(verifyButton).toBeDisabled();
  });

  it('accepts initial commodity props', () => {
    render(
      <PriceVerificationScanner 
        commodityId="rice" 
        commodityName="Rice" 
      />
    );
    
    const customInput = screen.getByPlaceholderText('Or enter custom commodity...');
    expect(customInput).toHaveValue('Rice');
  });

  it('displays confidence indicator correctly', async () => {
    render(<PriceVerificationScanner />);
    
    // Perform verification
    fireEvent.click(screen.getByText('Wheat'));
    const priceInput = screen.getByPlaceholderText('Enter price per quintal');
    fireEvent.change(priceInput, { target: { value: '2300' } });
    fireEvent.click(screen.getByText('🔍 Verify Price'));
    
    await waitFor(() => {
      expect(screen.getByText('85%')).toBeInTheDocument();
      expect(screen.getByText('Verification Confidence')).toBeInTheDocument();
    });
  });
});