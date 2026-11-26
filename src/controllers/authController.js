const DosenModel = require('../models/DosenModel');
const { renderWithLayout } = require('../utils/renderHelper');

class AuthController {
  static getLogin(req, res) {
    if (req.session && req.session.dosenId) {
      return res.redirect('/admin/dashboard');
    }
    const error = req.query.error || null;
    res.render('admin/login', { error });
  }

  static async postLogin(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.render('admin/login', { error: 'Username dan password wajib diisi.' });
    }

    try {
      const dosen = await DosenModel.findByUsername(username.trim());
      if (!dosen) {
        return res.render('admin/login', { error: 'Username atau password salah.' });
      }

      const match = await DosenModel.verifyPassword(password, dosen.password_hash);
      if (!match) {
        return res.render('admin/login', { error: 'Username atau password salah.' });
      }

      // Simpan data login di sesi
      req.session.dosenId = dosen.id;
      req.session.username = dosen.username;

      return res.redirect('/admin/dashboard');
    } catch (err) {
      console.error('[Login Error]:', err);
      return res.render('admin/login', {
        error: 'Gagal terhubung ke database. Pastikan Laragon/MySQL berjalan.'
      });
    }
  }

  static postLogout(req, res) {
    req.session.destroy(() => {
      res.redirect('/auth/login');
    });
  }

  static getPengaturan(req, res) {
    const success = req.query.success || null;
    const error = req.query.error || null;

    renderWithLayout(res, 'admin/pengaturan', {
      title: 'Pengaturan Akun',
      activeMenu: 'pengaturan',
      success,
      error,
      breadcrumb: [
        { label: 'Dashboard', url: '/admin/dashboard' },
        { label: 'Pengaturan', url: '/admin/pengaturan' }
      ]
    });
  }

  static async postGantiPassword(req, res) {
    const { password_lama, password_baru, konfirmasi_password } = req.body;
    const dosenId = req.session.dosenId;

    if (!password_lama || !password_baru || !konfirmasi_password) {
      return res.redirect('/admin/pengaturan?error=Semua kolom password wajib diisi.');
    }

    if (password_baru.length < 6) {
      return res.redirect('/admin/pengaturan?error=Password baru minimal 6 karakter.');
    }

    if (password_baru !== konfirmasi_password) {
      return res.redirect('/admin/pengaturan?error=Konfirmasi password baru tidak cocok.');
    }

    try {
      const dosen = await DosenModel.findById(dosenId);
      if (!dosen) {
        return res.redirect('/auth/login');
      }

      const rawDosen = await DosenModel.findByUsername(dosen.username);
      const isOldValid = await DosenModel.verifyPassword(password_lama, rawDosen.password_hash);

      if (!isOldValid) {
        return res.redirect('/admin/pengaturan?error=Password saat ini tidak sesuai.');
      }

      await DosenModel.updatePassword(dosenId, password_baru);
      return res.redirect('/admin/pengaturan?success=Password berhasil diperbarui.');
    } catch (err) {
      console.error('[Ganti Password Error]:', err);
      return res.redirect('/admin/pengaturan?error=Terjadi kesalahan saat menyimpan password baru.');
    }
  }
}

module.exports = AuthController;
