/**
 * Main Application Orchestrator for PanaceaAI Dashboard
 */

import { auth } from './auth.js';
import { api } from './api.js';
import { MOCK_USER_DATA, MOCK_ROLES } from './mockData.js';
import {
  renderLandingPage,
  renderLoginPage,
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
    this.currentView = 'home'; // 'home' or 'login'

    // Current Quote Index & Data List
    this.currentQuoteIndex = 0;
    this.quotesList = [
      {
        text: '"You are beautiful — your skin is a living canvas reflecting your daily health, confidence, and self-care."',
        author: 'PanaceaAI Philosophy',
        role: 'Clinical Self-Love & Barrier Care'
      },
      {
        text: '"Invest in your skin. It is going to represent you for a very long time."',
        author: 'Linden Tyler',
        role: 'Skincare Author & Aesthetician'
      },
      {
        text: '"Beauty begins the moment you decide to be yourself."',
        author: 'Coco Chanel',
        role: 'Fashion & Beauty Icon'
      },
      {
        text: '"Healthy skin is not about perfection; it’s about balance, protection, and self-appreciation."',
        author: 'Dr. Sarah Johnson',
        role: 'Clinical Dermatologist & Researcher'
      },
      {
        text: '"Your skin barrier is your shield. Honor it with gentleness and daily hydration."',
        author: 'PanaceaAI Intelligence Lab',
        role: 'Optical Biomarker Studies'
      }
    ];
  }

  async init() {
    this.mainContent = document.getElementById('main-content');
    this.navRoleBadge = document.getElementById('nav-role-badge');
    this.authBtn = document.getElementById('auth-btn');
    this.loginModal = document.getElementById('login-modal');

    // Subscribe to auth state changes
    auth.subscribe(() => this.render());

    // BUG 11 FIX: Auto-logout on 401 session expiry — opens portal modal dialog box
    api.onSessionExpired((msg) => {
      auth.logout();
      this.currentView = 'home';
      this.render();
      this.openLoginModal();
      setTimeout(() => {
        const alertBox = document.getElementById('modal-login-alert');
        if (alertBox) {
          alertBox.className = 'login-alert-box alert-error';
          alertBox.innerText = msg;
          alertBox.classList.remove('hidden');
        }
      }, 100);
    });

    // Bind brand logo click to navigate to landing page (preserves logged in session)
    document.getElementById('brand-home').addEventListener('click', () => {
      this.currentView = 'landing';
      this.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Navbar scroll shadow
    window.addEventListener('scroll', () => {
      const navbar = document.querySelector('.navbar');
      if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
      }
    });

    // Close user dropdown when clicking outside
    document.addEventListener('click', (event) => {
      const menuWrapper = document.getElementById('nav-user-menu-wrapper');
      const dropdown = document.getElementById('user-profile-dropdown');
      if (menuWrapper && dropdown && !menuWrapper.contains(event.target)) {
        dropdown.classList.add('hidden');
      }
    });

    // BUG 1 FIX: Restore session from existing JWT token on page load
    const restored = await auth.restoreSession();
    if (!restored) {
      this.render();
    }
  }

  render() {
    const currentRole = auth.getCurrentRole();
    const roleInfo = auth.getCurrentRoleInfo();
    const menuWrapper = document.getElementById('nav-user-menu-wrapper');
    const dropdown = document.getElementById('user-profile-dropdown');

    // Navbar role status & DP Dropdown (Profile Avatar at right top)
    if (currentRole && roleInfo) {
      const user = auth.getCurrentUser();
      const avatarUrl = user?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || 'default'}`;
      const displayName = user?.username || roleInfo.name;
      const displayEmail = user?.email || `${displayName.toLowerCase()}@panacea.ai`;

      if (menuWrapper) menuWrapper.classList.remove('hidden');
      if (this.authBtn) this.authBtn.classList.add('hidden');

      // Update navbar DP badge
      this.navRoleBadge.innerHTML = `
        <img src="${avatarUrl}" alt="${displayName}" class="nav-user-avatar">
        <span class="nav-user-name">${displayName}</span>
        <span class="badge ${roleInfo.badgeClass}">${roleInfo.title}</span>
      `;

      // Update dropdown header info
      const dropdownAvatar = document.getElementById('dropdown-user-avatar');
      const dropdownName = document.getElementById('dropdown-user-name');
      const dropdownEmail = document.getElementById('dropdown-user-email');
      const dropdownBadge = document.getElementById('dropdown-user-role-badge');

      if (dropdownAvatar) dropdownAvatar.src = avatarUrl;
      if (dropdownName) dropdownName.innerText = displayName;
      if (dropdownEmail) dropdownEmail.innerText = displayEmail;
      if (dropdownBadge) {
        dropdownBadge.innerText = roleInfo.title;
        dropdownBadge.className = `badge ${roleInfo.badgeClass}`;
      }
    } else {
      if (menuWrapper) menuWrapper.classList.add('hidden');
      if (dropdown) dropdown.classList.add('hidden');
      if (this.authBtn) {
        this.authBtn.classList.remove('hidden');
        this.authBtn.innerText = 'SIGN IN';
        this.authBtn.className = 'btn btn-primary btn-sm';
        this.authBtn.onclick = () => this.openLoginModal();
      }
    }

    // View render dispatch: landing page view vs active role dashboard
    if (this.currentView === 'landing' || !currentRole) {
      this.mainContent.innerHTML = renderLandingPage();
    } else if (currentRole === 'user') {
      this.mainContent.innerHTML = renderUserDashboard();
    } else if (currentRole === 'consultant') {
      this.mainContent.innerHTML = renderConsultantDashboard();
    } else if (currentRole === 'dermatologist') {
      this.mainContent.innerHTML = renderDermatologistDashboard();
    } else if (currentRole === 'admin') {
      this.mainContent.innerHTML = renderAdminDashboard();
      // Asynchronously fetch live users from database and update roster table
      api.getAdminUsers().then(res => {
        if (res && res.success && res.users) {
          const container = document.getElementById('main-content');
          if (container && auth.getCurrentRole() === 'admin' && this.currentView !== 'landing') {
            container.innerHTML = renderAdminDashboard(res.users);
          }
        }
      });
    }

    // Initialize scroll reveal animations
    this.initScrollReveal();
  }

  toggleAdminAddUserForm() {
    const card = document.getElementById('admin-add-user-card');
    if (card) card.classList.toggle('hidden');
  }

  async handleAdminAddUserSubmit(event) {
    event.preventDefault();
    const username = document.getElementById('admin-new-username')?.value;
    const email = document.getElementById('admin-new-email')?.value;
    const password = document.getElementById('admin-new-password')?.value;
    const role = document.getElementById('admin-new-role')?.value || 'user';
    const alertBox = document.getElementById('admin-add-user-alert');

    const res = await api.createAdminUser({ username, email, password, role });

    if (!res.success) {
      if (alertBox) {
        alertBox.className = 'login-alert-box alert-error';
        alertBox.innerText = res.message;
        alertBox.classList.remove('hidden');
      }
    } else {
      alert(`User account "${username}" (${role}) created successfully!`);
      this.render();
    }
  }

  async handleAdminDeleteUser(userId, username) {
    if (!confirm(`Are you sure you want to delete user "${username}" (#${userId})?`)) {
      return;
    }

    const res = await api.deleteAdminUser(userId);
    if (!res.success) {
      alert(res.message || 'Failed to delete user account.');
    } else {
      alert(`User "${username}" deleted successfully.`);
      this.render();
    }
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

  // Quote Spotlight Controls
  nextQuote() {
    this.currentQuoteIndex = (this.currentQuoteIndex + 1) % this.quotesList.length;
    this.updateQuoteDisplay();
  }

  prevQuote() {
    this.currentQuoteIndex = (this.currentQuoteIndex - 1 + this.quotesList.length) % this.quotesList.length;
    this.updateQuoteDisplay();
  }

  shuffleQuote() {
    let nextIdx = Math.floor(Math.random() * this.quotesList.length);
    if (nextIdx === this.currentQuoteIndex) {
      nextIdx = (nextIdx + 1) % this.quotesList.length;
    }
    this.currentQuoteIndex = nextIdx;
    this.updateQuoteDisplay();
  }

  updateQuoteDisplay() {
    const textEl = document.getElementById('quote-display-text');
    const authorEl = document.getElementById('quote-display-author');
    const roleEl = document.getElementById('quote-display-role');

    if (!textEl || !authorEl || !roleEl) return;

    const item = this.quotesList[this.currentQuoteIndex];

    textEl.classList.add('fading');

    setTimeout(() => {
      textEl.innerText = item.text;
      authorEl.innerText = item.author;
      roleEl.innerText = item.role;
      textEl.classList.remove('fading');
    }, 200);
  }

  toggleUserDropdown(event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('user-profile-dropdown');
    if (dropdown) {
      dropdown.classList.toggle('hidden');
    }
  }

  closeUserDropdown() {
    const dropdown = document.getElementById('user-profile-dropdown');
    if (dropdown) {
      dropdown.classList.add('hidden');
    }
  }

  navigateToView(viewName) {
    this.closeUserDropdown();
    this.currentView = viewName;
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openUserSettingsModal() {
    this.closeUserDropdown();
    const user = auth.getCurrentUser();
    const roleInfo = auth.getCurrentRoleInfo();
    const avatarUrl = user?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || 'default'}`;
    const displayName = user?.username || roleInfo?.name || 'User';
    const displayEmail = user?.email || `${displayName.toLowerCase()}@panacea.ai`;

    const avatarImg = document.getElementById('settings-avatar-img');
    const nameEl = document.getElementById('settings-user-name');
    const roleEl = document.getElementById('settings-user-role');
    const emailInput = document.getElementById('settings-user-email');

    if (avatarImg) avatarImg.src = avatarUrl;
    if (nameEl) nameEl.innerText = displayName;
    if (roleEl && roleInfo) {
      roleEl.innerText = roleInfo.title;
      roleEl.className = `badge ${roleInfo.badgeClass}`;
    }
    if (emailInput) emailInput.value = displayEmail;

    this.openModal('user-settings-modal');
  }

  saveUserSettings() {
    this.closeModal('user-settings-modal');
    alert('Account preferences and notification settings saved successfully! ✨');
  }

  handleUserLogout() {
    this.closeUserDropdown();
    this.currentView = 'landing';
    auth.logout();
  }

  openLoginModal(defaultRole = null) {
    const userInput = document.getElementById('modal-login-username');
    const passInput = document.getElementById('modal-login-password');
    const roleSelect = document.getElementById('modal-login-role');
    const alertBox = document.getElementById('modal-login-alert');

    // Reset login form fields — fields are ALWAYS clear and never pre-filled
    if (userInput) userInput.value = '';
    if (passInput) passInput.value = '';
    if (roleSelect && defaultRole) roleSelect.value = defaultRole;
    if (alertBox) {
      alertBox.innerText = '';
      alertBox.classList.add('hidden');
    }

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
    this.openLoginModal(roleId);
  }

  showLoginPage(event) {
    if (event) event.preventDefault();
    this.openLoginModal();
  }

  async handleLoginPageSubmit(event) {
    event.preventDefault();
    const userInput = document.getElementById('page-login-username');
    const passInput = document.getElementById('page-login-password');
    const roleInput = document.getElementById('page-login-role');
    const rememberInput = document.getElementById('page-login-remember');
    const alertBox = document.getElementById('page-login-alert');

    const username = userInput ? userInput.value : '';
    const password = passInput ? passInput.value : '';
    const role = roleInput ? roleInput.value : 'user';
    const rememberMe = rememberInput ? rememberInput.checked : false;

    const res = await auth.loginWithCredentials(username, password, role, rememberMe);

    if (!res.success) {
      if (alertBox) {
        alertBox.className = 'login-alert-box alert-error';
        alertBox.innerText = res.message;
        alertBox.classList.remove('hidden');
      }
    } else {
      if (alertBox) {
        alertBox.className = 'login-alert-box alert-success';
        alertBox.innerText = res.message;
        alertBox.classList.remove('hidden');
      }
      this.currentView = 'home';
    }
  }

  async handleModalLoginSubmit(event) {
    event.preventDefault();
    const userInput = document.getElementById('modal-login-username');
    const passInput = document.getElementById('modal-login-password');
    const roleInput = document.getElementById('modal-login-role');
    const rememberInput = document.getElementById('modal-login-remember');
    const alertBox = document.getElementById('modal-login-alert');

    const username = userInput ? userInput.value : '';
    const password = passInput ? passInput.value : '';
    const role = roleInput ? roleInput.value : 'user';
    const rememberMe = rememberInput ? rememberInput.checked : false;

    const res = await auth.loginWithCredentials(username, password, role, rememberMe);

    if (!res.success) {
      if (alertBox) {
        alertBox.className = 'login-alert-box alert-error';
        alertBox.innerText = res.message;
        alertBox.classList.remove('hidden');
      }
    } else {
      this.closeLoginModal();
      this.currentView = 'home';
    }
  }

  toggleModalAuthMode(event) {
    if (event) event.preventDefault();
    const loginForm = document.getElementById('modal-login-form');
    const regForm = document.getElementById('modal-register-form');
    const toggleLink = document.getElementById('modal-toggle-auth-link');

    if (loginForm.classList.contains('hidden')) {
      loginForm.classList.remove('hidden');
      regForm.classList.add('hidden');
      if (toggleLink) toggleLink.innerText = 'Need a new account? Register here';
    } else {
      loginForm.classList.add('hidden');
      regForm.classList.remove('hidden');
      if (toggleLink) toggleLink.innerText = 'Already have an account? Log in here';
    }
  }

  async handleModalRegisterSubmit(event) {
    event.preventDefault();
    const username = document.getElementById('modal-reg-username')?.value;
    const email = document.getElementById('modal-reg-email')?.value;
    const password = document.getElementById('modal-reg-password')?.value;
    const role = document.getElementById('modal-reg-role')?.value || 'user';
    const alertBox = document.getElementById('modal-reg-alert');

    const res = await auth.registerUser(username, email, password, role);

    if (!res.success) {
      if (alertBox) {
        alertBox.className = 'login-alert-box alert-error';
        alertBox.innerText = res.message;
        alertBox.classList.remove('hidden');
      }
    } else {
      if (alertBox) {
        alertBox.className = 'login-alert-box alert-success';
        alertBox.innerText = res.message;
        alertBox.classList.remove('hidden');
      }
      alert(`Registration submitted for "${username}"! Your account is pending Administrator verification before you can sign in.`);
    }
  }

  async handleGoogleOAuthLogin() {
    const alertBox = document.getElementById('modal-login-alert');
    const roleSelect = document.getElementById('modal-oauth-role');
    const selectedRole = roleSelect ? roleSelect.value : 'user';

    const GOOGLE_CLIENT_ID = '435046043372-n2nmis20orleg8q57rh6o0muo7qpi0c3.apps.googleusercontent.com';

    // BUG 9 FIX: Only allow real Google GIS token — no mock/demo fallback
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            if (response.credential) {
              const res = await auth.loginWithGoogle(response.credential, selectedRole);
              if (res.success) {
                this.closeLoginModal();
                this.currentView = 'home';
              } else if (alertBox) {
                alertBox.className = 'login-alert-box alert-error';
                alertBox.innerText = res.message;
                alertBox.classList.remove('hidden');
              }
            }
          }
        });

        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.warn('[Google OAuth Info] Prompt not displayed:', notification.getNotDisplayedReason?.() || 'unknown reason');
            if (alertBox) {
              alertBox.className = 'login-alert-box alert-error';
              alertBox.innerText = 'Google Sign-In popup was blocked or unavailable. Please allow popups or try username/password login.';
              alertBox.classList.remove('hidden');
            }
          }
        });
        return;
      } catch (err) {
        console.warn('[Google OAuth Error]', err.message);
      }
    }

    // Google GIS library not loaded — show error instead of mock fallback
    if (alertBox) {
      alertBox.className = 'login-alert-box alert-error';
      alertBox.innerText = 'Google Sign-In is unavailable. The Google Identity Services library could not be loaded. Please use username/password login instead.';
      alertBox.classList.remove('hidden');
    }
  }

  async handleAdminApproveUser(userId, username) {
    if (!confirm(`Are you sure you want to approve and activate user "${username}" (#${userId})?`)) return;
    const res = await api.approveAdminUser(userId);
    if (res.success) {
      alert(res.message);
      this.render();
    } else {
      alert(res.message || 'Failed to approve user account.');
    }
  }

  fillAndLogin(roleId) {
    const { username, password } = this.getCredentialsForRole(roleId);
    const userInput = document.getElementById('page-login-username');
    const passInput = document.getElementById('page-login-password');

    if (userInput) userInput.value = username;
    if (passInput) passInput.value = password;

    // Use server auth with demo credentials
    auth.loginWithCredentials(username, password, roleId).then(res => {
      if (res.success) {
        this.currentView = 'home';
      } else {
        auth.login(roleId);
        this.currentView = 'home';
      }
    });
  }

  togglePasswordVisibility(inputId, btnEl) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const eyeOpenSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    const eyeOffSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

    if (input.type === 'password') {
      input.type = 'text';
      if (btnEl) btnEl.innerHTML = eyeOffSvg;
    } else {
      input.type = 'password';
      if (btnEl) btnEl.innerHTML = eyeOpenSvg;
    }
  }

  showForgotPasswordNotice() {
    alert('Password Reset Notice:\\nIn this dummy environment, select any role from the Demo Dropdown (e.g. DermaCare User: user/user123, Doctor: doctor/doctor123) or enter any non-empty username & password.');
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
