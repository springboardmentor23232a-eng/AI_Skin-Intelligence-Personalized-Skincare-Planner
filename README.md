# DermaLoop — AI Skin Intelligence & Personalized Skincare Planner

A full-stack skincare platform with four role-based dashboards (User,
Consultant, Dermatologist, Admin), JWT + Google OAuth2 authentication,
a PostgreSQL database, and a working webcam-based AI skin analysis
pipeline.

```
skin-ai-platform/
├── backend/            FastAPI + PostgreSQL + SQLAlchemy + OpenCV
│   ├── app/
│   │   ├── main.py            FastAPI app, CORS, router wiring
│   │   ├── config.py          Settings (reads .env)
│   │   ├── database.py        SQLAlchemy engine/session
│   │   ├── models.py          All 16 database tables
│   │   ├── schemas.py         Pydantic request/response models
│   │   ├── security.py        Password hashing + JWT helpers
│   │   ├── auth.py            get_current_user / require_roles deps
│   │   ├── seed.py            Seeds demo staff accounts + products
│   │   ├── ai/
│   │   │   └── skin_analysis.py   OpenCV-based skin scoring + region-highlighting engine
│   │   └── routers/
│   │       ├── auth.py, profile.py, skin_profile.py, assessment.py,
│   │       │   recommendations.py, appointments.py, consultant.py,
│   │       │   dermatologist.py, admin.py, products_reports.py,
│   │       │   lifestyle.py, messages.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/            HTML + Bootstrap-free CSS + vanilla JS
    ├── index.html        Landing page
    ├── login.html         Login (+ Google OAuth2 button placeholder)
    ├── register.html       Registration
    ├── css/style.css       Shared design system
    ├── js/api.js            Shared fetch/auth client
    └── dashboards/
        ├── user.html + js/user.js
        ├── consultant.html + js/consultant.js
        ├── dermatologist.html + js/dermatologist.js
        └── admin.html + js/admin.js
```

## 1. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env            # then edit .env with your real values
```

Create the PostgreSQL database referenced in `.env`:

```sql
CREATE DATABASE skinai_db;
CREATE USER skinai_user WITH PASSWORD 'skinai_pass';
GRANT ALL PRIVILEGES ON DATABASE skinai_db TO skinai_user;
```

Run the API (tables are auto-created on first startup):

```bash
uvicorn app.main:app --reload --port 8000
```

Seed demo staff accounts (one admin, one consultant, one dermatologist —
password `Passw0rd!` for all three) and a small product catalog:

```bash
python -m app.seed
```

Interactive API docs: http://localhost:8000/docs

### Google OAuth2

Set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `.env`. The
`/api/auth/google-login` endpoint verifies a Google Identity Services
`id_token` server-side — wire up the Google sign-in button on the
frontend (`login.html`) with your own client ID and pass its returned
credential to that endpoint.

## 2. Frontend setup

The frontend is static HTML/CSS/JS — no build step. Serve it with any
static server, e.g.:

```bash
cd frontend
python3 -m http.server 5500
```

Then open http://localhost:5500. If your backend runs somewhere other
than `http://localhost:8000`, set `window.API_BASE` before `js/api.js`
loads (e.g. add a small inline `<script>window.API_BASE = "https://your-api"</script>`
tag in each HTML file's `<head>`).

## 3. How the AI analysis works today

`app/ai/skin_analysis.py` implements a **real, runnable v1** pipeline
using OpenCV: Haar-cascade face detection, then color/texture
statistics (HSV, LAB, Laplacian, Canny edges) to produce the 7
sub-scores (acne, pigmentation, wrinkles, dryness, oiliness, redness,
pores) plus an overall skin health score, risk score, confidence
score, and top concern priority. `annotate_detected_regions()` draws
the detected face bounding box and top-3 concern labels onto a
processed copy of the frame, which is stored (`purpose="processed_scan"`)
and returned as `processed_image_id` on the assessment — this is a
heuristic placeholder; the interface is designed so you can swap in a
trained TensorFlow/YOLO model later without touching any router,
schema, or frontend code; just replace the body of
`analyze_face_image()` and keep the same return shape.

## 4. Role provisioning

Self-registration (`/register.html`) always creates a `user` role.
Consultant, dermatologist, and admin accounts are provisioned by an
admin from **Manage Users → change role**, or seeded via
`python -m app.seed` for local testing.

## 5. Messaging

`app/routers/messages.py` backs the Consultant "Message User" feature
(and works symmetrically for dermatologists/users). A user and a
consultant/dermatologist can message each other once they share an
appointment record; admins can message anyone. Endpoints:
`POST /api/messages`, `GET /api/messages/{other_user_id}` (marks
incoming messages read), `GET /api/messages/threads` (latest message
per conversation, for inbox-style views).

## 6. Admin: Permissions & Database Backup

- `GET /api/admin/permissions` returns a static role → permission
  matrix backing the "Manage Permissions" screen.
- `POST /api/admin/backup` dumps every table's rows to a timestamped
  JSON file under `backend/backups/` (works regardless of whether
  you're on SQLite or PostgreSQL) and logs the action; `GET
  /api/admin/backups` lists past backups.

## 7. Notes on production hardening

This is a complete, working scaffold — before shipping it publicly,
you'd want to add: Alembic migrations (replacing `create_all`), a
refresh-token blacklist/rotation table, rate limiting on `/login`, S3
(or similar) storage for scan images and backups instead of local
disk, HTTPS, and input size limits on uploaded images.
