# Machine Learning Image Analysis Implementation Plan

## Executive Summary
This document outlines the architectural blueprint, data pipeline, transfer learning model design, FastAPI service integration, and frontend display enhancements to upgrade the existing AI Skin Intelligence & Personalized Skincare Platform from a simulated heuristic algorithm to a real trained deep learning image classification model using the official **Skin Condition Image Network (SCIN)** dataset.

---

## 1. Current Architecture Overview

### Frontend Architecture
- **Framework**: React + Vite (located in `skin-dashboard/`)
- **Key Page**: `src/pages/ImageAnalysisPage.jsx`
- **Features**:
  - Image acquisition via Drag-and-Drop / File Upload or Live Webcam Capture.
  - Client-side image validation (format, size limits, orientation rotation).
  - API calls to `/api/image-analysis/upload` and `/api/image-analysis/webcam`.
  - Visualization of metrics (Acne, Redness, Dryness, Oiliness, Sensitivity, Hyperpigmentation), diagnostic summary, priority concern, and scan history.

### Backend Architecture
- **Framework**: FastAPI (Python 3.13)
- **Database**: PostgreSQL (with local SQLite fallback `skin_db.db`) using SQLAlchemy ORM and Alembic migrations.
- **Image Analysis Route**: `backend/app/routes/image_analysis.py`
  - Current implementation uses `mock_ai_prediction(img)`: a simulated RGB heuristic algorithm that calculates mock percentage scores for redness, oiliness, dryness, etc.
- **Database Model**: `ImageAnalysis` in `backend/app/models.py`
  - Columns: `id`, `user_id`, `original_filename`, `stored_filename`, `upload_source`, `upload_time`, `prediction` (JSON), `confidence` (Float), `processing_time` (Float), `status` (String).

---

## 2. Proposed Machine Learning Architecture

```
[ Input Image (Upload / Webcam) ]
                │
                ▼
  [ Image Security & Quality Validation ]  (FastAPI Route)
                │
                ▼
  [ Inference Service Component ]  (backend/app/ai/)
  ├── model_loader.py    -> Loads PyTorch model into GPU/CPU memory once on startup
  ├── preprocessing.py   -> Transforms image (Resize, Normalize, EXIF transpose)
  └── inference.py       -> Forward pass with @torch.no_grad(), returns probabilities
                │
                ▼
  [ Machine Learning Model ]  (PyTorch / Transfer Learning: EfficientNet-B0 or ResNet34)
  └── Outputs: Primary Predicted Condition, Class Probabilities, Confidence Score
                │
                ▼
  [ Deterministic Assessment & Recommendation Mapping Engine ]
  └── Maps ML predictions safely to user skin profile, existing rules, and product catalog
                │
                ▼
  [ Database Storage & Frontend API Response ]  (ImageAnalysis Table & React UI)
```

---

## 3. Machine Learning Pipeline Phases

### Phase 1 — Dataset Acquisition
- **Primary Source**: SCIN (Skin Condition Image Network) dataset developed by Google Health & Stanford Medicine (`gs://dx-scin-public-data` / official SCIN repository).
- **Format**: High-resolution image assets + CSV/Parquet metadata containing dermatologist consensus annotations, estimated Fitzpatrick Skin Type (eFST), Monk Skin Tone (eMST), and participant case IDs.
- **Directory**: `ml/data/` (raw dataset excluded from git repository; metadata index tracked).

### Phase 2 — Dataset Exploration (`ml/notebooks/01_dataset_exploration.ipynb`)
- Inspect total image count, distribution across dermatologist condition labels, missing labels, duplicate images, resolution statistics, and skin-tone/demographic representation.
- Produce class distribution visualizations, sample galleries, and duplicate analysis.
- *Strict Rule*: Dataset labels will be strictly derived from SCIN ground-truth dermatologist annotations without unverified relabeling or label fabrication.

### Phase 3 — Preprocessing & Data Cleaning
- Build reproducible pipeline handling corrupted images, unreadable formats, and invalid resolutions.
- Document any excluded samples with specific justifications and output a summary report.

### Phase 4 — Data Leakage Prevention (Group-Aware Splitting)
- Group images by `case_id` / participant identifier.
- Perform grouped stratified train/validation/test split to guarantee that no images from the same individual appear across different splits.

### Phase 5 — Train / Validation / Test Split
- **Proportions**: 70% Train, 15% Validation, 15% Test.
- Hold out the test set until final, un-biased model evaluation.

### Phase 6 — Model Development (`ml/notebooks/02_training.ipynb`)
- **Framework**: PyTorch / `torchvision` / `timm`.
- **Architectures Evaluated**: EfficientNet-B0/B2, ResNet34/50.
- **Training Strategy**: Transfer learning (pre-trained ImageNet weights), learning rate schedule (Cosine Annealing), loss functions handling class imbalance (Focal Loss / Weighted Cross-Entropy).

### Phase 7 — Evaluation & Validation (`ml/notebooks/03_evaluation.ipynb`)
- Evaluate strictly on the untouched test set.
- Compute Accuracy, Precision, Recall, F1-score per class, and Confusion Matrix.
- Evaluate on an independent out-of-dataset validation set to test generalization.

### Phase 8 — Model Export & Metadata
- Save weights to `ml/models/skin_condition_model.pth`.
- Save metadata to `ml/models/model_metadata.json` (architecture, classes, metrics, preprocessing parameters, versioning).

---

## 4. Files to Create & Modify

### Files to Create (`[NEW]`)
1. `ml/` directory structure:
   - `ml/data/` (Dataset storage & metadata)
   - `ml/notebooks/01_dataset_exploration.ipynb`
   - `ml/notebooks/02_training.ipynb`
   - `ml/notebooks/03_evaluation.ipynb`
   - `ml/src/dataset.py`, `ml/src/model.py`, `ml/src/train.py`, `ml/src/evaluate.py`
   - `ml/tests/test_pipeline.py`
   - `ml/models/skin_condition_model.pth`
   - `ml/models/model_metadata.json`
2. `backend/app/ai/` directory structure:
   - `backend/app/ai/__init__.py`
   - `backend/app/ai/model_loader.py`
   - `backend/app/ai/preprocessing.py`
   - `backend/app/ai/inference.py`
3. Documentation:
   - `ML_README.md`
   - `ML_MODEL_REPORT.md`

### Files to Modify (`[MODIFY]`)
1. `backend/app/routes/image_analysis.py`: Replace `mock_ai_prediction` with real `app.ai.inference` service call while keeping response format backward-compatible.
2. `backend/app/main.py`: Initialize model loader on FastAPI startup event.
3. `backend/requirements.txt`: Add PyTorch (`torch`, `torchvision`), `numpy`, `pandas`, `scikit-learn`, `pillow`, `timm`.
4. `skin-dashboard/src/pages/ImageAnalysisPage.jsx`: Enhance UI presentation for predicted condition, confidence score, model version, and low-confidence clinical cautions.

---

## 5. Potential Risks & Mitigation Strategies

| Risk | Impact | Mitigation Strategy |
| --- | --- | --- |
| Data Leakage between Train/Test | Overly optimistic test accuracy that fails in real-world use | Enforce strict group-aware splitting using SCIN `case_id` / contributor IDs |
| Heavy PyTorch memory footprint in API | Latency or Out-Of-Memory errors on backend server | Load model once at startup (`model_loader.py`); run inference under `@torch.no_grad()`; use lightweight EfficientNet-B0 architecture |
| Class Imbalance in Dermatological Data | Poor minority-class recall | Use weighted cross-entropy / Focal Loss and class-balanced data augmentation |
| Breaking Existing Frontend / API Contract | UI display bugs or failing frontend queries | Preserve existing `prediction` JSON key structure; add new fields (e.g., `model_version`, `class_probabilities`) without removing legacy response fields |

---

## 6. Testing Strategy

1. **ML Pipeline Unit Tests (`ml/tests/`)**:
   - Verify dataset loading, group-aware splitting, image transformations, model instantiation, forward pass shape, and metric calculations.
2. **Backend AI Inference Tests (`backend/test_image_analysis.py`)**:
   - Unit tests for `model_loader.py`, `preprocessing.py`, and `inference.py`.
   - Edge case testing: invalid files, corrupt images, non-RGB formats, low-confidence responses.
3. **E2E Integration & Verification Suite**:
   - Run full end-to-end flow: Upload/Webcam -> FastAPI -> ML Inference -> DB record -> API response.
   - Run existing test suite (`test_phase2_backend.py` through `test_phase8_backend.py`) to verify zero regression.
4. **Frontend Verification**:
   - Verify zero console errors on `ImageAnalysisPage.jsx`, test upload & webcam capture flows, check fallback low-confidence banners.
