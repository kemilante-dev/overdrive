/* ===== Overdrive — Supabase Version (Free PostgreSQL) ===== */
(function () {
  'use strict';

  // === SUPABASE CONFIG ===
  // Get these from https://supabase.com (free tier, no card required)
  const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2Z2dmcWhxeWhtaHNtdWt5bmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNTk1NzAsImV4cCI6MjA5NzYzNTU3MH0.Axx2XeQaf-bled3NecT1gz__MQiTRPIP47zrYmRvEHI';

  // Helper for Supabase API calls
  async function supabaseCall(table, method = 'GET', data = null) {
    const headers = {
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'apikey': SUPABASE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };

    const options = { method, headers };
    if (data) options.body = JSON.stringify(data);

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, options);
      if (!response.ok) throw new Error(`Supabase error: ${response.statusText}`);
      return await response.json();
    } catch (e) {
      console.error('Supabase error:', e);
      return null;
    }
  }

  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const uid = () => Math.random().toString(36).slice(2, 9);

  // Hybrid store: localStorage for session, Supabase for data
  const store = {
    get(k, d) { 
      try { 
        const v = JSON.parse(localStorage.getItem(k)); 
        return v ?? d; 
      } catch { 
        return d; 
      } 
    },
    set(k, v) { 
      localStorage.setItem(k, JSON.stringify(v)); 
    },
    // Async methods for Supabase
    async getAsync(table, defaultValue) {
      const data = await supabaseCall(table);
      if (!data || data.length === 0) return defaultValue;
      // Supabase returns array; we need single object with 'items' property
      return data[0]?.items || defaultValue;
    },
    async setAsync(table, items) {
      // First, delete old record and insert new one
      await supabaseCall(table, 'DELETE');
      const result = await supabaseCall(table, 'POST', { items });
      return result;
    }
  };

  /* ---------- Seed data ---------- */
  const SEED = {
    od_users: [
      { id:'u1', username:'admin', email:'admin@overdrive.ph', password:'admin123', role:'admin' },
      { id:'u2', username:'demo',  email:'demo@overdrive.ph',  password:'demo123',  role:'user' }
    ],
    od_announcements: [
      { id:'a1', title:'Alpha Build Coming Soon', date:'2026-06-01', content:'Closed alpha registration opens this month — sign up to drive first.', image:'' },
      { id:'a2', title:'New Scene: Morning Terminal', date:'2026-05-20', content:'Our artists wrapped the morning terminal scene. Peek inside the Scenes page.', image:'' },
      { id:'a3', title:'Player Survey Live', date:'2026-05-10', content:'Help shape Overdrive — take 3 minutes to share what you want to see.', image:'' }
    ],
    od_features: [
      { id:'f1', icon:'🗺️', title:'Route Planning', desc:'Plan your daily route — fast highways or scenic barangay roads.' },
      { id:'f2', icon:'👥', title:'Passenger Management', desc:'Pick up regulars, learn their routines, earn loyalty.' },
      { id:'f3', icon:'⛽', title:'Fuel & Maintenance', desc:'Refuel, repair and upgrade your jeepney between shifts.' },
      { id:'f4', icon:'🌦️', title:'Dynamic Weather', desc:'Golden sunrises, sudden tropical downpours, humid afternoons.' },
      { id:'f5', icon:'🎨', title:'Customization', desc:'Paint, decorate and style your jeepney inside and out.' },
      { id:'f6', icon:'📖', title:'Story Mode', desc:'A narrative campaign where your choices shape relationships.' }
    ],
    od_carousel: [
      { id:'c1', image:'https://images.unsplash.com/photo-1597007030739-6d2e7172ee2e?w=1400&q=80', title:'Morning Terminal', desc:'Engines hum to life as the day begins.' },
      { id:'c2', image:'https://images.unsplash.com/photo-1545158539-1709c0a1ff0e?w=1400&q=80', title:'City Streets', desc:'Weave through Manila traffic with passengers in tow.' },
      { id:'c3', image:'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1400&q=80', title:'Provincial Roads', desc:'Take the scenic route through rice fields and coast.' }
    ],
    od_scenes: [
      { id:'s1', image:'https://images.unsplash.com/photo-1597007030739-6d2e7172ee2e?w=900&q=80', title:'Barangay Terminal at Dawn' },
      { id:'s2', image:'https://images.unsplash.com/photo-1545158539-1709c0a1ff0e?w=900&q=80', title:'Rush Hour Avenue' },
      { id:'s3', image:'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=900&q=80', title:'Coastal Highway' },
      { id:'s4', image:'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=900&q=80', title:'Mountain Pass' }
    ],
    od_about: {
      title: 'About Overdrive',
      body: 'Overdrive is a love letter to the Filipino jeepney — the colorful, hand-painted king of the road. Built by a small team of artists and engineers, our goal is to capture the rhythm of a [...]'
    },
    od_contact: {
      email:'hello@overdrive.ph',
      phone:'+63 917 000 0000',
      address:'Quezon City, Metro Manila, Philippines',
      survey:'https://docs.google.com/forms/'
    },
    od_download: {
      url: '',
      label: 'Download Overdrive'
    }
  };

  async function seed() {
    // Initialize Supabase with seed data if empty
    for (const [key, val] of Object.entries(SEED)) {
      try {
        const existing = await store.getAsync(key);
        if (!existing || (Array.isArray(existing) && existing.length === 0)) {
          await store.setAsync(key, val);
        }
      } catch (e) {
        console.error(`Seeding ${key} failed:`, e);
      }
    }
  }
  seed();

  /* ---------- Session ---------- */
  const session = {
    get user() { return store.get('od_session', null); },
    login(u) { store.set('od_session', u); },
    logout() { localStorage.removeItem('od_session'); }
  };

  /* ---------- Toast ---------- */
  function toast(msg) {
    let t = $('#od-toast');
    if (!t) { t = document.createElement('div'); t.id='od-toast'; t.className='toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(()=>t.classList.remove('show'), 2400);
  }

  /* ---------- Nav ---------- */
  function initNav() {
    const toggle = $('.nav-toggle');
    const links = $('.nav-links');
    if (toggle && links) toggle.addEventListener('click', () => links.classList.toggle('open'));

    const path = location.pathname.split('/').pop() || 'index.html';
    $$('.nav-links a').forEach(a => {
      if (a.getAttribute('href') === path) a.classList.add('active');
    });

    const u = session.user;
    const loginLink = $('#nav-login');
    const logoutLink = $('#nav-logout');
    const adminLink = $('#nav-admin');
    if (loginLink) loginLink.style.display = u ? 'none' : '';
    if (logoutLink) logoutLink.style.display = u ? '' : 'none';
    if (adminLink) adminLink.style.display = (u && u.role === 'admin') ? '' : 'none';
    if (logoutLink) logoutLink.addEventListener('click', e => {
      e.preventDefault(); session.logout(); toast('Logged out'); setTimeout(()=>location.href='index.html', 600);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window) || !els.length) { els.forEach(e=>e.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold:.15 });
    els.forEach(e => io.observe(e));
  }

  /* ---------- Home: announcements (NOW ASYNC) ---------- */
  async function renderAnnouncements() {
    const el = $('#announcements-grid');
    if (!el) return;
    const items = await store.getAsync('od_announcements', SEED.od_announcements);
    if (!items || !items.length) { el.innerHTML = '<p class="text-center" style="color:var(--muted)">No announcements yet.</p>'; return; }
    el.innerHTML = items.map(a => `
      <article class="card ann-card reveal">
        <div class="ann-date">${escapeHtml(a.date || '')}</div>
        <h3>${escapeHtml(a.title)}</h3>
        ${a.image ? `<img src="${escapeAttr(a.image)}" alt="${escapeAttr(a.title)}" onerror="this.remove()">` : ''}
        <p>${escapeHtml(a.content)}</p>
      </article>`).join('');
    initReveal();
  }

  /* ---------- Home: carousel ---------- */
  async function initCarousel() {
    const root = $('#carousel');
    if (!root) return;
    const slides = await store.getAsync('od_carousel', SEED.od_carousel);
    const track = root.querySelector('.carousel-track');
    const dotsWrap = root.querySelector('.carousel-dots');
    if (!slides || !slides.length) { root.style.display='none'; return; }
    track.innerHTML = slides.map(s => `
      <div class="carousel-slide">
        <img src="${escapeAttr(s.image)}" alt="${escapeAttr(s.title)}">
        <div class="carousel-caption"><h3>${escapeHtml(s.title)}</h3><p>${escapeHtml(s.desc)}</p></div>
      </div>`).join('');
    dotsWrap.innerHTML = slides.map((_,i)=>`<button class="carousel-dot${i===0?' active':''}" data-i="${i}" aria-label="Slide ${i+1}"></button>`).join('');
    let i = 0;
    const go = (n) => {
      i = (n + slides.length) % slides.length;
      track.style.transform = `translateX(-${i*100}%)`;
      $$('.carousel-dot', root).forEach((d,k)=>d.classList.toggle('active', k===i));
    };
    root.querySelector('.prev').addEventListener('click', ()=>go(i-1));
    root.querySelector('.next').addEventListener('click', ()=>go(i+1));
    dotsWrap.addEventListener('click', e => { const b=e.target.closest('.carousel-dot'); if(b) go(+b.dataset.i); });
    let timer = setInterval(()=>go(i+1), 5000);
    root.addEventListener('mouseenter', ()=>clearInterval(timer));
    root.addEventListener('mouseleave', ()=>{ timer = setInterval(()=>go(i+1), 5000); });
  }

  /* ---------- Features page ---------- */
  async function renderFeatures() {
    const el = $('#features-grid');
    if (!el) return;
    const items = await store.getAsync('od_features', SEED.od_features);
    el.innerHTML = items.map(f => `
      <div class="card reveal">
        <span class="icon">${escapeHtml(f.icon)}</span>
        <h3>${escapeHtml(f.title)}</h3>
        <p>${escapeHtml(f.desc)}</p>
      </div>`).join('');
    initReveal();
  }

  /* ---------- Scenes page ---------- */
  async function renderScenes() {
    const el = $('#scenes-grid');
    if (!el) return;
    const items = await store.getAsync('od_scenes', SEED.od_scenes);
    el.innerHTML = items.map(s => `
      <figure class="scene reveal">
        <img src="${escapeAttr(s.image)}" alt="${escapeAttr(s.title)}">
        <figcaption class="scene-cap">${escapeHtml(s.title)}</figcaption>
      </figure>`).join('');
    initReveal();
  }

  /* ---------- About page ---------- */
  async function renderAbout() {
    const t = $('#about-title'), b = $('#about-body');
    if (!t || !b) return;
    const a = await store.getAsync('od_about', SEED.od_about);
    t.textContent = a.title; b.textContent = a.body;
  }

  /* ---------- Contact page ---------- */
  async function renderContact() {
    const el = $('#contact-info');
    if (!el) return;
    const c = await store.getAsync('od_contact', SEED.od_contact);
    el.innerHTML = `
      <p><strong>Email:</strong> <a href="mailto:${escapeAttr(c.email)}">${escapeHtml(c.email)}</a></p>
      <p><strong>Phone:</strong> ${escapeHtml(c.phone)}</p>
      <p><strong>Address:</strong> ${escapeHtml(c.address)}</p>
      <p><a class="btn btn-primary" href="${escapeAttr(c.survey)}" target="_blank" rel="noopener">Take the Player Survey →</a></p>`;
    const f = $('#contact-form');
    if (f) f.addEventListener('submit', e => {
      e.preventDefault(); f.reset(); toast('Message sent! We\'ll be in touch.');
    });
  }

  /* ---------- Download section ---------- */
  function normalizeUrl(u) {
    if (!u) return '';
    u = u.trim();
    if (!u) return '';
    if (/^(https?:|mailto:|tel:|ftp:)/i.test(u)) return u;
    return 'https://' + u.replace(/^\/+/, '');
  }

  async function renderDownload() {
    const el = $('#download-cta');
    if (!el) return;
    const d = await store.getAsync('od_download', SEED.od_download);
    const url = normalizeUrl(d.url);
    if (url) {
      el.innerHTML = `<a class="btn-download" href="${escapeAttr(url)}" target="_blank" rel="noopener">
        <span class="dl-icon">⬇</span>
        <span class="dl-text">
          <span class="dl-label">${escapeHtml(d.label || 'Download Game')}</span>
          <span class="dl-sub">Free • Click to download</span>
        </span>
      </a>`;
    } else {
      el.innerHTML = `<span class="btn-download btn-download-soon">
        <span class="dl-icon">🚧</span>
        <span class="dl-text">
          <span class="dl-label">Coming Soon</span>
          <span class="dl-sub">Download link will appear here</span>
        </span>
      </span>`;
    }
  }

  /* ---------- Login / Register ---------- */
  function initLogin() {
    const f = $('#login-form');
    if (!f) return;
    f.addEventListener('submit', e => {
      e.preventDefault();
      const username = $('#login-username').value.trim();
      const password = $('#login-password').value;
      const users = store.get('od_users', []);
      const u = users.find(x => (x.username===username || x.email===username) && x.password===password);
      if (!u) { toast('Invalid credentials'); return; }
      session.login({ id:u.id, username:u.username, role:u.role });
      toast('Welcome, ' + u.username);
      setTimeout(()=> location.href = u.role==='admin' ? 'admin.html' : 'index.html', 700);
    });
  }

  function initRegister() {
    const f = $('#register-form');
    if (!f) return;
    f.addEventListener('submit', e => {
      e.preventDefault();
      const username = $('#reg-username').value.trim();
      const email = $('#reg-email').value.trim();
      const password = $('#reg-password').value;
      if (!username || !email || !password) { toast('Fill all fields'); return; }
      const users = store.get('od_users', []);
      if (users.some(u=>u.username===username)) { toast('Username taken'); return; }
      const nu = { id:uid(), username, email, password, role:'user' };
      users.push(nu); store.set('od_users', users);
      session.login({ id:nu.id, username, role:'user' });
      toast('Account created'); setTimeout(()=>location.href='index.html', 700);
    });
  }

  /* ---------- Admin ---------- */
  async function initAdmin() {
    const shell = $('#admin-shell');
    if (!shell) return;
    const u = session.user;
    if (!u || u.role !== 'admin') {
      shell.innerHTML = '<div class="form-card"><h2>Admin only</h2><p>Please log in as an administrator.</p><a class="btn btn-primary" href="login.html">Log in</a></div>';
      return;
    }

    $$('.admin-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        $$('.admin-tab').forEach(t=>t.classList.remove('active'));
        $$('.admin-panel').forEach(p=>p.classList.remove('active'));
        tab.classList.add('active');
        $('#panel-' + tab.dataset.tab).classList.add('active');
      });
    });

    await renderUsersAdmin();
    await renderAnnAdmin();
    await renderFeatAdmin();
    await renderScenesAdmin();
    await renderPagesAdmin();

    $('#btn-add-user').addEventListener('click', ()=> openUserModal());
    $('#btn-add-ann').addEventListener('click', ()=> openAnnModal());
    $('#btn-add-feat').addEventListener('click', ()=> openFeatModal());
    $('#btn-add-scene').addEventListener('click', ()=> openSceneModal());
    $('#btn-edit-about').addEventListener('click', openAboutModal);
    $('#btn-edit-contact').addEventListener('click', openContactModal);
    $('#btn-edit-download').addEventListener('click', openDownloadModal);
  }

  async function renderUsersAdmin() {
    const users = store.get('od_users', []);
    $('#users-tbody').innerHTML = users.map(u => `
      <tr>
        <td><strong>${escapeHtml(u.username)}</strong></td>
        <td>${escapeHtml(u.email)}</td>
        <td><span class="badge badge-${u.role}">${u.role}</span></td>
        <td class="row-actions">
          <button class="btn btn-sm btn-ghost" data-edit-user="${u.id}">Edit</button>
          <button class="btn btn-sm btn-olive" data-del-user="${u.id}">Delete</button>
        </td>
      </tr>`).join('');
    $$('[data-edit-user]').forEach(b => b.addEventListener('click', ()=> openUserModal(b.dataset.editUser)));
    $$('[data-del-user]').forEach(b => b.addEventListener('click', ()=> {
      if (!confirm('Delete this user?')) return;
      store.set('od_users', store.get('od_users', []).filter(x=>x.id!==b.dataset.delUser));
      renderUsersAdmin(); toast('User deleted');
    }));
  }

  async function renderAnnAdmin() {
    const items = await store.getAsync('od_announcements', SEED.od_announcements);
    $('#ann-tbody').innerHTML = items.map(a => `
      <tr>
        <td><strong>${escapeHtml(a.title)}</strong></td>
        <td>${escapeHtml(a.date||'')}</td>
        <td>${a.image ? '🖼️' : '—'}</td>
        <td class="row-actions">
          <button class="btn btn-sm btn-ghost" data-edit-ann="${a.id}">Edit</button>
          <button class="btn btn-sm btn-olive" data-del-ann="${a.id}">Delete</button>
        </td>
      </tr>`).join('');
    $$('[data-edit-ann]').forEach(b => b.addEventListener('click', ()=> openAnnModal(b.dataset.editAnn)));
    $$('[data-del-ann]').forEach(b => b.addEventListener('click', async ()=> {
      if (!confirm('Delete this announcement?')) return;
      const updated = (await store.getAsync('od_announcements', [])).filter(x=>x.id!==b.dataset.delAnn);
      await store.setAsync('od_announcements', updated);
      await renderAnnAdmin(); toast('Announcement deleted');
    }));
  }

  async function renderFeatAdmin() {
    const items = await store.getAsync('od_features', SEED.od_features);
    $('#feat-tbody').innerHTML = items.map(f => `
      <tr>
        <td style="font-size:1.4rem">${escapeHtml(f.icon)}</td>
        <td><strong>${escapeHtml(f.title)}</strong><br><span style="color:var(--muted);font-size:.85rem">${escapeHtml(f.desc)}</span></td>
        <td class="row-actions">
          <button class="btn btn-sm btn-ghost" data-edit-feat="${f.id}">Edit</button>
          <button class="btn btn-sm btn-olive" data-del-feat="${f.id}">Delete</button>
        </td>
      </tr>`).join('');
    $$('[data-edit-feat]').forEach(b => b.addEventListener('click', ()=> openFeatModal(b.dataset.editFeat)));
    $$('[data-del-feat]').forEach(b => b.addEventListener('click', async ()=> {
      if (!confirm('Delete this feature?')) return;
      const updated = (await store.getAsync('od_features', [])).filter(x=>x.id!==b.dataset.delFeat);
      await store.setAsync('od_features', updated);
      await renderFeatAdmin(); toast('Feature deleted');
    }));
  }

  async function renderScenesAdmin() {
    const items = await store.getAsync('od_scenes', SEED.od_scenes);
    $('#scene-tbody').innerHTML = items.map(s => `
      <tr>
        <td><img src="${escapeAttr(s.image)}" alt="" style="width:80px;height:54px;object-fit:cover;border-radius:6px"></td>
        <td><strong>${escapeHtml(s.title)}</strong></td>
        <td class="row-actions">
          <button class="btn btn-sm btn-ghost" data-edit-scene="${s.id}">Edit</button>
          <button class="btn btn-sm btn-olive" data-del-scene="${s.id}">Delete</button>
        </td>
      </tr>`).join('');
    $$('[data-edit-scene]').forEach(b => b.addEventListener('click', ()=> openSceneModal(b.dataset.editScene)));
    $$('[data-del-scene]').forEach(b => b.addEventListener('click', async ()=> {
      if (!confirm('Delete this scene?')) return;
      const updated = (await store.getAsync('od_scenes', [])).filter(x=>x.id!==b.dataset.delScene);
      await store.setAsync('od_scenes', updated);
      await renderScenesAdmin(); toast('Scene deleted');
    }));
  }

  async function renderPagesAdmin() {
    const a = await store.getAsync('od_about', SEED.od_about);
    const c = await store.getAsync('od_contact', SEED.od_contact);
    const d = await store.getAsync('od_download', SEED.od_download);
    $('#about-tbody').innerHTML = `
      <tr><th style="width:140px">Title</th><td>${escapeHtml(a.title)}</td></tr>
      <tr><th>Body</th><td>${escapeHtml(a.body)}</td></tr>`;
    $('#contact-tbody').innerHTML = `
      <tr><th style="width:140px">Email</th><td>${escapeHtml(c.email)}</td></tr>
      <tr><th>Phone</th><td>${escapeHtml(c.phone)}</td></tr>
      <tr><th>Address</th><td>${escapeHtml(c.address)}</td></tr>
      <tr><th>Survey URL</th><td>${escapeHtml(c.survey)}</td></tr>`;
    $('#download-tbody').innerHTML = `
      <tr><th style="width:140px">Label</th><td>${escapeHtml(d.label || '')}</td></tr>
      <tr><th>URL</th><td>${d.url ? escapeHtml(d.url) : '<em style="color:var(--muted)">Not set</em>'}</td></tr>`;
  }

  async function openAboutModal() {
    const a = await store.getAsync('od_about', SEED.od_about);
    openModal(`
      <h3>Edit About Page</h3>
      <div class="form-group"><label>Title</label><input id="m-about-title" value="${escapeAttr(a.title)}"></div>
      <div class="form-group"><label>Body</label><textarea id="m-about-body" rows="6">${escapeHtml(a.body)}</textarea></div>
      <div class="modal-actions"><button class="btn btn-ghost" id="m-cancel">Cancel</button><button class="btn btn-primary" id="m-save">Save</button></div>
    `, m => {
      $('#m-cancel',m).onclick = closeModal;
      $('#m-save',m).onclick = async () => {
        const data = { title:$('#m-about-title').value.trim(), body:$('#m-about-body').value.trim() };
        if (!data.title) return toast('Title required');
        await store.setAsync('od_about', data); await renderPagesAdmin(); closeModal(); toast('About page saved');
      };
    });
  }

  async function openContactModal() {
    const c = await store.getAsync('od_contact', SEED.od_contact);
    openModal(`
      <h3>Edit Contact Page</h3>
      <div class="form-group"><label>Email</label><input id="m-c-email" value="${escapeAttr(c.email)}"></div>
      <div class="form-group"><label>Phone</label><input id="m-c-phone" value="${escapeAttr(c.phone)}"></div>
      <div class="form-group"><label>Address</label><input id="m-c-address" value="${escapeAttr(c.address)}"></div>
      <div class="form-group"><label>Survey URL</label><input id="m-c-survey" value="${escapeAttr(c.survey)}" placeholder="https://docs.google.com/forms/..."></div>
      <div class="modal-actions"><button class="btn btn-ghost" id="m-cancel">Cancel</button><button class="btn btn-primary" id="m-save">Save</button></div>
    `, m => {
      $('#m-cancel',m).onclick = closeModal;
      $('#m-save',m).onclick = async () => {
        const data = {
          email:$('#m-c-email').value.trim(), phone:$('#m-c-phone').value.trim(),
          address:$('#m-c-address').value.trim(), survey:$('#m-c-survey').value.trim()
        };
        await store.setAsync('od_contact', data); await renderPagesAdmin(); closeModal(); toast('Contact page saved');
      };
    });
  }

  async function openDownloadModal() {
    const d = await store.getAsync('od_download', SEED.od_download);
    openModal(`
      <h3>Edit Download Link</h3>
      <div class="form-group"><label>Button Label</label><input id="m-d-label" value="${escapeAttr(d.label || 'Download Overdrive')}"></div>
      <div class="form-group"><label>Download URL</label><input id="m-d-url" value="${escapeAttr(d.url || '')}" placeholder="https://..."></div>
      <div class="modal-actions"><button class="btn btn-ghost" id="m-cancel">Cancel</button><button class="btn btn-primary" id="m-save">Save</button></div>
    `, m => {
      $('#m-cancel',m).onclick = closeModal;
      $('#m-save',m).onclick = async () => {
        const data = { label:$('#m-d-label').value.trim(), url:$('#m-d-url').value.trim() };
        await store.setAsync('od_download', data);
        await renderPagesAdmin(); await renderDownload(); closeModal(); toast('Download link saved');
      };
    });
  }

  /* ---------- Modals ---------- */
  function openModal(html, onMount) {
    let m = $('#od-modal');
    if (!m) {
      m = document.createElement('div'); m.id='od-modal'; m.className='modal-backdrop';
      document.body.appendChild(m);
      m.addEventListener('click', e => { if (e.target===m) m.classList.remove('open'); });
    }
    m.innerHTML = `<div class="modal">${html}</div>`;
    m.classList.add('open');
    if (onMount) onMount(m);
  }
  function closeModal() { $('#od-modal')?.classList.remove('open'); }

  function openUserModal(id) {
    const users = store.get('od_users', []);
    const u = id ? users.find(x=>x.id===id) : { username:'', email:'', password:'', role:'user' };
    openModal(`
      <h3>${id?'Edit':'Add'} User</h3>
      <div class="form-group"><label>Username</label><input id="m-username" value="${escapeAttr(u.username)}"></div>
      <div class="form-group"><label>Email</label><input id="m-email" type="email" value="${escapeAttr(u.email)}"></div>
      <div class="form-group"><label>Password</label><input id="m-password" value="${escapeAttr(u.password||'')}"></div>
      <div class="form-group"><label>Role</label><select id="m-role"><option value="user"${u.role==='user'?' selected':''}>user</option><option value="admin"${u.role==='admin'?' selected':''}>admin</option></select></div>
      <div class="modal-actions"><button class="btn btn-ghost" id="m-cancel">Cancel</button><button class="btn btn-primary" id="m-save">Save</button></div>
    `, m => {
      $('#m-cancel',m).onclick = closeModal;
      $('#m-save',m).onclick = () => {
        const data = {
          username:$('#m-username').value.trim(), email:$('#m-email').value.trim(),
          password:$('#m-password').value, role:$('#m-role').value
        };
        if (!data.username || !data.email) return toast('Username and email required');
        if (id) Object.assign(u, data); else users.push({ id:uid(), ...data });
        store.set('od_users', users); renderUsersAdmin(); closeModal(); toast('User saved');
      };
    });
  }

  async function openAnnModal(id) {
    const items = await store.getAsync('od_announcements', SEED.od_announcements);
    const a = id ? items.find(x=>x.id===id) : { title:'', date:new Date().toISOString().slice(0,10), content:'', image:'' };
    openModal(`
      <h3>${id?'Edit':'Add'} Announcement</h3>
      <div class="form-group"><label>Title</label><input id="m-title" value="${escapeAttr(a.title)}"></div>
      <div class="form-group"><label>Date</label><input id="m-date" type="date" value="${escapeAttr(a.date)}"></div>
      <div class="form-group"><label>Content</label><textarea id="m-content">${escapeHtml(a.content)}</textarea></div>
      <label class="form-check"><input type="checkbox" id="m-has-img" ${a.image?'checked':''}> Include image</label>
      <div class="form-group" id="m-img-wrap" style="${a.image?'':'display:none'}"><label>Image URL</label><input id="m-image" value="${escapeAttr(a.image||'')}" placeholder="https://..."></div>
      <div class="modal-actions"><button class="btn btn-ghost" id="m-cancel">Cancel</button><button class="btn btn-primary" id="m-save">Save</button></div>
    `, m => {
      $('#m-has-img',m).addEventListener('change', e => $('#m-img-wrap',m).style.display = e.target.checked?'':'none');
      $('#m-cancel',m).onclick = closeModal;
      $('#m-save',m).onclick = async () => {
        const allItems = await store.getAsync('od_announcements', SEED.od_announcements);
        const data = {
          title:$('#m-title').value.trim(), date:$('#m-date').value,
          content:$('#m-content').value.trim(),
          image:$('#m-has-img').checked ? $('#m-image').value.trim() : ''
        };
        if (!data.title) return toast('Title required');
        if (id) {
          const idx = allItems.findIndex(x => x.id === id);
          if (idx >= 0) allItems[idx] = { ...allItems[idx], ...data };
        } else {
          allItems.unshift({ id:uid(), ...data });
        }
        await store.setAsync('od_announcements', allItems); await renderAnnAdmin(); closeModal(); toast('Announcement saved');
      };
    });
  }

  async function openFeatModal(id) {
    const items = await store.getAsync('od_features', SEED.od_features);
    const f = id ? items.find(x=>x.id===id) : { icon:'✨', title:'', desc:'' };
    openModal(`
      <h3>${id?'Edit':'Add'} Feature</h3>
      <div class="form-group"><label>Icon (emoji)</label><input id="m-icon" value="${escapeAttr(f.icon)}"></div>
      <div class="form-group"><label>Title</label><input id="m-title" value="${escapeAttr(f.title)}"></div>
      <div class="form-group"><label>Description</label><textarea id="m-desc">${escapeHtml(f.desc)}</textarea></div>
      <div class="modal-actions"><button class="btn btn-ghost" id="m-cancel">Cancel</button><button class="btn btn-primary" id="m-save">Save</button></div>
    `, m => {
      $('#m-cancel',m).onclick = closeModal;
      $('#m-save',m).onclick = async () => {
        const allItems = await store.getAsync('od_features', SEED.od_features);
        const data = { icon:$('#m-icon').value, title:$('#m-title').value.trim(), desc:$('#m-desc').value.trim() };
        if (!data.title) return toast('Title required');
        if (id) {
          const idx = allItems.findIndex(x => x.id === id);
          if (idx >= 0) allItems[idx] = { ...allItems[idx], ...data };
        } else {
          allItems.push({ id:uid(), ...data });
        }
        await store.setAsync('od_features', allItems); await renderFeatAdmin(); closeModal(); toast('Feature saved');
      };
    });
  }

  async function openSceneModal(id) {
    const items = await store.getAsync('od_scenes', SEED.od_scenes);
    const s = id ? items.find(x=>x.id===id) : { title:'', image:'' };
    openModal(`
      <h3>${id?'Edit':'Add'} Scene</h3>
      <div class="form-group"><label>Title</label><input id="m-title" value="${escapeAttr(s.title)}"></div>
      <div class="form-group"><label>Image URL</label><input id="m-image" value="${escapeAttr(s.image)}" placeholder="https://..."></div>
      <div class="modal-actions"><button class="btn btn-ghost" id="m-cancel">Cancel</button><button class="btn btn-primary" id="m-save">Save</button></div>
    `, m => {
      $('#m-cancel',m).onclick = closeModal;
      $('#m-save',m).onclick = async () => {
        const allItems = await store.getAsync('od_scenes', SEED.od_scenes);
        const data = { title:$('#m-title').value.trim(), image:$('#m-image').value.trim() };
        if (!data.title || !data.image) return toast('Title and image required');
        if (id) {
          const idx = allItems.findIndex(x => x.id === id);
          if (idx >= 0) allItems[idx] = { ...allItems[idx], ...data };
        } else {
          allItems.push({ id:uid(), ...data });
        }
        await store.setAsync('od_scenes', allItems); await renderScenesAdmin(); closeModal(); toast('Scene saved');
      };
    });
  }

  /* ---------- Utils ---------- */
  function escapeHtml(s){ return String(s??'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function escapeAttr(s){ return escapeHtml(s); }

  /* ---------- Boot ---------- */
  document.addEventListener('DOMContentLoaded', async () => {
    initNav();
    await renderAnnouncements();
    await initCarousel();
    await renderFeatures();
    await renderScenes();
    await renderAbout();
    await renderContact();
    await renderDownload();
    initLogin();
    initRegister();
    await initAdmin();
    initReveal();
  });
})();
