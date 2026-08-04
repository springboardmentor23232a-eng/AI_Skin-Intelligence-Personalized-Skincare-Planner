// --- Skin Profile Management ---
const profileForm = document.getElementById('profileForm');
const profileStatus = document.getElementById('profileStatus');
const resetProfileBtn = document.getElementById('resetProfileBtn');

const fetchSkinProfile = async (token) => {
  try {
    const response = await fetch('/user/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      const data = await response.json();

      // Populate select/input fields
      if (document.getElementById('skinType')) document.getElementById('skinType').value = data.skin_type || '';
      if (document.getElementById('ageGroup')) document.getElementById('ageGroup').value = data.age_group || '';
      if (document.getElementById('sleepQuality')) document.getElementById('sleepQuality').value = data.sleep_quality || '';
      if (document.getElementById('waterIntake')) document.getElementById('waterIntake').value = data.water_intake || '';
      if (document.getElementById('allergies')) document.getElementById('allergies').value = data.allergies || '';
      if (document.getElementById('sensitivities')) document.getElementById('sensitivities').value = data.sensitivities || '';

      // Checkboxes
      const setCheckboxes = (name, valuesStr) => {
        const values = valuesStr ? valuesStr.split(',').map(v => v.trim()) : [];
        if (profileForm) {
          const checkboxes = profileForm.querySelectorAll(`input[name="${name}"]`);
          checkboxes.forEach(cb => {
            cb.checked = values.includes(cb.value);
          });
        }
      };

      setCheckboxes('skinConcerns', data.skin_concerns);
      setCheckboxes('lifestyleHabits', data.lifestyle_habits);
      setCheckboxes('environmentalExposure', data.environmental_exposure);
    }
  } catch (error) {
    console.error('Error fetching skin profile:', error);
  }
};

const saveSkinProfile = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('access_token');
  if (!token) return;

  const getCheckboxValues = (name) => {
    const checkboxes = profileForm.querySelectorAll(`input[name="${name}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value).join(',');
  };

  const payload = {
    skin_type: document.getElementById('skinType').value,
    age_group: document.getElementById('ageGroup').value,
    sleep_quality: document.getElementById('sleepQuality').value,
    water_intake: document.getElementById('waterIntake').value,
    allergies: document.getElementById('allergies').value,
    sensitivities: document.getElementById('sensitivities').value,
    skin_concerns: getCheckboxValues('skinConcerns'),
    lifestyle_habits: getCheckboxValues('lifestyleHabits'),
    environmental_exposure: getCheckboxValues('environmentalExposure'),
  };

  try {
    profileStatus.textContent = 'Saving...';
    profileStatus.classList.remove('hidden', 'text-red-600', 'text-green-600');
    profileStatus.classList.add('text-gray-600');

    const res = await fetch('/user/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      profileStatus.textContent = 'Skin Profile saved successfully!';
      profileStatus.classList.remove('text-gray-600');
      profileStatus.classList.add('text-green-600');
      setTimeout(() => profileStatus.classList.add('hidden'), 3000);
    } else {
      const errData = await res.json().catch(() => ({}));
      profileStatus.textContent = errData.detail || 'Failed to save skin profile.';
      profileStatus.classList.remove('text-gray-600');
      profileStatus.classList.add('text-red-600');
    }
  } catch (error) {
    console.error('Error saving skin profile:', error);
    profileStatus.textContent = 'An error occurred while saving.';
    profileStatus.classList.remove('text-gray-600');
    profileStatus.classList.add('text-red-600');
  }
};

if (profileForm) {
  profileForm.addEventListener('submit', saveSkinProfile);
}

if (resetProfileBtn) {
  resetProfileBtn.addEventListener('click', () => {
    profileForm.reset();
  });
}

// --- Checklist Management ---
const checklistForm = document.getElementById('checklistForm');
const checklistStatus = document.getElementById('checklistStatus');
const clearChecklist = document.getElementById('clearChecklist');
const logoutButton = document.querySelector('.logout-btn');

const updateChecklistStatus = () => {
  if (!checklistForm || !checklistStatus) return;
  const checkboxes = checklistForm.querySelectorAll('input[type="checkbox"]');
  const completed = Array.from(checkboxes).filter((checkbox) => checkbox.checked).length;
  checklistStatus.textContent = `${completed} of ${checkboxes.length} tasks complete`;
};

// --- Session & Auth ---
const fetchUserProfile = async (token, fallbackEmail) => {
  try {
    const res = await fetch('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      let displayName = data.name ? data.name.trim() : '';
      if (!displayName && fallbackEmail) {
        const handle = fallbackEmail.split('@')[0];
        displayName = handle.charAt(0).toUpperCase() + handle.slice(1);
      }
      const greetingEl = document.getElementById('welcomeGreeting');
      if (greetingEl) {
        greetingEl.textContent = `Welcome, ${displayName || 'User'}`;
      }
    }
  } catch (err) {
    console.error('Error fetching profile:', err);
  }
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
  // Fetch user name and set greeting
  await fetchUserProfile(token, meData.email);
  // Load skin profile after approval check
  await fetchSkinProfile(token);
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

// --- Event listeners ---
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

// --- Boot ---
updateChecklistStatus();
verifySession();
