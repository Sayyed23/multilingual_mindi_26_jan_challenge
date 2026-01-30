// Data seeding service for populating the database with initial data
// Includes sample users, commodities, and price records for development and testing

import { databaseService } from './database';
import type {
  User,
  Commodity,
  PriceRecord,
  Transaction,
  Message,
  Conversation,
  UserRole,
  Location,
  QualityGrade,
  DataSource
} from '../types';

// Sample locations across India
const SAMPLE_LOCATIONS: Location[] = [
  {
    state: 'Maharashtra',
    district: 'Nagpur',
    mandis: ['Nagpur Mandi', 'Katol Mandi'],
    coordinates: { latitude: 21.1458, longitude: 79.0882 },
    timezone: 'Asia/Kolkata'
  },
  {
    state: 'Punjab',
    district: 'Ludhiana',
    mandis: ['Ludhiana Grain Market', 'Khanna Mandi'],
    coordinates: { latitude: 30.9010, longitude: 75.8573 },
    timezone: 'Asia/Kolkata'
  },
  {
    state: 'Karnataka',
    district: 'Bangalore',
    mandis: ['Bangalore City Market', 'Yeshwantpur Mandi'],
    coordinates: { latitude: 12.9716, longitude: 77.5946 },
    timezone: 'Asia/Kolkata'
  },
  {
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    mandis: ['Coimbatore Market', 'Pollachi Mandi'],
    coordinates: { latitude: 11.0168, longitude: 76.9558 },
    timezone: 'Asia/Kolkata'
  },
  {
    state: 'Gujarat',
    district: 'Ahmedabad',
    mandis: ['Ahmedabad APMC', 'Bavla Mandi'],
    coordinates: { latitude: 23.0225, longitude: 72.5714 },
    timezone: 'Asia/Kolkata'
  }
];

// Sample quality grades
const QUALITY_GRADES: QualityGrade[] = [
  { name: 'Premium', description: 'Highest quality, export grade', priceMultiplier: 1.2 },
  { name: 'Grade A', description: 'High quality, suitable for retail', priceMultiplier: 1.0 },
  { name: 'Grade B', description: 'Good quality, suitable for processing', priceMultiplier: 0.85 },
  { name: 'Grade C', description: 'Basic quality, suitable for animal feed', priceMultiplier: 0.7 }
];

// Sample data sources
const DATA_SOURCES: DataSource[] = [
  {
    name: 'Government APMC',
    type: 'government',
    reliability: 0.95,
    lastUpdated: new Date()
  },
  {
    name: 'Private Market Network',
    type: 'private',
    reliability: 0.85,
    lastUpdated: new Date()
  },
  {
    name: 'Cooperative Society',
    type: 'cooperative',
    reliability: 0.9,
    lastUpdated: new Date()
  }
];

class SeedDataService {
  /**
   * Generate sample users
   */
  private generateSampleUsers(): User[] {
    const users: User[] = [];
    const roles: UserRole[] = ['vendor', 'buyer', 'commission_agent'];
    const names = [
      'Ramesh Kumar', 'Priya Sharma', 'Suresh Patel', 'Anita Singh', 'Rajesh Gupta',
      'Meera Reddy', 'Vikram Yadav', 'Sunita Joshi', 'Amit Verma', 'Kavita Nair'
    ];
    const languages = ['hi', 'en', 'mr', 'ta', 'te', 'gu', 'kn', 'ml', 'pa', 'bn'];
    const commodities = ['wheat', 'rice', 'cotton', 'soybean', 'sugarcane', 'tomato', 'onion', 'potato'];

    for (let i = 0; i < 10; i++) {
      const role = roles[i % roles.length];
      const location = SAMPLE_LOCATIONS[i % SAMPLE_LOCATIONS.length];
      const primaryLang = languages[i % languages.length];

      users.push({
        id: `user_${i + 1}`,
        phoneNumber: `+91${9000000000 + i}`,
        role,
        profile: {
          name: names[i],
          location,
          primaryLanguage: primaryLang,
          secondaryLanguages: [primaryLang === 'en' ? 'hi' : 'en'],
          commodityInterests: commodities.slice(i % 3, (i % 3) + 3),
          businessType: role === 'vendor' ? 'farmer' : role === 'buyer' ? 'retailer' : 'agent',
          verificationStatus: i < 7 ? 'verified' : 'pending'
        },
        reputation: {
          score: 3.5 + (i * 0.3) % 1.5,
          totalTransactions: i * 5 + 10,
          successfulDeals: i * 4 + 8,
          averageRating: 3.8 + (i * 0.2) % 1.2,
          badges: i < 5 ? ['trusted_seller', 'verified_farmer'] : ['new_member']
        },
        preferences: {
          units: {
            weight: 'quintal',
            volume: 'liter',
            area: 'acre'
          },
          currency: 'INR',
          notifications: {
            priceAlerts: true,
            negotiationUpdates: true,
            marketNews: i % 2 === 0,
            smsBackup: true
          },
          privacy: {
            showLocation: true,
            showTransactionHistory: i % 3 === 0,
            allowDataCollection: true
          }
        },
        createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
        lastActive: new Date(Date.now() - (i * 2 * 60 * 60 * 1000))
      });
    }

    return users;
  }

