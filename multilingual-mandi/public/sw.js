// Service Worker for Multilingual Mandi Platform
// Provides offline functionality, background sync, and push notifications

const CACHE_NAME = 'mandi-v1';
const STATIC_CACHE = 'mandi-static-v1';
const DYNAMIC_CACHE = 'mandi-dynamic-v1';
const API_CACHE = 'mandi-api-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/prices',
  '/api/commodities',
  '/api/mandis'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests with appropriate caching strategies
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isAPIRequest(request)) {
    event.respondWith(networkFirstWithFallback(request, API_CACHE));
  } else if (isNavigationRequest(request)) {
    event.respondWith(networkFirstWithOfflineFallback(request));
  } else {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);

  if (event.tag === 'offline-actions-sync') {
    event.waitUntil(syncOfflineActions());
  } else if (event.tag === 'price-data-sync') {
    event.waitUntil(syncPriceData());
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');

  if (!event.data) {
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (error) {
    console.error('Service Worker: Failed to parse push data', error);
    return;
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: data.tag || 'default',
    data: data.data || {},
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.notification.tag);

  event.notification.close();

  const clickAction = event.action;
  const notificationData = event.notification.data;

  let urlToOpen = '/';

  if (clickAction) {
    // Handle specific action clicks
    switch (clickAction) {
      case 'view-deal':
        if (notificationData.dealId) {
          urlToOpen = `/deals/${notificationData.dealId}`;
        }
        break;
      case 'view-price':
        if (notificationData.commodity) {
          urlToOpen = `/prices?commodity=${encodeURIComponent(notificationData.commodity)}`;
        }
        break;
      case 'open-chat':
        if (notificationData.conversationId) {
          urlToOpen = `/messages/${notificationData.conversationId}`;
        }
        break;
    }
  } else if (notificationData.url) {
    urlToOpen = notificationData.url;
  }
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }

        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Caching Strategies

// Cache First - for static assets
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('Cache First strategy failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network First with Fallback - for API requests
async function networkFirstWithFallback(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }

    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Network failed, trying cache:', error);

    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline fallback for API requests
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'This data is not available offline',
      cached: false
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Network First with Offline Fallback - for navigation requests
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }

    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Network failed for navigation, trying cache:', error);

    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page
    const offlineCache = await caches.open(STATIC_CACHE);
    const offlineResponse = await offlineCache.match('/');
    return offlineResponse || new Response('Offline', { status: 503 });
  }
}

// Stale While Revalidate - for dynamic content
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse || new Response('Offline', { status: 503 }));

  return cachedResponse || fetchPromise;
}
// Helper Functions

function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff|woff2)$/);
}

function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') ||
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('firebase.googleapis.com');
}

function isNavigationRequest(request) {
  const acceptHeader = request.headers.get('accept');
  return request.mode === 'navigate' ||
    (request.method === 'GET' && acceptHeader && acceptHeader.includes('text/html'));
}

// Background Sync Functions

async function syncOfflineActions() {
  try {
    console.log('Service Worker: Syncing offline actions...');

    // This would integrate with the IndexedDB offline sync service
    // For now, we'll just log the attempt
    const message = {
      type: 'SYNC_OFFLINE_ACTIONS',
      timestamp: new Date().toISOString()
    };

    // Notify all clients about sync attempt
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage(message);
    });

    console.log('Service Worker: Offline actions sync completed');
  } catch (error) {
    console.error('Service Worker: Failed to sync offline actions:', error);
    throw error;
  }
}

async function syncPriceData() {
  try {
    console.log('Service Worker: Syncing price data...');

    // Fetch latest price data and update cache
    const priceEndpoints = [
      '/api/prices/current',
      '/api/prices/trending',
      '/api/commodities/popular'
    ];

    const cache = await caches.open(API_CACHE);

    for (const endpoint of priceEndpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          await cache.put(endpoint, response.clone());
        }
      } catch (error) {
        console.log(`Failed to sync ${endpoint}:`, error);
      }
    }

    console.log('Service Worker: Price data sync completed');
  } catch (error) {
    console.error('Service Worker: Failed to sync price data:', error);
    throw error;
  }
}

// Message handling from main thread
self.addEventListener('message', (event) => {
  if (!event || !event.data) return;
  const { type, data } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CACHE_URLS':
      cacheUrls(data.urls);
      break;
    case 'CLEAR_CACHE':
      clearCache(data.cacheName);
      break;
    default:
      console.log('Service Worker: Unknown message type:', type);
  }
});

async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);
  return cache.addAll(urls);
}

async function clearCache(cacheName) {
  return caches.delete(cacheName || DYNAMIC_CACHE);
}