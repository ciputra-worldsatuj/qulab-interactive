const { pool, query } = require('../../config/database');

class SoalModel {
  static async getByMatkul(matkulId) {
    const soalRows = await query(
      'SELECT * FROM soal WHERE matkul_id = ? ORDER BY id ASC',
      [matkulId]
    );

    if (soalRows.length === 0) return [];

    const soalIds = soalRows.map(s => s.id);
    const opsiRows = await query(
      `SELECT * FROM opsi WHERE soal_id IN (${soalIds.map(() => '?').join(',')}) ORDER BY soal_id, urutan ASC`,
      soalIds
    );

    const opsiMap = {};
    for (const op of opsiRows) {
      if (!opsiMap[op.soal_id]) opsiMap[op.soal_id] = [];
      opsiMap[op.soal_id].push(op);
    }

    return soalRows.map(s => ({
      ...s,
      opsi: opsiMap[s.id] || []
    }));
  }

  static async getById(id) {
    const soalRows = await query('SELECT * FROM soal WHERE id = ? LIMIT 1', [id]);
    if (soalRows.length === 0) return null;

    const soal = soalRows[0];
    const opsi = await query(
      'SELECT * FROM opsi WHERE soal_id = ? ORDER BY urutan ASC',
      [id]
    );

    return {
      ...soal,
      opsi
    };
  }

  static async create({ matkul_id, teks, gambar_path, waktu_detik, poin, opsi }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [resSoal] = await conn.query(
        'INSERT INTO soal (matkul_id, teks, gambar_path, waktu_detik, poin) VALUES (?, ?, ?, ?, ?)',
        [matkul_id, teks.trim(), gambar_path || null, waktu_detik || 20, poin || 1000]
      );
      const soalId = resSoal.insertId;

      for (let i = 0; i < opsi.length; i++) {
        const item = opsi[i];
        await conn.query(
          'INSERT INTO opsi (soal_id, urutan, teks, is_benar) VALUES (?, ?, ?, ?)',
          [soalId, i + 1, item.teks.trim(), item.is_benar ? 1 : 0]
        );
      }

      await conn.commit();
      return soalId;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  static async update(id, { teks, gambar_path, waktu_detik, poin, opsi }) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      if (gambar_path !== undefined) {
        await conn.query(
          'UPDATE soal SET teks = ?, gambar_path = ?, waktu_detik = ?, poin = ? WHERE id = ?',
          [teks.trim(), gambar_path, waktu_detik || 20, poin || 1000, id]
        );
      } else {
        await conn.query(
          'UPDATE soal SET teks = ?, waktu_detik = ?, poin = ? WHERE id = ?',
          [teks.trim(), waktu_detik || 20, poin || 1000, id]
        );
      }

      // Hapus opsi lama dan masukkan opsi baru
      await conn.query('DELETE FROM opsi WHERE soal_id = ?', [id]);

      for (let i = 0; i < opsi.length; i++) {
        const item = opsi[i];
        await conn.query(
          'INSERT INTO opsi (soal_id, urutan, teks, is_benar) VALUES (?, ?, ?, ?)',
          [id, i + 1, item.teks.trim(), item.is_benar ? 1 : 0]
        );
      }

      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  static async delete(id) {
    await query('DELETE FROM soal WHERE id = ?', [id]);
    return true;
  }

  static async copy(id) {
    const soal = await this.getById(id);
    if (!soal) throw new Error('Soal tidak ditemukan untuk disalin.');

    return await this.create({
      matkul_id: soal.matkul_id,
      teks: `${soal.teks} (Salinan)`,
      gambar_path: soal.gambar_path,
      waktu_detik: soal.waktu_detik,
      poin: soal.poin,
      opsi: soal.opsi.map(o => ({
        teks: o.teks,
        is_benar: o.is_benar === 1 || o.is_benar === true
      }))
    });
  }
}

module.exports = SoalModel;
