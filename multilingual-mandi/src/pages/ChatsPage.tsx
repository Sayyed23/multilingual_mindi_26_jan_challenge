import { MessageSquare, CheckCircle, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { negotiationService } from '../services/negotiation';
import type { Negotiation } from '../types';

const ChatsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const unsubscribe = negotiationService.subscribeToNegotiations(user.uid, (data) => {
            setNegotiations(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Negotiations</h1>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
                    {negotiations.map((neg) => (
                        <div
                            key={neg.id}
                            onClick={() => navigate(`/negotiations/${neg.id}`)}
                            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-4"
                        >
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-xl">
                                {neg.dealProposal.commodity.charAt(0)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-sm font-bold text-gray-900 truncate">
                                        {user?.role === 'buyer' ? 'Seller' : 'Buyer'}
                                    </h3>
                                    <span className="text-xs text-gray-500 font-medium">
                                        {neg.updatedAt.toLocaleDateString()}
                                    </span>
                                </div>

                                <p className="text-xs font-semibold text-green-600 mb-0.5">
                                    {neg.dealProposal.commodity} - {neg.dealProposal.quantity} {neg.dealProposal.unit}
                                </p>

                                <div className="flex justify-between items-center">
                                    <p className="text-sm truncate text-gray-500">
                                        {neg.messages.length > 0
                                            ? neg.messages[neg.messages.length - 1].content.originalText
                                            : `Started negotiation at ₹${neg.dealProposal.proposedPrice}`}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-green-600">₹{neg.currentOffer}</span>
                                        {neg.status === 'agreed' ? (
                                            <CheckCircle size={16} className="text-blue-500" />
                                        ) : (
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && negotiations.length === 0 && (
                <div className="text-center py-12">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No active negotiations</h3>
                    <p className="text-gray-500 mb-6">Start a negotiation from a commodity listing or chat with our AI assistant.</p>

                    <button
                        onClick={async () => {
                            if (!user) return;
                            setLoading(true);
                            try {
                                await negotiationService.createDemoNegotiation(user.uid);
                                // The subscription will auto-update
                            } catch (error) {
                                console.error("Failed to start demo:", error);
                                setLoading(false);
                            }
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                        <Bot className="mr-2 h-4 w-4" />
                        Start AI Negotiation
                    </button>
                </div>
            )}
        </div>
    );
};

export default ChatsPage;
