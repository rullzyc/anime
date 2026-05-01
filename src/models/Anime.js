const mongoose = require('mongoose');

const animeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },
    titleEnglish: { type: String },
    titleJapanese: { type: String },
    slug: { type: String, required: true, unique: true },
    coverImage: { type: String, required: true },
    bannerImage: { type: String },
    description: { type: String, required: true },
    genres: [{ type: String }],
    status: {
      type: String,
      enum: ['Ongoing', 'Completed', 'Upcoming'],
      default: 'Ongoing',
    },
    rating: { type: Number, min: 0, max: 10, default: 0 },
    totalEpisodes: { type: Number, default: 0 },
    currentEpisode: { type: Number, default: 0 },
    isPopular: { type: Boolean, default: false },
    isLatest: { type: Boolean, default: false },
    season: { type: String },
    year: { type: Number },
    studio: { type: String },
    type: {
      type: String,
      enum: ['TV', 'Movie', 'OVA', 'ONA', 'Special'],
      default: 'TV',
    },
  },
  { timestamps: true }
);

animeSchema.index({ title: 'text', titleEnglish: 'text', description: 'text' });

module.exports = mongoose.model('Anime', animeSchema);
