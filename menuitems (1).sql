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
-- Struktur dari tabel `menuitems`
--

CREATE TABLE `menuitems` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `menugroup_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `menuitems`
--

INSERT INTO `menuitems` (`id`, `name`, `url`, `icon`, `menugroup_id`, `created_at`, `updated_at`) VALUES
(1, 'product', '/dashboard/products', 'fa-box', 2, '2023-09-20 02:51:12', '2023-09-20 02:51:12'),
(2, 'Supplier', '/dashboard/supplier', 'fa-people-carry-box', 2, '2023-09-20 19:42:32', '2023-09-20 21:32:57'),
(3, 'Restock', '/dashboard/restock', 'fa-square-plus', 2, '2023-09-20 19:51:24', '2023-09-20 20:06:12'),
(4, 'Return', '/dashboard/return', 'fa-square-minus', 2, '2023-09-20 20:06:34', '2023-09-20 20:06:34'),
(5, 'Category', '/dashboard/category', 'fa-layer-group', 2, '2023-09-20 20:10:24', '2023-09-20 20:10:24'),
(6, 'Unit', '/dashboard/unit', 'fa-ruler', 2, '2023-09-20 20:11:25', '2023-09-20 20:11:25'),
(7, 'Point Of Sale', '/dashboard/sales', 'fa-cash-register', 3, '2023-09-20 20:11:33', '2023-09-20 20:17:35'),
(8, 'Deposit', '/dashboard/deposit', 'fa-wallet', 3, '2023-09-20 20:17:04', '2023-09-20 20:22:47'),
(9, 'credit', '/dashboard/credit', 'fa-credit-card', 3, '2023-09-20 20:17:21', '2023-09-20 20:25:01'),
(10, 'History Sale', '/dashboard/historyTransaction', 'fa-money-bill-transfer', 3, '2023-09-20 20:39:19', '2023-09-20 20:39:19'),
(11, 'Process', '/dashboard/delivery', 'fa-truck-fast', 4, '2023-09-20 20:53:40', '2023-09-20 20:53:40'),
(12, 'History Delivery', '/dashboard/historyDelivery', 'fa-hourglass', 4, '2023-09-20 20:55:56', '2023-09-20 20:55:56'),
(13, 'Fleet', '/dashboard/fleet', 'fa-truck-front', 4, '2023-09-20 21:03:21', '2023-09-20 21:03:21'),
(14, 'Customer', '/dashboard/customer', 'fa-user', 3, '2023-09-20 21:14:30', '2023-09-20 21:15:47'),
(15, 'Staff', '/dashboard/staff', 'fa-user-tie', 5, '2023-09-20 21:26:59', '2023-09-20 21:27:26'),
(16, 'Position', '/dashboard/position', 'fa-network-wired', 5, '2023-09-20 21:29:53', '2023-09-20 21:29:53'),
(17, 'User', '/dashboard/user', 'fa-users', 5, '2023-09-20 21:32:01', '2023-09-20 21:39:09'),
(19, 'Home', '/dashboard/app', 'fa-house', 1, '2023-09-20 21:53:30', '2023-09-20 21:53:30'),
(20, 'Setting', '/dashboard/setting', 'fa-gear', 5, '2023-10-11 14:09:08', '2023-10-11 14:09:08');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `menuitems`
--
ALTER TABLE `menuitems`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `menuitems`
--
ALTER TABLE `menuitems`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
