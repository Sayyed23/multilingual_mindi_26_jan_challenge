/**
 * PWA Utilities for Multilingual Mandi
 * Handles PWA installation, updates, and offline detection
 */

// Types for PWA events
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;
  private isOnline = navigator.onLine;
  private callbacks: {
    onInstallable?: () => void;
    onInstalled?: () => void;
    onOffline?: () => void;
    onOnline?: () => void;
  } = {};

  constructor() {
    this.init();
  }

  private init() {
    // Check if app is already installed
    this.checkInstallationStatus();

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.callbacks.onInstallable?.();
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.callbacks.onInstalled?.();
    });

    // Listen for online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.callbacks.onOnline?.();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.callbacks.onOffline?.();
    });
  }

  private checkInstallationStatus() {
    // Check if running in standalone mode (installed PWA)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
    }

    // Check for iOS Safari standalone mode
    if ((window.navigator as any).standalone === true) {
      this.isInstalled = true;
    }
  }

  /**
   * Show the install prompt to the user
   */
  async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        this.deferredPrompt = null;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return false;
    }
  }

  /**
   * Check if the app can be installed
   */
  canInstall(): boolean {
    return this.deferredPrompt !== null && !this.isInstalled;
  }

  /**
   * Check if the app is installed
   */
  getInstallationStatus(): boolean {
    return this.isInstalled;
  }

  /**
   * Check online status
   */
  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Register callbacks for PWA events
   */
  onInstallable(callback: () => void) {
    this.callbacks.onInstallable = callback;
  }

  onInstalled(callback: () => void) {
    this.callbacks.onInstalled = callback;
  }

  onOffline(callback: () => void) {
    this.callbacks.onOffline = callback;
  }

  onOnline(callback: () => void) {
    this.callbacks.onOnline = callback;
  }

  /**
   * Get PWA display mode
   */
  getDisplayMode(): string {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return 'standalone';
    }
    if (window.matchMedia('(display-mode: minimal-ui)').matches) {
      return 'minimal-ui';
    }
    if (window.matchMedia('(display-mode: fullscreen)').matches) {
      return 'fullscreen';
    }
    return 'browser';
  }

  /**
   * Check if device supports PWA installation
   */
  isPWASupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  /**
   * Get installation instructions based on browser/platform
   */
  getInstallInstructions(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      return 'Tap the menu (⋮) and select "Install app" or "Add to Home screen"';
    }
    
    if (userAgent.includes('firefox')) {
      return 'Tap the menu (⋮) and select "Install" or "Add to Home screen"';
    }
    
    if (userAgent.includes('safari') && userAgent.includes('mobile')) {
      return 'Tap the Share button (□↗) and select "Add to Home Screen"';
    }
    
    if (userAgent.includes('edg')) {
      return 'Click the menu (⋯) and select "Apps" > "Install this site as an app"';
    }
    
    return 'Look for an "Install" or "Add to Home Screen" option in your browser menu';
  }
}

// Create singleton instance
export const pwaManager = new PWAManager();

// Utility functions
export const isPWAInstalled = () => pwaManager.getInstallationStatus();
export const canInstallPWA = () => pwaManager.canInstall();
export const installPWA = () => pwaManager.showInstallPrompt();
export const isOnline = () => pwaManager.getOnlineStatus();
export const getPWADisplayMode = () => pwaManager.getDisplayMode();
export const isPWASupported = () => pwaManager.isPWASupported();
export const getInstallInstructions = () => pwaManager.getInstallInstructions();

// React hook for PWA status
export const usePWA = () => {
  const [installable, setInstallable] = React.useState(canInstallPWA());
  const [installed, setInstalled] = React.useState(isPWAInstalled());
  const [online, setOnline] = React.useState(isOnline());

  React.useEffect(() => {
    pwaManager.onInstallable(() => setInstallable(true));
    pwaManager.onInstalled(() => {
      setInstalled(true);
      setInstallable(false);
    });
    pwaManager.onOnline(() => setOnline(true));
    pwaManager.onOffline(() => setOnline(false));
  }, []);

  return {
    installable,
    installed,
    online,
    displayMode: getPWADisplayMode(),
    canInstall: canInstallPWA,
    install: installPWA,
    getInstructions: getInstallInstructions,
    isSupported: isPWASupported(),
  };
};

// Import React for the hook
import React from 'react';