const BaseProvider = require('./BaseProvider');

/**
 * MyAnimeList Provider
 * - Source: myanimelist.net (Legal, stabil, data berkualitas tinggi)
 * - Data: List anime top-rated, detail anime (synopsis, genre), daftar episode
 * - CATATAN: MAL adalah basis data, bukan streaming. Video datang dari VideoProvider.
 */
class MALProvider extends BaseProvider {
  constructor() {
    super('MyAnimeList', 'https://myanimelist.net');
  }

  /**
   * Scrape daftar anime top-rated dari halaman /topanime.php
   * MyAnimeList menggunakan parameter 'limit' untuk pagination (0, 50, 100...)
   */
  async getLatestAnime(page = 1) {
    // MAL menampilkan 50 item per halaman.
    const limitOffset = (page - 1) * 50;
    const urlPath = limitOffset > 0 ? `/topanime.php?limit=${limitOffset}` : '/topanime.php';
    
    console.log(`[SCRAPING] Fetching MAL page ${page} from ${urlPath}...`);
    
    try {
      const $ = await this.loadHTML(urlPath);
      const results = [];

      $('.ranking-list').each((index, element) => {
        const title  = $(element).find('.detail h3 a').text().trim();
        const link   = $(element).find('.detail h3 a').attr('href') || '';
        const slug   = link.split('/')[4] || `anime-${index}-${page}`;

        const rawImg = $(element).find('td.title > a img').attr('data-src') ||
                       $(element).find('td.title > a img').attr('src') || '';
        const coverImage = rawImg.replace(/r\/\d+x\d+\//, '').split('?')[0];

        const rawScore = $(element).find('.score-label').text().trim();
        const rating   = parseFloat(rawScore) || 0;

        if (!title || !slug || !coverImage) return;

        results.push({
          _id:          slug,
          slug:         slug,
          title:        title,
          coverImage:   coverImage,
          status:       'Ongoing',
          type:         'TV',
          rating:       rating
        });
      });

      console.log(`[SCRAPING] Berhasil mengambil ${results.length} anime dari halaman ${page}.`);
      return results;
    } catch (error) {
      console.error(`[SCRAPING] Error mengambil halaman ${page}:`, error.message);
      return []; // Return array kosong jika halaman tidak bisa diambil
    }
  }

  /**
   * Scrape halaman detail anime dari /anime/:slug
   * Mengambil: judul, sinopsis, genre, total episode, cover image
   */
  async getAnimeDetail(slug) {
    const $ = await this.loadHTML(`/anime/${slug}`);

    const title       = $('.title-name').first().text().trim() || slug;
    const description = $('[itemprop="description"]').text().trim() || '';
    const rawImg      = $('.leftside img').first().attr('data-src') ||
                        $('.leftside img').first().attr('src') || '';
    const coverImage  = rawImg.replace(/r\/\d+x\d+\//, '').split('?')[0];

    const genres = [];
    $('[itemprop="genre"]').each((i, el) => genres.push($(el).text().trim()));

    // Cari teks "Episodes:" di sidebar info
    let totalEpisodes = 12; // default fallback
    $('.spaceit_pad').each((_, el) => {
      const text = $(el).text();
      if (text.includes('Episodes:')) {
        const n = parseInt(text.replace('Episodes:', '').trim());
        if (!isNaN(n) && n > 0 && n < 3000) totalEpisodes = n;
      }
    });

    // Bangkitkan episode list
    const episodes = Array.from({ length: totalEpisodes }, (_, i) => ({
      _id:           `${slug}-ep-${i + 1}`,
      episodeNumber: i + 1,
      title:         `Episode ${i + 1}`
    }));

    return {
      _id:            slug,
      slug:           slug,
      title:          title,
      coverImage:     coverImage,
      description:    description,
      genres:         genres,
      rating:         0,       // disiapkan untuk integrasi score
      status:         'Ongoing',
      type:           'TV',
      totalEpisodes:  totalEpisodes,
      currentEpisode: totalEpisodes,
      episodes:       episodes
    };
  }

  /**
   * MAL tidak menyediakan video streaming.
   * Delegasikan ke VideoProvider.
   */
  async getEpisodeDetail(slug) {
    const videoProvider = require('../video/VideoProvider');
    const parts      = slug.split('-ep-');
    const animeId    = parts[0];
    const epNumber   = parts[1] ? parseInt(parts[1]) : 1;
    const servers    = await videoProvider.getVideoServers(animeId, epNumber);

    return {
      _id:           slug,
      title:         `Episode ${epNumber}`,
      animeId:       animeId,
      episodeNumber: epNumber,
      servers:       servers
    };
  }
}

module.exports = new MALProvider();
