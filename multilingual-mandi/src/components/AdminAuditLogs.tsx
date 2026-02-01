// Admin Audit Logs Component
// Displays comprehensive audit trail of all administrative actions
// Provides filtering, search, and detailed log inspection capabilities

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Calendar,
  User,
  Activity,
  AlertTriangle,
  Eye,
  Download,
  RefreshCw,
  Clock,
  Shield,
  Settings,
  Trash2
} from 'lucide-react';
import { adminService } from '../services/adminService';
import type { AuditLog } from '../types';

interface AuditLogFilters {
  adminId?: string;
  action?: string;
  targetType?: 'user' | 'deal' | 'price' | 'content';
  dateRange?: {
    start: Date;
    end: Date;
  };
}

const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadAuditLogs();
  }, [filters]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminService.getAuditLogs(100);
      setLogs(result.logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof AuditLogFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Admin ID', 'Action', 'Target Type', 'Target ID', 'Details'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp.toISOString(),
        log.adminId,
        log.action,
        log.targetType,
        log.targetId,
        JSON.stringify(log.details).replace(/,/g, ';')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getActionIcon = (action: string) => {
    if (action.includes('create') || action.includes('add')) {
      return <Activity className="text-green-500" size={16} />;
    } else if (action.includes('delete') || action.includes('remove')) {
      return <Trash2 className="text-red-500" size={16} />;
    } else if (action.includes('update') || action.includes('modify')) {
      return <Settings className="text-blue-500" size={16} />;
    } else if (action.includes('verify') || action.includes('approve')) {
      return <Shield className="text-green-500" size={16} />;
    } else if (action.includes('suspend') || action.includes('ban')) {
      return <AlertTriangle className="text-yellow-500" size={16} />;
    }
    return <FileText className="text-gray-500" size={16} />;
  };

  const getTargetTypeColor = (targetType: string) => {
    switch (targetType) {
      case 'user':
        return 'bg-blue-100 text-blue-800';
      case 'deal':
        return 'bg-green-100 text-green-800';
      case 'price':
        return 'bg-purple-100 text-purple-800';
      case 'content':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatActionName = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const filteredLogs = logs.filter(log => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (
        !log.action.toLowerCase().includes(searchLower) &&
        !log.targetId.toLowerCase().includes(searchLower) &&
        !log.adminId.toLowerCase().includes(searchLower) &&
        !JSON.stringify(log.details).toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    if (filters.adminId && log.adminId !== filters.adminId) {
      return false;
    }

    if (filters.action && log.action !== filters.action) {
      return false;
    }

    if (filters.targetType && log.targetType !== filters.targetType) {
      return false;
    }

    if (filters.dateRange) {
      const logDate = new Date(log.timestamp);
      if (logDate < filters.dateRange.start || logDate > filters.dateRange.end) {
        return false;
      }
    }

    return true;
  });

  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));
  const uniqueAdmins = Array.from(new Set(logs.map(log => log.adminId)));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <RefreshCw className="animate-spin" size={20} />
          <span>Loading audit logs...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Audit Logs</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadAuditLogs}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
          <p className="text-gray-600">Complete trail of administrative actions</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={exportLogs}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Download size={18} />
            Export
          </button>
          <button
            onClick={loadAuditLogs}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search logs by action, admin, target, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Filter size={18} />
          Filters
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin</label>
              <select
                value={filters.adminId || ''}
                onChange={(e) => handleFilterChange('adminId', e.target.value || undefined)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Admins</option>
                {uniqueAdmins.map(adminId => (
                  <option key={adminId} value={adminId}>{adminId}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <select
                value={filters.action || ''}
                onChange={(e) => handleFilterChange('action', e.target.value || undefined)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Actions</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>{formatActionName(action)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Type</label>
              <select
                value={filters.targetType || ''}
                onChange={(e) => handleFilterChange('targetType', e.target.value || undefined)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Types</option>
                <option value="user">User</option>
                <option value="deal">Deal</option>
                <option value="price">Price</option>
                <option value="content">Content</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <FileText className="text-blue-500" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total Logs</p>
              <p className="text-xl font-bold">{filteredLogs.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <User className="text-green-500" size={24} />
            <div>
              <p className="text-sm text-gray-600">Active Admins</p>
              <p className="text-xl font-bold">{uniqueAdmins.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Activity className="text-purple-500" size={24} />
            <div>
              <p className="text-sm text-gray-600">Action Types</p>
              <p className="text-xl font-bold">{uniqueActions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Clock className="text-orange-500" size={24} />
            <div>
              <p className="text-sm text-gray-600">Last 24h</p>
              <p className="text-xl font-bold">
                {filteredLogs.filter(log => 
                  new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                ).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="text-gray-400" size={14} />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {log.timestamp.toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {log.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="text-gray-400" size={14} />
                      <span className="text-sm font-mono text-gray-900">
                        {log.adminId.substring(0, 8)}...
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      <span className="text-sm font-medium text-gray-900">
                        {formatActionName(log.action)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTargetTypeColor(log.targetType)}`}>
                        {log.targetType}
                      </span>
                      <span className="text-sm font-mono text-gray-600">
                        {log.targetId.substring(0, 8)}...
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details).substring(0, 50) + '...' : 'No details'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedLog(log);
                        setShowDetails(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-500">No audit logs found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Audit Log Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                    <p className="text-sm text-gray-900">{selectedLog.timestamp.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin ID</label>
                    <p className="text-sm font-mono text-gray-900">{selectedLog.adminId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Action</label>
                    <p className="text-sm text-gray-900">{formatActionName(selectedLog.action)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Target Type</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTargetTypeColor(selectedLog.targetType)}`}>
                      {selectedLog.targetType}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target ID</label>
                  <p className="text-sm font-mono text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedLog.targetId}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Details</label>
                  <pre className="text-sm text-gray-900 bg-gray-50 p-4 rounded overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;