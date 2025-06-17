import { loadHtmlTemplate } from '../../utils/dom-helpers.js';
import * as IndexedDBService from '../../utils/indexeddb-service.js';
import SavedStoryView from './saved-view.js';
import SavedStoryPresenter from './saved-presenter.js';

let view; // Simpan referensi View untuk di-cleanup

const SavedPage = {
    async render() {
        return loadHtmlTemplate('pages/saved/saved.html');
    },

    async afterRender() {
        const savedStoryItemTemplate = await loadHtmlTemplate('pages/saved/saved-story-item.html');
        view = new SavedStoryView();
        
        new SavedStoryPresenter({
            view: view,
            indexeddbService: IndexedDBService,
            itemTemplate: savedStoryItemTemplate,
        });
    },

    async cleanup() {
        view = null;
        console.log('SavedPage module cleanup complete.');
    }
};

export default SavedPage;