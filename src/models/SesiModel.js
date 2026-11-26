const { pool, query } = require('../../config/database');

class SesiModel {
  // Fungsi acak PIN 4 digit
  static generatePin() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // Acak array (Fisher-Yates)
  static shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  static async create({ matkul_id, jumlah_soal }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Ambil seluruh soal dari matkul tersebut
      const [allSoal] = await conn.query('SELECT id FROM soal WHERE matkul_id = ?', [matkul_id]);
      if (allSoal.length === 0) {
        throw new Error('Mata kuliah ini belum memiliki soal. Silakan tambahkan soal terlebih dahulu.');
      }

      const nSoal = Math.min(parseInt(jumlah_soal, 10) || 10, allSoal.length);
      const shuffledSoal = this.shuffleArray(allSoal).slice(0, nSoal);

      // Cari PIN yang unik
      let pin = this.generatePin();
      let exists = true;
      while (exists) {
        const [rows] = await conn.query(
          "SELECT id FROM sesi WHERE pin = ? AND status IN ('menunggu', 'berjalan')",
          [pin]
        );
        if (rows.length === 0) exists = false;
        else pin = this.generatePin();
      }

      // Buat entri sesi
      const [resSesi] = await conn.query(
        'INSERT INTO sesi (matkul_id, pin, jumlah_soal, status, dibuat_pada) VALUES (?, ?, ?, ?, NOW())',
        [matkul_id, pin, nSoal, 'menunggu']
      );
      const sesiId = resSesi.insertId;

      // Masukkan soal terpilih ke sesi_soal dengan acak urutan opsi
      for (let i = 0; i < shuffledSoal.length; i++) {
        const s = shuffledSoal[i];
        // Acak urutan opsi 1, 2, 3, 4
        const optionIndices = this.shuffleArray([1, 2, 3, 4]).join(',');
        await conn.query(
          'INSERT INTO sesi_soal (sesi_id, soal_id, urutan, urutan_opsi) VALUES (?, ?, ?, ?)',
          [sesiId, s.id, i + 1, optionIndices]
        );
      }

      await conn.commit();
      return { sesiId, pin };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  static async getById(id) {
    const sql = `
      SELECT s.*, m.nama AS matkul_nama
      FROM sesi s
      JOIN matkul m ON m.id = s.matkul_id
      WHERE s.id = ?
      LIMIT 1
    `;
    const rows = await query(sql, [id]);
    return rows[0] || null;
  }

  static async getByPin(pin) {
    const sql = `
      SELECT s.*, m.nama AS matkul_nama
      FROM sesi s
      JOIN matkul m ON m.id = s.matkul_id
      WHERE s.pin = ? AND s.status IN ('menunggu', 'berjalan')
      ORDER BY s.id DESC
      LIMIT 1
    `;
    const rows = await query(sql, [pin]);
    return rows[0] || null;
  }

  static async updateStatus(id, status) {
    if (status === 'berjalan') {
      await query('UPDATE sesi SET status = ?, mulai_pada = NOW() WHERE id = ?', [status, id]);
    } else if (status === 'selesai' || status === 'dihentikan') {
      await query('UPDATE sesi SET status = ?, selesai_pada = NOW() WHERE id = ?', [status, id]);
    } else {
      await query('UPDATE sesi SET status = ? WHERE id = ?', [status, id]);
    }
    return true;
  }

  static async getSoalList(sesiId) {
    const sql = `
      SELECT ss.id AS sesi_soal_id, ss.urutan, ss.urutan_opsi, s.*
      FROM sesi_soal ss
      JOIN soal s ON s.id = ss.soal_id
      WHERE ss.sesi_id = ?
      ORDER BY ss.urutan ASC
    `;
    const rows = await query(sql, [sesiId]);
    if (rows.length === 0) return [];

    const soalIds = rows.map(r => r.id);
    const opsiRows = await query(
      `SELECT * FROM opsi WHERE soal_id IN (${soalIds.map(() => '?').join(',')}) ORDER BY soal_id, urutan ASC`,
      soalIds
    );

    const opsiMap = {};
    for (const op of opsiRows) {
      if (!opsiMap[op.soal_id]) opsiMap[op.soal_id] = [];
      opsiMap[op.soal_id].push(op);
    }

    return rows.map(r => ({
      ...r,
      opsi: opsiMap[r.id] || []
    }));
  }

  static async getAllRiwayat() {
    const sql = `
      SELECT s.id, s.pin, s.jumlah_soal, s.status, s.dibuat_pada, s.mulai_pada, s.selesai_pada,
             m.nama AS matkul_nama,
             COUNT(DISTINCT p.id) AS total_peserta,
             ROUND(AVG(p.total_poin), 1) AS rata_rata_poin
      FROM sesi s
      JOIN matkul m ON m.id = s.matkul_id
      LEFT JOIN peserta p ON p.sesi_id = s.id
      WHERE s.status IN ('selesai', 'dihentikan')
      GROUP BY s.id, s.pin, s.jumlah_soal, s.status, s.dibuat_pada, s.mulai_pada, s.selesai_pada, m.nama
      ORDER BY s.id DESC
    `;
    return await query(sql);
  }

  static async getRiwayatDetail(sesiId) {
    const sesi = await this.getById(sesiId);
    if (!sesi) return null;

    // Ambil rekap nilai peserta diurutkan poin tertinggi dan waktu tersingkat (SRS Sec 1.3)
    const pesertaSql = `
      SELECT p.id, p.nama, p.nama_norm, p.total_poin, p.total_waktu_ms,
             COUNT(j.id) AS total_terjawab,
             SUM(CASE WHEN j.benar = 1 THEN 1 ELSE 0 END) AS jumlah_benar,
             SUM(CASE WHEN j.benar = 0 THEN 1 ELSE 0 END) AS jumlah_salah
      FROM peserta p
      LEFT JOIN jawaban j ON j.peserta_id = p.id
      WHERE p.sesi_id = ?
      GROUP BY p.id, p.nama, p.nama_norm, p.total_poin, p.total_waktu_ms
      ORDER BY p.total_poin DESC, p.total_waktu_ms ASC
    `;
    const pesertaList = await query(pesertaSql, [sesiId]);

    // Hitung persentase nilai (poin / maksimal_poin * 100)
    const [maxPoinRow] = await query(
      `SELECT SUM(s.poin) as total_max_poin
       FROM sesi_soal ss
       JOIN soal s ON s.id = ss.soal_id
       WHERE ss.sesi_id = ?`,
      [sesiId]
    );
    const maxPoin = maxPoinRow && maxPoinRow.total_max_poin ? parseFloat(maxPoinRow.total_max_poin) : 1;

    const rankedPeserta = pesertaList.map((p, idx) => {
      const persentase = Math.min(100, Math.round((parseFloat(p.total_poin) / maxPoin) * 100));
      return {
        ...p,
        peringkat: idx + 1,
        persentase,
        total_waktu_detik: (p.total_waktu_ms / 1000).toFixed(1)
      };
    });

    return {
      sesi,
      maxPoin,
      peserta: rankedPeserta
    };
  }

  static async deleteRiwayat(sesiId) {
    await query('DELETE FROM sesi WHERE id = ?', [sesiId]);
    return true;
  }
}

module.exports = SesiModel;
