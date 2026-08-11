# AI Skin Intelligence & Personalized Skincare Planner

An enterprise-grade, multi-role AI-powered skincare platform offering clinical skin assessment, personalized routine generation, ingredient safety conflict analysis, AI product recommendation matching, progress diary tracking, and clinical consultant workspaces.

---

## Submission Branch & Mentor Quick Start

> **Final Submission Branch**: `durga-laskshmi-narayana-jampa`

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
- **Personalized Skincare Routine Generator**: Dynamic routine schedule creation (Morning, Evening, Weekly, Monthly, Seasonal) based on user skin profiles, sensitivity thresholds, and environmental factors.
- **Ingredient Safety & Compatibility Engine**: Real-time conflict analysis evaluating chemical interactions, pH conflicts, active concentration warnings, and allergen flags.
- **AI Product Recommendation Matching**: Multi-parameter recommendation engine ranking products by skin condition alignment score and user preferences.
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

### Run Full Backend Verification Suite (33 End-to-End Tests)

```bash
cd backend
python tests/verify_all_phases.py
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

### Run All Backend Pytest Suites

```bash
cd backend
pytest tests/
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

## 11. License

This project is released under the **MIT License**.
