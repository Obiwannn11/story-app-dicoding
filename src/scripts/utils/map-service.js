import L from 'leaflet';

export function initMapWithMarkers(mapContainerIdOrElement, stories = [], initialView = { lat: -2.5489, lon: 118.0149, zoom: 5 }) {
    const mapElement = typeof mapContainerIdOrElement === 'string'
        ? document.getElementById(mapContainerIdOrElement)
        : mapContainerIdOrElement;

    if (!mapElement || !L) {
        console.error('Elemen peta atau Leaflet tidak ditemukan.');
        return null;
    }
    

    const map = L.map(mapElement).setView([initialView.lat, initialView.lon], initialView.zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    stories.forEach(story => {
        if (story.lat != null && story.lon != null) { // Cek null atau undefined
            const marker = L.marker([story.lat, story.lon]).addTo(map);
            marker.bindPopup(
                `<b>${story.name}</b><br>` +
                `${story.description.substring(0, 70)}...<br>` +
                `<img src="${story.photoUrl}" alt="${story.name}" width="100" style="margin-top:5px;">`
            );
        }
    });
    return map;
}

let mapPickerInstance = null;
let mapPickerMarker = null;

// Inisialisasi peta untuk memilih lokasi (picker).
export function initMapPicker(mapContainerIdOrElement, onLocationSelectCallback, initialView = { lat: -2.5489, lon: 118.0149, zoom: 5 }) {
    const mapElement = typeof mapContainerIdOrElement === 'string'
        ? document.getElementById(mapContainerIdOrElement)
        : mapContainerIdOrElement;

    if (!mapElement || !L) {
        console.error('Elemen peta picker atau Leaflet tidak ditemukan.');
        return null;
    }

    // Hapus instance peta picker lama jika ada
    if (mapPickerInstance) {
        mapPickerInstance.remove();
        mapPickerInstance = null;
        mapPickerMarker = null;
    }
    
    mapPickerInstance = L.map(mapElement).setView([initialView.lat, initialView.lon], initialView.zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapPickerInstance);

    mapPickerInstance.on('click', (e) => {
        const { lat, lng } = e.latlng;
        if (mapPickerMarker) {
            mapPickerInstance.removeLayer(mapPickerMarker);
        }
        mapPickerMarker = L.marker([lat, lng]).addTo(mapPickerInstance);
        mapPickerInstance.panTo([lat, lng]);
        if (typeof onLocationSelectCallback === 'function') {
            onLocationSelectCallback({ lat: lat.toFixed(6), lon: lng.toFixed(6) });
        }
    });
    return mapPickerInstance;
}

export function cleanupMapPicker() {
    if (mapPickerInstance) {
        mapPickerInstance.remove();
        mapPickerInstance = null;
    }
    if (mapPickerMarker) {
        mapPickerMarker = null;
    }
}