const { pool, query } = require('../../config/database');
const { normalizeName } = require('../utils/nameNormalizer');

class PesertaModel {
  static async findOrCreate(sesiId, rawNama) {
    const nama = rawNama.trim();
    const namaNorm = normalizeName(nama);

    if (!namaNorm) {
      throw new Error('Nama peserta tidak boleh kosong.');
    }

    // Cek apakah peserta sudah pernah bergabung di sesi ini (FR-PES-03 / FR-PES-04)
    const existing = await query(
      'SELECT * FROM peserta WHERE sesi_id = ? AND nama_norm = ? LIMIT 1',
      [sesiId, namaNorm]
    );

    if (existing.length > 0) {
      return { peserta: existing[0], isNew: false };
    }

    // Buat peserta baru
    const result = await query(
      'INSERT INTO peserta (sesi_id, nama, nama_norm, total_poin, total_waktu_ms) VALUES (?, ?, ?, 0, 0)',
      [sesiId, nama, namaNorm]
    );

    const newPeserta = {
      id: result.insertId,
      sesi_id: sesiId,
      nama,
      nama_norm: namaNorm,
      total_poin: 0,
      total_waktu_ms: 0
    };

    return { peserta: newPeserta, isNew: true };
  }

  static async getById(id) {
    const rows = await query('SELECT * FROM peserta WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  }

  static async getBySesi(sesiId) {
    return await query(
      'SELECT id, sesi_id, nama, total_poin, total_waktu_ms FROM peserta WHERE sesi_id = ? ORDER BY id ASC',
      [sesiId]
    );
  }

  static async kick(id) {
    await query('DELETE FROM peserta WHERE id = ?', [id]);
    return true;
  }

  static async recordJawaban({ sesi_soal_id, peserta_id, waktu_jawab_ms, poin, benar, opsi_ids }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Cek apakah sudah pernah menjawab soal ini
      const [existing] = await conn.query(
        'SELECT id FROM jawaban WHERE sesi_soal_id = ? AND peserta_id = ? LIMIT 1',
        [sesi_soal_id, peserta_id]
      );

      if (existing.length > 0) {
        await conn.rollback();
        return { alreadyAnswered: true };
      }

      // Masukkan ke tabel jawaban
      const [resJawaban] = await conn.query(
        'INSERT INTO jawaban (sesi_soal_id, peserta_id, waktu_jawab_ms, poin, benar) VALUES (?, ?, ?, ?, ?)',
        [sesi_soal_id, peserta_id, waktu_jawab_ms, poin, benar ? 1 : 0]
      );
      const jawabanId = resJawaban.insertId;

      // Masukkan opsi yang dipilih
      for (const opsiId of opsi_ids) {
        await conn.query(
          'INSERT INTO jawaban_opsi (jawaban_id, opsi_id) VALUES (?, ?)',
          [jawabanId, opsiId]
        );
      }

      // Perbarui akumulasi poin dan waktu peserta
      await conn.query(
        'UPDATE peserta SET total_poin = total_poin + ?, total_waktu_ms = total_waktu_ms + ? WHERE id = ?',
        [poin, waktu_jawab_ms, peserta_id]
      );

      await conn.commit();
      return { success: true, jawabanId };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  static async getDistribusiJawaban(sesiSoalId) {
    // Ambil opsi dari soal ini
    const sql = `
      SELECT o.id AS opsi_id, o.urutan, o.teks, o.is_benar,
             COUNT(jo.jawaban_id) AS jumlah_pemilih
      FROM sesi_soal ss
      JOIN opsi o ON o.soal_id = ss.soal_id
      LEFT JOIN (
        jawaban j
        JOIN jawaban_opsi jo ON jo.jawaban_id = j.id
      ) ON j.sesi_soal_id = ss.id AND jo.opsi_id = o.id
      WHERE ss.id = ?
      GROUP BY o.id, o.urutan, o.teks, o.is_benar
      ORDER BY o.urutan ASC
    `;
    return await query(sql, [sesiSoalId]);
  }

  static async getLeaderboard(sesiId, limit = 3) {
    const sql = `
      SELECT id, nama, total_poin, total_waktu_ms
      FROM peserta
      WHERE sesi_id = ?
      ORDER BY total_poin DESC, total_waktu_ms ASC
      LIMIT ?
    `;
    return await query(sql, [sesiId, limit]);
  }
}

module.exports = PesertaModel;
