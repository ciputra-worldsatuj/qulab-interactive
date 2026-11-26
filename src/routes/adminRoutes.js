const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const AuthController = require('../controllers/authController');
const MatkulController = require('../controllers/matkulController');
const SoalController = require('../controllers/soalController');
const SesiController = require('../controllers/sesiController');

// Proteksi rute admin (FR-AUTH-05)
router.use(requireAuth);

// Root
router.get('/', (req, res) => res.redirect('/admin/dashboard'));

// Dashboard (D-02)
router.get('/dashboard', SesiController.dashboardView);

// Mata Kuliah (D-03)
router.get('/matkul', MatkulController.listMatkul);
router.post('/matkul', MatkulController.createMatkul);
router.post('/matkul/:id/update', MatkulController.updateMatkul);
router.post('/matkul/:id/delete', MatkulController.deleteMatkul);

// Bank Soal (D-04, D-05)
router.get('/matkul/:id/soal', SoalController.listSoal);
router.get('/matkul/:id/soal/baru', SoalController.createForm);
router.post('/matkul/:id/soal/baru', upload.single('gambar'), SoalController.createSoal);
router.get('/soal/:id/ubah', SoalController.editForm);
router.post('/soal/:id/ubah', upload.single('gambar'), SoalController.updateSoal);
router.post('/soal/:id/delete', SoalController.deleteSoal);
router.post('/soal/:id/copy', SoalController.copySoal);

// Sesi (D-06, D-07)
router.get('/sesi', (req, res) => res.redirect('/admin/sesi/baru'));
router.get('/sesi/baru', SesiController.createForm);
router.post('/sesi/baru', SesiController.createSesi);
router.get('/sesi/:id', (req, res) => res.redirect(`/admin/sesi/${req.params.id}/kontrol`));
router.get('/sesi/:id/kontrol', SesiController.kontrolSesi);

// Layar Proyektor Link
router.get('/sesi/:id/proyektor', async (req, res) => {
  const SesiModel = require('../models/SesiModel');
  const sesi = await SesiModel.getById(req.params.id);
  if (sesi) {
    return res.redirect(`/proyektor/${sesi.pin}`);
  }
  return res.redirect('/admin/dashboard');
});

// Riwayat & Laporan (D-08, D-09)
router.get('/riwayat', SesiController.listRiwayat);
router.get('/riwayat/:id', SesiController.detailRiwayat);
router.get('/riwayat/:id/csv', SesiController.exportCsv);
router.post('/riwayat/:id/delete', SesiController.deleteRiwayat);

// Pengaturan (D-10)
router.get('/pengaturan', AuthController.getPengaturan);
router.post('/pengaturan/ganti-password', AuthController.postGantiPassword);

module.exports = router;
