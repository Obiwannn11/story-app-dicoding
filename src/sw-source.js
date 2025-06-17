import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';

// Workbox memasukkan daftar file pre-cache ke sini
precacheAndRoute(self.__WB_MANIFEST);

// Caching dinamis untuk API dan gambar (tetap sama)
registerRoute(({ url }) => url.href.startsWith('https://story-api.dicoding.dev/v1'), new StaleWhileRevalidate({ cacheName: 'story-api-cache' }));
registerRoute(({ request }) => request.destination === 'image', new CacheFirst({ cacheName: 'story-images-cache' }));

// Caching dinamis untuk API
registerRoute(
    ({ url }) => url.href.startsWith('https://story-api.dicoding.dev/'), 
    new StaleWhileRevalidate({ cacheName: 'story-api-cache' })
);

// Caching dinamis untuk gambar
registerRoute(
    ({ request }) => request.destination === 'image', 
    new CacheFirst({ cacheName: 'story-images-cache' })
);

// caching dinamis pages
registerRoute(
    ({ url }) => url.pathname.startsWith('/pages/'),
    new StaleWhileRevalidate({
        cacheName: 'page-templates-cache'
    })
);


// Listener untuk menerima pesan push dari server
self.addEventListener('push', (event) => {
    console.log('Push notification diterima:', event.data.text());
    const notificationData = JSON.parse(event.data.text());
    const title = notificationData.title;
    const options = {
        body: notificationData.options.body,
        icon: 'src/public/images/icon-192x192.png',
        badge: 'src/public/images/icon-192x192.png',
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

// Listener untuk klik pada notifikasi
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow('/'));
});
