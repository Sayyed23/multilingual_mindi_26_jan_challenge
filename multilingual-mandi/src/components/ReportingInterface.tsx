// Reporting Interface Component
// Provides interface for reporting suspicious behavior and managing reports

import React, { useState, useEffect } from 'react';
import {
  Flag,
  AlertTriangle,
  Shield,
  User,
  MessageSquare,
  Package,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye
} from 'lucide-react';
import { trustSystemService } from '../services/trustSystem';
import type { ContentReport } from '../types';

interface ReportingInterfaceProps {
  currentUserId: string;
  userRole: 'user' | 'admin' | 'moderator';
  className?: string;
}

export const ReportingInterface: React.FC<ReportingInterfaceProps> = ({
  currentUserId,
  userRole,
  className = ''
}) => {
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    dateRange: '30'
  });

  // Report form state
  const [reportForm, setReportForm] = useState({
    targetType: 'user' as 'user' | 'message' | 'deal',
    targetId: '',
    reason: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (userRole === 'admin' || userRole === 'moderator') {
      loadReports();
    }
  }, [userRole, filters]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, this would be an admin service call
      // For now, we'll simulate loading reports
      const mockReports: ContentReport[] = [
        {
          id: '1',
          reporterId: 'user1',
          targetType: 'user',
          targetId: 'user2',
          reason: 'Fraudulent activity',
          description: 'User is posting fake commodity prices',
          status: 'pending',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          resolvedAt: undefined,
          resolution: undefined
        },
        {
          id: '2',
          reporterId: 'user3',
          targetType: 'message',
          targetId: 'msg1',
          reason: 'Spam',
          description: 'Sending unwanted promotional messages',
          status: 'investigating',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          resolvedAt: undefined,
          resolution: undefined
        }
      ];

      setReports(mockReports);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!reportForm.targetId || !reportForm.reason) return;

    try {
      setSubmitting(true);
      await trustSystemService.reportUser(currentUserId, reportForm.targetId, reportForm.reason);
      
      setShowReportModal(false);
      setReportForm({
        targetType: 'user',
        targetId: '',
        reason: '',
        description: ''
      });
      
      alert('Report submitted successfully. Our team will review it shortly.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveReport = async (reportId: string, resolution: string) => {
    try {
      // In a real implementation, this would update the report status
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, status: 'resolved', resolution, resolvedAt: new Date() }
          : report
      ));
      
      alert('Report resolved successfully');
    } catch (err) {
      alert('Failed to resolve report');
    }
  };

  const handleDismissReport = async (reportId: string) => {
    try {
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, status: 'dismissed', resolvedAt: new Date() }
          : report
      ));
      
      alert('Report dismissed');
    } catch (err) {
      alert('Failed to dismiss report');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'investigating':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'dismissed':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'investigating':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getTargetTypeIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="w-4 h-4" />;
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      case 'deal':
        return <Package className="w-4 h-4" />;
      default:
        return <Flag className="w-4 h-4" />;
    }
  };

  const filteredReports = reports.filter(report => {
    if (filters.status !== 'all' && report.status !== filters.status) return false;
    if (filters.type !== 'all' && report.targetType !== filters.type) return false;
    
    const daysDiff = Math.floor((Date.now() - report.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    if (filters.dateRange !== 'all' && daysDiff > parseInt(filters.dateRange)) return false;
    
    return true;
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <>
      <div className={`bg-white rounded-lg border ${className}`}>
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                {userRole === 'user' ? 'Report Issues' : 'Content Reports'}
              </h2>
            </div>
            
            {userRole === 'user' && (
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <Flag className="w-4 h-4" />
                Submit Report
              </button>
            )}
          </div>
        </div>

        {/* Admin/Moderator View */}
        {(userRole === 'admin' || userRole === 'moderator') && (
          <>
            {/* Filters */}
            <div className="p-6 border-b bg-gray-50">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>

                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="user">User Reports</option>
                  <option value="message">Message Reports</option>
                  <option value="deal">Deal Reports</option>
                </select>

                <select
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="px-3 py-2 border rounded-md text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
              </div>
            </div>

            {/* Reports List */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-600 py-12">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{error}</p>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No reports found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReports.map(report => (
                    <div key={report.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getTargetTypeIcon(report.targetType)}
                          <div>
                            <h4 className="font-medium text-gray-900">{report.reason}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>Target: {report.targetType} ({report.targetId})</span>
                              <span>•</span>
                              <span>{formatDate(report.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                            {getStatusIcon(report.status)}
                            <span className="ml-1">{report.status}</span>
                          </span>
                        </div>
                      </div>

                      {report.description && (
                        <p className="text-sm text-gray-700 mb-3">{report.description}</p>
                      )}

                      {report.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleResolveReport(report.id, 'Action taken against reported content')}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => handleDismissReport(report.id)}
                            className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      )}

                      {report.resolution && (
                        <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                          <strong>Resolution:</strong> {report.resolution}
                          {report.resolvedAt && (
                            <div className="text-gray-600 mt-1">
                              Resolved on {formatDate(report.resolvedAt)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* User View */}
        {userRole === 'user' && (
          <div className="p-6">
            <div className="text-center text-gray-600">
              <Flag className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Report Issues</h3>
              <p className="mb-4">
                Help us maintain a safe and trustworthy platform by reporting suspicious behavior, 
                fraudulent activities, or inappropriate content.
              </p>
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-2 mx-auto px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <Flag className="w-5 h-5" />
                Submit a Report
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Report Submission Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Report</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Report Type
                  </label>
                  <select
                    value={reportForm.targetType}
                    onChange={(e) => setReportForm(prev => ({ ...prev, targetType: e.target.value as any }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="user">User</option>
                    <option value="message">Message</option>
                    <option value="deal">Deal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target ID
                  </label>
                  <input
                    type="text"
                    value={reportForm.targetId}
                    onChange={(e) => setReportForm(prev => ({ ...prev, targetId: e.target.value }))}
                    placeholder="Enter user ID, message ID, or deal ID"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason
                  </label>
                  <select
                    value={reportForm.reason}
                    onChange={(e) => setReportForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">Select a reason</option>
                    <option value="fraud">Fraudulent activity</option>
                    <option value="spam">Spam or unwanted messages</option>
                    <option value="harassment">Harassment or abuse</option>
                    <option value="fake_profile">Fake profile or information</option>
                    <option value="inappropriate_content">Inappropriate content</option>
                    <option value="price_manipulation">Price manipulation</option>
                    <option value="fake_deals">Fake deals or offers</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={reportForm.description}
                    onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide additional details about the issue..."
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={handleSubmitReport}
                  disabled={!reportForm.targetId || !reportForm.reason || submitting}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportForm({
                      targetType: 'user',
                      targetId: '',
                      reason: '',
                      description: ''
                    });
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Report Details</h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Report ID</label>
                    <p className="text-sm text-gray-900">{selectedReport.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedReport.status)}`}>
                      {getStatusIcon(selectedReport.status)}
                      {selectedReport.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Target Type</label>
                    <p className="text-sm text-gray-900">{selectedReport.targetType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Target ID</label>
                    <p className="text-sm text-gray-900">{selectedReport.targetId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reporter ID</label>
                    <p className="text-sm text-gray-900">{selectedReport.reporterId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedReport.createdAt)}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <p className="text-sm text-gray-900">{selectedReport.reason}</p>
                </div>

                {selectedReport.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="text-sm text-gray-900">{selectedReport.description}</p>
                  </div>
                )}

                {selectedReport.resolution && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Resolution</label>
                    <p className="text-sm text-gray-900">{selectedReport.resolution}</p>
                    {selectedReport.resolvedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Resolved on {formatDate(selectedReport.resolvedAt)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {selectedReport.status === 'pending' && (
                <div className="flex items-center gap-3 mt-6 pt-4 border-t">
                  <button
                    onClick={() => {
                      handleResolveReport(selectedReport.id, 'Action taken against reported content');
                      setSelectedReport(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Resolve Report
                  </button>
                  <button
                    onClick={() => {
                      handleDismissReport(selectedReport.id);
                      setSelectedReport(null);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Dismiss Report
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportingInterface;