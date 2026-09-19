// ════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════
async function apiFetch(url, opts = {}) {
  const res = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (res.status === 401) {
    window.location.href = '/admin/login';
    throw new Error('Not authenticated');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

let toastTimer;
function toast(msg, isError = false) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.style.background = isError ? '#dc2626' : '#0a1c30';
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

function closeModal() {
  document.getElementById('modal-root').innerHTML = '';
}

function openModal(titleHtml, bodyHtml, onMount) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal">
        <h3>${titleHtml}</h3>
        <div id="modal-body">${bodyHtml}</div>
      </div>
    </div>`;
  document.getElementById('modal-backdrop').addEventListener('click', (e) => {
    if (e.target.id === 'modal-backdrop') closeModal();
  });
  if (onMount) onMount(document.getElementById('modal-body'));
}

function confirmDelete(msg, onConfirm) {
  openModal('Confirm Delete', `
    <p>${esc(msg)}</p>
    <div class="modal-actions">
      <button class="btn btn-outline" id="cancel-del">Cancel</button>
      <button class="btn btn-danger" id="confirm-del">Delete</button>
    </div>
  `, (body) => {
    body.querySelector('#cancel-del').onclick = closeModal;
    body.querySelector('#confirm-del').onclick = async () => {
      try { await onConfirm(); closeModal(); } catch (e) { toast(e.message, true); }
    };
  });
}

// ════════════════════════════════════════════════════════════
// Router
// ════════════════════════════════════════════════════════════
const routes = {
  dashboard: { title: 'Dashboard', render: renderDashboard },
  homepage: { title: 'Homepage', render: renderHomepage },
  destinations: { title: 'Destinations', render: renderDestinations },
  visa: { title: 'Visa Services', render: renderVisa },
  about: { title: 'About', render: renderAbout },
  testimonials: { title: 'Testimonials', render: renderTestimonials },
  faqs: { title: 'FAQs', render: renderFaqs },
  contact: { title: 'Contact', render: renderContact },
  footer: { title: 'Footer', render: renderFooter },
  settings: { title: 'Site Settings', render: renderSettings },
};

function currentRoute() {
  const hash = (window.location.hash || '#dashboard').slice(1);
  return routes[hash] ? hash : 'dashboard';
}

async function router() {
  const route = currentRoute();
  document.querySelectorAll('#sidebar-nav a').forEach(a => {
    a.classList.toggle('active', a.dataset.route === route);
  });
  document.getElementById('page-title').textContent = routes[route].title;
  document.getElementById('sidebar').classList.remove('open');
  const content = document.getElementById('content');
  content.innerHTML = '<p>Loading...</p>';
  try {
    await routes[route].render(content);
  } catch (e) {
    content.innerHTML = `<div class="error-msg">${esc(e.message)}</div>`;
  }
}
window.addEventListener('hashchange', router);
document.getElementById('hamburger-btn').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// ════════════════════════════════════════════════════════════
// Dashboard home
// ════════════════════════════════════════════════════════════
async function renderDashboard(content) {
  const stats = await apiFetch('/api/admin/stats');
  const lastUpdated = stats.lastUpdated ? new Date(stats.lastUpdated + 'Z').toLocaleString() : '—';
  content.innerHTML = `
    <div class="stats-row">
      <div class="stat-box"><div class="num">${stats.destinations}</div><div class="label">Destinations</div></div>
      <div class="stat-box"><div class="num">${stats.visaServices}</div><div class="label">Visa Services</div></div>
      <div class="stat-box"><div class="num">${stats.testimonials}</div><div class="label">Testimonials</div></div>
      <div class="stat-box"><div class="num">${stats.faqs}</div><div class="label">FAQs</div></div>
    </div>
    <div class="card">
      <p style="margin-bottom:0.25rem;"><strong>Last updated:</strong> ${esc(lastUpdated)}</p>
      <p style="margin-bottom:1rem;">Use the sidebar to edit your website's content. Changes appear on the live site as soon as you save.</p>
      <a href="/" target="_blank" class="btn btn-primary">View Website ↗</a>
    </div>
  `;
}

// ════════════════════════════════════════════════════════════
// Homepage: Hero + Marquee
// ════════════════════════════════════════════════════════════
async function renderHomepage(content) {
  const hero = await apiFetch('/api/admin/hero');
  content.innerHTML = `
    <div class="card">
      <div class="card-head"><h3>Hero Section</h3></div>
      <form id="hero-form">
        <div class="field"><label>Heading</label><input name="heading" value="${esc(hero.heading)}" required /></div>
        <div class="field"><label>Description</label><textarea name="description">${esc(hero.description)}</textarea></div>
        <div class="field"><label>Background Image URL</label><input name="bg_image" value="${esc(hero.bg_image)}" /></div>
        <div class="field-row">
          <div class="field"><label>Primary Button Text</label><input name="primary_btn_text" value="${esc(hero.primary_btn_text)}" /></div>
          <div class="field"><label>Primary Button Link</label><input name="primary_btn_link" value="${esc(hero.primary_btn_link)}" placeholder="tel:+44..." /></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Secondary Button Text</label><input name="secondary_btn_text" value="${esc(hero.secondary_btn_text)}" /></div>
          <div class="field"><label>Secondary Button Link</label><input name="secondary_btn_link" value="${esc(hero.secondary_btn_link)}" placeholder="https://wa.me/..." /></div>
        </div>
        <button type="submit" class="btn btn-primary">Save Hero</button>
      </form>
    </div>
    <div class="card">
      <div class="card-head"><h3>Marquee Items</h3></div>
      <div id="marquee-list" class="item-list"></div>
      <div class="add-row" style="margin-top:1rem;">
        <input id="marquee-emoji" placeholder="Emoji" style="max-width:70px;padding:0.65rem;border:1.5px solid var(--border);border-radius:0.6rem;" />
        <input id="marquee-text" placeholder="e.g. Flights Worldwide" style="flex:1;padding:0.65rem;border:1.5px solid var(--border);border-radius:0.6rem;" />
        <button class="btn btn-primary" id="marquee-add-btn">Add</button>
      </div>
    </div>
  `;

  document.getElementById('hero-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      await apiFetch('/api/admin/hero', { method: 'PUT', body: JSON.stringify(Object.fromEntries(fd)) });
      toast('Hero section saved');
    } catch (err) { toast(err.message, true); }
  });

  async function loadMarquee() {
    const items = await apiFetch('/api/admin/marquee');
    const list = document.getElementById('marquee-list');
    if (!items.length) { list.innerHTML = '<div class="empty-state">No marquee items yet.</div>'; return; }
    list.innerHTML = items.map((it, i) => `
      <div class="item-row">
        <span style="font-size:1.2rem;">${esc(it.emoji)}</span>
        <div class="item-main"><div class="item-title">${esc(it.text)}</div></div>
        <div class="item-actions">
          <button class="btn btn-outline btn-icon" data-up="${it.id}" ${i === 0 ? 'disabled' : ''}>↑</button>
          <button class="btn btn-outline btn-icon" data-down="${it.id}" ${i === items.length - 1 ? 'disabled' : ''}>↓</button>
          <button class="btn btn-secondary btn-sm" data-edit="${it.id}">Edit</button>
          <button class="btn btn-danger btn-sm" data-del="${it.id}">Delete</button>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('[data-edit]').forEach(btn => btn.onclick = () => {
      const item = items.find(x => x.id == btn.dataset.edit);
      openModal('Edit Marquee Item', `
        <div class="field"><label>Emoji</label><input id="em-emoji" value="${esc(item.emoji)}" /></div>
        <div class="field"><label>Text</label><input id="em-text" value="${esc(item.text)}" /></div>
        <div class="modal-actions">
          <button class="btn btn-outline" id="em-cancel">Cancel</button>
          <button class="btn btn-primary" id="em-save">Save</button>
        </div>
      `, (body) => {
        body.querySelector('#em-cancel').onclick = closeModal;
        body.querySelector('#em-save').onclick = async () => {
          try {
            await apiFetch(`/api/admin/marquee/${item.id}`, { method: 'PUT', body: JSON.stringify({ emoji: body.querySelector('#em-emoji').value, text: body.querySelector('#em-text').value }) });
            closeModal(); toast('Saved'); loadMarquee();
          } catch (e) { toast(e.message, true); }
        };
      });
    });
    list.querySelectorAll('[data-del]').forEach(btn => btn.onclick = () => {
      confirmDelete('Delete this marquee item?', async () => {
        await apiFetch(`/api/admin/marquee/${btn.dataset.del}`, { method: 'DELETE' });
        toast('Deleted'); loadMarquee();
      });
    });
    list.querySelectorAll('[data-up],[data-down]').forEach(btn => btn.onclick = async () => {
      const id = Number(btn.dataset.up || btn.dataset.down);
      const idx = items.findIndex(x => x.id === id);
      const swapWith = btn.dataset.up ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= items.length) return;
      const order = items.map(x => x.id);
      [order[idx], order[swapWith]] = [order[swapWith], order[idx]];
      await apiFetch('/api/admin/marquee/reorder', { method: 'POST', body: JSON.stringify({ order }) });
      loadMarquee();
    });
  }

  document.getElementById('marquee-add-btn').addEventListener('click', async () => {
    const text = document.getElementById('marquee-text').value.trim();
    if (!text) return toast('Enter some text first', true);
    try {
      await apiFetch('/api/admin/marquee', { method: 'POST', body: JSON.stringify({ emoji: document.getElementById('marquee-emoji').value, text }) });
      document.getElementById('marquee-emoji').value = '';
      document.getElementById('marquee-text').value = '';
      toast('Added'); loadMarquee();
    } catch (e) { toast(e.message, true); }
  });

  loadMarquee();
}

