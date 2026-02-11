// Service Worker for つまみん PWA
// 全リクエスト network-first: 常に最新を取得、オフライン時のみキャッシュ利用
const CACHE_NAME = "tsumamin-v5";

// Install: cache shell assets for offline use
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([
        "/tsumami/",
        "/tsumami/favicon.svg",
      ])
    )
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for ALL requests
// ネットワーク優先: 成功したらキャッシュ更新、失敗時のみキャッシュから返す
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // ネットワーク成功: キャッシュを更新して返す
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        // オフライン: キャッシュから返す
        return caches.match(event.request);
      })
  );
});
