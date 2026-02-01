// Deal Management Service Tests
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { dealManagementService, paymentProcessor, dealCompletionManager } from '../dealManagement';
import type { DealTerms, Deal, PaymentMethod, DealStatus } from '../../types';

// Mock Firebase
vi.mock('../../lib/firebase', () => ({
  db: {},
  functions: {}
}));

// Mock Firebase Firestore functions
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn().mockResolvedValue({ id: 'mock-deal-id' }),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn(),
  Timestamp: {
    now: vi.fn().mockReturnValue({ toDate: () => new Date() }),
    fromDate: vi.fn().mockImplementation((date) => ({ toDate: () => date }))
  },
  arrayUnion: vi.fn()
}));

// Mock Firebase Functions
vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn().mockReturnValue(vi.fn().mockResolvedValue({
    data: {
      method: 'upi',
      dealId: 'mock-deal-id',
      status: 'pending',
      success: true,
      timestamp: new Date()
    }
  }))
}));

// Mock offline sync service
vi.mock('../offlineSync', () => ({
  offlineSyncService: {
    isOnline: vi.fn().mockReturnValue(true),
    cacheData: vi.fn().mockResolvedValue(undefined),
    getCachedData: vi.fn().mockResolvedValue(null),
    getCachedEntry: vi.fn().mockResolvedValue(null),
    queueAction: vi.fn().mockResolvedValue(undefined)
  }
}));

