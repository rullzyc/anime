const express = require('express');
const { getEpisodeById } = require('../controllers/episodeController');

const router = express.Router();

router.get('/:id', getEpisodeById);

module.exports = router;
