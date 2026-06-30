const CACHE_NAME = 'htc-v7';
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/main.css',
    '/css/components.css',
    '/css/responsive.css',
    '/js/firebase-config.js',
    '/js/firebase.js',
    '/js/router.js',
    '/js/utils.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                // Wrap cache.add() calls to prevent a single missing file from breaking installation
                console.log('Service Worker: Precaching assets');
                return Promise.allSettled(
                    PRECACHE_ASSETS.map(url => cache.add(url).catch(err => {
                        console.warn(`Failed to cache ${url}:`, err);
                    }))
                );
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Clearing old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    // For navigation requests, always serve index.html (SPA support)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            caches.match('/index.html').then(response => {
                return response || fetch(event.request).catch(() => caches.match('/index.html'));
            })
        );
        return;
    }

    // Cache-first strategy for static assets, network-first fallback
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                return fetch(event.request).then(response => {
                    // Don't cache bad responses or non-GET requests or cross-origin requests unless opaque
                    if (!response || response.status !== 200 || event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension')) {
                        return response;
                    }
                    
                    // Clone response since it can only be consumed once
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                    
                    return response;
                }).catch(err => {
                    console.error('Fetch failed:', err);
                });
            })
    );
});
