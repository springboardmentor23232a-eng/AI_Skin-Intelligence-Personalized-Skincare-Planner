Auth.requireRoleOrRedirect("consultant");

const sections = ["users", "reports", "recommend", "notes", "messages"];
document.querySelectorAll(".nav-item[data-section]").forEach((item) => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".nav-item[data-section]").forEach(n => n.classList.remove("active"));
    item.classList.add("active");
    sections.forEach(s => document.getElementById(`section-${s}`).classList.add("hidden"));
    document.getElementById(`section-${item.dataset.section}`).classList.remove("hidden");
    if (item.dataset.section === "messages") {
      const sel = document.getElementById("msg-user-select");
      if (sel.value) loadThread(sel.value);
    }
  });
});

document.getElementById("logout-btn").addEventListener("click", () => {
  Auth.clearSession();
  window.location.href = "../login.html";
});

let assignedUsers = [];

async function loadAssignedUsers() {
  const body = document.getElementById("users-body");
  try {
    assignedUsers = await apiRequest("/api/consultant/assigned-users");
    if (assignedUsers.length === 0) {
      body.innerHTML = `<tr><td colspan="3" class="muted">No users assigned yet — they'll appear here once they book an appointment with you.</td></tr>`;
    } else {
      body.innerHTML = assignedUsers.map(u => `
        <tr><td>${u.full_name}</td><td>${u.email}</td>
        <td><button class="btn-lab btn-ghost" onclick="jumpToUser('${u.id}')">View reports</button></td></tr>
      `).join("");
    }
    populateUserSelects();
  } catch (err) {
    body.innerHTML = `<tr><td colspan="3" class="error-msg">${err.message}</td></tr>`;
  }
}

function populateUserSelects() {
  const options = assignedUsers.map(u => `<option value="${u.id}">${u.full_name}</option>`).join("")
    || `<option value="">No assigned users</option>`;
  ["report-user-select", "rec-user-select", "note-user-select", "msg-user-select"].forEach(id => {
    document.getElementById(id).innerHTML = options;
  });
}

function jumpToUser(userId) {
  document.querySelector('[data-section="reports"]').click();
  document.getElementById("report-user-select").value = userId;
  loadReportsFor(userId);
}

document.getElementById("report-user-select").addEventListener("change", (e) => loadReportsFor(e.target.value));

async function loadReportsFor(userId) {
  const body = document.getElementById("reports-body");
  if (!userId) return;
  body.innerHTML = `<tr><td colspan="4" class="muted">Loading…</td></tr>`;
  try {
    const list = await apiRequest(`/api/consultant/reports/${userId}`);
    body.innerHTML = list.length ? list.map(a => `
      <tr><td>${formatDate(a.created_at)}</td><td>${a.skin_health_score.toFixed(0)}</td><td>${riskBadge(a.risk_score)}</td><td>${a.status.replace(/_/g," ")}</td></tr>
    `).join("") : `<tr><td colspan="4" class="muted">No assessments for this user yet.</td></tr>`;
  } catch (err) {
    body.innerHTML = `<tr><td colspan="4" class="error-msg">${err.message}</td></tr>`;
  }
}

document.getElementById("send-rec-btn").addEventListener("click", async () => {
  const msg = document.getElementById("rec-msg");
  const user_id = document.getElementById("rec-user-select").value;
  const text = document.getElementById("rec-text").value.trim();
  if (!user_id || !text) { msg.textContent = "Select a user and enter text."; msg.className = "error-msg"; return; }
  try {
    await apiRequest("/api/recommendations", {
      method: "POST",
      body: { user_id, category: document.getElementById("rec-category").value, text },
    });
    msg.textContent = "Recommendation sent.";
    msg.className = "success-msg";
    document.getElementById("rec-text").value = "";
  } catch (err) {
    msg.textContent = err.message; msg.className = "error-msg";
  }
});

document.getElementById("note-user-select").addEventListener("change", (e) => loadNotesFor(e.target.value));

async function loadNotesFor(userId) {
  const el = document.getElementById("notes-list");
  if (!userId) return;
  el.innerHTML = "Loading…";
  try {
    const notes = await apiRequest(`/api/consultant/notes/${userId}`);
    el.innerHTML = notes.length ? notes.map(n => `
      <div class="card-flat" style="margin-bottom:8px;"><p style="margin:0;">${n.note}</p><p class="muted" style="font-size:0.78rem;margin-top:6px;">${formatDate(n.created_at)}</p></div>
    `).join("") : `<p class="muted">No notes yet for this user.</p>`;
  } catch (err) {
    el.innerHTML = `<p class="error-msg">${err.message}</p>`;
  }
}

document.getElementById("add-note-btn").addEventListener("click", async () => {
  const msg = document.getElementById("note-msg");
  const user_id = document.getElementById("note-user-select").value;
  const note = document.getElementById("note-text").value.trim();
  if (!user_id || !note) { msg.textContent = "Select a user and enter a note."; msg.className = "error-msg"; return; }
  try {
    await apiRequest("/api/consultant/notes", { method: "POST", body: { user_id, note } });
    msg.textContent = "Note added.";
    msg.className = "success-msg";
    document.getElementById("note-text").value = "";
    loadNotesFor(user_id);
  } catch (err) {
    msg.textContent = err.message; msg.className = "error-msg";
  }
});

loadAssignedUsers();

// ---------- Messages ----------
document.getElementById("msg-user-select").addEventListener("change", (e) => loadThread(e.target.value));

async function loadThread(otherId) {
  const el = document.getElementById("messages-thread");
  if (!otherId) { el.innerHTML = "Select a user."; return; }
  el.innerHTML = "Loading…";
  try {
    const [msgs, me] = await Promise.all([apiRequest(`/api/messages/${otherId}`), apiRequest("/api/profile")]);
    el.innerHTML = msgs.length ? msgs.map(m => `
      <div style="margin-bottom:8px;text-align:${m.sender_id === me.id ? "right" : "left"};">
        <span class="badge-lab">${formatDate(m.created_at)}</span>
        <p style="margin:4px 0 0;">${m.text}</p>
      </div>
    `).join("") : `<p class="muted">No messages yet — say hello.</p>`;
  } catch (err) {
    el.innerHTML = `<p class="error-msg">${err.message}</p>`;
  }
}

document.getElementById("send-msg-btn").addEventListener("click", async () => {
  const msg = document.getElementById("msg-send-msg");
  const receiver_id = document.getElementById("msg-user-select").value;
  const text = document.getElementById("msg-text").value.trim();
  if (!receiver_id || !text) { msg.textContent = "Select a user and type a message."; msg.className = "error-msg"; return; }
  try {
    await apiRequest("/api/messages", { method: "POST", body: { receiver_id, text } });
    document.getElementById("msg-text").value = "";
    msg.textContent = "";
    loadThread(receiver_id);
  } catch (err) {
    msg.textContent = err.message; msg.className = "error-msg";
  }
});
