/* ============================================================
   SkinSight — shared client behaviour
   Talks to the Node.js/Express + PostgreSQL backend in /skinsight-backend.
   Session = JWT stored in localStorage under 'skinsight_token',
   plus a lightweight cached user object under 'skinsight_session'.
   ============================================================ */

const API_BASE_URL = 'http://localhost:5000/api';
const SKINSIGHT_TOKEN_KEY = 'skinsight_token';
const SKINSIGHT_SESSION_KEY = 'skinsight_session';

/* ---------- session ---------- */
function getToken(){ return localStorage.getItem(SKINSIGHT_TOKEN_KEY); }
function getSession(){
  try{ return JSON.parse(localStorage.getItem(SKINSIGHT_SESSION_KEY)); }
  catch(e){ return null; }
}
function setSession(token, user){
  localStorage.setItem(SKINSIGHT_TOKEN_KEY, token);
  localStorage.setItem(SKINSIGHT_SESSION_KEY, JSON.stringify(user));
}
function clearSession(){
  localStorage.removeItem(SKINSIGHT_TOKEN_KEY);
  localStorage.removeItem(SKINSIGHT_SESSION_KEY);
}
function requireAuth(){
  const s = getSession();
  if(!s || !getToken()){ window.location.href = 'login.html'; }
  return s;
}
function roleHome(role){
  switch(role){
    case 'admin': return 'admin.html';
    case 'dermatologist': return 'dermatologist.html';
    case 'consultant': return 'skincare-consultant.html';
    default: return 'user.html';
  }
}

/* ---------- authenticated fetch helper ---------- */
async function apiFetch(path, options = {}){
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if(!res.ok){ throw new Error(data.error || 'Request failed'); }
  return data;
}

/* ---------- nav active-state ---------- */
document.addEventListener('DOMContentLoaded', async () => {
  const here = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar nav a, .nav-public .links a').forEach(a => {
    if(a.getAttribute('href') === here) a.classList.add('active');
  });

  paintSessionChip();
  document.querySelectorAll('[data-logout]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{ e.preventDefault(); clearSession(); window.location.href='login.html'; });
  });

  initRings();

  if (document.getElementById('profileForm')) attachProfileForm();
  if (document.getElementById('skinProfileForm')) attachSkinProfileForm();
  if (document.getElementById('lifestyleForm')) attachLifestyleForm();
  if (document.getElementById('sleepForm')) attachSleepForm();
  if (document.getElementById('hydrationForm')) attachHydrationForm();
  if (document.getElementById('envForm')) attachEnvironmentForm();

  if (window.location.pathname.endsWith('user.html') || window.location.pathname.endsWith('admin.html') || window.location.pathname.endsWith('dermatologist.html') || window.location.pathname.endsWith('skincare-consultant.html')) {
    if (!getToken()) {
      window.location.href = 'login.html';
      return;
    }
    try {
      const session = getSession();
      if (session) paintSessionChip();
      await loadDashboardData();
    } catch (err) {
      console.error(err);
    }
  }
});

function paintSessionChip(){
  const chip = document.querySelector('[data-user-chip]');
  if(!chip) return;
  const s = getSession();
  if(!s) return;
  const initials = (s.name || 'U').split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase();
  chip.querySelector('.avatar').textContent = initials;
  const nameEl = chip.querySelector('[data-user-name]');
  if(nameEl) nameEl.textContent = s.name || 'User';
  const roleBadge = document.querySelector('.role-badge');
  if(roleBadge) roleBadge.textContent = (s.role || 'User').charAt(0).toUpperCase() + (s.role || 'User').slice(1);
}

/* ---------- auth form handling ---------- */
function attachAuthForm(formEl, {mode}){
  formEl.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const errorEl = formEl.querySelector('.form-error');
    const data = Object.fromEntries(new FormData(formEl).entries());
    const submitBtn = formEl.querySelector('button[type="submit"]');
    if(errorEl) errorEl.style.display = 'none';

    if(mode === 'register'){
      if(!data.name || !data.email || !data.password){
        showError(errorEl, 'Fill in every field to create your profile.'); return;
      }
      if(data.password.length < 8){
        showError(errorEl, 'Use at least 8 characters for your password.'); return;
      }
      try{
        if(submitBtn) submitBtn.disabled = true;
        const res = await apiFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name: data.name, email: data.email, password: data.password, role: data.role || 'user' }),
        });
        setSession(res.token, res.user);
        window.location.href = roleHome(res.user.role);
      }catch(err){
        showError(errorEl, err.message || 'Registration failed.');
      }finally{
        if(submitBtn) submitBtn.disabled = false;
      }
      return;
    }

    if(mode === 'login'){
      if(!data.email || !data.password){
        showError(errorEl, 'Enter your email and password.'); return;
      }
      try{
        if(submitBtn) submitBtn.disabled = true;
        const res = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: data.email, password: data.password }),
        });
        setSession(res.token, res.user);
        window.location.href = roleHome(res.user.role);
      }catch(err){
        showError(errorEl, err.message || 'Login failed.');
      }finally{
        if(submitBtn) submitBtn.disabled = false;
      }
      return;
    }
  });
}
function showError(el, msg){
  if(!el) return;
  el.textContent = msg;
  el.style.display = 'block';
}

