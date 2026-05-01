/**
 * MultiSourceParser — Orkestrator yang menggabungkan data dari:
 * 1. otakudesu.blog (prioritas 1)
 * 2. otakudesu.fit  (prioritas 2)
 * 3. v2.samehadaku.how (prioritas 3)
 */

const blogParser = require('./otakudesoBlogParser');
const fitParser  = require('./otakudesuParser');
const samaParser = require('./samehadakuParser');

const PARSERS = [blogParser, fitParser, samaParser];

class MultiSourceParser {
  /**
   * De-duplikasi berdasarkan judul yang dinormalisasi
   */
  _deduplicate(items) {
    const seen = new Set();
    return items.filter(item => {
      const key = (item.title || '').toLowerCase().replace(/\s+/g, '');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * GET /api/anime/latest — gabungkan dari semua sumber
   */
  async getLatestAnime(page = 1) {
    console.log('[MULTI] Mengambil anime terbaru dari semua sumber...');

    const results = await Promise.allSettled(
      PARSERS.map(p => p.getLatestAnime(page).catch(() => []))
    );

    const combined = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
    const unique = this._deduplicate(combined);

    console.log(`[MULTI] Total setelah de-duplikasi: ${unique.length} anime.`);
    return unique;
  }

  /**
   * GET /api/anime/search?q= — paralel ke semua sumber
   */
  async searchAnime(query) {
    console.log(`[MULTI] Mencari "${query}" dari semua sumber...`);

    const results = await Promise.allSettled(
      PARSERS.map(p => p.searchAnime(query).catch(() => []))
    );

    const combined = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
    const unique = this._deduplicate(combined);

    console.log(`[MULTI] Search "${query}": ${unique.length} hasil unik.`);
    return unique;
  }

  /**
   * GET /api/anime/:id — coba setiap sumber sampai berhasil
   */
  async getAnimeDetail(slug) {
    console.log(`[MULTI] Detail anime "${slug}" — mencoba semua sumber...`);

    for (const parser of PARSERS) {
      try {
        const detail = await parser.getAnimeDetail(slug);
        if (detail && (detail.episodes?.length > 0 || detail.title)) {
          console.log(`[MULTI] Detail "${slug}" berhasil dari ${detail.source || 'parser'}.`);
          return detail;
        }
      } catch (err) {
        console.warn(`[MULTI] Parser gagal untuk detail "${slug}": ${err.message}`);
      }
    }

    throw new Error(`Anime "${slug}" tidak ditemukan di semua sumber.`);
  }

  /**
   * GET /api/episode/:id — coba setiap sumber sampai mendapat servers
   */
  async getEpisodeVideo(epSlug) {
    console.log(`[MULTI] Video episode "${epSlug}" — mencoba semua sumber...`);

    for (const parser of PARSERS) {
      try {
        const result = await parser.getEpisodeVideo(epSlug);
        if (result && result.servers && result.servers.length > 0) {
          console.log(`[MULTI] Video "${epSlug}": ${result.servers.length} server dari ${result.servers[0]?.url?.split('/')[2] || 'parser'}.`);
          return result;
        }
      } catch (err) {
        console.warn(`[MULTI] Parser gagal untuk video "${epSlug}": ${err.message}`);
      }
    }

    // Kembalikan struktur kosong jika semua gagal
    console.error(`[MULTI] Semua sumber gagal untuk video "${epSlug}".`);
    return { _id: epSlug, title: '', servers: [] };
  }
}

module.exports = new MultiSourceParser();
