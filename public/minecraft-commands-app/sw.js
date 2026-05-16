const CACHE_NAME = 'mc-commands-v1';
// Use relative paths so the SW works when the app is served under a subpath
// Cache only essential UI assets and indexes to keep install fast and reliable.
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/manifest-CXqajOKZ.json',
  './assets/index-Bn_I-7-9.js',
  './assets/index-mth6zUYd.css',
  './data/indexes/categories_index.json',
  './data/indexes/commands_index.json',
  // include a small essential commands file so the installed app has basic content
  './data/commands/basics.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Attempt to fetch and cache each asset; ignore failures for optional files
    await Promise.all(ASSETS.map(async (url) => {
      try {
        const res = await fetch(url, {cache: 'no-cache'});
        if (res && res.ok) await cache.put(url, res.clone());
      } catch (e) {
        // ignore individual fetch failures to avoid install fail
        console.warn('SW: failed to cache', url, e);
      }
    }));
    // Activate immediately
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Clean up old caches if cache name changes in future versions
    const keys = await caches.keys();
    await Promise.all(keys.map(k => {
      if (k !== CACHE_NAME) return caches.delete(k);
      return Promise.resolve();
    }));
    await self.clients.claim();
  })());
});

// After activation, cache remaining command JSON in background (non-blocking)
self.addEventListener('activated', () => {
  // not a standard event in all browsers; also run in activate handler below
});

(async function prefetchRemainingCommands(){
  try {
    const remaining = [
      './data/commands/world.json',
      './data/commands/entity.json',
      './data/commands/execute.json',
      './data/commands/logic.json',
      './data/commands/automation.json',
      './data/commands/environment.json',
      './data/commands/display.json',
      './data/commands/visuals.json',
      './data/commands/server.json',
      './data/commands/survival.json',
      './data/commands/fun.json'
    ];
    const cache = await caches.open(CACHE_NAME);
    // Fetch them one by one with small delay to avoid saturating network
    for (const url of remaining) {
      try {
        const res = await fetch(url, {cache: 'no-cache'});
        if (res && res.ok) await cache.put(url, res.clone());
        // small pause
        await new Promise(r => setTimeout(r, 200));
      } catch (e) {
        // ignore individual failures
        console.warn('SW prefetch failed for', url, e);
      }
    }
  } catch (e) {
    console.warn('SW background prefetch error', e);
  }
})();

self.addEventListener('fetch', (event) => {
  // Try cache first, then network fallback
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      return await fetch(event.request);
    } catch (e) {
      // network failed; optionally respond with fallback for navigation
      if (event.request.mode === 'navigate') {
        const cache = await caches.open(CACHE_NAME);
        const fallback = await cache.match('./index.html');
        if (fallback) return fallback;
      }
      throw e;
    }
  })());
});
