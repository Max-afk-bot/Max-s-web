const CACHE_NAME = 'mc-commands-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/data/indexes/categories_index.json',
  '/data/indexes/commands_index.json',
  '/data/commands/basics.json',
  '/data/commands/world.json',
  '/data/commands/entity.json',
  '/data/commands/execute.json',
  '/data/commands/logic.json',
  '/data/commands/automation.json',
  '/data/commands/environment.json',
  '/data/commands/display.json',
  '/data/commands/visuals.json',
  '/data/commands/server.json',
  '/data/commands/survival.json',
  '/data/commands/fun.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
