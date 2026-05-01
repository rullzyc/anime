const cheerio = require('cheerio');
const scraperManager = require('./scraperManager');

const BASE_URL = 'https://otakudesu.fit'; 

class OtakudesuParser {
  async getLatestAnime(page = 1) {
    const url = page > 1 ? `${BASE_URL}/ongoing-anime/page/${page}/` : `${BASE_URL}/ongoing-anime/`;
    const cacheKey = `otaku_latest_p${page}`;
    
    const html = await scraperManager.getHTMLWithFallback(cacheKey, url, 'ul.venz');
    const $ = cheerio.load(html);
    const results = [];

    $('.venz ul li').each((i, el) => {
      const title = $(el).find('h2.jdlflm').text().trim();
      const endpoint = $(el).find('a').attr('href');
      const slug = endpoint ? endpoint.split('/').filter(Boolean).pop() : `otaku-${i}`;
      const coverImage = $(el).find('img').attr('src');
      const epText = $(el).find('.epz').text().trim(); 

      if (title && slug) {
        results.push({
          _id: slug,
          slug: slug,
          title: title,
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
    const url = `${BASE_URL}/anime/${slug}/`;
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
    const url = `${BASE_URL}/episode/${epSlug}/`;
    const cacheKey = `otaku_video_${epSlug}`;

    const html = await scraperManager.getHTMLWithFallback(cacheKey, url, '#lightsVideo');
    const $ = cheerio.load(html);

    let iframeUrl = $('#lightsVideo iframe').attr('src');
    if (!iframeUrl) {
      iframeUrl = $('.responsive-embed iframe').attr('src');
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
