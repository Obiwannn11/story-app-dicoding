class RegisterView {
    constructor() {
        this.form = document.getElementById('registerForm');
        this.nameInput = document.getElementById('name');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.submitButton = this.form ? this.form.querySelector('button[type="submit"]') : null;
        this.errorElement = document.getElementById('registerError');
        this.successElement = document.getElementById('registerSuccess');

        // Simpan handler untuk bisa di-remove saat cleanup
        this._submitHandler = null;
    }

    // Mengikat event submit form ke handler dari Presenter
    bindSubmit(handler) {
        if (this.form) {
            this._submitHandler = (event) => {
                event.preventDefault();
                handler();
            };
            this.form.addEventListener('submit', this._submitHandler);
        }
    }

    // Mengambil data input dari form
    getRegisterData() {
        return {
            name: this.nameInput.value,
            email: this.emailInput.value,
            password: this.passwordInput.value,
        };
    }
    
    // Metode untuk mengelola tampilan UI saat proses berjalan
    showLoading(isLoading) {
        if (this.submitButton) {
            this.submitButton.disabled = isLoading;
            this.submitButton.textContent = isLoading ? 'Mendaftar...' : 'Daftar';
        }
    }
    
    // Metode untuk menampilkan pesan error atau sukses, dan mereset form
    showSuccess(message) {
        this.successElement.textContent = message;
        this.successElement.style.display = 'block';
        this.errorElement.style.display = 'none';
        if (this.form) this.form.reset();
    }

    showError(message) {
        this.errorElement.textContent = message;
        this.errorElement.style.display = 'block';
        this.successElement.style.display = 'none';
    }
    
    hideMessages() {
        if (this.errorElement) this.errorElement.style.display = 'none';
        if (this.successElement) this.successElement.style.display = 'none';
    }
    
    // Membersihkan event listener untuk mencegah memory leak
    cleanup() {
        console.log("Cleaning up RegisterView event listeners...");
        if (this.form && this._submitHandler) {
            this.form.removeEventListener('submit', this._submitHandler);
        }
    }
}

export default RegisterView;
