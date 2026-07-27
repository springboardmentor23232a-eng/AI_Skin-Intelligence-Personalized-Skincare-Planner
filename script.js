const roleButtons = document.querySelectorAll('.role-btn');
const form = document.getElementById('loginForm');
const googleLoginButton = document.getElementById('googleLoginBtn');
const githubLoginButton = document.getElementById('githubLoginBtn');
let selectedRole = roleButtons.length ? roleButtons[0].dataset.role : '';

const roleRoutes = {
  user: 'user/user.html',
  admin: 'consultant/consultant.html',
  consultant: 'consultant/consultant.html',
};

const setActiveRole = (button) => {
  roleButtons.forEach((btn) => btn.classList.remove('active'));
  button.classList.add('active');
  selectedRole = button.dataset.role;
};

roleButtons.forEach((button) => {
  button.addEventListener('click', () => setActiveRole(button));
});

if (googleLoginButton) {
  googleLoginButton.addEventListener('click', () => {
    window.location.href = '/auth/supabase/login?provider=google';
  });
}

if (githubLoginButton) {
  githubLoginButton.addEventListener('click', () => {
    window.location.href = '/auth/supabase/login?provider=github';
  });
}

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const emailInput = form.querySelector('input[type="email"]');
    const passwordInput = form.querySelector('input[type="password"]');
    const email = emailInput?.value.trim();
    const password = passwordInput?.value ?? '';
    const rolePath = selectedRole.toLowerCase();

    if (!email || !password) {
      alert('Please enter your email and password.');
      return;
    }

    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        role: rolePath,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      alert(data.detail || 'Login failed.');
      return;
    }

    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('user_role', rolePath);
    const targetPage = roleRoutes[rolePath] || 'user/user.html';
    window.location.href = targetPage;
  });
}

if (roleButtons[0]) {
  setActiveRole(roleButtons[0]);
}
