Auth.requireRoleOrRedirect("admin");

const sections = ["analytics", "users", "products", "roles", "permissions", "logs", "backup"];
document.querySelectorAll(".nav-item[data-section]").forEach((item) => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".nav-item[data-section]").forEach(n => n.classList.remove("active"));
    item.classList.add("active");
    sections.forEach(s => document.getElementById(`section-${s}`).classList.add("hidden"));
    document.getElementById(`section-${item.dataset.section}`).classList.remove("hidden");
    onShown(item.dataset.section);
  });
});

document.getElementById("logout-btn").addEventListener("click", () => {
  Auth.clearSession();
  window.location.href = "../login.html";
});

function onShown(section) {
  if (section === "users") loadUsers();
  if (section === "products") loadProducts();
  if (section === "roles") loadRoles();
  if (section === "permissions") loadPermissions();
  if (section === "logs") { loadAiLogs(); loadActivityLogs(); }
  if (section === "backup") loadBackups();
}

async function loadAnalytics() {
  try {
    const a = await apiRequest("/api/admin/analytics");
    document.getElementById("an-users").textContent = a.total_users;
    document.getElementById("an-consultants").textContent = a.total_consultants;
    document.getElementById("an-dermatologists").textContent = a.total_dermatologists;
    document.getElementById("an-assessments").textContent = a.total_assessments;
    document.getElementById("an-appointments").textContent = a.total_appointments;
    document.getElementById("an-avg-health").textContent = a.avg_skin_health_score.toFixed(0);
    document.getElementById("an-avg-risk").textContent = a.avg_risk_score.toFixed(0);
  } catch (err) { console.error(err); }
}

document.getElementById("user-role-filter").addEventListener("change", loadUsers);

async function loadUsers() {
  const body = document.getElementById("users-body");
  const role = document.getElementById("user-role-filter").value;
  body.innerHTML = `<tr><td colspan="5" class="muted">Loading…</td></tr>`;
  try {
    const list = await apiRequest(`/api/admin/users${role ? "?role=" + role : ""}`);
    body.innerHTML = list.map(u => `
      <tr>
        <td>${u.full_name}</td><td>${u.email}</td>
        <td>
          <select onchange="changeRole('${u.id}', this.value)">
            ${["user","consultant","dermatologist","admin"].map(r => `<option value="${r}" ${r===u.role?"selected":""}>${r}</option>`).join("")}
          </select>
        </td>
        <td><span class="badge-lab ${u.is_active ? "badge-risk-low" : "badge-risk-high"}">${u.is_active ? "active" : "disabled"}</span></td>
        <td>
          <button class="btn-lab btn-ghost" onclick="toggleStatus('${u.id}', ${!u.is_active})">${u.is_active ? "Disable" : "Enable"}</button>
        </td>
      </tr>
    `).join("") || `<tr><td colspan="5" class="muted">No users found.</td></tr>`;
  } catch (err) {
    body.innerHTML = `<tr><td colspan="5" class="error-msg">${err.message}</td></tr>`;
  }
}

async function changeRole(userId, role) {
  try {
    await apiRequest(`/api/admin/users/${userId}/role`, { method: "PUT", body: { role } });
    loadUsers();
  } catch (err) { alert(err.message); }
}

async function toggleStatus(userId, is_active) {
  try {
    await apiRequest(`/api/admin/users/${userId}/status`, { method: "PUT", body: { is_active } });
    loadUsers();
  } catch (err) { alert(err.message); }
}

async function loadProducts() {
  const body = document.getElementById("products-body");
  try {
    const list = await apiRequest("/api/admin/products");
    body.innerHTML = list.length ? list.map(p => `
      <tr>
        <td>${p.name}</td><td>${p.brand || "—"}</td><td>${p.category || "—"}</td>
        <td>${p.price != null ? "$" + p.price.toFixed(2) : "—"}</td>
        <td><button class="btn-lab btn-ghost" onclick="deleteProduct('${p.id}')">Remove</button></td>
      </tr>
    `).join("") : `<tr><td colspan="5" class="muted">No products yet.</td></tr>`;
  } catch (err) {
    body.innerHTML = `<tr><td colspan="5" class="error-msg">${err.message}</td></tr>`;
  }
}

