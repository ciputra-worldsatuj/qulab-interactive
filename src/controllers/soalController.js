const SoalModel = require('../models/SoalModel');
const MatkulModel = require('../models/MatkulModel');
const { renderWithLayout } = require('../utils/renderHelper');

class SoalController {
  static async listSoal(req, res) {
    const matkulId = req.params.id;
    try {
      const matkul = await MatkulModel.getById(matkulId);
      if (!matkul) return res.redirect('/admin/matkul?error=Mata kuliah tidak ditemukan.');

      const soalList = await SoalModel.getByMatkul(matkulId);
      const success = req.query.success || null;
      const error = req.query.error || null;

      renderWithLayout(res, 'admin/soal-list', {
        title: `Bank Soal - ${matkul.nama}`,
        activeMenu: 'matkul',
        matkulId,
        matkulNama: matkul.nama,
        soalList,
        success,
        error,
        breadcrumb: [
          { label: 'Mata Kuliah', url: '/admin/matkul' },
          { label: matkul.nama, url: `/admin/matkul/${matkulId}/soal` }
        ]
      });
    } catch (err) {
      console.error('[List Soal Error]:', err);
      return res.redirect('/admin/matkul?error=Gagal memuat bank soal.');
    }
  }

  static async createForm(req, res) {
    const matkulId = req.params.id;
    try {
      const matkul = await MatkulModel.getById(matkulId);
      if (!matkul) return res.redirect('/admin/matkul');

      renderWithLayout(res, 'admin/soal-form', {
        title: 'Tambah Soal',
        activeMenu: 'matkul',
        matkulId,
        matkulNama: matkul.nama,
        isEdit: false,
        soal: null,
        error: req.query.error || null,
        breadcrumb: [
          { label: 'Mata Kuliah', url: '/admin/matkul' },
          { label: matkul.nama, url: `/admin/matkul/${matkulId}/soal` },
          { label: 'Tambah Soal', url: '' }
        ]
      });
    } catch (err) {
      return res.redirect('/admin/matkul');
    }
  }

  static async createSoal(req, res) {
    const matkulId = req.params.id;
    const { teks, waktu_detik, poin, opsi_teks, opsi_benar } = req.body;

    if (!teks || !teks.trim()) {
      return res.redirect(`/admin/matkul/${matkulId}/soal/baru?error=Teks pertanyaan wajib diisi.`);
    }

    if (!opsi_teks || !Array.isArray(opsi_teks) || opsi_teks.length < 4) {
      return res.redirect(`/admin/matkul/${matkulId}/soal/baru?error=Harap mengisi lengkap 4 opsi jawaban (A, B, C, D).`);
    }

    // Format opsi_benar: checkbox value "0", "1", "2", "3"
    const benarIndices = Array.isArray(opsi_benar) ? opsi_benar : (opsi_benar !== undefined ? [opsi_benar] : []);
    if (benarIndices.length === 0) {
      return res.redirect(`/admin/matkul/${matkulId}/soal/baru?error=Minimal pilih satu jawaban benar.`);
    }

    const opsi = opsi_teks.slice(0, 4).map((text, idx) => ({
      teks: text || '',
      is_benar: benarIndices.includes(idx.toString())
    }));

    const gambar_path = req.file ? `/uploads/${req.file.filename}` : null;

    try {
      await SoalModel.create({
        matkul_id: matkulId,
        teks: teks.trim(),
        gambar_path,
        waktu_detik: parseInt(waktu_detik, 10) || 20,
        poin: parseInt(poin, 10) || 1000,
        opsi
      });

      return res.redirect(`/admin/matkul/${matkulId}/soal?success=Soal berhasil ditambahkan.`);
    } catch (err) {
      console.error('[Create Soal Error]:', err);
      return res.redirect(`/admin/matkul/${matkulId}/soal/baru?error=Gagal menyimpan soal.`);
    }
  }

  static async editForm(req, res) {
    const soalId = req.params.id;
    try {
      const soal = await SoalModel.getById(soalId);
      if (!soal) return res.redirect('/admin/matkul');

      const matkul = await MatkulModel.getById(soal.matkul_id);

      renderWithLayout(res, 'admin/soal-form', {
        title: 'Ubah Soal',
        activeMenu: 'matkul',
        matkulId: soal.matkul_id,
        matkulNama: matkul ? matkul.nama : '',
        isEdit: true,
        soal,
        error: req.query.error || null,
        breadcrumb: [
          { label: 'Mata Kuliah', url: '/admin/matkul' },
          { label: matkul ? matkul.nama : 'Bank Soal', url: `/admin/matkul/${soal.matkul_id}/soal` },
          { label: 'Ubah Soal', url: '' }
        ]
      });
    } catch (err) {
      return res.redirect('/admin/matkul');
    }
  }

  static async updateSoal(req, res) {
    const soalId = req.params.id;
    const { teks, waktu_detik, poin, opsi_teks, opsi_benar } = req.body;

    try {
      const existing = await SoalModel.getById(soalId);
      if (!existing) return res.redirect('/admin/matkul');

      if (!teks || !teks.trim()) {
        return res.redirect(`/admin/soal/${soalId}/ubah?error=Teks pertanyaan wajib diisi.`);
      }

      const benarIndices = Array.isArray(opsi_benar) ? opsi_benar : (opsi_benar !== undefined ? [opsi_benar] : []);
      if (benarIndices.length === 0) {
        return res.redirect(`/admin/soal/${soalId}/ubah?error=Minimal pilih satu jawaban benar.`);
      }

      const opsi = (opsi_teks || []).slice(0, 4).map((text, idx) => ({
        teks: text || '',
        is_benar: benarIndices.includes(idx.toString())
      }));

      const gambar_path = req.file ? `/uploads/${req.file.filename}` : undefined;

      await SoalModel.update(soalId, {
        teks: teks.trim(),
        gambar_path,
        waktu_detik: parseInt(waktu_detik, 10) || 20,
        poin: parseInt(poin, 10) || 1000,
        opsi
      });

      return res.redirect(`/admin/matkul/${existing.matkul_id}/soal?success=Soal berhasil diperbarui.`);
    } catch (err) {
      console.error('[Update Soal Error]:', err);
      return res.redirect(`/admin/soal/${soalId}/ubah?error=Gagal memperbarui soal.`);
    }
  }

  static async deleteSoal(req, res) {
    const soalId = req.params.id;
    try {
      const soal = await SoalModel.getById(soalId);
      if (!soal) return res.redirect('/admin/matkul');

      await SoalModel.delete(soalId);
      return res.redirect(`/admin/matkul/${soal.matkul_id}/soal?success=Soal berhasil dihapus.`);
    } catch (err) {
      console.error('[Delete Soal Error]:', err);
      return res.redirect('/admin/matkul');
    }
  }

  static async copySoal(req, res) {
    const soalId = req.params.id;
    try {
      const soal = await SoalModel.getById(soalId);
      if (!soal) return res.redirect('/admin/matkul');

      await SoalModel.copy(soalId);
      return res.redirect(`/admin/matkul/${soal.matkul_id}/soal?success=Soal berhasil disalin.`);
    } catch (err) {
      console.error('[Copy Soal Error]:', err);
      return res.redirect('/admin/matkul');
    }
  }
}

module.exports = SoalController;
