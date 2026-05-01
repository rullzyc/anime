require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const morgan   = require('morgan');

const animeRoutes   = require('./routes/anime');
const episodeRoutes = require('./routes/episode');
const rateLimiter   = require('./middleware/rateLimiter');
const errorHandler  = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware Global ───────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(morgan('dev'));

// Rate limiter hanya untuk /api
app.use('/api', rateLimiter);

// ─── Routes ─────────────────────────────────────────────────────────
app.use('/api/anime',   animeRoutes);
app.use('/api/episode', episodeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status:    'ok',
    message:   'AnimeStream Multi-Provider API is running',
    providers: ['MyAnimeList', 'AniList'],
    dummyVideo: process.env.USE_DUMMY_VIDEO !== 'false'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 AnimeStream API → http://localhost:${PORT}`);
  console.log(`🕵️  Providers: MyAnimeList → AniList (auto fallback)`);
  console.log(`🎬  Video Mode: ${process.env.USE_DUMMY_VIDEO !== 'false' ? '🎭 DUMMY (dev)' : '🌐 REAL (prod)'}`);
  console.log(`💾  Cache TTL: 600s + Stale Fallback enabled\n`);
});

module.exports = app;
