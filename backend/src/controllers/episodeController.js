const otakudesuParser = require('../providers/hybrid/otakudesuParser');

/**
 * GET /api/episode/:slug
 */
const getEpisodeById = async (req, res, next) => {
  try {
    const { id } = req.params; // ini adalah epSlug

    const episodeData = await otakudesuParser.getEpisodeVideo(id);

    const epNumMatch = episodeData.title?.match(/Episode\s+(\d+)/i);
    const epNum = epNumMatch ? parseInt(epNumMatch[1]) : 1;

    const anime = {
      slug: 'unknown', 
      title: episodeData.title || `Anime Episode`, 
      coverImage: '',
      totalEpisodes: 0
    };

    const navigation = {
      prev: epNum > 1 ? { _id: `${id}-prev`, episodeNumber: epNum - 1 } : null,
      next: { _id: `${id}-next`, episodeNumber: epNum + 1 }
    };

    res.json({
      success: true,
      data: {
        ...episodeData,
        episodeNumber: epNum,
        animeId: anime.slug,
        anime,
        navigation
      }
    });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: 'Episode tidak ditemukan atau scraping gagal.',
      detail:  err.message
    });
  }
};

module.exports = { getEpisodeById };
