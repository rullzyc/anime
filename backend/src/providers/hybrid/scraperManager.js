const NodeCache = require('node-cache');
const axiosProvider = require('./axiosProvider');
const pLimit = require('p-limit');

// TTL 600 detik (10 menit)
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
const limit = pLimit(5); // Batasi konkurensi

class ScraperManager {
  /**
   * Mengambil HTML menggunakan Memory Cache -> Axios (Vercel Ready)
   * 
   * @param {string} cacheKey 
   * @param {string} url 
   * @returns {Promise<string>} HTML lengkap
   */
  async getHTMLWithFallback(cacheKey, url) {
    // 1. Cek Cache
    const cachedHTML = cache.get(cacheKey);
    if (cachedHTML) {
      console.log(`[MANAGER] Menggunakan Cache untuk: ${cacheKey}`);
      return cachedHTML;
    }

    return limit(async () => {
      // 2. Coba Axios
      try {
        const html = await axiosProvider.getHTML(url);
        if (html && html.length > 2000) {
          cache.set(cacheKey, html);
          return html;
        } else {
          throw new Error('HTML dari Axios terlalu kecil (kemungkinan Cloudflare challenge)');
        }
      } catch (axiosError) {
        console.warn(`[MANAGER] Axios gagal untuk ${url}. Puppeteer tidak tersedia di versi Vercel ini.`);
        throw new Error(`Gagal mengambil data dari URL: ${url}`);
      }
    });
  }
}

module.exports = new ScraperManager();
