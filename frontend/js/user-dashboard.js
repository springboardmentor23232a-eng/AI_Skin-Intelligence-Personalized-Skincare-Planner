const user = Session.requireRole(["user", "admin"]);
document.getElementById("user-name-header").textContent = user ? `, ${user.full_name.split(" ")[0]}` : "";

// ---------------- TAB NAVIGATION ----------------
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
    document.querySelectorAll("main > section").forEach((s) => (s.style.display = "none"));
    document.getElementById(`tab-${link.dataset.tab}`).style.display = "block";
    if (link.dataset.tab === "routine") loadRoutines();
    if (link.dataset.tab === "checklist") loadChecklist();
    if (link.dataset.tab === "products") loadProducts();
    if (link.dataset.tab === "progress") { loadProgressTrend(); loadProgressAnalytics(); }
    if (link.dataset.tab === "scoring-engine") loadScoringEngine();
    if (link.dataset.tab === "profile") loadProfile();
    if (link.dataset.tab === "recommendations") loadRecommendations();
    if (link.dataset.tab === "notifications") loadNotifications();
    if (link.dataset.tab === "reports") loadReportsTab();
  });
});

// ---------------- OVERVIEW ----------------
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
      document.getElementById("score-condition").textContent = "No assessment yet — run a skin scan.";
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

