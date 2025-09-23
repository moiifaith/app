-- Cloudflare D1 Database Schema for Zikr App

-- Users table (for future user management)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
  preferences TEXT -- JSON string for user preferences
);

-- Zikrs table
CREATE TABLE IF NOT EXISTS zikrs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  arabic TEXT NOT NULL,
  latin TEXT NOT NULL,
  identifier TEXT UNIQUE NOT NULL,
  default_repetitions INTEGER DEFAULT 33,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  zikr_id INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  target_count INTEGER NOT NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD format
  completed BOOLEAN DEFAULT 0,
  session_start DATETIME,
  session_end DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (zikr_id) REFERENCES zikrs(id)
);

-- Zikr sessions (detailed tracking)
CREATE TABLE IF NOT EXISTS zikr_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  zikr_id INTEGER NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  total_count INTEGER DEFAULT 0,
  target_count INTEGER NOT NULL,
  completed BOOLEAN DEFAULT 0,
  device_info TEXT, -- JSON string with device/browser info
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (zikr_id) REFERENCES zikrs(id)
);

-- Admin users
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

-- Translations (if stored in database instead of KV)
CREATE TABLE IF NOT EXISTS translations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  language_code TEXT NOT NULL,
  translation_key TEXT NOT NULL,
  translation_value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(language_code, translation_key)
);

-- Insert default zikrs
INSERT OR IGNORE INTO zikrs (arabic, latin, identifier, default_repetitions) VALUES
('سُبْحَانَ اللهِ', 'Subhan Allah', 'subhan_allah', 33),
('الْحَمْدُ لِلّهِ', 'Alhamdulillah', 'alhamdulillah', 33),
('اللّهُ أَكْبَرُ', 'Allahu Akbar', 'allahu_akbar', 34),
('لَا إِلَهَ إِلَّا اللّهُ', 'La ilaha illa Allah', 'la_ilaha_illa_allah', 100),
('اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', 'Allahumma salli ala Muhammad', 'salawat', 10),
('أَسْتَغْفِرُ اللّهَ', 'Astaghfirullah', 'astaghfirullah', 70),
('لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّهِ', 'La hawla wa la quwwata illa billah', 'la_hawla', 10),
('بِسْمِ اللّهِ', 'Bismillah', 'bismillah', 21),
('رَبِّ اغْفِرْ لِي', 'Rabbi ghfir li', 'rabbi_ghfir_li', 25),
('سُبْحَانَ اللهِ وَبِحَمْدِهِ', 'Subhan Allahi wa bihamdihi', 'subhan_allah_wa_bihamdihi', 100),
('سُبْحَانَ اللهِ الْعَظِيمِ', 'Subhan Allah al-Azeem', 'subhan_allah_al_azeem', 10),
('لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ', 'La ilaha illa anta subhanaka inni kuntu min az-zalimin', 'dua_yunus', 3),
('حَسْبُنَا اللّهُ وَنِعْمَ الْوَكِيلُ', 'Hasbuna Allah wa ni''ma al-wakeel', 'hasbuna_allah', 7),
('رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', 'Rabbana atina fi''d-dunya hasanatan wa fi''l-akhirati hasanatan wa qina azab an-nar', 'rabbana_atina', 3),
('رَضِيتُ بِاللهِ رَبًّا وَبِالإِسْلَامِ دِينًا وَبِمُحَمَّدٍ رَسُولًا', 'Radeetu billahi rabban wa bil-islami deenan wa bi Muhammadin rasulan', 'radeetu_billahi', 3);

-- Insert default admin user (password should be properly hashed in production)
INSERT OR IGNORE INTO admin_users (username, password_hash) VALUES
('admin', '$2b$10$example_hash_here'); -- This should be a proper bcrypt hash

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_date ON user_progress(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_progress_zikr_date ON user_progress(zikr_id, date);
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON zikr_sessions(user_id, DATE(start_time));
CREATE INDEX IF NOT EXISTS idx_translations_lang_key ON translations(language_code, translation_key);