-- Migration script to update database schema
-- Drop existing tables to avoid conflicts
DROP TABLE IF EXISTS user_preferences;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS user_progress;
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS zikrs;
DROP TABLE IF EXISTS languages;
DROP TABLE IF EXISTS translation_versions;
DROP TABLE IF EXISTS zikr_sessions;
DROP TABLE IF EXISTS translations;

-- Now create the new schema
-- Users table with authentication and roles
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active BOOLEAN DEFAULT 1,
  email_verified BOOLEAN DEFAULT 0,
  email_verification_token TEXT,
  password_reset_token TEXT,
  password_reset_expires DATETIME,
  last_login DATETIME,
  login_attempts INTEGER DEFAULT 0,
  locked_until DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Languages table for supported languages
CREATE TABLE IF NOT EXISTS languages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL, -- ISO 639-1 language code (e.g., 'en', 'ar', 'bs')
  name TEXT NOT NULL, -- Language name in English
  native_name TEXT NOT NULL, -- Language name in its native script
  rtl BOOLEAN DEFAULT 0, -- Right-to-left language
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Zikrs table (both default and user-created)
CREATE TABLE IF NOT EXISTS zikrs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER, -- NULL for default zikrs, user_id for custom zikrs
  arabic TEXT NOT NULL,
  latin TEXT NOT NULL,
  identifier TEXT NOT NULL,
  default_repetitions INTEGER DEFAULT 33,
  description TEXT,
  is_custom BOOLEAN DEFAULT 0, -- 0 for default, 1 for user-created
  is_active BOOLEAN DEFAULT 1,
  is_public BOOLEAN DEFAULT 0, -- Allow other users to see custom zikrs
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User progress tracking (for logged-in users)
CREATE TABLE IF NOT EXISTS user_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  zikr_id INTEGER NOT NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD format
  count INTEGER NOT NULL DEFAULT 0,
  target_count INTEGER NOT NULL,
  completed BOOLEAN DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0, -- Time spent on this zikr
  notes TEXT, -- Optional user notes
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (zikr_id) REFERENCES zikrs(id) ON DELETE CASCADE,
  UNIQUE(user_id, zikr_id, date)
);

-- User sessions tracking (detailed session data)
CREATE TABLE IF NOT EXISTS user_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  zikr_id INTEGER NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  count_achieved INTEGER DEFAULT 0,
  target_count INTEGER NOT NULL,
  completed BOOLEAN DEFAULT 0,
  interrupted BOOLEAN DEFAULT 0, -- If session was interrupted
  device_info TEXT, -- JSON string with device/browser info
  session_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (zikr_id) REFERENCES zikrs(id) ON DELETE CASCADE
);

-- Translation cache versioning (to track when translations change)
CREATE TABLE IF NOT EXISTS translation_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  language_code TEXT NOT NULL,
  version_hash TEXT NOT NULL, -- Hash of the translation content
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(language_code)
);

-- User preferences and settings
CREATE TABLE IF NOT EXISTS user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  preferred_language TEXT DEFAULT 'en',
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  notification_settings TEXT, -- JSON string
  privacy_settings TEXT, -- JSON string
  app_settings TEXT, -- JSON string for app-specific settings
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (preferred_language) REFERENCES languages(code),
  UNIQUE(user_id)
);

-- Insert supported languages (including new Balkan languages)
INSERT OR IGNORE INTO languages (code, name, native_name, rtl) VALUES
('en', 'English', 'English', 0),
('ar', 'Arabic', 'العربية', 1),
('es', 'Spanish', 'Español', 0),
('fr', 'French', 'Français', 0),
('bs', 'Bosnian', 'Bosanski', 0),
('hr', 'Croatian', 'Hrvatski', 0),
('sr', 'Serbian', 'Српски', 0),
('id', 'Indonesian', 'Bahasa Indonesia', 0),
('tr', 'Turkish', 'Türkçe', 0),
('ur', 'Urdu', 'اردو', 1),
('bn', 'Bengali', 'বাংলা', 0),
('ms', 'Malay', 'Bahasa Melayu', 0),
('fa', 'Persian', 'فارسی', 1);

