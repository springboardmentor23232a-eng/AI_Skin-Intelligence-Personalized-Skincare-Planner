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
  if (data.role !== 'consultant' && data.role !== 'admin') {
    window.location.replace('../index.html');
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
