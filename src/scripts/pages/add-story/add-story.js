
import { loadHtmlTemplate } from '../../utils/dom-helpers.js';
import AddStoryView from './add-story-view.js';
import AddStoryPresenter from './add-story-presenter.js';

let presenter; // Simpan referensi presenter di scope modul

const AddStoryPage = {
    async render() {
        return loadHtmlTemplate('pages/add-story/add-story.html');
    },

    async afterRender() {
        // Setelah kerangka HTML dirender, kita buat dan hubungkan MVP
        const view = new AddStoryView();
        presenter = new AddStoryPresenter({ view }); // Simpan presenter yang baru dibuat
    },

    async cleanup() {
        // Panggil metode cleanup dari presenter
        // membersihkan kamera dengan cleanip metohd
        if (presenter) {
            presenter.cleanup();
            presenter = null; // Hapus referensi untuk garbage collection
        }
        console.log('AddStoryPage module cleanup complete.');
    }
};

export default AddStoryPage;