# PanaceaAI — AI Skin Intelligence & Personalized Skincare Planner

> **An enterprise-grade, full-stack AI Skin Intelligence and Telehealth platform featuring multi-parameter cutaneous biomarker analysis, optical lesion classification, personalized skincare routine planning, 30-day progress analytics, docked clinic messaging & Lumina AI copilot, multi-role clinical synchronization, smart reminders & replenishment forecasting, and automated clinical PDF/Excel reporting backed by PostgreSQL and FastAPI microservices.**

---

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg?logo=nodedotjs)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.19-lightgrey.svg?logo=express)](https://expressjs.com/)
[![Python](https://img.shields.io/badge/Python-v3.10+-blue.svg?logo=python)](https://python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-v0.111-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16-4169E1.svg?logo=postgresql)](https://postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg?logo=docker)](https://www.docker.com/)
[![Tests](https://img.shields.io/badge/Tests-135%2F135%20Passing-brightgreen.svg)](test/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Comprehensive Platform Modules (1 to 11)](#-comprehensive-platform-modules-1-to-11)
  - [Module 1: User & Patient Portal & Authentication](#module-1-user--patient-portal--authentication)
  - [Module 2: Skin Health Assessment & Optical ML Biometric Analysis](#module-2-skin-health-assessment--optical-ml-biometric-analysis)
  - [Module 3: Personalized Skincare Routine Planner](#module-3-personalized-skincare-routine-planner)
  - [Module 4: Ingredient Safety & Contraindication Checker](#module-4-ingredient-safety--contraindication-checker)
  - [Module 5: Products Explorer, Comparison Engine & Dupe Finder](#module-5-products-explorer-comparison-engine--dupe-finder)
  - [Module 6: 30-Day Longitudinal Progress & Compliance Analytics](#module-6-30-day-longitudinal-progress--compliance-analytics)
  - [Module 7: Clinic Telehealth Messenger & Lumina AI Assistant](#module-7-clinic-telehealth-messenger--lumina-ai-assistant)
  - [Module 8: Multi-Role Clinical Synchronization & Privacy Matrix](#module-8-multi-role-clinical-synchronization--privacy-matrix)
  - [Module 9: Multi-Role Dashboard & Analytics Engine](#module-9-multi-role-dashboard--analytics-engine)
  - [Module 10: Notification & Reminder System](#module-10-notification--reminder-system)
  - [Module 11: Clinical Reports & Multi-Format Export System](#module-11-clinical-reports--multi-format-export-system)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Option A: Docker Compose (Quick Start)](#option-a-docker-compose-quick-start)
  - [Option B: Manual Local Setup](#option-b-manual-local-setup)
- [Default Seed Accounts](#-default-seed-accounts)
- [API Endpoints Reference](#-api-endpoints-reference)
  - [Express Backend Platform (Port 3000)](#express-backend-platform-port-3000)
  - [Skin Assessment & Analytics Microservice (Port 8000)](#skin-assessment--analytics-microservice-port-8000)
- [Environment Variables](#-environment-variables)
- [Running Automated Tests](#-running-automated-tests)
- [License & Acknowledgments](#-license--acknowledgments)

---

## 🚀 Overview

**PanaceaAI** is an end-to-end clinical skincare intelligence platform designed to bridge the gap between AI diagnostic models, consumers, certified estheticians, and board-certified dermatologists.

The platform provides:
- A high-performance **Node.js Express backend** handling JWT authentication, Google OAuth 2.0, PostgreSQL relational persistence, and real-time telehealth chat.
- A **Vanilla JS/CSS SPA frontend** featuring luxury clinic editorial aesthetics, dark glassmorphism, responsive mobile layouts, sticky comparison docks, and slide-over notification drawers.
- A **Python FastAPI Microservice** executing quantitative cutaneous biomarker scoring, ISIC lesion classification, 30-day predictive trajectory forecasting, ingredient contraindication checks, replenishment forecasting, and automated clinical report compilation.

---

## ✨ Comprehensive Platform Modules (1 to 11)

### Module 1: User & Patient Portal & Authentication
- **Dual Authentication**: Secure Bcrypt-hashed password login and 1-tap Google Identity Services (GSI) OAuth 2.0.
- **RBAC Security & Auto-Redirect**: Unauthenticated requests trigger non-destructive login dialogs with automatic post-login deep linking.
- **Profile & Preference Customization**: Personalized avatars, skin types, age brackets, primary skin goals, and allergen profiles.

### Module 2: Skin Health Assessment & Optical ML Biometric Analysis
- **Multi-Parameter Cutaneous Assessment**: 8 quantitative biomarkers (Hydration, Sebum, Barrier Strength, Acne Severity, Erythema Reactivity, Pigmentation, Sensitivity, Wrinkles).
- **ISIC Lesion Screening**: Optical classifier screening for suspicious melanocytic lesions with clinical confidence levels.
- **Fitzpatrick Phototype Scoring**: Phototype identification for customized UV protection indices.

### Module 3: Personalized Skincare Routine Planner
- **Chronological Regimens**: Morning (AM) protection protocols and Evening (PM) cellular repair workflows.
- **Dynamic Step Creator**: Add custom products with application notes, time delays, and target benefits.
- **Weekly Treatment Schedules**: Scheduled active treatments (e.g. Chemical Peels, Retinoids, Hydrating Clay Masks).

### Module 4: Ingredient Safety & Contraindication Checker
- **Layering Safety Engine**: Detects conflicting actives (e.g., *Vitamin C + Direct Retinol*, *Salicylic Acid + Adapalene*).
- **Comedogenic & Allergen Scanning**: Flags pore-clogging lipids, synthetic fragrances, and common skin irritants.
- **Safety Verdicts**: Provides clear guidance on how to alternate actives between AM/PM sessions.

### Module 5: Products Explorer, Comparison Engine & Dupe Finder
- **Curated 20+ Master Products Catalog**: Live e-commerce links (Amazon, Nykaa, Flipkart), MRP, and active formulas.
- **Sticky Comparison Dock**: Select up to 4 formulations for a side-by-side spec, ingredient, and suitability breakdown.
- **Smart Dupe & Alternative Engine**: Algorithmic recommendations for budget-friendly alternatives, fragrance-free options, and higher-potency upgrades.

### Module 6: 30-Day Longitudinal Progress & Compliance Analytics
- **30-Day Routine Adherence Heatmap**: Daily habit compliance tracking morning/evening completion streaks and behavioral consistency.
- **Interactive Before & After Comparison Slider**: Dual-layer visual and biomarker matrix comparing baseline vs current status.
- **30-Day AI Predictive Forecast Curves**: Longitudinal biomarker trajectory modeling with weekly velocity gains and AI clinical verdicts.

### Module 7: Clinic Telehealth Messenger & Lumina AI Assistant
- **Docked Floating Messenger Popup (`#floating-messenger-dock`)**: Omnipresent floating button with gold pulse dot, expandable into a 380px x 540px docked card.
- **Dedicated 3-Pane Full-Screen Telehealth Studio (`/chat`)**:
  - *Left Pane*: Directory of contacts with search and category filters (*All*, *Care Team*, *Lumina AI*).
  - *Center Pane*: Encrypted message cards, read receipts (`✓✓`), audio voice note simulator, and photo attachments.
  - *Right Pane*: Live cutaneous telemetry snapshot, active digital prescriptions (Rx), and 1-click video telehealth booking.
- **Lumina AI Skincare Copilot**: Context-aware engine evaluating active acid/retinoid contraindications, barrier repair guidelines, and specialist triage in real time.

### Module 8: Multi-Role Clinical Synchronization & Privacy Matrix
- **Zero-Fake Data Synchronization**: Live patient records derived directly from database tables across all role portals.
- **Interactive Clinical Patient Dossier**: 3-tab clinician view containing biomarkers, progress curves, and Rx history.
- **Granular Data Sharing Matrix**: Patients choose which modules (Biomarkers, Photos, Routine Adherence, Medical Rx History) are visible to their assigned consultant vs doctor.

### Module 9: Multi-Role Dashboard & Analytics Engine
- **User Dashboard**:
  - **5-Factor Weighted Score Breakdown**: Computes overall skin score (0–100) from Barrier Strength (25%), Hydration (20%), Clarity (20%), Elasticity (15%), and Texture (20%).
  - **Interactive Daily Skincare Checklist**: Real-time AM and PM routine step toggles with cross-database persistence and active streak counter.
- **Consultant Dashboard**: Synchronized client roster, client profile telemetry, and **Consultant Regimen Management Modal**.
- **Dermatologist Dashboard**: Patient medical charts with optical ISIC lesion screening and **Digital Medical Prescription (Rx) Modal**.
- **Admin Dashboard**: Real-time 12-microservice health monitor, user CRUD management, audit trail, and platform analytics.

### Module 10: Notification & Reminder System
- **Slide-Over Notification Center Drawer**: Accessible via the navigation bell icon with dynamic unread badge counter.
- **Category Filtering**: Filter across `All`, `Routines`, `Products`, `Hydration & Sleep`, and `Clinical` alerts.
- **Smart Reminders**: Scheduled AM/PM routine alerts, hydration interval check-ins (every 2 hours), and circadian sleep prompts.
- **Product Replenishment Engine**: Usage-velocity prediction issuing low-stock alerts when remaining usage is $\le 7$ days or $\le 25\%$, with 1-click re-order links.
- **Cellular Hydration & Sleep Trackers**: Real-time water intake logger (`+250ml` quick actions) and circadian sleep repair telemetry.

### Module 11: Clinical Reports & Multi-Format Export System
- **5 Specialized Clinical Report Builders**:
  1. *Executive Holistic Skin Health Dossier*
  2. *Cutaneous Diagnostic Assessment Report* (Biomarkers + ISIC Lesion Malignancy)
  3. *Personalized Regimen & Schedule Report*
  4. *Formulation Compatibility & Dupe Dossier*
  5. *30-Day Longitudinal Progress Audit*
- **1-Click Clinical Printable PDF**: Formatted with PanaceaAI clinical headers, patient demographics, biomarker gauge meters, and attending physician signatures via dedicated `@media print` CSS.
- **Multi-Sheet CSV / Excel Export**: Fast streaming export of progress telemetry, product catalogs, and routine logs.

---

## 🏗️ System Architecture

```
                               ┌──────────────────────────────────────────────┐
                               │       Web Browser Client (Modern SPA)        │
                               │  User / Consultant / Dermatologist / Admin   │
                               └──────────────────────┬───────────────────────┘
                                                      │
                                        HTTP / REST   │ (Port 3000)
                                                      ▼
                               ┌──────────────────────────────────────────────┐
                               │       Express Platform Server (Node.js)      │
                               │  - JWT Auth, RBAC Guards, Google OAuth 2.0   │
                               │  - Multi-Role Clinic Telehealth Chat Stream  │
                               │  - Notification Center & Reminder Engine     │
                               │  - Clinical Patient Dossiers & Reports Hub   │
                               └──────────────┬───────────────────────────────┘
                                              │
                        ┌─────────────────────┴─────────────────────┐
                        │                                           │
                        ▼ (Port 8000)                               ▼ (Port 5432)
      ┌───────────────────────────────────┐       ┌───────────────────────────────────┐
      │  FastAPI Analytics Microservice   │       │        PostgreSQL Database        │
      │  - Cutaneous Biomarker Scoring    │──────►│  - users & user_profiles          │
      │  - ISIC Optical Lesion Classifier │       │  - assessments & biomarkers       │
      │  - 30-Day Progress & Adherence    │       │  - daily_skincare_checklists      │
      │  - Notifications & Reminders      │       │  - product_replenishment_tracking │
      │  - 5-Report PDF / CSV Generators  │       │  - hydration_logs & sleep_logs    │
      └───────────────────────────────────┘       └───────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend UI** | HTML5, Vanilla CSS3, ES6 Modules | Editorial luxury design, glassmorphism, docked floating messenger, slide-over notification drawer |
| **Platform Server** | Node.js (v18+), Express (v4.19) | REST APIs, JWT Auth, Bcrypt password hashing, Telehealth Chat, Reminders, Reports endpoints |
| **Microservices Engine** | Python (3.10+), FastAPI, SQLAlchemy, Pydantic | Quantitative cutaneous scoring, ISIC lesion screening, Progress forecast, Notification dispatcher, Report builders |
| **Database** | PostgreSQL (v16) / In-Memory Store | Multi-table relational schema with auto-seeding engine and cross-database SQL query compatibility |
| **Security & Auth** | JWT, BcryptJS, Google OAuth 2.0 | Role-based authorization, unauthenticated action interception, and session persistence |
| **Testing** | Node test runner, Pytest | **135 automated unit & integration tests** across Node.js and Python microservices with **100% pass rate** |

---

## 📁 Project Directory Structure

```
AI_Skin_Project/
├── server/                           # Node.js Express Backend Platform
│   ├── config/                       # DB configuration (pg pool & in-memory fallback)
│   ├── db/                           # SQL schemas (schema.sql) & seed engine (seed.js)
│   ├── middleware/                   # JWT verification & RBAC authorization middleware
│   ├── routes/                       # Auth, Clinical Sync, Telehealth Chat, Dashboard, & Reports routes
│   └── index.js                      # Express application entry point
├── skin_assessment_engine/           # Python FastAPI Microservice
│   ├── app/                          # FastAPI application package
│   │   ├── routers/                  # Assessment, Clinical, Progress, Chat, Dashboard, Notification, Report
│   │   ├── services/                 # Biomarker scoring, Progress analytics, Notification dispatcher, Report service
│   │   ├── models.py & schemas.py    # SQLAlchemy ORM & Pydantic validation models
│   │   └── main.py                   # FastAPI app mount
│   ├── tests/                        # Pytest automated test suite (63 tests)
│   ├── requirements.txt              # Python dependencies
│   └── schema.sql                    # Microservice database schema
├── js/                               # Frontend ES6 Client Modules
│   ├── api.js                        # Unified API client for Express (3000) & FastAPI (8000)
│   ├── app.js                        # Main SPA orchestrator, auth guards, messenger, notifications controller
│   ├── auth.js                       # Client-side session and role management
│   ├── dashboards.js                 # HTML view renderers (User, Consultant, Doctor, Admin, Chat, Reports, Drawer)
│   └── mockData.js                   # Clinical fallback datasets, notifications, replenishments, report templates
├── css/                              # Global Styling & Component Systems
│   └── style.css                     # Vanilla CSS styling with luxury dark & editorial themes, @media print rules
├── test/                             # Node.js Automated Test Suites (72 tests)
│   ├── dashboard.test.js             # View rendering & formula tests
│   ├── server.test.js                # Auth, JWT, & RBAC tests
│   ├── routine.test.js               # Personalized routine planner tests
│   ├── products.test.js              # Products catalog & comparison tests
│   ├── progress.test.js              # Progress analytics & adherence tests
│   ├── clinical_sync.test.js         # Multi-role dossier sync tests
│   ├── consultation_sharing.test.js  # Patient privacy & sharing matrix tests
│   ├── chat.test.js                  # Telehealth chat & Lumina AI tests
│   ├── dashboard_v9.test.js          # Module 9 dashboard telemetry & checklist tests
│   ├── notifications_v10.test.js     # Module 10 notification, replenishment, & reminder tests
│   └── reports_v11.test.js           # Module 11 report builders, PDF, & CSV export tests
├── assets/                           # Product imagery, logos, and medical icons
├── Dockerfile                        # Platform Web/Server container
├── docker-compose.yml                # Multi-container orchestration (Node, FastAPI, Postgres)
├── index.html                        # Primary SPA entry page
├── package.json                      # Node.js manifest & scripts
└── README.md                         # Project documentation
```

---

## 🚦 Getting Started

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/) *(Recommended)*
- **OR** for manual local setup:
  - Node.js (v18 or higher)
  - Python (v3.10 or higher)
  - PostgreSQL (v16 or higher)

---

### Option A: Docker Compose (Quick Start)

Run the complete multi-tier system with a single command:

```bash
# Clone repository
git clone https://github.com/springboardmentor23232a-eng/AI_Skin-Intelligence-Personalized-Skincare-Planner.git
cd AI_Skin-Intelligence-Personalized-Skincare-Planner

# Start containers in detached mode
docker-compose up --build -d
```

#### Service Access URLs:
- 🌐 **Web Platform & Express API**: [http://localhost:3000](http://localhost:3000)
- 🐍 **FastAPI Skin Assessment & Reports Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 🗄️ **PostgreSQL Relational Database**: `localhost:5432` (`panacea_skin_db`)

To stop all services:
```bash
docker-compose down
```

---

### Option B: Manual Local Setup

#### 1. Setup PostgreSQL Database
```sql
CREATE DATABASE panacea_skin_db;
```

#### 2. Setup Node.js Express Backend
```bash
# Install dependencies
npm install

# Start Express server (auto-seeds database on start)
npm start
```
The server will run on [http://localhost:3000](http://localhost:3000).

#### 3. Setup Python FastAPI Engine
In a separate terminal:
```bash
cd skin_assessment_engine

# Create & activate virtual environment
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Start FastAPI microservice
uvicorn app.main:app --reload --port 8000
```
Interactive API documentation will be live at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 🔑 Default Seed Accounts

The platform includes pre-seeded accounts for all system roles:

| Role | Username | Password | Email | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **User / Patient** | `user` | `user123` | `user@panacea.ai` | User Dashboard, Skin Assessment, Progress Lab, Chat & Lumina AI, Notifications, Reports |
| **Skincare Consultant** | `consultant` | `consultant123` | `consultant@panacea.ai` | Consultant Workspace, Client Roster, Regimen Builder Protocol |
| **Dermatologist Doctor** | `doctor` | `doctor123` | `doctor@panacea.ai` | Clinical Portal, Patient Dossiers, Prescription (Rx) Authorization |
| **Platform Administrator** | `admin` | `admin123` | `admin@panacea.ai` | System Control Center, User Verification, Microservices Monitor |

---

## 🔌 API Endpoints Reference

### Express Backend Platform (Port 3000)

| HTTP Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account (submits for admin approval) |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `POST` | `/api/auth/google` | Public | Google OAuth 2.0 credential verification |
| `GET` | `/api/dashboard/user-metrics` | Authenticated | User 5-factor weighted score & adherence stats |
| `POST` | `/api/dashboard/checklist/toggle` | Authenticated | Toggle AM/PM skincare checklist item |
| `GET` | `/api/dashboard/consultant-metrics` | Consultant | Consultant client caseload & adherence telemetry |
| `GET` | `/api/dashboard/dermatologist-metrics` | Doctor | Dermatologist patient telemetry & lesion triage stats |
| `GET` | `/api/dashboard/admin-metrics` | Admin | 12-microservice health & system metrics |
| `GET` | `/api/notifications` | Authenticated | Fetch notifications with category filtering |
| `PATCH` | `/api/notifications/:id/read` | Authenticated | Mark individual notification as read |
| `POST` | `/api/notifications/mark-all-read` | Authenticated | Mark all user notifications as read |
| `GET` | `/api/notifications/reminders` | Authenticated | Get scheduled reminder preferences |
| `PUT` | `/api/notifications/reminders` | Authenticated | Update scheduled reminder preferences |
| `GET` | `/api/notifications/replenishment` | Authenticated | Get smart replenishment predictions & low-stock alerts |
| `POST` | `/api/notifications/hydration/log` | Authenticated | Log water intake (+250ml quick action) |
| `POST` | `/api/notifications/sleep/log` | Authenticated | Log circadian sleep duration & repair quality |
| `POST` | `/api/reports/generate` | Authenticated | Generate clinical report and HTML preview |
| `GET` | `/api/reports/history` | Authenticated | List generated clinical reports archive |
| `GET` | `/api/reports/:id/pdf` | Authenticated | Render printable clinical PDF HTML |
| `GET` | `/api/reports/export/csv` | Authenticated | Download CSV / Excel dataset export |
| `GET` | `/api/clinical/consultant/clients` | Consultant | Get synchronized client roster |
| `GET` | `/api/clinical/dermatologist/patients` | Doctor | Get synchronized medical patient roster |
| `GET` | `/api/clinical/patient-dossier/:userId` | Clinicians | Retrieve patient medical dossier (with RBAC redactions) |
| `POST` | `/api/clinical/consultant/update-regimen` | Consultant | Save esthetician regimen notes |
| `POST` | `/api/clinical/dermatologist/update-prescription` | Doctor | Authorize and sign medical prescription (Rx) |
| `GET` | `/api/clinical/user/sharing-preferences` | User | Retrieve data sharing permissions matrix |
| `POST` | `/api/clinical/user/sharing-preferences` | User | Update consent permissions for care team |
| `POST` | `/api/clinical/user/book-consultation` | User | Schedule telehealth appointment |
| `GET` | `/api/chat/conversations` | Authenticated | Retrieve user conversation channels |
| `GET` | `/api/chat/messages` | Authenticated | Retrieve message history for active contact |
| `POST` | `/api/chat/send` | Authenticated | Send message (triggers Lumina AI reply if recipient is AI) |
| `GET` | `/api/admin/users` | Admin | List all platform registered users |
| `PUT` | `/api/admin/users/:id/approve` | Admin | Approve pending user account |

### Skin Assessment & Analytics Microservice (Port 8000)

| HTTP Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/assessment` | Calculate 8-biomarker score, risk rules, and save assessment |
| `GET` | `/assessment/history` | Retrieve historical assessment timeline |
| `POST` | `/progress/log` | Record longitudinal progress checkpoint |
| `GET` | `/progress/history/{userId}` | Retrieve 30-day progress history |
| `GET` | `/progress/adherence/{userId}` | Calculate habit adherence percentage and streak |
| `POST` | `/progress/compare` | Dual-checkpoint Before & After comparison verdict |
| `GET` | `/progress/trends/{userId}` | 30-day predictive trajectory curve generation |
| `GET` | `/dashboard/telemetry/{userId}` | 5-factor weighted score calculation & checklist status |
| `POST` | `/dashboard/checklist/toggle` | Toggle daily checklist item state |
| `GET` | `/dashboard/consultant/caseload` | Consultant caseload telemetry |
| `GET` | `/dashboard/dermatologist/telemetry` | Dermatologist patient telemetry & ISIC screening stats |
| `GET` | `/dashboard/admin/metrics` | Microservice system metrics & uptime |
| `GET` | `/notifications/{userId}` | Retrieve categorized notifications |
| `POST` | `/notifications/reminders` | Create or update reminder preferences |
| `GET` | `/notifications/replenishment/{userId}` | Calculate replenishment forecast & low-stock alerts |
| `POST` | `/notifications/hydration/log` | Log water hydration checkpoint |
| `POST` | `/notifications/sleep/log` | Log sleep & circadian repair telemetry |
| `POST` | `/report/generate` | Build 1 of 5 clinical reports & HTML preview |
| `GET` | `/report/history/{userId}` | List historical reports |
| `GET` | `/report/export/csv` | Stream clinical CSV dataset |
| `POST` | `/ingredient/analyze` | Active chemical contraindication and safety checker |
| `POST` | `/product/recommend` | Suitability scoring engine for product catalog |
| `POST` | `/product/compare` | Side-by-side formulation matrix generator |
| `GET` | `/chat/conversations` | FastAPI chat conversation channels |
| `POST` | `/chat/send` | Send message & generate Lumina AI response |
| `GET` | `/health` | Microservice health check and DB ping |

---

## ⚙️ Environment Variables

### Root Platform (`.env`)
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/panacea_skin_db
JWT_SECRET=panacea_ai_skin_intelligence_jwt_secret_key_2026_super_secret
JWT_EXPIRES_IN=24h
GOOGLE_CLIENT_ID=435046043372-n2nmis20orleg8q57rh6o0muo7qpi0c3.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Python Engine (`skin_assessment_engine/.env`)
```env
PROJECT_NAME="PanaceaAI Skin Assessment Engine API"
VERSION="1.0.0"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/panacea_skin_db"
JWT_SECRET_KEY="panacea_super_secret_jwt_key_2026_infosys_springboard"
JWT_ALGORITHM="HS256"
```

---

## 🧪 Running Automated Tests

Run the complete test suites to verify platform integrity:

### 1. Node.js Express & Database Test Suite (72 Tests)
```bash
npm run test:all
```
*Executes all unit, RBAC security, routine, product comparison, progress tracking, clinical sync, telehealth chat, dashboard metrics, notifications, and clinical reports tests.*

### 2. Python FastAPI Microservice Test Suite (63 Tests)
```bash
cd skin_assessment_engine
.\.venv\Scripts\pytest tests/ -v
```
*Executes all scoring algorithm, ISIC classifier, progress analytics, ingredient contraindication, chat engine, dashboard telemetry, notification replenishment, and report generation tests.*

**Overall Pass Rate**: **135 / 135 Tests Passing (100%)**

---

## 📄 License & Acknowledgments

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

<p align="center">
  <b>PanaceaAI</b> — Developed by <b>Manish Kumar</b> for <b>Infosys Springboard Project</b><br>
  Contact: <a href="mailto:moonknight4550@gmail.com">moonknight4550@gmail.com</a>
</p>
