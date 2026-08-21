/* ==================== GLOWSENSE AI — AUTH PAGE LOGIC ==================== */

import { authAPI, googleAPI } from './api.js';
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

/* ---- Google Login ---- */
export async function handleGoogleLogin() {
  const errorBanner = document.getElementById('errorBanner');
  const googleBtn = document.getElementById('googleLoginBtn');

  if (googleBtn) {
    googleBtn.disabled = true;
    googleBtn.innerHTML = '<div class="spinner"></div> Connecting...';
  }

  try {
    const result = await googleAPI.signInWithGoogle();
    if (result.error) {
      if (errorBanner) {
        errorBanner.querySelector('span').textContent = result.error;
        errorBanner.classList.add('visible');
      }
      showToast(result.error, 'error');
      if (googleBtn) {
        googleBtn.disabled = false;
        googleBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.795 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.836.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.103-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg> Continue with Google';
      }
    }
  } catch (err) {
    if (errorBanner) {
      errorBanner.querySelector('span').textContent = 'Google sign-in failed. Please try again.';
      errorBanner.classList.add('visible');
    }
    showToast('Google sign-in failed. Please try again.', 'error');
    if (googleBtn) {
      googleBtn.disabled = false;
      googleBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.795 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.836.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.103-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg> Continue with Google';
    }
  }
}
