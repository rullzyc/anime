const NodeCache = require('node-cache');
const axiosProvider = require('./axiosProvider');
const puppeteerProvider = require('./puppeteerProvider');
const pLimit = require('p-limit');

const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
const limit = pLimit(2); // Mengurangi konkurensi agar lebih stabil di Railway

class ScraperManager {
  async getHTMLWithFallback(cacheKey, url, pptrSelector = 'body') {
    const cachedHTML = cache.get(cacheKey);
    if (cachedHTML) return cachedHTML;

    return limit(async () => {
      // Karena Otakudesu.fit sangat protektif, kita langsung coba Puppeteer
      // agar tidak membuang waktu di Axios yang kemungkinan besar diblokir.
      try {
        console.log(`[MANAGER] Menjalankan Puppeteer untuk: ${url}`);
        const html = await puppeteerProvider.getHTML(url, pptrSelector);
        
        if (html && html.length > 5000) {
          cache.set(cacheKey, html);
          return html;
        }
      } catch (pptrError) {
        console.warn(`[MANAGER] Puppeteer gagal, mencoba Axios sebagai upaya terakhir...`);
        try {
          const html = await axiosProvider.getHTML(url);
          if (html && html.length > 5000) {
            cache.set(cacheKey, html);
            return html;
          }
        } catch (axiosError) {
          console.error(`[MANAGER] Semua metode gagal untuk ${url}`);
        }
      }

      throw new Error(`Gagal mengambil data dari URL: ${url}`);
    });
  }
}

module.exports = new ScraperManager();
