const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { requireAuthApi } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuthApi);

function parseJsonField(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

// Generic "reorder" helper: body = { order: [id, id, id, ...] } in the new order.
function makeReorderHandler(table) {
  return (req, res) => {
    const { order } = req.body;
    if (!Array.isArray(order)) return res.status(400).json({ error: 'order must be an array of ids' });
    const stmt = db.prepare(`UPDATE ${table} SET sort_order = ? WHERE id = ?`);
    const tx = db.transaction((ids) => {
      ids.forEach((id, index) => stmt.run(index, id));
    });
    tx(order);
    res.json({ success: true });
  };
}

// ── Dashboard stats ─────────────────────────────────────────
router.get('/stats', (req, res) => {
  const count = (table, where = '') => db.prepare(`SELECT COUNT(*) AS c FROM ${table} ${where}`).get().c;
  const lastUpdated = [
    db.prepare('SELECT updated_at FROM site_settings WHERE id = 1').get(),
    db.prepare('SELECT updated_at FROM hero WHERE id = 1').get(),
    db.prepare('SELECT updated_at FROM about_content WHERE id = 1').get(),
    db.prepare('SELECT updated_at FROM contact_info WHERE id = 1').get(),
  ].filter(Boolean).map(r => r.updated_at).sort().reverse()[0] || null;

  res.json({
    destinations: count('destinations'),
    visaServices: count('visa_services'),
    testimonials: count('testimonials'),
    faqs: count('faqs'),
    lastUpdated,
  });
});

// ── Site settings (singleton) ───────────────────────────────
router.get('/settings', (req, res) => {
  res.json(db.prepare('SELECT * FROM site_settings WHERE id = 1').get());
});
router.put('/settings', (req, res) => {
  const { site_name, tagline, phone, whatsapp, email, address, footer_about, copyright_text } = req.body;
  db.prepare(`UPDATE site_settings SET site_name=?, tagline=?, phone=?, whatsapp=?, email=?, address=?, footer_about=?, copyright_text=?, updated_at=datetime('now') WHERE id=1`)
    .run(site_name, tagline, phone, whatsapp, email, address, footer_about, copyright_text);
  res.json({ success: true });
});

// ── Hero (singleton) ────────────────────────────────────────
router.get('/hero', (req, res) => {
  res.json(db.prepare('SELECT * FROM hero WHERE id = 1').get());
});
router.put('/hero', (req, res) => {
  const { heading, description, bg_image, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link } = req.body;
  db.prepare(`UPDATE hero SET heading=?, description=?, bg_image=?, primary_btn_text=?, primary_btn_link=?, secondary_btn_text=?, secondary_btn_link=?, updated_at=datetime('now') WHERE id=1`)
    .run(heading, description, bg_image, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link);
  res.json({ success: true });
});

// ── Marquee items ───────────────────────────────────────────
router.get('/marquee', (req, res) => {
  res.json(db.prepare('SELECT * FROM marquee_items ORDER BY sort_order ASC').all());
});
router.post('/marquee', (req, res) => {
  const { emoji, text } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });
  const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM marquee_items').get().m;
  const info = db.prepare('INSERT INTO marquee_items (emoji, text, sort_order) VALUES (?, ?, ?)').run(emoji || '', text, maxOrder + 1);
  res.json({ id: info.lastInsertRowid });
});
router.put('/marquee/:id', (req, res) => {
  const { emoji, text } = req.body;
  db.prepare('UPDATE marquee_items SET emoji=?, text=? WHERE id=?').run(emoji || '', text, req.params.id);
  res.json({ success: true });
});
router.delete('/marquee/:id', (req, res) => {
  db.prepare('DELETE FROM marquee_items WHERE id=?').run(req.params.id);
  res.json({ success: true });
});
router.post('/marquee/reorder', makeReorderHandler('marquee_items'));

