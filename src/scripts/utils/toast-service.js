const showToast = (message, type = 'info', duration = 3000) => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    // Buat elemen toast baru
    const toastElement = document.createElement('div');
    toastElement.className = `toast ${type}`; // e.g., 'toast success'
    toastElement.textContent = message;

    // Tambahkan toast ke kontainer
    container.appendChild(toastElement);

    // Tampilkan toast dengan animasi
    setTimeout(() => {
        toastElement.classList.add('show');
    }, 10); // Delay kecil untuk memastikan transisi CSS berjalan

    // Sembunyikan dan hapus toast setelah durasi tertentu
    setTimeout(() => {
        toastElement.classList.remove('show');
        toastElement.classList.add('hide');
        // Hapus elemen dari DOM setelah animasi fade-out selesai
        toastElement.addEventListener('animationend', () => {
            toastElement.remove();
        });
    }, duration);
};

export { showToast };