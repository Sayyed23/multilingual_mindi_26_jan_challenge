// Demo component to test IndexedDB functionality
// This component demonstrates CRUD operations and database features

import React, { useState } from 'react';
import { useDatabase, useCommodityData, useDatabaseDev } from '../hooks/useDatabase';
import { Database, Users, Package, TrendingUp, RefreshCw, Trash2, Download } from 'lucide-react';

export const DatabaseDemo: React.FC = () => {
  const db = useDatabase();
  const commodityData = useCommodityData();
  const devTools = useDatabaseDev();
  const [activeTab, setActiveTab] = useState<'overview' | 'commodities' | 'dev'>('overview');
  const [operationResult, setOperationResult] = useState<string>('');

  const handleSeedDatabase = async () => {
    setOperationResult('Seeding database...');
    try {
      const result = await devTools.seedDatabase();
      setOperationResult(`✅ ${result.message} (${result.duration}ms)`);
    } catch (error) {
      setOperationResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleResetDatabase = async () => {
    setOperationResult('Resetting database...');
    try {
      const result = await devTools.resetDatabase();
      setOperationResult(`✅ ${result.message} (${result.duration}ms)`);
    } catch (error) {
      setOperationResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleClearDatabase = async () => {
    setOperationResult('Clearing database...');
    try {
      await devTools.clearAllData();
      setOperationResult('✅ Database cleared successfully');
    } catch (error) {
      setOperationResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleGetStats = async () => {
    setOperationResult('Getting database statistics...');
    try {
      const stats = await devTools.getStats();
      setOperationResult(`📊 Database Stats: ${JSON.stringify(stats, null, 2)}`);
    } catch (error) {
      setOperationResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (db.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Initializing database...</p>
        </div>
      </div>
    );
  }

  if (db.error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-red-500 mb-4">
            <Database className="h-12 w-12 mx-auto mb-2" />
            <h2 className="text-xl font-bold">Database Error</h2>
          </div>
          <p className="text-gray-600 mb-4">{db.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">IndexedDB Demo</h1>
                <p className="text-gray-600">Multilingual Mandi Local Storage Layer</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-3 h-3 rounded-full ${db.isInitialized ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-medium">
                  {db.isInitialized ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: Database },
                { id: 'commodities', label: 'Commodities', icon: Package },
                { id: 'dev', label: 'Dev Tools', icon: TrendingUp }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(db.stats).map(([storeName, count]) => (
                <div key={storeName} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 capitalize">
                        {storeName.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">{count}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      {storeName.includes('user') && <Users className="h-6 w-6 text-green-600" />}
                      {storeName.includes('commodit') && <Package className="h-6 w-6 text-green-600" />}
                      {storeName.includes('price') && <TrendingUp className="h-6 w-6 text-green-600" />}
                      {!storeName.includes('user') && !storeName.includes('commodit') && !storeName.includes('price') && (
                        <Database className="h-6 w-6 text-green-600" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'commodities' && (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Commodities & Prices</h2>
                  <button
                    onClick={commodityData.refreshCommodityData}
                    disabled={commodityData.loading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <RefreshCw className={`h-4 w-4 ${commodityData.loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {commodityData.loading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-green-600 mx-auto mb-2" />
                    <p className="text-gray-600">Loading commodity data...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {commodityData.commodities.map((commodity) => (
                      <div key={commodity.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{commodity.name}</h3>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {commodity.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{commodity.subcategory}</p>
                        <div className="text-xs text-gray-500">
                          <p>Units: {commodity.standardUnits.join(', ')}</p>
                          <p>Grades: {commodity.qualityGrades.length}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'dev' && (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Development Tools</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Tools for testing and managing the IndexedDB database
                </p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={handleSeedDatabase}
                    className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Seed Database
                  </button>
                  
                  <button
                    onClick={handleResetDatabase}
                    className="flex items-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset Database
                  </button>
                  
                  <button
                    onClick={handleClearDatabase}
                    className="flex items-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All Data
                  </button>
                  
                  <button
                    onClick={handleGetStats}
                    className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Get Statistics
                  </button>
                </div>

                {operationResult && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Operation Result:</h3>
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                      {operationResult}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};