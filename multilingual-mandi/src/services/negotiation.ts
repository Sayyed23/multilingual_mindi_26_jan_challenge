// Negotiation Service with AI-Powered Market Intelligence
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  arrayUnion
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../lib/firebase';
import { offlineSyncService } from './offlineSync';
import { priceDiscoveryService } from './priceDiscovery';
import type {
  NegotiationService,
  Negotiation,
  DealProposal,
  Message,
  NegotiationSuggestion,
  MarketComparison,
  DealTerms,
  Deal,
  UserRole,
  PriceData,

  Unsubscribe
} from '../types';

// Constants for negotiation service
const NEGOTIATION_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const MARKET_DATA_CACHE_TTL = 5 * 60 * 1000; // 5 minutes


// Role-based negotiation parameters
const ROLE_PARAMETERS = {
  vendor: {
    priceAggression: 1.05, // Tend to ask for 5% more
    concessionRate: 0.02,  // Make 2% concessions
    marketPremium: 1.02    // Expect 2% above market
  },
  buyer: {
    priceAggression: 0.95, // Tend to offer 5% less
    concessionRate: 0.03,  // Make 3% concessions
    marketDiscount: 0.98   // Expect 2% below market
  },
  agent: {
    priceAggression: 1.0,  // Neutral pricing
    concessionRate: 0.025, // Balanced concessions
    marketPremium: 1.0     // Fair market pricing
  },
  admin: {
    priceAggression: 1.0,
    concessionRate: 0.05,
    marketPremium: 1.0
  }
};

// Demo Data
const DEMO_NEGOTIATION: Negotiation = {
  id: 'demo_negotiation_123',
  dealProposal: {
    commodity: 'Wheat',
    quantity: 50,
    unit: 'quintal',
    proposedPrice: 2200,
    quality: 'standard',
    deliveryLocation: {
      state: 'Punjab',
      district: 'Ludhiana',
      city: 'Khanna',
      pincode: '141401'
    },
    deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  },
  participants: {
    buyer: 'demo_buyer',
    seller: 'current_user', // Will be replaced dynamically
    agent: undefined
  },
  messages: [
    {
      id: 'msg_1',
      conversationId: 'demo_negotiation_123',
      senderId: 'demo_buyer',
      receiverId: 'current_user',
      content: {
        originalText: 'I am interested in your wheat lot. Is the price negotiable?',
        originalLanguage: 'en',
        translations: {
          'hi': 'मैं आपके गेहूं के लॉट में रुचि रखता हूं। क्या कीमत पर बातचीत हो सकती है?'
        },
        messageType: 'text'
      },
      metadata: {
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        readStatus: true
      }
    },
    {
      id: 'msg_2',
      conversationId: 'demo_negotiation_123',
      senderId: 'current_user',
      receiverId: 'demo_buyer',
      content: {
        originalText: 'Yes, slightly. The quality is premium Sharbati.',
        originalLanguage: 'en',
        translations: {},
        messageType: 'text'
      },
      metadata: {
        timestamp: new Date(Date.now() - 1800000), // 30 mins ago
        readStatus: true
      }
    }
  ],
  currentOffer: 2200,
  status: 'active',
  createdAt: new Date(Date.now() - 86400000), // 1 day ago
  updatedAt: new Date(Date.now() - 1800000)
};

// Negotiation Service Implementation
class NegotiationServiceImpl implements NegotiationService {
  private negotiationSubscriptions: Map<string, Unsubscribe> = new Map();
  private aiSuggestionFunction = httpsCallable(functions, 'generateNegotiationSuggestion');

  private marketConditionsCache: Map<string, any> = new Map();

  async startNegotiation(dealProposal: DealProposal, user: { uid: string; role: UserRole }): Promise<Negotiation> {
    try {
      // Validate deal proposal
      this.validateDealProposal(dealProposal);

      if (!user) {
        throw new Error('User must be authenticated to start negotiation');
      }

      // Create negotiation document
      const negotiationData = {
        dealProposal: {
          ...dealProposal,
          deliveryDate: Timestamp.fromDate(dealProposal.deliveryDate)
        },
        participants: {
          buyer: user.role === 'buyer' ? user.uid : '',
          seller: user.role === 'vendor' ? user.uid : '',
          agent: user.role === 'agent' ? user.uid : undefined
        },
        messages: [],
        currentOffer: dealProposal.proposedPrice,
        status: 'active' as const,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, 'negotiations'), negotiationData);

      // Create the negotiation object to return
      const negotiation: Negotiation = {
        id: docRef.id,
        dealProposal,
        participants: negotiationData.participants,
        messages: [],
        currentOffer: dealProposal.proposedPrice,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Cache the negotiation
      await this.cacheNegotiation(negotiation);

      // Queue offline action if needed
      if (!offlineSyncService.isOnline()) {
        await offlineSyncService.queueAction({
          id: `start_negotiation_${docRef.id}`,
          type: 'create_negotiation',
          payload: negotiationData,
          timestamp: new Date(),
          retryCount: 0
        });
      }

      return negotiation;
    } catch (error) {
      console.error('Failed to start negotiation:', error);
      throw new Error('Failed to start negotiation');
    }
  }

