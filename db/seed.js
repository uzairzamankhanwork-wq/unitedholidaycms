const bcrypt = require('bcryptjs');

module.exports = function seed(db) {
  // ── Admin user ──────────────────────────────────────────────
  const adminCount = db.prepare('SELECT COUNT(*) AS c FROM admin_users').get().c;
  if (adminCount === 0) {
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'change-this-password';
    const hash = bcrypt.hashSync(password, 10);
    db.prepare('INSERT INTO admin_users (email, password_hash) VALUES (?, ?)').run(email, hash);
    console.log(`[setup] Created initial admin account: ${email}`);
    if (password === 'change-this-password') {
      console.warn('[setup] WARNING: using the default admin password. Set ADMIN_EMAIL / ADMIN_PASSWORD in .env and change it from the dashboard.');
    }
  }

  // ── Site settings ───────────────────────────────────────────
  if (db.prepare('SELECT COUNT(*) AS c FROM site_settings').get().c === 0) {
    db.prepare(`INSERT INTO site_settings
      (id, site_name, tagline, phone, whatsapp, email, address, footer_about, copyright_text)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      'United Holidays',
      'Your trusted UK travel agency',
      '074 1835 9679',
      '447418359679',
      'info@unitedholidays.co.uk',
      'London, United Kingdom',
      'Your trusted UK travel agency for over 10 years. We specialise in affordable holidays, Umrah packages, visa services, and luxury travel worldwide.',
      '© 2025 United Holidays. All rights reserved. ATOL Protected.'
    );
  }

  // ── Hero ────────────────────────────────────────────────────
  if (db.prepare('SELECT COUNT(*) AS c FROM hero').get().c === 0) {
    db.prepare(`INSERT INTO hero
      (id, heading, description, bg_image, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?)`).run(
      'Explore the World with United Holidays',
      'Discover affordable holiday packages, flights, and luxury hotels worldwide. Your dream vacation starts here.',
      'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1600&q=80',
      'Call Now',
      'tel:+447418359679',
      'WhatsApp Now',
      'https://wa.me/447418359679'
    );
  }

  // ── Marquee items ───────────────────────────────────────────
  if (db.prepare('SELECT COUNT(*) AS c FROM marquee_items').get().c === 0) {
    const items = [
      ['✈️', 'Flights Worldwide'],
      ['🏨', 'Luxury Hotels'],
      ['🕌', 'Umrah Packages'],
      ['👥', 'Group Travel'],
      ['💼', 'Business Class'],
      ['⛷️', 'Ski Holidays'],
      ['🏖️', 'Beach Resorts'],
      ['💑', 'Honeymoon Packages'],
    ];
    const stmt = db.prepare('INSERT INTO marquee_items (emoji, text, sort_order) VALUES (?, ?, ?)');
    items.forEach(([emoji, text], i) => stmt.run(emoji, text, i));
  }

  // ── Destinations ────────────────────────────────────────────
  if (db.prepare('SELECT COUNT(*) AS c FROM destinations').get().c === 0) {
    const dest = [
      {
        name: 'Maldives', location: 'Indian Ocean',
        image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=900&q=80',
        price: 'From £1,899', rating: '4.9',
        description: 'Experience paradise on earth with crystal-clear waters, white sandy beaches and world-class overwater bungalows. The Maldives is the ultimate luxury island escape.',
        highlights: ['Overwater bungalows', 'Snorkelling & diving', 'Pristine beaches', 'Luxury spa retreats'],
        duration: '7-14 nights', group_size: '2-20 people',
        whatsapp_message: "Hi, I'm interested in the Maldives package. Can you provide more details?",
        featured: 1, active: 1
      },
      {
        name: 'Switzerland', location: 'Central Europe',
        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&q=80',
        price: 'From £1,299', rating: '4.8',
        description: 'Discover the breathtaking Swiss Alps, charming cities and world-famous Swiss culture. A perfect destination for families, couples and ski enthusiasts alike.',
        highlights: ['Swiss Alps skiing', 'Scenic train routes', 'Lucerne & Zurich', 'Swiss chocolate tours'],
        duration: '5-10 nights', group_size: '2-15 people',
        whatsapp_message: "Hi, I'm interested in the Switzerland package. Can you provide more details?",
        featured: 1, active: 1
      },
      {
        name: 'Makkah & Madinah', location: 'Saudi Arabia',
        image: 'https://images.unsplash.com/photo-1537944434965-cf4679d1a598?w=900&q=80',
        price: 'From £999', rating: '5.0',
        description: 'Embark on the sacred journey of Umrah with our comprehensive packages. Stay near the Masjid al-Haram with expert guidance and seamless visa assistance.',
        highlights: ['Hotel near Haram', 'Umrah visa included', 'Expert local guides', 'Ziyarat tours'],
        duration: '7-21 nights', group_size: 'Individual & group',
        whatsapp_message: "Hi, I'm interested in the Umrah package. Can you provide more details?",
        featured: 1, active: 1
      },
      {
        name: 'Bali', location: 'Indonesia',
        image: 'https://images.unsplash.com/photo-1538970272646-f61fabb3bfec?w=900&q=80',
        price: 'From £1,199', rating: '4.8',
        description: 'The Island of the Gods offers ancient temples, lush rice terraces, world-class surf, and vibrant arts scene. Perfect for adventure seekers and relaxation lovers.',
        highlights: ['Ubud rice terraces', 'Temple visits', 'Surfing lessons', 'Spa & wellness'],
        duration: '7-14 nights', group_size: '2-12 people',
        whatsapp_message: "Hi, I'm interested in the Bali package. Can you provide more details?",
        featured: 1, active: 1
      },
      {
        name: 'New York', location: 'United States',
        image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=900&q=80',
        price: 'From £1,099', rating: '4.7',
        description: 'The city that never sleeps — iconic skylines, Broadway shows, world-class shopping and dining. A perfect city break for every kind of traveller.',
        highlights: ['Times Square & Broadway', 'Statue of Liberty', 'Central Park', 'Shopping on 5th Avenue'],
        duration: '4-8 nights', group_size: '1-10 people',
        whatsapp_message: "Hi, I'm interested in the New York package. Can you provide more details?",
        featured: 1, active: 1
      },
      {
        name: 'Dubai', location: 'United Arab Emirates',
        image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=900&q=80',
        price: 'From £849', rating: '4.8',
        description: 'A dazzling blend of futuristic skyscrapers, desert adventures and luxury shopping. Dubai delivers unforgettable experiences for families and couples alike.',
        highlights: ['Burj Khalifa views', 'Desert safari', 'Luxury shopping malls', 'Beach resorts'],
        duration: '4-10 nights', group_size: '2-15 people',
        whatsapp_message: "Hi, I'm interested in the Dubai package. Can you provide more details?",
        featured: 1, active: 1
      },
    ];
    const stmt = db.prepare(`INSERT INTO destinations
      (name, location, image, price, rating, description, highlights, duration, group_size, whatsapp_message, featured, active, sort_order)
      VALUES (@name, @location, @image, @price, @rating, @description, @highlights, @duration, @group_size, @whatsapp_message, @featured, @active, @sort_order)`);
    dest.forEach((d, i) => stmt.run({ ...d, highlights: JSON.stringify(d.highlights), sort_order: i }));
  }

  // ── Visa services ───────────────────────────────────────────
  if (db.prepare('SELECT COUNT(*) AS c FROM visa_services').get().c === 0) {
    const visas = [
      { name: 'Schengen Visa', image: 'https://images.unsplash.com/photo-1491557345352-5929e343eb89?w=600&q=80', description: 'Travel across 26 European countries with a single visa', countries_text: 'France, Germany, Italy, Spain & more' },
      { name: 'UK Visa', image: 'https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?w=600&q=80', description: 'Visit, study or settle in the United Kingdom', countries_text: 'England, Scotland, Wales, Northern Ireland' },
      { name: 'US Visa', image: 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=600&q=80', description: 'Tourist & business visa for the United States', countries_text: 'All 50 US states, tourist & business' },
      { name: 'Canada Visa', image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&q=80', description: 'Explore Canada with our expert visa guidance', countries_text: 'Tourist, student & work visas' },
    ];
    const stmt = db.prepare(`INSERT INTO visa_services (name, image, description, countries_text, active, sort_order)
      VALUES (@name, @image, @description, @countries_text, 1, @sort_order)`);
    visas.forEach((v, i) => stmt.run({ ...v, sort_order: i }));
  }

  // ── Testimonials ────────────────────────────────────────────
  if (db.prepare('SELECT COUNT(*) AS c FROM testimonials').get().c === 0) {
    const testimonials = [
      { name: 'Sarah Ahmed', location: 'London, UK', destination: 'Makkah & Madinah', rating: 5, quote: 'United Holidays made our Umrah journey absolutely seamless. From visa processing to hotel bookings near Haram, everything was perfect. Highly recommended!' },
      { name: 'James Wilson', location: 'Manchester, UK', destination: 'Maldives', rating: 5, quote: "Best travel agency we've worked with! They found us an amazing honeymoon package to Maldives at an unbeatable price. The service was exceptional throughout." },
      { name: 'Fatima Khan', location: 'Birmingham, UK', destination: 'Switzerland', rating: 5, quote: 'Professional visa assistance for our family trip to Switzerland. They handled everything efficiently and we got our visas without any hassle. Thank you!' },
    ];
    const stmt = db.prepare(`INSERT INTO testimonials (name, location, destination, rating, quote, active, sort_order)
      VALUES (@name, @location, @destination, @rating, @quote, 1, @sort_order)`);
    testimonials.forEach((t, i) => stmt.run({ ...t, sort_order: i }));
  }

  // ── FAQs (merged from the homepage + contact page lists, de-duplicated) ──
  if (db.prepare('SELECT COUNT(*) AS c FROM faqs').get().c === 0) {
    const faqs = [
      { question: 'How do I book a holiday package?', answer: 'Simply call us, WhatsApp, or fill out the quote form. Our travel experts will create a personalised package based on your preferences and budget.' },
      { question: 'Are my bookings protected?', answer: 'Yes! All our packages are ATOL protected, giving you complete financial protection and peace of mind for your bookings.' },
      { question: 'Do you offer payment plans?', answer: 'Absolutely! We offer flexible payment plans for most packages. Contact us to discuss options that work for your budget.' },
      { question: 'How long does visa processing take?', answer: 'Processing times vary by country. Schengen visas typically take 15-20 days, UK visas 3-4 weeks. We guide you through the entire process.' },
      { question: 'Can I customise my package?', answer: "Yes! We specialise in creating custom itineraries. Tell us your preferences and we'll design a package tailored just for you." },
      { question: 'What if I need to cancel?', answer: "Cancellation policies vary by booking. We'll explain all terms before you book and help you with travel insurance options for added protection." },
      { question: 'How quickly will I get a response?', answer: 'We aim to respond to all enquiries within 24 hours during business hours. WhatsApp messages typically get faster responses.' },
      { question: 'Can you help with visa applications?', answer: 'Yes! We provide comprehensive visa assistance services for all major destinations including Schengen, UK, US, and Canada.' },
    ];
    const stmt = db.prepare(`INSERT INTO faqs (question, answer, active, sort_order) VALUES (@question, @answer, 1, @sort_order)`);
    faqs.forEach((f, i) => stmt.run({ ...f, sort_order: i }));
  }

  // ── About page ──────────────────────────────────────────────
  if (db.prepare('SELECT COUNT(*) AS c FROM about_content').get().c === 0) {
    db.prepare(`INSERT INTO about_content (id, heading, paragraph1, paragraph2, image, checklist) VALUES (1, ?, ?, ?, ?, ?)`).run(
      'Who We Are',
      'United Holidays is a leading UK-based travel agency dedicated to making your dream holidays a reality. Founded over a decade ago, we have helped thousands of travellers explore the world with confidence and ease.',
      'From spiritual Umrah journeys to luxury Maldives retreats, Swiss ski adventures to cultural tours of Asia — we craft bespoke travel experiences tailored to every budget and preference.',
      'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80',
      JSON.stringify([
        'ATOL Protected — your money is safe with us',
        'Over 10,000 happy travellers served',
        'Specialist in Umrah & Hajj packages',
        'Flexible payment options available',
        '24/7 customer support',
      ])
    );
  }
  if (db.prepare('SELECT COUNT(*) AS c FROM about_stats').get().c === 0) {
    const stats = [
      ['10+', 'Years in Business'],
      ['10k+', 'Happy Travellers'],
      ['50+', 'Destinations'],
      ['4.9★', 'Average Rating'],
    ];
    const stmt = db.prepare('INSERT INTO about_stats (number, label, sort_order) VALUES (?, ?, ?)');
    stats.forEach(([number, label], i) => stmt.run(number, label, i));
  }

  // ── Contact info ────────────────────────────────────────────
  if (db.prepare('SELECT COUNT(*) AS c FROM contact_info').get().c === 0) {
    db.prepare(`INSERT INTO contact_info (id, office_hours, office_hours_note) VALUES (1, ?, ?)`).run(
      JSON.stringify([
        { day: 'Monday – Friday', time: '9:00 AM – 8:00 PM' },
        { day: 'Saturday', time: '10:00 AM – 6:00 PM' },
        { day: 'Sunday', time: '10:00 AM – 4:00 PM' },
      ]),
      'Emergency support available 24/7 for existing bookings'
    );
  }
};
