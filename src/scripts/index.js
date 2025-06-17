import '../styles/styles.css';
import App from './pages/app.js';
navigator.serviceWorker.register('/sw.js');

document.addEventListener('DOMContentLoaded', async () => {
    // Membuat instance baru dari kelas App
    const app = new App({
        content: document.querySelector('#main-content'),         // Area untuk merender konten halaman
        drawerButton: document.querySelector('#drawer-button'),   // Tombol untuk membuka/menutup drawer
        navigationDrawer: document.querySelector('#navigation-drawer'), // Elemen drawer navigasi
    });

    // Merender halaman awal berdasarkan URL hash saat aplikasi pertama kali dimuat
    await app.renderPage();

    // Menambahkan event listener untuk mendeteksi perubahan pada URL hash
    // Setiap kali hash berubah, render ulang halaman
    window.addEventListener('hashchange', async () => {
        await app.renderPage();
    });

    // Mendaftarkan Service Worker 
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js') // -> Path relatif terhadap root domain
                .then(registration => {
                    console.log('Service Worker berhasil didaftarkan dengan scope: ', registration.scope);
                })
                .catch(error => {
                    console.log('Pendaftaran Service Worker gagal: ', error);
                });
        });
    }

});
