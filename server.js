require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');

const db = require('./db/database'); // initializes schema + seed on require
const { requireAuth } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const publicApiRoutes = require('./routes/publicApi');
const adminApiRoutes = require('./routes/adminApi');

const app = express();
const PORT = process.env.PORT || 3000;

// Render terminates HTTPS at its proxy; trust it so secure session cookies work.
app.set('trust proxy', 1);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'insecure-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 8, // 8 hours
  },
}));

// ── Public website ────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Public content API (read-only, no auth) ─────────────────────
app.use('/api', publicApiRoutes);

// ── Admin auth routes (login/logout) ────────────────────────────
app.use('/admin', authRoutes);

// ── Admin API (protected) ───────────────────────────────────────
app.use('/api/admin', adminApiRoutes);

// ── Admin dashboard pages ───────────────────────────────────────
app.get('/admin/login', (req, res) => {
  if (req.session && req.session.adminId) return res.redirect('/admin');
  res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

app.get('/admin', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

// Serve admin static assets (css/js) only — never the .html files themselves,
// so /admin/dashboard.html can't be fetched directly and skip the auth check above.
app.use('/admin/assets', express.static(path.join(__dirname, 'admin', 'assets')));

// ── Fallback: any other route serves the public SPA ─────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`United Holidays server running at http://localhost:${PORT}`);
  console.log(`Admin dashboard: http://localhost:${PORT}/admin`);
});
