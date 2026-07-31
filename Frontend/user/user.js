const checklistForm = document.getElementById('checklistForm');
const checklistStatus = document.getElementById('checklistStatus');
const clearChecklist = document.getElementById('clearChecklist');
const logoutButton = document.querySelector('.logout-btn');

const updateChecklistStatus = () => {
  const checkboxes = checklistForm.querySelectorAll('input[type="checkbox"]');
  const completed = Array.from(checkboxes).filter((checkbox) => checkbox.checked).length;
  checklistStatus.textContent = `${completed} of ${checkboxes.length} tasks complete`;
};

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
  if (meData.role !== 'user') {
    window.location.replace('../index.html');
    return;
  }

  // Check approval status
  await checkAccountStatus(token, meData.email);
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
    // If approved, overlay stays hidden — normal dashboard is visible
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

if (checklistForm) {
  checklistForm.addEventListener('change', updateChecklistStatus);
  checklistForm.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('Daily progress saved successfully.');
    updateChecklistStatus();
  });
}

if (clearChecklist) {
  clearChecklist.addEventListener('click', () => {
    const checkboxes = checklistForm.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
    updateChecklistStatus();
  });
}

if (logoutButton) {
  logoutButton.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    window.location.href = '../index.html';
  });
}

updateChecklistStatus();
verifySession();
