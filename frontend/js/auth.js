/* ==================== GLOWSENSE AI — AUTH PAGE LOGIC ==================== */

import { authAPI } from './api.js';
import { showToast, showLoading, hideLoading, getDashboardUrl } from './common.js';

/* ---- Login ---- */
export async function handleLogin(event) {
  event.preventDefault();
  const form = event.target;
  const emailInput = form.querySelector('#email');
  const passwordInput = form.querySelector('#password');
  const errorBanner = document.getElementById('errorBanner');
  const submitBtn = document.getElementById('loginBtn');

  // Reset errors
  errorBanner.classList.remove('visible');
  emailInput.classList.remove('error');
  passwordInput.classList.remove('error');

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // Validate
  if (!email || !password) {
    if (!email) emailInput.classList.add('error');
    if (!password) passwordInput.classList.add('error');
    errorBanner.querySelector('span').textContent = 'Please complete all required fields.';
    errorBanner.classList.add('visible');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailInput.classList.add('error');
    errorBanner.querySelector('span').textContent = 'Please enter a valid email address.';
    errorBanner.classList.add('visible');
    return;
  }

  // Loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<div class="spinner"></div> Signing in...';

  try {
    const result = await authAPI.login(email, password);
    if (result.user) {
      const profile = await authAPI.getCurrentProfile();
      const role = profile?.role || 'user';
      showToast('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = getDashboardUrl(role);
      }, 500);
    }
  } catch (err) {
    errorBanner.querySelector('span').textContent = err.message || 'Invalid email or password.';
    errorBanner.classList.add('visible');
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Login';
  }
}

/* ---- Register ---- */
export async function handleRegister(event) {
  event.preventDefault();
  const form = event.target;
  const nameInput = form.querySelector('#name');
  const emailInput = form.querySelector('#email');
  const passwordInput = form.querySelector('#password');
  const confirmInput = form.querySelector('#confirmPassword');
  const errorBanner = document.getElementById('errorBanner');
  const submitBtn = document.getElementById('registerBtn');

  // Reset errors
  errorBanner.classList.remove('visible');
  [nameInput, emailInput, passwordInput, confirmInput].forEach(i => i.classList.remove('error'));

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirm = confirmInput.value;

  // Validate
  let hasError = false;
  if (!name) { nameInput.classList.add('error'); hasError = true; }
  if (!email) { emailInput.classList.add('error'); hasError = true; }
  if (!password) { passwordInput.classList.add('error'); hasError = true; }
  if (!confirm) { confirmInput.classList.add('error'); hasError = true; }

  if (hasError) {
    errorBanner.querySelector('span').textContent = 'Please complete all required fields.';
    errorBanner.classList.add('visible');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    emailInput.classList.add('error');
    errorBanner.querySelector('span').textContent = 'Please enter a valid email address.';
    errorBanner.classList.add('visible');
    return;
  }

  if (password.length < 6) {
    passwordInput.classList.add('error');
    errorBanner.querySelector('span').textContent = 'Password must be at least 6 characters long.';
    errorBanner.classList.add('visible');
    return;
  }

  if (password !== confirm) {
    confirmInput.classList.add('error');
    errorBanner.querySelector('span').textContent = 'Passwords do not match.';
    errorBanner.classList.add('visible');
    return;
  }

  // Loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<div class="spinner"></div> Creating account...';

  try {
    const result = await authAPI.register(name, email, password);
    if (result.user) {
      showToast('Account created successfully! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = getDashboardUrl('user');
      }, 500);
    }
  } catch (err) {
    errorBanner.querySelector('span').textContent = err.message || 'Unable to create account. Please try again.';
    errorBanner.classList.add('visible');
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Create Account';
  }
}

/* ---- Password toggle ---- */
export function setupPasswordToggle() {
  document.querySelectorAll('.password-toggle').forEach(toggle => {
    toggle.addEventListener('click', function() {
      const input = this.parentElement.querySelector('input');
      const eyeOpen = this.querySelector('.eye-open');
      const eyeClosed = this.querySelector('.eye-closed');
      if (input.type === 'password') {
        input.type = 'text';
        eyeOpen.style.display = 'none';
        eyeClosed.style.display = 'block';
      } else {
        input.type = 'password';
        eyeOpen.style.display = 'block';
        eyeClosed.style.display = 'none';
      }
    });
  });
}

/* ---- Check if already logged in ---- */
export async function redirectIfLoggedIn() {
  const current = await authAPI.getCurrentUser();
  if (current) {
    const profile = await authAPI.getCurrentProfile();
    const role = profile?.role || 'user';
    window.location.href = getDashboardUrl(role);
  }
}
