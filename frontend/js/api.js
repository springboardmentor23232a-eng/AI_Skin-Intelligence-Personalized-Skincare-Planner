const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:8000"
  : "";

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
  register: (payload) => apiRequest("/api/auth/register", { method: "POST", body: payload, auth: false }),
  login: (email, password) => {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);
    return apiRequest("/api/auth/login", { method: "POST", body: form, isForm: true, auth: false });
  },
  googleLogin: (idToken) => apiRequest("/api/auth/google", { method: "POST", body: { id_token: idToken }, auth: false }),
  me: () => apiRequest("/api/auth/me"),

  getProfile: () => apiRequest("/api/users/profile"),
  updateProfile: (payload) => apiRequest("/api/users/profile", { method: "PUT", body: payload }),
  listUsers: () => apiRequest("/api/users"),
  deactivateUser: (id) => apiRequest(`/api/users/${id}/deactivate`, { method: "PUT" }),
  activateUser: (id) => apiRequest(`/api/users/${id}/activate`, { method: "PUT" }),

  createAssessment: (payload) => apiRequest("/api/assessment", { method: "POST", body: payload }),
  analyzeImage: (file) => {
    const form = new FormData();
    form.append("file", file);
    return apiRequest("/api/assessment/analyze-image", { method: "POST", body: form, isForm: true });
  },
  listAssessments: () => apiRequest("/api/assessment"),
  getAssessment: (id) => apiRequest(`/api/assessment/${id}`),

  generateRoutine: (type) => apiRequest(`/api/routine/generate?routine_type=${type}`, { method: "POST" }),
  listRoutines: () => apiRequest("/api/routine"),

  listIngredients: () => apiRequest("/api/ingredients"),
  checkIngredients: (names) => apiRequest("/api/ingredients/check-suitability", { method: "POST", body: { ingredient_names: names } }),

  listProducts: () => apiRequest("/api/products"),
  recommendedProducts: () => apiRequest("/api/products/recommended"),

  logProgress: (payload) => apiRequest("/api/progress", { method: "POST", body: payload }),
  getProgressTrend: () => apiRequest("/api/progress/trend"),

  listNotifications: () => apiRequest("/api/notifications"),
  generateReminders: () => apiRequest("/api/notifications/generate-reminders", { method: "POST" }),

  userDashboard: () => apiRequest("/api/dashboard/user"),
  consultantDashboard: () => apiRequest("/api/dashboard/consultant"),
  dermatologistDashboard: () => apiRequest("/api/dashboard/dermatologist"),
  adminDashboard: () => apiRequest("/api/dashboard/admin"),
  linkClient: (id) => apiRequest(`/api/dashboard/clients/${id}/link`, { method: "POST" }),
  createRecommendation: (payload) => apiRequest("/api/dashboard/recommendations", { method: "POST", body: payload }),
  myRecommendations: () => apiRequest("/api/dashboard/my-recommendations"),

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
