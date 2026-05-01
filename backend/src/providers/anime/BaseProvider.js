const axios = require('axios');

/**
 * BaseProvider - kelas abstrak yang wajib diextend oleh semua AnimeProvider.
 * Menyediakan helper HTTP client dengan anti-block strategy.
 */
class BaseProvider {
  constructor(name, baseUrl) {
    this.name = name;
    this.baseUrl = baseUrl;

    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Referer': baseUrl
      }
    });
  }

  /**
   * Fetch HTML dengan random delay kecil untuk menghindari IP block.
   */
  async loadHTML(path) {
    // Random delay 100-500ms antar request
    await this._delay(100 + Math.floor(Math.random() * 400));
    const response = await this.client.get(path);
    const cheerio = require('cheerio');
    return cheerio.load(response.data);
  }

  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // --- Abstract Methods ---
  async getLatestAnime()         { throw new Error(`${this.name}: getLatestAnime() not implemented`); }
  async getAnimeDetail(slug)     { throw new Error(`${this.name}: getAnimeDetail() not implemented`); }
  async getEpisodeDetail(slug)   { throw new Error(`${this.name}: getEpisodeDetail() not implemented`); }
}

module.exports = BaseProvider;
