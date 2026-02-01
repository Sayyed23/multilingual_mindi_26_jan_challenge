// Example Usage of Price Discovery Service
// This file demonstrates how to use the price discovery service in a real application

import { priceDiscoveryService } from '../priceDiscovery';
import type { Location, PriceData } from '../../types';

// Example: Basic price discovery usage
export async function exampleBasicPriceDiscovery() {
  try {
    // Get current prices for Rice
    const ricePrices = await priceDiscoveryService.getCurrentPrices('Rice');
    console.log('Current Rice Prices:', ricePrices);

    // Get prices for a specific location
    const delhiLocation: Location = {
      state: 'Delhi',
      district: 'New Delhi',
      city: 'Delhi',
      pincode: '110001'
    };

    const localRicePrices = await priceDiscoveryService.getCurrentPrices('Rice', delhiLocation);
    console.log('Delhi Rice Prices:', localRicePrices);

    // Get historical prices
    const dateRange = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    };

    const historicalPrices = await priceDiscoveryService.getHistoricalPrices('Rice', dateRange);
    console.log('Historical Rice Prices:', historicalPrices);

    // Get price trends
    const priceTrends = await priceDiscoveryService.getPriceTrends('Rice');
    console.log('Rice Price Trends:', priceTrends);

  } catch (error) {
    console.error('Error in price discovery:', error);
  }
}

// Example: Anomaly detection usage
export async function exampleAnomalyDetection() {
  try {
    // Sample price data (in real app, this would come from getCurrentPrices)
    const samplePrices: PriceData[] = [
      {
        commodity: 'Wheat',
        mandi: 'Delhi Mandi',
        price: 2000,
        unit: 'quintal',
        quality: 'standard',
        timestamp: new Date(),
        source: 'Government Portal'
      },
      {
        commodity: 'Wheat',
        mandi: 'Mumbai Mandi',
        price: 2100,
        unit: 'quintal',
        quality: 'standard',
        timestamp: new Date(),
        source: 'Government Portal'
      },
      {
        commodity: 'Wheat',
        mandi: 'Suspicious Mandi',
        price: 4000, // Anomalously high
        unit: 'quintal',
        quality: 'standard',
        timestamp: new Date(),
        source: 'Unknown Source'
      }
    ];

    // Detect anomalies
    const anomalies = priceDiscoveryService.detectPriceAnomalies(samplePrices);
    console.log('Detected Anomalies:', anomalies);

    // Flag anomalies for admin review
    const flaggedAnomalies = await priceDiscoveryService.detectAndFlagAnomalies('Wheat');
    console.log('Flagged Anomalies:', flaggedAnomalies);

  } catch (error) {
    console.error('Error in anomaly detection:', error);
  }
}

// Example: Offline functionality usage
export async function exampleOfflineFunctionality() {
  try {
    // Get cached prices with sync status
    const cachedData = await priceDiscoveryService.getCachedPricesWithSyncStatus('Rice');
    console.log('Cached Prices:', cachedData.prices);
    console.log('Is Offline:', cachedData.isOffline);
    console.log('Last Sync:', cachedData.lastSync);
    console.log('Cache Age (ms):', cachedData.cacheAge);

    // Sync price data manually
    const syncResult = await priceDiscoveryService.syncPriceData('Rice');
    console.log('Sync Result:', syncResult);

    // Get cache status
    const cacheStatus = await priceDiscoveryService.getPriceCacheStatus();
    console.log('Cache Status:', cacheStatus);

  } catch (error) {
    console.error('Error in offline functionality:', error);
  }
}

// Example: Real-time price updates
export function exampleRealTimePriceUpdates() {
  // Subscribe to real-time price updates
  const unsubscribe = priceDiscoveryService.subscribeToPriceUpdates('Rice', (priceUpdate) => {
    console.log('New Price Update:', priceUpdate);

    // Handle the price update in your UI
    // For example, update a price display component
    updatePriceDisplay(priceUpdate);
  });

  // Clean up subscription when component unmounts or when no longer needed
  setTimeout(() => {
    unsubscribe();
    console.log('Unsubscribed from price updates');
  }, 60000); // Unsubscribe after 1 minute
}

// Example: Data validation usage
export function exampleDataValidation() {
  // Validate price data before processing
  const priceData: PriceData = {
    commodity: 'Rice',
    mandi: 'Delhi Mandi',
    price: 2500,
    unit: 'quintal',
    quality: 'standard',
    timestamp: new Date(),
    source: 'Government Portal'
  };

  const validationResult = priceDiscoveryService.validatePriceData(priceData);

  if (validationResult.isValid) {
    console.log('Price data is valid');
    // Process the price data
  } else {
    console.error('Price data validation errors:', validationResult.errors);
    // Handle validation errors
  }
}

// Example: Data integrity check
export async function exampleDataIntegrityCheck() {
  try {
    const integrityCheck = await priceDiscoveryService.performDataIntegrityCheck();

    console.log('Data Integrity Report:');
    console.log('- Total Prices:', integrityCheck.totalPrices);
    console.log('- Valid Prices:', integrityCheck.validPrices);
    console.log('- Invalid Prices:', integrityCheck.invalidPrices);
    console.log('- Anomalies:', integrityCheck.anomalies);

    if (integrityCheck.errors.length > 0) {
      console.error('Integrity Errors:', integrityCheck.errors);
    }

  } catch (error) {
    console.error('Error in data integrity check:', error);
  }
}

// Helper function for UI updates (placeholder)
function updatePriceDisplay(priceUpdate: PriceData) {
  // This would update your React component or UI element
  console.log(`Updating UI with new price: ${priceUpdate.price} for ${priceUpdate.commodity}`);
}

// Example: Complete workflow
export async function exampleCompleteWorkflow() {
  console.log('=== Price Discovery Service Example Workflow ===');

  // 1. Basic price discovery
  console.log('\n1. Basic Price Discovery:');
  await exampleBasicPriceDiscovery();

  // 2. Anomaly detection
  console.log('\n2. Anomaly Detection:');
  await exampleAnomalyDetection();

  // 3. Offline functionality
  console.log('\n3. Offline Functionality:');
  await exampleOfflineFunctionality();

  // 4. Data validation
  console.log('\n4. Data Validation:');
  exampleDataValidation();

  // 5. Data integrity check
  console.log('\n5. Data Integrity Check:');
  await exampleDataIntegrityCheck();

  // 6. Real-time updates (runs for 1 minute)
  console.log('\n6. Real-time Updates (running for 1 minute):');
  exampleRealTimePriceUpdates();

  console.log('\n=== Workflow Complete ===');
}

// Export all examples for use in other parts of the application
