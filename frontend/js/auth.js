// Redirect if already logged in
(function () {
  const user = Session.getUser();
  const token = Session.getToken();
  if (user && token) redirectToDashboard(user.role);
})();

function redirectToDashboard(role) {
  const map = {
    user: "user-dashboard.html",
    consultant: "consultant-dashboard.html",
    dermatologist: "dermatologist-dashboard.html",
    admin: "admin-dashboard.html",
  };
  window.location.href = map[role] || "user-dashboard.html";
}

function showError(msg) {
  const el = document.getElementById("error-banner");
  el.textContent = msg;
  el.style.display = "block";
}
function hideError() {
  document.getElementById("error-banner").style.display = "none";
}

function showRegister() {
  hideError();
  document.getElementById("login-view").style.display = "none";
  document.getElementById("register-view").style.display = "block";
}
function showLogin() {
  hideError();
  document.getElementById("register-view").style.display = "none";
  document.getElementById("login-view").style.display = "block";
}

// ---- Role toggle on register form ----
let selectedRole = "user";
document.getElementById("role-toggle").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  document.querySelectorAll("#role-toggle button").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  selectedRole = btn.dataset.role;
});

// ---- Login submit ----
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  try {
    const data = await Api.login(email, password);
    Session.setToken(data.access_token);
    Session.setUser(data.user);
    redirectToDashboard(data.role);
  } catch (err) {
    showError(err.message);
  }
});

// ---- Register submit ----
document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideError();
  const payload = {
    full_name: document.getElementById("reg-name").value.trim(),
    email: document.getElementById("reg-email").value.trim(),
    phone: document.getElementById("reg-phone").value.trim() || null,
    password: document.getElementById("reg-password").value,
    role: selectedRole,
  };
  try {
    const data = await Api.register(payload);
    Session.setToken(data.access_token);
    Session.setUser(data.user);
    redirectToDashboard(data.role);
  } catch (err) {
    showError(err.message);
  }
});
