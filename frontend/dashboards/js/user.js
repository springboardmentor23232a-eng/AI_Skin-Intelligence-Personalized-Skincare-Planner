Auth.requireRoleOrRedirect("user");

// ---------- Sidebar navigation ----------
const sections = ["overview","profile","skin-profile","scan","history","recommendations","lifestyle","environment","appointments","messages","reports"];
document.querySelectorAll(".nav-item[data-section]").forEach((item) => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".nav-item[data-section]").forEach(n => n.classList.remove("active"));
    item.classList.add("active");
    sections.forEach(s => document.getElementById(`section-${s}`).classList.add("hidden"));
    const target = document.getElementById(`section-${item.dataset.section}`);
    target.classList.remove("hidden");
    onSectionShown(item.dataset.section);
  });
});

document.getElementById("logout-btn").addEventListener("click", () => {
  Auth.clearSession();
  window.location.href = "../login.html";
});

function onSectionShown(section) {
  if (section === "history") loadHistory();
  if (section === "recommendations") loadRecommendations();
  if (section === "appointments") { loadProviders(); loadAppointments(); }
  if (section === "reports") loadReports();
  if (section === "messages") loadMessageThreads();
}

// ---------- Overview ----------
async function loadOverview() {
  try {
    const profile = await apiRequest("/api/profile");
    document.getElementById("welcome-name").textContent = profile.full_name.split(" ")[0];
    document.getElementById("p-full-name").value = profile.full_name;
    document.getElementById("p-email").value = profile.email;
    document.getElementById("p-phone").value = profile.phone || "";
    document.getElementById("p-occupation").value = profile.occupation || "";
    document.getElementById("p-height").value = profile.height_cm || "";
    document.getElementById("p-weight").value = profile.weight_kg || "";

    const assessments = await apiRequest("/api/assessment");
    document.getElementById("ov-scans").textContent = assessments.length;

    if (assessments.length > 0) {
      const latest = assessments[0];
      document.getElementById("ov-health").textContent = latest.skin_health_score.toFixed(0);
      document.getElementById("ov-risk").textContent = latest.risk_score.toFixed(0);
      document.getElementById("ov-status").textContent = latest.status.replace(/_/g, " ");
      renderSubScores(latest, "latest-scores");
    }
  } catch (err) {
    console.error(err);
  }

  try {
    const sp = await apiRequest("/api/skin-profile");
    fillSkinProfileForm(sp);
  } catch (err) { /* no skin profile yet */ }
}

function renderSubScores(a, targetId) {
  const rows = [
    ["Acne", a.acne_score], ["Pigmentation", a.pigmentation_score], ["Wrinkles", a.wrinkle_score],
    ["Dryness", a.dryness_score], ["Oiliness", a.oiliness_score], ["Redness", a.redness_score],
    ["Pores", a.pores_score],
  ];
  const html = rows.map(([label, val]) => `
    <div class="score-row">
      <div class="top"><span>${label}</span><span>${val.toFixed(1)}</span></div>
      <div class="score-bar"><span style="width:${val}%;background:${scoreBarColor(val)};"></span></div>
    </div>
  `).join("");
  document.getElementById(targetId).innerHTML = html;
}

// ---------- Profile ----------
document.getElementById("save-profile-btn").addEventListener("click", async () => {
  const msg = document.getElementById("profile-msg");
  try {
    await apiRequest("/api/profile", {
      method: "PUT",
      body: {
        full_name: document.getElementById("p-full-name").value,
        phone: document.getElementById("p-phone").value,
        occupation: document.getElementById("p-occupation").value,
        height_cm: document.getElementById("p-height").value ? Number(document.getElementById("p-height").value) : null,
        weight_kg: document.getElementById("p-weight").value ? Number(document.getElementById("p-weight").value) : null,
      },
    });
    msg.textContent = "Saved.";
    msg.className = "success-msg";
  } catch (err) {
    msg.textContent = err.message; msg.className = "error-msg";
  }
});

