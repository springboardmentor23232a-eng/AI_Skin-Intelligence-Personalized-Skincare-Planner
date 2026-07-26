/**
 * Editorial Dashboard View Renderers for PanaceaAI Platform
 * Inspired by Dribbble Eyehealth AI Editorial Design System
 */

import { MOCK_USER_DATA, MOCK_CONSULTANT_DATA, MOCK_DERMATOLOGIST_DATA, MOCK_ADMIN_DATA, MOCK_ROLES } from './mockData.js';

export function renderLandingPage() {
  return `
    <div class="editorial-container">
      <!-- HERO SECTION -->
      <section class="hero-split-section">
        <div class="hero-bg-blur"></div>
        <div class="hero-text-col">
          <div class="section-tag-pill">• AI SKIN HEALTH SCAN</div>
          <h1 class="editorial-hero-title">Check Your Skin Health in Seconds</h1>
          <p class="editorial-hero-subtitle">
            Upload a photo of your skin, our AI detects early signs, scores barrier health, and recommends the right personalized routine.
          </p>
          <div class="hero-actions-row">
            <button class="btn btn-primary" onclick="window.app.openModal('assessment-modal')">START SKIN SCAN</button>
            <a href="#how-it-works" class="btn btn-outline">HOW IT WORKS</a>
          </div>
          <div class="security-foot-note">
            🔒 Your photos and skin data stay 100% private & protected.
          </div>
        </div>

        <div class="hero-visual-col">
          <div class="skin-scan-viewport" style="background-image: url('assets/hero_skin_scan.png'); background-size: cover; background-position: center;">
            <div class="scan-pulse-badge">
              <span class="pulse-dot"></span> SCANNING OPTICAL BIOMARKERS
            </div>
            
            <div class="scan-target-overlay">
              <div class="scan-line"></div>
            </div>

            <!-- Telemetry HUD Box -->
            <div class="telemetry-hud-box">
              <div class="hud-item"><small>LAST SCAN</small> <strong>24 NOVEMBER 2025</strong></div>
              <div class="hud-divider"></div>
              <div class="hud-metric-row">
                <span>HYDRATION</span>
                <strong>72%</strong>
              </div>
              <div class="hud-metric-row">
                <span>BARRIER SCORE</span>
                <strong>85%</strong>
              </div>
              <div class="hud-metric-row">
                <span>UV EXPOSURE</span>
                <strong>MODERATE</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- REPLACED SECTION: INGREDIENT INTELLIGENCE & CLINICAL METRICS MATRIX -->
      <section id="features" class="ingredients-matrix-section section-margin-lg">
        <div class="section-tag-pill">• INGREDIENT INTELLIGENCE</div>
        <div class="doctors-header-row">
          <div>
            <h2 class="editorial-section-title">Clinical Ingredient & Safety Matrix</h2>
            <p class="editorial-section-subtitle">Real-time allergen detection, active component compatibility, and bio-suitability scoring.</p>
          </div>
          <button class="btn btn-pink" onclick="window.app.openModal('ingredient-modal')">🧪 Check Interactions</button>
        </div>
        
        <div class="products-grid">
          <div class="glass-card">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🧬</div>
            <span class="badge badge-accent" style="margin-bottom: 0.5rem;">BARRIER REPAIR</span>
            <h3 style="font-family: 'Playfair Display', serif; font-size: 1.25rem; margin-bottom: 0.35rem;">Ceramides NP / AP</h3>
            <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 0.75rem;">Restores lipid barrier hydration and protects sensitive skin against environmental stressors.</p>
            <small style="color: var(--gold-primary); font-weight: 700;">Safe for: Sensitive, Combination, Dry Skin</small>
          </div>

          <div class="glass-card">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">💧</div>
            <span class="badge badge-success" style="margin-bottom: 0.5rem;">HYDRATION BOOST</span>
            <h3 style="font-family: 'Playfair Display', serif; font-size: 1.25rem; margin-bottom: 0.35rem;">Multi-Molecular Hyaluronic Acid</h3>
            <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 0.75rem;">Penetrates multiple epidermal layers to bind up to 1000x its weight in moisture.</p>
            <small style="color: var(--gold-primary); font-weight: 700;">Safe for: All Skin Types</small>
          </div>

          <div class="glass-card">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🧪</div>
            <span class="badge badge-user" style="margin-bottom: 0.5rem;">PORE CLARIFYING</span>
            <h3 style="font-family: 'Playfair Display', serif; font-size: 1.25rem; margin-bottom: 0.35rem;">2% Salicylic Acid (BHA)</h3>
            <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 0.75rem;">Lipophilic acid that exfoliates inside pore walls to clear congestion and blackheads.</p>
            <small style="color: var(--gold-primary); font-weight: 700;">Best for: Oily & Acne-Prone Skin</small>
          </div>

          <div class="glass-card">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">✨</div>
            <span class="badge badge-dermatologist" style="margin-bottom: 0.5rem;">BRIGHTENING & TONE</span>
            <h3 style="font-family: 'Playfair Display', serif; font-size: 1.25rem; margin-bottom: 0.35rem;">10% Niacinamide (Vitamin B3)</h3>
            <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 0.75rem;">Fades post-inflammatory hyperpigmentation, reduces redness, and balances sebum production.</p>
            <small style="color: var(--gold-primary); font-weight: 700;">Safe for: Redness & Hyperpigmentation</small>
          </div>
        </div>
      </section>

      <!-- SECTION 2: YOUR SKIN HEALTH CLEARLY EXPLAINED -->
      <section id="how-it-works" class="split-explain-section section-margin-lg">
        <div class="explain-text-col">
          <div class="section-tag-pill">• HOW IT WORKS</div>
          <h2 class="editorial-section-title">Your Skin Health, Clearly Explained</h2>
          <p class="editorial-section-subtitle" style="margin-bottom: 1.5rem;">
            Take a photo or upload an image to receive instant diagnostic insights and ingredient recommendations.
          </p>

          <div class="upload-dropzone-card" onclick="window.app.triggerUploadSimulation()">
            <div class="upload-icon">📤</div>
            <div class="upload-title">UPLOAD YOUR SKIN PHOTO</div>
            <p class="upload-desc">Take a close-up photo or select one from your gallery.</p>
            <button class="btn btn-sm btn-outline" style="margin-top: 0.85rem;">Select File</button>
          </div>
        </div>

        <div class="explain-graphic-col">
          <div class="iris-scanner-graphic" style="background-image: url('assets/explain_skin_texture.png'); background-size: cover; background-position: center; border-radius: 50%; box-shadow: 0 10px 30px rgba(0,0,0,0.15);">
            <div class="radar-circle outer"></div>
            <div class="radar-circle middle"></div>
            <div class="radar-circle inner"></div>
            <div class="radar-center-dot"></div>
          </div>
        </div>
      </section>

      <!-- SECTION 3: GET YOUR SKIN HEALTH INSIGHTS -->
      <section class="dark-banner-card section-margin-lg">
        <div class="dark-banner-content">
          <div>
            <h2 class="dark-banner-title">Get Your Skin Health Insights in Seconds</h2>
            <p class="dark-banner-desc">
              Our scanner uses advanced optical biomarkers to give you a clear snapshot of your skin health. No appointments, no waiting rooms, just instant, helpful insights you can trust.
            </p>
            <button class="btn btn-primary" onclick="window.app.openModal('assessment-modal')">TRY THE SCAN</button>
          </div>
          <div class="dark-banner-portrait-box">
            <img src="assets/dark_banner_portrait.png" alt="Skin Optical Scan Portrait" class="dark-banner-img">
            <div class="portrait-overlay-tag">📷 OPTICAL SCANNER ACTIVE</div>
          </div>
        </div>
      </section>

      <!-- SECTION 4: CONSULT A CERTIFIED DERMATOLOGIST -->
      <section id="consult-doctors" class="doctors-section section-margin-lg">
        <div class="section-tag-pill">• DOCTOR</div>
        <div class="doctors-header-row">
          <div>
            <h2 class="editorial-section-title">Consult a Certified Dermatologist</h2>
            <p class="editorial-section-subtitle">When you need a professional opinion, connect directly with licensed dermatologists.</p>
          </div>
          <button class="btn btn-outline" onclick="window.app.selectRole('dermatologist')">Clinical Portal →</button>
        </div>

        <div class="doctors-grid">
          <div class="doctor-card">
            <div class="doctor-img-box">
              <img src="assets/doctor_sarah.png" alt="Dr. Sarah Johnson" class="doctor-img">
              <span class="badge badge-success status-tag">🟢 Available</span>
            </div>
            <div class="doctor-info">
              <h3>Dr. Sarah Johnson</h3>
              <span class="doctor-spec">DERMATOLOGIST</span>
              <p class="doctor-exp">4 years experience</p>
              <button class="btn-link" onclick="alert('Connecting with Dr. Sarah Johnson...')">CONSULT NOW &gt;</button>
            </div>
          </div>

          <div class="doctor-card">
            <div class="doctor-img-box">
              <img src="assets/doctor_michael.png" alt="Dr. Michael Chen" class="doctor-img">
              <span class="badge badge-success status-tag">🟢 Available</span>
            </div>
            <div class="doctor-info">
              <h3>Dr. Michael Chen</h3>
              <span class="doctor-spec">SKIN & LASER SPECIALIST</span>
              <p class="doctor-exp">15 years experience</p>
              <button class="btn-link" onclick="alert('Connecting with Dr. Michael Chen...')">CONSULT NOW &gt;</button>
            </div>
          </div>

          <div class="doctor-card">
            <div class="doctor-img-box">
              <img src="assets/doctor_emily.png" alt="Dr. Emily Roberts" class="doctor-img">
              <span class="badge badge-success status-tag">🟢 Available</span>
            </div>
            <div class="doctor-info">
              <h3>Dr. Emily Roberts</h3>
              <span class="doctor-spec">COSMETIC DERMATOLOGIST</span>
              <p class="doctor-exp">12 years experience</p>
              <button class="btn-link" onclick="alert('Connecting with Dr. Emily Roberts...')">CONSULT NOW &gt;</button>
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION 5: CONSULTATION BENEFITS & PRICING -->
      <section class="benefits-pricing-section section-margin-lg">
        <div class="benefits-col">
          <div class="section-tag-pill">• CONSULTATIONS</div>
          <h2 class="editorial-section-title" style="margin-bottom: 2rem;">Consultation Benefits</h2>
          
          <div class="benefit-item">
            <h4>FAST RESPONSE</h4>
            <p>Get matched with a doctor quickly so you can receive guidance without long waiting times.</p>
          </div>

          <div class="benefit-item">
            <h4>VIDEO OR CHAT CONSULTATION</h4>
            <p>Choose flexible video calls or asynchronous messaging for convenient care.</p>
          </div>

          <div class="benefit-item">
            <h4>FOLLOW-UP MESSAGES INCLUDED</h4>
            <p>Ask clarifying questions after your appointment at no extra cost.</p>
          </div>

          <div class="benefit-item">
            <h4>PRESCRIPTION-READY (IF NEEDED)</h4>
            <p>Receive digital prescriptions directly into your PanaceaAI patient dashboard.</p>
          </div>
        </div>

        <div class="pricing-card-col">
          <div class="pricing-box">
            <small style="text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em; color: var(--text-muted); font-weight: 700;">• CONSULTATIONS</small>
            <div class="price-val">Starting at <span>$3</span></div>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem;">per session. Get expert skincare guidance at an affordable price.</p>

            <button class="btn btn-primary" style="width: 100%; margin-bottom: 0.75rem;" onclick="window.app.selectRole('dermatologist')">CONSULT A DOCTOR</button>
            <button class="btn btn-outline" style="width: 100%;" onclick="alert('Displaying 14 available dermatologists on duty.')">VIEW MORE DOCTORS &gt;</button>
          </div>
        </div>
      </section>
    </div>
  `;
}

