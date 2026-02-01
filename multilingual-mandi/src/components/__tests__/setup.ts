// Component Test Setup
import { vi } from 'vitest';
import '@testing-library/jest-dom';
// Mock Firebase
vi.mock('../../lib/firebase', () => ({
  functions: {},
  auth: {},
  db: {},
}));

// Mock Firebase functions
vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn(() => vi.fn()),
}));

// Mock translation service
vi.mock('../../services/translation', () => ({
  translationService: {
    translateText: vi.fn(),
    translateVoice: vi.fn(),
    getCachedTranslation: vi.fn(),
    getConfidenceScore: vi.fn(),
    getLanguageName: vi.fn((lang: string) => {
      const names: Record<string, string> = {
        'en': 'English',
        'hi': 'Hindi',
        'ta': 'Tamil',
        'te': 'Telugu'
      };
      return names[lang] || lang;
    }),
    isSupportedLanguage: vi.fn(() => true),
    getConfidenceLevel: vi.fn(),
    isTranslationReliable: vi.fn(),
    getFallbackOptions: vi.fn(() => []),
    getErrorMessage: vi.fn(() => 'Translation error'),
  }
}));

// Mock auth hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: {
      uid: 'test-user',
      email: 'test@example.com',
      language: 'en',
      role: 'buyer'
    },
    loading: false,
    error: null
  }))
}));

// Mock Web APIs
const mockMediaDevices = {
  getUserMedia: vi.fn(() => Promise.resolve({
    getTracks: () => [{ stop: vi.fn() }]
  }))
};

Object.defineProperty(globalThis.navigator, 'mediaDevices', {
  value: mockMediaDevices,
  writable: true
});

class MockMediaRecorder {
  stream: any;
  ondataavailable: any;
  onstop: any;
  start: any;
  stop: any;

  constructor(stream: any) {
    this.stream = stream;
    this.ondataavailable = null;
    this.onstop = null;
    this.start = vi.fn();
    this.stop = vi.fn();
  }
}

Object.defineProperty(globalThis, 'MediaRecorder', {
  value: MockMediaRecorder,
  writable: true
});

Object.defineProperty(URL, 'createObjectURL', {
  value: vi.fn(() => 'blob:mock-url'),
  writable: true
});

Object.defineProperty(URL, 'revokeObjectURL', {
  value: vi.fn(),
  writable: true
});

const mockAudio = vi.fn().mockImplementation(() => ({
  play: vi.fn(() => Promise.resolve()),
  pause: vi.fn(),
  onplay: null,
  onpause: null,
  onended: null,
  currentTime: 0
}));

Object.defineProperty(globalThis, 'Audio', {
  value: mockAudio,
  writable: true
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

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