  /**
   * Generate sample commodities
   */
  private generateSampleCommodities(): Commodity[] {
    const commodities: Commodity[] = [
      {
        id: 'wheat_001',
        name: 'Wheat',
        category: 'Cereals',
        subcategory: 'Winter Wheat',
        standardUnits: ['kg', 'quintal', 'ton'],
        qualityGrades: QUALITY_GRADES,
        seasonality: {
          peakMonths: [3, 4, 5],
          lowMonths: [9, 10, 11],
          averageYield: 3500
        },
        storageRequirements: {
          temperature: '10-15°C',
          humidity: '12-14%',
          shelfLife: 365
        },
        translations: {
          hi: 'गेहूं',
          mr: 'गहू',
          ta: 'கோதுமை',
          te: 'గోధుమలు',
          gu: 'ઘઉં',
          kn: 'ಗೋಧಿ',
          ml: 'ഗോതമ്പ്',
          pa: 'ਕਣਕ',
          bn: 'গম'
        },
        marketClassification: 'AGRI_CEREAL_001'
      },
      {
        id: 'rice_001',
        name: 'Rice',
        category: 'Cereals',
        subcategory: 'Basmati Rice',
        standardUnits: ['kg', 'quintal', 'ton'],
        qualityGrades: QUALITY_GRADES,
        seasonality: {
          peakMonths: [10, 11, 12],
          lowMonths: [4, 5, 6],
          averageYield: 4200
        },
        storageRequirements: {
          temperature: '15-20°C',
          humidity: '12-14%',
          shelfLife: 730
        },
        translations: {
          hi: 'चावल',
          mr: 'तांदूळ',
          ta: 'அரிசி',
          te: 'బియ్యం',
          gu: 'ચોખા',
          kn: 'ಅಕ್ಕಿ',
          ml: 'അരി',
          pa: 'ਚਾਵਲ',
          bn: 'চাল'
        },
        marketClassification: 'AGRI_CEREAL_002'
      },
      {
        id: 'cotton_001',
        name: 'Cotton',
        category: 'Cash Crops',
        subcategory: 'Raw Cotton',
        standardUnits: ['kg', 'quintal', 'bale'],
        qualityGrades: QUALITY_GRADES,
        seasonality: {
          peakMonths: [10, 11, 12, 1],
          lowMonths: [6, 7, 8],
          averageYield: 500
        },
        storageRequirements: {
          temperature: '20-25°C',
          humidity: '8-10%',
          shelfLife: 1095
        },
        translations: {
          hi: 'कपास',
          mr: 'कापूस',
          ta: 'பருத்தி',
          te: 'పత్తి',
          gu: 'કપાસ',
          kn: 'ಹತ್ತಿ',
          ml: 'പരുത്തി',
          pa: 'ਕਪਾਹ',
          bn: 'তুলা'
        },
        marketClassification: 'AGRI_CASH_001'
      },
      {
        id: 'tomato_001',
        name: 'Tomato',
        category: 'Vegetables',
        subcategory: 'Fresh Tomato',
        standardUnits: ['kg', 'crate', 'ton'],
        qualityGrades: QUALITY_GRADES.slice(0, 3), // Only first 3 grades for vegetables
        seasonality: {
          peakMonths: [11, 12, 1, 2],
          lowMonths: [6, 7, 8],
          averageYield: 25000
        },
        storageRequirements: {
          temperature: '10-12°C',
          humidity: '85-90%',
          shelfLife: 14
        },
        translations: {
          hi: 'टमाटर',
          mr: 'टोमॅटो',
          ta: 'தக்காளி',
          te: 'టమాటో',
          gu: 'ટમેટા',
          kn: 'ಟೊಮೇಟೊ',
          ml: 'തക്കാളി',
          pa: 'ਟਮਾਟਰ',
          bn: 'টমেটো'
        },
        marketClassification: 'AGRI_VEG_001'
      },
      {
        id: 'onion_001',
        name: 'Onion',
        category: 'Vegetables',
        subcategory: 'Red Onion',
        standardUnits: ['kg', 'quintal', 'ton'],
        qualityGrades: QUALITY_GRADES.slice(0, 3),
        seasonality: {
          peakMonths: [3, 4, 5, 11, 12],
          lowMonths: [7, 8, 9],
          averageYield: 20000
        },
        storageRequirements: {
          temperature: '0-4°C',
          humidity: '65-70%',
          shelfLife: 180
        },
        translations: {
          hi: 'प्याज',
          mr: 'कांदा',
          ta: 'வெங்காயம்',
          te: 'ఉల్లిపాయ',
          gu: 'ડુંગળી',
          kn: 'ಈರುಳ್ಳಿ',
          ml: 'സവാള',
          pa: 'ਪਿਆਜ਼',
          bn: 'পেঁয়াজ'
        },
        marketClassification: 'AGRI_VEG_002'
      }
    ];

    return commodities;
  }

