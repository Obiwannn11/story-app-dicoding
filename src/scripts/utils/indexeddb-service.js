import { openDB } from 'idb';

const DB_NAME = 'story-db';
const DB_VERSION = 1;
const OBJECT_STORE_NAME = 'saved-stories';

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  // Metode upgrade dipanggil jika versi database berubah atau saat pertama kali dibuat
  upgrade(database) {
    // Buat object store dengan 'id' sebagai primary key
    database.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
    console.log(`Object store "${OBJECT_STORE_NAME}" berhasil dibuat.`);
  },
});

// Fungsi untuk menyimpan satu cerita
export const saveStory = async (story) => {
  try {
    const db = await dbPromise;
    // 'put' akan menambah data baru atau memperbarui data yang sudah ada (berdasarkan keyPath 'id')
    const tx = await db.transaction(OBJECT_STORE_NAME, 'readwrite').objectStore(OBJECT_STORE_NAME).put(story);
    console.log('Cerita berhasil disimpan:', tx);
    return tx;
  } catch (error) {
    console.error('Gagal menyimpan cerita:', error);
    throw error;
  }
};

// Fungsi untuk mendapatkan semua cerita yang tersimpan
export const getAllSavedStories = async () => {
  try {
    const db = await dbPromise;
    // 'getAll' langsung mengembalikan semua data dari object store
    const stories = await db.getAll(OBJECT_STORE_NAME);
    console.log('Berhasil mengambil semua cerita yang tersimpan.');
    return stories;
  } catch (error) {
    console.error('Gagal mengambil cerita:', error);
    throw error;
  }
};

// Fungsi untuk menghapus satu cerita berdasarkan ID
export const deleteStory = async (id) => {
  try {
    const db = await dbPromise;
    // 'delete' menghapus data berdasarkan primary key
    const tx = await db.transaction(OBJECT_STORE_NAME, 'readwrite').objectStore(OBJECT_STORE_NAME).delete(id);
    console.log(`Cerita dengan ID ${id} berhasil dihapus.`);
    return tx;
  } catch (error) {
    console.error(`Gagal menghapus cerita dengan ID ${id}:`, error);
    throw error;
  }
};
