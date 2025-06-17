
class RegisterPresenter {
    // Presenter menerima View dan Model (API Service) sebagai dependensi
    constructor({ view, apiService }) {
        this._view = view;
        this._apiService = apiService;

        // "Suntikkan" handler dari Presenter ke View
        this._view.bindSubmit(() => this._handleFormSubmit());
    }

    async _handleFormSubmit() {
        this._view.hideMessages();
        this._view.showLoading(true);

        const registerData = this._view.getRegisterData();

        // Logika validasi di Presenter
        if (!registerData.name || !registerData.email || !registerData.password) {
            this._view.showError('Semua kolom wajib diisi.');
            this._view.showLoading(false);
            return;
        }
        if (registerData.password.length < 8) {
            this._view.showError('Password minimal harus 8 karakter.');
            this._view.showLoading(false);
            return;
        }

        try {
            // Memanggil Model (API Service)
            const response = await this._apiService.register(
                registerData.name, 
                registerData.email, 
                registerData.password
            );
            
            // Logika bisnis setelah mendapatkan respons
            if (!response.error) {
                this._view.showSuccess('Registrasi berhasil! Anda akan diarahkan ke halaman login.');
                // Presenter yang menangani navigasi
                setTimeout(() => { window.location.hash = '/login'; }, 3000);
            } else {
                throw new Error(response.message || 'Registrasi gagal.');
            }
        } catch (error) {
            console.error('Register error:', error);
            // Memberi perintah pada View untuk menampilkan error
            this._view.showError(error.message || 'Terjadi kesalahan saat registrasi.');
        } finally {
            // Memberi perintah pada View untuk menghentikan loading
            this._view.showLoading(false);
        }
    }
}

export default RegisterPresenter;