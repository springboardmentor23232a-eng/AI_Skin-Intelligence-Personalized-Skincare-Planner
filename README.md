# AI Skin Intelligence – Personalized Skincare Planner

A full-stack, role-based skincare analysis platform. Users upload a facial
photo and get a simulated AI skin assessment (health score, concerns, risk
factors, product recommendations), then can book appointments with doctors
or consultants who review and annotate their reports. Admins manage the
whole platform.

**Stack:** React (Vite) + React Router + Axios · Node.js/Express ·
PostgreSQL · JWT + Google OAuth2 · bcrypt · multer

> This project was built to satisfy two internal module guides:
> **Module 1** (Auth/JWT/OAuth/RBAC — hence the single `users` table with
> a `role` column) and **Module 3** (Skin Assessment Engine — hence the
> `skin_health_score` / concerns / risk-factors shape of each report,
> adapted here into the Node/Express stack instead of FastAPI).

---

## 1. Project layout

```
ai-skin-intelligence/
├── backend/            Express API (JWT, Google OAuth, RBAC, uploads)
│   ├── src/
│   │   ├── config/      db.js, passport.js
│   │   ├── controllers/ auth, user, doctor, consultant, admin
│   │   ├── middleware/  authMiddleware, roleMiddleware, uploadMiddleware
│   │   ├── routes/
│   │   ├── db/          schema.sql, init.js (creates tables + demo users)
│   │   └── utils/       generateToken.js, aiAnalysis.js (simulated AI)
│   ├── uploads/         uploaded skin photos (served statically)
│   └── server.js
└── frontend/           React (Vite) SPA
    └── src/
        ├── api/          axios instance with JWT interceptor
        ├── context/      AuthContext (login/register/logout, role routing)
        ├── components/   Navbar, Sidebar, ProtectedRoute, shared UI
        ├── pages/        Login, Register, OAuthCallback, and one folder
        │                 per role: user/ doctor/ consultant/ admin/
        └── styles/       theme.css (white + blue/green healthcare theme)
```

## 2. Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally (or a connection string to a hosted instance)
- (Optional, for Google login) a Google Cloud OAuth 2.0 Client ID

## 3. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- Set `PGUSER` / `PGPASSWORD` / `PGDATABASE` to match a Postgres database
  you've created (e.g. `createdb ai_skin_intelligence`).
- Set `JWT_SECRET` and `SESSION_SECRET` to any long random strings.
- Leave `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` blank if you don't need
  Google login yet — the app runs fine without it, the "Continue with
  Google" button just won't complete.

Create the schema and demo accounts:

```bash
npm run db:init
```

This creates all tables and prints four ready-to-use demo logins (see
below). Then start the API:

```bash
npm run dev      # nodemon, auto-restarts on changes
# or
npm start
```

The API runs at `http://localhost:5000`. Check `http://localhost:5000/api/health`.

### Demo accounts (created by `npm run db:init`)

| Role       | Email                        | Password       |
|------------|-------------------------------|----------------|
| Admin      | admin@skinintel.com           | Password@123   |
| Doctor     | doctor@skinintel.com          | Password@123   |
| Consultant | consultant@skinintel.com      | Password@123   |
| User       | user@skinintel.com            | Password@123   |

## 4. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`. Register a new account or log in with one of
the demo accounts above — you'll land on the dashboard that matches your role.

## 5. Google OAuth setup (optional)

1. In [Google Cloud Console](https://console.cloud.google.com/), create an
   OAuth 2.0 Client ID (Web application).
2. Authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
3. Authorized JavaScript origin: `http://localhost:5173`
4. Copy the Client ID/Secret into `backend/.env`.
5. Restart the backend. The "Continue with Google" button on Login/Register
   will now complete the full flow: Google → backend issues a JWT → redirects
   to `frontend/oauth/callback?token=...` → frontend stores the token and
   routes to the right dashboard. New Google sign-ups default to the `USER`
   role (upgrade them from the Admin → Doctors/Consultants tab if needed).

## 6. How authentication & RBAC work

- **Register/Login** (`POST /api/auth/register`, `/login`) hash passwords
  with bcrypt and return a JWT containing `{ id, email, role }`.
- The frontend stores the JWT in `localStorage` and attaches it as
  `Authorization: Bearer <token>` on every API call (`src/api/axios.js`).
- Every protected backend route runs `protect` (verifies the JWT, loads the
  current user) and, where needed, `authorize('ROLE', ...)` to enforce RBAC
  — e.g. only `DOCTOR` can hit `/api/doctor/*`.
- On the frontend, `<ProtectedRoute allowedRoles={[...]}>` blocks
  unauthenticated users (→ `/login`) and redirects wrong-role users to
  their own dashboard rather than showing a 403 page.
- Google OAuth (Passport, stateless) creates or links an account, then
  issues the same kind of JWT — so once logged in, Google and
  email/password users are indistinguishable to the rest of the app.

## 7. Simulated AI analysis

Per the project brief, there's no real computer-vision model. Uploading a
photo (`POST /api/reports/upload`) runs `backend/src/utils/aiAnalysis.js`,
which generates a plausible, varied result: skin type, a 0–100 health
score, 2–3 prioritized concerns, 1–2 risk factors, and matching product
recommendations — stored in `skin_reports` and viewable in "My Reports".
Doctors can add diagnosis notes; consultants can override/add
recommendations — both mark the report `REVIEWED`.

## 8. API summary

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `/login`, `GET /google`, `GET /google/callback`, `GET /me`, `PUT /me`, `PUT /change-password` |
| Reports (User) | `POST /api/reports/upload`, `GET /api/reports`, `GET /api/reports/:id` |
| Appointments (User) | `GET /api/appointments/providers`, `POST /api/appointments`, `GET /api/appointments/mine`, `PUT /api/appointments/:id/cancel` |
| Doctor | `GET /api/doctor/patients`, `/reports`, `PUT /reports/:id/diagnosis`, `GET /appointments`, `PUT /appointments/:id/status` |
| Consultant | `GET /api/consultant/reports`, `PUT /reports/:id/recommend`, `GET /appointments`, `PUT /appointments/:id/status` |
| Admin | `GET/POST /api/admin/users`, `PUT/DELETE /users/:id`, `GET /reports`, `GET /appointments`, `GET /stats` |

## 9. Notes & next steps

- Uploaded images are stored on local disk (`backend/uploads/`) and served
  at `/uploads/<filename>` — swap for S3/Cloudinary for production.
- `skin_reports`, `appointments`, `doctor_profiles`, `consultant_profiles`
  all reference the single `users` table, matching Module 1's schema while
  still giving Doctors/Consultants role-specific fields.
- This was verified with a full syntax pass (`node --check` on every
  backend file, `esbuild` on every frontend file) since the sandbox this
  was built in has no network access to run `npm install` — run `npm
  install` yourself in both `backend/` and `frontend/` before starting.