async function loadDashboardData(){
  const path = window.location.pathname.endsWith('admin.html') ? '/dashboard/admin' :
    window.location.pathname.endsWith('dermatologist.html') ? '/dashboard/dermatologist' :
    window.location.pathname.endsWith('skincare-consultant.html') ? '/dashboard/consultant' :
    '/dashboard/user';
  const data = await apiFetch(path);

  if (window.location.pathname.endsWith('admin.html')) {
    const cards = document.querySelectorAll('.card .mono');
    if (cards[0]) cards[0].textContent = data.totalUsers?.toLocaleString() || '0';
    if (cards[1]) cards[1].textContent = data.totalDermatologists?.toLocaleString() || '0';
    const tbody = document.querySelector('.data-table tbody');
    if (tbody) {
      tbody.innerHTML = '';
      const rows = [];
      if (data.patients) {
        data.patients.forEach((u) => rows.push(`<tr><td>${u.name}</td><td>${u.email}</td><td><span class="tag tag-clay">User</span></td><td><span class="tag tag-teal">Active</span></td></tr>`));
      }
      tbody.innerHTML = rows.join('');
    }
  }

  if (window.location.pathname.endsWith('user.html')) {
    const cards = document.querySelectorAll('.card .num');
    if (cards[0]) cards[0].textContent = `${(data.lastSleep?.duration_hours || 0).toFixed(1)}${cards[0].textContent.includes('hrs') ? ' hrs' : ''}`;
    if (cards[1]) cards[1].textContent = `${Math.round((data.todayHydrationMl || 0) / 1000)}${cards[1].textContent.includes('L') ? '.0 L' : ''}`;
  }
}

async function attachProfileForm(){
  const form = document.getElementById('profileForm');
  if (!form) return;
  const nameInput = form.querySelector('#fullName');
  const emailInput = form.querySelector('#email');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = { name: nameInput.value };
    await apiFetch('/profile', { method: 'PUT', body: JSON.stringify(payload) });
    const session = getSession();
    session.name = nameInput.value;
    setSession(getToken(), session);
    paintSessionChip();
  });
}

async function attachSkinProfileForm(){
  const form = document.getElementById('skinProfileForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      skinType: form.querySelector('#skinType').value,
      ageGroup: form.querySelector('#ageGroup').value,
      skinConcerns: ['Post-acne marks'],
      allergies: form.querySelector('#allergies').value,
      sensitivities: form.querySelector('#sensitivities').value,
      routine: form.querySelector('#routine').value,
    };
    await apiFetch('/skin-profile', { method: 'PUT', body: JSON.stringify(payload) });
  });
}

async function attachLifestyleForm(){
  const form = document.getElementById('lifestyleForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      dietQuality: form.querySelector('#diet').value,
      stressLevel: Number(form.querySelector('#stress').value),
      activityMinutes: Number(form.querySelector('#activity').value || 0),
      substanceUse: form.querySelector('#smoking').value,
    };
    await apiFetch('/tracking/lifestyle', { method: 'POST', body: JSON.stringify(payload) });
  });
}

async function attachSleepForm(){
  const form = document.getElementById('sleepForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      bedtime: form.querySelector('#bedtime').value,
      wakeTime: form.querySelector('#waketime').value,
      durationHours: 7.2,
      quality: form.querySelector('#quality').value,
    };
    await apiFetch('/tracking/sleep', { method: 'POST', body: JSON.stringify(payload) });
  });
}

async function attachHydrationForm(){
  const form = document.getElementById('hydrationForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      amountMl: Number(form.querySelector('#amount').value || 0),
      source: form.querySelector('#source').value,
    };
    await apiFetch('/tracking/hydration', { method: 'POST', body: JSON.stringify(payload) });
  });
}

async function attachEnvironmentForm(){
  const form = document.getElementById('envForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      location: form.querySelector('#location').value,
      durationMinutes: Number(form.querySelector('#duration').value || 0),
      spfApplied: form.querySelector('#spf').value === 'Yes',
      timeOfDay: form.querySelector('#timeOfDay').value,
      uvIndex: 7.5,
      aqi: 142,
      humidity: 45,
    };
    await apiFetch('/tracking/environment', { method: 'POST', body: JSON.stringify(payload) });
  });
}

/* ---------- oauth ---------- */
function attachOAuthButton(btnEl){
  btnEl.addEventListener('click', ()=>{
    // Full redirect to the backend, which redirects to Google, then back to
    // oauth-callback.html?token=... on success.
    window.location.href = `${API_BASE_URL}/auth/google`;
  });
}

/* ---------- Exposure Ring renderer ----------
   <svg class="ring-svg" data-ring data-value="72" data-color="teal" ...></svg>
   fills a concentric progress ring from a 0-100 value.          */
function initRings(){
  document.querySelectorAll('[data-ring]').forEach(svg=>{
    const value = Math.max(0, Math.min(100, Number(svg.dataset.value || 0)));
    const color = getComputedStyle(document.documentElement).getPropertyValue('--' + (svg.dataset.color || 'teal')).trim() || '#2E7D6B';
    const r = 42, circumference = 2 * Math.PI * r;
    const offset = circumference * (1 - value/100);
    svg.innerHTML = `
      <circle class="ring-track" cx="50" cy="50" r="${r}"></circle>
      <circle class="ring-value" cx="50" cy="50" r="${r}"
        stroke="${color}"
        stroke-dasharray="${circumference}"
        stroke-dashoffset="${offset}"></circle>`;
    svg.setAttribute('viewBox', '0 0 100 100');
  });
}

/* ---------- simple local log helpers used by tracking pages ---------- */
function pushLogEntry(storeKey, entry){
  const list = JSON.parse(localStorage.getItem(storeKey) || '[]');
  list.unshift({ ...entry, at: new Date().toISOString() });
  localStorage.setItem(storeKey, JSON.stringify(list.slice(0, 20)));
  return list;
}
function readLog(storeKey){
  return JSON.parse(localStorage.getItem(storeKey) || '[]');
}
