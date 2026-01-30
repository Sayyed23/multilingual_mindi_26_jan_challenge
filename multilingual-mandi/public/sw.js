// Multilingual Mandi Service Worker
// Implements offline-first PWA functionality with strategic caching

const CACHE_NAME = 'multilingual-mandi-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const API_CACHE = 'api-v1';

// Static assets to cache (App Shell Architecture)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Vite builds will add hashed assets, we'll cache them dynamically
];

// API endpoints that should use network-first strategy
const NETWORK_FIRST_PATTERNS = [
  /\/api\/prices/,
  /\/api\/negotiations/,
  /\/api\/messages/,
  /\/api\/market-data/
];

// API endpoints that should use stale-while-revalidate
const STALE_WHILE_REVALIDATE_PATTERNS = [
  /\/api\/users/,
  /\/api\/profiles/,
  /\/api\/transactions/,
  /\/api\/history/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches that don't match current version
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Handle different types of requests with appropriate strategies
  if (isStaticAsset(request)) {
    // Cache-First Strategy for static assets
    event.respondWith(cacheFirstStrategy(request));
  } else if (isNetworkFirstAPI(request)) {
    // Network-First Strategy for real-time data
    event.respondWith(networkFirstStrategy(request));
  } else if (isStaleWhileRevalidateAPI(request)) {
    // Stale-While-Revalidate for user data
    event.respondWith(staleWhileRevalidateStrategy(request));
  } else {
    // Default: Cache-First for other requests
    event.respondWith(cacheFirstStrategy(request));
  }
});

// Cache-First Strategy: Check cache first, fallback to network
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Cache hit:', request.url);
      return cachedResponse;
    }
    
    console.log('[SW] Cache miss, fetching from network:', request.url);
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first strategy failed:', error);
    
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/');
      return offlinePage || new Response('Offline', { status: 503 });
    }
    
    return new Response('Network error', { status: 503 });
  }
}

// Network-First Strategy: Try network first, fallback to cache
async function networkFirstStrategy(request) {
  try {
    console.log('[SW] Network-first request:', request.url);
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Serving from cache:', request.url);
      return cachedResponse;
    }
    
    console.error('[SW] Network-first strategy failed:', error);
    return new Response(JSON.stringify({ 
      error: 'Offline', 
      message: 'Data not available offline' 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Stale-While-Revalidate Strategy: Serve from cache, update in background
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(API_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in background to update cache
  const networkResponsePromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.log('[SW] Background fetch failed:', error);
    });
  
  // Return cached response immediately if available
  if (cachedResponse) {
    console.log('[SW] Serving stale content:', request.url);
    return cachedResponse;
  }
  
  // If no cache, wait for network response
  console.log('[SW] No cache, waiting for network:', request.url);
  try {
    return await networkResponsePromise;
  } catch (error) {
    console.error('[SW] Stale-while-revalidate failed:', error);
    return new Response(JSON.stringify({ 
      error: 'Offline', 
      message: 'Data not available' 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Helper functions to determine request types
function isStaticAsset(request) {
  const url = new URL(request.url);
  
  // Static file extensions
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2'];
  const hasStaticExtension = staticExtensions.some(ext => url.pathname.endsWith(ext));
  
  // Static paths
  const staticPaths = ['/manifest.json', '/robots.txt', '/browserconfig.xml'];
  const isStaticPath = staticPaths.includes(url.pathname);
  
  // Root path or index.html
  const isRootOrIndex = url.pathname === '/' || url.pathname === '/index.html';
  
  return hasStaticExtension || isStaticPath || isRootOrIndex;
}

function isNetworkFirstAPI(request) {
  const url = new URL(request.url);
  return NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname));
}

function isStaleWhileRevalidateAPI(request) {
  const url = new URL(request.url);
  return STALE_WHILE_REVALIDATE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// Background Sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-messages') {
    event.waitUntil(syncOfflineMessages());
  } else if (event.tag === 'background-sync-transactions') {
    event.waitUntil(syncOfflineTransactions());
  }
});

// Sync offline messages when connection is restored
async function syncOfflineMessages() {
  try {
    console.log('[SW] Syncing offline messages...');
    
    // Get offline messages from IndexedDB (would be implemented with actual DB)
    const offlineMessages = await getOfflineMessages();
    
    for (const message of offlineMessages) {
      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message)
        });
        
        if (response.ok) {
          await removeOfflineMessage(message.id);
          console.log('[SW] Synced message:', message.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync message:', message.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Sync offline transactions when connection is restored
async function syncOfflineTransactions() {
  try {
    console.log('[SW] Syncing offline transactions...');
    
    // Get offline transactions from IndexedDB (would be implemented with actual DB)
    const offlineTransactions = await getOfflineTransactions();
    
    for (const transaction of offlineTransactions) {
      try {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transaction)
        });
        
        if (response.ok) {
          await removeOfflineTransaction(transaction.id);
          console.log('[SW] Synced transaction:', transaction.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync transaction:', transaction.id, error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Placeholder functions for IndexedDB operations
// These would be implemented with actual IndexedDB operations
async function getOfflineMessages() {
  // TODO: Implement IndexedDB query for offline messages
  return [];
}

async function removeOfflineMessage(messageId) {
  // TODO: Implement IndexedDB deletion for synced message
  console.log('[SW] Would remove offline message:', messageId);
}

async function getOfflineTransactions() {
  // TODO: Implement IndexedDB query for offline transactions
  return [];
}

async function removeOfflineTransaction(transactionId) {
  // TODO: Implement IndexedDB deletion for synced transaction
  console.log('[SW] Would remove offline transaction:', transactionId);
}

// Handle push notifications (for future implementation)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: data.data,
      actions: [
        {
          action: 'view',
          title: 'View',
          icon: '/icons/action-view.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/action-dismiss.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'view') {
    // Open the app to the relevant page
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

console.log('[SW] Service worker script loaded');