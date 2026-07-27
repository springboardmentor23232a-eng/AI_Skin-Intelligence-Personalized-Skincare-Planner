# AI Skin Intelligence & Personalized Skincare Planner

A working full-stack scaffold for the platform described in your project spec:
FastAPI backend + React frontend + PostgreSQL + MongoDB, with auth, skin
profiling, an assessment engine, a routine generator, ingredient intelligence,
product recommendations, skin health scoring, progress tracking, dashboards,
and PDF/Excel report export.

**This has been built and tested end-to-end** — every endpoint below was
verified against a real PostgreSQL database before being handed to you
(register → login → create profile → run assessment → generate routine →
get product recommendations → log progress → view dashboard → export
PDF/Excel all return correct data).

---

## 1. What's included

```
skincare-platform/
├── backend/                  FastAPI app
│   ├── app/
│   │   ├── main.py           App entrypoint, router wiring, CORS, table creation
│   │   ├── core/              config.py (settings), security.py (JWT + bcrypt)
│   │   ├── database.py       SQLAlchemy engine/session + MongoDB client
│   │   ├── deps.py           get_current_user, require_roles() for RBAC
│   │   ├── models/           SQLAlchemy ORM models (Postgres tables)
│   │   ├── schemas/          Pydantic request/response schemas
│   │   ├── services/         Rule-based "AI" logic (scoring, routine gen, recs)
│   │   ├── routers/          One router per module (see table below)
│   │   └── seed_data.py      Populates demo ingredients + products
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/                 React (Vite) app
│   └── src/
│       ├── pages/            Login, Register, Dashboard, SkinProfile,
│       │                     Assessment, Routine, Products, Progress, Admin
│       ├── components/       Navbar, ProtectedRoute
│       ├── context/          AuthContext (JWT storage + user session)
│       └── api/client.js     Axios instance with auth header injection
├── docker-compose.yml         Runs Postgres + Mongo + API + Frontend together
└── README.md                  This file
```

### Modules implemented vs. the spec

| Spec Module | Status | Where |
|---|---|---|
| Auth & RBAC (user/consultant/dermatologist/admin) | ✅ | `routers/auth.py`, `deps.py` |
| Skin Profile Management | ✅ | `routers/skin_profile.py` |
| Skin Assessment Engine (concern ID, severity, prioritization, risk factors) | ✅ rule-based | `routers/assessment.py` |
| Personalized Routine Generator (AM/PM/weekly/seasonal) | ✅ rule-based | `services/routine_service.py` |
| Ingredient Intelligence (interactions, allergy detection) | ✅ | `services/recommendation_service.py`, `routers/ingredient.py` |
| Product Recommendation Engine (suitability scoring, ranking) | ✅ | `routers/product.py` |
| Skin Health Scoring (the exact weighted model from your spec) | ✅ | `services/scoring_service.py` |
| Progress Tracking & Analytics | ✅ | `routers/progress.py` |
| Dashboards (user/consultant/dermatologist/admin) | ✅ | `routers/dashboard.py` |
| Notifications & Reminders | ✅ basic | `routers/notification.py` |
| Reports & Export (PDF, Excel) | ✅ | `routers/reports.py` |
| Admin (user management) | ✅ | `routers/admin.py` |
| Consultant/Dermatologist client view | ✅ | `pages/Consultant.jsx`, `/api/dashboard/consultant` |
| Progress trend chart | ✅ Chart.js | `pages/Progress.jsx` |
| Automated tests | ✅ 14 passing | `backend/tests/` |

The scoring engine implements your exact weighted model:
`0.35×Condition + 0.20×Lifestyle + 0.15×Sleep + 0.20×RoutineConsistency + 0.10×Hydration`

**Note on "AI/ML":** the assessment, routine, and recommendation logic here
is a transparent **rule-based baseline** (the same pattern real MVPs use
before they have labeled data). It's built so you can swap in trained
models later (see Step 6) without changing the API contracts — that's
what the `services/` layer is for.

---

## 2. Prerequisites

- Python 3.11+
- Node.js 20+
- Docker & Docker Compose (recommended — easiest path)
- *(Only if running without Docker)* a local PostgreSQL 16 and MongoDB 7

---

## 3. Fastest path: run everything with Docker

```bash
cd skincare-platform
cp backend/.env.example backend/.env
docker compose up --build
```

This starts:
- `db` — PostgreSQL on `localhost:5432`
- `mongo` — MongoDB on `localhost:27017`
- `api` — FastAPI on `http://localhost:8000` (docs at `/docs`)
- `frontend` — React on `http://localhost:5173`

Then seed demo ingredients/products:
```bash
docker compose exec api python -m app.seed_data
```

Open `http://localhost:5173`, register an account, and go.

---

## 4. Running locally without Docker

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# edit .env: point DATABASE_URL at your local Postgres,
# e.g. postgresql://youruser:yourpass@localhost:5432/skincare_db

# create the database first:
#   psql -c "CREATE DATABASE skincare_db;"

