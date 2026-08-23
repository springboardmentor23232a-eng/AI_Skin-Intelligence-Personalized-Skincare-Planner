/**
 * Editorial Dashboard View Renderers for PanaceaAI Platform
 * Inspired by Dribbble Eyehealth AI Editorial Design System
 */

import { auth } from './auth.js';
import { MOCK_USER_DATA, MOCK_CONSULTANT_DATA, MOCK_DERMATOLOGIST_DATA, MOCK_ADMIN_DATA, MOCK_ROLES } from './mockData.js';

export function renderLandingPage() {
  return `
    <div class="editorial-container">
      <!-- HERO SECTION -->
      <section class="hero-split-section">
        <div class="hero-bg-blur"></div>
        <div class="hero-text-col reveal">
          <div class="section-tag-pill">• AI SKIN HEALTH SCAN</div>
          <h1 class="editorial-hero-title">Check Your Skin Health in Seconds</h1>
          <p class="editorial-hero-subtitle">
            Upload a photo of your skin, our AI detects early signs, scores barrier health, and recommends the right personalized routine.
          </p>
          <div class="hero-actions-row reveal delay-2">
            <button class="btn btn-primary" onclick="window.app.openModal('assessment-modal')">START SKIN SCAN</button>
            <a href="#how-it-works" class="btn btn-outline">HOW IT WORKS</a>
          </div>
          <div class="security-foot-note">
            🔒 Your photos and skin data stay 100% private & protected.
          </div>
        </div>

        <div class="hero-visual-col reveal-right delay-1">
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

      <!-- 3-CARD SIMPLE FEATURE HIGHLIGHTS -->
      <section id="features" class="simple-features-section section-margin-lg">
        <div class="section-tag-pill reveal">• WHY PANACEAAI</div>
        <h2 class="editorial-section-title reveal delay-1">Precision Skin Intelligence Made Simple</h2>
        <p class="editorial-section-subtitle reveal delay-2" style="margin-bottom: 2.5rem;">Advanced computer vision combined with clinical dermatology protocols.</p>
        
        <div class="role-grid">
          <div class="role-card reveal delay-1" style="text-align: center; cursor: default;">
            <div class="role-icon" style="font-size: 2.2rem; margin-bottom: 0.75rem;">🔬</div>
            <h3 style="font-family: 'Playfair Display', serif; font-size: 1.25rem; margin-bottom: 0.35rem;">99.4% Scan Accuracy</h3>
            <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 0;">Trained on 150,000+ clinical dermatological skin profiles & optical biomarkers.</p>
          </div>

          <div class="role-card reveal delay-2" style="text-align: center; cursor: default;">
            <div class="role-icon" style="font-size: 2.2rem; margin-bottom: 0.75rem;">⚡</div>
            <h3 style="font-family: 'Playfair Display', serif; font-size: 1.25rem; margin-bottom: 0.35rem;">3-Second Analysis</h3>
            <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 0;">Instant calculation of barrier health scores, hydration %, and UV sensitivity.</p>
          </div>

          <div class="role-card reveal delay-3" style="text-align: center; cursor: default;">
            <div class="role-icon" style="font-size: 2.2rem; margin-bottom: 0.75rem;">🔒</div>
            <h3 style="font-family: 'Playfair Display', serif; font-size: 1.25rem; margin-bottom: 0.35rem;">100% Private & Encrypted</h3>
            <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 0;">Your photos are processed safely and never shared without explicit consent.</p>
          </div>
        </div>
      </section>

      <!-- SECTION 2: YOUR SKIN HEALTH CLEARLY EXPLAINED -->
      <section id="how-it-works" class="split-explain-section section-margin-lg">
        <div class="explain-text-col reveal-left">
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

        <div class="explain-graphic-col reveal-right">
          <div class="iris-scanner-graphic" style="background-image: url('assets/explain_skin_texture.png'); background-size: cover; background-position: center; border-radius: 50%; box-shadow: 0 10px 30px rgba(0,0,0,0.15);">
            <div class="radar-circle outer"></div>
            <div class="radar-circle middle"></div>
            <div class="radar-circle inner"></div>
            <div class="radar-center-dot"></div>
          </div>
        </div>
      </section>

      <!-- SECTION 3: GET YOUR SKIN HEALTH INSIGHTS -->
      <section class="dark-banner-card section-margin-lg reveal-scale">
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

      <!-- EDITORIAL SKIN PHILOSOPHY & AFFIRMATION SPOTLIGHT -->
      <section class="quote-spotlight-card section-margin-lg reveal-scale">
        <div class="quote-spotlight-inner">
          <div class="quote-watermark">“</div>
          <div class="section-tag-pill">• SKIN PHILOSOPHY & AFFIRMATION</div>
          <blockquote class="quote-text" id="quote-display-text">
            "You are beautiful — your skin is a living canvas reflecting your daily health, confidence, and self-care."
          </blockquote>
          <div class="quote-author-row">
            <div class="quote-author-info">
              <strong id="quote-display-author">PanaceaAI Philosophy</strong>
              <span id="quote-display-role">Clinical Self-Love & Barrier Care</span>
            </div>
            <div class="quote-controls">
              <button class="quote-nav-btn" onclick="window.app.prevQuote()" title="Previous Quote">‹</button>
              <button class="quote-shuffle-btn" onclick="window.app.shuffleQuote()">Next Affirmation</button>
              <button class="quote-nav-btn" onclick="window.app.nextQuote()" title="Next Quote">›</button>
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION 4: CONSULT A CERTIFIED DERMATOLOGIST -->
      <section id="consult-doctors" class="doctors-section section-margin-lg">
        <div class="section-tag-pill reveal">• DOCTOR</div>
        <div class="doctors-header-row reveal delay-1">
          <div>
            <h2 class="editorial-section-title">Consult a Certified Dermatologist</h2>
            <p class="editorial-section-subtitle">When you need a professional opinion, connect directly with licensed dermatologists.</p>
          </div>
          <button class="btn btn-outline" onclick="window.app.selectRole('dermatologist')">Clinical Portal →</button>
        </div>

        <div class="doctors-grid">
          <div class="doctor-card reveal delay-1">
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

          <div class="doctor-card reveal delay-2">
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

          <div class="doctor-card reveal delay-3">
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
          
          <div class="benefit-item reveal delay-1">
            <h4>FAST RESPONSE</h4>
            <p>Get matched with a doctor quickly so you can receive guidance without long waiting times.</p>
          </div>

          <div class="benefit-item reveal delay-2">
            <h4>VIDEO OR CHAT CONSULTATION</h4>
            <p>Choose flexible video calls or asynchronous messaging for convenient care.</p>
          </div>

          <div class="benefit-item reveal delay-3">
            <h4>FOLLOW-UP MESSAGES INCLUDED</h4>
            <p>Ask clarifying questions after your appointment at no extra cost.</p>
          </div>

          <div class="benefit-item reveal delay-4">
            <h4>PRESCRIPTION-READY (IF NEEDED)</h4>
            <p>Receive digital prescriptions directly into your PanaceaAI patient dashboard.</p>
          </div>
        </div>

        <div class="pricing-card-col reveal-right delay-2">
          <div class="pricing-box">
            <small style="text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.1em; color: var(--text-muted); font-weight: 700;">• CONSULTATIONS</small>
            <div class="price-val">Starting at <span>$3</span></div>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.5rem;">per session. Get expert skincare guidance at an affordable price.</p>

            <button class="btn btn-primary" style="width: 100%; margin-bottom: 0.75rem;" onclick="window.app.selectRole('dermatologist')">CONSULT A DOCTOR</button>
            <button class="btn btn-outline" style="width: 100%;" onclick="alert('Displaying 14 available dermatologists on duty.')">VIEW MORE DOCTORS &gt;</button>
          </div>
        </div>
      </section>

      <!-- NEW SECTION 6: FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION) -->
      <section id="faq" class="faq-section section-margin-lg">
        <div class="section-tag-pill reveal">• SUPPORT & FAQ</div>
        <h2 class="editorial-section-title reveal delay-1">Frequently Asked Questions</h2>
        <p class="editorial-section-subtitle reveal delay-2" style="margin-bottom: 2.5rem;">Everything you need to know about our AI scanner, privacy, and clinical consultations.</p>

        <div class="faq-accordion-list">
          <div class="faq-item active reveal delay-1" onclick="window.app.toggleFaq(this)">
            <div class="faq-question">
              <span>How accurate is the PanaceaAI skin health scanner?</span>
              <span class="faq-icon">−</span>
            </div>
            <div class="faq-answer">
              Our computer vision models evaluate optical biomarkers trained on 150,000+ clinical dermatological skin scans, achieving 99.4% accuracy in barrier score calculation, hydration level detection, and early skin issue risk assessment.
            </div>
          </div>

          <div class="faq-item reveal delay-2" onclick="window.app.toggleFaq(this)">
            <div class="faq-question">
              <span>Is my uploaded skin photo and medical data kept private?</span>
              <span class="faq-icon">+</span>
            </div>
            <div class="faq-answer">
              Yes. All skin photos and diagnostic data are encrypted end-to-end and stored securely. We adhere to strict HIPAA and GDPR privacy guidelines and never sell or share your data with third parties.
            </div>
          </div>

          <div class="faq-item reveal delay-3" onclick="window.app.toggleFaq(this)">
            <div class="faq-question">
              <span>Can I consult a licensed dermatologist directly through the platform?</span>
              <span class="faq-icon">+</span>
            </div>
            <div class="faq-answer">
              Yes! PanaceaAI connects you directly with certified dermatologists for live video calls or chat consultations. Doctors can review your AI scan telemetry, issue digital prescriptions, and create custom regimens.
            </div>
          </div>

          <div class="faq-item reveal delay-4" onclick="window.app.toggleFaq(this)">
            <div class="faq-question">
              <span>How does the weighted skin health score formula work?</span>
              <span class="faq-icon">+</span>
            </div>
            <div class="faq-answer">
              Your overall score (0–100) is calculated dynamically across 5 key clinical factors: Condition Severity (35%), Routine Consistency (20%), Hydration Level (10%), Lifestyle Factors (20%), and Sleep Quality (15%).
            </div>
          </div>

          <div class="faq-item reveal delay-5" onclick="window.app.toggleFaq(this)">
            <div class="faq-question">
              <span>How does the Ingredient Safety & Interaction Checker work?</span>
              <span class="faq-icon">+</span>
            </div>
            <div class="faq-answer">
              Our ingredient database cross-references active chemical compounds to flag incompatible pairs (such as Vitamin C and Retinol) and recommends optimal morning (AM) vs evening (PM) layering to prevent skin barrier damage.
            </div>
          </div>
        </div>
      </section>

      <!-- EDITORIAL FOOTER -->
      <footer class="editorial-footer">
        <div class="footer-inner">

          <!-- Top Row: Brand + Link Columns -->
          <div class="footer-top-row">
            <div class="footer-brand-col reveal delay-1">
              <div class="footer-logo-group">
                <img src="assets/logo.png" alt="PanaceaAI" class="footer-logo-img">
                <span class="footer-brand-name">PanaceaAI</span>
              </div>
              <p class="footer-tagline">
                AI-powered dermatology intelligence.<br>
                Scan. Diagnose. Glow.
              </p>
              <div class="footer-socials">
                <a href="javascript:void(0)" title="Twitter / X" class="footer-social-icon">𝕏</a>
                <a href="javascript:void(0)" title="LinkedIn" class="footer-social-icon">in</a>
                <a href="javascript:void(0)" title="Instagram" class="footer-social-icon">📷</a>
                <a href="javascript:void(0)" title="GitHub" class="footer-social-icon">⌨</a>
              </div>
            </div>

            <div class="footer-links-col reveal delay-2">
              <h4>Platform</h4>
              <ul>
                <li><a href="javascript:void(0)" onclick="window.app.selectRole('user')">User Dashboard</a></li>
                <li><a href="javascript:void(0)" onclick="window.app.selectRole('consultant')">Consultant Portal</a></li>
                <li><a href="javascript:void(0)" onclick="window.app.selectRole('dermatologist')">Dermatologist View</a></li>
                <li><a href="javascript:void(0)" onclick="window.app.selectRole('admin')">Admin Panel</a></li>
              </ul>
            </div>

            <div class="footer-links-col reveal delay-3">
              <h4>Technology</h4>
              <ul>
                <li><a href="#how-it-works">Optical Biomarkers</a></li>
                <li><a href="javascript:void(0)" onclick="window.app.openModal('ingredient-modal')">Ingredient Checker</a></li>
                <li><a href="javascript:void(0)" onclick="window.app.openModal('assessment-modal')">AI Skin Assessment</a></li>
                <li><a href="#features">Microservices API</a></li>
              </ul>
            </div>

            <div class="footer-links-col reveal delay-4">
              <h4>Company</h4>
              <ul>
                <li><a href="#how-it-works">About PanaceaAI</a></li>
                <li><a href="#consult-doctors">Our Doctors</a></li>
                <li><a href="#faq">Help & FAQ</a></li>
                <li><a href="javascript:void(0)" onclick="alert('HIPAA & GDPR Compliant')">Privacy & Security</a></li>
              </ul>
            </div>
          </div>

          <!-- Divider -->
          <div class="footer-divider"></div>

          <!-- Bottom Bar -->
          <div class="footer-bottom-bar">
            <span class="footer-copyright">© 2026 PanaceaAI HealthTech Pvt. Ltd. All rights reserved.</span>
            <div class="footer-legal-links">
              <a href="javascript:void(0)" onclick="alert('Privacy Policy')">Privacy</a>
              <span class="footer-dot">·</span>
              <a href="javascript:void(0)" onclick="alert('Terms of Service')">Terms</a>
              <span class="footer-dot">·</span>
              <a href="javascript:void(0)" onclick="alert('Security Audit')">Security</a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  `;
}