  /**
   * Generate sample price records
   */
  private generateSamplePriceRecords(commodities: Commodity[]): PriceRecord[] {
    const priceRecords: PriceRecord[] = [];
    const basePrices: { [key: string]: number } = {
      wheat_001: 2450,
      rice_001: 3200,
      cotton_001: 5800,
      tomato_001: 2500,
      onion_001: 3500
    };

    // Generate price records for the last 30 days
    for (let day = 0; day < 30; day++) {
      const date = new Date(Date.now() - day * 24 * 60 * 60 * 1000);

      commodities.forEach((commodity, _commodityIndex) => {
        SAMPLE_LOCATIONS.forEach((location, locationIndex) => {
          DATA_SOURCES.forEach((source, sourceIndex) => {
            const basePrice = basePrices[commodity.id] || 2000;
            const variation = (Math.random() - 0.5) * 0.2; // ±10% variation
            const seasonalFactor = Math.sin((date.getMonth() / 12) * 2 * Math.PI) * 0.1;
            const price = Math.round(basePrice * (1 + variation + seasonalFactor));

            priceRecords.push({
              id: `price_${commodity.id}_${locationIndex}_${sourceIndex}_${day}`,
              commodityId: commodity.id,
              price,
              unit: 'quintal',
              currency: 'INR',
              qualityGrade: QUALITY_GRADES[Math.floor(Math.random() * QUALITY_GRADES.length)].name,
              location,
              source,
              timestamp: date,
              volume: Math.floor(Math.random() * 1000) + 100,
              confidence: 0.8 + Math.random() * 0.2,
              metadata: {
                weatherConditions: ['sunny', 'rainy', 'cloudy'][Math.floor(Math.random() * 3)],
                marketConditions: ['normal', 'high_demand', 'oversupply'][Math.floor(Math.random() * 3)],
                seasonalFactor: seasonalFactor
              }
            });
          });
        });
      });
    }

    return priceRecords;
  }

