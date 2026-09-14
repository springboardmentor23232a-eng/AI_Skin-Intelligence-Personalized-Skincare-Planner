# Deployment Guide

## 1. Local development
See `README.md` sections 2–3 (Docker or manual setup).

## 2. Running the test suite before every deploy
```bash
cd backend
pip install -r requirements.txt
pytest -v
```
The suite runs against an isolated in-memory SQLite database — it never
touches your real Postgres data — and covers:
- Authentication (register, login, wrong-password rejection, protected routes)
- A full end-to-end workflow: assessment → routine → progress log →
  reminders/notifications → all 5 report types in both PDF and Excel.

Treat a failing test as a release blocker, not a warning.

## 3. Docker Compose (recommended for a single-server deploy)
```bash
docker compose up -d --build
```
This brings up three containers:
- `db` — Postgres 15, with a healthcheck gating startup order
- `backend` — FastAPI + Uvicorn on port 8000, with a healthcheck hitting
  `/api/health`
- `frontend` — Nginx serving the static frontend on port 8080

Check container health:
```bash
docker compose ps
docker compose logs -f backend
```

## 4. Environment variables (production)
Set real values for at minimum:
- `DATABASE_URL` — production Postgres connection string
- `SECRET_KEY` — a long random value (never reuse the example key)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — if Google login is enabled
- `GEMINI_API_KEY` — if the AI Assistant tab is enabled

Never commit `.env` — it's already listed in `.gitignore`.

## 5. Reverse proxy / TLS
Put Nginx or a managed load balancer in front of both the `frontend` (8080)
and `backend` (8000) containers, terminate TLS there, and set the frontend's
`API_BASE` (in `frontend/js/api.js`) to your real backend domain instead of
`localhost`.

## 6. Monitoring & logging
Every backend request is logged with a short correlation ID
(`X-Request-ID` response header) and its duration, and every unhandled
exception is logged with the same ID before the 500 is returned — grep your
container logs for that ID when investigating a specific failed request.
For production, ship these logs to your platform's log aggregator (e.g.
`docker compose logs` piped to a log shipper, or your cloud provider's
container logging).

## 7. Security checklist before going live
- [ ] `SECRET_KEY` is a long random value, not the example
- [ ] `DATABASE_URL` uses a dedicated DB user with least-privilege access
- [ ] CORS `allow_origins` in `app/main.py` is narrowed from `"*"` to your
      real frontend domain
- [ ] HTTPS is enforced end-to-end (reverse proxy handles this)
- [ ] `pytest` passes
- [ ] Uploaded images (`backend/uploads/`) are on a volume that's backed up
      or otherwise recoverable

## 8. Performance notes
- The scoring/recommendation engines run in-process (no external ML
  service), so scale the `backend` container horizontally behind a load
  balancer if request volume grows — it's stateless aside from the DB.
- Admin's "Recommendation Monitoring" endpoint caps results at 200 rows to
  keep response times bounded as data grows; raise that limit only if you
  add pagination alongside it.
