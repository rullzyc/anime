// ===================================================
// VideoProvider - Layer terpisah dari AnimeProvider
// ===================================================
//
// Flag ini diatur lewat environment variable.
// Set USE_DUMMY_VIDEO=false di .env produksi untuk
// mengaktifkan scraping video nyata.
//
const USE_DUMMY_VIDEO = process.env.USE_DUMMY_VIDEO !== 'false'; // default: true

/**
 * Format output yang konsisten untuk semua VideoProvider:
 * {
 *   name:      string   // Label server (ditampilkan di UI)
 *   type:      'iframe' | 'hls'
 *   url:       string   // URL video / embed
 *   quality:   string   // '1080p', '720p', dll
 *   isDefault: boolean
 * }
 */
class VideoProvider {
  /**
   * Entry point utama.
   * Dikembalikan ke controller melalui getEpisodeDetail() provider.
   */
  async getVideoServers(animeId, episodeNumber) {
    if (USE_DUMMY_VIDEO) {
      console.log(`[VIDEO] Using dummy servers for ${animeId} ep${episodeNumber}`);
      return this._getDummyServers(animeId, episodeNumber);
    }

    // Untuk production: coba scrape dari berbagai sumber
    return this._scrapeRealServers(animeId, episodeNumber);
  }

  /**
   * Dummy servers yang REALISTIS:
   *  - Server 1: HLS valid (Mux test stream) → selalu berhasil
   *  - Server 2: Iframe valid (YouTube embed) → berhasil tapi beda format
   *  - Server 3: HLS rusak → untuk mengetes auto-fallback di frontend
   */
  _getDummyServers(animeId, episodeNumber) {
    return [
      {
        name:      'Server 1 (HD)',
        type:      'hls',
        url:       'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        quality:   '1080p',
        isDefault: true
      },
      {
        name:      'Server 2 (SD)',
        type:      'iframe',
        url:       `https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&ep=${episodeNumber}`,
        quality:   '720p',
        isDefault: false
      },
      {
        name:      'Server 3 (Test Error)',
        type:      'hls',
        url:       'https://tidak-ada.example.com/video.m3u8', // sengaja rusak
        quality:   '480p',
        isDefault: false
      }
    ];
  }

  /**
   * Template untuk scraping video nyata.
   * Isi sesuai target website ketika siap production.
   */
  async _scrapeRealServers(animeId, episodeNumber) {
    const axios   = require('axios');
    const cheerio = require('cheerio');
    const servers = [];

    // Contoh: Scrape dari samehadaku (isi URL dan selector sesuai target nyata)
    // try {
    //   const res = await axios.get(`https://samehadaku.email/episode/${animeId}-ep-${episodeNumber}`);
    //   const $   = cheerio.load(res.data);
    //   const src = $('iframe.player-frame').attr('src');
    //   if (src) servers.push({ name: 'Samehadaku', type: 'iframe', url: src, quality: '720p', isDefault: true });
    // } catch (e) {
    //   console.warn('[VIDEO] Samehadaku failed:', e.message);
    // }

    if (servers.length === 0) {
      throw new Error('VideoProvider: Semua sumber video gagal.');
    }

    return servers;
  }
}

module.exports = new VideoProvider();
