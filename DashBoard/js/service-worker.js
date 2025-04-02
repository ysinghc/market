const CACHE_NAME = 'farmsync-offline-v1';
const urlsToCache = [
    '/DashBoard/farmer_dashboard.html',
    '/DashBoard/css/style.css',
    '/DashBoard/js/dashboard.js',
    '/DashBoard/js/profile.js',
    '/DashBoard/js/orders.js',
    '/DashBoard/js/inventory.js',
    '/DashBoard/img/logo.png',
    '/DashBoard/fonts/your-fonts.woff2',
    '/DashBoard/profile.html',
    '/DashBoard/orders.html',
    '/DashBoard/inventory.html'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then(response => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return response;
                    });
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
}); 