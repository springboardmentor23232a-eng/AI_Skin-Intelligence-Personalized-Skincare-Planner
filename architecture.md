# System Architecture & Repository Structure

## Overview
This repository contains the source code for the **DermaAI Platform** — an AI Skin Intelligence and Personalized Skincare Planner. The system combines deep-learning computer vision with LLM-driven formulation analysis to deliver clinical-grade skin assessments, ingredient interaction scanning, and dynamic routine recommendations. 

The application implements strict Role-Based Access Control (RBAC) across four operational personas: **Patients (Users)**, **Skincare Consultants**, **Board-Certified Dermatologists**, and **System Administrators**.

---

## High-Level Architecture

The platform is designed as a modular monolithic service with clear separation between the presentation tier, API routing controllers, computational AI engines, and the relational persistence layer.

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                       PRESENTATION LAYER (UI)                           │
│   User Portal   │  Consultant Portal  │  Dermatologist  │  Admin Portal │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTP / REST APIs
┌────────────────────────────────────▼────────────────────────────────────┐
│                    APPLICATION & ROUTING CONTROLLERS                    │
│   FastAPI Core  │ Auth / RBAC (JWT)  │ Domain Routers (Appointments,    │
│   (app.py)      │ Middleware (CORS)  │ Routines, Telemetry, Export)     │
└──────────────────┬──────────────────────────────────┬───────────────────┘
                   │                                  │
┌──────────────────▼──────────────────┐ ┌─────────────▼───────────────────┐
│     AI & COMPUTATION ENGINES        │ │         DATA LAYER              │
│ • PyTorch Multi-Modal Vision Model  │ │ • PostgreSQL Relational DB      │
│ • Gemini Skincare LLM Synthesis     │ │ • Connection Pool Engine        │
│ • Ingredient Safety & Comedogenicity│ │ • Relational Schema (DB.sql)    │
│ • Longitudinal Scoring & Trends     │ │ • Static Datasets (data/)       │
└─────────────────────────────────────┘ └─────────────────────────────────┘

