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
              ? `<span class="pill pill-low">${c.latest_score} · ${c.overall_condition}</span>`
              : `<span class="muted">No assessment yet</span>`}
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
