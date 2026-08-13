/* ───────────────────────────
   Consultant Dashboard — Logic
─────────────────────────── */

const token = localStorage.getItem('access_token');
let allClients = []; // cache for search filtering

// ── Auth guard ─────────────────────────────────────────────────

const fetchConsultantProfile = async (tkn, fallbackEmail) => {
  try {
    const res = await fetch('/auth/profile', {
      headers: { Authorization: `Bearer ${tkn}` },
    });
    if (res.ok) {
      const data = await res.json();
      let displayName = data.name ? data.name.trim() : '';
      if (!displayName && fallbackEmail) {
        const handle = fallbackEmail.split('@')[0];
        displayName = handle.charAt(0).toUpperCase() + handle.slice(1);
      }
      const greetingEl = document.getElementById('welcomeGreeting');
      if (greetingEl) {
        greetingEl.textContent = `Welcome, ${displayName || 'Consultant'}`;
      }
      const sidebarNameEl = document.getElementById('sidebarConsultantName');
      if (sidebarNameEl) {
        sidebarNameEl.textContent = displayName || 'Consultant';
      }
    }
  } catch (err) {
    console.error('Error fetching consultant profile:', err);
  }
};

const verifySession = async () => {
  if (!token) {
    window.location.replace('../index.html');
    return;
  }

  const meResponse = await fetch('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!meResponse.ok) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    window.location.replace('../index.html');
    return;
  }

  const meData = await meResponse.json().catch(() => ({}));
  if (meData.role !== 'consultant' && meData.role !== 'admin') {
    window.location.replace('../index.html');
    return;
  }

  // Check approval status for consultants
  if (meData.role === 'consultant') {
    await checkAccountStatus(token, meData.email);
  }

  // Fetch profile name and set greeting
  await fetchConsultantProfile(token, meData.email);

  // Load assigned clients
  await loadAssignedClients();
};

