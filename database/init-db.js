const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
  console.log('--- Inisialisasi Database QuLab ---');
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = process.env.DB_PORT || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'qulab';

  try {
    const connection = await mysql.createConnection({ host, port, user, password });
    console.log(`[DB] Terhubung ke MySQL/MariaDB pada ${host}:${port}`);

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`[DB] Database '${database}' siap.`);
    await connection.changeUser({ database });

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.toLowerCase().startsWith('use') && !s.toLowerCase().startsWith('create database'));

    for (const statement of statements) {
      await connection.query(statement);
    }
    console.log('[DB] Skema tabel berhasil diimpor.');

    const bcrypt = require('bcryptjs');
    const defaultPassword = 'admin';
    const hash = await bcrypt.hash(defaultPassword, 10);

    const [rows] = await connection.query('SELECT id FROM dosen WHERE username = ?', ['dosen']);
    if (rows.length === 0) {
      await connection.query('INSERT INTO dosen (username, password_hash) VALUES (?, ?)', ['dosen', hash]);
      console.log(`[DB] Akun dosen awal dibuat (username: dosen, password: ${defaultPassword}).`);
    } else {
      console.log('[DB] Akun dosen sudah terdaftar.');
    }

    await connection.end();
    console.log('[DB] Inisialisasi selesai dengan sukses.');
  } catch (error) {
    console.error('[DB ERROR] Gagal melakukan inisialisasi database:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
