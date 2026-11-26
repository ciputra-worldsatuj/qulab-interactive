const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'qulab',
  waitForConnections: true,
  connectionLimit: 50,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// Helper query yang aman
async function query(sql, params = []) {
  try {
    const [results] = await pool.query(sql, params);
    return results;
  } catch (error) {
    console.error(`[DB Query Error] ${error.message} \nSQL: ${sql}`);
    throw error;
  }
}

// Inisialisasi pengecekan koneksi saat startup
pool.getConnection()
  .then(conn => {
    console.log('[DB] Koneksi ke MariaDB Laragon (qulab) berhasil!');
    conn.release();
  })
  .catch(err => {
    console.warn(`[DB WARNING] Belum dapat terhubung ke MariaDB (${err.message}). Pastikan Laragon/MySQL sudah dijalankan.`);
  });

module.exports = {
  pool,
  query
};