```

---

### 1. Presentation Layer (Frontend Dashboards)

Frontend views are delivered via responsive, component-driven HTML5, Tailwind CSS, and vanilla JavaScript interfaces tailored to each role:

* **`user_dashboard/`**: The patient interface. Provides interactive self-assessments, custom routine checklists, product recommendations, ingredient safety scanning, score tracking, and appointment scheduling.
* **`dermatologist_dashboard/`**: The clinical medical interface. Delivers deep diagnostic telemetry, historical condition trend comparisons, electronic prescriptions, and formal PDF report generation.
* **`consultant_dashboard/`**: The advisor interface. Enables skincare specialists to review assigned client profiles, manage consultation queues, view barrier intake reports, and push routine adjustments.
* **`admin_dashboard/`**: The governance interface. Manages practitioner account approvals, audit logging, system health monitoring, and platform analytics.
* **Root Entry Pages**: Dedicated entry points (`index.html`, `user_dashboard.html`, `consultant_dashboard.html`, `dermatologist_dashboard.html`, `admin.html`) direct authenticated users to their authorized workspace.

---

### 2. Application Layer (Backend Routers)

The backend is built with FastAPI to deliver high-throughput, asynchronous API operations:

* **`app.py` / `main.py**`: The central application factory that bootstraps FastAPI, initializes CORS middleware, mounts static files, and aggregates all domain routers.
* **`*_router.py`**: Dedicated REST controllers encapsulating business logic:
* `appointments_router.py`: Handles appointment lifecycle, booking, status transitions, and clinician briefs.
* `dermatologist_router.py`: Manages prescriptions, medical overrides, and patient telemetry.
* `ingredient_router.py`: Serves ingredient safety checks and INCI risk breakdowns.
* `product_router.py`: Manages product catalogs, budget-filtered recommendations, and cosmetic dupes.
* `progress_router.py`: Records daily AM/PM checklist logs, hydration, sleep, and photographic progress.
* `routine_router.py`: Orchestrates multi-layer active routines (combining AI recommendations with doctor overrides).
* `scoring_router.py`: Computes composite skin health scores across biometric pillars.
* `notification_router.py`: Manages in-app alerts, clinician nudges, and reminder preferences.
* `export_router.py`: Generates standardized PDF and CSV clinical dossiers and compliance reports.



---

### 3. AI & Computational Engines

Computational modules isolate heavy analytical and machine learning workloads from the HTTP request cycle:

* **`skin_assessment_engine.py`**: Core assessment engine. Ingests patient image inputs alongside lifestyle survey metrics to produce health scores, concern severities, and risk levels.
* **`ml_engine.py`**: Houses the multi-modal neural network inference pipeline for efficient image feature extraction and tabular risk scoring.
* **`ingredient_engine.py`**: Evaluates formulation safety by cross-referencing INCI cosmetic compounds against declared patient allergies, sensitizing triggers, and contraindications.
* **`routine_engine.py`**: Dynamic regimen builder that translates assessment outputs into tailored AM/PM product steps and weekly treatments.
* **`product_engine.py`**: Analyzes market products across price tiers, matching formulations against user skin types while flagging irritants.
* **`scoring_engine.py`**: Mathematical scoring engine that evaluates rolling 30-day adherence, condition velocity, and predictive score forecasting.
* **`notification_dispatcher.py`**: Background delivery worker routing clinical alerts across push notifications and email channels.
* **`train_model.py`**: Offline model training pipeline used to train and export neural network weights.

---

### 4. Data Layer & Documentation

* **PostgreSQL**: Primary relational database maintaining referential integrity across users, clinical records, routines, appointments, and telemetry logs.
* **`DB.sql`**: Definitive relational schema defining tables, indexes, constraints, and user-role enumerations.
* **`data/`**: Static repository directory storing curated domain datasets.
* **Documentation**: Includes comprehensive setup and architectural guides (`Documentation.pdf`, `Documentation.docx`, `user guide.pdf`, `user guide.docx`).

---

## 📂 Directory Structure

```text
├── admin_dashboard/                # Admin portal HTML interface files
│   ├── account_approvals.html
│   ├── platform_settings.html
│   ├── recommendation_monitoring.html
│   ├── system_reports.html
│   └── user_management.html
├── consultant_dashboard/           # Consultant portal HTML interface files
│   ├── appointments.html
│   ├── client_profiles.html
│   ├── progress_monitoring.html
│   ├── recommendations.html
│   └── skin_reports.html
├── data/                           # Local database store and runtime file storage
├── dermatologist_dashboard/        # Dermatologist portal HTML interface files
│   ├── patient_insights.html
│   ├── progress.html
│   ├── skin_condition_report.html
│   └── treatment_recommendations.html
├── user_dashboard/                 # Patient/User portal HTML interface files
│   ├── appointments.html
│   ├── assessment_history.html
│   ├── checklist.html
│   ├── ingredient_intelligence.html
│   ├── product_recommendations.html
│   ├── progress.html
│   ├── risk_analysis.html
│   ├── routine_planner.html
│   └── skin_assessment.html
│   └── skin_health_scoring.html
├── admin.html                      # Root landing page for Admins
├── app.py                          # Application backend entry point
├── appointments_router.py          # API endpoints for appointments
├── consultant_dashboard.html       # Root landing page for Consultants
├── DB.sql                          # Primary database relational schema definitions
├── dermatologist_dashboard.html    # Root landing page for Dermatologists
├── dermatologist_router.py         # API endpoints for dermatologist logic
├── encoders.pkl                    # Local ML label encoders (Ignored in Git)
├── export_router.py                # API endpoints to export pdf and csv files
├── firebase-messaging-sw.js        # Service worker for push notifications
├── index.html                      # Core project welcome/login portal
├── ingredient_engine.py            # Computational engine for ingredient analysis
├── ingredient_router.py            # API endpoints for ingredient lookups
├── main.py                         # Secondary or alternative system entry point
├── ml_engine.py                    # Core Machine Learning prediction logic
├── model.pth                       # Local PyTorch weights (Ignored in Git)
├── notification_router.py          # API endpoints for notifications
├── notification_dispatcher.py      # Background worker: Multi-channel messaging
├── openapi.json                    # API contract specification
├── product_router.py               # API endpoints for product recommendation
├── product_engine.py               # Computational engine for product recommendations
├── progress_router.py              # API endpoints for user tracking data
├── routine_engine.py               # Computational engine for skin routine builders
├── routine_router.py               # API endpoints for user routines
├── scoring_engine.py               # Computational engine for skin health score
├── scoring_router.py               # API endpoints for calculating skin health score
├── skin_assessment_engine.py       # Core image/data parsing for skin analysis
├── train_model.py                  # Script used to re-train the AI/ML weights
└── user_dashboard.html             # Root landing page for Users
```
```

```
