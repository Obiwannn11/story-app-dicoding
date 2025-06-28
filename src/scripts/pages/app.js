// src/scripts/pages/app.js

import routes from '../routes/routes-definition.js';
import { getActiveRoute } from '../routes/url-parser.js';
import { isAuthenticated, logout } from '../utils/auth-service.js';
import { initNotificationSubscription } from '../utils/notification-service.js';
// import { cleanupMapPicker } from '../utils/map-service.js'; // tidak jadi pakai 
// import { stopCamera } from '../utils/camera-service.js';

class App {
    constructor({ content, drawerButton, navigationDrawer }) {
        // Menyimpan referensi ke elemen DOM utama
        this._content = content;
        this._drawerButton = drawerButton;
        this._navigationDrawer = navigationDrawer;

        // Mengambil referensi ke elemen UI lain
        this._logoutButton = document.getElementById('logoutButton');
        this._mainNav = document.getElementById('main-navigation'); 
        this._drawerNavLinks = this._navigationDrawer ? this._navigationDrawer.querySelectorAll('a') : []; // Link di dalam drawer

        this._currentPageModule = null; 
        this._subscribeButton = document.getElementById('subscribeNotifButton');

        this._initAppShell(); //  metode untuk inisialisasi UI  aplikasi
    }

    _initAppShell() {
        // Inisialisasi event listener untuk tombol drawer (menu samping)
        if (this._drawerButton && this._navigationDrawer) {
            this._drawerButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Mencegah event klik menyebar lebih lanjut
                this._toggleDrawer();
            });

            // Menutup drawer jika pengguna mengklik di luar area drawer
            document.body.addEventListener('click', (event) => {
                if (this._navigationDrawer && this._navigationDrawer.classList.contains('open')) {
                    if (!this._navigationDrawer.contains(event.target) && event.target !== this._drawerButton) {
                        this._closeDrawer();
                    }
                }
            });

            // Menutup drawer saat salah satu link navigasi di dalam drawer diklik
            this._drawerNavLinks.forEach(link => {
                link.addEventListener('click', () => {
                    this._closeDrawer();
                });
            });
        }

         if (this._subscribeButton) {
            this._subscribeButton.addEventListener('click', async () => {
                console.log('Tombol langganan notifikasi diklik.');
                await initNotificationSubscription();
                // Sembunyikan tombol setelah berhasil
                this._subscribeButton.style.display = 'none';
            });
        }

        // Inisialisasi event listener untuk tombol logout
        if (this._logoutButton) {
            this._logoutButton.addEventListener('click', () => {
                logout(); //  logout 
                window.location.hash = '#/login'; // Mengarahkan pengguna ke halaman login
            });
        }

        // Solusi dari reviewer dicoding 🥰🥰🥰
        const skipLink = document.querySelector('.skip-link');
        const mainContent = document.querySelector('#main-content'); 

        if (skipLink && mainContent) {
            skipLink.addEventListener('click', (event) => {
                // Mencegah link mengubah URL hash dan menyebabkan "refresh"
                event.preventDefault();

                // Menghilangkan fokus visual dari link setelah diklik
                skipLink.blur();

                // Fokus ke konten utama
                mainContent.focus();

                // scroll halaman ke konten utama
                mainContent.scrollIntoView({ behavior: 'smooth' });
            });
        }
    }

    _toggleDrawer() {
        if (this._navigationDrawer && this._drawerButton) {
            this._navigationDrawer.classList.toggle('open');
            const isOpen = this._navigationDrawer.classList.contains('open');
            this._drawerButton.setAttribute('aria-expanded', isOpen.toString());
        }
    }

    _closeDrawer() {
        if (this._navigationDrawer && this._drawerButton) {
            this._navigationDrawer.classList.remove('open');
            this._drawerButton.setAttribute('aria-expanded', 'false');
        }
    }

    _updateNavUI(isAuth) {
        //  visibilitas tombol logout berdasarkan status autentikasi
        if (this._logoutButton) {
            this._logoutButton.style.display = isAuth ? 'inline-block' : 'none';
        }

        // Menandai link navigasi yang aktif
        const currentPathForHref = `#${getActiveRoute()}`;
        const setActive = (links) => {
            links.forEach(link => {
                if (link.getAttribute('href') === currentPathForHref) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        };

        if (this._mainNav) setActive(this._mainNav.querySelectorAll('a'));
        if (this._navigationDrawer) setActive(this._drawerNavLinks);

          // Tampilkan tombol hanya jika login dan notifikasi didukung
        if (this._subscribeButton && 'Notification' in window) {
            this._subscribeButton.style.display = isAuth ? 'inline-block' : 'none';
        }
    
    }

    async renderPage() {
    const currentRouteKey = getActiveRoute();
    console.log('[App.renderPage] currentRouteKey from getActiveRoute():', currentRouteKey);

    const isAuth = isAuthenticated();
    console.log('[App.renderPage] isAuth:', isAuth);
    const publicRoutes = ['/login', '/register'];

    if (!isAuth && !publicRoutes.includes(currentRouteKey)) {
        window.location.hash = '#/login';
        return;
    }
    if (isAuth && publicRoutes.includes(currentRouteKey)) {
        window.location.hash = '/';
        return;
    }

    this._updateNavUI(isAuth);


    // Membersihkan resource dari modul halaman sebelumnya dengan claenup
    if (this._currentPageModule && typeof this._currentPageModule.cleanup === 'function') {
        console.log('[App.renderPage] Menjalankan cleanup untuk modul halaman sebelumnya.');
        await this._currentPageModule.cleanup();
    }

    // Mencocokkan currentRouteKey dengan route
    const pageModule = routes[currentRouteKey] || routes['/'];
    console.log('[App.renderPage] Resolved pageModule:', pageModule);

    this._currentPageModule = pageModule;

    if (!this._content) {
        console.error('[App.renderPage] Elemen #main-content tidak ditemukan!');
        return;
    }

    if (pageModule && typeof pageModule.render === 'function') {
        try {
            if (document.startViewTransition) {
                document.startViewTransition(async () => {
                    this._content.innerHTML = await pageModule.render();
                    if (typeof pageModule.afterRender === 'function') {
                        await pageModule.afterRender();
                    }
                });
            } else {
                this._content.innerHTML = await pageModule.render();
                if (typeof pageModule.afterRender === 'function') {
                    await pageModule.afterRender();
                }
            }
        } catch (error) {
            console.error(`[App.renderPage] Error saat merender halaman untuk rute "${currentRouteKey}":`, error);
            this._content.innerHTML = `<h1>Error: Gagal memuat halaman.</h1>`;
            console.error('[App.renderPage] Detail error:', error);
        }
    } else {
        //  jika pageModule tidak valid
        console.error(`[App.renderPage] Page module untuk rute "${currentRouteKey}" adalah undefined atau tidak memiliki fungsi render.`);
        console.error('[App.renderPage] Detail pageModule:', pageModule);
        this._content.innerHTML = `<h1>Error: Modul halaman untuk rute "${currentRouteKey}" tidak ditemukan atau tidak valid.</h1>`;
    }

    this._closeDrawer();
    this._content.focus();
}

}

export default App;
