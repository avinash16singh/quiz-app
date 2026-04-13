-- Fix the database schema for quiz_count column
-- Run this in PostgreSQL to fix the existing data

-- First, add the column as nullable
ALTER TABLE students ADD COLUMN IF NOT EXISTS quiz_count INTEGER;

-- Update existing records to have quiz_count = 0
UPDATE students SET quiz_count = 0 WHERE quiz_count IS NULL;

-- Now make it NOT NULL with default
ALTER TABLE students ALTER COLUMN quiz_count SET NOT NULL;
ALTER TABLE students ALTER COLUMN quiz_count SET DEFAULT 0;