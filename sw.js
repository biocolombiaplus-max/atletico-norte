// Atlético Norte FC — Service Worker
// Increment SW_VER on every deploy to force cache invalidation
const SW_VER = 'v8.45-2026-07-16';
const STATIC_CACHE = 'an-static-' + SW_VER;
// Icon cache — NOT versioned so it survives SW updates
const ICON_CACHE = 'an-club-icon';

// Firebase SDK scripts — heavy, rarely change, cache aggressively
const PRECACHE = [
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(STATIC_CACHE)
      .then(c => c.addAll(PRECACHE).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      // Delete old versioned caches but KEEP the icon cache
      .then(keys => Promise.all(
        keys.filter(k => k !== STATIC_CACHE && k !== ICON_CACHE)
            .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({type:'window', includeUncontrolled:true}))
      .then(cls => cls.forEach(c => c.postMessage({type:'SW_UPDATED', ver:SW_VER})))
  );
});

self.addEventListener('message', e => {
  if (!e.data) return;
  if (e.data.type === 'SKIP_WAITING') { self.skipWaiting(); return; }

  // Store club logo as PWA icons so Android/iOS show the real badge
  if (e.data.type === 'SET_CLUB_ICON') {
    const { buf192, buf512 } = e.data;
    caches.open(ICON_CACHE).then(cache => {
      const headers = { 'Content-Type': 'image/png', 'Cache-Control': 'no-cache' };
      if (buf192) {
        const r192 = new Response(new Blob([buf192], {type:'image/png'}), {status:200, headers});
        cache.put('/icon-192.png',          r192.clone());
        cache.put('/icon-192-maskable.png', r192.clone());
      }
      if (buf512) {
        const r512 = new Response(new Blob([buf512], {type:'image/png'}), {status:200, headers});
        cache.put('/icon-512.png',          r512.clone());
        cache.put('/icon-512-maskable.png', r512.clone());
      }
    });
  }
});

// ── PUSH NOTIFICATIONS ──
self.addEventListener('push', e => {
  if (!e.data) return;
  let payload;
  try { payload = e.data.json(); } catch(x) { payload = {title:'Atlético Norte', body: e.data.text()}; }
  const title = payload.title || '⚽ Atlético Norte F.C.';
  const options = {
    body: payload.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: payload.tag || 'an-notif-' + Date.now(),
    data: payload.data || {},
    vibrate: [100, 50, 100],
    requireInteraction: payload.type === 'goal'
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({type:'window', includeUncontrolled:true}).then(cs => {
      for (const c of cs) { if ('focus' in c) return c.focus(); }
      return clients.openWindow('/');
    })
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // ── PWA Icons: serve from icon cache if available (contains real club logo) ──
  const iconPaths = ['/icon-192.png','/icon-512.png','/icon-192-maskable.png','/icon-512-maskable.png'];
  if (iconPaths.includes(url.pathname)) {
    e.respondWith(
      caches.open(ICON_CACHE).then(cache =>
        cache.match(url.pathname).then(cached => cached || fetch(e.request))
      )
    );
    return;
  }

  // ── HTML pages: ALWAYS network-first, no-store cache ──
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // ── Firebase SDK + gstatic: cache-first ──
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
});
