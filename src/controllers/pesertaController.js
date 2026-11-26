const SesiModel = require('../models/SesiModel');
const PesertaModel = require('../models/PesertaModel');
const { renderWithLayout } = require('../utils/renderHelper');

class PesertaController {
  static masukPage(req, res) {
    const error = req.query.error || null;
    const status = req.query.status || null;
    const pin = (req.query.pin || '').trim(); // Otomatis terisi jika scan dari QR Code

    renderWithLayout(res, 'peserta/masuk', {
      title: 'Masuk Kuis',
      error,
      status,
      pin,
      participantName: null
    }, 'layouts/mobile-shell');
  }

  static async mainPage(req, res) {
    const pin = (req.query.pin || '').trim();
    const rawNama = (req.query.nama || '').trim();

    if (!pin || !rawNama) {
      return res.redirect('/?error=PIN dan Nama Lengkap wajib diisi.');
    }

    try {
      const sesi = await SesiModel.getByPin(pin);
      if (!sesi) {
        return res.redirect('/?error=PIN sesi kuis tidak ditemukan atau sesi telah berakhir.');
      }

      // Daftarkan atau ambil peserta yang sudah ada (FR-PES-03, FR-PES-04)
      const { peserta } = await PesertaModel.findOrCreate(sesi.id, rawNama);

      renderWithLayout(res, 'peserta/main', {
        title: `Kuis: ${sesi.matkul_nama}`,
        sesiId: sesi.id,
        sessionPin: sesi.pin,
        pesertaId: peserta.id,
        participantName: peserta.nama,
        matkulNama: sesi.matkul_nama
      }, 'layouts/mobile-shell');
    } catch (err) {
      console.error('[Peserta Main Error]:', err);
      return res.redirect(`/?error=${encodeURIComponent(err.message)}`);
    }
  }
}

module.exports = PesertaController;
