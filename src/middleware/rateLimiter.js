const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // Limit setiap IP ke 100 request per window
  message: {
    success: false,
    message: 'Terlalu banyak request dari IP ini, coba lagi nanti.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = apiLimiter;
