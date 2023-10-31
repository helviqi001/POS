-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 11 Okt 2023 pada 23.11
-- Versi server: 10.4.25-MariaDB
-- Versi PHP: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pos`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `privilages`
--

CREATE TABLE `privilages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `position_id` bigint(20) UNSIGNED NOT NULL,
  `menuitem_id` bigint(20) UNSIGNED NOT NULL,
  `view` tinyint(4) NOT NULL,
  `add` tinyint(4) NOT NULL,
  `edit` tinyint(4) NOT NULL,
  `delete` tinyint(4) NOT NULL,
  `import` tinyint(4) NOT NULL,
  `export` tinyint(4) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `privilages`
--

INSERT INTO `privilages` (`id`, `position_id`, `menuitem_id`, `view`, `add`, `edit`, `delete`, `import`, `export`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, 1, 1, 1, 1, 1, '2023-09-20 02:51:12', '2023-09-20 02:51:12'),
(2, 1, 2, 1, 1, 1, 1, 1, 1, '2023-09-20 19:42:32', '2023-09-20 19:42:32'),
(3, 1, 3, 1, 1, 1, 1, 1, 1, '2023-09-20 19:51:24', '2023-09-20 19:51:24'),
(4, 1, 4, 1, 1, 1, 1, 1, 1, '2023-09-20 20:06:34', '2023-09-20 20:06:34'),
(5, 1, 5, 1, 1, 1, 1, 1, 1, '2023-09-20 20:10:24', '2023-09-20 20:10:24'),
(6, 1, 6, 1, 1, 1, 1, 1, 1, '2023-09-20 20:11:25', '2023-09-20 20:11:25'),
(7, 1, 7, 1, 1, 1, 1, 1, 1, '2023-09-20 20:11:33', '2023-09-20 20:11:33'),
(8, 1, 8, 1, 1, 1, 1, 1, 1, '2023-09-20 20:17:04', '2023-09-20 20:17:04'),
(9, 1, 9, 1, 1, 1, 1, 1, 1, '2023-09-20 20:17:21', '2023-09-20 20:17:21'),
(10, 1, 10, 1, 1, 1, 1, 1, 1, '2023-09-20 20:39:19', '2023-09-20 20:39:19'),
(11, 1, 11, 1, 1, 1, 1, 1, 1, '2023-09-20 20:53:40', '2023-09-20 20:53:40'),
(12, 1, 12, 1, 1, 1, 1, 1, 1, '2023-09-20 20:55:56', '2023-09-20 20:55:56'),
(13, 1, 13, 1, 1, 1, 1, 1, 1, '2023-09-20 21:03:21', '2023-09-20 21:03:21'),
(14, 1, 14, 1, 1, 1, 1, 1, 1, '2023-09-20 21:14:30', '2023-09-20 21:14:30'),
(15, 1, 15, 1, 1, 1, 1, 1, 1, '2023-09-20 21:26:59', '2023-09-20 21:26:59'),
(16, 1, 16, 1, 1, 1, 1, 1, 1, '2023-09-20 21:29:53', '2023-09-20 21:29:53'),
(17, 1, 17, 1, 1, 1, 1, 1, 1, '2023-09-20 21:32:01', '2023-09-20 21:32:01'),
(19, 1, 19, 1, 1, 1, 1, 1, 1, '2023-09-20 21:53:30', '2023-09-20 21:53:30'),
(20, 1, 20, 1, 1, 1, 1, 1, 1, '2023-10-11 14:09:08', '2023-10-11 14:09:08');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `privilages`
--
ALTER TABLE `privilages`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `privilages`
--
ALTER TABLE `privilages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
