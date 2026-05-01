const cheerio = require('cheerio');
const scraperManager = require('./scraperManager');

const BASE_URL = 'https://otakudesu.fit'; 

class OtakudesuParser {
  async getLatestAnime(page = 1) {
    const url = page > 1 ? `${BASE_URL}/page/${page}/` : `${BASE_URL}/`;
    const cacheKey = `otaku_latest_p${page}`;
    
    console.log(`[PARSER] Mencoba mengambil data dari: ${url}`);
    
    try {
      // Kita tunggu selector 'article.bs' karena .venz sudah hilang
      const html = await scraperManager.getHTMLWithFallback(cacheKey, url, 'article.bs');
      const $ = cheerio.load(html);
      const results = [];

      // Mencari semua article.bs
      const cards = $('article.bs');
      console.log(`[PARSER] Analisis HTML selesai. Ditemukan ${cards.length} elemen 'article.bs'.`);

      cards.each((i, el) => {
        const fullTitle = $(el).find('.tt h2').text().trim() || $(el).find('a.tip').attr('title') || "";
        const endpoint = $(el).find('a.tip').attr('href');
        const rawSlug = endpoint ? endpoint.split('/').filter(Boolean).pop() : null;
        const coverImage = $(el).find('img').attr('src');
        
        // Episode di .fit: .epx
        const epText = $(el).find('.epx').text().replace(/[^0-9]/g, '').trim(); 
        const epNum = parseInt(epText) || 0;

        if (fullTitle && rawSlug && !rawSlug.includes('genre')) {
          // Bersihkan slug jika itu adalah slug episode
          // Contoh: hokuto-no-ken-episode-5-subtitle-indonesia -> hokuto-no-ken
          let seriesSlug = rawSlug.replace(/-episode-\d+.*$/i, '').replace(/-sub-.*$/i, '').replace(/-subtitle-indonesia.*$/i, '');
          
          // Bersihkan judul dari embel-embel episode
          const cleanTitle = fullTitle.replace(/Subtitle Indonesia/gi, '').replace(/Episode \d+/gi, '').trim();

          results.push({
            _id: seriesSlug,
            slug: seriesSlug,
            title: cleanTitle,
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
    const url = `${BASE_URL}/?s=${encodeURIComponent(query)}`;
    const cacheKey = `otaku_search_${query.replace(/\s+/g, '_')}`;
    
    console.log(`[PARSER] Searching anime: ${query}`);
    
    try {
      // Kita tunggu selector 'div.listupd' atau 'article.bs'
      const html = await scraperManager.getHTMLWithFallback(cacheKey, url, 'article.bs');
      const $ = cheerio.load(html);
      const results = [];

      $('article.bs').each((i, el) => {
        const title = $(el).find('.tt h2').text().trim() || $(el).find('a.tip').attr('title');
        const endpoint = $(el).find('a.tip').attr('href');
        const slug = endpoint ? endpoint.split('/').filter(Boolean).pop() : null;
        const coverImage = $(el).find('img').attr('src');
        
        // Extract status and type
        const status = $(el).find('.bt .epx').text().trim();
        const type = $(el).find('.typez').text().trim();

        if (title && slug) {
          results.push({
            _id: slug,
            slug: slug,
            title: title.replace(/Subtitle Indonesia/gi, '').trim(),
            coverImage: coverImage,
            status: status || 'Unknown',
            type: type || 'TV',
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
    const url = `${BASE_URL}/series/${slug}/`;
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

  async getEpisodeVideo(epSlug) {
    const url = `${BASE_URL}/${epSlug}/`;
    const cacheKey = `otaku_video_${epSlug}`;

    const html = await scraperManager.getHTMLWithFallback(cacheKey, url, 'body');
    const $ = cheerio.load(html);

    let iframeUrl = $('.responsive-embed-container iframe').attr('src') || $('.video-content iframe').attr('src');
    
    if (!iframeUrl) {
      iframeUrl = $('iframe[src*="desustream"], iframe[src*="filemoon"], iframe[src*="vidhide"]').attr('src');
    }

    const title = $('.venutama h1').text().trim();

    return {
      _id: epSlug,
      title: title,
      servers: iframeUrl ? [{
        name: 'Otakudesu Server',
        type: 'iframe',
        url: iframeUrl,
        quality: 'Auto',
        isDefault: true
      }] : []
    };
  }
}

module.exports = new OtakudesuParser();
