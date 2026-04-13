-- Quick fix: Drop and recreate the database
DROP DATABASE IF EXISTS quizdb;
CREATE DATABASE quizdb;
GRANT ALL PRIVILEGES ON DATABASE quizdb TO postgres;