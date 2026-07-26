/**
 * Dashboard View Renderers for AI Skin Intelligence Platform
 */

import { MOCK_USER_DATA, MOCK_CONSULTANT_DATA, MOCK_DERMATOLOGIST_DATA, MOCK_ADMIN_DATA, MOCK_ROLES } from './mockData.js';

export function renderLandingPage() {
  return `
    <div class="landing-container">
      <section class="hero-section">
        <div class="hero-badge">✨ AI-Powered Skincare Intelligence</div>
        <h1 class="hero-title">Personalized Skincare Intelligence & Routine Planner</h1>
        <p class="hero-subtitle">
          An advanced platform analyzing skin profiles, lifestyle habits, sleep patterns, and environmental exposures to deliver clinical-grade skincare routines and ingredient intelligence.
        </p>
        <div class="hero-actions">
          <button class="btn btn-primary" onclick="window.app.openLoginModal()">🚀 Launch Role Demo</button>
          <a href="#features" class="btn btn-outline">Learn Platform Capabilities</a>
        </div>
      </section>

      <section class="role-selector-section">
        <h2 class="section-title">Select a Role to Explore the Dashboard</h2>
        <p class="section-subtitle">Experience custom-tailored interfaces for every stakeholder in the skincare ecosystem.</p>
        
        <div class="role-grid">
          <div class="role-card" onclick="window.app.selectRole('user')">
            <div class="role-icon">👤</div>
            <h3>DermaCare User</h3>
            <span class="badge badge-user">Consumer Role</span>
            <p>Track weighted skin health score, manage AM/PM routines, check off daily habits, and discover matched products.</p>
            <button class="btn btn-sm btn-secondary">Enter User Portal →</button>
          </div>

          <div class="role-card" onclick="window.app.selectRole('consultant')">
            <div class="role-icon">💼</div>
            <h3>Skincare Consultant</h3>
            <span class="badge badge-consultant">Consultant Role</span>
            <p>Review client assessment reports, evaluate ingredient safety, and construct custom skincare routines.</p>
            <button class="btn btn-sm btn-secondary">Enter Consultant Portal →</button>
          </div>

          <div class="role-card" onclick="window.app.selectRole('dermatologist')">
            <div class="role-icon">🩺</div>
            <h3>Dermatologist</h3>
            <span class="badge badge-dermatologist">Clinical Role</span>
            <p>Diagnose severe skin conditions, manage medical prescriptions, and analyze clinical treatment progress.</p>
            <button class="btn btn-sm btn-secondary">Enter Clinical Portal →</button>
          </div>

          <div class="role-card" onclick="window.app.selectRole('admin')">
            <div class="role-icon">🛡️</div>
            <h3>Platform Admin</h3>
            <span class="badge badge-admin">System Role</span>
            <p>Monitor 12 microservices in real-time, view system latency, manage user roles, and inspect audit logs.</p>
            <button class="btn btn-sm btn-secondary">Enter Admin Center →</button>
          </div>
        </div>
      </section>

      <section id="features" class="features-section">
        <h2 class="section-title">Core Intelligence Modules</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h4>Weighted Skin Health Engine</h4>
            <p>Computes holistic scores based on Condition (35%), Lifestyle (20%), Sleep (15%), Consistency (20%), and Hydration (10%).</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🧪</div>
            <h4>Ingredient Safety & Interaction</h4>
            <p>Detects allergens, contraindications, and active component conflicts (e.g. Vitamin C vs Retinol timings).</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🧴</div>
            <h4>Personalized Routine Planner</h4>
            <p>Generates adaptive Morning, Evening, and Weekly treatment plans tailored to climate and skin sensitivity.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🤖</div>
            <h4>Vector Product Matching</h4>
            <p>Matches products via FAISS embeddings based on suitability scoring and price budget optimization.</p>
          </div>
        </div>
      </section>
    </div>
  `;
}