document.getElementById("add-product-btn").addEventListener("click", async () => {
  const msg = document.getElementById("product-msg");
  const name = document.getElementById("pr-name").value.trim();
  if (!name) { msg.textContent = "Product name is required."; msg.className = "error-msg"; return; }
  try {
    await apiRequest("/api/admin/products", {
      method: "POST",
      body: {
        name,
        brand: document.getElementById("pr-brand").value || null,
        category: document.getElementById("pr-category").value || null,
        price: document.getElementById("pr-price").value ? Number(document.getElementById("pr-price").value) : null,
        suitable_for: document.getElementById("pr-suitable").value || null,
        description: document.getElementById("pr-description").value || null,
      },
    });
    msg.textContent = "Product added.";
    msg.className = "success-msg";
    ["pr-name","pr-brand","pr-category","pr-price","pr-suitable","pr-description"].forEach(id => document.getElementById(id).value = "");
    loadProducts();
  } catch (err) {
    msg.textContent = err.message; msg.className = "error-msg";
  }
});

async function deleteProduct(id) {
  try { await apiRequest(`/api/admin/products/${id}`, { method: "DELETE" }); loadProducts(); }
  catch (err) { alert(err.message); }
}

async function loadRoles() {
  const el = document.getElementById("roles-list");
  try {
    const roles = await apiRequest("/api/admin/roles");
    el.innerHTML = `
      <table class="lab-table">
        <thead><tr><th>Role</th><th>Description</th></tr></thead>
        <tbody>${roles.map(r => `<tr><td>${r.name}</td><td>${r.description || "—"}</td></tr>`).join("")}</tbody>
      </table>
    `;
  } catch (err) {
    el.innerHTML = `<p class="error-msg">${err.message}</p>`;
  }
}

async function loadAiLogs() {
  const body = document.getElementById("ai-logs-body");
  try {
    const logs = await apiRequest("/api/admin/ai-logs");
    body.innerHTML = logs.length ? logs.map(l => `
      <tr><td>${l.user_id}</td><td>${l.assessment_id}</td><td>${formatDate(l.created_at)}</td></tr>
    `).join("") : `<tr><td colspan="3" class="muted">No assessments logged yet.</td></tr>`;
  } catch (err) {
    body.innerHTML = `<tr><td colspan="3" class="error-msg">${err.message}</td></tr>`;
  }
}

async function loadActivityLogs() {
  const body = document.getElementById("activity-logs-body");
  try {
    const logs = await apiRequest("/api/admin/activity-logs");
    body.innerHTML = logs.length ? logs.map(l => `
      <tr><td>${l.user_id || "—"}</td><td>${l.action}</td><td>${l.details || "—"}</td><td>${formatDate(l.created_at)}</td></tr>
    `).join("") : `<tr><td colspan="4" class="muted">No activity logged yet.</td></tr>`;
  } catch (err) {
    body.innerHTML = `<tr><td colspan="4" class="error-msg">${err.message}</td></tr>`;
  }
}

loadAnalytics();

// ---------- Permissions ----------
async function loadPermissions() {
  const el = document.getElementById("permissions-list");
  el.innerHTML = "Loading…";
  try {
    const perms = await apiRequest("/api/admin/permissions");
    el.innerHTML = Object.entries(perms).map(([role, list]) => `
      <div class="card-flat" style="margin-bottom:12px;">
        <strong style="text-transform:capitalize;">${role}</strong>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">
          ${list.map(p => `<span class="badge-lab">${p.replace(/_/g, " ")}</span>`).join("")}
        </div>
      </div>
    `).join("");
  } catch (err) {
    el.innerHTML = `<p class="error-msg">${err.message}</p>`;
  }
}

// ---------- Database Backup ----------
document.getElementById("run-backup-btn").addEventListener("click", async () => {
  const msg = document.getElementById("backup-msg");
  msg.textContent = "Running backup…";
  msg.className = "muted";
  try {
    const result = await apiRequest("/api/admin/backup", { method: "POST" });
    msg.textContent = `Backup complete: ${result.filename} (${result.tables.length} tables).`;
    msg.className = "success-msg";
    loadBackups();
  } catch (err) {
    msg.textContent = err.message; msg.className = "error-msg";
  }
});

async function loadBackups() {
  const body = document.getElementById("backups-body");
  try {
    const list = await apiRequest("/api/admin/backups");
    body.innerHTML = list.length ? list.map(b => `
      <tr><td>${b.filename}</td><td>${(b.size_bytes / 1024).toFixed(1)} KB</td><td>${formatDate(b.created_at)}</td></tr>
    `).join("") : `<tr><td colspan="3" class="muted">No backups yet.</td></tr>`;
  } catch (err) {
    body.innerHTML = `<tr><td colspan="3" class="error-msg">${err.message}</td></tr>`;
  }
}
