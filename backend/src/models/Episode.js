const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['iframe', 'hls', 'mp4'], required: true },
  url: { type: String, required: true },
  quality: {
    type: String,
    enum: ['360p', '480p', '720p', '1080p', 'Auto'],
    default: 'Auto',
  },
  isDefault: { type: Boolean, default: false },
});

const episodeSchema = new mongoose.Schema(
  {
    animeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Anime',
      required: true,
      index: true,
    },
    episodeNumber: { type: Number, required: true },
    title: { type: String },
    thumbnail: { type: String },
    servers: [serverSchema],
    duration: { type: Number, default: 1440 }, // seconds
    airDate: { type: Date },
    synopsis: { type: String },
    isFiller: { type: Boolean, default: false },
  },
  { timestamps: true }
);

episodeSchema.index({ animeId: 1, episodeNumber: 1 }, { unique: true });

module.exports = mongoose.model('Episode', episodeSchema);
