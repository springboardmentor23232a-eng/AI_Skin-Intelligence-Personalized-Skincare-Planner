# AI Skin — Skin Intelligence & Personalized Skincare Planner

A full-stack AI-powered skincare intelligence platform with four role-based
dashboards (User, Consultant, Dermatologist, Administrator), a FastAPI +
PostgreSQL backend, OpenCV + scikit-learn skin-type detection (webcam or
upload), rule-based skin health scoring, personalized routine generation,
ingredient intelligence, product recommendations, progress tracking, and a
Gemini-powered AI assistant.

---

## 1. Project Structure

```
ai_skin_intelligence/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entrypoint
│   │   ├── config.py            # Settings (env vars)
│   │   ├── database.py          # SQLAlchemy engine/session
│   │   ├── models.py            # All DB tables (12 modules)
│   │   ├── schemas.py           # Pydantic request/response models
│   │   ├── auth.py              # JWT + password hashing
│   │   ├── deps.py              # Role-based access control
│   │   ├── seed.py              # Demo users, ingredients, products
│   │   ├── ml/
│   │   │   ├── train_model.py   # Trains skin-type classifier
│   │   │   ├── predict.py       # Loads model + predicts
│   │   │   ├── skin_model.pkl   # Trained model (generated)
│   │   │   └── scoring_engine.py # Rule-based scoring/routine logic
│   │   ├── utils/
│   │   │   └── image_utils.py   # OpenCV feature extraction
│   │   └── routers/             # One router per module
│   │       ├── auth_router.py
│   │       ├── users.py
│   │       ├── assessment.py
│   │       ├── routine.py
│   │       ├── ingredient.py
│   │       ├── product.py
│   │       ├── progress.py
│   │       ├── dashboard.py
│   │       ├── notifications.py
│   │       └── gemini_router.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── index.html                    # Login / Register
│   ├── user-dashboard.html           # Webcam scan, routine, products, AI chat
│   ├── consultant-dashboard.html
│   ├── dermatologist-dashboard.html
│   ├── admin-dashboard.html
│   ├── css/style.css
│   └── js/ (api.js, auth.js, webcam.js, *-dashboard.js)
├── postman/
│   └── AI_Skin_Intelligence.postman_collection.json
├── docker-compose.yml
└── README.md
```

---

## 2. Quick Start — Docker (recommended)

**Prerequisites:** Docker + Docker Compose installed.

```bash
cd ai_skin_intelligence
docker compose up --build
```

This starts three containers:
| Service   | URL                              |
|-----------|-----------------------------------|
| Backend API (FastAPI + Swagger docs) | http://localhost:8000/docs |
| Frontend (Nginx static site)         | http://localhost:8080      |
| PostgreSQL                            | localhost:5432             |

The backend Dockerfile automatically **trains the ML skin-type model**
(`python -m app.ml.train_model`) during the image build, so `skin_model.pkl`
is always fresh.

**Seed demo data** (run once, after containers are up):
```bash
docker compose exec backend python -m app.seed
```

This creates 4 demo accounts (password for all: `Password@123`):
| Role | Email |
|---|---|
| User | user@aiskin.com |
| Consultant | consultant@aiskin.com |
| Dermatologist | dermatologist@aiskin.com |
| Administrator | admin@aiskin.com |

Open **http://localhost:8080** and log in with any of the accounts above.

---

## 3. Manual Setup (without Docker)

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows PowerShell: venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Create a Postgres database matching your DATABASE_URL, or edit .env
copy .env.example .env       # Windows; use `cp` on macOS/Linux
# Edit .env with your DB credentials, SECRET_KEY, GEMINI_API_KEY, etc.

# Train the ML skin-type classifier (one-time; regenerates skin_model.pkl)
python -m app.ml.train_model

# Create tables + seed demo data
python -m app.seed