// ── Destinations ────────────────────────────────────────────
function destOut(row) {
  return { ...row, highlights: parseJsonField(row.highlights, []) };
}
router.get('/destinations', (req, res) => {
  const rows = db.prepare('SELECT * FROM destinations ORDER BY sort_order ASC').all();
  res.json(rows.map(destOut));
});
router.get('/destinations/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM destinations WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(destOut(row));
});
router.post('/destinations', (req, res) => {
  const d = req.body;
  if (!d.name) return res.status(400).json({ error: 'name is required' });
  const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM destinations').get().m;
  const info = db.prepare(`INSERT INTO destinations
    (name, location, image, price, rating, description, highlights, duration, group_size, whatsapp_message, featured, active, sort_order)
    VALUES (@name, @location, @image, @price, @rating, @description, @highlights, @duration, @group_size, @whatsapp_message, @featured, @active, @sort_order)`)
    .run({
      name: d.name, location: d.location || '', image: d.image || '', price: d.price || '', rating: d.rating || '',
      description: d.description || '', highlights: JSON.stringify(d.highlights || []),
      duration: d.duration || '', group_size: d.group_size || '', whatsapp_message: d.whatsapp_message || '',
      featured: d.featured ? 1 : 0, active: d.active === false ? 0 : 1, sort_order: maxOrder + 1,
    });
  res.json({ id: info.lastInsertRowid });
});
router.put('/destinations/:id', (req, res) => {
  const d = req.body;
  db.prepare(`UPDATE destinations SET name=@name, location=@location, image=@image, price=@price, rating=@rating,
    description=@description, highlights=@highlights, duration=@duration, group_size=@group_size,
    whatsapp_message=@whatsapp_message, featured=@featured, active=@active WHERE id=@id`)
    .run({
      id: req.params.id, name: d.name, location: d.location || '', image: d.image || '', price: d.price || '',
      rating: d.rating || '', description: d.description || '', highlights: JSON.stringify(d.highlights || []),
      duration: d.duration || '', group_size: d.group_size || '', whatsapp_message: d.whatsapp_message || '',
      featured: d.featured ? 1 : 0, active: d.active === false ? 0 : 1,
    });
  res.json({ success: true });
});
router.delete('/destinations/:id', (req, res) => {
  db.prepare('DELETE FROM destinations WHERE id=?').run(req.params.id);
  res.json({ success: true });
});
router.put('/destinations/:id/toggle', (req, res) => {
  const row = db.prepare('SELECT active FROM destinations WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE destinations SET active=? WHERE id=?').run(row.active ? 0 : 1, req.params.id);
  res.json({ success: true, active: row.active ? 0 : 1 });
});
router.post('/destinations/reorder', makeReorderHandler('destinations'));

// ── Visa services ───────────────────────────────────────────
router.get('/visa-services', (req, res) => {
  res.json(db.prepare('SELECT * FROM visa_services ORDER BY sort_order ASC').all());
});
router.post('/visa-services', (req, res) => {
  const v = req.body;
  if (!v.name) return res.status(400).json({ error: 'name is required' });
  const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM visa_services').get().m;
  const info = db.prepare(`INSERT INTO visa_services (name, image, description, countries_text, active, sort_order)
    VALUES (@name, @image, @description, @countries_text, @active, @sort_order)`)
    .run({ name: v.name, image: v.image || '', description: v.description || '', countries_text: v.countries_text || '', active: v.active === false ? 0 : 1, sort_order: maxOrder + 1 });
  res.json({ id: info.lastInsertRowid });
});
router.put('/visa-services/:id', (req, res) => {
  const v = req.body;
  db.prepare(`UPDATE visa_services SET name=@name, image=@image, description=@description, countries_text=@countries_text, active=@active WHERE id=@id`)
    .run({ id: req.params.id, name: v.name, image: v.image || '', description: v.description || '', countries_text: v.countries_text || '', active: v.active === false ? 0 : 1 });
  res.json({ success: true });
});
router.delete('/visa-services/:id', (req, res) => {
  db.prepare('DELETE FROM visa_services WHERE id=?').run(req.params.id);
  res.json({ success: true });
});
router.put('/visa-services/:id/toggle', (req, res) => {
  const row = db.prepare('SELECT active FROM visa_services WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE visa_services SET active=? WHERE id=?').run(row.active ? 0 : 1, req.params.id);
  res.json({ success: true, active: row.active ? 0 : 1 });
});
router.post('/visa-services/reorder', makeReorderHandler('visa_services'));

// ── Testimonials ────────────────────────────────────────────
router.get('/testimonials', (req, res) => {
  res.json(db.prepare('SELECT * FROM testimonials ORDER BY sort_order ASC').all());
});
router.post('/testimonials', (req, res) => {
  const t = req.body;
  if (!t.name || !t.quote) return res.status(400).json({ error: 'name and quote are required' });
  const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM testimonials').get().m;
  const info = db.prepare(`INSERT INTO testimonials (name, location, destination, rating, quote, active, sort_order)
    VALUES (@name, @location, @destination, @rating, @quote, @active, @sort_order)`)
    .run({ name: t.name, location: t.location || '', destination: t.destination || '', rating: t.rating || 5, quote: t.quote, active: t.active === false ? 0 : 1, sort_order: maxOrder + 1 });
  res.json({ id: info.lastInsertRowid });
});
router.put('/testimonials/:id', (req, res) => {
  const t = req.body;
  db.prepare(`UPDATE testimonials SET name=@name, location=@location, destination=@destination, rating=@rating, quote=@quote, active=@active WHERE id=@id`)
    .run({ id: req.params.id, name: t.name, location: t.location || '', destination: t.destination || '', rating: t.rating || 5, quote: t.quote, active: t.active === false ? 0 : 1 });
  res.json({ success: true });
});
router.delete('/testimonials/:id', (req, res) => {
  db.prepare('DELETE FROM testimonials WHERE id=?').run(req.params.id);
  res.json({ success: true });
});
router.put('/testimonials/:id/toggle', (req, res) => {
  const row = db.prepare('SELECT active FROM testimonials WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE testimonials SET active=? WHERE id=?').run(row.active ? 0 : 1, req.params.id);
  res.json({ success: true, active: row.active ? 0 : 1 });
});
router.post('/testimonials/reorder', makeReorderHandler('testimonials'));

