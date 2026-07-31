/* ───────────────────────────
   Admin Dashboard — Logic
─────────────────────────── */

const token = localStorage.getItem('access_token');

// ── Auth guard ─────────────────────────────────────────────────

const verifyAdmin = async () => {
  if (!token) {
    window.location.replace('../index.html');
    return;
  }

  const res = await fetch('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    clearSession();
    return;
  }

  const data = await res.json().catch(() => ({}));
  if (data.role !== 'admin') {
    clearSession();
    return;
  }

  const emailEl = document.getElementById('adminEmail');
  if (emailEl) emailEl.textContent = data.email || 'Administrator';

  // Load initial data
  await loadAll();
};

const clearSession = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_role');
  window.location.replace('../index.html');
};

// ── Navigation ─────────────────────────────────────────────────

const sections = {
  overview: { el: document.getElementById('section-overview'), nav: document.getElementById('navOverview'), title: 'Overview', sub: 'Welcome back, Administrator' },
  approvals: { el: document.getElementById('section-approvals'), nav: document.getElementById('navApprovals'), title: 'Approvals', sub: 'Manage pending account requests' },
  accounts: { el: document.getElementById('section-accounts'), nav: document.getElementById('navAccounts'), title: 'All Accounts', sub: 'View all users and consultants' },
};

const showSection = (key) => {
  Object.entries(sections).forEach(([k, s]) => {
    s.el?.classList.toggle('active', k === key);
    s.nav?.classList.toggle('active', k === key);
  });
  const s = sections[key];
  const titleEl = document.getElementById('pageTitle');
  const subEl = document.getElementById('pageSubtitle');
  if (titleEl) titleEl.textContent = s.title;
  if (subEl) subEl.textContent = s.sub;
};

document.querySelectorAll('.nav-item').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(link.dataset.section);
  });
});

// ── Tab switching (Approvals) ───────────────────────────────────

const setupTabs = (tabBar, panelPrefix) => {
  tabBar.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      tabBar.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll(`[id^="${panelPrefix}"]`).forEach((p) => p.classList.remove('active'));
      const target = document.getElementById(`${panelPrefix}${capitalize(btn.dataset.tab)}`);
      if (target) target.classList.add('active');
    });
  });
};

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Approvals tabs
const approvalTabBar = document.querySelector('#section-approvals .tab-bar');
if (approvalTabBar) setupTabs(approvalTabBar, 'tabPanel');

// Accounts tabs
const accountsTabBar = document.querySelector('#section-accounts .tab-bar');
if (accountsTabBar) setupTabs(accountsTabBar, 'tabPanelAll');

// ── API helpers ────────────────────────────────────────────────

const apiFetch = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
};

// ── Toast ──────────────────────────────────────────────────────

let toastTimer = null;

const showToast = (msg, type = 'success') => {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.className = 'toast hidden'; }, 3500);
};

// ── Formatters ─────────────────────────────────────────────────

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const statusBadge = (s) =>
  `<span class="badge badge-${s}">${s}</span>`;

