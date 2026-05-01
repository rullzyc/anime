const iframeAdapter = require('../adapters/iframeAdapter');
const hlsAdapter = require('../adapters/hlsAdapter');

/**
 * Source Manager — aggregates all adapters
 * To add a new provider: import and push to adapters array
 */
const adapters = [iframeAdapter, hlsAdapter];

/**
 * Get all servers for an episode from all providers
 * @param {string} episodeId
 * @param {Array} dbServers - servers stored in DB (highest priority)
 * @returns {Array}
 */
const getAllServers = async (episodeId, dbServers = []) => {
  if (dbServers.length > 0) {
    return dbServers;
  }

  const results = await Promise.allSettled(
    adapters.map((adapter) => adapter.getServers(episodeId))
  );

  const servers = [];
  for (const result of results) {
    if (result.status === 'fulfilled' && Array.isArray(result.value)) {
      servers.push(...result.value);
    }
  }

  return servers;
};

module.exports = { getAllServers };
