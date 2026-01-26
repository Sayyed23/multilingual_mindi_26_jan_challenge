import { User, Commodity, Deal, Message, PriceEntry, TranslationRequest, TranslationResponse } from '../types';

// Indian languages for testing
export const INDIAN_LANGUAGES = [
  'hi', 'bn', 'te', 'mr', 'ta', 'ur', 'gu', 'kn', 'ml', 'or',
  'pa', 'as', 'mai', 'bh', 'ne', 'sa', 'ks', 'sd', 'kok', 'mni',
  'doi', 'sit'
];

// Common Indian names for testing
export const INDIAN_NAMES = [
  'Rajesh Kumar', 'Priya Sharma', 'Amit Singh', 'Sunita Devi', 'Ravi Patel',
  'Kavita Gupta', 'Suresh Yadav', 'Meera Joshi', 'Vikram Reddy', 'Anita Verma',
  'Manoj Agarwal', 'Pooja Mishra', 'Deepak Tiwari', 'Rekha Sinha', 'Ashok Pandey'
];

// Common Indian commodities for testing
export const INDIAN_COMMODITIES = [
  'Rice', 'Wheat', 'Onion', 'Potato', 'Tomato', 'Garlic', 'Ginger',
  'Turmeric', 'Coriander', 'Cumin', 'Mustard', 'Groundnut', 'Soybean',
  'Cotton', 'Sugarcane', 'Maize', 'Bajra', 'Jowar', 'Arhar', 'Moong'
];

// Indian states and cities for testing
export const INDIAN_LOCATIONS = [
  { state: 'Maharashtra', city: 'Mumbai', pincode: '400001' },
  { state: 'Delhi', city: 'New Delhi', pincode: '110001' },
  { state: 'Karnataka', city: 'Bangalore', pincode: '560001' },
  { state: 'Tamil Nadu', city: 'Chennai', pincode: '600001' },
  { state: 'West Bengal', city: 'Kolkata', pincode: '700001' },
  { state: 'Gujarat', city: 'Ahmedabad', pincode: '380001' },
  { state: 'Rajasthan', city: 'Jaipur', pincode: '302001' },
  { state: 'Uttar Pradesh', city: 'Lucknow', pincode: '226001' },
  { state: 'Punjab', city: 'Chandigarh', pincode: '160001' },
  { state: 'Haryana', city: 'Gurgaon', pincode: '122001' }
];

// Mandi-specific vocabulary for testing
export const MANDI_VOCABULARY = {
  hi: ['मंडी', 'भाव', 'दाम', 'किसान', 'व्यापारी', 'फसल', 'बोरी', 'क्विंटल'],
  en: ['mandi', 'price', 'rate', 'farmer', 'trader', 'crop', 'bag', 'quintal'],
  bn: ['মান্ডি', 'দাম', 'কৃষক', 'ব্যবসায়ী', 'ফসল', 'বস্তা', 'কুইন্টাল'],
  te: ['మండి', 'ధర', 'రైతు', 'వ్యాపారి', 'పంట', 'సంచి', 'క్వింటల్'],
  ta: ['மண்டி', 'விலை', 'விவசாயி', 'வியாபாரி', 'பயிர்', 'சாக்கு', 'குவிண்டல்']
};

