import React, { useState } from 'react';
import { TrendingUp, RefreshCw, Download, Sparkles, Brain } from 'lucide-react';
import CommoditySearch from '../components/CommoditySearch';
import PriceDisplay from '../components/PriceDisplay';
import OfflineIndicator from '../components/OfflineIndicator';
import SyncStatusIndicator from '../components/SyncStatusIndicator';
import { priceDiscoveryService } from '../services/priceDiscovery';
import type { PriceData } from '../types';

const PriceDiscoveryPage: React.FC = () => {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [currentCommodity, setCurrentCommodity] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<{ analysis: string; forecast: string } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handlePricesFound = async (foundPrices: PriceData[]) => {
    setPrices(foundPrices);
    if (foundPrices.length > 0) {
      const commodity = foundPrices[0].commodity;
      setCurrentCommodity(commodity);

      // Fetch AI Insights
      setAiLoading(true);
      try {
        const [analysis, forecast] = await Promise.all([
          priceDiscoveryService.getAIPriceAnalysis(commodity, foundPrices),
          priceDiscoveryService.getAIPriceForecast(commodity, {
            commodity,
            location: foundPrices[0].location || { state: '', district: '', city: '', pincode: '' },
            data: foundPrices.map(p => ({
              date: new Date(p.timestamp),
              price: p.price,
              mandi: p.mandi
            }))
          })
        ]);
        setAiInsights({ analysis, forecast });
      } catch (err) {
        console.error('Error fetching AI insights:', err);
      } finally {
        setAiLoading(false);
      }
    }
  };

  const handleLoading = (isLoading: boolean) => {
    setLoading(isLoading);
  };

  const handleError = (errorMessage: string | null) => {
    setError(errorMessage);
  };

  const exportPrices = () => {
    if (prices.length === 0) return;

    const csvContent = [
      ['Commodity', 'Market', 'Price', 'Unit', 'Quality', 'Timestamp', 'Source'].join(','),
      ...prices.map((price: PriceData) => [
        price.commodity,
        price.mandi,
        price.price,
        price.unit,
        price.quality,
        new Date(price.timestamp).toISOString(),
        price.source
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentCommodity}_prices_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <TrendingUp size={24} className="text-green-600" />
              <h1 className="text-2xl font-bold text-gray-900">Price Discovery</h1>
            </div>
            <div className="flex items-center space-x-4">
              <OfflineIndicator compact />
              {prices.length > 0 && (
                <button
                  onClick={exportPrices}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download size={16} />
                  <span>Export</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Search and Filters Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <CommoditySearch
              onPricesFound={handlePricesFound}
              onLoading={handleLoading}
              onError={handleError}
            />

            <SyncStatusIndicator />

            {/* Quick Stats */}
            {prices.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Markets Found:</span>
                    <span className="font-medium">{prices.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price Range:</span>
                    <span className="font-medium">
                      ₹{Math.min(...prices.map((p: PriceData) => p.price))} - ₹{Math.max(...prices.map((p: PriceData) => p.price))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Price:</span>
                    <span className="font-medium">
                      ₹{Math.round(prices.reduce((sum: number, p: PriceData) => sum + p.price, 0) / prices.length)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-center space-x-3">
                  <RefreshCw size={24} className="animate-spin text-green-600" />
                  <span className="text-lg text-gray-600">Searching for prices...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
                <div className="text-center">
                  <div className="text-red-600 mb-2">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Search Error</h3>
                  <p className="text-gray-600">{error}</p>
                </div>
              </div>
            )}

            {/* Price Results */}
            {!loading && !error && prices.length > 0 && (
              <div className="space-y-6">
                {/* AI Insights Section */}
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-green-100/50 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-green-100 rounded-lg">
                        <Sparkles size={18} className="text-green-600" />
                      </div>
                      <h2 className="text-lg font-bold text-gray-900">Gemini Market Insights</h2>
                    </div>
                    {aiLoading && (
                      <RefreshCw size={16} className="animate-spin text-green-600" />
                    )}
                  </div>

                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Analysis */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm font-semibold text-green-800">
                        <Brain size={16} />
                        <span>Market Analysis</span>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 text-sm text-gray-700 leading-relaxed border border-white/40">
                        {aiLoading ? (
                          <div className="space-y-2 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                          </div>
                        ) : (
                          aiInsights?.analysis || "AI analysis not available."
                        )}
                      </div>
                    </div>

                    {/* Forecast */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm font-semibold text-blue-800">
                        <TrendingUp size={16} />
                        <span>7-Day Forecast</span>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 text-sm text-gray-700 leading-relaxed border border-white/40">
                        {aiLoading ? (
                          <div className="space-y-2 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                          </div>
                        ) : (
                          aiInsights?.forecast || "AI forecast not available."
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <PriceDisplay
                  prices={prices}
                  commodity={currentCommodity}
                  showTrends={true}
                  showAnomalies={true}
                />
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && prices.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-center">
                  <TrendingUp size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Discover Market Prices</h3>
                  <p className="text-gray-600 mb-6">
                    Search for any commodity to see current market prices, trends, and analysis.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-md mx-auto">
                    {['Rice', 'Wheat', 'Onion', 'Potato'].map((commodity) => (
                      <button
                        key={commodity}
                        onClick={() => {
                          // Trigger search for this commodity
                          const searchEvent = new CustomEvent('commoditySearch', { detail: commodity });
                          window.dispatchEvent(searchEvent);
                        }}
                        className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                      >
                        {commodity}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceDiscoveryPage;