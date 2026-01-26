import * as fc from 'fast-check';
import { User, Commodity, Deal, Message, PriceEntry, TranslationRequest } from '../types';
import { INDIAN_LANGUAGES, INDIAN_NAMES, INDIAN_COMMODITIES, INDIAN_LOCATIONS, MANDI_VOCABULARY } from './mockData';

// Basic generators for primitive types
export const phoneNumberGen = fc.string({ minLength: 10, maxLength: 10 })
  .filter(s => /^[6-9]/.test(s))
  .map(s => `+91${s.replace(/\D/g, '').slice(0, 10).padStart(10, '6')}`);

export const emailGen = fc.emailAddress();

export const indianLanguageGen = fc.constantFrom(...INDIAN_LANGUAGES);

export const indianNameGen = fc.constantFrom(...INDIAN_NAMES);

export const indianCommodityGen = fc.constantFrom(...INDIAN_COMMODITIES);

export const indianLocationGen = fc.constantFrom(...INDIAN_LOCATIONS);

export const userTypeGen = fc.constantFrom('vendor', 'buyer', 'both');

export const dealStatusGen = fc.constantFrom(
  'negotiating', 'agreed', 'confirmed', 'in_transit', 'delivered', 'completed', 'disputed', 'cancelled'
);

export const messageTypeGen = fc.constantFrom('text', 'voice', 'image', 'offer', 'system');

export const priceSourceGen = fc.constantFrom('agmarknet', 'vendor_submission', 'predicted');

export const paymentMethodGen = fc.constantFrom('cash', 'upi', 'bank_transfer', 'credit');

// Coordinate generators for Indian geography
export const indianLatitudeGen = fc.float({ min: Math.fround(8.0), max: Math.fround(37.0) }); // India's latitude range
export const indianLongitudeGen = fc.float({ min: Math.fround(68.0), max: Math.fround(97.0) }); // India's longitude range

// Price generators with realistic ranges
export const priceGen = fc.float({ min: 100, max: 10000 }); // Reasonable price range for commodities
export const quantityGen = fc.integer({ min: 1, max: 1000 }); // Reasonable quantity range
export const confidenceGen = fc.float({ min: Math.fround(0.0), max: Math.fround(1.0) }); // Confidence score range

// Date generators
export const pastDateGen = fc.date({ max: new Date() });
export const futureDateGen = fc.date({ min: new Date() });
export const recentDateGen = fc.date({ 
  min: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
  max: new Date() 
});

// Text generators for different languages
export const englishTextGen = fc.lorem({ maxCount: 10 });
export const hindiTextGen = fc.constantFrom(
  'नमस्ते', 'धन्यवाद', 'कृपया', 'मंडी', 'भाव', 'दाम', 'किसान', 'व्यापारी'
);

export const mandiVocabularyGen = fc.record({
  hi: fc.array(fc.constantFrom(...MANDI_VOCABULARY.hi), { minLength: 1, maxLength: 5 }),
  en: fc.array(fc.constantFrom(...MANDI_VOCABULARY.en), { minLength: 1, maxLength: 5 }),
});

// Complex object generators
export const locationGen = fc.record({
  latitude: indianLatitudeGen,
  longitude: indianLongitudeGen,
  address: fc.string({ minLength: 10, maxLength: 100 }),
  pincode: fc.string({ minLength: 6, maxLength: 6 }).map(s => s.replace(/\D/g, '').padStart(6, '0')),
  state: indianLocationGen.map(loc => loc.state),
});

export const businessProfileGen = fc.record({
  businessName: fc.string({ minLength: 5, maxLength: 50 }),
  businessType: fc.constantFrom('wholesale', 'retail', 'farming', 'trading'),
  gstNumber: fc.option(fc.string({ minLength: 15, maxLength: 15 })),
  specializations: fc.array(indianCommodityGen, { minLength: 1, maxLength: 5 }),
  operatingHours: fc.constantFrom('9:00 AM - 6:00 PM', '8:00 AM - 8:00 PM', '24/7'),
  verificationDocuments: fc.array(fc.string(), { maxLength: 5 }),
});

export const reputationGen = fc.record({
  overall: fc.float({ min: Math.fround(1.0), max: Math.fround(5.0) }).filter(n => !isNaN(n)),
  punctuality: fc.float({ min: Math.fround(1.0), max: Math.fround(5.0) }).filter(n => !isNaN(n)),
  communication: fc.float({ min: Math.fround(1.0), max: Math.fround(5.0) }).filter(n => !isNaN(n)),
  productQuality: fc.float({ min: Math.fround(1.0), max: Math.fround(5.0) }).filter(n => !isNaN(n)),
  totalTransactions: fc.integer({ min: 0, max: 1000 }),
  reviewCount: fc.integer({ min: 0, max: 500 }),
  lastUpdated: recentDateGen,
});

export const paymentTermsGen = fc.record({
  method: paymentMethodGen,
  dueDate: futureDateGen,
  advanceAmount: fc.option(fc.integer({ min: 100, max: 5000 })),
  advancePercentage: fc.option(fc.float({ min: Math.fround(0.1), max: Math.fround(0.5) })),
  currency: fc.constantFrom('INR', 'USD'),
  lateFee: fc.option(fc.float({ min: 0, max: 1000 })),
});

// Main entity generators
export const userGen: fc.Arbitrary<User> = fc.record({
  id: fc.string({ minLength: 10, maxLength: 20 }),
  phoneNumber: phoneNumberGen,
  name: indianNameGen,
  email: fc.option(emailGen),
  preferredLanguage: indianLanguageGen,
  userType: userTypeGen,
  location: locationGen,
  businessProfile: fc.option(businessProfileGen),
  reputation: reputationGen,
  isVerified: fc.boolean(),
  isPhoneVerified: fc.boolean(),
  isBusinessVerified: fc.boolean(),
  profilePicture: fc.option(fc.webUrl()),
  createdAt: pastDateGen,
  lastActiveAt: recentDateGen,
  settings: fc.record({
    notifications: fc.record({
      deals: fc.boolean(),
      messages: fc.boolean(),
      priceAlerts: fc.boolean(),
      marketUpdates: fc.boolean(),
    }),
    privacy: fc.record({
      showPhoneNumber: fc.boolean(),
      showLocation: fc.boolean(),
      allowDirectMessages: fc.boolean(),
    }),
    language: fc.record({
      preferred: indianLanguageGen,
      fallback: indianLanguageGen,
      autoTranslate: fc.boolean(),
    }),
  }),
});

export const commodityGen: fc.Arbitrary<Commodity> = fc.record({
  id: fc.string({ minLength: 10, maxLength: 20 }),
  name: indianCommodityGen,
  category: fc.constantFrom('grains', 'vegetables', 'fruits', 'spices', 'pulses'),
  subcategory: fc.string({ minLength: 5, maxLength: 20 }),
  standardUnit: fc.constantFrom('quintal', 'kg', 'ton', 'bag'),
  alternativeUnits: fc.array(fc.constantFrom('kg', 'ton', 'bag', 'quintal'), { minLength: 1, maxLength: 4 }),
  seasonality: fc.record({
    peakMonths: fc.array(fc.integer({ min: 1, max: 12 }), { minLength: 1, maxLength: 6 }),
    offSeasonMonths: fc.array(fc.integer({ min: 1, max: 12 }), { minLength: 1, maxLength: 6 }),
  }),
  qualityGrades: fc.array(fc.record({
    grade: fc.constantFrom('Grade A', 'Grade B', 'Grade C', 'Premium'),
    description: fc.string(),
    priceMultiplier: fc.float({ min: Math.fround(0.5), max: Math.fround(2.0) }),
  }), { minLength: 1, maxLength: 4 }),
  storageRequirements: fc.array(fc.string(), { maxLength: 5 }),
  perishable: fc.boolean(),
  translations: fc.record({
    hi: fc.record({
      name: fc.string(),
      aliases: fc.array(fc.string(), { maxLength: 3 }),
    }),
    en: fc.record({
      name: fc.string(),
      aliases: fc.array(fc.string(), { maxLength: 3 }),
    }),
  }),
  metadata: fc.record({
    commonNames: fc.array(fc.string(), { minLength: 1, maxLength: 5 }),
    hsCode: fc.option(fc.string()),
    agmarknetCode: fc.option(fc.string()),
    scientificName: fc.option(fc.string()),
  }),
  createdAt: pastDateGen,
  updatedAt: recentDateGen,
});