const getName = (item) => {
  if (item && item.name && item.name.trim()) {
    return item.name.trim();
  }
  if (item && item.email) {
    const handle = item.email.split('@')[0];
    return handle
      .replace(/[._-]/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((w) => capitalize(w))
      .join(' ');
  }
  return '—';
};

// ── Approval actions ───────────────────────────────────────────

const approveAccount = async (role, id, btn) => {
  btn.disabled = true;
  try {
    await apiFetch(`/admin/approve/${role}/${id}`, { method: 'POST' });
    showToast(`${capitalize(role)} approved successfully!`, 'success');
    await loadAll();
  } catch (err) {
    showToast(err.message, 'error');
    btn.disabled = false;
  }
};

const rejectAccount = async (role, id, btn) => {
  btn.disabled = true;
  try {
    await apiFetch(`/admin/reject/${role}/${id}`, { method: 'POST' });
    showToast(`${capitalize(role)} rejected.`, 'error');
    await loadAll();
  } catch (err) {
    showToast(err.message, 'error');
    btn.disabled = false;
  }
};

// ── Build approval item ─────────────────────────────────────────

const buildApprovalItem = (item, role) => {
  const div = document.createElement('div');
  div.className = 'approval-item';
  div.innerHTML = `
    <div class="approval-info">
      <p class="approval-name">${getName(item)}</p>
      <p class="approval-email">${item.email}</p>
      <p class="approval-date">Registered: ${formatDate(item.created_at)}</p>
    </div>
    <div class="approval-actions">
      <button class="approve-btn" id="approve-${role}-${item.id}">✓ Approve</button>
      <button class="reject-btn"  id="reject-${role}-${item.id}">✕ Reject</button>
    </div>
  `;
  div.querySelector('.approve-btn').addEventListener('click', (e) => approveAccount(role, item.id, e.currentTarget));
  div.querySelector('.reject-btn').addEventListener('click', (e) => rejectAccount(role, item.id, e.currentTarget));
  return div;
};

// ── Build all-accounts table ────────────────────────────────────

const buildAccountsTable = (items) => {
  if (!items.length) return '<p class="empty-msg">No accounts found.</p>';
  const rows = items.map((u) => `
    <tr>
      <td>${getName(u)}</td>
      <td>${u.email}</td>
      <td>${formatDate(u.created_at)}</td>
      <td>${statusBadge(u.status)}</td>
    </tr>
  `).join('');
  return `
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Registered</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
};

// ── Overview pending preview ────────────────────────────────────

const buildOverviewPending = (users, consultants) => {
  const all = [
    ...users.map((u) => ({ ...u, role: 'user' })),
    ...consultants.map((c) => ({ ...c, role: 'consultant' })),
  ].slice(0, 5);

  if (!all.length) return '<p class="empty-msg">No pending accounts. All caught up!</p>';

  const rows = all.map((a) => `
    <tr>
      <td>${getName(a)}</td>
      <td>${a.email}</td>
      <td><span class="badge badge-${a.role === 'user' ? 'approved' : 'pending'}" style="background:rgba(99,102,241,0.15);color:#818cf8">${capitalize(a.role)}</span></td>
      <td>${formatDate(a.created_at)}</td>
      <td>${statusBadge('pending')}</td>
    </tr>
  `).join('');

  return `
    <table>
      <thead>
        <tr><th>Name</th><th>Email</th><th>Role</th><th>Registered</th><th>Status</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
};

// ── Load all data ───────────────────────────────────────────────

const loadAll = async () => {
  try {
    const [pendingData, allData] = await Promise.all([
      apiFetch('/admin/pending'),
      apiFetch('/admin/all'),
    ]);

    const pendingUsers = pendingData.users || [];
    const pendingConsultants = pendingData.consultants || [];
    const allUsers = allData.users || [];
    const allConsultants = allData.consultants || [];

    const totalPending = pendingUsers.length + pendingConsultants.length;
    const totalApproved =
      [...allUsers, ...allConsultants].filter((a) => a.status === 'approved').length;

    // Stats
    setText('statTotalUsers', allUsers.length);
    setText('statTotalConsultants', allConsultants.length);
    setText('statPending', totalPending);
    setText('statApproved', totalApproved);

    // Badge
    const badge = document.getElementById('pendingBadge');
    if (badge) {
      badge.textContent = totalPending;
      badge.classList.toggle('hidden', totalPending === 0);
    }

    // Tab counts
    setText('tabUserCount', pendingUsers.length);
    setText('tabConsultantCount', pendingConsultants.length);

    // Overview pending preview
    setHtml('overviewPendingList', buildOverviewPending(pendingUsers, pendingConsultants));

    // Pending approval lists
    const pendingUsersEl = document.getElementById('pendingUsersList');
    const pendingConsEl = document.getElementById('pendingConsultantsList');

    if (pendingUsersEl) {
      pendingUsersEl.innerHTML = '';
      if (pendingUsers.length === 0) {
        pendingUsersEl.innerHTML = '<p class="empty-msg">No pending user requests.</p>';
      } else {
        pendingUsers.forEach((u) => pendingUsersEl.appendChild(buildApprovalItem(u, 'user')));
      }
    }

    if (pendingConsEl) {
      pendingConsEl.innerHTML = '';
      if (pendingConsultants.length === 0) {
        pendingConsEl.innerHTML = '<p class="empty-msg">No pending consultant requests.</p>';
      } else {
        pendingConsultants.forEach((c) => pendingConsEl.appendChild(buildApprovalItem(c, 'consultant')));
      }
    }

    // All accounts tables
    setHtml('allUsersList', buildAccountsTable(allUsers));
    setHtml('allConsultantsList', buildAccountsTable(allConsultants));

  } catch (err) {
    showToast('Failed to load data: ' + err.message, 'error');
  }
};

const setText = (id, val) => {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
};

const setHtml = (id, html) => {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
};

// ── Buttons ─────────────────────────────────────────────────────

document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_role');
  window.location.href = '../index.html';
});

document.getElementById('refreshBtn')?.addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  btn.classList.add('spinning');
  await loadAll();
  setTimeout(() => btn.classList.remove('spinning'), 600);
});

document.getElementById('goToApprovals')?.addEventListener('click', () => {
  showSection('approvals');
});

// ── Boot ─────────────────────────────────────────────────────────

verifyAdmin();
