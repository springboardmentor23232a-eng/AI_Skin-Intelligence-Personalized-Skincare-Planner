# Production Deployment & Final Integration Guide

## AI Skin Intelligence & Personalized Skincare Planner

This guide provides the exhaustive specification and step-by-step manual for containerizing, configuring, deploying, and maintaining the **AI Skin Intelligence Platform** in production environments.

---

## 1. System Architecture & Deployment Topology

```
                         [ Public HTTPS / Internet ]
                                      │
                                      ▼
             ┌─────────────────────────────────────────────────┐
             │       Reverse Proxy & Static Web Server         │
             │           (NGINX Alpine Container)             │
             │    - TLS / SSL Termination                      │
             │    - SPA Fallback (try_files $uri /index.html)  │
             │    - GZip / Brotli Dynamic Compression          │
             │    - 1-Year Immutable Asset Caching             │
             └───────────────┬─────────────────┬───────────────┘
                             │                 │
              /api/* requests│                 │/uploads/* requests
                             ▼                 ▼
             ┌─────────────────────────────────────────────────┐
             │             FastAPI Backend Service             │
             │           (Python 3.11-slim Container)          │
             │    - Uvicorn Multi-Worker ASGI Server           │
             │    - Starlette GZip Middleware (>= 1KB)         │
             │    - Request Correlation (X-Request-ID)         │
             │    - PyTorch EfficientNet-B0 ML Inference       │
             │    - Strict RBAC & Security Middleware          │
             └───────────────┬─────────────────────────────────┘
                             │
              SQLAlchemy Pool│(size=20, max_overflow=10, pre-ping=True)
                             ▼
             ┌─────────────────────────────────────────────────┐
             │            PostgreSQL 15 Database               │
             │             (Alpine Container)                  │
             │    - 19 Normalized Relational Tables            │
             │    - Alembic Schema Migrations                  │
             │    - Named Persistent Volume (postgres_data)    │
             └─────────────────────────────────────────────────┘
```

---

## 2. Production Docker Containerization

The platform is fully containerized using multi-stage Docker builds designed for low footprint, non-root security isolation, and reproducible deployments.

### Multi-Stage Backend Dockerfile (`backend/Dockerfile`)
- **Stage 1 (Builder)**: Compiles native C dependencies (`build-essential`, `libpq-dev`), installs Python packages into a clean wheels directory.
- **Stage 2 (Runtime)**: Minimal `python:3.11-slim` runtime containing only `libpq5` and `curl`. Runs under an unprivileged `appuser` user (non-root security hardening).
- **Healthcheck**: Periodically polls `http://localhost:8000/health` with a 30s interval and 5s timeout.

### Multi-Stage Frontend Dockerfile (`frontend/Dockerfile`)
- **Stage 1 (Build)**: Node.js 20 Alpine environment executes `npm ci` and `npm run build` using optimized Vite/Rolldown vendor chunk splitting.
- **Stage 2 (Production)**: Lightweight NGINX Alpine server serving the compiled SPA bundle.

### Docker Compose Orchestration (`docker-compose.yml`)
To deploy the full multi-tier stack locally or on a cloud virtual machine:

```bash
# Clone the repository and switch to the release branch
git clone <repository_url>
cd AI_Skin-Intelligence-Personalized-Skincare-Planner
git checkout durga-laskshmi-narayana-jampa

# Copy environment variables
cp backend/.env.production.example backend/.env

# Launch services with Docker Compose
docker-compose up --build -d
```

### Checking Service Health & Logs

```bash
# Verify container statuses and health probes
docker-compose ps

# Stream backend application logs with correlation IDs
docker-compose logs -f backend

# Verify database health
docker exec -it skin_planner_db pg_isready -U skin_user -d skin_planner
```

---

## 3. Frontend & Backend Integration Optimization

