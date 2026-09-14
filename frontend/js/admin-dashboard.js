const user = Session.requireRole(["admin"]);

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
    document.querySelectorAll("main > section").forEach((s) => (s.style.display = "none"));
    document.getElementById(`tab-${link.dataset.tab}`).style.display = "block";
    if (link.dataset.tab === "users") loadUsers();
    if (link.dataset.tab === "recommendations") loadAdminRecommendations();
    if (link.dataset.tab === "reports") loadAdminReports();
  });
});

async function loadAnalytics() {
  try {
    const data = await Api.adminDashboard();
    const a = data.platform_analytics;
    const cards = [
      ["Total Users", a.total_users],
      ["Consultants", a.total_consultants],
      ["Dermatologists", a.total_dermatologists],
      ["Assessments Run", a.total_assessments],
      ["Products Catalogued", a.total_products],
      ["Avg. Skin Health Score", a.average_skin_health_score ?? "—"],
    ];
    document.getElementById("analytics-cards").innerHTML = cards.map(([label, val]) => `
      <div class="card">
        <div class="card-title">${label}</div>
        <div class="stat-value">${val}</div>
      </div>
    `).join("");
  } catch (err) {
    toast(err.message, true);
  }
}
loadAnalytics();

async function loadUsers() {
  const el = document.getElementById("users-list");
  el.innerHTML = '<div class="muted">Loading…</div>';
  try {
    const users = await Api.listUsers();
    el.innerHTML = users.map((u) => `
      <div class="list-row">
        <div>
          <strong>${u.full_name}</strong>
          <div class="muted" style="font-size:0.8rem;">${u.email} · ${u.role} · ID: ${u.id}</div>
        </div>
        <div>
          <span class="pill ${u.is_active ? "pill-low" : "pill-high"}">${u.is_active ? "Active" : "Disabled"}</span>
          <button class="btn btn-outline btn-sm" style="margin-left:8px;"
            onclick="toggleUser('${u.id}', ${u.is_active})">
            ${u.is_active ? "Deactivate" : "Activate"}
          </button>
        </div>
      </div>
    `).join("");
  } catch (err) {
    el.innerHTML = "";
    toast(err.message, true);
  }
}

async function toggleUser(id, isActive) {
  try {
    if (isActive) await Api.deactivateUser(id);
    else await Api.activateUser(id);
    toast("User updated.");
    loadUsers();
  } catch (err) {
    toast(err.message, true);
  }
}

// ---------------- RECOMMENDATION MONITORING (Module 9) ----------------
async function loadAdminRecommendations() {
  const el = document.getElementById("admin-recs-list");
  el.innerHTML = '<div class="muted">Loading…</div>';
  try {
    const recs = await Api.adminRecommendations();
    if (!recs.length) {
      el.innerHTML = '<div class="empty-state">No recommendations have been issued yet.</div>';
      return;
    }
    el.innerHTML = recs.map((r) => `
      <div class="list-row">
        <div>
          <strong>${r.professional_name}</strong> → ${r.client_name}
          <div class="muted" style="font-size:0.82rem; margin-top:2px;">${r.recommendation_text}</div>
        </div>
        <div class="muted" style="font-size:0.78rem;">${new Date(r.created_at).toLocaleDateString()}</div>
      </div>
    `).join("");
  } catch (err) {
    el.innerHTML = "";
    toast(err.message, true);
  }
}

// ---------------- SYSTEM REPORTS (Module 9) ----------------
async function loadAdminReports() {
  const roleCardsEl = document.getElementById("report-role-cards");
  const activityEl = document.getElementById("report-activity");
  const notifEl = document.getElementById("report-notifications");
  const concernsEl = document.getElementById("report-concerns");
  roleCardsEl.innerHTML = '<div class="muted">Loading…</div>';

  try {
    const r = await Api.adminReports();

    const roleLabels = { user: "Users", consultant: "Consultants", dermatologist: "Dermatologists", admin: "Admins" };
    roleCardsEl.innerHTML = Object.entries(r.role_breakdown).map(([role, count]) => `
      <div class="card">
        <div class="card-title">${roleLabels[role] || role}</div>
        <div class="stat-value">${count}</div>
      </div>
    `).join("") || '<div class="empty-state">No users yet.</div>';

    const a = r.activity;
    activityEl.innerHTML = `
      <div class="list-row"><div>New users</div><div><strong>${a.new_users_last_30_days}</strong></div></div>
      <div class="list-row"><div>Assessments (30d)</div><div><strong>${a.assessments_last_30_days}</strong></div></div>
      <div class="list-row"><div>Assessments (7d)</div><div><strong>${a.assessments_last_7_days}</strong></div></div>
      <div class="list-row"><div>Recommendations issued</div><div><strong>${a.recommendations_last_30_days}</strong></div></div>
    `;

    const notifEntries = Object.entries(r.notifications_by_category);
    notifEl.innerHTML = notifEntries.length
      ? notifEntries.map(([cat, count]) => `
          <div class="list-row"><div style="text-transform:capitalize;">${cat}</div><div><strong>${count}</strong></div></div>
        `).join("")
      : '<div class="empty-state">No notifications sent yet.</div>';

    concernsEl.innerHTML = r.top_skin_concerns.length
      ? r.top_skin_concerns.map((c) => `
          <div class="list-row"><div>${c.concern_name}</div><div><span class="pill pill-moderate">${c.count} occurrences</span></div></div>
        `).join("")
      : '<div class="empty-state">No concerns recorded yet.</div>';
  } catch (err) {
    roleCardsEl.innerHTML = "";
    toast(err.message, true);
  }
}

// ---------------- PLATFORM NOTIFICATIONS (Module 10) ----------------
async function sendBroadcast() {
  const title = document.getElementById("broadcast-title").value.trim();
  const message = document.getElementById("broadcast-message").value.trim();
  if (!title || !message) {
    toast("Please fill in both a title and a message.", true);
    return;
  }
  try {
    const res = await Api.broadcastPlatformNotification({ title, message });
    toast(res.message || "Notification sent.");
    document.getElementById("broadcast-title").value = "";
    document.getElementById("broadcast-message").value = "";
  } catch (err) {
    toast(err.message, true);
  }
}
