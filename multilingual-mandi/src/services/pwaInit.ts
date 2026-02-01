// PWA Initialization Service
// Handles service worker registration, update management, and PWA features

interface PWAInstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAUpdateAvailableEvent extends Event {
  waiting?: ServiceWorker;
}

class PWAService {
  private deferredPrompt: PWAInstallPrompt | null = null;
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable: boolean = false;

  constructor() {
    this.initializePWA();
  }

  private async initializePWA(): Promise<void> {
    // Register service worker
    await this.registerServiceWorker();

    // Set up install prompt handling
    this.setupInstallPrompt();

    // Set up update handling
    this.setupUpdateHandling();

    // Initialize background sync
    this.initializeBackgroundSync();
  }

  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('Service Worker registered successfully:', this.registration);

        // Listen for service worker updates
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

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    } else {
      console.log('Service Worker not supported');
    }
  }

  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (event: Event) => {
      event.preventDefault();
      this.deferredPrompt = event as PWAInstallPrompt;
      this.notifyInstallAvailable();
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully');
      this.deferredPrompt = null;
      this.notifyInstallCompleted();
    });
  }

  private setupUpdateHandling(): void {
    // Listen for messages from service worker
    navigator.serviceWorker?.addEventListener('message', (event) => {
      const payload = event.data;
      if (!payload) return;

      const { type } = payload;

      switch (type) {
        case 'SYNC_OFFLINE_ACTIONS':
          this.notifyOfflineSync();
          break;
        case 'UPDATE_AVAILABLE':
          this.updateAvailable = true;
          this.notifyUpdateAvailable();
          break;
        default:
          console.log('Unknown message from service worker:', type);
      }
    });
  }

  private initializeBackgroundSync(): void {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      // Background sync is supported
      console.log('Background sync supported');

      // Register for background sync when going offline
      window.addEventListener('offline', () => {
        this.registerBackgroundSync('offline-actions-sync');
      });

      // Periodic price data sync
      setInterval(() => {
        if (navigator.onLine) {
          this.registerBackgroundSync('price-data-sync');
        }
      }, 5 * 60 * 1000); // Every 5 minutes
    }
  }

  // Public API methods

  async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        this.deferredPrompt = null;
        return true;
      } else {
        console.log('User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return false;
    }
  }

  async applyUpdate(): Promise<void> {
    if (!this.registration || !this.updateAvailable) {
      return;
    }

    const waitingWorker = this.registration.waiting;
    if (waitingWorker) {
      // Listen for the new service worker to take control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      }, { once: true });

      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  }
  isInstallable(): boolean {
    return this.deferredPrompt !== null;
  }

  isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      (window.navigator as any).standalone === true;
  }

  async registerBackgroundSync(tag: string): Promise<void> {
    if (this.registration && 'sync' in this.registration) {
      try {
        const syncManager = (this.registration as any).sync;
        await syncManager.register(tag);
        console.log(`Background sync registered: ${tag}`);
      } catch (error) {
        console.error(`Failed to register background sync: ${tag}`, error);
      }
    }
  }

  async cacheUrls(urls: string[]): Promise<void> {
    if (this.registration) {
      this.registration.active?.postMessage({
        type: 'CACHE_URLS',
        data: { urls }
      });
    }
  }

  async clearCache(cacheName?: string): Promise<void> {
    if (this.registration) {
      this.registration.active?.postMessage({
        type: 'CLEAR_CACHE',
        data: { cacheName }
      });
    }
  }

  // Event notification methods (to be connected to UI)
  private notifyInstallAvailable(): void {
    // Dispatch custom event for UI to handle
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  }

  private notifyInstallCompleted(): void {
    window.dispatchEvent(new CustomEvent('pwa-install-completed'));
  }

  private notifyUpdateAvailable(): void {
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  }

  private notifyOfflineSync(): void {
    window.dispatchEvent(new CustomEvent('pwa-offline-sync'));
  }

  // Network status methods
  isOnline(): boolean {
    return navigator.onLine;
  }

  onNetworkChange(callback: (online: boolean) => void): () => void {
    const onlineHandler = () => callback(true);
    const offlineHandler = () => callback(false);

    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);

    // Return cleanup function
    return () => {
      window.removeEventListener('online', onlineHandler);
      window.removeEventListener('offline', offlineHandler);
    };
  }

  // Push notification methods
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission;
    }
    return 'denied';
  }

  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!this.registration || !('PushManager' in window)) {
      return null;
    }

    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      console.warn('Push notifications disabled: VITE_VAPID_PUBLIC_KEY not configured');
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidKey)
      });

      console.log('Push subscription created:', subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Export singleton instance
export const pwaService = new PWAService();

// Export types for external use
export type { PWAInstallPrompt, PWAUpdateAvailableEvent };