// ---------- Skin profile ----------
function fillSkinProfileForm(sp) {
  document.getElementById("sp-age").value = sp.age || "";
  document.getElementById("sp-gender").value = sp.gender || "";
  document.getElementById("sp-skin-type").value = sp.skin_type || "";
  document.getElementById("sp-sun").value = sp.sun_exposure || "";
  document.getElementById("sp-concerns").value = sp.known_concerns || "";
  document.getElementById("sp-allergies").value = sp.allergies || "";
  document.getElementById("sp-products").value = sp.current_products || "";

  document.getElementById("al-food").checked = !!sp.allergy_food;
  document.getElementById("al-cosmetics").checked = !!sp.allergy_cosmetics;
  document.getElementById("al-medicine").checked = !!sp.allergy_medicine;
  document.getElementById("al-chemical").checked = !!sp.allergy_chemical;

  document.getElementById("se-sunlight").checked = !!sp.sensitivity_sunlight;
  document.getElementById("se-dust").checked = !!sp.sensitivity_dust;
  document.getElementById("se-pollution").checked = !!sp.sensitivity_pollution;
  document.getElementById("se-fragrance").checked = !!sp.sensitivity_fragrance;
  document.getElementById("se-alcohol").checked = !!sp.sensitivity_alcohol;

  document.getElementById("sp-diet").value = sp.diet || "";
  document.getElementById("sp-exercise").value = sp.exercise || "";
  document.getElementById("sp-stress").value = sp.stress_level || "";
  document.getElementById("sp-screen-time").value = sp.screen_time_hours ?? "";
  document.getElementById("sp-smoking").value = sp.smoking === true ? "true" : sp.smoking === false ? "false" : "";
  document.getElementById("sp-alcohol").value = sp.alcohol === true ? "true" : sp.alcohol === false ? "false" : "";

  document.getElementById("env-humidity").value = sp.humidity || "";
  document.getElementById("env-pollution").value = sp.pollution_level || "";
  document.getElementById("env-uv").value = sp.uv_exposure || "";
  document.getElementById("env-climate").value = sp.climate || "";
  document.getElementById("env-outdoor").value = sp.outdoor_hours ?? "";
}

document.getElementById("save-skin-profile-btn").addEventListener("click", async () => {
  const msg = document.getElementById("skin-profile-msg");
  const body = {
    age: document.getElementById("sp-age").value ? Number(document.getElementById("sp-age").value) : null,
    gender: document.getElementById("sp-gender").value || null,
    skin_type: document.getElementById("sp-skin-type").value || null,
    sun_exposure: document.getElementById("sp-sun").value || null,
    known_concerns: document.getElementById("sp-concerns").value || null,
    allergies: document.getElementById("sp-allergies").value || null,
    current_products: document.getElementById("sp-products").value || null,

    allergy_food: document.getElementById("al-food").checked,
    allergy_cosmetics: document.getElementById("al-cosmetics").checked,
    allergy_medicine: document.getElementById("al-medicine").checked,
    allergy_chemical: document.getElementById("al-chemical").checked,

    sensitivity_sunlight: document.getElementById("se-sunlight").checked,
    sensitivity_dust: document.getElementById("se-dust").checked,
    sensitivity_pollution: document.getElementById("se-pollution").checked,
    sensitivity_fragrance: document.getElementById("se-fragrance").checked,
    sensitivity_alcohol: document.getElementById("se-alcohol").checked,

    diet: document.getElementById("sp-diet").value || null,
    exercise: document.getElementById("sp-exercise").value || null,
    stress_level: document.getElementById("sp-stress").value || null,
    screen_time_hours: document.getElementById("sp-screen-time").value ? Number(document.getElementById("sp-screen-time").value) : null,
    smoking: document.getElementById("sp-smoking").value === "" ? null : document.getElementById("sp-smoking").value === "true",
    alcohol: document.getElementById("sp-alcohol").value === "" ? null : document.getElementById("sp-alcohol").value === "true",
  };
  try {
    await apiRequest("/api/skin-profile", { method: "PUT", body });
    msg.textContent = "Skin profile saved.";
    msg.className = "success-msg";
  } catch (err) {
    msg.textContent = err.message; msg.className = "error-msg";
  }
});

// ---------- Webcam scan ----------
let mediaStream = null;

document.getElementById("start-cam-btn").addEventListener("click", async () => {
  const msg = document.getElementById("scan-msg");
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
    document.getElementById("webcam-frame").srcObject = mediaStream;
    document.getElementById("capture-btn").disabled = false;
    msg.textContent = "";
  } catch (err) {
    msg.textContent = "Camera access denied or unavailable: " + err.message;
    msg.className = "error-msg";
  }
});

