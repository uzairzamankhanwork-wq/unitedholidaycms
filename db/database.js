const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '..', 'data', 'united_holidays.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// Make sure the data/ folder exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables if they don't exist yet
db.exec(fs.readFileSync(SCHEMA_PATH, 'utf8'));

// Run seed data (only inserts if tables are empty) + create initial admin user
require('./seed')(db);

module.exports = db;
