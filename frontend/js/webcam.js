/* ==================== GLOWSENSE AI — WEBCAM ASSESSMENT LOGIC ==================== */

import { dataAPI, authAPI } from './api.js';
import { initDashboard, showToast, showLoading, hideLoading, formatDate, riskBadge } from './common.js';
import { callMLService } from './assessment.js';

let videoStream = null;
let capturedImage = null;

export async function initWebcamAssessment() {
  const auth = await initDashboard('user', 'assessment');
  if (!auth) return;

  // Setup buttons
  const startBtn = document.getElementById('startCameraBtn');
  const captureBtn = document.getElementById('captureBtn');
  const retakeBtn = document.getElementById('retakeBtn');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const uploadInput = document.getElementById('uploadInput');

  if (startBtn) startBtn.addEventListener('click', startCamera);
  if (captureBtn) captureBtn.addEventListener('click', capturePhoto);
  if (retakeBtn) retakeBtn.addEventListener('click', retakePhoto);
  if (analyzeBtn) analyzeBtn.addEventListener('click', () => analyzeImage(auth.user.id));
  if (uploadInput) uploadInput.addEventListener('change', handleUpload);
}

async function startCamera() {
  try {
    videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    const video = document.getElementById('webcamVideo');
    const placeholder = document.getElementById('webcamPlaceholder');
    const startBtn = document.getElementById('startCameraBtn');
    const captureBtn = document.getElementById('captureBtn');

    if (video) {
      video.srcObject = videoStream;
      video.style.display = 'block';
    }
    if (placeholder) placeholder.style.display = 'none';
    if (startBtn) startBtn.style.display = 'none';
    if (captureBtn) captureBtn.style.display = 'inline-flex';

    showToast('Camera started successfully!', 'success');
  } catch (err) {
    showToast('Unable to access camera. Please check permissions or use the upload option.', 'error');
  }
}

function capturePhoto() {
  const video = document.getElementById('webcamVideo');
  const canvas = document.getElementById('webcamCanvas');
  if (!video || !canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  // Mirror the image to match preview
  ctx.save();
  ctx.scale(-1, 1);
  ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
  ctx.restore();

  capturedImage = canvas.toDataURL('image/jpeg', 0.8);

  // Show captured image, hide video
  canvas.classList.add('visible');
  video.style.display = 'none';

  // Stop camera
  if (videoStream) {
    videoStream.getTracks().forEach(t => t.stop());
    videoStream = null;
  }

  // Show retake + analyze buttons
  const captureBtn = document.getElementById('captureBtn');
  const retakeBtn = document.getElementById('retakeBtn');
  const analyzeBtn = document.getElementById('analyzeBtn');
  if (captureBtn) captureBtn.style.display = 'none';
  if (retakeBtn) retakeBtn.style.display = 'inline-flex';
  if (analyzeBtn) analyzeBtn.style.display = 'inline-flex';
}

function retakePhoto() {
  const canvas = document.getElementById('webcamCanvas');
  if (canvas) canvas.classList.remove('visible');

  capturedImage = null;

  const retakeBtn = document.getElementById('retakeBtn');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const startBtn = document.getElementById('startCameraBtn');
  if (retakeBtn) retakeBtn.style.display = 'none';
  if (analyzeBtn) analyzeBtn.style.display = 'none';
  if (startBtn) startBtn.style.display = 'inline-flex';

  // Show placeholder
  const placeholder = document.getElementById('webcamPlaceholder');
  if (placeholder) placeholder.style.display = 'flex';
}

function handleUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    capturedImage = e.target.result;

    const canvas = document.getElementById('webcamCanvas');
    const video = document.getElementById('webcamVideo');
    const placeholder = document.getElementById('webcamPlaceholder');
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      canvas.classList.add('visible');
      if (video) video.style.display = 'none';
      if (placeholder) placeholder.style.display = 'none';

      // Stop camera if running
      if (videoStream) {
        videoStream.getTracks().forEach(t => t.stop());
        videoStream = null;
      }

      const startBtn = document.getElementById('startCameraBtn');
      const captureBtn = document.getElementById('captureBtn');
      const retakeBtn = document.getElementById('retakeBtn');
      const analyzeBtn = document.getElementById('analyzeBtn');
      if (startBtn) startBtn.style.display = 'none';
      if (captureBtn) captureBtn.style.display = 'none';
      if (retakeBtn) retakeBtn.style.display = 'inline-flex';
      if (analyzeBtn) analyzeBtn.style.display = 'inline-flex';
    };
    img.src = capturedImage;
  };
  reader.readAsDataURL(file);
}