export function renderUserDashboard() {
  const data = MOCK_USER_DATA;
  
  const totalSteps = data.routine.morning.length + data.routine.evening.length;
  const completedSteps = data.routine.morning.filter(s => s.completed).length + data.routine.evening.filter(s => s.completed).length;
  const routinePct = Math.round((completedSteps / totalSteps) * 100);

  return `
    <div class="dashboard-wrapper">
      <div class="dashboard-header">
        <div>
          <h2>Welcome back, ${data.profile.name} 👋</h2>
          <p class="text-muted">Skin Profile: <strong>${data.profile.skinType}</strong> | Age: ${data.profile.ageGroup}</p>
        </div>
        <div style="display: flex; gap: 0.75rem;">
          <button class="btn btn-primary btn-sm" onclick="window.app.openModal('assessment-modal')">✨ Take AI Assessment Survey</button>
          <button class="btn btn-pink btn-sm" onclick="window.app.openModal('ingredient-modal')">🧪 Ingredient Checker</button>
        </div>
      </div>

      <div class="dashboard-grid">
        <!-- Skin Health Score Widget -->
        <div class="glass-card score-card">
          <div class="card-header">
            <h3>Weighted Skin Health Score</h3>
            <span class="badge badge-success">${data.skinScore.changeThisWeek}</span>
          </div>
          
          <div class="score-display-container">
            <div class="score-circle" style="--score-pct: ${data.skinScore.overall}%;">
              <div class="score-number">${data.skinScore.overall}</div>
              <div class="score-label">out of 100</div>
            </div>
            <div class="score-info">
              <h4 class="score-grade">${data.skinScore.grade}</h4>
              <p class="score-desc">Recalculated live across 5 health factors.</p>
            </div>
          </div>

          <div class="score-breakdown-list">
            ${data.skinScore.breakdown.map(item => `
              <div class="breakdown-item">
                <div class="breakdown-label">
                  <span>${item.name} <small class="text-muted">(${item.weight})</small></span>
                  <span>${item.score}/100</span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" style="width: ${item.score}%; background: var(--gold-gradient);"></div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Interactive Trackers -->
          <div class="tracker-row">
            <div class="tracker-box">
              <small style="color: var(--text-muted); font-weight: 700;">💧 Daily Hydration Tracker</small>
              <div class="tracker-val">${data.hydrationMl} <small style="font-size: 0.9rem;">ml</small></div>
              <button class="btn btn-sm btn-pink" style="width: 100%; font-size: 0.75rem;" onclick="window.app.addHydration(250)">+250ml Water 💧</button>
            </div>

            <div class="tracker-box">
              <small style="color: var(--text-muted); font-weight: 700;">🌙 Routine Progress Ring</small>
              <div class="tracker-val" style="color: var(--pink-blush);">${routinePct}%</div>
              <small class="text-muted">${completedSteps} of ${totalSteps} steps completed today</small>
            </div>
          </div>
        </div>

        <!-- AM / PM Routine Checklist -->
        <div class="glass-card routine-card">
          <div class="card-header">
            <h3>Today's Skincare Checklist</h3>
            <div class="routine-tabs">
              <button class="tab-btn active" id="tab-am" onclick="window.app.switchRoutineTab('am')">Morning (AM)</button>
              <button class="tab-btn" id="tab-pm" onclick="window.app.switchRoutineTab('pm')">Evening (PM)</button>
            </div>
          </div>

          <div id="routine-list-am" class="routine-step-list">
            ${data.routine.morning.map(item => `
              <div class="step-item ${item.completed ? 'completed' : ''}" onclick="window.app.toggleStep('morning', '${item.id}')">
                <div class="step-checkbox">${item.completed ? '✓' : ''}</div>
                <div class="step-icon" style="font-size: 1.2rem;">${item.icon}</div>
                <div class="step-details">
                  <span class="step-type">${item.step}</span>
                  <h4 class="step-title">${item.title}</h4>
                </div>
                <div class="step-time">${item.time}</div>
              </div>
            `).join('')}
          </div>

          <div id="routine-list-pm" class="routine-step-list hidden">
            ${data.routine.evening.map(item => `
              <div class="step-item ${item.completed ? 'completed' : ''}" onclick="window.app.toggleStep('evening', '${item.id}')">
                <div class="step-checkbox">${item.completed ? '✓' : ''}</div>
                <div class="step-icon" style="font-size: 1.2rem;">${item.icon}</div>
                <div class="step-details">
                  <span class="step-type">${item.step}</span>
                  <h4 class="step-title">${item.title}</h4>
                </div>
                <div class="step-time">${item.time}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Recommended Products Grid -->
      <div class="glass-card section-margin">
        <div class="card-header">
          <h3>AI Matched Skincare Products</h3>
          <button class="btn btn-sm btn-outline" onclick="alert('FAISS Vector embeddings updated dynamically!')">🔄 Refresh Matches</button>
        </div>
        <div class="products-grid">
          ${data.recommendedProducts.map(p => `
            <div class="product-card">
              <div>
                <div class="product-header">
                  <span class="badge badge-accent">${p.badge}</span>
                  <span class="match-score">${p.matchScore} Match</span>
                </div>
                <h4 class="product-name">${p.name}</h4>
                <p class="product-cat">${p.category} • <strong>${p.price}</strong></p>
                <div class="product-ingredients">
                  <small style="color: var(--text-muted);">Key Active Ingredients:</small>
                  <div class="tag-cloud">
                    ${p.keyIngredients.map(ing => `<span class="tag">${ing}</span>`).join('')}
                  </div>
                </div>
                <p class="product-reason">💡 ${p.reason}</p>
              </div>
              <button class="btn btn-sm btn-secondary" style="width: 100%; margin-top: 0.75rem;" onclick="window.app.addProductToRoutine('${p.name}', '${p.category}')">+ Add to Morning Routine</button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

export function renderConsultantDashboard() {
  const data = MOCK_CONSULTANT_DATA;
  return `
    <div class="dashboard-wrapper">
      <div class="dashboard-header">
        <div>
          <h2>Consultant Workspace — ${MOCK_ROLES.CONSULTANT.name}</h2>
          <p class="text-muted">Manage clients, evaluate assessments & build personalized regimens</p>
        </div>
        <button class="btn btn-primary" onclick="alert('Opening client assessment review drawer...')">+ New Client Review</button>
      </div>

      <div class="metrics-row">
        <div class="metric-card">
          <div class="metric-value">${data.pendingReviews}</div>
          <div class="metric-label">Pending Assessment Reviews</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${data.routinesCreatedThisMonth}</div>
          <div class="metric-label">Routines Created This Month</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${data.clientSatisfactionRate}</div>
          <div class="metric-label">Client Satisfaction Rating</div>
        </div>
      </div>

      <div class="glass-card section-margin">
        <div class="card-header">
          <h3>Active Client Roster & Assessment Queue</h3>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Skin Type Profile</th>
                <th>Last Assessment</th>
                <th>Health Score</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${data.clients.map(c => `
                <tr>
                  <td><strong>${c.name}</strong><br><small class="text-muted">ID: ${c.id}</small></td>
                  <td>${c.skinType}</td>
                  <td>${c.lastAssessment}</td>
                  <td><span class="score-pill">${c.score}/100</span></td>
                  <td><span class="badge ${c.status.includes('Needs') ? 'badge-warning' : 'badge-success'}">${c.status}</span></td>
                  <td><span style="font-weight: 700; color: ${c.priority === 'High' ? 'var(--accent-rose)' : 'var(--text-muted)'}">${c.priority}</span></td>
                  <td>
                    <button class="btn btn-sm btn-outline" onclick="alert('Viewing detailed assessment report for ${c.name}')">View Assessment</button>
                    <button class="btn btn-sm btn-pink" onclick="alert('Assigning new routine template for ${c.name}')">Assign Routine</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

export function renderDermatologistDashboard() {
  const data = MOCK_DERMATOLOGIST_DATA;
  return `
    <div class="dashboard-wrapper">
      <div class="dashboard-header">
        <div>
          <h2>Clinical Skincare Portal — ${MOCK_ROLES.DERMATOLOGIST.name}</h2>
          <p class="text-muted">Medical skin diagnosis, prescription oversight, and clinical safety compliance</p>
        </div>
        <span class="badge badge-dermatologist">Board-Certified Access</span>
      </div>

      <div class="metrics-row">
        <div class="metric-card">
          <div class="metric-value">${data.activeTreatmentsCount}</div>
          <div class="metric-label">Active Clinical Treatments</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${data.urgentConsultations}</div>
          <div class="metric-label">Urgent Case Consultations</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${data.clinicalReportsCount}</div>
          <div class="metric-label">Clinical Reports Pending Signoff</div>
        </div>
      </div>

      <div class="glass-card section-margin">
        <div class="card-header">
          <h3>Patient Clinical Diagnoses & Medical Prescriptions</h3>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Diagnosed Clinical Condition</th>
                <th>Last Clinical Visit</th>
                <th>Active Medical Prescription</th>
                <th>Clinical Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${data.patients.map(p => `
                <tr>
                  <td><strong>${p.name}</strong><br><small class="text-muted">ID: ${p.id}</small></td>
                  <td><span class="badge badge-accent">${p.condition}</span></td>
                  <td>${p.lastVisit}</td>
                  <td><code style="color: var(--gold-primary); font-weight: 700;">${p.prescription}</code></td>
                  <td><span class="badge badge-success">${p.status}</span></td>
                  <td>
                    <button class="btn btn-sm btn-primary" onclick="alert('Updating clinical prescription for ${p.name}')">Modify Rx</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

export function renderAdminDashboard() {
  const data = MOCK_ADMIN_DATA;
  return `
    <div class="dashboard-wrapper">
      <div class="dashboard-header">
        <div>
          <h2>System Control Center & Architecture Dashboard</h2>
          <p class="text-muted">Real-time monitoring of all 12 microservices, platform analytics, and audit traces</p>
        </div>
        <span class="badge badge-admin">Superadmin Access</span>
      </div>

      <div class="metrics-row">
        <div class="metric-card">
          <div class="metric-value">${data.metrics.totalUsers}</div>
          <div class="metric-label">Total Platform Users</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${data.metrics.assessmentsCompleted}</div>
          <div class="metric-label">AI Assessments Run</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${data.metrics.recommendationAccuracy}</div>
          <div class="metric-label">Rec Accuracy Score</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${data.metrics.systemUptime}</div>
          <div class="metric-label">Microservices Uptime</div>
        </div>
      </div>

      <div class="glass-card section-margin">
        <div class="card-header">
          <h3>⚡ Microservices Layer Monitor (12 Services Operational)</h3>
          <button class="btn btn-sm btn-outline" onclick="alert('FastAPI Gateway ping check executed on 12 microservice endpoints!')">Ping All Endpoints</button>
        </div>
        <div class="microservices-grid">
          ${data.microservices.map(m => `
            <div class="service-status-card">
              <div class="service-header">
                <span class="service-name">${m.name}</span>
                <span class="badge badge-success">● ${m.status}</span>
              </div>
              <div class="service-details">
                <small class="text-muted">Endpoint: <code>${m.endpoint}</code></small>
                <div class="service-metrics">
                  <span>Port: <strong>${m.port}</strong></span>
                  <span>Latency: <strong>${m.latency}</strong></span>
                  <span>Load: <strong>${m.load}</strong></span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="glass-card section-margin">
        <div class="card-header">
          <h3>📋 System Security Logs & Audit Trail</h3>
        </div>
        <div class="audit-list">
          ${data.recentAuditLogs.map(log => `
            <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border-light); font-size: 0.85rem;">
              <span><strong style="color: var(--gold-primary);">${log.time}</strong> • ${log.user}</span>
              <span>${log.event}</span>
              <span class="badge badge-success">${log.status}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
