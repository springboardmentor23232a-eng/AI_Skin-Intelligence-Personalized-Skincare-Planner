# Phase 7: Skin Health Scoring Engine Specification

## 1. Overview & Purpose
The **Skin Health Scoring Engine** is a deterministic, explainable, and production-ready wellness assessment system that computes an overall skin health composite score (0–100) using a multi-factor weighted algorithm. It bridges subjective user inputs, computer vision diagnostics, and daily behavioral adherence to provide transparent, actionable skincare feedback.

> [!IMPORTANT]
> **Clinical Wellness Disclaimer**:
> This engine is intended strictly for personal skincare guidance, habit tracking, and routine optimization. It does **NOT** provide a medical or clinical diagnosis and is not a substitute for certified dermatological consultation.

---

## 2. Five-Factor Weighted Mathematical Formula

The engine evaluates five independent wellness pillars, each normalized to a scale of `0 – 100`:

$$\text{Overall Skin Health Score} = \sum_{i=1}^{5} (S_i \times W_i)$$

$$\text{Overall Score} = (S_{\text{condition}} \times 0.35) + (S_{\text{lifestyle}} \times 0.20) + (S_{\text{sleep}} \times 0.15) + (S_{\text{routine}} \times 0.20) + (S_{\text{hydration}} \times 0.10)$$

| Factor Pillar | Symbol | Weight ($W_i$) | Percentage | Primary Input Source | Normalized Range |
|:---|:---:|:---:|:---:|:---|:---:|
| **Skin Condition Assessment** | $S_{\text{condition}}$ | `0.35` | **35%** | Diagnostic parameter sliders & PyTorch vision analysis | `0 – 100` |
| **Lifestyle Habits & Stress** | $S_{\text{lifestyle}}$ | `0.20` | **20%** | `SkinProfile` (stress level, activity level) | `0 – 100` |
| **Sleep Quality & Recovery** | $S_{\text{sleep}}$ | `0.15` | **15%** | `SkinProfile` (reported nightly rest duration) | `0 – 100` |
| **Routine Consistency** | $S_{\text{routine}}$ | `0.20` | **20%** | `SkincareLog` (completed vs scheduled steps) | `0 – 100` |
| **Hydration Level** | $S_{\text{hydration}}$ | `0.10` | **10%** | `SkinProfile` (daily fluid intake in liters) | `0 – 100` |
| **Total Master Weight** | $\sum W_i$ | `1.00` | **100%** | — | `0 – 100` |

---

## 3. Factor Normalization Logic

### Factor 1: Skin Condition Assessment ($S_{\text{condition}}$ — 35%)
- Evaluates 10 clinical skin parameters weighted by barrier disruption impact:
  $$\text{Severity} = \frac{1.5 \times \text{acne} + 1.2 \times \text{pigmentation} + 1.0 \times \text{dryness} + 1.0 \times \text{oiliness} + 1.1 \times \text{redness} + 1.3 \times \text{sensitivity} + 0.9 \times \text{wrinkles} + 0.8 \times \text{lines} + 1.1 \times \text{spots} + 1.0 \times \text{tone}}{11.0}$$
- Normalization: $S_{\text{condition}} = \max(0, \min(100, 100.0 - \text{Severity}))$
- Safe default: `75.0` if no assessment recorded yet.

### Factor 2: Lifestyle Habits ($S_{\text{lifestyle}}$ — 20%)
- Baseline: `85.0`
- Stress adjustments:
  - `"Low Stress"`: $+5.0 \rightarrow 90.0$
  - `"Moderate Stress"`: $\pm 0 \rightarrow 85.0$
  - `"High Stress"`: $-15.0 \rightarrow 70.0$
- Activity level adjustments:
  - `"Active"` / `"Athletic"`: $+5.0 \rightarrow \le 95.0$
  - `"Sedentary"`: $-10.0 \rightarrow \ge 55.0$

### Factor 3: Sleep Quality ($S_{\text{sleep}}$ — 15%)
- Normalization based on nightly cellular repair duration:
  - `"8+ hours"`: `95.0`
  - `"7-8 hours"`: `85.0`
  - `"6-7 hours"`: `75.0`
  - `"<6 hours"`: `60.0`
- Safe default: `80.0`

### Factor 4: Routine Consistency ($S_{\text{routine}}$ — 20%)
- Adherence rate from recorded routine execution:
  $$S_{\text{routine}} = \left( \frac{\text{Completed Logs}}{\max(1, \text{Total Logs})} \right) \times 100.0$$
- Safe default: `80.0` when no routine entries logged yet.

### Factor 5: Hydration Level ($S_{\text{hydration}}$ — 10%)
- Normalization based on daily fluid target:
  - $\ge 3.0\text{L}$: `95.0`
  - $2.0\text{L} \le \text{volume} < 3.0\text{L}$: `85.0`
  - $1.0\text{L} \le \text{volume} < 2.0\text{L}$: `65.0`
  - $< 1.0\text{L}$: `50.0`
- Safe default: `80.0`

---

## 4. Score Interpretation & Risk Tiers

| Composite Score | Status Tier | Label | Interpretation Guidance |
|:---:|:---:|:---|:---|
| **80.0 – 100.0** | `Low Risk` | Optimal Barrier & Health | Strong barrier integrity, balanced hydration, and consistent routines. Maintain current protocol. |
| **65.0 – 79.9** | `Moderate Risk` | Stable / Balanced Barrier | Stable skin health with specific optimization opportunities in hydration, sleep, or routine adherence. |
| **0.0 – 64.9** | `High Priority Alert` | Supportive Recovery Needed | Elevated acute concerns or lifestyle stressors. Focus on barrier-supportive, fragrance-free routines. |

---

## 5. API Architecture & Endpoints

### Endpoint: `GET /api/scoring/skin-health`
- **Authentication**: JWT Bearer token (`get_current_user`)
- **User Data Isolation**: Strictly filtered on `current_user.id`. A user cannot read another user's scores.
- **Sample Response**:
```json
{
  "overall_score": 78.5,
  "risk_level": "Moderate Risk",
  "status_label": "Moderate / Balanced Barrier",
  "interpretation": "Your skin health is stable but could benefit from targeted improvements...",
  "summary": "Overall Skin Health Score is 78.5% (Moderate Risk). Strongest pillar is Sleep & Cellular Regeneration (95.0%). Primary optimization opportunity: Skincare Routine Consistency (60.0%).",
  "factors": {
    "skin_condition": {
      "name": "Skin Condition Assessment",
      "score": 80.0,
      "weight": 0.35,
      "weighted_contribution": 28.0,
      "status": "Good",
      "description": "Severity index computed from clinical diagnostic parameters and active skin concerns."
    },
    "lifestyle": {
      "name": "Lifestyle & Stress Habits",
      "score": 70.0,
      "weight": 0.20,
      "weighted_contribution": 14.0,
      "status": "Good",
      "description": "Evaluation of environmental exposure, stress management, and physical activity habits."
    },
    "sleep_quality": {
      "name": "Sleep & Cellular Regeneration",
      "score": 95.0,
      "weight": 0.15,
      "weighted_contribution": 14.3,
      "status": "Optimal",
      "description": "Nightly rest duration and restorative cellular repair window."
    },
    "routine_consistency": {
      "name": "Skincare Routine Consistency",
      "score": 60.0,
      "weight": 0.20,
      "weighted_contribution": 12.0,
      "status": "Moderate",
      "description": "Adherence rate derived from completed routine steps vs scheduled daily skincare protocols."
    },
    "hydration": {
      "name": "Hydration Level",
      "score": 85.0,
      "weight": 0.10,
      "weighted_contribution": 8.5,
      "status": "Optimal",
      "description": "Daily fluid intake evaluated against clinical moisture barrier preservation targets."
    }
  },
  "weights_total": 1.0,
  "calculation_version": "phase7-v1",
  "evaluated_at": "2026-09-03T13:30:00Z",
  "disclaimer": "Wellness-oriented skincare intelligence for lifestyle and routine guidance. Not a clinical or medical diagnosis."
}
```

---

## 6. Frontend Data Flow & Visualization

```text
[User Action / View Load]
       ↓
SkinAssessment.jsx / SkinAnalyticsPage.jsx
       ↓
SkinHealthScoreBreakdown.jsx
       ↓
apiService.getSkinHealthScore()
       ↓ (GET /api/scoring/skin-health + Bearer Token)
FastAPI Route (modules.py)
       ↓
skin_health_scoring.py (Deterministic Calculation)
       ↓ (PostgreSQL SkinProfile, SkinAssessment, SkincareLog)
JSON Response with Factor Breakdown
       ↓
Render Dynamic Circular Gauge, 5 Factor Bars, Badges & Wellness Disclaimer
```
