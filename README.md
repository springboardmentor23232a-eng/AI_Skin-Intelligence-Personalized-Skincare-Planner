# AI Skin Intelligence & Personalized Skincare Planner

An enterprise-grade, multi-role AI-powered skincare platform offering clinical skin assessment, personalized routine generation, ingredient safety conflict analysis, AI product recommendation matching, progress diary tracking, and clinical consultant workspaces.

---

## Submission Branch & Mentor Quick Start

> **Final Submission Branch**: `durga-laskshmi-narayana-jampa`
>
> 📄 **Mentor Evaluation Document**: [docs/project/AI_Skin_Intelligence_Personalized_Skincare_Planner_7_Page_Document.pdf](docs/project/AI_Skin_Intelligence_Personalized_Skincare_Planner_7_Page_Document.pdf)
>
> ⚠️ **CRITICAL SECURITY NOTICE**: Do NOT commit `.env` files or production secrets to version control. All environment variables must be configured via environment injection or `.env.example` / `.env.production.example`.
>
> ℹ️ **MEDICAL DISCLAIMER**: The system provides AI-assisted skin assessment and personalized skincare planning for cosmetic and routine support. It is NOT a medical diagnostic device and does not substitute for clinical dermatological evaluation.

To clone and run the complete project from scratch:

```bash
git clone <repository_url>
cd AI_Skin-Intelligence-Personalized-Skincare-Planner
git checkout durga-laskshmi-narayana-jampa
```

---

## 1. Project Overview


The **AI Skin Intelligence Platform** bridges consumer skincare planning with clinical dermatological oversight. Key features include:

- **AI Skin Condition Assessment**: Computer vision classification powered by an **EfficientNet-B0** deep learning model trained on clinical skin condition categories (Acneiform & Follicular, Eczematous & Inflammatory, Infections, etc.).
- **Personalized Skin Health Scoring Engine (5-Factor Model)**: Comprehensive barrier health calculation combining skin condition assessment (35%), lifestyle rhythms (20%), rest recovery (15%), routine consistency (20%), and daily hydration (10%) personalized to user skin types and concerns.
- **Personalized Skincare Routine Generator**: Dynamic routine schedule creation (Morning, Evening, Weekly, Monthly, Seasonal) based on user skin profiles, sensitivity thresholds, and environmental factors.
- **Ingredient Safety & Compatibility Engine**: Real-time conflict analysis evaluating chemical interactions, pH conflicts, active concentration warnings, and allergen flags.
- **AI Product Recommendation Matching**: Multi-parameter recommendation engine ranking products by skin condition alignment score and user preferences.
- **Skin Progress Timeline & Analytics**: Historical diagnostic trends, before/after photo comparisons, and holistic factor evolution.
- **Multi-Role Workspaces**: Tailored dashboards for **Users**, **Dermatologists**, **Consultants**, and **System Administrators**.
- **Notification & Clinical Reporting**: Routine reminders, progress diary tracking, CSV exports, and downloadable clinical PDF reports.

---

## 2. System Architecture

```
                               ┌───────────────────────────────────┐
                               │           React + Vite            │
                               │        Frontend Dashboard         │
                               └─────────────────┬─────────────────┘
                                                 │ REST API (JSON/JWT)
                                                 ▼
                               ┌───────────────────────────────────┐
                               │          FastAPI Backend          │
                               │      (Routes, Auth, Services)     │
                               └────────┬─────────────────┬────────┘
                                        │                 │
               ┌────────────────────────┴─┐             ┌─┴────────────────────────┐
               │    PostgreSQL / SQLite    │             │   PyTorch ML Inference   │
               │   SQLAlchemy & Alembic   │             │ (EfficientNet-B0 Model)  │
               └──────────────────────────┘             └──────────────────────────┘
```

---

## 3. Directory Structure

