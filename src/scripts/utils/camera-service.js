let currentStream = null;

// Memulai stream kamera dan menampilkannya di elemen video.
export async function startCamera(videoElement) {
    if (currentStream) {
        stopCamera(); // Hentikan stream sebelumnya jika ada
    }
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' }, // Gunakan kamera belakang jika tersedia
            audio: false 
        });
        
        currentStream = stream;
        videoElement.srcObject = stream;
        
        // PERBAIKAN: Tunggu metadata ter-load sebelum memanggil play()
        return new Promise((resolve, reject) => {
            videoElement.onloadedmetadata = () => {
                videoElement.play()
                    .then(() => {
                        console.log('Camera started successfully');
                        resolve(stream);
                    })
                    .catch((playError) => {
                        console.error('Error playing video:', playError);
                        stopCamera(); // Cleanup jika gagal
                        reject(playError);
                    });
            };
            
            // Tambahkan timeout untuk mencegah hanging
            videoElement.onerror = (error) => {
                console.error('Video element error:', error);
                stopCamera();
                reject(new Error('Video element failed to load'));
            };
        });
        
    } catch (err) {
        console.error("Error mengakses kamera:", err);
        stopCamera(); // Pastikan cleanup meski error
        throw err; 
    }
}

// Menghentikan stream kamera yang sedang aktif.
export function stopCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => {
            track.stop();
            console.log(`Track ${track.kind} stopped`);
        });
        currentStream = null;
        console.log('Stream kamera dihentikan.');
    }
}

//  Tambahkan method untuk cleanup video element
export function cleanupVideoElement(videoElement) {
    if (videoElement) {
        videoElement.pause();
        videoElement.srcObject = null;
        videoElement.onloadedmetadata = null;
        videoElement.onerror = null;
    }
}

// ambil foto dari elemen video dan mengembalikannya sebagai data URL
export function capturePhoto(videoElement, canvasElement) {
    //  Cek kondisi 
    if (!currentStream) {
        console.warn('Stream kamera tidak aktif.');
        return null;
    }
    
    if (videoElement.readyState < videoElement.HAVE_METADATA) {
        console.warn('Video belum siap untuk capture.');
        return null;
    }
    
    if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
        console.warn('Video dimensions not available.');
        return null;
    }
    
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    const context = canvasElement.getContext('2d');
    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    return canvasElement.toDataURL('image/jpeg', 0.8); // Tambahkan quality
}

// Mengambil foto dari elemen video dan mengembalikannya sebagai Blob.
    export async function capturePhotoAsBlob(videoElement, canvasElement) {
    // Cek kondisi
    if (!currentStream) {
        console.warn('Stream kamera tidak aktif.');
        return null;
    }
    
    if (videoElement.readyState < videoElement.HAVE_METADATA) {
        console.warn('Video belum siap untuk capture.');
        return null;
    }
    
    if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
        console.warn('Video dimensions not available.');
        return null;
    }
    
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    const context = canvasElement.getContext('2d');
    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    
    return new Promise(resolve => {
        canvasElement.toBlob(resolve, 'image/jpeg', 0.8); // Tambahkan quality
    });
}