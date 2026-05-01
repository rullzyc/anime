const multiSourceParser = require('../providers/hybrid/multiSourceParser');

/**
 * GET /api/anime?page=1
 */
const getAnimeList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const list = await multiSourceParser.getLatestAnime(page);

    res.json({
      success: true,
      data: list,
      pagination: {
        page: page,
        hasNextPage: list.length > 0 
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/anime/latest
 */
const getLatestAnime = async (req, res, next) => {
  try {
    const list = await multiSourceParser.getLatestAnime(1);
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/anime/popular
 */
const getPopularAnime = async (req, res, next) => {
  try {
    const list = await multiSourceParser.getLatestAnime(1);
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/anime/search?q=keyword
 */
const searchAnime = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim().toLowerCase();
    if (!q) return res.json({ success: true, data: [] });

    const results = await multiSourceParser.searchAnime(q);
    
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/anime/:id
 */
const getAnimeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const detail = await multiSourceParser.getAnimeDetail(id);

    res.json({ success: true, data: detail });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: 'Anime tidak ditemukan atau scraping gagal.',
      detail:  err.message
    });
  }
};

module.exports = { getAnimeList, getLatestAnime, getPopularAnime, searchAnime, getAnimeById };
