
import { loadHtmlTemplate } from '../../utils/dom-helpers.js';
import * as APIService from '../../data/api.js';
import * as IndexedDBService from '../../utils/indexeddb-service.js';
import HomeView from './home-view.js';
import HomePresenter from './home-presenter.js';

let view; // Simpan referensi View agar bisa di-cleanup

const HomePage = {
    async render() {
        // Hanya merender kerangka HTML utama halaman ini
        return loadHtmlTemplate('pages/home/home.html');
    },

    async afterRender() {
        //  Muat template untuk setiap item cerita
        const storyItemTemplate = await loadHtmlTemplate('pages/home/story-item.html');
        
        // Buat instance dari View
        view = new HomeView();
        
        //  Buat instance dari Presenter, dan masukkan View, Model, dan template
        new HomePresenter({
            view: view,
            apiService: APIService,
            indexeddbService: IndexedDBService,
            storyItemTemplate: storyItemTemplate,
        });
    },

    async cleanup() {
        // Panggil metode cleanup dari View yang sedang aktif
        if (view) {
            view.cleanup();
            view = null; // Hapus referensi
        }
        console.log('HomePage module cleanup complete.');
    }
};

export default HomePage;