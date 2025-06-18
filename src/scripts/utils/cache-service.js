const STORY_API_CACHE_NAME = 'story-api-cache';


// fungsi ini sebenanrya untuk menghapus cache, tujuannya spesifik menghpus cache saat setelah pembuatan story baru
// karena jika tidak dihapus, maka story yang baru dibuat tidak muncul di halaman home, malah ambil dari cache
const clearStoryApiCache = async () => {
  try {
    console.log(`Menghapus cache: ${STORY_API_CACHE_NAME}`);
    await caches.delete(STORY_API_CACHE_NAME);
    console.log(`Cache ${STORY_API_CACHE_NAME} berhasil dihapus.`);
  } catch (error) {
    console.error('Gagal menghapus cache API cerita:', error);
  }
};

export { clearStoryApiCache };