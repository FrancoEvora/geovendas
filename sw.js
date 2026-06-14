const CACHE = 'futura_casa_geovendas_v40';
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll([
    './',
    './index.html',
    './styles.css?v=4.0',
    './app.js?v=4.0',
    './manifest.webmanifest',
    './icon-192.png',
    './icon-512.png',
    './casa-cleoni-referencia.png',
    './casa-proto-exemplo.jpg'
  ])));
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});
self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
