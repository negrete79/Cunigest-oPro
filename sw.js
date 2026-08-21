const CACHE_NAME = 'cunigestao-v1';

// Arquivos que formam a base do aplicativo offline
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// 1. INSTALAÇÃO: Baixa os arquivos essenciais para funcionar offline
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cacheando arquivos essenciais...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // Força ativação imediata
  );
});

// 2. ATIVAÇÃO: Limpa caches antigos e assume o controle do app
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Apagando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH: Interrompe as requisições. Se tem no cache, usa ele. Se não, busca na web e salva no cache.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se achou no cache, retorna o cache
        if (response) {
          return response;
        }
        // Se não tem no cache, busca na rede
        return fetch(event.request).then(networkResponse => {
          // Checa se a resposta é válida para ser armazenada
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          // Clona a resposta, salva no cache para a próxima vez e retorna a original
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        }).catch(() => {
          // Se falhar a rede e não tiver no cache, retorna uma página offline genérica
          return caches.match('./index.html');
        });
      })
  );
});
