const CACHE_NAME = "dnd-dice-roller-v1";

// Archivos base que se guardan para que la app abra offline.
// Agrega aquí cualquier otro archivo local que uses (css, js, modelos 3d, etc).
const CORE_ASSETS = [
  "/dnd5e-dice-roller/",
  "/dnd5e-dice-roller/index.html",
  "/dnd5e-dice-roller/manifest.json",
  "/dnd5e-dice-roller/assets/icon.png",
  "/dnd5e-dice-roller/assets/wood-bg.jpg"
];

// Instala el service worker y precarga los archivos base
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

// Limpia caches viejos cuando se activa una nueva versión
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Estrategia: cache first, y si no está, va a la red y lo guarda
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
