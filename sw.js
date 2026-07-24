const CACHE_NAME = "almost-phone-root-v10";
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./core/design-tokens.css",
  "./core/app-theme.css",
  "./core/shell.css",
  "./core/dom.js",
  "./core/storage.js",
  "./core/time.js",
  "./core/emailScheduler.js",
  "./core/schedulerRunner.js",
  "./data/home.js",
  "./assets/icons/favicon.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/images/covers.jpg",
  "./apps/inbox/index.html",
  "./apps/inbox/style.css",
  "./apps/inbox/app.js"
];

const STATIC_ASSET_URLS = new Set(
  CORE_ASSETS
    .filter((asset) => !asset.endsWith("/") && !asset.endsWith(".html"))
    .map((asset) => new URL(asset, self.location).href)
);

function isNavigationOrHtml(request) {
  return request.mode === "navigate" ||
    request.destination === "document" ||
    request.headers.get("accept")?.includes("text/html");
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request, { cacheName: CACHE_NAME });
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (isNavigationOrHtml(event.request)) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (STATIC_ASSET_URLS.has(event.request.url)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  event.respondWith(fetch(event.request).catch(() => caches.match(event.request, { cacheName: CACHE_NAME })));
});
