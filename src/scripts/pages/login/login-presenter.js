class LoginPresenter {
    // Presenter menerima View dan layanan (Model) sebagai dependensi
    constructor({ view, apiService, authService }) {
        this._view = view;
        this._apiService = apiService;
        this._authService = authService;

        // "Suntikkan" handler dari Presenter ke View
        this._view.bindSubmit(() => this._handleFormSubmit());
    }

    async _handleFormSubmit() {
        this._view.hideError();
        this._view.showLoading(true);

        const loginData = this._view.getLoginData();

        // Validasi sederhana di Presenter
        if (!loginData.email || !loginData.password) {
            this._view.showError('Email dan password tidak boleh kosong.');
            this._view.showLoading(false);
            return;
        }

        try {
            // Memanggil Model (API Service)
            const response = await this._apiService.login(loginData.email, loginData.password);
            
            // Logika bisnis setelah mendapatkan respons
            if (response && !response.error && response.loginResult) {
                this._authService.saveToken(response.loginResult.token);
                this._authService.saveUser({ name: response.loginResult.name, userId: response.loginResult.userId });
                console.log('Login berhasil:', response.loginResult.name);
                
                // Presenter yang memutuskan navigasi selanjutnya
                window.location.hash = '/';
            } else {
                throw new Error(response.message || 'Login gagal. Periksa kembali email dan password Anda.');
            }
        } catch (error) {
            console.error('Login error:', error);
            // Memberi perintah pada View untuk menampilkan error
            this._view.showError(error.message || 'Terjadi kesalahan saat login.');
        } finally {
            // Memberi perintah pada View untuk menghentikan loading
            this._view.showLoading(false);
        }
    }
}

export default LoginPresenter;
