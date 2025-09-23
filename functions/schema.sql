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

-- Languages table for supported languages
CREATE TABLE IF NOT EXISTS languages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL, -- ISO 639-1 language code (e.g., 'en', 'ar', 'es')
  name TEXT NOT NULL, -- Language name in English
  native_name TEXT NOT NULL, -- Language name in its native script
  rtl BOOLEAN DEFAULT 0, -- Right-to-left language
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

-- Translations (backup storage, primary storage is in KV)
CREATE TABLE IF NOT EXISTS translations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  language_code TEXT NOT NULL,
  translation_key TEXT NOT NULL,
  translation_value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(language_code, translation_key),
  FOREIGN KEY (language_code) REFERENCES languages(code)
);

-- Insert supported languages
INSERT OR IGNORE INTO languages (code, name, native_name, rtl) VALUES
('en', 'English', 'English', 0),
('ar', 'Arabic', 'العربية', 1),
('es', 'Spanish', 'Español', 0),
('fr', 'French', 'Français', 0),
('id', 'Indonesian', 'Bahasa Indonesia', 0),
('tr', 'Turkish', 'Türkçe', 0),
('ur', 'Urdu', 'اردو', 1),
('bn', 'Bengali', 'বাংলা', 0),
('ms', 'Malay', 'Bahasa Melayu', 0),
('fa', 'Persian', 'فارسی', 1);

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

-- Insert default English translations
INSERT OR IGNORE INTO translations (language_code, translation_key, translation_value) VALUES
('en', 'subhan_allah', 'Glory be to Allah - expressing the perfection and transcendence of Allah'),
('en', 'alhamdulillah', 'All praise is due to Allah - acknowledging Allah as the source of all good'),
('en', 'allahu_akbar', 'Allah is the Greatest - acknowledging Allah''s supreme greatness'),
('en', 'la_ilaha_illa_allah', 'There is no god but Allah - the declaration of faith'),
('en', 'salawat', 'Blessings upon Prophet Muhammad - sending peace and blessings'),
('en', 'astaghfirullah', 'I seek forgiveness from Allah - asking for Allah''s forgiveness'),
('en', 'la_hawla', 'There is no power except with Allah - acknowledging Allah as the source of all strength'),
('en', 'bismillah', 'In the name of Allah - beginning with Allah''s name'),
('en', 'rabbi_ghfir_li', 'My Lord, forgive me - a personal prayer for forgiveness'),
('en', 'subhan_allah_wa_bihamdihi', 'Glory be to Allah and praise to Him - combined glorification and praise'),
('en', 'subhan_allah_al_azeem', 'Glory be to Allah, the Most Great - emphasizing Allah''s magnificence'),
('en', 'dua_yunus', 'There is no god but You, glory be to You, I was among the wrongdoers - Prophet Yunus''s supplication'),
('en', 'hasbuna_allah', 'Allah is sufficient for us and He is the best Disposer of affairs - expressing trust in Allah'),
('en', 'rabbana_atina', 'Our Lord, give us good in this world and good in the next world and save us from the punishment of the Fire'),
('en', 'radeetu_billahi', 'I am pleased with Allah as my Lord, Islam as my religion, and Muhammad as my messenger');

-- Insert Arabic translations
INSERT OR IGNORE INTO translations (language_code, translation_key, translation_value) VALUES
('ar', 'subhan_allah', 'تسبيح الله - التعبير عن كمال الله وتنزيهه'),
('ar', 'alhamdulillah', 'الثناء والشكر لله - الاعتراف بأن الله مصدر كل خير'),
('ar', 'allahu_akbar', 'الله أكبر - الاعتراف بعظمة الله العليا'),
('ar', 'la_ilaha_illa_allah', 'لا إله إلا الله - شهادة التوحيد'),
('ar', 'salawat', 'الصلاة على النبي محمد - إرسال السلام والبركات'),
('ar', 'astaghfirullah', 'أستغفر الله - طلب المغفرة من الله'),
('ar', 'la_hawla', 'لا حول ولا قوة إلا بالله - الاعتراف بأن الله مصدر كل قوة'),
('ar', 'bismillah', 'بسم الله - البداية باسم الله'),
('ar', 'rabbi_ghfir_li', 'رب اغفر لي - دعاء شخصي للمغفرة'),
('ar', 'subhan_allah_wa_bihamdihi', 'سبحان الله وبحمده - الجمع بين التسبيح والحمد'),
('ar', 'subhan_allah_al_azeem', 'سبحان الله العظيم - التأكيد على عظمة الله'),
('ar', 'dua_yunus', 'لا إله إلا أنت سبحانك إني كنت من الظالمين - دعاء النبي يونس'),
('ar', 'hasbuna_allah', 'حسبنا الله ونعم الوكيل - التعبير عن الثقة بالله'),
('ar', 'rabbana_atina', 'ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار'),
('ar', 'radeetu_billahi', 'رضيت بالله ربا وبالإسلام دينا وبمحمد رسولا');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_translations_lang_key ON translations(language_code, translation_key);
CREATE INDEX IF NOT EXISTS idx_zikrs_identifier ON zikrs(identifier);
CREATE INDEX IF NOT EXISTS idx_zikrs_active ON zikrs(is_active);
CREATE INDEX IF NOT EXISTS idx_languages_code ON languages(code);
CREATE INDEX IF NOT EXISTS idx_languages_active ON languages(is_active);