### Vite Rolldown Code-Splitting
The frontend build is configured with fine-grained vendor chunk splitting in `frontend/vite.config.js`:
- `vendor-react`: React 19, React DOM, React Router 7 (`~231 kB`, gzipped `~74 kB`)
- `vendor-ui`: Bootstrap 5 framework styles & utilities (`~230 kB`, gzipped `~31 kB`)
- `vendor-api`: Axios HTTP client and Google OAuth components (`~47 kB`, gzipped `~18 kB`)
- `index`: Application core and business components (`~251 kB`, gzipped `~48 kB`)

This eliminates large bundle warnings, maximizes browser cache reuse, and slashes initial page load times below `550ms`.

### NGINX Reverse Proxy Configuration
`frontend/nginx.conf` integrates:
1. **Dynamic GZip Compression**: Reduces text, CSS, JSON, and SVG payloads by up to 75%.
2. **Static Asset Caching**: 1-year immutable caching for static hashes (`\.(?:css|js|woff2?|svg|png|jpg|jpeg|gif|ico)$`).
3. **Security Headers**: Injects `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `X-XSS-Protection: 1; mode=block`.
4. **Media Proxy**: Proxies `/uploads/` and `/api/` directly to backend with 60-second timeouts.

---

## 4. Performance Tuning & Scalability

### Database Connection Pooling
`backend/app/db/session.py` configures connection pooling for PostgreSQL:
```python
create_engine(
    db_url,
    pool_size=20,
    max_overflow=10,
    pool_recycle=3600,
    pool_pre_ping=True,
    pool_timeout=30
)
```
- **`pool_size=20`**: Maintains 20 persistent connections ready for concurrent worker threads.
- **`max_overflow=10`**: Dynamically bursts up to 30 simultaneous connections under peak load.
- **`pool_pre_ping=True`**: Tests connections before usage, preventing stale connection exceptions during idle periods.
- **`pool_recycle=3600`**: Recycles connections hourly to avoid firewall/NAT timeouts.

### GZip Response Middleware
FastAPI Starlette `GZipMiddleware(minimum_size=1000)` compresses all JSON payloads, CSV streams, and diagnostic logs exceeding 1000 bytes.

---

## 5. Monitoring, Health Checks & System Telemetry

### Production Endpoints

| Endpoint | Method | Purpose | Response |
|---|---|---|---|
| `/health` | `GET` | Container liveness probe | `{"status": "healthy", "timestamp": "...", "version": "1.0.0"}` |
| `/readiness` | `GET` | Database readiness probe | `{"status": "ready", "database": "connected"}` |
| `/api/system/telemetry` | `GET` | Health metrics & ML status | Operational metrics, uptime, memory, engine, model architecture |

### Structured Logging with Request Correlation
Every incoming HTTP request is assigned a UUID correlation ID (`X-Request-ID`). If the client forwards an `X-Request-ID` header, it is propagated. Every log entry formats:
```
2026-09-11 22:13:32,251 [INFO] [ReqID: api.telemetry] REQ [c3809307] GET /api/analytics/routines/logs status=200 ip=172.18.0.1 latency=14.61ms
```

---

## 6. Disaster Recovery & Backup Strategy

### Database Backup (Automated Cron Job)
To create an encrypted snapshot of the PostgreSQL database:
```bash
docker exec -t skin_planner_db pg_dump -U skin_user -F c skin_planner > backup_$(date +%Y%m%d_%H%M%S).dump
```

### Database Restoration
```bash
docker exec -i skin_planner_db pg_restore -U skin_user -d skin_planner -c < backup_file.dump
```

### Diagnostic Uploads Persistence
User progress photos and clinical uploads are stored in the persistent volume `backend_uploads`. To back up:
```bash
docker run --rm -v backend_uploads:/volume -v $(pwd):/backup alpine tar czf /backup/uploads_backup.tar.gz -C /volume .
```

---

## 7. Deployment Automation Scripts

Two production deployment scripts are provided in the repository root:
- **Windows**: `scripts\deploy_production.bat`
- **Linux / Unix**: `scripts/deploy_production.sh`

Both scripts execute pre-flight dependency checks, build the optimized frontend bundle, verify pre-trained ML weights, run the deployment readiness test suite, and launch the multi-container Docker cluster with `--docker`.
