/* Shared API client for the AI Skin Intelligence platform frontend. */

const API_BASE = window.API_BASE || "http://localhost:8000";

const Auth = {
  getAccessToken() { return localStorage.getItem("skinai_access_token"); },
  getRefreshToken() { return localStorage.getItem("skinai_refresh_token"); },
  getRole() { return localStorage.getItem("skinai_role"); },
  setSession({ access_token, refresh_token, role }) {
    localStorage.setItem("skinai_access_token", access_token);
    localStorage.setItem("skinai_refresh_token", refresh_token);
    localStorage.setItem("skinai_role", role);
  },
  clearSession() {
    localStorage.removeItem("skinai_access_token");
    localStorage.removeItem("skinai_refresh_token");
    localStorage.removeItem("skinai_role");
  },
  isLoggedIn() { return !!this.getAccessToken(); },
  requireLoginOrRedirect(loginPath = "../login.html") {
    if (!this.isLoggedIn()) window.location.href = loginPath;
  },
  requireRoleOrRedirect(role, loginPath = "../login.html") {
    if (!this.isLoggedIn() || this.getRole() !== role) window.location.href = loginPath;
  },
};

async function apiRequest(path, { method = "GET", body, isForm = false, authRequired = true } = {}) {
  const headers = {};
  if (!isForm) headers["Content-Type"] = "application/json";

  if (authRequired) {
    const token = Auth.getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  // Attempt a silent token refresh on 401, then retry once.
  if (res.status === 401 && authRequired && Auth.getRefreshToken()) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${Auth.getAccessToken()}`;
      const retry = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: isForm ? body : body ? JSON.stringify(body) : undefined,
      });
      return parseResponse(retry);
    }
  }

  return parseResponse(res);
}

async function parseResponse(res) {
  let data = null;
  try { data = await res.json(); } catch (e) { /* no body */ }
  if (!res.ok) {
    const message = (data && (data.detail || data.message)) || `Request failed (${res.status})`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
  return data;
}

async function tryRefreshToken() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: Auth.getRefreshToken() }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    Auth.setSession(data);
    return true;
  } catch (e) {
    return false;
  }
}

function scoreBarColor(score) {
  if (score < 33) return "var(--risk-low)";
  if (score < 66) return "var(--risk-mid)";
  return "var(--risk-high)";
}

function riskBadge(score) {
  if (score < 33) return `<span class="badge-lab badge-risk-low">Low</span>`;
  if (score < 66) return `<span class="badge-lab badge-risk-mid">Moderate</span>`;
  return `<span class="badge-lab badge-risk-high">High</span>`;
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium", timeStyle: "short",
    });
  } catch (e) { return iso; }
}
