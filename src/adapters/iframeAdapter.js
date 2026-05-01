const BaseAdapter = require('./baseAdapter');

/**
 * IframeAdapter — wraps embed URLs from external sites
 * Suitable for video providers that offer embed iframes
 */
class IframeAdapter extends BaseAdapter {
  constructor() {
    super('IframeAdapter');
    // Map known providers
    this.providers = {
      vidstreaming: (id) => `https://vidstreaming.io/embed/${id}`,
      gogoanime: (id) => `https://gogoanime.hu/embed/${id}`,
      mp4upload: (id) => `https://www.mp4upload.com/embed-${id}.html`,
      custom: (url) => url, // direct URL passthrough
    };
  }

  /**
   * Build an iframe server object
   */
  buildServer({ name, provider = 'custom', videoId, url, quality = 'Auto', isDefault = false }) {
    const resolvedUrl = provider === 'custom' ? url : this.providers[provider]?.(videoId) || url;
    return {
      name,
      type: 'iframe',
      url: resolvedUrl,
      quality,
      isDefault,
    };
  }

  async getServers(episodeId) {
    // In a real app, fetch from DB or external API
    // This is a demo — returns placeholder iframe servers
    return [
      this.buildServer({
        name: 'Server 1 (Embed)',
        provider: 'custom',
        url: `https://www.youtube.com/embed/dQw4w9WgXcQ`,
        quality: '720p',
        isDefault: true,
      }),
    ];
  }
}

module.exports = new IframeAdapter();