// Mock data generators
export const createMockUser = (overrides: Partial<User> = {}): User => {
  const randomName = INDIAN_NAMES[Math.floor(Math.random() * INDIAN_NAMES.length)];
  const randomLocation = INDIAN_LOCATIONS[Math.floor(Math.random() * INDIAN_LOCATIONS.length)];
  const randomLanguage = INDIAN_LANGUAGES[Math.floor(Math.random() * INDIAN_LANGUAGES.length)];

  return {
    id: `user_${Math.random().toString(36).substr(2, 9)}`,
    phoneNumber: `+91${Math.floor(Math.random() * 4000000000) + 6000000000}`,
    name: randomName,
    email: `${randomName.toLowerCase().replace(' ', '.')}@example.com`,
    preferredLanguage: randomLanguage,
    userType: Math.random() > 0.5 ? 'vendor' : 'buyer',
    location: {
      latitude: 20 + Math.random() * 15, // Rough India latitude range
      longitude: 68 + Math.random() * 30, // Rough India longitude range
      address: `${Math.floor(Math.random() * 999) + 1}, ${randomLocation.city}`,
      pincode: randomLocation.pincode,
      state: randomLocation.state,
    },
    businessProfile: Math.random() > 0.3 ? {
      businessName: `${randomName.split(' ')[0]} Traders`,
      businessType: Math.random() > 0.5 ? 'wholesale' : 'retail',
      gstNumber: `${Math.floor(Math.random() * 100).toString().padStart(2, '0')}ABCDE${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}F${Math.floor(Math.random() * 10)}Z${Math.floor(Math.random() * 10)}`,
      specializations: INDIAN_COMMODITIES.slice(0, Math.floor(Math.random() * 5) + 1),
      operatingHours: '9:00 AM - 6:00 PM',
      verificationDocuments: ['aadhar.jpg', 'pan.jpg'],
    } : undefined,
    reputation: {
      overall: Math.random() * 2 + 3, // 3-5 range
      punctuality: Math.random() * 2 + 3,
      communication: Math.random() * 2 + 3,
      productQuality: Math.random() * 2 + 3,
      totalTransactions: Math.floor(Math.random() * 100),
      reviewCount: Math.floor(Math.random() * 50),
      lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    },
    isVerified: Math.random() > 0.3,
    isPhoneVerified: Math.random() > 0.1,
    isBusinessVerified: Math.random() > 0.5,
    profilePicture: Math.random() > 0.7 ? 'https://example.com/avatar.jpg' : undefined,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    lastActiveAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    settings: {
      notifications: {
        deals: true,
        messages: true,
        priceAlerts: Math.random() > 0.3,
        marketUpdates: Math.random() > 0.5,
      },
      privacy: {
        showPhoneNumber: Math.random() > 0.5,
        showLocation: Math.random() > 0.3,
        allowDirectMessages: Math.random() > 0.2,
      },
      language: {
        preferred: randomLanguage,
        fallback: 'en',
        autoTranslate: Math.random() > 0.3,
      },
    },
    ...overrides,
  };
};

export const createMockCommodity = (overrides: Partial<Commodity> = {}): Commodity => {
  const randomCommodity = INDIAN_COMMODITIES[Math.floor(Math.random() * INDIAN_COMMODITIES.length)];

  return {
    id: `commodity_${Math.random().toString(36).substr(2, 9)}`,
    name: randomCommodity,
    category: Math.random() > 0.5 ? 'grains' : 'vegetables',
    subcategory: Math.random() > 0.5 ? 'cereals' : 'pulses',
    standardUnit: 'quintal',
    alternativeUnits: ['kg', 'ton', 'bag'],
    seasonality: {
      peakMonths: [Math.floor(Math.random() * 12) + 1, Math.floor(Math.random() * 12) + 1],
      offSeasonMonths: [Math.floor(Math.random() * 12) + 1, Math.floor(Math.random() * 12) + 1],
    },
    qualityGrades: [
      { grade: 'Grade A', description: 'Premium quality', priceMultiplier: 1.2 },
      { grade: 'Grade B', description: 'Good quality', priceMultiplier: 1.0 },
      { grade: 'Grade C', description: 'Standard quality', priceMultiplier: 0.8 }
    ],
    storageRequirements: ['dry place', 'room temperature'],
    perishable: Math.random() > 0.5,
    translations: {
      hi: {
        name: MANDI_VOCABULARY.hi[Math.floor(Math.random() * MANDI_VOCABULARY.hi.length)],
        aliases: [randomCommodity.toLowerCase()],
      },
      en: {
        name: randomCommodity,
        aliases: [randomCommodity.toLowerCase()],
      },
    },
    metadata: {
      commonNames: [randomCommodity, randomCommodity.toLowerCase()],
    },
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    ...overrides,
  };
};

