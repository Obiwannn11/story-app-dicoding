const CACHE_NAME = 'StoryApp-v1';
// Daftar file yang akan di-cache (Application Shell)
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/public/images/icon-192x192.png',
  '/public/images/icon-512x512.png',

  // Untuk sekarang, kita akan cache halaman utama dan aset dasar
];

// Event 'install': Dipanggil saat service worker pertama kali diinstal
self.addEventListener('install', (event) => {
  console.log('Service Worker: Menginstal...');

  // Tunggu hingga cache berhasil dibuka dan semua file App Shell ditambahkan
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Membuka cache dan menambahkan App Shell');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Event 'fetch': Dipanggil setiap kali ada permintaan jaringan dari aplikasi
self.addEventListener('fetch', (event) => {
  // Strategi caching: Cache First
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Jika permintaan ditemukan di cache, kembalikan dari cache
        if (response) {
          console.log(`Service Worker: Menemukan ${event.request.url} di cache.`);
          return response;
        }

        // Jika tidak ada di cache, lanjutkan permintaan ke jaringan
        console.log(`Service Worker: Tidak menemukan ${event.request.url} di cache, mengambil dari jaringan.`);
        return fetch(event.request);
      })
  );
});

// Event 'activate': Dipanggil saat service worker diaktifkan
// Berguna untuk membersihkan cache lama
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Mengaktifkan...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});