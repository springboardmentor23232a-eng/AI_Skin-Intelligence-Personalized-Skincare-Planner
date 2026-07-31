const clientButtons = document.querySelectorAll('.client-btn');
const reviewButtons = document.querySelectorAll('.review-btn');
const assignButtons = document.querySelectorAll('.assign-btn');
const logoutButton = document.querySelector('.logout-btn');

const verifySession = async () => {
  const token = localStorage.getItem('access_token');
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
};

const checkAccountStatus = async (token, email) => {
  const overlay = document.getElementById('statusOverlay');
  const titleEl = document.getElementById('statusTitle');
  const msgEl = document.getElementById('statusMessage');
  const iconEl = document.getElementById('statusIcon');
  const emailEl = document.getElementById('statusEmail');
  const logoutBtn = document.getElementById('statusLogout');

  try {
    const res = await fetch('/auth/status', {
      headers: { Authorization: `Bearer ${token}` },
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

clientButtons.forEach((button) => {
  button.addEventListener('click', () => {
    alert(`Viewing profile for ${button.dataset.client}`);
  });
});

reviewButtons.forEach((button) => {
  button.addEventListener('click', () => {
    button.textContent = 'Reviewed';
    button.disabled = true;
    button.style.background = '#16a34a';
  });
});

assignButtons.forEach((button) => {
  button.addEventListener('click', () => {
    alert('Recommendation assigned successfully.');
  });
});

if (logoutButton) {
  logoutButton.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    window.location.href = '../index.html';
  });
}

verifySession();
