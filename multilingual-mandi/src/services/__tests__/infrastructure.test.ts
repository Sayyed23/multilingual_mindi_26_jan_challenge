// Infrastructure Tests - Verify core setup is working
import { describe, it, expect } from 'vitest';
import { createMockUser, createMockPriceData } from './setup';

describe('Infrastructure Setup', () => {
  describe('Type System', () => {
    it('should create valid user objects', () => {
      const user = createMockUser();
      
      expect(user).toHaveProperty('uid');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('role');
      expect(user.role).toMatch(/^(vendor|buyer|agent)$/);
      expect(user.language).toMatch(/^[a-z]{2}$/);
    });

    it('should create valid price data objects', () => {
      const priceData = createMockPriceData();
      
      expect(priceData).toHaveProperty('commodity');
      expect(priceData).toHaveProperty('price');
      expect(priceData).toHaveProperty('timestamp');
      expect(typeof priceData.price).toBe('number');
      expect(priceData.price).toBeGreaterThan(0);
    });
  });

  describe('Environment Setup', () => {
    it('should have required global objects', () => {
      expect(globalThis.indexedDB).toBeDefined();
      expect(globalThis.IDBKeyRange).toBeDefined();
      expect(globalThis.crypto).toBeDefined();
      expect(globalThis.navigator).toBeDefined();
    });

    it('should have mocked Firebase services', async () => {
      // Import should not throw
      const firebase = await import('../../lib/firebase');
      expect(firebase.auth).toBeDefined();
      expect(firebase.db).toBeDefined();
      expect(firebase.functions).toBeDefined();
      expect(firebase.storage).toBeDefined();
    });

    it('should generate UUIDs', () => {
      const uuid1 = crypto.randomUUID();
      const uuid2 = crypto.randomUUID();
      
      expect(typeof uuid1).toBe('string');
      expect(typeof uuid2).toBe('string');
      expect(uuid1).not.toBe(uuid2);
      expect(uuid1).toMatch(/^test-uuid-/);
    });
  });

  describe('PWA Infrastructure', () => {
    it('should have service worker support', () => {
      expect(navigator.serviceWorker).toBeDefined();
      expect(typeof navigator.serviceWorker.register).toBe('function');
    });

    it('should have notification support', () => {
      expect(globalThis.Notification).toBeDefined();
      expect(typeof Notification.requestPermission).toBe('function');
    });

    it('should detect network status', () => {
      expect(typeof navigator.onLine).toBe('boolean');
      expect(navigator.onLine).toBe(true); // Default in tests
    });
  });

  describe('Basic Service Imports', () => {
    it('should import offline sync service without errors', async () => {
      const { offlineSyncService } = await import('../offlineSync');
      expect(offlineSyncService).toBeDefined();
      expect(typeof offlineSyncService.isOnline).toBe('function');
    });

    it('should import PWA service without errors', async () => {
      // Just test that the module can be imported
      const pwaModule = await import('../pwaInit');
      expect(pwaModule).toBeDefined();
    });
  });
});