const checkAccountStatus = async (tkn, email) => {
  const overlay = document.getElementById('statusOverlay');
  const titleEl = document.getElementById('statusTitle');
  const msgEl = document.getElementById('statusMessage');
  const iconEl = document.getElementById('statusIcon');
  const emailEl = document.getElementById('statusEmail');
  const logoutBtn = document.getElementById('statusLogout');

  try {
    const res = await fetch('/auth/status', {
      headers: { Authorization: `Bearer ${tkn}` },
    });
    const data = await res.json().catch(() => ({}));

    if (data.status === 'pending') {
      if (emailEl) emailEl.textContent = email || '';
      if (overlay) overlay.classList.remove('hidden');
    } else if (data.status === 'rejected') {
      if (titleEl) titleEl.textContent = 'Account Rejected';
      if (msgEl) msgEl.textContent = 'Your account has been rejected by the administrator. Please contact support for assistance.';
      if (iconEl) {
        iconEl.classList.remove('pending-icon');
        iconEl.classList.add('rejected-icon');
        iconEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>`;
      }
      if (emailEl) emailEl.textContent = email || '';
      if (overlay) overlay.classList.remove('hidden');
    }
  } catch (_) {
    // On error, allow dashboard to load normally
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_role');
      window.location.href = '../index.html';
    });
  }
};

// ── Load assigned clients ──────────────────────────────────────

const loadAssignedClients = async () => {
  const grid = document.getElementById('assignedClientsGrid');
  if (!grid) return;

  try {
    const res = await fetch('/consultant/my-clients', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      grid.innerHTML = '<p class="empty-clients-msg">Failed to load clients.</p>';
      return;
    }
    const data = await res.json();
    allClients = data.clients || [];
    renderClients(allClients);
    renderReportCards(allClients);
  } catch (err) {
    grid.innerHTML = '<p class="empty-clients-msg">Error loading clients.</p>';
  }
};

const renderClients = (clients) => {
  const grid = document.getElementById('assignedClientsGrid');
  if (!grid) return;

  if (!clients.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
        <h3>No clients assigned yet</h3>
        <p>Your admin will assign client profiles to you. Check back later!</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = '';
  clients.forEach((client) => {
    const card = document.createElement('article');
    card.className = 'client-card';
    const displayName = client.name || client.email.split('@')[0];
    const skinLabel = client.skin_type || 'Not assessed';

    card.innerHTML = `
      <div class="client-card-header">
        <div class="client-avatar">${displayName.charAt(0).toUpperCase()}</div>
        <div>
          <h2>${displayName}</h2>
          <p class="client-skin-tag">${skinLabel}</p>
        </div>
      </div>
      <p class="client-email">${client.email}</p>
      <button class="client-btn">View profile</button>
    `;

    card.querySelector('.client-btn').addEventListener('click', () => openProfileModal(client));
    grid.appendChild(card);
  });
};

const renderReportCards = (clients) => {
  const container = document.getElementById('reportList');
  if (!container) return;

  if (!clients.length) {
    container.innerHTML = '<p class="empty-clients-msg">Assign clients to see their reports.</p>';
    return;
  }

  container.innerHTML = '';
  clients.forEach((client) => {
    const displayName = client.name || client.email.split('@')[0];
    const concerns = client.skin_concerns || 'No concerns listed';
    const card = document.createElement('article');
    card.className = 'report-card';
    card.innerHTML = `
      <div>
        <h3>${displayName}</h3>
        <p>${concerns}</p>
      </div>
      <button class="review-btn">Mark reviewed</button>
    `;
    card.querySelector('.review-btn').addEventListener('click', (e) => {
      e.currentTarget.textContent = 'Reviewed';
      e.currentTarget.disabled = true;
      e.currentTarget.style.background = '#16a34a';
    });
    container.appendChild(card);
  });
};

// ── Profile modal ──────────────────────────────────────────────

const openProfileModal = (client) => {
  const modal = document.getElementById('profileModal');
  const nameEl = document.getElementById('modalClientName');
  const emailEl = document.getElementById('modalClientEmail');
  const gridEl = document.getElementById('modalProfileGrid');
  if (!modal || !gridEl) return;

  const displayName = client.name || client.email.split('@')[0];
  if (nameEl) nameEl.textContent = displayName;
  if (emailEl) emailEl.textContent = client.email;

  const imgWrapper = document.getElementById('modalClientImageWrapper');
  const imgEl = document.getElementById('modalClientImage');
  if (client.image_url) {
    if (imgEl) imgEl.src = client.image_url;
    if (imgWrapper) imgWrapper.classList.remove('hidden');
  } else {
    if (imgWrapper) imgWrapper.classList.add('hidden');
  }

  const risksText = client.risks && client.risks.length
    ? client.risks.map(r => `${r.title} (${r.level})`).join(', ')
    : 'No high risks identified';

  const fields = [
    { label: 'AI Health Score', value: `${client.skin_health_score || 0} / 100` },
    { label: 'Identified Risk Factors', value: risksText },
    { label: 'Skin Type', value: client.skin_type },
    { label: 'Age Group', value: client.age_group },
    { label: 'Skin Concerns', value: client.skin_concerns },
    { label: 'Allergies', value: client.allergies },
    { label: 'Sensitivities', value: client.sensitivities },
    { label: 'Lifestyle Habits', value: client.lifestyle_habits },
    { label: 'Sleep Quality', value: client.sleep_quality },
    { label: 'Water Intake', value: client.water_intake },
    { label: 'Environmental Exposure', value: client.environmental_exposure },
  ];

  gridEl.innerHTML = fields.map((f) => `
    <div class="profile-field">
      <span class="profile-field-label">${f.label}</span>
      <span class="profile-field-value">${f.value || '—'}</span>
    </div>
  `).join('');

  modal.classList.remove('hidden');
};

const closeProfileModal = () => {
  const modal = document.getElementById('profileModal');
  if (modal) modal.classList.add('hidden');
};

document.getElementById('closeProfileModal')?.addEventListener('click', closeProfileModal);
document.querySelector('.profile-modal-backdrop')?.addEventListener('click', closeProfileModal);

// ── Search ─────────────────────────────────────────────────────

const filterClients = () => {
  const query = (document.getElementById('clientSearch')?.value || '').toLowerCase().trim();
  if (!query) {
    renderClients(allClients);
    return;
  }
  const filtered = allClients.filter((c) =>
    (c.name || '').toLowerCase().includes(query) ||
    (c.email || '').toLowerCase().includes(query) ||
    (c.skin_type || '').toLowerCase().includes(query)
  );
  renderClients(filtered);
};

document.getElementById('clientSearchBtn')?.addEventListener('click', filterClients);
document.getElementById('clientSearch')?.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') filterClients();
});

// ── Other button handlers ──────────────────────────────────────

document.querySelectorAll('.assign-btn').forEach((button) => {
  button.addEventListener('click', () => {
    alert('Recommendation assigned successfully.');
  });
});

const headerLogout = document.getElementById('headerLogout');
if (headerLogout) {
  headerLogout.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    window.location.href = '../index.html';
  });
}

// ── Section View Navigation (Admin Dashboard Style) ─────────

const sidebar = document.getElementById('sidebar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');

const toggleSidebar = (show) => {
  if (sidebar && sidebarBackdrop) {
    if (show) {
      sidebar.classList.add('open');
      sidebarBackdrop.classList.add('active');
    } else {
      sidebar.classList.remove('open');
      sidebarBackdrop.classList.remove('active');
    }
  }
};

if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => toggleSidebar(true));
if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', () => toggleSidebar(false));
if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', () => toggleSidebar(false));

const sections = {
  clients: { el: document.getElementById('section-clients'), nav: document.getElementById('navClients'), title: 'Client Profiles', sub: 'Your assigned clients' },
  reports: { el: document.getElementById('section-reports'), nav: document.getElementById('navReports'), title: 'Skin Assessment Reports', sub: 'Recent client assessments' },
  progress: { el: document.getElementById('section-progress'), nav: document.getElementById('navProgress'), title: 'Progress Monitoring', sub: 'Track client improvements' },
  recommendations: { el: document.getElementById('section-recommendations'), nav: document.getElementById('navRecommendations'), title: 'Recommendation Management', sub: 'Assigned routines and products' },
};

const showSection = (key) => {
  const targetKey = sections[key] ? key : 'clients';
  Object.entries(sections).forEach(([k, s]) => {
    const isActive = (k === targetKey);
    if (s.el) s.el.classList.toggle('active', isActive);
    if (s.nav) s.nav.classList.toggle('active', isActive);
  });

  const activeSec = sections[targetKey];
  const titleEl = document.getElementById('pageTitle');
  const subEl = document.getElementById('pageSubtitle');
  if (titleEl && activeSec) titleEl.textContent = activeSec.title;
  if (subEl && activeSec) subEl.textContent = activeSec.sub;
  window.scrollTo({ top: 0 });
};

// Bind navigation clicks
Object.entries(sections).forEach(([key, s]) => {
  if (s.nav) {
    s.nav.addEventListener('click', (e) => {
      e.preventDefault();
      showSection(key);
      toggleSidebar(false);
      window.location.hash = key;
    });
  }
});

// Restore section view from URL hash on load or hashchange
const initSectionFromHash = () => {
  const hash = window.location.hash.replace('#', '').trim();
  if (hash && sections[hash]) {
    showSection(hash);
  } else {
    showSection('clients');
  }
};

window.addEventListener('hashchange', initSectionFromHash);

// ── Boot ─────────────────────────────────────────────────────────

verifySession();
initSectionFromHash();
