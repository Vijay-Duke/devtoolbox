// Service Worker for offline support and caching  
const STATIC_CACHE = 'devtoolbox-static-v4';
const DYNAMIC_CACHE = 'devtoolbox-dynamic-v4';
const TOOLS_CACHE = 'devtoolbox-tools-v4';

// Core files to cache for offline use
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/theme.js',
  '/js/app.js',
  '/js/router-lazy.js',
  '/js/fuzzy-search.js',
  '/js/swipe.js'
];

// Popular tools to pre-cache for instant loading
const POPULAR_TOOLS = [
  '/js/tools/json-formatter.js',
  '/js/tools/jwt-decoder.js',
  '/js/tools/base64.js',
  '/js/tools/url-encode.js',
  '/js/tools/uuid-generator.js',
  '/js/tools/hash-generator.js',
  '/js/tools/password-generator.js',
  '/js/tools/diff-tool.js'
];

// Install event - cache static assets and popular tools
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Pre-cache popular tools
      caches.open(TOOLS_CACHE).then((cache) => {
        console.log('[Service Worker] Pre-caching popular tools');
        return cache.addAll(POPULAR_TOOLS);
      })
    ])
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
                   cacheName !== DYNAMIC_CACHE &&
                   cacheName !== TOOLS_CACHE;
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
  
  // Tool modules - use stale-while-revalidate strategy
  if (url.pathname.startsWith('/js/tools/')) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  
  // CSS files - use stale-while-revalidate to ensure updates
  if (url.pathname.endsWith('.css')) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  
  // Other static assets - cache first strategy
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Default strategy for other requests
  event.respondWith(networkFirst(request));
});

// Cache first strategy for static assets
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return cachedResponse || new Response('Network error', { status: 503 });
  }
}

// Stale-while-revalidate strategy for tools
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  // Always try to update cache in background
  const fetchPromise = fetch(request).then((response) => {
    if (response && response.status === 200) {
      let cacheName;
      if (request.url.endsWith('.css')) {
        cacheName = STATIC_CACHE;
      } else if (isPopularTool(request.url)) {
        cacheName = TOOLS_CACHE;
      } else {
        cacheName = DYNAMIC_CACHE;
      }
      caches.open(cacheName).then((cache) => {
        cache.put(request, response.clone());
      });
    }
    return response;
  }).catch(() => null);
  
  // Return cached version immediately if available
  if (cachedResponse) {
    // Update cache in background
    fetchPromise;
    return cachedResponse;
  }
  
  // If no cache, wait for network
  return fetchPromise || new Response('Tool not available offline', { status: 503 });
}

// Network first strategy for dynamic content
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Offline fallback for HTML pages
    if (request.destination === 'document') {
      return caches.match('/index.html');
    }
    
    throw error;
  }
}

// Helper functions
function isStaticAsset(pathname) {
  return (pathname.endsWith('.js') && !pathname.startsWith('/js/tools/')) ||
         pathname === '/' || 
         pathname === '/index.html';
}

function isPopularTool(url) {
  return POPULAR_TOOLS.some(tool => url.includes(tool));
}

// Cache management utilities
async function clearOldToolCache() {
  const cacheNames = await caches.keys();
  const oldToolCaches = cacheNames.filter(name => 
    name.startsWith('devtoolbox-dynamic-') && name !== DYNAMIC_CACHE
  );
  
  return Promise.all(oldToolCaches.map(cacheName => caches.delete(cacheName)));
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
  
  if (event.data && event.data.type === 'CLEAR_OLD_TOOLS') {
    event.waitUntil(clearOldToolCache());
  }
});