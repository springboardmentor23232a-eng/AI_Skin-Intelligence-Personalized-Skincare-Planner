const roleButtons = document.querySelectorAll('.role-btn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginMessage = document.getElementById('loginMessage');
const registerMessage = document.getElementById('registerMessage');

let selectedRole = 'User';

roleButtons.forEach((button) => {
  button.addEventListener('click', (e) => {
    e.preventDefault();
    const clickedRole = button.dataset.role || button.textContent.trim();
    roleButtons.forEach((btn) => {
      const btnRole = btn.dataset.role || btn.textContent.trim();
      if (btnRole.toLowerCase() === clickedRole.toLowerCase()) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    selectedRole = clickedRole;
  });
});

const getSelectedRole = () => {
  const activeBtn = document.querySelector('.role-btn.active');
  return activeBtn?.dataset.role || selectedRole || 'User';
};

const clearMessages = () => {
  [loginMessage, registerMessage].forEach((msg) => {
    if (msg) {
      msg.textContent = '';
      msg.className = 'feedback-msg hidden';
    }
  });
};

const parseErrorMessage = (detail, fallback = 'An error occurred.') => {
  if (!detail) return fallback;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((err) => (err && err.msg) ? err.msg : JSON.stringify(err)).join(', ');
  }
  if (typeof detail === 'object') {
    return detail.msg || JSON.stringify(detail);
  }
  return String(detail);
};

const showMessage = (element, text, isError = true) => {
  if (!element) return;
  element.textContent = parseErrorMessage(text);
  element.className = `feedback-msg ${isError ? 'error' : 'success'}`;
};


const getFeedbackElement = () => loginMessage || registerMessage;

window.handleGoogleCredentialResponse = async (response) => {
  const feedbackEl = getFeedbackElement();
  const rolePath = getSelectedRole().toLowerCase();

  try {
    const res = await fetch('/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: response.credential, role: rolePath }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      showMessage(feedbackEl, data.detail || 'Google sign-in failed.');
      return;
    }

    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user_role', rolePath);

    const targetPage = roleRoutes[rolePath] || 'user/user.html';
    window.location.href = targetPage;
  } catch (err) {
    showMessage(feedbackEl, 'Google sign-in failed. Please try again.');
  }
};

const roleRoutes = {
  user: 'user/user.html',
  admin: 'admin/admin.html',
  consultant: 'consultant/consultant.html',
};

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearMessages();

    const emailInput = loginForm.querySelector('input[type="email"]');
    const passwordInput = loginForm.querySelector('input[type="password"]');
    const email = emailInput?.value.trim();
    const password = passwordInput?.value ?? '';
    const rolePath = getSelectedRole().toLowerCase();

    if (!email || !password) {
      showMessage(loginMessage, 'Please enter your email and password.');
      return;
    }

    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: rolePath }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        showMessage(loginMessage, data.detail || 'Login failed.');
        return;
      }

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_role', rolePath);
      const targetPage = roleRoutes[rolePath] || 'user/user.html';
      window.location.href = targetPage;
    } catch (err) {
      showMessage(loginMessage, 'Network error. Please try again.');
    }
  });
}

if (registerForm) {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearMessages();

    const nameInput = document.getElementById('regName');
    const emailInput = registerForm.querySelector('input[type="email"]');
    const passwordInput = registerForm.querySelector('input[type="password"]');
    const confirmInput = document.getElementById('regConfirmPassword');
    const name = nameInput?.value.trim() ?? '';
    const email = emailInput?.value.trim();
    const password = passwordInput?.value ?? '';
    const confirmPassword = confirmInput?.value ?? '';
    const rolePath = getSelectedRole().toLowerCase();

    if (!name || !email || !password) {
      showMessage(registerMessage, 'Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      showMessage(registerMessage, 'Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      showMessage(registerMessage, 'Passwords do not match.');
      return;
    }

    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: rolePath }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        showMessage(registerMessage, data.detail || 'Registration failed.');
        return;
      }

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_role', rolePath);
      const targetPage = roleRoutes[rolePath] || 'user/user.html';
      window.location.href = targetPage;
    } catch (err) {
      showMessage(registerMessage, 'Network error. Please try again.');
    }
  });
}
