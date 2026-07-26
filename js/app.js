/**
 * Main Application Orchestrator for PanaceaAI Dashboard
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

    // Subscribe to auth state changes
    auth.subscribe(() => this.render());

    // Bind brand logo click to logout / home
    document.getElementById('brand-home').addEventListener('click', () => {
      auth.logout();
    });

    // Navbar scroll shadow
    window.addEventListener('scroll', () => {
      const navbar = document.querySelector('.navbar');
      if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
      }
    });

    this.render();
  }

  render() {
    const currentRole = auth.getCurrentRole();
    const roleInfo = auth.getCurrentRoleInfo();

    // Navbar role status
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
      this.authBtn.innerText = 'DEMO LOGIN';
      this.authBtn.className = 'btn btn-primary btn-sm';
      this.authBtn.onclick = () => this.openLoginModal();
    }

    // View render dispatch
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

    // Initialize scroll reveal animations
    this.initScrollReveal();
  }

  // IntersectionObserver scroll-reveal system
  initScrollReveal() {
    // Disconnect previous observer if exists
    if (this._revealObserver) {
      this._revealObserver.disconnect();
    }

    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!revealElements.length) return;

    this._revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          this._revealObserver.unobserve(entry.target); // fire once
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => this._revealObserver.observe(el));
  }

  openLoginModal() {
    this.loginModal.classList.add('active');
  }

  closeLoginModal() {
    this.loginModal.classList.remove('active');
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  selectRole(roleId) {
    auth.login(roleId);
    this.closeLoginModal();
  }

  // Interactive FAQ Accordion Toggle
  toggleFaq(element) {
    const isActive = element.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(item => {
      item.classList.remove('active');
      const icon = item.querySelector('.faq-icon');
      if (icon) icon.innerText = '+';
    });
    if (!isActive) {
      element.classList.add('active');
      const icon = element.querySelector('.faq-icon');
      if (icon) icon.innerText = '−';
    }
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

  // Dynamic Photo Upload Simulation
  triggerUploadSimulation() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      if (e.target.files && e.target.files[0]) {
        const fileName = e.target.files[0].name;
        alert(`Skin photo "${fileName}" uploaded successfully! Analyzing optical biomarkers...`);
        this.openModal('assessment-modal');
      }
    };
    input.click();
  }

  // Dynamic Hydration Counter
  addHydration(ml) {
    MOCK_USER_DATA.hydrationMl += ml;
    
    const hydrRatio = Math.min(1.0, MOCK_USER_DATA.hydrationMl / 2500);
    const newHydrScore = Math.round(hydrRatio * 100);

    const hydrItem = MOCK_USER_DATA.skinScore.breakdown.find(b => b.name.includes('Hydration'));
    if (hydrItem) hydrItem.score = newHydrScore;

    this.recalculateWeightedScore();
    this.render();
  }

  // Dynamic Skin Survey Form Submission
  handleSurveySubmit(e) {
    e.preventDefault();
    const skinType = document.getElementById('survey-skin-type').value;
    const concern = document.getElementById('survey-concern').value;
    const condScore = parseInt(document.getElementById('survey-condition').value, 10);
    const lifeScore = parseInt(document.getElementById('survey-lifestyle').value, 10);
    const sleepScore = parseInt(document.getElementById('survey-sleep').value, 10);

    MOCK_USER_DATA.profile.skinType = skinType;
    if (!MOCK_USER_DATA.profile.primaryConcerns.includes(concern)) {
      MOCK_USER_DATA.profile.primaryConcerns.unshift(concern);
    }

    const bd = MOCK_USER_DATA.skinScore.breakdown;
    bd.find(b => b.name.includes('Condition')).score = condScore;
    bd.find(b => b.name.includes('Lifestyle')).score = lifeScore;
    bd.find(b => b.name.includes('Sleep')).score = sleepScore;

    this.recalculateWeightedScore();
    this.closeModal('assessment-modal');
    this.render();
  }

  // Recalculate Weighted Skin Score Formula
  recalculateWeightedScore() {
    const bd = MOCK_USER_DATA.skinScore.breakdown;
    const cond = bd.find(b => b.name.includes('Condition')).score;
    const life = bd.find(b => b.name.includes('Lifestyle')).score;
    const sleep = bd.find(b => b.name.includes('Sleep')).score;
    const cons = bd.find(b => b.name.includes('Consistency')).score;
    const hydr = bd.find(b => b.name.includes('Hydration')).score;

    const computed = Math.round((0.35 * cond) + (0.20 * life) + (0.15 * sleep) + (0.20 * cons) + (0.10 * hydr));
    MOCK_USER_DATA.skinScore.overall = computed;
    MOCK_USER_DATA.skinScore.grade = computed >= 80 ? 'Optimal (Glowing)' : computed >= 70 ? 'Good (Improving)' : 'Fair (Requires Care)';
  }

  // Dynamic Product Add to Routine
  addProductToRoutine(name, category) {
    const newStep = {
      id: 'm_' + Date.now(),
      step: category,
      title: name,
      time: '8:20 AM',
      completed: false,
      icon: '✨'
    };
    MOCK_USER_DATA.routine.morning.push(newStep);
    alert(`Added "${name}" to your Morning Routine checklist!`);
    this.render();
  }

  // Interactive Ingredient Safety Checker
  checkIngredients() {
    const ing1 = document.getElementById('ing-1').value;
    const ing2 = document.getElementById('ing-2').value;
    const resultBox = document.getElementById('ingredient-result');

    resultBox.style.display = 'block';
    if ((ing1.includes('Vitamin C') && ing2.includes('Retinol')) || (ing2.includes('Vitamin C') && ing1.includes('Retinol'))) {
      resultBox.style.borderColor = 'var(--accent-rose)';
      resultBox.innerHTML = `
        <h4 style="color: var(--accent-rose); font-weight: 700;">⚠️ Interaction Warning: Use in Separate Routines</h4>
        <p style="font-size: 0.85rem; margin-top: 0.3rem;">Vitamin C and Retinol can cause skin barrier irritation and pH destabilization when layered together. Use Vitamin C in the <strong>Morning (AM)</strong> and Retinol in the <strong>Evening (PM)</strong>.</p>
      `;
    } else {
      resultBox.style.borderColor = 'var(--accent-emerald)';
      resultBox.innerHTML = `
        <h4 style="color: var(--accent-emerald); font-weight: 700;">✅ Compatible & Safe Combination</h4>
        <p style="font-size: 0.85rem; margin-top: 0.3rem;">${ing1} and ${ing2} complement each other and can be safely layered in your routine.</p>
      `;
    }
  }
}

const app = new App();
window.app = app;

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