// ---------------- SKIN SCAN (Webcam + Upload) ----------------
const webcamBox = document.getElementById("webcam-box");
const btnStartCam = document.getElementById("btn-start-cam");
const btnCapture = document.getElementById("btn-capture");
const btnRetake = document.getElementById("btn-retake");
const btnAnalyze = document.getElementById("btn-analyze");
const fileUpload = document.getElementById("file-upload");
let currentImageSource = null; // 'webcam' | 'upload'

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
  statusEl.innerHTML = '<span class="spinner"></span> Analyzing skin image…';

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
    .map((r) => `<li><strong>${r.risk_name}</strong> (${r.risk_level}) — ${r.description || ""}</li>`)
    .join("") || "<li class='muted'>No risk factors flagged.</li>";

  body.innerHTML = `
    <div class="grid grid-2">
      <div>
        <div class="card-title">Skin Health Score</div>
        <div class="stat-value">${assessment.skin_health_score}</div>
        <div class="stat-label">${assessment.overall_condition} · Detected type: ${assessment.detected_skin_type || "—"}</div>
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

// ---------------- ROUTINE ----------------
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
  listEl.innerHTML = '<div class="muted">Loading…</div>';
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

// ---------------- PRODUCTS ----------------
const CATEGORY_LABELS = {
  face_wash: "Face Wash",
  moisturizer: "Moisturizer",
  sunscreen: "Sunscreen",
  serum: "Serum",
  toner: "Toner",
  treatment: "Treatment Products",
  mask: "Face Masks",
};

let selectedCategory = null;
const compareSelection = new Map(); // id -> {id, name}

async function initCategoryFilters() {
  const wrap = document.getElementById("category-filters");
  if (!wrap || wrap.dataset.loaded) return;
  wrap.dataset.loaded = "1";
  let categories = Object.keys(CATEGORY_LABELS);
  try {
    const res = await Api.productCategories();
    if (res && res.categories && res.categories.length) categories = res.categories;
  } catch (_) { /* fall back to local defaults */ }

  wrap.innerHTML =
    `<button class="chip active" data-cat="">All Products</button>` +
    categories.map((c) => `<button class="chip" data-cat="${c}">${CATEGORY_LABELS[c] || c}</button>`).join("");

  wrap.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      wrap.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      selectedCategory = chip.dataset.cat || null;
      loadProducts();
    });
  });
}

function clearProductFilters() {
  selectedCategory = null;
  document.getElementById("product-budget").value = "";
  const wrap = document.getElementById("category-filters");
  wrap.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
  wrap.querySelector('.chip[data-cat=""]')?.classList.add("active");
  loadProducts();
}

function matchBadgeClass(score) {
  if (score >= 70) return "";
  if (score >= 40) return "mid";
  return "low";
}

async function loadProducts() {
  await initCategoryFilters();
  const listEl = document.getElementById("products-list");
  listEl.innerHTML = '<div class="muted">Loading…</div>';
  const budget = parseFloat(document.getElementById("product-budget")?.value) || null;
  try {
    const products = await Api.recommendedProducts(selectedCategory, budget)
      .catch(() => Api.listProducts(selectedCategory, budget));
    if (!products.length) {
      listEl.innerHTML = '<div class="empty-state">No products match these filters.</div>';
      return;
    }
    listEl.innerHTML = products.map((p) => `
      <div class="card">
        <div class="card-title">${(p.category || "").replace('_',' ')}</div>
        ${p.match_score != null ? `
          <div class="match-badge ${matchBadgeClass(p.match_score)}">${p.match_score}% match</div>
        ` : ""}
        <h3>${p.name}</h3>
        <p class="muted">${p.brand || ""}</p>
        <p>${p.key_ingredients ? "Key ingredients: " + p.key_ingredients : ""}</p>
        ${p.match_reasons && p.match_reasons.length ? `
          <p class="muted" style="font-size:0.8rem;">${p.match_reasons.join(" · ")}</p>
        ` : ""}
        <div style="font-family:var(--font-mono); color:var(--sage-deep); font-weight:600; margin-bottom:10px;">₹${p.price}</div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <label style="display:flex; align-items:center; gap:6px; font-size:0.8rem; color:var(--ink-soft);">
            <input type="checkbox" onchange="toggleCompare('${p.id}', '${p.name.replace(/'/g, "\\'")}', this.checked)"
              ${compareSelection.has(p.id) ? "checked" : ""} /> Compare
          </label>
          <button class="btn btn-outline btn-sm" onclick="showAlternatives('${p.id}')">Alternatives</button>
        </div>
      </div>
    `).join("");
  } catch (err) {
    listEl.innerHTML = "";
    toast(err.message, true);
  }
}

function renderCompareTray() {
  const tray = document.getElementById("compare-tray");
  const items = document.getElementById("compare-tray-items");
  document.getElementById("compare-count").textContent = compareSelection.size;
  if (compareSelection.size === 0) {
    tray.style.display = "none";
    return;
  }
  tray.style.display = "block";
  items.innerHTML = [...compareSelection.values()]
    .map((v) => `<span class="pill pill-low">${v.name}</span>`).join("");
}

function toggleCompare(id, name, checked) {
  if (checked) {
    if (compareSelection.size >= 3) {
      toast("You can compare up to 3 products at a time.", true);
      loadProducts();
      return;
    }
    compareSelection.set(id, { id, name });
  } else {
    compareSelection.delete(id);
  }
  renderCompareTray();
}

function clearCompare() {
  compareSelection.clear();
  renderCompareTray();
  document.getElementById("comparison-panel").style.display = "none";
  loadProducts();
}

async function runCompare() {
  if (compareSelection.size < 2) {
    toast("Select at least 2 products to compare.", true);
    return;
  }
  const panel = document.getElementById("comparison-panel");
  panel.style.display = "block";
  panel.innerHTML = '<div class="muted">Comparing…</div>';
  try {
    const data = await Api.compareProducts([...compareSelection.keys()]);
    const rows = data.attributes.map((attr) => `
      <tr>
        <th>${attr.replace('_', ' ')}</th>
        ${data.products.map((p) => `<td>${p[attr] ?? "—"}</td>`).join("")}
      </tr>
    `).join("");
    panel.innerHTML = `
      <div class="card-title">Product Comparison</div>
      <table class="compare-table">
        <thead><tr><th>Product</th>${data.products.map((p) => `<th>${p.name}</th>`).join("")}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  } catch (err) {
    panel.innerHTML = "";
    toast(err.message, true);
  }
}

