const CACHE='vybe-v2.1';
const ASSETS=[
'./','./index.html','./manifest.webmanifest',
'./assets/icon-192.png','./assets/icon-512.png',
'./assets/beach_girl.jpg','./assets/beach_close.jpg','./assets/beach_soft.jpg',
'./assets/couple_sunset.jpg','./assets/couple_close.jpg','./assets/sunset_crop.jpg',
'./assets/friends_beach.jpg','./assets/friends_crop.jpg','./assets/friends_warm.jpg',
'./assets/club_scene.jpg','./assets/club_close.jpg','./assets/club_dark.jpg','./assets/club_loop.mp4'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
