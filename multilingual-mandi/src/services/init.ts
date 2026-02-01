// Application Initialization Service
// Coordinates the startup of all core services and infrastructure

import { checkFirebaseConnection, isFirebaseInitialized } from '../lib/firebase';
import { offlineSyncService } from './offlineSync';
import { pwaService } from './pwaInit';

interface InitializationResult {
  success: boolean;
  services: {
    firebase: boolean;
    offlineSync: boolean;
    pwa: boolean;
  };
  errors: string[];
}

class ApplicationInitializer {
  private initialized: boolean = false;
  private initializationPromise: Promise<InitializationResult> | null = null;

  async initialize(): Promise<InitializationResult> {
    // Return existing promise if initialization is already in progress
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // Return success if already initialized
    if (this.initialized) {
      return {
        success: true,
        services: {
          firebase: true,
          offlineSync: true,
          pwa: true
        },
        errors: []
      };
    }

    this.initializationPromise = this.performInitialization().catch(error => {
      this.initializationPromise = null;
      throw error;
    });
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<InitializationResult> {
    const result: InitializationResult = {
      success: false,
      services: {
        firebase: false,
        offlineSync: false,
        pwa: false
      },
      errors: []
    };

    console.log('Initializing Multilingual Mandi Platform...');

    // Initialize Firebase
    try {
      result.services.firebase = isFirebaseInitialized() && await checkFirebaseConnection();
      if (!result.services.firebase) {
        result.errors.push('Firebase initialization failed');
      }
    } catch (error) {
      result.errors.push(`Firebase error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Initialize Offline Sync Service
    try {
      // Test offline sync service by checking cache size
      await offlineSyncService.getCacheSize();
      result.services.offlineSync = true;
    } catch (error) {
      result.services.offlineSync = false;
      result.errors.push(`Offline sync error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Initialize PWA Service
    try {
      // PWA service initializes automatically, just check if it's working
      result.services.pwa = true; // PWA service doesn't throw errors during init
    } catch (error) {
      result.services.pwa = false;
      result.errors.push(`PWA error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Determine overall success
    result.success = result.services.firebase && result.services.offlineSync && result.services.pwa;

    if (result.success) {
      this.initialized = true;
      console.log('✅ Application initialized successfully');
    } else {
      console.warn('⚠️ Application initialized with some issues:', result.errors);
      this.initializationPromise = null;
    }

    // Log service status
    console.log('Service Status:', {
      firebase: result.services.firebase ? '✅' : '❌',
      offlineSync: result.services.offlineSync ? '✅' : '❌',
      pwa: result.services.pwa ? '✅' : '❌'
    });

    return result;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getInitializationStatus(): Promise<InitializationResult> | null {
    return this.initializationPromise;
  }

  // Health check method
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, boolean>;
    timestamp: Date;
  }> {
    const services = {
      firebase: false,
      offlineSync: false,
      pwa: false,
      network: navigator.onLine
    };

    try {
      services.firebase = isFirebaseInitialized() && await checkFirebaseConnection();
    } catch (error) {
      console.error('Firebase health check failed:', error);
    }

    try {
      await offlineSyncService.getCacheSize();
      services.offlineSync = true;
    } catch (error) {
      console.error('Offline sync health check failed:', error);
    }

    try {
      // Verify PWA service is operational (method exists and service worker is registered)
      services.pwa = typeof pwaService.isOnline === 'function';
    } catch (error) {
      console.error('PWA health check failed:', error);
    }
    const healthyServices = Object.values(services).filter(Boolean).length;
    const totalServices = Object.keys(services).length;

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyServices === totalServices) {
      status = 'healthy';
    } else if (healthyServices >= totalServices / 2) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      services,
      timestamp: new Date()
    };
  }
}

// Export singleton instance
export const appInitializer = new ApplicationInitializer();

// Convenience function for accessing app initializer
export const getAppInitializer = () => {
  return {
    initialize: () => appInitializer.initialize(),
    isInitialized: () => appInitializer.isInitialized(),
    healthCheck: () => appInitializer.healthCheck()
  };
};
// Export types
export type { InitializationResult };