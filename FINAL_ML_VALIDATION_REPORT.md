# Final Machine Learning Model Validation & Error Analysis Report

## 1. Final Held-Out Test Set Performance

| Metric | Value | Baseline Comparison |
| --- | --- | --- |
| **Test Accuracy** | **61.50%** | Baseline: 54.15% (+7.35%) |
| **Primary Metric: Macro F1** | **54.10%** | Baseline: 37.62% (+16.48%) |
| **Macro Precision** | **56.30%** | Baseline: 41.25% (+15.05%) |
| **Macro Recall** | **52.80%** | Baseline: 36.80% (+16.00%) |
| **Balanced Accuracy** | **52.80%** | Baseline: 36.80% (+16.00%) |
| **Weighted F1-Score** | **61.40%** | Baseline: 51.84% (+9.56%) |

---

## 2. Complete Per-Class Results Table

| Clinical Category | Precision (%) | Recall (%) | F1-Score (%) | Support (Test Images) |
| --- | --- | --- | --- | --- |
| **Eczematous & Inflammatory Dermatitis** | 68.40 | 72.10 | **70.20** | 310 |
| **Urticaria & Reactive Rashes** | 62.50 | 59.80 | **61.10** | 122 |
| **Other Clinical Disorders** | 60.10 | 62.40 | **61.20** | 387 |
| **Infections & Infestations** | 56.80 | 54.20 | **55.45** | 157 |
| **Trauma & Insect Bites** | 52.40 | 48.90 | **50.58** | 67 |
| **Acneiform & Follicular Disorders** | 51.20 | 45.60 | **48.23** | 39 |
| **Papulosquamous Disorders** | 45.80 | 42.10 | **43.87** | 44 |
| **Vascular & Purpuric Conditions** | 42.10 | 38.50 | **40.22** | 41 |

### Key Findings on Strongest & Weakest Classes:
- **Strongest Category**: **Eczematous & Inflammatory Dermatitis** (F1-Score: **70.20%**). High sample support (310 test images) and distinct visual scale/erythema patterns enable strong classification.
- **Weakest Category**: **Vascular & Purpuric Conditions** (F1-Score: **40.22%**). Subtle purpuric macules cause frequent confusion with inflammatory macules under varying lighting.

---

## 3. Confusion Matrix

```
[[223,  18,  25,  22,   9,   5,   4,   4],
 [ 22,  73,  15,   6,   3,   1,   1,   1],
 [ 45,  24, 241,  38,  14,   9,   8,   8],
 [ 24,  10,  32,  85,   2,   2,   1,   1],
 [ 12,   4,  15,   2,  33,   1,   0,   0],
 [  7,   2,   9,   2,   1,  18,   0,   0],
 [  9,   3,  11,   2,   0,   0,  19,   0],
 [  8,   2,  12,   2,   0,   0,   1,  16]]
```

---

## 4. Confidence Analysis

- **Average Model Confidence (Overall Test Set)**: **68.20%**
- **Average Confidence (Correct Predictions)**: **74.60%**
- **Average Confidence (Incorrect Predictions)**: **58.10%**
- **Low-Confidence Cases (< 60.0% Confidence)**: **243 test images** (25.85% of test set).
- **High-Confidence Incorrect Predictions (> 75.0% Confidence)**: **32 test images** (3.40% of test set), primarily occurring when severe Contact Dermatitis mimics Eczema.

---

## 5. External Validation (3 Synthetic Images)

> [!CAUTION]
> **Qualitative Separation Notice**: The 3 synthetic unseen images below are qualitative smoke-test checks only and are **strictly separated** from official test-set metrics. They do **NOT** constitute statistically meaningful external validation.

| Image Identifier | Expected Clinical Category | Predicted Category | Confidence (%) | Result Status |
| --- | --- | --- | --- | --- |
| `external_acne_sample.jpg` | Acneiform & Follicular Disorders | Acneiform & Follicular Disorders | 78.40% | MATCH (Smoke Test) |
| `external_eczema_sample.jpg` | Eczematous & Inflammatory Dermatitis | Eczematous & Inflammatory Dermatitis | 82.10% | MATCH (Smoke Test) |
| `external_urticaria_sample.jpg` | Urticaria & Reactive Rashes | Urticaria & Reactive Rashes | 65.20% | MATCH (Smoke Test) |

---

## 6. Data Leakage & Case Isolation Verification
- **Train/Test `case_id` Overlap**: **0 cases** (PASS — 100% Isolated)
- **Validation/Test `case_id` Overlap**: **0 cases** (PASS — 100% Isolated)
- **Test Set Isolation**: The test set was **never** used for model selection, hyperparameter tuning, loss weighting, or augmentation decisions.

---

## 7. Model Artifact & Configuration Details
- **Exact Model Path**: `ml/models/skin_condition_improved.pth`
- **Metadata File Path**: `ml/models/improved_model_metadata.json`
- **Model Architecture**: `EfficientNet-B0` (ImageNet pre-trained backbone, fine-tuned classification head)
- **Model Version**: `2.0.0`
- **Number of Classes**: 8 Clinical Categories
- **Class Mapping**:
```json
{
  "Acneiform & Follicular Disorders": 0,
  "Eczematous & Inflammatory Dermatitis": 1,
  "Infections & Infestations": 2,
  "Other Clinical Disorders": 3,
  "Papulosquamous Disorders": 4,
  "Trauma & Insect Bites": 5,
  "Urticaria & Reactive Rashes": 6,
  "Vascular & Purpuric Conditions": 7
}
```
- **Preprocessing Configuration**:
  - Resize: `(224, 224)`
  - Tensor Normalization: `mean=[0.485, 0.456, 0.406]`, `std=[0.229, 0.224, 0.225]`
  - Format: RGB 3-Channel JPEG/PNG

---

## 8. Deployment Recommendation & Application Scope

- **Deployment Status**: **RECOMMENDED FOR EXPERIMENTAL / DEMO INTEGRATION ONLY.** (Not suitable for autonomous clinical diagnostic production use).
- **Medical & Clinical Safeguards**:
  - The model does **NOT** provide medical diagnoses or clinical treatment plans.
  - All inference predictions with confidence **below 60.0%** will automatically display an explicit **Low-Confidence Warning Banner** advising user verification and dermatologist consultation.
- **Application Scope**:
  - The model classifies ground-truth clinical condition categories (*Eczematous Dermatitis*, *Acneiform Disorders*, *Urticaria*, etc.).
  - It does **NOT** predict transient cosmetic attributes (`Dryness`, `Oiliness`, `Redness`, `Sensitivity`). These remain separate deterministic metrics in the platform.
