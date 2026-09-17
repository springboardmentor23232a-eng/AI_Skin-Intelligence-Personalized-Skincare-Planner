/**
 * Editorial Dashboard View Renderers for PanaceaAI Platform
 * Inspired by Dribbble Eyehealth AI Editorial Design System
 */

import { auth } from './auth.js';
import {
  MOCK_USER_DATA,
  MOCK_CONSULTANT_DATA,
  MOCK_DERMATOLOGIST_DATA,
  MOCK_ADMIN_DATA,
  MOCK_ROLES,
  MASTER_PRODUCT_CATALOG,
  calculateProductSuitability,
  filterProductCatalog,
  generateProductComparison,
  getAlternativeProductsFor,
  MOCK_PROGRESS_TRACKING_DATA,
  generateTrendTrajectoryData,
  generateCalendar30Days,
  MOCK_USER_APPOINTMENTS,
  MOCK_CONSULTANT_APPOINTMENTS,
  MOCK_DERMATOLOGIST_APPOINTMENTS,
  MOCK_ADMIN_APPOINTMENTS
} from './mockData.js';

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
        <div class="section-tag-pill reveal">• DOCTORS & DERMATOLOGISTS</div>
        <div class="doctors-header-row reveal delay-1">
          <div>
            <h2 class="editorial-section-title">Consult a Certified Dermatologist</h2>
            <p class="editorial-section-subtitle">When you need a professional opinion, connect directly with board-certified dermatologists and optical skin specialists.</p>
          </div>
          <button class="btn btn-primary" onclick="window.app.navigateToView('consultations')" style="font-weight: 700; padding: 0.6rem 1.4rem;">
            Clinical Portal & Appointments →
          </button>
        </div>

        <div class="doctors-grid">
          <!-- Doctor 1: Dr. Rajni Verma, MD -->
          <div class="doctor-card reveal delay-1">
            <div class="doctor-img-box">
              <img src="assets/doctor_sarah.png" alt="Dr. Rajni Verma, MD" class="doctor-img">
              <span class="badge badge-success status-tag">🟢 Available</span>
            </div>
            <div class="doctor-info">
              <h3>Dr. Rajni Verma, MD</h3>
              <span class="doctor-spec">BOARD-CERTIFIED DERMATOLOGIST</span>
              <p class="doctor-exp">Lead clinical dermatologist specializing in cutaneous barrier restoration, acne protocols, and digital lesion diagnostics.</p>
              <button class="btn-link" onclick="window.app.navigateToView('consultations')">CONSULT NOW &gt;</button>
            </div>
          </div>

          <!-- Doctor 2: Dr. Arjun Kapoor, MD -->
          <div class="doctor-card reveal delay-2">
            <div class="doctor-img-box">
              <img src="assets/doctor_michael.png" alt="Dr. Arjun Kapoor, MD" class="doctor-img">
              <span class="badge badge-success status-tag">🟢 Available</span>
            </div>
            <div class="doctor-info">
              <h3>Dr. Arjun Kapoor, MD</h3>
              <span class="doctor-spec">EYE & SKIN SPECIALIST</span>
              <p class="doctor-exp">15 years experience in optical lesion diagnostics and cellular photo-aging.</p>
              <button class="btn-link" onclick="window.app.navigateToView('consultations')">CONSULT NOW &gt;</button>
            </div>
          </div>

          <!-- Doctor 3: Dr. Priya Nair, MD -->
          <div class="doctor-card reveal delay-3">
            <div class="doctor-img-box">
              <img src="assets/doctor_emily.png" alt="Dr. Priya Nair, MD" class="doctor-img">
              <span class="badge badge-success status-tag">🟢 Available</span>
            </div>
            <div class="doctor-info">
              <h3>Dr. Priya Nair, MD</h3>
              <span class="doctor-spec">OPTOMETRIST / DERM</span>
              <p class="doctor-exp">12 years experience in sensitive cutaneous reactive states and bespoke regimens.</p>
              <button class="btn-link" onclick="window.app.navigateToView('consultations')">CONSULT NOW &gt;</button>
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
            <div class="price-val">Starting at <span>₹249</span></div>
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

