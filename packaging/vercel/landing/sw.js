// WordNext Photo: tiny service worker. It makes the app installable and keeps the editor's hashed
// files (the 25 MB WebAssembly and its glue) in the browser cache so it opens faster. Everything
// else goes to the network, so a new deployment is always picked up.
const CACHE = "wordnext-photo-editor-v1";
const HASHED = /^\/editor\/.+-[0-9a-f]{8,}.*\.(wasm|js)$/;

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (key !== CACHE) await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (HASHED.test(url.pathname)) {
    // Hashed names never change their content: cache first.
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      })(),
    );
    return;
  }

  if (req.mode === "navigate" && url.pathname.startsWith("/editor")) {
    // The editor page itself: network first, last good copy when offline.
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        try {
          const res = await fetch(req);
          if (res.ok) cache.put("/editor/", res.clone());
          return res;
        } catch (err) {
          const hit = await cache.match("/editor/");
          if (hit) return hit;
          throw err;
        }
      })(),
    );
  }
});
