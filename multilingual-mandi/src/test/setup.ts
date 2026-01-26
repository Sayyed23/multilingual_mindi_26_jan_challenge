import '@testing-library/jest-dom';

// Mock global objects that might not be available in test environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock window.matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver for lazy loading tests
global.IntersectionObserver = class IntersectionObserver {
  root: Element | null = null;
  rootMargin: string = '';
  thresholds: ReadonlyArray<number> = [];
  
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
} as any;

// Mock ResizeObserver for responsive component tests
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock Web Speech API for voice translation tests
const mockSpeechRecognition = jest.fn().mockImplementation(() => ({
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: mockSpeechRecognition,
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: mockSpeechRecognition,
});

// Mock IndexedDB for offline functionality tests
const mockIDBRequest = {
  result: null,
  error: null,
  onsuccess: null,
  onerror: null,
  readyState: 'done',
};

const mockIDBDatabase = {
  close: jest.fn(),
  createObjectStore: jest.fn(),
  deleteObjectStore: jest.fn(),
  transaction: jest.fn(() => mockIDBTransaction),
  version: 1,
  objectStoreNames: [],
};

const mockIDBTransaction = {
  abort: jest.fn(),
  objectStore: jest.fn(() => mockIDBObjectStore),
  oncomplete: null,
  onerror: null,
  onabort: null,
};

const mockIDBObjectStore = {
  add: jest.fn(() => mockIDBRequest),
  clear: jest.fn(() => mockIDBRequest),
  count: jest.fn(() => mockIDBRequest),
  delete: jest.fn(() => mockIDBRequest),
  get: jest.fn(() => mockIDBRequest),
  getAll: jest.fn(() => mockIDBRequest),
  getAllKeys: jest.fn(() => mockIDBRequest),
  getKey: jest.fn(() => mockIDBRequest),
  put: jest.fn(() => mockIDBRequest),
  openCursor: jest.fn(() => mockIDBRequest),
  createIndex: jest.fn(),
  deleteIndex: jest.fn(),
  index: jest.fn(),
};

Object.defineProperty(window, 'indexedDB', {
  writable: true,
  value: {
    open: jest.fn(() => mockIDBRequest),
    deleteDatabase: jest.fn(() => mockIDBRequest),
    databases: jest.fn(() => Promise.resolve([])),
  },
});

// Mock geolocation for location-based features
Object.defineProperty(navigator, 'geolocation', {
  writable: true,
  value: {
    getCurrentPosition: jest.fn((success) => {
      success({
        coords: {
          latitude: 28.6139, // Delhi coordinates for testing
          longitude: 77.2090,
          accuracy: 100,
        },
      });
    }),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  },
});

// Mock service worker for PWA tests
Object.defineProperty(navigator, 'serviceWorker', {
  writable: true,
  value: {
    register: jest.fn(() => Promise.resolve({
      installing: null,
      waiting: null,
      active: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })),
    ready: Promise.resolve({
      installing: null,
      waiting: null,
      active: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }),
    controller: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
});

// Set up console error/warn suppression for expected test warnings
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is deprecated') ||
       args[0].includes('Warning: componentWillReceiveProps has been renamed'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('deprecated')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});