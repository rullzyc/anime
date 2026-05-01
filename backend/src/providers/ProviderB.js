const BaseProvider = require('./BaseProvider');

const SELECTORS = {
  LIST_ITEM: '.post-item',
  TITLE: '.entry-title',
  COVER: '.thumb img',
  LINK: '.thumb a',
  DETAIL_TITLE: '.infox h1',
  DETAIL_DESC: '.entry-content p',
  EPISODE_LIST: '.ep-list li',
  IFRAME: '.video-content iframe'
};

class ProviderB extends BaseProvider {
  constructor() {
    super('ProviderB (Samehadaku)', 'https://samehadaku.email'); 
  }

  async getLatestAnime() {
    // Simulasi respons lambat yang akan tertangkap timeout di dunia nyata
    return [
      {
        _id: 'b1',
        slug: 'one-piece',
        title: 'One Piece (Provider B)',
        coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-YrQcross-fmn.jpg',
        status: 'Ongoing',
        type: 'TV'
      }
    ];
  }

  async getAnimeDetail(slug) {
    return {
      _id: slug,
      slug: slug,
      title: 'One Piece (Scraped from B)',
      coverImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx21-YrQcross-fmn.jpg',
      description: 'Hasil scraping dari Provider B menggunakan selector ' + SELECTORS.DETAIL_DESC,
      genres: ['Action', 'Adventure'],
      rating: 8.8,
      status: 'Ongoing',
      type: 'TV',
      totalEpisodes: 1100,
      currentEpisode: 1100,
      episodes: [
        {
          _id: `${slug}-ep-1100`,
          episodeNumber: 1100,
          title: 'Episode 1100'
        }
      ]
    };
  }

  async getEpisodeDetail(slug) {
    return {
      _id: slug,
      title: 'Episode 1100 (Scraped from B)',
      animeId: 'one-piece',
      episodeNumber: 1100,
      servers: [
        {
          name: 'Server 1 (Embed B)',
          type: 'iframe',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
        },
        {
          name: 'Server 2 (HLS B)',
          type: 'hls',
          url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
        }
      ]
    };
  }
}

module.exports = new ProviderB();