uvicorn app.main:app --reload --port 8000
# Swagger docs: http://localhost:8000/docs
```

In a second terminal, seed demo data:
```bash
cd backend
python -m app.seed_data
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:8000` (see
`vite.config.js`), so the frontend and backend talk to each other with no
extra config.

---

## 5. Trying it out

1. Go to `http://localhost:5173/register`, create a `user` account.
2. **Skin Profile** — fill in skin type, concerns, sleep, hydration, lifestyle.
3. **Assessment** — click "Run Assessment" → see prioritized concerns,
   severity, condition score, risk factors.
4. **Routine** — click "Generate Routine" → AM/PM steps + weekly treatments
   built from your concerns.
5. **Products** — see ranked recommendations with suitability %, filtered
   to exclude anything containing your listed allergies.
6. **Progress** — log a day; the overall Skin Health Score is computed live
   using the weighted model.
7. Register a second account with role `admin` to see `/admin`.

You can also drive the API directly via the interactive docs at
`http://localhost:8000/docs` — every endpoint is there with example
payloads.

---

## 6. Suggested build order (mirrors your 8-week milestone plan)

This scaffold already gives you a working version of every milestone below.
Use it as your Week 1 foundation, then go deeper on the AI layer:

**Week 1–2 — Foundation (done in this scaffold)**
Auth, roles, skin profile CRUD, lifestyle/sleep/hydration tracking.

**Week 3–4 — Assessment & Routines (done as rule-based; upgrade path below)**
- Replace `_estimate_severity()` in `routers/assessment.py` with a trained
  classifier once you have labeled concern-severity data (scikit-learn/
  XGBoost, per the architecture diagram's "Skin Type Classification Model").
- Replace `generate_full_routine()` in `services/routine_service.py` with a
  learned sequence/ranking model once you have routine-effectiveness data.

**Week 5–6 — Ingredient & Product Intelligence (done as rule-based)**
- `score_product_suitability()` is a hand-weighted formula. Swap it for an
  XGBoost/LightGBM ranking model trained on (profile, product, outcome)
  triples once you're collecting user feedback/ratings.
- Expand `Ingredient.interacts_badly_with` data — this is currently a small
  seeded set; a real ingredient-interaction knowledge base (from
  dermatology literature) would live here.

**Week 7–8 — Analytics, Testing, Deployment (scaffolded)**
- `docker-compose.yml` at the root builds and runs all 4 services together.
- Add automated tests (pytest + httpx for the API; see Step 7 below).
- For production: put this behind HTTPS, move `SECRET_KEY` to a secrets
  manager, restrict `CORS` origins in `main.py`, and use Alembic migrations
  instead of `Base.metadata.create_all()`.

---

## 7. Running the test suite

A 14-test suite already exists in `backend/tests/` covering auth, skin
profile + assessment, routine generation, product recommendations
(including allergen exclusion), progress logging/scoring, dashboards, and
role-based access control. All 14 pass as delivered.

Tests run against a real Postgres database (the models use Postgres-only
`UUID`/`ARRAY` column types, so SQLite mocking isn't viable) — use a
throwaway database, not your dev one, since fixtures create and drop all
tables each run:

```bash
createdb skincare_test   # or: psql -c "CREATE DATABASE skincare_test OWNER skincare;"

cd backend
export TEST_DATABASE_URL=postgresql://skincare:skincare@localhost:5432/skincare_test
pytest tests/ -v
```

---

## 8. Known gotcha already fixed for you

`passlib[bcrypt]==1.7.4` is incompatible with `bcrypt>=4.1` (a very common
trap — you'll see `password cannot be longer than 72 bytes` errors on
registration if you hit it). This is already pinned correctly in
`requirements.txt` (`bcrypt==4.0.1`) — don't upgrade bcrypt alone without
also upgrading passlib.

---

## 9. Tech stack (matches your spec)

Backend: Python, FastAPI, SQLAlchemy, JWT auth, PostgreSQL (primary),
MongoDB (secondary/doc store, wired up and ready for logs/articles/notes).
Frontend: React 18, Vite, Tailwind CSS, React Router, Axios, Chart.js
(installed, ready for you to add charts to Progress/Admin pages).
Reports: ReportLab (PDF), openpyxl (Excel).
Deployment: Docker + Docker Compose (AWS/Azure-ready — just point
`docker-compose` at ECS/Azure Container Apps or build the images and push
to ECR/ACR).

---

## 10. Next things worth building

- Chart on the Admin dashboard (platform-wide trends — the Progress page
  chart is done; Admin still shows raw numbers only).
- Per-client detail view on the Consultant page (currently lists clients;
  linking into their profile/assessment/progress would need
  consultant-scoped read endpoints, since today's endpoints are
  self-service/current-user-only).
- Real notification delivery (email/push) — the `Notification` model and
  endpoints exist; wiring to an email provider is the remaining step.
- Alembic migrations instead of `create_all()` for schema versioning.
- Move ingredient/product data entry into an admin UI instead of
  `seed_data.py`.
- Expand the test suite with negative/edge cases (e.g. ingredient
  interaction warnings, severity boundary conditions) as you build out the
  ML-based scoring described in Step 6.
