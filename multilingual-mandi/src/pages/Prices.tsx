import React, { useState, useEffect } from 'react';
import { priceService } from '../services/priceService';
import { PriceData, PriceQuery } from '../types/price';
import PriceAnalysis from '../components/PriceAnalysis';

const Prices: React.FC = () => {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState<{ id: string; name: string } | null>(null);

  // Load initial price data
  useEffect(() => {
    loadPriceData();
  }, []);

  const loadPriceData = async (commodity?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const query: PriceQuery = {
        ...(commodity && { commodity }),
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          end: new Date()
        },
        limit: 20
      };

      const data = await priceService.queryPrices(query);
      const freshData = priceService.checkDataFreshness(data);
      setPriceData(freshData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load price data');
      // Fallback to sample data
      setPriceData([
        {
          commodity: 'Wheat',
          commodityId: 'wheat',
          price: 2150,
          unit: 'quintal',
          location: 'Delhi Mandi',
          source: 'agmarknet',
          timestamp: new Date(),
          confidence: 0.9,
          marketTrend: 'rising',
          priceChange: { amount: 50, percentage: 2.4, period: '24h' }
        },
        {
          commodity: 'Rice',
          commodityId: 'rice',
          price: 3200,
          unit: 'quintal',
          location: 'Punjab Mandi',
          source: 'vendor_submission',
          timestamp: new Date(),
          confidence: 0.8,
          marketTrend: 'falling',
          priceChange: { amount: -40, percentage: -1.2, period: '24h' }
        },
        {
          commodity: 'Onion',
          commodityId: 'onion',
          price: 1800,
          unit: 'quintal',
          location: 'Maharashtra Mandi',
          source: 'agmarknet',
          timestamp: new Date(),
          confidence: 0.85,
          marketTrend: 'stable',
          priceChange: { amount: 0, percentage: 0, period: '24h' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      await loadPriceData(searchTerm.trim());
    } else {
      await loadPriceData();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return '↗';
      case 'falling': return '↘';
      case 'volatile': return '↕';
      default: return '→';
    }
  };

  const getTrendClass = (trend: string) => {
    switch (trend) {
      case 'rising': return 'positive';
      case 'falling': return 'negative';
      case 'volatile': return 'volatile';
      default: return 'stable';
    }
  };

  const getSourceBadge = (source: string) => {
    const sourceLabels = {
      'agmarknet': 'AGMARKNET',
      'vendor_submission': 'Vendor',
      'predicted': 'Predicted',
      'manual': 'Manual'
    };
    return sourceLabels[source as keyof typeof sourceLabels] || source;
  };

  const getFreshnessIndicator = (data: PriceData) => {
    const metadata = data.metadata;
    if (metadata?.isStale) {
      return (
        <span className="freshness-indicator stale" title={`Data is ${metadata.ageInHours} hours old`}>
          ⚠ Stale ({metadata.ageInHours}h)
        </span>
      );
    } else if (metadata?.freshnessIndicator === 'aging') {
      return (
        <span className="freshness-indicator aging" title={`Data is ${metadata.ageInHours} hours old`}>
          ⏰ Aging ({metadata.ageInHours}h)
        </span>
      );
    }
    return (
      <span className="freshness-indicator fresh" title="Fresh data">
        ✓ Fresh
      </span>
    );
  };

  const handleAnalyzePrice = (commodityId: string, commodityName: string) => {
    setSelectedCommodity({ id: commodityId, name: commodityName });
  };

  const handleCloseAnalysis = () => {
    setSelectedCommodity(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Market Prices</h1>
        <p>Real-time commodity prices from mandis across India</p>
      </div>
      
      <div className="page-content">
        <div className="search-section">
          <input 
            type="text" 
            placeholder="Search commodities..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <button 
            className="search-button" 
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <p>⚠ {error}</p>
            <p>Showing sample data instead.</p>
          </div>
        )}

        {loading && (
          <div className="loading-message">
            <p>Loading price data...</p>
          </div>
        )}

        <div className="price-list">
          {priceData.map((item, index) => (
            <div key={`${item.commodityId}-${index}`} className="price-card">
              <div className="price-card-header">
                <h3>{item.commodity}</h3>
                <span className={`source-badge ${item.source}`}>
                  {getSourceBadge(item.source)}
                </span>
              </div>
              
              <div className="price-main">
                <p className="price">{formatPrice(item.price)}/{item.unit}</p>
                <p className="confidence">Confidence: {Math.round(item.confidence * 100)}%</p>
              </div>
              
              <div className="price-details">
                <p className="location">📍 {item.location}</p>
                <p className={`trend ${getTrendClass(item.marketTrend)}`}>
                  {getTrendIcon(item.marketTrend)} {item.priceChange.percentage > 0 ? '+' : ''}{item.priceChange.percentage.toFixed(1)}%
                </p>
              </div>
              
              <div className="price-footer">
                {getFreshnessIndicator(item)}
                <span className="timestamp">
                  {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString()}
                </span>
              </div>
              
              <div className="price-actions">
                <button 
                  className="analyze-button"
                  onClick={() => handleAnalyzePrice(item.commodityId, item.commodity)}
                >
                  📊 Analyze Price
                </button>
              </div>
            </div>
          ))}
        </div>

        {priceData.length === 0 && !loading && (
          <div className="no-data-message">
            <p>No price data available. Try searching for a specific commodity.</p>
          </div>
        )}
      </div>

      {selectedCommodity && (
        <PriceAnalysis
          commodityId={selectedCommodity.id}
          commodityName={selectedCommodity.name}
          onClose={handleCloseAnalysis}
        />
      )}

      <style>{`
        .search-section {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .search-input {
          flex: 1;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
        }

        .search-input:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }

        .search-button {
          padding: 12px 24px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.2s;
        }

        .search-button:hover:not(:disabled) {
          background-color: #0056b3;
        }

        .search-button:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }

        .error-message {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
          color: #856404;
        }

        .loading-message {
          text-align: center;
          padding: 20px;
          color: #6c757d;
        }

        .no-data-message {
          text-align: center;
          padding: 40px;
          color: #6c757d;
        }

        .price-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .price-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .price-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .price-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .price-card-header h3 {
          margin: 0;
          color: #333;
          font-size: 1.2em;
        }

        .source-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8em;
          font-weight: bold;
          text-transform: uppercase;
        }

        .source-badge.agmarknet {
          background-color: #d4edda;
          color: #155724;
        }

        .source-badge.vendor_submission {
          background-color: #cce5ff;
          color: #004085;
        }

        .source-badge.predicted {
          background-color: #fff3cd;
          color: #856404;
        }

        .source-badge.manual {
          background-color: #f8d7da;
          color: #721c24;
        }

        .price-main {
          margin-bottom: 15px;
        }

        .price {
          font-size: 1.5em;
          font-weight: bold;
          color: #007bff;
          margin: 0 0 5px 0;
        }

        .confidence {
          font-size: 0.9em;
          color: #6c757d;
          margin: 0;
        }

        .price-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .location {
          margin: 0;
          color: #6c757d;
          font-size: 0.9em;
        }

        .trend {
          font-weight: bold;
          font-size: 0.9em;
        }

        .trend.positive {
          color: #28a745;
        }

        .trend.negative {
          color: #dc3545;
        }

        .trend.stable {
          color: #6c757d;
        }

        .trend.volatile {
          color: #fd7e14;
        }

        .price-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }

        .price-actions {
          margin-top: 12px;
          display: flex;
          justify-content: center;
        }

        .analyze-button {
          background-color: #28a745;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9em;
          font-weight: 500;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .analyze-button:hover {
          background-color: #218838;
        }

        .freshness-indicator {
          font-size: 0.8em;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .freshness-indicator.fresh {
          background-color: #d4edda;
          color: #155724;
        }

        .freshness-indicator.aging {
          background-color: #fff3cd;
          color: #856404;
        }

        .freshness-indicator.stale {
          background-color: #f8d7da;
          color: #721c24;
        }

        .timestamp {
          font-size: 0.8em;
          color: #6c757d;
        }

        @media (max-width: 768px) {
          .price-list {
            grid-template-columns: 1fr;
          }
          
          .search-section {
            flex-direction: column;
          }
          
          .price-details {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
          }
          
          .price-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
          }
        }
      `}</style>
    </div>
  );
};

export default Prices;