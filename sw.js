/* Scanora service worker — ใช้งานออฟไลน์หลังเปิดครั้งแรก (ต้องเปิดผ่านลิงก์ http/https) */
const CACHE = 'scanora-v2';
const ASSETS = ['./', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;          // ฟอนต์/ภายนอก ใช้เครือข่ายตามปกติ
  if (req.mode === 'navigate') {                        // หน้าแอป: ลองเครือข่ายก่อน (ได้เวอร์ชันใหม่) ไม่ได้ค่อยใช้แคช
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return res; })));
});
