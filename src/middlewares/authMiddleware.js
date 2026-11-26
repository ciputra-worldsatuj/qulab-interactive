/**
 * Middleware untuk memastikan Dosen telah login sebelum mengakses rute terproteksi.
 * Reference: FR-AUTH-05
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.dosenId) {
    return next();
  }
  
  if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
    return res.status(401).json({ success: false, message: 'Sesi berakhir, silakan login kembali.' });
  }
  
  return res.redirect('/admin/login');
}

module.exports = {
  requireAuth
};
