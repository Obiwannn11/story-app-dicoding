import { loadHtmlTemplate } from '../../utils/dom-helpers.js';
import * as APIService from '../../data/api.js';
import RegisterView from './register-view.js';
import RegisterPresenter from './register-presenter.js';

let view; // Simpan referensi View di scope modul untuk di-cleanup

const RegisterPage = {
    async render() {
        // Hanya merender kerangka HTML halaman registrasi
        return loadHtmlTemplate('pages/register/register.html');
    },

    async afterRender() {
        // Setelah kerangka HTML dirender, buat dan hubungkan MVP
        view = new RegisterView();
        
        new RegisterPresenter({
            view: view,
            apiService: APIService,
        });
    },

    async cleanup() {
        // Panggil metode cleanup dari View yang sedang aktif untuk menghapus event listener
        if (view) {
            view.cleanup();
            view = null; // Hapus referensi untuk garbage collection
        }
        console.log('RegisterPage module cleanup complete.');
    }
};

export default RegisterPage;