const user = Session.requireRole(["consultant", "admin"]);

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
    const data = await Api.consultantDashboard();
    document.getElementById("stat-total-clients").textContent = data.total_clients;

    const listEl = document.getElementById("clients-list");
    if (!data.clients.length) {
      listEl.innerHTML = '<div class="empty-state">No clients linked yet.</div>';
    } else {
      listEl.innerHTML = data.clients.map((c) => `
        <div class="list-row">
          <div>
            <strong>${c.full_name}</strong>
            <div class="muted" style="font-size:0.8rem;">${c.email} · ID: ${c.client_id}</div>
          </div>
          <div>
            ${c.latest_score != null
              ? `<span class="pill pill-low" style="margin-right:8px;">${c.latest_score} · ${c.overall_condition}</span>`
              : `<span class="muted" style="margin-right:8px;">No assessment yet</span>`}
            <button class="btn btn-outline btn-sm" onclick="viewClientReport('${c.client_id}')">View Report</button>
          </div>
        </div>
      `).join("");
    }

    const recsEl = document.getElementById("recs-list");
    recsEl.innerHTML = data.recent_recommendations.length
      ? data.recent_recommendations.map((r) => `
          <div class="list-row">
            <div>${r.recommendation_text}</div>
            <div class="muted" style="font-size:0.78rem;">${new Date(r.created_at).toLocaleDateString()}</div>
          </div>
        `).join("")
      : '<div class="empty-state">No recommendations sent yet.</div>';
  } catch (err) {
    toast(err.message, true);
  }
}
loadDashboard();

async function linkClient() {
  const id = document.getElementById("link-client-id").value.trim();
  if (!id) return;
  try {
    await Api.linkClient(id);
    toast("Client linked.");
    document.getElementById("link-client-id").value = "";
    loadDashboard();
  } catch (err) {
    toast(err.message, true);
  }
}

async function sendRecommendation() {
  const client_id = document.getElementById("rec-client-id").value.trim();
  const recommendation_text = document.getElementById("rec-text").value.trim();
  if (!client_id || !recommendation_text) return;
  try {
    await Api.createRecommendation({ client_id, recommendation_text });
    toast("Recommendation sent.");
    document.getElementById("rec-text").value = "";
    loadDashboard();
  } catch (err) {
    toast(err.message, true);
  }
}

// ---------------- CLIENT REPORT (Module 9: Skin assessment reports & Progress monitoring) ----------------
async function viewClientReport(clientId) {
  const panel = document.getElementById("client-report-panel");
  const body = document.getElementById("client-report-body");
  panel.style.display = "block";
  body.innerHTML = '<div class="muted">Loading report…</div>';
  panel.scrollIntoView({ behavior: "smooth", block: "nearest" });

  try {
    const r = await Api.consultantClientReport(clientId);
    renderClientReport(body, r);
  } catch (err) {
    body.innerHTML = "";
    toast(err.message, true);
  }
}

function renderClientReport(body, r) {
  const latest = r.latest_assessment;
  const trend = r.trend_analysis;
  const adherence = r.routine_adherence_tracking;

  body.innerHTML = `
    <div class="grid grid-3" style="margin-bottom:16px;">
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
      <div class="card">
        <div class="card-title">Routine Adherence</div>
        <div class="stat-value">${adherence ? adherence.latest_pct + "%" : "--"}</div>
        <div class="stat-label">${adherence ? `Avg ${adherence.average_pct}% · ${adherence.trend}` : "No logs yet"}</div>
      </div>
    </div>
    <h3>Assessment History</h3>
    ${r.assessment_history.length ? r.assessment_history.slice().reverse().map((a) => `
      <div class="list-row">
        <div>
          <strong>${new Date(a.assessment_date).toLocaleDateString()}</strong> — ${a.overall_condition || "-"}
          ${a.concerns && a.concerns.length ? `<div class="muted" style="font-size:0.8rem;">${a.concerns.map((c) => c.concern_name).join(", ")}</div>` : ""}
        </div>
        <div><span class="pill pill-low">Score: ${a.skin_health_score}</span></div>
      </div>
    `).join("") : '<div class="empty-state">No assessments yet.</div>'}
  `;
}
