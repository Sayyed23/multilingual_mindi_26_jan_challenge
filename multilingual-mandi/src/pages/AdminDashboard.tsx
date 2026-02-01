// Admin Dashboard Page
// Main admin interface with user management and moderation tools
// Displays analytics, audit logs, and system overview

import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  AlertTriangle,
  Activity,
  TrendingUp,
  FileText,
  Download,
  RefreshCw
} from 'lucide-react';
import { adminService, type AdminDashboardStats } from '../services/adminService';
import { contentModerationService, type ModerationStats } from '../services/contentModerationService';
import UserManagement from '../components/UserManagement';
import ContentModeration from '../components/ContentModeration';
import AdminAnalytics from '../components/AdminAnalytics';
import AdminAuditLogs from '../components/AdminAuditLogs';
import AdminDisputeResolution from '../components/AdminDisputeResolution';
import type { AuditLog } from '../types';

interface DashboardCard {
  title: string;
  value: number;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

const AdminDashboard: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<AdminDashboardStats | null>(null);
  const [moderationStats, setModerationStats] = useState<ModerationStats | null>(null);
  // const [platformAnalytics, setPlatformAnalytics] = useState<PlatformAnalytics | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'content' | 'disputes' | 'analytics' | 'logs'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashStats, modStats] = await Promise.all([
        adminService.getDashboardStats(),
        contentModerationService.getModerationStats()
      ]);

      setDashboardStats(dashStats);
      setModerationStats(modStats);
      setRecentLogs(dashStats.recentActivity);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="animate-spin" size={20} />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const overviewCards: DashboardCard[] = [
    {
      title: 'Total Users',
      value: dashboardStats?.totalUsers || 0,
      icon: <Users size={24} />,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Users',
      value: dashboardStats?.activeUsers || 0,
      icon: <Activity size={24} />,
      color: 'bg-green-500'
    },
    {
      title: 'Pending Verifications',
      value: dashboardStats?.pendingVerifications || 0,
      icon: <Shield size={24} />,
      color: 'bg-yellow-500'
    },
    {
      title: 'Open Reports',
      value: dashboardStats?.openReports || 0,
      icon: <AlertTriangle size={24} />,
      color: 'bg-red-500'
    },
    {
      title: 'Total Deals',
      value: dashboardStats?.totalDeals || 0,
      icon: <TrendingUp size={24} />,
      color: 'bg-purple-500'
    },
    {
      title: 'Moderation Actions',
      value: moderationStats?.moderationActions || 0,
      icon: <FileText size={24} />,
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage users, content, and platform operations</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={refreshData}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
              <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                <Download size={18} />
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: <Activity size={18} /> },
              { id: 'users', label: 'User Management', icon: <Users size={18} /> },
              { id: 'content', label: 'Content Moderation', icon: <Shield size={18} /> },
              { id: 'disputes', label: 'Dispute Resolution', icon: <AlertTriangle size={18} /> },
              { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={18} /> },
              { id: 'logs', label: 'Audit Logs', icon: <FileText size={18} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {overviewCards.map((card, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className={`${card.color} text-white p-3 rounded-lg`}>
                      {card.icon}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{card.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
                      {card.change && (
                        <p className={`text-sm ${card.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {card.change > 0 ? '+' : ''}{card.change}% from last month
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                {recentLogs.length > 0 ? (
                  <div className="space-y-4">
                    {recentLogs.slice(0, 10).map((log) => (
                      <div key={log.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {log.action.replace('_', ' ').toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {log.targetType}: {log.targetId}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {log.timestamp.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <UserManagement />
        )}

        {activeTab === 'content' && (
          <ContentModeration />
        )}

        {activeTab === 'disputes' && (
          <AdminDisputeResolution />
        )}

        {activeTab === 'analytics' && (
          <AdminAnalytics />
        )}

        {activeTab === 'logs' && (
          <AdminAuditLogs />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;