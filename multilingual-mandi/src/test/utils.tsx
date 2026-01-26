import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { User, Commodity, Deal, Message, PriceEntry } from '../types';

// Custom render function that includes common providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <div data-testid="test-wrapper">
      {children}
    </div>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Test utilities for common operations
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    length: Object.keys(store).length,
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
};

export const mockSessionStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    length: Object.keys(store).length,
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
};

// Mock fetch for API testing
export const mockFetch = (response: any, ok = true, status = 200) => {
  return jest.fn(() =>
    Promise.resolve({
      ok,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
      headers: new Headers(),
      redirected: false,
      statusText: ok ? 'OK' : 'Error',
      type: 'basic' as ResponseType,
      url: '',
      clone: jest.fn(),
      body: null,
      bodyUsed: false,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      blob: () => Promise.resolve(new Blob()),
      formData: () => Promise.resolve(new FormData()),
    })
  );
};

// Helper to create mock API responses
export const createMockApiResponse = <T,>(data: T, success = true) => ({
  success,
  data: success ? data : null,
  error: success ? null : 'Mock error',
  message: success ? 'Success' : 'Error occurred',
});

// Helper to simulate network delays in tests
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to create test IDs consistently
export const createTestId = (component: string, element?: string) => {
  return element ? `${component}-${element}` : component;
};

// Helper for testing responsive behavior
export const setViewportSize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  window.dispatchEvent(new Event('resize'));
};

// Helper for testing offline/online states
export const setOnlineStatus = (isOnline: boolean) => {
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    configurable: true,
    value: isOnline,
  });
  window.dispatchEvent(new Event(isOnline ? 'online' : 'offline'));
};

// Helper for testing language changes
export const setNavigatorLanguage = (language: string) => {
  Object.defineProperty(navigator, 'language', {
    writable: true,
    configurable: true,
    value: language,
  });
  Object.defineProperty(navigator, 'languages', {
    writable: true,
    configurable: true,
    value: [language],
  });
};

// Helper for testing touch events
export const createTouchEvent = (type: string, touches: Array<{ clientX: number; clientY: number }>) => {
  const touchList = touches.map(touch => ({
    ...touch,
    identifier: Math.random(),
    target: document.body,
    screenX: touch.clientX,
    screenY: touch.clientY,
    pageX: touch.clientX,
    pageY: touch.clientY,
    radiusX: 1,
    radiusY: 1,
    rotationAngle: 0,
    force: 1,
  }));

  return new TouchEvent(type, {
    touches: touchList as any,
    targetTouches: touchList as any,
    changedTouches: touchList as any,
    bubbles: true,
    cancelable: true,
  });
};

// Helper for testing voice recognition
export const mockSpeechRecognitionResult = (transcript: string, confidence = 0.9) => {
  return {
    results: [{
      0: {
        transcript,
        confidence,
      },
      isFinal: true,
      length: 1,
    }],
    resultIndex: 0,
  };
};