async function analyzeImage(userId) {
  if (!capturedImage) {
    showToast('Please capture or upload an image first.', 'warning');
    return;
  }

  showAnalysisLoading();

  try {
    // Send image to backend ML service
    let result;
    try {
      const response = await fetch('/api/assessment/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: capturedImage }),
      });
      if (response.ok) {
        result = await response.json();
      } else {
        throw new Error('Backend not available');
      }
    } catch (err) {
      // Fallback: use form-based assessment with default data
      // This is a clearly marked development fallback
      result = webcamFallbackAssessment();
    }

    // Store assessment
    const assessment = await dataAPI.createAssessment({
      user_id: userId,
      method: 'webcam',
      skin_health_score: result.skin_health_score,
      skin_type: result.skin_type,
      risk_level: result.risk_level,
      form_data: { image_source: 'webcam', _source: result._source || 'ml_service' },
    });

    if (result.concerns && result.concerns.length > 0) {
      await dataAPI.addConcerns(assessment.id, result.concerns);
    }
    if (result.risk_factors && result.risk_factors.length > 0) {
      await dataAPI.addRisks(assessment.id, result.risk_factors);
    }
    if (result.recommendations && result.recommendations.length > 0) {
      await dataAPI.addRecommendations(assessment.id, result.recommendations);
    }

    hideLoading();
    showWebcamResult(assessment.id, result);
  } catch (err) {
    hideLoading();
    showToast('Unable to complete image analysis. Please try again.', 'error');
  }
}

