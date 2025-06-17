
class LoginView {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.submitButton = this.form ? this.form.querySelector('button[type="submit"]') : null;
        this.errorElement = document.getElementById('loginError');

        // Simpan handler untuk bisa di-remove saat cleanup
        this._submitHandler = null;
    }

    // Mengikat event submit form ke handler dari Presenter
    bindSubmit(handler) {
        if (this.form) {
            // Simpan handler agar bisa di-remove nanti
            this._submitHandler = (event) => {
                event.preventDefault();
                handler();
            };
            this.form.addEventListener('submit', this._submitHandler);
        }
    }

    // Mengambil data input dari form
    getLoginData() {
        return {
            email: this.emailInput.value,
            password: this.passwordInput.value,
        };
    }

    // Menampilkan pesan error
    showError(message) {
        if (this.errorElement) {
            this.errorElement.textContent = message;
            this.errorElement.style.display = 'block';
        }
    }

    // Menyembunyikan pesan error
    hideError() {
        if (this.errorElement) {
            this.errorElement.style.display = 'none';
        }
    }
    
    // Mengatur status loading pada tombol submit
    showLoading(isLoading) {
        if (this.submitButton) {
            this.submitButton.disabled = isLoading;
            this.submitButton.textContent = isLoading ? 'Logging in...' : 'Login';
        }
    }
    
    // Membersihkan event listener untuk mencegah memory leak
    cleanup() {
        console.log("Cleaning up LoginView event listeners...");
        if (this.form && this._submitHandler) {
            this.form.removeEventListener('submit', this._submitHandler);
        }
    }
}

export default LoginView;