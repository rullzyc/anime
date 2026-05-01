const BaseProvider = require('./BaseProvider');
const cheerio = require('cheerio');

class ProviderA extends BaseProvider {
  constructor() {
    // Kita gunakan MyAnimeList sebagai contoh scraping karena strukturnya stabil dan legal untuk dipelajari
    super('MyAnimeList', 'https://myanimelist.net'); 
  }

  async getLatestAnime() {
    console.log('[SCRAPING] Fetching data from MyAnimeList...');
    
    // 1. Mengambil HTML mentah dari website target
    const response = await this.client.get('/topanime.php');
    
    // 2. Memasukkan HTML ke dalam Cheerio agar bisa di-query seperti jQuery
    const $ = cheerio.load(response.data);
    const results = [];

    // 3. Looping setiap elemen baris anime
    // Selector: <tr class="ranking-list">
    $('.ranking-list').each((index, element) => {
      // Kita batasi hanya ambil 12 anime teratas saja
      if (index >= 12) return false; 

      // Selector Judul: di dalam class "detail", cari <h3>, lalu <a>
      const title = $(element).find('.detail h3 a').text().trim();
      
      // Selector Link: ambil attribute "href" dari link judul
      const link = $(element).find('.detail h3 a').attr('href');
      
      // Selector Gambar: MAL menggunakan lazyload (data-src) pada img di dalam <a> pertama
      const coverImageRaw = $(element).find('td.title > a img').attr('data-src') || $(element).find('td.title > a img').attr('src') || '';
      
      // Bersihkan URL gambar MAL (hapus resolusi kecil r/50x70/ agar dapat gambar HD dan hapus signature query param)
      const coverImage = coverImageRaw.replace('r/50x70/', '').split('?')[0];

      // Ekstrak ID/Slug dari link MAL (contoh: https://myanimelist.net/anime/52991/Sousou_no_Frieren -> 52991)
      const slug = link ? link.split('/')[4] : `anime-${index}`;

      results.push({
        _id: slug,
        slug: slug,
        title: title,
        coverImage: coverImage,
        status: 'Ongoing', // Hardcoded sementara karena kita hanya fokus ke daftar
        type: 'TV',
        rating: 9.0 // Hardcoded sementara
      });
    });

    console.log(`[SCRAPING] Berhasil mengambil ${results.length} anime!`);
    return results;
  }

  // --- Fungsi Detail ---
  async getAnimeDetail(slug) {
    console.log(`[SCRAPING] Fetching detail for anime: ${slug}...`);
    const response = await this.client.get(`/anime/${slug}`);
    const $ = cheerio.load(response.data);

    const title = $('.title-name').text().trim() || slug;
    const description = $('[itemprop="description"]').text().trim() || 'No synopsis available.';
    const coverImageRaw = $('.leftside img').attr('data-src') || $('.leftside img').attr('src') || '';
    const coverImage = coverImageRaw.replace('r/50x70/', '').split('?')[0];

    const genres = [];
    $('[itemprop="genre"]').each((i, el) => genres.push($(el).text().trim()));

    // Coba ambil jumlah episode
    let epsText = '';
    $('.spaceit_pad').each((i, el) => {
      if ($(el).text().includes('Episodes:')) {
        epsText = $(el).text().replace('Episodes:', '').trim();
      }
    });
    
    let totalEps = parseInt(epsText);
    if (isNaN(totalEps) || totalEps <= 0) totalEps = 12; // Default 12 jika tidak diketahui

    // Bangkitkan array episode
    const episodes = [];
    for (let i = 1; i <= totalEps; i++) {
      episodes.push({
        _id: `${slug}-ep-${i}`,
        episodeNumber: i,
        title: `Episode ${i}`
      });
    }

    return {
      _id: slug,
      slug: slug,
      title: title,
      coverImage: coverImage,
      description: description,
      genres: genres,
      rating: 9.0, // Hardcoded for now
      status: 'Ongoing',
      type: 'TV',
      totalEpisodes: totalEps,
      currentEpisode: totalEps,
      episodes: episodes
    };
  }

  async getEpisodeDetail(slug) {
    // Slug biasanya berbentuk animeId-ep-number
    const parts = slug.split('-ep-');
    const animeId = parts[0];
    const epNumber = parts[1] ? parseInt(parts[1]) : 1;

    // Ambil metadata detail dari API lokal anime detail kita (simulasi)
    // Biasanya ini dilakukan dengan scrape detail lagi atau kirim dari frontend.
    // Di sini kita fokus memberikan data episode + video server
    
    const videoProvider = require('./VideoProvider');
    const servers = await videoProvider.getVideoServers(animeId, epNumber);

    return {
      _id: slug,
      title: `Episode ${epNumber}`,
      animeId: animeId,
      episodeNumber: epNumber,
      servers: servers
    };
  }
}

module.exports = new ProviderA();
