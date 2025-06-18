import routes from '../routes/routes-definition.js';
import { getActiveRoute } from '../routes/url-parser.js';
import { isAuthenticated, logout } from '../utils/auth-service.js';
import { initNotificationSubscription, unsubscribeFromNotifications } from '../utils/notification-service.js';
import { showToast } from '../utils/toast-service.js';

class App {
    constructor({ content, drawerButton, navigationDrawer }) {
        // Validasi elemen DOM yang diperlukan
        if (!content) {
            throw new Error('Content element is required');
        }

        // Menyimpan referensi ke elemen DOM utama
        this._content = content;
        this._drawerButton = drawerButton;
        this._navigationDrawer = navigationDrawer;
        
        // Button subscribe/unsubscribe
        this._subscribeButton = document.getElementById('subscribeNotifButton');
        this._unsubscribeButton = document.getElementById('unsubscribeNotifButton'); 
        this._logoutButton = document.getElementById('logoutButton');
        this._mainNav = document.getElementById('main-navigation'); 
        this._drawerNavLinks = this._navigationDrawer ? this._navigationDrawer.querySelectorAll('a') : [];

        this._currentPageModule = null;
        this._isRendering = false; // Flag untuk mencegah render concurrent
        this._cleanupTasks = new Set(); // Track cleanup tasks
        this._eventListeners = new Map(); // Track event listeners untuk cleanup

        this._initAppShell();
    }

    _initAppShell() {
        // Inisialisasi event listener untuk tombol drawer
        if (this._drawerButton && this._navigationDrawer) {
            this._addEventListenerWithCleanup(this._drawerButton, 'click', (event) => {
                event.stopPropagation();
                this._toggleDrawer();
            });

            // Menutup drawer jika pengguna mengklik di luar area drawer
            this._addEventListenerWithCleanup(document.body, 'click', (event) => {
                if (this._navigationDrawer && this._navigationDrawer.classList.contains('open')) {
                    if (!this._navigationDrawer.contains(event.target) && event.target !== this._drawerButton) {
                        this._closeDrawer();
                    }
                }
            });

            // Menutup drawer saat link navigasi diklik
            this._drawerNavLinks.forEach(link => {
                this._addEventListenerWithCleanup(link, 'click', () => {
                    this._closeDrawer();
                });
            });
        }

        // Event listener untuk tombol subscribe
        if (this._subscribeButton) {
            this._addEventListenerWithCleanup(this._subscribeButton, 'click', async () => {
                await this._handleSubscribeClick();
            });
        }

        // Event listener untuk tombol unsubscribe
        if (this._unsubscribeButton) {
            this._addEventListenerWithCleanup(this._unsubscribeButton, 'click', async () => {
                await this._handleUnsubscribeClick();
            });
        }

        // Event listener untuk tombol logout
        if (this._logoutButton) {
            this._addEventListenerWithCleanup(this._logoutButton, 'click', () => {
                this._handleLogout();
            });
        }
    }

    // Helper method untuk menambah event listener dengan tracking
    _addEventListenerWithCleanup(element, event, handler) {
        if (!element) return;
        
        element.addEventListener(event, handler);
        
        // Track untuk cleanup nanti
        const key = `${element.constructor.name}-${event}`;
        if (!this._eventListeners.has(key)) {
            this._eventListeners.set(key, []);
        }
        this._eventListeners.get(key).push({ element, event, handler });
    }

    async _handleSubscribeClick() {
        try {
            this._setNotificationButtonsDisabled(true);
            const success = await initNotificationSubscription();
            
            if (success) {
                showToast('Berhasil berlangganan!', 'success');
                this._showUnsubscribeButton();
            } else {
                showToast('Gagal berlangganan', 'error');
            }
        } catch (error) {
            console.error('Error during subscription:', error);
            showToast('Terjadi kesalahan saat berlangganan', 'error');
        } finally {
            this._setNotificationButtonsDisabled(false);
        }
    }

    async _handleUnsubscribeClick() {
        try {
            this._setNotificationButtonsDisabled(true);
            const success = await unsubscribeFromNotifications();
            
            if (success) {
                showToast('Berhenti berlangganan', 'info');
                this._showSubscribeButton();
            } else {
                showToast('Gagal berhenti berlangganan', 'error');
            }
        } catch (error) {
            console.error('Error during unsubscription:', error);
            showToast('Terjadi kesalahan saat berhenti berlangganan', 'error');
        } finally {
            this._setNotificationButtonsDisabled(false);
        }
    }

    _handleLogout() {
        try {
            logout();
            // Bersihkan state aplikasi
            this._cleanup();
            window.location.hash = '#/login';
        } catch (error) {
            console.error('Error during logout:', error);
            showToast('Terjadi kesalahan saat logout', 'error');
        }
    }

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