  async sendMessage(negotiationId: string, message: Message): Promise<void> {
    try {
      // Validate message
      this.validateMessage(message);

      // Get negotiation document
      const negotiationRef = doc(db, 'negotiations', negotiationId);
      const negotiationDoc = await getDoc(negotiationRef);

      if (!negotiationDoc.exists()) {
        throw new Error('Negotiation not found');
      }

      // Add message to negotiation
      await updateDoc(negotiationRef, {
        messages: arrayUnion({
          ...message,
          metadata: {
            ...message.metadata,
            timestamp: Timestamp.fromDate(message.metadata.timestamp)
          }
        }),
        updatedAt: Timestamp.now()
      });

      // Update cached negotiation
      const cachedNegotiation = await this.getCachedNegotiation(negotiationId);
      if (cachedNegotiation) {
        cachedNegotiation.messages.push(message);
        cachedNegotiation.updatedAt = new Date();
        await this.cacheNegotiation(cachedNegotiation);
      }

      // Queue offline action if needed
      if (!offlineSyncService.isOnline()) {
        await offlineSyncService.queueAction({
          id: `send_message_${message.id}`,
          type: 'send_message',
          payload: { negotiationId, message },
          timestamp: new Date(),
          retryCount: 0
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      throw new Error('Failed to send message');
    }
  }

  async getSuggestedCounterOffer(negotiation: Negotiation, currentOffer: number, userRole: UserRole = 'buyer'): Promise<NegotiationSuggestion> {
    try {
      // Check cache first
      const cacheKey = `suggestion_${negotiation.id}_${currentOffer}`;
      const cachedSuggestion = await offlineSyncService.getCachedData<NegotiationSuggestion>(cacheKey);

      if (cachedSuggestion && offlineSyncService.isOnline()) {
        const cacheEntry = await offlineSyncService.getCachedEntry<NegotiationSuggestion>(cacheKey);
        if (cacheEntry && Date.now() - cacheEntry.timestamp.getTime() < MARKET_DATA_CACHE_TTL) {
          return cachedSuggestion;
        }
      }

      if (!offlineSyncService.isOnline() && cachedSuggestion) {
        return cachedSuggestion;
      }

      // Get market comparison data
      const marketComparison = await this.getMarketComparison(
        negotiation.dealProposal.commodity,
        currentOffer
      );

      // Use passed userRole or default to buyer if not provided (though usage should provide it)
      // This method used to call getCurrentUser(). Now we rely on caller passing user context if needed,
      // but for now let's assume 'buyer' if we don't have user info, or update the signature.
      // To strictly follow the pattern, we should update the signature.

      // const userRole = 'buyer'; // Removed to use parameter
      // Better: Update getSuggestedCounterOffer signature?
      // Ideally yes. I will update it in next chunk.

      // Generate AI-powered suggestion
      let suggestion: NegotiationSuggestion;

      if (offlineSyncService.isOnline()) {
        try {
          const aiResponse = await this.aiSuggestionFunction({
            negotiation: {
              ...negotiation,
              dealProposal: {
                ...negotiation.dealProposal,
                deliveryDate: negotiation.dealProposal.deliveryDate.toISOString()
              }
            },
            currentOffer,
            marketData: marketComparison,
            userRole
          });

          suggestion = aiResponse.data as NegotiationSuggestion;
        } catch (aiError) {
          console.warn('AI suggestion failed, using fallback logic:', aiError);
          suggestion = this.generateFallbackSuggestion(negotiation, currentOffer, marketComparison, userRole);
        }
      } else {
        // Offline fallback
        suggestion = this.generateFallbackSuggestion(negotiation, currentOffer, marketComparison, userRole);
      }

      // Cache the suggestion
      await offlineSyncService.cacheData(cacheKey, suggestion, MARKET_DATA_CACHE_TTL);

      return suggestion;
    } catch (error) {
      console.error('Failed to get suggested counter offer:', error);

      // Return basic fallback suggestion
      const marketComparison = await this.getMarketComparison(
        negotiation.dealProposal.commodity,
        currentOffer
      );

      return this.generateBasicSuggestion(currentOffer, marketComparison);
    }
  }

  async getMarketComparison(commodity: string, price: number): Promise<MarketComparison> {
    try {
      // Check cache first
      const cacheKey = `market_comparison_${commodity}_${price}`;
      const cachedComparison = await offlineSyncService.getCachedData<MarketComparison>(cacheKey);

      if (cachedComparison && offlineSyncService.isOnline()) {
        const cacheEntry = await offlineSyncService.getCachedEntry<MarketComparison>(cacheKey);
        if (cacheEntry && Date.now() - cacheEntry.timestamp.getTime() < MARKET_DATA_CACHE_TTL) {
          return cachedComparison;
        }
      }

      if (!offlineSyncService.isOnline() && cachedComparison) {
        return cachedComparison;
      }

      // Get current market prices
      const currentPrices = await priceDiscoveryService.getCurrentPrices(commodity);
      const priceTrend = await priceDiscoveryService.getPriceTrends(commodity);

      // Calculate market statistics
      const priceValues = currentPrices.map(p => p.price);
      const minPrice = Math.min(...priceValues);
      const maxPrice = Math.max(...priceValues);
      const avgPrice = priceValues.reduce((sum, p) => sum + p, 0) / priceValues.length;

      // Get nearby markets (simplified - would use geospatial queries in production)
      const nearbyMarkets = currentPrices.slice(0, 5).map((priceData, index) => ({
        mandi: priceData.mandi,
        price: priceData.price,
        distance: (index + 1) * 10 // Placeholder distance calculation
      }));

      const marketComparison: MarketComparison = {
        commodity,
        currentMarketPrice: avgPrice,
        priceRange: {
          min: minPrice,
          max: maxPrice,
          average: avgPrice
        },
        nearbyMarkets,
        trend: priceTrend
      };

      // Cache the comparison
      await offlineSyncService.cacheData(cacheKey, marketComparison, MARKET_DATA_CACHE_TTL);

      return marketComparison;
    } catch (error) {
      console.error('Failed to get market comparison:', error);

      // Return basic market comparison
      return {
        commodity,
        currentMarketPrice: price,
        priceRange: {
          min: price * 0.9,
          max: price * 1.1,
          average: price
        },
        nearbyMarkets: [],
        trend: {
          commodity,
          trend: 'stable',
          changePercent: 0,
          timeframe: '7 days'
        }
      };
    }
  }

  async finalizeAgreement(negotiationId: string, terms: DealTerms, user: { uid: string; role: any }): Promise<Deal> {
    try {
      // Validate deal terms
      this.validateDealTerms(terms);

      if (!user) {
        throw new Error('User must be authenticated to finalize agreement');
      }

      // Get negotiation
      const negotiationRef = doc(db, 'negotiations', negotiationId);
      const negotiationDoc = await getDoc(negotiationRef);

      if (!negotiationDoc.exists()) {
        throw new Error('Negotiation not found');
      }

      const negotiationData = negotiationDoc.data();

      // Create deal document
      const dealData = {
        buyerId: negotiationData.participants.buyer,
        sellerId: negotiationData.participants.seller,
        commodity: terms.commodity,
        quantity: terms.quantity,
        unit: terms.unit,
        agreedPrice: terms.agreedPrice,
        quality: terms.quality,
        deliveryTerms: {
          ...terms.deliveryTerms,
          expectedDate: Timestamp.fromDate(terms.deliveryTerms.expectedDate)
        },
        paymentTerms: {
          ...terms.paymentTerms,
          dueDate: terms.paymentTerms.dueDate ? Timestamp.fromDate(terms.paymentTerms.dueDate) : undefined
        },
        status: 'agreed' as const,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      // Add deal to Firestore via DealManagementService (which now requires user)
      // Note: we are duplicating logic if we use addDoc directly here vs calling createDeal.
      // But dealManagementService.createDeal expects DealTerms and creates deal.
      // However, the original code duplicated addDoc logic. 
      // If we use dealManagementService, we should use it properly:
      // const deal = await dealManagementService.createDeal(terms, user);
      // But let's stick to existing logic structure if it was creating doc directly, OR switch to service.
      // The original code used addDoc directly here (lines 369).
      // But wait! dealManagementService.createDeal also adds to 'deals'.
      // If finalizeAgreement ADDED to 'deals' manually, it duplicated logic.
      // Let's keep manual addDoc if that was the design, but we don't need user for manual addDoc as much as service ref did.
      // However, the metadata might need it? 
      // The metadata uses negotiationData.participants.
      // So manual addDoc actually doesn't use `user` explicitly except if we need to auth check?
      // But wait! Authentication check IS needed.

      const dealRef = await addDoc(collection(db, 'deals'), dealData);

      // Update negotiation status
      await updateDoc(negotiationRef, {
        status: 'agreed',
        updatedAt: Timestamp.now()
      });

      // Create deal object to return
      const deal: Deal = {
        id: dealRef.id,
        buyerId: dealData.buyerId,
        sellerId: dealData.sellerId,
        commodity: terms.commodity,
        quantity: terms.quantity,
        unit: terms.unit,
        agreedPrice: terms.agreedPrice,
        quality: terms.quality,
        deliveryTerms: terms.deliveryTerms,
        paymentTerms: terms.paymentTerms,
        status: 'agreed',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Cache the deal
      await this.cacheDeal(deal);

      // Queue offline action if needed
      if (!offlineSyncService.isOnline()) {
        await offlineSyncService.queueAction({
          id: `finalize_agreement_${dealRef.id}`,
          type: 'create_deal',
          payload: dealData,
          timestamp: new Date(),
          retryCount: 0
        });
      }

      return deal;
    } catch (error) {
      console.error('Failed to finalize agreement:', error);
      throw new Error('Failed to finalize agreement');
    }
  }

  subscribeToNegotiation(negotiationId: string, callback: (negotiation: Negotiation) => void): Unsubscribe {
    const negotiationRef = doc(db, 'negotiations', negotiationId);

    return onSnapshot(negotiationRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const negotiation: Negotiation = {
          id: docSnap.id,
          dealProposal: {
            ...data.dealProposal,
            deliveryDate: data.dealProposal.deliveryDate instanceof Timestamp
              ? data.dealProposal.deliveryDate.toDate()
              : new Date(data.dealProposal.deliveryDate)
          },
          participants: data.participants,
          messages: (data.messages || []).map((msg: any) => ({
            ...msg,
            metadata: {
              ...msg.metadata,
              timestamp: msg.metadata.timestamp instanceof Timestamp
                ? msg.metadata.timestamp.toDate()
                : new Date(msg.metadata.timestamp)
            }
          })),
          currentOffer: data.currentOffer,
          status: data.status,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt)
        };
        callback(negotiation);
      }
    });
  }

  subscribeToNegotiations(userId: string, callback: (negotiations: Negotiation[]) => void): Unsubscribe {
    const negotiationsRef = collection(db, 'negotiations');

    // Simplified query to avoid complex index requirements
    // Fetch recent active negotiations and filter in client
    // Simplified query to avoid complex index requirements
    // Fetch recent active negotiations and filter in client
    const q = query(
      negotiationsRef,
      limit(50) // Limit to reasonable number
    );

    return onSnapshot(q, (querySnapshot) => {
      const negotiations: Negotiation[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();

        // Filter for user involvement on client side
        const participants = data.participants || {};
        if (participants.buyer === userId || participants.seller === userId || participants.agent === userId) {
          negotiations.push({
            id: docSnap.id,
            dealProposal: {
              ...data.dealProposal,
              deliveryDate: data.dealProposal.deliveryDate instanceof Timestamp
                ? data.dealProposal.deliveryDate.toDate()
                : new Date(data.dealProposal.deliveryDate)
            },
            participants: data.participants,
            messages: (data.messages || []).map((msg: any) => ({
              ...msg,
              metadata: {
                ...msg.metadata,
                timestamp: msg.metadata.timestamp instanceof Timestamp
                  ? msg.metadata.timestamp.toDate()
                  : new Date(msg.metadata.timestamp)
              }
            })),
            currentOffer: data.currentOffer,
            status: data.status,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt)
          });
        }
      });

      // Sort by updatedAt descending (since we removed orderBy)
      negotiations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());


      // Inject demo data if list is empty
      if (negotiations.length === 0) {
        const demo = { ...DEMO_NEGOTIATION };
        // Adapt demo data to current user context if possible
        if (userId) {
          demo.participants.seller = userId; // Assume user is seller for demo
          demo.messages = demo.messages.map((m: Message) => ({
            ...m,
            senderId: m.senderId === 'current_user' ? userId : m.senderId,
            receiverId: m.receiverId === 'current_user' ? userId : m.receiverId
          }));
        }
        negotiations.push(demo);
      }

      callback(negotiations);
    }, (error) => {
      console.error("Error subscribing to negotiations:", error);
      // Return empty list on error to stop loading spinner
      callback([]);
    });
  }

  // Helper to load demo data
  async createDemoNegotiation(userId: string): Promise<Negotiation> {
    const demo = { ...DEMO_NEGOTIATION };
    demo.participants.seller = userId;
    // Fix message sender IDs
    demo.messages = demo.messages.map(m => ({
      ...m,
      senderId: m.senderId === 'current_user' ? userId : m.senderId,
      receiverId: m.receiverId === 'current_user' ? userId : m.receiverId
    }));

    // Cache it so it feels real
    await this.cacheNegotiation(demo);
    return demo;
  }

  // Private helper methods

  private validateDealProposal(proposal: DealProposal): void {
    if (!proposal.commodity || proposal.commodity.trim() === '') {
      throw new Error('Commodity is required');
    }

    if (proposal.quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }

    if (!proposal.unit || proposal.unit.trim() === '') {
      throw new Error('Unit is required');
    }

    if (proposal.proposedPrice <= 0) {
      throw new Error('Proposed price must be greater than zero');
    }

    if (!['premium', 'standard', 'basic', 'mixed'].includes(proposal.quality)) {
      throw new Error('Invalid quality grade');
    }

    if (!proposal.deliveryLocation) {
      throw new Error('Delivery location is required');
    }

    if (proposal.deliveryDate <= new Date()) {
      throw new Error('Delivery date must be in the future');
    }
  }

  private validateMessage(message: Message): void {
    if (!message.id || message.id.trim() === '') {
      throw new Error('Message ID is required');
    }

    if (!message.senderId || message.senderId.trim() === '') {
      throw new Error('Sender ID is required');
    }

    if (!message.receiverId || message.receiverId.trim() === '') {
      throw new Error('Receiver ID is required');
    }

    if (!message.content.originalText || message.content.originalText.trim() === '') {
      throw new Error('Message content is required');
    }

    if (!['text', 'voice', 'image', 'document'].includes(message.content.messageType)) {
      throw new Error('Invalid message type');
    }
  }

  private validateDealTerms(terms: DealTerms): void {
    if (!terms.commodity || terms.commodity.trim() === '') {
      throw new Error('Commodity is required');
    }

    if (terms.quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }

    if (terms.agreedPrice <= 0) {
      throw new Error('Agreed price must be greater than zero');
    }

    if (!terms.deliveryTerms.location) {
      throw new Error('Delivery location is required');
    }

    if (terms.deliveryTerms.expectedDate <= new Date()) {
      throw new Error('Delivery date must be in the future');
    }

    if (!['immediate', 'on_delivery', 'partial', 'credit'].includes(terms.paymentTerms.schedule)) {
      throw new Error('Invalid payment schedule');
    }
  }

  // Placeholder removed

  private generateFallbackSuggestion(
    _negotiation: Negotiation,
    currentOffer: number,
    marketData: MarketComparison,
    userRole: UserRole
  ): NegotiationSuggestion {
    const marketPrice = marketData.currentMarketPrice;
    const priceRange = marketData.priceRange;

    let suggestedPrice: number;
    let reasoning: string;
    let confidence: number;

    // Role-based suggestion logic
    if (userRole === 'buyer') {
      // Buyers want lower prices
      if (currentOffer > marketPrice) {
        suggestedPrice = Math.max(priceRange.min, marketPrice * 0.95);
        reasoning = `Current offer is above market average (₹${marketPrice}). Consider offering closer to market rate.`;
        confidence = 0.7;
      } else {
        suggestedPrice = Math.max(currentOffer * 0.95, priceRange.min);
        reasoning = `Your offer is competitive. Small reduction might help close the deal.`;
        confidence = 0.6;
      }
    } else if (userRole === 'vendor') {
      // Vendors want higher prices
      if (currentOffer < marketPrice) {
        suggestedPrice = Math.min(priceRange.max, marketPrice * 1.05);
        reasoning = `Current offer is below market average (₹${marketPrice}). You can ask for a higher price.`;
        confidence = 0.7;
      } else {
        suggestedPrice = Math.min(currentOffer * 1.05, priceRange.max);
        reasoning = `Your price is above market rate. Small increase is still reasonable.`;
        confidence = 0.6;
      }
    } else {
      // Agents aim for fair market price
      suggestedPrice = marketPrice;
      reasoning = `As an agent, recommend the fair market price of ₹${marketPrice}.`;
      confidence = 0.8;
    }

    const suggestion = {
      suggestedPrice: Math.round(suggestedPrice),
      reasoning,
      marketData,
      confidence
    };

    return this.ensureAdvisoryOnly(suggestion);
  }

  private generateBasicSuggestion(_currentOffer: number, marketData: MarketComparison): NegotiationSuggestion {
    const suggestion = {
      suggestedPrice: Math.round(marketData.currentMarketPrice),
      reasoning: `Based on current market conditions, ₹${marketData.currentMarketPrice} is a fair price.`,
      marketData,
      confidence: 0.5
    };

    return this.ensureAdvisoryOnly(suggestion);
  }

  // Caching methods

  private async cacheNegotiation(negotiation: Negotiation): Promise<void> {
    const cacheKey = `negotiation_${negotiation.id}`;
    await offlineSyncService.cacheData(cacheKey, negotiation, NEGOTIATION_CACHE_TTL);
  }

  private async getCachedNegotiation(negotiationId: string): Promise<Negotiation | null> {
    const cacheKey = `negotiation_${negotiationId}`;
    return await offlineSyncService.getCachedData<Negotiation>(cacheKey);
  }

  private async cacheDeal(deal: Deal): Promise<void> {
    const cacheKey = `deal_${deal.id}`;
    await offlineSyncService.cacheData(cacheKey, deal, NEGOTIATION_CACHE_TTL);
  }

  // Advanced role-based negotiation adaptation

  async getDynamicRoleBasedSuggestion(
    negotiation: Negotiation,
    currentOffer: number,
    userRole: UserRole,
    negotiationHistory?: Message[]
  ): Promise<NegotiationSuggestion> {
    try {
      // Get current market conditions
      const marketConditions = await this.getCurrentMarketConditions(negotiation.dealProposal.commodity);

      // Analyze negotiation patterns
      const negotiationPattern = this.analyzeNegotiationPattern(negotiationHistory || negotiation.messages);

      // Apply dynamic role-based algorithm
      const suggestion = await this.applyDynamicRoleAlgorithm(
        negotiation,
        currentOffer,
        userRole,
        marketConditions,
        negotiationPattern
      );

      // Ensure advisory nature
      return this.ensureAdvisoryOnly(suggestion);
    } catch (error) {
      console.error('Failed to get dynamic role-based suggestion:', error);
      return this.generateFallbackSuggestion(
        negotiation,
        currentOffer,
        await this.getMarketComparison(negotiation.dealProposal.commodity, currentOffer),
        userRole
      );
    }
  }

  private async getCurrentMarketConditions(commodity: string): Promise<any> {
    const cacheKey = `market_conditions_${commodity}`;

    // Check cache first
    if (this.marketConditionsCache.has(cacheKey)) {
      const cached = this.marketConditionsCache.get(cacheKey);
      if (Date.now() - cached.timestamp < MARKET_DATA_CACHE_TTL) {
        return cached.data;
      }
    }

    try {
      // In a real implementation, this would call external market data APIs
      const conditions = {
        supply: 'normal', // high, normal, low
        demand: 'normal', // high, normal, low
        seasonalFactor: 1.0, // multiplier based on season
        weatherImpact: 'none', // positive, negative, none
        transportCosts: 'stable', // rising, falling, stable
        competitionLevel: 'medium', // high, medium, low
        timestamp: Date.now()
      };

      // Cache the conditions
      this.marketConditionsCache.set(cacheKey, {
        data: conditions,
        timestamp: Date.now()
      });

      return conditions;
    } catch (error) {
      console.error('Failed to get market conditions:', error);
      return {
        supply: 'normal',
        demand: 'normal',
        seasonalFactor: 1.0,
        weatherImpact: 'none',
        transportCosts: 'stable',
        competitionLevel: 'medium'
      };
    }
  }

  private analyzeNegotiationPattern(messages: Message[]): {
    concessionRate: number;
    aggressiveness: number;
    responseTime: number;
    priceMovement: 'increasing' | 'decreasing' | 'stable';
  } {
    if (messages.length < 2) {
      return {
        concessionRate: 0,
        aggressiveness: 0.5,
        responseTime: 0,
        priceMovement: 'stable'
      };
    }

    // Analyze price mentions in messages (simplified)
    const priceReferences = messages
      .map(msg => this.extractPriceFromMessage(msg.content.originalText))
      .filter(price => price > 0);

    let priceMovement: 'increasing' | 'decreasing' | 'stable' = 'stable';
    let concessionRate = 0;

    if (priceReferences.length >= 2) {
      const firstPrice = priceReferences[0];
      const lastPrice = priceReferences[priceReferences.length - 1];
      const change = (lastPrice - firstPrice) / firstPrice;

      if (Math.abs(change) > 0.02) { // 2% threshold
        priceMovement = change > 0 ? 'increasing' : 'decreasing';
        concessionRate = Math.abs(change);
      }
    }

    // Calculate average response time (simplified)
    const responseTimes = messages.slice(1).map((msg, index) => {
      const prevMsg = messages[index];
      return msg.metadata.timestamp.getTime() - prevMsg.metadata.timestamp.getTime();
    });

    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    // Calculate aggressiveness based on message tone (simplified)
    const aggressiveness = this.calculateMessageAggressiveness(messages);

    return {
      concessionRate,
      aggressiveness,
      responseTime: avgResponseTime / (1000 * 60 * 60), // Convert to hours
      priceMovement
    };
  }

  private extractPriceFromMessage(text: string): number {
    // Simple regex to extract price (₹ symbol or numbers)
    const priceMatch = text.match(/₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)/);
    if (priceMatch) {
      return parseFloat(priceMatch[1].replace(/,/g, ''));
    }
    return 0;
  }

  private calculateMessageAggressiveness(messages: Message[]): number {
    // Simplified aggressiveness calculation based on message characteristics
    let aggressivenessScore = 0.5; // Neutral baseline

    messages.forEach(msg => {
      const text = msg.content.originalText.toLowerCase();

      // Aggressive indicators
      if (text.includes('final') || text.includes('last offer') || text.includes('take it or leave it')) {
        aggressivenessScore += 0.2;
      }

      // Polite indicators
      if (text.includes('please') || text.includes('consider') || text.includes('kindly')) {
        aggressivenessScore -= 0.1;
      }

      // Urgency indicators
      if (text.includes('urgent') || text.includes('immediately') || text.includes('asap')) {
        aggressivenessScore += 0.1;
      }
    });

    return Math.max(0, Math.min(1, aggressivenessScore));
  }

  private async applyDynamicRoleAlgorithm(
    negotiation: Negotiation,
    currentOffer: number,
    userRole: UserRole,
    marketConditions: any,
    negotiationPattern: any
  ): Promise<NegotiationSuggestion> {
    const baseMarketData = await this.getMarketComparison(negotiation.dealProposal.commodity, currentOffer);
    const roleParams = ROLE_PARAMETERS[userRole];

    let suggestedPrice = baseMarketData.currentMarketPrice;
    let reasoning = '';
    let confidence = 0.7;

    // Apply role-specific base adjustment
    suggestedPrice *= (roleParams as any).marketPremium || (roleParams as any).marketDiscount || 1.0;

    // Market condition adjustments
    if (marketConditions.supply === 'low' && userRole === 'vendor') {
      suggestedPrice *= 1.05;
      reasoning += 'Low supply conditions favor sellers. ';
      confidence += 0.1;
    } else if (marketConditions.supply === 'high' && userRole === 'buyer') {
      suggestedPrice *= 0.95;
      reasoning += 'High supply conditions favor buyers. ';
      confidence += 0.1;
    }

    // Demand adjustments
    if (marketConditions.demand === 'high') {
      suggestedPrice *= userRole === 'vendor' ? 1.03 : 1.01;
      reasoning += 'High demand supports higher pricing. ';
    } else if (marketConditions.demand === 'low') {
      suggestedPrice *= userRole === 'buyer' ? 0.97 : 0.99;
      reasoning += 'Low demand pressures prices downward. ';
    }

    // Seasonal adjustments
    suggestedPrice *= marketConditions.seasonalFactor;
    if (marketConditions.seasonalFactor !== 1.0) {
      reasoning += `Seasonal factors ${marketConditions.seasonalFactor > 1 ? 'increase' : 'decrease'} pricing. `;
    }

    // Negotiation pattern adjustments
    if (negotiationPattern.priceMovement === 'decreasing' && userRole === 'buyer') {
      // Buyer is winning, can be more aggressive
      suggestedPrice *= 0.98;
      reasoning += 'Price trend favors your position. ';
      confidence += 0.05;
    } else if (negotiationPattern.priceMovement === 'increasing' && userRole === 'vendor') {
      // Vendor is winning, can hold firm
      suggestedPrice *= 1.02;
      reasoning += 'Price momentum supports your position. ';
      confidence += 0.05;
    }

    // Aggressiveness adjustments
    if (negotiationPattern.aggressiveness > 0.7) {
      // High aggressiveness detected, suggest moderation
      const moderationFactor = userRole === 'agent' ? 1.0 : 0.99;
      suggestedPrice *= moderationFactor;
      reasoning += 'Consider a more moderate approach to maintain goodwill. ';
    }

    // Response time adjustments
    if (negotiationPattern.responseTime > 24) { // More than 24 hours
      // Slow responses might indicate lack of interest
      if (userRole === 'buyer') {
        suggestedPrice *= 0.98; // More aggressive offer
        reasoning += 'Slow responses suggest room for better pricing. ';
      } else if (userRole === 'vendor') {
        suggestedPrice *= 1.01; // Hold firm
        reasoning += 'Maintain your position despite slow responses. ';
      }
    }

    // Competition level adjustments
    if (marketConditions.competitionLevel === 'high') {
      if (userRole === 'buyer') {
        suggestedPrice *= 0.97;
        reasoning += 'High competition gives you negotiating power. ';
      } else if (userRole === 'vendor') {
        suggestedPrice *= 1.01;
        reasoning += 'Differentiate your offer in competitive market. ';
      }
    }

    // Final role-specific reasoning
    switch (userRole) {
      case 'vendor':
        reasoning += 'As a vendor, focus on value proposition and quality. ';
        break;
      case 'buyer':
        reasoning += 'As a buyer, emphasize volume and long-term relationship. ';
        break;
      case 'agent':
        reasoning += 'As an agent, balance both parties\' interests for successful closure. ';
        break;
    }

    return {
      suggestedPrice: Math.round(suggestedPrice),
      reasoning: reasoning.trim(),
      marketData: baseMarketData,
      confidence: Math.min(confidence, 1.0)
    };
  }


  // Dynamic recommendation updates based on market changes
  async monitorAndUpdateRecommendations(negotiationId: string): Promise<void> {
    try {
      const negotiation = await this.getNegotiation(negotiationId);
      if (!negotiation || negotiation.status !== 'active') {
        return;
      }

      // Set up market monitoring for this negotiation
      const commodity = negotiation.dealProposal.commodity;

      // Subscribe to price updates
      const unsubscribe = priceDiscoveryService.subscribeToPriceUpdates(commodity, async (newPriceData) => {
        await this.handleMarketUpdate(negotiationId, newPriceData);
      });

      // Store subscription for cleanup
      this.negotiationSubscriptions.set(`market_monitor_${negotiationId}`, unsubscribe);

      // Schedule periodic market condition checks
      const intervalId = setInterval(async () => {
        await this.checkMarketConditionChanges(negotiationId);
      }, 30 * 60 * 1000); // Every 30 minutes

      // Store interval for cleanup
      this.negotiationSubscriptions.set(`market_interval_${negotiationId}`, () => {
        clearInterval(intervalId);
      });

    } catch (error) {
      console.error('Failed to monitor market for negotiation:', error);
    }
  }

  private async handleMarketUpdate(negotiationId: string, priceData: PriceData): Promise<void> {
    try {
      const negotiation = await this.getNegotiation(negotiationId);
      if (!negotiation) return;

      const currentMarketPrice = priceData.price;
      const negotiationPrice = negotiation.currentOffer;

      // Calculate significant change threshold (5%)
      const changeThreshold = 0.05;
      const priceChange = Math.abs(currentMarketPrice - negotiationPrice) / negotiationPrice;

      if (priceChange > changeThreshold) {
        // Clear cached suggestions to force refresh
        const suggestionCacheKey = `suggestion_${negotiationId}_${negotiationPrice}`;
        await offlineSyncService.cacheData(suggestionCacheKey, null, 0);

        // Log market update
        console.log(`Significant market change detected for negotiation ${negotiationId}: ${priceChange * 100}%`);

        // In a full implementation, this would trigger notifications to participants
      }
    } catch (error) {
      console.error('Failed to handle market update:', error);
    }
  }

  private async checkMarketConditionChanges(negotiationId: string): Promise<void> {
    try {
      const negotiation = await this.getNegotiation(negotiationId);
      if (!negotiation) return;

      const commodity = negotiation.dealProposal.commodity;

      // Clear market conditions cache to get fresh data
      const cacheKey = `market_conditions_${commodity}`;
      this.marketConditionsCache.delete(cacheKey);

      // Get fresh market conditions
      const newConditions = await this.getCurrentMarketConditions(commodity);

      // In a full implementation, this would compare with previous conditions
      // and trigger updates if significant changes are detected
      console.log(`Market conditions checked for ${commodity}:`, newConditions);

    } catch (error) {
    }
  }

  // Advisory-only enforcement with enhanced disclaimers
  private ensureAdvisoryOnly(suggestion: NegotiationSuggestion): NegotiationSuggestion {
    const disclaimers = [
      'This is advisory guidance only.',
      'You retain full control over all decisions.',
      'Consider your specific circumstances before making a decision.',
      'Final agreements are your responsibility.'
    ];

    const randomDisclaimer = disclaimers[Math.floor(Math.random() * disclaimers.length)];

    return {
      ...suggestion,
      reasoning: `${suggestion.reasoning} (${randomDisclaimer})`,
      confidence: Math.min(suggestion.confidence, 0.95) // Cap confidence to emphasize advisory nature
    };
  }

  async getRoleSpecificGuidance(userRole: UserRole, _negotiationContext: any): Promise<{
    strategies: string[];
    commonMistakes: string[];
    successTips: string[];
  }> {
    const guidance = {
      vendor: {
        strategies: [
          'Emphasize product quality and unique value proposition',
          'Use market trends to justify pricing',
          'Offer volume discounts for larger orders',
          'Highlight reliability and consistent supply'
        ],
        commonMistakes: [
          'Starting with unrealistically high prices',
          'Being inflexible on delivery terms',
          'Not understanding buyer\'s constraints',
          'Focusing only on price, ignoring relationship'
        ],
        successTips: [
          'Build trust through transparent communication',
          'Offer samples or trial quantities',
          'Be prepared with market data',
          'Consider long-term partnership benefits'
        ]
      },
      buyer: {
        strategies: [
          'Leverage volume for better pricing',
          'Compare multiple suppliers openly',
          'Negotiate payment terms favorably',
          'Emphasize long-term business potential'
        ],
        commonMistakes: [
          'Making unrealistically low initial offers',
          'Ignoring quality for price savings',
          'Not considering total cost of ownership',
          'Being too aggressive and damaging relationships'
        ],
        successTips: [
          'Research market prices thoroughly',
          'Build relationships with multiple suppliers',
          'Be clear about quality requirements',
          'Consider seasonal price variations'
        ]
      },
      agent: {
        strategies: [
          'Focus on win-win outcomes for both parties',
          'Use market knowledge to guide discussions',
          'Facilitate clear communication',
          'Identify creative solutions to deadlocks'
        ],
        commonMistakes: [
          'Favoring one party over another',
          'Not understanding both parties\' real needs',
          'Rushing to close deals',
          'Not maintaining neutrality'
        ],
        successTips: [
          'Build trust with both parties',
          'Stay updated on market conditions',
          'Document all agreements clearly',
          'Focus on long-term relationships'
        ]
      },
      admin: {
        strategies: [
          'Ensure fair platform usage',
          'Monitor compliance',
          'Resolve disputes impartially'
        ],
        commonMistakes: [
          'Over-intervention',
          'Ignoring context',
          'Bias'
        ],
        successTips: [
          'Be objective',
          'Follow platform policies',
          'Communicate decisions clearly'
        ]
      }
    };

    return guidance[userRole] || guidance.buyer;
  }









  // Dynamic recommendation updates based on market changes
  async updateRecommendationsForMarketChange(
    negotiationId: string,
    marketChange: {
      commodity: string;
      priceChange: number;
      reason: string;
    }
  ): Promise<void> {
    try {
      // Get current negotiation
      const negotiation = await this.getCachedNegotiation(negotiationId);
      if (!negotiation || negotiation.status !== 'active') {
        return; // No active negotiation to update
      }

      // Clear cached suggestions to force refresh

      // Note: In a full implementation, we'd need a method to clear cache entries by pattern

      // Notify participants about market change (this would integrate with notification service)
      console.log(`Market update for ${marketChange.commodity}: ${marketChange.reason}`);

      // Update negotiation metadata with market change info
      if (offlineSyncService.isOnline()) {
        const negotiationRef = doc(db, 'negotiations', negotiationId);
        await updateDoc(negotiationRef, {
          marketUpdates: arrayUnion({
            timestamp: Timestamp.now(),
            change: marketChange
          }),
          updatedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Failed to update recommendations for market change:', error);
    }
  }

  async getAdvisoryDisclaimer(): Promise<string> {
    return 'All negotiation suggestions are advisory only. The platform does not make binding decisions or commitments on your behalf. You retain full control over all negotiation decisions and final agreements.';
  }

  // Market intelligence integration
  async getEnhancedMarketIntelligence(commodity: string, _location?: any): Promise<{
    marketData: MarketComparison;
    seasonalFactors: any;
    supplyDemandIndicators: any;
    competitiveAnalysis: any;
  }> {
    try {
      const marketData = await this.getMarketComparison(commodity, 0);

      // In a full implementation, these would be real market intelligence features
      const seasonalFactors = {
        currentSeason: 'harvest', // Would be calculated based on commodity and date
        demandLevel: 'medium',
        supplyLevel: 'high'
      };

      const supplyDemandIndicators = {
        supplyTrend: 'increasing',
        demandTrend: 'stable',
        inventoryLevels: 'normal'
      };

      const competitiveAnalysis = {
        averageNegotiationTime: '2.5 days',
        successRate: '78%',
        commonPriceRange: `₹${marketData.priceRange.min} - ₹${marketData.priceRange.max}`
      };

      return {
        marketData,
        seasonalFactors,
        supplyDemandIndicators,
        competitiveAnalysis
      };
    } catch (error) {
      console.error('Failed to get enhanced market intelligence:', error);
      throw new Error('Failed to retrieve market intelligence');
    }
  }

  // Additional utility methods for negotiation management

  async getNegotiation(negotiationId: string): Promise<Negotiation | null> {
    try {
      // Check cache first
      const cachedNegotiation = await this.getCachedNegotiation(negotiationId);
      if (cachedNegotiation) {
        return cachedNegotiation;
      }

      // Fetch from Firestore
      const negotiationRef = doc(db, 'negotiations', negotiationId);
      const negotiationDoc = await getDoc(negotiationRef);

      if (!negotiationDoc.exists()) {
        return null;
      }

      const data = negotiationDoc.data();
      const negotiation: Negotiation = {
        id: negotiationDoc.id,
        dealProposal: {
          ...data.dealProposal,
          deliveryDate: data.dealProposal.deliveryDate.toDate()
        },
        participants: data.participants,
        messages: data.messages.map((msg: any) => ({
          ...msg,
          metadata: {
            ...msg.metadata,
            timestamp: msg.metadata.timestamp.toDate()
          }
        })),
        currentOffer: data.currentOffer,
        status: data.status,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate()
      };

      // Cache the negotiation
      await this.cacheNegotiation(negotiation);

      return negotiation;
    } catch (error) {
      console.error('Failed to get negotiation:', error);
      return null;
    }
  }

  async getUserNegotiations(userId: string): Promise<Negotiation[]> {
    try {
      // Check cache first
      const cacheKey = `user_negotiations_${userId}`;
      const cachedNegotiations = await offlineSyncService.getCachedData<Negotiation[]>(cacheKey);

      if (cachedNegotiations && offlineSyncService.isOnline()) {
        const cacheEntry = await offlineSyncService.getCachedEntry<Negotiation[]>(cacheKey);
        if (cacheEntry && Date.now() - cacheEntry.timestamp.getTime() < NEGOTIATION_CACHE_TTL) {
          return cachedNegotiations;
        }
      }

      if (!offlineSyncService.isOnline() && cachedNegotiations) {
        return cachedNegotiations;
      }

      // Fetch from Firestore
      const negotiationsQuery = query(
        collection(db, 'negotiations'),
        where('participants.buyer', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(50)
      );

      const sellerQuery = query(
        collection(db, 'negotiations'),
        where('participants.seller', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(50)
      );

      const agentQuery = query(
        collection(db, 'negotiations'),
        where('participants.agent', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(50)
      );

      const [buyerSnapshot, sellerSnapshot, agentSnapshot] = await Promise.all([
        getDocs(negotiationsQuery),
        getDocs(sellerQuery),
        getDocs(agentQuery)
      ]);

      const negotiations: Negotiation[] = [];
      const processSnapshot = (snapshot: any) => {
        snapshot.forEach((doc: any) => {
          const data = doc.data();
          negotiations.push({
            id: doc.id,
            dealProposal: {
              ...data.dealProposal,
              deliveryDate: data.dealProposal.deliveryDate.toDate()
            },
            participants: data.participants,
            messages: data.messages.map((msg: any) => ({
              ...msg,
              metadata: {
                ...msg.metadata,
                timestamp: msg.metadata.timestamp.toDate()
              }
            })),
            currentOffer: data.currentOffer,
            status: data.status,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate()
          });
        });
      };

      processSnapshot(buyerSnapshot);
      processSnapshot(sellerSnapshot);
      processSnapshot(agentSnapshot);

      // Remove duplicates and sort by updated date
      const uniqueNegotiations = negotiations
        .filter((neg, index, self) => self.findIndex(n => n.id === neg.id) === index)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      // Cache the results
      await offlineSyncService.cacheData(cacheKey, uniqueNegotiations, NEGOTIATION_CACHE_TTL);

      return uniqueNegotiations;
    } catch (error) {
      console.error('Failed to get user negotiations:', error);

      // Return cached data on error
      const cacheKey = `user_negotiations_${userId}`;
      const cachedNegotiations = await offlineSyncService.getCachedData<Negotiation[]>(cacheKey);
      return cachedNegotiations || [];
    }
  }

  async updateNegotiationStatus(negotiationId: string, status: 'active' | 'agreed' | 'rejected' | 'expired'): Promise<void> {
    try {
      const negotiationRef = doc(db, 'negotiations', negotiationId);
      await updateDoc(negotiationRef, {
        status,
        updatedAt: Timestamp.now()
      });

      // Update cached negotiation
      const cachedNegotiation = await this.getCachedNegotiation(negotiationId);
      if (cachedNegotiation) {
        cachedNegotiation.status = status;
        cachedNegotiation.updatedAt = new Date();
        await this.cacheNegotiation(cachedNegotiation);
      }

      // Queue offline action if needed
      if (!offlineSyncService.isOnline()) {
        await offlineSyncService.queueAction({
          id: `update_negotiation_status_${negotiationId}`,
          type: 'update_profile', // Reusing existing action type
          payload: { negotiationId, status },
          timestamp: new Date(),
          retryCount: 0
        });
      }
    } catch (error) {
      console.error('Failed to update negotiation status:', error);
      throw new Error('Failed to update negotiation status');
    }
  }


  // Performance and analytics methods

  async getNegotiationAnalytics(negotiationId: string): Promise<{
    duration: number; // in hours
    messageCount: number;
    priceMovement: {
      initial: number;
      current: number;
      changePercent: number;
    };
    marketComparison: {
      aboveMarket: boolean;
      deviation: number;
    };
  }> {
    try {
      const negotiation = await this.getNegotiation(negotiationId);
      if (!negotiation) {
        throw new Error('Negotiation not found');
      }

      const duration = (negotiation.updatedAt.getTime() - negotiation.createdAt.getTime()) / (1000 * 60 * 60);
      const messageCount = negotiation.messages.length;

      const initialPrice = negotiation.dealProposal.proposedPrice;
      const currentPrice = negotiation.currentOffer;
      const changePercent = ((currentPrice - initialPrice) / initialPrice) * 100;

      const marketData = await this.getMarketComparison(negotiation.dealProposal.commodity, currentPrice);
      const marketPrice = marketData.currentMarketPrice;
      const deviation = ((currentPrice - marketPrice) / marketPrice) * 100;

      return {
        duration: Math.round(duration * 100) / 100,
        messageCount,
        priceMovement: {
          initial: initialPrice,
          current: currentPrice,
          changePercent: Math.round(changePercent * 100) / 100
        },
        marketComparison: {
          aboveMarket: currentPrice > marketPrice,
          deviation: Math.round(deviation * 100) / 100
        }
      };
    } catch (error) {
      console.error('Failed to get negotiation analytics:', error);
      throw new Error('Failed to retrieve negotiation analytics');
    }
  }

  // Validation and error handling

  async validateNegotiationAccess(negotiationId: string, userId: string): Promise<boolean> {
    try {
      const negotiation = await this.getNegotiation(negotiationId);
      if (!negotiation) {
        return false;
      }

      return (
        negotiation.participants.buyer === userId ||
        negotiation.participants.seller === userId ||
        negotiation.participants.agent === userId
      );
    } catch (error) {
      console.error('Failed to validate negotiation access:', error);
      return false;
    }
  }

  async getActiveNegotiationsCount(userId: string): Promise<number> {
    try {
      const negotiations = await this.getUserNegotiations(userId);
      return negotiations.filter(n => n.status === 'active').length;
    } catch (error) {
      console.error('Failed to get active negotiations count:', error);
      return 0;
    }
  }

  // Cleanup method
  destroy(): void {
    // Clean up all subscriptions
    this.negotiationSubscriptions.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.negotiationSubscriptions.clear();
  }
}

// Export singleton instance
export const negotiationService = new NegotiationServiceImpl();

// Export types for external use
export type { NegotiationService } from '../types';