// Service Worker — forces network-first loading to bypass HTTP cache
var SW_VERSION = '111';

self.addEventListener('install', function(event) {
  // Take control immediately, don't wait for old SW to finish
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  // Claim all open tabs immediately so this SW controls them
  event.waitUntil(
    caches.keys().then(function(names) {
      // Delete ALL existing caches
      return Promise.all(names.map(function(name) { return caches.delete(name); }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  // Only handle same-origin requests (not Firebase, CDNs, etc.)
  if (!event.request.url.startsWith(self.location.origin)) return;

  // For HTML navigation requests — always go to network, bypass cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(function() {
        return caches.match(event.request);
      })
    );
    return;
  }

  // For JS/CSS assets — network first, fall back to cache
  if (event.request.url.match(/\.(js|css)(\?|$)/)) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(function() {
        return caches.match(event.request);
      })
    );
    return;
  }
});