    async _updateNotificationButtonState() {
        try {
            // Cek dukungan browser untuk Push Notification
            if (!('Notification' in window) || !('PushManager' in window) || !('serviceWorker' in navigator)) {
                this._hideAllNotificationButtons();
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
                this._hideAllNotificationButtons();
            }
        } catch (error) {
            console.error('Error updating notification button state:', error);
            this._hideAllNotificationButtons();
        }
    }

    _hideAllNotificationButtons() {
        if (this._subscribeButton) this._subscribeButton.style.display = 'none';
        if (this._unsubscribeButton) this._unsubscribeButton.style.display = 'none';
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

    async _updateNavUI(isAuth) {
        try {
            // Update visibilitas tombol logout
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

            await this._updateNotificationButtonState();
        } catch (error) {
            console.error('Error updating nav UI:', error);
        }
    }

    async renderPage() {
        // Prevent concurrent renders
        if (this._isRendering) {
            console.warn('Render already in progress, skipping...');
            return;
        }

        this._isRendering = true;

        try {
            const currentRouteKey = getActiveRoute();
            const isAuth = isAuthenticated();
            const publicRoutes = ['/login', '/register'];

            // Improved authentication logic dengan debounce
            if (!isAuth && !publicRoutes.includes(currentRouteKey)) {
                if (currentRouteKey !== '/login') {
                    console.log("Redirecting to login - user not authenticated");
                    // Gunakan setTimeout untuk mencegah infinite loop
                    setTimeout(() => {
                        window.location.hash = '#/login';
                    }, 0);
                }
                return;
            }

            if (isAuth && publicRoutes.includes(currentRouteKey)) {
                if (currentRouteKey !== '/') {
                    console.log("Redirecting to home - user already authenticated");
                    setTimeout(() => {
                        window.location.hash = '#/';
                    }, 0);
                }
                return;
            }

            // Cleanup modul sebelumnya
            await this._cleanupCurrentModule();

            // Dapatkan modul halaman yang sesuai
            const pageModule = routes[currentRouteKey] || routes['/'];
            
            if (!pageModule) {
                throw new Error(`Route not found: ${currentRouteKey}`);
            }

            this._currentPageModule = pageModule;

            // Update UI navigation
            await this._updateNavUI(isAuth);

            // Render halaman dengan error handling yang lebih baik
            await this._renderPageContent(pageModule);

        } catch (error) {
            console.error(`Error rendering page:`, error);
            this._renderErrorPage(error);
        } finally {
            this._isRendering = false;
            this._closeDrawer();
            
            // Set focus untuk aksesibilitas
            if (this._content) {
                this._content.focus();
            }
        }
    }

    async _cleanupCurrentModule() {
        if (this._currentPageModule && typeof this._currentPageModule.cleanup === 'function') {
            try {
                await this._currentPageModule.cleanup();
            } catch (error) {
                console.error('Error during module cleanup:', error);
            }
        }
    }

    async _renderPageContent(pageModule) {
        if (!this._content) {
            throw new Error('Content element not found');
        }

        const renderContent = async () => {
            try {
                const content = await pageModule.render();
                this._content.innerHTML = content;
                
                if (typeof pageModule.afterRender === 'function') {
                    await pageModule.afterRender();
                }
            } catch (error) {
                console.error('Error in render/afterRender:', error);
                throw error;
            }
        };

        // Gunakan View Transition API jika tersedia
        if (document.startViewTransition) {
            try {
                await document.startViewTransition(renderContent);
            } catch (error) {
                console.warn('View transition failed, falling back to normal render:', error);
                await renderContent();
            }
        } else {
            await renderContent();
        }
    }

    _renderErrorPage(error) {
        if (this._content) {
            this._content.innerHTML = `
                <div class="error-page">
                    <h1>Oops! Terjadi Kesalahan</h1>
                    <p>Maaf, halaman tidak dapat dimuat.</p>
                    <details>
                        <summary>Detail Error</summary>
                        <pre>${error.message}</pre>
                    </details>
                    <button onclick="window.location.reload()">Muat Ulang Halaman</button>
                </div>
            `;
        }
    }

    // Method untuk membersihkan semua resource
    _cleanup() {
        // Cleanup event listeners
        this._eventListeners.forEach((listeners, key) => {
            listeners.forEach(({ element, event, handler }) => {
                if (element && element.removeEventListener) {
                    element.removeEventListener(event, handler);
                }
            });
        });
        this._eventListeners.clear();

        // Cleanup tasks lainnya
        this._cleanupTasks.forEach(task => {
            try {
                task();
            } catch (error) {
                console.error('Error during cleanup task:', error);
            }
        });
        this._cleanupTasks.clear();

        // Cleanup current module
        this._cleanupCurrentModule();
    }

    // Method untuk menambah cleanup task
    addCleanupTask(task) {
        if (typeof task === 'function') {
            this._cleanupTasks.add(task);
        }
    }

    // Method untuk destroy app instance
    destroy() {
        this._cleanup();
        this._currentPageModule = null;
    }
}

export default App;