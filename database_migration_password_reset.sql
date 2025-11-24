-- Migration script to add password reset columns to users table
-- Run this in your Supabase SQL Editor

-- Add password_reset_code column (nullable integer)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_reset_code INTEGER;

-- Add password_reset_code_expires column (nullable timestamp)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_reset_code_expires TIMESTAMPTZ;

-- Optional: Add a comment to document the columns
COMMENT ON COLUMN users.password_reset_code IS '6-digit code for password reset, expires after 1 hour';
COMMENT ON COLUMN users.password_reset_code_expires IS 'Expiration timestamp for the password reset code';

