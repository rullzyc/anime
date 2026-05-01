const cheerio = require('cheerio');
const scraperManager = require('./scraperManager');

const BASE_URL = 'https://otakudesu.fit'; 

class OtakudesuParser {
  async getLatestAnime(page = 1) {
    const url = page > 1 ? `${BASE_URL}/page/${page}/` : `${BASE_URL}/`;
    const cacheKey = `otaku_latest_p${page}`;
    
    // Menunggu container .venz agar data dipastikan sudah ter-load
    const html = await scraperManager.getHTMLWithFallback(cacheKey, url, '.venz');
    const $ = cheerio.load(html);
    const results = [];

    $('.venz a.tip').each((i, el) => {
      const title = $(el).find('.title div').text().trim() || $(el).attr('title') || "";
      const endpoint = $(el).attr('href');
      const slug = endpoint ? endpoint.split('/').filter(Boolean).pop() : `otaku-${i}`;
      const coverImage = $(el).find('img').attr('src');
      
      // Di struktur baru, episode ada di dalam .episode span
      const epText = $(el).find('.episode span').first().text().trim(); 

      if (title && slug) {
        // Membersihkan judul dari kata "Subtitle Indonesia" jika ada
        const cleanTitle = title.replace(/Subtitle Indonesia/gi, '').replace(/Episode \d+/gi, '').trim();

        results.push({
          _id: slug,
          slug: slug,
          title: cleanTitle,
          coverImage: coverImage,
          status: 'Ongoing',
          type: 'TV',
          rating: 0, 
          currentEpisode: parseInt(epText.replace(/[^0-9]/g, '')) || 0
        });
      }
    });

    return results;
  }

  async getAnimeDetail(slug) {
    const url = `${BASE_URL}/series/${slug}/`;
    const cacheKey = `otaku_detail_${slug}`;
    
    const html = await scraperManager.getHTMLWithFallback(cacheKey, url, '.fotoanime');
    const $ = cheerio.load(html);

    const title = $('.infozingle p:contains("Judul")').text().replace('Judul:', '').trim() || $('.jdlrx h1').text().trim();
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

    const html = await scraperManager.getHTMLWithFallback(cacheKey, url, '.mirror');
    const $ = cheerio.load(html);

    // Selector video di domain .fit
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
