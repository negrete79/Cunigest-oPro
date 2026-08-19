const CACHE_NAME = 'cunigestao-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Instalação: Salva os arquivos no cache do celular
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Arquivos em cache para uso offline!');
        return cache.addAll(urlsToCache);
      })
  );
  // Força o Service Worker a ativar imediatamente
  self.skipWaiting();
});

// Intercepta requisições de rede: Se não tiver internet, usa o cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se achou no cache, retorna. Se não, busca na rede
        return response || fetch(event.request);
      })
  );
});

// Atualização: Limpa cache antigo se você fizer mudanças no app no futuro
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Assume o controle de todas as aberturas imediatamente
  self.clients.claim();
});
