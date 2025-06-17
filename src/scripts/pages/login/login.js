
import { loadHtmlTemplate } from '../../utils/dom-helpers.js';
import * as APIService from '../../data/api.js';
import * as AuthService from '../../utils/auth-service.js';
import LoginView from './login-view.js';
import LoginPresenter from './login-presenter.js';

let view; // Simpan referensi View di scope modul untuk di-cleanup

const LoginPage = {
    async render() {
        // Hanya merender kerangka HTML halaman login
        return loadHtmlTemplate('pages/login/login.html');
    },

    async afterRender() {
        // Setelah kerangka HTML dirender, buat dan hubungkan MVP
        view = new LoginView();
        
        new LoginPresenter({
            view: view,
            apiService: APIService,
            authService: AuthService,
        });
    },

    async cleanup() {
        // Panggil metode cleanup dari View yang sedang aktif untuk menghapus event listener
        if (view) {
            view.cleanup();
            view = null; // Hapus referensi untuk garbage collection
        }
        console.log('LoginPage module cleanup complete.');
    }
};

export default LoginPage;