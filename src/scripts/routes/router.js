// src/scripts/routes/router.js
import routes from './routes-definition.js';
// Hanya impor getActiveRoute yang akan kita gunakan untuk mencocokkan rute
import { getActiveRoute } from './url-parser.js';
import { isAuthenticated } from '../utils/auth-service.js';
import { cleanupMapPicker } from '../utils/map-service.js';
import { stopCamera } from '../utils/camera-service.js';

const appRoot = document.getElementById('app-root');
const mainNav = document.getElementById('main-navigation');
const logoutButton = document.getElementById('logoutButton');
let currentPageModule = null;

async function handleRouteChange() {
    const currentRoute = getActiveRoute(); 

    // Autentikasi Guard
    const publicRoutes = ['/login', '/register'];
    const isAuth = isAuthenticated();

    if (!isAuth && !publicRoutes.includes(currentRoute)) {
        location.hash = '#/login';
        return;
    }
    if (isAuth && publicRoutes.includes(currentRoute)) {
        location.hash = '#/';
        return;
    }

    updateNavUI(isAuth); // Fungsi ini tetap sama

    if (currentPageModule && typeof currentPageModule.cleanup === 'function') {
        await currentPageModule.cleanup();
    } else {
        // menghapus peta dan kamera 
        cleanupMapPicker();
        stopCamera();
    }

    const pageModule = routes[currentRoute] || routes['/']; //cek route
    currentPageModule = pageModule;

    if (!appRoot) {
        console.error('Elemen #app-root tidak ditemukan!');
        return;
    }

    if (pageModule && typeof pageModule.render === 'function') {
        try {
            if (document.startViewTransition) {
                document.startViewTransition(async () => {
                    appRoot.innerHTML = await pageModule.render();
                    if (typeof pageModule.afterRender === 'function') {
                        await pageModule.afterRender();
                    }
                });
            } else {
                appRoot.innerHTML = await pageModule.render();
                if (typeof pageModule.afterRender === 'function') {
                    await pageModule.afterRender();
                }
            }
        } catch (error) {
            console.error(`Error merender halaman ${currentRoute}:`, error);
            appRoot.innerHTML = `<h1>Oops! Terjadi kesalahan.</h1><p>${error.message}</p>`;
        }
    } else {
        console.warn(`Modul halaman untuk path "${currentRoute}" tidak ditemukan atau tidak valid.`);
        appRoot.innerHTML = '<h1>404 - Halaman Tidak Ditemukan</h1>';
    }
}

// Fungsi updateNavUI 
function updateNavUI(isAuth) {
    if (mainNav) {
        const links = mainNav.querySelectorAll('a');
        const currentPath = `#${getActiveRoute()}`; // Dapatkan path dengan hash untuk perbandingan href
        links.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    if (logoutButton) {
        logoutButton.style.display = isAuth ? 'inline-block' : 'none';
    }
}


export function initRouter() {
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('DOMContentLoaded', () => {
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                // untuk logout
                import('../utils/auth-service.js').then(auth => {
                    auth.logout();
                    location.hash = '#/login';
                }).catch(err => console.error("Gagal logout:", err));
            });
        }
        const currentYearElement = document.getElementById('currentYear');
        if (currentYearElement) {
            currentYearElement.textContent = new Date().getFullYear();
        }
        handleRouteChange(); 
    });
}