export const priceEntryGen: fc.Arbitrary<PriceEntry> = fc.record({
  id: fc.string({ minLength: 10, maxLength: 20 }),
  commodityId: fc.string({ minLength: 10, maxLength: 20 }),
  commodityName: indianCommodityGen,
  price: priceGen,
  unit: fc.constantFrom('quintal', 'kg', 'ton', 'bag'),
  location: fc.record({
    mandiName: fc.string({ minLength: 5, maxLength: 30 }),
    district: fc.string({ minLength: 3, maxLength: 20 }),
    state: indianLocationGen.map(loc => loc.state),
    coordinates: fc.record({
      latitude: indianLatitudeGen,
      longitude: indianLongitudeGen,
    }),
    marketType: fc.constantFrom('wholesale', 'retail', 'farmer_market', 'online'),
  }),
  source: priceSourceGen,
  quality: fc.constantFrom('Grade A', 'Grade B', 'Grade C', 'Premium'),
  timestamp: recentDateGen,
  confidence: confidenceGen,
  validatedBy: fc.option(fc.string()),
  validatedAt: fc.option(recentDateGen),
  metadata: fc.record({
    weatherConditions: fc.option(fc.constantFrom('sunny', 'rainy', 'cloudy', 'stormy')),
    marketConditions: fc.option(fc.constantFrom('high_demand', 'normal', 'low_demand')),
    volume: fc.option(fc.integer({ min: 1, max: 10000 })),
  }),
  expiresAt: fc.option(futureDateGen),
});

export const messageGen: fc.Arbitrary<Message> = fc.record({
  id: fc.string({ minLength: 10, maxLength: 20 }),
  conversationId: fc.string({ minLength: 10, maxLength: 20 }),
  senderId: fc.string({ minLength: 10, maxLength: 20 }),
  receiverId: fc.string({ minLength: 10, maxLength: 20 }),
  messageType: messageTypeGen,
  content: fc.string({ minLength: 1, maxLength: 500 }),
  originalText: fc.option(fc.string({ minLength: 1, maxLength: 500 })),
  originalLanguage: fc.option(indianLanguageGen),
  translation: fc.option(fc.record({
    originalText: fc.string(),
    originalLanguage: indianLanguageGen,
    translatedText: fc.string(),
    targetLanguage: indianLanguageGen,
    confidence: confidenceGen,
    requiresReview: fc.boolean(),
    translatedAt: recentDateGen,
    translationEngine: fc.string(),
  })),
  attachments: fc.option(fc.array(fc.record({
    id: fc.string(),
    type: fc.constantFrom('image', 'document', 'audio'),
    url: fc.webUrl(),
    filename: fc.option(fc.string()),
    size: fc.integer({ min: 1, max: 10000000 }),
    mimeType: fc.string(),
    metadata: fc.object(),
  }), { maxLength: 3 })),
  timestamp: recentDateGen,
  status: fc.constantFrom('sending', 'sent', 'delivered', 'read', 'failed'),
  isRead: fc.boolean(),
  readAt: fc.option(recentDateGen),
  editedAt: fc.option(recentDateGen),
  replyToMessageId: fc.option(fc.string()),
  metadata: fc.record({
    deviceInfo: fc.option(fc.string()),
    location: fc.option(fc.record({
      latitude: indianLatitudeGen,
      longitude: indianLongitudeGen,
    })),
    clientTimestamp: recentDateGen,
  }),
});

export const dealGen: fc.Arbitrary<Deal> = fc.record({
  id: fc.string({ minLength: 10, maxLength: 20 }),
  vendorId: fc.string({ minLength: 10, maxLength: 20 }),
  buyerId: fc.string({ minLength: 10, maxLength: 20 }),
  commodityId: fc.string({ minLength: 10, maxLength: 20 }),
  commodityName: indianCommodityGen,
  quantity: quantityGen,
  unit: fc.constantFrom('quintal', 'kg', 'ton', 'bag'),
  agreedPrice: priceGen,
  totalAmount: priceGen,
  qualitySpec: fc.record({
    grade: fc.string(),
    description: fc.string(),
    inspectionRequired: fc.boolean(),
    qualityParameters: fc.dictionary(fc.string(), fc.record({
      value: fc.oneof(fc.string(), fc.float()),
      unit: fc.option(fc.string()),
      tolerance: fc.option(fc.float({ min: 0, max: 10 })),
    })),
  }),
  status: dealStatusGen,
  paymentTerms: paymentTermsGen,
  deliveryTerms: fc.record({
    method: fc.constantFrom('pickup', 'delivery', 'shipping', 'self_transport'),
    expectedDate: futureDateGen,
  }),
  conversationId: fc.string(),
  createdAt: pastDateGen,
  updatedAt: recentDateGen,
  auditTrail: fc.array(fc.record({
    id: fc.string(),
    action: fc.string(),
    timestamp: pastDateGen,
    performedBy: fc.string(),
    details: fc.object(),
  }), { minLength: 1, maxLength: 10 }),
  metadata: fc.record({
    referenceNumber: fc.string(),
  }),
});

