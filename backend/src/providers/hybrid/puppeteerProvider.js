const puppeteer = require('puppeteer');

class PuppeteerProvider {
  constructor() {
    this.browser = null;
    this.isLaunching = false;
  }

  async initBrowser() {
    if (this.browser) return this.browser;
    if (this.isLaunching) {
      while (this.isLaunching) {
        await new Promise(r => setTimeout(r, 100));
      }
      return this.browser;
    }

    this.isLaunching = true;
    try {
      console.log('[PUPPETEER] Meluncurkan browser...');
      this.browser = await puppeteer.launch({
        headless: "new",
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      console.log('[PUPPETEER] Browser siap.');
    } catch (err) {
      console.error('[PUPPETEER] Gagal meluncurkan browser:', err.message);
      throw err;
    } finally {
      this.isLaunching = false;
    }
    
    return this.browser;
  }

  async getHTML(url, waitForSelector = 'body') {
    let page = null;
    try {
      const browser = await this.initBrowser();
      page = await browser.newPage();

      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
          req.abort();
        } else {
          req.continue();
        }
      });

      console.log(`[PUPPETEER] Navigasi ke: ${url}`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }); // Ditambah timeout jadi 30s

      if (waitForSelector) {
        console.log(`[PUPPETEER] Menunggu selector: ${waitForSelector}`);
        await page.waitForSelector(waitForSelector, { timeout: 15000 });
      }

      const html = await page.content();
      console.log(`[PUPPETEER] Berhasil mengambil HTML (${html.length} bytes)`);
      
      return html;
    } catch (error) {
      console.error(`[PUPPETEER] Gagal mengambil HTML:`, error.message);
      throw error;
    } finally {
      if (page) {
        await page.close().catch(() => {});
      }
    }
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('[PUPPETEER] Browser ditutup.');
    }
  }
}

module.exports = new PuppeteerProvider();
