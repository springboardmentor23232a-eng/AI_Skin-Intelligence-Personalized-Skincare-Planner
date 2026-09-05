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
  generateCalendar30Days
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

      <!-- SECTION 4: CLINICAL CONSULTATIONS & DATA SHARING HUB -->
      <section id="consult-doctors" class="doctors-section section-margin-lg">
        <div class="section-tag-pill reveal">• CLINICAL CARE & PRIVACY</div>
        <div class="doctors-header-row reveal delay-1">
          <div>
            <h2 class="editorial-section-title">Clinical Consultations & Consent Hub</h2>
            <p class="editorial-section-subtitle">Connect with your assigned licensed esthetician & board-certified dermatologist. Control granular data sharing consent in real time.</p>
          </div>
          <button class="btn btn-primary" onclick="window.app.navigateToView('consultations')" style="font-weight: 700; padding: 0.6rem 1.4rem;">
            Open Consultations & Privacy Hub →
          </button>
        </div>

        <div class="doctors-grid">
          <!-- Specialist 1: Elena Vance -->
          <div class="doctor-card reveal delay-1" style="background: #FFFFFF; border-radius: var(--radius-md); border: 1px solid var(--border-light); padding: 1.25rem;">
            <div class="doctor-img-box" style="position: relative; margin-bottom: 1rem;">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300" alt="Elena Vance, LE" class="doctor-img" style="width: 100%; height: 180px; object-fit: cover; border-radius: var(--radius-sm);">
              <span class="badge badge-success status-tag" style="position: absolute; top: 10px; right: 10px;">🟢 Assigned Consultant</span>
            </div>
            <div class="doctor-info">
              <h3 style="margin: 0 0 0.25rem; font-family: 'Playfair Display', serif;">Elena Vance, LE</h3>
              <span class="doctor-spec" style="font-size: 0.72rem; color: var(--gold-primary); font-weight: 800; letter-spacing: 0.08em; display: block; margin-bottom: 0.4rem;">LEAD CLINICAL ESTHETICIAN</span>
              <p class="doctor-exp" style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.75rem;">Specializes in barrier consolidation, lipid balance, and bespoke AM/PM routines.</p>
              <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-sm btn-primary" onclick="window.app.navigateToView('consultations')" style="width: 50%; font-size: 0.76rem; font-weight: 700;">Notes & Rx</button>
                <button class="btn btn-sm btn-outline" onclick="window.app.openChatWithContact('2')" style="width: 50%; font-size: 0.76rem; font-weight: 700;">💬 Message</button>
              </div>
            </div>
          </div>

          <!-- Specialist 2: Dr. Julian Rostova -->
          <div class="doctor-card reveal delay-2" style="background: #FFFFFF; border-radius: var(--radius-md); border: 1px solid var(--border-light); padding: 1.25rem;">
            <div class="doctor-img-box" style="position: relative; margin-bottom: 1rem;">
              <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300" alt="Dr. Julian Rostova, MD" class="doctor-img" style="width: 100%; height: 180px; object-fit: cover; border-radius: var(--radius-sm);">
              <span class="badge badge-success status-tag" style="position: absolute; top: 10px; right: 10px; background: #2E7D32;">🟢 Assigned Physician</span>
            </div>
            <div class="doctor-info">
              <h3 style="margin: 0 0 0.25rem; font-family: 'Playfair Display', serif;">Dr. Julian Rostova, MD</h3>
              <span class="doctor-spec" style="font-size: 0.72rem; color: #2E7D32; font-weight: 800; letter-spacing: 0.08em; display: block; margin-bottom: 0.4rem;">BOARD-CERTIFIED DERMATOLOGIST</span>
              <p class="doctor-exp" style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.75rem;">Clinical director oversee active medical prescriptions (Rx) and optical lesion screenings.</p>
              <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-sm btn-primary" onclick="window.app.navigateToView('consultations')" style="width: 50%; font-size: 0.76rem; font-weight: 700; background: #2E7D32; border-color: #2E7D32;">Review Rx</button>
                <button class="btn btn-sm btn-outline" onclick="window.app.openChatWithContact('3')" style="width: 50%; font-size: 0.76rem; font-weight: 700;">💬 Message</button>
              </div>
            </div>
          </div>

          <!-- Specialist 3: Lumina AI Skincare Copilot -->
          <div class="doctor-card reveal delay-3" style="background: #FFFFFF; border-radius: var(--radius-md); border: 1px solid var(--gold-primary); padding: 1.25rem; box-shadow: 0 4px 20px rgba(212,175,55,0.12);">
            <div class="doctor-img-box" style="position: relative; margin-bottom: 1rem;">
              <div style="width: 100%; height: 180px; background: #000; border-radius: var(--radius-sm); display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--gold-primary);">
                <span style="font-size: 2.8rem; margin-bottom: 0.35rem;">✨</span>
                <span style="font-family: 'Playfair Display', serif; font-size: 1.15rem; color: #FFFFFF; font-weight: 700;">Lumina AI Copilot</span>
                <span style="font-size: 0.68rem; letter-spacing: 0.1em; color: var(--gold-primary); font-weight: 800;">24/7 INSTANT INTELLIGENCE</span>
              </div>
              <span class="badge badge-accent status-tag" style="position: absolute; top: 10px; right: 10px;">⚡ AI Instant</span>
            </div>
            <div class="doctor-info">
              <h3 style="margin: 0 0 0.25rem; font-family: 'Playfair Display', serif;">Lumina AI Copilot</h3>
              <span class="doctor-spec" style="font-size: 0.72rem; color: var(--gold-primary); font-weight: 800; letter-spacing: 0.08em; display: block; margin-bottom: 0.4rem;">CLINICAL DERMA ASSISTANT</span>
              <p class="doctor-exp" style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.75rem;">Instant ingredient safety, formulation conflict checks, barrier recovery advice, and routine guidance.</p>
              <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-sm btn-primary" onclick="window.app.openChatWithContact('lumina_ai')" style="width: 100%; font-size: 0.78rem; font-weight: 700;">💬 Chat with Lumina AI →</button>
              </div>
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
      <!-- LUXURY CLINIC RECEPTION HERO BANNER -->
      <div class="clinic-hero-banner-container">
        <div class="clinic-hero-overlay"></div>

        <!-- LEFT: FROSTED GLASS SKIN PROFILE CARD -->
        <div class="glass-profile-card">
          <!-- Top Row: AR Monogram Seal, Title, Active Badge, Settings Gear -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.85rem;">
            <div style="display: flex; align-items: center; gap: 0.95rem;">
              <!-- Metallic Embossed Seal -->
              <div class="monogram-seal-ar">
                <span class="monogram-seal-text">${(data.profile.name || 'A').split(' ').map(n => n[0]).join('').slice(0, 2) || 'AR'}</span>
              </div>
              <div>
                <div style="font-size: 0.7rem; font-weight: 800; color: #8A8177; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.15rem;">SKIN PROFILE</div>
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                  <h2 style="font-family: 'Playfair Display', serif; font-size: 1.55rem; color: #181614; margin: 0; font-weight: 700; line-height: 1.15;">
                    ${data.profile.name}
                  </h2>
                  <span style="display: inline-flex; align-items: center; gap: 0.35rem; background: rgba(46, 125, 50, 0.12); border: 1px solid rgba(46, 125, 50, 0.3); color: #2E7D32; font-size: 0.68rem; font-weight: 800; padding: 0.18rem 0.55rem; border-radius: 14px; letter-spacing: 0.05em; box-shadow: 0 0 10px rgba(46, 125, 50, 0.15);">
                    <span style="width: 6px; height: 6px; border-radius: 50%; background: #2E7D32; box-shadow: 0 0 6px #2E7D32; display: inline-block;"></span> ACTIVE
                  </span>
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
              <span><strong>${data.profile.skinType} Skin</strong></span>
              <span style="color: #C2BBB2;">|</span>
              <span>Age <strong>${data.profile.ageGroup}</strong></span>
              <span style="color: #C2BBB2;">|</span>
              <span>Barrier: <strong style="color: #2E7D32;">Healthy</strong> ✔</span>
              <span style="color: #C2BBB2;">|</span>
              <span>Score: <strong style="color: var(--text-primary);">${data.skinScore.overall}/100</strong></span>
            </div>
          </div>

          <!-- Bottom: Routine Adherence & Analysis Timestamp -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; padding: 0 0.25rem; font-size: 0.74rem; color: #767069; flex-wrap: wrap; gap: 0.4rem;">
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <span>Routine Adherence: <strong>95%</strong></span>
              <span style="display: inline-block; width: 24px; height: 10px; background: #E2DDD4; border-radius: 3px; overflow: hidden; border: 1px solid #BFB8AC; vertical-align: middle;">
                <span style="display: block; width: 95%; height: 100%; background: #2E7D32;"></span>
              </span>
            </div>
            <div>Last Full Analysis: <strong>2 days ago</strong></div>
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
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Habit Streak & Progress</div>
          <div style="font-size: 1.8rem; font-weight: 800; color: var(--text-primary); margin: 0.2rem 0;">18 Days <small style="font-size: 1rem;">🔥</small></div>
          <div style="font-size: 0.78rem; color: var(--accent-emerald); font-weight: 600; cursor: pointer;" onclick="window.app.navigateToView('progress')">
            +10.9 pts gain &bull; View Analytics &rarr;
          </div>
        </div>
      </div>

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
          ${(data.recommendedProducts || []).map(p => `
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
          `).join('')}
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
            Overall Weighted Score: <span style="color: var(--accent-emerald); font-size: 1.1rem;">77.8 / 100</span> (Grade: Good - Improving)
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
            <span style="font-size: 0.85rem; color: #EAE6DF;">• Elena Vance, LE</span>
          </div>
          <h2 style="color: #FFFFFF; font-family: 'Playfair Display', serif; font-size: 1.85rem; margin: 0 0 0.35rem;">Consultant Workspace — Elena Vance, LE</h2>
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
            <span style="font-size: 0.85rem; color: #EAE6DF;">• Dr. Julian Rostova, MD (Clinical Director)</span>
          </div>
          <h2 style="color: #FFFFFF; font-family: 'Playfair Display', serif; font-size: 1.85rem; margin: 0 0 0.35rem;">Clinical Skincare Portal — Dr. Julian Rostova, MD</h2>
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

