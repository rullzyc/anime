const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const animeRoutes = require('./routes/anime');
const episodeRoutes = require('./routes/episode');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Basic Route
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'AnimeStream API is running on Railway',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/anime', animeRoutes);
app.use('/api/episode', episodeRoutes);

// Error Handling (Harus diletakkan paling akhir)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
