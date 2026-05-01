const BaseProvider = require('./BaseProvider');

/**
 * AniList Provider (GraphQL API - tidak butuh Cheerio)
 * - Source: api.anilist.co (GraphQL, gratis, stabil, CORS-friendly)
 * - Digunakan sebagai fallback Provider B jika MAL timeout/block
 * - Data berkualitas tinggi: judul, cover, deskripsi, genre
 */
class AniListProvider extends BaseProvider {
  constructor() {
    // Base URL GraphQL endpoint
    super('AniList', 'https://graphql.anilist.co');
    // Override client karena AniList pakai POST, bukan GET
    const axios = require('axios');
    this.gqlClient = axios.create({
      baseURL: 'https://graphql.anilist.co',
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async _query(query, variables = {}) {
    const res = await this.gqlClient.post('/', { query, variables });
    return res.data.data;
  }

  /**
   * Ambil anime via AniList GraphQL dengan pagination
   */
  async getLatestAnime(page = 1) {
    const query = `
      query ($page: Int) {
        Page(page: $page, perPage: 50) {
          media(type: ANIME, sort: SCORE_DESC, status: FINISHED) {
            id
            title { romaji english }
            coverImage { large }
            status
            format
            averageScore
            genres
          }
        }
      }
    `;
    
    console.log(`[SCRAPING] Fetching AniList page ${page}...`);
    
    try {
      const data = await this._query(query, { page: parseInt(page) });
      const media = data?.Page?.media || [];

      const results = media.map(m => ({
        _id:        String(m.id),
        slug:       String(m.id),
        title:      m.title.english || m.title.romaji,
        coverImage: m.coverImage?.large || '',
        status:     m.status === 'RELEASING' ? 'Ongoing' : 'Completed',
        type:       m.format === 'TV' ? 'TV' : m.format,
        rating:     m.averageScore ? m.averageScore / 10 : 0
      })).filter(a => a.title && a.coverImage); // validasi
      
      console.log(`[SCRAPING] Berhasil mengambil ${results.length} anime dari AniList halaman ${page}.`);
      return results;
    } catch (error) {
      console.error(`[SCRAPING] Error mengambil AniList halaman ${page}:`, error.message);
      return [];
    }
  }

  /**
   * Ambil detail anime via AniList ID
   */
  async getAnimeDetail(slug) {
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title { romaji english }
          coverImage { large extraLarge }
          description(asHtml: false)
          genres
          status
          format
          episodes
          averageScore
        }
      }
    `;
    const data = await this._query(query, { id: parseInt(slug) });
    const m = data?.Media;
    if (!m) throw new Error(`AniList: Anime ${slug} not found`);

    const totalEpisodes = m.episodes || 12;
    const episodes = Array.from({ length: totalEpisodes }, (_, i) => ({
      _id:           `${slug}-ep-${i + 1}`,
      episodeNumber: i + 1,
      title:         `Episode ${i + 1}`
    }));

    return {
      _id:            String(m.id),
      slug:           String(m.id),
      title:          m.title.english || m.title.romaji,
      coverImage:     m.coverImage?.extraLarge || m.coverImage?.large || '',
      description:    m.description?.replace(/<[^>]+>/g, '') || '', // strip HTML tags
      genres:         m.genres || [],
      rating:         m.averageScore ? m.averageScore / 10 : 0,
      status:         m.status === 'RELEASING' ? 'Ongoing' : 'Completed',
      type:           m.format === 'TV' ? 'TV' : (m.format || 'TV'),
      totalEpisodes:  totalEpisodes,
      currentEpisode: totalEpisodes,
      episodes:       episodes
    };
  }

  async getEpisodeDetail(slug) {
    const videoProvider = require('../video/VideoProvider');
    const parts    = slug.split('-ep-');
    const animeId  = parts[0];
    const epNumber = parts[1] ? parseInt(parts[1]) : 1;
    const servers  = await videoProvider.getVideoServers(animeId, epNumber);

    return {
      _id:           slug,
      title:         `Episode ${epNumber}`,
      animeId:       animeId,
      episodeNumber: epNumber,
      servers:       servers
    };
  }
}

module.exports = new AniListProvider();
