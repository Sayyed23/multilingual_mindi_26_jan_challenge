// Service Worker Test Utilities
// Functions to verify service worker functionality

export interface ServiceWorkerTestResult {
  isSupported: boolean;
  isRegistered: boolean;
  registrationScope: string | null;
  cacheNames: string[];
  error?: string;
}

/**
 * Test service worker registration and basic functionality
 */
export async function testServiceWorker(): Promise<ServiceWorkerTestResult> {
  const result: ServiceWorkerTestResult = {
    isSupported: false,
    isRegistered: false,
    registrationScope: null,
    cacheNames: []
  };

  try {
    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      result.error = 'Service Workers not supported in this browser';
      return result;
    }
    
    result.isSupported = true;

    // Check if service worker is registered
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      result.isRegistered = true;
      result.registrationScope = registration.scope;
    }

    // Check cache API
    if ('caches' in window) {
      result.cacheNames = await caches.keys();
    }

    return result;
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Unknown error';
    return result;
  }
}

/**
 * Test cache functionality
 */
export async function testCacheOperations(): Promise<{
  canCache: boolean;
  canRetrieve: boolean;
  error?: string;
}> {
  const testCacheName = 'sw-test-cache';
  const testUrl = '/test-cache-entry';
  const testResponse = new Response('Test cache content', {
    headers: { 'Content-Type': 'text/plain' }
  });

  try {
    if (!('caches' in window)) {
      return { canCache: false, canRetrieve: false, error: 'Cache API not supported' };
    }

    // Test caching
    const cache = await caches.open(testCacheName);
    await cache.put(testUrl, testResponse.clone());

    // Test retrieval
    const cachedResponse = await cache.match(testUrl);
    const canRetrieve = cachedResponse !== undefined;

    // Cleanup
    await caches.delete(testCacheName);

    return { canCache: true, canRetrieve };
  } catch (error) {
    return {
      canCache: false,
      canRetrieve: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test offline detection
 */
export function testOfflineDetection(): {
  navigatorOnline: boolean;
  hasOnlineEvents: boolean;
} {
  return {
    navigatorOnline: navigator.onLine,
    hasOnlineEvents: 'onLine' in navigator && typeof window.addEventListener === 'function'
  };
}

/**
 * Simulate offline mode for testing
 */
export function simulateOffline(): void {
  // This is a mock - in real testing, use browser dev tools
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: false
  });
  
  window.dispatchEvent(new Event('offline'));
  console.log('Simulated offline mode (for testing only)');
}

/**
 * Simulate online mode for testing
 */
export function simulateOnline(): void {
  // This is a mock - in real testing, use browser dev tools
  Object.defineProperty(navigator, 'onLine', {
    writable: true,
    value: true
  });
  
  window.dispatchEvent(new Event('online'));
  console.log('Simulated online mode (for testing only)');
}

/**
 * Run comprehensive service worker tests
 */
export async function runServiceWorkerTests(): Promise<{
  serviceWorker: ServiceWorkerTestResult;
  cache: Awaited<ReturnType<typeof testCacheOperations>>;
  offline: ReturnType<typeof testOfflineDetection>;
  summary: string;
}> {
  console.log('Running Service Worker tests...');

  const serviceWorker = await testServiceWorker();
  const cache = await testCacheOperations();
  const offline = testOfflineDetection();

  let summary = 'Service Worker Test Results:\n';
  summary += `✓ Browser Support: ${serviceWorker.isSupported ? 'Yes' : 'No'}\n`;
  summary += `✓ Registration: ${serviceWorker.isRegistered ? 'Yes' : 'No'}\n`;
  summary += `✓ Cache API: ${cache.canCache ? 'Working' : 'Failed'}\n`;
  summary += `✓ Offline Detection: ${offline.hasOnlineEvents ? 'Working' : 'Limited'}\n`;
  summary += `✓ Current Status: ${offline.navigatorOnline ? 'Online' : 'Offline'}\n`;

  if (serviceWorker.error) {
    summary += `⚠ Error: ${serviceWorker.error}\n`;
  }

  console.log(summary);

  return { serviceWorker, cache, offline, summary };
}

// Auto-run tests in development
if (process.env.NODE_ENV === 'development') {
  // Run tests after a short delay to allow service worker registration
  setTimeout(() => {
    runServiceWorkerTests();
  }, 2000);
}