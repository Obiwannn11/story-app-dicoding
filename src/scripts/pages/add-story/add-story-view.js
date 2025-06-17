import { initMapPicker, cleanupMapPicker } from '../../utils/map-service.js';

class AddStoryView {
    constructor() {
        // Ambil semua elemen DOM yang dibutuhkan sekali saja
        this.form = document.getElementById('addStoryForm');
        this.descriptionInput = document.getElementById('description');
        this.photoFileInput = document.getElementById('photoFile');
        this.latitudeInput = document.getElementById('latitude');
        this.longitudeInput = document.getElementById('longitude');

        this.openCameraButton = document.getElementById('openCameraButton');
        this.capturePhotoButton = document.getElementById('capturePhotoButton');
        this.cameraPreview = document.getElementById('cameraPreview');
        this.photoCanvas = document.getElementById('photoCanvas'); // Diperlukan untuk proses capture
        this.photoResult = document.getElementById('photoResult');

        this.mapPickerContainer = document.getElementById('mapPickerContainer');
        this.submitButton = document.getElementById('submitStoryButton');
        this.errorElement = document.getElementById('addStoryError');
        this.successElement = document.getElementById('addStorySuccess');

        this._photoBlob = null; // Menyimpan blob foto dari kamera secara internal
    }

    // Metode untuk mengikat event listener ke callback dari Presenter
    bindEvents(presenter) {
        this.openCameraButton.addEventListener('click', () => presenter.handleOpenCameraClick());
        this.capturePhotoButton.addEventListener('click', () => presenter.handleCapturePhotoClick());
        this.form.addEventListener('submit', (event) => {
            event.preventDefault();
            presenter.handleFormSubmit();
        });
    }
    
    // --- Metode yang dipanggil oleh Presenter ---

    getFormData() {
        return {
            description: this.descriptionInput.value,
            photoFile: this.photoFileInput.files.length > 0 ? this.photoFileInput.files[0] : null,
            photoBlob: this._photoBlob,
            lat: this.latitudeInput.value,
            lon: this.longitudeInput.value,
        };
    }

    displayCameraPreview(stream) {
        this.cameraPreview.srcObject = stream;
        this.cameraPreview.style.display = 'block';
        this.capturePhotoButton.style.display = 'inline-block';
        this.openCameraButton.style.display = 'none';
        this.photoResult.style.display = 'none'; // Sembunyikan hasil foto sebelumnya
        this._photoBlob = null; // Reset blob
    }

    hideCameraPreview() {
        this.cameraPreview.style.display = 'none';
        this.capturePhotoButton.style.display = 'none';
        this.openCameraButton.style.display = 'inline-block';
        this.openCameraButton.textContent = 'Buka Kamera';
    }

    displayPhotoResult(blob) {
        this._photoBlob = blob;
        this.photoResult.src = URL.createObjectURL(blob);
        this.photoResult.style.display = 'block';
    }

    initMap(locationSelectCallback) {
        if (this.mapPickerContainer) {
            initMapPicker(this.mapPickerContainer, locationSelectCallback);
        }
    }

    updateLocationInputs({ lat, lon }) {
        if (this.latitudeInput) this.latitudeInput.value = lat;
        if (this.longitudeInput) this.longitudeInput.value = lon;
    }

    showLoading(isLoading) {
        this.submitButton.disabled = isLoading;
        this.submitButton.textContent = isLoading ? 'Mengirim...' : 'Bagikan Cerita';
        this.errorElement.style.display = 'none';
        this.successElement.style.display = 'none';
    }

    showError(message) {
        this.errorElement.textContent = message;
        this.errorElement.style.display = 'block';
    }

    showSuccess(message) {
        this.successElement.textContent = message;
        this.successElement.style.display = 'block';
        this.form.reset();
        this.photoResult.style.display = 'none';
        this._photoBlob = null;
    }
    
    cleanup() {
        console.log("Cleaning up AddStoryView resources...");
        // View bertanggung jawab membersihkan resource yang ia buat (peta)
        cleanupMapPicker();
        // Presenter akan bertanggung jawab menghentikan kamera
    }
}

export default AddStoryView;