document.getElementById("capture-btn").addEventListener("click", async () => {
  const msg = document.getElementById("scan-msg");
  msg.textContent = "Analyzing…";
  msg.className = "muted";

  const video = document.getElementById("webcam-frame");
  const canvas = document.getElementById("webcam-canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);

  canvas.toBlob(async (blob) => {
    const form = new FormData();
    form.append("file", blob, "scan.jpg");
    try {
      const assessment = await apiRequest("/api/scan", { method: "POST", isForm: true, body: form });
      msg.textContent = "Analysis complete.";
      msg.className = "success-msg";
      document.getElementById("scan-result-card").classList.remove("hidden");
      renderSubScores(assessment, "scan-scores");
      loadOverview();
    } catch (err) {
      msg.textContent = err.message;
      msg.className = "error-msg";
    }
  }, "image/jpeg", 0.9);
});

// ---------- History ----------
let historyCache = [];

async function loadHistory() {
  const body = document.getElementById("history-body");
  try {
    const list = await apiRequest("/api/assessment");
    historyCache = list;
    if (list.length === 0) {
      body.innerHTML = `<tr><td colspan="6" class="muted">No scans yet — try the webcam scan.</td></tr>`;
      drawProgressGraph([]);
      return;
    }
    body.innerHTML = list.map(a => `
      <tr>
        <td><input type="checkbox" class="compare-check" value="${a.id}" /></td>
        <td>${formatDate(a.created_at)}</td>
        <td>${a.skin_health_score.toFixed(0)}</td>
        <td>${riskBadge(a.risk_score)}</td>
        <td><span class="badge-lab">${a.status.replace(/_/g," ")}</span></td>
        <td><a href="${API_BASE}/api/assessment/${a.id}" target="_blank" class="btn-lab btn-ghost">Download</a></td>
      </tr>
    `).join("");
    drawProgressGraph(list);
  } catch (err) {
    body.innerHTML = `<tr><td colspan="6" class="error-msg">${err.message}</td></tr>`;
  }
}

function drawProgressGraph(list) {
  const svg = document.getElementById("progress-graph");
  if (!list.length) { svg.innerHTML = `<text x="10" y="70" fill="var(--muted)" font-size="13">No data yet.</text>`; return; }
  const points = [...list].reverse(); // oldest -> newest, left to right
  const w = 600, h = 140, pad = 20;
  const stepX = points.length > 1 ? (w - 2 * pad) / (points.length - 1) : 0;
  const coords = points.map((a, i) => {
    const x = pad + stepX * i;
    const y = h - pad - (a.skin_health_score / 100) * (h - 2 * pad);
    return [x, y];
  });
  const path = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const dots = coords.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="var(--accent, #d98c4a)" />`).join("");
  svg.innerHTML = `<path d="${path}" fill="none" stroke="var(--accent, #d98c4a)" stroke-width="2" />${dots}`;
}

document.getElementById("compare-btn").addEventListener("click", () => {
  const checks = Array.from(document.querySelectorAll(".compare-check:checked")).map(c => c.value);
  const resultEl = document.getElementById("compare-result");
  if (checks.length !== 2) {
    resultEl.innerHTML = `<p class="error-msg">Select exactly two rows to compare.</p>`;
    return;
  }
  const [a, b] = checks.map(id => historyCache.find(x => x.id === id)).sort((x, y) => new Date(x.created_at) - new Date(y.created_at));
  const fields = [
    ["Skin health", "skin_health_score"], ["Risk", "risk_score"], ["Acne", "acne_score"],
    ["Pigmentation", "pigmentation_score"], ["Wrinkles", "wrinkle_score"], ["Dryness", "dryness_score"],
    ["Oiliness", "oiliness_score"], ["Redness", "redness_score"], ["Pores", "pores_score"],
  ];
  resultEl.innerHTML = `
    <table class="lab-table">
      <thead><tr><th>Metric</th><th>${formatDate(a.created_at)}</th><th>${formatDate(b.created_at)}</th><th>Change</th></tr></thead>
      <tbody>
        ${fields.map(([label, key]) => {
          const diff = (b[key] - a[key]).toFixed(1);
          const sign = diff > 0 ? "+" : "";
          return `<tr><td>${label}</td><td>${a[key].toFixed(1)}</td><td>${b[key].toFixed(1)}</td><td>${sign}${diff}</td></tr>`;
        }).join("")}
      </tbody>
    </table>
  `;
});

// ---------- Recommendations ----------
async function loadRecommendations() {
  const el = document.getElementById("recs-list");
  try {
    const list = await apiRequest("/api/recommendations");
    if (list.length === 0) { el.innerHTML = `<p class="muted">No recommendations yet.</p>`; return; }
    el.innerHTML = list.map(r => `
      <div class="card-flat" style="margin-bottom:10px;">
        <span class="badge-lab" style="margin-bottom:8px;display:inline-block;">${r.category || "general"}</span>
        <p style="margin:6px 0 0;">${r.text}</p>
        <p class="muted" style="font-size:0.78rem;margin-top:6px;">from ${r.created_by_role} · ${formatDate(r.created_at)}</p>
      </div>
    `).join("");
  } catch (err) {
    el.innerHTML = `<p class="error-msg">${err.message}</p>`;
  }
}

// ---------- Lifestyle ----------
document.getElementById("save-lifestyle-btn").addEventListener("click", async () => {
  const msg = document.getElementById("lifestyle-msg");
  try {
    await apiRequest("/api/lifestyle", {
      method: "PUT",
      body: {
        sleep_hours_avg: document.getElementById("lt-sleep").value ? Number(document.getElementById("lt-sleep").value) : null,
        water_intake_l_avg: document.getElementById("lt-water").value ? Number(document.getElementById("lt-water").value) : null,
      },
    });
    msg.textContent = "Saved.";
    msg.className = "success-msg";
  } catch (err) {
    msg.textContent = err.message; msg.className = "error-msg";
  }
});

// ---------- Environmental Exposure ----------
document.getElementById("save-env-btn").addEventListener("click", async () => {
  const msg = document.getElementById("env-msg");
  try {
    await apiRequest("/api/skin-profile", {
      method: "PUT",
      body: {
        humidity: document.getElementById("env-humidity").value || null,
        pollution_level: document.getElementById("env-pollution").value || null,
        uv_exposure: document.getElementById("env-uv").value || null,
        climate: document.getElementById("env-climate").value || null,
        outdoor_hours: document.getElementById("env-outdoor").value ? Number(document.getElementById("env-outdoor").value) : null,
      },
    });
    msg.textContent = "Saved.";
    msg.className = "success-msg";
  } catch (err) {
    msg.textContent = err.message; msg.className = "error-msg";
  }
});

// ---------- Appointments ----------
document.getElementById("ap-role").addEventListener("change", loadProviders);

async function loadProviders() {
  const role = document.getElementById("ap-role").value;
  const select = document.getElementById("ap-provider");
  select.innerHTML = `<option value="">Loading…</option>`;
  try {
    const list = await apiRequest(`/api/providers?role=${role}`);
    select.innerHTML = list.map(u => `<option value="${u.id}">${u.full_name}</option>`).join("")
      || `<option value="">No ${role}s available yet</option>`;
  } catch (err) {
    select.innerHTML = `<option value="">Ask an admin to add ${role}s</option>`;
  }
}

document.getElementById("book-btn").addEventListener("click", async () => {
  const msg = document.getElementById("book-msg");
  const provider_id = document.getElementById("ap-provider").value;
  const provider_role = document.getElementById("ap-role").value;
  const scheduled_at = document.getElementById("ap-datetime").value;
  if (!provider_id || !scheduled_at) {
    msg.textContent = "Select a provider and a date/time.";
    msg.className = "error-msg";
    return;
  }
  try {
    await apiRequest("/api/appointments", {
      method: "POST",
      body: { provider_id, provider_role, scheduled_at: new Date(scheduled_at).toISOString(), notes: document.getElementById("ap-notes").value },
    });
    msg.textContent = "Appointment requested.";
    msg.className = "success-msg";
    loadAppointments();
  } catch (err) {
    msg.textContent = err.message; msg.className = "error-msg";
  }
});

async function loadAppointments() {
  const body = document.getElementById("appointments-body");
  try {
    const list = await apiRequest("/api/appointments");
    body.innerHTML = list.length ? list.map(a => `
      <tr><td>${formatDate(a.scheduled_at)}</td><td>${a.provider_role}</td><td><span class="badge-lab">${a.status}</span></td></tr>
    `).join("") : `<tr><td colspan="3" class="muted">No appointments yet.</td></tr>`;
  } catch (err) {
    body.innerHTML = `<tr><td colspan="3" class="error-msg">${err.message}</td></tr>`;
  }
}

// ---------- Reports ----------
async function loadReports() {
  const el = document.getElementById("reports-list");
  try {
    const [assessments, reports] = await Promise.all([
      apiRequest("/api/assessment"), apiRequest("/api/reports"),
    ]);
    const generateOptions = assessments.map(a => `<option value="${a.id}">${formatDate(a.created_at)} — health ${a.skin_health_score.toFixed(0)}</option>`).join("");
    el.innerHTML = `
      <div class="field" style="max-width:420px;">
        <label>Generate a report from</label>
        <select id="report-assessment">${generateOptions || "<option value=''>No assessments yet</option>"}</select>
      </div>
      <button class="btn-lab btn-primary" id="gen-report-btn">Generate report</button>
      <div id="report-msg"></div>
      <h3 class="mt-32">Past reports</h3>
      <table class="lab-table">
        <thead><tr><th>Type</th><th>Generated</th></tr></thead>
        <tbody>${reports.length ? reports.map(r => `<tr><td>${r.report_type}</td><td>${formatDate(r.created_at)}</td></tr>`).join("") : `<tr><td colspan="2" class="muted">No reports yet.</td></tr>`}</tbody>
      </table>
    `;
    document.getElementById("gen-report-btn").addEventListener("click", async () => {
      const msg = document.getElementById("report-msg");
      const assessmentId = document.getElementById("report-assessment").value;
      if (!assessmentId) return;
      try {
        await apiRequest(`/api/reports/${assessmentId}`, { method: "POST" });
        msg.textContent = "Report generated.";
        msg.className = "success-msg";
        loadReports();
      } catch (err) {
        msg.textContent = err.message; msg.className = "error-msg";
      }
    });
  } catch (err) {
    el.innerHTML = `<p class="error-msg">${err.message}</p>`;
  }
}

// ---------- Messages ----------
let msgContacts = [];

async function loadMessageThreads() {
  const select = document.getElementById("msg-thread-select");
  select.innerHTML = `<option value="">Loading…</option>`;
  try {
    const [threads, appts] = await Promise.all([
      apiRequest("/api/messages/threads"),
      apiRequest("/api/appointments"),
    ]);
    const byId = {};
    threads.forEach(t => byId[t.user_id] = t.full_name);
    appts.forEach(a => { if (!byId[a.provider_id]) byId[a.provider_id] = `${a.provider_role} (appointment)`; });
    msgContacts = Object.entries(byId).map(([id, name]) => ({ id, name }));
    select.innerHTML = msgContacts.length
      ? msgContacts.map(c => `<option value="${c.id}">${c.name}</option>`).join("")
      : `<option value="">No consultant/dermatologist yet — book an appointment first</option>`;
    if (msgContacts.length) loadThread(msgContacts[0].id);
  } catch (err) {
    select.innerHTML = `<option value="">${err.message}</option>`;
  }
}

document.getElementById("msg-thread-select").addEventListener("change", (e) => loadThread(e.target.value));

async function loadThread(otherId) {
  const el = document.getElementById("messages-thread");
  if (!otherId) { el.innerHTML = "Select a conversation."; return; }
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
  const receiver_id = document.getElementById("msg-thread-select").value;
  const text = document.getElementById("msg-text").value.trim();
  if (!receiver_id || !text) { msg.textContent = "Pick a conversation and type a message."; msg.className = "error-msg"; return; }
  try {
    await apiRequest("/api/messages", { method: "POST", body: { receiver_id, text } });
    document.getElementById("msg-text").value = "";
    msg.textContent = "";
    loadThread(receiver_id);
  } catch (err) {
    msg.textContent = err.message; msg.className = "error-msg";
  }
});

loadOverview();
