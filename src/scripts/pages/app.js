import routes from '../routes/routes-definition.js';
import { getActiveRoute } from '../routes/url-parser.js';
import { isAuthenticated, logout } from '../utils/auth-service.js';
import { initNotificationSubscription, unsubscribeFromNotifications } from '../utils/notification-service.js';
import { showToast } from '../utils/toast-service.js'; //

class App {
    constructor({ content, drawerButton, navigationDrawer }) {
        // Menyimpan referensi ke elemen DOM utama
        this._content = content;
        this._drawerButton = drawerButton;
        this._navigationDrawer = navigationDrawer;
        // button subsribve
        this._subscribeButton = document.getElementById('subscribeNotifButton');
        this._unsubscribeButton = document.getElementById('unsubscribeNotifButton'); 

        this._logoutButton = document.getElementById('logoutButton');
        this._mainNav = document.getElementById('main-navigation'); 
        this._drawerNavLinks = this._navigationDrawer ? this._navigationDrawer.querySelectorAll('a') : []; // Link di dalam drawer

        this._currentPageModule = null; 



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

        // ketia button susbribve di tekan
        if (this._subscribeButton) {
            this._subscribeButton.addEventListener('click', async () => {
                // Nonaktifkan kedua tombol untuk mencegah klik dobel
                this._setNotificationButtonsDisabled(true);
                const success = await initNotificationSubscription();
                // Jika berhasil, secara manual tampilkan tombol unsubscribe dan sembunyikan tombol subscribe
                if (success) {
                    showToast('Berhasil berlangganan!', 'success');
                    this._showUnsubscribeButton();
                }else{
                    showToast('Gagal berlangganan', 'error');
                }
                // Aktifkan kembali tombol setelah selesai
                this._setNotificationButtonsDisabled(false);
            });
        }

        // ketika buutton unsubscribe di tekan
        if (this._unsubscribeButton) {
            this._unsubscribeButton.addEventListener('click', async () => {
                // Nonaktifkan tombol
                this._setNotificationButtonsDisabled(true);
                // Panggil proses unsubscribe
                const success = await unsubscribeFromNotifications();
                // Jika berhasil, tampilkan tombol subscribe dan sembunyikan tombol unsubscribe
                if (success) {
                    showToast('Berhenti berlangganan', 'info');
                    this._showSubscribeButton();
                }else{
                    showToast('Gagal berhenti berlangganan.', 'error');
                }
                // Aktifkan kembali tombol setelah selesai
                this._setNotificationButtonsDisabled(false);
            });
        }

        // Inisialisasi event listener untuk tombol logout
        if (this._logoutButton) {
            this._logoutButton.addEventListener('click', () => {
                logout(); //  logout 
                window.location.hash = '#/login'; // Mengarahkan pengguna ke halaman login
            });
        }
    }


    // method untuk mengatur status tombol subsribce
    _setNotificationButtonsDisabled(isDisabled) {
        if (this._subscribeButton) this._subscribeButton.disabled = isDisabled;
        if (this._unsubscribeButton) this._unsubscribeButton.disabled = isDisabled;
    }

    _showSubscribeButton() {
        if (this._subscribeButton) this._subscribeButton.style.display = 'inline-block';
        if (this._unsubscribeButton) this._unsubscribeButton.style.display = 'none';
    }

    _showUnsubscribeButton() {
        if (this._subscribeButton) this._subscribeButton.style.display = 'none';
        if (this._unsubscribeButton) this._unsubscribeButton.style.display = 'inline-block';
    }



    // method untuk subs button
    async _updateNotificationButtonState() {
        // Cek apakah fitur Push didukung oleh browser
       if (!('Notification' in window) || !('PushManager' in window) || !('serviceWorker' in navigator)) {
            this._showSubscribeButton();
            this._subscribeButton.style.display = 'none'; // Sembunyikan semua jika tidak didukung
            return;
        }
    
        const swRegistration = await navigator.serviceWorker.ready;
        const subscription = await swRegistration.pushManager.getSubscription();
        const isAuth = isAuthenticated();
    
        if (isAuth && subscription) {
            this._showUnsubscribeButton();
        } else if (isAuth && !subscription) {
            this._showSubscribeButton();
        } else {
            // Sembunyikan kedua tombol jika tidak login
            this._showSubscribeButton(); // Tampilkan subscribe sebagai default
            this._subscribeButton.style.display = 'none'; // Lalu sembunyikan
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

        this._updateNotificationButtonState();
    
    }


    // Metode untuk render halaman sesuai route
    async renderPage() {
        const currentRouteKey = getActiveRoute();
        const isAuth = isAuthenticated();

        
        const publicRoutes = ['/login', '/register'];
    if (!isAuth && !publicRoutes.includes(currentRouteKey)) {
        //  redirect jika belum berada di halaman login
        if (currentRouteKey !== '/login') {
            window.location.hash = '#/login';
        }
        return;
    }
    if (isAuth && publicRoutes.includes(currentRouteKey)) {
        //  redirect jika belum berada di halaman utama
        if (currentRouteKey !== '/') {
            window.location.hash = '#/';
        }
    return;
    }

        // Panggil cleanup pada modul halaman sebelumnya untuk mencegah memory leak
        if (this._currentPageModule && typeof this._currentPageModule.cleanup === 'function') {
            await this._currentPageModule.cleanup();
        }

        // Dapatkan modul halaman yang sesuai dari definisi rute
        const pageModule = routes[currentRouteKey] || routes['/'];
        this._currentPageModule = pageModule; // Simpan modul saat ini

        this._updateNavUI(isAuth); // Perbarui UI shell aplikasi

        if (!this._content) {
            console.error('Elemen #main-content tidak ditemukan!');
            return;
        }

        try {
            // Gunakan View Transition API untuk animasi halaman yang halus
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
            console.error(`Gagal merender halaman ${currentRouteKey}:`, error);
            this._content.innerHTML = `<h1>Error: Gagal memuat halaman.</h1><p>${error.message}</p>`;
        }

        this._closeDrawer(); // Tutup drawer setelah navigasi
        this._content.focus(); // Atur fokus ke konten utama untuk aksesibilitas
    }

}

export default App;
