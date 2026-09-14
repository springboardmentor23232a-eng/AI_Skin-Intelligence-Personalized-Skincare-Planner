const user = Session.requireRole(["dermatologist", "admin"]);

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
    document.querySelectorAll("main > section").forEach((s) => (s.style.display = "none"));
    document.getElementById(`tab-${link.dataset.tab}`).style.display = "block";
  });
});

async function loadDashboard() {
  try {
    const data = await Api.dermatologistDashboard();
    document.getElementById("stat-total-patients").textContent = data.total_patients;
    document.getElementById("stat-high-risk").textContent = data.high_risk_patients.length;

    const listEl = document.getElementById("high-risk-list");
    listEl.innerHTML = data.high_risk_patients.length
      ? data.high_risk_patients.map((p) => `
          <div class="list-row">
            <div>
              <strong>${p.full_name}</strong>
              <div class="muted" style="font-size:0.8rem;">ID: ${p.patient_id} · Score: ${p.score}</div>
            </div>
            <div>
              ${p.risk_factors.map((r) => `<span class="pill pill-high" style="margin-left:6px;">${r}</span>`).join("")}
              <button class="btn btn-outline btn-sm" style="margin-left:8px;" onclick="viewPatientReport('${p.patient_id}')">View Report</button>
            </div>
          </div>
        `).join("")
      : '<div class="empty-state">No high-risk patients right now.</div>';
  } catch (err) {
    toast(err.message, true);
  }
}
loadDashboard();

async function linkPatient() {
  const id = document.getElementById("link-patient-id").value.trim();
  if (!id) return;
  try {
    await Api.linkClient(id);
    toast("Patient linked.");
    document.getElementById("link-patient-id").value = "";
    loadDashboard();
  } catch (err) {
    toast(err.message, true);
  }
}

async function sendRecommendation() {
  const client_id = document.getElementById("rec-patient-id").value.trim();
  const recommendation_text = document.getElementById("rec-text").value.trim();
  if (!client_id || !recommendation_text) return;
  try {
    await Api.createRecommendation({ client_id, recommendation_text });
    toast("Recommendation sent.");
    document.getElementById("rec-text").value = "";
  } catch (err) {
    toast(err.message, true);
  }
}

// ---------------- PATIENT REPORT (Module 9: Skin condition reports & Progress analytics) ----------------
async function viewPatientReport(patientId) {
  const panel = document.getElementById("patient-report-panel");
  const body = document.getElementById("patient-report-body");
  panel.style.display = "block";
  body.innerHTML = '<div class="muted">Loading report…</div>';
  panel.scrollIntoView({ behavior: "smooth", block: "nearest" });

  try {
    const r = await Api.dermatologistPatientReport(patientId);
    renderPatientReport(body, r);
  } catch (err) {
    body.innerHTML = "";
    toast(err.message, true);
  }
}

function renderPatientReport(body, r) {
  const latest = r.latest_assessment;
  const trend = r.trend_analysis;

  body.innerHTML = `
    <div class="grid grid-2" style="margin-bottom:16px;">
      <div class="card">
        <div class="card-title">Latest Skin Health Score</div>
        <div class="stat-value">${latest ? latest.skin_health_score : "--"}</div>
        <div class="stat-label">${latest ? latest.overall_condition : "No assessment yet"}</div>
      </div>
      <div class="card">
        <div class="card-title">Trend</div>
        <div class="stat-value" style="text-transform:capitalize;">${trend ? trend.direction : "--"}</div>
        <div class="stat-label">${trend ? `First ${trend.first_score} → Latest ${trend.latest_score}` : "Not enough data yet"}</div>
      </div>
    </div>
    <h3>Risk Factors (Latest Assessment)</h3>
    ${r.risk_factors && r.risk_factors.length
      ? `<ul>${r.risk_factors.map((rf) => `<li><strong>${rf.risk_name}</strong> (${rf.risk_level}) — ${rf.description || ""}</li>`).join("")}</ul>`
      : '<div class="empty-state">No risk factors flagged.</div>'}
    <h3>Assessment History</h3>
    ${r.assessment_history.length ? r.assessment_history.slice().reverse().map((a) => `
      <div class="list-row">
        <div><strong>${new Date(a.assessment_date).toLocaleDateString()}</strong> — ${a.overall_condition || "-"}</div>
        <div><span class="pill pill-low">Score: ${a.skin_health_score}</span></div>
      </div>
    `).join("") : '<div class="empty-state">No assessments yet.</div>'}
  `;
}
