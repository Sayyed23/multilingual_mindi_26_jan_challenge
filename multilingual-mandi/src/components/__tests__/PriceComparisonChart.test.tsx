/**
 * Unit tests for PriceComparisonChart component
 * Tests price comparison visualization and market data display
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PriceComparisonChart from '../PriceComparisonChart';
import { PriceData } from '../../types/price';

describe('PriceComparisonChart', () => {
  const mockComparableMarkets: PriceData[] = [
    {
      commodity: 'Wheat',
      commodityId: 'wheat',
      price: 2180,
      unit: 'quintal',
      location: 'Delhi Mandi, Delhi',
      source: 'agmarknet',
      timestamp: new Date(),
      confidence: 0.9,
      marketTrend: 'stable',
      priceChange: { amount: 0, percentage: 0, period: '24h' }
    },
    {
      commodity: 'Wheat',
      commodityId: 'wheat',
      price: 2220,
      unit: 'quintal',
      location: 'Mumbai APMC, Maharashtra',
      source: 'vendor_submission',
      timestamp: new Date(),
      confidence: 0.8,
      marketTrend: 'rising',
      priceChange: { amount: 20, percentage: 0.9, period: '24h' }
    },
    {
      commodity: 'Wheat',
      commodityId: 'wheat',
      price: 2250,
      unit: 'quintal',
      location: 'Bangalore Market, Karnataka',
      source: 'agmarknet',
      timestamp: new Date(),
      confidence: 0.85,
      marketTrend: 'stable',
      priceChange: { amount: 0, percentage: 0, period: '24h' }
    }
  ];

  const defaultProps = {
    quotedPrice: 2300,
    marketPrice: 2200,
    comparableMarkets: mockComparableMarkets
  };

  it('renders chart header correctly', () => {
    render(<PriceComparisonChart {...defaultProps} />);
    
    expect(screen.getByText('📊 Price Comparison')).toBeInTheDocument();
    expect(screen.getByText('Compare quoted price with 3 nearby markets')).toBeInTheDocument();
  });

  it('displays quoted price bar', () => {
    render(<PriceComparisonChart {...defaultProps} />);
    
    expect(screen.getAllByText('Your Quote')).toHaveLength(2); // bar-label and legend
    expect(screen.getAllByText('₹2,300')).toHaveLength(2); // bar-price and summary
  });

  it('displays market average bar', () => {
    render(<PriceComparisonChart {...defaultProps} />);
    
    expect(screen.getByText('Market Average')).toBeInTheDocument();
    expect(screen.getAllByText('₹2,200')).toHaveLength(1); // Only in bar-price
  });

  it('displays comparable market bars', () => {
    render(<PriceComparisonChart {...defaultProps} />);
    
    expect(screen.getAllByText('Delhi Mandi')).toHaveLength(2); // bar-label and bar-value
    expect(screen.getAllByText('Mumbai APMC')).toHaveLength(2); // bar-label and bar-value
    expect(screen.getAllByText('Bangalore Market')).toHaveLength(2); // bar-label and bar-value
    expect(screen.getAllByText('₹2,180')).toHaveLength(2); // bar-price and summary
    expect(screen.getAllByText('₹2,220')).toHaveLength(1); // Only in bar-price
    expect(screen.getAllByText('₹2,250')).toHaveLength(1); // Only in bar-price
  });

  it('displays confidence levels for markets', () => {
    render(<PriceComparisonChart {...defaultProps} />);
    
    expect(screen.getByText('90% confidence')).toBeInTheDocument();
    expect(screen.getByText('80% confidence')).toBeInTheDocument();
    expect(screen.getByText('85% confidence')).toBeInTheDocument();
  });

  it('displays data sources', () => {
    render(<PriceComparisonChart {...defaultProps} />);
    
    expect(screen.getAllByText('agmarknet')).toHaveLength(2); // Two markets have agmarknet source
    expect(screen.getAllByText('vendor_submission')).toHaveLength(1);
  });

  it('displays price range indicator', () => {
    render(<PriceComparisonChart {...defaultProps} />);
    
    // Should show min and max prices from all data
    const allPrices = [2300, 2200, ...mockComparableMarkets.map(m => m.price)];
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    
    expect(screen.getAllByText(`₹${minPrice.toLocaleString('en-IN')}`)).toHaveLength(2); // bar-price and summary
    expect(screen.getAllByText(`₹${maxPrice.toLocaleString('en-IN')}`)).toHaveLength(2); // bar-price and summary
  });

  it('displays chart legend', () => {
    render(<PriceComparisonChart {...defaultProps} />);
    
    // Check that legend items exist by looking for the legend container
    const legendContainer = screen.getByText('Fair Price').closest('.chart-legend');
    expect(legendContainer).toBeInTheDocument();
    
    // Verify all legend items are present
    expect(screen.getAllByText('Fair Price')).toHaveLength(1); // Only in legend
    expect(screen.getAllByText('Above Average')).toHaveLength(1);
    expect(screen.getAllByText('High Price')).toHaveLength(1);
    expect(screen.getAllByText('Below Average')).toHaveLength(1);
  });

  it('displays summary statistics', () => {
    render(<PriceComparisonChart {...defaultProps} />);
    
    expect(screen.getByText('Lowest Price')).toBeInTheDocument();
    expect(screen.getByText('Highest Price')).toBeInTheDocument();
    expect(screen.getByText('Price Spread')).toBeInTheDocument();
    expect(screen.getByText('Markets Compared')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // Number of markets
  });

  it('calculates price spread correctly', () => {
    render(<PriceComparisonChart {...defaultProps} />);
    
    const allPrices = [2300, 2200, ...mockComparableMarkets.map(m => m.price)];
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const spread = maxPrice - minPrice;
    
    expect(screen.getByText(`₹${spread.toLocaleString('en-IN')}`)).toBeInTheDocument();
  });

  it('limits displayed markets to 5', () => {
    const manyMarkets = Array.from({ length: 10 }, (_, i) => ({
      ...mockComparableMarkets[0],
      location: `Market ${i + 1}, State ${i + 1}`,
      price: 2000 + i * 10
    }));

    render(
      <PriceComparisonChart 
        {...defaultProps} 
        comparableMarkets={manyMarkets}
      />
    );
    
    expect(screen.getByText('Compare quoted price with 10 nearby markets')).toBeInTheDocument();
    
    // Should only display first 5 markets - check for bar-label specifically
    expect(screen.getAllByText('Market 1')).toHaveLength(2); // bar-label and bar-value
    expect(screen.getAllByText('Market 5')).toHaveLength(2); // bar-label and bar-value
    expect(screen.queryByText('Market 6')).not.toBeInTheDocument();
  });

  it('handles empty comparable markets', () => {
    render(
      <PriceComparisonChart 
        {...defaultProps} 
        comparableMarkets={[]}
      />
    );
    
    expect(screen.getByText('Compare quoted price with 0 nearby markets')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // Markets compared
  });

  it('extracts location names correctly', () => {
    const marketWithLongLocation = {
      ...mockComparableMarkets[0],
      location: 'Very Long Market Name, District Name, State Name, Country'
    };

    render(
      <PriceComparisonChart 
        {...defaultProps} 
        comparableMarkets={[marketWithLongLocation]}
      />
    );
    
    expect(screen.getAllByText('Very Long Market Name')).toHaveLength(2); // bar-label and bar-value
  });

  it('handles single word location names', () => {
    const marketWithShortLocation = {
      ...mockComparableMarkets[0],
      location: 'Delhi'
    };

    render(
      <PriceComparisonChart 
        {...defaultProps} 
        comparableMarkets={[marketWithShortLocation]}
      />
    );
    
    expect(screen.getAllByText('Delhi')).toHaveLength(2); // bar-label and bar-value
  });

  it('formats prices correctly in Indian format', () => {
    const highPriceMarket = {
      ...mockComparableMarkets[0],
      price: 123456
    };

    render(
      <PriceComparisonChart 
        {...defaultProps} 
        comparableMarkets={[highPriceMarket]}
      />
    );
    
    expect(screen.getAllByText('₹1,23,456')).toHaveLength(2); // bar-price and summary
  });
});