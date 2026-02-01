// Test Setup Configuration for Multilingual Mandi Platform
import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';

// Mock Firebase services for testing
vi.mock('../../lib/firebase', () => ({
  auth: {
    currentUser: null,
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    authStateReady: vi.fn(() => Promise.resolve())
  },
  db: {
    collection: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    getDocs: vi.fn()
  },
  functions: {
    httpsCallable: vi.fn()
  },
  storage: {
    ref: vi.fn(),
    uploadBytes: vi.fn(),
    getDownloadURL: vi.fn()
  },
  messaging: null,
  checkFirebaseConnection: vi.fn(() => Promise.resolve(true)),
  isFirebaseInitialized: vi.fn(() => true)
}));

// Mock IndexedDB for Dexie
const mockIDBKeyRange = {
  bound: vi.fn(),
  only: vi.fn(),
  lowerBound: vi.fn(),
  upperBound: vi.fn()
};

const mockIDBRequest = {
  onsuccess: null,
  onerror: null,
  result: null,
  error: null,
  readyState: 'done'
};

const mockIDBTransaction = {
  objectStore: vi.fn(() => mockIDBObjectStore),
  abort: vi.fn(),
  oncomplete: null,
  onerror: null,
  onabort: null
};

const mockIDBObjectStore = {
  add: vi.fn(() => mockIDBRequest),
  put: vi.fn(() => mockIDBRequest),
  get: vi.fn(() => mockIDBRequest),
  delete: vi.fn(() => mockIDBRequest),
  clear: vi.fn(() => mockIDBRequest),
  count: vi.fn(() => mockIDBRequest),
  getAll: vi.fn(() => mockIDBRequest),
  getAllKeys: vi.fn(() => mockIDBRequest),
  index: vi.fn(),
  createIndex: vi.fn(),
  deleteIndex: vi.fn()
};

const mockIDBDatabase = {
  transaction: vi.fn(() => mockIDBTransaction),
  createObjectStore: vi.fn(() => mockIDBObjectStore),
  deleteObjectStore: vi.fn(),
  close: vi.fn(),
  version: 1,
  name: 'test-db',
  objectStoreNames: []
};

const mockIDBOpenDBRequest = {
  ...mockIDBRequest,
  onupgradeneeded: null,
  onblocked: null,
  result: mockIDBDatabase
};

// Mock IndexedDB globally
Object.defineProperty(globalThis, 'indexedDB', {
  value: {
    open: vi.fn(() => mockIDBOpenDBRequest),
    deleteDatabase: vi.fn(() => mockIDBRequest),
    databases: vi.fn(() => Promise.resolve([])),
    cmp: vi.fn()
  },
  writable: true
});

Object.defineProperty(globalThis, 'IDBKeyRange', {
  value: mockIDBKeyRange,
  writable: true
});

// Mock Web APIs
Object.defineProperty(globalThis.navigator, 'onLine', {
  value: true,
  writable: true
});

Object.defineProperty(globalThis.navigator, 'serviceWorker', {
  value: {
    register: vi.fn(() => Promise.resolve({
      installing: null,
      waiting: null,
      active: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    })),
    ready: Promise.resolve({
      installing: null,
      waiting: null,
      active: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  },
  writable: true
});

// Mock ServiceWorkerRegistration
Object.defineProperty(globalThis, 'ServiceWorkerRegistration', {
  value: {
    prototype: {
      sync: {
        register: vi.fn()
      }
    }
  },
  writable: true
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Notification API
Object.defineProperty(globalThis, 'Notification', {
  value: {
    permission: 'default',
    requestPermission: vi.fn(() => Promise.resolve('granted'))
  },
  writable: true
});

// Mock PushManager
Object.defineProperty(globalThis, 'PushManager', {
  value: {
    supportedContentEncodings: ['aes128gcm']
  },
  writable: true
});

// Mock crypto for UUID generation
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-' + Math.random().toString(36).substring(2, 11)), getRandomValues: vi.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    })
  },
  writable: true
});

// Test lifecycle hooks
beforeAll(() => {
  console.log('Starting test suite...');
});

afterAll(() => {
  console.log('Test suite completed.');
});

beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks();

  // Reset navigator.onLine
  Object.defineProperty(navigator, 'onLine', {
    value: true,
    writable: true
  });
});

afterEach(() => {
  // Clean up after each test
  vi.restoreAllMocks();
});

// Global test utilities
export const createMockUser = (overrides = {}) => ({
  uid: 'test-user-id',
  email: 'test@example.com',
  role: 'vendor' as const,
  language: 'en' as const,
  location: {
    state: 'Test State',
    district: 'Test District',
    city: 'Test City',
    pincode: '123456'
  },
  onboardingCompleted: true,
  verificationStatus: 'verified' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createMockPriceData = (overrides = {}) => ({
  commodity: 'wheat',
  mandi: 'Test Mandi',
  price: 2500,
  unit: 'quintal',
  quality: 'standard' as const,
  timestamp: new Date(),
  source: 'test-source',
  ...overrides
});

export const createMockDeal = (overrides = {}) => ({
  id: 'test-deal-id',
  buyerId: 'buyer-id',
  sellerId: 'seller-id',
  commodity: 'wheat',
  quantity: 100,
  agreedPrice: 2500,
  deliveryTerms: {
    location: {
      state: 'Test State',
      district: 'Test District',
      city: 'Test City',
      pincode: '123456'
    },
    expectedDate: new Date(),
    method: 'delivery' as const,
    cost: 500,
    responsibility: 'seller' as const
  },
  status: 'active' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

export const createMockMessage = (overrides = {}) => ({
  id: 'test-message-id',
  conversationId: 'test-conversation-id',
  senderId: 'sender-id',
  receiverId: 'receiver-id',
  content: {
    originalText: 'Test message',
    originalLanguage: 'en' as const,
    translations: new Map([['hi', 'परीक्षण संदेश']]),
    messageType: 'text' as const
  },
  metadata: {
    timestamp: new Date(),
    readStatus: false,
    translationConfidence: 0.95
  },
  ...overrides
});

// Export mock implementations for use in tests
export {
  mockIDBDatabase,
  mockIDBObjectStore,
  mockIDBTransaction,
  mockIDBRequest
};