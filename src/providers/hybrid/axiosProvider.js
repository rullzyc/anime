const axios = require('axios');

class AxiosProvider {
  constructor() {
    this.client = axios.create({
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      },
      validateStatus: (status) => status >= 200 && status < 300,
      maxRedirects: 0
    });
  }

  async getHTML(url) {
    console.log(`[AXIOS] Mencoba fetch: ${url}`);
    try {
      const response = await this.client.get(url, {
        headers: { 'Referer': new URL(url).origin }
      });
      if (!response.data) throw new Error('Response kosong dari Axios');
      console.log(`[AXIOS] Berhasil mengambil HTML (${response.data.length} bytes)`);
      return response.data;
    } catch (error) {
      console.log(`[AXIOS] Gagal: ${error.message}`);
      throw error; 
    }
  }
}

module.exports = new AxiosProvider();
