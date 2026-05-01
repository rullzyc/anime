const NodeCache = require('node-cache');
const axiosProvider = require('./axiosProvider');
const puppeteerProvider = require('./puppeteerProvider');
const pLimit = require('p-limit');

// TTL 600 detik (10 menit)
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
const limit = pLimit(5); // Batasi konkurensi

class ScraperManager {
  /**
   * Mengambil HTML dengan urutan prioritas:
   * 1. Memory Cache
   * 2. Axios (cepat)
   * 3. Puppeteer (fallback, lambat tapi kuat)
   * 
   * @param {string} cacheKey 
   * @param {string} url 
   * @param {string} pptrSelector Selector yang ditunggu jika fallback ke puppeteer
   * @returns {Promise<string>} HTML lengkap
   */
  async getHTMLWithFallback(cacheKey, url, pptrSelector = 'body') {
    // 1. Cek Cache
    const cachedHTML = cache.get(cacheKey);
    if (cachedHTML) {
      console.log(`[MANAGER] Menggunakan Cache untuk: ${cacheKey}`);
      return cachedHTML;
    }

    return limit(async () => {
      let html = '';
      let isSuccess = false;

      // 2. Coba Axios (Cepat)
      try {
        html = await axiosProvider.getHTML(url);
        // Proteksi sederhana: jika HTML terlalu pendek, anggap gagal (mungkin capcha/error)
        if (html && html.length > 2000) {
          isSuccess = true;
        } else {
          throw new Error('HTML dari Axios terlalu kecil (kemungkinan Cloudflare challenge)');
        }
      } catch (axiosError) {
        console.warn(`[MANAGER] Axios gagal untuk ${url}. Fallback ke Puppeteer (Railway Mode)...`);
        
        // 3. Fallback ke Puppeteer (Browser Asli)
        try {
          html = await puppeteerProvider.getHTML(url, pptrSelector);
          if (html && html.length > 2000) {
            isSuccess = true;
          }
        } catch (pptrError) {
          console.error(`[MANAGER] Puppeteer juga gagal untuk ${url}.`);
        }
      }

      // Jika sukses, simpan di cache
      if (isSuccess && html) {
        cache.set(cacheKey, html);
        return html;
      }

      throw new Error(`Gagal mengambil data dari URL: ${url}`);
    });
  }
}

module.exports = new ScraperManager();