```
project-root/
│
├── frontend/                     # React 18 + Vite Frontend Application
│   ├── src/                      # Components, Pages, Context, Services, Styles
│   ├── public/                   # Static assets, SVG icons
│   ├── index.html                # HTML entry point
│   ├── vite.config.js            # Vite configuration & proxy definitions
│   ├── package.json              # Frontend dependencies
│   ├── package-lock.json         # Locked dependency versions
│   ├── .env.example              # Sample frontend environment file
│   └── Dockerfile                # Nginx/Vite deployment definition
│
├── backend/                      # FastAPI Python Backend Service
│   ├── app/                      # Application core, auth, DB, routes, AI modules
│   │   ├── ai/                   # Model loader, image transforms, inference logic
│   │   ├── auth/                 # OAuth, JWT handlers, auth service & router
│   │   ├── core/                 # App configuration & security settings
│   │   ├── db/                   # Database session setup
│   │   ├── routes/               # API endpoints (Auth, Assessment, Routines, Products, etc.)
│   │   ├── main.py               # FastAPI application entry point
│   │   ├── models.py             # SQLAlchemy ORM models
│   │   └── schemas.py            # Pydantic schemas
│   ├── alembic/                  # Database migration scripts
│   ├── alembic.ini               # Alembic configuration
│   ├── tests/                    # End-to-End & Unit test suites
│   ├── requirements.txt          # Backend Python dependencies
│   ├── .env.example              # Sample backend environment file
│   └── Dockerfile                # Container setup for FastAPI
│
├── ml/                           # Machine Learning Pipeline & Data
│   ├── data/                     # SCIN Dataset metadata CSVs & train/val/test splits
│   ├── models/                   # EfficientNet-B0 model weights (.pth) & metadata (.json)
│   ├── notebooks/                # Jupyter EDA, training, and evaluation notebooks
│   ├── src/                      # Data processing, training, evaluation scripts
│   ├── experiments/              # Model iteration & performance logs
│   └── requirements.txt          # Standalone ML pipeline dependencies
│
├── docs/                         # Project Documentation & Forensic Audits
│   ├── project/                  # Mentor documentation PDF and generation script
│   ├── deployment/               # Cloud and Docker deployment guides
│   ├── guides/                   # User & administrator operational manuals
│   ├── testing/                  # End-to-end verification and evaluation reports
│   ├── phase7/                   # Skin health scoring engine documentation
│   ├── audit/                    # Forensic project, UI, and API route audits
│   └── milestones/               # Mentor demonstration & milestone checklists
│
├── scripts/                      # Deployment automation scripts (.bat / .sh)
├── docker-compose.yml            # Multi-container orchestration (DB, Backend, NGINX Frontend)
├── .dockerignore                 # Docker build context exclusion rules
├── .gitignore                    # Git tracking ignore rules
├── LICENSE                       # Project license
└── README.md                     # Comprehensive documentation
```

---

## 4. Prerequisites

Before running the project, ensure you have the following installed:

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Python**: `v3.10` or higher (Python `3.11` / `3.12` recommended)
- **PostgreSQL**: Optional (Default setup uses SQLite / PostgreSQL depending on `.env`)

---

## 5. Environment Variables

### Backend Configuration (`backend/.env`)

Copy `backend/.env.example` to `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

Default configuration variables:

```env
PROJECT_NAME="AI Skin Intelligence Platform"
API_V1_STR="/api"
SECRET_KEY="replace-this-with-a-secure-secret-key"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Database Connection (SQLite fallback used automatically if PostgreSQL is unavailable)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/skin_db"

# CORS Allowed Origins
BACKEND_CORS_ORIGINS=["http://localhost:5173","http://localhost:3000","http://127.0.0.1:5173"]

# Optional Google OAuth Client ID
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
```

### Frontend Configuration (`frontend/.env`)

Copy `frontend/.env.example` to `frontend/.env`:

```bash
cp frontend/.env.example frontend/.env
```

Configuration variables:

```env
VITE_API_BASE_URL="http://localhost:8000/api"
VITE_GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
```

---

## 6. Backend Setup & Verification

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python -m venv venv
   # On Windows PowerShell:
   .\venv\Scripts\Activate.ps1
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install backend dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run database migrations (Alembic)**:
   ```bash
   alembic upgrade head
   ```

5. **Start the FastAPI backend server**:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   The backend API interactive documentation will be accessible at:
   - **Swagger UI**: `http://localhost:8000/docs`
   - **ReDoc**: `http://localhost:8000/redoc`

---

## 7. Frontend Setup & Verification

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Start the Vite development server**:
   ```bash
   npm run dev
   ```
   The application will be accessible in your browser at `http://localhost:5173`.

4. **Build production bundle**:
   ```bash
   npm run build
   ```

