const axios = require('axios');
const cheerio = require('cheerio');

axios.get('https://myanimelist.net/anime/52991', {
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
}).then(res => {
  const $ = cheerio.load(res.data);
  const title = $('.title-name').text().trim();
  const desc = $('[itemprop="description"]').text().trim();
  const img = $('.leftside img').attr('data-src') || $('.leftside img').attr('src');
  
  const genres = [];
  $('[itemprop="genre"]').each((i, el) => genres.push($(el).text().trim()));
  
  // Total episodes
  const eps = $('#curEps').text().trim() || '12';
  
  console.log({title, desc: desc.substring(0, 50), img, genres, eps});
}).catch(console.error);
