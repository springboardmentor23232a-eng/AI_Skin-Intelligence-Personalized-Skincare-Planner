/* ==================== GLOWSENSE AI — COMMON UTILITIES ==================== */

import { authAPI } from './api.js';

/* ---- Toast notifications ---- */
export function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = {
    success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M6 10l2.5 2.5L14 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    error: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    warning: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M10 6v4M10 13h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    info: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M10 9v4M10 7h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  };

  const colors = { success: 'var(--color-success)', error: 'var(--color-error)', warning: 'var(--color-warning)', info: 'var(--color-info)' };

  toast.innerHTML = `<span class="toast-icon" style="color:${colors[type]}">${icons[type]}</span><span class="toast-message">${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toast-slide-in 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/* ---- Loading overlay ---- */
export function showLoading(text = 'Loading...', subtext = '') {
  let overlay = document.querySelector('.loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `
    <div class="spinner"></div>
    <div class="loading-text">${text}</div>
    ${subtext ? `<div class="loading-subtext">${subtext}</div>` : ''}
  `;
  overlay.style.display = 'flex';
}

export function hideLoading() {
  const overlay = document.querySelector('.loading-overlay');
  if (overlay) overlay.style.display = 'none';
}

/* ---- Date formatting ---- */
export function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* ---- Initials ---- */
export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

/* ---- Greeting based on time ---- */
export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 18) return 'Good Afternoon';
  return 'Good Evening';
}

/* ---- Auth guard ---- */
export async function requireAuth(allowedRoles = []) {
  const current = await authAPI.getCurrentUser();
  if (!current) {
    window.location.href = '/login.html';
    return null;
  }

  const profile = await authAPI.getCurrentProfile();
  if (!profile) {
    window.location.href = '/login.html';
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    window.location.href = getDashboardUrl(profile.role);
    return null;
  }

  return { user: current.user, profile, isDemo: current.demo };
}

/* ---- Get dashboard URL for role ---- */
export function getDashboardUrl(role) {
  const urls = {
    user: '/user/dashboard.html',
    consultant: '/consultant/dashboard.html',
    dermatologist: '/dermatologist/dashboard.html',
    admin: '/admin/dashboard.html',
  };
  return urls[role] || '/login.html';
}

/* ---- Sidebar template ---- */
export function getSidebar(role, activePage) {
  const menus = {
    user: [
      { label: 'Dashboard', href: '/user/dashboard.html', icon: 'home', key: 'dashboard' },
      { label: 'Profile', href: '/user/profile.html', icon: 'user', key: 'profile' },
      { label: 'Assessment', href: '/user/assessment.html', icon: 'scan', key: 'assessment' },
      { label: 'History', href: '/user/history.html', icon: 'clock', key: 'history' },
      { label: 'Concerns', href: '/user/concerns.html', icon: 'alert', key: 'concerns' },
      { label: 'Risk Factors', href: '/user/risks.html', icon: 'shield', key: 'risks' },
      { label: 'Recommendations', href: '/user/recommendations.html', icon: 'sparkles', key: 'recommendations' },
      { label: 'Skincare Routine', href: '/user/routine.html', icon: 'routine', key: 'routine' },
      { label: 'Routine Feedback', href: '/user/feedback.html', icon: 'feedback', key: 'feedback' },
      { label: 'Ingredient Intelligence', href: '/user/ingredients.html', icon: 'beaker', key: 'ingredients' },
      { label: 'Settings', href: '/user/settings.html', icon: 'settings', key: 'settings' },
    ],
    consultant: [
      { label: 'Dashboard', href: '/consultant/dashboard.html', icon: 'home', key: 'dashboard' },
      { label: 'Assigned Users', href: '/consultant/users.html', icon: 'users', key: 'users' },
      { label: 'Assessments', href: '/consultant/assessments.html', icon: 'clipboard', key: 'assessments' },
      { label: 'Consultations', href: '/consultant/consultations.html', icon: 'message', key: 'consultations' },
      { label: 'Profile', href: '/consultant/profile.html', icon: 'user', key: 'profile' },
    ],
    dermatologist: [
      { label: 'Dashboard', href: '/dermatologist/dashboard.html', icon: 'home', key: 'dashboard' },
      { label: 'Patients', href: '/dermatologist/patients.html', icon: 'users', key: 'patients' },
      { label: 'Assessments', href: '/dermatologist/assessments.html', icon: 'clipboard', key: 'assessments' },
      { label: 'High-Risk Cases', href: '/dermatologist/high-risk.html', icon: 'alert', key: 'high-risk' },
      { label: 'Consultations', href: '/dermatologist/consultations.html', icon: 'message', key: 'consultations' },
      { label: 'Profile', href: '/dermatologist/profile.html', icon: 'user', key: 'profile' },
    ],
    admin: [
      { label: 'Dashboard', href: '/admin/dashboard.html', icon: 'home', key: 'dashboard' },
      { label: 'Users', href: '/admin/users.html', icon: 'users', key: 'users' },
      { label: 'Consultants', href: '/admin/consultants.html', icon: 'user-check', key: 'consultants' },
      { label: 'Dermatologists', href: '/admin/dermatologists.html', icon: 'stethoscope', key: 'dermatologists' },
      { label: 'Assessments', href: '/admin/assessments.html', icon: 'clipboard', key: 'assessments' },
      { label: 'Statistics', href: '/admin/statistics.html', icon: 'chart', key: 'statistics' },
      { label: 'Settings', href: '/admin/settings.html', icon: 'settings', key: 'settings' },
    ],
  };

  const icons = {
    home: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 10l7-6 7 6v7a1 1 0 01-1 1h-3v-5H7v5H4a1 1 0 01-1-1v-7z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    user: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M4 17c0-3 3-5 6-5s6 2 6 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    users: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="8" cy="7" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M2 17c0-3 3-5 6-5s6 2 6 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M14 5a3 3 0 010 5M16 17c0-2-1-3.5-2.5-4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    scan: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4h3M4 4v3M16 4h-3M16 4v3M4 16h3M4 16v-3M16 16h-3M16 16v-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="10" cy="10" r="2" stroke="currentColor" stroke-width="1.5"/></svg>',
    clock: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M10 6v4l3 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    alert: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3l8 14H2L10 3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M10 9v3M10 14h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    shield: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3l6 2v5c0 4-3 6-6 7-3-1-6-3-6-7V5l6-2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    sparkles: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3l1.5 4L16 8.5 11.5 10 10 14l-1.5-4L4 8.5 8.5 7 10 3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    settings: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4 4l1.5 1.5M14.5 14.5L16 16M16 4l-1.5 1.5M5.5 14.5L4 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    clipboard: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="5" y="3" width="10" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M8 3v2h4V3M7 8h6M7 11h6M7 14h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    message: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H8l-4 3v-3H5a2 2 0 01-2-2V5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    usercheck: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="8" cy="7" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M2 17c0-3 3-5 6-5s6 2 6 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M14 7l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    stethoscope: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 3v5a4 4 0 008 0V3M5 3H3M5 3h2M13 3h-2M13 3h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 13v2a4 4 0 008 0v-1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="17" cy="11" r="2" stroke="currentColor" stroke-width="1.5"/></svg>',
    chart: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 17h14M5 17V10M9 17V6M13 17v-8M17 17V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    routine: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5"/><path d="M10 6v4l3 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M6 3v2M14 3v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    feedback: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H8l-4 3v-3H5a2 2 0 01-2-2V5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M7 8h6M7 11h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    beaker: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8 3v5L4 16a1 1 0 001 1h10a1 1 0 001-1l-4-8V3M6 3h8M8 10h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };

  const links = menus[role] || [];
  const linksHtml = links.map(link => `
    <a href="${link.href}" class="sidebar-link ${link.key === activePage ? 'active' : ''}">
      ${icons[link.icon] || ''}
      <span>${link.label}</span>
    </a>
  `).join('');

  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <a href="${getDashboardUrl(role)}" class="nav-logo">
          <span class="logo-icon">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="currentColor" stroke-width="1.5"/>
              <path d="M9 14.5l3.5 3.5L19 10.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="logo-text">GlowSense<span class="logo-accent">AI</span></span>
        </a>
      </div>
      <nav class="sidebar-nav">
        <div class="sidebar-section">
          <div class="sidebar-section-label">Menu</div>
          ${linksHtml}
        </div>
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user" id="sidebarUser">
          <div class="sidebar-user-avatar" id="sidebarAvatar">?</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name" id="sidebarUserName">Loading...</div>
            <div class="sidebar-user-role" id="sidebarUserRole">User</div>
          </div>
          <button class="header-icon-btn" onclick="window.handleLogout()" title="Logout">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 5H6a2 2 0 00-2 2v6a2 2 0 002 2h6M15 10H8M13 7l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
    </aside>
    <div class="sidebar-backdrop" id="sidebarBackdrop"></div>
  `;
}

