import React, { useState, useEffect, useContext } from 'react';
import { priceService } from '../services/priceService';
import { PriceData, PriceQuery } from '../types/price';
import PriceAnalysis from '../components/PriceAnalysis';
import PriceVerificationScanner from '../components/PriceVerificationScanner';
import PriceFilters from '../components/PriceFilters';
import PriceCard from '../components/PriceCard';
import RealTimeUpdates from '../components/RealTimeUpdates';
import SearchInterface from '../components/SearchInterface';
import AuthContext from '../contexts/AuthContext';
import { usePriceData } from '../hooks/usePriceData';

const Prices: React.FC = () => {
  const authContext = useContext(AuthContext);
  const user = authContext?.user;
  
  // Use the custom hook for price data management
  const {
    priceData,
    loading,
    error,
    filters,
    searchTerm,
    totalCount,
    hasMore,
    setSearchTerm,
    setFilters,
    clearFilters,
    refresh,
    loadMore,
    startRealTimeUpdates,
    stopRealTimeUpdates,
    isRealTimeActive
  } = usePriceData({
    autoRefresh: false,
    refreshInterval: 30000, // 30 seconds
    limit: 20
  });

  // Local state for UI components
  const [selectedCommodity, setSelectedCommodity] = useState<{ id: string; name: string } | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
  const [sortBy, setSortBy] = useState<'price' | 'confidence' | 'timestamp' | 'trend'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [updateCount, setUpdateCount] = useState(0);

  // Update last updated time when data changes
  useEffect(() => {
    if (priceData.length > 0) {
      setLastUpdated(new Date());
      setUpdateCount(prev => prev + 1);
    }
  }, [priceData]);

  // Handle search with debouncing
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Search is handled automatically by the hook
    }
  };

  // Sort price data
  const sortedPriceData = React.useMemo(() => {
    const sorted = [...priceData].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'confidence':
          comparison = a.confidence - b.confidence;
          break;
        case 'timestamp':
          comparison = a.timestamp.getTime() - b.timestamp.getTime();
          break;
        case 'trend':
          const trendOrder = { 'rising': 3, 'stable': 2, 'falling': 1, 'volatile': 0 };
          comparison = (trendOrder[a.marketTrend] || 0) - (trendOrder[b.marketTrend] || 0);
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    return sorted;
  }, [priceData, sortBy, sortOrder]);

  const handleAnalyzePrice = (commodityId: string, commodityName: string) => {
    setSelectedCommodity({ id: commodityId, name: commodityName });
  };

  const handleVerifyPrice = (commodityId: string, commodityName: string, price: number) => {
    setShowScanner(true);
    // In a real implementation, we could pre-populate the scanner with this data
  };

  const handleCreateAlert = (commodityId: string, commodityName: string) => {
    // TODO: Implement price alert creation
    alert(`Price alert creation for ${commodityName} will be implemented in the next phase.`);
  };

  const handleCloseAnalysis = () => {
    setSelectedCommodity(null);
  };

  const handleOpenScanner = () => {
    setShowScanner(true);
  };

  const handleCloseScanner = () => {
    setShowScanner(false);
  };

  const handleRealTimeToggle = () => {
    if (isRealTimeActive) {
      stopRealTimeUpdates();
    } else {
      startRealTimeUpdates();
    }
  };

  const getViewModeIcon = (mode: string) => {
    switch (mode) {
      case 'grid': return '⊞';
      case 'list': return '☰';
      case 'compact': return '▤';
      default: return '⊞';
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return '↕';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-content">
          <h1>Market Prices</h1>
          <p>Real-time commodity prices from mandis across India</p>
        </div>
        <div className="header-actions">
          <RealTimeUpdates
            isActive={isRealTimeActive}
            onToggle={handleRealTimeToggle}
            lastUpdated={lastUpdated}
            updateCount={updateCount}
            loading={loading}
          />
          <button 
            className="scanner-button"
            onClick={handleOpenScanner}
          >
            🔍 Price Scanner
          </button>
        </div>
      </div>
      
      <div className="page-content">
        {/* Enhanced Search Section */}
        <div className="search-section">
          <SearchInterface
            onCommoditySelect={(commodity) => {
              // Update filters to show selected commodity
              setFilters({
                commodity: commodity.commodity.name
              });
            }}
            searchType="commodities"
            language={user?.preferredLanguage || 'en'}
            className="prices-search"
          />
        </div>

        {/* Advanced Filters */}
        <PriceFilters
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={clearFilters}
          loading={loading}
        />

        {/* View Controls */}
        <div className="view-controls">
          <div className="view-mode-selector">
            <span className="control-label">View:</span>
            {(['grid', 'list', 'compact'] as const).map(mode => (
              <button
                key={mode}
                className={`view-mode-button ${viewMode === mode ? 'active' : ''}`}
                onClick={() => setViewMode(mode)}
                title={`${mode} view`}
              >
                {getViewModeIcon(mode)}
              </button>
            ))}
          </div>

          <div className="sort-controls">
            <span className="control-label">Sort by:</span>
            {(['price', 'confidence', 'timestamp', 'trend'] as const).map(field => (
              <button
                key={field}
                className={`sort-button ${sortBy === field ? 'active' : ''}`}
                onClick={() => {
                  if (sortBy === field) {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy(field);
                    setSortOrder('desc');
                  }
                }}
                title={`Sort by ${field}`}
              >
                {field} {getSortIcon(field)}
              </button>
            ))}
          </div>

          <div className="results-info">
            <span className="results-count">
              {totalCount} {totalCount === 1 ? 'result' : 'results'}
            </span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <p>⚠ {error}</p>
            <p>Showing sample data instead.</p>
          </div>
        )}

        {/* Loading State */}
        {loading && sortedPriceData.length === 0 && (
          <div className="loading-message">
            <div className="loading-spinner"></div>
            <p>Loading price data...</p>
          </div>
        )}

        {/* Price Data Display */}
        <div className={`price-list ${viewMode}`}>
          {sortedPriceData.map((item, index) => (
            <PriceCard
              key={`${item.commodityId}-${index}`}
              priceData={item}
              onAnalyze={handleAnalyzePrice}
              onVerify={handleVerifyPrice}
              onCreateAlert={handleCreateAlert}
              compact={viewMode === 'compact'}
            />
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && !loading && sortedPriceData.length > 0 && (
          <div className="load-more-section">
            <button
              className="load-more-button"
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load More Prices'}
            </button>
          </div>
        )}

        {/* No Data Message */}
        {sortedPriceData.length === 0 && !loading && (
          <div className="no-data-message">
            <div className="no-data-icon">📊</div>
            <h3>No price data available</h3>
            <p>Try adjusting your search terms or filters to find relevant price information.</p>
            <button className="clear-filters-button" onClick={clearFilters}>
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedCommodity && (
        <PriceAnalysis
          commodityId={selectedCommodity.id}
          commodityName={selectedCommodity.name}
          onClose={handleCloseAnalysis}
        />
      )}

      {showScanner && (
        <PriceVerificationScanner
          onClose={handleCloseScanner}
        />
      )}

      <style>{`
        .page-header {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          gap: 20px;
        }

        .header-content {
          flex: 1;
        }

        .header-content h1 {
          margin: 0 0 8px 0;
          color: #212529;
          font-size: 2em;
          font-weight: 700;
        }

        .header-content p {
          margin: 0;
          color: #6c757d;
          font-size: 1.1em;
        }

        .header-actions {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex-wrap: wrap;
        }

        .scanner-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 1em;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .scanner-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .scanner-button:active {
          transform: translateY(0);
        }

        .search-section {
          margin-bottom: 20px;
        }

        .search-input-container {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .search-input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.3s ease;
          background: white;
        }

        .search-input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }

        .search-input:disabled {
          background-color: #f8f9fa;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .refresh-button {
          padding: 12px;
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 48px;
        }

        .refresh-button:hover:not(:disabled) {
          background: #e9ecef;
          border-color: #adb5bd;
        }

        .refresh-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .view-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding: 16px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          gap: 16px;
          flex-wrap: wrap;
        }

        .view-mode-selector,
        .sort-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .control-label {
          font-weight: 600;
          color: #495057;
          font-size: 0.9em;
        }

        .view-mode-button,
        .sort-button {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 0.85em;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #495057;
        }

        .view-mode-button:hover,
        .sort-button:hover {
          background: #e9ecef;
          border-color: #adb5bd;
        }

        .view-mode-button.active,
        .sort-button.active {
          background: #007bff;
          border-color: #007bff;
          color: white;
        }

        .results-info {
          color: #6c757d;
          font-size: 0.9em;
          font-weight: 500;
        }

        .error-message {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
          color: #856404;
        }

        .loading-message {
          text-align: center;
          padding: 40px;
          color: #6c757d;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .price-list {
          display: grid;
          gap: 20px;
          margin-bottom: 20px;
        }

        .price-list.grid {
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        }

        .price-list.list {
          grid-template-columns: 1fr;
        }

        .price-list.compact {
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
        }

        .load-more-section {
          text-align: center;
          margin: 20px 0;
        }

        .load-more-button {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 1em;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
        }

        .load-more-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
        }

        .load-more-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .no-data-message {
          text-align: center;
          padding: 60px 20px;
          color: #6c757d;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .no-data-icon {
          font-size: 4em;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .no-data-message h3 {
          margin: 0 0 12px 0;
          color: #495057;
          font-size: 1.5em;
        }

        .no-data-message p {
          margin: 0 0 20px 0;
          font-size: 1.1em;
          line-height: 1.5;
        }

        .clear-filters-button {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 1em;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .clear-filters-button:hover {
          background: #0056b3;
          transform: translateY(-1px);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }

          .header-actions {
            justify-content: center;
            width: 100%;
          }

          .scanner-button {
            flex: 1;
            justify-content: center;
            max-width: 300px;
          }

          .search-input-container {
            flex-direction: column;
            gap: 8px;
          }

          .refresh-button {
            width: 100%;
          }

          .view-controls {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .view-mode-selector,
          .sort-controls {
            justify-content: center;
            flex-wrap: wrap;
          }

          .results-info {
            text-align: center;
          }

          .price-list.grid,
          .price-list.compact {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .header-content h1 {
            font-size: 1.5em;
          }

          .header-content p {
            font-size: 1em;
          }

          .view-controls {
            padding: 12px;
          }

          .view-mode-button,
          .sort-button {
            font-size: 0.8em;
            padding: 5px 8px;
          }

          .no-data-message {
            padding: 40px 16px;
          }

          .no-data-icon {
            font-size: 3em;
          }

          .no-data-message h3 {
            font-size: 1.2em;
          }

          .no-data-message p {
            font-size: 1em;
          }
        }
      `}</style>
    </div>
  );
};

export default Prices;