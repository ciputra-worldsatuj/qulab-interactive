const { query } = require('../../config/database');

class MatkulModel {
  static async getAll() {
    const sql = `
      SELECT m.id, m.nama, COUNT(s.id) AS jumlah_soal
      FROM matkul m
      LEFT JOIN soal s ON s.matkul_id = m.id
      GROUP BY m.id, m.nama
      ORDER BY m.id DESC
    `;
    return await query(sql);
  }

  static async getById(id) {
    const rows = await query('SELECT * FROM matkul WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  }

  static async create(nama) {
    const result = await query('INSERT INTO matkul (nama) VALUES (?)', [nama.trim()]);
    return result.insertId;
  }

  static async update(id, nama) {
    await query('UPDATE matkul SET nama = ? WHERE id = ?', [nama.trim(), id]);
    return true;
  }

  static async delete(id) {
    // Foreign key CASCADE menghapus seluruh soal dan sesi terkait
    await query('DELETE FROM matkul WHERE id = ?', [id]);
    return true;
  }
}

module.exports = MatkulModel;
