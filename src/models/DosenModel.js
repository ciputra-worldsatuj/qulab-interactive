const { query } = require('../../config/database');
const bcrypt = require('bcryptjs');

class DosenModel {
  static async findByUsername(username) {
    const rows = await query('SELECT * FROM dosen WHERE username = ? LIMIT 1', [username]);
    return rows[0] || null;
  }

  static async findById(id) {
    const rows = await query('SELECT id, username FROM dosen WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  }

  static async verifyPassword(plainPassword, passwordHash) {
    return await bcrypt.compare(plainPassword, passwordHash);
  }

  static async updatePassword(id, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    await query('UPDATE dosen SET password_hash = ? WHERE id = ?', [hash, id]);
    return true;
  }
}

module.exports = DosenModel;