/* ---- Header template ---- */
export function getHeader(role, greeting, userName) {
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  return `
    <header class="dashboard-header">
      <div class="header-left">
        <button class="header-menu-toggle" id="menuToggle">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
        <div class="header-greeting">${greeting}, <span>${userName}</span></div>
      </div>
      <div class="header-right">
        <button class="header-icon-btn" title="Notifications">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3a4 4 0 00-4 4v3l-2 3h12l-2-3V7a4 4 0 00-4-4z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 15a2 2 0 004 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          <span class="notification-dot"></span>
        </button>
        <div class="header-avatar" id="headerAvatar">?</div>
      </div>
    </header>
  `;
}

/* ---- Init dashboard layout ---- */
export async function initDashboard(role, activePage) {
  const auth = await requireAuth([role]);
  if (!auth) return null;

  const greeting = getGreeting();
  const userName = auth.profile.name || auth.user.email?.split('@')[0] || 'User';
  const initials = getInitials(userName);

  // Inject sidebar + header
  const layout = document.querySelector('.dashboard-layout');
  if (layout) {
    layout.insertAdjacentHTML('afterbegin', getSidebar(role, activePage));
    const main = document.querySelector('.dashboard-main');
    if (main) {
      main.insertAdjacentHTML('afterbegin', getHeader(role, greeting, userName));
    }
  }

  // Set user info
  const sidebarAvatar = document.getElementById('sidebarAvatar');
  const sidebarUserName = document.getElementById('sidebarUserName');
  const sidebarUserRole = document.getElementById('sidebarUserRole');
  const headerAvatar = document.getElementById('headerAvatar');

  if (sidebarAvatar) sidebarAvatar.textContent = initials;
  if (sidebarUserName) sidebarUserName.textContent = userName;
  if (sidebarUserRole) sidebarUserRole.textContent = auth.profile.role;
  if (headerAvatar) headerAvatar.textContent = initials;

  // Mobile menu toggle
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.add('active');
      backdrop.classList.add('active');
    });
  }
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('active');
      backdrop.classList.remove('active');
    });
  }

  // Logout
  window.handleLogout = async () => {
    await authAPI.logout();
    window.location.href = '/login.html';
  };

  return auth;
}

