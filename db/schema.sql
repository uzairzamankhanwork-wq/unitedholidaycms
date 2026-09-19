-- United Holidays CMS schema
-- Singleton tables (hero, site_settings, about_content, contact_info) always
-- keep exactly one row with id = 1, updated in place.

CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  site_name TEXT NOT NULL DEFAULT 'United Holidays',
  tagline TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  footer_about TEXT DEFAULT '',
  copyright_text TEXT DEFAULT '',
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hero (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  heading TEXT DEFAULT '',
  description TEXT DEFAULT '',
  bg_image TEXT DEFAULT '',
  primary_btn_text TEXT DEFAULT '',
  primary_btn_link TEXT DEFAULT '',
  secondary_btn_text TEXT DEFAULT '',
  secondary_btn_link TEXT DEFAULT '',
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS marquee_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  emoji TEXT DEFAULT '',
  text TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS destinations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  location TEXT DEFAULT '',
  image TEXT DEFAULT '',
  price TEXT DEFAULT '',
  rating TEXT DEFAULT '',
  description TEXT DEFAULT '',
  highlights TEXT DEFAULT '[]',      -- JSON array of strings
  duration TEXT DEFAULT '',
  group_size TEXT DEFAULT '',
  whatsapp_message TEXT DEFAULT '',
  featured INTEGER NOT NULL DEFAULT 0,  -- shown in homepage "Popular Destinations"
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS visa_services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  image TEXT DEFAULT '',
  description TEXT DEFAULT '',
  countries_text TEXT DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  location TEXT DEFAULT '',
  destination TEXT DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 5,
  quote TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS about_content (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  heading TEXT DEFAULT '',
  paragraph1 TEXT DEFAULT '',
  paragraph2 TEXT DEFAULT '',
  image TEXT DEFAULT '',
  checklist TEXT DEFAULT '[]',   -- JSON array of strings
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS about_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  number TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS contact_info (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  office_hours TEXT DEFAULT '[]',  -- JSON array of {day, time}
  office_hours_note TEXT DEFAULT '',
  updated_at TEXT DEFAULT (datetime('now'))
);
