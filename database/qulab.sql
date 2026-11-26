-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 26, 2026 at 03:16 AM
-- Server version: 8.0.46
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `qulab`
--

-- --------------------------------------------------------

--
-- Table structure for table `dosen`
--

CREATE TABLE `dosen` (
  `id` int NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `dosen`
--

INSERT INTO `dosen` (`id`, `username`, `password_hash`) VALUES
(1, 'dosen', '$2a$10$uuNq8xfc8dlgeLlNawUp3ODRYGzcvx0ifw/AXL1io.3cYhe6/JpDi');

-- --------------------------------------------------------

--
-- Table structure for table `jawaban`
--

CREATE TABLE `jawaban` (
  `id` int NOT NULL,
  `sesi_soal_id` int NOT NULL,
  `peserta_id` int NOT NULL,
  `waktu_jawab_ms` int NOT NULL,
  `poin` decimal(10,2) NOT NULL DEFAULT '0.00',
  `benar` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `jawaban`
--

INSERT INTO `jawaban` (`id`, `sesi_soal_id`, `peserta_id`, `waktu_jawab_ms`, `poin`, `benar`) VALUES
(7, 23, 8, 11162, '0.00', 0),
(8, 23, 9, 12166, '0.00', 0),
(9, 23, 11, 12953, '0.00', 0),
(10, 24, 8, 7816, '0.00', 0),
(11, 24, 9, 10706, '0.00', 0),
(12, 24, 11, 13527, '0.00', 0),
(13, 25, 8, 5363, '87.00', 1),
(14, 25, 9, 6994, '0.00', 0),
(15, 25, 11, 7850, '80.00', 1),
(16, 33, 13, 9212, '77.00', 1),
(17, 33, 12, 14401, '0.00', 0),
(18, 34, 13, 8167, '0.00', 0),
(19, 34, 12, 9194, '770.00', 1),
(20, 34, 14, 10097, '0.00', 0),
(21, 35, 12, 14851, '63.00', 1),
(22, 35, 13, 16372, '0.00', 0),
(23, 35, 14, 17964, '0.00', 0),
(24, 36, 13, 7178, '0.00', 0),
(25, 36, 12, 7944, '0.00', 0),
(26, 36, 14, 9774, '76.00', 1),
(27, 37, 13, 33695, '0.00', 0),
(28, 37, 12, 34877, '0.00', 0),
(29, 37, 14, 35681, '0.00', 0);

-- --------------------------------------------------------

--
-- Table structure for table `jawaban_opsi`
--

CREATE TABLE `jawaban_opsi` (
  `jawaban_id` int NOT NULL,
  `opsi_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `jawaban_opsi`
--

INSERT INTO `jawaban_opsi` (`jawaban_id`, `opsi_id`) VALUES
(26, 14),
(24, 15),
(25, 15),
(21, 26),
(22, 27),
(23, 27),
(16, 29),
(17, 30);

-- --------------------------------------------------------

--
-- Table structure for table `matkul`
--

CREATE TABLE `matkul` (
  `id` int NOT NULL,
  `nama` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `matkul`
--

INSERT INTO `matkul` (`id`, `nama`) VALUES
(1, 'Komunikasi Data');

-- --------------------------------------------------------

--
-- Table structure for table `opsi`
--

CREATE TABLE `opsi` (
  `id` int NOT NULL,
  `soal_id` int NOT NULL,
  `urutan` tinyint NOT NULL,
  `teks` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_benar` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `opsi`
--

INSERT INTO `opsi` (`id`, `soal_id`, `urutan`, `teks`, `is_benar`) VALUES
(13, 2, 1, '2001:db8:acad:1234:021a:2bff:fe3c:4d5e', 0),
(14, 2, 2, '2001:db8:acad:1234:21a:2bff:fe3c:4d5e', 1),
(15, 2, 3, '2001:db8:acad:1234::21a:2bff:fe3c:4d5e', 0),
(16, 2, 4, '2001:db8:acad:1234:21a:ff:fe3c:4d5e', 0),
(25, 5, 1, 'Fitur A: TCP; Fitur B: UDP', 0),
(26, 5, 2, 'Fitur A: UDP; Fitur B: TCP', 1),
(27, 5, 3, 'Fitur A: UDP; Fitur B: UDP', 0),
(28, 5, 4, 'Fitur A: TCP; Fitur B: TCP', 0),
(29, 3, 1, 'OSI Layer 6 (Presentation Layer) / TCP-IP Application Layer', 1),
(30, 3, 2, 'OSI Layer 1 (Physical Layer) / TCP-IP Network Access Layer', 0),
(31, 3, 3, 'OSI Layer 3 (Network Layer) / TCP-IP Internet Layer', 0),
(32, 3, 4, 'OSI Layer 2 (Data Link Layer) / TCP-IP Network Access Layer', 0),
(33, 4, 1, 'Frame > Packet > Segment > Data > Bit', 0),
(34, 4, 2, 'Data > Segment (Transport) > Packet (Network) > Frame (Data Link) > Bit (Physical)', 1),
(35, 4, 3, 'Segment > Data > Frame > Packet > Bit', 0),
(36, 4, 4, 'Packet > Frame > Segment > Data > Bit', 0),
(37, 1, 1, 'Menyisipkan FF:FE di tengah MAC menjadi 00:1A:2B:FF:FE:3C:4D:5E, lalu membalik (invert) bit ke-7 byte pertama (0x00 $\\rightarrow$ 0x02), menghasilkan 021a:2bff:fe3c:4d5e', 1),
(38, 1, 2, 'Menyisipkan FF:FF di akhir MAC menjadi 00:1A:2B:3C:4D:5E:FF:FF, lalu membalik bit ke-1 byte terakhir', 0),
(39, 1, 3, 'Menghapus karakter titik dua (:) dan menambahkan ::1 di bagian akhir tanpa mengubah bit apa pun', 0),
(40, 1, 4, 'Mengubah seluruh karakter heksadesimal menjadi huruf kapital dan menambah prefix /128', 0);

-- --------------------------------------------------------

--
-- Table structure for table `peserta`
--

CREATE TABLE `peserta` (
  `id` int NOT NULL,
  `sesi_id` int NOT NULL,
  `nama` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_norm` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_poin` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_waktu_ms` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `peserta`
--

INSERT INTO `peserta` (`id`, `sesi_id`, `nama`, `nama_norm`, `total_poin`, `total_waktu_ms`) VALUES
(5, 8, 'Andri', 'andri', '0.00', 0),
(6, 8, 'Fahmi', 'fahmi', '0.00', 0),
(7, 8, 'Qulab', 'qulab', '0.00', 0),
(8, 9, 'Andri', 'andri', '87.00', 24341),
(9, 9, 'Fahmi', 'fahmi', '0.00', 29866),
(11, 9, 'Qulab', 'qulab', '80.00', 34330),
(12, 11, 'Fahmi', 'fahmi', '833.00', 81267),
(13, 11, 'Andri', 'andri', '77.00', 74624),
(14, 11, 'Qulab', 'qulab', '76.00', 73516);

-- --------------------------------------------------------

--
-- Table structure for table `sesi`
--

CREATE TABLE `sesi` (
  `id` int NOT NULL,
  `matkul_id` int NOT NULL,
  `pin` char(4) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jumlah_soal` int NOT NULL,
  `status` enum('menunggu','berjalan','selesai','dihentikan') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'menunggu',
  `dibuat_pada` datetime NOT NULL,
  `mulai_pada` datetime DEFAULT NULL,
  `selesai_pada` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sesi`
--

INSERT INTO `sesi` (`id`, `matkul_id`, `pin`, `jumlah_soal`, `status`, `dibuat_pada`, `mulai_pada`, `selesai_pada`) VALUES
(2, 1, '7590', 2, 'berjalan', '2026-11-20 11:00:04', '2026-11-20 11:11:54', NULL),
(4, 1, '8848', 2, 'menunggu', '2026-11-20 11:32:13', NULL, NULL),
(5, 1, '8243', 2, 'menunggu', '2026-11-20 17:17:20', NULL, NULL),
(6, 1, '8152', 2, 'berjalan', '2026-11-26 08:45:02', '2026-11-26 08:51:06', NULL),
(8, 1, '8594', 5, 'menunggu', '2026-11-26 09:00:18', NULL, NULL),
(9, 1, '9274', 5, 'berjalan', '2026-11-26 09:49:34', '2026-11-26 09:52:25', NULL),
(10, 1, '2610', 5, 'menunggu', '2026-11-26 09:55:08', NULL, NULL),
(11, 1, '1003', 5, 'selesai', '2026-11-26 09:55:22', '2026-11-26 09:56:17', '2026-11-26 10:02:12'),
(12, 1, '3632', 5, 'menunggu', '2026-11-26 10:06:02', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sesi_soal`
--

CREATE TABLE `sesi_soal` (
  `id` int NOT NULL,
  `sesi_id` int NOT NULL,
  `soal_id` int NOT NULL,
  `urutan` int NOT NULL,
  `urutan_opsi` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sesi_soal`
--

INSERT INTO `sesi_soal` (`id`, `sesi_id`, `soal_id`, `urutan`, `urutan_opsi`) VALUES
(3, 2, 2, 1, '3,1,4,2'),
(4, 2, 1, 2, '3,2,1,4'),
(7, 4, 1, 1, '3,1,2,4'),
(8, 4, 2, 2, '1,3,4,2'),
(9, 5, 1, 1, '1,3,2,4'),
(10, 5, 2, 2, '3,1,4,2'),
(11, 6, 1, 1, '4,1,2,3'),
(12, 6, 2, 2, '1,2,3,4'),
(18, 8, 5, 1, '3,1,4,2'),
(19, 8, 4, 2, '2,3,4,1'),
(20, 8, 1, 3, '2,4,1,3'),
(21, 8, 3, 4, '3,4,1,2'),
(22, 8, 2, 5, '4,1,2,3'),
(23, 9, 1, 1, '1,2,4,3'),
(24, 9, 4, 2, '1,3,2,4'),
(25, 9, 3, 3, '1,3,2,4'),
(26, 9, 5, 4, '1,3,2,4'),
(27, 9, 2, 5, '3,1,2,4'),
(28, 10, 2, 1, '2,3,4,1'),
(29, 10, 5, 2, '2,1,3,4'),
(30, 10, 4, 3, '2,3,4,1'),
(31, 10, 3, 4, '2,4,1,3'),
(32, 10, 1, 5, '1,4,2,3'),
(33, 11, 3, 1, '3,1,4,2'),
(34, 11, 4, 2, '1,3,2,4'),
(35, 11, 5, 3, '3,2,4,1'),
(36, 11, 2, 4, '4,3,1,2'),
(37, 11, 1, 5, '1,4,2,3'),
(38, 12, 3, 1, '4,2,3,1'),
(39, 12, 4, 2, '1,3,4,2'),
(40, 12, 2, 3, '4,1,3,2'),
(41, 12, 5, 4, '3,1,2,4'),
(42, 12, 1, 5, '4,3,1,2');

-- --------------------------------------------------------

--
-- Table structure for table `soal`
--

CREATE TABLE `soal` (
  `id` int NOT NULL,
  `matkul_id` int NOT NULL,
  `teks` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `gambar_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `waktu_detik` int NOT NULL DEFAULT '20',
  `poin` int NOT NULL DEFAULT '1000'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `soal`
--

INSERT INTO `soal` (`id`, `matkul_id`, `teks`, `gambar_path`, `waktu_detik`, `poin`) VALUES
(1, 1, 'Dengan prefix 2001:DB8:ACAD:1234::/64 dan MAC Address 00:1A:2B:3C:4D:5E, urutan proses pembentuk Interface ID EUI-64 yang tepat adalah...', NULL, 40, 100),
(2, 1, 'Bentuk notasi IPv6 lengkap yang paling ringkas/dikompresi pada komputer server tersebut adalah...', NULL, 20, 100),
(3, 1, 'Kegagalan pembentukan enkripsi TLS/SSL saat mengakses (https://www.google.com) (padahal kabel LAN dan IP normal) berada pada lapisan...', NULL, 20, 100),
(4, 1, 'Urutan unit data (PDU) yang benar saat data bergerak turun dari Application Layer hingga Physical Layer pada OSI Layer adalah...', NULL, 20, 1000),
(5, 1, 'Pilihan protokol yang paling tepat untuk Fitur A (Live Streaming video/audio) dan Fitur B (Login, pembayaran, dan E-Receipt) adalah...', NULL, 20, 100);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `dosen`
--
ALTER TABLE `dosen`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `jawaban`
--
ALTER TABLE `jawaban`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_jawaban` (`sesi_soal_id`,`peserta_id`),
  ADD KEY `fk_jawaban_peserta` (`peserta_id`);

--
-- Indexes for table `jawaban_opsi`
--
ALTER TABLE `jawaban_opsi`
  ADD PRIMARY KEY (`jawaban_id`,`opsi_id`),
  ADD KEY `fk_jo_opsi` (`opsi_id`);

--
-- Indexes for table `matkul`
--
ALTER TABLE `matkul`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `opsi`
--
ALTER TABLE `opsi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_opsi_soal` (`soal_id`);

--
-- Indexes for table `peserta`
--
ALTER TABLE `peserta`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_peserta_sesi_nama` (`sesi_id`,`nama_norm`);

--
-- Indexes for table `sesi`
--
ALTER TABLE `sesi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sesi_matkul` (`matkul_id`),
  ADD KEY `idx_sesi_pin_status` (`pin`,`status`);

--
-- Indexes for table `sesi_soal`
--
ALTER TABLE `sesi_soal`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sesi_soal_sesi` (`sesi_id`),
  ADD KEY `fk_sesi_soal_soal` (`soal_id`);

--
-- Indexes for table `soal`
--
ALTER TABLE `soal`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_soal_matkul` (`matkul_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `dosen`
--
ALTER TABLE `dosen`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `jawaban`
--
ALTER TABLE `jawaban`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `matkul`
--
ALTER TABLE `matkul`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `opsi`
--
ALTER TABLE `opsi`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `peserta`
--
ALTER TABLE `peserta`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `sesi`
--
ALTER TABLE `sesi`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `sesi_soal`
--
ALTER TABLE `sesi_soal`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `soal`
--
ALTER TABLE `soal`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `jawaban`
--
ALTER TABLE `jawaban`
  ADD CONSTRAINT `fk_jawaban_peserta` FOREIGN KEY (`peserta_id`) REFERENCES `peserta` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_jawaban_sesi_soal` FOREIGN KEY (`sesi_soal_id`) REFERENCES `sesi_soal` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `jawaban_opsi`
--
ALTER TABLE `jawaban_opsi`
  ADD CONSTRAINT `fk_jo_jawaban` FOREIGN KEY (`jawaban_id`) REFERENCES `jawaban` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_jo_opsi` FOREIGN KEY (`opsi_id`) REFERENCES `opsi` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `opsi`
--
ALTER TABLE `opsi`
  ADD CONSTRAINT `fk_opsi_soal` FOREIGN KEY (`soal_id`) REFERENCES `soal` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `peserta`
--
ALTER TABLE `peserta`
  ADD CONSTRAINT `fk_peserta_sesi` FOREIGN KEY (`sesi_id`) REFERENCES `sesi` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sesi`
--
ALTER TABLE `sesi`
  ADD CONSTRAINT `fk_sesi_matkul` FOREIGN KEY (`matkul_id`) REFERENCES `matkul` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sesi_soal`
--
ALTER TABLE `sesi_soal`
  ADD CONSTRAINT `fk_sesi_soal_sesi` FOREIGN KEY (`sesi_id`) REFERENCES `sesi` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_sesi_soal_soal` FOREIGN KEY (`soal_id`) REFERENCES `soal` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `soal`
--
ALTER TABLE `soal`
  ADD CONSTRAINT `fk_soal_matkul` FOREIGN KEY (`matkul_id`) REFERENCES `matkul` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