// ── FAQs ────────────────────────────────────────────────────
router.get('/faqs', (req, res) => {
  res.json(db.prepare('SELECT * FROM faqs ORDER BY sort_order ASC').all());
});
router.post('/faqs', (req, res) => {
  const f = req.body;
  if (!f.question || !f.answer) return res.status(400).json({ error: 'question and answer are required' });
  const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM faqs').get().m;
  const info = db.prepare('INSERT INTO faqs (question, answer, active, sort_order) VALUES (?, ?, ?, ?)')
    .run(f.question, f.answer, f.active === false ? 0 : 1, maxOrder + 1);
  res.json({ id: info.lastInsertRowid });
});
router.put('/faqs/:id', (req, res) => {
  const f = req.body;
  db.prepare('UPDATE faqs SET question=?, answer=?, active=? WHERE id=?').run(f.question, f.answer, f.active === false ? 0 : 1, req.params.id);
  res.json({ success: true });
});
router.delete('/faqs/:id', (req, res) => {
  db.prepare('DELETE FROM faqs WHERE id=?').run(req.params.id);
  res.json({ success: true });
});
router.put('/faqs/:id/toggle', (req, res) => {
  const row = db.prepare('SELECT active FROM faqs WHERE id=?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE faqs SET active=? WHERE id=?').run(row.active ? 0 : 1, req.params.id);
  res.json({ success: true, active: row.active ? 0 : 1 });
});
router.post('/faqs/reorder', makeReorderHandler('faqs'));

// ── About page (singleton content + repeatable stats) ───────
router.get('/about', (req, res) => {
  const row = db.prepare('SELECT * FROM about_content WHERE id = 1').get();
  res.json({ ...row, checklist: parseJsonField(row.checklist, []) });
});
router.put('/about', (req, res) => {
  const { heading, paragraph1, paragraph2, image, checklist } = req.body;
  db.prepare(`UPDATE about_content SET heading=?, paragraph1=?, paragraph2=?, image=?, checklist=?, updated_at=datetime('now') WHERE id=1`)
    .run(heading, paragraph1, paragraph2, image, JSON.stringify(checklist || []));
  res.json({ success: true });
});
router.get('/about-stats', (req, res) => {
  res.json(db.prepare('SELECT * FROM about_stats ORDER BY sort_order ASC').all());
});
router.post('/about-stats', (req, res) => {
  const { number, label } = req.body;
  if (!number || !label) return res.status(400).json({ error: 'number and label are required' });
  const maxOrder = db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM about_stats').get().m;
  const info = db.prepare('INSERT INTO about_stats (number, label, sort_order) VALUES (?, ?, ?)').run(number, label, maxOrder + 1);
  res.json({ id: info.lastInsertRowid });
});
router.put('/about-stats/:id', (req, res) => {
  const { number, label } = req.body;
  db.prepare('UPDATE about_stats SET number=?, label=? WHERE id=?').run(number, label, req.params.id);
  res.json({ success: true });
});
router.delete('/about-stats/:id', (req, res) => {
  db.prepare('DELETE FROM about_stats WHERE id=?').run(req.params.id);
  res.json({ success: true });
});
router.post('/about-stats/reorder', makeReorderHandler('about_stats'));

// ── Contact info (singleton) ─────────────────────────────────
router.get('/contact', (req, res) => {
  const row = db.prepare('SELECT * FROM contact_info WHERE id = 1').get();
  res.json({ ...row, office_hours: parseJsonField(row.office_hours, []) });
});
router.put('/contact', (req, res) => {
  const { office_hours, office_hours_note } = req.body;
  db.prepare(`UPDATE contact_info SET office_hours=?, office_hours_note=?, updated_at=datetime('now') WHERE id=1`)
    .run(JSON.stringify(office_hours || []), office_hours_note || '');
  res.json({ success: true });
});

// ── Change admin password ────────────────────────────────────
router.post('/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both current and new password are required.' });
  if (newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters.' });

  const admin = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(req.session.adminId);
  if (!admin || !bcrypt.compareSync(currentPassword, admin.password_hash)) {
    return res.status(401).json({ error: 'Current password is incorrect.' });
  }
  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(hash, admin.id);
  res.json({ success: true });
});

module.exports = router;
