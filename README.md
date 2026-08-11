# ✨ AI Skin Intelligence & Personalization Platform

> **Clinical-Grade Dermatological Assessment, Routine Personalization & Multi-Role Governance Engine**

---

## 📌 Executive Project Overview

The **AI Skin Intelligence Platform** is an enterprise-grade full-stack web application designed for precision dermatological analysis, adaptive routine recommendations, ingredient safety checking, and multi-role clinical collaboration. Built with **FastAPI**, **PostgreSQL**, and **React (Vite)**, the system provides real-time health score calculation, risk level diagnostics, and interactive radar visualizations.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend Framework** | **FastAPI (Python 3.12)** | Asynchronous, high-performance REST APIs |
| **Database** | **PostgreSQL 18** | Relational data store with foreign key constraints |
| **ORM & Migrations** | **SQLAlchemy + Alembic** | Database models, session management & schema migrations |
| **Authentication** | **PyJWT + PBKDF2 Hashing** | Secure JWT bearer tokens & password hashing |
| **OAuth Integration** | **Google OAuth 2.0 API** | Federated single sign-on |
| **Frontend Framework** | **React 18 + Vite** | Fast SPA UI rendering & hot module replacement |
| **Styling & System** | **Vanilla CSS + Bootstrap 5** | SaaS dark/light dynamic glassmorphism design system |
| **State Management** | **React Context API** | Global `AuthContext` and `ThemeContext` |
| **HTTP Client** | **Axios (with Interceptors)** | Automatic Bearer token injection and API error handling |

---

## 📁 Repository Directory Structure

```
infosys internship/
├── backend/                        # FastAPI Backend Application
│   ├── alembic/                    # Database Migrations
│   │   ├── versions/               # Migration scripts (users, skin_profiles, skin_assessments)
│   │   └── env.py                  # Alembic environment configuration
│   ├── app/
│   │   ├── auth/                   # Authentication module (JWT, OAuth, RBAC)
│   │   │   ├── router.py           # Auth API endpoints
│   │   │   ├── schemas.py          # Auth request/response schemas
│   │   │   └── service.py          # Auth business logic & password hashing
│   │   ├── core/                   # System configuration & environment vars
│   │   ├── db/                     # SQLAlchemy session & Base declarative
│   │   ├── routes/                 # Core domain API routes (Profile, Assessment)
│   │   │   └── modules.py          # Skin profile & assessment APIs
│   │   ├── main.py                 # FastAPI application entrypoint & middleware
│   │   ├── models.py               # SQLAlchemy ORM Database Models
│   │   └── schemas_extended.py     # Pydantic v2 schemas for Profile & Assessment
│   ├── requirements.txt            # Python dependencies
│   ├── verify_all.py               # E2E system verification test suite
│   ├── test_phase2_backend.py      # Phase 2 database & assessment test suite
│   └── test_e2e_auth.py            # Authentication & JWT test suite
├── skin-dashboard/                 # React Vite Frontend Application
│   ├── src/
│   │   ├── components/             # Reusable UI components (Navbar, Sidebar, Toast, etc.)
│   │   ├── context/                # AuthContext & ThemeContext
│   │   ├── pages/                  # Page components (Home, Login, Register, Dashboards)
│   │   ├── services/               # Axios API abstraction services (apiService, authService)
│   │   ├── styles/                 # Custom CSS variables & SaaS design tokens
│   │   ├── App.jsx                 # Client router & protected routes
│   │   └── main.jsx                # React app mount entrypoint
│   ├── package.json                # Frontend npm dependencies
│   └── vite.config.js              # Vite bundler configuration
└── docker-compose.yml              # PostgreSQL database container orchestration
```

---

## 🏛️ System Architecture

### Backend Architecture
```mermaid
graph TD
    Client[React Client / Axios] --> |HTTP Requests| Router[FastAPI APIRouter]
    Router --> |Bearer Token| AuthMiddleware[JWT & Role Verification]
    AuthMiddleware --> Service[Business Logic Service Layer]
    Service --> |ORM Query| SQLAlchemy[SQLAlchemy Models]
    SQLAlchemy --> |PostgreSQL Driver| DB[(PostgreSQL Database)]
```

### Frontend Architecture
```mermaid
graph TD
    Router[React Router DOM] --> |Route Guard| ProtectedRoute[ProtectedRoute Component]
    ProtectedRoute --> |Context| AuthContext[AuthContext]
    ProtectedRoute --> |Render| Page[Dashboard / Wizard / Assessment Pages]
    Page --> |Invoke| APIService[Axios API Client]
    APIService --> |JWT Header| Backend[FastAPI Backend]
```

---

## 🗄️ Database Schema & Tables

### 1. `users` Table
Stores user accounts, credentials, and access roles.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | PRIMARY KEY, AUTOINCREMENT | Unique User ID |
| `full_name` | `VARCHAR(255)` | NOT NULL | User's full name |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL, INDEX | User email address |
| `password` | `VARCHAR(255)` | NULLABLE | PBKDF2 hashed password (null for OAuth) |
| `role` | `VARCHAR(50)` | NOT NULL, DEFAULT 'USER' | Role: `USER`, `SKINCARE_CONSULTANT`, `ADMIN` |
| `provider` | `VARCHAR(50)` | NOT NULL, DEFAULT 'LOCAL' | Auth Provider: `LOCAL`, `GOOGLE` |
| `created_at` | `TIMESTAMP` | NOT NULL | Record creation timestamp |
| `updated_at` | `TIMESTAMP` | NOT NULL | Record last updated timestamp |

