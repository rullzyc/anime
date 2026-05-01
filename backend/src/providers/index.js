const pLimit = require('p-limit');

const malProvider      = require('./anime/malProvider');
const aniListProvider  = require('./anime/aniListProvider');

// Urutan prioritas eksekusi AnimeProvider
const ANIME_PROVIDERS = [malProvider, aniListProvider];

// Concurrency limiter: max 3 request ke website luar secara bersamaan
const limit = pLimit(3);

/**
 * Coba semua provider secara berurutan.
 * Jika provider pertama gagal (error / timeout), langsung lanjut ke berikutnya.
 *
 * @param {string} methodName - nama method yang dipanggil ('getLatestAnime', 'getAnimeDetail', dll)
 * @param {...any} args       - argumen yang diteruskan ke method provider
 */
const scrapeAnimeWithFallback = async (methodName, ...args) => {
  let lastError;

  for (const provider of ANIME_PROVIDERS) {
    try {
      console.log(`[PROVIDER] Mencoba ${provider.name} untuk ${methodName}(${args.join(', ')})...`);

      // Bungkus dengan p-limit agar tidak spam ke server
      const result = await limit(() => provider[methodName](...args));

      if (!result || (Array.isArray(result) && result.length === 0)) {
        throw new Error('Empty result');
      }

      console.log(`[PROVIDER] ✅ ${provider.name} berhasil!`);
      return result;

    } catch (err) {
      console.warn(`[PROVIDER] ⚠️ ${provider.name} gagal: ${err.message}`);
      lastError = err;
      // Lanjut ke provider berikutnya
    }
  }

  console.error(`[PROVIDER] ❌ Semua provider gagal untuk ${methodName}. Error terakhir: ${lastError?.message}`);
  throw new Error(`Semua provider gagal: ${lastError?.message}`);
};

module.exports = { scrapeAnimeWithFallback };
