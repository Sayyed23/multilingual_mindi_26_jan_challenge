import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Upload,
  Download,
  User,
  Calendar,
  DollarSign,
  Package,
  Eye,
  Send,
  Paperclip
} from 'lucide-react';
import { dealManagementService, dealCompletionManager } from '../services/dealManagement';
import { useAuth } from '../hooks/useAuth';
import type { Dispute, Deal } from '../types';

interface DisputeResolutionProps {
  disputeId?: string;
  dealId?: string;
  onDisputeResolved?: (dispute: Dispute) => void;
}

interface DisputeMessage {
  id: string;
  senderId: string;
  senderRole: 'buyer' | 'seller' | 'admin';
  message: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  timestamp: Date;
}

interface ResolutionStep {
  step: number;
  description: string;
  timeframe: string;
  responsible: 'buyer' | 'seller' | 'admin';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completedAt?: Date;
}

const DisputeResolution: React.FC<DisputeResolutionProps> = ({
  disputeId,
  dealId,
  onDisputeResolved
}) => {
  const { user } = useAuth();
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [messages, setMessages] = useState<DisputeMessage[]>([]);
  const [resolutionSteps, setResolutionSteps] = useState<ResolutionStep[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'evidence' | 'resolution'>('overview');

  useEffect(() => {
    if (disputeId) {
      loadDispute();
    } else if (dealId) {
      loadDealDisputes();
    }
  }, [disputeId, dealId]);

  const loadDispute = async () => {
    if (!disputeId) return;

    try {
      setLoading(true);
      // In a real implementation, this would fetch from the disputes collection
      const mockDispute: Dispute = {
        id: disputeId,
        dealId: dealId || 'deal-123',
        raisedBy: user?.uid || 'user-123',
        reason: 'Quality issues with delivered goods',
        description: 'The delivered wheat does not match the agreed quality specifications. There are visible impurities and moisture content seems higher than agreed.',
        status: 'investigating',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        resolvedAt: undefined
      };

      setDispute(mockDispute);
      await loadDeal(mockDispute.dealId);
      await loadDisputeMessages();
      await loadResolutionWorkflow();
    } catch (error) {
      console.error('Failed to load dispute:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDealDisputes = async () => {
    if (!dealId) return;

    try {
      setLoading(true);
      // In a real implementation, this would query disputes by dealId
      await loadDispute(); // For now, load mock dispute
    } catch (error) {
      console.error('Failed to load deal disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDeal = async (dealId: string) => {
    try {
      const dealData = await dealManagementService.getDeal(dealId);
      setDeal(dealData);
    } catch (error) {
      console.error('Failed to load deal:', error);
    }
  };

  const loadDisputeMessages = async () => {
    // Mock dispute messages
    const mockMessages: DisputeMessage[] = [
      {
        id: 'msg-1',
        senderId: user?.uid || 'buyer-123',
        senderRole: 'buyer',
        message: 'I am raising this dispute because the delivered wheat does not match the agreed quality. The moisture content is too high and there are visible impurities.',
        attachments: [
          { name: 'wheat_sample_photo.jpg', url: '#', type: 'image' },
          { name: 'quality_report.pdf', url: '#', type: 'document' }
        ],
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'msg-2',
        senderId: 'seller-456',
        senderRole: 'seller',
        message: 'I understand your concern. The wheat was tested before dispatch and met our quality standards. However, I am willing to work with you to resolve this issue. Can you provide more details about the specific problems?',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'msg-3',
        senderId: 'admin-789',
        senderRole: 'admin',
        message: 'Thank you both for providing information. We have reviewed the evidence and will arrange for an independent quality assessment. Please expect an update within 48 hours.',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000)
      }
    ];

    setMessages(mockMessages);
  };

  const loadResolutionWorkflow = async () => {
    if (!dispute || !deal) return;

    try {
      const workflow = await dealCompletionManager.createDisputeResolutionMechanism(
        dispute.dealId,
        'quality'
      );

      const steps: ResolutionStep[] = workflow.steps.map((step, index) => ({
        ...step,
        status: index === 0 ? 'completed' : index === 1 ? 'in_progress' : 'pending',
        completedAt: index === 0 ? new Date(Date.now() - 24 * 60 * 60 * 1000) : undefined
      }));

      setResolutionSteps(steps);
    } catch (error) {
      console.error('Failed to load resolution workflow:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !dispute || !user) return;

    const message: DisputeMessage = {
      id: `msg-${Date.now()}`,
      senderId: user.uid,
      senderRole: user.role as 'buyer' | 'seller' | 'admin',
      message: newMessage,
      attachments: attachments.map(file => ({
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type
      })),
      timestamp: new Date()
    };

    try {
      // In a real implementation, this would send to the backend
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      setAttachments([]);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800';
      case 'investigating': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'escalated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'overdue': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">No dispute found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2 text-red-600" />
              Dispute Resolution
            </h1>
            <p className="text-gray-500 mt-1">Dispute ID: {dispute.id.substring(0, 12)}...</p>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(dispute.status)}`}>
              {dispute.status.toUpperCase()}
            </span>
            <p className="text-sm text-gray-500 mt-1">
              Raised {dispute.createdAt.toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {['overview', 'messages', 'evidence', 'resolution'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab
                ? 'border-red-500 text-red-600'
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Dispute Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dispute Summary</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <p className="text-gray-900">{dispute.reason}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <p className="text-gray-900">{dispute.description}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Raised By</label>
                    <p className="text-gray-900 flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {dispute.raisedBy.substring(0, 12)}...
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Raised</label>
                    <p className="text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {dispute.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Deal Information */}
            {deal && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Related Deal</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Commodity</label>
                    <p className="text-gray-900 flex items-center">
                      <Package className="h-4 w-4 mr-1" />
                      {deal.commodity}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <p className="text-gray-900">{deal.quantity} {deal.unit}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                    <p className="text-gray-900 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      ₹{(deal.agreedPrice * deal.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="flex space-x-3">
                <button
                  onClick={() => setActiveTab('messages')}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 flex items-center"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Message
                </button>
                <button
                  onClick={() => setActiveTab('evidence')}
                  className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 flex items-center"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Evidence
                </button>
                <button
                  onClick={() => window.open(`/deals/${dispute.dealId}`, '_blank')}
                  className="bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 flex items-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Deal
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-6">
            {/* Messages */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Dispute Messages</h3>
              </div>
              <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div key={message.id} className="flex space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${message.senderRole === 'admin' ? 'bg-purple-600' :
                      message.senderRole === 'buyer' ? 'bg-blue-600' :
                        'bg-green-600'
                      }`}>
                      {message.senderRole.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 capitalize">
                          {message.senderRole}
                        </span>
                        <span className="text-sm text-gray-500">
                          {message.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{message.message}</p>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="space-y-1">
                          {message.attachments.map((attachment, attachmentIndex) => (
                            <div key={attachmentIndex} className="flex items-center space-x-2 text-sm">
                              <Paperclip className="h-3 w-3 text-gray-400" />
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {attachment.name}
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="font-medium text-gray-900 mb-3">Add Message</h4>
              <div className="space-y-3">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                {/* Attachments */}
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Attachments</label>
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <button
                          onClick={() => removeAttachment(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer bg-gray-100 text-gray-700 py-2 px-3 rounded-lg font-medium hover:bg-gray-200 flex items-center"
                    >
                      <Paperclip className="h-4 w-4 mr-2" />
                      Attach Files
                    </label>
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'evidence' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Evidence & Documentation</h3>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">Upload evidence files</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Supported formats: Images, PDFs, Documents (Max 10MB each)
                  </p>
                  <input
                    type="file"
                    id="evidence-upload"
                    multiple
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <label
                    htmlFor="evidence-upload"
                    className="cursor-pointer bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700"
                  >
                    Choose Files
                  </label>
                </div>

                {/* Existing Evidence */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Uploaded Evidence</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">wheat_sample_photo.jpg</span>
                        <button className="text-blue-600 hover:text-blue-800">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500">Uploaded by Buyer • 2 days ago</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">quality_report.pdf</span>
                        <button className="text-blue-600 hover:text-blue-800">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500">Uploaded by Buyer • 2 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'resolution' && (
          <div className="space-y-6">
            {/* Resolution Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Resolution Process</h3>
              <div className="space-y-4">
                {resolutionSteps.map((step) => (
                  <div key={step.step} className="flex items-start space-x-4">
                    <div className={`p-2 rounded-full ${getStepStatusColor(step.status)}`}>
                      {getStepIcon(step.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900">
                          Step {step.step}: {step.description}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStepStatusColor(step.status)}`}>
                          {step.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>Timeframe: {step.timeframe}</p>
                        <p>Responsible: {step.responsible}</p>
                        {step.completedAt && (
                          <p>Completed: {step.completedAt.toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resolution Actions */}
            {user && (user as any).role === 'admin' && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Actions</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      if (dispute) {
                        onDisputeResolved?.({ ...dispute, status: 'resolved', resolvedAt: new Date() });
                      }
                    }}
                    className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resolve in Favor of Buyer
                  </button>
                  <button
                    onClick={() => {
                      if (dispute) {
                        onDisputeResolved?.({ ...dispute, status: 'resolved', resolvedAt: new Date() });
                      }
                    }}
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resolve in Favor of Seller
                  </button>
                  <button className="bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-yellow-700 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Request More Information
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DisputeResolution;