async function showAlternatives(productId) {
  const panel = document.getElementById("alternatives-panel");
  panel.style.display = "block";
  panel.innerHTML = '<div class="muted">Finding alternatives…</div>';
  try {
    const alts = await Api.productAlternatives(productId);
    if (!alts.length) {
      panel.innerHTML = '<div class="card-title">Alternatives</div><div class="empty-state">No alternatives found in this category.</div>';
      return;
    }
    panel.innerHTML = `
      <div class="card-title">Alternatives</div>
      <div class="grid grid-3">
        ${alts.map((p) => `
          <div class="card">
            <div class="card-title">${(p.category || "").replace('_',' ')}</div>
            <h3 style="font-size:1rem;">${p.name}</h3>
            <p class="muted">${p.brand || ""}</p>
            <div style="font-family:var(--font-mono); color:var(--sage-deep); font-weight:600;">₹${p.price}</div>
          </div>
        `).join("")}
      </div>
    `;
  } catch (err) {
    panel.innerHTML = "";
    toast(err.message, true);
  }
}

// ---------------- INGREDIENTS ----------------
async function checkIngredients() {
  const raw = document.getElementById("ingredient-input").value.trim();
  const resultsEl = document.getElementById("ingredient-results");
  if (!raw) return;
  const names = raw.split(",").map((n) => n.trim()).filter(Boolean);
  resultsEl.innerHTML = '<div class="muted">Checking…</div>';
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

// ---------------- PROGRESS ----------------
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
      <p>First score: ${data.first_score} → Latest score: ${data.latest_score}</p>
      <ul>${data.logs.map((l) => `<li>${new Date(l.date).toLocaleDateString()}: score ${l.score}, adherence ${l.adherence}%</li>`).join("")}</ul>
    `;
  } catch (err) {
    el.textContent = "";
    toast(err.message, true);
  }
}

// ---------------- PROGRESS ANALYTICS (Module 8) ----------------
function imageUrl(path) {
  if (!path) return null;
  return `${API_BASE}/${path.replace(/\\/g, "/")}`;
}

async function loadProgressAnalytics() {
  const emptyEl = document.getElementById("progress-analytics-empty");
  const bodyEl = document.getElementById("progress-analytics-body");
  try {
    const data = await Api.getProgressAnalytics();
    emptyEl.style.display = "none";
    bodyEl.style.display = "block";

    // 1. Skin progress monitoring
    const monitoring = data.skin_progress_monitoring || [];
    document.getElementById("pa-monitoring").innerHTML = monitoring.length
      ? `${monitoring.length} scan(s) logged.<br>` +
        monitoring.map((m) => `${new Date(m.date).toLocaleDateString()}: score ${m.skin_health_score} (${m.overall_condition || "-"})`).join("<br>")
      : "No scans yet.";

    // 2. Routine adherence tracking
    const adh = data.routine_adherence_tracking || {};
    document.getElementById("pa-adherence").innerHTML = adh.latest_pct != null
      ? `Latest: ${adh.latest_pct}% &middot; Average: ${adh.average_pct}% &middot; Trend: <strong style="text-transform:capitalize;">${adh.trend}</strong>`
      : "No adherence logs yet.";

    // 3. Improvement analysis
    const imp = data.improvement_analysis || {};
    document.getElementById("pa-improvement").innerHTML = imp.improvement_score != null
      ? `Score: ${Math.round(imp.improvement_score)}/100 &middot; Trend: <strong style="text-transform:capitalize;">${imp.trend}</strong>` +
        (imp.baseline_score != null ? ` &middot; vs baseline ${imp.baseline_score}` : "")
      : "Not enough data yet.";

    // 5. Trend analysis
    const trend = data.trend_analysis || {};
    document.getElementById("pa-trend").innerHTML = trend.direction && trend.direction !== "no_data"
      ? `Direction: <strong style="text-transform:capitalize;">${trend.direction}</strong> &middot; Slope: ${trend.slope_per_assessment}/scan<br>` +
        `First: ${trend.first_score} &rarr; Latest: ${trend.latest_score}`
      : "Not enough data yet.";

    // 4. Before/after comparison
    const ba = data.before_after;
    const baWrap = document.getElementById("pa-before-after");
    const baEmpty = document.getElementById("pa-before-after-empty");
    if (ba) {
      baEmpty.style.display = "none";
      baWrap.style.display = "grid";
      const beforeImg = document.getElementById("pa-before-img");
      const afterImg = document.getElementById("pa-after-img");
      const beforeUrl = imageUrl(ba.before.image_path);
      const afterUrl = imageUrl(ba.after.image_path);
      beforeImg.style.display = beforeUrl ? "block" : "none";
      if (beforeUrl) beforeImg.src = beforeUrl;
      afterImg.style.display = afterUrl ? "block" : "none";
      if (afterUrl) afterImg.src = afterUrl;
      document.getElementById("pa-before-text").innerHTML =
        `${new Date(ba.before.date).toLocaleDateString()}<br>Score: ${ba.before.score} (${ba.before.overall_condition || "-"})`;
      document.getElementById("pa-after-text").innerHTML =
        `${new Date(ba.after.date).toLocaleDateString()}<br>Score: ${ba.after.score} (${ba.after.overall_condition || "-"})`;
      const change = ba.score_change;
      document.getElementById("pa-score-change").textContent =
        `Score change: ${change > 0 ? "+" : ""}${change}`;
    } else {
      baEmpty.style.display = "block";
      baWrap.style.display = "none";
      document.getElementById("pa-score-change").textContent = "";
    }
  } catch (err) {
    bodyEl.style.display = "none";
    emptyEl.style.display = "block";
  }
}

// ---------------- SKIN HEALTH SCORING ENGINE ----------------
function setBar(barId, valId, score, weightPct) {
  const bar = document.getElementById(barId);
  const val = document.getElementById(valId);
  const pct = Math.max(0, Math.min(100, score));
  bar.style.width = `${pct}%`;
  val.textContent = `${Math.round(score)} / 100 · ${weightPct}%`;
}

async function loadScoringEngine() {
  const emptyEl = document.getElementById("scoring-engine-empty");
  const bodyEl = document.getElementById("scoring-engine-body");
  try {
    const data = await Api.scoringEngineSummary();
    emptyEl.style.display = "none";
    bodyEl.style.display = "block";

    // Overall skin health score (ring)
    const circumference = 264;
    const score = data.skin_health_score || 0;
    const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;
    document.getElementById("se-score-fill").style.strokeDashoffset = offset;
    document.getElementById("se-score-num").textContent = Math.round(score);
    document.getElementById("se-overall-condition").textContent = data.overall_condition || "";

    // Skin improvement scoring
    const imp = data.skin_improvement || {};
    document.getElementById("se-improvement-score").textContent =
      imp.improvement_score != null ? Math.round(imp.improvement_score) : "--";
    const trendLabels = {
      improving: "Improving vs. your first assessment",
      declining: "Declined vs. your first assessment",
      stable: "Stable vs. your first assessment",
      baseline: "This is your baseline — run more scans to track improvement",
    };
    document.getElementById("se-improvement-trend").textContent =
      trendLabels[imp.trend] || "Run more scans to track improvement";

    // Weighted Scoring Model breakdown
    const b = data.breakdown || {};
    setBar("se-condition-bar", "se-condition-val", b.skin_condition_assessment || 0, 35);
    setBar("se-lifestyle-bar", "se-lifestyle-val", b.lifestyle_habits || 0, 20);
    setBar("se-sleep-bar", "se-sleep-val", b.sleep_quality || 0, 15);
    setBar("se-routine-bar", "se-routine-val", b.routine_consistency || 0, 20);
    setBar("se-hydration-bar", "se-hydration-val", b.hydration_level || 0, 10);
  } catch (err) {
    bodyEl.style.display = "none";
    emptyEl.style.display = "block";
  }
}

// ---------------- AI ASSISTANT ----------------
async function askAI() {
  const prompt = document.getElementById("ai-prompt").value.trim();
  const responseEl = document.getElementById("ai-response");
  if (!prompt) return;
  responseEl.style.display = "block";
  responseEl.innerHTML = '<span class="spinner"></span> Thinking…';
  try {
    const data = await Api.aiChat(prompt);
    responseEl.textContent = data.response;
  } catch (err) {
    responseEl.textContent = "AI assistant unavailable: " + err.message;
  }
}

// ---------------- PROFILE ----------------
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

// ---------------- RECOMMENDATIONS ----------------
async function loadRecommendations() {
  const el = document.getElementById("recommendations-list");
  el.innerHTML = '<div class="muted">Loading…</div>';
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

// ---------------- DAILY SKINCARE CHECKLIST (Module 9) ----------------
// Stored client-side (per browser) keyed by calendar date, since it is a
// personal daily habit tracker layered on top of whatever routine steps
// the server has generated — no need for a server round trip per tick.
function todayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function checklistStorageKey(dateStr) {
  return `aiskin_checklist_${user.id}_${dateStr}`;
}

function getChecklistState(dateStr) {
  try {
    const raw = localStorage.getItem(checklistStorageKey(dateStr));
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

function setChecklistState(dateStr, state) {
  localStorage.setItem(checklistStorageKey(dateStr), JSON.stringify(state));
}

function renderChecklistGroup(containerId, routine, state) {
  const el = document.getElementById(containerId);
  if (!routine || !routine.steps.length) {
    el.innerHTML = '<div class="empty-state">No routine generated yet.</div>';
    return;
  }
  el.innerHTML = routine.steps.map((s) => `
    <label class="list-row" style="cursor:pointer; align-items:center;">
      <span>
        <input type="checkbox" data-step="${s.id}" ${state[s.id] ? "checked" : ""}
          onchange="toggleChecklistStep('${s.id}', this.checked)" style="margin-right:10px;" />
        <strong style="text-transform:capitalize;">${s.category.replace('_', ' ')}:</strong> ${s.instruction}
      </span>
    </label>
  `).join("");
}

let checklistRoutines = { morning: null, evening: null };

function computeChecklistSummary() {
  const dateStr = todayKey();
  const state = getChecklistState(dateStr);
  const allSteps = [
    ...(checklistRoutines.morning ? checklistRoutines.morning.steps : []),
    ...(checklistRoutines.evening ? checklistRoutines.evening.steps : []),
  ];
  const total = allSteps.length;
  const done = allSteps.filter((s) => state[s.id]).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById("checklist-pct").textContent = `${pct}%`;

  // Streak: count consecutive prior days (including today, if 100%) that were fully completed.
  let streak = 0;
  for (let i = 0; i < 90; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dayState = getChecklistState(key);
    const dayTotal = total; // approximate against today's routine size
    const dayDone = allSteps.filter((s) => dayState[s.id]).length;
    if (dayTotal > 0 && dayDone === dayTotal) {
      streak++;
    } else {
      break;
    }
  }
  document.getElementById("checklist-streak").textContent = `${streak} day${streak === 1 ? "" : "s"}`;
}

function toggleChecklistStep(stepId, checked) {
  const dateStr = todayKey();
  const state = getChecklistState(dateStr);
  state[stepId] = checked;
  setChecklistState(dateStr, state);
  computeChecklistSummary();
}

async function loadChecklist() {
  document.getElementById("checklist-date").textContent =
    new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  try {
    const routines = await Api.listRoutines();
    checklistRoutines.morning = routines.find((r) => r.routine_type === "morning" && r.is_active) || null;
    checklistRoutines.evening = routines.find((r) => r.routine_type === "evening" && r.is_active) || null;

    const dateStr = todayKey();
    const state = getChecklistState(dateStr);
    renderChecklistGroup("checklist-morning", checklistRoutines.morning, state);
    renderChecklistGroup("checklist-evening", checklistRoutines.evening, state);
    computeChecklistSummary();
  } catch (err) {
    toast(err.message, true);
  }
}

// ---------------- NOTIFICATIONS & REMINDERS (Module 10) ----------------
const NOTIFICATION_LABELS = {
  routine: "Routine",
  replenishment: "Replenishment",
  hydration: "Hydration",
  sleep: "Sleep",
  progress: "Progress Alert",
  platform: "Platform",
  general: "General",
};

async function loadNotifications() {
  const el = document.getElementById("notifications-list");
  el.innerHTML = '<div class="muted">Loading…</div>';
  try {
    const notifications = await Api.listNotifications();
    if (!notifications.length) {
      el.innerHTML = '<div class="empty-state">No notifications yet. Try "Refresh Reminders" above.</div>';
      return;
    }
    el.innerHTML = notifications.map((n) => `
      <div class="list-row">
        <div>
          <span class="pill ${n.category === "progress" ? "pill-moderate" : "pill-low"}" style="margin-right:8px;">
            ${NOTIFICATION_LABELS[n.category] || n.category}
          </span>
          <strong>${n.title}</strong>
          <div class="muted" style="font-size:0.82rem; margin-top:2px;">${n.message}</div>
          <div class="muted" style="font-size:0.75rem;">${new Date(n.created_at).toLocaleString()}</div>
        </div>
        <div>
          ${n.is_read
            ? '<span class="muted">Read</span>'
            : `<button class="btn btn-outline btn-sm" onclick="markNotificationRead('${n.id}')">Mark read</button>`}
        </div>
      </div>
    `).join("");
  } catch (err) {
    el.innerHTML = "";
    toast(err.message, true);
  }
}

async function markNotificationRead(id) {
  try {
    await Api.markNotificationRead(id);
    loadNotifications();
    loadOverview();
  } catch (err) {
    toast(err.message, true);
  }
}

async function generateReminders() {
  try {
    const res = await Api.generateReminders();
    toast(res.created && res.created.length ? `${res.created.length} reminder(s) generated.` : "No new reminders needed right now.");
    loadNotifications();
    loadOverview();
  } catch (err) {
    toast(err.message, true);
  }
}

// ---------------- REPORTS & EXPORT (Module 11) ----------------
const REPORT_TYPES = [
  { key: "skin-assessment", label: "Skin Assessment Report", desc: "Full history of your skin scans, scores, concerns, and risk factors." },
  { key: "routine", label: "Routine Report", desc: "Your current morning/evening skincare routines, step by step." },
  { key: "product-recommendations", label: "Product Recommendation Report", desc: "Products matched to your skin type and concerns." },
  { key: "progress", label: "Progress Report", desc: "Every logged skin-health score and routine-adherence check-in." },
  { key: "skin-health", label: "Skin Health Report", desc: "A one-page summary: latest score, trend, adherence, and top concerns." },
];

function loadReportsTab() {
  const grid = document.getElementById("reports-grid");
  grid.innerHTML = REPORT_TYPES.map((r) => `
    <div class="card">
      <div class="card-title">${r.label}</div>
      <p class="muted" style="font-size:0.85rem; min-height:40px;">${r.desc}</p>
      <div style="display:flex; gap:8px;">
        <button class="btn btn-outline btn-sm" onclick="downloadReport('${r.key}', 'pdf')">Download PDF</button>
        <button class="btn btn-outline btn-sm" onclick="downloadReport('${r.key}', 'excel')">Download Excel</button>
      </div>
    </div>
  `).join("");
}

async function downloadReport(reportType, format) {
  try {
    const ext = format === "pdf" ? "pdf" : "xlsx";
    await Api.downloadReport(reportType, format, `${reportType}_report.${ext}`);
    toast(`${format.toUpperCase()} report downloaded.`);
  } catch (err) {
    toast(err.message, true);
  }
}
