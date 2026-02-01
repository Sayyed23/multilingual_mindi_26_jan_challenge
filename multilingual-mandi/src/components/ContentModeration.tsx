// Content Moderation Component
// Handles content reports, disputes, and violation management
// Provides investigation tools and resolution workflows

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  User,
  FileText,
  Search,
  Filter
} from 'lucide-react';
import { contentModerationService } from '../services/contentModerationService';
import type { ContentReport, Dispute } from '../types';

interface ContentModerationProps {
  onReportSelect?: (report: ContentReport) => void;
  onDisputeSelect?: (dispute: Dispute) => void;
}

const ContentModeration: React.FC<ContentModerationProps> = ({
  onReportSelect,
  onDisputeSelect
}) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'disputes'>('reports');
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'reports') {
        const result = await contentModerationService.getContentReports(
          statusFilter as any || undefined,
          50
        );
        setReports(result.reports);
      } else {
        const result = await contentModerationService.getDisputes(
          statusFilter as any || undefined,
          50
        );
        setDisputes(result.disputes);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInvestigateReport = async (reportId: string) => {
    try {
      const notes = prompt('Investigation notes (optional):');
      await contentModerationService.investigateReport(reportId, notes || undefined);
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to start investigation');
    }
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      const resolution = prompt('Resolution details:');
      if (!resolution) return;

      const action = prompt('Action to take (warn_user, suspend_user, delete_content, no_action):');
      if (!action) return;

      await contentModerationService.resolveReport(
        reportId,
        resolution,
        action as any
      );
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to resolve report');
    }
  };

  const handleResolveDispute = async (disputeId: string) => {
    try {
      const resolution = prompt('Resolution type (refund, replacement, partial_refund, no_action, escalate):');
      if (!resolution) return;

      const reasoning = prompt('Reasoning for this resolution:');
      if (!reasoning) return;

      let compensation;
      if (resolution === 'refund' || resolution === 'partial_refund') {
        const amount = prompt('Compensation amount:');
        const recipient = prompt('Recipient user ID:');
        const method = prompt('Payment method:');
        
        if (amount && recipient && method) {
          compensation = {
            amount: parseFloat(amount),
            recipient,
            method
          };
        }
      }

      await contentModerationService.resolveDispute(
        disputeId,
        resolution as any,
        reasoning,
        compensation
      );
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to resolve dispute');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock size={12} className="mr-1" />
            Pending
          </span>
        );
      case 'investigating':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Eye size={12} className="mr-1" />
            Investigating
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" />
            Resolved
          </span>
        );
      case 'dismissed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircle size={12} className="mr-1" />
            Dismissed
          </span>
        );
      case 'open':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle size={12} className="mr-1" />
            Open
          </span>
        );
      case 'escalated':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Shield size={12} className="mr-1" />
            Escalated
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const getTargetTypeIcon = (targetType: string) => {
    switch (targetType) {
      case 'user':
        return <User size={16} className="text-blue-500" />;
      case 'message':
        return <MessageSquare size={16} className="text-green-500" />;
      case 'deal':
        return <FileText size={16} className="text-purple-500" />;
      default:
        return <AlertTriangle size={16} className="text-gray-500" />;
    }
  };

  const filteredReports = reports.filter(report =>
    report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.targetId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDisputes = disputes.filter(dispute =>
    dispute.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dispute.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dispute.dealId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2">Loading content moderation data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadData}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Content Reports ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'disputes'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Disputes ({disputes.length})
          </button>
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Statuses</option>
            {activeTab === 'reports' ? (
              <>
                <option value="pending">Pending</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </>
            ) : (
              <>
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="escalated">Escalated</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Content Reports */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{report.reason}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {report.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getTargetTypeIcon(report.targetType)}
                        <div>
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {report.targetType}
                          </div>
                          <div className="text-sm text-gray-500 font-mono">
                            {report.targetId.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {report.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onReportSelect?.(report)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        
                        {report.status === 'pending' && (
                          <button
                            onClick={() => handleInvestigateReport(report.id)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Start Investigation"
                          >
                            <Search size={16} />
                          </button>
                        )}
                        
                        {(report.status === 'investigating' || report.status === 'pending') && (
                          <button
                            onClick={() => handleResolveReport(report.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Resolve Report"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No content reports found</p>
            </div>
          )}
        </div>
      )}

      {/* Disputes */}
      {activeTab === 'disputes' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dispute
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deal ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDisputes.map((dispute) => (
                  <tr key={dispute.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{dispute.reason}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {dispute.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono text-gray-900">
                        {dispute.dealId.substring(0, 12)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(dispute.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {dispute.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onDisputeSelect?.(dispute)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        
                        {(dispute.status === 'open' || dispute.status === 'investigating') && (
                          <button
                            onClick={() => handleResolveDispute(dispute.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Resolve Dispute"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredDisputes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No disputes found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentModeration;