class HomePresenter {
    // Presenter menerima View, Model (API Service), dan template
    constructor({ view, apiService, indexeddbService,storyItemTemplate }) {
        this._view = view;
        this._apiService = apiService;
        this._indexeddbService = indexeddbService;
        this._storyItemTemplate = storyItemTemplate;

        // Inisialisasi state halaman yang dikelola oleh Presenter
        this._currentPage = 1;
        this._storiesPerPage = 9;
        this._currentStories = [];

        // Perintahkan View untuk menyiapkan event listener pagination
        // Presenter memberikan fungsi yang harus dijalankan saat tombol diklik
        this._view.setupPagination(
            () => this._onPrevPage(),
            () => this._onNextPage()
        );

        // Perintahkan View untuk menyiapkan event listener pada tombol simpan cerita
        this._view.bindSaveStoryClick((id) => this._handleSaveStoryClick(id));

        // Langsung tampilkan cerita saat Presenter dibuat
        this._displayStories();
    }

    // mengambil data dari Model dan memerintahkan View untuk menampilkannya
    async _displayStories() {
        try {
            this._view.showLoading(); //Tampilkan loading

            // Ambil data dari API dan IndexedDB secara bersamaan
            const [apiResponse, savedStories] = await Promise.all([
                this._apiService.getAllStories(this._currentPage, this._storiesPerPage, 1),
                this._indexeddbService.getAllSavedStories(),
            ]);

            const savedStoryIds = new Set(savedStories.map(story => story.id));

            const storiesFromAPI = apiResponse.listStory || [];
            const enrichedStories = storiesFromAPI.map(story => {
                return {
                    ...story, // Salin semua properti asli dari cerita
                    isSaved: savedStoryIds.has(story.id) // Tambahkan properti baru: isSaved
                };
            });

            this._currentStories = enrichedStories; // Simpan data yang sudah diperkaya

           if (this._currentStories && this._currentStories.length > 0) {
                this._view.renderStories(this._currentStories, this._storyItemTemplate);
                this._view.renderMap(this._currentStories);
                
                const hasNextPage = this._currentStories.length >= this._storiesPerPage;
                this._view.updatePaginationUI(this._currentPage, hasNextPage);
            } else {
                this._view.showError('Belum ada cerita yang tersedia.');
                this._view.updatePaginationUI(this._currentPage, false);
            }
        } catch (error) {
            //  Tampilkan pesan error
            this._view.showError(error.message);
        }
    }

    async _handleSaveStoryClick(id) {
        try {
            // Cari objek cerita berdasarkan ID
            const storyToSave = this._currentStories.find(story => story.id === id);
            if (storyToSave) {
                // Panggil service untuk menyimpan cerita
                await this._indexeddbService.saveStory(storyToSave);
                console.log(`Cerita dengan ID ${id} berhasil disimpan ke IndexedDB.`);
            } else {
                console.error(`Cerita dengan ID ${id} tidak ditemukan untuk disimpan.`);
            }
        } catch (error) {
            console.error('Gagal menyimpan cerita:', error);
        }
    }
    
    _onPrevPage() {
        if (this._currentPage > 1) {
            this._currentPage--;
            this._displayStories(); // Ambil dan tampilkan cerita untuk halaman baru
        }
    }
    
    _onNextPage() {
        this._currentPage++;
        this._displayStories(); // Ambil dan tampilkan cerita untuk halaman baru
    }
}

export default HomePresenter;