  /**
   * Generate sample transactions
   */
  private generateSampleTransactions(users: User[], commodities: Commodity[]): Transaction[] {
    const transactions: Transaction[] = [];
    const vendors = users.filter(u => u.role === 'vendor');
    const buyers = users.filter(u => u.role === 'buyer');

    for (let i = 0; i < 20; i++) {
      const vendor = vendors[i % vendors.length];
      const buyer = buyers[i % buyers.length];
      const commodity = commodities[i % commodities.length];
      const quantity = Math.floor(Math.random() * 100) + 10;
      const basePrice = 2000 + (i * 100);
      const agreedPrice = basePrice + (Math.random() - 0.5) * 200;

      transactions.push({
        id: `transaction_${i + 1}`,
        vendorId: vendor.id,
        buyerId: buyer.id,
        commodityId: commodity.id,
        details: {
          quantity,
          unit: 'quintal',
          qualityGrade: QUALITY_GRADES[i % QUALITY_GRADES.length].name,
          agreedPrice,
          totalAmount: quantity * agreedPrice,
          deliveryTerms: {
            method: 'truck',
            location: buyer.profile.location.mandis[0],
            timeframe: '3-5 days',
            cost: 500
          },
          paymentTerms: {
            method: 'bank_transfer',
            schedule: 'on_delivery',
            advancePercentage: 20
          }
        },
        negotiationHistory: [
          {
            id: `nego_${i}_1`,
            timestamp: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000),
            userId: vendor.id,
            action: 'offer',
            amount: basePrice + 100,
            message: 'Initial offer for premium quality'
          },
          {
            id: `nego_${i}_2`,
            timestamp: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
            userId: buyer.id,
            action: 'counter_offer',
            amount: basePrice - 50,
            message: 'Counter offer considering market rates'
          },
          {
            id: `nego_${i}_3`,
            timestamp: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
            userId: vendor.id,
            action: 'accept',
            amount: agreedPrice,
            message: 'Agreed on final price'
          }
        ],
        status: i < 15 ? 'completed' : i < 18 ? 'delivered' : 'agreed',
        ratings: i < 15 ? {
          vendorRating: {
            score: 4 + Math.random(),
            comment: 'Good quality products, timely delivery',
            timestamp: new Date(Date.now() - i * 12 * 60 * 60 * 1000)
          },
          buyerRating: {
            score: 4 + Math.random(),
            comment: 'Prompt payment, professional buyer',
            timestamp: new Date(Date.now() - i * 12 * 60 * 60 * 1000)
          }
        } : {},
        timestamps: {
          initiated: new Date(Date.now() - (i + 2) * 24 * 60 * 60 * 1000),
          agreed: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000),
          delivered: i < 18 ? new Date(Date.now() - i * 12 * 60 * 60 * 1000) : undefined,
          completed: i < 15 ? new Date(Date.now() - i * 6 * 60 * 60 * 1000) : undefined
        }
      });
    }

    return transactions;
  }

  /**
   * Seed all data
   */
  async seedAll(): Promise<void> {
    console.log('Starting database seeding...');

    try {
      // Generate sample data
      const users = this.generateSampleUsers();
      const commodities = this.generateSampleCommodities();
      const priceRecords = this.generateSamplePriceRecords(commodities);
      const transactions = this.generateSampleTransactions(users, commodities);

      // Seed users
      console.log('Seeding users...');
      for (const user of users) {
        await databaseService.createUser(user);
      }

      // Seed commodities
      console.log('Seeding commodities...');
      for (const commodity of commodities) {
        await databaseService.createCommodity(commodity);
      }

      // Seed price records
      console.log('Seeding price records...');
      for (const priceRecord of priceRecords) {
        await databaseService.createPriceRecord(priceRecord);
      }

      // Seed transactions
      console.log('Seeding transactions...');
      for (const transaction of transactions) {
        await databaseService.createTransaction(transaction);
      }

      // Create some sample conversations and messages
      console.log('Seeding conversations and messages...');
      await this.seedConversationsAndMessages(users, transactions);

      console.log('Database seeding completed successfully!');

      // Log statistics
      const stats = await databaseService.getStats();
      console.log('Database statistics after seeding:', stats);

    } catch (error) {
      console.error('Error during database seeding:', error);
      throw error;
    }
  }

  /**
   * Seed conversations and messages
   */
  private async seedConversationsAndMessages(_users: User[], transactions: Transaction[]): Promise<void> {
    const conversations: Conversation[] = [];
    const messages: Message[] = [];

    // Create conversations for transactions
    for (let i = 0; i < Math.min(10, transactions.length); i++) {
      const transaction = transactions[i];
      const conversationId = `conv_${i + 1}`;

      const conversation: Conversation = {
        id: conversationId,
        participants: [transaction.vendorId, transaction.buyerId],
        lastActivity: new Date(Date.now() - i * 60 * 60 * 1000),
        isActive: i < 5,
        transactionId: transaction.id
      };

      conversations.push(conversation);

      // Create sample messages for this conversation
      const sampleMessages = [
        {
          senderId: transaction.vendorId,
          text: 'Hello, I have premium quality wheat available. Are you interested?',
          language: 'en'
        },
        {
          senderId: transaction.buyerId,
          text: 'Yes, what is your price per quintal?',
          language: 'en'
        },
        {
          senderId: transaction.vendorId,
          text: 'Current market rate is ₹2450 per quintal for Grade A quality.',
          language: 'en'
        },
        {
          senderId: transaction.buyerId,
          text: 'Can you do ₹2400? I need 50 quintals.',
          language: 'en'
        }
      ];

      sampleMessages.forEach((msg, msgIndex) => {
        messages.push({
          id: `msg_${i}_${msgIndex + 1}`,
          conversationId,
          senderId: msg.senderId,
          receiverId: msg.senderId === transaction.vendorId ? transaction.buyerId : transaction.vendorId,
          content: {
            originalText: msg.text,
            originalLanguage: msg.language,
            messageType: 'text'
          },
          metadata: {},
          timestamp: new Date(Date.now() - (i * 4 + msgIndex) * 30 * 60 * 1000),
          status: 'read'
        });
      });

      // Update conversation with last message
      conversation.lastMessage = messages[messages.length - 1];
    }

    // Save conversations and messages
    for (const conversation of conversations) {
      await databaseService.createConversation(conversation);
    }

    for (const message of messages) {
      await databaseService.createMessage(message);
    }
  }

  /**
   * Clear all seeded data
   */
  async clearSeedData(): Promise<void> {
    console.log('Clearing all seeded data...');
    await databaseService.clearAllData();
    console.log('All seeded data cleared');
  }

  /**
   * Check if database has been seeded
   */
  async isSeeded(): Promise<boolean> {
    try {
      const stats = await databaseService.getStats();
      return Object.values(stats).some(count => count > 0);
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const seedDataService = new SeedDataService();
export default seedDataService;