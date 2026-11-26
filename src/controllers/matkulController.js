const MatkulModel = require('../models/MatkulModel');
const { renderWithLayout } = require('../utils/renderHelper');

class MatkulController {
  static async listMatkul(req, res) {
    try {
      const matkulList = await MatkulModel.getAll();
      const success = req.query.success || null;
      const error = req.query.error || null;

      renderWithLayout(res, 'admin/matkul-list', {
        title: 'Mata Kuliah',
        activeMenu: 'matkul',
        matkulList,
        success,
        error,
        breadcrumb: [
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Mata Kuliah', url: '/admin/matkul' }
        ]
      });
    } catch (err) {
      console.error('[List Matkul Error]:', err);
      renderWithLayout(res, 'admin/matkul-list', {
        title: 'Mata Kuliah',
        activeMenu: 'matkul',
        matkulList: [],
        error: 'Gagal memuat mata kuliah. Pastikan database aktif.',
        breadcrumb: [{ label: 'Mata Kuliah', url: '/admin/matkul' }]
      });
    }
  }

  static async createMatkul(req, res) {
    const { nama } = req.body;
    if (!nama || !nama.trim()) {
      return res.redirect('/admin/matkul?error=Nama mata kuliah tidak boleh kosong.');
    }

    try {
      await MatkulModel.create(nama.trim());
      return res.redirect('/admin/matkul?success=Mata kuliah berhasil ditambahkan.');
    } catch (err) {
      console.error('[Create Matkul Error]:', err);
      return res.redirect('/admin/matkul?error=Gagal menambahkan mata kuliah.');
    }
  }

  static async updateMatkul(req, res) {
    const { id } = req.params;
    const { nama } = req.body;

    if (!nama || !nama.trim()) {
      return res.redirect('/admin/matkul?error=Nama mata kuliah tidak boleh kosong.');
    }

    try {
      await MatkulModel.update(id, nama.trim());
      return res.redirect('/admin/matkul?success=Mata kuliah berhasil diperbarui.');
    } catch (err) {
      console.error('[Update Matkul Error]:', err);
      return res.redirect('/admin/matkul?error=Gagal memperbarui mata kuliah.');
    }
  }

  static async deleteMatkul(req, res) {
    const { id } = req.params;

    try {
      await MatkulModel.delete(id);
      return res.redirect('/admin/matkul?success=Mata kuliah beserta bank soal terkait berhasil dihapus.');
    } catch (err) {
      console.error('[Delete Matkul Error]:', err);
      return res.redirect('/admin/matkul?error=Gagal menghapus mata kuliah.');
    }
  }
}

module.exports = MatkulController;
