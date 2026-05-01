// Railway Deployment Trigger
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const animeRoutes = require('./routes/anime');
const episodeRoutes = require('./routes/episode');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ message: 'AnimeStream API is running (Railway Mode)' });
});

app.use('/api/anime', animeRoutes);
app.use('/api/episode', episodeRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
