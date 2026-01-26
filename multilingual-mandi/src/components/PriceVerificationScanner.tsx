/**
 * Price Verification Scanner Component
 * Dedicated component for scanning and verifying price quotes against market rates
 * Supports Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import React, { useState, useEffect, useCallback } from 'react';
import { priceService } from '../services/priceService';
import { PriceVerification, PriceTrend } from '../types/price';
import PriceComparisonChart from './PriceComparisonChart';
import HistoricalTrendDisplay from './HistoricalTrendDisplay';
import NegotiationStrategySuggestions from './NegotiationStrategySuggestions';
import './PriceVerificationScanner.css';

interface PriceVerificationScannerProps {
  commodityId?: string;
  commodityName?: string;
  location?: { latitude: number; longitude: number; radius?: number };
  onClose?: () => void;
}

const PriceVerificationScanner: React.FC<PriceVerificationScannerProps> = ({
  commodityId: initialCommodityId,
  commodityName: initialCommodityName,
  location,
  onClose
}) => {
  const [commodityId, setCommodityId] = useState(initialCommodityId || '');
  const [commodityName, setCommodityName] = useState(initialCommodityName || '');
  const [quotedPrice, setQuotedPrice] = useState<string>('');
  const [verification, setVerification] = useState<PriceVerification | null>(null);
  const [historicalTrend, setHistoricalTrend] = useState<PriceTrend | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<'manual' | 'camera' | 'voice'>('manual');

  // Common commodities for quick selection
  const commonCommodities = [
    { id: 'wheat', name: 'Wheat' },
    { id: 'rice', name: 'Rice' },
    { id: 'onion', name: 'Onion' },
    { id: 'potato', name: 'Potato' },
    { id: 'tomato', name: 'Tomato' },
    { id: 'sugar', name: 'Sugar' },
    { id: 'dal', name: 'Dal' },
    { id: 'oil', name: 'Cooking Oil' }
  ];

  const loadHistoricalTrend = useCallback(async () => {
    if (!commodityId) return;

    try {
      const trend = await priceService.getPriceTrend(commodityId, '30d', location);
      setHistoricalTrend(trend);
    } catch (err) {
      console.error('Failed to load historical trend:', err);
    }
  }, [commodityId, location]);

  useEffect(() => {
    if (commodityId) {
      loadHistoricalTrend();
    }
  }, [commodityId, loadHistoricalTrend]);

  const handleVerifyPrice = async () => {
    if (!commodityId || !quotedPrice || isNaN(Number(quotedPrice))) {
      setError('Please enter a valid commodity and price');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await priceService.verifyPriceQuote(
        commodityId,
        Number(quotedPrice),
        location
      );
      setVerification(result);

      // Load historical trend if not already loaded
      if (!historicalTrend) {
        await loadHistoricalTrend();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify price');
    } finally {
      setLoading(false);
    }
  };

  const handleCommoditySelect = (commodity: { id: string; name: string }) => {
    setCommodityId(commodity.id);
    setCommodityName(commodity.name);
    setVerification(null); // Clear previous verification
  };

  const handleScanModeChange = (mode: 'manual' | 'camera' | 'voice') => {
    setScanMode(mode);
    // In a real implementation, this would trigger camera or voice recognition
    if (mode === 'camera') {
      // TODO: Implement camera-based price scanning
      alert('Camera scanning not yet implemented. Please use manual entry.');
      setScanMode('manual');
    } else if (mode === 'voice') {
      // TODO: Implement voice-based price input
      alert('Voice input not yet implemented. Please use manual entry.');
      setScanMode('manual');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'fair': return '#28a745';
      case 'high': return '#fd7e14';
      case 'very_high': return '#dc3545';
      case 'low': return '#17a2b8';
      case 'very_low': return '#6f42c1';
      default: return '#6c757d';
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'fair': return '✅';
      case 'high': return '⚠️';
      case 'very_high': return '🚨';
      case 'low': return '💰';
      case 'very_low': return '🤔';
      default: return '❓';
    }
  };

  return (
    <div className="price-scanner-container">
      <div className="scanner-header">
        <h2>🔍 Price Verification Scanner</h2>
        <p>Verify quoted prices against current market rates</p>
        {onClose && (
          <button onClick={onClose} className="close-button">×</button>
        )}
      </div>

      <div className="scanner-content">
        {/* Input Section */}
        <div className="input-section">
          <div className="scan-mode-selector">
            <h3>Input Method</h3>
            <div className="mode-buttons">
              <button
                className={`mode-button ${scanMode === 'manual' ? 'active' : ''}`}
                onClick={() => handleScanModeChange('manual')}
              >
                ⌨️ Manual Entry
              </button>
              <button
                className={`mode-button ${scanMode === 'camera' ? 'active' : ''}`}
                onClick={() => handleScanModeChange('camera')}
              >
                📷 Scan Receipt
              </button>
              <button
                className={`mode-button ${scanMode === 'voice' ? 'active' : ''}`}
                onClick={() => handleScanModeChange('voice')}
              >
                🎤 Voice Input
              </button>
            </div>
          </div>

          <div className="commodity-selection">
            <h3>Select Commodity</h3>
            <div className="commodity-grid">
              {commonCommodities.map((commodity) => (
                <button
                  key={commodity.id}
                  className={`commodity-button ${commodityId === commodity.id ? 'selected' : ''}`}
                  onClick={() => handleCommoditySelect(commodity)}
                >
                  {commodity.name}
                </button>
              ))}
            </div>
            <div className="custom-commodity">
              <input
                type="text"
                placeholder="Or enter custom commodity..."
                value={commodityName}
                onChange={(e) => {
                  setCommodityName(e.target.value);
                  setCommodityId(
                    e.target.value
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9\s-]/g, '')
                      .replace(/\s+/g, '-')
                      .replace(/-+/g, '-')
                  );
                }} className="commodity-input"
              />
            </div>
          </div>

          <div className="price-input-section">
            <h3>Enter Quoted Price</h3>
            <div className="price-input-container">
              <span className="currency-symbol">₹</span>
              <input
                type="number"
                placeholder="Enter price per quintal"
                value={quotedPrice}
                onChange={(e) => setQuotedPrice(e.target.value)}
                className="price-input"
                min="0"
                step="1"
              />
              <span className="unit-label">per quintal</span>
            </div>
          </div>

          <button
            onClick={handleVerifyPrice}
            disabled={loading || !commodityId || !quotedPrice}
            className="verify-button"
          >
            {loading ? '🔄 Verifying...' : '🔍 Verify Price'}
          </button>

          {error && (
            <div className="error-message">
              <p>❌ {error}</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        {verification && (
          <div className="results-section">
            <div className="verification-result">
              <div className="result-header">
                <h3>Verification Result</h3>
                <div
                  className="verdict-badge"
                  style={{ backgroundColor: getVerdictColor(verification.verdict) }}
                >
                  {getVerdictIcon(verification.verdict)} {verification.verdict.replace('_', ' ').toUpperCase()}
                </div>
              </div>

              <div className="price-comparison">
                <div className="price-item">
                  <label>Quoted Price</label>
                  <span className="price-value">{formatPrice(verification.quotedPrice)}</span>
                </div>
                <div className="price-item">
                  <label>Market Price</label>
                  <span className="price-value">{formatPrice(verification.marketPrice)}</span>
                </div>
                <div className="price-item">
                  <label>Deviation</label>
                  <span className={`deviation-value ${verification.deviation.percentage > 0 ? 'positive' : 'negative'}`}>
                    {verification.deviation.percentage > 0 ? '+' : ''}{verification.deviation.percentage.toFixed(1)}%
                    ({verification.deviation.amount > 0 ? '+' : ''}{formatPrice(verification.deviation.amount)})
                  </span>
                </div>
              </div>

              <div className="confidence-indicator">
                <label>Verification Confidence</label>
                <div className="confidence-bar">
                  <div
                    className="confidence-fill"
                    style={{ width: `${verification.confidence * 100}%` }}
                  ></div>
                </div>
                <span>{Math.round(verification.confidence * 100)}%</span>
              </div>
            </div>

            {/* Price Comparison Chart */}
            <PriceComparisonChart
              quotedPrice={verification.quotedPrice}
              marketPrice={verification.marketPrice}
              comparableMarkets={verification.comparableMarkets}
            />

            {/* Historical Trend Display */}
            {historicalTrend && (
              <HistoricalTrendDisplay
                trend={historicalTrend}
                commodityName={commodityName}
              />
            )}

            {/* Negotiation Strategy Suggestions */}
            <NegotiationStrategySuggestions
              verification={verification}
              historicalTrend={historicalTrend}
              commodityName={commodityName}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceVerificationScanner;