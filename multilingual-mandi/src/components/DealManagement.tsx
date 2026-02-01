import React, { useState, useEffect } from 'react';
import {
  Package,
  DollarSign,
  Truck,
  Clock,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  MapPin,
  Calendar,
  User,
  FileText,
  RefreshCw,
  MessageSquare
} from 'lucide-react';
import { dealManagementService, paymentProcessor, dealCompletionManager } from '../services/dealManagement';
import { useAuth } from '../hooks/useAuth';
import type {
  Deal,
  DealStatus,
  PaymentMethod,
  DeliveryStatus
} from '../types';

interface DealManagementProps {
  dealId?: string;
  showAllDeals?: boolean;
  onDealUpdate?: (deal: Deal) => void;
}

const DealManagement: React.FC<DealManagementProps> = ({
  dealId,
  showAllDeals = false,
  onDealUpdate
}) => {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('upi');
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'payment' | 'delivery' | 'history'>('details');

  useEffect(() => {
    if (dealId) {
      loadSingleDeal();
    } else if (showAllDeals && user) {
      loadUserDeals();
    }
  }, [dealId, showAllDeals, user]);

  useEffect(() => {
    if (selectedDeal) {
      loadDealDetails();
    }
  }, [selectedDeal]);

  const loadSingleDeal = async () => {
    if (!dealId) return;

    try {
      setLoading(true);
      const deal = await dealManagementService.getDeal(dealId);
      if (deal) {
        setSelectedDeal(deal);
        setDeals([deal]);
      }
    } catch (error) {
      console.error('Failed to load deal:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserDeals = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userDeals = await dealManagementService.getUserDeals(user.uid);
      setDeals(userDeals);
      if (userDeals.length > 0 && !selectedDeal) {
        setSelectedDeal(userDeals[0]);
      }
    } catch (error) {
      console.error('Failed to load user deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDealDetails = async () => {
    if (!selectedDeal) return;

    try {
      // Load delivery status
      if (['paid', 'delivered'].includes(selectedDeal.status)) {
        const delivery = await dealManagementService.trackDelivery(selectedDeal.id);
        setDeliveryStatus(delivery);
      }

      // Load available payment methods
      const methods: PaymentMethod[] = ['upi', 'bank_transfer', 'cash', 'credit', 'wallet'];
      setPaymentMethods(methods);
      if (methods.length > 0) {
        setSelectedPaymentMethod(methods[0]);
      }
    } catch (error) {
      console.error('Failed to load deal details:', error);
    }
  };

  const updateDealStatus = async (status: DealStatus) => {
    if (!selectedDeal) return;

    try {
      setLoading(true);
      await dealManagementService.updateDealStatus(selectedDeal.id, status);

      const updatedDeal = { ...selectedDeal, status, updatedAt: new Date() };
      setSelectedDeal(updatedDeal);

      // Update deals list
      setDeals(prev => prev.map(deal =>
        deal.id === selectedDeal.id ? updatedDeal : deal
      ));

      onDealUpdate?.(updatedDeal);
    } catch (error) {
      console.error('Failed to update deal status:', error);
      alert('Failed to update deal status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async () => {
    if (!selectedDeal) return;

    try {
      setPaymentLoading(true);
      const result = await dealManagementService.initializePayment(
        selectedDeal.id,
        selectedPaymentMethod
      );

      if (result.success) {
        alert('Payment processed successfully!');
        await updateDealStatus('paid');
      } else {
        // Try fallback payment methods
        const fallbackMethods = paymentMethods.filter(m => m !== selectedPaymentMethod);
        if (fallbackMethods.length > 0) {
          const fallbackResult = await paymentProcessor.processMultiplePaymentMethods(
            selectedDeal.id,
            selectedPaymentMethod,
            fallbackMethods
          );

          if (fallbackResult.success) {
            alert('Payment processed successfully with fallback method!');
            await updateDealStatus('paid');
          } else {
            alert(`Payment failed: ${fallbackResult.error}`);
          }
        } else {
          alert(`Payment failed: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Payment processing failed:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const confirmDelivery = async () => {
    if (!selectedDeal) return;

    try {
      setLoading(true);
      await dealCompletionManager.completeDeal(selectedDeal.id, {
        deliveryConfirmed: true,
        qualityAccepted: true,
        paymentReceived: true,
        additionalNotes: 'Delivery confirmed by user'
      });

      await updateDealStatus('completed');
      alert('Deal completed successfully!');
    } catch (error) {
      console.error('Failed to confirm delivery:', error);
      alert('Failed to confirm delivery. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const raiseDispute = async () => {
    if (!selectedDeal) return;

    const reason = prompt('Please describe the reason for the dispute:');
    if (!reason) return;

    try {
      setLoading(true);
      if (!user) {
        alert('You must be logged in to raise a dispute');
        return;
      }

      setLoading(true);
      await dealManagementService.raiseDispute(selectedDeal.id, reason, user);
      await updateDealStatus('disputed');
      alert('Dispute raised successfully. Our team will review it shortly.');
    } catch (error) {
      console.error('Failed to raise dispute:', error);
      alert('Failed to raise dispute. Please try again.');
    } finally {
      setLoading(false);
    }
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
      case 'agreed': return <FileText className="h-4 w-4" />;
      case 'paid': return <CreditCard className="h-4 w-4" />;
      case 'delivered': return <Truck className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'disputed': return <AlertTriangle className="h-4 w-4" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const canProcessPayment = () => {
    return selectedDeal?.status === 'agreed' && user?.uid === selectedDeal.buyerId;
  };

  const canConfirmDelivery = () => {
    return selectedDeal?.status === 'delivered' && user?.uid === selectedDeal.buyerId;
  };

  const canRaiseDispute = () => {
    return selectedDeal && ['paid', 'delivered', 'agreed'].includes(selectedDeal.status);
  };

  if (loading && deals.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">No deals found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full bg-gray-50">
      {/* Deals List (if showing all deals) */}
      {showAllDeals && (
        <div className="lg:w-1/3 bg-white border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">My Deals</h2>
          </div>
          <div className="overflow-y-auto">
            {deals.map((deal) => (
              <div
                key={deal.id}
                onClick={() => setSelectedDeal(deal)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedDeal?.id === deal.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{deal.commodity}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
                    {deal.status}
                  </span>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <div className="flex items-center">
                    <Package className="h-3 w-3 mr-1" />
                    {deal.quantity} {deal.unit}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    ₹{deal.agreedPrice.toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {deal.deliveryTerms.expectedDate.toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deal Details */}
      {selectedDeal && (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  {getStatusIcon(selectedDeal.status)}
                  <span className="ml-2">{selectedDeal.commodity} Deal</span>
                </h1>
                <p className="text-gray-500 mt-1">Deal ID: {selectedDeal.id.substring(0, 12)}...</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">
                  ₹{(selectedDeal.agreedPrice * selectedDeal.quantity).toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Total Value</div>
              </div>
            </div>

            <div className="flex items-center space-x-6 mt-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedDeal.status)}`}>
                {selectedDeal.status.toUpperCase()}
              </span>
              <span className="text-sm text-gray-500">
                Updated {selectedDeal.updatedAt.toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['details', 'payment', 'delivery', 'history'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Deal Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Deal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Commodity</label>
                      <p className="text-gray-900">{selectedDeal.commodity}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quality</label>
                      <p className="text-gray-900 capitalize">{selectedDeal.quality}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <p className="text-gray-900">{selectedDeal.quantity} {selectedDeal.unit}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price per Unit</label>
                      <p className="text-gray-900">₹{selectedDeal.agreedPrice.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Location</label>
                      <p className="text-gray-900 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {selectedDeal.deliveryTerms.location.city}, {selectedDeal.deliveryTerms.location.state}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expected Date</label>
                      <p className="text-gray-900 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {selectedDeal.deliveryTerms.expectedDate.toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Method</label>
                      <p className="text-gray-900 capitalize">{selectedDeal.deliveryTerms.method}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Cost</label>
                      <p className="text-gray-900">₹{selectedDeal.deliveryTerms.cost.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Participants */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Participants</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Buyer</label>
                      <p className="text-gray-900 flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {selectedDeal.buyerId.substring(0, 12)}...
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Seller</label>
                      <p className="text-gray-900 flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {selectedDeal.sellerId.substring(0, 12)}...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="space-y-6">
                {/* Payment Status */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Status</h3>
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${selectedDeal.status === 'paid' || selectedDeal.status === 'delivered' || selectedDeal.status === 'completed'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-600'
                      }`}>
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {selectedDeal.status === 'paid' || selectedDeal.status === 'delivered' || selectedDeal.status === 'completed'
                          ? 'Payment Completed'
                          : 'Payment Pending'
                        }
                      </p>
                      <p className="text-sm text-gray-500">
                        Total Amount: ₹{(selectedDeal.agreedPrice * selectedDeal.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                {canProcessPayment() && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Process Payment</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Payment Method
                        </label>
                        <select
                          value={selectedPaymentMethod}
                          onChange={(e) => setSelectedPaymentMethod(e.target.value as PaymentMethod)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          {paymentMethods.map((method) => (
                            <option key={method} value={method}>
                              {method.toUpperCase().replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={processPayment}
                        disabled={paymentLoading}
                        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {paymentLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <CreditCard className="h-4 w-4 mr-2" />
                        )}
                        Process Payment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'delivery' && (
              <div className="space-y-6">
                {/* Delivery Status */}
                {deliveryStatus && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Tracking</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${deliveryStatus.status === 'delivered' ? 'bg-green-100 text-green-600' :
                          deliveryStatus.status === 'in_transit' ? 'bg-blue-100 text-blue-600' :
                            deliveryStatus.status === 'delayed' ? 'bg-red-100 text-red-600' :
                              'bg-gray-100 text-gray-600'
                          }`}>
                          <Truck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 capitalize">
                            {deliveryStatus.status.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-gray-500">
                            Expected: {deliveryStatus.trackingInfo?.estimatedDelivery.toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {deliveryStatus.trackingInfo?.updates && (
                        <div className="border-t border-gray-200 pt-4">
                          <h4 className="font-medium text-gray-900 mb-3">Tracking Updates</h4>
                          <div className="space-y-3">
                            {deliveryStatus.trackingInfo.updates.map((update, index) => (
                              <div key={index} className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{update.status}</p>
                                  <p className="text-xs text-gray-500">
                                    {update.timestamp.toLocaleString()} • {update.location.city}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Delivery Actions */}
                {canConfirmDelivery() && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delivery</h3>
                    <p className="text-gray-600 mb-4">
                      Please confirm that you have received the goods and they meet the agreed specifications.
                    </p>
                    <button
                      onClick={confirmDelivery}
                      disabled={loading}
                      className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Confirm Delivery
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Deal History</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Deal Created</p>
                        <p className="text-xs text-gray-500">{selectedDeal.createdAt.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Status: {selectedDeal.status}</p>
                        <p className="text-xs text-gray-500">{selectedDeal.updatedAt.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bg-white border-t border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                {canRaiseDispute() && (
                  <button
                    onClick={raiseDispute}
                    disabled={loading}
                    className="bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Raise Dispute
                  </button>
                )}
                <button
                  onClick={() => window.open(`/deals/${selectedDeal.id}/chat`, '_blank')}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 flex items-center"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </button>
              </div>
              <button
                onClick={loadDealDetails}
                disabled={loading}
                className="bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealManagement;