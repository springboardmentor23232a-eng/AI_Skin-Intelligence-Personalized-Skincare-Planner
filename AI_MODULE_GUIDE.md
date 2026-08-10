# 🤖 AI Engine & Diagnostic Computer Vision Specifications

This document explains the AI diagnostic pipeline, computer vision image analysis algorithms, metric calculation formulas, confidence scoring heuristics, and active ingredient interaction rules.

---

## 1. Computer Vision Image Analysis Pipeline

```
Raw Image Upload / Base64 Frame
         ↓
File Signature & Extension Check (.jpg, .png, .webp, .heic)
         ↓
Size & Resolution Validation (1KB to 10MB, 128px to 8192px)
         ↓
Pillow EXIF Orientation Correction (Tag 274 Transposition)
         ↓
Color Space Normalization (RGBA/P → RGB Conversion)
         ↓
Spatial Downsampling (Lanczos Filter to 1200px Max Dimension)
         ↓
Color Channel Density Analysis (Redness, Luminance, Uniformity)
         ↓
Dermatological Metric Calculations & Priority Assessment
         ↓
JSON Diagnostic Artifact & Confidence Score Generation
```

---

## 2. Metric Calculation Formulas & Scoring Logic

The AI diagnostic engine computes six core dermatological parameters (0-100%):

### 2.1 Acne Severity Index
Calculated from high-contrast spatial variance and localized red channel spikes:
$$\text{Acne Score} = \min\left(100, \frac{\text{SpikeCount} \times 12.5}{\text{SurfaceArea}} \times 100\right)$$

### 2.2 Erythema / Redness Score
Derived from average Red channel dominance relative to Green and Blue baseline channels:
$$\text{Redness Score} = \max\left(0, \min\left(100, \frac{\bar{R} - \frac{\bar{G} + \bar{B}}{2}}{255} \times 250\right)\right)$$

### 2.3 Dryness & Hydration Index
Evaluated from localized texture roughness and skin barrier reflectivity:
$$\text{Dryness Score} = 100 - \left(\text{WaterIntakeLiters} \times 20 + \text{MoisturizerFrequency} \times 15\right)$$

### 2.4 Oiliness / Sebum Metric
Derived from specular highlight reflections in the T-zone:
$$\text{Oiliness Score} = \min\left(100, \frac{\text{SpecularPixels}}{\text{TotalPixels}} \times 300\right)$$

---

## 3. Active Ingredient Compatibility Logic

The Chemical Interaction Engine evaluates active pairs using a clinical severity matrix:

| Ingredient A | Ingredient B | Conflict Level | Clinical Hazard / Risk |
| :--- | :--- | :---: | :--- |
| **AHA Complex (Glycolic/Lactic)** | **Retinol / Retinoids** | **HIGH CONFLICT** | Severe epidermal peeling, barrier destruction, extreme photo-sensitivity. |
| **BHA (Salicylic Acid)** | **Vitamin C (L-Ascorbic Acid)** | **MODERATE CONFLICT** | Acidic pH clash leading to skin redness, stinging, and inactivation of Vitamin C. |
| **Benzoyl Peroxide** | **Retinol** | **HIGH CONFLICT** | Benzoyl peroxide oxidizes and deactivates retinol, causing severe dryness. |
| **Niacinamide** | **Pure Vitamin C (Low pH)** | **MILD CONFLICT** | Can form Niacin-flush complex in sensitive skin types; offset timing recommended. |

---

## 4. Confidence Score & Diagnostic Summary Generation

Each scan returns a calculated confidence rating (e.g. `0.92` or `92%`) based on image resolution, spatial sharpness, and lighting conditions:

```json
{
  "confidence": 0.92,
  "processing_time": 26.71,
  "prediction": {
    "metrics": {
      "Acne": 76.0,
      "Redness": 95.0,
      "Dryness": 80.0,
      "Oiliness": 20.0,
      "Sensitivity": 87.5,
      "Hyperpigmentation": 42.3
    },
    "summary": "AI image scan completed. Slight redness detected in T-zone with moderate hydration levels.",
    "priority_concern": "Redness"
  }
}
```
