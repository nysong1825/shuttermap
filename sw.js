// 서비스워커: 설치형 앱(PWA) 조건 충족 + 오프라인 시 마지막 화면 유지.
// 네트워크 우선 — 해커톤 중 수정 사항이 바로 반영되도록 캐시는 실패 시에만 쓴다.
// 브라우저 HTTP 캐시(GitHub Pages는 약 10분)도 건너뛰도록 매번 서버에 새 버전을 확인한다(no-cache).
const CACHE = 'shuttermap-v2';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req))
  );
});
