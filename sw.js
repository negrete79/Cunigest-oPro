const CACHE_NAME = 'cunigestao-v2';
const ASSETS = [
  './index.html',
  './manifest.json'
];

// Instalação e cacheamento imediato dos assets principais
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
             .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação de requisições (Estratégia Cache First para passar no teste offline)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Se está no cache, retorna o cache
        if (cachedResponse) {
          return cachedResponse;
        }
        // Se não está no cache, busca na rede
        return fetch(event.request).then(response => {
          // Verifica se a resposta é válida para ser cacheada
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          // Clona a resposta, salva no cache e retorna
          var responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        }).catch(() => {
          // Fallback caso esteja offline e não tenha no cache (ex: requisições externas como a lib de PDF)
          return caches.match('./index.html');
        });
      })
  );
});
