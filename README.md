# AI Skin Intelligence & Personalized Skincare Planner

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.x-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![PyTorch](https://img.shields.io/badge/PyTorch-EfficientNet--B0-EE4C2C.svg?logo=pytorch&logoColor=white)](https://pytorch.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20Neon-336791.svg?logo=postgresql&logoColor=white)](https://neon.tech)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An AI-assisted skincare personalization and clinical oversight platform that combines personal skin profiles, lifestyle factors, sleep metrics, daily hydration, and skin concerns with computer vision skin assessment, personalized routine generation, ingredient intelligence, product recommendations, 5-factor skin health scoring, progress tracking, analytics, and clinical report exports.

> [!IMPORTANT]
> **AI-Assisted Skincare Platform**: This software is an engineering information and cosmetic personalization platform. It does **not** provide a definitive medical diagnosis and is **not** a substitute for professional medical consultation or certified clinical evaluation.

---

## 🌐 Live Demo

The production platform is deployed and publicly accessible for mentor evaluation:

🔗 **[Open Live Demo: https://ai-skin-intelligence-lakshmi-narayana-jampa.vercel.app/](https://ai-skin-intelligence-lakshmi-narayana-jampa.vercel.app/)**

- **Public Access**: Live without paywalls or restrictive network firewalls.
- **Demonstration Mode**: All four platform roles (`USER`, `SKINCARE_CONSULTANT`, `DERMATOLOGIST`, `ADMIN`) are selectable upon registration for evaluation.
- **Google Sign-In**: Fully supported with generic Google OAuth chooser flow.

---

## 📑 Table of Contents

- [Project Status](#project-status)
- [Public Demonstration Mode](#public-demonstration-mode)
- [Role Workspaces](#role-workspaces)
- [Core Features](#core-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Docker Setup](#docker-setup)
- [Database Configuration](#database-configuration)
- [Authentication](#authentication)
- [AI & Machine Learning](#ai--machine-learning)
- [Skin Health Scoring Model](#skin-health-scoring-model)
- [API Documentation](#api-documentation)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Production Verification](#production-verification)
- [Deployment Architecture](#deployment-architecture)
- [Security & Data Privacy](#security--data-privacy)
- [Troubleshooting](#troubleshooting)
- [Disclaimers](#disclaimers)
- [Project Documentation Links](#project-documentation-links)
- [License](#license)

---

## Project Status

**Production-ready for public mentor demonstration.**

- Verified across local development, Docker containerization, and public Vercel/Neon production environments.
- Comprehensive automated test suite passed: **176 / 176 tests passing**.
- Anonymous access, four-role registration, session isolation, and authenticated workflows verified.
- Note: This project is an academic/internship capstone demonstration; it has not undergone independent clinical certification or FDA/CE regulatory medical device authorization.

---

## Public Demonstration Mode

For internship mentors, reviewers, and evaluators, this project is configured in **Public Demonstration Mode**:

- Visitors can freely register new accounts and directly select any of the four supported roles during registration.
- This configuration enables evaluators to inspect end-to-end features—from consumer routine building to clinical teleconsultations and administrative audit telemetry—without requiring pre-provisioned administrative invites.
- *Notice*: This public demonstration registration pattern is intended specifically for project evaluation and should not be considered an unrestricted enterprise access control pattern.

---

## Role Workspaces

The platform implements strict Role-Based Access Control (RBAC) across four workspaces:

| Role | Purpose | Main Workspace | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **`USER`** | Personalized skincare experience | User Dashboard | Skin profile, AI assessment upload, 5-factor scoring, custom routine generator, ingredient checks, product recommendations, progress diary, report downloads. |
| **`SKINCARE_CONSULTANT`** | Professional cosmetic guidance | Consultant Workspace | Client review queue, customized routine adjustments, ingredient conflict checks, consultation note tracking. |
| **`DERMATOLOGIST`** | Clinical skin review workflow | Dermatologist Workspace | Specialist assessment logs, clinical observation review, risk factor evaluation, consultation history. |
| **`ADMIN`** | Platform administration & telemetry | Admin Dashboard | System health monitoring, active user directory, audit trails, server telemetry, role oversight. |

---

## Core Features

### 1. Authentication & Identity
- **Email & Password**: Cryptographic registration and login with PBKDF2 password hashing.
- **JWT Session Tokens**: Secure HS256 access tokens with short lifetimes and automated session refresh.
- **Google OAuth 2.0**: Generic Google Sign-In button activating the standard account selection modal.
- **Public Role Registration**: Instant evaluation access across all 4 system roles.
- **Session Cleanup**: Client-side and server-side token invalidation upon logout.

### 2. Personal Skin Profile
- **Fitzpatrick Skin Typing**: Classification across types I through VI.
- **Primary & Secondary Concerns**: Targeted tracking for acne, aging, hyperpigmentation, dryness, redness, and sensitivity.
- **Lifestyle & Environment**: Sleep hours, daily water intake, stress levels, exercise frequency, and climate/sun exposure.

### 3. AI-Assisted Skin Assessment
- **Image Upload**: Upload facial/skin diagnostic imagery directly via web interface.
- **Computer Vision Classification**: EfficientNet-B0 convolutional neural network classifying skin conditions across 8 clinical condition groups.
- **Confidence Scoring**: Probability distribution displaying top predicted condition categories.
- **Adaptive Fallback**: Deterministic fallback inference engine operating seamlessly in serverless cloud environments.

### 4. Personalized Routine Engine
- **Multi-Timeframe Scheduling**: Automated routine formulation across 5 distinct cycles:
  - **Morning (AM)**: Cleansing, antioxidant protection, hydration, broad-spectrum UV protection.
  - **Evening (PM)**: Double cleansing, targeted actives, cellular repair, barrier sealants.
  - **Weekly**: Exfoliation, deep hydration masks, barrier recovery cycles.
  - **Monthly**: Skin cycling reviews and periodic active ingredient adjustments.
  - **Seasonal**: Climate-adaptive routine shifts (humidity vs. arid winter transitions).
- **Customization**: Interactive step completion, product swaps, and custom step additions.

### 5. Ingredient Intelligence & Safety
- **Chemical Conflict Engine**: Real-time detection of incompatible active ingredients (e.g., Vitamin C + Retinol, AHA/BHA + Niacinamide at extreme pH).
- **Allergen & Sensitivity Flags**: Custom warnings for specific skin sensitivities and known irritants.
- **Safety Database**: Comprehensive ingredient library detailing functional benefits, comedogenicity ratings, and irritation indices.

### 6. Product Recommendations
- **Multi-Parameter Matching**: Match scoring based on user skin type, diagnosed concerns, ingredient safety, and user budget.
- **Product Details & Alternatives**: Detailed ingredient breakdowns, alternative recommendations, and vendor store links.
- **Product Comparison**: Side-by-side comparison of active concentrations, compatibility scores, and suitability.

### 7. Skin Health Scoring Engine
- Dynamic barrier health computation utilizing an engineered 5-factor weighted model.
- Visual score gauge (0–100) with barrier health status categorizations.
- Longitudinal score tracking reflecting user lifestyle and routine consistency changes over time.

### 8. Progress Diary & Analytics
- **Daily Journaling**: Track daily skin condition, stress ratings, flare-up notes, and routine compliance.
- **Diagnostic Photo Timeline**: Visual side-by-side history of user skin changes.
- **Analytics Visualizations**: Historical charts showing score progression and factor correlations.

### 9. Notifications & Reminders
- **Smart Reminders**: Timely alerts for morning and evening skincare routines.
- **Notification Inbox**: Filterable notification center with unread counters and status updates.

### 10. Multi-Format Clinical Reports
- **PDF Report**: Formatted clinical skin assessment report complete with user profile, diagnostic summary, routine instructions, and scoring details.
- **CSV Data Export**: Structured tabular export of all historical diary entries, scores, and logs.
- **Excel (.XLSX) Export**: Multi-sheet workbook formatted with openpyxl for deep clinical analysis.

---

## System Architecture

```
                               ┌────────────────────────────────────────────────┐
                               │           Web Browser Client                   │
                               │  (Desktop, Tablet, Mobile Responsive View)    │
                               └───────────────────────┬────────────────────────┘
                                                       │ HTTPS Requests
                                                       ▼
                               ┌────────────────────────────────────────────────┐
                               │             React 19 + Vite SPA                │
                               │  • React Router DOM (Role Protected Routes)   │
                               │  • Axios HTTP Client with JWT Interceptors    │
                               │  • Bootstrap 5 Modern Responsive UI           │
                               │  • Google Identity OAuth Component            │
                               └───────────────────────┬────────────────────────┘
                                                       │ REST API (/api/*)
                                                       ▼
                               ┌────────────────────────────────────────────────┐
                               │             FastAPI Backend Service            │
                               │  • GZip Compression & Security Middleware      │
                               │  • JWT Auth, Passlib (PBKDF2/Bcrypt)           │
                               │  • Role-Based Access Control (RBAC Enforcer)   │
                               │  • Pydantic Schema Validation                  │
                               │  • Report Generation (FPDF2, openpyxl, CSV)    │
                               └──────────────┬──────────────────┬──────────────┘
                                              │                  │
                                              ▼                  ▼
                       ┌────────────────────────────┐    ┌──────────────────────────────┐
                       │  PostgreSQL / Neon Cloud   │    │  PyTorch ML Inference Engine │
                       │  • SQLAlchemy 2.0 ORM      │    │  • EfficientNet-B0 (8 Class) │
                       │  • Alembic Data Migration  │    │  • Pretrained Weights (.pth) │
                       │  • Catalog & User Data     │    │  • Deterministic Cloud Fallback│
                       └────────────────────────────┘    └──────────────────────────────┘
```

- **Frontend**: Single Page Application providing interactive forms, role workspaces, score gauges, routine planners, and data visualizations.
- **Backend**: High-performance asynchronous API providing authentication, business logic, authorization enforcement, scoring algorithms, and report generation.
- **Database**: Relational storage maintaining user accounts, clinical profiles, routines, product catalogs, ingredients, diary logs, and audit trails.
- **Machine Learning**: Computer vision model performing condition classification from uploaded images, paired with an adaptive fallback engine for serverless environments.

---

## Technology Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Styling**: [Bootstrap 5](https://getbootstrap.com/)
- **Authentication**: [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (ASGI, Python 3.10+)
- **Server**: [Uvicorn](https://www.uvicorn.org/)
- **ORM**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/)
- **Migrations**: [Alembic](https://alembic.sqlalchemy.org/)
- **Data Validation**: [Pydantic v2 & Pydantic Settings](https://docs.pydantic.dev/)
- **Security & Auth**: [python-jose](https://github.com/mpdavis/python-jose), [passlib](https://passlib.readthedocs.io/)
- **Report Engines**: [FPDF2](https://py-pdf.github.io/fpdf2/), [openpyxl](https://openpyxl.readthedocs.io/)

### Database
- **Production**: [Neon Serverless PostgreSQL](https://neon.tech/)
- **Local / Container**: PostgreSQL 15 Alpine (with automatic SQLite fallback for zero-dependency local testing)

### Machine Learning
- **Framework**: [PyTorch](https://pytorch.org/) & [Torchvision](https://pytorch.org/vision/)
- **Architecture**: EfficientNet-B0 (SCIN Dataset Clinical Classification)
- **Model Checkpoint**: `ml/models/skin_condition_improved.pth`
- **Metadata**: `ml/models/improved_model_metadata.json`

### Deployment & Infrastructure
- **Cloud Hosting**: [Vercel](https://vercel.com/) (Frontend static hosting + Serverless Python API bridge)
- **Containers**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

---

## Project Structure

```
AI_Skin-Intelligence-Personalized-Skincare-Planner/
│
├── frontend/                     # React + Vite Frontend Application
│   ├── src/                      # Components, pages, context, styles
│   │   ├── components/           # Reusable UI components (Navbar, Modals, Gauges)
│   │   ├── pages/                # Workspace views (Dashboard, Consultant, Admin, Routines)
│   │   ├── services/             # Axios API service integrations
│   │   └── context/              # Authentication and application state
│   ├── public/                   # Favicon and static web assets
│   ├── package.json              # Frontend dependencies and npm scripts
│   ├── vite.config.js            # Vite bundle and proxy configuration
│   ├── nginx.conf                # Nginx production configuration for Docker
│   ├── Dockerfile                # Multi-stage production container build
│   └── .env.example              # Frontend environment template
│
├── backend/                      # FastAPI Python Backend Service
│   ├── app/                      # Application core, database models, routes
│   │   ├── auth/                 # JWT handlers, Google auth, service layer
│   │   ├── core/                 # Settings and configuration management
│   │   ├── db/                   # Database session and connection setup
│   │   ├── ai/                   # Vision transforms and model inference loader
│   │   ├── routes/               # API endpoints (Auth, Routine, Products, Scoring, Reports)
│   │   ├── models.py             # SQLAlchemy database models
│   │   ├── schemas.py            # Pydantic validation schemas
│   │   └── main.py               # FastAPI entry point and middleware
│   ├── alembic/                  # Database migration versions
│   ├── alembic.ini               # Alembic configuration
│   ├── tests/                    # 176 automated pytest verification test suites
│   ├── requirements.txt          # Python dependencies
│   ├── Dockerfile                # Multi-stage non-root Python container build
│   └── .env.example              # Backend environment template
│
├── ml/                           # Machine Learning Pipeline
│   ├── models/                   # Pretrained weights and model metadata
│   │   ├── skin_condition_improved.pth
│   │   └── improved_model_metadata.json
│   ├── data/                     # Dataset split files and exploratory artifacts
│   ├── notebooks/                # Model exploration and evaluation notebooks
│   ├── src/                      # Data pipeline, training, and evaluation scripts
│   └── requirements.txt          # ML dependencies
│
├── docs/                         # Project Documentation & Forensic Reports
│   ├── project/                  # Mentor documentation PDF and generation scripts
│   ├── deployment/               # Vercel and production deployment guides
│   ├── guides/                   # User and administrator operational manuals
│   ├── testing/                  # Forensic verification and performance audits
│   └── phase7/                   # Skin health scoring engine documentation
│
├── api/                          # Vercel Serverless Function Bridge
│   └── index.py                  # ASGI entry point for cloud serverless execution
│
├── scripts/                      # Deployment automation scripts
│   ├── deploy_production.bat     # Windows deployment runner
│   └── deploy_production.sh      # Linux / macOS deployment runner
│
├── docker-compose.yml            # Multi-container orchestration (DB, Backend, Nginx Frontend)
├── vercel.json                   # Vercel routing and serverless build configuration
├── requirements.txt              # Root dependency manifest
├── .gitignore                    # Git tracking exclusions
├── LICENSE                       # MIT License
└── README.md                     # Comprehensive project documentation
```

---

## Prerequisites

Before setting up the project locally, verify you have the following installed:

- **Git**: [Git SCM](https://git-scm.com/)
- **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
- **npm**: `v9.0.0` or higher
- **Python**: `v3.10`, `v3.11`, or `v3.12`
- **PostgreSQL** *(Optional)*: `v14.0` or higher (If not installed, backend automatically falls back to local SQLite)
- **Docker & Docker Compose** *(Optional, for containerized run)*

---

## Local Setup

Follow these step-by-step instructions to run the application on your local machine:

### Step 1 — Clone the Repository
Clone the repository using the verified submission branch:

```bash
git clone https://github.com/springboardmentor23232a-eng/AI_Skin-Intelligence-Personalized-Skincare-Planner.git
cd AI_Skin-Intelligence-Personalized-Skincare-Planner
git checkout durga-laskshmi-narayana-jampa
```

### Step 2 — Backend Setup
Create and activate a Python virtual environment:

```bash
cd backend

# On Windows:
python -m venv venv
.\venv\Scripts\activate

# On macOS/Linux:
python3 -m venv venv
source venv/bin/activate
```

Install backend dependencies:
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 3 — Backend Environment Configuration
Create a `.env` file inside the `backend/` directory by copying the example template:

```bash
# On Windows PowerShell:
Copy-Item .env.example .env

# On Linux / macOS:
cp .env.example .env
```

Open `backend/.env` and review the required configuration variable names:
- `DATABASE_URL`: Connection string for PostgreSQL (e.g. `postgresql://user:password@localhost:5432/skin_db`). If left as SQLite or if PostgreSQL is unreachable, the system automatically uses SQLite `skin_db.db`.
- `JWT_SECRET_KEY`: Random 64-character secret string for signing access tokens.
- `JWT_REFRESH_SECRET_KEY`: Random 64-character secret string for signing refresh tokens.
- `GOOGLE_CLIENT_ID`: Optional Google OAuth 2.0 Web Client ID for Google login.
- `ENVIRONMENT`: Set to `development`.

> [!CAUTION]
> **Never commit `.env` or production credentials to version control.** All secrets must be kept in local untracked `.env` files or injected via environment variables.

### Step 4 — Run Database Migrations
Apply the database schema using Alembic:

```bash
alembic upgrade head
```

### Step 5 — Start the Backend Server
Launch the FastAPI development server:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Verify backend health by visiting:
- Health probe: `http://127.0.0.1:8000/health`
- Interactive Swagger API Documentation: `http://127.0.0.1:8000/docs`
- ReDoc API Documentation: `http://127.0.0.1:8000/redoc`

### Step 6 — Frontend Setup
Open a new terminal window, navigate to the `frontend/` directory, and install dependencies:

```bash
cd frontend
npm install
```

### Step 7 — Frontend Environment Configuration
Create a `.env` file inside the `frontend/` directory:

```bash
# On Windows PowerShell:
Copy-Item .env.example .env

# On Linux / macOS:
cp .env.example .env
```

Configure `frontend/.env`:
- `VITE_API_BASE_URL`: Set to `http://localhost:8000/api` for local standalone development.
- `VITE_GOOGLE_CLIENT_ID`: Optional Google OAuth Client ID matching the backend.

### Step 8 — Start the Frontend Application
Start the Vite development server:

```bash
npm run dev
```

The frontend will be available at: **`http://localhost:5173`**

Open your browser, register an account, select any role to test, and explore the platform!

---

## Docker Setup

If you prefer to run the complete stack inside Docker containers without manually installing Python or PostgreSQL:

### Prerequisites
- Docker Engine & Docker Compose installed and running.

### 1. Launch Containers
From the repository root directory, run:

```bash
docker compose up --build -d
```

### 2. Services & Exposed Ports
- **Frontend**: `http://localhost:80` (NGINX reverse proxy serving compiled React SPA)
- **Backend API**: `http://localhost:8000` (FastAPI with Uvicorn)
- **Database**: `localhost:5433` (PostgreSQL 15 Alpine mapped from container port 5432)

### 3. Container Health & Logs
Check container health status:
```bash
docker compose ps
```

View live container logs:
```bash
docker compose logs -f
```

### 4. Stop Containers
To stop and preserve database volumes:
```bash
docker compose down
```

To stop and remove all volumes:
```bash
docker compose down -v
```

---

## Database Configuration

The application uses **SQLAlchemy 2.0** as the Object-Relational Mapper (ORM) and **Alembic** for schema migrations.

- **Production**: Hosted Neon Serverless PostgreSQL with SSL connection pooling.
- **Local**: PostgreSQL or zero-configuration embedded SQLite.
- **Automatic Fallback**: If `DATABASE_URL` is unconfigured or if PostgreSQL is unreachable during local testing, the database manager automatically activates SQLite fallback (`skin_db.db`), allowing development to continue uninterrupted.
- **Schema Management**: All database tables (`users`, `user_profiles`, `routines`, `routine_steps`, `ingredients`, `products`, `skin_assessments`, `diary_entries`, `notifications`, `audit_logs`) are managed via Alembic version migrations in `backend/alembic/versions/`.

To apply pending migrations:
```bash
cd backend
alembic upgrade head
```

To inspect migration history:
```bash
cd backend
alembic history --verbose
```

---

## Authentication

The platform provides dual authentication pathways:

### 1. Email & Password Authentication
```
User Enters Credentials ──► POST /api/auth/login ──► Password Verification (PBKDF2)
                                                             │
                                                             ▼
                                                    Generate JWT Tokens
                                                             │
                                                             ▼
                                            Protected API Calls with Bearer Token
```
- **Registration**: User provides name, email, password, and desired role. Passwords are salted and hashed using PBKDF2-HMAC-SHA256.
- **Token Exchange**: On successful verification, the backend issues an HS256 JWT access token.
- **Session Introspection**: The frontend validates active sessions via `GET /api/auth/me`.

### 2. Google OAuth 2.0 Authentication
```
User Clicks "Sign in with Google" ──► Google Account Chooser Modal ──► Google Credential (JWT)
                                                                               │
                                                                               ▼
                                                                     POST /api/auth/google
                                                                               │
                                                                               ▼
                                                                  Verify Token with Google Auth
                                                                               │
                                                                               ▼
                                                                   Issue Backend JWT Session
```
- **Privacy First**: The sign-in button displays a clean, generic interface. No personal user accounts or email addresses are shown prior to explicit user interaction.
- **Backend Validation**: Google identity credentials are authenticated directly through `google-auth` token verification libraries.

---

## AI & Machine Learning

### Model Details
- **Architecture**: **EfficientNet-B0** Convolutional Neural Network
- **Trained Classes**: 8 distinct clinical condition categories derived from the SCIN dataset:
  1. `Acneiform & Follicular Disorders`
  2. `Eczematous & Inflammatory Dermatitis`
  3. `Infections & Infestations`
  4. `Other Clinical Disorders`
  5. `Papulosquamous Disorders`
  6. `Trauma & Insect Bites`
  7. `Urticaria & Reactive Rashes`
  8. `Vascular & Purpuric Conditions`
- **Input Dimensions**: 224 x 224 RGB image tensors normalized to ImageNet distributions.
- **Checkpoint Location**: `ml/models/skin_condition_improved.pth` (16.3 MB)
- **Metadata Specification**: `ml/models/improved_model_metadata.json`

### Validation Performance
Based on model evaluation metadata:
- **Validation Accuracy**: **84.2%**
- **Macro F1 Score**: **0.825**

> [!NOTE]
> These performance metrics reflect model evaluation against test data splits. They represent computational classification benchmarks and do **not** constitute independent clinical validation or FDA diagnostic clearance.

### Serverless Fallback Architecture
- In local development and Docker environments, the full PyTorch EfficientNet-B0 model executes inference directly via CPU or GPU.
- In Vercel serverless cloud deployments, a **deterministic fallback inference engine** operates because full PyTorch model weight packages exceed serverless bundle packaging constraints.
- This ensures uninterrupted public demonstration reliability without runtime timeouts.

---

## Skin Health Scoring Model

The application computes a holistic **Skin Health Score (0–100)** using a verified 5-factor weighted algorithm:

$$\text{Skin Health Score} = 0.35 \times C + 0.20 \times L + 0.15 \times S + 0.20 \times R + 0.10 \times H$$

| Factor | Weight | Evaluation Criteria |
| :--- | :---: | :--- |
| **Skin Condition Assessment ($C$)** | **35%** | Condition severity, sensitivity index, and visual AI assessment confidence. |
| **Lifestyle Habits ($L$)** | **20%** | Stress level management, dietary balance, exercise habits, and environmental exposure. |
| **Sleep Quality ($S$)** | **15%** | Nightly rest duration and consistency relative to the clinical 7–9 hour restorative baseline. |
| **Routine Consistency ($R$)** | **20%** | 7-day routine completion adherence rate across Morning and Evening schedules. |
| **Hydration Level ($H$)** | **10%** | Daily water intake tracking against target hydration goals (liters/day). |

> [!IMPORTANT]
> The Skin Health Score is an **engineering and cosmetic wellness metric** designed to assist users in building consistent skincare routines. It is **not** a clinical diagnostic indicator or medical health assessment.

---

## API Documentation

When the backend server is running locally, interactive API documentation is automatically available:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc UI**: `http://localhost:8000/redoc`

### Core Endpoint Summary

| Endpoint Group | Method & Path | Description | Access Level |
| :--- | :--- | :--- | :--- |
| **System** | `GET /health` | Application liveness probe | Public |
| | `GET /readiness` | Database connectivity readiness probe | Public |
| **Auth** | `POST /api/auth/register` | Register new account with role selection | Public |
| | `POST /api/auth/login` | Email/password login and token issuance | Public |
| | `POST /api/auth/google` | Google OAuth token verification | Public |
| | `GET /api/auth/me` | Fetch authenticated user profile | Authenticated |
| | `POST /api/auth/logout` | Terminate session and invalidate tokens | Authenticated |
| **Profile** | `GET /api/profile` | Retrieve user skin profile | Authenticated |
| | `POST /api/profile` | Create or update user skin profile | Authenticated |
| **AI Vision** | `POST /api/analysis/upload` | Upload skin image for condition classification | Authenticated |
| **Routines** | `GET /api/routines` | Get personalized routines across 5 timeframes | Authenticated |
| | `POST /api/routines/generate` | Trigger dynamic routine generation | Authenticated |
| | `POST /api/routines/step/toggle` | Toggle routine step completion | Authenticated |
| **Ingredients** | `GET /api/ingredients` | Browse ingredient library | Authenticated |
| | `POST /api/ingredients/analyze` | Check ingredient compatibility & conflicts | Authenticated |
| **Products** | `GET /api/products` | Search product catalog with filters | Authenticated |
| | `GET /api/products/recommendations`| Fetch AI-matched product recommendations | Authenticated |
| **Scoring** | `GET /api/scoring/current` | Calculate current 5-factor skin health score | Authenticated |
| | `GET /api/analytics/trends` | Historical score progression & factor trends | Authenticated |
| **Diary** | `GET /api/diary` | Fetch historical skin diary entries | Authenticated |
| | `POST /api/diary` | Log daily progress, photo, and observations | Authenticated |
| **Reports** | `GET /api/reports/export/pdf` | Download clinical skin assessment report (PDF)| Authenticated |
| | `GET /api/reports/export/csv` | Download structured history data (CSV) | Authenticated |
| | `GET /api/reports/export/xlsx` | Download multi-sheet workbook (Excel) | Authenticated |
| **Admin** | `GET /api/admin/users` | Manage platform user directory | ADMIN |
| | `GET /api/admin/audit-logs` | View administrative audit trails | ADMIN |
| | `GET /api/system/telemetry` | Real-time memory, DB, and system telemetry | ADMIN |

---

## Testing & Quality Assurance

The codebase includes an extensive automated test suite covering unit tests, integration contracts, security audits, and full end-to-end workflows.

### Test Results
```
============================== 176 passed in 30.11s ==============================
```

### Test Suite Breakdown

| Test Suite Category | File | Tests | Focus Areas |
| :--- | :--- | :---: | :--- |
| **Multi-Role Auth & Tokens** | `test_e2e_auth.py`, `test_google_oauth_flow.py` | 14 | JWT issuance, password security, Google tokens, token refresh. |
| **RBAC & Privilege Isolation** | `test_security_audit_suite.py`, `test_admin_and_security.py` | 24 | SQLi immunity, role restrictions, suspended account handling. |
| **Admin Lifecycle & Telemetry** | `test_admin_auth_and_dashboard_lifecycle.py`, `test_telemetry_security_audit.py` | 18 | Admin audit logs, system telemetry, user role assignment. |
| **Identity & SMS OTP Lifecycle**| `test_sms_otp_delivery_lifecycle.py`, `test_identity_and_notifications.py` | 28 | Phone verification, OTP generation, rate limiting, hashing. |
| **AI Assessment & Inference** | `test_fastapi_ml_routes.py`, `test_image_analysis.py`, `test_ml_inference_unit.py` | 12 | Image pre-processing, EfficientNet-B0 inference, score output. |
| **Personalized Routine Engines** | `test_phase2_backend.py` to `test_phase6_backend.py` | 28 | 5-timeframe schedules, adaptive modifications, step completion. |
| **Skin Health Scoring Engine** | `test_phase7_skin_health_scoring.py`, `test_module7_scoring_engine_forensic.py` | 18 | 5-factor weight calculations, boundary conditions, score accuracy. |
| **Recommendations & Ingredients**| `test_product_recommendations_upgrade.py`, `test_phase5_backend.py` | 12 | Active ingredient conflicts, product matching, allergy rules. |
| **Clinical Report Exports** | `test_report_exports.py`, `test_canonical_report_consistency.py` | 10 | PDF generation, CSV streaming, openpyxl XLSX data integrity. |
| **E2E Lifecycle & Readiness** | `test_e2e_full_workflow.py`, `test_production_deployment_readiness.py` | 12 | Complete 10-step user journey, database readiness, health probes. |

### Running Tests Locally

Run the complete test suite:
```bash
python -m pytest backend/tests -q
```

Run specific test modules:
```bash
# Security and RBAC audit
python -m pytest backend/tests/test_security_audit_suite.py -v

# 5-Factor skin health scoring engine
python -m pytest backend/tests/test_phase7_skin_health_scoring.py -v

# Multi-format report exports (PDF, CSV, XLSX)
python -m pytest backend/tests/test_report_exports.py -v
```

---

## Production Verification

The live deployment at **[https://ai-skin-intelligence-lakshmi-narayana-jampa.vercel.app/](https://ai-skin-intelligence-lakshmi-narayana-jampa.vercel.app/)** has been verified for:

- [x] **Anonymous Public Access**: Landing page and public assets load without authentication walls.
- [x] **Public 4-Role Registration**: Registration flow supports `USER`, `SKINCARE_CONSULTANT`, `DERMATOLOGIST`, and `ADMIN`.
- [x] **Google Authentication**: Standard Google Sign-In button correctly prompts account selection.
- [x] **Session Isolation**: Separate user sessions maintain isolated profile, routine, diary, and score state.
- [x] **AI Skin Assessment**: Vision diagnosis endpoint functions smoothly with cloud fallback.
- [x] **Routine Customization**: Dynamic routine generation across 5 timeframes with interactive step completion.
- [x] **Ingredient Conflict Engine**: Real-time identification of conflicting skincare actives.
- [x] **Product Matching**: Personalized recommendations filtered by skin condition and budget.
- [x] **Progress Analytics**: Visual score gauges, longitudinal trends, and diary updates.
- [x] **Report Exports**: Clinical PDF, tabular CSV, and formatted XLSX exports download correctly.
- [x] **Database Freshness**: Production database verified in a clean zero-user state ready for evaluator registration.

---

## Deployment Architecture

The production platform is architected for zero-maintenance cloud scalability:

### Frontend & Serverless API Bridge (Vercel)
- **Frontend SPA**: Compiled React 19 single-page application hosted on Vercel Edge CDN with global asset caching.
- **Serverless API Bridge**: `api/index.py` routes incoming `/api/*`, `/health`, and `/readiness` requests to the FastAPI application.
- **Build Configuration**: Configured via `vercel.json` with single-command frontend compilation (`cd frontend && npm install && npm run build`).

### Cloud Database (Neon PostgreSQL)
- **PostgreSQL 16**: Serverless Postgres compute with automatic SSL encryption and connection autoscaling.
- **Connection Handling**: Normalized connection strings supporting SQLAlchemy engine pooling.

### Updating Cloud Environment Variables
> [!NOTE]
> If modifying environment variables (such as `JWT_SECRET_KEY` or `DATABASE_URL`) inside the Vercel Dashboard, a new deployment must be triggered for the updated variables to take effect across serverless lambdas.

---

## Security & Data Privacy

### Security Hardening
- **Cryptographic Password Hashing**: Passwords stored as PBKDF2-HMAC-SHA256 hashes with unique random salts.
- **JWT Signature Protection**: Tokens signed with HS256 algorithm; unsigned (`alg: none`) or tampered tokens are rejected.
- **Role-Based Access Control**: Strict route guards block non-admin accounts from administrative and telemetry endpoints.
- **SQL Injection Defense**: 100% of database interactions utilize SQLAlchemy parameterized ORM queries.
- **HTTP Security Headers**: Injected on all API responses:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- **Secret Hygiene**: Scanned and verified with zero exposed credentials, API keys, or private certificates.

### Data Privacy
- User skin profiles, diagnostic imagery, and diary records are strictly associated with authenticated account IDs.
- User data isolation is enforced across all database queries; users cannot view or modify other users' routines or reports.
- Prior demonstration test data has been cleared from production, ensuring a fresh evaluator workspace.

---

## Troubleshooting

### 1. Backend Fails to Start
- Verify Python version: `python --version` (Ensure Python 3.10+ is installed).
- Confirm dependencies installed: `pip install -r backend/requirements.txt`.
- Check if port 8000 is occupied: Launch on an alternative port via `uvicorn app.main:app --port 8001`.

### 2. Database Connection Error
- If using local PostgreSQL, check that the service is running and `DATABASE_URL` in `backend/.env` is valid.
- If PostgreSQL is unavailable, clear `DATABASE_URL` or let the backend automatically fall back to embedded SQLite.

### 3. Alembic Migration Fails
- Ensure your virtual environment is active before running `alembic upgrade head`.
- To reset the local SQLite database, delete `backend/skin_db.db` and re-run migrations.

### 4. Frontend Cannot Reach Backend
- Check that the backend is running at `http://localhost:8000`.
- Verify `VITE_API_BASE_URL` in `frontend/.env` points to `http://localhost:8000/api` for local standalone development.

### 5. Google Login Error
- Confirm `VITE_GOOGLE_CLIENT_ID` in `frontend/.env` and `GOOGLE_CLIENT_ID` in `backend/.env` are populated.
- Ensure `http://localhost:5173` is added to **Authorized JavaScript origins** in your Google Cloud Console.

### 6. Report Downloads Not Working
- Ensure backend dependencies `fpdf2` and `openpyxl` are installed: `pip install fpdf2 openpyxl`.
- Verify the user has created a skin profile and generated at least one routine before exporting reports.

### 7. Session or Authentication Glitches
- Clear browser cookies and localStorage (`skin_token`, `user_data`).
- Check that the backend returns `200 OK` on `GET /api/auth/me`.

---

## Disclaimers

### Medical Disclaimer
> [!WARNING]
> **This application is an AI-assisted skincare information and cosmetic personalization platform.**
> - It does **not** provide definitive medical diagnoses, clinical prognoses, or dermatological prescriptions.
> - It is **not** intended to replace the clinical judgment of a licensed dermatologist, physician, or qualified healthcare provider.
> - AI-generated skin assessments and routine recommendations should **never** be treated as professional medical advice.
> - If you experience severe, persistent, or changing skin conditions, lesions, or discomfort, consult a qualified healthcare professional immediately.

### Product & Ingredient Disclaimer
- Skincare ingredient safety analyses and product recommendations are generated based on published cosmetic formulations and generalized scientific research.
- Individual skin reactions and sensitivities can vary widely. Always perform patch tests before introducing new cosmetic products into your daily routine.

---

## Project Documentation Links

For deeper technical review, consult the detailed documentation artifacts included in the repository:

- 📄 **[Final 7-Page Project Evaluation Document (PDF)](docs/project/AI_Skin_Intelligence_Personalized_Skincare_Planner_Final_7_Page.pdf)** — Executive summary, technical architecture, and rubric alignment.
- 📘 **[Final Integration & Production Deployment Guide](docs/deployment/FINAL_INTEGRATION_DEPLOYMENT_GUIDE.md)** — Production configuration, NGINX setup, and reverse proxy details.
- 🚀 **[Vercel Cloud Deployment Guide](docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md)** — Serverless architecture, routing, and cloud database setup.
- 🧪 **[End-to-End Testing & Security Audit Report](docs/testing/END_TO_END_TESTING_AND_SECURITY_REPORT.md)** — Forensic test breakdown, SQLi penetration, and RBAC audits.
- 📖 **[User & Administrator Operational Manual](docs/guides/USER_AND_ADMINISTRATOR_MANUAL.md)** — User onboarding and platform administration guide.
- 📊 **[Phase 7 Skin Health Scoring Engine Specification](docs/phase7/SKIN_HEALTH_SCORING_ENGINE.md)** — Mathematical formulations and factor scoring breakdown.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
