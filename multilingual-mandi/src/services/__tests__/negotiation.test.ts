// Negotiation Service Tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { negotiationService } from '../negotiation';
import type { DealProposal, Negotiation, Message, UserRole } from '../../types';

// Mock Firebase and dependencies
vi.mock('../lib/firebase', () => ({
  db: {},
  functions: {}
}));

vi.mock('../offlineSync', () => ({
  offlineSyncService: {
    isOnline: () => true,
    cacheData: vi.fn(),
    getCachedData: vi.fn(),
    getCachedEntry: vi.fn(),
    queueAction: vi.fn()
  }
}));

vi.mock('../priceDiscovery', () => ({
  priceDiscoveryService: {
    getCurrentPrices: vi.fn().mockResolvedValue([
      {
        commodity: 'wheat',
        mandi: 'Test Mandi 1',
        price: 1900,
        unit: 'quintal',
        quality: 'standard',
        timestamp: new Date(),
        source: 'test'
      },
      {
        commodity: 'wheat',
        mandi: 'Test Mandi 2',
        price: 2100,
        unit: 'quintal',
        quality: 'standard',
        timestamp: new Date(),
        source: 'test'
      }
    ]),
    getPriceTrends: vi.fn().mockResolvedValue({
      commodity: 'wheat',
      trend: 'stable',
      changePercent: 0,
      timeframe: '7 days'
    }),
    subscribeToPriceUpdates: vi.fn().mockReturnValue(() => { })
  }
}));

