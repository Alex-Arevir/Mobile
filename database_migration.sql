USE ionic_app;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS preferred_name VARCHAR(100) NULL AFTER password_hash,
  ADD COLUMN IF NOT EXISTS phone VARCHAR(30) NULL AFTER preferred_name,
  ADD COLUMN IF NOT EXISTS position VARCHAR(100) NULL AFTER phone,
  ADD COLUMN IF NOT EXISTS role ENUM('admin','moderator','user') NOT NULL DEFAULT 'user' AFTER password_hash,
  ADD COLUMN IF NOT EXISTS status ENUM('active','inactive','blocked') NOT NULL DEFAULT 'active' AFTER role,
  ADD COLUMN IF NOT EXISTS api_token CHAR(64) NULL AFTER status,
  ADD COLUMN IF NOT EXISTS api_token_expires_at DATETIME NULL AFTER api_token,
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NULL DEFAULT NULL AFTER api_token_expires_at,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

ALTER TABLE users
  ADD UNIQUE KEY uq_users_api_token (api_token);

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
