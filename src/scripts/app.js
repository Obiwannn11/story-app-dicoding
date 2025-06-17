import routes from '../routes/routes-definition.js';
import { getActiveRoute } from '../routes/url-parser.js'; 
import { isAuthenticated, logout } from '../utils/auth-service.js';
import { cleanupMapPicker } from '../utils/map-service.js'; // Untuk membersihkan peta AddStoryPage
import { stopCamera } from '../utils/camera-service.js';   // Untuk membersihkan kamera AddStoryPage

class App {
    constructor({ content, drawerButton, navigationDrawer }) {
        this._content = content; // Elemen DOM untuk merender konten halaman
        this._drawerButton = drawerButton;
        this._navigationDrawer = navigationDrawer;
        this._logoutButton = document.getElementById('logoutButton');
        this._mainNav = document.getElementById('main-navigation');  

        this._currentPageModule = null; // Menyimpan modul halaman yang sedang aktif

        this._initAppShell(); // Inisialisasi event listener untuk drawer, logout, dll.
    }

    _initAppShell() {
        // Setup event listener untuk tombol drawer
        if (this._drawerButton && this._navigationDrawer) {
            this._drawerButton.addEventListener('click', (event) => {
                event.stopPropagation();
                this._navigationDrawer.classList.toggle('open'); //  menampilkan/menyembunyikan drawer
                this._drawerButton.setAttribute('aria-expanded', this._navigationDrawer.classList.contains('open'));
            });

            // Menutup drawer saat mengklik di luar area drawer atau link navigasi
            document.body.addEventListener('click', (event) => {
                if (this._navigationDrawer.classList.contains('open')) {
                    // Jika klik bukan pada drawer dan bukan pada tombol drawer
                    if (!this._navigationDrawer.contains(event.target) && !this._drawerButton.contains(event.target)) {
                        this._closeDrawer();
                    }
                }
            });
             // Menutup drawer saat link navigasi di dalam drawer diklik
            this._navigationDrawer.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    this._closeDrawer();
                });
            });
        }

        //tombol logout
        if (this._logoutButton) {
            this._logoutButton.addEventListener('click', () => {
                logout();
                window.location.hash = '#/login'; // Redirect dan  hashchange menangani render
            });
        }
    }

    _closeDrawer() {
        if (this._navigationDrawer) {
            this._navigationDrawer.classList.remove('open');
            if(this._drawerButton) this._drawerButton.setAttribute('aria-expanded', 'false');
        }
    }

    _updateNavUI(isAuth) {
        // Update tampilan tombol logout
        if (this._logoutButton) {
            this._logoutButton.style.display = isAuth ? 'inline-block' : 'none';
        }

        // navigasi yang aktif
        if (this._mainNav) { 
            const links = this._mainNav.querySelectorAll('a');
            const currentPathForHref = `#${getActiveRoute()}`;
            links.forEach(link => {
                if (link.getAttribute('href') === currentPathForHref) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
        if (this._navigationDrawer) { 
             const drawerLinks = this._navigationDrawer.querySelectorAll('a');
             const currentPathForHref = `#${getActiveRoute()}`;
             drawerLinks.forEach(link => {
                if (link.getAttribute('href') === currentPathForHref) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
    }

    async renderPage() {
        const currentRouteKey = getActiveRoute(); // route endpoint
         console.log('[App.renderPage] currentRouteKey:', currentRouteKey);
        const isAuth = isAuthenticated();

        // Guard untuk autentikasi
        const publicRoutes = ['/login', '/register'];
        if (!isAuth && !publicRoutes.includes(currentRouteKey)) {
            window.location.hash = '#/login';
            return; //  hashchange akan memproses
        }
        if (isAuth && publicRoutes.includes(currentRouteKey)) {
            window.location.hash = '/';
            return; //  hashchange akan memproses
        }

        this._updateNavUI(isAuth);

        // Cleanup halaman sebelumnya
        if (this._currentPageModule && typeof this._currentPageModule.cleanup === 'function') {
            await this._currentPageModule.cleanup();
        } else {
            if(this._currentPageModule && this._currentPageModule === routes['/add-story']){ // Cek jika halaman sebelumnya adalah add-story
                 stopCamera();
                 cleanupMapPicker();
            }
        }

        const pageModule = routes[currentRouteKey] || routes['/']; // Default ke HomePage

        console.log('[App.renderPage] Attempting to load module for route:', currentRouteKey);
        console.log('[App.renderPage] Resolved pageModule:', pageModule);
        console.log('[App.renderPage] routes object:', routes); // Lihat isi object routes
        console.log('[App.renderPage] routes["/"] (HomePage should be here):', routes['/']);



        this._currentPageModule = pageModule;

        if (!this._content) {
            console.error('Elemen #main-content tidak ditemukan untuk merender halaman!');
            return;
        }

        // Cek sebelum memanggil .render()
        if (pageModule && typeof pageModule.render === 'function') { 
            try {
                if (document.startViewTransition) {
                    document.startViewTransition(async () => {
                        this._content.innerHTML = await pageModule.render(); // Error jika pageModule undefined
                        if (typeof pageModule.afterRender === 'function') {
                            await pageModule.afterRender();
                        }
                    });
                } else {
                    this._content.innerHTML = await pageModule.render(); // Error jika pageModule undefined
                    if (typeof pageModule.afterRender === 'function') {
                        await pageModule.afterRender();
                    }
                }
            } catch (error) {
                console.error(`Error saat merender halaman ${currentRouteKey}:`, error);
                this._content.innerHTML = `<h1>Oops! Terjadi kesalahan saat memuat halaman.</h1><p>${error.message}</p>`;
            }
        } else {
            //  jika pageModule undefined atau tidak punya fungsi render
            console.error(`[App.renderPage] Page module untuk rute "${currentRouteKey}" adalah undefined atau tidak memiliki fungsi render.`);
            console.error('[App.renderPage] Detail pageModule:', pageModule);
            this._content.innerHTML = `<h1>Error: Modul halaman untuk rute "${currentRouteKey}" tidak ditemukan atau tidak valid.</h1>`;
            return; // Hentikan eksekusi lebih lanjut jika masih bermasalah
        }

        this._closeDrawer();
        this._content.focus();
    }
}

export default App;