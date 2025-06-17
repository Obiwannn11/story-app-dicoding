import * as APIService from '../../data/api.js';
import * as CameraService from '../../utils/camera-service.js';
import { showToast } from '../../utils/toast-service.js';


class AddStoryPresenter {
    constructor({ view }) {
        this._view = view;

        // masukkan Presenter ke View agar View bisa memanggil metode Presenter
        this._view.bindEvents(this);
        // Presenter memerintahkan View untuk menginisialisasi peta 
        this._view.initMap((coords) => this.handleLocationSelect(coords));
    }


    async handleOpenCameraClick() {
    try {
        // Cleanup video element sebelum start
        CameraService.cleanupVideoElement(this._view.cameraPreview);
        
        const stream = await CameraService.startCamera(this._view.cameraPreview);
        this._view.displayCameraPreview(stream);
    } catch (error) {
        console.error('Camera error:', error);
        this._view.showError('Gagal mengakses kamera. Pastikan izin telah diberikan.');
    }
    }

    async handleCapturePhotoClick() {
        const blob = await CameraService.capturePhotoAsBlob(this._view.cameraPreview, this._view.photoCanvas);
        if (blob) {
            this._view.displayPhotoResult(blob);
            CameraService.stopCamera(); // Langsung matikan kamera setelah foto diambil
            this._view.hideCameraPreview();
        }
    }

    handleLocationSelect(coords) {
        this._view.updateLocationInputs(coords);
    }

    async handleFormSubmit() {
        const formData = this._view.getFormData();
        let finalPhoto = formData.photoBlob || formData.photoFile;

        // Validasi input
        if (!formData.description || !finalPhoto) {
            this._view.showError('Deskripsi dan foto wajib diisi.');
            return;
        }
        if (finalPhoto.size > 1 * 1024 * 1024) { // kukasih Max 1MB
            this._view.showError('Ukuran file foto tidak boleh melebihi 1MB.');
            return;
        }

        this._view.showLoading(true);

        try {
            await APIService.addNewStory(
                formData.description,
                finalPhoto,
                formData.lat,
                formData.lon
            );
            showToast('Cerita baru berhasil ditambahkan!', 'success');
            this._view.resetForm();
            setTimeout(() => { window.location.hash = '/'; }, 2000);
        } catch (error) {
            this._view.showError(`Gagal: ${error.message}`);
        } finally {
            this._view.showLoading(false);
        }
    }
    
    // dipanggil saat meninggalkan halaman
    cleanup() {
    console.log("Cleaning up AddStoryPresenter resources...");
    
    // PERBAIKAN: Cleanup video element juga
    if (this._view && this._view.cameraPreview) {
        CameraService.cleanupVideoElement(this._view.cameraPreview);
    }
    
    CameraService.stopCamera();
    
    if (this._view) {
        this._view.cleanup();
    }
}
}

export default AddStoryPresenter;