export const translationRequestGen: fc.Arbitrary<TranslationRequest> = fc.record({
  text: fc.string({ minLength: 1, maxLength: 1000 }).filter(s => s.trim().length > 0),
  sourceLanguage: fc.option(indianLanguageGen),
  targetLanguage: indianLanguageGen,
  context: fc.constantFrom('general', 'mandi', 'negotiation'),
}).filter(req => !req.sourceLanguage || req.sourceLanguage !== req.targetLanguage) as fc.Arbitrary<TranslationRequest>;

// Generators for specific test scenarios
export const validUserGen = userGen.filter(user => 
  user.name.length > 0 && 
  user.phoneNumber.length >= 10 &&
  user.reputation.overall >= 1 && 
  user.reputation.overall <= 5
);

export const validPriceGen = priceEntryGen.filter(price => 
  price.price > 0 && 
  price.confidence >= 0 && 
  price.confidence <= 1
);

export const validDealGen = dealGen.filter(deal => 
  deal.quantity > 0 && 
  deal.agreedPrice > 0
);

export const validMessageGen = messageGen.filter(message => 
  message.content.length > 0
);

// Generators for edge cases
export const emptyStringGen = fc.constant('');
export const veryLongStringGen = fc.string({ minLength: 1000, maxLength: 10000 });
export const specialCharacterStringGen = fc.string().filter(s => /[!@#$%^&*(),.?":{}|<>]/.test(s));
export const unicodeStringGen = fc.string();

export const extremePriceGen = fc.oneof(
  fc.constant(0),
  fc.constant(-1),
  fc.float({ min: 1000000, max: 10000000 })
);

export const extremeQuantityGen = fc.oneof(
  fc.constant(0),
  fc.constant(-1),
  fc.integer({ min: 1000000, max: 10000000 })
);

export const invalidConfidenceGen = fc.oneof(
  fc.constant(-1),
  fc.constant(2),
  fc.float({ min: -10, max: -1 }),
  fc.float({ min: 2, max: 10 })
);

// Generators for performance testing
export const largeDatasetGen = <T>(itemGen: fc.Arbitrary<T>, size: number) => 
  fc.array(itemGen, { minLength: size, maxLength: size });

export const largePriceDatasetGen = (size: number) => largeDatasetGen(priceEntryGen, size);
export const largeUserDatasetGen = (size: number) => largeDatasetGen(userGen, size);
export const largeMessageDatasetGen = (size: number) => largeDatasetGen(messageGen, size);

// Generators for specific business logic testing
export const negotiationScenarioGen = fc.record({
  vendor: userGen.filter(u => u.userType === 'vendor' || u.userType === 'both'),
  buyer: userGen.filter(u => u.userType === 'buyer' || u.userType === 'both'),
  commodity: commodityGen,
  initialOffer: priceGen,
  marketPrice: priceGen,
  messages: fc.array(messageGen, { minLength: 2, maxLength: 10 }),
});

export const priceComparisonScenarioGen = fc.record({
  commodity: commodityGen,
  userPrice: priceGen,
  marketPrices: fc.array(priceEntryGen, { minLength: 5, maxLength: 100 }),
  location: locationGen,
});

export const translationScenarioGen = fc.record({
  sourceText: fc.string({ minLength: 1, maxLength: 500 }),
  sourceLanguage: indianLanguageGen,
  targetLanguage: indianLanguageGen.filter(lang => lang !== 'sourceLanguage'),
  context: fc.constantFrom('general', 'mandi', 'negotiation'),
  expectedConfidence: confidenceGen,
});

// Helper function to create constrained generators
export const constrainedGen = <T>(
  baseGen: fc.Arbitrary<T>,
  constraint: (value: T) => boolean
): fc.Arbitrary<T> => baseGen.filter(constraint);

// Helper function to create generators with specific properties
export const withProperty = <T, K extends keyof T>(
  baseGen: fc.Arbitrary<T>,
  property: K,
  valueGen: fc.Arbitrary<T[K]>
): fc.Arbitrary<T> => 
  fc.tuple(baseGen, valueGen).map(([base, value]) => ({ ...base, [property]: value }));