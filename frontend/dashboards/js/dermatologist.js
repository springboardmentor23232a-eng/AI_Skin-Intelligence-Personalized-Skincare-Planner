Auth.requireRoleOrRedirect("dermatologist");

const sections = ["patients", "predictions", "diagnosis", "history"];
document.querySelectorAll(".nav-item[data-section]").forEach((item) => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".nav-item[data-section]").forEach(n => n.classList.remove("active"));
    item.classList.add("active");
    sections.forEach(s => document.getElementById(`section-${s}`).classList.add("hidden"));
    document.getElementById(`section-${item.dataset.section}`).classList.remove("hidden");
  });
});

document.getElementById("logout-btn").addEventListener("click", () => {
  Auth.clearSession();
  window.location.href = "../login.html";
});

let assignedPatients = [];

async function loadAssignedPatients() {
  const body = document.getElementById("patients-body");
  try {
    assignedPatients = await apiRequest("/api/dermatologist/assigned-patients");
    body.innerHTML = assignedPatients.length ? assignedPatients.map(u => `
      <tr><td>${u.full_name}</td><td>${u.email}</td>
      <td><button class="btn-lab btn-ghost" onclick="jumpToPatient('${u.id}')">View predictions</button></td></tr>
    `).join("") : `<tr><td colspan="3" class="muted">No patients assigned yet — they'll appear once booked.</td></tr>`;
    populateSelects();
  } catch (err) {
    body.innerHTML = `<tr><td colspan="3" class="error-msg">${err.message}</td></tr>`;
  }
}

function populateSelects() {
  const options = assignedPatients.map(u => `<option value="${u.id}">${u.full_name}</option>`).join("")
    || `<option value="">No assigned patients</option>`;
  ["pred-user-select", "dx-user-select", "hist-user-select"].forEach(id => {
    document.getElementById(id).innerHTML = options;
  });
}

function jumpToPatient(userId) {
  document.querySelector('[data-section="predictions"]').click();
  document.getElementById("pred-user-select").value = userId;
  loadPredictionsFor(userId);
}

document.getElementById("pred-user-select").addEventListener("change", (e) => loadPredictionsFor(e.target.value));

async function loadPredictionsFor(userId) {
  const body = document.getElementById("predictions-body");
  if (!userId) return;
  body.innerHTML = `<tr><td colspan="4" class="muted">Loading…</td></tr>`;
  try {
    const list = await apiRequest(`/api/dermatologist/predictions/${userId}`);
    body.innerHTML = list.length ? list.map(a => `
      <tr><td>${formatDate(a.created_at)}</td><td>${a.skin_health_score.toFixed(0)}</td><td>${riskBadge(a.risk_score)}</td><td>${a.status.replace(/_/g," ")}</td></tr>
    `).join("") : `<tr><td colspan="4" class="muted">No assessments for this patient yet.</td></tr>`;
  } catch (err) {
    body.innerHTML = `<tr><td colspan="4" class="error-msg">${err.message}</td></tr>`;
  }
}

document.getElementById("save-dx-btn").addEventListener("click", async () => {
  const msg = document.getElementById("dx-msg");
  const user_id = document.getElementById("dx-user-select").value;
  if (!user_id) { msg.textContent = "Select a patient."; msg.className = "error-msg"; return; }
  const followup = document.getElementById("dx-followup").value;
  try {
    await apiRequest("/api/dermatologist/diagnosis", {
      method: "POST",
      body: {
        user_id,
        diagnosis: document.getElementById("dx-diagnosis").value,
        prescription: document.getElementById("dx-prescription").value,
        treatment_plan: document.getElementById("dx-plan").value,
        follow_up_date: followup ? new Date(followup).toISOString() : null,
      },
    });
    msg.textContent = "Diagnosis saved.";
    msg.className = "success-msg";
  } catch (err) {
    msg.textContent = err.message; msg.className = "error-msg";
  }
});

document.getElementById("hist-user-select").addEventListener("change", (e) => loadHistoryFor(e.target.value));

async function loadHistoryFor(userId) {
  const el = document.getElementById("history-list");
  if (!userId) return;
  el.innerHTML = "Loading…";
  try {
    const notes = await apiRequest(`/api/dermatologist/patient-history/${userId}`);
    el.innerHTML = notes.length ? notes.map(n => `
      <div class="card-flat" style="margin-bottom:8px;">
        <p style="margin:0;"><strong>Diagnosis:</strong> ${n.diagnosis || "—"}</p>
        <p style="margin:6px 0 0;"><strong>Prescription:</strong> ${n.prescription || "—"}</p>
        <p style="margin:6px 0 0;"><strong>Plan:</strong> ${n.treatment_plan || "—"}</p>
        <p class="muted" style="font-size:0.78rem;margin-top:6px;">${formatDate(n.created_at)}${n.follow_up_date ? " · follow-up " + formatDate(n.follow_up_date) : ""}</p>
      </div>
    `).join("") : `<p class="muted">No history yet for this patient.</p>`;
  } catch (err) {
    el.innerHTML = `<p class="error-msg">${err.message}</p>`;
  }
}

loadAssignedPatients();
