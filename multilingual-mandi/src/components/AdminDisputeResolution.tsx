// Admin Dispute Resolution Component
// Provides structured workflows for resolving user disputes
// Handles investigation, mediation, and resolution processes

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Eye,
  User,
  DollarSign,
  FileText,
  Search,
  Filter,
  Calendar,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { contentModerationService } from '../services/contentModerationService';
import type { Dispute } from '../types';

interface DisputeFilters {
  status?: 'open' | 'investigating' | 'resolved' | 'escalated';
  dateRange?: {
    start: Date;
    end: Date;
  };
  reason?: string;
}

interface ResolutionAction {
  type: 'refund' | 'replacement' | 'partial_refund' | 'no_action' | 'escalate';
  label: string;
  description: string;
  requiresCompensation: boolean;
  color: string;
}

const AdminDisputeResolution: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [filters, setFilters] = useState<DisputeFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [resolutionForm, setResolutionForm] = useState({
    type: '' as ResolutionAction['type'],
    reasoning: '',
    compensation: {
      amount: 0,
      recipient: '',
      method: 'upi'
    }
  });

  const resolutionActions: ResolutionAction[] = [
    {
      type: 'refund',
      label: 'Full Refund',
      description: 'Refund the full amount to the buyer',
      requiresCompensation: true,
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      type: 'partial_refund',
      label: 'Partial Refund',
      description: 'Refund a portion of the amount',
      requiresCompensation: true,
      color: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      type: 'replacement',
      label: 'Replacement',
      description: 'Arrange for product replacement',
      requiresCompensation: false,
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    {
      type: 'no_action',
      label: 'No Action',
      description: 'Dismiss the dispute without action',
      requiresCompensation: false,
      color: 'bg-gray-100 text-gray-800 border-gray-200'
    },
    {
      type: 'escalate',
      label: 'Escalate',
      description: 'Escalate to senior management',
      requiresCompensation: false,
      color: 'bg-red-100 text-red-800 border-red-200'
    }
  ];

  useEffect(() => {
    loadDisputes();
  }, [filters]);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await contentModerationService.getDisputes(filters.status, 100);
      setDisputes(result.disputes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDispute = async () => {
    if (!selectedDispute || !resolutionForm.type || !resolutionForm.reasoning) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const compensation = resolutionActions.find(a => a.type === resolutionForm.type)?.requiresCompensation
        ? resolutionForm.compensation
        : undefined;

      await contentModerationService.resolveDispute(
        selectedDispute.id,
        resolutionForm.type,
        resolutionForm.reasoning,
        compensation
      );

      setShowResolutionModal(false);
      setSelectedDispute(null);
      setResolutionForm({
        type: '' as ResolutionAction['type'],
        reasoning: '',
        compensation: { amount: 0, recipient: '', method: 'upi' }
      });
      loadDisputes();
      alert('Dispute resolved successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to resolve dispute');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle size={12} className="mr-1" />
            Open
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
      case 'escalated':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <ArrowRight size={12} className="mr-1" />
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

  const getPriorityColor = (reason: string) => {
    const highPriorityReasons = ['fraud', 'payment_issue', 'quality_issue'];
    const mediumPriorityReasons = ['delivery_delay', 'communication_issue'];
    
    if (highPriorityReasons.some(r => reason.toLowerCase().includes(r))) {
      return 'border-l-4 border-red-500';
    } else if (mediumPriorityReasons.some(r => reason.toLowerCase().includes(r))) {
      return 'border-l-4 border-yellow-500';
    }
    return 'border-l-4 border-green-500';
  };

  const filteredDisputes = disputes.filter(dispute => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (
        !dispute.reason.toLowerCase().includes(searchLower) &&
        !dispute.description.toLowerCase().includes(searchLower) &&
        !dispute.dealId.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    if (filters.reason && !dispute.reason.toLowerCase().includes(filters.reason.toLowerCase())) {
      return false;
    }

    if (filters.dateRange) {
      const disputeDate = new Date(dispute.createdAt);
      if (disputeDate < filters.dateRange.start || disputeDate > filters.dateRange.end) {
        return false;
      }
    }

    return true;
  });

  const disputeStats = {
    total: filteredDisputes.length,
    open: filteredDisputes.filter(d => d.status === 'open').length,
    investigating: filteredDisputes.filter(d => d.status === 'investigating').length,
    resolved: filteredDisputes.filter(d => d.status === 'resolved').length,
    escalated: filteredDisputes.filter(d => d.status === 'escalated').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <RefreshCw className="animate-spin" size={20} />
          <span>Loading disputes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Disputes</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={loadDisputes}
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
          <h2 className="text-2xl font-bold text-gray-900">Dispute Resolution</h2>
          <p className="text-gray-600">Manage and resolve user disputes</p>
        </div>
        <button
          onClick={loadDisputes}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <FileText className="text-gray-500" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold">{disputeStats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-500" size={24} />
            <div>
              <p className="text-sm text-gray-600">Open</p>
              <p className="text-xl font-bold text-red-600">{disputeStats.open}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <Eye className="text-blue-500" size={24} />
            <div>
              <p className="text-sm text-gray-600">Investigating</p>
              <p className="text-xl font-bold text-blue-600">{disputeStats.investigating}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-500" size={24} />
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-xl font-bold text-green-600">{disputeStats.resolved}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <ArrowRight className="text-purple-500" size={24} />
            <div>
              <p className="text-sm text-gray-600">Escalated</p>
              <p className="text-xl font-bold text-purple-600">{disputeStats.escalated}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search disputes by reason, description, or deal ID..."
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any || undefined }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="escalated">Escalated</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <input
                type="text"
                placeholder="Filter by reason..."
                value={filters.reason || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, reason: e.target.value || undefined }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({})}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disputes List */}
      <div className="space-y-4">
        {filteredDisputes.map((dispute) => (
          <div key={dispute.id} className={`bg-white rounded-lg shadow p-6 ${getPriorityColor(dispute.reason)}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <h3 className="text-lg font-medium text-gray-900">{dispute.reason}</h3>
                  {getStatusBadge(dispute.status)}
                  <span className="text-sm text-gray-500">
                    Deal: {dispute.dealId.substring(0, 8)}...
                  </span>
                </div>
                
                <p className="text-gray-700 mb-4">{dispute.description}</p>
                
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>Raised by: {dispute.raisedBy.substring(0, 8)}...</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{dispute.createdAt.toLocaleDateString()}</span>
                  </div>
                  {dispute.resolvedAt && (
                    <div className="flex items-center gap-1">
                      <CheckCircle size={14} />
                      <span>Resolved: {dispute.resolvedAt.toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {dispute.resolution && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Resolution:</strong> {dispute.resolution}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => setSelectedDispute(dispute)}
                  className="text-blue-600 hover:text-blue-900 p-2"
                  title="View Details"
                >
                  <Eye size={18} />
                </button>
                
                {(dispute.status === 'open' || dispute.status === 'investigating') && (
                  <button
                    onClick={() => {
                      setSelectedDispute(dispute);
                      setShowResolutionModal(true);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredDisputes.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-500">No disputes found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Resolution Modal */}
      {showResolutionModal && selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Resolve Dispute</h3>
                <button
                  onClick={() => setShowResolutionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Dispute Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">{selectedDispute.reason}</h4>
                  <p className="text-sm text-gray-700">{selectedDispute.description}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Deal ID: {selectedDispute.dealId} | Raised by: {selectedDispute.raisedBy}
                  </div>
                </div>

                {/* Resolution Actions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Resolution Action</label>
                  <div className="grid grid-cols-1 gap-3">
                    {resolutionActions.map((action) => (
                      <label key={action.type} className="cursor-pointer">
                        <input
                          type="radio"
                          name="resolutionType"
                          value={action.type}
                          checked={resolutionForm.type === action.type}
                          onChange={(e) => setResolutionForm(prev => ({ ...prev, type: e.target.value as any }))}
                          className="sr-only"
                        />
                        <div className={`p-4 border-2 rounded-lg transition-colors ${
                          resolutionForm.type === action.type 
                            ? action.color + ' border-current' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <div className="flex justify-between items-center">
                            <div>
                              <h5 className="font-medium">{action.label}</h5>
                              <p className="text-sm text-gray-600">{action.description}</p>
                            </div>
                            {action.requiresCompensation && (
                              <DollarSign size={20} className="text-green-500" />
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Compensation Details */}
                {resolutionForm.type && resolutionActions.find(a => a.type === resolutionForm.type)?.requiresCompensation && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Compensation Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                        <input
                          type="number"
                          value={resolutionForm.compensation.amount}
                          onChange={(e) => setResolutionForm(prev => ({
                            ...prev,
                            compensation: { ...prev.compensation, amount: parseFloat(e.target.value) || 0 }
                          }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                        <select
                          value={resolutionForm.compensation.method}
                          onChange={(e) => setResolutionForm(prev => ({
                            ...prev,
                            compensation: { ...prev.compensation, method: e.target.value }
                          }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="upi">UPI</option>
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="wallet">Wallet</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Recipient User ID</label>
                      <input
                        type="text"
                        value={resolutionForm.compensation.recipient}
                        onChange={(e) => setResolutionForm(prev => ({
                          ...prev,
                          compensation: { ...prev.compensation, recipient: e.target.value }
                        }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter user ID to receive compensation"
                      />
                    </div>
                  </div>
                )}

                {/* Reasoning */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Reasoning</label>
                  <textarea
                    value={resolutionForm.reasoning}
                    onChange={(e) => setResolutionForm(prev => ({ ...prev, reasoning: e.target.value }))}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Explain the reasoning behind this resolution..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <button
                  onClick={() => setShowResolutionModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolveDispute}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Resolve Dispute
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDisputeResolution;