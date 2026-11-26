-- ==============================================================
-- QuLab Database Schema for MariaDB (InnoDB, utf8mb4)
-- Reference: sofware-requirement-spesification.md Section 16
-- ==============================================================

CREATE DATABASE IF NOT EXISTS qulab CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE qulab;

-- 1. Tabel Dosen (Akun tunggal host)
CREATE TABLE IF NOT EXISTS dosen (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabel Mata Kuliah
CREATE TABLE IF NOT EXISTS matkul (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabel Bank Soal
CREATE TABLE IF NOT EXISTS soal (
  id INT AUTO_INCREMENT PRIMARY KEY,
  matkul_id INT NOT NULL,
  teks TEXT NOT NULL,
  gambar_path VARCHAR(255) NULL,
  waktu_detik INT NOT NULL DEFAULT 20,
  poin INT NOT NULL DEFAULT 1000,
  CONSTRAINT fk_soal_matkul FOREIGN KEY (matkul_id) REFERENCES matkul(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabel Opsi Jawaban Soal
CREATE TABLE IF NOT EXISTS opsi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  soal_id INT NOT NULL,
  urutan TINYINT NOT NULL,
  teks VARCHAR(255) NOT NULL,
  is_benar BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_opsi_soal FOREIGN KEY (soal_id) REFERENCES soal(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabel Sesi Kuis
CREATE TABLE IF NOT EXISTS sesi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  matkul_id INT NOT NULL,
  pin CHAR(4) NOT NULL,
  jumlah_soal INT NOT NULL,
  status ENUM('menunggu','berjalan','selesai','dihentikan') NOT NULL DEFAULT 'menunggu',
  dibuat_pada DATETIME NOT NULL,
  mulai_pada DATETIME NULL,
  selesai_pada DATETIME NULL,
  CONSTRAINT fk_sesi_matkul FOREIGN KEY (matkul_id) REFERENCES matkul(id) ON DELETE CASCADE,
  INDEX idx_sesi_pin_status (pin, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tabel Sesi Soal (Soal terpilih & urutan opsi acak per sesi)
CREATE TABLE IF NOT EXISTS sesi_soal (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sesi_id INT NOT NULL,
  soal_id INT NOT NULL,
  urutan INT NOT NULL,
  urutan_opsi VARCHAR(20) NOT NULL,
  CONSTRAINT fk_sesi_soal_sesi FOREIGN KEY (sesi_id) REFERENCES sesi(id) ON DELETE CASCADE,
  CONSTRAINT fk_sesi_soal_soal FOREIGN KEY (soal_id) REFERENCES soal(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Tabel Peserta (Mahasiswa per sesi)
CREATE TABLE IF NOT EXISTS peserta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sesi_id INT NOT NULL,
  nama VARCHAR(150) NOT NULL,
  nama_norm VARCHAR(150) NOT NULL,
  total_poin DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_waktu_ms INT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_peserta_sesi_nama (sesi_id, nama_norm),
  CONSTRAINT fk_peserta_sesi FOREIGN KEY (sesi_id) REFERENCES sesi(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Tabel Jawaban (Jawaban peserta per sesi soal)
CREATE TABLE IF NOT EXISTS jawaban (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sesi_soal_id INT NOT NULL,
  peserta_id INT NOT NULL,
  waktu_jawab_ms INT NOT NULL,
  poin DECIMAL(10,2) NOT NULL DEFAULT 0,
  benar BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE KEY uq_jawaban (sesi_soal_id, peserta_id),
  CONSTRAINT fk_jawaban_sesi_soal FOREIGN KEY (sesi_soal_id) REFERENCES sesi_soal(id) ON DELETE CASCADE,
  CONSTRAINT fk_jawaban_peserta FOREIGN KEY (peserta_id) REFERENCES peserta(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Tabel Relasi Jawaban ke Opsi Terpilih
CREATE TABLE IF NOT EXISTS jawaban_opsi (
  jawaban_id INT NOT NULL,
  opsi_id INT NOT NULL,
  PRIMARY KEY (jawaban_id, opsi_id),
  CONSTRAINT fk_jo_jawaban FOREIGN KEY (jawaban_id) REFERENCES jawaban(id) ON DELETE CASCADE,
  CONSTRAINT fk_jo_opsi FOREIGN KEY (opsi_id) REFERENCES opsi(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
