import CONFIG from '../config';
import { getToken } from '../utils/auth-service.js';

const ENDPOINTS = {
  ENDPOINT: `${CONFIG.BASE_URL}/story`,
};

console.log('API_BASE_URL yang dimuat di api-service.js:', CONFIG.BASE_URL);

export async function getData() {
  const fetchResponse = await fetch(ENDPOINTS.ENDPOINT);
  return await fetchResponse.json();
}


async function fetchWithAuth(endpoint, options = {}) {
    const token = getToken(); // Ambil token dari auth-service
    const headers = {
        ...options.headers,
    };

    // Tambahkan Content-Type jika body adalah JSON dan bukan FormData
    if (!(options.body instanceof FormData) && options.body) {
        headers['Content-Type'] = 'application/json';
    }

    // Tambahkan Authorization header jika token tersedia
    // Untuk endpoint login/register, token mungkin null (jika belum login)
    // Endpoint yang terproteksi akan bergantung pada adanya token ini.
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${CONFIG.BASE_URL}${endpoint}`, { ...options, headers });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        // Jika error karena token tidak valid (misalnya 401 Unauthorized), mungkin kita ingin logout pengguna
        if (response.status === 401) {
            console.warn('Unauthorized request or token expired. User might need to log in.');
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204 || response.headers.get("content-length") === "0") {
        return null; // Tidak ada konten 
    }
    return response.json(); // return JSON
}

export async function login(email, password) {
    return fetchWithAuth('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

export async function register(name, email, password) {
    return fetchWithAuth('/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
    });
}

export async function getAllStories(page = 1, size = 10, location = 0) {
    return fetchWithAuth(`/stories?page=${page}&size=${size}&location=${location}`);
}

export async function addNewStory(description, photoFile, lat, lon) {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photoFile);
    if (lat !== undefined && lon !== undefined) {
        formData.append('lat', lat);
        formData.append('lon', lon);
    }

    return fetchWithAuth('/stories', {
        method: 'POST',
        body: formData, 
    });
}

export async function getStoryDetail(id) {
    return fetchWithAuth(`/stories/${id}`);
}


export async function subscribeNotification({ endpoint, keys: { p256dh, auth } }) {
    const requestBody = {
        endpoint,
        keys: { p256dh, auth },
    };
    
    // kirim ke server dicoding'
  return fetchWithAuth('/notifications/subscribe', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });
}


export async function unsubscribeNotification({ endpoint }) {
    // request DELETE ke dicoding
  return fetchWithAuth('/notifications/subscribe', {
    method: 'DELETE',
    body: JSON.stringify({ endpoint }),
  });
}


