// ══════════════════════════════════════════════════════
// ARQLUZ ENTREGAS — SERVICE WORKER v1.0
// Cache dos assets estáticos para funcionamento offline
// ══════════════════════════════════════════════════════

const CACHE_NAME = 'arqluz-entregas-v1';

// Assets para cachear na instalação
const ASSETS_TO_CACHE = [
  '/arqluz-entregas/',
  '/arqluz-entregas/index.html',
  '/arqluz-entregas/manifest.json',
  '/arqluz-entregas/icon-192.png',
  '/arqluz-entregas/icon-512.png',
  // Firebase SDK
  'https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js',
  // PDF.js
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  // jsPDF
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// ── INSTALL: cacheia os assets ──────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Cacheando assets...');
      // Cacheia um a um para não falhar tudo se um CDN der erro
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url =>
          cache.add(url).catch(err => console.warn('[SW] Não cacheou:', url, err))
        )
      );
    }).then(() => {
      console.log('[SW] Instalado!');
      return self.skipWaiting();
    })
  );
});

// ── ACTIVATE: limpa caches antigos ──────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Ativando...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => { console.log('[SW] Removendo cache antigo:', key); return caches.delete(key); })
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: Cache-first para assets, Network-first para Firebase ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Firebase Firestore e Auth — sempre online (não cacheia dados)
  if (
    url.hostname.includes('firestore.googleapis.com') ||
    url.hostname.includes('identitytoolkit.googleapis.com') ||
    url.hostname.includes('securetoken.googleapis.com') ||
    url.hostname.includes('googleapis.com')
  ) {
    return; // deixa passar normalmente
  }

  // Google Drive Apps Script — sempre online
  if (url.hostname.includes('script.google.com')) {
    return;
  }

  // Para todo o resto: Cache-first com fallback para network
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          // Cacheia respostas válidas de assets estáticos
          if (
            response.ok &&
            event.request.method === 'GET' &&
            (url.hostname === location.hostname || url.hostname.includes('cdnjs') || url.hostname.includes('gstatic'))
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // Offline e não tem cache — retorna o index como fallback
          if (event.request.destination === 'document') {
            return caches.match('/arqluz-entregas/index.html');
          }
        });
    })
  );
});