# Run the API
uvicorn app.main:app --reload --port 8000
```
API docs: http://localhost:8000/docs

### Frontend
The frontend is plain HTML/CSS/JS — no build step. Simplest option:
```bash
cd frontend
python -m http.server 8080
```
Then open http://localhost:8080. It talks to the backend at
`http://localhost:8000` (configured in `js/api.js`).

> If you deploy the frontend elsewhere, update `API_BASE` in `js/api.js`.

---

## 4. Training / Retraining the ML Model

`app/ml/train_model.py` trains a `StandardScaler + RandomForestClassifier`
pipeline that predicts skin type (oily / dry / combination / normal /
sensitive) from six OpenCV-derived image features (brightness, redness,
oil-sheen ratio, texture variance, edge density, saturation).

Because no licensed dermatology image dataset ships with this project, the
script builds a **synthetic-but-domain-informed training set**: each skin
type is a Gaussian cluster in feature space, parameterized from published
skincare/dermatology heuristics (e.g., oily skin → higher oil-sheen &
brightness; dry skin → higher texture variance & lower oil-sheen).

```bash
cd backend
python -m app.ml.train_model
```
Outputs:
- `app/ml/skin_model.pkl` — the trained pipeline (loaded by `predict.py`)
- `app/ml/model_report.txt` — accuracy + classification report

**To retrain on real labeled photos later:** replace
`build_synthetic_dataset()` in `train_model.py` with a loader that runs
`extract_skin_features()` (in `app/utils/image_utils.py`) over your labeled
image folders and collects `(features, label)` pairs, then rerun the script.
No other code changes are needed — `predict.py` and the assessment pipeline
consume the same `.pkl` format.

---

## 5. Environment Variables (`backend/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing secret — change in production |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | For Google OAuth2 login |
| `GEMINI_API_KEY` | Google Gemini API key, for the AI Assistant tab |
| `UPLOAD_DIR` | Local folder for uploaded/captured skin images |

Google OAuth and Gemini are optional — the platform works fully with
email/password JWT auth and the rule-based engine if you don't set them.

---

## 6. Core Features by Module

1. **Auth & Role-Based Access** — JWT register/login, Google OAuth2, roles:
   `user`, `consultant`, `dermatologist`, `admin`.
2. **Skin Profile Management** — skin type, age group, allergies,
   sensitivities, lifestyle, sleep, hydration, environment.
3. **Skin Assessment Engine** — webcam/upload → OpenCV features → trained
   ML skin-type model → weighted skin health score, concern identification
   with severity/priority, and risk factor analysis. Full CRUD + history.
4. **Personalized Routine Generator** — morning/evening/weekly/seasonal
   routines adapted to skin type and current concerns.
5. **Ingredient Intelligence** — ingredient database, allergy/sensitivity
   conflict checks, and bad-interaction detection (e.g. Retinol + Vitamin C).
6. **Product Recommendation Engine** — scored & ranked by skin type +
   concern match, with comparison and alternatives endpoints.
7. **Skin Health Scoring Engine** — weighted formula:
   `Condition 35% + Lifestyle 20% + Sleep 15% + Routine Consistency 20% + Hydration 10%`.
8. **Progress Tracking & Analytics** — logs, trend detection, before/after
   comparison.
9. **Dashboards** — tailored views per role (User, Consultant,
   Dermatologist, Admin platform analytics).
10. **Notifications & Reminders** — routine, hydration, sleep, replenishment.
11. **Gemini AI Assistant** — contextual chat using the user's profile +
    latest assessment.
12. **Postman Collection** — every endpoint pre-wired with an auth flow
    (`postman/AI_Skin_Intelligence.postman_collection.json`).

---

## 7. Notes & Disclaimers

- The rule-based scoring engine and ML classifier are for **educational /
  academic demonstration purposes** — they are not a medical diagnostic
  tool. The AI Assistant prompt explicitly instructs Gemini to avoid
  diagnosing and to recommend a dermatologist for serious concerns.
- For a real production deployment, replace the synthetic training data
  with a properly licensed, IRB-approved dermatology image dataset, and add
  HTTPS, rate limiting, and stronger secret management.
