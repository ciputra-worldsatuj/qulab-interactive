const express = require('express');
const path = require('path');
const sessionMiddleware = require('../config/session');
const errorHandler = require('./middlewares/errorHandler');

// Route modules
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const pesertaRoutes = require('./routes/pesertaRoutes');
const proyektorRoutes = require('./routes/proyektorRoutes');
const apiRoutes = require('./routes/apiRoutes');

const app = express();

// Konfigurasi template engine EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Parsing request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sesi Pengguna
app.use(sessionMiddleware);

// Menyajikan aset statis lokal (CSS, JS, Fonts, Uploads) - Tanpa CDN (Design System)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Mounting Rute sesuai Information Architecture
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/proyektor', proyektorRoutes);
app.use('/api', apiRoutes);
app.use('/', pesertaRoutes);

// Error Handler
app.use(errorHandler);

module.exports = app;
