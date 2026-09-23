// מטמון בסיסי ל-PWA: תמיד מנסה רשת קודם (כדי שעדכונים יתקבלו מיד),
// ורק כשאין רשת בכלל נופל חזרה לעותק האחרון שנשמר.
const CACHE_NAME = 'equipment-tracker-v1';
const APP_SHELL = [
  './equipment_tracker.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // לא נוגעים ב-Firebase / Google Fonts וכו'

  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match('./equipment_tracker.html')))
  );
});
