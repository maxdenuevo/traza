self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('traza-cache-v1').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/icon-192.png',
        '/icon-512.png',
        '/apple-touch-icon.png'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Devuelve desde el caché si existe, si no, busca en la red
      return response || fetch(event.request); 
    })
  );
});