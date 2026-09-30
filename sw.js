// Minimal service worker — enables "Add to Home Screen" / installable PWA behaviour.
// This does NOT enable background push while the app is fully closed;
// it only lets the page be installed like an app icon and cached for faster reloads.
const CACHE = 'signal-pro-v1';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // network-first for API calls, cache-first for static app shell
  if (e.request.url.includes('twelvedata.com')) return; // never cache live data
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
