/**
 * Main Application Orchestrator for AI Skin Intelligence Dashboard
 */

import { auth } from './auth.js';
import { MOCK_USER_DATA, MOCK_ROLES } from './mockData.js';
import {
  renderLandingPage,
  renderUserDashboard,
  renderConsultantDashboard,
  renderDermatologistDashboard,
  renderAdminDashboard
} from './dashboards.js';

class App {
  constructor() {
    this.mainContent = null;
    this.navRoleBadge = null;
    this.authBtn = null;
    this.loginModal = null;
  }

  init() {
    this.mainContent = document.getElementById('main-content');
    this.navRoleBadge = document.getElementById('nav-role-badge');
    this.authBtn = document.getElementById('auth-btn');
    this.loginModal = document.getElementById('login-modal');

    // Subscribe to authentication changes
    auth.subscribe(() => this.render());

    // Bind event listeners
    document.getElementById('brand-home').addEventListener('click', () => {
      auth.logout();
    });

    this.render();
  }

  render() {
    const currentRole = auth.getCurrentRole();
    const roleInfo = auth.getCurrentRoleInfo();

    // Update Navbar state
    if (currentRole && roleInfo) {
      this.navRoleBadge.classList.remove('hidden');
      this.navRoleBadge.innerHTML = `
        <span>${roleInfo.icon}</span>
        <span>${roleInfo.name}</span>
        <span class="badge ${roleInfo.badgeClass}">${roleInfo.title}</span>
      `;
      this.authBtn.innerText = 'Exit / Logout';
      this.authBtn.className = 'btn btn-outline btn-sm';
      this.authBtn.onclick = () => auth.logout();
    } else {
      this.navRoleBadge.classList.add('hidden');
      this.authBtn.innerText = 'Demo Login / Select Role';
      this.authBtn.className = 'btn btn-primary btn-sm';
      this.authBtn.onclick = () => this.openLoginModal();
    }

    // Render corresponding View
    if (!currentRole) {
      this.mainContent.innerHTML = renderLandingPage();
    } else if (currentRole === 'user') {
      this.mainContent.innerHTML = renderUserDashboard();
    } else if (currentRole === 'consultant') {
      this.mainContent.innerHTML = renderConsultantDashboard();
    } else if (currentRole === 'dermatologist') {
      this.mainContent.innerHTML = renderDermatologistDashboard();
    } else if (currentRole === 'admin') {
      this.mainContent.innerHTML = renderAdminDashboard();
    }
  }

  openLoginModal() {
    this.loginModal.classList.add('active');
  }

  closeLoginModal() {
    this.loginModal.classList.remove('active');
  }

  selectRole(roleId) {
    auth.login(roleId);
    this.closeLoginModal();
  }

  switchRoutineTab(tab) {
    const tabAm = document.getElementById('tab-am');
    const tabPm = document.getElementById('tab-pm');
    const listAm = document.getElementById('routine-list-am');
    const listPm = document.getElementById('routine-list-pm');

    if (!tabAm || !tabPm || !listAm || !listPm) return;

    if (tab === 'am') {
      tabAm.classList.add('active');
      tabPm.classList.remove('active');
      listAm.classList.remove('hidden');
      listPm.classList.add('hidden');
    } else {
      tabPm.classList.add('active');
      tabAm.classList.remove('active');
      listPm.classList.remove('hidden');
      listAm.classList.add('hidden');
    }
  }

  toggleStep(timeOfDay, stepId) {
    const list = timeOfDay === 'morning' ? MOCK_USER_DATA.routine.morning : MOCK_USER_DATA.routine.evening;
    const step = list.find(s => s.id === stepId);
    if (step) {
      step.completed = !step.completed;
      this.render();
    }
  }
}

const app = new App();
window.app = app;

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
