CREATE DATABASE IF NOT EXISTS ionic_app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ionic_app;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(120) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  preferred_name VARCHAR(100) NULL,
  phone VARCHAR(30) NULL,
  position VARCHAR(100) NULL,
  role ENUM('admin','moderator','user') NOT NULL DEFAULT 'user',
  status ENUM('active','inactive','blocked') NOT NULL DEFAULT 'active',
  api_token CHAR(64) NULL,
  api_token_expires_at DATETIME NULL,
  last_login TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_api_token (api_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS employee_requests (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(120) NOT NULL,
  phone VARCHAR(30) NULL,
  position VARCHAR(100) NULL,
  message VARCHAR(500) NULL,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_employee_requests_status (status),
  CONSTRAINT fk_employee_requests_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed only for local development.
-- Plain password: Admin123*
INSERT INTO users (username, email, password_hash, role, status)
VALUES (
  'admin',
  'admin@example.com',
  '$2y$10$HQNRoPOoyKP1MGkWc2E/xe7eJ/1vAhxQc7ZBZyvkKAViWz7A.jGia',
  'admin',
  'active'
)
ON DUPLICATE KEY UPDATE username = username;