export const createMockPriceEntry = (overrides: Partial<PriceEntry> = {}): PriceEntry => {
  const randomLocation = INDIAN_LOCATIONS[Math.floor(Math.random() * INDIAN_LOCATIONS.length)];
  const basePrice = Math.random() * 5000 + 1000; // 1000-6000 range

  return {
    id: `price_${Math.random().toString(36).substr(2, 9)}`,
    commodityId: `commodity_${Math.random().toString(36).substr(2, 9)}`,
    commodityName: INDIAN_COMMODITIES[Math.floor(Math.random() * INDIAN_COMMODITIES.length)],
    price: Math.round(basePrice * 100) / 100,
    unit: 'quintal',
    location: {
      mandiName: `${randomLocation.city} Mandi`,
      district: randomLocation.city,
      state: randomLocation.state,
      coordinates: {
        latitude: 20 + Math.random() * 15,
        longitude: 68 + Math.random() * 30,
      },
      marketType: ['wholesale', 'retail', 'farmer_market', 'online'][Math.floor(Math.random() * 4)] as any,
    },
    source: Math.random() > 0.5 ? 'agmarknet' : 'vendor_submission',
    quality: ['Grade A', 'Grade B', 'Grade C'][Math.floor(Math.random() * 3)],
    timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
    confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0 range
    validatedBy: Math.random() > 0.5 ? `validator_${Math.random().toString(36).substr(2, 9)}` : undefined,
    metadata: {
      weatherConditions: ['sunny', 'rainy', 'cloudy'][Math.floor(Math.random() * 3)],
      marketConditions: ['high_demand', 'normal', 'low_demand'][Math.floor(Math.random() * 3)],
      volume: Math.floor(Math.random() * 1000) + 100,
    },
    ...overrides,
  };
};

export const createMockMessage = (overrides: Partial<Message> = {}): Message => {
  const messages = [
    'Hello, I am interested in buying rice',
    'What is your best price for wheat?',
    'Can you deliver to my location?',
    'Is the quality good?',
    'When can you deliver?',
  ];

  const hindiMessages = [
    'नमस्ते, मुझे चावल खरीदना है',
    'गेहूं का सबसे अच्छा भाव क्या है?',
    'क्या आप मेरी जगह डिलीवरी कर सकते हैं?',
    'क्या क्वालिटी अच्छी है?',
    'कब तक डिलीवरी हो सकती है?',
  ];

  const isHindi = Math.random() > 0.5;
  const messageArray = isHindi ? hindiMessages : messages;
  const randomMessage = messageArray[Math.floor(Math.random() * messageArray.length)];

  return {
    id: `message_${Math.random().toString(36).substr(2, 9)}`,
    conversationId: `conversation_${Math.random().toString(36).substr(2, 9)}`,
    senderId: `user_${Math.random().toString(36).substr(2, 9)}`,
    receiverId: `user_${Math.random().toString(36).substr(2, 9)}`,
    messageType: ['text', 'voice', 'offer'][Math.floor(Math.random() * 3)] as any,
    content: randomMessage,
    originalText: isHindi ? randomMessage : undefined,
    originalLanguage: isHindi ? 'hi' : undefined,
    translation: isHindi ? {
      originalText: randomMessage,
      originalLanguage: 'hi',
      translatedText: messages[hindiMessages.indexOf(randomMessage)] || 'Translated text',
      targetLanguage: 'en',
      confidence: Math.random() * 0.3 + 0.7,
      requiresReview: Math.random() > 0.8,
      translatedAt: new Date(),
      translationEngine: 'mbart',
    } : undefined,
    attachments: Math.random() > 0.8 ? [{
      id: `attachment_${Math.random().toString(36).substr(2, 9)}`,
      type: 'image',
      url: 'https://example.com/image.jpg',
      filename: 'image.jpg',
      size: 1024,
      mimeType: 'image/jpeg',
      metadata: {
        dimensions: { width: 800, height: 600 }
      },
    }] : undefined,
    timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
    status: ['sent', 'delivered', 'read'][Math.floor(Math.random() * 3)] as any,
    isRead: Math.random() > 0.3,
    readAt: Math.random() > 0.5 ? new Date() : undefined,
    metadata: {
      clientTimestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
    },
    ...overrides,
  };
};

