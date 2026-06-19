const CACHE_NAME = 'insiderjobs-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logos/microsoft_logo.svg',
  '/logos/google.png',
  '/logos/amazon_logo.png',
  '/logos/walmart_logo.svg',
  '/logos/samsung_logo.png',
  '/logos/adobe_logo.png',
  '/logos/accenture_logo.png',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch(err => console.log('Cache addAll error:', err))
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip API calls and external requests
  if (url.pathname.startsWith('/api') || url.origin !== self.location.origin) {
    event.respondWith(fetch(request));
    return;
  }

  // Cache first strategy for static assets
  if (request.method === 'GET' && 
      (url.pathname.match(/\.(js|css|svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot)$/) ||
       url.pathname === '/manifest.json')) {
    event.respondWith(
      caches.match(request)
        .then(response => response || fetch(request))
        .then(response => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          // Clone and cache
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Return offline page if available
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Network first for HTML pages
  event.respondWith(
    fetch(request)
      .then(response => {
        if (!response || response.status !== 200) {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        return caches.match(request)
          .then(response => response || caches.match('/index.html'));
      })
  );
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-applications') {
    event.waitUntil(syncApplications());
  }
});

async function syncApplications() {
  try {
    const db = await openDB();
    const tx = db.transaction('pendingApplications', 'readonly');
    const pendingApps = await tx.getAll();
    
    for (const app of pendingApps) {
      try {
        await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(app),
        });
      } catch (err) {
        console.error('Failed to sync application:', err);
      }
    }
  } catch (err) {
    console.error('Sync error:', err);
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'New notification from InsiderJobs',
    icon: '/logos/microsoft_logo.svg',
    badge: '/logos/google.png',
    tag: data.tag || 'notification',
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'InsiderJobs', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.tag || '/');
      }
    })
  );
});
