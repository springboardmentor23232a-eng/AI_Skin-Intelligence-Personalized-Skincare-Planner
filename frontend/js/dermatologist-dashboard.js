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
            <div>${p.risk_factors.map((r) => `<span class="pill pill-high" style="margin-left:6px;">${r}</span>`).join("")}</div>
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