export function renderUserDashboard() {
  const data = MOCK_USER_DATA;
  
  const totalSteps = data.routine.morning.length + data.routine.evening.length;
  const completedSteps = data.routine.morning.filter(s => s.completed).length + data.routine.evening.filter(s => s.completed).length;
  const routinePct = Math.round((completedSteps / totalSteps) * 100);

  // Default active concerns if not yet populated from API
  const activeConcerns = data.profile.primaryConcerns && data.profile.primaryConcerns.length > 0 
    ? data.profile.primaryConcerns 
    : ['Transepidermal Water Loss', 'Acne & Breakouts'];

  return `
    <div class="dashboard-wrapper">
      <!-- HEADER BANNER -->
      <div class="dashboard-header" style="background: #FFFFFF; padding: 1.5rem 1.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-light); box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-bottom: 1.5rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
            <span class="section-tag-pill" style="font-size: 0.7rem; padding: 0.15rem 0.6rem;">CLINICAL DERMATOLOGY DASHBOARD</span>
            <span class="badge badge-success" style="font-size: 0.75rem;">🟢 Telemetry Active</span>
          </div>
          <h2 style="font-family: 'Playfair Display', serif; font-size: 1.65rem; color: var(--text-primary); margin-bottom: 0.2rem;">
            Patient Profile: <strong>${data.profile.name}</strong>
          </h2>
          <p class="text-muted" style="font-size: 0.88rem; margin: 0;">
            Skin Classification: <strong>${data.profile.skinType}</strong> &nbsp;|&nbsp; Age Demographic: <strong>${data.profile.ageGroup}</strong> &nbsp;|&nbsp; Barrier Status: <span style="color: var(--accent-emerald); font-weight: 700;">Balanced Equilibrium</span>
          </p>
        </div>
        <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
          <button class="btn btn-gold btn-sm" style="font-size: 0.8rem; padding: 0.6rem 1.1rem; background: var(--gold-primary); color: #fff; border: none; border-radius: var(--radius-sm); font-weight: 700; cursor: pointer;" onclick="window.app.openModal('photo-scan-modal')">📸 ML Photo & Webcam Analyzer</button>
          <button class="btn btn-primary btn-sm" style="font-size: 0.8rem; padding: 0.6rem 1.1rem;" onclick="window.app.openModal('assessment-modal')">Clinical Assessment Survey</button>
          <button class="btn btn-outline btn-sm" style="font-size: 0.8rem; padding: 0.6rem 1.1rem;" onclick="window.app.openModal('ingredient-modal')">Ingredient Safety</button>
        </div>
      </div>

      <!-- TOP EXECUTIVE TELEMETRY METRICS GRID -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
        <div class="glass-card" style="padding: 1.1rem; border-left: 4px solid var(--gold-primary);">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Weighted Skin Health Score</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--text-primary); margin: 0.2rem 0;">${data.skinScore.overall}<small style="font-size: 0.9rem; font-weight: 500; color: var(--text-muted);">/100</small></div>
          <div style="font-size: 0.78rem; color: var(--accent-emerald); font-weight: 600;">+4 pts since last evaluation</div>
        </div>

        <div class="glass-card" style="padding: 1.1rem; border-left: 4px solid var(--accent-emerald);">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Regimen Completion</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--text-primary); margin: 0.2rem 0;">${routinePct}%</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${completedSteps} of ${totalSteps} daily steps logged</div>
        </div>

        <div class="glass-card" style="padding: 1.1rem; border-left: 4px solid var(--accent-amber);">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Daily Hydration</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--text-primary); margin: 0.2rem 0;">${data.hydrationMl} <small style="font-size: 0.9rem; font-weight: 500;">ml</small></div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">Target: 2,500 ml / day</div>
        </div>

        <div class="glass-card" style="padding: 1.1rem; border-left: 4px solid var(--pink-blush);">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Primary Concern</div>
          <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin: 0.35rem 0 0.1rem 0;">${activeConcerns[0] || 'Skin Dehydration'}</div>
          <div style="font-size: 0.78rem; color: var(--accent-amber); font-weight: 600;">Priority #1 Under Management</div>
        </div>
      </div>

      <!-- MAIN DASHBOARD GRID -->
      <div class="dashboard-grid">
        <!-- Skin Health Diagnostics Card -->
        <div class="glass-card score-card" style="background: #FFFFFF;">
          <div class="card-header" style="border-bottom: 1px solid var(--border-light); padding-bottom: 0.85rem; margin-bottom: 1rem;">
            <div>
              <h3 style="font-family: 'Playfair Display', serif; font-size: 1.25rem;">Cutaneous Health Score Breakdown</h3>
              <p class="text-muted" style="font-size: 0.8rem; margin-top: 0.1rem;">Weighted multi-parameter diagnostic telemetry</p>
            </div>
            <span class="badge badge-success" style="font-weight: 600;">${data.skinScore.grade}</span>
          </div>
          
          <div class="score-display-container" style="margin-bottom: 1.25rem;">
            <div class="score-circle" style="--score-pct: ${data.skinScore.overall}%;">
              <div class="score-number">${data.skinScore.overall}</div>
              <div class="score-label">OVERALL INDEX</div>
            </div>
            <div class="score-info">
              <h4 class="score-grade" style="font-family: 'Playfair Display', serif; font-size: 1.15rem;">${data.skinScore.grade}</h4>
              <p class="score-desc" style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">
                Calculated across 5 clinical diagnostic factors including stratum corneum moisture, sebum regulation, inflammatory index, structural elasticity, and lifestyle resilience.
              </p>
            </div>
          </div>

          <div class="score-breakdown-list" style="display: flex; flex-direction: column; gap: 0.85rem;">
            ${data.skinScore.breakdown.map(item => {
              const statusColor = item.score >= 80 ? 'var(--accent-emerald)' : item.score >= 65 ? 'var(--gold-primary)' : 'var(--accent-amber)';
              const statusText = item.score >= 80 ? 'Optimal' : item.score >= 65 ? 'Good' : 'Needs Attention';
              return `
                <div class="breakdown-item" style="padding: 0.65rem 0.85rem; background: #FAF9F6; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
                  <div class="breakdown-label" style="margin-bottom: 0.35rem; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary);">${item.name} <small class="text-muted">(${item.weight})</small></span>
                    <span style="font-size: 0.82rem; font-weight: 700; color: ${statusColor};">${item.score}/100 &nbsp;•&nbsp; ${statusText}</span>
                  </div>
                  <div class="progress-bar-bg" style="height: 6px; background: rgba(0,0,0,0.06); border-radius: 4px;">
                    <div class="progress-bar-fill" style="width: ${item.score}%; height: 100%; background: ${statusColor}; border-radius: 4px;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Interactive Trackers -->
          <div class="tracker-row" style="margin-top: 1.25rem;">
            <div class="tracker-box" style="background: rgba(197, 155, 39, 0.05); border: 1px solid var(--border-gold); padding: 1rem; border-radius: var(--radius-sm);">
              <small style="color: var(--text-muted); font-weight: 700; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em;">💧 Daily Hydration Tracker</small>
              <div class="tracker-val" style="font-size: 1.4rem; font-weight: 800; margin: 0.2rem 0;">${data.hydrationMl} <small style="font-size: 0.85rem; font-weight: 500;">ml</small></div>
              <button class="btn btn-sm btn-primary" style="width: 100%; font-size: 0.75rem; padding: 0.4rem;" onclick="window.app.addHydration(250)">+ Log 250ml Water 💧</button>
            </div>

            <div class="tracker-box" style="background: rgba(46, 125, 50, 0.05); border: 1px solid rgba(46, 125, 50, 0.2); padding: 1rem; border-radius: var(--radius-sm);">
              <small style="color: var(--text-muted); font-weight: 700; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em;">🌙 Daily Protocol Progress</small>
              <div class="tracker-val" style="font-size: 1.4rem; font-weight: 800; color: var(--accent-emerald); margin: 0.2rem 0;">${routinePct}%</div>
              <small class="text-muted" style="font-size: 0.78rem;">${completedSteps} of ${totalSteps} steps completed today</small>
            </div>
          </div>
        </div>

        <!-- Personalized Routine Generator Module -->
        <div class="glass-card routine-card" style="background: #FFFFFF; padding: 1.5rem;">
          <!-- Adaptive Routine Banner -->
          ${data.routine.adaptiveNotes ? `
            <div style="background: linear-gradient(135deg, rgba(232, 153, 165, 0.12), rgba(142, 36, 170, 0.05)); border: 1px solid var(--accent-rose); border-radius: var(--radius-sm); padding: 0.85rem 1.1rem; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
              <div>
                <span class="badge" style="background: var(--accent-rose); color: #fff; font-size: 0.72rem; font-weight: 800; padding: 0.2rem 0.6rem; border-radius: 12px;">${data.routine.adaptiveNotes.mode}</span>
                <p style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary); margin: 0.3rem 0 0 0;">${data.routine.adaptiveNotes.message}</p>
              </div>
              <button class="btn btn-sm" style="background: var(--accent-rose); color: #fff; font-size: 0.75rem; border-radius: 16px; padding: 0.3rem 0.85rem;" onclick="window.app.reGeneratePersonalizedRoutine()">🔄 Re-Generate Routine</button>
            </div>
          ` : ''}

          <div class="card-header" style="border-bottom: 1px solid var(--border-light); padding-bottom: 0.85rem; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem;">
            <div>
              <h3 style="font-family: 'Playfair Display', serif; font-size: 1.3rem;">Personalized Routine Generator</h3>
              <p class="text-muted" style="font-size: 0.8rem; margin-top: 0.1rem;">Today's Skincare Checklist & Category-driven protocol tuned to skin type, health score & seasonal factors</p>
            </div>
            <div class="routine-tabs" style="display: flex; gap: 0.35rem; background: #FAF9F6; padding: 0.25rem; border-radius: 20px; border: 1px solid var(--border-light); flex-wrap: wrap;">
              <button class="tab-btn active" id="tab-am" style="font-size: 0.78rem; padding: 0.35rem 0.85rem;" onclick="window.app.switchRoutineTab('am')">Morning 🌅</button>
              <button class="tab-btn" id="tab-pm" style="font-size: 0.78rem; padding: 0.35rem 0.85rem;" onclick="window.app.switchRoutineTab('pm')">Evening 🌙</button>
              <button class="tab-btn" id="tab-weekly" style="font-size: 0.78rem; padding: 0.35rem 0.85rem;" onclick="window.app.switchRoutineTab('weekly')">Weekly Plan 📅</button>
              <button class="tab-btn" id="tab-seasonal" style="font-size: 0.78rem; padding: 0.35rem 0.85rem;" onclick="window.app.switchRoutineTab('seasonal')">Seasonal Advice ☀️</button>
            </div>
          </div>

          <!-- AM Routine View -->
          <div id="routine-list-am" class="routine-step-list">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
              <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted);">SEQUENCE: 🧼 Cleansing → 💧 Treatment → 🧴 Moisturizing → ☀️ Sun Protection</div>
              <button class="btn btn-sm btn-outline" style="font-size: 0.75rem; padding: 0.25rem 0.65rem;" onclick="window.app.openCreateStepModal('morning')">➕ Add Custom AM Step</button>
            </div>
            ${data.routine.morning.map(item => `
              <div class="step-item ${item.completed ? 'completed' : ''}" onclick="window.app.toggleStep('morning', '${item.id}')" style="cursor: pointer; padding: 0.9rem 1.1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-light); margin-bottom: 0.65rem; background: ${item.completed ? '#F8FBF8' : '#FAF9F6'}; transition: var(--transition); position: relative;">
                <div style="display: flex; align-items: flex-start; width: 100%;">
                  <div class="step-checkbox" style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid ${item.completed ? 'var(--accent-emerald)' : 'var(--text-muted)'}; background: ${item.completed ? 'var(--accent-emerald)' : 'transparent'}; color: #fff; font-weight: 700; font-size: 0.8rem; margin-top: 0.2rem;">${item.completed ? '✓' : ''}</div>
                  <div class="step-details" style="flex: 1; margin-left: 0.85rem; padding-right: 1.5rem;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.2rem;">
                      <span class="step-type" style="font-size: 0.72rem; font-weight: 800; color: var(--gold-primary); text-transform: uppercase; letter-spacing: 0.05em;">${item.step || item.category}</span>
                      <span class="step-time" style="font-size: 0.78rem; font-weight: 600; color: var(--text-muted);">${item.time}</span>
                    </div>
                    <h4 class="step-title" style="font-size: 0.95rem; font-weight: 700; margin: 0 0 0.25rem 0; ${item.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${item.title}</h4>
                    <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0 0 0.4rem 0;">💡 <strong>Rec:</strong> ${item.product_recommendation || item.title}</p>
                    ${item.key_ingredients ? `
                      <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
                        ${item.key_ingredients.map(ing => `<span style="background: rgba(197, 155, 39, 0.12); color: #7A5F13; font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 10px;">${ing}</span>`).join('')}
                      </div>
                    ` : ''}
                  </div>
                  <button title="Remove step" onclick="event.stopPropagation(); window.app.deleteStep('morning', '${item.id}')" style="position: absolute; top: 10px; right: 10px; background: transparent; border: none; font-size: 1.1rem; color: var(--text-muted); cursor: pointer;">&times;</button>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- PM Routine View -->
          <div id="routine-list-pm" class="routine-step-list hidden">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
              <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted);">SEQUENCE: 🧼 Cleansing → ✨ Exfoliation → 💧 Treatment → 🧴 Moisturizing → 🌙 Night Care</div>
              <button class="btn btn-sm btn-outline" style="font-size: 0.75rem; padding: 0.25rem 0.65rem;" onclick="window.app.openCreateStepModal('evening')">➕ Add Custom PM Step</button>
            </div>
            ${data.routine.evening.map(item => `
              <div class="step-item ${item.completed ? 'completed' : ''}" onclick="window.app.toggleStep('evening', '${item.id}')" style="cursor: pointer; padding: 0.9rem 1.1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-light); margin-bottom: 0.65rem; background: ${item.completed ? '#F8FBF8' : '#FAF9F6'}; transition: var(--transition); position: relative;">
                <div style="display: flex; align-items: flex-start; width: 100%;">
                  <div class="step-checkbox" style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid ${item.completed ? 'var(--accent-emerald)' : 'var(--text-muted)'}; background: ${item.completed ? 'var(--accent-emerald)' : 'transparent'}; color: #fff; font-weight: 700; font-size: 0.8rem; margin-top: 0.2rem;">${item.completed ? '✓' : ''}</div>
                  <div class="step-details" style="flex: 1; margin-left: 0.85rem; padding-right: 1.5rem;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.2rem;">
                      <span class="step-type" style="font-size: 0.72rem; font-weight: 800; color: var(--gold-primary); text-transform: uppercase; letter-spacing: 0.05em;">${item.step || item.category}</span>
                      <span class="step-time" style="font-size: 0.78rem; font-weight: 600; color: var(--text-muted);">${item.time}</span>
                    </div>
                    <h4 class="step-title" style="font-size: 0.95rem; font-weight: 700; margin: 0 0 0.25rem 0; ${item.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${item.title}</h4>
                    <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0 0 0.4rem 0;">💡 <strong>Rec:</strong> ${item.product_recommendation || item.title}</p>
                    ${item.key_ingredients ? `
                      <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
                        ${item.key_ingredients.map(ing => `<span style="background: rgba(142, 36, 170, 0.12); color: #5B1370; font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 10px;">${ing}</span>`).join('')}
                      </div>
                    ` : ''}
                  </div>
                  <button title="Remove step" onclick="event.stopPropagation(); window.app.deleteStep('evening', '${item.id}')" style="position: absolute; top: 10px; right: 10px; background: transparent; border: none; font-size: 1.1rem; color: var(--text-muted); cursor: pointer;">&times;</button>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Weekly Treatment Plan View -->
          <div id="routine-list-weekly" class="routine-step-list hidden">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
              <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted);">PERIODIC TREATMENT SCHEDULE (MON – SUN)</div>
              <button class="btn btn-sm btn-outline" style="font-size: 0.75rem; padding: 0.25rem 0.65rem;" onclick="window.app.openModal('create-weekly-modal')">➕ Create Custom Weekly Treatment</button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.85rem;">
              ${(data.routine.weeklyPlan || [
                { day: 'Wednesday & Sunday', focus: 'BHA Chemical Exfoliation', category: '✨ Exfoliation', treatment_name: '2% Salicylic Acid Exfoliant Liquid', instructions: 'Pore clearing & smooth texture renewal.', icon: '✨' },
                { day: 'Friday Evening', focus: 'Deep Moisture Sheet Mask', category: '💧 Treatment', treatment_name: 'Ceramide & Hyaluronic Sheet Mask', instructions: 'Intense moisture infusion for 15-20 min.', icon: '💧' },
                { day: 'Saturday Morning', focus: 'Weekend Lip & Eye Ritual', category: '🌙 Night Care', treatment_name: 'Peptide Lip Butter & Cooling Eye Serum', instructions: 'Nourish delicate eye & lip zones.', icon: '🌙' }
              ]).map((w, idx) => `
                <div style="padding: 1rem; background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm); position: relative;">
                  <button title="Remove treatment" onclick="event.stopPropagation(); window.app.deleteWeeklyItem(${idx})" style="position: absolute; top: 8px; right: 8px; background: transparent; border: none; font-size: 1.1rem; color: var(--text-muted); cursor: pointer;">&times;</button>
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem; padding-right: 1.5rem;">
                    <span style="font-size: 0.72rem; font-weight: 800; color: var(--accent-amber); text-transform: uppercase;">${w.day}</span>
                    <span style="font-size: 1.1rem;">${w.icon || '✨'}</span>
                  </div>
                  <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.2rem;">${w.focus}</h4>
                  <p style="font-size: 0.82rem; font-weight: 600; color: var(--gold-primary); margin-bottom: 0.35rem;">${w.treatment_name}</p>
                  <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">${w.instructions}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Seasonal Advice View -->
          <div id="routine-list-seasonal" class="routine-step-list hidden">
            <div style="padding: 1.1rem; background: linear-gradient(135deg, rgba(204, 251, 241, 0.3), rgba(240, 253, 250, 0.8)); border: 1px solid rgba(45, 212, 191, 0.3); border-radius: var(--radius-sm);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <h4 style="font-family: 'Playfair Display', serif; font-size: 1.1rem; margin: 0;">Season: ${data.routine.seasonalTips ? data.routine.seasonalTips.season : 'Summer ☀️'}</h4>
                <span class="badge" style="background: #0D9488; color: #fff; font-size: 0.72rem;">Active Climate Protocol</span>
              </div>
              <p style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">🌍 <strong>Impact:</strong> ${data.routine.seasonalTips ? data.routine.seasonalTips.climate_impact : 'High UV index, elevated humidity & sweat production.'}</p>
              
              <div style="margin-top: 0.75rem;">
                <h5 style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; color: #0F766E; margin-bottom: 0.35rem;">Recommended Adjustments:</h5>
                <ul style="margin: 0; padding-left: 1.2rem; font-size: 0.82rem; color: var(--text-secondary);">
                  ${(data.routine.seasonalTips && data.routine.seasonalTips.routine_adjustments ? data.routine.seasonalTips.routine_adjustments : [
                    'Switch heavy creams to lightweight oil-free gel moisturizers.',
                    'Ensure daily SPF is 50+ and water/sweat resistant.'
                  ]).map(tip => `<li style="margin-bottom: 0.25rem;">${tip}</li>`).join('')}
                </ul>
              </div>

              <div style="display: flex; gap: 1.5rem; margin-top: 0.85rem; flex-wrap: wrap;">
                <div>
                  <small style="font-size: 0.72rem; font-weight: 800; color: #047857; text-transform: uppercase;">Best Ingredients:</small>
                  <div style="display: flex; gap: 0.3rem; margin-top: 0.2rem; flex-wrap: wrap;">
                    ${(data.routine.seasonalTips && data.routine.seasonalTips.recommended_ingredients ? data.routine.seasonalTips.recommended_ingredients : ['Niacinamide', 'Zinc Oxide', 'Squalane']).map(i => `<span style="background: #D1FAE5; color: #065F46; font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 8px;">${i}</span>`).join('')}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- CLINICAL ACTIVE CONCERNS MATRIX -->
      <div class="glass-card section-margin" style="background: #FFFFFF; padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-light); margin-top: 1.5rem;">
        <div class="card-header" style="border-bottom: 1px solid var(--border-light); padding-bottom: 0.85rem; margin-bottom: 1rem;">
          <div>
            <h3 style="font-family: 'Playfair Display', serif; font-size: 1.25rem;">Active Dermatological Concerns & Treatment Protocol</h3>
            <p class="text-muted" style="font-size: 0.8rem; margin-top: 0.1rem;">Clinical severity categorization and targeted ingredient guidance</p>
          </div>
          <span class="badge badge-accent" style="font-weight: 600;">2 Active Factors</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1rem;">
          <div style="padding: 1.1rem; background: #FAF9F6; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-size: 0.7rem; font-weight: 800; color: var(--accent-amber); text-transform: uppercase; letter-spacing: 0.05em;">PRIORITY #1 • MOISTURE & BARRIER</span>
              <span class="badge badge-warning" style="font-size: 0.75rem;">Moderate Severity</span>
            </div>
            <h4 style="font-family: 'Playfair Display', serif; font-size: 1.05rem; margin-bottom: 0.35rem;">Transepidermal Water Loss (TEWL)</h4>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">Impaired lipid barrier permitting moisture evaporation and surface tightness.</p>
            <div style="margin-bottom: 0.5rem;">
              <small style="font-size: 0.75rem; font-weight: 700; color: var(--text-primary);">Recommended Active Ingredients:</small>
              <div class="tag-cloud" style="margin-top: 0.25rem; display: flex; gap: 0.35rem; flex-wrap: wrap;">
                <span class="tag" style="background: rgba(197,155,39,0.12); color: var(--gold-primary); font-size: 0.75rem; padding: 0.2rem 0.55rem; border-radius: 4px;">Ceramides NP/AP</span>
                <span class="tag" style="background: rgba(197,155,39,0.12); color: var(--gold-primary); font-size: 0.75rem; padding: 0.2rem 0.55rem; border-radius: 4px;">Multi-Hyaluronic Acid</span>
                <span class="tag" style="background: rgba(197,155,39,0.12); color: var(--gold-primary); font-size: 0.75rem; padding: 0.2rem 0.55rem; border-radius: 4px;">Centella Asiatica</span>
              </div>
            </div>
          </div>

          <div style="padding: 1.1rem; background: #FAF9F6; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span style="font-size: 0.7rem; font-weight: 800; color: var(--accent-rose); text-transform: uppercase; letter-spacing: 0.05em;">PRIORITY #2 • INFLAMMATORY</span>
              <span class="badge badge-warning" style="font-size: 0.75rem;">Moderate Severity</span>
            </div>
            <h4 style="font-family: 'Playfair Display', serif; font-size: 1.05rem; margin-bottom: 0.35rem;">Post-Inflammatory Hyperpigmentation</h4>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">Melanin clustering following active congestion and UV exposure.</p>
            <div style="margin-bottom: 0.5rem;">
              <small style="font-size: 0.75rem; font-weight: 700; color: var(--text-primary);">Recommended Active Ingredients:</small>
              <div class="tag-cloud" style="margin-top: 0.25rem; display: flex; gap: 0.35rem; flex-wrap: wrap;">
                <span class="tag" style="background: rgba(46,125,50,0.12); color: var(--accent-emerald); font-size: 0.75rem; padding: 0.2rem 0.55rem; border-radius: 4px;">Azelaic Acid 10%</span>
                <span class="tag" style="background: rgba(46,125,50,0.12); color: var(--accent-emerald); font-size: 0.75rem; padding: 0.2rem 0.55rem; border-radius: 4px;">Niacinamide 5%</span>
                <span class="tag" style="background: rgba(46,125,50,0.12); color: var(--accent-emerald); font-size: 0.75rem; padding: 0.2rem 0.55rem; border-radius: 4px;">Alpha Arbutin 2%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FORMULATED PRODUCTS CATALOG -->
      <div class="glass-card section-margin" style="background: #FFFFFF; padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-light); margin-top: 1.5rem;">
        <div class="card-header" style="border-bottom: 1px solid var(--border-light); padding-bottom: 0.85rem; margin-bottom: 1rem;">
          <div>
            <h3 style="font-family: 'Playfair Display', serif; font-size: 1.25rem;">AI Matched Skincare Products</h3>
            <p class="text-muted" style="font-size: 0.8rem; margin-top: 0.1rem;">Clinical formulations tailored to your current skin classification</p>
          </div>
          <button class="btn btn-sm btn-outline" style="font-size: 0.78rem; padding: 0.4rem 0.85rem;" onclick="alert('Regimen matches re-evaluated against latest biomarker scores.')">🔄 Refresh Formulations</button>
        </div>
        
        <div class="products-grid">
          ${data.recommendedProducts.map(p => `
            <div class="product-card" style="background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 1.1rem; display: flex; flex-direction: column; justify-space-between;">
              <div>
                <div class="product-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                  <span class="badge badge-accent" style="font-size: 0.75rem;">${p.badge}</span>
                  <span class="match-score" style="font-size: 0.82rem; font-weight: 700; color: var(--gold-primary);">${p.matchScore} Compatibility</span>
                </div>
                <h4 class="product-name" style="font-family: 'Playfair Display', serif; font-size: 1.05rem; margin-bottom: 0.2rem;">${p.name}</h4>
                <p class="product-cat" style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.65rem;">${p.category} &nbsp;•&nbsp; <strong>${p.price}</strong></p>
                <div class="product-ingredients" style="margin-bottom: 0.65rem;">
                  <small style="color: var(--text-muted); font-size: 0.75rem; font-weight: 600;">Key Active Ingredients:</small>
                  <div class="tag-cloud" style="margin-top: 0.25rem; display: flex; gap: 0.35rem; flex-wrap: wrap;">
                    ${p.keyIngredients.map(ing => `<span class="tag" style="background: #FFFFFF; border: 1px solid var(--border-light); font-size: 0.72rem; padding: 0.15rem 0.45rem; border-radius: 4px; color: var(--text-primary);">${ing}</span>`).join('')}
                  </div>
                </div>
                <p class="product-reason" style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.4;">💡 ${p.reason}</p>
              </div>
              <button class="btn btn-sm btn-primary" style="width: 100%; margin-top: 1rem; font-size: 0.78rem;" onclick="window.app.addProductToRoutine('${p.name}', '${p.category}')">+ Add to Morning Routine</button>
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

export function renderAdminDashboard(liveUsers = null) {
  const data = MOCK_ADMIN_DATA;
  const users = liveUsers || [
    { id: 1, username: 'user', email: 'user@panacea.ai', role: 'user', created_at: new Date().toISOString() },
    { id: 2, username: 'consultant', email: 'consultant@panacea.ai', role: 'consultant', created_at: new Date().toISOString() },
    { id: 3, username: 'doctor', email: 'doctor@panacea.ai', role: 'dermatologist', created_at: new Date().toISOString() },
    { id: 4, username: 'admin', email: 'admin@panacea.ai', role: 'admin', created_at: new Date().toISOString() }
  ];

  const totalUserCount = users.length;

  return `
    <div class="dashboard-wrapper">
      <div class="dashboard-header">
        <div>
          <h2>System Control Center & User Management Dashboard</h2>
          <p class="text-muted">Manage active users, user roles, microservices telemetry, and platform security</p>
        </div>
        <span class="badge badge-admin">Superadmin Access</span>
      </div>

      <div class="metrics-row">
        <div class="metric-card">
          <div class="metric-value">${totalUserCount}</div>
          <div class="metric-label">Active Platform Users</div>
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

      <!-- SECTION 1: USER MANAGEMENT PANEL -->
      <div class="glass-card section-margin">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 1rem; margin-bottom: 1.5rem;">
          <div>
            <h3>👥 Active Users Roster & RBAC Management</h3>
            <p class="text-muted" style="font-size: 0.85rem; margin-top: 0.2rem;">View all registered platform accounts stored in PostgreSQL database</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="window.app.toggleAdminAddUserForm()">
            ➕ Add New User Account
          </button>
        </div>

        <!-- ADD NEW USER FORM (TOGGLEABLE) -->
        <div id="admin-add-user-card" class="hidden" style="background: rgba(255, 255, 255, 0.03); border: 1px dashed var(--gold-primary); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
          <h4 style="color: var(--gold-primary); margin-bottom: 1rem;">➕ Register New User Account</h4>
          <form id="admin-add-user-form" onsubmit="window.app.handleAdminAddUserSubmit(event)" novalidate>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
              <div class="form-group">
                <label style="font-size: 0.8rem;">Username</label>
                <input type="text" id="admin-new-username" class="form-control" placeholder="e.g. master" required>
              </div>
              <div class="form-group">
                <label style="font-size: 0.8rem;">Email Address</label>
                <input type="email" id="admin-new-email" class="form-control" placeholder="e.g. master@panacea.ai" required>
              </div>
              <div class="form-group">
                <label style="font-size: 0.8rem;">Password</label>
                <input type="password" id="admin-new-password" class="form-control" placeholder="e.g. Manish" required>
              </div>
              <div class="form-group">
                <label style="font-size: 0.8rem;">User Role</label>
                <select id="admin-new-role" class="form-control">
                  <option value="user">User / Patient</option>
                  <option value="consultant">Skincare Consultant</option>
                  <option value="dermatologist">Dermatologist Doctor</option>
                  <option value="admin">Platform Admin</option>
                </select>
              </div>
            </div>
            <div id="admin-add-user-alert" class="login-alert-box hidden" style="margin-bottom: 1rem;"></div>
            <div style="display: flex; gap: 0.75rem;">
              <button type="submit" class="btn btn-primary btn-sm">Create User Account</button>
              <button type="button" class="btn btn-outline btn-sm" onclick="window.app.toggleAdminAddUserForm()">Cancel</button>
            </div>
          </form>
        </div>

        <!-- ACTIVE USERS TABLE -->
        <div style="overflow-x: auto;">
          <table class="roster-table" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-light); color: var(--gold-primary); font-size: 0.8rem; text-transform: uppercase;">
                <th style="padding: 0.75rem;">ID</th>
                <th style="padding: 0.75rem;">Username</th>
                <th style="padding: 0.75rem;">Email Address</th>
                <th style="padding: 0.75rem;">Role</th>
                <th style="padding: 0.75rem;">Verification Status</th>
                <th style="padding: 0.75rem;">Registration Date</th>
                <th style="padding: 0.75rem; text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => {
                let badgeClass = 'badge-primary';
                if (u.role === 'admin') badgeClass = 'badge-admin';
                else if (u.role === 'dermatologist') badgeClass = 'badge-danger';
                else if (u.role === 'consultant') badgeClass = 'badge-warning';

                const isPending = (u.status === 'pending_approval');
                const statusBadge = isPending
                  ? `<span class="badge badge-warning" style="background: rgba(234, 179, 8, 0.15); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.3);">⏳ Pending Approval</span>`
                  : `<span class="badge badge-success" style="background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3);">🟢 Active / Approved</span>`;

                const regDate = u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Active';

                return `
                  <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                    <td style="padding: 0.75rem; font-weight: 600; color: var(--text-muted);">#${u.id}</td>
                    <td style="padding: 0.75rem; font-weight: 600; color: #fff;">
                      <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <img src="${u.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + u.username}" style="width: 24px; height: 24px; border-radius: 50%;" alt="avatar">
                        <span>${u.username}</span>
                      </div>
                    </td>
                    <td style="padding: 0.75rem; color: #94a3b8;">${u.email}</td>
                    <td style="padding: 0.75rem;">
                      <span class="badge ${badgeClass}" style="text-transform: uppercase; font-size: 0.7rem;">${u.role}</span>
                    </td>
                    <td style="padding: 0.75rem;">
                      ${statusBadge}
                    </td>
                    <td style="padding: 0.75rem; color: #94a3b8; font-size: 0.8rem;">${regDate}</td>
                    <td style="padding: 0.75rem; text-align: right; display: flex; gap: 0.5rem; justify-content: flex-end;">
                      ${isPending ? `
                        <button class="btn btn-primary btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; background: #22c55e;" onclick="window.app.handleAdminApproveUser(${u.id}, '${u.username}')">
                          ✅ Approve User
                        </button>
                      ` : ''}
                      <button class="btn btn-outline btn-sm" style="color: var(--accent-rose); border-color: rgba(244, 63, 94, 0.3); padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="window.app.handleAdminDeleteUser(${u.id}, '${u.username}')">
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- SECTION 2: MICROSERVICES MONITOR -->
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

      <!-- SECTION 3: SYSTEM AUDIT LOGS -->
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

/**
 * Render Interactive Dummy Login Page
 */
export function renderLoginPage() {
  return `
    <div class="editorial-container section-margin">
      <div class="login-page-wrapper reveal">
        <div class="login-card-glass">
          <div class="login-header text-center">
            <div class="login-logo-circle">
              <img src="assets/logo.png" alt="PanaceaAI Logo" class="login-logo-img">
            </div>
            <h2 class="editorial-section-title" style="font-size: 1.8rem; margin-top: 0.75rem; margin-bottom: 0.35rem;">
              Sign In to PanaceaAI
            </h2>
            <p class="text-muted" style="font-size: 0.88rem; margin-bottom: 1.5rem;">
              Sign in with your registered credentials or continue with Google OAuth 2.0.
            </p>
          </div>

          <form id="login-page-form" onsubmit="window.app.handleLoginPageSubmit(event)" novalidate>
            <!-- Select Role Dropdown -->
            <div class="form-group" style="margin-bottom: 1.25rem;">
              <label for="page-login-role" style="font-weight: 600; color: var(--gold-primary);">Select Portal Role</label>
              <select id="page-login-role" class="form-control">
                <option value="user">User / Patient</option>
                <option value="consultant">Skincare Consultant</option>
                <option value="dermatologist">Dermatologist Doctor</option>
                <option value="admin">Platform Administrator</option>
              </select>
            </div>

            <!-- Username Field -->
            <div class="form-group">
              <label for="page-login-username">Username or Email</label>
              <div class="input-with-icon">
                <span class="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </span>
                <input 
                  type="text" 
                  id="page-login-username" 
                  class="form-control" 
                  placeholder="Enter your username or email" 
                  required
                >
              </div>
            </div>

            <!-- Password Field -->
            <div class="form-group">
              <label for="page-login-password">Password</label>
              <div class="input-with-icon">
                <span class="input-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </span>
                <input 
                  type="password" 
                  id="page-login-password" 
                  class="form-control" 
                  placeholder="Enter your password" 
                  required
                >
                <button 
                  type="button" 
                  class="password-toggle-btn" 
                  title="Toggle Password Visibility"
                  onclick="window.app.togglePasswordVisibility('page-login-password', this)"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
              </div>
            </div>

            <!-- Options Row -->
            <div class="login-options-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; font-size: 0.85rem;">
              <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer; color: var(--text-dark);">
                <input type="checkbox" id="page-login-remember" checked style="accent-color: var(--gold-primary);">
                <span>Remember me</span>
              </label>
              <a href="javascript:void(0)" onclick="window.app.showForgotPasswordNotice()" style="color: var(--gold-primary); text-decoration: none; font-weight: 500;">
                Forgot password?
              </a>
            </div>

            <!-- Dynamic Alert Message Box -->
            <div id="page-login-alert" class="login-alert-box hidden" style="margin-bottom: 1.25rem;"></div>

            <!-- Submit Button -->
            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.85rem; font-size: 1rem; letter-spacing: 0.5px;">
              Log In to Portal
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}

export function renderUserSettingsPage() {
  const data = MOCK_USER_DATA;
  const user = auth.getCurrentUser();
  const avatarUrl = user?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || 'default'}`;
  const displayName = data.profile?.name || user?.username || 'Alex Rivera';
  const displayEmail = user?.email || `${(user?.username || 'alex').toLowerCase()}@panacea.ai`;
  const roleTitle = 'Skincare Consumer';

  return `
    <div class="editorial-container reveal" style="padding-top: 1.5rem; max-width: 1200px; margin: 0 auto;">
      <!-- HEADER BACK NAVIGATION BANNER -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-light);">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--gold-primary); font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.3rem;">
            <span>SYSTEM CONFIGURATION & MANAGEMENT</span>
          </div>
          <h1 style="font-family: 'Playfair Display', serif; font-size: 2.2rem; margin: 0; color: var(--text-primary);">
            User Account & Profile Settings
          </h1>
          <p class="text-muted" style="margin: 0.2rem 0 0 0; font-size: 0.95rem;">
            Manage your patient profile identity, clinical skin classification, allergen triggers, and platform preferences.
          </p>
        </div>
        <div>
          <button class="btn btn-outline" onclick="window.app.navigateToView('dashboard')" style="display: flex; align-items: center; gap: 0.5rem;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      <!-- MAIN 2-COLUMN LAYOUT -->
      <div style="display: grid; grid-template-columns: 320px 1fr; gap: 2rem;">

        <!-- LEFT COLUMN: IDENTITY & NAVIGATION CARD -->
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <div class="glass-card" style="padding: 1.75rem; text-align: center;">
            <div style="position: relative; display: inline-block; margin-bottom: 1rem;">
              <img id="page-settings-avatar-img" src="${avatarUrl}" alt="${displayName}" style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid var(--gold-primary); background: #FFFFFF; object-fit: cover;">
            </div>
            <h3 id="page-settings-display-name" style="font-family: 'Playfair Display', serif; font-size: 1.4rem; margin: 0 0 0.3rem 0; color: var(--text-primary);">${displayName}</h3>
            <div style="margin-bottom: 1rem;">
              <span class="badge badge-user">${roleTitle}</span>
            </div>
            <p id="page-settings-display-email" class="text-muted" style="font-size: 0.85rem; margin-bottom: 1.2rem;">${displayEmail}</p>

            <button type="button" class="btn btn-outline btn-sm" onclick="window.app.randomizePageAvatar()" style="width: 100%; font-size: 0.82rem; padding: 0.55rem;">
              Generate New Avatar Seed
            </button>
          </div>

          <!-- SECTION QUICK LINKS -->
          <div class="glass-card" style="padding: 1.25rem;">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.8rem;">Settings Sections</div>
            <div style="display: flex; flex-direction: column; gap: 0.4rem;">
              <a href="#section-identity" class="btn btn-outline" style="justify-content: flex-start; border: none; background: rgba(0,0,0,0.03); font-size: 0.85rem; padding: 0.6rem 0.8rem;">1. Personal & Account Identity</a>
              <a href="#section-classification" class="btn btn-outline" style="justify-content: flex-start; border: none; background: rgba(0,0,0,0.03); font-size: 0.85rem; padding: 0.6rem 0.8rem;">2. Dermatological Classification</a>
              <a href="#section-clinical" class="btn btn-outline" style="justify-content: flex-start; border: none; background: rgba(0,0,0,0.03); font-size: 0.85rem; padding: 0.6rem 0.8rem;">3. Clinical Focus & Allergens</a>
              <a href="#section-preferences" class="btn btn-outline" style="justify-content: flex-start; border: none; background: rgba(0,0,0,0.03); font-size: 0.85rem; padding: 0.6rem 0.8rem;">4. Reminders & Telemetry</a>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: COMPREHENSIVE SETTINGS FORM -->
        <div class="glass-card" style="padding: 2rem;">
          <form id="page-settings-form" onsubmit="window.app.handlePageSaveSettings(event)">

            <!-- SECTION 1 -->
            <div id="section-identity" style="margin-bottom: 2rem;">
              <h3 style="font-family: 'Playfair Display', serif; font-size: 1.3rem; margin-bottom: 0.4rem; color: var(--text-primary); border-bottom: 2px solid var(--gold-primary); padding-bottom: 0.4rem;">
                1. Personal & Account Identity
              </h3>
              <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 1.2rem;">Manage your user account credentials and platform representation.</p>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem;">
                <div class="form-group">
                  <label for="page-settings-fullname" style="font-weight: 600; font-size: 0.85rem;">Full Name / Display Name</label>
                  <input type="text" id="page-settings-fullname" class="form-control" value="${displayName}" required>
                </div>
                <div class="form-group">
                  <label for="page-settings-email" style="font-weight: 600; font-size: 0.85rem;">Registered Email Address</label>
                  <input type="text" id="page-settings-email" class="form-control" value="${displayEmail}" readonly style="background: rgba(0,0,0,0.03); opacity: 0.8;">
                </div>
              </div>
            </div>

            <!-- SECTION 2 -->
            <div id="section-classification" style="margin-bottom: 2rem;">
              <h3 style="font-family: 'Playfair Display', serif; font-size: 1.3rem; margin-bottom: 0.4rem; color: var(--text-primary); border-bottom: 2px solid var(--gold-primary); padding-bottom: 0.4rem;">
                2. Dermatological Classification
              </h3>
              <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 1.2rem;">Configure baseline physiological skin metadata for diagnostic scoring.</p>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem;">
                <div class="form-group">
                  <label for="page-settings-skintype" style="font-weight: 600; font-size: 0.85rem;">Skin Type Classification</label>
                  <select id="page-settings-skintype" class="form-control">
                    <option value="Combination / Sensitive" ${data.profile.skinType.includes('Combination') ? 'selected' : ''}>Combination / Sensitive</option>
                    <option value="Dry / Dehydrated" ${data.profile.skinType.includes('Dry') ? 'selected' : ''}>Dry / Dehydrated</option>
                    <option value="Oily / Acne-Prone" ${data.profile.skinType.includes('Oily') ? 'selected' : ''}>Oily / Acne-Prone</option>
                    <option value="Normal / Balanced" ${data.profile.skinType.includes('Normal') ? 'selected' : ''}>Normal / Balanced</option>
                    <option value="Sensitive / Rosacea-Prone" ${data.profile.skinType.includes('Rosacea') ? 'selected' : ''}>Sensitive / Rosacea-Prone</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="page-settings-agegroup" style="font-weight: 600; font-size: 0.85rem;">Age Demographic</label>
                  <select id="page-settings-agegroup" class="form-control">
                    <option value="18 - 24" ${data.profile.ageGroup === '18 - 24' ? 'selected' : ''}>18 - 24 years</option>
                    <option value="25 - 34" ${data.profile.ageGroup === '25 - 34' ? 'selected' : ''}>25 - 34 years</option>
                    <option value="35 - 44" ${data.profile.ageGroup === '35 - 44' ? 'selected' : ''}>35 - 44 years</option>
                    <option value="45 - 54" ${data.profile.ageGroup === '45 - 54' ? 'selected' : ''}>45 - 54 years</option>
                    <option value="55+" ${data.profile.ageGroup === '55+' ? 'selected' : ''}>55+ years</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- SECTION 3 -->
            <div id="section-clinical" style="margin-bottom: 2rem;">
              <h3 style="font-family: 'Playfair Display', serif; font-size: 1.3rem; margin-bottom: 0.4rem; color: var(--text-primary); border-bottom: 2px solid var(--gold-primary); padding-bottom: 0.4rem;">
                3. Clinical Focus & Allergens
              </h3>
              <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 1.2rem;">Specify targeted skin concerns and ingredient safety contraindications.</p>

              <div class="form-group">
                <label for="page-settings-goals" style="font-weight: 600; font-size: 0.85rem;">Primary Skincare Focus & Target Goals</label>
                <input type="text" id="page-settings-goals" class="form-control" value="${(data.profile.primaryConcerns || []).join(', ')}" placeholder="e.g. Barrier Repair, Acne & Breakouts">
              </div>

              <div class="form-group">
                <label for="page-settings-allergies" style="font-weight: 600; font-size: 0.85rem;">Known Allergies & Sensitivity Triggers</label>
                <input type="text" id="page-settings-allergies" class="form-control" value="${(data.profile.allergies || []).join(', ')}" placeholder="e.g. Fragrance (Parfum), Essential Oils">
              </div>
            </div>

            <!-- SECTION 4 -->
            <div id="section-preferences" style="margin-bottom: 2rem;">
              <h3 style="font-family: 'Playfair Display', serif; font-size: 1.3rem; margin-bottom: 0.4rem; color: var(--text-primary); border-bottom: 2px solid var(--gold-primary); padding-bottom: 0.4rem;">
                4. Notifications & Telemetry Preferences
              </h3>
              <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 1.2rem;">Configure system notifications and routine tracking schedules.</p>

              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <label style="font-size: 0.9rem; color: var(--text-primary); font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 0.6rem;">
                  <input type="checkbox" id="page-settings-reminders" checked style="accent-color: var(--gold-primary); width: 18px; height: 18px;">
                  <span>Daily AM/PM Skincare Routine Application Reminders</span>
                </label>
                <label style="font-size: 0.9rem; color: var(--text-primary); font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 0.6rem;">
                  <input type="checkbox" id="page-settings-reports" checked style="accent-color: var(--gold-primary); width: 18px; height: 18px;">
                  <span>Weekly Cutaneous Health Telemetry & Barrier Score Reports</span>
                </label>
              </div>
            </div>

            <div id="page-settings-alert" class="login-alert-box hidden" style="margin-bottom: 1rem;"></div>

            <!-- SUBMIT & CANCEL BAR -->
            <div style="display: flex; gap: 1rem; align-items: center; padding-top: 1rem; border-top: 1px solid var(--border-light);">
              <button type="submit" class="btn btn-primary" style="padding: 0.75rem 2rem;">Save Profile Changes</button>
              <button type="button" class="btn btn-outline" onclick="window.app.navigateToView('dashboard')" style="padding: 0.75rem 1.5rem;">Cancel</button>
            </div>

          </form>
        </div>

      </div>
    </div>
  `;
}

