const user = Session.requireRole(["user", "admin"]);
document.getElementById("user-name-header").textContent = user ? `, ${user.full_name.split(" ")[0]}` : "";

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
    document.querySelectorAll("main > section").forEach((s) => (s.style.display = "none"));
    document.getElementById(`tab-${link.dataset.tab}`).style.display = "block";
    if (link.dataset.tab === "routine") loadRoutines();
    if (link.dataset.tab === "products") loadProducts();
    if (link.dataset.tab === "progress") loadProgressTrend();
    if (link.dataset.tab === "profile") loadProfile();
    if (link.dataset.tab === "recommendations") loadRecommendations();
  });
});

function setScoreRing(score) {
  const circumference = 264;
  const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;
  document.getElementById("score-fill").style.strokeDashoffset = offset;
  document.getElementById("score-num").textContent = Math.round(score);
}

async function loadOverview() {
  try {
    const data = await Api.userDashboard();
    if (data.skin_health_score != null) {
      setScoreRing(data.skin_health_score);
      document.getElementById("score-condition").textContent = data.overall_condition;
      document.getElementById("score-skintype").textContent = data.detected_skin_type
        ? `Detected type: ${data.detected_skin_type}` : "";
    } else {
      document.getElementById("score-condition").textContent = "No assessment yet run a skin scan.";
    }
    const routineSteps = (data.active_routines || []).reduce((sum, r) => sum + r.steps.length, 0);
    document.getElementById("routine-count").textContent = routineSteps;
    document.getElementById("notif-count").textContent = data.unread_notifications || 0;

    const concernsEl = document.getElementById("overview-concerns");
    if (data.latest_concerns && data.latest_concerns.length) {
      concernsEl.innerHTML = data.latest_concerns
        .map((c) => `<span class="pill pill-${c.severity}" style="margin-right:8px;">${c.concern_name}</span>`)
        .join("");
    }
  } catch (err) {
    toast(err.message, true);
  }
}
loadOverview();

const webcamBox = document.getElementById("webcam-box");
const btnStartCam = document.getElementById("btn-start-cam");
const btnCapture = document.getElementById("btn-capture");
const btnRetake = document.getElementById("btn-retake");
const btnAnalyze = document.getElementById("btn-analyze");
const fileUpload = document.getElementById("file-upload");
let currentImageSource = null;

btnStartCam.addEventListener("click", async () => {
  try {
    await WebcamCapture.start(webcamBox);
    btnCapture.disabled = false;
    btnStartCam.style.display = "none";
  } catch (err) {
    toast("Could not access camera: " + err.message, true);
  }
});

btnCapture.addEventListener("click", async () => {
  await WebcamCapture.capture(webcamBox);
  WebcamCapture.stop();
  currentImageSource = "webcam";
  btnCapture.style.display = "none";
  btnRetake.style.display = "inline-flex";
  btnAnalyze.disabled = false;
});

btnRetake.addEventListener("click", async () => {
  currentImageSource = null;
  btnAnalyze.disabled = fileUpload.files.length === 0;
  btnRetake.style.display = "none";
  btnCapture.style.display = "inline-flex";
  btnStartCam.style.display = "inline-flex";
  webcamBox.innerHTML = '<div class="placeholder">Camera not started</div>';
});

fileUpload.addEventListener("change", () => {
  if (fileUpload.files.length > 0) {
    currentImageSource = "upload";
    btnAnalyze.disabled = false;
  }
});

btnAnalyze.addEventListener("click", async () => {
  const statusEl = document.getElementById("analyze-status");
  btnAnalyze.disabled = true;
  statusEl.innerHTML = '<span class="spinner"></span> Analyzing skin image';

  try {
    let blob;
    if (currentImageSource === "webcam") {
      blob = WebcamCapture.getBlob();
    } else if (fileUpload.files.length > 0) {
      blob = fileUpload.files[0];
    }
    if (!blob) throw new Error("Please capture or upload an image first.");

    const file = blob instanceof File ? blob : new File([blob], "capture.jpg", { type: "image/jpeg" });
    const result = await Api.analyzeImage(file);

    statusEl.textContent = "Analysis complete.";
    renderScanResult(result);
    loadOverview();
  } catch (err) {
    statusEl.textContent = "";
    toast(err.message, true);
  } finally {
    btnAnalyze.disabled = false;
  }
});

