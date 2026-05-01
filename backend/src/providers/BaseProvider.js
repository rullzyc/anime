const axios = require('axios');
const cheerio = require('cheerio');

class BaseProvider {
  constructor(name, baseUrl) {
    this.name = name;
    this.baseUrl = baseUrl;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 5000, // 5 detik timeout agar tidak menggantung
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
  }

  /**
   * Helper to load HTML
   */
  async loadHTML(path) {
    const response = await this.client.get(path);
    return cheerio.load(response.data);
  }

  // --- Abstract Methods to be implemented by child classes --- //

  async getLatestAnime() { throw new Error('Not implemented'); }
  async getPopularAnime() { throw new Error('Not implemented'); }
  async searchAnime(query) { throw new Error('Not implemented'); }
  
  /**
   * Format pengembalian harus selalu:
   * { title, slug, coverImage, description, genres, rating, status, type, currentEpisode, totalEpisodes }
   */
  async getAnimeDetail(slug) { throw new Error('Not implemented'); }
  
  /**
   * Format pengembalian harus selalu:
   * { 
   *    title: string,
   *    servers: [{ name, type, url, quality }]
   * }
   */
  async getEpisodeDetail(slug) { throw new Error('Not implemented'); }
}

module.exports = BaseProvider;
