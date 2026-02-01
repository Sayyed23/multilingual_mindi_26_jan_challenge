// Service Worker for Multilingual Mandi Platform
// Provides offline functionality, background sync, and push notifications

// Workbox manifest injection point
self.__WB_MANIFEST;

const CACHE_VERSION = '1.0.0';
const CACHE_NAME = `mandi-v${CACHE_VERSION}`;
const STATIC_CACHE = `mandi-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE = `mandi-dynamic-v${CACHE_VERSION}`;
const API_CACHE = `mandi-api-v${CACHE_VERSION}`;
const PRICES_CACHE = `mandi-prices-v${CACHE_VERSION}`;
const DEALS_CACHE = `mandi-deals-v${CACHE_VERSION}`;
const MESSAGES_CACHE = `mandi-messages-v${CACHE_VERSION}`;
const USERS_CACHE = `mandi-users-v${CACHE_VERSION}`;
const NOTIFICATIONS_CACHE = `mandi-notifications-v${CACHE_VERSION}`;

// Cache size limits (in bytes)
const CACHE_LIMITS = {
  [STATIC_CACHE]: 100 * 1024 * 1024, // 100MB
  [PRICES_CACHE]: 50 * 1024 * 1024,  // 50MB
  [DEALS_CACHE]: 20 * 1024 * 1024,   // 20MB
  [MESSAGES_CACHE]: 30 * 1024 * 1024, // 30MB
  [USERS_CACHE]: 10 * 1024 * 1024,   // 10MB
  [NOTIFICATIONS_CACHE]: 5 * 1024 * 1024, // 5MB
  [DYNAMIC_CACHE]: 25 * 1024 * 1024, // 25MB
  [API_CACHE]: 15 * 1024 * 1024      // 15MB
};

// Cache TTL (Time To Live) in milliseconds
const CACHE_TTL = {
  [STATIC_CACHE]: 24 * 60 * 60 * 1000,    // 24 hours
  [PRICES_CACHE]: 5 * 60 * 1000,          // 5 minutes
  [DEALS_CACHE]: 10 * 60 * 1000,          // 10 minutes
  [MESSAGES_CACHE]: 60 * 60 * 1000,       // 1 hour
  [USERS_CACHE]: 30 * 60 * 1000,          // 30 minutes
  [NOTIFICATIONS_CACHE]: 15 * 60 * 1000,  // 15 minutes
  [DYNAMIC_CACHE]: 60 * 60 * 1000,        // 1 hour
  [API_CACHE]: 60 * 60 * 1000             // 1 hour
};

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/badge-72x72.png'
];

// API endpoints to cache with specific strategies
const API_ENDPOINTS = {
  prices: ['/api/prices', '/api/commodities', '/api/mandis'],
  deals: ['/api/deals', '/api/negotiations'],
  messages: ['/api/messages', '/api/conversations'],
  users: ['/api/users', '/api/profiles'],
  notifications: ['/api/notifications', '/api/alerts']
};

// Storage quota management
const STORAGE_QUOTA_THRESHOLD = 0.8; // 80% of available storage
let storageQuota = 0;
let storageUsage = 0;

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      initializeStorageQuota()
    ])
      .then(() => {
        console.log('Service Worker: Static assets cached and storage initialized');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// Initialize storage quota monitoring
async function initializeStorageQuota() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      storageQuota = estimate.quota || 0;
      storageUsage = estimate.usage || 0;
      console.log(`Storage: ${storageUsage}/${storageQuota} bytes (${Math.round((storageUsage/storageQuota)*100)}%)`);
    } catch (error) {
      console.error('Failed to estimate storage:', error);
    }
  }
}

// Activate event - clean up old caches and initialize intelligent cache management
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    Promise.all([
      cleanupOldCaches(),
      initializeCacheManagement(),
      initializeStorageQuota()
    ])
      .then(() => {
        console.log('Service Worker: Activated with intelligent cache management');
        return self.clients.claim();
      })
  );
});

async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const validCaches = [
    STATIC_CACHE, DYNAMIC_CACHE, API_CACHE, PRICES_CACHE,
    DEALS_CACHE, MESSAGES_CACHE, USERS_CACHE, NOTIFICATIONS_CACHE
  ];
  
  return Promise.all(
    cacheNames.map((cacheName) => {
      if (!validCaches.includes(cacheName)) {
        console.log('Service Worker: Deleting old cache', cacheName);
        return caches.delete(cacheName);
      }
    })
  );
}

async function initializeCacheManagement() {
  // Start periodic cache cleanup
  setInterval(performIntelligentCleanup, 5 * 60 * 1000); // Every 5 minutes
  
  // Monitor storage usage
  setInterval(monitorStorageUsage, 60 * 1000); // Every minute
}

// Fetch event - implement intelligent caching strategies
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
  } else if (isPriceAPIRequest(request)) {
    event.respondWith(networkFirstWithFallback(request, PRICES_CACHE));
  } else if (isDealsAPIRequest(request)) {
    event.respondWith(networkFirstWithFallback(request, DEALS_CACHE));
  } else if (isMessagesAPIRequest(request)) {
    event.respondWith(networkFirstWithFallback(request, MESSAGES_CACHE));
  } else if (isUsersAPIRequest(request)) {
    event.respondWith(networkFirstWithFallback(request, USERS_CACHE));
  } else if (isNotificationsAPIRequest(request)) {
    event.respondWith(networkFirstWithFallback(request, NOTIFICATIONS_CACHE));
  } else if (isAPIRequest(request)) {
    event.respondWith(networkFirstWithFallback(request, API_CACHE));
  } else if (isNavigationRequest(request)) {
    event.respondWith(networkFirstWithOfflineFallback(request));
  } else {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
  }
});

// Background sync for offline actions with intelligent queuing
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);

  switch (event.tag) {
    case 'offline-actions-sync':
      event.waitUntil(syncOfflineActions());
      break;
    case 'price-data-sync':
      event.waitUntil(syncPriceData());
      break;
    case 'deals-sync':
      event.waitUntil(syncDealsData());
      break;
    case 'messages-sync':
      event.waitUntil(syncMessagesData());
      break;
    case 'cache-cleanup':
      event.waitUntil(performIntelligentCleanup());
      break;
    default:
      console.log('Unknown sync tag:', event.tag);
  }
});

// Enhanced push notification handling with action support
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
    actions: data.actions || getDefaultActions(data.type),
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    vibrate: data.vibrate || [200, 100, 200],
    timestamp: Date.now()
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

function getDefaultActions(notificationType) {
  switch (notificationType) {
    case 'price-alert':
      return [
        { action: 'view-price', title: 'View Prices', icon: '/icons/shortcut-prices.png' },
        { action: 'dismiss', title: 'Dismiss' }
      ];
    case 'deal-update':
      return [
        { action: 'view-deal', title: 'View Deal', icon: '/icons/shortcut-deals.png' },
        { action: 'dismiss', title: 'Dismiss' }
      ];
    case 'message':
      return [
        { action: 'open-chat', title: 'Reply', icon: '/icons/shortcut-messages.png' },
        { action: 'dismiss', title: 'Dismiss' }
      ];
    default:
      return [
        { action: 'open-app', title: 'Open App' },
        { action: 'dismiss', title: 'Dismiss' }
      ];
  }
}
// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.notification.tag);

  event.notification.close();

  const clickAction = event.action;
  const notificationData = event.notification.data || {};

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
  } event.waitUntil(
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

// Enhanced Caching Strategies with TTL support

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
      const responseToCache = networkResponse.clone();
      // Add timestamp header for TTL management
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-time', Date.now().toString());
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      cache.put(request, modifiedResponse);
    }

    return networkResponse;
  } catch (error) {
    console.error('Cache First strategy failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network First with Fallback - for API requests with intelligent caching
async function networkFirstWithFallback(request, cacheName) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      const responseToCache = networkResponse.clone();
      
      // Add timestamp header for TTL management
      const headers = new Headers(responseToCache.headers);
      headers.set('sw-cached-time', Date.now().toString());
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      });
      
      // Check cache size before adding
      if (await shouldCacheResponse(cacheName, modifiedResponse)) {
        cache.put(request, modifiedResponse);
      }
      
      return networkResponse;
    }

    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Network failed, trying cache:', error);

    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      // Check if cached response is still valid
      const cachedTime = cachedResponse.headers.get('sw-cached-time');
      const ttl = CACHE_TTL[cacheName] || 60 * 60 * 1000;
      
      if (cachedTime && (Date.now() - parseInt(cachedTime)) < ttl) {
        return cachedResponse;
      } else {
        // Remove expired entry
        cache.delete(request);
      }
    }

    // Return offline fallback for API requests
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'This data is not available offline',
      cached: false,
      timestamp: new Date().toISOString()
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function shouldCacheResponse(cacheName, response) {
  const limit = CACHE_LIMITS[cacheName];
  if (!limit) return true;
  
  const responseSize = await getResponseSize(response);
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  let currentSize = 0;
  for (const key of keys) {
    const cachedResponse = await cache.match(key);
    if (cachedResponse) {
      currentSize += await getResponseSize(cachedResponse);
    }
  }
  
  return (currentSize + responseSize) <= limit;
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
// Intelligent Cache Management Functions

async function performIntelligentCleanup() {
  console.log('Service Worker: Performing intelligent cache cleanup...');
  
  try {
    // Update storage usage
    await initializeStorageQuota();
    
    // Check if emergency cleanup is needed
    if (storageQuota > 0 && (storageUsage / storageQuota) > STORAGE_QUOTA_THRESHOLD) {
      await performEmergencyCleanup();
      return;
    }
    
    // Regular cleanup for each cache
    const cacheNames = [PRICES_CACHE, DEALS_CACHE, MESSAGES_CACHE, USERS_CACHE, NOTIFICATIONS_CACHE, DYNAMIC_CACHE];
    
    for (const cacheName of cacheNames) {
      await cleanupExpiredEntries(cacheName);
      await enforceCacheSizeLimit(cacheName);
    }
    
    console.log('Service Worker: Intelligent cleanup completed');
  } catch (error) {
    console.error('Service Worker: Intelligent cleanup failed:', error);
  }
}

async function performEmergencyCleanup() {
  console.log('Service Worker: Performing emergency cleanup...');
  
  // Priority order: low priority caches first
  const cleanupOrder = [
    NOTIFICATIONS_CACHE,
    DYNAMIC_CACHE,
    USERS_CACHE,
    MESSAGES_CACHE,
    DEALS_CACHE,
    PRICES_CACHE
  ];
  
  for (const cacheName of cleanupOrder) {
    await aggressiveCleanup(cacheName);
    
    // Check if we've freed enough space
    await initializeStorageQuota();
    if (storageQuota > 0 && (storageUsage / storageQuota) < STORAGE_QUOTA_THRESHOLD) {
      break;
    }
  }
}

async function cleanupExpiredEntries(cacheName) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  const ttl = CACHE_TTL[cacheName] || 60 * 60 * 1000; // Default 1 hour
  const now = Date.now();
  
  for (const request of keys) {
    const response = await cache.match(request);
    if (response) {
      const cachedTime = response.headers.get('sw-cached-time');
      if (cachedTime && (now - parseInt(cachedTime)) > ttl) {
        await cache.delete(request);
      }
    }
  }
}

async function enforceCacheSizeLimit(cacheName) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  const limit = CACHE_LIMITS[cacheName];
  
  if (!limit) return;
  
  let totalSize = 0;
  const entries = [];
  
  for (const request of keys) {
    const response = await cache.match(request);
    if (response) {
      const size = await getResponseSize(response);
      const cachedTime = response.headers.get('sw-cached-time') || Date.now().toString();
      entries.push({ request, size, cachedTime: parseInt(cachedTime) });
      totalSize += size;
    }
  }
  
  if (totalSize > limit) {
    // Sort by oldest first (LRU)
    entries.sort((a, b) => a.cachedTime - b.cachedTime);
    
    // Remove oldest entries until under limit
    for (const entry of entries) {
      if (totalSize <= limit) break;
      await cache.delete(entry.request);
      totalSize -= entry.size;
    }
  }
}

async function aggressiveCleanup(cacheName) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  // Remove 50% of entries
  const removeCount = Math.floor(keys.length * 0.5);
  const keysToRemove = keys.slice(0, removeCount);
  
  await Promise.all(keysToRemove.map(key => cache.delete(key)));
}

async function getResponseSize(response) {
  try {
    const blob = await response.clone().blob();
    return blob.size;
  } catch {
    return 1024; // Default estimate
  }
}

async function monitorStorageUsage() {
  await initializeStorageQuota();
  
  if (storageQuota > 0) {
    const usagePercentage = (storageUsage / storageQuota) * 100;
    
    if (usagePercentage > 90) {
      console.warn(`Storage usage critical: ${usagePercentage.toFixed(1)}%`);
      await performEmergencyCleanup();
    } else if (usagePercentage > 75) {
      console.warn(`Storage usage high: ${usagePercentage.toFixed(1)}%`);
      await performIntelligentCleanup();
    }
  }
}

// Enhanced Helper Functions

function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff|woff2)$/);
}

function isPriceAPIRequest(request) {
  const url = new URL(request.url);
  return API_ENDPOINTS.prices.some(endpoint => url.pathname.startsWith(endpoint));
}

function isDealsAPIRequest(request) {
  const url = new URL(request.url);
  return API_ENDPOINTS.deals.some(endpoint => url.pathname.startsWith(endpoint));
}

function isMessagesAPIRequest(request) {
  const url = new URL(request.url);
  return API_ENDPOINTS.messages.some(endpoint => url.pathname.startsWith(endpoint));
}

function isUsersAPIRequest(request) {
  const url = new URL(request.url);
  return API_ENDPOINTS.users.some(endpoint => url.pathname.startsWith(endpoint));
}

function isNotificationsAPIRequest(request) {
  const url = new URL(request.url);
  return API_ENDPOINTS.notifications.some(endpoint => url.pathname.startsWith(endpoint));
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

// Enhanced Background Sync Functions

async function syncOfflineActions() {
  try {
    console.log('Service Worker: Syncing offline actions...');

    // Notify all clients about sync attempt
    const message = {
      type: 'SYNC_OFFLINE_ACTIONS',
      timestamp: new Date().toISOString(),
      status: 'started'
    };

    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage(message);
    });

    // Simulate sync completion (in real implementation, this would sync with IndexedDB)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Notify completion
    clients.forEach(client => {
      client.postMessage({
        ...message,
        status: 'completed'
      });
    });

    console.log('Service Worker: Offline actions sync completed');
  } catch (error) {
    console.error('Service Worker: Failed to sync offline actions:', error);
    
    // Notify clients of failure
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_OFFLINE_ACTIONS',
        timestamp: new Date().toISOString(),
        status: 'failed',
        error: error.message
      });
    });
    
    throw error;
  }
}

async function syncPriceData() {
  try {
    console.log('Service Worker: Syncing price data...');

    const priceEndpoints = API_ENDPOINTS.prices;
    const cache = await caches.open(PRICES_CACHE);
    let syncedCount = 0;

    for (const endpoint of priceEndpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const headers = new Headers(response.headers);
          headers.set('sw-cached-time', Date.now().toString());
          
          const modifiedResponse = new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: headers
          });
          
          await cache.put(endpoint, modifiedResponse);
          syncedCount++;
        }
      } catch (error) {
        console.log(`Failed to sync ${endpoint}:`, error);
      }
    }

    // Notify clients
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_PRICE_DATA',
        timestamp: new Date().toISOString(),
        syncedCount,
        totalEndpoints: priceEndpoints.length
      });
    });

    console.log(`Service Worker: Price data sync completed (${syncedCount}/${priceEndpoints.length})`);
  } catch (error) {
    console.error('Service Worker: Failed to sync price data:', error);
    throw error;
  }
}

async function syncDealsData() {
  try {
    console.log('Service Worker: Syncing deals data...');
    
    const dealsEndpoints = API_ENDPOINTS.deals;
    const cache = await caches.open(DEALS_CACHE);
    let syncedCount = 0;

    for (const endpoint of dealsEndpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const headers = new Headers(response.headers);
          headers.set('sw-cached-time', Date.now().toString());
          
          const modifiedResponse = new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: headers
          });
          
          await cache.put(endpoint, modifiedResponse);
          syncedCount++;
        }
      } catch (error) {
        console.log(`Failed to sync ${endpoint}:`, error);
      }
    }

    console.log(`Service Worker: Deals data sync completed (${syncedCount}/${dealsEndpoints.length})`);
  } catch (error) {
    console.error('Service Worker: Failed to sync deals data:', error);
    throw error;
  }
}

async function syncMessagesData() {
  try {
    console.log('Service Worker: Syncing messages data...');
    
    const messagesEndpoints = API_ENDPOINTS.messages;
    const cache = await caches.open(MESSAGES_CACHE);
    let syncedCount = 0;

    for (const endpoint of messagesEndpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          const headers = new Headers(response.headers);
          headers.set('sw-cached-time', Date.now().toString());
          
          const modifiedResponse = new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: headers
          });
          
          await cache.put(endpoint, modifiedResponse);
          syncedCount++;
        }
      } catch (error) {
        console.log(`Failed to sync ${endpoint}:`, error);
      }
    }

    console.log(`Service Worker: Messages data sync completed (${syncedCount}/${messagesEndpoints.length})`);
  } catch (error) {
    console.error('Service Worker: Failed to sync messages data:', error);
    throw error;
  }
}

// Enhanced message handling from main thread
self.addEventListener('message', (event) => {
  if (!event || !event.data) return;
  const { type, data } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CACHE_URLS':
      cacheUrls(data.urls, data.cacheName);
      break;
    case 'CLEAR_CACHE':
      clearCache(data.cacheName);
      break;
    case 'GET_CACHE_STATS':
      getCacheStats().then(stats => {
        event.ports[0]?.postMessage(stats);
      });
      break;
    case 'OPTIMIZE_CACHES':
      performIntelligentCleanup();
      break;
    default:
      console.log('Service Worker: Unknown message type:', type);
  }
});

async function cacheUrls(urls, cacheName = DYNAMIC_CACHE) {
  const cache = await caches.open(cacheName);
  return cache.addAll(urls);
}

async function clearCache(cacheName) {
  if (cacheName) {
    return caches.delete(cacheName);
  } else {
    // Clear all dynamic caches
    const cacheNames = await caches.keys();
    const dynamicCaches = cacheNames.filter(name => 
      name.includes('dynamic') || name.includes('api') || name.includes('prices') || 
      name.includes('deals') || name.includes('messages')
    );
    return Promise.all(dynamicCaches.map(name => caches.delete(name)));
  }
}

async function getCacheStats() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  let totalEntries = 0;
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    totalEntries += keys.length;
    
    for (const key of keys) {
      const response = await cache.match(key);
      if (response) {
        totalSize += await getResponseSize(response);
      }
    }
  }
  
  // Get storage estimate
  let storageUsage = 0;
  let storageQuota = 0;
  
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      storageUsage = estimate.usage || 0;
      storageQuota = estimate.quota || 0;
    } catch (error) {
      console.error('Failed to get storage estimate:', error);
    }
  }
  
  return {
    totalCaches: cacheNames.length,
    totalSize,
    totalEntries,
    storageUsage,
    storageQuota,
    cacheNames
  };
}