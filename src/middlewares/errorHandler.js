/**
 * Global Error Handling Middleware
 */
function errorHandler(err, req, res, next) {
  console.error('[SERVER ERROR]:', err);

  const status = err.status || 500;
  const message = err.message || 'Terjadi kesalahan pada server.';

  if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
    return res.status(status).json({ success: false, message });
  }

  res.status(status).send(`
    <div style="font-family: sans-serif; padding: 2rem; text-align: center;">
      <h2>Terjadi Kesalahan (${status})</h2>
      <p>${message}</p>
      <a href="/" style="color: #5B3FD1;">Kembali ke Beranda</a>
    </div>
  `);
}

module.exports = errorHandler;
