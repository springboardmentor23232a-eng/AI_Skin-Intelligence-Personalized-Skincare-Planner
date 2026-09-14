/* =========================================================================
   api.js — shared fetch wrapper + auth/session helpers
   ========================================================================= */

const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:8000"
  : ""; // same-origin in production behind a reverse proxy

const Session = {
  getToken() { return localStorage.getItem("aiskin_token"); },
  setToken(t) { localStorage.setItem("aiskin_token", t); },
  getUser() {
    const raw = localStorage.getItem("aiskin_user");
    return raw ? JSON.parse(raw) : null;
  },
  setUser(u) { localStorage.setItem("aiskin_user", JSON.stringify(u)); },
  clear() {
    localStorage.removeItem("aiskin_token");
    localStorage.removeItem("aiskin_user");
  },
  requireRole(roles) {
    const user = Session.getUser();
    const token = Session.getToken();
    if (!token || !user || !roles.includes(user.role)) {
      window.location.href = "index.html";
    }
    return user;
  },
};

async function apiRequest(path, { method = "GET", body = null, isForm = false, auth = true } = {}) {
  const headers = {};
  if (!isForm) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = Session.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: isForm ? body : (body ? JSON.stringify(body) : undefined),
  });

  if (res.status === 401) {
    Session.clear();
    window.location.href = "index.html";
    throw new Error("Session expired. Please log in again.");
  }

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const detail = (data && data.detail) ? data.detail : `Request failed (${res.status})`;
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return data;
}

const Api = {
  // ---- Auth ----
  register: (payload) => apiRequest("/api/auth/register", { method: "POST", body: payload, auth: false }),
  login: (email, password) => {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    return apiRequest("/api/auth/login", { method: "POST", body: form, isForm: true, auth: false });
  },
  googleLogin: (idToken) => apiRequest("/api/auth/google", { method: "POST", body: { id_token: idToken }, auth: false }),
  me: () => apiRequest("/api/auth/me"),

  // ---- Profile ----
  getProfile: () => apiRequest("/api/users/profile"),
  updateProfile: (payload) => apiRequest("/api/users/profile", { method: "PUT", body: payload }),
  listUsers: () => apiRequest("/api/users"),
  deactivateUser: (id) => apiRequest(`/api/users/${id}/deactivate`, { method: "PUT" }),
  activateUser: (id) => apiRequest(`/api/users/${id}/activate`, { method: "PUT" }),

  // ---- Assessment ----
  createAssessment: (payload) => apiRequest("/api/assessment", { method: "POST", body: payload }),
  analyzeImage: (file) => {
    const form = new FormData();
    form.append("file", file);
    return apiRequest("/api/assessment/analyze-image", { method: "POST", body: form, isForm: true });
  },
  listAssessments: () => apiRequest("/api/assessment"),
  getAssessment: (id) => apiRequest(`/api/assessment/${id}`),
  scoringEngineSummary: () => apiRequest("/api/assessment/scoring-engine"),

  // ---- Routine ----
  generateRoutine: (type) => apiRequest(`/api/routine/generate?routine_type=${type}`, { method: "POST" }),
  listRoutines: () => apiRequest("/api/routine"),

  // ---- Ingredients ----
  listIngredients: () => apiRequest("/api/ingredients"),
  checkIngredients: (names) => apiRequest("/api/ingredients/check-suitability", { method: "POST", body: { ingredient_names: names } }),

  // ---- Products ----
  listProducts: (category, maxPrice) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (maxPrice) params.set("max_price", maxPrice);
    const qs = params.toString();
    return apiRequest(`/api/products${qs ? "?" + qs : ""}`);
  },
  productCategories: () => apiRequest("/api/products/categories"),
  recommendedProducts: (category, budget) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (budget) params.set("budget", budget);
    const qs = params.toString();
    return apiRequest(`/api/products/recommended${qs ? "?" + qs : ""}`);
  },
  compareProducts: (ids) => apiRequest(`/api/products/compare?product_ids=${ids.join(",")}`),
  productAlternatives: (id) => apiRequest(`/api/products/${id}/alternatives`),

  // ---- Progress ----
  logProgress: (payload) => apiRequest("/api/progress", { method: "POST", body: payload }),
  getProgressTrend: () => apiRequest("/api/progress/trend"),
  getProgressAnalytics: () => apiRequest("/api/progress/analytics"),

  // ---- Notifications & Reminders (module 10) ----
  listNotifications: () => apiRequest("/api/notifications"),
  generateReminders: () => apiRequest("/api/notifications/generate-reminders", { method: "POST" }),
  markNotificationRead: (id) => apiRequest(`/api/notifications/${id}/read`, { method: "PUT" }),
  broadcastPlatformNotification: (payload) => apiRequest("/api/notifications/platform", { method: "POST", body: payload }),

  // ---- Dashboards (module 9) ----
  userDashboard: () => apiRequest("/api/dashboard/user"),
  consultantDashboard: () => apiRequest("/api/dashboard/consultant"),
  dermatologistDashboard: () => apiRequest("/api/dashboard/dermatologist"),
  adminDashboard: () => apiRequest("/api/dashboard/admin"),
  linkClient: (id) => apiRequest(`/api/dashboard/clients/${id}/link`, { method: "POST" }),
  createRecommendation: (payload) => apiRequest("/api/dashboard/recommendations", { method: "POST", body: payload }),
  myRecommendations: () => apiRequest("/api/dashboard/my-recommendations"),
  consultantClientReport: (clientId) => apiRequest(`/api/dashboard/consultant/clients/${clientId}/report`),
  dermatologistPatientReport: (patientId) => apiRequest(`/api/dashboard/dermatologist/patients/${patientId}/report`),
  adminRecommendations: () => apiRequest("/api/dashboard/admin/recommendations"),
  adminReports: () => apiRequest("/api/dashboard/admin/reports"),

  // ---- Reports & Export (module 11) ----
  async downloadReport(reportType, format, filename) {
    const token = Session.getToken();
    const res = await fetch(`${API_BASE}/api/reports/${reportType}?format=${format}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      let detail = "Failed to generate report.";
      try { detail = (await res.json()).detail || detail; } catch (_) {}
      throw new Error(detail);
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  // ---- AI Chat (Gemini) ----
  aiChat: (prompt) => apiRequest("/api/ai/chat", { method: "POST", body: { prompt } }),
};

function toast(message, isError = false) {
  let el = document.getElementById("global-toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "global-toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.className = "toast show" + (isError ? " error" : "");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
}

function logout() {
  Session.clear();
  window.location.href = "index.html";
}
