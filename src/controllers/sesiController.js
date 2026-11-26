const SesiModel = require('../models/SesiModel');
const MatkulModel = require('../models/MatkulModel');
const PesertaModel = require('../models/PesertaModel');
const { renderWithLayout } = require('../utils/renderHelper');

class SesiController {
  static async dashboardView(req, res) {
    try {
      const matkulList = await MatkulModel.getAll();
      const riwayatList = await SesiModel.getAllRiwayat();

      const totalMatkul = matkulList.length;
      const totalSoal = matkulList.reduce((acc, m) => acc + (parseInt(m.jumlah_soal, 10) || 0), 0);
      const totalSesi = riwayatList.length;

      renderWithLayout(res, 'admin/dashboard', {
        title: 'Dashboard',
        activeMenu: 'dashboard',
        totalMatkul,
        totalSoal,
        totalSesi,
        riwayatTerakhir: riwayatList.slice(0, 5),
        breadcrumb: [{ label: 'Dashboard', url: '/admin/dashboard' }]
      });
    } catch (err) {
      console.error('[Dashboard Error]:', err);
      renderWithLayout(res, 'admin/dashboard', {
        title: 'Dashboard',
        activeMenu: 'dashboard',
        totalMatkul: 0,
        totalSoal: 0,
        totalSesi: 0,
        riwayatTerakhir: [],
        breadcrumb: [{ label: 'Dashboard', url: '/admin/dashboard' }]
      });
    }
  }

  static async createForm(req, res) {
    try {
      const matkulList = await MatkulModel.getAll();
      const error = req.query.error || null;

      renderWithLayout(res, 'admin/sesi-baru', {
        title: 'Buat Sesi',
        activeMenu: 'sesi',
        matkulList,
        error,
        breadcrumb: [
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Buat Sesi', url: '/admin/sesi/baru' }
        ]
      });
    } catch (err) {
      console.error('[Create Form Sesi Error]:', err);
      return res.redirect('/admin/dashboard');
    }
  }

  static async createSesi(req, res) {
    const { matkul_id, jumlah_soal } = req.body;

    if (!matkul_id) {
      return res.redirect('/admin/sesi/baru?error=Harap pilih mata kuliah.');
    }

    try {
      const { sesiId } = await SesiModel.create({
        matkul_id,
        jumlah_soal: parseInt(jumlah_soal, 10) || 10
      });

      return res.redirect(`/admin/sesi/${sesiId}/kontrol`);
    } catch (err) {
      console.error('[Create Sesi Error]:', err);
      return res.redirect(`/admin/sesi/baru?error=${encodeURIComponent(err.message)}`);
    }
  }

  static async kontrolSesi(req, res) {
    const sesiId = req.params.id;
    try {
      const sesi = await SesiModel.getById(sesiId);
      if (!sesi) return res.redirect('/admin/dashboard');

      const pesertaList = await PesertaModel.getBySesi(sesiId);
      const soalList = await SesiModel.getSoalList(sesiId);

      renderWithLayout(res, 'admin/sesi-kontrol', {
        title: `Kontrol Sesi - ${sesi.matkul_nama}`,
        activeMenu: 'sesi',
        sesiId: sesi.id,
        pin: sesi.pin,
        status: sesi.status,
        matkulNama: sesi.matkul_nama,
        jumlahSoal: sesi.jumlah_soal,
        pesertaList,
        soalList,
        breadcrumb: [
          { label: 'Sesi', url: '/admin/sesi/baru' },
          { label: `Kontrol (PIN: ${sesi.pin})`, url: '' }
        ]
      });
    } catch (err) {
      console.error('[Kontrol Sesi Error]:', err);
      return res.redirect('/admin/dashboard');
    }
  }

  static async listRiwayat(req, res) {
    try {
      const riwayatList = await SesiModel.getAllRiwayat();
      const success = req.query.success || null;
      const error = req.query.error || null;

      renderWithLayout(res, 'admin/riwayat-list', {
        title: 'Riwayat Sesi',
        activeMenu: 'riwayat',
        riwayatList,
        success,
        error,
        breadcrumb: [
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Riwayat', url: '/admin/riwayat' }
        ]
      });
    } catch (err) {
      console.error('[List Riwayat Error]:', err);
      return res.redirect('/admin/dashboard');
    }
  }

  static async detailRiwayat(req, res) {
    const sesiId = req.params.id;
    try {
      const data = await SesiModel.getRiwayatDetail(sesiId);
      if (!data) return res.redirect('/admin/riwayat');

      renderWithLayout(res, 'admin/riwayat-detail', {
        title: `Detail Riwayat - ${data.sesi.matkul_nama}`,
        activeMenu: 'riwayat',
        sesiId: data.sesi.id,
        sesi: data.sesi,
        maxPoin: data.maxPoin,
        pesertaList: data.peserta,
        breadcrumb: [
          { label: 'Riwayat', url: '/admin/riwayat' },
          { label: `Detail Sesi ${data.sesi.pin}`, url: '' }
        ]
      });
    } catch (err) {
      console.error('[Detail Riwayat Error]:', err);
      return res.redirect('/admin/riwayat');
    }
  }

  static async exportCsv(req, res) {
    const sesiId = req.params.id;
    try {
      const data = await SesiModel.getRiwayatDetail(sesiId);
      if (!data) return res.redirect('/admin/riwayat');

      // Header CSV UTF-8 dengan BOM agar terbaca sempurna di Microsoft Excel
      let csvContent = '\uFEFF';
      csvContent += 'Peringkat,Nama Peserta,Total Poin,Persentase (%),Total Waktu (Detik),Jumlah Benar,Jumlah Salah\n';

      for (const p of data.peserta) {
        const cleanName = `"${(p.nama || '').replace(/"/g, '""')}"`;
        csvContent += `${p.peringkat},${cleanName},${p.total_poin},${p.persentase}%,${p.total_waktu_detik},${p.jumlah_benar || 0},${p.jumlah_salah || 0}\n`;
      }

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="rekap-qulab-${data.sesi.pin}-${Date.now()}.csv"`);
      return res.send(csvContent);
    } catch (err) {
      console.error('[Export CSV Error]:', err);
      return res.redirect('/admin/riwayat');
    }
  }

  static async deleteRiwayat(req, res) {
    const sesiId = req.params.id;
    try {
      await SesiModel.deleteRiwayat(sesiId);
      return res.redirect('/admin/riwayat?success=Riwayat sesi berhasil dihapus.');
    } catch (err) {
      console.error('[Delete Riwayat Error]:', err);
      return res.redirect('/admin/riwayat');
    }
  }
}

module.exports = SesiController;
