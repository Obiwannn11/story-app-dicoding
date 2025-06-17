
import { initMapWithMarkers } from '../../utils/map-service.js';

class HomeView {
    constructor() {
        this.storiesContainer = document.getElementById('stories-container');
        this.mapContainer = document.getElementById('story-map-container');
        this.currentPageInfo = document.getElementById('currentPageInfo');
        this.prevPageButton = document.getElementById('prevPageButton');
        this.nextPageButton = document.getElementById('nextPageButton');
        this._currentMapInstance = null; 
    }

    //  menerima data yg siap tampil dan template-nya
    renderStories(stories, storyItemTemplate) {
        if (!this.storiesContainer) return;
        this.storiesContainer.innerHTML = ''; // Kosongkan kontainer

        stories.forEach(story => {
            const storyName = story.name || "Nama Tidak Diketahui";
            const storyDescription = story.description || "Deskripsi tidak tersedia.";
            const photoUrl = story.photoUrl || "https://placehold.co/600x400?text=No+Image";
            const createdAt = story.createdAt ? new Date(story.createdAt).toLocaleDateString('id-ID') : "Tanggal tidak diketahui";
            
            let storyHtml = storyItemTemplate;

             // untuk menentukan tampilan tombol
            if (story.isSaved) {
                // Jika cerita sudah disimpan, ganti tombol 'Save' dengan versi 'Saved!' yang dinonaktifkan
                storyHtml = storyHtml.replace(
                    '<button class="save-button" data-id="{{id}}" aria-label="Save story {{name}}">Save</button>',
                    '<button class="save-button saved" data-id="{{id}}" disabled>Saved!</button>'
                );
            } else {
                // Jika belum disimpan, pastikan tombol 'Save' tetap ada
                const saveButtonHtml = `<button class="save-button" data-id="${story.id}" aria-label="Save story ${storyName}">Save</button>`;
                storyHtml = storyHtml.replace(/<div class="story-item-actions">[\s\S]*?<\/div>/, 
                    `<div class="story-item-actions">${saveButtonHtml}</div>`);
            }
            
            storyHtml = storyHtml.replace('{{photoUrl}}', photoUrl)
            .replace('{{namaaa}}',  storyName)
            .replace('{{description}}', storyDescription)
            .replace('{{createdAt}}', createdAt)
            .replace('Foto cerita oleh {{name}}', `Foto cerita oleh ${storyName.name}. Deskripsi: ${story.description.substring(0,50)}...`); 

            if (story.lat != null && story.lon != null) {
                storyHtml = storyHtml.replace(/\{\{lat\}\}/g, parseFloat(story.lat).toFixed(4))
                                     .replace(/\{\{lon\}\}/g, parseFloat(story.lon).toFixed(4));
            } else {
                storyHtml = storyHtml.replace(/<p class="story-location">.*?<\/p>/s, '');
            }

            this.storiesContainer.innerHTML += storyHtml;
        });
    }

    // Metode untuk menangani event klik pada tombol simpan cerita
    bindSaveStoryClick(handler) {
        if (this.storiesContainer) {
            this.storiesContainer.addEventListener('click', (event) => {
                // Pastikan event hanya berjalan untuk tombol yang TIDAK dinonaktifkan
                if (event.target.classList.contains('save-button') && !event.target.disabled) {
                    const storyId = event.target.dataset.id;
                    handler(storyId);
                    
                    event.target.textContent = 'Saved!';
                    event.target.disabled = true;
                }
            });
        }
    }

    // Metode untuk menampilkan peta, yang dipanggil oleh Presenter
    renderMap(stories) {
        if (!this.mapContainer) return;

        if (this._currentMapInstance) {
            this._currentMapInstance.remove();
            this._currentMapInstance = null;
        }
        this._currentMapInstance = initMapWithMarkers(this.mapContainer, stories);
    }
    
    //  event listener pada tombol pagination
    // menerima fungsi dari Presenter
    setupPagination(onPrevClick, onNextClick) {
        if (this.prevPageButton) this.prevPageButton.onclick = onPrevClick;
        if (this.nextPageButton) this.nextPageButton.onclick = onNextClick;
    }

    // Metode untuk memperbarui tampilan UI pagination
    updatePaginationUI(page, hasNextPage) {
        if (this.currentPageInfo) this.currentPageInfo.textContent = `Halaman ${page}`;
        if (this.prevPageButton) this.prevPageButton.disabled = (page === 1);
        if (this.nextPageButton) this.nextPageButton.disabled = !hasNextPage;
    }

    showLoading() {
        if (this.storiesContainer) {
            this.storiesContainer.innerHTML = '<p>Memuat cerita...</p>';
        }
    }

    showError(message) {
        if (this.storiesContainer) {
            this.storiesContainer.innerHTML = `<p class="error-message">Gagal memuat cerita. ${message}</p>`;
        }
    }
    
    cleanup() {
        console.log("Cleaning up HomeView resources...");
        if (this._currentMapInstance) {
            this._currentMapInstance.remove();
            this._currentMapInstance = null;
        }
    }
}

export default HomeView;
