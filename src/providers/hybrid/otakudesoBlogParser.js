const cheerio = require('cheerio');
const scraperManager = require('./scraperManager');

const BASE_URL = 'https://otakudesu.blog';

class OtakudesoBlogParser {
  _cleanTitle(title = '') {
    return title.replace(/Subtitle Indonesia/gi, '').replace(/Episode\s+\d+/gi, '').trim();
  }

  _extractSeriesSlug(rawSlug = '') {
    return rawSlug
      .replace(/-episode-\d+.*$/i, '')
      .replace(/-sub-.*$/i, '')
      .replace(/-subtitle-indonesia.*$/i, '');
  }

  /**
   * Decode base64 mirror option & extract iframe src
   */
  _decodeIframeFromBase64(encoded) {
    try {
      const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
      const m = decoded.match(/src=["']([^"']+)["']/);
      return m ? m[1] : null;
    } catch {
      return null;
    }
  }

  async getLatestAnime(page = 1) {
    const url = page > 1 ? `${BASE_URL}/page/${page}/` : `${BASE_URL}/`;
    const cacheKey = `blog_latest_p${page}`;
    console.log(`[BLOG] Mengambil data dari: ${url}`);

    try {
      const html = await scraperManager.getHTMLWithFallback(cacheKey, url, 'article.bs');
      const $ = cheerio.load(html);
      const results = [];

      $('article.bs').each((i, el) => {
        const fullTitle = $(el).find('.tt h2').text().trim() || $(el).find('a.tip').attr('title') || '';
        const endpoint = $(el).find('a.tip').attr('href');
        const rawSlug = endpoint ? endpoint.split('/').filter(Boolean).pop() : null;
        const coverImage = $(el).find('img').attr('src');
        const epText = $(el).find('.epx').text().replace(/[^0-9]/g, '').trim();
        const epNum = parseInt(epText) || 0;

        if (fullTitle && rawSlug && !rawSlug.includes('genre')) {
          const seriesSlug = this._extractSeriesSlug(rawSlug);
          const cleanTitle = this._cleanTitle(fullTitle);
          results.push({
            _id: seriesSlug,
            slug: seriesSlug,
            title: cleanTitle,
            coverImage,
            status: 'Ongoing',
            type: 'TV',
            rating: 0,
            currentEpisode: epNum,
            source: 'otakudesu.blog'
          });
        }
      });

      console.log(`[BLOG] Ditemukan ${results.length} anime.`);
      return results;
    } catch (err) {
      console.error(`[BLOG] getLatestAnime gagal: ${err.message}`);
      return [];
    }
  }

  async searchAnime(query) {
    const url = `${BASE_URL}/?s=${encodeURIComponent(query)}`;
    const cacheKey = `blog_search_${query.replace(/\s+/g, '_')}`;
    console.log(`[BLOG] Mencari: ${query}`);

    try {
      const html = await scraperManager.getHTMLWithFallback(cacheKey, url, 'article.bs');
      const $ = cheerio.load(html);
      const results = [];

      $('article.bs').each((i, el) => {
        const title = $(el).find('.tt h2').text().trim() || $(el).find('a.tip').attr('title') || '';
        const endpoint = $(el).find('a.tip').attr('href');
        const slug = endpoint ? endpoint.split('/').filter(Boolean).pop() : null;
        const coverImage = $(el).find('img').attr('src');
        const type = $(el).find('.typez').text().trim();

        if (title && slug) {
          results.push({
            _id: slug,
            slug,
            title: this._cleanTitle(title),
            coverImage,
            status: 'Unknown',
            type: type || 'TV',
            rating: 0,
            currentEpisode: 0,
            source: 'otakudesu.blog'
          });
        }
      });

      console.log(`[BLOG] Search "${query}": ${results.length} hasil.`);
      return results;
    } catch (err) {
      console.error(`[BLOG] searchAnime gagal: ${err.message}`);
      return [];
    }
  }

  async getAnimeDetail(slug) {
    const url = `${BASE_URL}/anime/${slug}/`;
    const cacheKey = `blog_detail_${slug}`;
    console.log(`[BLOG] Detail anime: ${url}`);

    try {
      const html = await scraperManager.getHTMLWithFallback(cacheKey, url, '.episodelist');
      const $ = cheerio.load(html);

      const title = $('.infozingle p:contains("Judul")').text().replace('Judul:', '').trim()
        || $('h1.entry-title').text().trim()
        || slug;
      const coverImage = $('.fotoanime img').attr('src');
      const description = $('.sinopc p').text().trim();
      const status = $('.infozingle p:contains("Status")').text().includes('Ongoing') ? 'Ongoing' : 'Completed';

      const episodes = [];
      $('.episodelist:not(.bookmark) ul li').each((i, el) => {
        const epTitle = $(el).find('a').text().trim();
        const epEndpoint = $(el).find('a').attr('href');
        const epSlug = epEndpoint ? epEndpoint.split('/').filter(Boolean).pop() : '';
        const date = $(el).find('.zeebr').text().trim();
        const epNumMatch = epTitle.match(/Episode\s+(\d+)/i);
        const epNum = epNumMatch ? parseInt(epNumMatch[1]) : (i + 1);

        if (epSlug) {
          episodes.push({ _id: epSlug, episodeNumber: epNum, title: epTitle, airDate: date });
        }
      });

      return { _id: slug, slug, title, coverImage, description, status, type: 'TV', episodes: episodes.reverse(), source: 'otakudesu.blog' };
    } catch (err) {
      console.error(`[BLOG] getAnimeDetail gagal: ${err.message}`);
      throw err;
    }
  }

  async getEpisodeVideo(epSlug) {
    const url = `${BASE_URL}/${epSlug}/`;
    const cacheKey = `blog_video_${epSlug}`;
    console.log(`[BLOG] Video episode: ${url}`);

    try {
      const html = await scraperManager.getHTMLWithFallback(cacheKey, url, 'body');
      const $ = cheerio.load(html);

      const title = $('h1.entry-title, .venutama h1, h1').first().text().trim();
      const servers = [];

      // Metode 1: Mirror select dengan base64 encoding
      $('select.mirror option, .mirrorstream option').each((i, el) => {
        const encoded = $(el).val();
        const label = $(el).text().trim();
        if (encoded && encoded.length > 20) {
          const iframeSrc = this._decodeIframeFromBase64(encoded);
          if (iframeSrc) {
            servers.push({ name: label || `Server ${i + 1}`, type: 'iframe', url: iframeSrc, quality: 'Auto', isDefault: i === 0 });
          }
        }
      });

      // Metode 2: iframe langsung
      if (servers.length === 0) {
        const iframeSrc = $('div#pembed iframe, div.player-embed iframe, .responsive-embed-stream iframe').first().attr('src');
        if (iframeSrc) {
          servers.push({ name: 'Default Server', type: 'iframe', url: iframeSrc, quality: 'Auto', isDefault: true });
        }
      }

      console.log(`[BLOG] Video: ${servers.length} server ditemukan.`);
      return { _id: epSlug, title, servers };
    } catch (err) {
      console.error(`[BLOG] getEpisodeVideo gagal: ${err.message}`);
      return { _id: epSlug, title: '', servers: [] };
    }
  }
}

module.exports = new OtakudesoBlogParser();
