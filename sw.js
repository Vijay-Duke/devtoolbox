// Service Worker for offline support and caching
const CACHE_NAME = 'devtoolbox-v1';
const STATIC_CACHE = 'devtoolbox-static-v1';
const DYNAMIC_CACHE = 'devtoolbox-dynamic-v1';

// Core files to cache for offline use
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/base.css',
  '/css/tools.css',
  '/js/theme.js',
  '/js/app.js',
  '/js/router-lazy.js',
  '/js/fuzzy-search.js',
  '/js/swipe.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName.startsWith('devtoolbox-') && 
                   cacheName !== STATIC_CACHE && 
                   cacheName !== DYNAMIC_CACHE;
          })
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip external requests
  if (url.origin !== location.origin) return;
  
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return cached response if found
      if (cachedResponse) {
        // Update cache in background for dynamic content
        if (url.pathname.startsWith('/js/tools/')) {
          fetchAndCache(request, DYNAMIC_CACHE);
        }
        return cachedResponse;
      }
      
      // For tool modules, cache them dynamically
      if (url.pathname.startsWith('/js/tools/')) {
        return fetchAndCache(request, DYNAMIC_CACHE);
      }
      
      // Default network request
      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200) {
          return response;
        }
        
        // Cache successful responses for offline use
        const responseToCache = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });
        
        return response;
      }).catch(() => {
        // Offline fallback for HTML pages
        if (request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// Helper function to fetch and cache
async function fetchAndCache(request, cacheName) {
  try {
    const response = await fetch(request);
    
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Try to return from cache if fetch fails
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      })
    );
  }
});