/* ---- Risk level badge ---- */
export function riskBadge(level) {
  const classes = {
    'Low': 'badge-success',
    'Moderate': 'badge-warning',
    'High': 'badge-error',
    'Very High': 'badge-error',
  };
  return `<span class="badge ${classes[level] || 'badge-neutral'}">${level || 'N/A'}</span>`;
}

/* ---- Status badge ---- */
export function statusBadge(status) {
  const classes = {
    'active': 'badge-success',
    'inactive': 'badge-neutral',
    'suspended': 'badge-error',
    'pending': 'badge-warning',
    'accepted': 'badge-info',
    'completed': 'badge-success',
    'cancelled': 'badge-neutral',
    'reviewed': 'badge-success',
  };
  return `<span class="badge ${classes[status] || 'badge-neutral'}">${status}</span>`;
}

/* ---- Simple line chart (SVG) ---- */
export function renderLineChart(container, dataPoints) {
  if (!container || !dataPoints || dataPoints.length === 0) return;

  const width = container.clientWidth || 600;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const scores = dataPoints.map(d => d.score);
  const minScore = Math.min(...scores, 0);
  const maxScore = Math.max(...scores, 100);

  const xStep = dataPoints.length > 1 ? chartW / (dataPoints.length - 1) : 0;

  const points = dataPoints.map((d, i) => ({
    x: padding.left + i * xStep,
    y: padding.top + chartH - ((d.score - minScore) / (maxScore - minScore)) * chartH,
    label: d.label,
    score: d.score,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  const xLabels = points.map(p => `<text x="${p.x}" y="${height - 8}" text-anchor="middle" fill="var(--color-text-tertiary)" font-size="10">${p.label}</text>`).join('');
  const dots = points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--color-accent)" stroke="var(--color-surface)" stroke-width="2"/>`).join('');

  container.innerHTML = `
    <svg class="chart-svg" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(232,180,160,0.3)"/>
          <stop offset="100%" stop-color="rgba(232,180,160,0)"/>
        </linearGradient>
      </defs>
      <path d="${areaD}" fill="url(#chartGrad)"/>
      <path d="${pathD}" fill="none" stroke="var(--color-accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      ${dots}
      ${xLabels}
    </svg>
  `;
}

/* ---- Navbar scroll effect (landing page) ---- */
export function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });
}

/* ---- Mobile nav toggle (landing page) ---- */
export function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    links.classList.toggle('active');
  });
  // Close on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('active');
    });
  });
}
