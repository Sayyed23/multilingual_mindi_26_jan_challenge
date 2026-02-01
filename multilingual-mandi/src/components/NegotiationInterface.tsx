import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Bot,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  MapPin,
  Calendar,
  Package,
  Mic,
  MicOff,
  Paperclip,
  File,
  X
} from 'lucide-react';
import { negotiationService } from '../services/negotiation';
import { useAuth } from '../hooks/useAuth';
import type {
  Negotiation,
  Message,
  NegotiationSuggestion,
  MarketComparison,
  DealProposal
} from '../types';

interface NegotiationInterfaceProps {
  negotiationId?: string;
  dealProposal?: DealProposal;
  onNegotiationComplete?: (negotiation: Negotiation) => void;
}

const NegotiationInterface: React.FC<NegotiationInterfaceProps> = ({
  negotiationId,
  dealProposal,
  onNegotiationComplete
}) => {
  const { user } = useAuth();
  const [negotiation, setNegotiation] = useState<Negotiation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentOffer, setCurrentOffer] = useState<number>(0);
  const [suggestion, setSuggestion] = useState<NegotiationSuggestion | null>(null);
  const [marketData, setMarketData] = useState<MarketComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showAIAssistance, setShowAIAssistance] = useState(true);
  const [attachment, setAttachment] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (negotiationId) {
      unsubscribe = negotiationService.subscribeToNegotiation(negotiationId, (updatedNegotiation) => {
        setNegotiation(updatedNegotiation);
        setMessages(updatedNegotiation.messages);
        setCurrentOffer(updatedNegotiation.currentOffer);
      });
    } else if (dealProposal) {
      initializeNegotiation();
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [negotiationId, dealProposal]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (negotiation && currentOffer > 0) {
      loadAISuggestion();
    }
  }, [currentOffer, negotiation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };


  const initializeNegotiation = async () => {
    if (!dealProposal || !user) return;

    try {
      setLoading(true);
      const newNegotiation = await negotiationService.startNegotiation(dealProposal, { uid: user.uid, role: user.role as any });
      setNegotiation(newNegotiation);
      setCurrentOffer(dealProposal.proposedPrice);
      setMessages([]);
    } catch (error) {
      console.error('Failed to initialize negotiation:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAISuggestion = async () => {
    if (!negotiation || !user) return;

    try {
      const [suggestionData, marketComparison] = await Promise.all([
        negotiationService.getSuggestedCounterOffer(negotiation, currentOffer, user.role as any),
        negotiationService.getMarketComparison(negotiation.dealProposal.commodity, currentOffer)
      ]);

      setSuggestion(suggestionData);
      setMarketData(marketComparison);
    } catch (error) {
      console.error('Failed to load AI suggestion:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !attachment) || !negotiation || !user) return;

    let messageType: 'text' | 'image' | 'document' = 'text';
    let attachments: any[] = [];

    if (attachment) {
      messageType = attachment.type.startsWith('image/') ? 'image' : 'document';
      // In a real app, upload file to storage and get URL
      // Here we simulate it with ID
      const attachmentId = `att_${Date.now()}`;
      attachments = [{
        id: attachmentId,
        type: messageType,
        url: URL.createObjectURL(attachment), // Local preview URL
        filename: attachment.name,
        size: attachment.size
      }];
    }

    const message: Message = {
      id: `msg_${Date.now()}`,
      conversationId: negotiation.id,
      senderId: user.uid,
      receiverId: getCounterpartyId(),
      content: {
        originalText: newMessage || (attachment ? `Sent a ${messageType}` : ''),
        originalLanguage: user.language,
        translations: {},
        messageType: messageType
      },
      metadata: {
        timestamp: new Date(),
        readStatus: false,
        attachments: attachments
      },
      context: {
        negotiationId: negotiation.id,
        priceReference: marketData?.currentMarketPrice ? {
          commodity: negotiation.dealProposal.commodity,
          mandi: 'Current Market',
          price: marketData.currentMarketPrice,
          unit: negotiation.dealProposal.unit,
          quality: negotiation.dealProposal.quality,
          timestamp: new Date(),
          source: 'Market Data'
        } : undefined
      }
    };

    try {
      await negotiationService.sendMessage(negotiation.id, message);
      setNewMessage('');
      removeAttachment();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const makeCounterOffer = async (price: number) => {
    if (!negotiation || !user) return;

    const offerMessage: Message = {
      id: `offer_${Date.now()} `,
      conversationId: negotiation.id,
      senderId: user.uid,
      receiverId: getCounterpartyId(),
      content: {
        originalText: `I offer ₹${price} per ${negotiation.dealProposal.unit} `,
        originalLanguage: user.language,
        translations: {},
        messageType: 'text'
      },
      metadata: {
        timestamp: new Date(),
        readStatus: false
      },
      context: {
        negotiationId: negotiation.id,
        priceReference: {
          commodity: negotiation.dealProposal.commodity,
          mandi: 'Negotiation Offer',
          price,
          unit: negotiation.dealProposal.unit,
          quality: negotiation.dealProposal.quality,
          timestamp: new Date(),
          source: 'User Offer'
        }
      }
    };

    try {
      await negotiationService.sendMessage(negotiation.id, offerMessage);
      setCurrentOffer(price);
    } catch (error) {
      console.error('Failed to make counter offer:', error);
    }
  };

  const finalizeAgreement = async () => {
    if (!negotiation || !user) return;

    try {
      setLoading(true);
      const dealTerms = {
        commodity: negotiation.dealProposal.commodity,
        quantity: negotiation.dealProposal.quantity,
        unit: negotiation.dealProposal.unit,
        agreedPrice: currentOffer,
        quality: negotiation.dealProposal.quality,
        deliveryTerms: {
          location: negotiation.dealProposal.deliveryLocation,
          expectedDate: negotiation.dealProposal.deliveryDate,
          method: 'delivery' as const,
          cost: 0,
          responsibility: 'seller' as const
        },
        paymentTerms: {
          method: 'upi' as const,
          schedule: 'on_delivery' as const
        }
      };

      await negotiationService.finalizeAgreement(negotiation.id, dealTerms, { uid: user.uid, role: user.role });
      onNegotiationComplete?.(negotiation);

      // Show success message
      alert('Agreement finalized successfully!');
    } catch (error) {
      console.error('Failed to finalize agreement:', error);
      alert('Failed to finalize agreement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCounterpartyId = (): string => {
    if (!negotiation || !user) return '';

    if (user.role === 'buyer') {
      return negotiation.participants.seller;
    } else if (user.role === 'vendor') {
      return negotiation.participants.buyer;
    } else {
      // Agent case - return the other party
      return negotiation.participants.buyer !== user.uid
        ? negotiation.participants.buyer
        : negotiation.participants.seller;
    }
  };



  if (loading && !negotiation) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!negotiation) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">No negotiation data available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {negotiation.dealProposal.commodity} Negotiation
            </h2>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              <span className="flex items-center">
                <Package className="h-4 w-4 mr-1" />
                {negotiation.dealProposal.quantity} {negotiation.dealProposal.unit}
              </span>
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {negotiation.dealProposal.deliveryLocation.city}
              </span>
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {negotiation.dealProposal.deliveryDate.toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              ₹{currentOffer.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Current Offer</div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'
                  } `}
              >
                <div
                  className={`max - w - xs lg: max - w - md px - 4 py - 2 rounded - lg ${message.senderId === user?.uid
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                    } `}
                >
                  <p className="text-sm">{message.content.originalText}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-75">
                      {message.metadata.timestamp.toLocaleTimeString()}
                    </span>
                    {message.context?.priceReference && (
                      <span className="text-xs font-medium">
                        ₹{message.context.priceReference.price}
                      </span>
                    )}
                  </div>

                  {/* Attachments Display */}
                  {
                    message.metadata.attachments && message.metadata.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.metadata.attachments.map((att: any) => (
                          <div key={att.id}>
                            {att.type === 'image' ? (
                              <img
                                src={att.url}
                                alt={att.filename}
                                className="max-w-full rounded-lg border border-gray-200"
                                style={{ maxHeight: '200px' }}
                              />
                            ) : (
                              <a
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                              >
                                <File className="h-4 w-4 mr-2 text-blue-600" />
                                <span className="text-sm text-gray-700 truncate">{att.filename}</span>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  }
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`p - 2 rounded - full ${isRecording
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } `}
              >
                {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 rounded-full ${attachment ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                title="Attach file"
              >
                <Paperclip className="h-5 w-5" />
              </button>

              <div className="flex-1 flex flex-col relative w-full">
                {attachment && (
                  <div className="absolute bottom-full left-0 mb-2 p-2 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
                    <span className="text-sm text-gray-600 truncate max-w-[150px]">{attachment.name}</span>
                    <button onClick={removeAttachment} className="text-gray-400 hover:text-red-500">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() && !attachment}
                className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* AI Assistance Panel */}
        {
          showAIAssistance && (
            <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Bot className="h-5 w-5 mr-2 text-blue-600" />
                    AI Assistant
                  </h3>
                  <button
                    onClick={() => setShowAIAssistance(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Market Comparison */}
                {marketData && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Market Data
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Current Market:</span>
                        <span className="font-medium">₹{marketData.currentMarketPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Range:</span>
                        <span className="font-medium">
                          ₹{marketData.priceRange.min} - ₹{marketData.priceRange.max}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Trend:</span>
                        <span className={`font - medium ${marketData.trend.trend === 'rising' ? 'text-green-600' :
                          marketData.trend.trend === 'falling' ? 'text-red-600' :
                            'text-gray-600'
                          } `}>
                          {marketData.trend.trend} ({marketData.trend.changePercent}%)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Suggestion */}
                {suggestion && (
                  <div className="bg-green-50 rounded-lg p-3">
                    <h4 className="font-medium text-green-900 mb-2 flex items-center">
                      <Bot className="h-4 w-4 mr-1" />
                      Suggestion
                    </h4>
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          ₹{suggestion.suggestedPrice.toLocaleString()}
                        </div>
                        <div className="text-sm text-green-700">Recommended Price</div>
                      </div>
                      <p className="text-sm text-green-800">{suggestion.reasoning}</p>
                      <div className="flex items-center justify-between text-xs text-green-700">
                        <span>Confidence:</span>
                        <span className="font-medium">{Math.round(suggestion.confidence * 100)}%</span>
                      </div>
                      <button
                        onClick={() => makeCounterOffer(suggestion.suggestedPrice)}
                        className="w-full bg-green-600 text-white py-2 px-3 rounded-md text-sm hover:bg-green-700"
                      >
                        Use This Offer
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        const newOffer = Math.round(currentOffer * 0.95);
                        makeCounterOffer(newOffer);
                      }}
                      className="bg-orange-100 text-orange-700 py-2 px-3 rounded-md text-sm hover:bg-orange-200"
                    >
                      -5%
                    </button>
                    <button
                      onClick={() => {
                        const newOffer = Math.round(currentOffer * 1.05);
                        makeCounterOffer(newOffer);
                      }}
                      className="bg-green-100 text-green-700 py-2 px-3 rounded-md text-sm hover:bg-green-200"
                    >
                      +5%
                    </button>
                  </div>
                  {marketData && (
                    <button
                      onClick={() => makeCounterOffer(marketData.currentMarketPrice)}
                      className="w-full bg-blue-100 text-blue-700 py-2 px-3 rounded-md text-sm hover:bg-blue-200"
                    >
                      Market Price
                    </button>
                  )}
                </div>

                {/* Finalize Agreement */}
                {negotiation.status === 'active' && (
                  <div className="border-t border-gray-200 pt-4">
                    <button
                      onClick={finalizeAgreement}
                      disabled={loading}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Finalize Agreement
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        }
      </div >

      {/* Show AI Assistance Toggle (when hidden) */}
      {
        !showAIAssistance && (
          <button
            onClick={() => setShowAIAssistance(true)}
            className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"
          >
            <Bot className="h-5 w-5" />
          </button>
        )
      }
    </div >
  );
};

export default NegotiationInterface;