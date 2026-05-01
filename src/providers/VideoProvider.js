// Flag ini idealnya ditaruh di .env: USE_DUMMY_VIDEO=true
const USE_DUMMY_VIDEO = process.env.USE_DUMMY_VIDEO !== 'false';

class VideoProvider {
  /**
   * Mengembalikan daftar server video untuk episode tertentu.
   * Format konsisten: [{ name, type: 'hls' | 'iframe', url, quality }]
   */
  async getVideoServers(animeId, episodeNumber) {
    if (USE_DUMMY_VIDEO) {
      return this._getDummyServers(animeId, episodeNumber);
    }
    
    // Nanti logika scraping video nyata bisa ditaruh di sini
    // const $ = await loadHTML(...);
    // return extractServers($);
    throw new Error('Real video scraping not implemented yet.');
  }

  /**
   * Menghasilkan server dummy realistis untuk testing fallback player frontend.
   * Server 1 (HLS) sering diprogram gagal (error 404/cors) untuk ngetes fitur auto-fallback.
   */
  _getDummyServers(animeId, episodeNumber) {
    return [
      {
        name: 'Server Utama (HLS)',
        type: 'hls',
        // Mux test stream yang dijamin valid dan berjalan lancar
        url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        quality: '1080p',
        isDefault: true
      },
      {
        name: 'Server Cadangan (Iframe)',
        type: 'iframe',
        // YouTube Embed Video (Valid)
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
        quality: '720p',
        isDefault: false
      },
      {
        name: 'Server Rusak (Test Fallback)',
        type: 'hls',
        // URL ngawur untuk mengetes error handling player
        url: 'https://domain-tidak-ada.com/video.m3u8',
        quality: '480p',
        isDefault: false
      }
    ];
  }
}

module.exports = new VideoProvider();