export function renderUserDashboard(metricsData = null, currentUser = null) {
  const user = currentUser || auth.getCurrentUser();
  const isDemoUser = (!user || user.id === 1 || user.username === 'user');
  const hasUserScore = (user && (user.skin_score !== undefined && user.skin_score !== null)) || (metricsData && metricsData.overall_health_score !== null && metricsData.has_assessment !== false);
  const isNewUser = !isDemoUser && !hasUserScore;

  const profileName = (user && (user.full_name || user.username)) || (metricsData && metricsData.user_name) || (isDemoUser ? MOCK_USER_DATA.profile.name : 'Valued Patient');
  const monogram = (profileName || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'PX';
  const skinType = (user && (user.skin_type || user.profile?.skinType)) || (metricsData && metricsData.skin_type) || (isDemoUser ? MOCK_USER_DATA.profile.skinType : 'Not Assessed Yet');
  const ageGroup = (user && user.profile?.ageGroup) || (isDemoUser ? MOCK_USER_DATA.profile.ageGroup : 'Not Specified');

  const overallScore = (metricsData && metricsData.overall_health_score !== null)
    ? metricsData.overall_health_score
    : (user && user.skin_score ? user.skin_score : (isNewUser ? null : MOCK_USER_DATA.skinScore.overall));
  const scoreGrade = overallScore !== null ? (overallScore >= 80 ? 'Optimal' : (overallScore >= 65 ? 'Good' : 'Needs Care')) : 'Pending';

  const scoreBreakdown = (metricsData && metricsData.score_breakdown && metricsData.score_breakdown.length > 0)
    ? metricsData.score_breakdown
    : (isNewUser ? [] : MOCK_USER_DATA.skinScore.breakdown);

  const morningRoutine = (metricsData && metricsData.daily_checklist && metricsData.daily_checklist.morning_routine && metricsData.daily_checklist.morning_routine.length > 0)
    ? metricsData.daily_checklist.morning_routine
    : (isNewUser ? [] : MOCK_USER_DATA.routine.morning);

  const eveningRoutine = (metricsData && metricsData.daily_checklist && metricsData.daily_checklist.evening_routine && metricsData.daily_checklist.evening_routine.length > 0)
    ? metricsData.daily_checklist.evening_routine
    : (isNewUser ? [] : MOCK_USER_DATA.routine.evening);

  const totalSteps = morningRoutine.length + eveningRoutine.length;
  const completedSteps = morningRoutine.filter(s => s.completed).length + eveningRoutine.filter(s => s.completed).length;
  const routinePct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  const hydrationMl = metricsData ? metricsData.hydration_intake_ml : (isNewUser ? 0 : MOCK_USER_DATA.hydrationMl);
  const currentStreak = metricsData ? metricsData.current_streak : (isNewUser ? 0 : 18);

  const activeConcerns = (user && user.primary_concerns && user.primary_concerns.length > 0)
    ? user.primary_concerns
    : ((metricsData && metricsData.primary_concerns && metricsData.primary_concerns.length > 0)
      ? metricsData.primary_concerns
      : (isNewUser ? [] : ['Transepidermal Water Loss', 'Acne & Breakouts']));

  const recommendedProducts = isNewUser ? [] : (MOCK_USER_DATA.recommendedProducts || []);

  return `
    <div class="dashboard-wrapper">
      <!-- LUXURY CLINIC RECEPTION HERO BANNER -->
      <div class="clinic-hero-banner-container">
        <div class="clinic-hero-overlay"></div>

        <!-- LEFT: FROSTED GLASS SKIN PROFILE CARD -->
        <div class="glass-profile-card">
          <!-- Top Row: Monogram Seal, Title, Active Badge, Settings Gear -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.85rem;">
            <div style="display: flex; align-items: center; gap: 0.95rem;">
              <!-- Metallic Embossed Seal -->
              <div class="monogram-seal-ar">
                <span class="monogram-seal-text">${monogram}</span>
              </div>
              <div>
                <div style="font-size: 0.7rem; font-weight: 800; color: #8A8177; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.15rem;">PATIENT SKIN PROFILE</div>
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                  <h2 style="font-family: 'Playfair Display', serif; font-size: 1.55rem; color: #181614; margin: 0; font-weight: 700; line-height: 1.15;">
                    ${profileName}
                  </h2>
                  ${isNewUser ? `
                    <span style="display: inline-flex; align-items: center; gap: 0.35rem; background: rgba(197, 155, 39, 0.15); border: 1px solid rgba(197, 155, 39, 0.4); color: #8A6400; font-size: 0.68rem; font-weight: 800; padding: 0.18rem 0.55rem; border-radius: 14px; letter-spacing: 0.05em; box-shadow: 0 0 10px rgba(197, 155, 39, 0.15);">
                      <span style="width: 6px; height: 6px; border-radius: 50%; background: #C59B27; box-shadow: 0 0 6px #C59B27; display: inline-block;"></span> ✨ NEW PATIENT
                    </span>
                  ` : `
                    <span style="display: inline-flex; align-items: center; gap: 0.35rem; background: rgba(46, 125, 50, 0.12); border: 1px solid rgba(46, 125, 50, 0.3); color: #2E7D32; font-size: 0.68rem; font-weight: 800; padding: 0.18rem 0.55rem; border-radius: 14px; letter-spacing: 0.05em; box-shadow: 0 0 10px rgba(46, 125, 50, 0.15);">
                      <span style="width: 6px; height: 6px; border-radius: 50%; background: #2E7D32; box-shadow: 0 0 6px #2E7D32; display: inline-block;"></span> ACTIVE
                    </span>
                  `}
                </div>
              </div>
            </div>

            <button class="profile-card-settings-btn" onclick="window.app.openModal('user-settings-modal')" title="Patient Profile & Skincare Settings" aria-label="Open Profile Settings">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </button>
          </div>

          <!-- Middle: Metadata Row with Face Mapping Icon -->
          <div style="background: rgba(255, 255, 255, 0.55); border: 1px solid rgba(255, 255, 255, 0.85); border-radius: 8px; padding: 0.55rem 0.85rem; display: flex; align-items: center; gap: 0.75rem; font-size: 0.8rem; color: #403C37; flex-wrap: wrap;">
            <!-- Face Zone Map Icon -->
            <div style="width: 32px; height: 34px; background: rgba(197, 155, 39, 0.12); border: 1px solid var(--border-gold); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 1.15rem; flex-shrink: 0;" title="Biomarker Zone Mapping">
              🧑‍⚕️
            </div>
            <div style="display: flex; align-items: center; gap: 0.55rem; flex: 1; flex-wrap: wrap;">
              <span>Skin: <strong>${skinType}</strong></span>
              <span style="color: #C2BBB2;">|</span>
              <span>Age: <strong>${ageGroup}</strong></span>
              <span style="color: #C2BBB2;">|</span>
              <span>Barrier: <strong style="color: ${isNewUser ? '#8A6400' : '#2E7D32'};">${isNewUser ? 'Awaiting Scan' : 'Healthy ✔'}</strong></span>
              <span style="color: #C2BBB2;">|</span>
              <span>Score: <strong style="color: var(--text-primary);">${overallScore !== null ? `${overallScore}/100` : '--/100'}</strong></span>
            </div>
          </div>

          <!-- Bottom: Routine Adherence & Analysis Timestamp -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; padding: 0 0.25rem; font-size: 0.74rem; color: #767069; flex-wrap: wrap; gap: 0.4rem;">
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <span>Routine Adherence: <strong>${isNewUser ? '0%' : '95%'}</strong></span>
              <span style="display: inline-block; width: 24px; height: 10px; background: #E2DDD4; border-radius: 3px; overflow: hidden; border: 1px solid #BFB8AC; vertical-align: middle;">
                <span style="display: block; width: ${isNewUser ? '0%' : '95%'}; height: 100%; background: #2E7D32;"></span>
              </span>
            </div>
            <div>Last Full Analysis: <strong>${isNewUser ? 'Pending First Scan' : '2 days ago'}</strong></div>
          </div>
        </div>

        <!-- RIGHT: 3D GLOSSY ACTION BUTTONS STACK -->
        <div class="hero-action-buttons-stack">
          <button class="btn-3d-glossy btn-3d-gold" onclick="window.app.openModal('photo-scan-modal')">
            <span>📸</span> AI SKIN SCAN
          </button>
          <button class="btn-3d-glossy btn-3d-black" onclick="window.app.openModal('assessment-modal')">
            <span>📋</span> SKIN ASSESSMENT
          </button>
          <button class="btn-3d-glossy btn-3d-platinum" onclick="window.app.openModal('ingredient-modal')">
            <span>🧪</span> INGREDIENT SAFETY
          </button>
        </div>

      </div>

      <!-- TOP EXECUTIVE TELEMETRY METRICS GRID -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
        <div class="glass-card" style="padding: 1.1rem; border-left: 4px solid var(--gold-primary);">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Weighted Skin Health Score</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--text-primary); margin: 0.2rem 0;">
            ${overallScore !== null ? overallScore : '--'}<small style="font-size: 0.9rem; font-weight: 500; color: var(--text-muted);">/100</small>
          </div>
          <div style="font-size: 0.78rem; color: ${isNewUser ? 'var(--gold-primary)' : 'var(--accent-emerald)'}; font-weight: 600;">
            ${isNewUser ? 'Pending evaluation scan' : '+4 pts since last evaluation'}
          </div>
        </div>

        <div class="glass-card" style="padding: 1.1rem; border-left: 4px solid var(--accent-emerald);">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Regimen Completion</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--text-primary); margin: 0.2rem 0;">${routinePct}%</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${completedSteps} of ${totalSteps} daily steps logged</div>
        </div>

        <div class="glass-card" style="padding: 1.1rem; border-left: 4px solid var(--accent-amber);">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Daily Hydration</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--text-primary); margin: 0.2rem 0;">${hydrationMl} <small style="font-size: 0.9rem; font-weight: 500;">ml</small></div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">Target: 2,500 ml / day</div>
        </div>

        <div class="glass-card" style="padding: 1.1rem; border-left: 4px solid var(--pink-blush);">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Habit Streak & Progress</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--text-primary); margin: 0.2rem 0;">${currentStreak} Days <small style="font-size: 1rem;">🔥</small></div>
          <div style="font-size: 0.78rem; color: ${isNewUser ? 'var(--gold-primary)' : 'var(--accent-emerald)'}; font-weight: 600; cursor: pointer;" onclick="window.app.navigateToView('progress')">
            ${isNewUser ? 'Start your streak today &rarr;' : '+10.9 pts gain • View Analytics &rarr;'}
          </div>
        </div>
      </div>

      <!-- NEW USER ONBOARDING WELCOME BANNER -->
      ${isNewUser ? `
        <div style="background: linear-gradient(135deg, #FAF8F5 0%, #F5EFE4 100%); border: 1px solid var(--border-gold); border-radius: var(--radius-sm); padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: #181614; color: var(--gold-primary); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0; border: 1px solid var(--border-gold);">
              ✨
            </div>
            <div>
              <strong style="font-size: 1.05rem; color: var(--text-primary);">Welcome to PanaceaAI Skin Intelligence, ${profileName}!</strong>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0.2rem 0 0 0; max-width: 680px;">
                Your personalized skincare journey begins with a baseline clinical evaluation. Take your first optical webcam/photo scan or complete our assessment survey to unlock your custom AM/PM regimen and formulation matches.
              </p>
            </div>
          </div>
          <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
            <button class="btn btn-primary btn-sm" onclick="window.app.openModal('photo-scan-modal')" style="font-weight: 700; padding: 0.55rem 1.2rem;">
              📸 Take AI Skin Scan
            </button>
            <button class="btn btn-outline btn-sm" onclick="window.app.openModal('assessment-modal')" style="font-weight: 700; padding: 0.55rem 1.2rem; background: #FFFFFF;">
              📋 Start Assessment Survey
            </button>
          </div>
        </div>
      ` : `
        <!-- PROGRESS TRACKING & BEFORE/AFTER BANNER -->
        <div style="background: linear-gradient(135deg, #FAF8F5 0%, #F5EFE4 100%); border: 1px solid var(--border-gold); border-radius: var(--radius-sm); padding: 1rem 1.25rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; box-shadow: 0 2px 10px rgba(0,0,0,0.02);">
          <div style="display: flex; align-items: center; gap: 0.9rem;">
            <div style="width: 42px; height: 42px; border-radius: 50%; background: #181614; color: var(--gold-primary); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; border: 1px solid var(--border-gold);">
              📈
            </div>
            <div>
              <strong style="font-size: 0.95rem; color: var(--text-primary);">Skin Progress Monitoring & 30-Day Transformation</strong>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0.1rem 0 0 0;">
                Your 18-day adherence streak has driven an optical transformation from 68.5 to 79.4 / 100 with a 71.4% reduction in acne severity.
              </p>
            </div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="window.app.navigateToView('progress')" style="font-weight: 700; padding: 0.5rem 1.2rem; font-size: 0.82rem;">
            📊 Open Progress & Analytics Lab &rarr;
          </button>
        </div>
      `}

      <!-- MAIN DASHBOARD GRID -->
      <div class="dashboard-grid">
        <!-- Skin Health Diagnostics Card -->
        <div class="glass-card score-card" style="background: #FFFFFF;">
          <div class="card-header" style="border-bottom: 1px solid var(--border-light); padding-bottom: 0.85rem; margin-bottom: 1rem;">
            <div>
              <h3 style="font-family: 'Playfair Display', serif; font-size: 1.25rem;">Cutaneous Health Score Breakdown</h3>
              <p class="text-muted" style="font-size: 0.8rem; margin-top: 0.1rem;">Weighted multi-parameter diagnostic telemetry</p>
            </div>
            <span class="badge badge-success" style="font-weight: 600;">${scoreGrade}</span>
          </div>
          
          <div class="score-display-container" style="margin-bottom: 1.25rem;">
            <div class="score-circle" style="--score-pct: ${overallScore !== null ? overallScore : 0}%;">
              <div class="score-number" style="${overallScore === null ? 'font-size: 1.6rem; color: var(--text-muted);' : ''}">${overallScore !== null ? overallScore : '--'}</div>
              <div class="score-label">${overallScore !== null ? 'OVERALL INDEX' : 'PENDING SCAN'}</div>
            </div>
            <div class="score-info">
              <h4 class="score-grade" style="font-family: 'Playfair Display', serif; font-size: 1.15rem;">
                ${isNewUser ? 'Awaiting Baseline Diagnostic' : (metricsData?.grade || MOCK_USER_DATA.skinScore.grade || 'Good - Improving')}
              </h4>
              <p class="score-desc" style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">
                ${isNewUser
                  ? 'Your holistic score is calculated across 5 clinical diagnostic factors: stratum corneum moisture, sebum regulation, inflammatory acne severity, barrier elasticity, and lifestyle stress.'
                  : 'Calculated across 5 clinical diagnostic factors including stratum corneum moisture, sebum regulation, inflammatory index, structural elasticity, and lifestyle resilience.'}
              </p>
              ${isNewUser ? `
                <button class="btn btn-sm btn-primary" onclick="window.app.openModal('photo-scan-modal')" style="margin-top: 0.5rem; font-size: 0.78rem;">📸 Launch AI Skin Scan</button>
              ` : ''}
            </div>
          </div>

          <div class="score-breakdown-list" style="display: flex; flex-direction: column; gap: 0.85rem;">
            ${scoreBreakdown.length > 0 ? scoreBreakdown.map(item => {
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
            }).join('') : `
              <div style="padding: 1.25rem; background: #FAF9F6; border-radius: var(--radius-sm); border: 1px dashed var(--border-light); text-align: center; color: var(--text-muted); font-size: 0.85rem;">
                No biomarker evaluations recorded yet. Complete your first skin scan to view detailed condition, lifestyle, sleep, consistency, and hydration factor contributions.
              </div>
            `}
          </div>

          <!-- Interactive Trackers -->
          <div class="tracker-row" style="margin-top: 1.25rem;">
            <div class="tracker-box" style="background: rgba(197, 155, 39, 0.05); border: 1px solid var(--border-gold); padding: 1rem; border-radius: var(--radius-sm);">
              <small style="color: var(--text-muted); font-weight: 700; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em;">💧 Daily Hydration Tracker</small>
              <div class="tracker-val" style="font-size: 1.4rem; font-weight: 800; margin: 0.2rem 0;">${hydrationMl} <small style="font-size: 0.85rem; font-weight: 500;">ml</small></div>
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
            ${morningRoutine.length > 0 ? morningRoutine.map(item => `
              <div class="step-item ${item.completed ? 'completed' : ''}" onclick="window.app.toggleStep('morning', '${item.id}')" style="cursor: pointer; padding: 0.9rem 1.1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-light); margin-bottom: 0.65rem; background: ${item.completed ? '#F8FBF8' : '#FAF9F6'}; transition: var(--transition); position: relative;">
                <div style="display: flex; align-items: flex-start; width: 100%;">
                  <div class="step-checkbox" style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid ${item.completed ? 'var(--accent-emerald)' : 'var(--text-muted)'}; background: ${item.completed ? 'var(--accent-emerald)' : 'transparent'}; color: #fff; font-weight: 700; font-size: 0.8rem; margin-top: 0.2rem;">${item.completed ? '✓' : ''}</div>
                  <div class="step-details" style="flex: 1; margin-left: 0.85rem; padding-right: 1.5rem;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.2rem;">
                      <span class="step-type" style="font-size: 0.72rem; font-weight: 800; color: var(--gold-primary); text-transform: uppercase; letter-spacing: 0.05em;">${item.step || item.category || (item.step_order ? 'Step ' + item.step_order : 'Step')}</span>
                      <span class="step-time" style="font-size: 0.78rem; font-weight: 600; color: var(--text-muted);">${item.time || '1 min'}</span>
                    </div>
                    <h4 class="step-title" style="font-size: 0.95rem; font-weight: 700; margin: 0 0 0.25rem 0; ${item.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${item.title || item.step_name || item.name || 'Personalized Step'}</h4>
                    <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0 0 0.4rem 0;">💡 <strong>Rec:</strong> ${item.product_recommendation || item.product_name || item.instructions || item.title || item.name || 'Recommended Formulation'}</p>
                    ${item.key_ingredients && item.key_ingredients.length > 0 ? `
                      <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
                        ${item.key_ingredients.map(ing => `<span style="background: rgba(197, 155, 39, 0.12); color: #7A5F13; font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 10px;">${ing}</span>`).join('')}
                      </div>
                    ` : ''}
                  </div>
                  <button title="Remove step" onclick="event.stopPropagation(); window.app.deleteStep('morning', '${item.id}')" style="position: absolute; top: 10px; right: 10px; background: transparent; border: none; font-size: 1.1rem; color: var(--text-muted); cursor: pointer;">&times;</button>
                </div>
              </div>
            `).join('') : `
              <div style="text-align: center; padding: 2rem 1rem; background: #FAF9F6; border-radius: var(--radius-sm); border: 1px dashed var(--border-gold);">
                <div style="font-size: 1.8rem; margin-bottom: 0.4rem;">🌅</div>
                <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem;">No Active Morning Routine Steps</h4>
                <p style="font-size: 0.82rem; color: var(--text-muted); max-width: 420px; margin: 0 auto 0.85rem auto;">
                  Complete your skin assessment or take an optical scan to receive an AI-tailored morning regimen.
                </p>
                <button class="btn btn-sm btn-primary" onclick="window.app.openModal('assessment-modal')" style="font-weight: 700;">📋 Take Skin Assessment</button>
              </div>
            `}
          </div>

          <!-- PM Routine View -->
          <div id="routine-list-pm" class="routine-step-list hidden">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
              <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted);">SEQUENCE: 🧼 Cleansing → ✨ Exfoliation → 💧 Treatment → 🧴 Moisturizing → 🌙 Night Care</div>
              <button class="btn btn-sm btn-outline" style="font-size: 0.75rem; padding: 0.25rem 0.65rem;" onclick="window.app.openCreateStepModal('evening')">➕ Add Custom PM Step</button>
            </div>
            ${eveningRoutine.length > 0 ? eveningRoutine.map(item => `
              <div class="step-item ${item.completed ? 'completed' : ''}" onclick="window.app.toggleStep('evening', '${item.id}')" style="cursor: pointer; padding: 0.9rem 1.1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-light); margin-bottom: 0.65rem; background: ${item.completed ? '#F8FBF8' : '#FAF9F6'}; transition: var(--transition); position: relative;">
                <div style="display: flex; align-items: flex-start; width: 100%;">
                  <div class="step-checkbox" style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid ${item.completed ? 'var(--accent-emerald)' : 'var(--text-muted)'}; background: ${item.completed ? 'var(--accent-emerald)' : 'transparent'}; color: #fff; font-weight: 700; font-size: 0.8rem; margin-top: 0.2rem;">${item.completed ? '✓' : ''}</div>
                  <div class="step-details" style="flex: 1; margin-left: 0.85rem; padding-right: 1.5rem;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.2rem;">
                      <span class="step-type" style="font-size: 0.72rem; font-weight: 800; color: var(--gold-primary); text-transform: uppercase; letter-spacing: 0.05em;">${item.step || item.category || (item.step_order ? 'Step ' + item.step_order : 'Step')}</span>
                      <span class="step-time" style="font-size: 0.78rem; font-weight: 600; color: var(--text-muted);">${item.time || '2 mins'}</span>
                    </div>
                    <h4 class="step-title" style="font-size: 0.95rem; font-weight: 700; margin: 0 0 0.25rem 0; ${item.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${item.title || item.step_name || item.name || 'Personalized Step'}</h4>
                    <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0 0 0.4rem 0;">💡 <strong>Rec:</strong> ${item.product_recommendation || item.product_name || item.instructions || item.title || item.name || 'Recommended Formulation'}</p>
                    ${item.key_ingredients && item.key_ingredients.length > 0 ? `
                      <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
                        ${item.key_ingredients.map(ing => `<span style="background: rgba(142, 36, 170, 0.12); color: #5B1370; font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 10px;">${ing}</span>`).join('')}
                      </div>
                    ` : ''}
                  </div>
                  <button title="Remove step" onclick="event.stopPropagation(); window.app.deleteStep('evening', '${item.id}')" style="position: absolute; top: 10px; right: 10px; background: transparent; border: none; font-size: 1.1rem; color: var(--text-muted); cursor: pointer;">&times;</button>
                </div>
              </div>
            `).join('') : `
              <div style="text-align: center; padding: 2rem 1rem; background: #FAF9F6; border-radius: var(--radius-sm); border: 1px dashed var(--border-gold);">
                <div style="font-size: 1.8rem; margin-bottom: 0.4rem;">🌙</div>
                <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem;">No Active Evening Routine Steps</h4>
                <p style="font-size: 0.82rem; color: var(--text-muted); max-width: 420px; margin: 0 auto 0.85rem auto;">
                  Complete your skin assessment or take an optical scan to receive an AI-tailored evening regimen.
                </p>
                <button class="btn btn-sm btn-primary" onclick="window.app.openModal('assessment-modal')" style="font-weight: 700;">📋 Take Skin Assessment</button>
              </div>
            `}
          </div>

          <!-- Weekly Treatment Plan View -->
          <div id="routine-list-weekly" class="routine-step-list hidden">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
              <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted);">PERIODIC TREATMENT SCHEDULE (MON – SUN)</div>
              <button class="btn btn-sm btn-outline" style="font-size: 0.75rem; padding: 0.25rem 0.65rem;" onclick="window.app.openModal('create-weekly-modal')">➕ Create Custom Weekly Treatment</button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.85rem;">
              ${(isNewUser ? [] : (MOCK_USER_DATA.routine.weeklyPlan || [
                { day: 'Wednesday & Sunday', focus: 'BHA Chemical Exfoliation', category: '✨ Exfoliation', treatment_name: '2% Salicylic Acid Exfoliant Liquid', instructions: 'Pore clearing & smooth texture renewal.', icon: '✨' },
                { day: 'Friday Evening', focus: 'Deep Moisture Sheet Mask', category: '💧 Treatment', treatment_name: 'Ceramide & Hyaluronic Sheet Mask', instructions: 'Intense moisture infusion for 15-20 min.', icon: '💧' },
                { day: 'Saturday Morning', focus: 'Weekend Lip & Eye Ritual', category: '🌙 Night Care', treatment_name: 'Peptide Lip Butter & Cooling Eye Serum', instructions: 'Nourish delicate eye & lip zones.', icon: '🌙' }
              ])).map((w, idx) => `
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
              ${isNewUser ? `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem 1rem; background: #FAF9F6; border-radius: var(--radius-sm); border: 1px dashed var(--border-gold);">
                  <div style="font-size: 1.8rem; margin-bottom: 0.4rem;">📅</div>
                  <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem;">No Periodic Weekly Treatments Scheduled</h4>
                  <p style="font-size: 0.82rem; color: var(--text-muted); max-width: 420px; margin: 0 auto 0.85rem auto;">
                    Targeted periodic treatments (e.g. chemical peels, deep moisture masks) will populate after clinical assessment.
                  </p>
                  <button class="btn btn-sm btn-primary" onclick="window.app.openModal('assessment-modal')" style="font-weight: 700;">📋 Take Skin Assessment</button>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Seasonal Advice View -->
          <div id="routine-list-seasonal" class="routine-step-list hidden">
            <div style="padding: 1.1rem; background: linear-gradient(135deg, rgba(204, 251, 241, 0.3), rgba(240, 253, 250, 0.8)); border: 1px solid rgba(45, 212, 191, 0.3); border-radius: var(--radius-sm);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <h4 style="font-family: 'Playfair Display', serif; font-size: 1.1rem; margin: 0;">Season: Summer ☀️</h4>
                <span class="badge" style="background: #0D9488; color: #fff; font-size: 0.72rem;">Active Climate Protocol</span>
              </div>
              <p style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem;">🌍 <strong>Impact:</strong> High UV index, elevated humidity & sweat production.</p>
              
              <div style="margin-top: 0.75rem;">
                <h5 style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; color: #0F766E; margin-bottom: 0.35rem;">Recommended Adjustments:</h5>
                <ul style="margin: 0; padding-left: 1.2rem; font-size: 0.82rem; color: var(--text-secondary);">
                  <li style="margin-bottom: 0.25rem;">Switch heavy creams to lightweight oil-free gel moisturizers.</li>
                  <li style="margin-bottom: 0.25rem;">Ensure daily SPF is 50+ and water/sweat resistant.</li>
                </ul>
              </div>

              <div style="display: flex; gap: 1.5rem; margin-top: 0.85rem; flex-wrap: wrap;">
                <div>
                  <small style="font-size: 0.72rem; font-weight: 800; color: #047857; text-transform: uppercase;">Best Ingredients:</small>
                  <div style="display: flex; gap: 0.3rem; margin-top: 0.2rem; flex-wrap: wrap;">
                    <span style="background: #D1FAE5; color: #065F46; font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 8px;">Niacinamide</span>
                    <span style="background: #D1FAE5; color: #065F46; font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 8px;">Zinc Oxide</span>
                    <span style="background: #D1FAE5; color: #065F46; font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 8px;">Squalane</span>
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
          <span class="badge badge-accent" style="font-weight: 600;">${activeConcerns.length} Active Factors</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1rem;">
          ${activeConcerns.length > 0 ? activeConcerns.map((c, idx) => `
            <div style="padding: 1.1rem; background: #FAF9F6; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span style="font-size: 0.7rem; font-weight: 800; color: var(--accent-amber); text-transform: uppercase; letter-spacing: 0.05em;">PRIORITY #${idx + 1}</span>
                <span class="badge badge-warning" style="font-size: 0.75rem;">Active Focus</span>
              </div>
              <h4 style="font-family: 'Playfair Display', serif; font-size: 1.05rem; margin-bottom: 0.35rem;">${c}</h4>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">Clinical monitoring and personalized active ingredient intervention.</p>
              <div style="margin-bottom: 0.5rem;">
                <small style="font-size: 0.75rem; font-weight: 700; color: var(--text-primary);">Recommended Active Ingredients:</small>
                <div class="tag-cloud" style="margin-top: 0.25rem; display: flex; gap: 0.35rem; flex-wrap: wrap;">
                  <span class="tag" style="background: rgba(197,155,39,0.12); color: var(--gold-primary); font-size: 0.75rem; padding: 0.2rem 0.55rem; border-radius: 4px;">Ceramides</span>
                  <span class="tag" style="background: rgba(197,155,39,0.12); color: var(--gold-primary); font-size: 0.75rem; padding: 0.2rem 0.55rem; border-radius: 4px;">Niacinamide</span>
                  <span class="tag" style="background: rgba(197,155,39,0.12); color: var(--gold-primary); font-size: 0.75rem; padding: 0.2rem 0.55rem; border-radius: 4px;">Hyaluronic Acid</span>
                </div>
              </div>
            </div>
          `).join('') : `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem 1rem; background: #FAF9F6; border-radius: var(--radius-sm); border: 1px dashed var(--border-light); color: var(--text-muted);">
              <p style="font-size: 0.85rem; margin-bottom: 0.75rem;">No active dermatological concerns recorded yet. Complete your first skin assessment to identify specific concerns and targeted formulations.</p>
              <button class="btn btn-sm btn-primary" onclick="window.app.openModal('assessment-modal')" style="font-weight: 700;">📋 Take Skin Assessment</button>
            </div>
          `}
        </div>
      </div>

      <!-- FORMULATED PRODUCTS CATALOG (TOP AI MATCHES) -->
      <div class="glass-card section-margin" style="background: #FFFFFF; padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-light); margin-top: 1.5rem;">
        <div class="card-header" style="border-bottom: 1px solid var(--border-light); padding-bottom: 0.85rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <h3 style="font-family: 'Playfair Display', serif; font-size: 1.25rem;">AI Matched Skincare Products</h3>
            <p class="text-muted" style="font-size: 0.8rem; margin-top: 0.1rem;">Top personalized clinical formulations matched to your current skin classification & biomarkers</p>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-sm btn-primary" style="font-size: 0.8rem; padding: 0.45rem 1rem; font-weight: 700;" onclick="window.app.navigateToView('products')">
              🛍️ Explore All Products (30+) &rarr;
            </button>
            <button class="btn btn-sm btn-outline" style="font-size: 0.78rem; padding: 0.4rem 0.85rem;" onclick="window.app.refreshDashboardFormulations()">
              🔄 Re-Score Regimen
            </button>
          </div>
        </div>
        
        <div class="products-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
          ${recommendedProducts.length > 0 ? recommendedProducts.map(p => `
            <div class="product-card" style="background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 1.15rem; display: flex; flex-direction: column; justify-content: space-between; position: relative;">
              <div>
                <div class="product-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                  <span class="badge badge-accent" style="font-size: 0.72rem; font-weight: 700;">${p.badge || 'Top Match'}</span>
                  <span class="match-score" style="font-size: 0.82rem; font-weight: 800; color: var(--gold-primary); cursor: pointer;" onclick="window.app.openScoreBreakdownModal('${p.id}')" title="Click to view AI score calculation breakdown">
                    ${p.matchScore || '95%'} Compatibility ℹ️
                  </span>
                </div>
                <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--gold-primary); letter-spacing: 0.04em;">${p.brand || 'Clinically Formulated'}</div>
                <h4 class="product-name" style="font-family: 'Playfair Display', serif; font-size: 1.02rem; margin: 0.15rem 0 0.35rem; line-height: 1.35;">${p.name}</h4>
                <div style="display: flex; align-items: baseline; gap: 0.45rem; margin-bottom: 0.5rem;">
                  <span style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary);">${p.price}</span>
                  ${p.mrp ? `<span style="font-size: 0.8rem; color: var(--text-muted); text-decoration: line-through;">${p.mrp}</span>` : ''}
                  <span style="font-size: 0.75rem; color: var(--text-muted);">• ${p.category}</span>
                </div>
                <div class="product-ingredients" style="margin-bottom: 0.65rem;">
                  <small style="color: var(--text-muted); font-size: 0.73rem; font-weight: 600;">Key Active Ingredients:</small>
                  <div class="tag-cloud" style="margin-top: 0.25rem; display: flex; gap: 0.3rem; flex-wrap: wrap;">
                    ${(p.keyIngredients || []).map(ing => `<span class="tag" style="background: #FFFFFF; border: 1px solid var(--border-light); font-size: 0.7rem; padding: 0.15rem 0.4rem; border-radius: 4px; color: var(--text-primary);">${ing}</span>`).join('')}
                  </div>
                </div>
                <p class="product-reason" style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 0.75rem;">💡 ${p.reason || 'Optimal formulation for skin condition'}</p>
                
                <!-- Direct E-Commerce Store Buy Buttons -->
                <div style="margin-bottom: 0.75rem;">
                  <small style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Direct E-Commerce Stores:</small>
                  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.35rem; margin-top: 0.25rem;">
                    <a href="${p.e_commerce_links?.amazon || `https://www.amazon.in/s?k=${encodeURIComponent(p.name)}`}" target="_blank" rel="noopener noreferrer" class="store-btn store-btn-amazon">
                      Amazon ↗
                    </a>
                    <a href="${p.e_commerce_links?.nykaa || `https://www.nykaa.com/search/result/?q=${encodeURIComponent(p.name)}`}" target="_blank" rel="noopener noreferrer" class="store-btn store-btn-nykaa">
                      Nykaa ↗
                    </a>
                    <a href="${p.e_commerce_links?.flipkart || `https://www.flipkart.com/search?q=${encodeURIComponent(p.name)}`}" target="_blank" rel="noopener noreferrer" class="store-btn store-btn-flipkart">
                      Flipkart ↗
                    </a>
                  </div>
                </div>
              </div>
              <div style="display: flex; gap: 0.4rem; margin-top: 0.5rem;">
                <button class="btn btn-sm btn-primary" style="flex: 1; font-size: 0.75rem;" onclick="window.app.addProductToRoutine('${p.name}', '${p.category}')">+ Add to Routine</button>
                <button class="btn btn-sm btn-outline" style="font-size: 0.75rem; padding: 0.35rem 0.6rem;" onclick="window.app.toggleCompareProduct('${p.id}')" title="Add to Compare">⚖️ Compare</button>
                <button class="btn btn-sm btn-outline" style="font-size: 0.75rem; padding: 0.35rem 0.6rem;" onclick="window.app.viewSaferAlternatives('${p.id}')" title="Find Dupes & Safer Alternatives">🛡️ Alt</button>
              </div>
            </div>
          `).join('') : `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem 1.5rem; background: #FAF9F6; border-radius: var(--radius-sm); border: 1px dashed var(--border-gold);">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">🧴</div>
              <h4 style="font-family: 'Playfair Display', serif; font-size: 1.15rem; margin-bottom: 0.35rem;">Product Matches Awaiting Assessment</h4>
              <p style="font-size: 0.85rem; color: var(--text-muted); max-width: 480px; margin: 0 auto 1.25rem auto; line-height: 1.45;">
                Formulation compatibility scoring & dupe rankings are personalized to your skin biomarkers. Complete your first scan or explore the 30+ product catalog.
              </p>
              <div style="display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap;">
                <button class="btn btn-sm btn-primary" onclick="window.app.navigateToView('products')" style="font-weight: 700; padding: 0.5rem 1.2rem;">🛍️ Browse All Products (30+)</button>
                <button class="btn btn-sm btn-outline" onclick="window.app.openModal('photo-scan-modal')" style="font-weight: 700; padding: 0.5rem 1.2rem; background: #FFFFFF;">📸 Take Skin Scan</button>
              </div>
            </div>
          `}
        </div>

        <!-- Full Catalog Navigation Prompt Banner -->
        <div style="margin-top: 1.25rem; padding: 1rem 1.25rem; background: #FAF9F6; border: 1px solid var(--border-gold); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <strong style="font-size: 0.9rem; color: var(--text-primary);">Looking for more formulations or specific budget ranges?</strong>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">Explore 30+ cleansers, serums, sunscreens & barrier creams with search, sort, side-by-side comparison, and budget filters.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="window.app.navigateToView('products')" style="font-weight: 700; padding: 0.5rem 1.2rem;">
            🛍️ Open Full Products Catalog &rarr;
          </button>
        </div>
      </div>

      <!-- MODULE 5: INGREDIENT INTELLIGENCE HUB -->
      <div class="glass-card section-margin" style="background: #FFFFFF; padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-light); margin-top: 1.5rem;">
        <div class="card-header" style="border-bottom: 1px solid var(--border-light); padding-bottom: 0.85rem; margin-bottom: 1rem;">
          <div>
            <h3 style="font-family: 'Playfair Display', serif; font-size: 1.25rem;">Ingredient Intelligence Hub</h3>
            <p class="text-muted" style="font-size: 0.8rem; margin-top: 0.1rem;">Analyze ingredient lists, detect clashes, synergies & check safety against active allergies</p>
          </div>
          <span class="badge badge-success" style="font-weight: 600;">8 Categories Loaded</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem;">
          <!-- Analyzer Tool -->
          <div style="padding: 1.1rem; background: #FAF9F6; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
            <h4 style="font-family: 'Playfair Display', serif; font-size: 1.05rem; margin-bottom: 0.35rem;">🧪 Ingredient Safety & Clash Analyzer</h4>
            <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.75rem;">Type or paste formulation ingredients separated by commas:</p>
            
            <textarea id="ui-ingredient-input" class="form-control" rows="3" style="font-size: 0.85rem; margin-bottom: 0.75rem;" placeholder="e.g. Retinol, Glycolic Acid, Niacinamide, Hyaluronic Acid, Fragrance (Parfum)"></textarea>
            
            <button class="btn btn-sm btn-primary" style="width: 100%; font-size: 0.82rem;" onclick="window.app.analyzeIngredientsFromUI()">Run Ingredient Analysis 🔬</button>

            <!-- Analysis Output Box -->
            <div id="ui-ingredient-output" style="margin-top: 1rem; display: none; padding: 0.85rem; background: #FFFFFF; border-radius: var(--radius-sm); border: 1px solid var(--border-gold);">
            </div>
          </div>

          <!-- Ingredient Library Dictionary -->
          <div style="padding: 1.1rem; background: #FAF9F6; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
            <h4 style="font-family: 'Playfair Display', serif; font-size: 1.05rem; margin-bottom: 0.35rem;">📚 8 Core Ingredient Categories Library</h4>
            <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.75rem;">Clinical benefits & target concentrations:</p>
            
            <div style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 260px; overflow-y: auto; padding-right: 0.25rem;">
              <div style="padding: 0.5rem 0.75rem; background: #FFF; border-radius: 4px; border-left: 3px solid var(--gold-primary);">
                <strong style="font-size: 0.82rem;">1. Retinoids</strong> <small style="color: var(--text-muted);">(0.1% - 1.0%)</small>
                <div style="font-size: 0.78rem; color: var(--text-muted);">Cellular turnover, fine lines & acne clearance.</div>
              </div>
              <div style="padding: 0.5rem 0.75rem; background: #FFF; border-radius: 4px; border-left: 3px solid var(--accent-emerald);">
                <strong style="font-size: 0.82rem;">2. Niacinamide</strong> <small style="color: var(--text-muted);">(2.0% - 10.0%)</small>
                <div style="font-size: 0.78rem; color: var(--text-muted);">Barrier repair, sebum balance & redness reduction.</div>
              </div>
              <div style="padding: 0.5rem 0.75rem; background: #FFF; border-radius: 4px; border-left: 3px solid var(--accent-amber);">
                <strong style="font-size: 0.82rem;">3. Vitamin C</strong> <small style="color: var(--text-muted);">(10.0% - 20.0%)</small>
                <div style="font-size: 0.78rem; color: var(--text-muted);">Antioxidant protection & radiance brightening.</div>
              </div>
              <div style="padding: 0.5rem 0.75rem; background: #FFF; border-radius: 4px; border-left: 3px solid var(--accent-rose);">
                <strong style="font-size: 0.82rem;">4. Hyaluronic Acid</strong> <small style="color: var(--text-muted);">(1.0% - 2.0%)</small>
                <div style="font-size: 0.78rem; color: var(--text-muted);">Deep surface hydration & plumping fine lines.</div>
              </div>
              <div style="padding: 0.5rem 0.75rem; background: #FFF; border-radius: 4px; border-left: 3px solid var(--gold-primary);">
                <strong style="font-size: 0.82rem;">5. Salicylic Acid (BHA)</strong> <small style="color: var(--text-muted);">(0.5% - 2.0%)</small>
                <div style="font-size: 0.78rem; color: var(--text-muted);">Pore exfoliation & blackhead dissolution.</div>
              </div>
              <div style="padding: 0.5rem 0.75rem; background: #FFF; border-radius: 4px; border-left: 3px solid var(--accent-emerald);">
                <strong style="font-size: 0.82rem;">6. Ceramides (NP/AP/EOP)</strong> <small style="color: var(--text-muted);">(1.0% - 5.0%)</small>
                <div style="font-size: 0.78rem; color: var(--text-muted);">Intercellular lipid seal & moisture retention.</div>
              </div>
              <div style="padding: 0.5rem 0.75rem; background: #FFF; border-radius: 4px; border-left: 3px solid var(--accent-amber);">
                <strong style="font-size: 0.82rem;">7. Peptides (Matrixyl 3000)</strong> <small style="color: var(--text-muted);">(3.0% - 8.0%)</small>
                <div style="font-size: 0.78rem; color: var(--text-muted);">Collagen & elastin structural firmness boost.</div>
              </div>
              <div style="padding: 0.5rem 0.75rem; background: #FFF; border-radius: 4px; border-left: 3px solid var(--accent-rose);">
                <strong style="font-size: 0.82rem;">8. AHAs/BHAs (Glycolic/Lactic)</strong> <small style="color: var(--text-muted);">(5.0% - 10.0%)</small>
                <div style="font-size: 0.78rem; color: var(--text-muted);">Surface cell desmosome dissolving for texture glow.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MODULE 6 & 7: ADVANCED PRODUCT COMPARISON & SCORING ENGINE -->
      <div class="glass-card section-margin" style="background: #FFFFFF; padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-light); margin-top: 1.5rem;">
        <div class="card-header" style="border-bottom: 1px solid var(--border-light); padding-bottom: 0.85rem; margin-bottom: 1rem;">
          <div>
            <h3 style="font-family: 'Playfair Display', serif; font-size: 1.25rem;">Skin Health Scoring Engine (35/20/15/20/10 Model)</h3>
            <p class="text-muted" style="font-size: 0.8rem; margin-top: 0.1rem;">Explicit weighted skin health formula & daily routine adherence tracker</p>
          </div>
          <button class="btn btn-sm btn-primary" style="font-size: 0.78rem; padding: 0.4rem 0.85rem;" onclick="window.app.logRoutineAdherenceFromUI()">✅ Log Routine Completion (+2.5 pts)</button>
        </div>

        <div style="padding: 1.1rem; background: linear-gradient(135deg, rgba(197, 155, 39, 0.08), rgba(46, 125, 50, 0.05)); border-radius: var(--radius-sm); border: 1px solid var(--border-gold); margin-bottom: 1rem;">
          <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.35rem;">Weighted Formula Computation:</h4>
          <div style="font-size: 0.85rem; font-family: monospace; color: var(--gold-primary); font-weight: 700;">
            Skin Health Score = (Condition × 35%) + (Lifestyle × 20%) + (Sleep × 15%) + (Consistency × 20%) + (Hydration × 10%)
          </div>
          <div style="display: flex; gap: 1rem; margin-top: 0.75rem; flex-wrap: wrap; font-size: 0.82rem;">
            <div><strong>Condition (35%):</strong> 75.0 pts &rarr; <span style="color: var(--accent-emerald);">26.25 contribution</span></div>
            <div><strong>Lifestyle (20%):</strong> 80.0 pts &rarr; <span style="color: var(--accent-emerald);">16.00 contribution</span></div>
            <div><strong>Sleep (15%):</strong> 70.0 pts &rarr; <span style="color: var(--accent-emerald);">10.50 contribution</span></div>
            <div><strong>Consistency (20%):</strong> 85.0 pts &rarr; <span style="color: var(--accent-emerald);">17.00 contribution</span></div>
            <div><strong>Hydration (10%):</strong> 80.0 pts &rarr; <span style="color: var(--accent-emerald);">8.00 contribution</span></div>
          </div>
          <div style="margin-top: 0.65rem; font-size: 0.95rem; font-weight: 800; color: var(--text-primary);">
            Overall Weighted Score: <span style="color: var(--accent-emerald); font-size: 1.1rem;">${overallScore !== null ? `${overallScore} / 100` : '-- / 100'}</span> (Grade: ${scoreGrade})
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderConsultantDashboard(liveClients = null) {
  const clients = liveClients || [
    {
      id: 1,
      username: 'user',
      full_name: 'Alex Rivera',
      email: 'user@panacea.ai',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      skin_type: 'Combination',
      primary_concerns: ['Acne & Breakouts', 'Compromised Barrier', 'Post-Acne Melanin'],
      overall_score: 79.4,
      baseline_score: 68.5,
      score_delta: 10.9,
      status: 'Under Active Regimen',
      priority: 'Standard',
      last_assessment: '24 Nov 2025',
      consultant_notes: 'Patient showed +54.2% hydration boost. Barrier restored after introducing ceramide night barrier seal.'
    },
    {
      id: 5,
      username: 'sarah_jenkins',
      full_name: 'Sarah Jenkins',
      email: 'sarah.jenkins@panacea.ai',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      skin_type: 'Sensitive / Dry',
      primary_concerns: ['Erythema & Rosacea', 'Compromised Barrier', 'Flaking'],
      overall_score: 71.2,
      baseline_score: 58.0,
      score_delta: 13.2,
      status: 'Needs Clinical Review',
      priority: 'High',
      last_assessment: '22 Nov 2025',
      consultant_notes: 'Facial flushing improved with Centella serum. Avoid all physical exfoliating scrubs.'
    },
    {
      id: 6,
      username: 'marcus_v',
      full_name: 'Marcus Vance',
      email: 'marcus.v@panacea.ai',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      skin_type: 'Oily / Congested',
      primary_concerns: ['Severe Cystic Acne', 'High Sebum Excretion', 'Textural Scarring'],
      overall_score: 65.5,
      baseline_score: 50.0,
      score_delta: 15.5,
      status: 'Active Medical Treatment',
      priority: 'High',
      last_assessment: '23 Nov 2025',
      consultant_notes: 'Sebum excretion elevated (78%). Advised oil-free foaming cleanser and non-comedogenic water gel.'
    }
  ];

  const pendingCount = clients.filter(c => c.status.includes('Review') || c.priority === 'High').length;
  const avgScore = Math.round(clients.reduce((acc, c) => acc + c.overall_score, 0) / (clients.length || 1) * 10) / 10;

  return `
    <div class="dashboard-wrapper">
      <div class="dashboard-header" style="background: linear-gradient(135deg, #1C1A18 0%, #2D2723 100%); color: #FFFFFF; border-radius: var(--radius-md); padding: 2rem 2.5rem; margin-bottom: 2rem; border: 1px solid rgba(197, 155, 39, 0.3);">
        <div>
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
            <span class="badge badge-warning" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; padding: 0.3rem 0.8rem;">Esthetician Workspace</span>
            <span style="font-size: 0.85rem; color: #EAE6DF;">• Ananya Iyer, LE</span>
          </div>
          <h2 style="color: #FFFFFF; font-family: 'Playfair Display', serif; font-size: 1.85rem; margin: 0 0 0.35rem;">Consultant Workspace — Ananya Iyer, LE</h2>
          <p style="color: #D1CBC4; font-size: 0.9rem; margin: 0;">Evaluate live client biometric assessments, monitor 30-day compliance, and synthesize personalized regimens</p>
        </div>
        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <button class="btn btn-primary" onclick="window.app.openClientDossierModal(1, 'assessment')">
            🔍 Open Primary Client Dossier
          </button>
        </div>
      </div>

      <div class="metrics-row">
        <div class="metric-card">
          <div class="metric-value">${clients.length}</div>
          <div class="metric-label">Active Assigned Clients</div>
        </div>
        <div class="metric-card">
          <div class="metric-value" style="color: var(--gold-primary);">${pendingCount}</div>
          <div class="metric-label">Priority Reviews Pending</div>
        </div>
        <div class="metric-card">
          <div class="metric-value" style="color: var(--accent-emerald);">${avgScore}</div>
          <div class="metric-label">Client Avg Health Score</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">96.8%</div>
          <div class="metric-label">Regimen Adherence Rate</div>
        </div>
      </div>

      <!-- SYNCHRONIZED CLIENT ROSTER -->
      <div class="glass-card section-margin" style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.75rem;">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <div>
            <h3 style="font-family: 'Playfair Display', serif; font-size: 1.3rem; margin: 0 0 0.25rem;">Active Client Roster & Cutaneous Assessment Queue</h3>
            <p class="text-muted" style="font-size: 0.85rem; margin: 0;">Direct relational data linked to user accounts in PostgreSQL</p>
          </div>
          <span class="badge badge-success" style="font-size: 0.78rem;">Live Data Synchronized</span>
        </div>

        <div class="table-responsive">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #FAF9F6; text-align: left; font-size: 0.8rem; color: var(--text-muted); border-bottom: 1px solid var(--border-light);">
                <th style="padding: 0.85rem 1rem;">Client Identity</th>
                <th style="padding: 0.85rem 1rem;">Skin Classification</th>
                <th style="padding: 0.85rem 1rem;">Health Score & Delta</th>
                <th style="padding: 0.85rem 1rem;">Primary Concerns</th>
                <th style="padding: 0.85rem 1rem;">Status & Priority</th>
                <th style="padding: 0.85rem 1rem;">Last Intake</th>
                <th style="padding: 0.85rem 1rem; text-align: right;">Clinical Actions</th>
              </tr>
            </thead>
            <tbody>
              ${clients.map(c => `
                <tr style="border-bottom: 1px solid var(--border-light); transition: var(--transition);">
                  <td style="padding: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.85rem;">
                      <img src="${c.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" alt="${c.full_name}" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 2px solid var(--gold-primary);">
                      <div>
                        <strong style="color: var(--text-primary); font-size: 0.92rem;">${c.full_name}</strong>
                        <div style="font-size: 0.78rem; color: var(--text-muted);">@${c.username} • ID #${c.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style="padding: 1rem;">
                    <span class="badge" style="background: #FAF4E5; color: var(--gold-primary); font-weight: 700;">${c.skin_type}</span>
                  </td>
                  <td style="padding: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.45rem;">
                      <span class="score-pill" style="font-weight: 800; font-size: 0.95rem; color: var(--text-primary);">${c.overall_score}</span>
                      <span class="delta-pill delta-pill-improved" style="font-size: 0.72rem; padding: 0.15rem 0.45rem;">+${c.score_delta} pts</span>
                    </div>
                  </td>
                  <td style="padding: 1rem; font-size: 0.82rem; color: var(--text-secondary);">
                    ${(c.primary_concerns || []).slice(0, 2).join(', ')}
                  </td>
                  <td style="padding: 1rem;">
                    <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                      <span class="badge ${c.status.includes('Review') ? 'badge-warning' : 'badge-success'}" style="font-size: 0.75rem;">${c.status}</span>
                      <span style="font-size: 0.72rem; font-weight: 700; color: ${c.priority === 'High' ? 'var(--accent-rose)' : 'var(--text-muted)'};">${c.priority} Priority</span>
                    </div>
                  </td>
                  <td style="padding: 1rem; font-size: 0.82rem; color: var(--text-muted);">
                    ${c.last_assessment}
                  </td>
                  <td style="padding: 1rem; text-align: right;">
                    <div style="display: inline-flex; gap: 0.45rem;">
                      <button class="btn btn-sm btn-outline" style="font-size: 0.78rem; font-weight: 700; padding: 0.4rem 0.8rem;" onclick="window.app.openClientDossierModal(${c.id}, 'assessment')">
                        📊 View Dossier
                      </button>
                      <button class="btn btn-sm btn-primary" style="font-size: 0.78rem; font-weight: 700; padding: 0.4rem 0.8rem;" onclick="window.app.openClientDossierModal(${c.id}, 'regimen')">
                        ✏️ Assign Regimen
                      </button>
                    </div>
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

export function renderDermatologistDashboard(livePatients = null) {
  const patients = livePatients || [
    {
      id: 1,
      username: 'user',
      full_name: 'Alex Rivera',
      email: 'user@panacea.ai',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      skin_type: 'Combination',
      condition: 'Mild Comedonal Acne & Post-Acne PIH',
      prescription: 'Topical Adapalene 0.1% (PM 3x/wk) + Azelaic Acid 15% (AM)',
      clinical_status: 'Under Active Regimen',
      priority: 'Standard',
      lesion_screening: {
        classification: 'Benign (Safe / Low Risk)',
        malignancy_risk_score: 8.2,
        badge: 'BENIGN (SAFE)',
        confidence_pct: 98.4
      },
      overall_score: 79.4,
      last_visit: '24 Nov 2025',
      next_review: '24 Dec 2025',
      clinical_notes: 'Follicular retention hyperkeratosis clearing satisfactorily. Recommend maintaining current Retinoid cadence.'
    },
    {
      id: 5,
      username: 'sarah_jenkins',
      full_name: 'Sarah Jenkins',
      email: 'sarah.jenkins@panacea.ai',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      skin_type: 'Sensitive / Dry',
      condition: 'Subacute Erythematotelangiectatic Rosacea',
      prescription: 'Ivermectin 1% Cream (PM) + Ceramide NP Lipid Balm',
      clinical_status: 'Needs Clinical Review',
      priority: 'High',
      lesion_screening: {
        classification: 'Benign Vascular Flushing (Erythema)',
        malignancy_risk_score: 6.5,
        badge: 'BENIGN (SAFE)',
        confidence_pct: 97.8
      },
      overall_score: 71.2,
      last_visit: '22 Nov 2025',
      next_review: '06 Dec 2025',
      clinical_notes: 'Vascular reactivity down from 60 to 32. Scheduled for optical follow-up in 2 weeks.'
    },
    {
      id: 6,
      username: 'marcus_v',
      full_name: 'Marcus Vance',
      email: 'marcus.v@panacea.ai',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      skin_type: 'Oily / Congested',
      condition: 'Moderate-to-Severe Papulopustular Acne',
      prescription: 'Benzoyl Peroxide 2.5% Wash + Clindamycin 1% Gel (AM) + Tretinoin 0.025% (PM)',
      clinical_status: 'Active Medical Treatment',
      priority: 'High',
      lesion_screening: {
        classification: 'Inflammatory Papulopustular Acne Pattern',
        malignancy_risk_score: 11.0,
        badge: 'BENIGN (MONITOR)',
        confidence_pct: 96.2
      },
      overall_score: 65.5,
      last_visit: '23 Nov 2025',
      next_review: '07 Dec 2025',
      clinical_notes: 'Micro-cystic lesions responding to topical antimicrobial therapy. Monitored for retinoid xerosis.'
    }
  ];

  const highRiskCount = patients.filter(p => p.priority === 'High' || p.clinical_status.includes('Review')).length;

  return `
    <div class="dashboard-wrapper">
      <div class="dashboard-header" style="background: linear-gradient(135deg, #18231C 0%, #203527 100%); color: #FFFFFF; border-radius: var(--radius-md); padding: 2rem 2.5rem; margin-bottom: 2rem; border: 1px solid rgba(46, 125, 50, 0.35);">
        <div>
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
            <span class="badge badge-dermatologist" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; padding: 0.3rem 0.8rem; background: rgba(46, 125, 50, 0.3); border: 1px solid #4CAF50; color: #81C784;">Board-Certified Medical Access</span>
            <span style="font-size: 0.85rem; color: #EAE6DF;">• Dr. Rajni Verma, MD (Clinical Director)</span>
          </div>
          <h2 style="color: #FFFFFF; font-family: 'Playfair Display', serif; font-size: 1.85rem; margin: 0 0 0.35rem;">Clinical Skincare Portal — Dr. Rajni Verma, MD</h2>
          <p style="color: #D1E7DD; font-size: 0.9rem; margin: 0;">Perform optical lesion screening verification, clinical condition diagnoses, and active prescription (Rx) authorization</p>
        </div>
        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <button class="btn btn-primary" style="background: #2E7D32; border-color: #2E7D32;" onclick="window.app.openDoctorPatientDossierModal(1, 'diagnosis')">
            📋 Review Primary Medical Dossier
          </button>
        </div>
      </div>

      <div class="metrics-row">
        <div class="metric-card">
          <div class="metric-value">${patients.length}</div>
          <div class="metric-label">Active Clinical Patients</div>
        </div>
        <div class="metric-card">
          <div class="metric-value" style="color: var(--accent-rose);">${highRiskCount}</div>
          <div class="metric-label">High-Priority Cases</div>
        </div>
        <div class="metric-card">
          <div class="metric-value" style="color: var(--accent-emerald);">100%</div>
          <div class="metric-label">Lesion Screenings Verified</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">3 Active</div>
          <div class="metric-label">Prescriptions Authorized</div>
        </div>
      </div>

      <!-- SYNCHRONIZED PATIENT MEDICAL QUEUE -->
      <div class="glass-card section-margin" style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.75rem;">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <div>
            <h3 style="font-family: 'Playfair Display', serif; font-size: 1.3rem; margin: 0 0 0.25rem;">Patient Clinical Diagnoses & Medical Prescriptions</h3>
            <p class="text-muted" style="font-size: 0.85rem; margin: 0;">Real-world synchronized patient medical charts backed by PostgreSQL</p>
          </div>
          <span class="badge badge-success" style="font-size: 0.78rem;">Clinical Database Connected</span>
        </div>

        <div class="table-responsive">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #FAF9F6; text-align: left; font-size: 0.8rem; color: var(--text-muted); border-bottom: 1px solid var(--border-light);">
                <th style="padding: 0.85rem 1rem;">Patient Identity</th>
                <th style="padding: 0.85rem 1rem;">Clinical Condition</th>
                <th style="padding: 0.85rem 1rem;">Optical ML Lesion Status</th>
                <th style="padding: 0.85rem 1rem;">Active Medical Rx</th>
                <th style="padding: 0.85rem 1rem;">Status & Next Review</th>
                <th style="padding: 0.85rem 1rem; text-align: right;">Medical Actions</th>
              </tr>
            </thead>
            <tbody>
              ${patients.map(p => `
                <tr style="border-bottom: 1px solid var(--border-light); transition: var(--transition);">
                  <td style="padding: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.85rem;">
                      <img src="${p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" alt="${p.full_name}" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 2px solid #2E7D32;">
                      <div>
                        <strong style="color: var(--text-primary); font-size: 0.92rem;">${p.full_name}</strong>
                        <div style="font-size: 0.78rem; color: var(--text-muted);">@${p.username} • Patient #${p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style="padding: 1rem;">
                    <span class="badge badge-accent" style="font-weight: 700; font-size: 0.8rem;">${p.condition}</span>
                  </td>
                  <td style="padding: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                      <span class="badge ${p.lesion_screening?.badge?.includes('SAFE') ? 'badge-success' : 'badge-warning'}" style="font-size: 0.74rem;">
                        ${p.lesion_screening?.badge || 'BENIGN (SAFE)'}
                      </span>
                      <small class="text-muted" style="font-size: 0.72rem;">Risk: ${p.lesion_screening?.malignancy_risk_score || 8.0}%</small>
                    </div>
                  </td>
                  <td style="padding: 1rem; font-size: 0.82rem;">
                    <code style="color: var(--gold-primary); font-weight: 700; background: #FAF9F6; padding: 0.25rem 0.5rem; border-radius: 4px; border: 1px solid var(--border-light); display: inline-block;">
                      ${p.prescription}
                    </code>
                  </td>
                  <td style="padding: 1rem;">
                    <div style="display: flex; flex-direction: column; gap: 0.2rem;">
                      <span class="badge ${p.clinical_status.includes('Review') ? 'badge-warning' : 'badge-success'}" style="font-size: 0.74rem;">${p.clinical_status}</span>
                      <small class="text-muted" style="font-size: 0.72rem;">Due: ${p.next_review || '24 Dec 2025'}</small>
                    </div>
                  </td>
                  <td style="padding: 1rem; text-align: right;">
                    <div style="display: inline-flex; gap: 0.45rem;">
                      <button class="btn btn-sm btn-outline" style="font-size: 0.78rem; font-weight: 700; padding: 0.4rem 0.8rem;" onclick="window.app.openDoctorPatientDossierModal(${p.id}, 'diagnosis')">
                        📋 Medical Dossier
                      </button>
                      <button class="btn btn-sm btn-primary" style="background: #2E7D32; border-color: #2E7D32; font-size: 0.78rem; font-weight: 700; padding: 0.4rem 0.8rem;" onclick="window.app.openDoctorPatientDossierModal(${p.id}, 'rx')">
                        💊 Modify Rx
                      </button>
                    </div>
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

export function renderPatientDossierModalContent(dossier, role = 'consultant', activeTab = 'assessment') {
  if (!dossier) {
    return `<div style="padding: 2rem; text-align: center;">Loading clinical dossier...</div>`;
  }

  const p = dossier.patient_info;
  const c = dossier.clinical_record;
  const b = dossier.biomarker_assessment;
  const a = dossier.routine_adherence;
  const prog = dossier.progress_comparison;

  return `
    <div class="clinical-dossier-card" style="max-width: 920px; width: 95vw; background: #FFFFFF; border-radius: var(--radius-md); padding: 2rem; max-height: 90vh; overflow-y: auto;">
      <!-- DOSSIER HEADER -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--border-light); padding-bottom: 1.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
        <div style="display: flex; align-items: center; gap: 1.25rem;">
          <img src="${p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" alt="${p.full_name}" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 3px solid var(--gold-primary);">
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.25rem;">
              <h2 style="font-family: 'Playfair Display', serif; font-size: 1.6rem; margin: 0; color: var(--text-primary);">${p.full_name}</h2>
              <span class="badge badge-accent" style="font-size: 0.75rem;">Patient #${p.id}</span>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">
              @${p.username} • ${p.email} • <strong>Skin Type:</strong> ${p.skin_type}
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 1rem; align-items: center;">
          <div style="text-align: right;">
            <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Overall Skin Score</div>
            <div style="font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 800; color: var(--text-primary); line-height: 1;">
              ${b.overall_health_score} <span style="font-size: 0.85rem; color: var(--accent-emerald); font-weight: 700;">(+${b.score_delta} pts)</span>
            </div>
          </div>
          <button class="modal-close" onclick="window.app.closeModal('clinical-dossier-modal')" style="font-size: 1.5rem; background: transparent; border: none; cursor: pointer; color: var(--text-muted);">×</button>
        </div>
      </div>

      <!-- DOSSIER NAVIGATION TABS -->
      <div style="display: flex; gap: 0.5rem; border-bottom: 2px solid var(--border-light); margin-bottom: 1.5rem;">
        <button class="progress-tab-btn ${activeTab === 'assessment' ? 'active' : ''}" style="padding: 0.6rem 1.25rem; font-weight: 700; border: none; background: transparent; cursor: pointer; border-bottom: 3px solid ${activeTab === 'assessment' ? 'var(--gold-primary)' : 'transparent'};" onclick="window.app.switchDossierTab('assessment')">
          🔬 1. Biomarkers & Assessment
        </button>
        <button class="progress-tab-btn ${activeTab === 'progress' ? 'active' : ''}" style="padding: 0.6rem 1.25rem; font-weight: 700; border: none; background: transparent; cursor: pointer; border-bottom: 3px solid ${activeTab === 'progress' ? 'var(--gold-primary)' : 'transparent'};" onclick="window.app.switchDossierTab('progress')">
          📈 2. Progress & Adherence
        </button>
        <button class="progress-tab-btn ${activeTab === 'treatment' || activeTab === 'regimen' || activeTab === 'rx' ? 'active' : ''}" style="padding: 0.6rem 1.25rem; font-weight: 700; border: none; background: transparent; cursor: pointer; border-bottom: 3px solid ${activeTab === 'treatment' || activeTab === 'regimen' || activeTab === 'rx' ? 'var(--gold-primary)' : 'transparent'};" onclick="window.app.switchDossierTab('treatment')">
          ${role === 'dermatologist' ? '💊 3. Medical Prescription & Rx Sign-Off' : '📝 3. Regimen Builder & Consultant Notes'}
        </button>
      </div>

      <!-- TAB 1: BIOMARKERS & ASSESSMENT -->
      <div id="dossier-tab-assessment" class="${activeTab === 'assessment' ? '' : 'hidden'}">
        <h4 style="font-family: 'Playfair Display', serif; font-size: 1.15rem; margin-bottom: 1rem; color: var(--text-primary);">Cutaneous Biomarker Profile</h4>
        
        ${b?.restricted ? `
          <div style="background: #FFFBEB; border: 1px dashed #D97706; border-radius: var(--radius-sm); padding: 1.75rem; text-align: center; margin-bottom: 1.5rem;">
            <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🔒</div>
            <h4 style="color: #B45309; margin: 0 0 0.4rem; font-family: 'Playfair Display', serif;">Biomarker Data Access Restricted</h4>
            <p style="font-size: 0.85rem; color: #78350F; margin: 0; max-width: 540px; margin: 0 auto;">
              ${b.reason || 'The patient has customized their data sharing consent and restricted 8-Biomarker numerical records from this clinical role.'}
            </p>
          </div>
        ` : `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
            <div style="background: #FAF9F6; padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
              <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">💧 HYDRATION</div>
              <div style="font-size: 1.4rem; font-weight: 800; color: #0284C7;">${b.biomarkers?.hydration_level || 74}%</div>
              <div style="font-size: 0.72rem; color: var(--accent-emerald);">+26% since baseline</div>
            </div>
            <div style="background: #FAF9F6; padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
              <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">🛡️ BARRIER RESILIENCE</div>
              <div style="font-size: 1.4rem; font-weight: 800; color: var(--gold-primary);">${b.biomarkers?.barrier_strength || 86}%</div>
              <div style="font-size: 0.72rem; color: var(--accent-emerald);">Lipid matrix consolidated</div>
            </div>
            <div style="background: #FAF9F6; padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
              <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">🌿 ACNE SEVERITY</div>
              <div style="font-size: 1.4rem; font-weight: 800; color: #2E7D32;">${b.biomarkers?.acne_severity || 12} / 100</div>
              <div style="font-size: 0.72rem; color: var(--accent-emerald);">-71.4% papule clearance</div>
            </div>
            <div style="background: #FAF9F6; padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
              <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">🌸 ERYTHEMA / REDNESS</div>
              <div style="font-size: 1.4rem; font-weight: 800; color: #8E24AA;">${b.biomarkers?.redness_reactivity || 15} / 100</div>
              <div style="font-size: 0.72rem; color: var(--accent-emerald);">-58.3% vascular cooling</div>
            </div>
          </div>

          ${b.lesion_screening?.restricted ? `
            <div style="background: #FFFBEB; border: 1px dashed #D97706; border-radius: var(--radius-sm); padding: 1.25rem; margin-bottom: 1.5rem; text-align: center;">
              <span style="font-size: 1.2rem;">🔒</span>
              <strong style="color: #B45309; font-size: 0.85rem; margin-left: 0.5rem;">Optical Lesion Screening Access Restricted by Patient</strong>
            </div>
          ` : `
            <div style="background: #FAF4E5; border: 1px solid var(--gold-primary); border-radius: var(--radius-sm); padding: 1.25rem; margin-bottom: 1.5rem;">
              <h5 style="margin: 0 0 0.4rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                🔬 Optical Lesion ML Computer Vision Classification:
                <span class="badge ${b.lesion_screening?.badge?.includes('SAFE') ? 'badge-success' : 'badge-warning'}">${b.lesion_screening?.badge || 'BENIGN (SAFE)'}</span>
              </h5>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">
                ${b.lesion_screening?.classification || 'Normal benign skin architecture'}. Malignancy Risk Score: <strong>${b.lesion_screening?.malignancy_risk_score || 8.2}%</strong> (Safe threshold &lt; 25.0%). Verified by CNN binary classifier.
              </p>
            </div>
          `}
        `}
      </div>

      <!-- TAB 2: PROGRESS & ADHERENCE -->
      <div id="dossier-tab-progress" class="${activeTab === 'progress' ? '' : 'hidden'}">
        <h4 style="font-family: 'Playfair Display', serif; font-size: 1.15rem; margin-bottom: 1rem; color: var(--text-primary);">30-Day Longitudinal Progress & Habit Compliance</h4>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
          <div style="background: #FAF9F6; padding: 1.25rem; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
            <h5 style="margin: 0 0 0.5rem;">Routine Adherence Stats</h5>
            ${a?.restricted ? `
              <div style="padding: 1rem; background: #FFFBEB; border: 1px dashed #D97706; border-radius: var(--radius-sm); text-align: center;">
                <div style="font-size: 1.4rem;">🔒</div>
                <div style="font-size: 0.82rem; color: #78350F; font-weight: 700; margin-top: 0.25rem;">Adherence Tracking Confidential</div>
              </div>
            ` : `
              <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem;">
                <div style="font-size: 2rem;">🔥</div>
                <div>
                  <div style="font-weight: 800; font-size: 1.2rem; color: var(--text-primary);">${a.current_streak_days} Days Active Streak</div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">Monthly Compliance: <strong>${a.monthly_compliance_pct}%</strong></div>
                </div>
              </div>
              <div style="font-size: 0.82rem; color: var(--text-secondary);">
                • AM Routine: ${a.morning_adherence_avg}% | PM Routine: ${a.evening_adherence_avg}%<br>
                • ${a.adherence_correlation}
              </div>
            `}
          </div>

          <div style="background: #FAF9F6; padding: 1.25rem; border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
            <h5 style="margin: 0 0 0.5rem;">Optical Progress & Improvements (30 Days)</h5>
            ${prog?.restricted ? `
              <div style="padding: 1rem; background: #FFFBEB; border: 1px dashed #D97706; border-radius: var(--radius-sm); text-align: center;">
                <div style="font-size: 1.4rem;">🔒</div>
                <div style="font-size: 0.82rem; color: #78350F; font-weight: 700; margin-top: 0.25rem;">Facial Photos Restricted by Patient</div>
              </div>
            ` : `
              <ul style="padding-left: 1.2rem; font-size: 0.84rem; color: var(--text-secondary); margin: 0;">
                ${(prog.top_improvements || []).map(imp => `<li style="margin-bottom: 0.35rem;"><strong>${imp}</strong></li>`).join('')}
              </ul>
            `}
          </div>
        </div>
      </div>

      <!-- TAB 3: REGIMEN BUILDER / MEDICAL RX -->
      <div id="dossier-tab-treatment" class="${activeTab === 'treatment' || activeTab === 'regimen' || activeTab === 'rx' ? '' : 'hidden'}">
        ${role === 'dermatologist' ? `
          <h4 style="font-family: 'Playfair Display', serif; font-size: 1.15rem; margin-bottom: 1rem; color: #2E7D32;">🩺 Medical Diagnosis & Board-Certified Prescription (Rx)</h4>
          <form onsubmit="window.app.saveDoctorPrescription(event, ${p.id})" style="display: flex; flex-direction: column; gap: 1rem;">
            <div class="form-group">
              <label style="font-size: 0.82rem; font-weight: 700;">Diagnosed Clinical Condition</label>
              <input type="text" id="dossier-edit-condition" class="form-control" value="${c.diagnosed_condition || 'Mild Comedonal Acne & PIH'}" required>
            </div>
            <div class="form-group">
              <label style="font-size: 0.82rem; font-weight: 700;">Active Medical Prescription (Rx Medication & Dosage)</label>
              <input type="text" id="dossier-edit-prescription" class="form-control" value="${c.active_prescription || 'Topical Adapalene 0.1% (PM 3x/wk) + Azelaic Acid 15% (AM)'}" required>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label style="font-size: 0.82rem; font-weight: 700;">Clinical Status</label>
                <select id="dossier-edit-status" class="form-control">
                  <option value="Under Active Regimen" ${c.status === 'Under Active Regimen' ? 'selected' : ''}>Under Active Regimen</option>
                  <option value="Needs Clinical Review" ${c.status === 'Needs Clinical Review' ? 'selected' : ''}>Needs Clinical Review</option>
                  <option value="Active Medical Treatment" ${c.status === 'Active Medical Treatment' ? 'selected' : ''}>Active Medical Treatment</option>
                  <option value="Maintenance / Stable" ${c.status === 'Maintenance / Stable' ? 'selected' : ''}>Maintenance / Stable</option>
                </select>
              </div>
              <div class="form-group">
                <label style="font-size: 0.82rem; font-weight: 700;">Next Clinical Review Date</label>
                <input type="text" id="dossier-edit-review" class="form-control" value="${c.next_review || '24 Dec 2025'}">
              </div>
            </div>
            <div class="form-group">
              <label style="font-size: 0.82rem; font-weight: 700;">Dermatologist Clinical Notes & Patient Instructions</label>
              <textarea id="dossier-edit-notes" class="form-control" rows="3" required>${c.clinical_notes || 'Follicular retention hyperkeratosis clearing satisfactorily.'}</textarea>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem;">
              <button type="button" class="btn btn-outline" onclick="window.app.closeModal('clinical-dossier-modal')">Cancel</button>
              <button type="submit" class="btn btn-primary" style="background: #2E7D32; border-color: #2E7D32; font-weight: 700;">
                💾 Certify & Save Medical Prescription
              </button>
            </div>
          </form>
        ` : `
          <h4 style="font-family: 'Playfair Display', serif; font-size: 1.15rem; margin-bottom: 1rem; color: var(--gold-primary);">📝 Esthetician Regimen Builder & Consultation Notes</h4>
          <form onsubmit="window.app.saveConsultantRegimenNotes(event, ${p.id})" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label style="font-size: 0.82rem; font-weight: 700;">Case Status</label>
                <select id="consultant-edit-status" class="form-control">
                  <option value="Under Active Regimen" ${c.status === 'Under Active Regimen' ? 'selected' : ''}>Under Active Regimen</option>
                  <option value="Needs Clinical Review" ${c.status === 'Needs Clinical Review' ? 'selected' : ''}>Needs Clinical Review</option>
                  <option value="Regimen Adjusted" ${c.status === 'Regimen Adjusted' ? 'selected' : ''}>Regimen Adjusted</option>
                </select>
              </div>
              <div class="form-group">
                <label style="font-size: 0.82rem; font-weight: 700;">Priority Level</label>
                <select id="consultant-edit-priority" class="form-control">
                  <option value="Standard" ${c.priority === 'Standard' ? 'selected' : ''}>Standard Priority</option>
                  <option value="High" ${c.priority === 'High' ? 'selected' : ''}>High Priority (Urgent)</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label style="font-size: 0.82rem; font-weight: 700;">Consultant Regimen Recommendation & Guidance Notes</label>
              <textarea id="consultant-edit-notes" class="form-control" rows="4" required>${c.consultant_notes || 'Patient demonstrated +54.2% hydration boost. Barrier restored after introducing ceramide night barrier seal.'}</textarea>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem;">
              <button type="button" class="btn btn-outline" onclick="window.app.closeModal('clinical-dossier-modal')">Cancel</button>
              <button type="submit" class="btn btn-primary" style="font-weight: 700;">
                💾 Save & Synchronize Regimen with Client
              </button>
            </div>
          </form>
        `}
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
                        <button class="btn btn-primary btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; background: #22c55e;" onclick="window.app.handleAdminApproveUser('${u.id}', '${encodeURIComponent(u.username || u.email || '')}')">
                          ✅ Approve User
                        </button>
                      ` : ''}
                      <button class="btn btn-outline btn-sm" style="color: var(--accent-rose); border-color: rgba(244, 63, 94, 0.3); padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="window.app.handleAdminDeleteUser('${u.id}', '${encodeURIComponent(u.username || u.email || '')}')">
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
  const user = auth.getCurrentUser();
  const isDemo = (!user || user.id === 1 || user.username === 'user');
  const avatarUrl = user?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || 'default'}`;
  const displayName = user?.full_name || (isDemo ? 'Aarav Sharma' : (user?.username || 'User'));
  const displayEmail = user?.email || `${(user?.username || 'alex').toLowerCase()}@panacea.ai`;
  const roleTitle = auth.getCurrentRoleInfo()?.title || 'Skincare Consumer';
  const skinType = user?.skin_type || user?.profile?.skinType || (isDemo ? MOCK_USER_DATA.profile.skinType : '');
  const ageGroup = user?.profile?.ageGroup || (isDemo ? MOCK_USER_DATA.profile.ageGroup : '');
  const primaryConcerns = user?.primary_concerns || user?.profile?.primaryConcerns || (isDemo ? MOCK_USER_DATA.profile.primaryConcerns : []);
  const allergies = user?.allergies || user?.profile?.allergies || (isDemo ? MOCK_USER_DATA.profile.allergies : []);

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

            <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem;">
              <button type="button" class="btn btn-outline btn-sm" onclick="window.app.randomizePageAvatar()" style="width: 100%; font-size: 0.82rem; padding: 0.55rem;">
                Generate New Avatar Seed
              </button>
              <button type="button" class="btn btn-sm" onclick="window.app.handleUserLogout()" style="width: 100%; font-size: 0.82rem; padding: 0.55rem; background: #FEF2F2; color: #DC2626; border: 1px solid #FCA5A5; font-weight: 600;">
                🚪 Log Out of Account
              </button>
            </div>
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
                    <option value="Combination / Sensitive" ${skinType.includes('Combination') ? 'selected' : ''}>Combination / Sensitive</option>
                    <option value="Dry / Dehydrated" ${skinType.includes('Dry') ? 'selected' : ''}>Dry / Dehydrated</option>
                    <option value="Oily / Acne-Prone" ${skinType.includes('Oily') ? 'selected' : ''}>Oily / Acne-Prone</option>
                    <option value="Normal / Balanced" ${skinType.includes('Normal') ? 'selected' : ''}>Normal / Balanced</option>
                    <option value="Sensitive / Rosacea-Prone" ${skinType.includes('Rosacea') ? 'selected' : ''}>Sensitive / Rosacea-Prone</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="page-settings-agegroup" style="font-weight: 600; font-size: 0.85rem;">Age Demographic</label>
                  <select id="page-settings-agegroup" class="form-control">
                    <option value="18 - 24" ${ageGroup === '18 - 24' ? 'selected' : ''}>18 - 24 years</option>
                    <option value="25 - 34" ${ageGroup === '25 - 34' ? 'selected' : ''}>25 - 34 years</option>
                    <option value="35 - 44" ${ageGroup === '35 - 44' ? 'selected' : ''}>35 - 44 years</option>
                    <option value="45 - 54" ${ageGroup === '45 - 54' ? 'selected' : ''}>45 - 54 years</option>
                    <option value="55+" ${ageGroup === '55+' ? 'selected' : ''}>55+ years</option>
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
                <input type="text" id="page-settings-goals" class="form-control" value="${primaryConcerns.join(', ')}" placeholder="e.g. Barrier Repair, Acne & Breakouts">
              </div>

              <div class="form-group">
                <label for="page-settings-allergies" style="font-weight: 600; font-size: 0.85rem;">Known Allergies & Sensitivity Triggers</label>
                <input type="text" id="page-settings-allergies" class="form-control" value="${allergies.join(', ')}" placeholder="e.g. Fragrance (Parfum), Essential Oils">
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
            <div style="display: flex; gap: 1rem; align-items: center; justify-content: space-between; padding-top: 1rem; border-top: 1px solid var(--border-light); flex-wrap: wrap;">
              <div style="display: flex; gap: 0.75rem; align-items: center;">
                <button type="submit" class="btn btn-primary" style="padding: 0.75rem 2rem;">Save Profile Changes</button>
                <button type="button" class="btn btn-outline" onclick="window.app.navigateToView('dashboard')" style="padding: 0.75rem 1.5rem;">Cancel</button>
              </div>
              <button type="button" class="btn btn-outline" onclick="window.app.handleUserLogout()" style="padding: 0.75rem 1.25rem; color: #DC2626; border-color: #FCA5A5; background: #FEF2F2; font-size: 0.85rem; font-weight: 600;">
                🚪 Sign Out
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  `;
}

// ════════════════════════════════════════════════════════════════
// DEDICATED SKINCARE PRODUCTS EXPLORER & INTELLIGENCE MARKETPLACE
// ════════════════════════════════════════════════════════════════

export function renderProductsExplorerPage(options = {}, profile = null) {
  const user = auth.getCurrentUser();
  const isDemo = (!user || user.id === 1 || user.username === 'user');
  const activeProfile = profile || user?.profile || {
    name: user?.full_name || user?.username || (isDemo ? MOCK_USER_DATA.profile.name : 'User'),
    skinType: user?.skin_type || user?.profile?.skinType || (isDemo ? MOCK_USER_DATA.profile.skinType : 'Combination'),
    ageGroup: user?.profile?.ageGroup || (isDemo ? MOCK_USER_DATA.profile.ageGroup : '25 - 34'),
    primaryConcerns: user?.primary_concerns || user?.profile?.primaryConcerns || (isDemo ? MOCK_USER_DATA.profile.primaryConcerns : []),
    allergies: user?.allergies || user?.profile?.allergies || (isDemo ? MOCK_USER_DATA.profile.allergies : [])
  };

  const currentOptions = {
    query: options.query || '',
    category: options.category || 'All',
    budget_tier: options.budget_tier || 'All',
    min_price: options.min_price || 0,
    max_price: options.max_price || 5000,
    skin_type: options.skin_type || activeProfile.skinType || 'Combination',
    target_concern: options.target_concern || 'All',
    brand: options.brand || 'All',
    min_score: options.min_score || 0,
    sort_by: options.sort_by || 'match_desc'
  };

  const currentProfile = {
    ...activeProfile,
    skinType: currentOptions.skin_type || activeProfile.skinType
  };

  const filteredProducts = filterProductCatalog(currentOptions, currentProfile);
  const selectedCompareIds = (typeof window !== 'undefined' && window.app) ? (window.app.selectedCompareProductIds || []) : [];

  const categoriesList = [
    'All',
    'Face Wash',
    'Serum',
    'Moisturizer',
    'Sunscreen',
    'Toner & Essence',
    'Exfoliant & Treatment',
    'Face Mask',
    'Eye & Lip Care'
  ];

  const brandsList = [
    'All',
    'Minimalist',
    'CeraVe',
    'The Derma Co',
    'Aqualogica',
    'Plum',
    'Dot & Key',
    'Cosrx',
    "Paula's Choice",
    'Cetaphil',
    "Dr. Sheth's",
    'Sebamed',
    'Neutrogena',
    'Bioderma',
    'Beauty of Joseon',
    'The Ordinary',
    'Laneige'
  ];

  const concernsList = [
    'All',
    'Acne & Breakouts',
    'Post-Inflammatory Hyperpigmentation',
    'Redness',
    'Barrier Impairment',
    'Dryness',
    'Fine Lines',
    'Dullness',
    'Sun Damage',
    'Large Pores'
  ];

  const skinTypesList = [
    'Combination',
    'Oily',
    'Sensitive',
    'Dry',
    'Normal',
    'Acne-Prone'
  ];

  return `
    <div class="products-explorer-container">
      
      <!-- HERO BANNER -->
      <div class="products-hero-banner">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
          <div style="max-width: 750px;">
            <div style="display: inline-flex; align-items: center; gap: 0.4rem; background: rgba(197, 155, 39, 0.25); border: 1px solid var(--gold-primary); color: #FFDF70; padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem;">
              🛍️ AI Skincare Intelligence Marketplace
            </div>
            <h1 style="font-family: 'Playfair Display', serif; font-size: 2.2rem; font-weight: 700; line-height: 1.2; margin-bottom: 0.65rem;">
              Personalized Product Recommendations
            </h1>
            <p style="font-size: 0.95rem; color: #E2E8F0; line-height: 1.6; margin: 0;">
              Every formulation is evaluated in real-time against your skin type, active concerns, and allergens.
              Compare formulations side-by-side, find affordable budget dupes, and buy directly from verified e-commerce stores with live prices.
            </p>
          </div>

          <div style="background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: var(--radius-sm); padding: 1rem 1.25rem; text-align: right; min-width: 220px;">
            <small style="color: #CBD5E1; font-size: 0.75rem; text-transform: uppercase; font-weight: 700;">Active Skin Profile</small>
            <div style="font-family: 'Playfair Display', serif; font-size: 1.25rem; font-weight: 700; color: #FFDF70; margin: 0.2rem 0;">
              ${currentProfile.skinType} Skin
            </div>
            <div style="font-size: 0.78rem; color: #94A3B8;">
              Score: <strong style="color: #FFFFFF;">${user?.skin_score || (isDemo ? `${MOCK_USER_DATA.skinScore.overall}/100` : 'Pending')}</strong> • ${currentProfile.primaryConcerns?.length || 0} Concerns
            </div>
          </div>
        </div>

        <!-- SKIN PROFILE SIMULATOR / SWITCHER -->
        <div class="skin-profile-pill-bar">
          <span style="font-size: 0.8rem; font-weight: 700; color: #FFDF70;">🔬 Profile Simulator:</span>
          ${skinTypesList.map(st => `
            <button class="skin-profile-pill ${currentOptions.skin_type === st ? 'active' : ''}" onclick="window.app.updateProductFilter('skin_type', '${st}')" style="cursor: pointer; border: none;">
              ${st === currentOptions.skin_type ? '✓ ' : ''}${st}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- MAIN EXPLORER LAYOUT -->
      <div class="products-explorer-layout">
        
        <!-- LEFT FILTER SIDEBAR -->
        <aside class="products-filter-sidebar">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-light);">
            <h3 style="font-family: 'Playfair Display', serif; font-size: 1.15rem; margin: 0;">Filters</h3>
            <button class="btn btn-sm btn-outline" style="font-size: 0.72rem; padding: 0.25rem 0.6rem;" onclick="window.app.resetProductFilters()">
              Clear All
            </button>
          </div>

          <!-- BUDGET & PRICE FILTER -->
          <div class="filter-group">
            <div class="filter-section-title">
              <span>Budget Range</span>
              <small style="color: var(--gold-primary); font-size: 0.8rem; font-weight: 700;">Up to ₹${currentOptions.max_price}</small>
            </div>

            <!-- Quick Budget Tier Chips -->
            <div class="budget-chips-grid" style="margin-bottom: 0.85rem;">
              <button class="budget-chip-btn ${currentOptions.budget_tier === 'All' ? 'active' : ''}" onclick="window.app.updateProductFilter('budget_tier', 'All')">
                All Budgets
              </button>
              <button class="budget-chip-btn ${currentOptions.budget_tier === 'Budget' ? 'active' : ''}" onclick="window.app.updateProductFilter('budget_tier', 'Budget')">
                Under ₹600
              </button>
              <button class="budget-chip-btn ${currentOptions.budget_tier === 'Mid-Range' ? 'active' : ''}" onclick="window.app.updateProductFilter('budget_tier', 'Mid-Range')">
                ₹600 - ₹1,500
              </button>
              <button class="budget-chip-btn ${currentOptions.budget_tier === 'Premium' ? 'active' : ''}" onclick="window.app.updateProductFilter('budget_tier', 'Premium')">
                ₹1,500 - ₹3,000
              </button>
            </div>

            <!-- Dual Interactive Price Slider -->
            <div class="range-slider-wrapper">
              <label for="price-range-slider" style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.35rem;">
                <span>₹200</span>
                <span style="font-weight: 700; color: var(--text-primary);">Max: ₹<span id="price-slider-display">${currentOptions.max_price}</span></span>
                <span>₹5,000</span>
              </label>
              <input type="range" id="price-range-slider" class="range-slider-input" min="300" max="5000" step="50" value="${currentOptions.max_price}" oninput="window.app.handlePriceSliderInput(this.value)" onchange="window.app.updateProductFilter('max_price', Number(this.value))">
            </div>
          </div>

          <!-- CATEGORY FILTER -->
          <div class="filter-group">
            <div class="filter-section-title">
              <span>Category</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.35rem; max-height: 200px; overflow-y: auto;">
              ${categoriesList.map(cat => `
                <label class="filter-checkbox-item">
                  <input type="radio" name="product_cat_radio" value="${cat}" ${currentOptions.category === cat ? 'checked' : ''} onchange="window.app.updateProductFilter('category', '${cat}')" style="accent-color: var(--gold-primary);">
                  <span>${cat}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <!-- TARGET SKIN CONCERN -->
          <div class="filter-group">
            <div class="filter-section-title">
              <span>Target Concern</span>
            </div>
            <select class="form-control" style="font-size: 0.8rem; padding: 0.45rem;" onchange="window.app.updateProductFilter('target_concern', this.value)">
              ${concernsList.map(cn => `
                <option value="${cn}" ${currentOptions.target_concern === cn ? 'selected' : ''}>${cn}</option>
              `).join('')}
            </select>
          </div>

          <!-- MINIMUM SUITABILITY SCORE -->
          <div class="filter-group">
            <div class="filter-section-title">
              <span>Compatibility Score</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.35rem;">
              <label class="filter-checkbox-item">
                <input type="radio" name="min_score_radio" value="0" ${currentOptions.min_score === 0 ? 'checked' : ''} onchange="window.app.updateProductFilter('min_score', 0)" style="accent-color: var(--gold-primary);">
                <span>All Compatibility Levels</span>
              </label>
              <label class="filter-checkbox-item">
                <input type="radio" name="min_score_radio" value="90" ${currentOptions.min_score === 90 ? 'checked' : ''} onchange="window.app.updateProductFilter('min_score', 90)" style="accent-color: var(--gold-primary);">
                <span>90%+ High Compatibility</span>
              </label>
              <label class="filter-checkbox-item">
                <input type="radio" name="min_score_radio" value="80" ${currentOptions.min_score === 80 ? 'checked' : ''} onchange="window.app.updateProductFilter('min_score', 80)" style="accent-color: var(--gold-primary);">
                <span>80%+ Good Compatibility</span>
              </label>
            </div>
          </div>

          <!-- BRAND FILTER -->
          <div class="filter-group">
            <div class="filter-section-title">
              <span>Brand</span>
            </div>
            <select class="form-control" style="font-size: 0.8rem; padding: 0.45rem;" onchange="window.app.updateProductFilter('brand', this.value)">
              ${brandsList.map(b => `
                <option value="${b}" ${currentOptions.brand === b ? 'selected' : ''}>${b}</option>
              `).join('')}
            </select>
          </div>

        </aside>

        <!-- RIGHT PRODUCTS MAIN AREA -->
        <main class="products-main-content">
          
          <!-- CONTROL BAR -->
          <div class="products-control-bar">
            
            <!-- Search Input -->
            <div class="products-search-box">
              <span class="products-search-icon">🔍</span>
              <input type="text" id="products-search-input" placeholder="Search by name, brand, active ingredients (e.g. Niacinamide, CeraVe, Salicylic)..." value="${currentOptions.query}" oninput="window.app.handleProductSearchInput(this.value)">
            </div>

            <!-- Sort By Dropdown -->
            <div class="sort-select-wrapper">
              <label for="products-sort-select" style="font-weight: 600;">Sort By:</label>
              <select id="products-sort-select" onchange="window.app.updateProductFilter('sort_by', this.value)">
                <option value="match_desc" ${currentOptions.sort_by === 'match_desc' ? 'selected' : ''}>Highest AI Match Score</option>
                <option value="price_asc" ${currentOptions.sort_by === 'price_asc' ? 'selected' : ''}>Price: Low to High</option>
                <option value="price_desc" ${currentOptions.sort_by === 'price_desc' ? 'selected' : ''}>Price: High to Low</option>
                <option value="rating_desc" ${currentOptions.sort_by === 'rating_desc' ? 'selected' : ''}>Highest Customer Rating</option>
                <option value="popular_desc" ${currentOptions.sort_by === 'popular_desc' ? 'selected' : ''}>Most Popular</option>
              </select>
            </div>

            <!-- Count Stats -->
            <div style="font-size: 0.82rem; font-weight: 700; color: var(--gold-primary);">
              Showing ${filteredProducts.length} Verified Formulations
            </div>
          </div>

          <!-- PRODUCTS GRID -->
          ${filteredProducts.length === 0 ? `
            <div style="background: #FFFFFF; border: 1px dashed var(--border-gold); border-radius: var(--radius-md); padding: 4rem 2rem; text-align: center;">
              <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
              <h3 style="font-family: 'Playfair Display', serif; font-size: 1.35rem; margin-bottom: 0.5rem;">No products match your active filters</h3>
              <p class="text-muted" style="font-size: 0.9rem; max-width: 450px; margin: 0 auto 1.5rem;">Try relaxing your budget range, resetting category selections, or clearing your search term.</p>
              <button class="btn btn-primary" onclick="window.app.resetProductFilters()">Reset All Filters</button>
            </div>
          ` : `
            <div class="products-catalog-grid">
              ${filteredProducts.map(p => {
                const isSelectedForCompare = selectedCompareIds.includes(p.id);
                const isHighMatch = p.suitability.score >= 90;
                return `
                  <div class="product-card-enhanced" id="product-card-${p.id}">
                    <div>
                      <!-- Image Container -->
                      <div class="product-image-container">
                        <img src="${p.image_url}" alt="${p.name}" loading="lazy">
                        <span class="product-category-chip">${p.category}</span>
                        <div class="product-score-badge-floating ${isHighMatch ? 'high-match' : ''}" onclick="window.app.openScoreBreakdownModal('${p.id}')" title="Click for score breakdown">
                          <span>${isHighMatch ? '🌟' : '✨'}</span>
                          <span>${p.suitability.scoreFormatted} Match</span>
                        </div>
                      </div>

                      <!-- Body Content -->
                      <div class="product-body-content">
                        <div class="product-brand-name">${p.brand}</div>
                        <h4 class="product-title" title="${p.name}">${p.name}</h4>

                        <!-- Price Row -->
                        <div class="product-price-row">
                          <span class="product-price-current">₹${p.price}</span>
                          ${p.mrp ? `<span class="product-price-mrp">₹${p.mrp}</span>` : ''}
                          ${p.discount ? `<span class="product-discount-pill">${p.discount}</span>` : ''}
                        </div>

                        <!-- Rating Line -->
                        <div class="product-rating-line">
                          <span class="product-rating-star">★ ${p.rating}</span>
                          <span>(${p.reviews_count.toLocaleString()} verified reviews)</span>
                        </div>

                        <!-- Active Ingredients -->
                        <div class="product-actives-tags">
                          ${(p.key_active_ingredients || []).slice(0, 3).map(act => `
                            <span class="product-active-tag">${act}</span>
                          `).join('')}
                        </div>

                        <p style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 0;">
                          💡 ${p.suitability.reason}
                        </p>
                      </div>
                    </div>

                    <!-- Footer & Actions -->
                    <div class="product-footer-actions">
                      <!-- E-Commerce Live Purchase Links -->
                      <div class="ecommerce-buttons-row">
                        <a href="${p.e_commerce_links?.amazon || `https://www.amazon.in/s?k=${encodeURIComponent(p.name)}`}" target="_blank" rel="noopener noreferrer" class="store-btn store-btn-amazon" title="View on Amazon India">
                          Amazon ↗
                        </a>
                        <a href="${p.e_commerce_links?.nykaa || `https://www.nykaa.com/search/result/?q=${encodeURIComponent(p.name)}`}" target="_blank" rel="noopener noreferrer" class="store-btn store-btn-nykaa" title="View on Nykaa">
                          Nykaa ↗
                        </a>
                        <a href="${p.e_commerce_links?.flipkart || `https://www.flipkart.com/search?q=${encodeURIComponent(p.name)}`}" target="_blank" rel="noopener noreferrer" class="store-btn store-btn-flipkart" title="View on Flipkart">
                          Flipkart ↗
                        </a>
                      </div>

                      <!-- Routine & Utilities Row -->
                      <div style="display: flex; gap: 0.4rem;">
                        <button class="btn btn-sm btn-primary" style="flex: 1; font-size: 0.75rem; font-weight: 700;" onclick="window.app.addProductToRoutine('${p.name}', '${p.category}')">
                          + Add to Routine
                        </button>
                        <button class="btn-compare-toggle ${isSelectedForCompare ? 'selected' : ''}" onclick="window.app.toggleCompareProduct(${p.id})" title="${isSelectedForCompare ? 'Remove from Compare' : 'Add to Compare'}">
                          ${isSelectedForCompare ? '✓ In Compare' : '⚖️ Compare'}
                        </button>
                        <button class="btn-alt-suggestions" onclick="window.app.viewSaferAlternatives(${p.id})" title="Find Dupes & Safer Alternatives">
                          🛡️ Dupes
                        </button>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}

        </main>
      </div>

    </div>
  `;
}

// ════════════════════════════════════════════════════════════════
// MODAL RENDERERS: Compare Matrix, Alternatives, Score Breakdown
// ════════════════════════════════════════════════════════════════

export function renderComparisonMatrix(comparisonData) {
  if (!comparisonData || !comparisonData.success || !comparisonData.matrix || comparisonData.matrix.length === 0) {
    return `<div style="padding: 2rem; text-align: center; color: var(--text-muted);">Please select at least 2 products to compare.</div>`;
  }

  const { matrix, winner } = comparisonData;

  return `
    <div>
      ${winner ? `
        <div class="compare-winner-banner" style="background: linear-gradient(135deg, #FFFDF9 0%, #FAF5EB 100%); border: 1px solid var(--border-gold); border-radius: var(--radius-sm); padding: 1.1rem 1.4rem; display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
          <div style="font-size: 1.8rem;">🎯</div>
          <div>
            <strong style="font-size: 0.95rem; color: #8A6400; font-family: 'Playfair Display', serif; font-weight: 700;">Top Clinical Formulation Match</strong>
            <p style="font-size: 0.85rem; color: var(--text-primary); margin: 0.2rem 0 0; line-height: 1.4;">${winner.reason}</p>
          </div>
        </div>
      ` : ''}

      <div class="compare-table-wrapper">
        <table class="compare-matrix-table">
          <thead>
            <tr>
              <th>Feature / Specification</th>
              ${matrix.map(m => `
                <th class="compare-product-col-header" style="min-width: 220px;">
                  <img src="${m.product.image_url}" alt="${m.product.name}" class="compare-product-img">
                  <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--gold-primary);">${m.product.brand}</div>
                  <h5 style="font-family: 'Playfair Display', serif; font-size: 0.95rem; margin: 0.25rem 0 0.4rem; line-height: 1.3;">${m.product.name}</h5>
                  <div style="font-size: 1.15rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem;">${m.priceFormatted} <small style="font-size: 0.75rem; color: var(--text-muted); text-decoration: line-through;">${m.mrpFormatted}</small></div>
                  
                  <div style="display: flex; flex-direction: column; gap: 0.35rem; margin-top: 0.5rem;">
                    <a href="${m.product.e_commerce_links?.amazon || '#'}" target="_blank" rel="noopener noreferrer" class="store-btn store-btn-amazon">Buy on Amazon ↗</a>
                    <a href="${m.product.e_commerce_links?.nykaa || '#'}" target="_blank" rel="noopener noreferrer" class="store-btn store-btn-nykaa">Buy on Nykaa ↗</a>
                    <button class="btn btn-sm btn-primary" style="font-size: 0.72rem; padding: 0.35rem;" onclick="window.app.addProductToRoutine('${m.product.name}', '${m.product.category}')">+ Add to Routine</button>
                  </div>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>AI Match Compatibility</td>
              ${matrix.map(m => `
                <td>
                  <span class="badge ${m.suitability.badgeClass}" style="font-size: 0.8rem; font-weight: 800;">${m.suitability.scoreFormatted}</span>
                  <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">${m.suitability.badge}</div>
                </td>
              `).join('')}
            </tr>
            <tr>
              <td>Key Active Ingredients</td>
              ${matrix.map(m => `
                <td style="font-weight: 600; color: var(--text-primary); font-size: 0.82rem;">${m.keyActives}</td>
              `).join('')}
            </tr>
            <tr>
              <td>Target Skin Concerns</td>
              ${matrix.map(m => `
                <td style="font-size: 0.8rem; color: var(--text-muted);">${m.concerns}</td>
              `).join('')}
            </tr>
            <tr>
              <td>Suitable Skin Types</td>
              ${matrix.map(m => `
                <td style="font-size: 0.8rem;">${m.skinTypes}</td>
              `).join('')}
            </tr>
            <tr>
              <td>Texture & Finish</td>
              ${matrix.map(m => `
                <td style="font-size: 0.8rem;">${m.texture}</td>
              `).join('')}
            </tr>
            <tr>
              <td>Comedogenic Safety</td>
              ${matrix.map(m => `
                <td style="font-size: 0.8rem; color: var(--accent-emerald); font-weight: 600;">${m.comedogenic}</td>
              `).join('')}
            </tr>
            <tr>
              <td>Fragrance & Allergen Status</td>
              ${matrix.map(m => `
                <td style="font-size: 0.8rem;">${m.fragranceFree}</td>
              `).join('')}
            </tr>
            <tr>
              <td>Rating & Reviews</td>
              ${matrix.map(m => `
                <td style="font-size: 0.8rem; font-weight: 700;">${m.ratingFormatted}</td>
              `).join('')}
            </tr>
            <tr>
              <td>Pros & Formulation Highlights</td>
              ${matrix.map(m => `
                <td>
                  <ul style="padding-left: 1rem; margin: 0; font-size: 0.78rem; color: var(--text-muted);">
                    ${m.pros.map(p => `<li>${p}</li>`).join('')}
                  </ul>
                </td>
              `).join('')}
            </tr>
            <tr>
              <td>Considerations</td>
              ${matrix.map(m => `
                <td>
                  <ul style="padding-left: 1rem; margin: 0; font-size: 0.78rem; color: var(--text-muted);">
                    ${m.cons.map(c => `<li>${c}</li>`).join('')}
                  </ul>
                </td>
              `).join('')}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function renderAlternativesContent(alternativesData) {
  if (!alternativesData || !alternativesData.success) {
    return `<div style="padding: 2rem; text-align: center; color: var(--text-muted);">No alternative products found.</div>`;
  }

  const { originalProduct, budgetDupes, saferPicks, premiumUpgrades } = alternativesData;

  function renderAltCard(prod, label, labelClass) {
    return `
      <div class="dupe-card">
        <img src="${prod.image_url}" alt="${prod.name}">
        <div class="dupe-info">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="badge ${labelClass}" style="font-size: 0.7rem;">${label}</span>
            <span style="font-size: 0.8rem; font-weight: 800; color: var(--gold-primary);">${prod.suitability.scoreFormatted} Match</span>
          </div>
          <h5 style="font-family: 'Playfair Display', serif; font-size: 0.95rem; margin: 0.25rem 0 0.2rem;">${prod.name}</h5>
          <div style="font-size: 0.85rem; font-weight: 800; color: var(--text-primary);">
            ₹${prod.price} ${prod.mrp ? `<small style="font-size: 0.75rem; color: var(--text-muted); text-decoration: line-through;">₹${prod.mrp}</small>` : ''}
            ${prod.discount ? `<span style="font-size: 0.7rem; color: var(--accent-emerald); font-weight: 700; margin-left: 0.35rem;">${prod.discount}</span>` : ''}
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">
            Actives: ${(prod.key_active_ingredients || []).join(', ')}
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.35rem; min-width: 110px;">
          <a href="${prod.e_commerce_links?.amazon || '#'}" target="_blank" rel="noopener noreferrer" class="store-btn store-btn-amazon" style="font-size: 0.7rem; padding: 0.35rem;">Amazon ↗</a>
          <a href="${prod.e_commerce_links?.nykaa || '#'}" target="_blank" rel="noopener noreferrer" class="store-btn store-btn-nykaa" style="font-size: 0.7rem; padding: 0.35rem;">Nykaa ↗</a>
          <button class="btn btn-sm btn-primary" style="font-size: 0.7rem; padding: 0.35rem;" onclick="window.app.addProductToRoutine('${prod.name}', '${prod.category}')">+ Add</button>
        </div>
      </div>
    `;
  }

  return `
    <div>
      <!-- Original Product Header -->
      <div style="background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 1rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 1rem;">
        <img src="${originalProduct.image_url}" alt="${originalProduct.name}" style="width: 55px; height: 55px; object-fit: cover; border-radius: var(--radius-sm);">
        <div style="flex: 1;">
          <small style="text-transform: uppercase; font-weight: 700; color: var(--text-muted); font-size: 0.72rem;">Original Target Product</small>
          <h4 style="font-family: 'Playfair Display', serif; font-size: 1rem; margin: 0.1rem 0;">${originalProduct.name}</h4>
          <span style="font-size: 0.85rem; font-weight: 800; color: var(--text-primary);">₹${originalProduct.price}</span>
          <span style="font-size: 0.8rem; color: var(--gold-primary); font-weight: 700; margin-left: 0.5rem;">• ${originalProduct.suitability.scoreFormatted} Match</span>
        </div>
        <button class="btn btn-sm btn-outline" onclick="window.app.shuffleAlternatives(${originalProduct.id})" style="font-size: 0.75rem;">
          🔀 Shuffle Picks
        </button>
      </div>

      <!-- 1. Budget Dupes -->
      <div>
        <h4 class="alt-section-title">
          <span>💰 Affordable Budget Dupes</span>
          <small style="font-size: 0.75rem; color: var(--accent-emerald); font-weight: 600;">(Same active ingredients, lower price point)</small>
        </h4>
        ${budgetDupes.length === 0 ? `<p class="text-muted" style="font-size: 0.8rem;">No cheaper formulation available in this category.</p>` : `
          <div>${budgetDupes.map(p => renderAltCard(p, 'Budget Dupe 💰', 'badge-success')).join('')}</div>
        `}
      </div>

      <!-- 2. Safer Fragrance-Free Picks -->
      <div>
        <h4 class="alt-section-title">
          <span>🌿 Sensitive & Fragrance-Free Safer Picks</span>
          <small style="font-size: 0.75rem; color: var(--accent-emerald); font-weight: 600;">(Zero allergens, gentle barrier care)</small>
        </h4>
        ${saferPicks.length === 0 ? `<p class="text-muted" style="font-size: 0.8rem;">All matched products meet sensitive criteria.</p>` : `
          <div>${saferPicks.map(p => renderAltCard(p, 'Sensitive Safe 🌿', 'badge-accent')).join('')}</div>
        `}
      </div>

      <!-- 3. Premium Upgrades -->
      ${premiumUpgrades.length > 0 ? `
        <div>
          <h4 class="alt-section-title">
            <span>⭐ High-Potency / Luxury Upgrades</span>
            <small style="font-size: 0.75rem; color: var(--gold-primary); font-weight: 600;">(Clinical grade enhanced actives)</small>
          </h4>
          <div>${premiumUpgrades.map(p => renderAltCard(p, 'Premium Grade ⭐', 'badge-secondary')).join('')}</div>
        </div>
      ` : ''}
    </div>
  `;
}

export function renderSuitabilityBreakdown(scoreData) {
  if (!scoreData) return `<div style="padding: 1rem; color: var(--text-muted);">No score data available.</div>`;

  const { product, suitability } = scoreData;

  return `
    <div>
      <div style="display: flex; align-items: center; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-light); margin-bottom: 1.25rem;">
        <div style="width: 70px; height: 70px; border-radius: 50%; background: linear-gradient(135deg, #1E1B18 0%, #3D2D0B 100%); border: 2px solid var(--gold-primary); display: flex; align-items: center; justify-content: center; color: #FFDF70; font-family: 'Playfair Display', serif; font-size: 1.45rem; font-weight: 800; flex-shrink: 0;">
          ${suitability.scoreFormatted}
        </div>
        <div>
          <div style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--gold-primary);">${product.brand}</div>
          <h4 style="font-family: 'Playfair Display', serif; font-size: 1.05rem; margin: 0.15rem 0 0.35rem;">${product.name}</h4>
          <span class="badge ${suitability.badgeClass}" style="font-size: 0.75rem;">${suitability.badge}</span>
        </div>
      </div>

      <h5 style="font-family: 'Playfair Display', serif; font-size: 0.95rem; margin-bottom: 0.65rem;">Score Calculation Factors:</h5>
      <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.25rem;">
        ${(suitability.breakdown || []).map(b => `
          <div style="display: flex; justify-content: space-between; align-items: center; background: #FAF9F6; border: 1px solid var(--border-light); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.8rem;">
            <span>${b.item}</span>
            <strong style="color: ${b.pts.startsWith('+') ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">${b.pts} pts</strong>
          </div>
        `).join('')}
      </div>

      <div style="background: rgba(197, 155, 39, 0.08); border-left: 3px solid var(--gold-primary); padding: 0.75rem; border-radius: 4px; font-size: 0.82rem; color: var(--text-primary); line-height: 1.45;">
        <strong>AI Verdict:</strong> ${suitability.reason}
      </div>
    </div>
  `;
}

// ════════════════════════════════════════════════════════════════
// MODULE 8: PROGRESS TRACKING & ANALYTICS EDITORIAL VIEW RENDERER
// ════════════════════════════════════════════════════════════════

export function renderProgressAnalyticsPage(progressData = null, currentUser = null, localScans = []) {
  const fallback = MOCK_PROGRESS_TRACKING_DATA;
  const userId = currentUser?.id || progressData?.user_id || 1;

  // 1. Resolve checkpoints / scan history
  let history = progressData?.history || [];
  if (history.length === 0 && Array.isArray(localScans) && localScans.length > 0) {
    history = localScans;
  }
  if (history.length === 0 && userId === 1 && !progressData) {
    history = fallback.checkpoints || [];
  }

  const totalScans = history.length;
  const isZeroState = totalScans === 0;
  const isSingleScan = totalScans === 1;

  // 2. Resolve Comparison Data
  let comp = progressData?.beforeAfterComparison;
  if (comp && (!comp.has_data || comp.baseline_score === null || comp.current_score === null)) {
    comp = null;
  }

  if (!comp && totalScans >= 2) {
    const baseline = history[0];
    const current = history[history.length - 1];
    const bScore = Number(baseline.overall_skin_health_score || baseline.skin_health_score || 70);
    const cScore = Number(current.overall_skin_health_score || current.skin_health_score || 78);
    const scoreDelta = Math.round((cScore - bScore) * 10) / 10;
    const bHydr = Number(baseline.hydration_level || baseline.biomarkers?.hydration_level || 50);
    const cHydr = Number(current.hydration_level || current.biomarkers?.hydration_level || 70);
    const hydrDelta = Math.round((cHydr - bHydr) * 10) / 10;
    const hydrPct = bHydr > 0 ? Math.round((hydrDelta / bHydr) * 1000) / 10 : 0;

    const bAcne = Number(baseline.acne_severity || baseline.biomarkers?.acne_severity || 30);
    const cAcne = Number(current.acne_severity || current.biomarkers?.acne_severity || 12);
    const acneDelta = Math.round((cAcne - bAcne) * 10) / 10;
    const acnePct = bAcne > 0 ? Math.round((acneDelta / bAcne) * 1000) / 10 : 0;

    const bBarrier = Number(baseline.barrier_strength || baseline.biomarkers?.barrier_strength || 60);
    const cBarrier = Number(current.barrier_strength || current.biomarkers?.barrier_strength || 85);
    const barrierDelta = Math.round((cBarrier - bBarrier) * 10) / 10;
    const barrierPct = bBarrier > 0 ? Math.round((barrierDelta / bBarrier) * 1000) / 10 : 0;

    const bSens = Number(baseline.redness_reactivity || baseline.sensitivity_level || baseline.biomarkers?.sensitivity_level || 30);
    const cSens = Number(current.redness_reactivity || current.sensitivity_level || current.biomarkers?.sensitivity_level || 15);
    const rednessDelta = Math.round((cSens - bSens) * 10) / 10;
    const rednessPct = bSens > 0 ? Math.round((rednessDelta / bSens) * 1000) / 10 : 0;

    const bPigm = Number(baseline.pigmentation_score || baseline.biomarkers?.pigmentation_score || 30);
    const cPigm = Number(current.pigmentation_score || current.biomarkers?.pigmentation_score || 20);
    const pigmDelta = Math.round((cPigm - bPigm) * 10) / 10;
    const pigmPct = bPigm > 0 ? Math.round((pigmDelta / bPigm) * 1000) / 10 : 0;

    comp = {
      has_data: true,
      days_elapsed: 30,
      baseline_date: baseline.log_date || 'Baseline Scan',
      current_date: current.log_date || 'Recent Scan',
      baseline_image: baseline.photo_url || baseline.image_url || 'assets/hero_skin_scan.png',
      current_image: current.photo_url || current.image_url || 'assets/hero_skin_scan.png',
      baseline_score: bScore,
      current_score: cScore,
      score_delta: scoreDelta,
      verdict: scoreDelta > 0 ? `Significant Improvement (+${scoreDelta} pts) 🏆` : `Skin Health Maintained (${scoreDelta} pts)`,
      clinical_summary: `Cutaneous health evolved from ${bScore} to ${cScore}/100. Hydration ${hydrPct >= 0 ? '+' : ''}${hydrPct}%, Barrier ${barrierPct >= 0 ? '+' : ''}${barrierPct}%, Acne ${acnePct}%.`,
      biomarker_deltas: [
        { parameter: 'Hydration (Moisture Plumpness)', baseline_val: bHydr, current_val: cHydr, delta_val: hydrDelta, delta_percentage: hydrPct, status: hydrDelta >= 0 ? 'Improved' : 'Needs Care', color: '#0284C7', clinical_insight: `Intracellular water binding capacity ${hydrPct >= 0 ? 'increased by +' + hydrPct + '%' : 'decreased by ' + hydrPct + '%'}.` },
        { parameter: 'Acne & Blemish Severity', baseline_val: bAcne, current_val: cAcne, delta_val: acneDelta, delta_percentage: acnePct, status: acneDelta <= 0 ? 'Significantly Improved' : 'Active Concern', color: '#2E7D32', clinical_insight: `Micro-comedones & blemish density ${acnePct <= 0 ? 'down ' + Math.abs(acnePct) + '%' : 'up +' + acnePct + '%'}.` },
        { parameter: 'Barrier Integrity Score', baseline_val: bBarrier, current_val: cBarrier, delta_val: barrierDelta, delta_percentage: barrierPct, status: barrierDelta >= 0 ? 'Significantly Improved' : 'Needs Care', color: '#C59B27', clinical_insight: `Lipid bilayer consolidation ${barrierPct >= 0 ? 'boosted by +' + barrierPct + '%' : 'shifted'}.` },
        { parameter: 'Erythema & Redness Reactivity', baseline_val: bSens, current_val: cSens, delta_val: rednessDelta, delta_percentage: rednessPct, status: rednessDelta <= 0 ? 'Significantly Improved' : 'Moderate', color: '#8E24AA', clinical_insight: `Vascular flushing ${rednessPct <= 0 ? 'calmed by ' + Math.abs(rednessPct) + '%' : 'monitored'}.` },
        { parameter: 'Post-Inflammatory Pigmentation', baseline_val: bPigm, current_val: cPigm, delta_val: pigmDelta, delta_percentage: pigmPct, status: pigmDelta <= 0 ? 'Improved' : 'Monitored', color: '#D97706', clinical_insight: `Melanin clustering ${pigmPct <= 0 ? 'faded by ' + Math.abs(pigmPct) + '%' : 'monitored'}.` }
      ],
      top_positive_drivers: fallback.beforeAfterComparison.top_positive_drivers,
      remaining_targets: fallback.beforeAfterComparison.remaining_targets
    };
  } else if (!comp && isSingleScan) {
    const single = history[0];
    const sScore = Number(single.overall_skin_health_score || single.skin_health_score || 75);
    const sHydr = Number(single.hydration_level || single.biomarkers?.hydration_level || 65);
    const sAcne = Number(single.acne_severity || single.biomarkers?.acne_severity || 18);
    const sBarrier = Number(single.barrier_strength || single.biomarkers?.barrier_strength || 75);
    const sSens = Number(single.redness_reactivity || single.sensitivity_level || single.biomarkers?.sensitivity_level || 20);
    const sPigm = Number(single.pigmentation_score || single.biomarkers?.pigmentation_score || 20);

    comp = {
      has_data: true,
      is_single: true,
      days_elapsed: 0,
      baseline_date: single.log_date || 'Baseline Intake',
      current_date: single.log_date || 'Baseline Intake',
      baseline_image: single.photo_url || single.image_url || 'assets/hero_skin_scan.png',
      current_image: single.photo_url || single.image_url || 'assets/hero_skin_scan.png',
      baseline_score: sScore,
      current_score: sScore,
      score_delta: 0,
      verdict: `Baseline Established (${sScore}/100) 🎯`,
      clinical_summary: `Initial intake assessment recorded. Health Score: ${sScore}/100. Hydration: ${sHydr}%, Barrier: ${sBarrier}%, Acne: ${sAcne}%.`,
      biomarker_deltas: [
        { parameter: 'Hydration (Moisture Plumpness)', baseline_val: sHydr, current_val: sHydr, delta_val: 0, delta_percentage: 0, status: 'Baseline Established', color: '#0284C7', clinical_insight: `Initial baseline moisture capacity indexed at ${sHydr}%.` },
        { parameter: 'Acne & Blemish Severity', baseline_val: sAcne, current_val: sAcne, delta_val: 0, delta_percentage: 0, status: 'Baseline Established', color: '#2E7D32', clinical_insight: `Initial blemish index recorded at ${sAcne}%.` },
        { parameter: 'Barrier Integrity Score', baseline_val: sBarrier, current_val: sBarrier, delta_val: 0, delta_percentage: 0, status: 'Baseline Established', color: '#C59B27', clinical_insight: `Lipid barrier resilience recorded at ${sBarrier}%.` },
        { parameter: 'Erythema & Redness Reactivity', baseline_val: sSens, current_val: sSens, delta_val: 0, delta_percentage: 0, status: 'Baseline Established', color: '#8E24AA', clinical_insight: `Capillary sensitivity indexed at ${sSens}%.` },
        { parameter: 'Post-Inflammatory Pigmentation', baseline_val: sPigm, current_val: sPigm, delta_val: 0, delta_percentage: 0, status: 'Baseline Established', color: '#D97706', clinical_insight: `Melanin distribution score indexed at ${sPigm}%.` }
      ],
      top_positive_drivers: fallback.beforeAfterComparison.top_positive_drivers,
      remaining_targets: ['Complete daily routine logs to build habit streak.', 'Take follow-up scan in 7-14 days.']
    };
  } else if (!comp && !isZeroState && userId === 1) {
    comp = fallback.beforeAfterComparison;
  }

  // 3. Resolve Adherence, Calendar, Trends, Report
  const adherence = progressData?.adherence || (isZeroState ? {
    monthly_compliance_pct: 0,
    current_streak_days: 0,
    longest_streak_days: 0,
    total_sessions_logged: 0
  } : fallback.adherence);

  const report = progressData?.improvementReport || fallback.improvementReport;
  const calendarDays = generateCalendar30Days();
  const baseScoreVal = isZeroState ? '--' : (comp && comp.baseline_score !== null ? comp.baseline_score : (history[0]?.overall_skin_health_score || 70));
  const curScoreVal = isZeroState ? '--' : (comp && comp.current_score !== null ? comp.current_score : (history[history.length - 1]?.overall_skin_health_score || 70));
  const deltaScoreVal = isZeroState ? 0 : (comp && comp.score_delta !== null ? comp.score_delta : Math.round((Number(curScoreVal) - Number(baseScoreVal)) * 10) / 10);

  return `
    <div class="editorial-container progress-analytics-page" style="padding-top: 1.5rem;">

      <!-- HERO CLINICAL HEADER WITH KPI METRIC STRIP -->
      <div class="progress-hero-header" style="background: linear-gradient(135deg, #FAF8F5 0%, #F3EFE6 100%); border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 1.8rem; margin-bottom: 1.75rem; position: relative; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; position: relative; z-index: 2;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem;">
              <span class="section-tag-pill" style="font-size: 0.72rem; padding: 0.2rem 0.65rem; background: rgba(197, 155, 39, 0.15); color: #8A6400; font-weight: 800;">
                PROGRESS TRACKING & ANALYTICS
              </span>
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">• ${currentUser ? (currentUser.full_name || currentUser.username) : 'Aarav Sharma'} Clinical Profile</span>
            </div>
            <h1 style="font-family: 'Playfair Display', serif; font-size: 2rem; color: var(--text-primary); margin: 0 0 0.4rem 0; font-weight: 700;">
              Skin Progress Monitoring & Analytics Lab
            </h1>
            <p style="font-size: 0.88rem; color: var(--text-muted); max-width: 680px; margin: 0; line-height: 1.45;">
              Continuous multi-parameter biomarker monitoring, daily routine fidelity tracking, optical before/after diffing, and 30-day predictive AI health score trajectories.
            </p>
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; gap: 0.6rem; flex-wrap: wrap; align-items: center;">
            <button class="btn btn-primary btn-sm" onclick="window.app.openModal('photo-scan-modal')" style="font-weight: 700; padding: 0.55rem 1.1rem; box-shadow: 0 4px 12px rgba(197,155,39,0.25);">
              📸 ${isZeroState ? 'Take Baseline AI Scan' : 'New Progress Scan'}
            </button>
            <button class="btn btn-outline btn-sm" onclick="window.app.handleDailyAdherenceCheckIn()" style="font-weight: 700; padding: 0.55rem 1.1rem; background: #FFFFFF;">
              ✅ Check-In Today (+2.5 pts)
            </button>
            <button class="btn btn-outline btn-sm" onclick="window.app.openReportsModal('progress')" style="font-weight: 700; padding: 0.55rem 0.95rem; background: #FFFFFF; display: flex; align-items: center; gap: 0.35rem;" title="Open Clinical Reports & Multi-Format Export Hub">
              📄 Clinical Reports Hub
            </button>
          </div>
        </div>

        <!-- 4 EXECUTIVE KPI STAT CARDS -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 1rem; margin-top: 1.5rem; position: relative; z-index: 2;">
          <div style="background: rgba(255,255,255,0.85); backdrop-filter: blur(8px); border: 1px solid var(--border-light); border-left: 4px solid var(--gold-primary); border-radius: var(--radius-sm); padding: 1rem 1.15rem;">
            <div style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Cutaneous Health Delta</div>
            <div style="font-size: 1.65rem; font-weight: 800; color: var(--text-primary); margin: 0.2rem 0;">
              ${isZeroState ? 'Awaiting Scan' : isSingleScan ? `${curScoreVal} / 100` : `${baseScoreVal} &rarr; ${curScoreVal}`}
              ${!isZeroState && !isSingleScan ? `<span style="font-size: 0.95rem; color: ${deltaScoreVal >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'}; font-weight: 700;">(${deltaScoreVal >= 0 ? '+' : ''}${deltaScoreVal} pts)</span>` : ''}
              ${isSingleScan ? `<span style="font-size: 0.78rem; color: var(--gold-primary); font-weight: 700; display: block;">Day 1 Baseline Intake</span>` : ''}
            </div>
            <div style="font-size: 0.76rem; color: var(--text-muted);">
              ${isZeroState ? 'Perform intake scan to start tracking' : isSingleScan ? 'Follow routine & rescan in 7-14 days' : `Velocity: <strong>+${(Math.max(0.1, deltaScoreVal / 4.3)).toFixed(2)} pts / week</strong>`}
            </div>
          </div>

          <div style="background: rgba(255,255,255,0.85); backdrop-filter: blur(8px); border: 1px solid var(--border-light); border-left: 4px solid var(--accent-emerald); border-radius: var(--radius-sm); padding: 1rem 1.15rem;">
            <div style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">30-Day Routine Adherence</div>
            <div style="font-size: 1.65rem; font-weight: 800; color: var(--text-primary); margin: 0.2rem 0;">
              ${adherence.monthly_compliance_pct}%
            </div>
            <div style="font-size: 0.76rem; color: var(--accent-emerald); font-weight: 600;">
              ${adherence.total_sessions_logged > 0 ? `${adherence.total_sessions_logged} sessions logged` : '0 AM/PM steps logged'}
            </div>
          </div>

          <div style="background: rgba(255,255,255,0.85); backdrop-filter: blur(8px); border: 1px solid var(--border-light); border-left: 4px solid var(--accent-amber); border-radius: var(--radius-sm); padding: 1rem 1.15rem;">
            <div style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Active Habit Streak</div>
            <div style="font-size: 1.65rem; font-weight: 800; color: var(--text-primary); margin: 0.2rem 0;">
              ${adherence.current_streak_days} Days <span style="font-size: 1.1rem;">🔥</span>
            </div>
            <div style="font-size: 0.76rem; color: var(--text-muted);">Personal Best: <strong>${Math.max(adherence.current_streak_days, adherence.longest_streak_days)} Days</strong></div>
          </div>

          <div style="background: rgba(255,255,255,0.85); backdrop-filter: blur(8px); border: 1px solid var(--border-light); border-left: 4px solid var(--pink-blush); border-radius: var(--radius-sm); padding: 1rem 1.15rem;">
            <div style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Clinical Transformation Verdict</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: ${isZeroState ? 'var(--gold-primary)' : 'var(--accent-emerald)'}; margin: 0.35rem 0 0.15rem 0;">
              ${isZeroState ? 'Intake Scan Required 📸' : isSingleScan ? 'Baseline Established 🎯' : (comp?.verdict || 'Significant Improvement 🏆')}
            </div>
            <div style="font-size: 0.76rem; color: var(--text-muted);">
              ${isZeroState ? 'Establish baseline to unlock analytics' : isSingleScan ? 'Rescan in 7-14 days for optical diffing' : 'Hydration Boost & Barrier Lipid Seal'}
            </div>
          </div>
        </div>
      </div>

      ${isZeroState ? `
        <!-- ZERO STATE ONBOARDING CARD -->
        <section class="glass-card section-margin" style="background: #FFFFFF; padding: 2.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-gold); margin-bottom: 2rem; text-align: center;">
          <div style="max-width: 650px; margin: 0 auto;">
            <div style="width: 72px; height: 72px; border-radius: 50%; background: rgba(197, 155, 39, 0.1); color: var(--gold-primary); display: flex; align-items: center; justify-content: center; font-size: 2.2rem; margin: 0 auto 1.25rem; border: 2px solid var(--border-gold);">
              📸
            </div>
            <h2 style="font-family: 'Playfair Display', serif; font-size: 1.6rem; color: var(--text-primary); margin: 0 0 0.6rem 0;">
              Awaiting Initial Clinical AI Scan
            </h2>
            <p style="font-size: 0.92rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 1.5rem;">
              You have not recorded any optical facial scans yet. Launch the Panacea AI camera scanner or upload a close-up photo to establish your baseline skin health score, detect biomarkers, and unlock personalized Before & After comparison tracking.
            </p>
            <button class="btn btn-primary" onclick="window.app.openModal('photo-scan-modal')" style="font-weight: 700; padding: 0.8rem 2rem; font-size: 1rem; box-shadow: 0 4px 16px rgba(197,155,39,0.35);">
              📸 Launch AI Camera Scanner &rarr;
            </button>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-top: 2.5rem; text-align: left;">
            <div style="padding: 1.2rem; background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm); border-top: 3px solid var(--gold-primary);">
              <strong style="font-size: 0.9rem; color: var(--text-primary); display: block; margin-bottom: 0.35rem;">🔍 1. Optical Biomarker Extraction</strong>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">Multi-parameter analysis measuring hydration plumpness, sebum output, barrier resilience, and vascular redness.</p>
            </div>
            <div style="padding: 1.2rem; background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm); border-top: 3px solid var(--accent-emerald);">
              <strong style="font-size: 0.9rem; color: var(--text-primary); display: block; margin-bottom: 0.35rem;">📈 2. Before & After Diffing</strong>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">Interactive split-slider comparing your day 1 baseline photo directly against your latest skin transformation milestone.</p>
            </div>
            <div style="padding: 1.2rem; background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm); border-top: 3px solid var(--accent-amber);">
              <strong style="font-size: 0.9rem; color: var(--text-primary); display: block; margin-bottom: 0.35rem;">📅 3. Habit Fidelity Tracking</strong>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0;">Daily morning and evening protocol logs with active streak acceleration and predictive AI score forecasting.</p>
            </div>
          </div>
        </section>
      ` : `
        <!-- SECTION 1: INTERACTIVE BEFORE / AFTER SPLIT-SCREEN COMPARISON -->
        <section class="glass-card section-margin" style="background: #FFFFFF; padding: 1.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-light); margin-bottom: 2rem;">
          <div class="card-header" style="border-bottom: 1px solid var(--border-light); padding-bottom: 0.85rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.2rem;">📸</span>
                <h2 style="font-family: 'Playfair Display', serif; font-size: 1.35rem; margin: 0;">
                  ${isSingleScan ? 'Baseline Clinical Optical Assessment' : 'Interactive Before & After Optical Comparison'}
                </h2>
              </div>
              <p class="text-muted" style="font-size: 0.82rem; margin-top: 0.15rem;">
                ${isSingleScan ? 'Baseline optical telemetry captured and indexed. Take follow-up scans to unlock optical before/after diffing.' : 'Drag the interactive slider handle left/right to visually inspect cutaneous resolution over time.'}
              </p>
            </div>

            ${!isSingleScan ? `
              <!-- Milestone Pair Switcher -->
              <div style="display: flex; gap: 0.35rem; background: #FAF9F6; padding: 0.25rem; border-radius: 20px; border: 1px solid var(--border-light);">
                <button class="tab-btn active" id="btn-pair-30d" onclick="window.app.switchBeforeAfterPair('30d')" style="font-size: 0.76rem; padding: 0.3rem 0.8rem;">
                  Baseline vs Latest ✨
                </button>
                <button class="tab-btn" id="btn-pair-14d" onclick="window.app.switchBeforeAfterPair('14d')" style="font-size: 0.76rem; padding: 0.3rem 0.8rem;">
                  Day 1 vs Checkpoint
                </button>
              </div>
            ` : `
              <span class="badge badge-accent" style="font-weight: 700; font-size: 0.78rem;">🎯 Baseline Intake Scan (1 of 1)</span>
            `}
          </div>

          <!-- SPLIT COMPARISON SLIDER & BIOMARKER MATRIX SPLIT -->
          <div style="display: grid; grid-template-columns: minmax(320px, 460px) 1fr; gap: 1.5rem; align-items: start;">
            
            <!-- LEFT: BEFORE/AFTER SLIDER OR SINGLE BASELINE PHOTO -->
            <div class="before-after-slider-container" id="before-after-slider-box" style="position: relative; width: 100%; height: 380px; border-radius: var(--radius-sm); overflow: hidden; border: 2px solid var(--border-gold); box-shadow: 0 8px 24px rgba(0,0,0,0.1); user-select: none;">
              <!-- AFTER / CURRENT IMAGE -->
              <img src="${comp.current_image}" alt="Clinical Skin Evaluation" class="ba-image-after" style="width: 100%; height: 100%; object-fit: cover; display: block;">
              
              ${!isSingleScan ? `
                <!-- BEFORE IMAGE (Clipped on top) -->
                <div class="ba-image-before-wrapper" id="ba-before-wrapper" style="position: absolute; top: 0; left: 0; width: 50%; height: 100%; overflow: hidden;">
                  <img src="${comp.baseline_image}" alt="Baseline Skin" class="ba-image-before" style="width: 460px; height: 380px; object-fit: cover; max-width: none; display: block;">
                  <!-- Label Pill Before -->
                  <div style="position: absolute; top: 12px; left: 12px; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); color: #fff; padding: 0.25rem 0.65rem; border-radius: 12px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.05em; border: 1px solid rgba(255,255,255,0.2);">
                    BEFORE • ${comp.baseline_date} (${comp.baseline_score})
                  </div>
                </div>

                <!-- Label Pill After -->
                <div style="position: absolute; top: 12px; right: 12px; background: rgba(46, 125, 50, 0.85); backdrop-filter: blur(6px); color: #fff; padding: 0.25rem 0.65rem; border-radius: 12px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.05em; border: 1px solid rgba(255,255,255,0.2);">
                  AFTER • ${comp.current_date} (${comp.current_score})
                </div>

                <!-- DRAGGABLE DIVIDER LINE & HANDLE -->
                <div class="ba-divider-handle" id="ba-divider-handle" style="position: absolute; top: 0; bottom: 0; left: 50%; width: 4px; background: #FFFFFF; box-shadow: 0 0 10px rgba(0,0,0,0.4); cursor: ew-resize; transform: translateX(-50%);">
                  <div class="ba-handle-circle" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 36px; height: 36px; border-radius: 50%; background: #FFFFFF; border: 2px solid var(--gold-primary); box-shadow: 0 2px 10px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; font-size: 0.78rem; font-weight: 900; color: var(--gold-primary);">
                    &lang;&rang;
                  </div>
                </div>

                <!-- Position Pill at Bottom -->
                <div style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.65); color: #FFFFFF; font-size: 0.68rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 10px; pointer-events: none;">
                  &larr; Drag to Compare &rarr;
                </div>
              ` : `
                <div style="position: absolute; top: 12px; left: 12px; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); color: #fff; padding: 0.25rem 0.65rem; border-radius: 12px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.05em; border: 1px solid rgba(255,255,255,0.2);">
                  BASELINE SCAN • ${comp.baseline_date} (${comp.baseline_score}/100)
                </div>
                <div style="position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); background: rgba(197, 155, 39, 0.9); color: #FFFFFF; font-size: 0.72rem; font-weight: 700; padding: 0.3rem 0.8rem; border-radius: 12px; pointer-events: none; white-space: nowrap;">
                  ✨ Baseline Telemetry Indexed
                </div>
              `}
            </div>

            <!-- RIGHT: OPTICAL BIOMARKERS DELTA MATRIX TABLE -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <h4 style="font-family: 'Playfair Display', serif; font-size: 1.1rem; margin: 0;">Optical Biomarker ${isSingleScan ? 'Intake Metrics' : 'Delta Matrix'}</h4>
                <span class="badge ${isSingleScan ? 'badge-accent' : 'badge-success'}" style="font-size: 0.72rem; font-weight: 700;">
                  ${isSingleScan ? 'Day 1 Baseline' : `${comp.days_elapsed} Days Elapsed`}
                </span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 0.6rem;">
                ${comp.biomarker_deltas.map(b => {
                  const isGain = b.delta_percentage > 0;
                  const isGood = b.parameter.includes('Acne') || b.parameter.includes('Redness') || b.parameter.includes('Pigmentation') || b.parameter.includes('Sebum') ? !isGain : isGain;
                  const badgeColor = isSingleScan ? 'var(--gold-primary)' : (isGood ? 'var(--accent-emerald)' : 'var(--accent-rose)');
                  const deltaSign = b.delta_val > 0 ? `+${b.delta_val}` : `${b.delta_val}`;
                  const pctSign = b.delta_percentage > 0 ? `+${b.delta_percentage}%` : `${b.delta_percentage}%`;

                  return `
                    <div style="padding: 0.75rem 0.95rem; background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
                      <div style="flex: 1; min-width: 180px;">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.15rem;">
                          <strong style="font-size: 0.85rem; color: var(--text-primary);">${b.parameter}</strong>
                        </div>
                        <p style="font-size: 0.76rem; color: var(--text-muted); margin: 0; line-height: 1.35;">${b.clinical_insight}</p>
                      </div>

                      <div style="text-align: right; min-width: 110px;">
                        <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.15rem;">
                          ${isSingleScan ? `<strong style="color: var(--text-primary); font-size: 0.88rem;">${b.current_val}%</strong>` : `${b.baseline_val} &rarr; <strong style="color: var(--text-primary); font-size: 0.85rem;">${b.current_val}</strong>`}
                        </div>
                        <span style="display: inline-block; background: ${isSingleScan ? 'rgba(197, 155, 39, 0.12)' : 'rgba(46, 125, 50, 0.1)'}; color: ${badgeColor}; font-size: 0.75rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 6px;">
                          ${isSingleScan ? 'Baseline Indexed' : `${pctSign} (${deltaSign})`}
                        </span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>

              <!-- Clinical Summary Box -->
              <div style="margin-top: 1rem; padding: 0.85rem 1.1rem; background: rgba(197, 155, 39, 0.06); border-left: 3px solid var(--gold-primary); border-radius: 4px;">
                <strong style="font-size: 0.82rem; color: #8A6400; text-transform: uppercase;">Dermatologist Clinical Verdict:</strong>
                <p style="font-size: 0.82rem; color: var(--text-primary); margin: 0.25rem 0 0 0; line-height: 1.4;">${comp.clinical_summary}</p>
              </div>
            </div>

          </div>
        </section>
      `}

      <!-- SECTION 2: 60-DAY HISTORICAL & 30-DAY AI PREDICTIVE TREND ANALYSIS -->
      <section class="glass-card section-margin" style="background: #FFFFFF; padding: 1.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-light); margin-bottom: 2rem;">
        <div class="card-header" style="border-bottom: 1px solid var(--border-light); padding-bottom: 0.85rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.2rem;">📈</span>
              <h2 style="font-family: 'Playfair Display', serif; font-size: 1.35rem; margin: 0;">Skin Health Trajectory & 30-Day Predictive AI Forecast</h2>
            </div>
            <p class="text-muted" style="font-size: 0.82rem; margin-top: 0.15rem;">
              Statistical regression modeling based on your ${adherence.current_streak_days}-day active streak and optical biomarker response
            </p>
          </div>

          <div style="display: flex; gap: 0.35rem; background: #FAF9F6; padding: 0.25rem; border-radius: 20px; border: 1px solid var(--border-light);">
            <button class="tab-btn" onclick="window.app.filterTrendTimeframe('7d', this)" style="font-size: 0.76rem; padding: 0.3rem 0.75rem;">7 Days</button>
            <button class="tab-btn active" onclick="window.app.filterTrendTimeframe('30d', this)" style="font-size: 0.76rem; padding: 0.3rem 0.75rem;">30 Days (Standard)</button>
            <button class="tab-btn" onclick="window.app.filterTrendTimeframe('90d', this)" style="font-size: 0.76rem; padding: 0.3rem 0.75rem;">90 Days</button>
            <button class="tab-btn" onclick="window.app.filterTrendTimeframe('all', this)" style="font-size: 0.76rem; padding: 0.3rem 0.75rem;">All Time</button>
          </div>
        </div>

        <!-- HIGH-DEFINITION SVG TREND & FORECAST CHART -->
        <div style="background: linear-gradient(180deg, #FAF8F5 0%, #FFFFFF 100%); border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 1.25rem; margin-bottom: 1.25rem;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 1.25rem; font-size: 0.78rem;">
              <span style="display: inline-flex; align-items: center; gap: 0.4rem; font-weight: 700; color: var(--text-primary);">
                <span style="width: 14px; height: 4px; background: var(--gold-primary); border-radius: 2px; display: inline-block;"></span>
                Historical Score (Past 30 Days)
              </span>
              <span style="display: inline-flex; align-items: center; gap: 0.4rem; font-weight: 700; color: var(--accent-emerald);">
                <span style="width: 14px; height: 3px; border-top: 3px dashed var(--accent-emerald); display: inline-block;"></span>
                AI Forecast Projection (Next 30 Days)
              </span>
              <span style="display: inline-flex; align-items: center; gap: 0.4rem; font-weight: 700; color: #8A8177;">
                <span style="width: 14px; height: 2px; background: #C2BBB2; border-radius: 1px; display: inline-block;"></span>
                Target Score (85.0 Optimal)
              </span>
            </div>

            <div style="font-size: 0.78rem; color: var(--text-muted);">
              Current Velocity: <strong style="color: var(--accent-emerald);">+${(Math.max(0.1, deltaScoreVal / 4.3)).toFixed(2)} pts / week</strong> &bull; Estimated to 85+: <strong>${Math.max(7, Math.round((85 - curScoreVal) / 0.36) || 22)} Days</strong>
            </div>
          </div>

          <!-- SVG GRAPH VIEWPORT -->
          <div style="width: 100%; height: 240px; position: relative;">
            <svg viewBox="0 0 800 240" style="width: 100%; height: 100%; overflow: visible;" preserveAspectRatio="none">
              <defs>
                <linearGradient id="scoreAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#C59B27" stop-opacity="0.25"/>
                  <stop offset="100%" stop-color="#C59B27" stop-opacity="0.0"/>
                </linearGradient>
                <linearGradient id="projAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#2E7D32" stop-opacity="0.18"/>
                  <stop offset="100%" stop-color="#2E7D32" stop-opacity="0.0"/>
                </linearGradient>
              </defs>

              <!-- Grid Horizontal Lines -->
              <line x1="40" y1="30" x2="780" y2="30" stroke="#EAE5DC" stroke-width="1" stroke-dasharray="4 4"/>
              <text x="10" y="34" font-size="10" fill="#94A3B8" font-family="sans-serif">90</text>

              <!-- Target 85 line -->
              <line x1="40" y1="65" x2="780" y2="65" stroke="#C59B27" stroke-width="1" stroke-dasharray="6 4" opacity="0.6"/>
              <text x="10" y="69" font-size="10" fill="#C59B27" font-weight="bold" font-family="sans-serif">85 Target</text>

              <line x1="40" y1="105" x2="780" y2="105" stroke="#EAE5DC" stroke-width="1" stroke-dasharray="4 4"/>
              <text x="10" y="109" font-size="10" fill="#94A3B8" font-family="sans-serif">80</text>

              <line x1="40" y1="150" x2="780" y2="150" stroke="#EAE5DC" stroke-width="1" stroke-dasharray="4 4"/>
              <text x="10" y="154" font-size="10" fill="#94A3B8" font-family="sans-serif">70</text>

              <line x1="40" y1="195" x2="780" y2="195" stroke="#EAE5DC" stroke-width="1" stroke-dasharray="4 4"/>
              <text x="10" y="199" font-size="10" fill="#94A3B8" font-family="sans-serif">60</text>

              <!-- Middle Divider (Today) -->
              <line x1="410" y1="20" x2="410" y2="210" stroke="#475569" stroke-width="1.5" stroke-dasharray="3 3"/>
              <text x="390" y="15" font-size="11" font-weight="bold" fill="#181614" font-family="sans-serif">TODAY (${curScoreVal})</text>

              <!-- Historical Area Fill -->
              <polygon points="50,158 110,147 170,136 230,126 290,118 350,112 410,107 410,210 50,210" fill="url(#scoreAreaGrad)"/>
              
              <!-- Historical Line -->
              <path d="M 50,158 Q 170,135 290,118 T 410,107" fill="none" stroke="#C59B27" stroke-width="3.5" stroke-linecap="round"/>

              <!-- Checkpoint Circles on Historical Line -->
              <circle cx="50" cy="158" r="5" fill="#FFFFFF" stroke="#C59B27" stroke-width="3"/>
              <text x="45" y="180" font-size="10" font-weight="bold" fill="#716A61" text-anchor="middle">Day 1 (${baseScoreVal})</text>

              <circle cx="170" cy="136" r="4.5" fill="#FFFFFF" stroke="#C59B27" stroke-width="2.5"/>
              <text x="170" y="125" font-size="9" fill="#716A61" text-anchor="middle">W2 (${Math.round((baseScoreVal + (curScoreVal - baseScoreVal) * 0.35) * 10) / 10})</text>

              <circle cx="290" cy="118" r="4.5" fill="#FFFFFF" stroke="#C59B27" stroke-width="2.5"/>
              <text x="290" y="106" font-size="9" fill="#716A61" text-anchor="middle">W4 (${Math.round((baseScoreVal + (curScoreVal - baseScoreVal) * 0.7) * 10) / 10})</text>

              <circle cx="410" cy="107" r="6" fill="#2E7D32" stroke="#FFFFFF" stroke-width="2"/>

              <!-- Projected Forecast Area Fill -->
              <polygon points="410,107 470,95 530,86 590,78 650,72 710,68 770,65 770,210 410,210" fill="url(#projAreaGrad)"/>

              <!-- Projected Forecast Line -->
              <path d="M 410,107 Q 530,85 650,72 T 770,65" fill="none" stroke="#2E7D32" stroke-width="3" stroke-dasharray="6 4" stroke-linecap="round"/>

              <!-- Projected End Circle -->
              <circle cx="770" cy="65" r="5" fill="#FFFFFF" stroke="#2E7D32" stroke-width="3"/>
              <text x="760" y="52" font-size="10" font-weight="bold" fill="#2E7D32" text-anchor="middle">+30d (${Math.min(96, Math.round((curScoreVal + 5.1) * 10) / 10)})</text>

              <!-- X-Axis Labels -->
              <text x="50" y="228" font-size="10" fill="#94A3B8" text-anchor="middle">-30 Days</text>
              <text x="170" y="228" font-size="10" fill="#94A3B8" text-anchor="middle">-20 Days</text>
              <text x="290" y="228" font-size="10" fill="#94A3B8" text-anchor="middle">-10 Days</text>
              <text x="410" y="228" font-size="10" font-weight="bold" fill="#181614" text-anchor="middle">Today (${curScoreVal})</text>
              <text x="530" y="228" font-size="10" fill="#94A3B8" text-anchor="middle">+10 Days</text>
              <text x="650" y="228" font-size="10" fill="#94A3B8" text-anchor="middle">+20 Days</text>
              <text x="770" y="228" font-size="10" fill="#94A3B8" text-anchor="middle">+30 Days</text>
            </svg>
          </div>
        </div>

        <!-- 4 KEY TREND INDICATORS -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.85rem;">
          <div style="padding: 0.9rem; background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm);">
            <div style="font-size: 0.73rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Barrier Restoration Index</div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 0.25rem;">
              <strong style="font-size: 0.95rem; color: var(--text-primary);">Rapid Ascent</strong>
              <span style="font-size: 0.85rem; font-weight: 800; color: var(--accent-emerald);">+65.4%</span>
            </div>
          </div>
          <div style="padding: 0.9rem; background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm);">
            <div style="font-size: 0.73rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Sebum Secretion Stability</div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 0.25rem;">
              <strong style="font-size: 0.95rem; color: var(--text-primary);">Normalized Balance</strong>
              <span style="font-size: 0.85rem; font-weight: 800; color: var(--accent-emerald);">-29.7%</span>
            </div>
          </div>
          <div style="padding: 0.9rem; background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm);">
            <div style="font-size: 0.73rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Micro-Vascular Sensitivity</div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 0.25rem;">
              <strong style="font-size: 0.95rem; color: var(--text-primary);">Steady Cooling</strong>
              <span style="font-size: 0.85rem; font-weight: 800; color: var(--accent-emerald);">-52.6%</span>
            </div>
          </div>
          <div style="padding: 0.9rem; background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm);">
            <div style="font-size: 0.73rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Photodamage Repair Rate</div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 0.25rem;">
              <strong style="font-size: 0.95rem; color: var(--text-primary);">Continuous Gradual</strong>
              <span style="font-size: 0.85rem; font-weight: 800; color: var(--accent-emerald);">+44.3%</span>
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION 3: 30-DAY ROUTINE ADHERENCE HEATMAP & HABIT STREAK TRACKER -->
      <section class="glass-card section-margin" style="background: #FFFFFF; padding: 1.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-light); margin-bottom: 2rem;">
        <div class="card-header" style="border-bottom: 1px solid var(--border-light); padding-bottom: 0.85rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.2rem;">📅</span>
              <h2 style="font-family: 'Playfair Display', serif; font-size: 1.35rem; margin: 0;">30-Day Routine Adherence & Habit Compliance Matrix</h2>
            </div>
            <p class="text-muted" style="font-size: 0.82rem; margin-top: 0.15rem;">
              Daily morning, evening, and weekly protocol logging with active streak acceleration
            </p>
          </div>

          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: var(--text-muted);">
              <span style="width: 10px; height: 10px; background: #2E7D32; border-radius: 2px; display: inline-block;"></span> 100% Complete
              <span style="width: 10px; height: 10px; background: #D97706; border-radius: 2px; display: inline-block; margin-left: 0.35rem;"></span> 75% Partial
              <span style="width: 10px; height: 10px; background: #DC2626; border-radius: 2px; display: inline-block; margin-left: 0.35rem;"></span> Missed
            </div>
            <button class="btn btn-sm btn-primary" onclick="window.app.handleDailyAdherenceCheckIn()" style="font-weight: 700; font-size: 0.78rem;">
              + Check-In Today
            </button>
          </div>
        </div>

        <!-- CALENDAR HEATMAP 30-DAY GRID -->
        <div style="margin-bottom: 1.5rem;">
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(34px, 1fr)); gap: 0.45rem;">
            ${calendarDays.map(day => {
              const bg = day.compliance_pct === 100 ? '#2E7D32' : (day.compliance_pct >= 70 ? '#D97706' : '#DC2626');
              const isToday = day.day_number === new Date().getDate();
              return `
                <div class="adherence-day-pill" title="${day.date} (${day.day_name}): ${day.compliance_pct}% Adherence" style="background: #FAF9F6; border: 1px solid ${isToday ? 'var(--gold-primary)' : 'var(--border-light)'}; border-radius: 6px; padding: 0.35rem 0.2rem; text-align: center; cursor: pointer; transition: var(--transition); position: relative;" onclick="alert('Adherence details for ${day.date}: ${day.compliance_pct}% completed. AM: ${day.morning_pct}%, PM: ${day.evening_pct}%')">
                  <div style="font-size: 0.65rem; color: var(--text-muted); font-weight: 600;">${day.day_name}</div>
                  <div style="font-size: 0.8rem; font-weight: 800; color: var(--text-primary); margin: 0.1rem 0;">${day.day_number}</div>
                  <div style="width: 8px; height: 8px; border-radius: 50%; background: ${bg}; margin: 0 auto; box-shadow: 0 0 4px ${bg};"></div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- ADHERENCE METRICS SPLIT: AM VS PM FIDELITY -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
          <div style="padding: 1.1rem; background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
              <strong style="font-size: 0.88rem; color: var(--text-primary);">🌅 Morning (AM) Regimen Fidelity</strong>
              <span style="font-size: 0.85rem; font-weight: 800; color: var(--accent-emerald);">98.0%</span>
            </div>
            <div style="height: 6px; background: rgba(0,0,0,0.08); border-radius: 4px; overflow: hidden; margin-bottom: 0.5rem;">
              <div style="width: 98%; height: 100%; background: var(--accent-emerald); border-radius: 4px;"></div>
            </div>
            <p style="font-size: 0.78rem; color: var(--text-muted); margin: 0;">Sun Protection SPF 50+ applied 29 of 30 days without interruption.</p>
          </div>

          <div style="padding: 1.1rem; background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
              <strong style="font-size: 0.88rem; color: var(--text-primary);">🌙 Evening (PM) Regimen Fidelity</strong>
              <span style="font-size: 0.85rem; font-weight: 800; color: var(--gold-primary);">89.5%</span>
            </div>
            <div style="height: 6px; background: rgba(0,0,0,0.08); border-radius: 4px; overflow: hidden; margin-bottom: 0.5rem;">
              <div style="width: 89.5%; height: 100%; background: var(--gold-primary); border-radius: 4px;"></div>
            </div>
            <p style="font-size: 0.78rem; color: var(--text-muted); margin: 0;">Nightly Ceramide moisture barrier sealing completed 27 of 30 days.</p>
          </div>
        </div>

        <!-- Adherence Insights Row -->
        <div style="margin-top: 1rem; padding: 0.85rem 1.1rem; background: rgba(46, 125, 50, 0.06); border: 1px solid rgba(46,125,50,0.2); border-radius: var(--radius-sm);">
          <div style="font-size: 0.78rem; font-weight: 800; color: #1E6B23; margin-bottom: 0.35rem; text-transform: uppercase;">
            📊 Correlation Discovery (r = +0.89 Strong Positive):
          </div>
          <p style="font-size: 0.82rem; color: var(--text-primary); margin: 0;">
            Users maintaining an adherence rate &ge; 90% achieved an average score gain of <strong>+10.9 pts</strong> in 30 days, compared to +3.1 pts in the control group.
          </p>
        </div>
      </section>

      <!-- SECTION 4: CLINICAL IMPROVEMENT ANALYSIS & AI DERMATOLOGIST REPORT -->
      <section class="glass-card section-margin" style="background: #FFFFFF; padding: 1.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-light); margin-bottom: 2rem;">
        <div class="card-header" style="border-bottom: 1px solid var(--border-light); padding-bottom: 0.85rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.2rem;">🔬</span>
              <h2 style="font-family: 'Playfair Display', serif; font-size: 1.35rem; margin: 0;">Dermatological Improvement Analysis & Next-Phase Protocol</h2>
            </div>
            <p class="text-muted" style="font-size: 0.82rem; margin-top: 0.15rem;">
              Comprehensive diagnostic synthesis of physiological progress and protocol adaptations
            </p>
          </div>

          <button class="btn btn-sm btn-outline" onclick="window.app.exportClinicalProgressReport()" style="font-size: 0.78rem;">
            🖨️ Print Full Clinical Summary
          </button>
        </div>

        <!-- 4 TOP IMPROVING FACTORS -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
          ${report.top_improving_factors.map(f => `
            <div style="padding: 1.1rem; background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm); border-top: 3px solid var(--accent-emerald);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                <span style="font-size: 0.7rem; font-weight: 800; color: var(--accent-emerald); text-transform: uppercase;">${f.category}</span>
                <span class="badge badge-success" style="font-size: 0.72rem;">${f.direction === 'down' ? `-${f.improvement_pct}% Reduction` : `+${f.improvement_pct}% Increase`}</span>
              </div>
              <h4 style="font-family: 'Playfair Display', serif; font-size: 1rem; margin: 0 0 0.35rem 0;">${f.metric}</h4>
              <p style="font-size: 0.8rem; color: var(--text-muted); margin: 0; line-height: 1.4;">${f.clinical_explanation}</p>
            </div>
          `).join('')}
        </div>

        <!-- OFFICIAL AI DERMATOLOGIST PROTOCOL ADVICE -->
        <div style="background: linear-gradient(135deg, #FAF8F5 0%, #F5EFE4 100%); border: 1px solid var(--border-gold); border-radius: var(--radius-sm); padding: 1.25rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.65rem;">
            <div style="width: 38px; height: 38px; border-radius: 50%; background: #181614; color: var(--gold-primary); display: flex; align-items: center; justify-content: center; font-size: 1.1rem; border: 1px solid var(--border-gold);">
              🩺
            </div>
            <div>
              <strong style="font-family: 'Playfair Display', serif; font-size: 1.05rem; color: var(--text-primary);">Dr. Rajni Verma, Board-Certified Dermatologist</strong>
              <div style="font-size: 0.74rem; color: var(--text-muted);">Lead Clinical Diagnostics Specialist</div>
            </div>
          </div>

          <p style="font-size: 0.85rem; color: var(--text-primary); line-height: 1.5; margin-bottom: 0.85rem;">
            "${report.ai_dermatologist_verdict}"
          </p>

          <div>
            <strong style="font-size: 0.78rem; text-transform: uppercase; color: #8A6400; font-weight: 800;">Prescribed Next-Phase Routine Updates:</strong>
            <ul style="margin: 0.35rem 0 0 0; padding-left: 1.2rem; font-size: 0.82rem; color: var(--text-secondary); line-height: 1.45;">
              ${report.next_stage_routine_adjustments.map(adj => `<li style="margin-bottom: 0.25rem;">${adj}</li>`).join('')}
            </ul>
          </div>
        </div>

      </section>

    </div>
  `;
}

/**
 * RENDER CLINICAL CONSULTATIONS & APPOINTMENTS HUB
 * Role-aware dispatch for User, Consultant, Dermatologist, and Admin
 */
export function renderConsultationsPage(consultData = null, prefsData = null, specialistsList = null, roleOverride = null) {
  const currentRole = roleOverride || (auth ? auth.getCurrentRole() : 'user') || 'user';

  if (currentRole === 'consultant') {
    return renderConsultantAppointmentsPage(consultData);
  } else if (currentRole === 'dermatologist') {
    return renderDermatologistAppointmentsPage(consultData);
  } else if (currentRole === 'admin') {
    return renderAdminAppointmentsPage(consultData);
  } else {
    return renderUserAppointmentsPage(consultData, prefsData, specialistsList);
  }
}

/**
 * ════════════════════════════════════════════════════════════════
 * 1. USER / PATIENT APPOINTMENTS & CARE PLAN WORKSPACE
 * ════════════════════════════════════════════════════════════════
 */
export function renderUserAppointmentsPage(consultData = null, prefsData = null, specialistsList = null) {
  const userAppointments = MOCK_USER_APPOINTMENTS;
  const consult = consultData?.consultation || userAppointments.active_care;
  const upcomingList = consultData?.appointments || userAppointments.upcoming;
  const pastList = userAppointments.past_history;
  const prefs = prefsData || userAppointments.sharing_preferences;
  const specialists = specialistsList || userAppointments.specialists_directory;

  const cPref = prefs.consultant || {};
  const dPref = prefs.doctor || {};

  return `
    <div class="container" style="padding-top: 2rem; padding-bottom: 4rem;">
      <!-- PAGE HEADER -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border-light); padding-bottom: 1.5rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.4rem;">
            <div class="section-tag-pill" style="margin: 0;">• TELEHEALTH & SPECIALIST CARE PORTAL</div>
            <span class="badge badge-accent" style="font-size: 0.75rem;">🛡️ HIPAA/GDPR Sovereign Data Consent Active</span>
          </div>
          <h1 style="font-family: 'Playfair Display', serif; font-size: 2.2rem; margin: 0 0 0.5rem 0; color: var(--text-primary);">
            My Telehealth Appointments & Care Plan
          </h1>
          <p class="text-muted" style="margin: 0; font-size: 0.95rem; max-width: 750px;">
            Manage your upcoming virtual dermatology consultations, review active digital prescriptions, book specialized care sessions, and configure HIPAA sovereign data-sharing permissions.
          </p>
        </div>

        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <button class="btn btn-outline" onclick="window.app.navigateToView('dashboard')" style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700;">
            ← Back to Dashboard
          </button>
          <button class="btn btn-primary" onclick="window.app.openBookingModal(3, 'Dr. Rajni Verma, MD', 'dermatologist')" style="font-weight: 700; background: var(--gold-primary); color: #111;">
            + Book Specialist Consultation
          </button>
        </div>
      </div>

      <!-- SECTION 1: UPCOMING SCHEDULED TELEHEALTH SESSIONS -->
      <section class="glass-card section-margin" style="background: #FFFFFF; padding: 2rem; border-radius: var(--radius-md); border: 1px solid var(--border-light); margin-bottom: 2.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.3rem;">📹</span>
              <h2 style="font-family: 'Playfair Display', serif; font-size: 1.4rem; margin: 0;">Upcoming Telehealth Consultations</h2>
            </div>
            <p class="text-muted" style="font-size: 0.85rem; margin: 0.2rem 0 0 0;">Interactive video sessions with your assigned clinical specialists.</p>
          </div>
          <span class="badge badge-success" style="font-size: 0.82rem; padding: 0.4rem 0.9rem;">
            🟢 ${upcomingList.length} Active Consultations Booked
          </span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          ${upcomingList.map(app => `
            <div style="background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 1.5rem; border-left: 5px solid ${app.specialist_role === 'dermatologist' ? '#2E7D32' : 'var(--gold-primary)'}; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <img src="${app.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150'}" alt="${app.specialist_name}" style="width: 58px; height: 58px; border-radius: 50%; object-fit: cover; border: 2px solid ${app.specialist_role === 'dermatologist' ? '#2E7D32' : 'var(--gold-primary)'};">
                  <div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                      <h3 style="font-family: 'Playfair Display', serif; font-size: 1.2rem; margin: 0; color: var(--text-primary);">${app.type || 'Virtual Clinical Consultation'}</h3>
                      <span class="badge ${app.status === 'confirmed' ? 'badge-success' : 'badge-warning'}" style="font-size: 0.72rem;">
                        ${app.status === 'confirmed' ? 'Confirmed & Video Ready' : 'Pending Confirmation'}
                      </span>
                      ${app.time_countdown ? `<span class="badge badge-accent" style="font-size: 0.72rem;">⏰ ${app.time_countdown}</span>` : ''}
                    </div>
                    <div style="font-size: 0.86rem; color: var(--text-secondary); margin-top: 0.2rem;">
                      with <strong>${app.specialist_name}</strong> • <span style="color: ${app.specialist_role === 'dermatologist' ? '#2E7D32' : 'var(--gold-primary)'}; font-weight: 700;">${app.specialist_title || (app.specialist_role === 'dermatologist' ? 'Board-Certified Dermatologist' : 'Lead Clinical Esthetician')}</span>
                    </div>
                  </div>
                </div>

                <div style="text-align: right;">
                  <div style="font-size: 1.05rem; font-weight: 800; color: var(--text-primary); font-family: monospace;">
                    📅 ${typeof app.scheduled_date === 'string' && app.scheduled_date.includes('T') ? new Date(app.scheduled_date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' }) : (app.scheduled_date || 'Scheduled')}
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">Encrypted WebRTC Video Room</div>
                </div>
              </div>

              ${app.session_focus ? `
                <div style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: 6px; padding: 0.85rem 1rem; margin-bottom: 1.25rem; font-size: 0.85rem; color: var(--text-secondary);">
                  <strong style="color: var(--text-primary); display: block; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 0.2rem;">Session Focus & Directives:</strong>
                  ${app.session_focus}
                </div>
              ` : ''}

              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; border-top: 1px solid var(--border-light); padding-top: 1rem;">
                <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
                  <button class="btn btn-sm btn-outline" onclick="alert('Appointment synchronized with your calendar (.ics event downloaded)!')" style="font-size: 0.78rem; padding: 0.4rem 0.9rem;">
                    📅 Add to Calendar
                  </button>
                  <button class="btn btn-sm btn-outline" onclick="window.app.openRescheduleModal(${app.id}, '${app.specialist_name}', '${app.scheduled_date}')" style="font-size: 0.78rem; padding: 0.4rem 0.9rem;">
                    🔄 Reschedule
                  </button>
                  <button class="btn btn-sm btn-outline" onclick="window.app.openDirectSpecialistChat('${app.specialist_role === 'dermatologist' ? 'doctor' : 'consultant'}')" style="font-size: 0.78rem; padding: 0.4rem 0.9rem;">
                    💬 Message Clinician
                  </button>
                </div>

                <button class="btn btn-primary" onclick="window.app.openTelehealthVideoModal(${app.id}, 'user', '${app.type || 'Virtual Consultation'}', '${app.specialist_name}')" style="font-weight: 700; padding: 0.55rem 1.4rem; background: ${app.specialist_role === 'dermatologist' ? '#2E7D32' : 'var(--gold-primary)'}; color: ${app.specialist_role === 'dermatologist' ? '#FFFFFF' : '#111'}; border-color: ${app.specialist_role === 'dermatologist' ? '#2E7D32' : 'var(--gold-primary)'};">
                  📹 Join Virtual Consultation Room →
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- SECTION 2: ACTIVE CLINICAL CARE & DIGITAL RX -->
      <section class="glass-card section-margin" style="background: #FFFFFF; padding: 2rem; border-radius: var(--radius-md); border: 1px solid var(--border-light); margin-bottom: 2.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2 style="font-family: 'Playfair Display', serif; font-size: 1.4rem; margin: 0 0 0.25rem 0;">Active Clinical Protocol & Digital Rx</h2>
            <p class="text-muted" style="font-size: 0.85rem; margin: 0;">Synchronized directives and prescriptions directly issued by your care team.</p>
          </div>
          <span class="badge badge-success" style="font-size: 0.82rem; padding: 0.4rem 0.9rem;">
            🟢 ${consult.status || 'Under Active Regimen'}
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
          <!-- Consultant Advice Card -->
          <div style="background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 1.4rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
              <img src="${consult.assigned_consultant?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'}" alt="Ananya Iyer" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid var(--gold-primary);">
              <div>
                <strong style="font-size: 0.95rem; color: var(--text-primary); display: block;">Ananya Iyer, LE</strong>
                <span style="font-size: 0.74rem; color: var(--gold-primary); font-weight: 700; text-transform: uppercase;">Lead Clinical Esthetician</span>
              </div>
            </div>
            <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.5rem; font-weight: 700;">REGIMEN RECOMMENDATION & NOTES:</div>
            <p style="font-size: 0.86rem; color: var(--text-secondary); line-height: 1.5; margin: 0 0 1rem 0; background: #FFFFFF; padding: 0.9rem; border-radius: 6px; border: 1px solid var(--border-light);">
              "${consult.consultant_notes || consult.assigned_consultant?.notes || 'Hydration and barrier integrity significantly improved. Maintain ceramide barrier seal.'}"
            </p>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; color: var(--text-muted);">
              <span>Last Review: <strong>${consult.last_visit || '24 Nov 2025'}</strong></span>
              <button class="btn btn-sm btn-outline" style="font-size: 0.75rem; padding: 0.25rem 0.65rem;" onclick="window.app.openDirectSpecialistChat('consultant')">💬 Message</button>
            </div>
          </div>

          <!-- Doctor Medical Rx Card -->
          <div style="background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 1.4rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
              <img src="${consult.assigned_doctor?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100'}" alt="Dr. Rajni Verma" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid #2E7D32;">
              <div>
                <strong style="font-size: 0.95rem; color: var(--text-primary); display: block;">Dr. Rajni Verma, MD</strong>
                <span style="font-size: 0.74rem; color: #2E7D32; font-weight: 700; text-transform: uppercase;">Board-Certified Dermatologist</span>
              </div>
            </div>
            <div style="font-size: 0.82rem; color: #2E7D32; margin-bottom: 0.5rem; font-weight: 800;">🩺 ACTIVE DIGITAL PRESCRIPTION (Rx):</div>
            <div style="background: #FFFFFF; padding: 0.9rem; border-radius: 6px; border: 1px solid rgba(46,125,50,0.3); margin-bottom: 0.85rem;">
              <div style="font-weight: 800; font-size: 0.92rem; color: #1E6B23; margin-bottom: 0.25rem;">${consult.prescription || 'Topical Adapalene 0.1% + Azelaic Acid 15%'}</div>
              <div style="font-size: 0.8rem; color: var(--text-secondary);">${consult.clinical_notes || consult.assigned_doctor?.clinical_notes || 'Follicular retention hyperkeratosis clearing satisfactorily.'}</div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; color: var(--text-muted);">
              <span>Next Check: <strong>${consult.next_review || '24 Dec 2025'}</strong></span>
              <button class="btn btn-sm btn-primary" style="background: #2E7D32; border-color: #2E7D32; font-size: 0.75rem; padding: 0.25rem 0.65rem;" onclick="alert('Certified Digital Prescription #RX-84920-ADAP. Certified for pharmacy dispense by Dr. Rajni Verma, MD.')">📄 View Rx</button>
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION 3: GRANULAR DATA SHARING & PRIVACY MATRIX -->
      <section class="glass-card section-margin" style="background: #FFFFFF; padding: 2rem; border-radius: var(--radius-md); border: 1px solid var(--border-light); margin-bottom: 2.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--border-light); padding-bottom: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.3rem;">🔒</span>
              <h2 style="font-family: 'Playfair Display', serif; font-size: 1.4rem; margin: 0;">Granular Data Sharing & Privacy Matrix</h2>
            </div>
            <p class="text-muted" style="font-size: 0.85rem; margin: 0.25rem 0 0 0;">
              You maintain sovereign ownership of your biometric records. Toggle below what data categories each clinician is authorized to inspect.
            </p>
          </div>
          <button type="button" class="btn btn-primary" onclick="window.app.handleSaveSharingPreferences(event)" style="font-weight: 700; padding: 0.6rem 1.4rem; background: #181614; color: #FFFFFF; border-color: #181614;">
            💾 Save Sharing Permissions
          </button>
        </div>

        <form id="sharing-preferences-form" onsubmit="window.app.handleSaveSharingPreferences(event)">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.75rem; margin-bottom: 1.5rem;">
            
            <!-- CONSULTANT PERMISSION CARD -->
            <div style="background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 1.5rem; border-top: 4px solid var(--gold-primary);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
                <div>
                  <h3 style="font-family: 'Playfair Display', serif; font-size: 1.15rem; margin: 0 0 0.15rem 0;">Consultant Permissions</h3>
                  <span style="font-size: 0.75rem; color: var(--gold-primary); font-weight: 700;">Ananya Iyer, LE (Esthetician)</span>
                </div>
                <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer; font-size: 0.78rem; font-weight: 700;">
                  <input type="checkbox" id="pref-consultant-shared" ${cPref.shared !== false ? 'checked' : ''} style="width: 16px; height: 16px;">
                  <span>Allow Access</span>
                </label>
              </div>

              <div style="display: flex; flex-direction: column; gap: 0.85rem;">
                <label style="display: flex; justify-content: space-between; align-items: center; background: #FFFFFF; padding: 0.75rem 1rem; border-radius: 6px; border: 1px solid var(--border-light); cursor: pointer;">
                  <div>
                    <strong style="font-size: 0.84rem; display: block; color: var(--text-primary);">🔬 8 Cutaneous Biomarkers</strong>
                    <span style="font-size: 0.74rem; color: var(--text-muted);">Hydration, Sebum, Barrier Strength & Reactivity</span>
                  </div>
                  <input type="checkbox" id="pref-consultant-biomarkers" ${cPref.biomarkers !== false ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--gold-primary);">
                </label>

                <label style="display: flex; justify-content: space-between; align-items: center; background: #FFFFFF; padding: 0.75rem 1rem; border-radius: 6px; border: 1px solid var(--border-light); cursor: pointer;">
                  <div>
                    <strong style="font-size: 0.84rem; display: block; color: var(--text-primary);">📸 Facial Photos & Lesion Scans</strong>
                    <span style="font-size: 0.74rem; color: var(--text-muted);">Webcam optical scans and comparison imagery</span>
                  </div>
                  <input type="checkbox" id="pref-consultant-photos" ${cPref.photos_and_lesions !== false ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--gold-primary);">
                </label>

                <label style="display: flex; justify-content: space-between; align-items: center; background: #FFFFFF; padding: 0.75rem 1rem; border-radius: 6px; border: 1px solid var(--border-light); cursor: pointer;">
                  <div>
                    <strong style="font-size: 0.84rem; display: block; color: var(--text-primary);">📅 Routine Adherence & Compliance</strong>
                    <span style="font-size: 0.74rem; color: var(--text-muted);">30-day streak logs and AM/PM habit adherence</span>
                  </div>
                  <input type="checkbox" id="pref-consultant-adherence" ${cPref.adherence_and_compliance !== false ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--gold-primary);">
                </label>

                <label style="display: flex; justify-content: space-between; align-items: center; background: #FFFFFF; padding: 0.75rem 1rem; border-radius: 6px; border: 1px solid var(--border-light); cursor: pointer;">
                  <div>
                    <strong style="font-size: 0.84rem; display: block; color: var(--text-primary);">💊 Medical Prescriptions (Rx) History</strong>
                    <span style="font-size: 0.74rem; color: var(--text-muted);">Confidential physician-only medical treatments</span>
                  </div>
                  <input type="checkbox" id="pref-consultant-rx" ${cPref.medical_and_rx_history ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--gold-primary);">
                </label>

                <label style="display: flex; justify-content: space-between; align-items: center; background: #FFFFFF; padding: 0.75rem 1rem; border-radius: 6px; border: 1px solid var(--border-light); cursor: pointer;">
                  <div>
                    <strong style="font-size: 0.84rem; display: block; color: var(--text-primary);">🌿 Lifestyle & Climate Intake</strong>
                    <span style="font-size: 0.74rem; color: var(--text-muted);">Diet, sleep, UV index and environmental exposure</span>
                  </div>
                  <input type="checkbox" id="pref-consultant-lifestyle" ${cPref.lifestyle_logs !== false ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--gold-primary);">
                </label>
              </div>
            </div>

            <!-- DERMATOLOGIST PERMISSION CARD -->
            <div style="background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 1.5rem; border-top: 4px solid #2E7D32;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
                <div>
                  <h3 style="font-family: 'Playfair Display', serif; font-size: 1.15rem; margin: 0 0 0.15rem 0;">Dermatologist Permissions</h3>
                  <span style="font-size: 0.75rem; color: #2E7D32; font-weight: 700;">Dr. Rajni Verma, MD (Clinical Director)</span>
                </div>
                <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer; font-size: 0.78rem; font-weight: 700;">
                  <input type="checkbox" id="pref-doctor-shared" ${dPref.shared !== false ? 'checked' : ''} style="width: 16px; height: 16px;">
                  <span>Allow Access</span>
                </label>
              </div>

              <div style="display: flex; flex-direction: column; gap: 0.85rem;">
                <label style="display: flex; justify-content: space-between; align-items: center; background: #FFFFFF; padding: 0.75rem 1rem; border-radius: 6px; border: 1px solid var(--border-light); cursor: pointer;">
                  <div>
                    <strong style="font-size: 0.84rem; display: block; color: var(--text-primary);">🔬 8 Cutaneous Biomarkers</strong>
                    <span style="font-size: 0.74rem; color: var(--text-muted);">Hydration, Sebum, Barrier Strength & Reactivity</span>
                  </div>
                  <input type="checkbox" id="pref-doctor-biomarkers" ${dPref.biomarkers !== false ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: #2E7D32;">
                </label>

                <label style="display: flex; justify-content: space-between; align-items: center; background: #FFFFFF; padding: 0.75rem 1rem; border-radius: 6px; border: 1px solid var(--border-light); cursor: pointer;">
                  <div>
                    <strong style="font-size: 0.84rem; display: block; color: var(--text-primary);">📸 Facial Photos & Lesion Screening</strong>
                    <span style="font-size: 0.74rem; color: var(--text-muted);">Optical scans and CNN lesion malignancy classifier</span>
                  </div>
                  <input type="checkbox" id="pref-doctor-photos" ${dPref.photos_and_lesions !== false ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: #2E7D32;">
                </label>

                <label style="display: flex; justify-content: space-between; align-items: center; background: #FFFFFF; padding: 0.75rem 1rem; border-radius: 6px; border: 1px solid var(--border-light); cursor: pointer;">
                  <div>
                    <strong style="font-size: 0.84rem; display: block; color: var(--text-primary);">📅 Routine Adherence & Compliance</strong>
                    <span style="font-size: 0.74rem; color: var(--text-muted);">30-day streak logs and treatment consistency</span>
                  </div>
                  <input type="checkbox" id="pref-doctor-adherence" ${dPref.adherence_and_compliance !== false ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: #2E7D32;">
                </label>

                <label style="display: flex; justify-content: space-between; align-items: center; background: #FFFFFF; padding: 0.75rem 1rem; border-radius: 6px; border: 1px solid var(--border-light); cursor: pointer;">
                  <div>
                    <strong style="font-size: 0.84rem; display: block; color: var(--text-primary);">💊 Full Medical History & Active Prescriptions (Rx)</strong>
                    <span style="font-size: 0.74rem; color: var(--text-muted);">Required for medical prescriptions & refills</span>
                  </div>
                  <input type="checkbox" id="pref-doctor-rx" ${dPref.medical_and_rx_history !== false ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: #2E7D32;">
                </label>

                <label style="display: flex; justify-content: space-between; align-items: center; background: #FFFFFF; padding: 0.75rem 1rem; border-radius: 6px; border: 1px solid var(--border-light); cursor: pointer;">
                  <div>
                    <strong style="font-size: 0.84rem; display: block; color: var(--text-primary);">🌿 Lifestyle & Environmental Triggers</strong>
                    <span style="font-size: 0.74rem; color: var(--text-muted);">Allergies, comedogenic sensitivities & stressors</span>
                  </div>
                  <input type="checkbox" id="pref-doctor-lifestyle" ${dPref.lifestyle_logs !== false ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: #2E7D32;">
                </label>
              </div>
            </div>

          </div>

          <div id="sharing-pref-alert" class="login-alert-box alert-success hidden" style="margin-bottom: 1rem;"></div>

          <div style="display: flex; justify-content: flex-end;">
            <button type="submit" class="btn btn-primary" style="font-weight: 700; padding: 0.7rem 1.8rem;">
              Save & Synchronize Permissions →
            </button>
          </div>
        </form>
      </section>

      <!-- SECTION 4: SPECIALIST DIRECTORY & INSTANT BOOKING -->
      <section class="glass-card section-margin" style="background: #FFFFFF; padding: 2rem; border-radius: var(--radius-md); border: 1px solid var(--border-light); margin-bottom: 2.5rem;">
        <div style="border-bottom: 1px solid var(--border-light); padding-bottom: 1rem; margin-bottom: 1.5rem;">
          <div class="section-tag-pill" style="margin-bottom: 0.4rem;">• CLINICIAN DIRECTORY</div>
          <h2 style="font-family: 'Playfair Display', serif; font-size: 1.4rem; margin: 0 0 0.25rem 0;">PanaceaAI Board of Specialists</h2>
          <p class="text-muted" style="font-size: 0.85rem; margin: 0;">Select a specialist to book a new virtual consultation, prescription review, or regimen optimization.</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
          ${specialists.map(sp => `
            <div style="background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 1.4rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; align-items: center; gap: 0.85rem; margin-bottom: 0.85rem;">
                  <img src="${sp.avatar}" alt="${sp.name}" style="width: 54px; height: 54px; border-radius: 50%; object-fit: cover; border: 2px solid ${sp.badge_color || 'var(--gold-primary)'};">
                  <div>
                    <h4 style="font-family: 'Playfair Display', serif; font-size: 1.05rem; margin: 0;">${sp.name}</h4>
                    <span style="font-size: 0.72rem; color: ${sp.badge_color || 'var(--gold-primary)'}; font-weight: 800; text-transform: uppercase;">${sp.title}</span>
                  </div>
                </div>
                <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.6rem;">${sp.credentials}</div>
                <div style="display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 1rem;">
                  ${(sp.focus_areas || []).map(f => `<span class="badge" style="font-size: 0.68rem; background: #FFFFFF; border: 1px solid var(--border-light);">${f}</span>`).join('')}
                </div>
              </div>
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; font-size: 0.85rem;">
                  <strong>${sp.rate}</strong>
                  <span style="color: var(--gold-primary); font-weight: 700;">★ ${sp.rating}</span>
                </div>
                <button class="btn btn-sm btn-primary" onclick="window.app.openBookingModal(${sp.id}, '${sp.name}', '${sp.role}')" style="font-weight: 700; width: 100%; background: ${sp.role === 'dermatologist' ? '#2E7D32' : 'var(--gold-primary)'}; border-color: ${sp.role === 'dermatologist' ? '#2E7D32' : 'var(--gold-primary)'}; color: ${sp.role === 'dermatologist' ? '#FFF' : '#111'};">
                  Book Consultation Slot →
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- SECTION 5: PAST CONSULTATION HISTORY -->
      <section class="glass-card section-margin" style="background: #FFFFFF; padding: 2rem; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
        <div style="border-bottom: 1px solid var(--border-light); padding-bottom: 1rem; margin-bottom: 1.5rem;">
          <h3 style="font-family: 'Playfair Display', serif; font-size: 1.3rem; margin: 0 0 0.25rem 0;">Past Consultation Records & Visit Summaries</h3>
          <p class="text-muted" style="font-size: 0.85rem; margin: 0;">Permanent clinical encounter logs and treatment summaries for your medical records.</p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${pastList.map(item => `
            <div style="background: #FAF9F6; border: 1px solid var(--border-light); border-radius: 6px; padding: 1.1rem 1.4rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
              <div>
                <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.25rem;">
                  <strong style="font-size: 0.95rem; color: var(--text-primary);">${item.type}</strong>
                  <span class="badge badge-success" style="font-size: 0.72rem;">Completed</span>
                  <span style="font-size: 0.78rem; color: var(--text-muted);">• ${item.date}</span>
                </div>
                <div style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 0.2rem;">
                  Clinician: <strong>${item.specialist_name}</strong> (${item.specialist_role === 'dermatologist' ? 'Board-Certified Dermatologist' : 'Lead Esthetician'})
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">Outcome: ${item.outcome_summary}</div>
              </div>
              <button class="btn btn-sm btn-outline" onclick="alert('Clinical visit summary downloaded for encounter dated ${item.date}.')" style="font-size: 0.78rem; font-weight: 700;">
                📄 Download Summary PDF
              </button>
            </div>
          `).join('')}
        </div>
      </section>
    </div>
  `;
}

/**
 * ════════════════════════════════════════════════════════════════
 * 2. CONSULTANT / ESTHETICIAN APPOINTMENTS WORKSPACE
 * ════════════════════════════════════════════════════════════════
 */
export function renderConsultantAppointmentsPage(consultData = null) {
  const consultantData = MOCK_CONSULTANT_APPOINTMENTS;
  const queue = consultantData.today_queue;
  const requests = consultantData.incoming_requests;
  const schedule = consultantData.availability_schedule;
  const history = consultantData.completed_history;
  const info = consultantData.consultant_info;

  return `
    <div class="dashboard-wrapper">
      <!-- HEADER BANNER -->
      <div class="dashboard-header" style="background: linear-gradient(135deg, #1C1A18 0%, #2D2723 100%); color: #FFFFFF; border-radius: var(--radius-md); padding: 2rem 2.5rem; margin-bottom: 2rem; border: 1px solid rgba(197, 155, 39, 0.3);">
        <div>
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
            <span class="badge badge-warning" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; padding: 0.3rem 0.8rem;">Esthetician Telehealth Workspace</span>
            <span style="font-size: 0.85rem; color: #EAE6DF;">• ${info.name}</span>
          </div>
          <h2 style="color: #FFFFFF; font-family: 'Playfair Display', serif; font-size: 1.85rem; margin: 0 0 0.35rem;">Consultant Appointment Schedule & Regimen Review Queue</h2>
          <p style="color: #D1CBC4; font-size: 0.9rem; margin: 0;">Manage live client video consultations, review incoming routine optimization requests, maintain esthetician clinic hours, and prepare tailored formulation adjustments.</p>
        </div>
        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <button class="btn btn-outline" onclick="window.app.navigateToView('dashboard')" style="color: #FFFFFF; border-color: rgba(255,255,255,0.3); font-weight: 700;">
            ← Back to Workspace
          </button>
          <button class="btn btn-primary" onclick="alert('Opening client follow-up scheduling scheduler...')" style="font-weight: 700;">
            + Propose Client Slot
          </button>
        </div>
      </div>

      <!-- METRICS ROW -->
      <div class="metrics-row" style="margin-bottom: 2rem;">
        <div class="metric-card">
          <div class="metric-value" style="color: var(--gold-primary);">${info.today_sessions_count}</div>
          <div class="metric-label">Today's Video Sessions</div>
        </div>
        <div class="metric-card">
          <div class="metric-value" style="color: var(--accent-amber);">${info.pending_requests_count}</div>
          <div class="metric-label">Pending Inflow Requests</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${info.total_hours_this_week}</div>
          <div class="metric-label">Telehealth Hours (This Week)</div>
        </div>
        <div class="metric-card">
          <div class="metric-value" style="color: var(--accent-emerald);">${info.followups_due}</div>
          <div class="metric-label">14-Day Follow-ups Due</div>
        </div>
      </div>

      <!-- SECTION 1: TODAY'S CLIENT CONSULTATION QUEUE -->
      <section class="glass-card section-margin" style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.75rem; margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.3rem;">📹</span>
              <h3 style="font-family: 'Playfair Display', serif; font-size: 1.35rem; margin: 0;">Today's Client Telehealth Schedule</h3>
            </div>
            <p class="text-muted" style="font-size: 0.85rem; margin: 0.2rem 0 0 0;">Interactive video sessions scheduled for personalized formulation reviews.</p>
          </div>
          <span class="badge badge-success" style="font-size: 0.78rem;">🟢 Esthetician Clinic Active</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          ${queue.map(item => `
            <div style="background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 1.5rem; border-left: 5px solid var(--gold-primary); box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <img src="${item.avatar}" alt="${item.patient_name}" style="width: 54px; height: 54px; border-radius: 50%; object-fit: cover; border: 2px solid var(--gold-primary);">
                  <div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                      <strong style="font-size: 1.1rem; color: var(--text-primary);">${item.patient_name}</strong>
                      <span class="badge badge-user" style="font-size: 0.72rem;">Skin: ${item.skin_type}</span>
                      <span class="badge badge-accent" style="font-size: 0.72rem;">Score: ${item.overall_score} (${item.score_delta})</span>
                    </div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem;">
                      ${item.session_type} • <strong>Duration: ${item.duration}</strong>
                    </div>
                  </div>
                </div>

                <div style="text-align: right;">
                  <div style="font-size: 1rem; font-weight: 800; color: var(--gold-primary); font-family: monospace;">
                    ⏰ ${item.scheduled_time}
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">Encrypted Provider Room</div>
                </div>
              </div>

              <div style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: 6px; padding: 0.85rem 1rem; margin-bottom: 1.25rem; font-size: 0.85rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem; flex-wrap: wrap; gap: 0.5rem;">
                  <strong style="color: var(--text-primary);">🎯 Session Focus:</strong>
                  <span style="font-size: 0.75rem; color: var(--accent-emerald); font-weight: 700;">
                    🛡️ Patient Consent: ${item.patient_consent?.photos ? 'Photos Allowed' : 'Photos Restricted'} • Biomarkers Allowed
                  </span>
                </div>
                <div style="color: var(--text-secondary);">${item.session_goal}</div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; border-top: 1px solid var(--border-light); padding-top: 1rem;">
                <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
                  <button class="btn btn-sm btn-outline" onclick="window.app.openClientDossierModal(${item.patient_id}, 'assessment')" style="font-size: 0.78rem; padding: 0.4rem 0.9rem;">
                    📋 Client Dossier
                  </button>
                  <button class="btn btn-sm btn-outline" onclick="window.app.openConsultantRegimenModal(${item.patient_id})" style="font-size: 0.78rem; padding: 0.4rem 0.9rem;">
                    ✨ Edit Regimen
                  </button>
                  <button class="btn btn-sm btn-outline" onclick="window.app.openDirectSpecialistChat('user_${item.patient_id}')" style="font-size: 0.78rem; padding: 0.4rem 0.9rem;">
                    💬 Client Chat
                  </button>
                  <button class="btn btn-sm btn-outline" onclick="window.app.openRescheduleModal(${item.id}, '${item.patient_name}', '${item.scheduled_time}')" style="font-size: 0.78rem; padding: 0.4rem 0.9rem;">
                    ⏱️ Reschedule
                  </button>
                </div>

                <button class="btn btn-primary" onclick="window.app.openTelehealthVideoModal(${item.id}, 'consultant', '${item.session_type}', '${item.patient_name}')" style="font-weight: 700; padding: 0.55rem 1.4rem; background: var(--gold-primary); color: #111;">
                  📹 Start Video Consultation →
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- SECTION 2: INCOMING APPOINTMENT & ROUTINE REQUESTS -->
      <section class="glass-card section-margin" style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.75rem; margin-bottom: 2rem;">
        <div style="border-bottom: 1px solid var(--border-light); padding-bottom: 1rem; margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.3rem;">📥</span>
            <h3 style="font-family: 'Playfair Display', serif; font-size: 1.35rem; margin: 0;">Incoming Consultation Booking Requests (${requests.length})</h3>
          </div>
          <p class="text-muted" style="font-size: 0.85rem; margin: 0.2rem 0 0 0;">New consultation requests submitted by clients requiring routine optimization.</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.5rem;">
          ${requests.map(req => `
            <div style="background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 1.4rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.85rem;">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <img src="${req.avatar}" alt="${req.patient_name}" style="width: 46px; height: 46px; border-radius: 50%; object-fit: cover;">
                    <div>
                      <strong style="font-size: 0.95rem; color: var(--text-primary);">${req.patient_name}</strong>
                      <span class="badge badge-user" style="font-size: 0.7rem; display: block; width: fit-content; margin-top: 0.15rem;">${req.skin_type}</span>
                    </div>
                  </div>
                  <span class="badge badge-warning" style="font-size: 0.72rem;">${req.created_at}</span>
                </div>
                <div style="font-size: 0.84rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.35rem;">${req.session_type}</div>
                <div style="font-size: 0.8rem; color: var(--gold-primary); font-weight: 600; margin-bottom: 0.6rem;">📅 Requested: ${req.requested_time}</div>
                <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.45; background: #FFFFFF; padding: 0.75rem; border-radius: 6px; border: 1px solid var(--border-light); margin: 0 0 1rem 0;">
                  "${req.reason}"
                </p>
              </div>

              <div style="display: flex; gap: 0.6rem;">
                <button class="btn btn-sm btn-primary" onclick="window.app.handleAcceptBookingRequest(${req.id})" style="flex: 1; font-weight: 700;">
                  ✅ Accept Slot
                </button>
                <button class="btn btn-sm btn-outline" onclick="window.app.openRescheduleModal(${req.id}, '${req.patient_name}', '${req.requested_time}')" style="flex: 1; font-weight: 700;">
                  🔄 Propose Alt Time
                </button>
                <button class="btn btn-sm btn-outline" onclick="window.app.handleDeclineBookingRequest(${req.id})" style="padding: 0.4rem 0.75rem; color: #EF4444;" title="Decline Request">
                  ✕
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- SECTION 3: WEEKLY AVAILABILITY & PRACTICE HOURS -->
      <section class="glass-card section-margin" style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.75rem; margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.3rem;">📅</span>
              <h3 style="font-family: 'Playfair Display', serif; font-size: 1.35rem; margin: 0;">Weekly Telehealth Availability & Hours</h3>
            </div>
            <p class="text-muted" style="font-size: 0.85rem; margin: 0.2rem 0 0 0;">Configured calendar slots open for patient telehealth bookings.</p>
          </div>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer; font-size: 0.82rem; font-weight: 700;">
              <input type="checkbox" checked onchange="window.app.toggleConsultantAvailability(this.checked)" style="width: 16px; height: 16px; accent-color: var(--gold-primary);">
              <span>🟢 Accepting Client Bookings</span>
            </label>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
          ${schedule.days.map(d => `
            <div style="background: #FAF9F6; border: 1px solid var(--border-light); border-radius: 6px; padding: 1rem;">
              <strong style="font-size: 0.9rem; color: var(--text-primary); display: block; margin-bottom: 0.5rem;">${d.day}</strong>
              <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                ${d.slots.map(s => `
                  <span style="font-size: 0.75rem; background: #FFFFFF; border: 1px solid var(--border-light); padding: 0.3rem 0.6rem; border-radius: 4px; text-align: center; color: var(--text-secondary); font-weight: 600;">
                    ${s}
                  </span>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; color: var(--text-muted); background: #FAF9F6; padding: 0.85rem 1.25rem; border-radius: 6px;">
          <span>Standard Slot Duration: <strong>${schedule.slot_duration_min} min</strong> • Buffer: <strong>${schedule.buffer_min} min</strong></span>
          <button class="btn btn-sm btn-outline" onclick="alert('Availability settings saved.')" style="font-size: 0.75rem;">⚙️ Configure Hours</button>
        </div>
      </section>

      <!-- SECTION 4: COMPLETED SESSIONS & FOLLOW-UP TRACKER -->
      <section class="glass-card section-margin" style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.75rem;">
        <div style="border-bottom: 1px solid var(--border-light); padding-bottom: 1rem; margin-bottom: 1.5rem;">
          <h3 style="font-family: 'Playfair Display', serif; font-size: 1.3rem; margin: 0 0 0.25rem 0;">Completed Consultations & 14-Day Regimen Follow-up</h3>
          <p class="text-muted" style="font-size: 0.85rem; margin: 0;">Monitor client routine compliance after formulation adjustments.</p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${history.map(item => `
            <div style="background: #FAF9F6; border: 1px solid var(--border-light); border-radius: 6px; padding: 1.1rem 1.4rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
              <div>
                <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.25rem;">
                  <strong style="font-size: 0.95rem; color: var(--text-primary);">${item.patient_name}</strong>
                  <span class="badge badge-success" style="font-size: 0.72rem;">Encounter Completed</span>
                  <span style="font-size: 0.78rem; color: var(--text-muted);">• ${item.date}</span>
                </div>
                <div style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 0.2rem;">
                  Session: <strong>${item.session_type}</strong> • Routine Change: <em>${item.routine_adjustment}</em>
                </div>
                <div style="font-size: 0.8rem; color: var(--accent-emerald); font-weight: 600;">Status: ${item.followup_status}</div>
              </div>
              <button class="btn btn-sm btn-outline" onclick="alert('14-Day Check-in note sent to ${item.patient_name} via Telehealth Chat.')" style="font-size: 0.78rem; font-weight: 700;">
                📩 Send 14-Day Check-in
              </button>
            </div>
          `).join('')}
        </div>
      </section>
    </div>
  `;
}

/**
 * ════════════════════════════════════════════════════════════════
 * 3. DOCTOR / DERMATOLOGIST APPOINTMENTS & TRIAGE WORKSPACE
 * ════════════════════════════════════════════════════════════════
 */
export function renderDermatologistAppointmentsPage(doctorData = null) {
  const dermData = MOCK_DERMATOLOGIST_APPOINTMENTS;
  const patients = dermData.patient_queue;
  const triageList = dermData.urgent_triage_inflow;
  const rxList = dermData.prescription_pad_authorizations;
  const info = dermData.doctor_info;

  return `
    <div class="dashboard-wrapper">
      <!-- HEADER BANNER -->
      <div class="dashboard-header" style="background: linear-gradient(135deg, #18231C 0%, #203527 100%); color: #FFFFFF; border-radius: var(--radius-md); padding: 2rem 2.5rem; margin-bottom: 2rem; border: 1px solid rgba(46, 125, 50, 0.35);">
        <div>
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
            <span class="badge badge-dermatologist" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; padding: 0.3rem 0.8rem; background: rgba(46, 125, 50, 0.3); border: 1px solid #4CAF50; color: #81C784;">Board-Certified Medical Access</span>
            <span style="font-size: 0.85rem; color: #EAE6DF;">• ${info.name} (${info.license})</span>
          </div>
          <h2 style="color: #FFFFFF; font-family: 'Playfair Display', serif; font-size: 1.85rem; margin: 0 0 0.35rem;">Physician Tele-Dermatology Clinic Schedule & Patient Triage</h2>
          <p style="color: #D1E7DD; font-size: 0.9rem; margin: 0;">Review scheduled clinical video visits, manage urgent triage referrals, inspect AI optical biomarker scans, and issue digital prescriptions during patient encounters.</p>
        </div>
        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <button class="btn btn-outline" onclick="window.app.navigateToView('dashboard')" style="color: #FFFFFF; border-color: rgba(255,255,255,0.3); font-weight: 700;">
            ← Back to Clinical Portal
          </button>
          <button class="btn btn-primary" onclick="window.app.openTelehealthVideoModal(401, 'dermatologist', 'Clinical Diagnostic Session', 'Rohan Verma')" style="background: #2E7D32; border-color: #2E7D32; font-weight: 700;">
            🩺 Launch Telehealth Call
          </button>
        </div>
      </div>

      <!-- CLINICAL KPIS -->
      <div class="metrics-row" style="margin-bottom: 2rem;">
        <div class="metric-card">
          <div class="metric-value" style="color: #2E7D32;">${info.today_consults_count}</div>
          <div class="metric-label">Scheduled Clinical Visits (Today)</div>
        </div>
        <div class="metric-card">
          <div class="metric-value" style="color: var(--accent-rose);">${info.urgent_triage_count}</div>
          <div class="metric-label">Urgent Triage Cases</div>
        </div>
        <div class="metric-card">
          <div class="metric-value" style="color: var(--accent-amber);">${info.pending_rx_count}</div>
          <div class="metric-label">Prescriptions Pending Signature</div>
        </div>
        <div class="metric-card">
          <div class="metric-value" style="color: var(--accent-emerald);">🟢 ONLINE</div>
          <div class="metric-label">Telehealth Clinic Status</div>
        </div>
      </div>

      <!-- SECTION 1: PATIENT CLINICAL TELEHEALTH QUEUE (TRIAGED) -->
      <section class="glass-card section-margin" style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.75rem; margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.3rem;">🩺</span>
              <h3 style="font-family: 'Playfair Display', serif; font-size: 1.35rem; margin: 0;">Tele-Dermatology Patient Consultation Roster</h3>
            </div>
            <p class="text-muted" style="font-size: 0.85rem; margin: 0.2rem 0 0 0;">Encrypted medical encounters triaged by diagnostic urgency.</p>
          </div>
          <span class="badge badge-success" style="font-size: 0.78rem;">PostgreSQL Clinical EHR Connected</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          ${patients.map(p => `
            <div style="background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 1.5rem; border-left: 5px solid ${p.triage_level.includes('Urgent') ? '#EF4444' : p.triage_level.includes('Medium') ? '#D97706' : '#2E7D32'}; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <img src="${p.avatar}" alt="${p.patient_name}" style="width: 54px; height: 54px; border-radius: 50%; object-fit: cover; border: 2px solid #2E7D32;">
                  <div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                      <strong style="font-size: 1.15rem; color: var(--text-primary);">${p.patient_name}</strong>
                      <span class="badge" style="font-size: 0.72rem; background: #FFFFFF; border: 1px solid var(--border-light);">${p.patient_age}</span>
                      <span class="badge ${p.triage_level.includes('Urgent') ? 'badge-warning' : 'badge-success'}" style="font-size: 0.72rem; ${p.triage_level.includes('Urgent') ? 'background: #FEE2E2; color: #DC2626; border-color: #F87171;' : ''}">
                        ${p.triage_badge}
                      </span>
                    </div>
                    <div style="font-size: 0.86rem; color: var(--text-secondary); margin-top: 0.2rem;">
                      Diagnosis: <strong style="color: #1E6B23;">${p.condition}</strong>
                    </div>
                  </div>
                </div>

                <div style="text-align: right;">
                  <div style="font-size: 1rem; font-weight: 800; color: #1E6B23; font-family: monospace;">
                    ⏰ ${p.scheduled_time}
                  </div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">${p.session_type}</div>
                </div>
              </div>

              <!-- Optical Scan Diagnostic Summary HUD -->
              <div style="background: #FFFFFF; border: 1px solid rgba(46,125,50,0.25); border-radius: 6px; padding: 0.85rem 1rem; margin-bottom: 1.25rem; font-size: 0.84rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem; flex-wrap: wrap; gap: 0.5rem;">
                  <strong style="color: #1E6B23;">🔬 AI Optical Diagnostic Telemetry:</strong>
                  <span style="font-size: 0.78rem; color: var(--text-muted);">Active Rx: <strong>${p.active_rx}</strong></span>
                </div>
                <div style="color: var(--text-secondary); margin-bottom: 0.3rem;">${p.optical_scan_summary}</div>
                <div style="font-size: 0.8rem; color: #475569; font-style: italic;">• Clinical Directives: "${p.clinical_directives}"</div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; border-top: 1px solid var(--border-light); padding-top: 1rem;">
                <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
                  <button class="btn btn-sm btn-outline" onclick="window.app.openDoctorPatientDossierModal(${p.patient_id}, 'diagnosis')" style="font-size: 0.78rem; padding: 0.4rem 0.9rem;">
                    📄 Medical EHR Dossier
                  </button>
                  <button class="btn btn-sm btn-outline" onclick="window.app.openDermatologistRxModal(${p.patient_id})" style="font-size: 0.78rem; padding: 0.4rem 0.9rem;">
                    💊 Issue / Modify Rx
                  </button>
                  <button class="btn btn-sm btn-outline" onclick="window.app.handleDoctorSignEncounterNote(${p.patient_id})" style="font-size: 0.78rem; padding: 0.4rem 0.9rem;">
                    ✍️ Sign Encounter Notes
                  </button>
                  <button class="btn btn-sm btn-outline" onclick="window.app.openDirectSpecialistChat('user_${p.patient_id}')" style="font-size: 0.78rem; padding: 0.4rem 0.9rem;">
                    💬 Physician Chat
                  </button>
                </div>

                <button class="btn btn-primary" onclick="window.app.openTelehealthVideoModal(${p.id}, 'dermatologist', '${p.session_type}', '${p.patient_name}')" style="font-weight: 700; padding: 0.55rem 1.4rem; background: #2E7D32; border-color: #2E7D32; color: #FFFFFF;">
                  🩺 Launch Clinical Telehealth Call →
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- SECTION 2: URGENT CLINICAL TRIAGE & AI LESION INFLOW -->
      <section class="glass-card section-margin" style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.75rem; margin-bottom: 2rem;">
        <div style="border-bottom: 1px solid var(--border-light); padding-bottom: 1rem; margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.3rem;">🚨</span>
            <h3 style="font-family: 'Playfair Display', serif; font-size: 1.35rem; margin: 0;">Urgent Optical Lesion Screening & Triage Inflow</h3>
          </div>
          <p class="text-muted" style="font-size: 0.85rem; margin: 0.2rem 0 0 0;">AI optical scans flagged with elevated biomarker risks requiring physician intervention.</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.5rem;">
          ${triageList.map(tr => `
            <div style="background: #FFF5F5; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--radius-sm); padding: 1.4rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.85rem;">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <img src="${tr.avatar}" alt="${tr.patient_name}" style="width: 46px; height: 46px; border-radius: 50%; object-fit: cover; border: 2px solid #EF4444;">
                    <div>
                      <strong style="font-size: 0.95rem; color: var(--text-primary);">${tr.patient_name}</strong>
                      <span class="badge badge-warning" style="font-size: 0.7rem; display: block; width: fit-content; margin-top: 0.15rem; background: #FEE2E2; color: #B91C1C;">${tr.ai_risk_score}</span>
                    </div>
                  </div>
                  <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">${tr.triaged_at}</span>
                </div>
                <p style="font-size: 0.82rem; color: #7F1D1D; line-height: 1.45; background: #FFFFFF; padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(239, 68, 68, 0.2); margin: 0 0 0.85rem 0;">
                  <strong>Flagged:</strong> ${tr.flagged_reason}
                </p>
                <div style="font-size: 0.8rem; color: #1E6B23; font-weight: 700; margin-bottom: 1rem;">
                  ⚡ Action: ${tr.recommended_action}
                </div>
              </div>

              <div style="display: flex; gap: 0.6rem;">
                <button class="btn btn-sm btn-primary" onclick="window.app.openTelehealthVideoModal(${tr.id}, 'dermatologist', 'Urgent Triage Session', '${tr.patient_name}')" style="flex: 1; background: #DC2626; border-color: #DC2626; font-weight: 700;">
                  ⚡ Fast-Track Video Consult
                </button>
                <button class="btn btn-sm btn-outline" onclick="window.app.openDoctorPatientDossierModal(${tr.patient_id}, 'diagnosis')" style="font-weight: 700;">
                  🔍 Review Dermoscopy
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- SECTION 3: ELECTRONIC PRESCRIPTION (E-RX) PAD -->
      <section class="glass-card section-margin" style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.75rem; margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.3rem;">💊</span>
              <h3 style="font-family: 'Playfair Display', serif; font-size: 1.35rem; margin: 0;">Electronic Prescription (e-Rx) Pad & Authorizations</h3>
            </div>
            <p class="text-muted" style="font-size: 0.85rem; margin: 0.2rem 0 0 0;">Official DEA / NPI Certified digital medical prescriptions issued to clinical patients.</p>
          </div>
          <span class="badge badge-success" style="font-size: 0.78rem;">DEA / NPI Verified</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${rxList.map(rx => `
            <div style="background: #FAF9F6; border: 1px solid var(--border-light); border-radius: 6px; padding: 1.1rem 1.4rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
              <div>
                <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.25rem;">
                  <strong style="font-size: 0.95rem; color: #1E6B23;">${rx.medication}</strong>
                  <span class="badge ${rx.status.includes('Authorized') ? 'badge-success' : 'badge-warning'}" style="font-size: 0.72rem;">${rx.status}</span>
                  <span style="font-size: 0.78rem; color: var(--text-muted); font-family: monospace;">#${rx.id}</span>
                </div>
                <div style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 0.2rem;">
                  Patient: <strong>${rx.patient_name}</strong> • Dosage: ${rx.dosage} • Refills: <strong>${rx.refills} Remaining</strong>
                </div>
                <div style="font-size: 0.78rem; color: var(--text-muted);">Signed: ${rx.signed_date}</div>
              </div>
              <button class="btn btn-sm btn-primary" onclick="window.app.handleDoctorAuthorizeRx('${rx.id}')" style="background: #2E7D32; border-color: #2E7D32; font-size: 0.78rem; font-weight: 700;">
                ✍️ Authorize & Sign Rx
              </button>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- SECTION 4: PRACTICE SETTINGS & ON-CALL PROTOCOL -->
      <section class="glass-card section-margin" style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h4 style="font-family: 'Playfair Display', serif; font-size: 1.1rem; margin: 0 0 0.25rem 0;">Hospital Affiliation & e-Prescribe Certification</h4>
            <p class="text-muted" style="font-size: 0.82rem; margin: 0;">${dermData.practice_settings.hospital_affiliation} • ${dermData.practice_settings.e_prescribe_state}</p>
          </div>
          <div style="display: flex; gap: 0.6rem;">
            <button class="btn btn-sm btn-outline" onclick="alert('Telehealth clinic hours updated.')" style="font-size: 0.78rem;">⚙️ Clinic Configuration</button>
          </div>
        </div>
      </section>
    </div>
  `;
}

/**
 * ════════════════════════════════════════════════════════════════
 * 4. ADMIN MASTER APPOINTMENTS & CLINIC CAPACITY WORKSPACE
 * ════════════════════════════════════════════════════════════════
 */
export function renderAdminAppointmentsPage(adminData = null) {
  const adminAppointments = MOCK_ADMIN_APPOINTMENTS;
  const kpis = adminAppointments.clinic_kpis;
  const roster = adminAppointments.specialist_roster;

  return `
    <div class="dashboard-wrapper">
      <div class="dashboard-header" style="background: linear-gradient(135deg, #1F1728 0%, #301E42 100%); color: #FFFFFF; border-radius: var(--radius-md); padding: 2rem 2.5rem; margin-bottom: 2rem; border: 1px solid rgba(142, 36, 170, 0.35);">
        <div>
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
            <span class="badge badge-admin" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; padding: 0.3rem 0.8rem;">Platform Administration</span>
            <span style="font-size: 0.85rem; color: #EAE6DF;">• Clinic Operations Control</span>
          </div>
          <h2 style="color: #FFFFFF; font-family: 'Playfair Display', serif; font-size: 1.85rem; margin: 0 0 0.35rem;">Master Telehealth Ledger & Specialist Capacity</h2>
          <p style="color: #E1D6ED; font-size: 0.9rem; margin: 0;">Monitor platform-wide telehealth session volume, clinician capacity utilization, and patient satisfaction metrics.</p>
        </div>
        <button class="btn btn-outline" onclick="window.app.navigateToView('dashboard')" style="color: #FFFFFF; border-color: rgba(255,255,255,0.3); font-weight: 700;">
          ← Back to Admin Console
        </button>
      </div>

      <div class="metrics-row" style="margin-bottom: 2rem;">
        <div class="metric-card">
          <div class="metric-value" style="color: var(--admin-color);">${kpis.total_weekly_appointments}</div>
          <div class="metric-label">Weekly Telehealth Sessions</div>
        </div>
        <div class="metric-card">
          <div class="metric-value" style="color: var(--accent-emerald);">${kpis.completed_sessions}</div>
          <div class="metric-label">Completed Sessions</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${kpis.specialist_utilization}</div>
          <div class="metric-label">Specialist Capacity Utilization</div>
        </div>
        <div class="metric-card">
          <div class="metric-value" style="color: var(--gold-primary);">★ ${kpis.patient_satisfaction_score}</div>
          <div class="metric-label">Patient Satisfaction Rating</div>
        </div>
      </div>

      <section class="glass-card section-margin" style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 1.75rem;">
        <h3 style="font-family: 'Playfair Display', serif; font-size: 1.3rem; margin: 0 0 1rem 0;">Specialist Telehealth Clinic Roster & Real-Time Capacity</h3>
        <div class="table-responsive">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #FAF9F6; text-align: left; font-size: 0.8rem; color: var(--text-muted); border-bottom: 1px solid var(--border-light);">
                <th style="padding: 0.85rem 1rem;">Specialist Name</th>
                <th style="padding: 0.85rem 1rem;">Role</th>
                <th style="padding: 0.85rem 1rem;">Daily Slots</th>
                <th style="padding: 0.85rem 1rem;">Booked Sessions</th>
                <th style="padding: 0.85rem 1rem;">Clinic Status</th>
              </tr>
            </thead>
            <tbody>
              ${roster.map(r => `
                <tr style="border-bottom: 1px solid var(--border-light); font-size: 0.88rem;">
                  <td style="padding: 0.85rem 1rem; font-weight: 700;">${r.name}</td>
                  <td style="padding: 0.85rem 1rem;"><span class="badge ${r.role === 'Dermatologist' ? 'badge-dermatologist' : 'badge-consultant'}">${r.role}</span></td>
                  <td style="padding: 0.85rem 1rem;">${r.today_slots} slots</td>
                  <td style="padding: 0.85rem 1rem; font-weight: 700; color: var(--gold-primary);">${r.booked} booked</td>
                  <td style="padding: 0.85rem 1rem;"><span class="badge badge-success">${r.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;
}

/**
 * ============================================================================
 * CLINICAL TELEHEALTH & LUMINA AI CHAT STUDIO PAGE
 * Dedicated Full-Page 3-Pane Messaging Workspace
 * ============================================================================
 */
export function renderClinicChatPage(conversations = [], activeContactId = 'lumina_ai', activeMessages = [], userRole = 'user') {
  const currentRole = userRole || (auth ? auth.getCurrentRole() : 'user') || 'user';
  const currentUser = auth ? auth.getCurrentUser() : null;
  const currentUserId = currentUser?.id || 1;

  // Fallback conversations if not yet loaded
  const convList = conversations && conversations.length > 0 ? conversations : [
    {
      id: `user_${currentUserId}_lumina_ai`,
      contact_id: 'lumina_ai',
      contact_name: 'Lumina AI Copilot',
      contact_role: 'ai_assistant',
      contact_title: 'Clinical AI Skincare Assistant',
      contact_avatar: 'assets/logo.png',
      status: 'AI Online',
      badge: 'AI COPILOT',
      is_ai: true,
      last_message: 'Hello! I am Lumina, your AI Clinical Skincare Copilot.',
      last_message_time: new Date().toISOString(),
      unread_count: 0
    },
    {
      id: `user_${currentUserId}_consultant_2`,
      contact_id: '2',
      contact_name: 'Ananya Iyer, LE',
      contact_role: 'consultant',
      contact_title: 'Lead Clinical Esthetician',
      contact_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      status: 'Online',
      badge: 'ESTHETICIAN',
      is_ai: false,
      last_message: 'Your skin barrier recovery is remarkable. Let me know if you experience tightness.',
      last_message_time: new Date(Date.now() - 3600000 * 2).toISOString(),
      unread_count: 0
    },
    {
      id: `user_${currentUserId}_doctor_3`,
      contact_id: '3',
      contact_name: 'Dr. Rajni Verma, MD',
      contact_role: 'dermatologist',
      contact_title: 'Board-Certified Dermatologist',
      contact_avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
      status: 'In Clinic',
      badge: 'DERMATOLOGIST',
      is_ai: false,
      last_message: 'I have approved your 3-month Adapalene 0.1% prescription renewal.',
      last_message_time: new Date(Date.now() - 3600000 * 5).toISOString(),
      unread_count: 0
    }
  ];

  const activeContact = convList.find(c => String(c.contact_id) === String(activeContactId)) || convList[0];

  return `
    <div class="editorial-container chat-page-container reveal">
      <!-- Top Clinic Telehealth Studio Header -->
      <div class="chat-hub-topbar" style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--border-light); padding-bottom: 1.25rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem;">
            <span class="badge badge-accent" style="font-size: 0.72rem; letter-spacing: 0.08em; font-weight: 800;">💬 CLINIC TELEHEALTH & MESSAGING</span>
            <span style="font-size: 0.75rem; color: #059669; font-weight: 700; display: flex; align-items: center; gap: 0.3rem;">
              <span class="pulse-dot" style="width: 7px; height: 7px; background: #059669; box-shadow: 0 0 8px #059669;"></span> LIVE NETWORK
            </span>
          </div>
          <h1 style="font-family: 'Playfair Display', serif; font-size: 1.85rem; margin: 0; color: var(--text-primary);">
            Clinical Messaging & AI Skincare Copilot
          </h1>
          <p class="text-muted" style="margin: 0.25rem 0 0 0; font-size: 0.85rem;">
            Secure asynchronous communication with your board-certified dermatologist, licensed esthetician, and Lumina AI assistant.
          </p>
        </div>

        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <button class="btn btn-sm btn-outline" onclick="window.app.navigateToView('dashboard')" style="display: flex; align-items: center; gap: 0.4rem; font-weight: 700; font-size: 0.82rem;">
            <span>←</span> Back to Dashboard
          </button>
          <button class="btn btn-sm btn-primary" onclick="window.app.openBookingModal(3, 'Dr. Rajni Verma, MD', 'dermatologist')" style="font-weight: 700; font-size: 0.82rem; background: #2E7D32; border-color: #2E7D32;">
            📹 Book Video Telehealth
          </button>
        </div>
      </div>

      <!-- 3-PANE MESSAGING STUDIO GRID -->
      <div class="chat-studio-layout">
        <!-- ══════════════════════════════════════════════════════════ -->
        <!-- PANE 1: CONVERSATION DIRECTORY & CONTACTS ROSTER (LEFT)   -->
        <!-- ══════════════════════════════════════════════════════════ -->
        <aside class="chat-sidebar-pane">
          <div class="chat-sidebar-header">
            <h3 style="font-family: 'Playfair Display', serif; font-size: 1.15rem; margin: 0; color: var(--text-primary);">Conversations</h3>
            <span class="badge badge-outline" style="font-size: 0.7rem;">${convList.length} Channels</span>
          </div>

          <!-- Search Input -->
          <div class="chat-search-box">
            <span>🔍</span>
            <input type="text" id="chat-search-input" placeholder="Search contacts & messages..." oninput="window.app.filterChatContacts(this.value)">
          </div>

          <!-- Category Filter Pills -->
          <div class="chat-category-tabs">
            <button class="chat-cat-pill active" onclick="window.app.filterChatCategory('all', this)">All</button>
            <button class="chat-cat-pill" onclick="window.app.filterChatCategory('specialist', this)">Care Team</button>
            <button class="chat-cat-pill" onclick="window.app.filterChatCategory('ai', this)">Lumina AI</button>
          </div>

          <!-- Contact Cards List -->
          <div class="chat-contacts-list" id="chat-page-contacts-list">
            ${convList.map(c => {
              const isActive = String(c.contact_id) === String(activeContact.contact_id);
              const badgeColor = c.is_ai ? 'var(--gold-primary)' : c.contact_role === 'dermatologist' ? '#2E7D32' : '#7C3AED';
              return `
                <div class="chat-contact-card ${isActive ? 'active' : ''}" onclick="window.app.switchChatContact('${c.contact_id}')" data-category="${c.is_ai ? 'ai' : 'specialist'}" data-name="${c.contact_name.toLowerCase()}">
                  <div class="chat-contact-avatar-wrap">
                    <img src="${c.contact_avatar}" alt="${c.contact_name}" class="chat-contact-avatar" onerror="this.src='assets/logo.png'">
                    <span class="chat-online-indicator ${c.is_ai ? 'ai' : ''}"></span>
                  </div>
                  <div class="chat-contact-meta">
                    <div class="chat-contact-top-row">
                      <span class="chat-contact-name">${c.contact_name}</span>
                      <span class="chat-contact-time">${c.last_message_time ? new Date(c.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                    <div class="chat-contact-role-badge" style="color: ${badgeColor};">
                      ${c.badge || c.contact_title}
                    </div>
                    <div class="chat-contact-snippet">
                      ${c.last_message}
                    </div>
                  </div>
                  ${c.unread_count > 0 ? `<span class="chat-unread-badge">${c.unread_count}</span>` : ''}
                </div>
              `;
            }).join('')}
          </div>

          <div class="chat-sidebar-footer">
            <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.35rem;">
              <span>🔒</span> HIPAA & GDPR Telehealth Shield Active
            </div>
          </div>
        </aside>

        <!-- ══════════════════════════════════════════════════════════ -->
        <!-- PANE 2: ACTIVE MESSAGE STREAM & COMPOSER (CENTER)        -->
        <!-- ══════════════════════════════════════════════════════════ -->
        <section class="chat-stream-pane">
          <!-- Active Contact Top Header -->
          <div class="chat-stream-header">
            <div class="chat-active-contact-info">
              <div class="chat-contact-avatar-wrap">
                <img src="${activeContact.contact_avatar}" alt="${activeContact.contact_name}" class="chat-active-avatar" onerror="this.src='assets/logo.png'">
                <span class="chat-online-indicator ${activeContact.is_ai ? 'ai' : ''}"></span>
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <h3 class="chat-active-name" style="margin: 0;">${activeContact.contact_name}</h3>
                  <span class="badge badge-accent" style="font-size: 0.68rem;">${activeContact.badge || activeContact.contact_title}</span>
                </div>
                <div class="chat-active-status-line">
                  <span style="color: #059669; font-weight: 700;">● ${activeContact.status || 'Active'}</span>
                  <span style="margin: 0 0.35rem; color: var(--text-muted);">|</span>
                  <span style="color: var(--text-secondary); font-size: 0.78rem;">${activeContact.contact_title || 'Clinical Care Specialist'}</span>
                </div>
              </div>
            </div>

            <!-- Header Quick Actions -->
            <div class="chat-stream-hdr-actions">
              ${activeContact.is_ai ? `
                <button class="btn btn-sm btn-outline" onclick="window.app.sendQuickPrompt('Analyze my skin barrier score and active routine compatibility')" style="font-size: 0.75rem; font-weight: 700;">
                  ✨ Instant Skin Analysis
                </button>
              ` : `
                <button class="btn btn-sm btn-outline" onclick="window.app.openBookingModal(${activeContact.contact_id}, '${activeContact.contact_name}', '${activeContact.contact_role}')" style="font-size: 0.75rem; font-weight: 700;">
                  📅 Schedule Follow-up
                </button>
                <button class="btn btn-sm btn-outline" onclick="window.app.navigateToView('consultations')" style="font-size: 0.75rem; font-weight: 700;">
                  🔒 Sharing Matrix
                </button>
              `}
              <button class="btn btn-sm btn-outline" onclick="window.app.exportChatTranscript()" title="Download Session Transcript" style="font-size: 0.75rem; padding: 0.4rem 0.6rem;">
                📥
              </button>
            </div>
          </div>

          <!-- Messages Scroll Stream -->
          <div class="chat-messages-container" id="chat-page-messages-container">
            <!-- Date Separator -->
            <div class="chat-date-separator">
              <span>Today • Secure Clinical Session</span>
            </div>

            <!-- Messages List -->
            <div id="chat-page-messages-list" style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${(activeMessages && activeMessages.length > 0 ? activeMessages : []).map(m => {
                const isMe = String(m.sender_id) === String(currentUserId) && m.sender_role !== 'ai_assistant';
                const isAi = m.sender_id === 'lumina_ai' || m.message_type === 'ai_response';
                const avatarUrl = m.sender_avatar || activeContact.contact_avatar || 'assets/logo.png';
                const formatted = (typeof window !== 'undefined' && window.app && window.app.formatChatMessage) ? window.app.formatChatMessage(m.message) : m.message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
                const timeStr = m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                return `
                  <div class="chat-bubble-row ${isMe ? 'my-message' : 'their-message'}">
                    ${!isMe ? `
                      <img src="${avatarUrl}" alt="${m.sender_name || 'Contact'}" class="chat-msg-avatar" onerror="this.src='assets/logo.png'">
                    ` : ''}
                    <div class="chat-bubble ${isMe ? 'bubble-me' : isAi ? 'bubble-ai' : 'bubble-them'}">
                      ${!isMe ? `
                        <div class="chat-bubble-sender">
                          <span>${m.sender_name || (isAi ? 'Lumina AI Copilot' : 'Care Team')}</span>
                          ${isAi ? '<span class="ai-sparkle-pill">✨ AI COPILOT</span>' : ''}
                        </div>
                      ` : ''}
                      <div class="chat-bubble-text">
                        ${formatted}
                      </div>
                      <div class="chat-bubble-footer">
                        <span>${timeStr}</span>
                        ${isMe ? '<span class="chat-check-icon">✓✓</span>' : ''}
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Live Typing Indicator -->
            <div id="chat-page-typing-indicator" class="chat-page-typing-indicator hidden" style="margin-top: 0.75rem;">
              <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
              <span id="chat-page-typing-label" style="font-size: 0.78rem; color: var(--text-muted); margin-left: 0.35rem;">
                ${activeContact.contact_name} is typing...
              </span>
            </div>
          </div>

          <!-- Quick Preset Prompts (Always Available for Lumina AI) -->
          ${activeContact.is_ai ? `
            <div class="chat-quick-suggestions">
              <span style="font-size: 0.72rem; font-weight: 800; color: var(--gold-primary); text-transform: uppercase; white-space: nowrap; margin-right: 0.35rem;">Quick Topics:</span>
              <button type="button" class="chat-suggestion-chip" onclick="window.app.sendQuickPrompt('Is it safe to use 2% Salicylic Acid BHA alongside Topical Adapalene 0.1%?')">🧪 BHA + Adapalene Pairing</button>
              <button type="button" class="chat-suggestion-chip" onclick="window.app.sendQuickPrompt('How do I repair a compromised skin barrier and soothe facial redness?')">🛡️ Skin Barrier Repair</button>
              <button type="button" class="chat-suggestion-chip" onclick="window.app.sendQuickPrompt('Explain Vitamin C stability, L-Ascorbic Acid vs derivatives, and oxidation signs')">✨ Vitamin C & Stability</button>
              <button type="button" class="chat-suggestion-chip" onclick="window.app.sendQuickPrompt('What are the root causes and trigger ingredients of Malassezia Fungal Acne?')">🍄 Fungal Acne Triggers</button>
              <button type="button" class="chat-suggestion-chip" onclick="window.app.sendQuickPrompt('What are pregnancy and nursing safe skincare alternatives to retinoids?')">🤰 Pregnancy-Safe Actives</button>
              <button type="button" class="chat-suggestion-chip" onclick="window.app.sendQuickPrompt('How can I tell the difference between active skin purging and an allergic breakout?')">🔍 Purging vs Allergic Flare</button>
              <button type="button" class="chat-suggestion-chip" onclick="window.app.sendQuickPrompt('What is the difference between mineral vs chemical sunscreens with zero white cast?')">☀️ Mineral vs Chemical SPF</button>
              <button type="button" class="chat-suggestion-chip" onclick="window.app.sendQuickPrompt('What causes dark under-eye circles and do caffeine peptides help?')">👁️ Eye Care & Dark Circles</button>
              <button type="button" class="chat-suggestion-chip" onclick="window.app.sendQuickPrompt('How does 15% Azelaic Acid treat hyperpigmentation, PIH, and redness?')">🧪 Azelaic Acid for PIH</button>
              <button type="button" class="chat-suggestion-chip" onclick="window.app.sendQuickPrompt('What is the optimal morning and evening skincare application order?')">🌅 Regimen Application Order</button>
              <button type="button" class="chat-suggestion-chip" onclick="window.app.sendQuickPrompt('How do I treat dehydrated oily skin with high trans-epidermal water loss TEWL?')">💧 Dehydrated Oily Skin</button>
            </div>
          ` : ''}

          <!-- Message Composer Area -->
          <div class="chat-composer-box">
            <!-- Preset Quick Tags -->
            <div class="chat-preset-tags">
              <button type="button" class="preset-tag-btn" onclick="window.app.insertComposerTag('[Prescription Query] ')">💊 Rx Query</button>
              <button type="button" class="preset-tag-btn" onclick="window.app.insertComposerTag('[Routine Question] ')">📝 Routine Question</button>
              <button type="button" class="preset-tag-btn" onclick="window.app.insertComposerTag('[Flare-up Alert] ')">⚠️ Flare-up Alert</button>
              <button type="button" class="preset-tag-btn" onclick="window.app.triggerPhotoAttachmentSimulation()">📸 Attach Skin Photo</button>
            </div>

            <form class="chat-input-form" onsubmit="event.preventDefault(); window.app.handlePageChatSend(event)">
              <textarea id="chat-page-input" class="chat-textarea" placeholder="Type your message to ${activeContact.contact_name}... (Press Enter to send)" rows="2" onkeydown="if(event.key==='Enter' && !event.shiftKey){event.preventDefault(); window.app.handlePageChatSend(event);}"></textarea>
              
              <div class="chat-form-actions">
                <button type="button" class="chat-icon-btn" onclick="window.app.triggerVoiceNoteSimulation()" title="Voice Note Simulation">
                  🎙️
                </button>
                <button type="submit" class="btn btn-primary chat-submit-btn" style="font-weight: 700; display: flex; align-items: center; gap: 0.4rem;">
                  <span>Send</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </div>
            </form>
          </div>
        </section>

        <!-- ══════════════════════════════════════════════════════════ -->
        <!-- PANE 3: CLINICAL CONTEXT & DOSSIER SNAPSHOT (RIGHT)       -->
        <!-- ══════════════════════════════════════════════════════════ -->
        <aside class="chat-context-pane">
          ${activeContact.is_ai ? `
            <!-- Lumina AI Clinical Telemetry Panel -->
            <div class="context-card" style="background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 1.25rem; margin-bottom: 1.25rem;">
              <div style="display: flex; align-items: center; gap: 0.65rem; margin-bottom: 0.85rem;">
                <div style="width: 36px; height: 36px; border-radius: 50%; background: #000; display: flex; align-items: center; justify-content: center; color: var(--gold-primary); font-size: 1.1rem; border: 1px solid var(--gold-primary);">
                  ✨
                </div>
                <div>
                  <h4 style="font-family: 'Playfair Display', serif; font-size: 1.05rem; margin: 0;">Lumina AI Copilot</h4>
                  <span style="font-size: 0.72rem; color: var(--gold-primary); font-weight: 800;">CLINICAL DERMA ENGINE v2.4</span>
                </div>
              </div>
              <p style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.45; margin-bottom: 1rem;">
                Trained on peer-reviewed dermatological studies, clinical barrier mechanics, formulation chemistry, and cutaneous pharmacokinetic profiles.
              </p>

              <div class="hud-divider" style="margin: 0.85rem 0;"></div>

              <div style="font-size: 0.75rem; font-weight: 800; color: var(--text-primary); text-transform: uppercase; margin-bottom: 0.6rem;">
                Your Active Telemetry
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.78rem;">
                <div style="display: flex; justify-content: space-between;">
                  <span class="text-muted">Skin Type:</span>
                  <strong>Combination</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span class="text-muted">Overall Health Score:</span>
                  <strong style="color: var(--accent-emerald);">79.4 / 100</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span class="text-muted">Barrier Resilience:</span>
                  <strong>86.0% (Optimal)</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span class="text-muted">Acne Vulnerability:</span>
                  <strong style="color: #D97706;">12.0% (Mild)</strong>
                </div>
              </div>
            </div>

            <!-- Lumina AI Prompt Shortcuts -->
            <div class="context-card" style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 1.25rem;">
              <h4 style="font-family: 'Playfair Display', serif; font-size: 0.98rem; margin: 0 0 0.65rem 0;">One-Click Prompts</h4>
              <div style="display: flex; flex-direction: column; gap: 0.45rem;">
                <button type="button" class="context-prompt-btn" onclick="window.app.sendQuickPrompt('Review my morning routine and check for ingredient conflicts')">
                  🔍 Audit Morning Regimen
                </button>
                <button type="button" class="context-prompt-btn" onclick="window.app.sendQuickPrompt('What ingredients pair best with 15% Azelaic Acid?')">
                  🧪 Azelaic Acid Pairing
                </button>
                <button type="button" class="context-prompt-btn" onclick="window.app.sendQuickPrompt('How do I minimize irritation when using topical adapalene?')">
                  💡 Retinoid Tolerance Tips
                </button>
                <button type="button" class="context-prompt-btn" onclick="window.app.sendQuickPrompt('Explain Vitamin C stability and how to tell if my serum oxidized')">
                  ✨ Vitamin C & Oxidation
                </button>
                <button type="button" class="context-prompt-btn" onclick="window.app.sendQuickPrompt('What are fungal acne safe moisturizers and cleansers?')">
                  🍄 Fungal Acne Safe Actives
                </button>
                <button type="button" class="context-prompt-btn" onclick="window.app.sendQuickPrompt('What pregnancy-safe ingredients can replace retinol and salicylic acid?')">
                  🤰 Pregnancy-Safe Retinoid Dupes
                </button>
                <button type="button" class="context-prompt-btn" onclick="window.app.sendQuickPrompt('Explain my latest 30-day hydration trajectory')">
                  📈 Explain Hydration Gains
                </button>
              </div>
            </div>
          ` : `
            <!-- Specialist Care Summary Panel -->
            <div class="context-card" style="background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 1.25rem; margin-bottom: 1.25rem;">
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.85rem;">
                <img src="${activeContact.contact_avatar}" alt="${activeContact.contact_name}" style="width: 46px; height: 46px; border-radius: 50%; object-fit: cover; border: 2px solid ${activeContact.contact_role === 'dermatologist' ? '#2E7D32' : 'var(--gold-primary)'};">
                <div>
                  <h4 style="font-family: 'Playfair Display', serif; font-size: 1.05rem; margin: 0;">${activeContact.contact_name}</h4>
                  <span style="font-size: 0.72rem; color: ${activeContact.contact_role === 'dermatologist' ? '#2E7D32' : 'var(--gold-primary)'}; font-weight: 800;">${activeContact.badge || activeContact.contact_title}</span>
                </div>
              </div>

              <div class="hud-divider" style="margin: 0.85rem 0;"></div>

              <div style="font-size: 0.75rem; font-weight: 800; color: var(--text-primary); text-transform: uppercase; margin-bottom: 0.6rem;">
                Active Digital Prescription
              </div>
              <div style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: 6px; padding: 0.75rem; font-size: 0.8rem; margin-bottom: 0.85rem;">
                <div style="font-weight: 700; color: #2E7D32; margin-bottom: 0.25rem;">💊 Topical Adapalene 0.1% + Azelaic Acid 15%</div>
                <div style="font-size: 0.72rem; color: var(--text-muted);">Approved by Dr. Rajni Verma, MD (Next review: 24 Dec 2025)</div>
              </div>

              <div style="font-size: 0.75rem; font-weight: 800; color: var(--text-primary); text-transform: uppercase; margin-bottom: 0.6rem;">
                Shared Clinical Telemetry
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.78rem; color: var(--text-secondary);">
                <div>🔬 8 Cutaneous Biomarkers (Shared)</div>
                <div>📅 30-Day Routine Adherence: 92.4% (Shared)</div>
                <div>📸 Facial Optical Scans: Shared</div>
              </div>
            </div>

            <!-- Booking Action Card -->
            <div class="context-card" style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 1.25rem;">
              <h4 style="font-family: 'Playfair Display', serif; font-size: 0.98rem; margin: 0 0 0.5rem 0;">Need a Live Telehealth Session?</h4>
              <p style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 0.85rem;">
                Connect via high-definition encrypted video call for formal diagnosis, prescription sign-offs, and treatment updates.
              </p>
              <button class="btn btn-sm btn-primary" onclick="window.app.openBookingModal(${activeContact.contact_id}, '${activeContact.contact_name}', '${activeContact.contact_role}')" style="width: 100%; font-weight: 700;">
                📅 Book Telehealth Call →
              </button>
            </div>
          `}
        </aside>
      </div>
    </div>
  `;
}

// ════════════════════════════════════════════════════════════════
// MODULE 10: NOTIFICATION CENTER DRAWER RENDERER
// ════════════════════════════════════════════════════════════════

export function renderNotificationDrawerContent(notifications = [], activeCategory = 'all') {
  const filtered = activeCategory === 'all' ? notifications : notifications.filter(n => n.category === activeCategory);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return `
    <div class="notif-drawer-inner">
      <div class="notif-drawer-header">
        <div>
          <h3 style="font-family: 'Playfair Display', serif; font-size: 1.25rem; margin: 0; color: var(--text-primary);">
            Notifications & Reminders
          </h3>
          <span style="font-size: 0.78rem; color: var(--text-muted);">
            ${unreadCount > 0 ? `${unreadCount} unread alerts` : 'All alerts read'}
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <button class="btn btn-sm btn-outline" onclick="window.app.handleMarkAllNotificationsRead()" style="font-size: 0.72rem; padding: 0.3rem 0.6rem;">
            Mark All Read
          </button>
          <button class="btn btn-sm btn-outline" onclick="window.app.openReminderSettingsModal()" title="Reminder Settings" style="font-size: 0.72rem; padding: 0.3rem 0.5rem;">
            ⚙️
          </button>
          <button class="close-btn" onclick="window.app.closeNotificationDrawer()" style="font-size: 1.3rem;">×</button>
        </div>
      </div>

      <!-- Category Filter Tabs -->
      <div class="notif-category-bar">
        <button class="notif-cat-btn ${activeCategory === 'all' ? 'active' : ''}" onclick="window.app.filterNotificationCategory('all')">All (${notifications.length})</button>
        <button class="notif-cat-btn ${activeCategory === 'routine' ? 'active' : ''}" onclick="window.app.filterNotificationCategory('routine')">Routines</button>
        <button class="notif-cat-btn ${activeCategory === 'product' ? 'active' : ''}" onclick="window.app.filterNotificationCategory('product')">Products</button>
        <button class="notif-cat-btn ${activeCategory === 'hydration_sleep' ? 'active' : ''}" onclick="window.app.filterNotificationCategory('hydration_sleep')">Hydration & Sleep</button>
        <button class="notif-cat-btn ${activeCategory === 'clinical' ? 'active' : ''}" onclick="window.app.filterNotificationCategory('clinical')">Clinical</button>
      </div>

      <!-- Notifications List -->
      <div class="notif-list-container">
        ${filtered.length === 0 ? `
          <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔔</div>
            <p style="font-size: 0.85rem; margin: 0;">No notifications found in this category.</p>
          </div>
        ` : filtered.map(n => {
          const typeBorder = n.type === 'warning' ? '#D97706' : (n.type === 'alert' ? '#DC2626' : (n.type === 'success' ? '#059669' : 'var(--gold-primary)'));
          return `
            <div class="notif-card ${n.is_read ? 'read' : 'unread'}" style="border-left: 3px solid ${typeBorder};">
              <div class="notif-card-header">
                <strong class="notif-card-title">${n.title}</strong>
                <span class="notif-card-time">${new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p class="notif-card-msg">${n.message}</p>
              <div class="notif-card-actions">
                ${n.action_url ? `
                  <button class="btn btn-sm btn-primary notif-action-btn" onclick="window.app.handleNotificationAction('${n.action_url}', ${n.id})">
                    Take Action →
                  </button>
                ` : ''}
                ${!n.is_read ? `
                  <button class="btn btn-sm btn-outline notif-action-btn" onclick="window.app.handleMarkNotificationRead(${n.id})">
                    Mark Read
                  </button>
                ` : '<span style="font-size: 0.72rem; color: #64748B;">✓ Read</span>'}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// ════════════════════════════════════════════════════════════════
// MODULE 10: REMINDER PREFERENCES MODAL RENDERER
// ════════════════════════════════════════════════════════════════

export function renderReminderSettingsModalContent(prefs = {}) {
  const p = prefs || {};
  return `
    <div class="modal-header">
      <div>
        <h3 style="font-family: 'Playfair Display', serif; font-size: 1.35rem; margin: 0;">⏰ Skincare & Lifestyle Reminders</h3>
        <p class="text-muted" style="font-size: 0.82rem; margin: 0.2rem 0 0 0;">Configure scheduled notification times and intelligent alerts</p>
      </div>
      <button class="close-btn" onclick="window.app.closeModal('reminder-settings-modal')">×</button>
    </div>

    <form id="reminder-settings-form" onsubmit="window.app.handleSaveReminderSettings(event)" style="padding: 1.25rem;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
        <div class="form-group">
          <label style="font-size: 0.8rem; font-weight: 700;">🌅 Morning Routine Time</label>
          <input type="time" name="morning_routine_time" class="form-control" value="${p.morning_routine_time || '08:00'}">
        </div>
        <div class="form-group">
          <label style="font-size: 0.8rem; font-weight: 700;">🌙 Evening Routine Time</label>
          <input type="time" name="evening_routine_time" class="form-control" value="${p.evening_routine_time || '21:30'}">
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
        <div class="form-group">
          <label style="font-size: 0.8rem; font-weight: 700;">💧 Daily Hydration Target (ml)</label>
          <input type="number" name="hydration_target_ml" class="form-control" value="${p.hydration_target_ml || 2500}" step="250" min="1000" max="5000">
        </div>
        <div class="form-group">
          <label style="font-size: 0.8rem; font-weight: 700;">🛌 Sleep Wind-Down Time</label>
          <input type="time" name="sleep_wind_down_time" class="form-control" value="${p.sleep_wind_down_time || '22:30'}">
        </div>
      </div>

      <div class="hud-divider" style="margin: 1.25rem 0;"></div>

      <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.85rem;">Active Notification Channels</h4>
      <div style="display: flex; flex-direction: column; gap: 0.65rem; font-size: 0.85rem;">
        <label style="display: flex; align-items: center; gap: 0.6rem; cursor: pointer;">
          <input type="checkbox" name="enable_routine_reminders" ${p.enable_routine_reminders !== false ? 'checked' : ''} style="accent-color: var(--gold-primary);">
          <span>Morning & Evening Skincare Step Reminders</span>
        </label>
        <label style="display: flex; align-items: center; gap: 0.6rem; cursor: pointer;">
          <input type="checkbox" name="enable_replenishment_alerts" ${p.enable_replenishment_alerts !== false ? 'checked' : ''} style="accent-color: var(--gold-primary);">
          <span>Smart Product Replenishment & Low Stock Alerts (7 Days Left)</span>
        </label>
        <label style="display: flex; align-items: center; gap: 0.6rem; cursor: pointer;">
          <input type="checkbox" name="enable_hydration_reminders" ${p.enable_hydration_reminders !== false ? 'checked' : ''} style="accent-color: var(--gold-primary);">
          <span>Hydration Interval Water Check-ins (Every 2 Hours)</span>
        </label>
        <label style="display: flex; align-items: center; gap: 0.6rem; cursor: pointer;">
          <input type="checkbox" name="enable_sleep_reminders" ${p.enable_sleep_reminders !== false ? 'checked' : ''} style="accent-color: var(--gold-primary);">
          <span>Circadian Cellular Repair & Sleep Prompts</span>
        </label>
      </div>

      <div style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem;">
        <button type="button" class="btn btn-outline btn-sm" onclick="window.app.closeModal('reminder-settings-modal')">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm" style="font-weight: 700;">Save Preferences</button>
      </div>
    </form>
  `;
}

// ════════════════════════════════════════════════════════════════
// MODULE 11: REPORTS & EXPORT HUB MODAL RENDERER
// ════════════════════════════════════════════════════════════════

export function renderReportsHubModalContent(activeReportType = 'skin_health', reportsList = []) {
  const reportTypes = [
    { type: 'skin_health', name: 'Executive Holistic Skin Dossier', icon: '🩺', desc: 'Comprehensive multi-parameter evaluation combining scores, routines, and clinical progress.' },
    { type: 'assessment', name: 'Cutaneous Diagnostic Report', icon: '🔬', desc: '8 optical biomarkers, Fitzpatrick phototype, and ISIC lesion malignancy screening.' },
    { type: 'routine', name: 'Personalized Regimen & Schedule', icon: '📝', desc: 'Morning AM and Evening PM chronological application steps and active layering notes.' },
    { type: 'product_recs', name: 'Formulation Compatibility Dossier', icon: '🧪', desc: 'Matched products catalog, compatibility match %, and budget alternatives.' },
    { type: 'progress', name: '30-Day Longitudinal Progress Audit', icon: '📈', desc: 'Adherence compliance heatmap, score trajectory curve, and before/after biomarker deltas.' }
  ];

  return `
    <div class="modal-header">
      <div>
        <h3 style="font-family: 'Playfair Display', serif; font-size: 1.4rem; margin: 0;">📑 Clinical Reports & Export Hub</h3>
        <p class="text-muted" style="font-size: 0.82rem; margin: 0.2rem 0 0 0;">Generate board-certified diagnostic summaries, printable PDFs, and Excel CSV exports</p>
      </div>
      <button class="close-btn" onclick="window.app.closeModal('reports-export-modal')">×</button>
    </div>

    <div style="padding: 1.25rem;">
      <!-- Report Type Selector Grid -->
      <div style="font-size: 0.78rem; font-weight: 800; color: var(--gold-primary); text-transform: uppercase; margin-bottom: 0.65rem;">
        Select Report Type:
      </div>
      <div class="report-type-selector-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem;">
        ${reportTypes.map(rt => `
          <div class="report-type-card ${rt.type === activeReportType ? 'active' : ''}" onclick="window.app.switchReportType('${rt.type}')" style="background: ${rt.type === activeReportType ? '#FAF8F5' : '#FFFFFF'}; border: 1.5px solid ${rt.type === activeReportType ? 'var(--gold-primary)' : 'var(--border-light)'}; border-radius: 8px; padding: 0.85rem; cursor: pointer; transition: all 0.2s ease;">
            <div style="font-size: 1.4rem; margin-bottom: 0.3rem;">${rt.icon}</div>
            <strong style="font-size: 0.85rem; color: var(--text-primary); display: block;">${rt.name}</strong>
            <p style="font-size: 0.72rem; color: var(--text-muted); margin: 0.3rem 0 0 0; line-height: 1.35;">${rt.desc}</p>
          </div>
        `).join('')}
      </div>

      <!-- Action Banner: PDF, Excel & CSV Export -->
      <div style="background: #0F172A; color: #FFFFFF; border-radius: 8px; padding: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
        <div>
          <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--gold-primary); font-weight: 800;">Multi-Format Clinical Export</div>
          <h4 style="font-family: 'Playfair Display', serif; font-size: 1.15rem; margin: 0.2rem 0; color: #FFFFFF;">
            ${reportTypes.find(r => r.type === activeReportType)?.name || 'Clinical Skin Dossier'}
          </h4>
          <span style="font-size: 0.78rem; color: #94A3B8;">Multi-sheet Excel workbook, raw CSV telemetry, or board-certified printable PDF.</span>
        </div>

        <div style="display: flex; gap: 0.65rem; flex-wrap: wrap;">
          <button class="btn btn-sm btn-primary" onclick="window.app.handleDownloadExcelExport('${activeReportType}')" style="font-weight: 700; background: linear-gradient(135deg, #D4AF37 0%, #AA7C11 100%); color: #0F172A; border: none; display: flex; align-items: center; gap: 0.4rem;" title="Download multi-sheet Excel (.xlsx / .xls) spreadsheet workbook">
            <span>📊 Export to Excel (.xlsx)</span>
          </button>
          <button class="btn btn-sm btn-outline" onclick="window.app.handleDownloadCSVExport('${activeReportType === 'routine' ? 'routine_logs' : (activeReportType === 'product_recs' ? 'products' : 'progress')}')" style="font-weight: 700; color: #FFFFFF; border-color: rgba(255,255,255,0.3); display: flex; align-items: center; gap: 0.4rem;" title="Download raw comma-separated CSV">
            <span>📑 Export CSV</span>
          </button>
          <button class="btn btn-sm btn-outline" onclick="window.app.handleGenerateAndPrintPDF('${activeReportType}')" style="font-weight: 700; color: #FFFFFF; border-color: rgba(255,255,255,0.3); display: flex; align-items: center; gap: 0.4rem;" title="Print clean A4 PDF diagnostic summary">
            <span>🖨️ Printable PDF</span>
          </button>
        </div>
      </div>

      <!-- Past Reports Archive -->
      <div style="font-size: 0.78rem; font-weight: 800; color: var(--text-primary); text-transform: uppercase; margin-bottom: 0.65rem;">
        Generated Reports Archive
      </div>
      <div style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 180px; overflow-y: auto;">
        ${(reportsList && reportsList.length > 0 ? reportsList : [
          { id: 1, title: 'Executive Comprehensive Skin Intelligence Dossier', created_at: new Date().toISOString(), format: 'pdf' },
          { id: 2, title: 'Cutaneous Biomarker & Optical Diagnostic Assessment Report', created_at: new Date(Date.now() - 86400000 * 2).toISOString(), format: 'pdf' }
        ]).map(r => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0.85rem; background: #FAF9F6; border: 1px solid var(--border-light); border-radius: 6px; font-size: 0.8rem;">
            <div>
              <strong style="color: var(--text-primary);">${r.title}</strong>
              <div style="font-size: 0.72rem; color: var(--text-muted);">${new Date(r.created_at).toLocaleDateString()}</div>
            </div>
            <button class="btn btn-sm btn-outline" onclick="window.app.openReportPDFPreview(${r.id})" style="font-size: 0.72rem; padding: 0.25rem 0.55rem;">
              Preview PDF
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ════════════════════════════════════════════════════════════════
// CONSULTANT REGIMEN MANAGEMENT MODAL RENDERER
// ════════════════════════════════════════════════════════════════

export function renderConsultantRegimenModalContent(clientId = 1) {
  return `
    <div class="modal-header">
      <div>
        <h3 style="font-family: 'Playfair Display', serif; font-size: 1.35rem; margin: 0;">📝 Consultant Regimen Management</h3>
        <p class="text-muted" style="font-size: 0.82rem; margin: 0.2rem 0 0 0;">Customize active ingredients and routine instructions for Client #PX-0000${clientId}</p>
      </div>
      <button class="close-btn" onclick="window.app.closeModal('consultant-regimen-modal')">×</button>
    </div>

    <form id="consultant-regimen-form" onsubmit="window.app.handleSaveConsultantRegimen(event, ${clientId})" style="padding: 1.25rem;">
      <div class="form-group" style="margin-bottom: 1rem;">
        <label style="font-size: 0.8rem; font-weight: 700;">Client Skin Goal & Priority</label>
        <select class="form-control" name="client_priority">
          <option value="Barrier Repair & Hydration">Barrier Repair & Hydration (Standard)</option>
          <option value="Acne & Comedone Clearance" selected>Acne & Comedone Clearance (High)</option>
          <option value="Hyperpigmentation & Dark Spots">Hyperpigmentation & Dark Spots</option>
        </select>
      </div>

      <div class="form-group" style="margin-bottom: 1rem;">
        <label style="font-size: 0.8rem; font-weight: 700;">Morning Regimen Instructions</label>
        <textarea name="morning_notes" class="form-control" rows="2">CeraVe Hydrating Cleanser -> Panacea 15% Vitamin C -> La Roche-Posay Fluid -> SPF 50+ Mineral Shield.</textarea>
      </div>

      <div class="form-group" style="margin-bottom: 1rem;">
        <label style="font-size: 0.8rem; font-weight: 700;">Evening Regimen Instructions</label>
        <textarea name="evening_notes" class="form-control" rows="2">Micellar Cleanse -> CeraVe Gel Cleanse -> Topical Adapalene 0.1% (3x/wk) -> Illiyoon Ceramide Seal.</textarea>
      </div>

      <div style="margin-top: 1.25rem; display: flex; justify-content: flex-end; gap: 0.75rem;">
        <button type="button" class="btn btn-outline btn-sm" onclick="window.app.closeModal('consultant-regimen-modal')">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm" style="font-weight: 700;">Save Regimen Protocol</button>
      </div>
    </form>
  `;
}

// ════════════════════════════════════════════════════════════════
// DERMATOLOGIST MEDICAL RX MODAL RENDERER
// ════════════════════════════════════════════════════════════════

export function renderDermatologistRxModalContent(patientId = 1) {
  return `
    <div class="modal-header">
      <div>
        <h3 style="font-family: 'Playfair Display', serif; font-size: 1.35rem; margin: 0;">💊 Board Medical Prescription (Rx)</h3>
        <p class="text-muted" style="font-size: 0.82rem; margin: 0.2rem 0 0 0;">Issue authorized clinical digital prescription for Patient #PX-0000${patientId}</p>
      </div>
      <button class="close-btn" onclick="window.app.closeModal('dermatologist-rx-modal')">×</button>
    </div>

    <form id="dermatologist-rx-form" onsubmit="window.app.handleSaveDermatologistRx(event, ${patientId})" style="padding: 1.25rem;">
      <div class="form-group" style="margin-bottom: 1rem;">
        <label style="font-size: 0.8rem; font-weight: 700;">Prescribed Medication & Strength</label>
        <input type="text" name="prescription_text" class="form-control" value="Topical Adapalene 0.1% Gel (PM 3x/wk) + Azelaic Acid 15% (AM Daily)">
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
        <div class="form-group">
          <label style="font-size: 0.8rem; font-weight: 700;">Refill Count</label>
          <input type="number" name="refills" class="form-control" value="3" min="0" max="12">
        </div>
        <div class="form-group">
          <label style="font-size: 0.8rem; font-weight: 700;">Next Optical Review Date</label>
          <input type="date" name="review_date" class="form-control" value="2025-12-24">
        </div>
      </div>

      <div class="form-group" style="margin-bottom: 1rem;">
        <label style="font-size: 0.8rem; font-weight: 700;">Clinical Contraindication Notes & Instructions</label>
        <textarea name="clinical_instructions" class="form-control" rows="2">Apply pea-sized amount onto dry skin. Use SPF 50+ mineral sunscreen daily to prevent retinoid photosensitivity.</textarea>
      </div>

      <div style="background: #FAF9F6; border: 1px solid var(--border-gold); border-radius: 6px; padding: 0.75rem; font-size: 0.75rem; color: #64748B; margin-bottom: 1.25rem;">
        🔒 Digitally signed by <strong>Dr. Rajni Verma, MD</strong> (License #DERM-884920-CL)
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
        <button type="button" class="btn btn-outline btn-sm" onclick="window.app.closeModal('dermatologist-rx-modal')">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm" style="font-weight: 700; background: #2E7D32; border-color: #2E7D32;">Sign & Issue Prescription (Rx)</button>
      </div>
    </form>
  `;
}





