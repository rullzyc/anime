/**
 * Base Adapter Interface
 * Every source provider must implement getServers(episodeId)
 */
class BaseAdapter {
  constructor(name) {
    this.name = name;
  }

  /**
   * @param {string} episodeId
   * @returns {Promise<Array<{name: string, type: string, url: string, quality: string}>>}
   */
  async getServers(episodeId) {
    throw new Error(`${this.name} adapter must implement getServers()`);
  }

  /**
   * Validate server object shape
   */
  validateServer(server) {
    const required = ['name', 'type', 'url'];
    for (const field of required) {
      if (!server[field]) {
        throw new Error(`Server missing required field: ${field}`);
      }
    }
    if (!['iframe', 'hls', 'mp4'].includes(server.type)) {
      throw new Error(`Invalid server type: ${server.type}`);
    }
    return true;
  }
}

module.exports = BaseAdapter;