-- Create default admin user with real bcrypt hash
-- Password: admin123 (bcrypt hash with salt rounds 10)
INSERT OR IGNORE INTO users (email, username, password_hash, first_name, last_name, role, is_active, email_verified) VALUES
('admin@moiifaith.com', 'admin', '$2b$10$PCdeDmHuWfXvMERiiUUMrOZNtuPZvu3r7S.l1NQPblT8YIOrW6chC', 'Admin', 'User', 'admin', 1, 1);

-- Insert default zikrs (public, not user-specific)
INSERT OR IGNORE INTO zikrs (arabic, latin, identifier, default_repetitions, description, is_custom, is_public) VALUES
('سُبْحَانَ اللهِ', 'Subhan Allah', 'subhan_allah', 33, 'Glory be to Allah', 0, 1),
('الْحَمْدُ لِلّهِ', 'Alhamdulillah', 'alhamdulillah', 33, 'All praise is due to Allah', 0, 1),
('اللّهُ أَكْبَرُ', 'Allahu Akbar', 'allahu_akbar', 34, 'Allah is the Greatest', 0, 1),
('لَا إِلَهَ إِلَّا اللّهُ', 'La ilaha illa Allah', 'la_ilaha_illa_allah', 100, 'There is no god but Allah', 0, 1),
('اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', 'Allahumma salli ala Muhammad', 'salawat', 10, 'Blessings upon Prophet Muhammad', 0, 1),
('أَسْتَغْفِرُ اللّهَ', 'Astaghfirullah', 'astaghfirullah', 70, 'I seek forgiveness from Allah', 0, 1),
('لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّهِ', 'La hawla wa la quwwata illa billah', 'la_hawla', 10, 'There is no power except with Allah', 0, 1),
('بِسْمِ اللّهِ', 'Bismillah', 'bismillah', 21, 'In the name of Allah', 0, 1),
('رَبِّ اغْفِرْ لِي', 'Rabbi ghfir li', 'rabbi_ghfir_li', 25, 'My Lord, forgive me', 0, 1),
('سُبْحَانَ اللهِ وَبِحَمْدِهِ', 'Subhan Allahi wa bihamdihi', 'subhan_allah_wa_bihamdihi', 100, 'Glory be to Allah and praise to Him', 0, 1),
('سُبْحَانَ اللهِ الْعَظِيمِ', 'Subhan Allah al-Azeem', 'subhan_allah_al_azeem', 10, 'Glory be to Allah, the Most Great', 0, 1),
('لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ', 'La ilaha illa anta subhanaka inni kuntu min az-zalimin', 'dua_yunus', 3, 'There is no god but You, glory be to You, I was among the wrongdoers', 0, 1),
('حَسْبُنَا اللّهُ وَنِعْمَ الْوَكِيلُ', 'Hasbuna Allah wa ni''ma al-wakeel', 'hasbuna_allah', 7, 'Allah is sufficient for us and He is the best Disposer of affairs', 0, 1),
('رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', 'Rabbana atina fi''d-dunya hasanatan wa fi''l-akhirati hasanatan wa qina azab an-nar', 'rabbana_atina', 3, 'Our Lord, give us good in this world and good in the next world', 0, 1),
('رَضِيتُ بِاللهِ رَبًّا وَبِالإِسْلَامِ دِينًا وَبِمُحَمَّدٍ رَسُولًا', 'Radeetu billahi rabban wa bil-islami deenan wa bi Muhammadin rasulan', 'radeetu_billahi', 3, 'I am pleased with Allah as my Lord, Islam as my religion, and Muhammad as my messenger', 0, 1);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_zikrs_user_id ON zikrs(user_id);
CREATE INDEX IF NOT EXISTS idx_zikrs_identifier ON zikrs(identifier);
CREATE INDEX IF NOT EXISTS idx_zikrs_custom ON zikrs(is_custom);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_date ON user_progress(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_progress_zikr ON user_progress(zikr_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_zikr ON user_sessions(zikr_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_date ON user_sessions(DATE(start_time));
CREATE INDEX IF NOT EXISTS idx_languages_code ON languages(code);
CREATE INDEX IF NOT EXISTS idx_languages_active ON languages(is_active);
CREATE INDEX IF NOT EXISTS idx_translation_versions_lang ON translation_versions(language_code);
