// Admin Analytics Component
// Displays platform analytics, user activity metrics, and business intelligence
// Provides charts and insights for administrative decision making

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  Calendar,
  BarChart3,
  PieChart,
  RefreshCw
} from 'lucide-react';
import { contentModerationService, type PlatformAnalytics } from '../services/contentModerationService';

interface AnalyticsCard {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

const AdminAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contentModerationService.getPlatformAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} className="text-green-500" />;
      case 'down':
        return <TrendingDown size={16} className="text-red-500" />;
      default:
        return <Activity size={16} className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <RefreshCw className="animate-spin" size={20} />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Analytics</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadAnalytics}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  const analyticsCards: AnalyticsCard[] = [
    {
      title: 'Daily Active Users',
      value: formatNumber(analytics.userActivity.dailyActiveUsers),
      change: 12.5,
      trend: 'up',
      icon: <Users size={24} />,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Deals',
      value: formatNumber(analytics.transactionMetrics.totalDeals),
      change: 8.3,
      trend: 'up',
      icon: <ShoppingCart size={24} />,
      color: 'bg-green-500'
    },
    {
      title: 'Average Deal Value',
      value: formatCurrency(analytics.transactionMetrics.averageDealValue),
      change: -2.1,
      trend: 'down',
      icon: <DollarSign size={24} />,
      color: 'bg-purple-500'
    },
    {
      title: 'Completion Rate',
      value: `${((analytics.transactionMetrics.completedDeals / analytics.transactionMetrics.totalDeals) * 100).toFixed(1)}%`,
      change: 5.7,
      trend: 'up',
      icon: <TrendingUp size={24} />,
      color: 'bg-orange-500'
    },
    {
      title: 'Verified Users',
      value: formatNumber(analytics.trustMetrics.verifiedUsers),
      change: 15.2,
      trend: 'up',
      icon: <Activity size={24} />,
      color: 'bg-indigo-500'
    },
    {
      title: 'Avg Trust Score',
      value: analytics.trustMetrics.averageTrustScore.toFixed(1),
      change: 3.4,
      trend: 'up',
      icon: <BarChart3 size={24} />,
      color: 'bg-teal-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Platform Analytics</h2>
          <p className="text-gray-600">Comprehensive insights into platform performance</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={loadAnalytics}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyticsCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`${card.color} text-white p-3 rounded-lg`}>
                  {card.icon}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
              {card.change && (
                <div className="flex items-center gap-1">
                  {getTrendIcon(card.trend || 'stable')}
                  <span className={`text-sm font-medium ${
                    card.trend === 'up' ? 'text-green-600' : 
                    card.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {card.change > 0 ? '+' : ''}{card.change}%
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Activity Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">User Activity</h3>
            <Users className="text-gray-400" size={20} />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Daily Active Users</span>
              <span className="font-semibold">{analytics.userActivity.dailyActiveUsers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Weekly Active Users</span>
              <span className="font-semibold">{analytics.userActivity.weeklyActiveUsers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Monthly Active Users</span>
              <span className="font-semibold">{analytics.userActivity.monthlyActiveUsers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Registrations</span>
              <span className="font-semibold text-green-600">+{analytics.userActivity.newRegistrations}</span>
            </div>
          </div>
        </div>

        {/* Transaction Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Transaction Metrics</h3>
            <ShoppingCart className="text-gray-400" size={20} />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Deals</span>
              <span className="font-semibold">{analytics.transactionMetrics.totalDeals.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completed Deals</span>
              <span className="font-semibold text-green-600">{analytics.transactionMetrics.completedDeals.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Disputed Deals</span>
              <span className="font-semibold text-red-600">{analytics.transactionMetrics.disputedDeals.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Deal Value</span>
              <span className="font-semibold">{formatCurrency(analytics.transactionMetrics.averageDealValue)}</span>
            </div>
          </div>
        </div>

        {/* Trust & Safety Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Trust & Safety</h3>
            <Activity className="text-gray-400" size={20} />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Verified Users</span>
              <span className="font-semibold text-green-600">{analytics.trustMetrics.verifiedUsers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Trust Score</span>
              <span className="font-semibold">{analytics.trustMetrics.averageTrustScore.toFixed(1)}/5.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Suspended Users</span>
              <span className="font-semibold text-yellow-600">{analytics.trustMetrics.suspendedUsers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Banned Users</span>
              <span className="font-semibold text-red-600">{analytics.trustMetrics.bannedUsers.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Platform Health */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Platform Health</h3>
            <PieChart className="text-gray-400" size={20} />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="font-semibold text-green-600">
                {((analytics.transactionMetrics.completedDeals / analytics.transactionMetrics.totalDeals) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Dispute Rate</span>
              <span className="font-semibold text-red-600">
                {((analytics.transactionMetrics.disputedDeals / analytics.transactionMetrics.totalDeals) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">User Retention</span>
              <span className="font-semibold">
                {((analytics.userActivity.weeklyActiveUsers / analytics.userActivity.monthlyActiveUsers) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Verification Rate</span>
              <span className="font-semibold text-blue-600">
                {((analytics.trustMetrics.verifiedUsers / (analytics.userActivity.monthlyActiveUsers || 1)) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Growth Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Growth Trends</h3>
          <div className="flex items-center gap-2">
            <Calendar className="text-gray-400" size={16} />
            <span className="text-sm text-gray-600">Last {timeRange}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              +{analytics.userActivity.newRegistrations}
            </div>
            <div className="text-sm text-gray-600">New Users</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <TrendingUp size={12} className="text-green-500" />
              <span className="text-xs text-green-600">+12.5%</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              +{analytics.transactionMetrics.completedDeals}
            </div>
            <div className="text-sm text-gray-600">Completed Deals</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <TrendingUp size={12} className="text-green-500" />
              <span className="text-xs text-green-600">+8.3%</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {formatCurrency(analytics.transactionMetrics.averageDealValue * analytics.transactionMetrics.completedDeals)}
            </div>
            <div className="text-sm text-gray-600">Total Volume</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <TrendingUp size={12} className="text-green-500" />
              <span className="text-xs text-green-600">+15.7%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;