---

## 8. Machine Learning Pipeline Setup

1. **Navigate to ML directory**:
   ```bash
   cd ml
   ```

2. **Install ML dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Model Weights & Metadata**:
   - The pre-trained EfficientNet-B0 model checkpoint is located at `ml/models/skin_condition_improved.pth`.
   - Model metadata with class mappings is located at `ml/models/improved_model_metadata.json`.

4. **Run dataset exploration & verification**:
   ```bash
   python src/explore_dataset.py
   ```

---

## 9. Running Tests & Verification Suites

### Run Full Backend Verification Suite (36 End-to-End Integration Tests)

```bash
cd backend
python tests/verify_all_phases.py
```

### Run Production Readiness & Personalization Audit Suite (11 Tests)

```bash
cd backend
pytest tests/test_production_readiness_audit.py
```

### Run ML PyTorch Model Inference Unit Test

```bash
cd backend
python tests/test_ml_inference_unit.py
```

### Run FastAPI ML Endpoint Integration Test

```bash
cd backend
python tests/test_fastapi_ml_routes.py
```

### Run All Backend Pytest Suites (47 Unit & Integration Tests)

```bash
cd backend
pytest tests/
```

### Run Frontend Production Build Verification

```bash
cd frontend
npm run build
```

---

## 10. Troubleshooting

- **PostgreSQL Connection Failed**:
  If PostgreSQL is not running locally, the backend automatically falls back to an embedded SQLite database (`skin_db.db`), allowing full operation without requiring manual database creation.
- **Port 8000 / 5173 Conflicts**:
  Ensure no other process is bound to port 8000 or 5173. You can change backend port via `uvicorn app.main:app --port 8001`.
- **PyTorch CPU vs GPU**:
  The ML model loader automatically detects CUDA availability. If CUDA is not installed, it defaults smoothly to CPU inference.

---

## 12. Final Integration, Testing & Deployment

Milestone 12 establishes production deployment topology, automated end-to-end verification, security hardening, and operational observability across the full stack.

### 12.1 Frontend & Backend Integration
- **Vite Proxy & SPA Fallback**: Local development routes `/api` and `/uploads` through the Vite proxy to `http://127.0.0.1:8000`. Production environments serve the compiled React SPA through NGINX with `try_files $uri $uri/ /index.html;`.
- **CORS Dynamic Configuration**: Supports origins across development (`5173`, `3000`), preview (`4173`), and production reverse proxies (`80`, `443`), safely exposing response headers: `Content-Disposition`, `X-Process-Time-Ms`, and `X-Request-ID`.
- **Media Upload Proxy**: User diagnostic progress photos and vision uploads are persistently routed through `/uploads/` directly to backend storage.

### 12.2 API Validation & Testing
Automated API validation test suite (`backend/tests/test_api_validation_suite.py`) enforces:
- Strict Pydantic schema validation returning `422 Unprocessable Entity` for missing fields or malformed payloads.
- Input boundary constraints (positive age values, standard Fitzpatrick scale types I–VI).
- HTTP status code contract compliance (200, 201, 400, 401, 403, 422).
- Validated content-type headers for streaming CSV, clinical PDF, and Excel exports.

```bash
cd backend
python -m pytest tests/test_api_validation_suite.py
```

### 12.3 End-to-End Workflow Testing
A 10-step full-lifecycle integration test suite (`backend/tests/test_e2e_full_workflow.py`) validates the complete user and clinician journey:
1. **User Registration & JWT Issuance**: Cryptographic session creation.
2. **Clinical Skin Profile**: Fitzpatrick scale, concerns, sensitivities, and lifestyle metrics.
3. **Computer Vision Assessment**: EfficientNet-B0 PyTorch condition inference.
4. **5-Factor Weighted Skin Health Score**: Condition (35%), lifestyle (20%), rest (15%), consistency (20%), hydration (10%).
5. **Personalized 5-Timeframe Routine Generation**: Morning, Evening, Weekly, Monthly, and Seasonal protocols.
6. **AI Product Recommendations**: Match score algorithm and active ingredient compatibility checks.
7. **Daily Tracking & Progress Diary**: Routine execution logs and diagnostic photos.
8. **Multi-Format Clinical Reports**: Streamed CSV, PDF, and XLSX report downloads.
9. **Clinical Workspace Collaboration**: Teleconsultation booking and dermatologist clinical reviews.
10. **Administrative Audit Trail & Telemetry**: Immutable logging and live system telemetry.

