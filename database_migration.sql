USE ionic_app;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role ENUM('admin','moderator','user') NOT NULL DEFAULT 'user' AFTER password_hash,
  ADD COLUMN IF NOT EXISTS status ENUM('active','inactive','blocked') NOT NULL DEFAULT 'active' AFTER role,
  ADD COLUMN IF NOT EXISTS api_token CHAR(64) NULL AFTER status,
  ADD COLUMN IF NOT EXISTS api_token_expires_at DATETIME NULL AFTER api_token,
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NULL DEFAULT NULL AFTER api_token_expires_at,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

ALTER TABLE users
  ADD UNIQUE KEY uq_users_api_token (api_token);
