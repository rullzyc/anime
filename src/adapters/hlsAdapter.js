const BaseAdapter = require('./baseAdapter');

/**
 * HLSAdapter — handles .m3u8 adaptive streaming
 * Suitable for providers that serve HLS streams
 */
class HLSAdapter extends BaseAdapter {
  constructor() {
    super('HLSAdapter');
  }

  /**
   * Build an HLS server object
   */
  buildServer({ name, url, quality = 'Auto', isDefault = false }) {
    return {
      name,
      type: 'hls',
      url,
      quality,
      isDefault,
    };
  }

  async getServers(episodeId) {
    // In a real app, resolve from DB or CDN
    // Demo uses a publicly available HLS test stream
    return [
      this.buildServer({
        name: 'Server 2 (HLS)',
        url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
        quality: '1080p',
        isDefault: false,
      }),
      this.buildServer({
        name: 'Server 3 (HLS Backup)',
        url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8',
        quality: '720p',
        isDefault: false,
      }),
    ];
  }
}

module.exports = new HLSAdapter();
