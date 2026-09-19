const express = require('express');
const db = require('../db/database');

const router = express.Router();

function parseJsonField(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

router.get('/content', (req, res) => {
  const settings = db.prepare('SELECT * FROM site_settings WHERE id = 1').get();
  const hero = db.prepare('SELECT * FROM hero WHERE id = 1').get();
  const marquee = db.prepare('SELECT * FROM marquee_items ORDER BY sort_order ASC').all();

  const destinations = db.prepare('SELECT * FROM destinations WHERE active = 1 ORDER BY sort_order ASC').all()
    .map(d => ({ ...d, highlights: parseJsonField(d.highlights, []) }));

  const visaServices = db.prepare('SELECT * FROM visa_services WHERE active = 1 ORDER BY sort_order ASC').all();
  const testimonials = db.prepare('SELECT * FROM testimonials WHERE active = 1 ORDER BY sort_order ASC').all();
  const faqs = db.prepare('SELECT * FROM faqs WHERE active = 1 ORDER BY sort_order ASC').all();

  const aboutRow = db.prepare('SELECT * FROM about_content WHERE id = 1').get();
  const aboutStats = db.prepare('SELECT * FROM about_stats ORDER BY sort_order ASC').all();
  const about = aboutRow ? { ...aboutRow, checklist: parseJsonField(aboutRow.checklist, []), stats: aboutStats } : null;

  const contactRow = db.prepare('SELECT * FROM contact_info WHERE id = 1').get();
  const contact = contactRow ? { ...contactRow, office_hours: parseJsonField(contactRow.office_hours, []) } : null;

  res.json({ settings, hero, marquee, destinations, visaServices, testimonials, faqs, about, contact });
});

module.exports = router;