### 2. `skin_profiles` Table
Stores dermatological parameters and lifestyle factors.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | PRIMARY KEY, AUTOINCREMENT | Unique Profile ID |
| `user_id` | `INTEGER` | FK (`users.id` CASCADE), UNIQUE | Owner User ID |
| `full_name` | `VARCHAR(255)` | NOT NULL | Profile holder name |
| `age` | `INTEGER` | NOT NULL | Age in years |
| `gender` | `VARCHAR(50)` | NOT NULL | Gender identity |
| `skin_type` | `VARCHAR(50)` | NOT NULL | Skin classification (Oily, Dry, Combo, etc.) |
| `skin_tone` | `VARCHAR(50)` | NOT NULL | Fitzpatrick skin tone scale |
| `concerns` | `JSON` | NOT NULL, DEFAULT `[]` | List of target concerns |
| `water_intake` | `FLOAT` | NOT NULL, DEFAULT `2.0` | Daily water intake in liters |
| `allergies` | `TEXT` | NULLABLE | Product allergies |
| `sensitivities` | `TEXT` | NULLABLE | Chemical sensitivities |
| `climate` | `VARCHAR(50)` | NULLABLE | Environmental climate |
| `uv_exposure` | `VARCHAR(50)` | NULLABLE | Sun/UV exposure level |

### 3. `skin_assessments` Table
Stores AI assessment diagnostic history and calculated health metrics.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | PRIMARY KEY, AUTOINCREMENT | Assessment Record ID |
| `user_id` | `INTEGER` | FK (`users.id` CASCADE) | User ID |
| `acne` | `INTEGER` | NOT NULL | Acne severity score (0-100) |
| `hyperpigmentation`| `INTEGER` | NOT NULL | Pigmentation score (0-100) |
| `dryness` | `INTEGER` | NOT NULL | Dryness level (0-100) |
| `oiliness` | `INTEGER` | NOT NULL | Sebum score (0-100) |
| `redness` | `INTEGER` | NOT NULL | Inflammation score (0-100) |
| `overall_score` | `INTEGER` | NOT NULL | Calculated overall health score (0-100%) |
| `risk_level` | `VARCHAR(50)` | NOT NULL | Risk rating: `Low Risk`, `Moderate Risk`, `High Priority` |
| `concern_priority`| `VARCHAR(100)`| NOT NULL | Primary identified concern |
| `summary` | `TEXT` | NOT NULL | AI generated diagnostic recommendation |

---

## 📡 API Endpoint Reference

### Authentication APIs (`/api/auth`)
- `POST /api/auth/register` — Create local account (`full_name`, `email`, `password`, `role`).
- `POST /api/auth/login` — Authenticate user credentials and return JWT tokens.
- `POST /api/auth/google` — Authenticate via Google OAuth credential token.
- `POST /api/auth/refresh` — Refresh access token using refresh token.
- `POST /api/auth/logout` — Invalidate user session.
- `GET  /api/auth/me` — Retrieve current authenticated user profile.

### Skin Profile APIs (`/api/profile`)
- `POST /api/profile` — Create new skin profile (Requires `USER` role).
- `GET  /api/profile` — Fetch current user's skin profile.
- `PUT  /api/profile` — Update skin profile parameters.
- `DELETE /api/profile` — Remove skin profile record.

### Skin Assessment APIs (`/api/assessment`)
- `POST /api/assessment` — Submit severity scores & calculate AI skin health metrics.
- `GET  /api/assessment/history` — List full assessment history for user.
- `GET  /api/assessment/{id}` — Fetch specific assessment details.

---

## ⚙️ Environment Configuration

### Backend `.env`
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=skin_dashboard_db
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/skin_dashboard_db

JWT_SECRET_KEY=super-secret-key-change-in-production
JWT_REFRESH_SECRET_KEY=super-secret-refresh-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Frontend `.env`
```env
VITE_API_URL=http://127.0.0.1:8000/api/auth
```

---

## 🚀 Step-by-Step Build & Run Instructions

### 1. Database Setup
Start PostgreSQL container via Docker Compose:
```bash
docker-compose up -d
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd skin-dashboard
npm install
npm run dev
```

### 4. Running Verification Test Suites
```bash
cd backend
python verify_all_phases.py
python test_phase3_e2e.py
```

---

## 🔮 Future Development Roadmap

- **Phase 1 (Completed)**: Authentication, RBAC, Dashboard Foundation, Google OAuth.
- **Phase 2 (Completed)**: Skin Profile Management, AI Assessment Engine.
- **Phase 3 (Completed)**: Routine Personalization Engine, Active Ingredient Conflict Checker, Products Database.
- **Phase 4 (Completed)**: AI Product Recommendation Engine, Product Suitability Score, Budget Recommendation, Product Comparison.
- **Phase 5 (Completed)**: Skin Health Analytics, Progress Tracking, Timeline, Charts, Trend Analysis.
- **Phase 6 (Completed)**: Consultant Dashboard, Dermatologist Dashboard, Patient Management, Clinical Overrides.
- **Phase 7 (Completed)**: Notifications, Hydration & Routine Reminders, PDF/Excel/CSV Reports.
- **Phase 8 (Completed)**: Production Dockerization, Security Hardening, Readiness Probes & Deployment Documentation.
