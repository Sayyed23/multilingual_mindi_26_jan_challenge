import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  DollarSign,
  Calendar,
  Filter,
  Search,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  MessageSquare
} from 'lucide-react';
import DealManagement from '../components/DealManagement';
import { dealManagementService } from '../services/dealManagement';
import { useAuth } from '../hooks/useAuth';
import type { Deal, DealStatus } from '../types';

const DealsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DealStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'value' | 'status'>('date');
  const [showDealDetails, setShowDealDetails] = useState(false);

  useEffect(() => {
    if (user) {
      loadDeals();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortDeals();
  }, [deals, searchTerm, statusFilter, sortBy]);

  const loadDeals = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userDeals = await dealManagementService.getUserDeals(user.uid);
      setDeals(userDeals);
    } catch (error) {
      console.error('Failed to load deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortDeals = () => {
    let filtered = deals;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(deal =>
        deal.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(deal => deal.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        case 'value':
          return (b.agreedPrice * b.quantity) - (a.agreedPrice * a.quantity);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredDeals(filtered);
  };

  const getStatusColor = (status: DealStatus) => {
    switch (status) {
      case 'agreed': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'disputed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: DealStatus) => {
    switch (status) {
      case 'agreed': return <Clock className="h-4 w-4" />;
      case 'paid': return <DollarSign className="h-4 w-4" />;
      case 'delivered': return <Package className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'disputed': return <AlertTriangle className="h-4 w-4" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getDealStats = () => {
    const stats = {
      total: deals.length,
      active: deals.filter(d => ['agreed', 'paid', 'delivered'].includes(d.status)).length,
      completed: deals.filter(d => d.status === 'completed').length,
      disputed: deals.filter(d => d.status === 'disputed').length,
      totalValue: deals.reduce((sum, d) => sum + (d.agreedPrice * d.quantity), 0)
    };
    return stats;
  };

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setShowDealDetails(true);
  };

  const handleNewNegotiation = () => {
    // Navigate to market to start a new negotiation from a commodity
    navigate('/market');
  };

  const stats = getDealStats();

  if (loading && deals.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Deals</h1>
          <p className="text-gray-500">Manage your trading agreements and transactions</p>
        </div>
        <button
          onClick={handleNewNegotiation}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Negotiation
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Deals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Disputed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.disputed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search deals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as DealStatus | 'all')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="agreed">Agreed</option>
              <option value="paid">Paid</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="disputed">Disputed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'value' | 'status')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="date">Sort by Date</option>
              <option value="value">Sort by Value</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Deals List or Detail View */}
      {showDealDetails && selectedDeal ? (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Deal Details</h2>
            <button
              onClick={() => setShowDealDetails(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <DealManagement
            dealId={selectedDeal.id}
            onDealUpdate={(updatedDeal) => {
              setDeals(prev => prev.map(d => d.id === updatedDeal.id ? updatedDeal : d));
              setSelectedDeal(updatedDeal);
            }}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Deals ({filteredDeals.length})
            </h2>
          </div>

          {filteredDeals.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleDealClick(deal)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {deal.commodity}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(deal.status)}`}>
                          {getStatusIcon(deal.status)}
                          <span className="ml-1 capitalize">{deal.status}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-1" />
                          {deal.quantity} {deal.unit}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          ₹{deal.agreedPrice.toLocaleString()} per {deal.unit}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {deal.deliveryTerms.expectedDate.toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          ₹{(deal.agreedPrice * deal.quantity).toLocaleString()} total
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/negotiations/${deal.id}?view=deal`);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/negotiations/${deal.id}/chat`);
                        }}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                        title="Chat"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No deals found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Start your first negotiation to create deals'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <button
                  onClick={handleNewNegotiation}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
                >
                  Start Negotiating
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DealsPage;