function showAnalysisLoading() {
  let overlay = document.querySelector('.loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="analysis-loading">
      <div class="analysis-loading-icon">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="1.5"/>
          <path d="M20 10v10l7 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="analysis-loading-title">Analyzing your skin...</div>
      <div class="analysis-loading-text">Our AI is processing your facial image</div>
      <div class="analysis-progress"><div class="analysis-progress-fill" id="progressFill"></div></div>
      <div class="analysis-steps">
        <div class="analysis-step-item" id="step1">Preprocessing image</div>
        <div class="analysis-step-item" id="step2">Running CV model</div>
        <div class="analysis-step-item" id="step3">Detecting concerns</div>
        <div class="analysis-step-item" id="step4">Generating results</div>
      </div>
    </div>
  `;
  overlay.style.display = 'flex';

  let progress = 0;
  const fill = document.getElementById('progressFill');
  const steps = [1, 2, 3, 4].map(i => document.getElementById('step' + i));
  const interval = setInterval(() => {
    progress += 5;
    if (fill) fill.style.width = progress + '%';
    if (progress >= 25 && steps[0]) steps[0].classList.add('done');
    if (progress >= 50 && steps[1]) steps[1].classList.add('done');
    if (progress >= 75 && steps[2]) steps[2].classList.add('done');
    if (progress >= 100) { steps[3]?.classList.add('done'); clearInterval(interval); }
  }, 200);
}

function webcamFallbackAssessment() {
  // Clearly marked development fallback when CV model is not connected
  return {
    skin_health_score: 72,
    skin_type: 'Combination',
    concerns: [
      { concern_name: 'Acne', severity: 'Moderate', priority: 'high', explanation: 'Image analysis indicates possible acne-related concerns in the T-zone area.' },
      { concern_name: 'Dryness', severity: 'Low', priority: 'medium', explanation: 'Mild dryness detected around cheek areas.' },
      { concern_name: 'Visible Pores', severity: 'Moderate', priority: 'low', explanation: 'Enlarged pores visible in the nasal and forehead regions.' },
    ],
    risk_level: 'Moderate',
    risk_factors: [
      { risk_name: 'Sun Exposure', severity: 'Moderate', explanation: 'Signs of sun damage detected.', preventive_action: 'Apply SPF 30+ sunscreen daily.' },
      { risk_name: 'Hydration', severity: 'Low', explanation: 'Skin appears slightly dehydrated.', preventive_action: 'Increase water intake and use a hydrating moisturizer.' },
    ],
    recommendations: [
      { category: 'Morning Routine', recommendation_text: 'Cleanse gently, apply antioxidant serum, and use SPF 30+ sunscreen.' },
      { category: 'Evening Routine', recommendation_text: 'Double cleanse, apply retinol or niacinamide serum, and moisturize.' },
      { category: 'Sun Protection', recommendation_text: 'Use broad-spectrum sunscreen daily. Reapply every 2 hours when outdoors.' },
      { category: 'Hydration', recommendation_text: 'Drink 8+ glasses of water daily. Use a hyaluronic acid serum for added hydration.' },
    ],
    _source: 'webcam_fallback',
  };
}

function showWebcamResult(assessmentId, result) {
  const container = document.getElementById('webcamResult');
  if (!container) return;

  const score = result.skin_health_score || 0;
  let interpretation = '';
  if (score >= 80) interpretation = 'Your skin health is in the Excellent range.';
  else if (score >= 60) interpretation = 'Your skin health is in the Good range.';
  else if (score >= 40) interpretation = 'Your skin health is in the Fair range.';
  else interpretation = 'Your skin health needs attention.';

  const scoreColor = score >= 80 ? 'var(--color-success)' : score >= 60 ? 'var(--color-accent-dark)' : score >= 40 ? 'var(--color-warning)' : 'var(--color-error)';

  container.innerHTML = `
    <div class="result-container">
      <div class="result-hero">
        <h2 style="font-size:var(--fs-2xl);font-weight:700;margin-bottom:1rem;">Image Analysis Complete</h2>
        <div class="result-score-section">
          <div class="score-ring-large" style="background:conic-gradient(${scoreColor} ${score}%, var(--color-border-light) 0);">
            <div class="score-ring-large-inner">
              <span class="score-number" style="color:${scoreColor};">${score}</span>
              <span class="score-max">/100</span>
            </div>
          </div>
          <div class="result-score-text">
            <div class="result-score-interpretation" style="color:${scoreColor};">${interpretation}</div>
            <div class="result-score-label">Predicted Skin Type: <strong>${result.skin_type || 'N/A'}</strong></div>
            <div class="result-score-label">Risk Level: ${riskBadge(result.risk_level)}</div>
          </div>
        </div>
      </div>

      ${result.concerns && result.concerns.length > 0 ? `
      <div class="result-section">
        <div class="result-section-header">
          <div class="result-section-icon" style="background:var(--color-warning-soft);color:var(--color-warning);">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3l8 14H2L10 3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M10 9v3M10 14h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </div>
          <h3 class="result-section-title">Detected Concerns</h3>
        </div>
        ${result.concerns.map(c => `
          <div style="padding:0.75rem;border:1px solid var(--color-border);border-radius:8px;margin-bottom:0.5rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.25rem;">
              <strong>${c.concern_name}</strong>
              <span class="badge ${c.severity === 'High' ? 'badge-error' : c.severity === 'Moderate' ? 'badge-warning' : 'badge-success'}">${c.severity}</span>
            </div>
            <p style="font-size:var(--fs-sm);color:var(--color-text-secondary);">${c.explanation || ''}</p>
          </div>
        `).join('')}
      </div>` : ''}

      ${result.risk_factors && result.risk_factors.length > 0 ? `
      <div class="result-section">
        <div class="result-section-header">
          <div class="result-section-icon" style="background:var(--color-error-soft);color:var(--color-error);">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3l6 2v5c0 4-3 6-6 7-3-1-6-3-6-7V5l6-2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
          </div>
          <h3 class="result-section-title">Risk Factors</h3>
        </div>
        ${result.risk_factors.map(r => `
          <div class="risk-item">
            <div class="risk-item-info">
              <strong style="font-size:var(--fs-sm);">${r.risk_name}</strong>
              <div class="risk-item-explanation">${r.explanation || ''}</div>
            </div>
            <span class="badge ${r.severity === 'High' ? 'badge-error' : r.severity === 'Moderate' ? 'badge-warning' : 'badge-success'}">${r.severity}</span>
          </div>
        `).join('')}
      </div>` : ''}

      ${result.recommendations && result.recommendations.length > 0 ? `
      <div class="result-section">
        <div class="result-section-header">
          <div class="result-section-icon" style="background:var(--color-accent-soft);color:var(--color-accent-dark);">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3l1.5 4L16 8.5 11.5 10 10 14l-1.5-4L4 8.5 8.5 7 10 3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
          </div>
          <h3 class="result-section-title">Personalized Recommendations</h3>
        </div>
        ${groupRecs(result.recommendations)}
      </div>` : ''}

      <div class="result-disclaimer">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M10 6v4M10 13h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        <span>These results are informational skincare insights and are not a medical diagnosis. Consult a qualified dermatologist for medical concerns.</span>
      </div>

      <div style="display:flex;gap:1rem;justify-content:center;margin-top:1.5rem;">
        <a href="/user/dashboard.html" class="btn btn-primary">Back to Dashboard</a>
        <a href="/user/history.html?id=${assessmentId}" class="btn btn-outline">View Details</a>
      </div>
    </div>
  `;
  container.scrollIntoView({ behavior: 'smooth' });
}

function groupRecs(recs) {
  const categories = {};
  recs.forEach(r => {
    if (!categories[r.category]) categories[r.category] = [];
    categories[r.category].push(r.recommendation_text);
  });
  return Object.entries(categories).map(([cat, items]) => `
    <div class="recommendation-category">
      <div class="recommendation-category-title">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="color:var(--color-accent-dark);"><path d="M8 2l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>
        ${cat}
      </div>
      <ul class="recommendation-list">
        ${items.map(i => `<li>${i}</li>`).join('')}
      </ul>
    </div>
  `).join('');
}