describe('NegotiationService', () => {
  let mockDealProposal: DealProposal;
  let mockMessage: Message;

  beforeEach(() => {
    mockDealProposal = {
      commodity: 'wheat',
      quantity: 100,
      unit: 'quintal',
      proposedPrice: 2000,
      quality: 'standard',
      deliveryLocation: {
        state: 'Punjab',
        district: 'Ludhiana',
        city: 'Ludhiana',
        pincode: '141001'
      },
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      additionalTerms: 'Test terms'
    };

    mockMessage = {
      id: 'msg_1',
      conversationId: 'conv_1',
      senderId: 'user_1',
      receiverId: 'user_2',
      content: {
        originalText: 'I can offer ₹1900 per quintal',
        originalLanguage: 'en',
        translations: {},
        messageType: 'text'
      },
      metadata: {
        timestamp: new Date(),
        readStatus: false
      }
    };
  });

  const mockUser = { uid: 'user_1', role: 'buyer' as UserRole };

  describe('Market Comparison', () => {
    it('should generate market comparison data', async () => {
      const marketComparison = await negotiationService.getMarketComparison('wheat', 2000);

      expect(marketComparison).toBeDefined();
      expect(marketComparison.commodity).toBe('wheat');
      expect(marketComparison.currentMarketPrice).toBeGreaterThan(0);
      expect(marketComparison.priceRange).toBeDefined();
      expect(marketComparison.priceRange.min).toBeGreaterThan(0);
      expect(marketComparison.priceRange.max).toBeGreaterThan(marketComparison.priceRange.min);
      expect(marketComparison.trend).toBeDefined();
    });

    it('should handle market comparison errors gracefully', async () => {
      // Mock price discovery service to throw error
      const priceDiscoveryMock = await import('../priceDiscovery');
      vi.mocked(priceDiscoveryMock.priceDiscoveryService.getCurrentPrices).mockRejectedValueOnce(new Error('Network error'));

      const marketComparison = await negotiationService.getMarketComparison('wheat', 2000);

      // Should return fallback data
      expect(marketComparison).toBeDefined();
      expect(marketComparison.commodity).toBe('wheat');
      expect(marketComparison.currentMarketPrice).toBe(2000);
    });
  });

  describe('Role-based Suggestions', () => {
    const testRoles: UserRole[] = ['vendor', 'buyer', 'agent'];

    testRoles.forEach(role => {
      it(`should generate appropriate suggestions for ${role} role`, async () => {
        // Mock getCurrentUser removed - passing role directly

        const mockNegotiation: Negotiation = {
          id: 'neg_1',
          dealProposal: mockDealProposal,
          participants: {
            buyer: role === 'buyer' ? 'test_user' : 'other_user',
            seller: role === 'vendor' ? 'test_user' : 'other_user',
            agent: role === 'agent' ? 'test_user' : undefined
          },
          messages: [],
          currentOffer: 2000,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const suggestion = await negotiationService.getSuggestedCounterOffer(mockNegotiation, 2000, role);

        expect(suggestion).toBeDefined();
        expect(suggestion.suggestedPrice).toBeGreaterThan(0);
        expect(suggestion.reasoning).toMatch(/guidance|decision|responsibility|control|circumstances/i);
        expect(suggestion.confidence).toBeGreaterThan(0);
        expect(suggestion.confidence).toBeLessThanOrEqual(1);
        expect(suggestion.marketData).toBeDefined();

        // Restore original method
        // Restore original method - NO LONGER NEEDED
      });
    });

    it('should provide different suggestions for different roles', async () => {
      const mockNegotiation: Negotiation = {
        id: 'neg_1',
        dealProposal: mockDealProposal,
        participants: {
          buyer: 'buyer_user',
          seller: 'vendor_user'
        },
        messages: [],
        currentOffer: 2000,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock different user roles
      // No more mocking getCurrentUser

      // Get vendor suggestion
      const vendorSuggestion = await negotiationService.getSuggestedCounterOffer(mockNegotiation, 2000, 'vendor');

      // Get buyer suggestion
      const buyerSuggestion = await negotiationService.getSuggestedCounterOffer(mockNegotiation, 2000, 'buyer');

      // Get agent suggestion
      const agentSuggestion = await negotiationService.getSuggestedCounterOffer(mockNegotiation, 2000, 'agent');

      // Vendor should generally suggest higher prices than buyer
      expect(vendorSuggestion.suggestedPrice).toBeGreaterThanOrEqual(agentSuggestion.suggestedPrice);
      expect(agentSuggestion.suggestedPrice).toBeGreaterThanOrEqual(buyerSuggestion.suggestedPrice);

      // All should have advisory disclaimers
      expect(vendorSuggestion.reasoning).toMatch(/guidance|decision|responsibility|control|circumstances/i);
      expect(buyerSuggestion.reasoning).toMatch(/guidance|decision|responsibility|control|circumstances/i);
      expect(agentSuggestion.reasoning).toMatch(/guidance|decision|responsibility|control|circumstances/i);

      // Restore original method
      // Restore original method - NO LONGER NEEDED
    });
  });

  describe('Advisory Nature Enforcement', () => {
    it('should include advisory disclaimers in all suggestions', async () => {
      const mockNegotiation: Negotiation = {
        id: 'neg_1',
        dealProposal: mockDealProposal,
        participants: {
          buyer: 'buyer_user',
          seller: 'vendor_user'
        },
        messages: [],
        currentOffer: 2000,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const suggestion = await negotiationService.getSuggestedCounterOffer(mockNegotiation, 2000);

      expect(suggestion.reasoning).toMatch(/advisory|guidance|decision|responsibility/i);
      expect(suggestion.confidence).toBeLessThanOrEqual(0.95); // Should be capped
    });

    it('should provide advisory disclaimer', async () => {
      const disclaimer = await negotiationService.getAdvisoryDisclaimer();

      expect(disclaimer).toContain('advisory only');
      expect(disclaimer).toContain('binding decisions');
      expect(disclaimer).toContain('full control');
    });
  });

  describe('Validation', () => {
    it('should validate deal proposal correctly', async () => {
      // Mock getCurrentUser removed

      // Test with invalid proposal
      const invalidProposal = {
        ...mockDealProposal,
        commodity: '', // Invalid empty commodity
        quantity: -1,  // Invalid negative quantity
        proposedPrice: 0 // Invalid zero price
      };

      await expect(negotiationService.startNegotiation(invalidProposal, mockUser)).rejects.toThrow();

      // Restore original method - NO LONGER NEEDED
    });

    it('should validate message correctly', async () => {
      const invalidMessage = {
        ...mockMessage,
        id: '', // Invalid empty ID
        content: {
          ...mockMessage.content,
          originalText: '' // Invalid empty content
        }
      };

      await expect(negotiationService.sendMessage('neg_1', invalidMessage)).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle offline scenarios gracefully', async () => {
      const mockNegotiation: Negotiation = {
        id: 'neg_1',
        dealProposal: mockDealProposal,
        participants: {
          buyer: 'buyer_user',
          seller: 'vendor_user'
        },
        messages: [],
        currentOffer: 2000,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Should still provide suggestions even when offline (using fallback logic)
      const suggestion = await negotiationService.getSuggestedCounterOffer(mockNegotiation, 2000);

      expect(suggestion).toBeDefined();
      expect(suggestion.suggestedPrice).toBeGreaterThan(0);
    });

    it('should handle API failures gracefully', async () => {
      // Mock price discovery service failure
      const priceDiscoveryMock = await import('../priceDiscovery');
      vi.mocked(priceDiscoveryMock.priceDiscoveryService.getCurrentPrices).mockRejectedValue(new Error('API Error'));

      const mockNegotiation: Negotiation = {
        id: 'neg_1',
        dealProposal: mockDealProposal,
        participants: {
          buyer: 'buyer_user',
          seller: 'vendor_user'
        },
        messages: [],
        currentOffer: 2000,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Should still provide fallback suggestions
      const suggestion = await negotiationService.getSuggestedCounterOffer(mockNegotiation, 2000);

      expect(suggestion).toBeDefined();
      expect(suggestion.suggestedPrice).toBeGreaterThan(0);
      expect(suggestion.confidence).toBeGreaterThan(0);
    });
  });

  describe('Market Intelligence', () => {
    it('should provide enhanced market intelligence', async () => {
      const intelligence = await negotiationService.getEnhancedMarketIntelligence('wheat');

      expect(intelligence).toBeDefined();
      expect(intelligence.marketData).toBeDefined();
      expect(intelligence.seasonalFactors).toBeDefined();
      expect(intelligence.supplyDemandIndicators).toBeDefined();
      expect(intelligence.competitiveAnalysis).toBeDefined();
    });

    it('should provide role-specific guidance', async () => {
      const vendorGuidance = await negotiationService.getRoleSpecificGuidance('vendor', {});
      const buyerGuidance = await negotiationService.getRoleSpecificGuidance('buyer', {});
      const agentGuidance = await negotiationService.getRoleSpecificGuidance('agent', {});

      // Check that each role gets different guidance
      expect(vendorGuidance.strategies).not.toEqual(buyerGuidance.strategies);
      expect(buyerGuidance.strategies).not.toEqual(agentGuidance.strategies);

      // Check structure
      expect(vendorGuidance.strategies).toBeInstanceOf(Array);
      expect(vendorGuidance.commonMistakes).toBeInstanceOf(Array);
      expect(vendorGuidance.successTips).toBeInstanceOf(Array);
    });
  });
});