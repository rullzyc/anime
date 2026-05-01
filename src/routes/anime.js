const express = require('express');
const {
  getAnimeList,
  getPopularAnime,
  getLatestAnime,
  searchAnime,
  getAnimeById,
} = require('../controllers/animeController');

const router = express.Router();

router.get('/popular', getPopularAnime);
router.get('/latest', getLatestAnime);
router.get('/search', searchAnime);
router.get('/', getAnimeList);
router.get('/:id', getAnimeById);

module.exports = router;
