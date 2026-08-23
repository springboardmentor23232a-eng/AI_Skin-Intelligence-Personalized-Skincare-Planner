const user = Session.requireRole(["admin"]);

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
    document.querySelectorAll("main > section").forEach((s) => (s.style.display = "none"));
    document.getElementById(`tab-${link.dataset.tab}`).style.display = "block";
    if (link.dataset.tab === "users") loadUsers();
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
