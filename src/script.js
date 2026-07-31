// ─── API Configuration ────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:3000/api';

// ─── Token Management ─────────────────────────────────────────────────────────
const getToken  = ()        => localStorage.getItem('accessToken');
const setToken  = (t)       => localStorage.setItem('accessToken', t);
const getUser   = ()        => JSON.parse(localStorage.getItem('currentUser') || 'null');
const setUser   = (u)       => localStorage.setItem('currentUser', JSON.stringify(u));
const clearAuth = ()        => { localStorage.removeItem('accessToken'); localStorage.removeItem('currentUser'); };

// ─── Authenticated fetch helper ───────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(API_BASE + endpoint, { ...options, headers, credentials: 'include' });

  // Try token refresh on 401
  if (res.status === 401) {
    const refreshRes = await fetch(API_BASE + '/auth/refresh', { method: 'POST', credentials: 'include' });
    if (refreshRes.ok) {
      const data = await refreshRes.json();
      setToken(data.accessToken);
      headers['Authorization'] = `Bearer ${data.accessToken}`;
      res = await fetch(API_BASE + endpoint, { ...options, headers, credentials: 'include' });
    } else {
      clearAuth();
      window.location.href = '/login.html';
      return;
    }
  }

  return res;
}

// ─── Auth guard — call on protected pages ─────────────────────────────────────
async function requireAuth(allowedRoles = []) {
  const token = getToken();
  const user  = getUser();

  if (!token || !user) {
    window.location.href = 'login.html';
    return null;
  }

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    alert(`Access denied. This page requires: ${allowedRoles.join(' or ')}`);
    window.location.href = user.role === 'admin'
      ? 'admin_dashboard.html'
      : user.role === 'consultant'
      ? 'consultant_dashboard.html'
      : 'user_dashboard.html';
    return null;
  }

  return user;
}

// ─── Login form handler ───────────────────────────────────────────────────────
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn      = loginForm.querySelector('button[type="submit"]');
    const errorEl  = document.getElementById('loginError');

    btn.textContent = 'Signing in...';
    btn.disabled    = true;
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('show');
    }

    try {
      const res  = await fetch(API_BASE + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (errorEl) {
          errorEl.textContent = data.message || 'Login failed.';
          errorEl.classList.add('show');
        }
        btn.textContent = 'Sign In to Dashboard';
        btn.disabled    = false;
        return;
      }

      setToken(data.accessToken);
      setUser(data.user);

      // Redirect by role
      const dest = {
        admin:      'admin_dashboard.html',
        consultant: 'consultant_dashboard.html',
        user:       'user_dashboard.html',
      }[data.user.role] || 'user_dashboard.html';

      window.location.href = dest;

    } catch (err) {
      if (errorEl) {
        errorEl.textContent = 'Cannot connect to server. Is the backend running?';
        errorEl.classList.add('show');
      }
      btn.textContent = 'Sign In to Dashboard';
      btn.disabled    = false;
    }
  });
}

// ─── Register form handler ────────────────────────────────────────────────────
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name     = document.getElementById('regName').value;
    const email    = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const role     = document.getElementById('regRole').value;
    const btn      = registerForm.querySelector('button[type="submit"]');
    const errorEl  = document.getElementById('registerError');

    btn.textContent = 'Creating account...';
    btn.disabled    = true;
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('show');
    }

    try {
      const res  = await fetch(API_BASE + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        const msg = data.errors ? data.errors.map(e => e.msg).join(', ') : data.message;
        if (errorEl) {
          errorEl.textContent = msg || 'Registration failed.';
          errorEl.classList.add('show');
        }
        btn.textContent = 'Create Account';
        btn.disabled    = false;
        return;
      }

      setToken(data.accessToken);
      setUser(data.user);

      const dest = {
        admin:      'admin_dashboard.html',
        consultant: 'consultant_dashboard.html',
        user:       'user_dashboard.html',
      }[data.user.role] || 'user_dashboard.html';

      window.location.href = dest;

    } catch (err) {
      if (errorEl) {
        errorEl.textContent = 'Cannot connect to server. Is the backend running?';
        errorEl.classList.add('show');
      }
      btn.textContent = 'Create Account';
      btn.disabled    = false;
    }
  });
}

// ─── Logout ───────────────────────────────────────────────────────────────────
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await apiFetch('/auth/logout', { method: 'POST' });
    clearAuth();
    window.location.href = 'login.html';
  });
}
