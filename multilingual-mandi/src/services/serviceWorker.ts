// Service Worker utility functions for PWA functionality
// Provides interface between React app and service worker

export interface OfflineMessage {
  id: string;
  content: string;
  recipientId: string;
  timestamp: Date;
  type: 'text' | 'voice' | 'negotiation_offer';
}

export interface OfflineTransaction {
  id: string;
  vendorId: string;
  buyerId: string;
  commodityId: string;
  quantity: number;
  agreedPrice: number;
  timestamp: Date;
}

export interface ServiceWorkerStatus {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  hasUpdate: boolean;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable = false;

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  /**
   * Get current service worker status
   */
  getStatus(): ServiceWorkerStatus {
    return {
      isSupported: 'serviceWorker' in navigator,
      isRegistered: this.registration !== null,
      isOnline: navigator.onLine,
      hasUpdate: this.updateAvailable
    };
  }

  /**
   * Register service worker and set up event listeners
   */
  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully');

      // Listen for updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.updateAvailable = true;
              this.notifyUpdateAvailable();
            }
          });
        }
      });

      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  /**
   * Update service worker to latest version
   */
  async updateServiceWorker(): Promise<void> {
    if (!this.registration) {
      throw new Error('Service Worker not registered');
    }

    const newWorker = this.registration.installing || this.registration.waiting;
    if (newWorker) {
      newWorker.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }

  /**
   * Queue message for offline sync
   */
  async queueOfflineMessage(message: OfflineMessage): Promise<void> {
    try {
      // Store in IndexedDB for background sync
      await this.storeOfflineMessage(message);
      
      // Request background sync
      if (this.registration && 'sync' in this.registration) {
        await (this.registration as any).sync.register('background-sync-messages');
      }
      
      console.log('Message queued for offline sync:', message.id);
    } catch (error) {
      console.error('Failed to queue offline message:', error);
      throw error;
    }
  }

  /**
   * Queue transaction for offline sync
   */
  async queueOfflineTransaction(transaction: OfflineTransaction): Promise<void> {
    try {
      // Store in IndexedDB for background sync
      await this.storeOfflineTransaction(transaction);
      
      // Request background sync
      if (this.registration && 'sync' in this.registration) {
        await (this.registration as any).sync.register('background-sync-transactions');
      }
      
      console.log('Transaction queued for offline sync:', transaction.id);
    } catch (error) {
      console.error('Failed to queue offline transaction:', error);
      throw error;
    }
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All caches cleared');
    }
  }

  /**
   * Get cache usage information
   */
  async getCacheInfo(): Promise<{ size: number; entries: number }> {
    if (!('caches' in window)) {
      return { size: 0, entries: 0 };
    }

    let totalSize = 0;
    let totalEntries = 0;

    const cacheNames = await caches.keys();
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      totalEntries += requests.length;

      // Estimate size (rough calculation)
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }

    return { size: totalSize, entries: totalEntries };
  }

  /**
   * Handle online event
   */
  private handleOnline(): void {
    console.log('App is online');
    // Trigger background sync for any queued data
    if (this.registration && 'sync' in this.registration) {
      (this.registration as any).sync.register('background-sync-messages');
      (this.registration as any).sync.register('background-sync-transactions');
    }
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    console.log('App is offline');
    // Could show offline indicator to user
  }

  /**
   * Notify app about available update
   */
  private notifyUpdateAvailable(): void {
    // Dispatch custom event that components can listen to
    window.dispatchEvent(new CustomEvent('sw-update-available'));
  }

  /**
   * Store offline message in IndexedDB
   */
  private async storeOfflineMessage(message: OfflineMessage): Promise<void> {
    // TODO: Implement IndexedDB storage
    // For now, store in localStorage as fallback
    const offlineMessages = this.getStoredOfflineMessages();
    offlineMessages.push(message);
    localStorage.setItem('offline-messages', JSON.stringify(offlineMessages));
  }

  /**
   * Store offline transaction in IndexedDB
   */
  private async storeOfflineTransaction(transaction: OfflineTransaction): Promise<void> {
    // TODO: Implement IndexedDB storage
    // For now, store in localStorage as fallback
    const offlineTransactions = this.getStoredOfflineTransactions();
    offlineTransactions.push(transaction);
    localStorage.setItem('offline-transactions', JSON.stringify(offlineTransactions));
  }

  /**
   * Get stored offline messages
   */
  private getStoredOfflineMessages(): OfflineMessage[] {
    try {
      const stored = localStorage.getItem('offline-messages');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get stored offline transactions
   */
  private getStoredOfflineTransactions(): OfflineTransaction[] {
    try {
      const stored = localStorage.getItem('offline-transactions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}

// Create singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();

// Utility functions for components
export const isOnline = (): boolean => navigator.onLine;

export const waitForOnline = (): Promise<void> => {
  return new Promise((resolve) => {
    if (navigator.onLine) {
      resolve();
    } else {
      const handleOnline = () => {
        window.removeEventListener('online', handleOnline);
        resolve();
      };
      window.addEventListener('online', handleOnline);
    }
  });
};

export const formatCacheSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

// Hook for React components to use service worker functionality
export const useServiceWorker = () => {
  const [status, setStatus] = React.useState<ServiceWorkerStatus>(
    serviceWorkerManager.getStatus()
  );

  React.useEffect(() => {
    // Update status when online/offline changes
    const updateStatus = () => setStatus(serviceWorkerManager.getStatus());
    
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    window.addEventListener('sw-update-available', updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      window.removeEventListener('sw-update-available', updateStatus);
    };
  }, []);

  return {
    status,
    queueOfflineMessage: serviceWorkerManager.queueOfflineMessage.bind(serviceWorkerManager),
    queueOfflineTransaction: serviceWorkerManager.queueOfflineTransaction.bind(serviceWorkerManager),
    updateServiceWorker: serviceWorkerManager.updateServiceWorker.bind(serviceWorkerManager),
    clearCache: serviceWorkerManager.clearCache.bind(serviceWorkerManager),
    getCacheInfo: serviceWorkerManager.getCacheInfo.bind(serviceWorkerManager)
  };
};

// Add React import for the hook
import React from 'react';