export function renderUserDashboard() {
  const data = MOCK_USER_DATA;
  return `
    <div class="dashboard-wrapper">
      <div class="dashboard-header">
        <div>
          <h2>Welcome back, ${data.profile.name} 👋</h2>
          <p class="text-muted">Skin Profile: <strong>${data.profile.skinType}</strong> | Age: ${data.profile.ageGroup}</p>
        </div>
        <div class="header-badge">
          <span class="pulse-dot"></span> Active Routine Sync Enabled
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
            <div class="score-circle">
              <div class="score-number">${data.skinScore.overall}</div>
              <div class="score-label">out of 100</div>
            </div>
            <div class="score-info">
              <h4 class="score-grade">${data.skinScore.grade}</h4>
              <p class="score-desc">Calculated across 5 holistic health metrics.</p>
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
                  <div class="progress-bar-fill" style="width: ${item.score}%; background-color: ${item.color};"></div>
                </div>
              </div>
            `).join('')}
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
                <div class="step-icon">${item.icon}</div>
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
                <div class="step-icon">${item.icon}</div>
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
          <button class="btn btn-sm btn-outline" onclick="alert('Vector similarity search re-calculated using FAISS!')">🔄 Refresh Matches</button>
        </div>
        <div class="products-grid">
          ${data.recommendedProducts.map(p => `
            <div class="product-card">
              <div class="product-header">
                <span class="badge badge-accent">${p.badge}</span>
                <span class="match-score">${p.matchScore} Match</span>
              </div>
              <h4 class="product-name">${p.name}</h4>
              <p class="product-cat">${p.category} • <strong>${p.price}</strong></p>
              <div class="product-ingredients">
                <small>Key Active Ingredients:</small>
                <div class="tag-cloud">
                  ${p.keyIngredients.map(ing => `<span class="tag">${ing}</span>`).join('')}
                </div>
              </div>
              <p class="product-reason">💡 ${p.reason}</p>
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
        <button class="btn btn-primary" onclick="alert('Creating new client assessment workflow...')">+ New Client Assessment</button>
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
          <input type="text" class="input-search" placeholder="Search clients by name or skin type..." oninput="console.log('Searching...')">
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
                  <td><span class="priority-${c.priority.toLowerCase()}">${c.priority}</span></td>
                  <td>
                    <button class="btn btn-sm btn-outline" onclick="alert('Opening assessment report for ${c.name}')">View Assessment</button>
                    <button class="btn btn-sm btn-secondary" onclick="alert('Opening routine editor for ${c.name}')">Edit Routine</button>
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
        <span class="badge badge-dermatologist">Clinical Access Granted</span>
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
          <h3>Patient Clinical Diagnoses & Active Prescriptions</h3>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Diagnosed Clinical Condition</th>
                <th>Last Visit</th>
                <th>Active Medical Prescription</th>
                <th>Clinical Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${data.patients.map(p => `
                <tr>
                  <td><strong>${p.name}</strong><br><small class="text-muted">ID: ${p.id}</small></td>
                  <td><span class="condition-tag">${p.condition}</span></td>
                  <td>${p.lastVisit}</td>
                  <td><code>${p.prescription}</code></td>
                  <td><span class="badge badge-success">${p.status}</span></td>
                  <td>
                    <button class="btn btn-sm btn-primary" onclick="alert('Opening clinical chart for ${p.name}')">Update Chart</button>
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
          <p class="text-muted">Real-time status of 12 microservices, platform metrics, and security logs</p>
        </div>
        <span class="badge badge-admin">Superadmin Mode</span>
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
          <h3>⚡ Microservices Layer Monitor (12 Services Active)</h3>
          <button class="btn btn-sm btn-outline" onclick="alert('Ping sent to FastAPI Gateway load balancer!')">Ping All Endpoints</button>
        </div>
        <div class="microservices-grid">
          ${data.microservices.map(m => `
            <div class="service-status-card">
              <div class="service-header">
                <span class="service-name">${m.name}</span>
                <span class="badge badge-success">● ${m.status}</span>
              </div>
              <div class="service-details">
                <small>Endpoint: <code>${m.endpoint}</code></small>
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
          <h3>📋 Audit Logs & Security Traces</h3>
        </div>
        <div class="audit-list">
          ${data.recentAuditLogs.map(log => `
            <div class="audit-item">
              <span class="audit-time">${log.time}</span>
              <span class="audit-user"><strong>${log.user}</strong></span>
              <span class="audit-event">${log.event}</span>
              <span class="badge badge-success">${log.status}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
