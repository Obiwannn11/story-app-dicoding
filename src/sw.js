// const CACHE_NAME = 'StoryApp-v1';

const CACHE_NAME_PREFIX = 'storyapp-cache';
const CACHE_VERSION = 'v1';
const CACHE_NAME = `${CACHE_NAME_PREFIX}-${CACHE_VERSION}`;

// Daftar file "App Shell" yang penting dan namanya tidak akan berubah
const URLS_TO_CACHE = [
  '/', // Alias untuk index.html
  '/index.html',
  '/manifest.json',
  '/public/images/icon-192x192.png',
  '/public/images/icon-512x512.png',
  // --- PENTING ---
  // Kita TIDAK memasukkan file JS/CSS yang di-bundle Webpack di sini.
  // Karena namanya mengandung hash (misal: app.a1b2c3.bundle.js),
  // menyimpannya di sini akan menyebabkan error 404 pada 'cache.addAll'.
  // File-file tersebut akan di-cache secara dinamis saat pertama kali diminta.
];

// --- SIKLUS HIDUP SERVICE WORKER ---

// Event 'install': Menyimpan App Shell ke cache
self.addEventListener('install', (event) => {
  console.log('Service Worker: Menginstal...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Membuka cache dan menambahkan App Shell ke dalamnya');
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch(error => {
        console.error('Gagal melakukan pre-caching App Shell:', error);
      })
  );
});

// Event 'activate': Membersihkan cache lama
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Mengaktifkan...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter(name => name.startsWith(CACHE_NAME_PREFIX) && name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});

// Event 'fetch': Mencegat permintaan jaringan dan menerapkan strategi caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Jangan cache permintaan POST atau metode lain selain GET
  if (request.method !== 'GET') {
    return;
  }

  // Strategi Caching untuk API Dicoding (Stale-While-Revalidate)
  if (url.origin === 'https://story-api.dicoding.dev') {
    event.respondWith(
      caches.open('story-api-cache').then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const networkFetch = fetch(request).then((networkResponse) => {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        });
        return cachedResponse || networkFetch;
      })
    );
    return;
  }

  // Strategi Caching untuk semua aset lain (App Shell, JS, CSS, gambar, template)
  // Menggunakan Cache First
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      // Jika tidak ada di cache, ambil dari jaringan dan simpan ke cache utama
      return fetch(request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});

// Event listener untuk menerima pesan push dari server
self.addEventListener('push', (event) => {
  console.log('Service Worker: Menerima pesan push.');
  let notificationData;
  try {
    notificationData = JSON.parse(event.data.text());
  } catch (e) {
    console.error('Gagal mem-parsing data push:', e);
    // Fallback jika data bukan JSON
    notificationData = {
      title: 'Notifikasi Baru',
      options: {
        body: event.data.text(),
      },
    };
  }

  const title = notificationData.title;
  const options = {
    body: notificationData.options.body,
    icon: 'public/images/icon-192x192.png',
    badge: 'public/images/icon-192x192.png', // Ikon kecil untuk bar notifikasi
    // Anda bisa menambahkan opsi lain seperti 'vibrate', 'image', dll.
  };

  // Tampilkan notifikasi
  event.waitUntil(self.registration.showNotification(title, options));
});

// Event listener untuk menangani saat notifikasi di-klik
self.addEventListener('notificationclick', (event) => {
  console.log('Notifikasi di-klik:', event.notification);
  
  // Selalu tutup notifikasi setelah di-klik
  event.notification.close();

  // Buka jendela aplikasi atau fokus ke tab yang sudah ada
  // event.waitUntil menunda penutupan service worker sampai promise selesai
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientsArr) => {
      const hadWindowToFocus = clientsArr.some((windowClient) => windowClient.url === '/' && windowClient.focus());
      if (!hadWindowToFocus) {
        clients.openWindow('/').then((windowClient) => (windowClient ? windowClient.focus() : null));
      }
    })
  );
});
