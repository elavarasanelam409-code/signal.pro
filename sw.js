// Minimal service worker — enables "Add to Home Screen" / installable PWA behaviour.
// This does NOT enable background push while the app is fully closed;
// it only lets the page be installed like an app icon.
// NETWORK-FIRST: always tries to fetch the latest file first, only falls back
// to the cached copy if the network request fails (e.g. offline). This makes
// sure updates uploaded to GitHub show up immediately instead of being stuck
// showing an old cached version.
const CACHE = 'signal-pro-v2';
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
  if (e.request.url.includes('twelvedata.com')) return; // never cache live market data
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Got a fresh copy from the network — update the cache and use it
        const resClone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, resClone));
        return res;
      })
      .catch(() => caches.match(e.request)) // offline fallback only
  );
});