```bash
cd backend
python -m pytest tests/test_e2e_full_workflow.py
```

### 12.4 Security Testing & Hardening
The security penetration suite (`backend/tests/test_security_audit_suite.py`) validates defense-in-depth:
- **SQL Injection (SQLi) Immunity**: All database queries parameterize inputs through SQLAlchemy ORM; attack payloads (`' OR '1'='1`, `'; DROP TABLE;`) are neutralized safely.
- **JWT Cryptographic Integrity**: Tampered signatures, expired tokens, and `alg: none` exploits are blocked.
- **Role-Based Access Control (RBAC)**: Regular `USER` accounts cannot access `/api/admin/*` or `/api/clinical/*` routes (enforced `403 Forbidden`).
- **Cryptographic Password Hashing**: Passwords are saved as PBKDF2-HMAC-SHA256 with 100,000 rounds and 16-byte random salts.
- **HTTP Security Headers**: Injected on all responses: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, and `Strict-Transport-Security`.
- **Account Suspension**: Blocked/suspended accounts are immediately revoked from performing operations.

```bash
cd backend
python -m pytest tests/test_security_audit_suite.py
```

### 12.5 Performance Optimization
- **GZip Response Compression**: Starlette `GZipMiddleware(minimum_size=1000)` compresses responses >= 1KB, slashing network transfer payloads by up to 75%.
- **Database Connection Pooling**: PostgreSQL engine tuned with `pool_size=20`, `max_overflow=10`, `pool_recycle=3600`, and `pool_pre_ping=True` for high-throughput concurrency.
- **Frontend Rolldown Code-Splitting**: Vendor chunk isolation in `vite.config.js` (`vendor-react`, `vendor-ui`, `vendor-api`, `vendor-deps`) achieves sub-550ms bundle build times and optimized browser caching.
- **Static Asset Caching**: 1-year immutable caching (`expires 1y; add_header Cache-Control "public, immutable";`) for static bundles in NGINX.

### 12.6 Docker Containerization
Multi-stage Docker builds isolate build environments from minimal production runtimes:
- **Backend Dockerfile**: Multi-stage Python 3.11-slim runtime executing under an unprivileged `appuser` (non-root).
- **Frontend Dockerfile**: Multi-stage Node 20 Alpine builder + NGINX Alpine server.
- **Orchestration (`docker-compose.yml`)**: Unifies PostgreSQL 15, FastAPI backend, and NGINX frontend with automated healthchecks and persistent named volumes (`postgres_data`, `backend_uploads`).

### 12.7 Production Deployment Automation
Production deployment scripts perform pre-flight checks, frontend compilation, readiness tests, and launch:

```bash
# On Windows
scripts\deploy_production.bat --docker

# On Linux / macOS
chmod +x scripts/deploy_production.sh
./scripts/deploy_production.sh --docker
```

Validate deployment readiness:
```bash
cd backend
python -m pytest tests/test_production_deployment_readiness.py
```

### 12.8 Monitoring, Logging & Telemetry Setup
- **Structured Request Logging**: Standardized format recording request timestamp, log level, request correlation ID (`X-Request-ID`), HTTP method, URL path, response status, client IP, and processing latency.
- **Liveness & Readiness Probes**:
  - `/health`: Application liveness check.
  - `/readiness`: Database connectivity probe.
  - `/api/system/telemetry`: Uptime, memory status, database engine, PyTorch model architecture and device allocation.

### 12.9 Documentation & User Guides
Exhaustive reference manuals are located in `docs/`:
- **[Final Integration & Production Deployment Guide](docs/deployment/FINAL_INTEGRATION_DEPLOYMENT_GUIDE.md)**
- **[End-to-End Testing & Security Audit Report](docs/testing/END_TO_END_TESTING_AND_SECURITY_REPORT.md)**
- **[User & Administrator Manual](docs/guides/USER_AND_ADMINISTRATOR_MANUAL.md)**
- **[Phase 7 Skin Health Scoring Engine](docs/phase7/SKIN_HEALTH_SCORING_ENGINE.md)**

---

## 13. License

This project is released under the **MIT License**.
