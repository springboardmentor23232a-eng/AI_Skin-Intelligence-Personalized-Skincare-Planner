# SkinSight Backend

Node.js + Express + PostgreSQL API — registration/login, JWT auth, Google OAuth2,
role-based access control (User / Skincare Consultant / Dermatologist / Administrator).

## 1. Install

```bash
cd skinsight-backend
npm install
```

## 2. Configure environment

```bash
cp .env.example .env
```

Fill in:
- `PGUSER` / `PGPASSWORD` / `PGDATABASE` — your local PostgreSQL credentials
- `JWT_SECRET` / `SESSION_SECRET` — any long random strings
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from https://console.cloud.google.com/apis/credentials
  (create an OAuth 2.0 Client ID, add `http://localhost:5000/api/auth/google/callback` as an
  authorized redirect URI)

## 3. Create the database and apply the schema

```bash
# create the database once
psql -U postgres -c "CREATE DATABASE skinsight;"

# apply the schema (creates users, skin_profiles, lifestyle_logs, sleep_logs,
# hydration_logs, environment_logs)
npm run db:init
```

## 4. Run the API

```bash
npm run dev      # with nodemon, auto-restarts on changes
# or
npm start
```

API runs on `http://localhost:5000` by default.

## 5. Point the frontend at it

Open `skinsight-frontend/script.js` and confirm `API_BASE_URL` matches where this
backend is running (defaults to `http://localhost:5000/api`). Serve the frontend
folder with any static server (VS Code Live Server, `npx serve`, XAMPP, etc.) —
just don't open the HTML files via `file://`, since `fetch()` calls need a proper origin.

## Endpoints

| Method | Path                         | Auth        | Purpose                              |
|--------|------------------------------|-------------|---------------------------------------|
| POST   | /api/auth/register           | —           | Create account (bcrypt-hashed password) |
| POST   | /api/auth/login              | —           | Login, returns JWT                   |
| GET    | /api/auth/me                 | JWT         | Current user                         |
| GET    | /api/auth/google             | —           | Start Google OAuth2                  |
| GET    | /api/auth/google/callback     | —           | Google redirects here, issues JWT    |
| GET    | /api/profile                 | JWT         | Get own profile                      |
| PUT    | /api/profile                 | JWT         | Update own profile                   |
| GET    | /api/skin-profile             | JWT         | Get skin profile                     |
| PUT    | /api/skin-profile             | JWT         | Create/update skin profile           |
| POST/GET | /api/tracking/lifestyle     | JWT         | Log / list lifestyle entries         |
| POST/GET | /api/tracking/sleep         | JWT         | Log / list sleep entries             |
| POST/GET | /api/tracking/hydration     | JWT         | Log / list hydration entries         |
| POST/GET | /api/tracking/environment   | JWT         | Log / list environment entries       |
| GET    | /api/dashboard/redirect      | JWT         | Which dashboard page to send user to |
| GET    | /api/dashboard/admin          | JWT + admin | Admin-only stats                     |
| GET    | /api/dashboard/dermatologist  | JWT + dermatologist | Linked patient list          |
| GET    | /api/dashboard/consultant     | JWT + consultant    | Client list                  |
| GET    | /api/dashboard/user           | JWT + user  | Own latest sleep/hydration summary   |

## Roles

`user`, `consultant`, `dermatologist`, `admin` — stored as a Postgres ENUM
(`user_role`) on the `users` table. Self-registration only allows
`user` / `consultant` / `dermatologist`; admin accounts should be inserted
directly in the database (or via a seed script) rather than through public
signup.

## Notes for viva / demo

- Passwords are hashed with **bcrypt** (10 salt rounds) before ever touching the database.
- Auth state on every protected request is a **JWT** verified in `src/middleware/auth.js`,
  not a session cookie — that's why Express-session is only used briefly during
  the Google OAuth handshake.
- **Role-based access control** is enforced server-side in `src/middleware/roles.js`,
  not just hidden in the frontend — even if someone edits the HTML, the API rejects
  requests from the wrong role.