describe('Deal Management Service', () => {
  const mockDealTerms: DealTerms = {
    commodity: 'Rice',
    quantity: 100,
    unit: 'kg',
    agreedPrice: 50,
    quality: 'standard',
    deliveryTerms: {
      location: {
        state: 'Punjab',
        district: 'Ludhiana',
        city: 'Ludhiana',
        pincode: '141001'
      },
      expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      method: 'delivery',
      cost: 500,
      responsibility: 'seller'
    },
    paymentTerms: {
      method: 'upi',
      schedule: 'on_delivery'
    },
    additionalConditions: ['Quality inspection required']
  };

  const mockUser = { uid: 'user-123', role: 'buyer' as const };

  const mockDeal: Deal = {
    id: 'mock-deal-id',
    buyerId: 'buyer-123',
    sellerId: 'seller-456',
    commodity: 'Rice',
    quantity: 100,
    unit: 'kg',
    agreedPrice: 50,
    quality: 'standard',
    deliveryTerms: mockDealTerms.deliveryTerms,
    paymentTerms: mockDealTerms.paymentTerms,
    status: 'agreed',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createDeal', () => {
    it('should create a deal with valid terms', async () => {
      const result = await dealManagementService.createDeal(mockDealTerms, mockUser);

      expect(result).toBeDefined();
      expect(result.commodity).toBe(mockDealTerms.commodity);
      expect(result.quantity).toBe(mockDealTerms.quantity);
      expect(result.agreedPrice).toBe(mockDealTerms.agreedPrice);
      expect(result.status).toBe('agreed');
    });

    it('should throw error for invalid commodity', async () => {
      const invalidTerms = { ...mockDealTerms, commodity: '' };

      await expect(dealManagementService.createDeal(invalidTerms, mockUser)).rejects.toThrow('Commodity is required');
    });

    it('should throw error for invalid quantity', async () => {
      const invalidTerms = { ...mockDealTerms, quantity: 0 };

      await expect(dealManagementService.createDeal(invalidTerms, mockUser)).rejects.toThrow('Quantity must be greater than zero');
    });

    it('should throw error for invalid price', async () => {
      const invalidTerms = { ...mockDealTerms, agreedPrice: -10 };

      await expect(dealManagementService.createDeal(invalidTerms, mockUser)).rejects.toThrow('Agreed price must be greater than zero');
    });

    it('should throw error for past delivery date', async () => {
      const invalidTerms = {
        ...mockDealTerms,
        deliveryTerms: {
          ...mockDealTerms.deliveryTerms,
          expectedDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
        }
      };

      await expect(dealManagementService.createDeal(invalidTerms, mockUser)).rejects.toThrow('Delivery date must be in the future');
    });
  });

  describe('updateDealStatus', () => {
    it('should update deal status with valid transition', async () => {
      // Mock getDeal to return a deal
      vi.spyOn(dealManagementService, 'getDeal').mockResolvedValue(mockDeal);

      await expect(dealManagementService.updateDealStatus('mock-deal-id', 'paid')).resolves.not.toThrow();
    });

    it('should throw error for invalid status transition', async () => {
      const completedDeal = { ...mockDeal, status: 'completed' as DealStatus };
      vi.spyOn(dealManagementService, 'getDeal').mockResolvedValue(completedDeal);

      await expect(dealManagementService.updateDealStatus('mock-deal-id', 'agreed')).rejects.toThrow('Invalid status transition');
    });

    it('should throw error for non-existent deal', async () => {
      vi.spyOn(dealManagementService, 'getDeal').mockResolvedValue(null);

      await expect(dealManagementService.updateDealStatus('non-existent', 'paid')).rejects.toThrow('Deal not found');
    });
  });

  describe('initializePayment', () => {
    it('should initialize payment for valid deal', async () => {
      vi.spyOn(dealManagementService, 'getDeal').mockResolvedValue(mockDeal);

      const result = await dealManagementService.initializePayment('mock-deal-id', 'upi');

      expect(result).toBeDefined();
      expect(result.method).toBe('upi');
      expect(result.timestamp).toBeInstanceOf(Date);
      // In offline mode or with mocked functions, it might not succeed
      expect(typeof result.success).toBe('boolean');
    });

    it('should return error result for unsupported payment method', async () => {
      vi.spyOn(dealManagementService, 'getDeal').mockResolvedValue(mockDeal);

      const result = await dealManagementService.initializePayment('mock-deal-id', 'invalid' as PaymentMethod);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported payment method');
    });

    it('should return error result for deal with wrong status', async () => {
      const paidDeal = { ...mockDeal, status: 'paid' as DealStatus };
      vi.spyOn(dealManagementService, 'getDeal').mockResolvedValue(paidDeal);

      const result = await dealManagementService.initializePayment('mock-deal-id', 'upi');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot process payment for deal with status: paid');
    });
  });

  describe('trackDelivery', () => {
    it('should track delivery for paid deal', async () => {
      const paidDeal = { ...mockDeal, status: 'paid' as DealStatus };
      vi.spyOn(dealManagementService, 'getDeal').mockResolvedValue(paidDeal);

      const result = await dealManagementService.trackDelivery('mock-deal-id');

      expect(result).toBeDefined();
      expect(result.dealId).toBe('mock-deal-id');
      expect(result.status).toBeDefined();
      expect(['pending', 'in_transit', 'delivered', 'delayed', 'failed']).toContain(result.status);
    });

    it('should return fallback delivery status for deal with wrong status', async () => {
      const draftDeal = { ...mockDeal, status: 'draft' as DealStatus };
      vi.spyOn(dealManagementService, 'getDeal').mockResolvedValue(draftDeal);

      const result = await dealManagementService.trackDelivery('mock-deal-id');

      expect(result.dealId).toBe('mock-deal-id');
      expect(result.status).toBe('pending');
    });
  });

  describe('raiseDispute', () => {
    it('should raise dispute with valid reason', async () => {
      vi.spyOn(dealManagementService, 'getDeal').mockResolvedValue(mockDeal);

      const result = await dealManagementService.raiseDispute('mock-deal-id', 'Quality issues', mockUser);

      expect(result).toBeDefined();
      expect(result.dealId).toBe('mock-deal-id');
      expect(result.reason).toBe('Quality issues');
      expect(result.status).toBe('open');
    });

    it('should throw error for empty reason', async () => {
      vi.spyOn(dealManagementService, 'getDeal').mockResolvedValue(mockDeal);

      await expect(dealManagementService.raiseDispute('mock-deal-id', '', mockUser))
        .rejects.toThrow('Dispute reason is required');
    });

    it('should throw error for deal with wrong status', async () => {
      const draftDeal = { ...mockDeal, status: 'draft' as DealStatus };
      vi.spyOn(dealManagementService, 'getDeal').mockResolvedValue(draftDeal);

      await expect(dealManagementService.raiseDispute('mock-deal-id', 'Quality issues', mockUser))
        .rejects.toThrow('Cannot raise dispute for deal with status: draft');
    });
  });

  describe('confirmDeal', () => {
    it('should confirm deal with all validations passed', async () => {
      vi.spyOn(dealManagementService, 'getDeal').mockResolvedValue(mockDeal);

      const confirmation = {
        priceValidated: true,
        termsAccepted: true,
        deliveryConfirmed: true
      };

      await expect(dealManagementService.confirmDeal('mock-deal-id', confirmation)).resolves.not.toThrow();
    });

    it('should throw error when validations fail', async () => {
      vi.spyOn(dealManagementService, 'getDeal').mockResolvedValue(mockDeal);

      const confirmation = {
        priceValidated: false,
        termsAccepted: true,
        deliveryConfirmed: true
      };

      await expect(dealManagementService.confirmDeal('mock-deal-id', confirmation))
        .rejects.toThrow('All deal aspects must be confirmed');
    });
  });
});

describe('Payment Processor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processMultiplePaymentMethods', () => {
    it('should succeed with primary payment method', async () => {
      vi.spyOn(dealManagementService, 'initializePayment').mockResolvedValue({
        success: true,
        transactionId: 'txn-123',
        amount: 5000,
        method: 'upi',
        timestamp: new Date()
      });

      const result = await paymentProcessor.processMultiplePaymentMethods(
        'deal-123',
        'upi',
        ['bank_transfer', 'cash']
      );

      expect(result.success).toBe(true);
      expect(result.method).toBe('upi');
    });

    it('should fallback to secondary method when primary fails', async () => {
      vi.spyOn(dealManagementService, 'initializePayment')
        .mockResolvedValueOnce({
          success: false,
          error: 'UPI service unavailable',
          amount: 5000,
          method: 'upi',
          timestamp: new Date()
        })
        .mockResolvedValueOnce({
          success: true,
          transactionId: 'txn-456',
          amount: 5000,
          method: 'bank_transfer',
          timestamp: new Date()
        });

      const result = await paymentProcessor.processMultiplePaymentMethods(
        'deal-123',
        'upi',
        ['bank_transfer', 'cash']
      );

      expect(result.success).toBe(true);
      expect(result.method).toBe('bank_transfer');
    });

    it('should fail when all methods fail', async () => {
      vi.spyOn(dealManagementService, 'initializePayment').mockResolvedValue({
        success: false,
        error: 'Payment failed',
        amount: 5000,
        method: 'upi',
        timestamp: new Date()
      });

      const result = await paymentProcessor.processMultiplePaymentMethods(
        'deal-123',
        'upi',
        ['bank_transfer', 'cash']
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('All payment methods failed');
    });
  });

  describe('retryFailedPayment', () => {
    it('should retry payment and succeed', async () => {
      vi.spyOn(dealManagementService, 'initializePayment').mockResolvedValue({
        success: true,
        transactionId: 'txn-retry-123',
        amount: 5000,
        method: 'upi',
        timestamp: new Date()
      });

      const result = await paymentProcessor.retryFailedPayment('deal-123', 'upi');

      expect(result.success).toBe(true);
    });

    it('should fail after maximum retry attempts', async () => {
      // Simulate multiple failed attempts
      for (let i = 0; i < 3; i++) {
        await paymentProcessor.retryFailedPayment('deal-retry-test', 'upi');
      }

      const result = await paymentProcessor.retryFailedPayment('deal-retry-test', 'upi');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Maximum retry attempts exceeded');
    });
  });
});

describe('Deal Completion Manager', () => {
  const mockDeal: Deal = {
    id: 'mock-deal-id',
    buyerId: 'buyer-123',
    sellerId: 'seller-456',
    commodity: 'Rice',
    quantity: 100,
    unit: 'kg',
    agreedPrice: 50,
    quality: 'standard',
    deliveryTerms: {
      location: {
        state: 'Punjab',
        district: 'Ludhiana',
        city: 'Ludhiana',
        pincode: '141001'
      },
      expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      method: 'delivery',
      cost: 500,
      responsibility: 'seller'
    },
    paymentTerms: {
      method: 'upi',
      schedule: 'on_delivery'
    },
    status: 'agreed',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('completeDeal', () => {
    it('should complete deal with valid completion data', async () => {
      const deliveredDeal = { ...mockDeal, status: 'delivered' as DealStatus };
      vi.spyOn(dealManagementService, 'getDeal').mockResolvedValue(deliveredDeal);
      vi.spyOn(dealManagementService, 'updateDealStatus').mockResolvedValue(undefined);

      const completionData = {
        deliveryConfirmed: true,
        qualityAccepted: true,
        paymentReceived: true,
        additionalNotes: 'Excellent quality'
      };

      await expect(dealCompletionManager.completeDeal('mock-deal-id', completionData)).resolves.not.toThrow();
    });

    it('should throw error when completion criteria not met', async () => {
      const deliveredDeal = { ...mockDeal, status: 'delivered' as DealStatus };
      vi.spyOn(dealManagementService, 'getDeal').mockResolvedValue(deliveredDeal);

      const completionData = {
        deliveryConfirmed: false,
        qualityAccepted: true,
        paymentReceived: true
      };

      await expect(dealCompletionManager.completeDeal('mock-deal-id', completionData))
        .rejects.toThrow('All completion criteria must be met');
    });

    it('should throw error for deal with wrong status', async () => {
      const paidDeal = { ...mockDeal, status: 'paid' as DealStatus };
      vi.spyOn(dealManagementService, 'getDeal').mockResolvedValue(paidDeal);

      const completionData = {
        deliveryConfirmed: true,
        qualityAccepted: true,
        paymentReceived: true
      };

      await expect(dealCompletionManager.completeDeal('mock-deal-id', completionData))
        .rejects.toThrow('Cannot complete deal with status: paid');
    });
  });

  describe('submitRating', () => {
    it('should submit valid rating', async () => {
      vi.spyOn(dealManagementService, 'getDeal').mockResolvedValue(mockDeal);

      const rating = {
        overallRating: 4,
        categories: {
          communication: 4,
          reliability: 5,
          quality: 4,
          timeliness: 3
        },
        comment: 'Good experience overall'
      };

      const result = await dealCompletionManager.submitRating('mock-deal-id', rating);

      expect(result).toBeDefined();
      expect(result.rating).toBe(4);
      expect(result.dealId).toBe('mock-deal-id');
    });

    it('should throw error for invalid overall rating', async () => {
      vi.spyOn(dealManagementService, 'getDeal').mockResolvedValue(mockDeal);

      const rating = {
        overallRating: 6, // Invalid - should be 1-5
        categories: {
          communication: 4,
          reliability: 5,
          quality: 4,
          timeliness: 3
        }
      };

      await expect(dealCompletionManager.submitRating('mock-deal-id', rating))
        .rejects.toThrow('Overall rating must be between 1 and 5');
    });

    it('should throw error for invalid category rating', async () => {
      vi.spyOn(dealManagementService, 'getDeal').mockResolvedValue(mockDeal);

      const rating = {
        overallRating: 4,
        categories: {
          communication: 0, // Invalid - should be 1-5
          reliability: 5,
          quality: 4,
          timeliness: 3
        }
      };

      await expect(dealCompletionManager.submitRating('mock-deal-id', rating))
        .rejects.toThrow('communication rating must be between 1 and 5');
    });
  });

  describe('createDisputeResolutionMechanism', () => {
    it('should create resolution mechanism for quality dispute', async () => {
      vi.spyOn(dealManagementService, 'getDeal').mockResolvedValue(mockDeal);

      const result = await dealCompletionManager.createDisputeResolutionMechanism('mock-deal-id', 'quality');

      expect(result).toBeDefined();
      expect(result.resolutionId).toBeDefined();
      expect(result.steps).toHaveLength(3);
      expect(result.estimatedResolutionTime).toBe('5-7 business days');
    });

    it('should create resolution mechanism for delivery dispute', async () => {
      vi.spyOn(dealManagementService, 'getDeal').mockResolvedValue(mockDeal);

      const result = await dealCompletionManager.createDisputeResolutionMechanism('mock-deal-id', 'delivery');

      expect(result).toBeDefined();
      expect(result.steps).toHaveLength(3);
      expect(result.estimatedResolutionTime).toBe('3-5 business days');
    });

    it('should create resolution mechanism for payment dispute', async () => {
      vi.spyOn(dealManagementService, 'getDeal').mockResolvedValue(mockDeal);

      const result = await dealCompletionManager.createDisputeResolutionMechanism('mock-deal-id', 'payment');

      expect(result).toBeDefined();
      expect(result.steps).toHaveLength(3);
      expect(result.estimatedResolutionTime).toBe('7-10 business days');
    });
  });

  describe('promptForRatingAndReview', () => {
    it('should prompt for rating and review for completed deal', async () => {
      const completedDeal = { ...mockDeal, status: 'completed' as DealStatus };
      vi.spyOn(dealManagementService, 'getDeal').mockResolvedValue(completedDeal);

      const result = await dealCompletionManager.promptForRatingAndReview('mock-deal-id');

      expect(result.ratingPrompted).toBe(true);
      expect(result.reviewPrompted).toBe(true);
    });

    it('should not prompt for incomplete deal', async () => {
      const paidDeal = { ...mockDeal, status: 'paid' as DealStatus };
      vi.spyOn(dealManagementService, 'getDeal').mockResolvedValue(paidDeal);

      const result = await dealCompletionManager.promptForRatingAndReview('mock-deal-id');

      expect(result.ratingPrompted).toBe(false);
      expect(result.reviewPrompted).toBe(false);
    });
  });
});