function renderScanResult(assessment) {
  const box = document.getElementById("scan-result");
  const body = document.getElementById("scan-result-body");
  box.style.display = "block";

  const concernsHtml = assessment.concerns
    .map((c) => `<span class="pill pill-${c.severity}" style="margin-right:8px;">${c.concern_name}</span>`)
    .join("") || '<span class="muted">No concerns detected.</span>';

  const risksHtml = assessment.risk_factors
    .map((r) => `<li><strong>${r.risk_name}</strong> (${r.risk_level}) ${r.description || ""}</li>`)
    .join("") || "<li class='muted'>No risk factors flagged.</li>";

  body.innerHTML = `
    <div class="grid grid-2">
      <div>
        <div class="card-title">Skin Health Score</div>
        <div class="stat-value">${assessment.skin_health_score}</div>
        <div class="stat-label">${assessment.overall_condition} Detected type: ${assessment.detected_skin_type || "NA"}</div>
      </div>
      <div>
        <div class="card-title">Concerns Identified</div>
        <div>${concernsHtml}</div>
      </div>
    </div>
    <hr class="divider" />
    <div class="card-title">Risk Factors</div>
    <ul>${risksHtml}</ul>
  `;
}

async function generateRoutine(type) {
  try {
    await Api.generateRoutine(type);
    toast(`${type[0].toUpperCase() + type.slice(1)} routine generated.`);
    loadRoutines();
  } catch (err) {
    toast(err.message, true);
  }
}

async function loadRoutines() {
  const listEl = document.getElementById("routine-list");
  listEl.innerHTML = '<div class="muted">Loading</div>';
  try {
    const routines = await Api.listRoutines();
    if (!routines.length) {
      listEl.innerHTML = '<div class="empty-state">No routines yet. Generate a morning or evening routine above.</div>';
      return;
    }
    listEl.innerHTML = routines.map((r) => `
      <div class="card">
        <h3 style="text-transform:capitalize;">${r.routine_type} Routine</h3>
        <ol style="padding-left:18px;">
          ${r.steps.map((s) => `<li style="margin-bottom:8px;"><strong style="text-transform:capitalize;">${s.category.replace('_',' ')}:</strong> ${s.instruction}</li>`).join("")}
        </ol>
      </div>
    `).join("");
  } catch (err) {
    listEl.innerHTML = "";
    toast(err.message, true);
  }
}

async function loadProducts() {
  const listEl = document.getElementById("products-list");
  listEl.innerHTML = '<div class="muted">Loading</div>';
  try {
    const products = await Api.recommendedProducts().catch(() => Api.listProducts());
    if (!products.length) {
      listEl.innerHTML = '<div class="empty-state">No products available yet.</div>';
      return;
    }
    listEl.innerHTML = products.map((p) => `
      <div class="card">
        <div class="card-title">${p.category.replace('_',' ')}</div>
        <h3>${p.name}</h3>
        <p class="muted">${p.brand || ""}</p>
        <p>${p.key_ingredients ? "Key ingredients: " + p.key_ingredients : ""}</p>
        <div style="font-family:var(--font-mono); color:var(--sage-deep); font-weight:600;">Rs.${p.price}</div>
      </div>
    `).join("");
  } catch (err) {
    listEl.innerHTML = "";
    toast(err.message, true);
  }
}

async function checkIngredients() {
  const raw = document.getElementById("ingredient-input").value.trim();
  const resultsEl = document.getElementById("ingredient-results");
  if (!raw) return;
  const names = raw.split(",").map((n) => n.trim()).filter(Boolean);
  resultsEl.innerHTML = '<div class="muted">Checking</div>';
  try {
    const data = await Api.checkIngredients(names);
    resultsEl.innerHTML = data.results.map((r) => `
      <div class="list-row">
        <div>
          <strong>${r.ingredient}</strong>
          ${r.found ? `<div class="muted" style="font-size:0.8rem;">${r.good_for ? "Good for: " + r.good_for : ""}</div>` : ""}
        </div>
        <div>
          ${r.flags && r.flags.length
            ? r.flags.map((f) => `<span class="pill pill-high" style="margin-left:6px;">${f}</span>`).join("")
            : `<span class="pill pill-low">Safe</span>`}
        </div>
      </div>
    `).join("");
  } catch (err) {
    resultsEl.innerHTML = "";
    toast(err.message, true);
  }
}

