/*
 * Suab service worker — generated at build time by buildServiceWorker.js.
 * Precaches the app shell + hashed build assets; safe to regenerate.
 */
const VERSION = 'suab-pwa-v1'
const PRECACHE = [
  "/Suab-deploy/",
  "/Suab-deploy/manifest.webmanifest",
  "/Suab-deploy/index-FbyCQneY.css",
  "/Suab-deploy/suab-logo-DB_5mAK3.png",
  "/Suab-deploy/index.html"
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  // Never intercept API traffic — the sync bridge handles its own failures.
  if (url.pathname.includes('/api/')) return

  // App shell: network-first so updates land, cache fallback for offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(VERSION).then((cache) => cache.put(base, copy))
          return response
        })
        .catch(() => caches.match(base)),
    )
    return
  }

  // Same-origin static assets: cache-first (hashed filenames are immutable).
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone()
              caches.open(VERSION).then((cache) => cache.put(request, copy)
              )
            }
            return response
          }),
      ),
    )
    return
  }

  // Cross-origin GETs: network with cache fallback.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone()
          caches.open(VERSION).then((cache) => put(cache, request, copy))
        }
        return response
      })
      .catch(() => caches.match(request)),
  )
})

function put(cache, request, response) {
  return cache.put(request, response)
}
