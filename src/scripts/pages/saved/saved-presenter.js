class SavedStoryPresenter {
    constructor({ view, indexeddbService, itemTemplate }) {
        this._view = view;
        this._indexeddbService = indexeddbService;
        this._itemTemplate = itemTemplate;

        this._view.bindDeleteStoryClick((id) => this._handleDeleteStory(id));

        this._displaySavedStories(); 
    }

    async _displaySavedStories() {
        try {
            const stories = await this._indexeddbService.getAllSavedStories();
            this._view.renderStories(stories, this._itemTemplate);
        } catch (error) {
            console.error('Failed to display saved stories:', error);
        }
    }

    async _handleDeleteStory(id) {
        try {
            await this._indexeddbService.deleteStory(id);
            // Setelah berhasil menghapus, render ulang daftar cerita yang tersisa
            await this._displaySavedStories();
        } catch (error) {
            console.error(`Failed to delete story with id ${id}:`, error);
        }
    }
}

export default SavedStoryPresenter;