// ════════════════════════════════════════════════════════════
// Destinations
// ════════════════════════════════════════════════════════════
async function renderDestinations(content) {
  content.innerHTML = `
    <div class="card">
      <div class="card-head"><h3>Destinations</h3><button class="btn btn-primary btn-sm" id="add-dest-btn">+ Add Destination</button></div>
      <div id="dest-list" class="item-list"></div>
    </div>
  `;

  async function load() {
    const items = await apiFetch('/api/admin/destinations');
    const list = document.getElementById('dest-list');
    if (!items.length) { list.innerHTML = '<div class="empty-state">No destinations yet.</div>'; return; }
    list.innerHTML = items.map(it => `
      <div class="item-row ${it.active ? '' : 'inactive'}">
        <img src="${esc(it.image)}" onerror="this.style.visibility='hidden'" />
        <div class="item-main">
          <div class="item-title">${esc(it.name)} ${it.featured ? '<span class="badge badge-on">Featured</span>' : ''}</div>
          <div class="item-sub">${esc(it.location)} · ${esc(it.price)}</div>
        </div>
        <span class="badge ${it.active ? 'badge-on' : 'badge-off'}">${it.active ? 'Active' : 'Disabled'}</span>
        <div class="item-actions">
          <button class="btn btn-secondary btn-sm" data-edit="${it.id}">Edit</button>
          <button class="btn btn-outline btn-sm" data-toggle="${it.id}">${it.active ? 'Disable' : 'Enable'}</button>
          <button class="btn btn-danger btn-sm" data-del="${it.id}">Delete</button>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('[data-edit]').forEach(btn => btn.onclick = () => openDestModal(items.find(x => x.id == btn.dataset.edit)));
    list.querySelectorAll('[data-toggle]').forEach(btn => btn.onclick = async () => {
      await apiFetch(`/api/admin/destinations/${btn.dataset.toggle}/toggle`, { method: 'PUT' });
      load();
    });
    list.querySelectorAll('[data-del]').forEach(btn => btn.onclick = () => {
      confirmDelete('Delete this destination? This cannot be undone.', async () => {
        await apiFetch(`/api/admin/destinations/${btn.dataset.del}`, { method: 'DELETE' });
        toast('Deleted'); load();
      });
    });
  }

  function openDestModal(item) {
    const d = item || { name: '', location: '', image: '', price: '', rating: '', description: '', highlights: [], duration: '', group_size: '', whatsapp_message: '', featured: 0, active: 1 };
    openModal(item ? 'Edit Destination' : 'Add Destination', `
      <div class="field"><label>Name *</label><input id="d-name" value="${esc(d.name)}" required /></div>
      <div class="field-row">
        <div class="field"><label>Location / Country</label><input id="d-location" value="${esc(d.location)}" /></div>
        <div class="field"><label>Price (e.g. From £999)</label><input id="d-price" value="${esc(d.price)}" /></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Rating (e.g. 4.9)</label><input id="d-rating" value="${esc(d.rating)}" /></div>
        <div class="field"><label>Duration (e.g. 7-14 nights)</label><input id="d-duration" value="${esc(d.duration)}" /></div>
      </div>
      <div class="field"><label>Image URL</label><input id="d-image" value="${esc(d.image)}" /></div>
      <div class="field"><label>Description</label><textarea id="d-description">${esc(d.description)}</textarea></div>
      <div class="field">
        <label>Highlights</label>
        <div class="tag-list" id="d-highlights-tags"></div>
        <div class="add-row"><input id="d-highlight-input" placeholder="Add a highlight and press Enter" /></div>
      </div>
      <div class="field"><label>Group Size (e.g. 2-15 people)</label><input id="d-group-size" value="${esc(d.group_size)}" /></div>
      <div class="field"><label>WhatsApp pre-filled message</label><input id="d-wa-msg" value="${esc(d.whatsapp_message)}" /></div>
      <div class="field-row">
        <label style="display:flex;align-items:center;gap:0.5rem;font-size:0.9rem;"><input type="checkbox" id="d-featured" ${d.featured ? 'checked' : ''} style="width:auto;" /> Show in Popular Destinations (homepage)</label>
        <label style="display:flex;align-items:center;gap:0.5rem;font-size:0.9rem;"><input type="checkbox" id="d-active" ${d.active ? 'checked' : ''} style="width:auto;" /> Active (visible on site)</label>
      </div>
      <div class="modal-actions">
        <button class="btn btn-outline" id="d-cancel">Cancel</button>
        <button class="btn btn-primary" id="d-save">Save Destination</button>
      </div>
    `, (body) => {
      let highlights = [...(d.highlights || [])];
      function renderTags() {
        body.querySelector('#d-highlights-tags').innerHTML = highlights.map((h, i) => `<span class="tag">${esc(h)}<button data-i="${i}">×</button></span>`).join('');
        body.querySelectorAll('#d-highlights-tags button').forEach(b => b.onclick = () => { highlights.splice(Number(b.dataset.i), 1); renderTags(); });
      }
      renderTags();
      body.querySelector('#d-highlight-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const v = e.target.value.trim();
          if (v) { highlights.push(v); e.target.value = ''; renderTags(); }
        }
      });
      body.querySelector('#d-cancel').onclick = closeModal;
      body.querySelector('#d-save').onclick = async () => {
        const payload = {
          name: body.querySelector('#d-name').value.trim(),
          location: body.querySelector('#d-location').value,
          price: body.querySelector('#d-price').value,
          rating: body.querySelector('#d-rating').value,
          duration: body.querySelector('#d-duration').value,
          image: body.querySelector('#d-image').value,
          description: body.querySelector('#d-description').value,
          highlights,
          group_size: body.querySelector('#d-group-size').value,
          whatsapp_message: body.querySelector('#d-wa-msg').value,
          featured: body.querySelector('#d-featured').checked,
          active: body.querySelector('#d-active').checked,
        };
        if (!payload.name) return toast('Name is required', true);
        try {
          if (item) await apiFetch(`/api/admin/destinations/${item.id}`, { method: 'PUT', body: JSON.stringify(payload) });
          else await apiFetch('/api/admin/destinations', { method: 'POST', body: JSON.stringify(payload) });
          closeModal(); toast('Saved'); load();
        } catch (e) { toast(e.message, true); }
      };
    });
  }

  document.getElementById('add-dest-btn').addEventListener('click', () => openDestModal(null));
  load();
}

// ════════════════════════════════════════════════════════════
// Visa Services
// ════════════════════════════════════════════════════════════
async function renderVisa(content) {
  content.innerHTML = `
    <div class="card">
      <div class="card-head"><h3>Visa Services</h3><button class="btn btn-primary btn-sm" id="add-visa-btn">+ Add Visa Service</button></div>
      <div id="visa-list" class="item-list"></div>
    </div>
  `;
  async function load() {
    const items = await apiFetch('/api/admin/visa-services');
    const list = document.getElementById('visa-list');
    if (!items.length) { list.innerHTML = '<div class="empty-state">No visa services yet.</div>'; return; }
    list.innerHTML = items.map(it => `
      <div class="item-row ${it.active ? '' : 'inactive'}">
        <img src="${esc(it.image)}" onerror="this.style.visibility='hidden'" />
        <div class="item-main"><div class="item-title">${esc(it.name)}</div><div class="item-sub">${esc(it.description)}</div></div>
        <span class="badge ${it.active ? 'badge-on' : 'badge-off'}">${it.active ? 'Active' : 'Disabled'}</span>
        <div class="item-actions">
          <button class="btn btn-secondary btn-sm" data-edit="${it.id}">Edit</button>
          <button class="btn btn-outline btn-sm" data-toggle="${it.id}">${it.active ? 'Disable' : 'Enable'}</button>
          <button class="btn btn-danger btn-sm" data-del="${it.id}">Delete</button>
        </div>
      </div>
    `).join('');
    list.querySelectorAll('[data-edit]').forEach(btn => btn.onclick = () => openModalFor(items.find(x => x.id == btn.dataset.edit)));
    list.querySelectorAll('[data-toggle]').forEach(btn => btn.onclick = async () => { await apiFetch(`/api/admin/visa-services/${btn.dataset.toggle}/toggle`, { method: 'PUT' }); load(); });
    list.querySelectorAll('[data-del]').forEach(btn => btn.onclick = () => confirmDelete('Delete this visa service?', async () => { await apiFetch(`/api/admin/visa-services/${btn.dataset.del}`, { method: 'DELETE' }); toast('Deleted'); load(); }));
  }
  function openModalFor(item) {
    const v = item || { name: '', image: '', description: '', countries_text: '', active: 1 };
    openModal(item ? 'Edit Visa Service' : 'Add Visa Service', `
      <div class="field"><label>Name *</label><input id="v-name" value="${esc(v.name)}" /></div>
      <div class="field"><label>Image URL</label><input id="v-image" value="${esc(v.image)}" /></div>
      <div class="field"><label>Description</label><textarea id="v-desc">${esc(v.description)}</textarea></div>
      <div class="field"><label>Countries text</label><input id="v-countries" value="${esc(v.countries_text)}" placeholder="e.g. France, Germany, Italy & more" /></div>
      <label style="display:flex;align-items:center;gap:0.5rem;font-size:0.9rem;margin-bottom:0.5rem;"><input type="checkbox" id="v-active" ${v.active ? 'checked' : ''} style="width:auto;" /> Active</label>
      <div class="modal-actions"><button class="btn btn-outline" id="v-cancel">Cancel</button><button class="btn btn-primary" id="v-save">Save</button></div>
    `, (body) => {
      body.querySelector('#v-cancel').onclick = closeModal;
      body.querySelector('#v-save').onclick = async () => {
        const payload = { name: body.querySelector('#v-name').value.trim(), image: body.querySelector('#v-image').value, description: body.querySelector('#v-desc').value, countries_text: body.querySelector('#v-countries').value, active: body.querySelector('#v-active').checked };
        if (!payload.name) return toast('Name is required', true);
        try {
          if (item) await apiFetch(`/api/admin/visa-services/${item.id}`, { method: 'PUT', body: JSON.stringify(payload) });
          else await apiFetch('/api/admin/visa-services', { method: 'POST', body: JSON.stringify(payload) });
          closeModal(); toast('Saved'); load();
        } catch (e) { toast(e.message, true); }
      };
    });
  }
  document.getElementById('add-visa-btn').addEventListener('click', () => openModalFor(null));
  load();
}

// ════════════════════════════════════════════════════════════
// About page
// ════════════════════════════════════════════════════════════
async function renderAbout(content) {
  const about = await apiFetch('/api/admin/about');
  content.innerHTML = `
    <div class="card">
      <div class="card-head"><h3>About Content</h3></div>
      <form id="about-form">
        <div class="field"><label>Heading</label><input name="heading" value="${esc(about.heading)}" /></div>
        <div class="field"><label>Paragraph 1</label><textarea name="paragraph1">${esc(about.paragraph1)}</textarea></div>
        <div class="field"><label>Paragraph 2</label><textarea name="paragraph2">${esc(about.paragraph2)}</textarea></div>
        <div class="field"><label>Image URL</label><input name="image" value="${esc(about.image)}" /></div>
        <div class="field">
          <label>Checklist Points</label>
          <div class="tag-list" id="about-checklist-tags"></div>
          <div class="add-row"><input id="about-checklist-input" placeholder="Add a point and press Enter" /></div>
        </div>
        <button type="submit" class="btn btn-primary">Save About Content</button>
      </form>
    </div>
    <div class="card">
      <div class="card-head"><h3>Stats ("Our Numbers")</h3></div>
      <div id="stats-list" class="item-list"></div>
      <div class="add-row" style="margin-top:1rem;">
        <input id="stat-number" placeholder="e.g. 10+" style="max-width:120px;padding:0.65rem;border:1.5px solid var(--border);border-radius:0.6rem;" />
        <input id="stat-label" placeholder="e.g. Years in Business" style="flex:1;padding:0.65rem;border:1.5px solid var(--border);border-radius:0.6rem;" />
        <button class="btn btn-primary" id="stat-add-btn">Add</button>
      </div>
    </div>
  `;

  let checklist = [...(about.checklist || [])];
  function renderChecklist() {
    document.getElementById('about-checklist-tags').innerHTML = checklist.map((h, i) => `<span class="tag">${esc(h)}<button data-i="${i}">×</button></span>`).join('');
    document.querySelectorAll('#about-checklist-tags button').forEach(b => b.onclick = () => { checklist.splice(Number(b.dataset.i), 1); renderChecklist(); });
  }
  renderChecklist();
  document.getElementById('about-checklist-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); const v = e.target.value.trim(); if (v) { checklist.push(v); e.target.value = ''; renderChecklist(); } }
  });

  document.getElementById('about-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target));
    try {
      await apiFetch('/api/admin/about', { method: 'PUT', body: JSON.stringify({ ...fd, checklist }) });
      toast('About content saved');
    } catch (err) { toast(err.message, true); }
  });

  async function loadStats() {
    const stats = await apiFetch('/api/admin/about-stats');
    const list = document.getElementById('stats-list');
    if (!stats.length) { list.innerHTML = '<div class="empty-state">No stats yet.</div>'; return; }
    list.innerHTML = stats.map(s => `
      <div class="item-row">
        <div class="item-main"><div class="item-title">${esc(s.number)} — ${esc(s.label)}</div></div>
        <div class="item-actions">
          <button class="btn btn-secondary btn-sm" data-edit="${s.id}">Edit</button>
          <button class="btn btn-danger btn-sm" data-del="${s.id}">Delete</button>
        </div>
      </div>
    `).join('');
    list.querySelectorAll('[data-edit]').forEach(btn => btn.onclick = () => {
      const s = stats.find(x => x.id == btn.dataset.edit);
      openModal('Edit Stat', `
        <div class="field"><label>Number</label><input id="s-number" value="${esc(s.number)}" /></div>
        <div class="field"><label>Label</label><input id="s-label" value="${esc(s.label)}" /></div>
        <div class="modal-actions"><button class="btn btn-outline" id="s-cancel">Cancel</button><button class="btn btn-primary" id="s-save">Save</button></div>
      `, (body) => {
        body.querySelector('#s-cancel').onclick = closeModal;
        body.querySelector('#s-save').onclick = async () => {
          await apiFetch(`/api/admin/about-stats/${s.id}`, { method: 'PUT', body: JSON.stringify({ number: body.querySelector('#s-number').value, label: body.querySelector('#s-label').value }) });
          closeModal(); toast('Saved'); loadStats();
        };
      });
    });
    list.querySelectorAll('[data-del]').forEach(btn => btn.onclick = () => confirmDelete('Delete this stat?', async () => { await apiFetch(`/api/admin/about-stats/${btn.dataset.del}`, { method: 'DELETE' }); toast('Deleted'); loadStats(); }));
  }
  document.getElementById('stat-add-btn').addEventListener('click', async () => {
    const number = document.getElementById('stat-number').value.trim();
    const label = document.getElementById('stat-label').value.trim();
    if (!number || !label) return toast('Enter both a number and a label', true);
    await apiFetch('/api/admin/about-stats', { method: 'POST', body: JSON.stringify({ number, label }) });
    document.getElementById('stat-number').value = ''; document.getElementById('stat-label').value = '';
    toast('Added'); loadStats();
  });
  loadStats();
}

// ════════════════════════════════════════════════════════════
// Testimonials
// ════════════════════════════════════════════════════════════
async function renderTestimonials(content) {
  content.innerHTML = `
    <div class="card">
      <div class="card-head"><h3>Testimonials</h3><button class="btn btn-primary btn-sm" id="add-btn">+ Add Testimonial</button></div>
      <div id="list" class="item-list"></div>
    </div>
  `;
  async function load() {
    const items = await apiFetch('/api/admin/testimonials');
    const list = document.getElementById('list');
    if (!items.length) { list.innerHTML = '<div class="empty-state">No testimonials yet.</div>'; return; }
    list.innerHTML = items.map(it => `
      <div class="item-row ${it.active ? '' : 'inactive'}">
        <div class="item-main"><div class="item-title">${esc(it.name)} — ${'★'.repeat(it.rating)}</div><div class="item-sub">${esc(it.quote)}</div></div>
        <span class="badge ${it.active ? 'badge-on' : 'badge-off'}">${it.active ? 'Active' : 'Disabled'}</span>
        <div class="item-actions">
          <button class="btn btn-secondary btn-sm" data-edit="${it.id}">Edit</button>
          <button class="btn btn-outline btn-sm" data-toggle="${it.id}">${it.active ? 'Disable' : 'Enable'}</button>
          <button class="btn btn-danger btn-sm" data-del="${it.id}">Delete</button>
        </div>
      </div>
    `).join('');
    list.querySelectorAll('[data-edit]').forEach(btn => btn.onclick = () => openModalFor(items.find(x => x.id == btn.dataset.edit)));
    list.querySelectorAll('[data-toggle]').forEach(btn => btn.onclick = async () => { await apiFetch(`/api/admin/testimonials/${btn.dataset.toggle}/toggle`, { method: 'PUT' }); load(); });
    list.querySelectorAll('[data-del]').forEach(btn => btn.onclick = () => confirmDelete('Delete this testimonial?', async () => { await apiFetch(`/api/admin/testimonials/${btn.dataset.del}`, { method: 'DELETE' }); toast('Deleted'); load(); }));
  }
  function openModalFor(item) {
    const t = item || { name: '', location: '', destination: '', rating: 5, quote: '', active: 1 };
    openModal(item ? 'Edit Testimonial' : 'Add Testimonial', `
      <div class="field-row">
        <div class="field"><label>Customer Name *</label><input id="t-name" value="${esc(t.name)}" /></div>
        <div class="field"><label>Location</label><input id="t-location" value="${esc(t.location)}" placeholder="e.g. London, UK" /></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Destination Travelled To</label><input id="t-destination" value="${esc(t.destination)}" /></div>
        <div class="field"><label>Rating (1-5)</label><input id="t-rating" type="number" min="1" max="5" value="${t.rating}" /></div>
      </div>
      <div class="field"><label>Quote *</label><textarea id="t-quote">${esc(t.quote)}</textarea></div>
      <label style="display:flex;align-items:center;gap:0.5rem;font-size:0.9rem;margin-bottom:0.5rem;"><input type="checkbox" id="t-active" ${t.active ? 'checked' : ''} style="width:auto;" /> Active</label>
      <div class="modal-actions"><button class="btn btn-outline" id="t-cancel">Cancel</button><button class="btn btn-primary" id="t-save">Save</button></div>
    `, (body) => {
      body.querySelector('#t-cancel').onclick = closeModal;
      body.querySelector('#t-save').onclick = async () => {
        const payload = { name: body.querySelector('#t-name').value.trim(), location: body.querySelector('#t-location').value, destination: body.querySelector('#t-destination').value, rating: Number(body.querySelector('#t-rating').value) || 5, quote: body.querySelector('#t-quote').value.trim(), active: body.querySelector('#t-active').checked };
        if (!payload.name || !payload.quote) return toast('Name and quote are required', true);
        try {
          if (item) await apiFetch(`/api/admin/testimonials/${item.id}`, { method: 'PUT', body: JSON.stringify(payload) });
          else await apiFetch('/api/admin/testimonials', { method: 'POST', body: JSON.stringify(payload) });
          closeModal(); toast('Saved'); load();
        } catch (e) { toast(e.message, true); }
      };
    });
  }
  document.getElementById('add-btn').addEventListener('click', () => openModalFor(null));
  load();
}

// ════════════════════════════════════════════════════════════
// FAQs
// ════════════════════════════════════════════════════════════
async function renderFaqs(content) {
  content.innerHTML = `
    <div class="card">
      <div class="card-head"><h3>FAQs</h3><button class="btn btn-primary btn-sm" id="add-btn">+ Add FAQ</button></div>
      <p style="margin-top:-0.5rem;">These FAQs appear both on the homepage and the contact page.</p>
      <div id="list" class="item-list"></div>
    </div>
  `;
  async function load() {
    const items = await apiFetch('/api/admin/faqs');
    const list = document.getElementById('list');
    if (!items.length) { list.innerHTML = '<div class="empty-state">No FAQs yet.</div>'; return; }
    list.innerHTML = items.map(it => `
      <div class="item-row ${it.active ? '' : 'inactive'}">
        <div class="item-main"><div class="item-title">${esc(it.question)}</div><div class="item-sub">${esc(it.answer)}</div></div>
        <span class="badge ${it.active ? 'badge-on' : 'badge-off'}">${it.active ? 'Active' : 'Disabled'}</span>
        <div class="item-actions">
          <button class="btn btn-secondary btn-sm" data-edit="${it.id}">Edit</button>
          <button class="btn btn-outline btn-sm" data-toggle="${it.id}">${it.active ? 'Disable' : 'Enable'}</button>
          <button class="btn btn-danger btn-sm" data-del="${it.id}">Delete</button>
        </div>
      </div>
    `).join('');
    list.querySelectorAll('[data-edit]').forEach(btn => btn.onclick = () => openModalFor(items.find(x => x.id == btn.dataset.edit)));
    list.querySelectorAll('[data-toggle]').forEach(btn => btn.onclick = async () => { await apiFetch(`/api/admin/faqs/${btn.dataset.toggle}/toggle`, { method: 'PUT' }); load(); });
    list.querySelectorAll('[data-del]').forEach(btn => btn.onclick = () => confirmDelete('Delete this FAQ?', async () => { await apiFetch(`/api/admin/faqs/${btn.dataset.del}`, { method: 'DELETE' }); toast('Deleted'); load(); }));
  }
  function openModalFor(item) {
    const f = item || { question: '', answer: '', active: 1 };
    openModal(item ? 'Edit FAQ' : 'Add FAQ', `
      <div class="field"><label>Question *</label><input id="f-q" value="${esc(f.question)}" /></div>
      <div class="field"><label>Answer *</label><textarea id="f-a">${esc(f.answer)}</textarea></div>
      <label style="display:flex;align-items:center;gap:0.5rem;font-size:0.9rem;margin-bottom:0.5rem;"><input type="checkbox" id="f-active" ${f.active ? 'checked' : ''} style="width:auto;" /> Active</label>
      <div class="modal-actions"><button class="btn btn-outline" id="f-cancel">Cancel</button><button class="btn btn-primary" id="f-save">Save</button></div>
    `, (body) => {
      body.querySelector('#f-cancel').onclick = closeModal;
      body.querySelector('#f-save').onclick = async () => {
        const payload = { question: body.querySelector('#f-q').value.trim(), answer: body.querySelector('#f-a').value.trim(), active: body.querySelector('#f-active').checked };
        if (!payload.question || !payload.answer) return toast('Question and answer are required', true);
        try {
          if (item) await apiFetch(`/api/admin/faqs/${item.id}`, { method: 'PUT', body: JSON.stringify(payload) });
          else await apiFetch('/api/admin/faqs', { method: 'POST', body: JSON.stringify(payload) });
          closeModal(); toast('Saved'); load();
        } catch (e) { toast(e.message, true); }
      };
    });
  }
  document.getElementById('add-btn').addEventListener('click', () => openModalFor(null));
  load();
}

// ════════════════════════════════════════════════════════════
// Contact (office hours)
// ════════════════════════════════════════════════════════════
async function renderContact(content) {
  const contact = await apiFetch('/api/admin/contact');
  const settings = await apiFetch('/api/admin/settings');
  content.innerHTML = `
    <div class="card">
      <div class="card-head"><h3>Contact Details</h3></div>
      <p>Phone, WhatsApp, email and address are managed under Site Settings since they're used across the whole site.</p>
      <a href="#settings" class="btn btn-secondary btn-sm">Go to Site Settings</a>
    </div>
    <div class="card">
      <div class="card-head"><h3>Office Hours</h3></div>
      <div id="hours-list" class="item-list"></div>
      <div class="add-row" style="margin-top:1rem;">
        <input id="hour-day" placeholder="Day(s), e.g. Monday – Friday" style="flex:1;padding:0.65rem;border:1.5px solid var(--border);border-radius:0.6rem;" />
        <input id="hour-time" placeholder="Time, e.g. 9:00 AM – 8:00 PM" style="flex:1;padding:0.65rem;border:1.5px solid var(--border);border-radius:0.6rem;" />
        <button class="btn btn-primary" id="hour-add-btn">Add</button>
      </div>
      <div class="field" style="margin-top:1.25rem;">
        <label>Note (e.g. emergency support line)</label>
        <input id="hours-note" value="${esc(contact.office_hours_note)}" />
      </div>
      <button class="btn btn-primary" id="hours-save-btn">Save Office Hours</button>
    </div>
  `;

  let hours = [...(contact.office_hours || [])];
  function renderHours() {
    const list = document.getElementById('hours-list');
    if (!hours.length) { list.innerHTML = '<div class="empty-state">No office hours added yet.</div>'; return; }
    list.innerHTML = hours.map((h, i) => `
      <div class="item-row">
        <div class="item-main"><div class="item-title">${esc(h.day)}</div><div class="item-sub">${esc(h.time)}</div></div>
        <button class="btn btn-danger btn-sm" data-i="${i}">Delete</button>
      </div>
    `).join('');
    list.querySelectorAll('button').forEach(b => b.onclick = () => { hours.splice(Number(b.dataset.i), 1); renderHours(); });
  }
  renderHours();

  document.getElementById('hour-add-btn').addEventListener('click', () => {
    const day = document.getElementById('hour-day').value.trim();
    const time = document.getElementById('hour-time').value.trim();
    if (!day || !time) return toast('Enter both a day and a time', true);
    hours.push({ day, time });
    document.getElementById('hour-day').value = ''; document.getElementById('hour-time').value = '';
    renderHours();
  });

  document.getElementById('hours-save-btn').addEventListener('click', async () => {
    try {
      await apiFetch('/api/admin/contact', { method: 'PUT', body: JSON.stringify({ office_hours: hours, office_hours_note: document.getElementById('hours-note').value }) });
      toast('Office hours saved');
    } catch (e) { toast(e.message, true); }
  });
}

// ════════════════════════════════════════════════════════════
// Footer
// ════════════════════════════════════════════════════════════
async function renderFooter(content) {
  const settings = await apiFetch('/api/admin/settings');
  content.innerHTML = `
    <div class="card">
      <div class="card-head"><h3>Footer</h3></div>
      <form id="footer-form">
        <div class="field"><label>About text (shown under the logo in the footer)</label><textarea name="footer_about">${esc(settings.footer_about)}</textarea></div>
        <div class="field"><label>Copyright text</label><input name="copyright_text" value="${esc(settings.copyright_text)}" /></div>
        <button type="submit" class="btn btn-primary">Save Footer</button>
      </form>
    </div>
  `;
  document.getElementById('footer-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target));
    try {
      await apiFetch('/api/admin/settings', { method: 'PUT', body: JSON.stringify({ ...settings, ...fd }) });
      toast('Footer saved');
    } catch (err) { toast(err.message, true); }
  });
}

// ════════════════════════════════════════════════════════════
// Site Settings + change password
// ════════════════════════════════════════════════════════════
async function renderSettings(content) {
  const settings = await apiFetch('/api/admin/settings');
  content.innerHTML = `
    <div class="card">
      <div class="card-head"><h3>Site Settings</h3></div>
      <form id="settings-form">
        <div class="field"><label>Site Name</label><input name="site_name" value="${esc(settings.site_name)}" /></div>
        <div class="field"><label>Tagline</label><input name="tagline" value="${esc(settings.tagline)}" /></div>
        <div class="field-row">
          <div class="field"><label>Phone (display)</label><input name="phone" value="${esc(settings.phone)}" placeholder="074 1835 9679" /></div>
          <div class="field"><label>WhatsApp number (digits only, with country code)</label><input name="whatsapp" value="${esc(settings.whatsapp)}" placeholder="447418359679" /></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Email</label><input name="email" value="${esc(settings.email)}" /></div>
          <div class="field"><label>Address</label><input name="address" value="${esc(settings.address)}" /></div>
        </div>
        <button type="submit" class="btn btn-primary">Save Settings</button>
      </form>
    </div>
    <div class="card">
      <div class="card-head"><h3>Change Password</h3></div>
      <div id="pw-msg"></div>
      <form id="password-form">
        <div class="field"><label>Current Password</label><input type="password" name="currentPassword" required /></div>
        <div class="field"><label>New Password (min 8 characters)</label><input type="password" name="newPassword" required minlength="8" /></div>
        <button type="submit" class="btn btn-primary">Change Password</button>
      </form>
    </div>
  `;
  document.getElementById('settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target));
    try {
      await apiFetch('/api/admin/settings', { method: 'PUT', body: JSON.stringify({ ...settings, ...fd }) });
      toast('Settings saved');
    } catch (err) { toast(err.message, true); }
  });
  document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.target));
    const msg = document.getElementById('pw-msg');
    msg.innerHTML = '';
    try {
      await apiFetch('/api/admin/change-password', { method: 'POST', body: JSON.stringify(fd) });
      msg.innerHTML = '<div class="success-msg">Password changed successfully.</div>';
      e.target.reset();
    } catch (err) {
      msg.innerHTML = `<div class="error-msg">${esc(err.message)}</div>`;
    }
  });
}

// ════════════════════════════════════════════════════════════
router();