export const createMockDeal = (overrides: Partial<Deal> = {}): Deal => {
  const randomCommodity = INDIAN_COMMODITIES[Math.floor(Math.random() * INDIAN_COMMODITIES.length)];
  const quantity = Math.floor(Math.random() * 100) + 10;
  const price = Math.floor(Math.random() * 5000) + 1000;

  return {
    id: `deal_${Math.random().toString(36).substr(2, 9)}`,
    vendorId: `user_${Math.random().toString(36).substr(2, 9)}`,
    buyerId: `user_${Math.random().toString(36).substr(2, 9)}`,
    commodityId: `commodity_${Math.random().toString(36).substr(2, 9)}`,
    commodityName: randomCommodity,
    quantity,
    unit: 'quintal',
    agreedPrice: price,
    totalAmount: price * quantity,
    qualitySpec: {
      grade: 'Grade A',
      description: 'Premium quality',
      inspectionRequired: Math.random() > 0.5,
      qualityParameters: {
        moisture: { value: 12, unit: '%', tolerance: 2 },
        purity: { value: 98, unit: '%', tolerance: 1 },
      },
    },
    status: ['negotiating', 'agreed', 'confirmed', 'in_transit', 'delivered', 'completed'][Math.floor(Math.random() * 6)] as any,
    paymentTerms: {
      method: ['cash', 'upi', 'bank_transfer'][Math.floor(Math.random() * 3)] as any,
      dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
      advanceAmount: Math.random() > 0.5 ? Math.floor(price * 0.2) : undefined,
      currency: 'INR',
    },
    deliveryTerms: {
      method: ['pickup', 'delivery'][Math.floor(Math.random() * 2)] as any,
      expectedDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
    },
    conversationId: `conversation_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
    auditTrail: [{
      id: `audit_${Math.random().toString(36).substr(2, 9)}`,
      action: 'deal_created',
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      performedBy: `user_${Math.random().toString(36).substr(2, 9)}`,
      details: {
        description: 'Deal created from negotiation',
        previousState: null,
        newState: 'negotiating',
      },
    }],
    metadata: {
      referenceNumber: `REF${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
      negotiationRounds: Math.floor(Math.random() * 5) + 1,
    },
    ...overrides,
  };
};

export const createMockTranslationRequest = (overrides: Partial<TranslationRequest> = {}): TranslationRequest => {
  const texts = [
    'What is the price of rice today?',
    'I want to buy 10 quintals of wheat',
    'Can you deliver tomorrow?',
    'Is the quality good?',
  ];

  return {
    text: texts[Math.floor(Math.random() * texts.length)],
    sourceLanguage: 'en',
    targetLanguage: 'hi',
    context: ['general', 'mandi', 'negotiation'][Math.floor(Math.random() * 3)] as any,
    ...overrides,
  };
};

export const createMockTranslationResponse = (overrides: Partial<TranslationResponse> = {}): TranslationResponse => {
  return {
    translatedText: 'आज चावल का भाव क्या है?',
    confidence: Math.random() * 0.3 + 0.7,
    sourceLanguageDetected: 'en',
    targetLanguage: 'hi',
    quality: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as any,
    requiresReview: Math.random() > 0.8,
    alternativeTranslations: Math.random() > 0.5 ? ['आज चावल की कीमत क्या है?'] : undefined,
    processingTime: Math.floor(Math.random() * 1000) + 100,
    translationEngine: 'mbart',
    timestamp: new Date(),
    metadata: {
      wordCount: 6,
      characterCount: 25,
      complexityScore: Math.random(),
      contextMatches: Math.floor(Math.random() * 5),
      vocabularyMatches: Math.floor(Math.random() * 3),
    },
    ...overrides,
  };
};

// Batch generators for testing large datasets
export const createMockUsers = (count: number): User[] => {
  return Array.from({ length: count }, () => createMockUser());
};

export const createMockCommodities = (count: number): Commodity[] => {
  return Array.from({ length: count }, () => createMockCommodity());
};

export const createMockPriceEntries = (count: number): PriceEntry[] => {
  return Array.from({ length: count }, () => createMockPriceEntry());
};

export const createMockMessages = (count: number): Message[] => {
  return Array.from({ length: count }, () => createMockMessage());
};

export const createMockDeals = (count: number): Deal[] => {
  return Array.from({ length: count }, () => createMockDeal());
};

// Helper to create realistic conversation threads
export const createMockConversation = (messageCount: number = 5) => {
  const conversationId = `conversation_${Math.random().toString(36).substr(2, 9)}`;
  const user1 = createMockUser({ userType: 'vendor' });
  const user2 = createMockUser({ userType: 'buyer' });

  return Array.from({ length: messageCount }, (_, index) =>
    createMockMessage({
      conversationId,
      senderId: index % 2 === 0 ? user1.id : user2.id,
      receiverId: index % 2 === 0 ? user2.id : user1.id,
      timestamp: new Date(Date.now() - (messageCount - index) * 60 * 1000),
    })
  );
};

// Helper to create realistic price history
export const createMockPriceHistory = (commodityId: string, days: number = 30) => {
  const basePrice = Math.random() * 3000 + 2000;

  return Array.from({ length: days }, (_, index) =>
    createMockPriceEntry({
      commodityId,
      price: basePrice + (Math.random() - 0.5) * 500,
      timestamp: new Date(Date.now() - (days - index) * 24 * 60 * 60 * 1000),
    })
  );
};