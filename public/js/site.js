(function () {
  function esc(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  const TEL_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>';
  const WA_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
  const CHECK_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
  const LOCATION_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>';
  const CAL_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  const GROUP_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>';
  const DOC_SVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0f5fa3" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
  const TICK_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
  const STAR_SVG = '<svg width="14" height="14" fill="#f5a800" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value || '';
  }
  function setHref(id, value) {
    const el = document.getElementById(id);
    if (el && value) el.href = value;
  }

  function applyGlobalContactBindings(settings) {
    const telHref = 'tel:+' + (settings.whatsapp || '').replace(/\D/g, '');
    const waHref = 'https://wa.me/' + (settings.whatsapp || '').replace(/\D/g, '');
    const mailHref = 'mailto:' + (settings.email || '');

    document.querySelectorAll('[data-tel-link]').forEach(a => { a.href = telHref; });
    document.querySelectorAll('[data-wa-link]').forEach(a => { a.href = waHref; });
    document.querySelectorAll('[data-email-link]').forEach(a => { a.href = mailHref; });
    document.querySelectorAll('[data-phone-text]').forEach(el => { el.textContent = settings.phone || ''; });
    document.querySelectorAll('[data-email-text]').forEach(el => { el.textContent = settings.email || ''; });

    setText('site-name-text', settings.site_name);
    setText('footer-site-name', settings.site_name);
    setText('header-phone-text', settings.phone);
    setText('location-site-name', settings.site_name);
    setText('location-address', settings.address);
    setText('footer-address', settings.address);
    setText('footer-about-text', settings.footer_about);
    setText('footer-copyright', settings.copyright_text);
    setText('contact-phone-val', settings.phone);
    setText('contact-email-val', settings.email);
    document.title = document.title.replace(/United Holidays/g, settings.site_name || 'United Holidays');
  }

  function applyHero(hero) {
    if (!hero) return;
    setText('hero-heading', hero.heading);
    setText('hero-description', hero.description);
    const bg = document.getElementById('hero-bg');
    if (bg && hero.bg_image) bg.style.backgroundImage = `url('${hero.bg_image}')`;
    setText('hero-primary-btn-text', hero.primary_btn_text);
    setHref('hero-primary-btn', hero.primary_btn_link);
    setText('hero-secondary-btn-text', hero.secondary_btn_text);
    setHref('hero-secondary-btn', hero.secondary_btn_link);
  }

  function renderMarquee(items) {
    const track = document.getElementById('marquee-track');
    if (!track || !items) return;
    const html = items.map(it => `<div class="marquee-item">${esc(it.emoji)} ${esc(it.text)}</div><div class="marquee-dot"></div>`).join('');
    // duplicate the list so the CSS scroll animation (which shifts by -50%) loops seamlessly
    track.innerHTML = html + html;
  }

  function destCardHtml(d) {
    return `
      <a href="#" onclick="showPage('destinations')" style="display:block;">
        <div class="dest-card">
          <div class="dest-card-img">
            <img src="${esc(d.image)}" alt="${esc(d.name)}" loading="lazy"/>
          </div>
          <div class="dest-card-body">
            <h3>${esc(d.name)}</h3>
            <button class="btn btn-secondary btn-sm">View Packages</button>
          </div>
        </div>
      </a>`;
  }

  function renderPopularDestinations(destinations) {
    const grid = document.getElementById('destinations-grid');
    if (!grid) return;
    const featured = destinations.filter(d => d.featured);
    grid.innerHTML = featured.map(destCardHtml).join('') || '<p style="color:var(--muted-fg);">No destinations to show yet.</p>';
  }

  function destFullCardHtml(d, whatsapp) {
    const highlights = (d.highlights || []).map(h => `<div class="highlight-item"><div class="highlight-dot"></div>${esc(h)}</div>`).join('');
    const waHref = `https://wa.me/${(whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(d.whatsapp_message || '')}`;
    return `
      <div class="dest-full-card">
        <div class="dest-full-img">
          <img src="${esc(d.image)}" alt="${esc(d.name)}" loading="lazy"/>
          ${d.price ? `<div class="price-badge">${esc(d.price)}</div>` : ''}
          ${d.rating ? `<div class="rating-badge">${STAR_SVG}${esc(d.rating)}</div>` : ''}
        </div>
        <div class="dest-full-body">
          <h3>${esc(d.name)}</h3>
          <div class="dest-location">${LOCATION_SVG} ${esc(d.location)}</div>
          <p>${esc(d.description)}</p>
          ${highlights ? `<div class="highlights-label">Highlights</div><div class="highlights-grid">${highlights}</div>` : ''}
          <div class="pkg-meta">
            ${d.duration ? `<div class="pkg-meta-item">${CAL_SVG} ${esc(d.duration)}</div>` : ''}
            ${d.group_size ? `<div class="pkg-meta-item">${GROUP_SVG} ${esc(d.group_size)}</div>` : ''}
          </div>
          <div class="dest-btns">
            <div class="dest-btns-row">
              <a href="tel:+${(whatsapp || '').replace(/\D/g, '')}" class="btn btn-primary">${TEL_SVG} Call</a>
              <a href="${waHref}" target="_blank" class="btn btn-whatsapp">${WA_SVG} WhatsApp</a>
            </div>
          </div>
        </div>
      </div>`;
  }

  function renderFullDestinations(destinations, whatsapp) {
    const grid = document.getElementById('dest-full-grid');
    if (!grid) return;
    grid.innerHTML = destinations.map(d => destFullCardHtml(d, whatsapp)).join('') || '<p style="color:var(--muted-fg);">No destinations to show yet.</p>';
  }

  function visaCardHtml(v) {
    return `
      <div class="visa-card">
        <div class="visa-card-img">
          <img src="${esc(v.image)}" alt="${esc(v.name)}" loading="lazy"/>
          <div class="visa-badge">${DOC_SVG}</div>
        </div>
        <div class="visa-card-body">
          <h3>${esc(v.name)}</h3>
          <p>${esc(v.description)}</p>
          <div class="visa-countries">${TICK_SVG}<span>${esc(v.countries_text)}</span></div>
          <button class="btn btn-outline btn-sm w-full" onclick="showPage('contact')">Learn More</button>
        </div>
      </div>`;
  }

  function renderVisaServices(items) {
    const grid = document.getElementById('visa-grid');
    if (!grid) return;
    grid.innerHTML = items.map(visaCardHtml).join('') || '<p style="color:var(--muted-fg);">No visa services to show yet.</p>';
  }

  function testimonialCardHtml(t) {
    return `
      <div class="testimonial-card">
        <div class="stars">${'★'.repeat(t.rating)}</div>
        <p>"${esc(t.quote)}"</p>
        <div class="testimonial-footer">
          <div class="name">${esc(t.name)}</div>
          <div class="loc">${esc(t.location)}</div>
          ${t.destination ? `<div class="dest">Travelled to: ${esc(t.destination)}</div>` : ''}
        </div>
      </div>`;
  }

  function renderTestimonials(items) {
    const grid = document.getElementById('testimonials-grid');
    if (!grid) return;
    grid.innerHTML = items.map(testimonialCardHtml).join('') || '<p style="color:var(--muted-fg);">No testimonials to show yet.</p>';
  }

  function faqCardHtml(f) {
    return `<div class="faq-card"><h3>${esc(f.question)}</h3><p>${esc(f.answer)}</p></div>`;
  }

  function renderFaqs(items) {
    ['faq-grid-home', 'faq-grid-contact'].forEach(id => {
      const grid = document.getElementById(id);
      if (grid) grid.innerHTML = items.map(faqCardHtml).join('') || '<p style="color:var(--muted-fg);">No FAQs to show yet.</p>';
    });
  }

  function renderAbout(about) {
    if (!about) return;
    setText('about-heading', about.heading);
    setText('about-paragraph1', about.paragraph1);
    setText('about-paragraph2', about.paragraph2);
    const img = document.getElementById('about-image');
    if (img && about.image) img.src = about.image;
    const checks = document.getElementById('about-checks');
    if (checks) {
      checks.innerHTML = (about.checklist || []).map(c => `<div class="about-check">${CHECK_SVG} ${esc(c)}</div>`).join('');
    }
    const statsGrid = document.getElementById('about-stats-grid');
    if (statsGrid) {
      statsGrid.innerHTML = (about.stats || []).map(s => `<div class="stat-card"><div class="stat-num">${esc(s.number)}</div><div class="stat-label">${esc(s.label)}</div></div>`).join('');
    }
  }

  function renderContact(contact) {
    if (!contact) return;
    const container = document.getElementById('office-hours-container');
    if (container) {
      const rows = (contact.office_hours || []).map(h => `<div class="office-hours-row"><span class="day">${esc(h.day)}</span><span class="time">${esc(h.time)}</span></div>`).join('');
      const note = contact.office_hours_note ? `<div class="office-hours-note" id="office-hours-note">${esc(contact.office_hours_note)}</div>` : '<div class="office-hours-note" id="office-hours-note"></div>';
      container.innerHTML = rows + note;
    }
  }

  // Re-apply the same scroll fade-in effect (defined inline in index.html) to
  // cards that were just injected dynamically, so the animation still works.
  function applyFadeIn() {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.dest-card, .dest-full-card, .visa-card, .testimonial-card, .faq-card, .stat-card').forEach(el => {
      if (el.dataset.faded) return;
      el.dataset.faded = '1';
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(el);
    });
  }

  async function init() {
    try {
      const res = await fetch('/api/content');
      const data = await res.json();

      if (data.settings) applyGlobalContactBindings(data.settings);
      applyHero(data.hero);
      renderMarquee(data.marquee);
      if (data.destinations) {
        renderPopularDestinations(data.destinations);
        renderFullDestinations(data.destinations, data.settings ? data.settings.whatsapp : '');
      }
      if (data.visaServices) renderVisaServices(data.visaServices);
      if (data.testimonials) renderTestimonials(data.testimonials);
      if (data.faqs) renderFaqs(data.faqs);
      renderAbout(data.about);
      renderContact(data.contact);

      applyFadeIn();
    } catch (err) {
      console.error('Could not load site content:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