async function submitProgress() {
  const adherence = parseFloat(document.getElementById("log-adherence").value);
  const score = parseFloat(document.getElementById("log-score").value);
  try {
    await Api.logProgress({ routine_adherence_pct: adherence, skin_health_score: score });
    toast("Progress logged.");
    loadProgressTrend();
  } catch (err) {
    toast(err.message, true);
  }
}

async function loadProgressTrend() {
  const el = document.getElementById("progress-trend");
  try {
    const data = await Api.getProgressTrend();
    if (data.trend === "no_data") {
      el.textContent = "No logs yet.";
      return;
    }
    el.innerHTML = `
      <p>Trend: <strong style="text-transform:capitalize;">${data.trend}</strong></p>
      <p>First score: ${data.first_score} Latest score: ${data.latest_score}</p>
      <ul>${data.logs.map((l) => `<li>${new Date(l.date).toLocaleDateString()}: score ${l.score}, adherence ${l.adherence}%</li>`).join("")}</ul>
    `;
  } catch (err) {
    el.textContent = "";
    toast(err.message, true);
  }
}

async function askAI() {
  const prompt = document.getElementById("ai-prompt").value.trim();
  const responseEl = document.getElementById("ai-response");
  if (!prompt) return;
  responseEl.style.display = "block";
  responseEl.innerHTML = '<span class="spinner"></span> Thinking';
  try {
    const data = await Api.aiChat(prompt);
    responseEl.textContent = data.response;
  } catch (err) {
    responseEl.textContent = "AI assistant unavailable: " + err.message;
  }
}

async function loadProfile() {
  try {
    const p = await Api.getProfile();
    document.getElementById("p-skintype").value = p.skin_type || "";
    document.getElementById("p-age").value = p.age_group || "";
    document.getElementById("p-allergies").value = p.allergies || "";
    document.getElementById("p-sensitivities").value = p.sensitivities || "";
    document.getElementById("p-lifestyle").value = p.lifestyle_habits || "";
    document.getElementById("p-sleep").value = p.sleep_quality || "";
    document.getElementById("p-water").value = p.water_intake_liters || "";
    document.getElementById("p-env").value = p.environmental_exposure || "";
  } catch (err) {
    toast(err.message, true);
  }
}

async function saveProfile() {
  const payload = {
    skin_type: document.getElementById("p-skintype").value || null,
    age_group: document.getElementById("p-age").value || null,
    allergies: document.getElementById("p-allergies").value || null,
    sensitivities: document.getElementById("p-sensitivities").value || null,
    lifestyle_habits: document.getElementById("p-lifestyle").value || null,
    sleep_quality: document.getElementById("p-sleep").value ? parseInt(document.getElementById("p-sleep").value) : null,
    water_intake_liters: document.getElementById("p-water").value ? parseFloat(document.getElementById("p-water").value) : null,
    environmental_exposure: document.getElementById("p-env").value || null,
  };
  try {
    await Api.updateProfile(payload);
    toast("Profile saved.");
  } catch (err) {
    toast(err.message, true);
  }
}

async function loadRecommendations() {
  const el = document.getElementById("recommendations-list");
  el.innerHTML = '<div class="muted">Loading</div>';
  try {
    const recs = await Api.myRecommendations();
    if (!recs.length) {
      el.innerHTML = '<div class="empty-state">No recommendations yet from your consultant or dermatologist.</div>';
      return;
    }
    el.innerHTML = recs.map((r) => `
      <div class="list-row">
        <div>${r.recommendation_text}</div>
        <div class="muted" style="font-size:0.78rem;">${new Date(r.created_at).toLocaleDateString()}</div>
      </div>
    `).join("");
  } catch (err) {
    el.innerHTML = "";
    toast(err.message, true);
  }
}
