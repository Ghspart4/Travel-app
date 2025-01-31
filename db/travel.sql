-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 31, 2025 at 06:29 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `travel`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `trip_id` int(11) NOT NULL,
  `type` enum('flight','accommodation','car-rental','activity','other') NOT NULL,
  `details` text DEFAULT NULL,
  `datetime` datetime NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `trip_id`, `type`, `details`, `datetime`, `status`, `created_at`) VALUES
(15, 9, 'flight', 'Christchurch', '2025-01-31 15:05:00', 'pending', '2025-01-29 02:05:20');

-- --------------------------------------------------------

--
-- Table structure for table `todos`
--

CREATE TABLE `todos` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `task` varchar(255) NOT NULL,
  `status` enum('Pending','In Progress','Completed') NOT NULL DEFAULT 'Pending',
  `due_date` date DEFAULT NULL,
  `priority` enum('Low','Medium','High') DEFAULT 'Medium',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `todos`
--

INSERT INTO `todos` (`id`, `user_id`, `task`, `status`, `due_date`, `priority`, `created_at`, `updated_at`) VALUES
(2, 2, 'carlos', 'In Progress', '2025-01-31', 'High', '2025-01-26 15:06:57', '2025-01-26 15:06:57'),
(3, 2, 'Hola', 'Completed', '2025-01-31', 'Low', '2025-01-29 14:22:23', '2025-01-29 14:22:23');

-- --------------------------------------------------------

--
-- Table structure for table `trips`
--

CREATE TABLE `trips` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trips`
--

INSERT INTO `trips` (`id`, `user_id`, `name`, `start_date`, `end_date`, `created_at`) VALUES
(9, 2, 'Bali', '2025-02-06', '2025-02-14', '2025-01-28 06:09:50'),
(10, 2, 'Carlos', '2025-01-31', '2025-01-31', '2025-01-28 06:48:21'),
(11, 2, 'Thailand', '2025-01-31', '2025-01-31', '2025-01-28 06:49:49');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `role` enum('admin','premium','customer') NOT NULL DEFAULT 'customer',
  `fullname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `contactNumber` int(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `role`, `fullname`, `email`, `password`, `created_at`, `updated_at`, `contactNumber`) VALUES
(1, 'admin', 'Carlos Martinez', 'carlos.martinez@outlook.co.nz', '$2b$10$dbF2ktnnwwrTmzuMCG7DKesc8Ju.K.QIu7M1gJxBb8fXJti3wps0e', '2025-01-02 11:15:55', '2025-01-05 08:50:47', 0),
(2, 'premium', 'Lorena Alvarado', 'loresblock@gmail.com', '$2b$10$Eb/NOP1308Xm6lMMV2DVjOtqUiGi26ni3HtrhJeRnk5/CSSKywbwm', '2025-01-02 11:55:25', '2025-01-05 08:50:58', 0),
(4, 'premium', 'Chika', 'chika@gmail.com', '$2b$10$Kq9u.yzR1Ln7iE09/W.YWu7BXZkaDXQL6kUOyIPggoLs6Imm35dfS', '2025-01-03 10:23:21', '2025-01-26 14:59:15', 0),
(5, 'customer', 'Jayden', 'jayden@gmail.com', '$2b$10$n1tj1oulx5tPsN.VKvF4MeWD/wY4TgVsHlGCwKeF/roMEsDnPDO0y', '2025-01-05 08:30:23', '2025-01-05 08:42:20', 0),
(6, 'customer', 'Zyler Martinez', 'zyler@gmail.com', '$2b$10$MvFpfbKR.HjWVMRYlnWQ.OiyHrYluI2ma2UKtAim6Of.rwALJ3TRe', '2025-01-10 20:06:14', '2025-01-10 20:06:14', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trip_id` (`trip_id`);

--
-- Indexes for table `todos`
--
ALTER TABLE `todos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `trips`
--
ALTER TABLE `trips`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `todos`
--
ALTER TABLE `todos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `trips`
--
ALTER TABLE `trips`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`id`);

--
-- Constraints for table `todos`
--
ALTER TABLE `todos`
  ADD CONSTRAINT `todos_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trips`
--
ALTER TABLE `trips`
  ADD CONSTRAINT `trips_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
