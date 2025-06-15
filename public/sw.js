
const CACHE_NAME = 'hisaabdost-v1';
const STATIC_CACHE_NAME = 'hisaabdost-static-v1';
const API_CACHE_NAME = 'hisaabdost-api-v1';

// Static resources to cache
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  // Add other static assets as needed
];

// API endpoints to cache
const CACHEABLE_API_PATTERNS = [
  /\/rest\/v1\/expenses/,
  /\/rest\/v1\/budgets/,
  /\/rest\/v1\/profiles/,
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_RESOURCES);
      }),
      caches.open(API_CACHE_NAME),
      caches.open(CACHE_NAME)
    ]).then(() => {
      console.log('Service Worker installed successfully');
      self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== STATIC_CACHE_NAME &&
            cacheName !== API_CACHE_NAME
          ) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
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

  // Handle API requests with cache-first strategy for offline support
  if (CACHEABLE_API_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          // Return cached response if available
          if (cachedResponse) {
            // Try to update cache in background
            fetch(request).then((response) => {
              if (response.ok) {
                cache.put(request, response.clone());
              }
            }).catch(() => {
              // Network failed, but we have cached data
            });
            return cachedResponse;
          }

          // Try network first for fresh data
          return fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          }).catch(() => {
            // Network failed and no cache available
            return new Response(
              JSON.stringify({ error: 'Offline - data not available' }),
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        });
      })
    );
    return;
  }

  // Handle static resources with cache-first strategy
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
  }
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'expense-sync') {
    event.waitUntil(syncExpenses());
  } else if (event.tag === 'budget-sync') {
    event.waitUntil(syncBudgets());
  }
});

// Sync offline expenses when back online
async function syncExpenses() {
  try {
    const offlineData = await getOfflineData('pending-expenses');
    if (offlineData && offlineData.length > 0) {
      console.log('Syncing offline expenses:', offlineData.length);
      // Implement sync logic here
      await clearOfflineData('pending-expenses');
    }
  } catch (error) {
    console.error('Error syncing expenses:', error);
  }
}

// Sync offline budgets when back online
async function syncBudgets() {
  try {
    const offlineData = await getOfflineData('pending-budgets');
    if (offlineData && offlineData.length > 0) {
      console.log('Syncing offline budgets:', offlineData.length);
      // Implement sync logic here
      await clearOfflineData('pending-budgets');
    }
  } catch (error) {
    console.error('Error syncing budgets:', error);
  }
}

// Helper functions for IndexedDB operations
async function getOfflineData(key) {
  return new Promise((resolve) => {
    const request = indexedDB.open('hisaabdost-offline', 1);
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['offline-data'], 'readonly');
      const store = transaction.objectStore('offline-data');
      const getRequest = store.get(key);
      
      getRequest.onsuccess = () => {
        resolve(getRequest.result?.data || []);
      };
      getRequest.onerror = () => resolve([]);
    };
    request.onerror = () => resolve([]);
  });
}

async function clearOfflineData(key) {
  return new Promise((resolve) => {
    const request = indexedDB.open('hisaabdost-offline', 1);
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['offline-data'], 'readwrite');
      const store = transaction.objectStore('offline-data');
      store.delete(key);
      transaction.oncomplete = () => resolve();
    };
    request.onerror = () => resolve();
  });
}
