const session = require('express-session');
require('dotenv').config();

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'qulab_insecure_fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 8, // 8 jam sesi aktif
    httpOnly: true,
    sameSite: 'lax',
    secure: false // Berjalan di HTTP jaringan lokal (WiFi kelas tanpa HTTPS)
  }
});

module.exports = sessionMiddleware;
