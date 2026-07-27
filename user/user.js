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

  const response = await fetch('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    window.location.replace('../index.html');
    return;
  }

  const data = await response.json().catch(() => ({}));
  if (data.role !== 'user') {
    window.location.replace('../index.html');
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
