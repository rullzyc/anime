const cheerio = require('cheerio');
const scraperManager = require('./scraperManager');

const BASE_URL = 'https://otakudesu.fit'; 

class OtakudesuParser {
  async getLatestAnime(page = 1) {
    const url = page > 1 ? `${BASE_URL}/ongoing-anime/page/${page}/` : `${BASE_URL}/ongoing-anime/`;
    const cacheKey = `otaku_ongoing_p${page}`;
    
    console.log(`[PARSER] Mencoba mengambil data dari: ${url}`);
    
    try {
      const html = await scraperManager.getHTMLWithFallback(cacheKey, url, '.venz');
      const $ = cheerio.load(html);
      const results = [];

      const cards = $('.venz li');
      console.log(`[PARSER] Analisis HTML selesai. Ditemukan ${cards.length} elemen '.venz li'.`);

      cards.each((i, el) => {
        const title = $(el).find('h2.jdlflm').text().trim();
        const endpoint = $(el).find('.thumb a').attr('href');
        const seriesSlug = endpoint ? endpoint.split('/').filter(Boolean).pop() : null;
        const coverImage = $(el).find('img').attr('src');
        
        const epText = $(el).find('.epz').text().replace(/[^0-9]/g, '').trim(); 
        const epNum = parseInt(epText) || 0;

        if (title && seriesSlug) {
          results.push({
            _id: seriesSlug,
            slug: seriesSlug,
            title: title,
            coverImage: coverImage,
            status: 'Ongoing',
            type: 'TV',
            rating: 0, 
            currentEpisode: epNum
          });
        }
      });

      console.log(`[PARSER] Berhasil memproses ${results.length} anime.`);
      return results;
    } catch (err) {
      console.error(`[PARSER] Gagal mengambil data: ${err.message}`);
      return [];
    }
  }

  async searchAnime(query) {
    const url = `${BASE_URL}/?s=${encodeURIComponent(query)}&post_type=anime`;
    const cacheKey = `otaku_search_${query.replace(/\s+/g, '_')}`;
    
    console.log(`[PARSER] Searching anime: ${query}`);
    
    try {
      const html = await scraperManager.getHTMLWithFallback(cacheKey, url, 'ul.chivsrc');
      const $ = cheerio.load(html);
      const results = [];

      $('ul.chivsrc li').each((i, el) => {
        const title = $(el).find('h2 a').text().trim() || $(el).find('h2').text().trim();
        const endpoint = $(el).find('h2 a').attr('href');
        const slug = endpoint ? endpoint.split('/').filter(Boolean).pop() : null;
        const coverImage = $(el).find('img').attr('src');
        
        const setTags = $(el).find('.set').text();
        const statusMatch = setTags.match(/Status\s*:\s*(.*)/i);
        const typeMatch = setTags.match(/Tipe\s*:\s*(.*)/i);

        if (title && slug) {
          results.push({
            _id: slug,
            slug: slug,
            title: title.replace(/Subtitle Indonesia/gi, '').trim(),
            coverImage: coverImage,
            status: statusMatch ? statusMatch[1].trim() : 'Unknown',
            type: typeMatch ? typeMatch[1].trim() : 'TV',
            rating: 0,
            currentEpisode: 0
          });
        }
      });

      console.log(`[PARSER] Search found ${results.length} results.`);
      return results;
    } catch (err) {
      console.error(`[PARSER] Search failed: ${err.message}`);
      return [];
    }
  }

  async getAnimeDetail(slug) {
    const url = `${BASE_URL}/anime/${slug}/`;
    const cacheKey = `otaku_detail_${slug}`;
    
    const html = await scraperManager.getHTMLWithFallback(cacheKey, url, 'body');
    const $ = cheerio.load(html);

    const title = $('.infozingle p:contains("Judul")').text().replace('Judul:', '').trim() || $('.jdlrx h1').text().trim() || slug;
    const coverImage = $('.fotoanime img').attr('src');
    const description = $('.sinopc p').text().trim();
    
    const episodes = [];
    $('.episodelist:not(.bookmark) ul li').each((i, el) => {
      const epTitle = $(el).find('a').text().trim();
      const epEndpoint = $(el).find('a').attr('href');
      const epSlug = epEndpoint ? epEndpoint.split('/').filter(Boolean).pop() : '';
      const date = $(el).find('.zeebr').text().trim();

      const epNumMatch = epTitle.match(/Episode\s+(\d+)/i);
      const epNum = epNumMatch ? parseInt(epNumMatch[1]) : (i + 1);

      if (epSlug) {
        episodes.push({
          _id: epSlug,
          episodeNumber: epNum,
          title: epTitle,
          airDate: date
        });
      }
    });

    return {
      _id: slug,
      slug: slug,
      title: title,
      coverImage: coverImage,
      description: description,
      status: $('.infozingle p:contains("Status")').text().includes('Ongoing') ? 'Ongoing' : 'Completed',
      type: 'TV',
      episodes: episodes.reverse() 
    };
  }

  _decodeIframeFromBase64(encoded) {
    try {
      const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
      const m = decoded.match(/src=["']([^"']+)["']/);
      return m ? m[1] : null;
    } catch {
      return null;
    }
  }

  async getEpisodeVideo(epSlug) {
    const url = `${BASE_URL}/${epSlug}/`;
    const cacheKey = `otaku_video_${epSlug}`;
    console.log(`[PARSER] Video episode: ${url}`);

    try {
      const html = await scraperManager.getHTMLWithFallback(cacheKey, url, 'body');
      const $ = cheerio.load(html);

      const title = $('h1.entry-title, .venutama h1, h1').first().text().trim();
      const servers = [];

      // Metode utama: Mirror select dengan base64 encoding
      // otakudesu.fit menyimpan iframe dalam base64 di setiap <option>
      $('select.mirror option, .mirrorstream option').each((i, el) => {
        const encoded = $(el).val();
        const label = $(el).text().trim();
        if (encoded && encoded.length > 20) {
          const iframeSrc = this._decodeIframeFromBase64(encoded);
          if (iframeSrc) {
            servers.push({
              name: label || `Server ${i + 1}`,
              type: 'iframe',
              url: iframeSrc,
              quality: 'Auto',
              isDefault: i === 0
            });
          }
        }
      });

      // Metode fallback: iframe langsung di container
      if (servers.length === 0) {
        const iframeSrc = $(
          'div#pembed iframe, div.player-embed iframe, .responsive-embed-container iframe, .video-content iframe'
        ).first().attr('src');
        if (iframeSrc) {
          servers.push({ name: 'Default Server', type: 'iframe', url: iframeSrc, quality: 'Auto', isDefault: true });
        }
      }

      console.log(`[PARSER] Video: ${servers.length} server ditemukan untuk ${epSlug}.`);
      return { _id: epSlug, title, servers };
    } catch (err) {
      console.error(`[PARSER] getEpisodeVideo gagal: ${err.message}`);
      return { _id: epSlug, title: '', servers: [] };
    }
  }
}

module.exports = new OtakudesuParser();
