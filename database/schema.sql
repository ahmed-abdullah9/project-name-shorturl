-- ShortURL Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS shorturl CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE shorturl;

-- Create urls table
CREATE TABLE IF NOT EXISTS urls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_url TEXT NOT NULL,
    short_code VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    click_count INT DEFAULT 0,
    INDEX idx_short_code (short_code),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Create an index for better performance on original_url lookups
-- Using a hash for large URLs
ALTER TABLE urls ADD COLUMN url_hash VARCHAR(64) GENERATED ALWAYS AS (SHA2(original_url, 256)) STORED;
CREATE INDEX idx_url_hash ON urls (url_hash);