-- Migration script to recreate tables with new structure

-- Drop all existing tables
DROP TABLE IF EXISTS user_preferences;
DROP TABLE IF EXISTS translation_versions;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS user_progress;
DROP TABLE IF EXISTS zikrs;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS languages;
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS translations;

-- Now run the full schema
