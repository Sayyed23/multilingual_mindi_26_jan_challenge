import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  FileText,
  Star,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import NegotiationInterface from '../components/NegotiationInterface';
import DealManagement from '../components/DealManagement';
import DisputeResolution from '../components/DisputeResolution';
import RatingReview from '../components/RatingReview';
import { useAuth } from '../hooks/useAuth';
import type { Negotiation, Deal, DealProposal } from '../types';

const NegotiationPage: React.FC = () => {
  const { negotiationId, dealId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [activeView, setActiveView] = useState<'negotiation' | 'deal' | 'dispute' | 'rating'>('negotiation');
  const [currentDeal, setCurrentDeal] = useState<Deal | null>(null);
  const [dealProposal, setDealProposal] = useState<DealProposal | undefined>(undefined);

  useEffect(() => {
    // Determine initial view based on URL params and query params
    if (dealId) {
      setActiveView('deal');
    } else if (negotiationId && negotiationId !== 'new') {
      setActiveView('negotiation');
    }

    const view = searchParams.get('view');
    if (view && ['negotiation', 'deal', 'dispute', 'rating'].includes(view)) {
      setActiveView(view as any);
    }

    // Load deal proposal from search params if creating new negotiation
    const proposalData = searchParams.get('proposal');
    if (proposalData) {
      try {
        const proposal = JSON.parse(decodeURIComponent(proposalData));
        setDealProposal(proposal);
      } catch (error) {
        console.error('Failed to parse deal proposal:', error);
      }
    } else {
      // Try to construct proposal from individual query params (e.g. from Price Discovery)
      const commodity = searchParams.get('commodity');
      if (commodity && (negotiationId === 'new' || !negotiationId)) {
        // Construct a default proposal based on available info
        setDealProposal({
          commodity,
          quantity: Number(searchParams.get('quantity')) || 100, // Default 100
          unit: searchParams.get('unit') || 'quintal',
          proposedPrice: Number(searchParams.get('price')) || 0,
          quality: 'standard', // Default quality
          deliveryLocation: {
            state: '',
            district: '',
            city: 'Local Mandi',
            pincode: ''
          },
          deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default 7 days from now
        });
      }
    }
  }, [negotiationId, dealId, searchParams]);

  // Handle "new" negotiation without proposal
  if (negotiationId === 'new' && !dealProposal) {
    // Allow render even if dealProposal is not yet set, to show loading or empty state properly handled by Interface
  }

  const handleNegotiationComplete = (negotiation: Negotiation) => {
    // Navigate to deal view when negotiation is completed
    navigate(`/deals/${negotiation.id}?view=deal`);
  };

  const handleDealUpdate = (deal: Deal) => {
    setCurrentDeal(deal);

    // Auto-switch to rating view when deal is completed
    if (deal.status === 'completed' && activeView === 'deal') {
      setActiveView('rating');
    }
  };

  const getPageTitle = () => {
    switch (activeView) {
      case 'negotiation':
        return 'Negotiation';
      case 'deal':
        return 'Deal Management';
      case 'dispute':
        return 'Dispute Resolution';
      case 'rating':
        return 'Rate & Review';
      default:
        return 'Trading';
    }
  };

  const getViewIcon = (view: string) => {
    switch (view) {
      case 'negotiation':
        return <MessageSquare className="h-4 w-4" />;
      case 'deal':
        return <FileText className="h-4 w-4" />;
      case 'dispute':
        return <AlertTriangle className="h-4 w-4" />;
      case 'rating':
        return <Star className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const canAccessView = (view: string) => {
    switch (view) {
      case 'negotiation':
        // Allow access if we have an ID AND/OR a proposal (even if constructed from params)
        // Also allow if it's 'new' and we have at least a commodity to start with
        return !!negotiationId || !!dealProposal || (searchParams.get('commodity') !== null);
      case 'deal':
        return !!dealId || !!currentDeal;
      case 'dispute':
        return !!dealId || !!currentDeal;
      case 'rating':
        return (!!dealId || !!currentDeal) && (currentDeal?.status === 'completed' || currentDeal?.status === 'disputed');
      default:
        return true;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {getPageTitle()}
              </h1>
              <p className="text-sm text-gray-500">
                {negotiationId && `Ref: ${negotiationId.substring(0, 8)}...`}
                {!negotiationId && !dealId && 'New Trading Session'}
              </p>
            </div>
          </div>

          {/* View Switcher */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {['negotiation', 'deal', 'dispute', 'rating'].map((view) => (
              <button
                key={view}
                onClick={() => canAccessView(view) && setActiveView(view as any)}
                disabled={!canAccessView(view)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === view
                  ? 'bg-white text-gray-900 shadow-sm'
                  : canAccessView(view)
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    : 'text-gray-400 cursor-not-allowed'
                  }`}
              >
                {getViewIcon(view)}
                <span className="hidden md:inline capitalize">{view}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {activeView === 'negotiation' && (
          <NegotiationInterface
            negotiationId={negotiationId === 'new' ? undefined : negotiationId}
            dealProposal={dealProposal}
            onNegotiationComplete={handleNegotiationComplete}
          />
        )}

        {activeView === 'deal' && (
          <DealManagement
            dealId={dealId || negotiationId || currentDeal?.id}
            onDealUpdate={handleDealUpdate}
          />
        )}

        {activeView === 'dispute' && (
          <DisputeResolution
            dealId={dealId || negotiationId || currentDeal?.id}
            onDisputeResolved={(dispute) => {
              console.log('Dispute resolved:', dispute);
              // Could navigate back to deal view or show success message
            }}
          />
        )}

        {activeView === 'rating' && (currentDeal || dealId) && (
          <RatingReview
            dealId={dealId || currentDeal!.id}
            onRatingSubmitted={(feedback) => {
              console.log('Rating submitted:', feedback);
              // Could show success message or navigate away
            }}
            showExistingReviews={true}
          />
        )}

        {/* Fallback content */}
        {!canAccessView(activeView) && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                View Not Available
              </h3>
              <p className="text-gray-500 mb-4">
                This view is not accessible in the current context.
              </p>
              <button
                onClick={() => setActiveView('negotiation')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Go to Negotiation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            {user && (
              <span>Logged in as {user.role}</span>
            )}
            {currentDeal && (
              <span className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Deal Status: {currentDeal.status}
              </span>
            )}
          </div>
          <div>
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NegotiationPage;