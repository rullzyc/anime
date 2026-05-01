const NodeCache = require('node-cache');

// Cache dengan TTL 600 detik (10 menit)
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120, useClones: false });

/**
 * Wrapper cache dengan Stale Fallback.
 *
 * Flow:
 *  1. Ada cache fresh → langsung return
 *  2. Cache tidak ada / expired → jalankan fetchFn()
 *     a. fetchFn berhasil → simpan ke cache + return
 *     b. fetchFn gagal    → coba return data stale (key lama) → jika tidak ada → throw error
 *
 * @param {string}   key     - cache key unik
 * @param {Function} fetchFn - async function yang mengambil data baru
 */
const getCachedData = async (key, fetchFn) => {
  // 1. Cek cache fresh
  const fresh = cache.get(key);
  if (fresh !== undefined) {
    console.log(`[CACHE] ✅ Cache hit: ${key}`);
    return fresh;
  }

  const staleKey = `stale_${key}`;

  try {
    // 2. Fetch data baru
    console.log(`[CACHE] 🔄 Cache miss, fetching: ${key}`);
    const data = await fetchFn();

    // Simpan sebagai fresh + simpan salinan stale (TTL unlimited)
    cache.set(key, data);
    cache.set(staleKey, data, 0); // TTL 0 = tidak pernah expire

    return data;
  } catch (err) {
    // 3. Gunakan data stale jika tersedia
    const stale = cache.get(staleKey);
    if (stale !== undefined) {
      console.warn(`[CACHE] ⚠️ Scraping gagal (${err.message}), menggunakan data stale untuk: ${key}`);
      return stale;
    }

    // 4. Tidak ada stale sama sekali → lempar error
    throw err;
  }
};

module.exports = { getCachedData };