// ════════════════════════════════════════════════════════════════
// DEDICATED SKINCARE PRODUCTS EXPLORER & INTELLIGENCE MARKETPLACE
// ════════════════════════════════════════════════════════════════

export function renderProductsExplorerPage(options = {}, profile = MOCK_USER_DATA.profile) {
  const currentOptions = {
    query: options.query || '',
    category: options.category || 'All',
    budget_tier: options.budget_tier || 'All',
    min_price: options.min_price || 0,
    max_price: options.max_price || 5000,
    skin_type: options.skin_type || profile.skinType || 'Combination',
    target_concern: options.target_concern || 'All',
    brand: options.brand || 'All',
    min_score: options.min_score || 0,
    sort_by: options.sort_by || 'match_desc'
  };

  const currentProfile = {
    ...profile,
    skinType: currentOptions.skin_type || profile.skinType
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
              Score: <strong style="color: #FFFFFF;">${MOCK_USER_DATA.skinScore.overall}/100</strong> • ${currentProfile.primaryConcerns?.length || 0} Concerns
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
              <span>💰 Budget Range</span>
              <small style="color: var(--gold-primary); font-size: 0.8rem; font-weight: 700;">Up to ₹${currentOptions.max_price}</small>
            </div>

            <!-- Quick Budget Tier Chips -->
            <div class="budget-chips-grid" style="margin-bottom: 0.85rem;">
              <button class="budget-chip-btn ${currentOptions.budget_tier === 'All' ? 'active' : ''}" onclick="window.app.updateProductFilter('budget_tier', 'All')">
                All Budgets
              </button>
              <button class="budget-chip-btn ${currentOptions.budget_tier === 'Budget' ? 'active' : ''}" onclick="window.app.updateProductFilter('budget_tier', 'Budget')">
                Under ₹600 🏷️
              </button>
              <button class="budget-chip-btn ${currentOptions.budget_tier === 'Mid-Range' ? 'active' : ''}" onclick="window.app.updateProductFilter('budget_tier', 'Mid-Range')">
                ₹600 - ₹1.5k ✨
              </button>
              <button class="budget-chip-btn ${currentOptions.budget_tier === 'Premium' ? 'active' : ''}" onclick="window.app.updateProductFilter('budget_tier', 'Premium')">
                ₹1.5k - ₹3k 💎
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
              <span>🧴 Category</span>
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
              <span>🎯 Target Concern</span>
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
              <span>🌟 Match Score</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.35rem;">
              <label class="filter-checkbox-item">
                <input type="radio" name="min_score_radio" value="0" ${currentOptions.min_score === 0 ? 'checked' : ''} onchange="window.app.updateProductFilter('min_score', 0)" style="accent-color: var(--gold-primary);">
                <span>All Compatibility Levels</span>
              </label>
              <label class="filter-checkbox-item">
                <input type="radio" name="min_score_radio" value="90" ${currentOptions.min_score === 90 ? 'checked' : ''} onchange="window.app.updateProductFilter('min_score', 90)" style="accent-color: var(--gold-primary);">
                <span>90%+ Top Matches Only 🌟</span>
              </label>
              <label class="filter-checkbox-item">
                <input type="radio" name="min_score_radio" value="80" ${currentOptions.min_score === 80 ? 'checked' : ''} onchange="window.app.updateProductFilter('min_score', 80)" style="accent-color: var(--gold-primary);">
                <span>80%+ Great Choices ✨</span>
              </label>
            </div>
          </div>

          <!-- BRAND FILTER -->
          <div class="filter-group">
            <div class="filter-section-title">
              <span>🏷️ Brand</span>
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
                <option value="match_desc" ${currentOptions.sort_by === 'match_desc' ? 'selected' : ''}>🌟 Highest AI Match Score</option>
                <option value="price_asc" ${currentOptions.sort_by === 'price_asc' ? 'selected' : ''}>💵 Price: Low to High</option>
                <option value="price_desc" ${currentOptions.sort_by === 'price_desc' ? 'selected' : ''}>💎 Price: High to Low</option>
                <option value="rating_desc" ${currentOptions.sort_by === 'rating_desc' ? 'selected' : ''}>★ Highest Customer Rating</option>
                <option value="popular_desc" ${currentOptions.sort_by === 'popular_desc' ? 'selected' : ''}>🔥 Most Popular / Best Sellers</option>
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
        <div class="compare-winner-banner">
          <div style="font-size: 2rem;">🏆</div>
          <div>
            <strong style="font-size: 1rem; color: #8A6400;">AI Recommendation Winner</strong>
            <p style="font-size: 0.85rem; color: var(--text-primary); margin: 0.2rem 0 0;">${winner.reason}</p>
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

export function renderProgressAnalyticsPage() {
  const data = MOCK_PROGRESS_TRACKING_DATA;
  const comp = data.beforeAfterComparison;
  const adherence = data.adherence;
  const report = data.improvementReport;
  const calendarDays = generateCalendar30Days();
  const trendData = generateTrendTrajectoryData('30d');

  return `
    <div class="editorial-container progress-analytics-page" style="padding-top: 1.5rem;">

      <!-- HERO CLINICAL HEADER WITH KPI METRIC STRIP -->
      <div class="progress-hero-header" style="background: linear-gradient(135deg, #FAF8F5 0%, #F3EFE6 100%); border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 1.8rem; margin-bottom: 1.75rem; position: relative; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; position: relative; z-index: 2;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem;">
              <span class="section-tag-pill" style="font-size: 0.72rem; padding: 0.2rem 0.65rem; background: rgba(197, 155, 39, 0.15); color: #8A6400; font-weight: 800;">
                MODULE 8 • PROGRESS TRACKING & ANALYTICS
              </span>
              <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">• 30-Day Clinical Telemetry</span>
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
              📸 New Progress Scan
            </button>
            <button class="btn btn-outline btn-sm" onclick="window.app.handleDailyAdherenceCheckIn()" style="font-weight: 700; padding: 0.55rem 1.1rem; background: #FFFFFF;">
              ✅ Check-In Today (+2.5 pts)
            </button>
            <button class="btn btn-outline btn-sm" onclick="window.app.exportClinicalProgressReport()" style="font-weight: 700; padding: 0.55rem 0.95rem; background: #FFFFFF;" title="Print or Export Clinical PDF Summary">
              📄 Export Report
            </button>
          </div>
        </div>

        <!-- 4 EXECUTIVE KPI STAT CARDS -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 1rem; margin-top: 1.5rem; position: relative; z-index: 2;">
          <div style="background: rgba(255,255,255,0.85); backdrop-filter: blur(8px); border: 1px solid var(--border-light); border-left: 4px solid var(--gold-primary); border-radius: var(--radius-sm); padding: 1rem 1.15rem;">
            <div style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Cutaneous Health Delta</div>
            <div style="font-size: 1.65rem; font-weight: 800; color: var(--text-primary); margin: 0.2rem 0;">
              68.5 &rarr; 79.4 <span style="font-size: 0.95rem; color: var(--accent-emerald); font-weight: 700;">(+10.9 pts)</span>
            </div>
            <div style="font-size: 0.76rem; color: var(--text-muted);">Velocity: <strong>+2.54 pts / week</strong></div>
          </div>

          <div style="background: rgba(255,255,255,0.85); backdrop-filter: blur(8px); border: 1px solid var(--border-light); border-left: 4px solid var(--accent-emerald); border-radius: var(--radius-sm); padding: 1rem 1.15rem;">
            <div style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">30-Day Routine Adherence</div>
            <div style="font-size: 1.65rem; font-weight: 800; color: var(--text-primary); margin: 0.2rem 0;">
              ${adherence.monthly_compliance_pct}%
            </div>
            <div style="font-size: 0.76rem; color: var(--accent-emerald); font-weight: 600;">58 of 60 AM/PM steps logged</div>
          </div>

          <div style="background: rgba(255,255,255,0.85); backdrop-filter: blur(8px); border: 1px solid var(--border-light); border-left: 4px solid var(--accent-amber); border-radius: var(--radius-sm); padding: 1rem 1.15rem;">
            <div style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Active Habit Streak</div>
            <div style="font-size: 1.65rem; font-weight: 800; color: var(--text-primary); margin: 0.2rem 0;">
              ${adherence.current_streak_days} Days <span style="font-size: 1.1rem;">🔥</span>
            </div>
            <div style="font-size: 0.76rem; color: var(--text-muted);">Personal Best: <strong>${adherence.longest_streak_days} Days</strong></div>
          </div>

          <div style="background: rgba(255,255,255,0.85); backdrop-filter: blur(8px); border: 1px solid var(--border-light); border-left: 4px solid var(--pink-blush); border-radius: var(--radius-sm); padding: 1rem 1.15rem;">
            <div style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;">Clinical Transformation Verdict</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--accent-emerald); margin: 0.35rem 0 0.15rem 0;">
              Significant Improvement 🏆
            </div>
            <div style="font-size: 0.76rem; color: var(--text-muted);">Acne -71.4% &bull; Barrier +65.4%</div>
          </div>
        </div>
      </div>

      <!-- SECTION 1: INTERACTIVE BEFORE / AFTER SPLIT-SCREEN COMPARISON -->
      <section class="glass-card section-margin" style="background: #FFFFFF; padding: 1.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-light); margin-bottom: 2rem;">
        <div class="card-header" style="border-bottom: 1px solid var(--border-light); padding-bottom: 0.85rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.2rem;">📸</span>
              <h2 style="font-family: 'Playfair Display', serif; font-size: 1.35rem; margin: 0;">Interactive Before & After Optical Comparison</h2>
            </div>
            <p class="text-muted" style="font-size: 0.82rem; margin-top: 0.15rem;">
              Drag the interactive slider handle left/right to visually inspect cutaneous resolution over time
            </p>
          </div>

          <!-- Milestone Pair Switcher -->
          <div style="display: flex; gap: 0.35rem; background: #FAF9F6; padding: 0.25rem; border-radius: 20px; border: 1px solid var(--border-light);">
            <button class="tab-btn active" id="btn-pair-30d" onclick="window.app.switchBeforeAfterPair('30d')" style="font-size: 0.76rem; padding: 0.3rem 0.8rem;">
              Day 1 Baseline vs Day 30 ✨
            </button>
            <button class="tab-btn" id="btn-pair-14d" onclick="window.app.switchBeforeAfterPair('14d')" style="font-size: 0.76rem; padding: 0.3rem 0.8rem;">
              Day 1 vs Week 2
            </button>
            <button class="tab-btn" id="btn-pair-w4" onclick="window.app.switchBeforeAfterPair('w4')" style="font-size: 0.76rem; padding: 0.3rem 0.8rem;">
              Week 2 vs Week 4
            </button>
          </div>
        </div>

        <!-- SPLIT COMPARISON SLIDER & BIOMARKER MATRIX SPLIT -->
        <div style="display: grid; grid-template-columns: minmax(320px, 460px) 1fr; gap: 1.5rem; align-items: start;">
          
          <!-- LEFT: DRAGGABLE BEFORE/AFTER SLIDER CONTAINER -->
          <div class="before-after-slider-container" id="before-after-slider-box" style="position: relative; width: 100%; height: 380px; border-radius: var(--radius-sm); overflow: hidden; border: 2px solid var(--border-gold); box-shadow: 0 8px 24px rgba(0,0,0,0.1); user-select: none;">
            <!-- AFTER IMAGE (Underneath, Full Width) -->
            <img src="${comp.current_image}" alt="After Treatment Skin" class="ba-image-after" style="width: 100%; height: 100%; object-fit: cover; display: block;">
            
            <!-- BEFORE IMAGE (Clipped on top) -->
            <div class="ba-image-before-wrapper" id="ba-before-wrapper" style="position: absolute; top: 0; left: 0; width: 50%; height: 100%; overflow: hidden;">
              <img src="${comp.baseline_image}" alt="Baseline Skin" class="ba-image-before" style="width: 460px; height: 380px; object-fit: cover; max-width: none; display: block;">
              <!-- Label Pill Before -->
              <div style="position: absolute; top: 12px; left: 12px; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); color: #fff; padding: 0.25rem 0.65rem; border-radius: 12px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.05em; border: 1px solid rgba(255,255,255,0.2);">
                BEFORE • ${comp.baseline_date} (68.5)
              </div>
            </div>

            <!-- Label Pill After -->
            <div style="position: absolute; top: 12px; right: 12px; background: rgba(46, 125, 50, 0.85); backdrop-filter: blur(6px); color: #fff; padding: 0.25rem 0.65rem; border-radius: 12px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.05em; border: 1px solid rgba(255,255,255,0.2);">
              AFTER • ${comp.current_date} (79.4)
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
          </div>

          <!-- RIGHT: OPTICAL BIOMARKERS DELTA MATRIX TABLE -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <h4 style="font-family: 'Playfair Display', serif; font-size: 1.1rem; margin: 0;">Optical Biomarker Delta Matrix</h4>
              <span class="badge badge-success" style="font-size: 0.72rem; font-weight: 700;">${comp.days_elapsed} Days Elapsed</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.6rem;">
              ${comp.biomarker_deltas.map(b => {
    const isGain = b.delta_percentage > 0;
    const isGood = b.parameter.includes('Acne') || b.parameter.includes('Redness') || b.parameter.includes('Pigmentation') || b.parameter.includes('Sebum') ? !isGain : isGain;
    const badgeColor = isGood ? 'var(--accent-emerald)' : 'var(--accent-rose)';
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
                        ${b.baseline_val} &rarr; <strong style="color: var(--text-primary); font-size: 0.85rem;">${b.current_val}</strong>
                      </div>
                      <span style="display: inline-block; background: rgba(46, 125, 50, 0.1); color: ${badgeColor}; font-size: 0.75rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 6px;">
                        ${pctSign} (${deltaSign})
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

      <!-- SECTION 2: 60-DAY HISTORICAL & 30-DAY AI PREDICTIVE TREND ANALYSIS -->
      <section class="glass-card section-margin" style="background: #FFFFFF; padding: 1.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-light); margin-bottom: 2rem;">
        <div class="card-header" style="border-bottom: 1px solid var(--border-light); padding-bottom: 0.85rem; margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.2rem;">📈</span>
              <h2 style="font-family: 'Playfair Display', serif; font-size: 1.35rem; margin: 0;">Skin Health Trajectory & 30-Day Predictive AI Forecast</h2>
            </div>
            <p class="text-muted" style="font-size: 0.82rem; margin-top: 0.15rem;">
              Statistical regression modeling based on your 18-day active streak and optical biomarker response
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
              Current Velocity: <strong style="color: var(--accent-emerald);">+2.54 pts / week</strong> &bull; Estimated to 85+: <strong>22 Days</strong>
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
              <text x="390" y="15" font-size="11" font-weight="bold" fill="#181614" font-family="sans-serif">TODAY (79.4)</text>

              <!-- Historical Area Fill -->
              <polygon points="50,158 110,147 170,136 230,126 290,118 350,112 410,107 410,210 50,210" fill="url(#scoreAreaGrad)"/>
              
              <!-- Historical Line (Score: 68.5 -> 79.4) -->
              <path d="M 50,158 Q 170,135 290,118 T 410,107" fill="none" stroke="#C59B27" stroke-width="3.5" stroke-linecap="round"/>

              <!-- Checkpoint Circles on Historical Line -->
              <circle cx="50" cy="158" r="5" fill="#FFFFFF" stroke="#C59B27" stroke-width="3"/>
              <text x="45" y="180" font-size="10" font-weight="bold" fill="#716A61" text-anchor="middle">Day 1 (68.5)</text>

              <circle cx="170" cy="136" r="4.5" fill="#FFFFFF" stroke="#C59B27" stroke-width="2.5"/>
              <text x="170" y="125" font-size="9" fill="#716A61" text-anchor="middle">W2 (72.0)</text>

              <circle cx="290" cy="118" r="4.5" fill="#FFFFFF" stroke="#C59B27" stroke-width="2.5"/>
              <text x="290" y="106" font-size="9" fill="#716A61" text-anchor="middle">W4 (75.8)</text>

              <circle cx="410" cy="107" r="6" fill="#2E7D32" stroke="#FFFFFF" stroke-width="2"/>

              <!-- Projected Forecast Area Fill -->
              <polygon points="410,107 470,95 530,86 590,78 650,72 710,68 770,65 770,210 410,210" fill="url(#projAreaGrad)"/>

              <!-- Projected Forecast Line (Score: 79.4 -> 86.5) -->
              <path d="M 410,107 Q 530,85 650,72 T 770,65" fill="none" stroke="#2E7D32" stroke-width="3" stroke-dasharray="6 4" stroke-linecap="round"/>

              <!-- Projected End Circle -->
              <circle cx="770" cy="65" r="5" fill="#FFFFFF" stroke="#2E7D32" stroke-width="3"/>
              <text x="760" y="52" font-size="10" font-weight="bold" fill="#2E7D32" text-anchor="middle">+30d (84.5)</text>

              <!-- X-Axis Labels -->
              <text x="50" y="228" font-size="10" fill="#94A3B8" text-anchor="middle">Oct 24</text>
              <text x="170" y="228" font-size="10" fill="#94A3B8" text-anchor="middle">Nov 02</text>
              <text x="290" y="228" font-size="10" fill="#94A3B8" text-anchor="middle">Nov 14</text>
              <text x="410" y="228" font-size="10" font-weight="bold" fill="#181614" text-anchor="middle">Nov 24 (Today)</text>
              <text x="530" y="228" font-size="10" fill="#94A3B8" text-anchor="middle">Dec 04</text>
              <text x="650" y="228" font-size="10" fill="#94A3B8" text-anchor="middle">Dec 14</text>
              <text x="770" y="228" font-size="10" fill="#94A3B8" text-anchor="middle">Dec 24</text>
            </svg>
          </div>
        </div>

        <!-- 4 KEY TREND INDICATORS -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.85rem;">
          ${trendData.key_trend_indicators.map(ind => `
            <div style="padding: 0.9rem; background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm);">
              <div style="font-size: 0.73rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">${ind.indicator}</div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 0.25rem;">
                <strong style="font-size: 0.95rem; color: var(--text-primary);">${ind.trend}</strong>
                <span style="font-size: 0.85rem; font-weight: 800; color: var(--accent-emerald);">${ind.delta}</span>
              </div>
            </div>
          `).join('')}
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
    const isToday = day.day_number === 24;
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
              <strong style="font-family: 'Playfair Display', serif; font-size: 1.05rem; color: var(--text-primary);">Dr. Elena Rostova, Board-Certified Dermatologist AI</strong>
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
 * RENDER CLINICAL CONSULTATIONS & DATA SHARING HUB PAGE
 * Dedicated page for managing specialist consultations, booking sessions,
 * and configuring granular HIPAA/GDPR data sharing consent permissions.
 */
export function renderConsultationsPage(consultData = null, prefsData = null, specialistsList = null) {
  const consult = consultData?.consultation || {
    condition: 'Mild Comedonal Acne & Post-Acne PIH',
    status: 'Under Active Regimen',
    prescription: 'Topical Adapalene 0.1% (PM 3x/wk) + Azelaic Acid 15% (AM)',
    consultant_notes: 'Patient showed +54.2% hydration boost. Barrier restored after introducing ceramide night barrier seal.',
    clinical_notes: 'Follicular retention hyperkeratosis clearing satisfactorily. Recommend maintaining current Retinoid cadence.',
    last_visit: '24 Nov 2025',
    next_review: '24 Dec 2025'
  };

  const appointments = consultData?.appointments || [
    {
      id: 1,
      specialist_name: 'Elena Vance, LE',
      specialist_role: 'consultant',
      type: 'Virtual Regimen Review & Barrier Check',
      scheduled_date: '10 Dec 2025 • 2:30 PM EST',
      status: 'confirmed'
    },
    {
      id: 2,
      specialist_name: 'Dr. Julian Rostova, MD',
      specialist_role: 'dermatologist',
      type: 'Clinical Prescription & Lesion Follow-up',
      scheduled_date: '24 Dec 2025 • 10:00 AM EST',
      status: 'scheduled'
    }
  ];

  const prefs = prefsData || {
    consultant: {
      shared: true,
      biomarkers: true,
      photos_and_lesions: true,
      adherence_and_compliance: true,
      medical_and_rx_history: false,
      lifestyle_logs: true
    },
    doctor: {
      shared: true,
      biomarkers: true,
      photos_and_lesions: true,
      adherence_and_compliance: true,
      medical_and_rx_history: true,
      lifestyle_logs: true
    }
  };

  const cPref = prefs.consultant || {};
  const dPref = prefs.doctor || {};

  return `
    <div class="container" style="padding-top: 2rem; padding-bottom: 4rem;">
      <!-- PAGE HEADER -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1.5rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border-light); padding-bottom: 1.5rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.4rem;">
            <div class="section-tag-pill" style="margin: 0;">• CLINICAL PORTAL & CONSENT</div>
            <span class="badge badge-accent" style="font-size: 0.75rem;">🛡️ HIPAA/GDPR Granular Consent Active</span>
          </div>
          <h1 style="font-family: 'Playfair Display', serif; font-size: 2.2rem; margin: 0 0 0.5rem 0; color: var(--text-primary);">
            Clinical Consultations & Data Sharing Hub
          </h1>
          <p class="text-muted" style="margin: 0; font-size: 0.95rem; max-width: 750px;">
            Consult with certified skincare specialists, track digital medical prescriptions, and select exactly what health metrics each clinician is permitted to view.
          </p>
        </div>

        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <button class="btn btn-outline" onclick="window.app.navigateToView('dashboard')" style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700;">
            ← Back to Dashboard
          </button>
          <button class="btn btn-primary" onclick="window.app.openBookingModal(3, 'Dr. Julian Rostova, MD', 'dermatologist')" style="font-weight: 700; background: var(--gold-primary); color: #111;">
            + Book Specialist Consultation
          </button>
        </div>
      </div>

      <!-- SECTION 1: ACTIVE CLINICAL CARE & DIGITAL RX -->
      <section class="glass-card section-margin" style="background: #FFFFFF; padding: 2rem; border-radius: var(--radius-md); border: 1px solid var(--border-light); margin-bottom: 2.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-light); padding-bottom: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2 style="font-family: 'Playfair Display', serif; font-size: 1.4rem; margin: 0 0 0.25rem 0;">Active Clinical Protocol & Digital Rx</h2>
            <p class="text-muted" style="font-size: 0.85rem; margin: 0;">Synchronized notes and prescriptions directly issued by your care team.</p>
          </div>
          <span class="badge badge-success" style="font-size: 0.82rem; padding: 0.4rem 0.9rem;">
            🟢 ${consult.status || 'Under Active Regimen'}
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
          <!-- Consultant Advice Card -->
          <div style="background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 1.4rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100" alt="Elena Vance" style="width: 46px; height: 46px; border-radius: 50%; object-fit: cover; border: 2px solid var(--gold-primary);">
              <div>
                <strong style="font-size: 0.95rem; color: var(--text-primary); display: block;">Elena Vance, LE</strong>
                <span style="font-size: 0.74rem; color: var(--gold-primary); font-weight: 700; text-transform: uppercase;">Lead Clinical Esthetician</span>
              </div>
            </div>
            <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.5rem; font-weight: 700;">REGIMEN RECOMMENDATION & NOTES:</div>
            <p style="font-size: 0.86rem; color: var(--text-secondary); line-height: 1.5; margin: 0 0 1rem 0; background: #FFFFFF; padding: 0.9rem; border-radius: 6px; border: 1px solid var(--border-light);">
              "${consult.consultant_notes || 'Hydration and barrier integrity significantly improved. Maintain ceramide barrier seal.'}"
            </p>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; color: var(--text-muted);">
              <span>Last Review: <strong>${consult.last_visit || '24 Nov 2025'}</strong></span>
              <button class="btn btn-sm btn-outline" style="font-size: 0.75rem; padding: 0.25rem 0.65rem;" onclick="alert('Opening secure asynchronous clinical chat with Elena Vance, LE...')">💬 Message</button>
            </div>
          </div>

          <!-- Doctor Medical Rx Card -->
          <div style="background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 1.4rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
              <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100" alt="Dr. Julian Rostova" style="width: 46px; height: 46px; border-radius: 50%; object-fit: cover; border: 2px solid #2E7D32;">
              <div>
                <strong style="font-size: 0.95rem; color: var(--text-primary); display: block;">Dr. Julian Rostova, MD</strong>
                <span style="font-size: 0.74rem; color: #2E7D32; font-weight: 700; text-transform: uppercase;">Board-Certified Dermatologist</span>
              </div>
            </div>
            <div style="font-size: 0.82rem; color: #2E7D32; margin-bottom: 0.5rem; font-weight: 800;">🩺 ACTIVE DIGITAL PRESCRIPTION (Rx):</div>
            <div style="background: #FFFFFF; padding: 0.9rem; border-radius: 6px; border: 1px solid rgba(46,125,50,0.3); margin-bottom: 0.85rem;">
              <div style="font-weight: 800; font-size: 0.92rem; color: #1E6B23; margin-bottom: 0.25rem;">${consult.prescription || 'Topical Adapalene 0.1% + Azelaic Acid 15%'}</div>
              <div style="font-size: 0.8rem; color: var(--text-secondary);">${consult.clinical_notes || 'Follicular retention hyperkeratosis clearing satisfactorily.'}</div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; color: var(--text-muted);">
              <span>Next Check: <strong>${consult.next_review || '24 Dec 2025'}</strong></span>
              <button class="btn btn-sm btn-primary" style="background: #2E7D32; border-color: #2E7D32; font-size: 0.75rem; padding: 0.25rem 0.65rem;" onclick="alert('Digital prescription verification certified. Valid for pharmacy dispense.')">📄 View Rx</button>
            </div>
          </div>
        </div>

        <!-- UPCOMING SESSIONS TIMELINE -->
        <div style="background: #FFFFFF; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 1.25rem;">
          <h4 style="font-family: 'Playfair Display', serif; font-size: 1.05rem; margin: 0 0 0.85rem 0; color: var(--text-primary);">Upcoming Scheduled Consultations</h4>
          <div style="display: flex; flex-direction: column; gap: 0.65rem;">
            ${appointments.map(app => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: #FAF9F6; border-radius: 6px; border-left: 4px solid ${app.specialist_role === 'dermatologist' ? '#2E7D32' : 'var(--gold-primary)'}; flex-wrap: wrap; gap: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.85rem;">
                  <span style="font-size: 1.2rem;">${app.specialist_role === 'dermatologist' ? '🩺' : '✨'}</span>
                  <div>
                    <strong style="font-size: 0.88rem; color: var(--text-primary);">${app.type || 'Clinical Skincare Consultation'}</strong>
                    <div style="font-size: 0.78rem; color: var(--text-muted);">with ${app.specialist_name} • ${typeof app.scheduled_date === 'string' && app.scheduled_date.includes('T') ? new Date(app.scheduled_date).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' }) : (app.scheduled_date || 'Scheduled')}</div>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <span class="badge ${app.status === 'confirmed' ? 'badge-success' : 'badge-warning'}" style="font-size: 0.75rem;">
                    ${app.status === 'confirmed' ? 'Confirmed Slot' : 'Pending Review'}
                  </span>
                  <button class="btn btn-sm btn-outline" style="font-size: 0.74rem;" onclick="alert('Join video consultation meeting link will activate 10 minutes prior to session.')">📹 Join Call</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- SECTION 2: GRANULAR DATA SHARING & PRIVACY MATRIX -->
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
                  <span style="font-size: 0.75rem; color: var(--gold-primary); font-weight: 700;">Elena Vance, LE (Esthetician)</span>
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
                  <span style="font-size: 0.75rem; color: #2E7D32; font-weight: 700;">Dr. Julian Rostova, MD (Clinical Director)</span>
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

      <!-- SECTION 3: SPECIALIST DIRECTORY & INSTANT BOOKING -->
      <section class="glass-card section-margin" style="background: #FFFFFF; padding: 2rem; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
        <div style="border-bottom: 1px solid var(--border-light); padding-bottom: 1rem; margin-bottom: 1.5rem;">
          <div class="section-tag-pill" style="margin-bottom: 0.4rem;">• CLINICIAN DIRECTORY</div>
          <h2 style="font-family: 'Playfair Display', serif; font-size: 1.4rem; margin: 0 0 0.25rem 0;">PanaceaAI Board of Specialists</h2>
          <p class="text-muted" style="font-size: 0.85rem; margin: 0;">Select a specialist to book a new virtual consultation, prescription review, or regimen optimization.</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
          <!-- Specialist 1 -->
          <div style="background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 1.4rem; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.85rem; margin-bottom: 0.85rem;">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120" alt="Elena Vance" style="width: 54px; height: 54px; border-radius: 50%; object-fit: cover; border: 2px solid var(--gold-primary);">
                <div>
                  <h4 style="font-family: 'Playfair Display', serif; font-size: 1.05rem; margin: 0;">Elena Vance, LE</h4>
                  <span style="font-size: 0.72rem; color: var(--gold-primary); font-weight: 800;">LEAD CLINICAL ESTHETICIAN</span>
                </div>
              </div>
              <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.45; margin-bottom: 1rem;">
                Expert in active ingredient synergy, barrier consolidation, acne non-comedogenic routines, and seasonal adaptation.
              </p>
            </div>
            <button class="btn btn-sm btn-primary" onclick="window.app.openBookingModal(2, 'Elena Vance, LE', 'consultant')" style="font-weight: 700; width: 100%;">
              Book Routine Review ($45) →
            </button>
          </div>

          <!-- Specialist 2 -->
          <div style="background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 1.4rem; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.85rem; margin-bottom: 0.85rem;">
                <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120" alt="Dr. Julian Rostova" style="width: 54px; height: 54px; border-radius: 50%; object-fit: cover; border: 2px solid #2E7D32;">
                <div>
                  <h4 style="font-family: 'Playfair Display', serif; font-size: 1.05rem; margin: 0;">Dr. Julian Rostova, MD</h4>
                  <span style="font-size: 0.72rem; color: #2E7D32; font-weight: 800;">BOARD-CERTIFIED DERMATOLOGIST</span>
                </div>
              </div>
              <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.45; margin-bottom: 1rem;">
                Clinical director specializing in acne vulgaris, rosacea therapeutics, digital prescription management, and optical lesion screening.
              </p>
            </div>
            <button class="btn btn-sm btn-primary" onclick="window.app.openBookingModal(3, 'Dr. Julian Rostova, MD', 'dermatologist')" style="background: #2E7D32; border-color: #2E7D32; font-weight: 700; width: 100%;">
              Book Medical Prescription Session ($85) →
            </button>
          </div>

          <!-- Specialist 3 -->
          <div style="background: #FAF9F6; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 1.4rem; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.85rem; margin-bottom: 0.85rem;">
                <img src="assets/doctor_emily.png" alt="Dr. Emily Roberts" style="width: 54px; height: 54px; border-radius: 50%; object-fit: cover; border: 2px solid var(--text-muted);">
                <div>
                  <h4 style="font-family: 'Playfair Display', serif; font-size: 1.05rem; margin: 0;">Dr. Emily Roberts, MD</h4>
                  <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 800;">COSMETIC DERMATOLOGIST</span>
                </div>
              </div>
              <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.45; margin-bottom: 1rem;">
                Specialist in photodamage reversal, post-inflammatory hyperpigmentation protocols, and collagen stimulation treatments.
              </p>
            </div>
            <button class="btn btn-sm btn-outline" onclick="window.app.openBookingModal(7, 'Dr. Emily Roberts, MD', 'dermatologist')" style="font-weight: 700; width: 100%;">
              Book Aesthetic Consultation ($75) →
            </button>
          </div>
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
      contact_name: 'Elena Vance, LE',
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
      contact_name: 'Dr. Julian Rostova, MD',
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
          <button class="btn btn-sm btn-primary" onclick="window.app.openBookingModal(3, 'Dr. Julian Rostova, MD', 'dermatologist')" style="font-weight: 700; font-size: 0.82rem; background: #2E7D32; border-color: #2E7D32;">
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
            <div id="chat-page-messages-list" style="display: flex; flex-direction: column; gap: 1rem;">
              ${(activeMessages && activeMessages.length > 0 ? activeMessages : []).map(m => {
                const isMe = String(m.sender_id) === String(currentUserId) && m.sender_role !== 'ai_assistant';
                const isAi = m.sender_id === 'lumina_ai' || m.message_type === 'ai_response';
                return `
                  <div class="chat-bubble-row ${isMe ? 'my-message' : 'their-message'}">
                    ${!isMe ? `
                      <img src="${m.sender_avatar || activeContact.contact_avatar}" alt="${m.sender_name}" class="chat-msg-avatar" onerror="this.src='assets/logo.png'">
                    ` : ''}
                    <div class="chat-bubble ${isMe ? 'bubble-me' : isAi ? 'bubble-ai' : 'bubble-them'}">
                      ${!isMe ? `
                        <div class="chat-bubble-sender">
                          ${m.sender_name} ${isAi ? '<span class="ai-sparkle-pill">✨ AI COPILOT</span>' : ''}
                        </div>
                      ` : ''}
                      <div class="chat-bubble-text">
                        ${m.message.replace(/\n/g, '<br>')}
                      </div>
                      <div class="chat-bubble-footer">
                        <span>${m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
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
              <span style="font-size: 0.72rem; font-weight: 800; color: var(--gold-primary); text-transform: uppercase;">Quick Topics:</span>
              <button class="chat-suggestion-chip" onclick="window.app.sendQuickPrompt('Is it safe to use 2% Salicylic Acid BHA alongside Topical Adapalene 0.1%?')">🧪 BHA + Adapalene Pairing</button>
              <button class="chat-suggestion-chip" onclick="window.app.sendQuickPrompt('How do I repair a compromised skin barrier and soothe facial redness?')">🛡️ Skin Barrier Repair</button>
              <button class="chat-suggestion-chip" onclick="window.app.sendQuickPrompt('What is the optimal morning and evening skincare application order?')">🌅 Regimen Application Order</button>
              <button class="chat-suggestion-chip" onclick="window.app.sendQuickPrompt('How should I manage retinoid purging vs allergic irritation?')">💊 Retinoid Purging Protocol</button>
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

            <form class="chat-input-form" onsubmit="window.app.handlePageChatSend(event)">
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
                <button class="context-prompt-btn" onclick="window.app.sendQuickPrompt('Review my morning routine and check for ingredient conflicts')">
                  🔍 Audit Morning Regimen
                </button>
                <button class="context-prompt-btn" onclick="window.app.sendQuickPrompt('What ingredients pair best with 15% Azelaic Acid?')">
                  🧪 Azelaic Acid Pairing
                </button>
                <button class="context-prompt-btn" onclick="window.app.sendQuickPrompt('How do I minimize irritation when using topical adapalene?')">
                  💡 Retinoid Tolerance Tips
                </button>
                <button class="context-prompt-btn" onclick="window.app.sendQuickPrompt('Explain my latest 30-day hydration trajectory')">
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
                <div style="font-size: 0.72rem; color: var(--text-muted);">Approved by Dr. Julian Rostova, MD (Next review: 24 Dec 2025)</div>
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




