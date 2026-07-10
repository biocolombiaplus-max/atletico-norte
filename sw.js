// Atlético Norte FC — Service Worker
// Increment SW_VER on every deploy to force cache invalidation
const SW_VER = 'v7.5-2026-07-10';
const STATIC_CACHE = 'an-static-' + SW_VER;

// Firebase SDK scripts — heavy, rarely change, cache aggressively
const PRECACHE = [
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(STATIC_CACHE)
      .then(c => c.addAll(PRECACHE).catch(() => {})) // don't fail install if CDN unreachable
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== STATIC_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // ── HTML pages: ALWAYS network-first, no-store cache ──
  // This guarantees every visit gets the freshest version from GitHub Pages
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .catch(() => caches.match(e.request)) // offline fallback only
    );
    return;
  }

  // ── Firebase SDK + gstatic: cache-first (these never change by URL) ──
  if (url.hostname === 'www.gstatic.com') {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(r => {
          caches.open(STATIC_CACHE).then(c => c.put(e.request, r.clone()));
          return r;
        });
      })
    );
    return;
  }

  // ── Everything else: network (Firebase RTDB, images, etc.) ──
  // No caching — data must always be live
});
