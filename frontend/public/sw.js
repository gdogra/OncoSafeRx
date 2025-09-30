// Service Worker for OncoSafeRx PWA - Advanced Workflow & Mobile Support
console.log('OncoSafeRx Advanced Workflow Service Worker initializing...');

const CACHE_NAME = 'oncosaferx-v2.0.0';
const STATIC_CACHE_NAME = 'oncosaferx-static-v2.0.0';
const DYNAMIC_CACHE_NAME = 'oncosaferx-dynamic-v2.0.0';
const WORKFLOW_CACHE_NAME = 'oncosaferx-workflow-v2.0.0';

// Files to cache immediately for mobile/offline support
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/offline.html',
  '/workflow-mobile.html'
];

// API endpoints to cache for offline workflow support
const API_CACHE_PATTERNS = [
  /\/api\/drugs\//,
  /\/api\/interactions\//,
  /\/api\/patients\//,
  /\/api\/advanced-workflow\/templates/,
  /\/api\/advanced-workflow\/instances/,
  /\/api\/rbac\/permissions/
];

// Files that should always be fetched from network
const NETWORK_FIRST_PATTERNS = [
  /\/api\/auth\//,
  /\/api\/real-time\//,
  /\/api\/notifications\//,
  /\/api\/advanced-workflow\/instances\/.*\/complete/,
  /\/api\/advanced-workflow\/instances\/.*\/notes/
];

// Workflow-specific caching
const WORKFLOW_CACHE_PATTERNS = [
  /\/api\/advanced-workflow\/templates/,
  /\/api\/advanced-workflow\/analytics/,
  /\/api\/advanced-workflow\/performance/
];

// Install event - cache static assets and workflow data
self.addEventListener('install', (event) => {
  console.log('Advanced Workflow Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Caching static assets for mobile workflow...');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(WORKFLOW_CACHE_NAME).then((cache) => {
        console.log('Initializing workflow cache...');
        // Pre-cache essential workflow templates
        return cache.add('/api/advanced-workflow/templates?category=all&mobileOptimized=true');
      })
    ]).then(() => {
      console.log('Service Worker installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches and initialize workflow sync
self.addEventListener('activate', (event) => {
  console.log('Advanced Workflow Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== WORKFLOW_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Initialize workflow sync database
      initializeWorkflowSyncDB()
    ]).then(() => {
      console.log('Service Worker activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - implement advanced caching strategies for workflows
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip unsupported schemes (chrome-extension, etc.)
  try {
    const url = new URL(request.url);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return;
    }
  } catch (error) {
    return; // Invalid URL
  }

  // Handle different types of requests with appropriate strategies
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request));
  } else if (isApiRequest(request)) {
    if (isWorkflowApiRequest(request)) {
      // Special handling for workflow APIs
      if (isNetworkFirstPattern(request)) {
        event.respondWith(networkFirstWithOfflineQueue(request));
      } else if (isWorkflowCacheableRequest(request)) {
        event.respondWith(workflowStaleWhileRevalidate(request));
      } else {
        event.respondWith(networkOnlyWithOfflineQueue(request));
      }
    } else if (isNetworkFirstPattern(request)) {
      event.respondWith(networkFirst(request));
    } else if (isCacheableApiRequest(request)) {
      event.respondWith(staleWhileRevalidate(request));
    } else {
      event.respondWith(networkOnly(request));
    }
  } else {
    event.respondWith(networkFirst(request));
  }
});

// Background sync for offline workflow actions
self.addEventListener('sync', (event) => {
  console.log('Advanced workflow background sync:', event.tag);
  
  if (event.tag === 'background-sync-interactions') {
    event.waitUntil(syncInteractionChecks());
  } else if (event.tag === 'background-sync-favorites') {
    event.waitUntil(syncFavorites());
  } else if (event.tag === 'background-sync-analytics') {
    event.waitUntil(syncAnalytics());
  } else if (event.tag === 'background-sync-workflow-steps') {
    event.waitUntil(syncWorkflowSteps());
  } else if (event.tag === 'background-sync-workflow-notes') {
    event.waitUntil(syncWorkflowNotes());
  } else if (event.tag === 'background-sync-workflow-instances') {
    event.waitUntil(syncWorkflowInstances());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: data.data,
    actions: data.actions || [],
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const data = event.notification.data;
  let url = '/';
  
  if (data && data.url) {
    url = data.url;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Caching strategies
async function cacheFirst(request) {
  try {
    // Skip caching for unsupported schemes (chrome-extension, etc.)
    const url = new URL(request.url);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return fetch(request);
    }

    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    const response = await fetch(request);
    if (response.status === 200 && response.type !== 'opaque') {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Offline - content not available', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    
    if (response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    
    return new Response('Offline - content not available', { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch((error) => {
    console.error('Fetch failed during stale-while-revalidate:', error);
    return cached || new Response('Offline - content not available', { status: 503 });
  });
  
  return cached || await fetchPromise;
}

async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error('Network only request failed:', error);
    return new Response('Network error', { status: 503 });
  }
}

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/static/') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.ico');
}

function isApiRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/');
}

function isNetworkFirstPattern(request) {
  return NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(request.url));
}

function isCacheableApiRequest(request) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(request.url));
}

// Background sync functions
async function syncInteractionChecks() {
  try {
    console.log('Syncing interaction checks...');
    
    // Get pending interaction checks from IndexedDB
    const pendingChecks = await getPendingInteractionChecks();
    
    for (const check of pendingChecks) {
      try {
        const response = await fetch('/api/interactions/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(check.data)
        });
        
        if (response.ok) {
          await removePendingInteractionCheck(check.id);
        }
      } catch (error) {
        console.error('Failed to sync interaction check:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed for interaction checks:', error);
  }
}

async function syncFavorites() {
  try {
    console.log('Syncing favorites...');
    
    const pendingFavorites = await getPendingFavorites();
    
    for (const favorite of pendingFavorites) {
      try {
        const response = await fetch('/api/favorites', {
          method: favorite.action === 'add' ? 'POST' : 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(favorite.data)
        });
        
        if (response.ok) {
          await removePendingFavorite(favorite.id);
        }
      } catch (error) {
        console.error('Failed to sync favorite:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed for favorites:', error);
  }
}

async function syncAnalytics() {
  try {
    console.log('Syncing analytics...');
    
    const pendingAnalytics = await getPendingAnalytics();
    
    if (pendingAnalytics.length > 0) {
      const response = await fetch('/api/analytics/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events: pendingAnalytics })
      });
      
      if (response.ok) {
        await clearPendingAnalytics();
      }
    }
  } catch (error) {
    console.error('Background sync failed for analytics:', error);
  }
}

// IndexedDB operations (simplified - would need actual implementation)
async function getPendingInteractionChecks() {
  // Implementation would use IndexedDB to retrieve pending checks
  return [];
}

async function removePendingInteractionCheck(id) {
  // Implementation would remove the check from IndexedDB
}

async function getPendingFavorites() {
  // Implementation would use IndexedDB to retrieve pending favorites
  return [];
}

async function removePendingFavorite(id) {
  // Implementation would remove the favorite from IndexedDB
}

async function getPendingAnalytics() {
  // Implementation would use IndexedDB to retrieve pending analytics
  return [];
}

async function clearPendingAnalytics() {
  // Implementation would clear analytics from IndexedDB
}

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

console.log('OncoSafeRx Service Worker loaded successfully');