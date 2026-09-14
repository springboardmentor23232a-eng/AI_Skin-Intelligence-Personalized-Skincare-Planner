# PROJECT STRUCTURE AUDIT & ARCHITECTURAL BLUEPRINT
**Project:** AI Skin Intelligence & Personalized Skincare Planner  
**Platform:** Infosys Springboard Internship Milestone Verification  
**Date:** 2026-08-30  

---

## 1. High-Level Architecture Overview

The system is designed with a modern decoupled full-stack architecture:
```
┌─────────────────────────────────────────────────────────┐
│              React 18 + Vite Frontend SPA               │
│      (Bootstrap 5, Lucide Icons, Axios, Context API)    │
└────────────────────────────┬────────────────────────────┘
                             │ HTTP/JSON + JWT Bearer
                             ▼
┌─────────────────────────────────────────────────────────┐
│               FastAPI High-Performance API              │
│    (Pydantic v2, SQLAlchemy ORM, RBAC Middleware, CORS) │
└──────────────┬─────────────────────────────┬────────────┘
               │                             │
               ▼                             ▼
┌──────────────────────────────┐ ┌─────────────────────────┐
│      PostgreSQL Database     │ │  PyTorch ML Vision Core │
│ (16 Normalized Entity Tables)│ │  (EfficientNet-B0 v2.0) │
└──────────────────────────────┘ └─────────────────────────┘
```

---

## 2. Directory Tree & Entry Points

### 2.1 Frontend (`frontend/`)
- **Entry Point:** `src/main.jsx` -> `src/App.jsx`
- **Build System:** `vite.config.js` (Vite v8.1.5)
- **Styling:** Bootstrap 5, Vanilla CSS, Custom Themes (`ThemeContext.jsx`)
- **State Management:** `AuthContext.jsx`, `ThemeContext.jsx`
- **HTTP Client:** `src/services/apiService.js` (Axios with Bearer Interceptor & Credentials)
- **Pages (15 Total):**
  1. `Home.jsx` - Landing Page & Hero
  2. `Login.jsx` - JWT & Google OAuth Login
  3. `Register.jsx` - User Registration & Role Selection
  4. `UserDashboard.jsx` - Personalized User Control Center
  5. `SkinProfileWizard.jsx` - 12-Factor Dermatological Questionnaire
  6. `SkinAssessment.jsx` - AI Camera / Upload Vision Analysis Interface
  7. `SkinRoutinePage.jsx` - AI Routines & Manual Routine Editor
  8. `SkinAnalyticsPage.jsx` - Progress Photo Diary & Health Score Trends
  9. `IngredientIntelligencePage.jsx` - Ingredient Search & Conflict Detection
  10. `ProductCatalogPage.jsx` - Clinical Formulation Directory
  11. `ProductRecommendationsPage.jsx` - Milestone 6 AI Recommendation Engine, Multi-Store E-commerce & Comparison Matrix
  12. `ReportsPage.jsx` - Clinical Export (PDF / CSV / Excel)
  13. `ConsultantDashboard.jsx` - Skincare Consultant Workspace
  14. `DermatologistDashboard.jsx` - Clinical Practitioner Workspace
  15. `AdminDashboard.jsx` - Platform Administrator Workspace

### 2.2 Backend (`backend/`)
- **Entry Point:** `app/main.py`
- **Application Factory:** FastAPI with CORS, Latency Metrics, Security Headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`)
- **Database Layer:** SQLAlchemy ORM (`app/db/session.py`), PostgreSQL default with SQLite fallback
- **Migrations:** Alembic (`alembic/versions/` with 8 revision scripts)
- **Authentication & RBAC:** JWT Bearer & Cookie Auth (`app/auth/`)
  - Roles: `USER`, `SKINCARE_CONSULTANT`, `DERMATOLOGIST`, `ADMIN`
- **Routers (8 Total):**
  1. `app/auth/router.py` (`/api/auth`)
  2. `app/routes/modules.py` (`/api/profile`, `/api/assessment`)
  3. `app/routes/phase3.py` (`/api/routines`, `/api/ingredients`, `/api/products`)
  4. `app/routes/phase4.py` (`/api/recommendations`)
  5. `app/routes/phase5.py` (`/api/analytics`)
  6. `app/routes/phase6.py` (`/api/clinical`)
  7. `app/routes/phase7.py` (`/api/notifications`, `/api/reminders`, `/api/reports`)
  8. `app/routes/image_analysis.py` (`/api/image-analysis`)

### 2.3 Machine Learning Core (`ml/`)
- **Model Checkpoint:** `ml/models/skin_condition_improved.pth` (16MB EfficientNet-B0)
- **Metadata Schema:** `ml/models/improved_model_metadata.json`
- **Loader Singleton:** `backend/app/ai/model_loader.py`
- **Inference Engine:** `backend/app/ai/inference.py` (8 Skin Condition Classes)

---

## 3. Database Schema & Tables
PostgreSQL contains 16 normalized relational tables:
1. `users` — Authentication, roles, password hashes, providers
2. `skin_profiles` — 12-factor dermatological profiles
3. `skin_assessments` — Clinical symptom scores, risk tiers, priorities
4. `skincare_routines` — AI morning, evening, weekly, seasonal routines with JSON step structures
5. `ingredients` — Active clinical ingredients library with safety warnings
6. `ingredient_compatibility_checks` — Cross-reactivity & allergy audit logs
7. `products` — Formulation catalog, prices, multi-store URLs (`purchase_links`)
8. `product_recommendations` — Recommendation history sessions & match rankings
9. `skincare_logs` — Daily compliance and routine adherence tracking
10. `skin_progress_photos` — Historical skin diary photos & vision metric logs
11. `consultations` — Patient-doctor appointments & clinical bookings
12. `clinical_reviews` — Dermatologist clinical notes & prescriptions
13. `notifications` — Real-time alerts & reminder inbox
14. `reminder_settings` — Morning, evening, hydration, and sunscreen reminder schedules
15. `image_analyses` — PyTorch vision inference records & probabilities
16. `alembic_version` — Schema migration state tracking

---

## 4. Current Git Status & Branch
- **Branch:** `durga-laskshmi-narayana-jampa`
- **Remote:** Up to date with `origin/durga-laskshmi-narayana-jampa`
- **Uncommitted Changes:** Milestone 6 verified enhancements in `phase4.py`, `ProductRecommendationsPage.jsx`, and `ProductCatalogPage.jsx`.
