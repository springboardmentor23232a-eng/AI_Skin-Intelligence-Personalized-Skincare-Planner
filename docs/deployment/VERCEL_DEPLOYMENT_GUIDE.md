# Vercel Cloud Deployment Guide
## AI Skin Intelligence & Personalized Skincare Planner

==============================================================================
CONFIDENTIAL & PROPRIETARY — PRODUCTION DEPLOYMENT STANDARD
Branch: `durga-laskshmi-narayana-jampa`
Repository: `https://github.com/springboardmentor23232a-eng/AI_Skin-Intelligence-Personalized-Skincare-Planner.git`
==============================================================================

---

## 1. Architectural Overview

The **AI Skin Intelligence & Personalized Skincare Planner** is deployed to Vercel using a **Unified Monorepo Serverless Architecture**. This architecture enables the React + Vite frontend and the FastAPI backend to coexist within the same repository while maintaining distinct build and runtime lifecycles.

```
                                  [ Client Browser ]
                                          │
                                          ▼
                             [ Vercel Edge / CDN ]
                                          │
                   ┌──────────────────────┴──────────────────────┐
                   │                                             │
            Static Requests                              /api/* Routes
                   │                                             │
                   ▼                                             ▼
          [ React + Vite SPA ]                       [ Vercel Serverless ]
          (frontend/dist bundle)                     (Python Runtime: api/index.py)
                                                                 │
                                                                 ▼
                                                        [ FastAPI Application ]
                                                        (backend/app/main.py)
                                                                 │
                                          ┌──────────────────────┼──────────────────────┐
                                          │                      │                      │
                                          ▼                      ▼                      ▼
                                 [ Managed Postgres ]     [ PyTorch ML Model ]    [ External APIs ]
                                 (Neon / Supabase)        (EfficientNet-B0)       (Google, Twilio, SMTP)
```

### Key Architectural Advantages
1. **Same-Origin API Routing (`/api/*`)**: Eliminates cross-origin CORS hurdles and complex cookie sharing. Frontend requests made with `withCredentials: true` maintain session context automatically.
2. **Zero Framework Rewrite**: React remains 100% React + Vite; backend remains 100% FastAPI + SQLAlchemy.
3. **Dual Compatibility**: The local Docker Compose stack (`docker-compose.yml`) and local uvicorn environments continue to function without alteration.

---

## 2. Vercel Project Configuration

### Configuration File (`vercel.json`)
The root [`vercel.json`](file:///vercel.json) orchestrates routing, builds, and output artifacts:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "version": 2,
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.py"
    },
    {
      "source": "/health",
      "destination": "/api/index.py"
    },
    {
      "source": "/readiness",
      "destination": "/api/index.py"
    },
    {
      "source": "/uploads/(.*)",
      "destination": "/api/index.py"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 3. Frontend Deployment (React + Vite)

### Specifications
- **Source Directory**: `frontend/`
- **Build Engine**: Vite v8.1.5 + React 19
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/dist`
- **Output Artifacts**:
  - `dist/index.html` (SPA entrypoint)
  - `dist/assets/vendor-react-*.js` (React, ReactDOM, React Router)
  - `dist/assets/vendor-ui-*.css` (Bootstrap & Layout system)
  - `dist/assets/vendor-api-*.js` (Axios, Google OAuth client)
  - `dist/assets/index-*.js` (Application code)

### API Resolution Strategy
In `frontend/src/services/apiService.js` and `authService.js`, the base URL dynamically detects the environment:
```javascript
const rawApi = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? "/api" : "http://127.0.0.1:8000/api");
```
In production (`import.meta.env.PROD`), requests default to relative `/api`, completely avoiding hardcoded `localhost` or `127.0.0.1` origins.

---

## 4. FastAPI Backend Deployment (Vercel Python Runtime)

### Serverless Bridge (`api/index.py`)
Vercel serverless executes Python via the [`api/index.py`](file:///api/index.py) bridge:
```python
import sys
import os

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.main import app
__all__ = ["app"]
```

### Dependency Specification (`api/requirements.txt` & `requirements.txt`)
Contains all production serverless dependencies:
- `fastapi>=0.141.0`, `uvicorn>=0.52.0`
- `sqlalchemy>=2.0.50`, `alembic>=1.18.0`, `psycopg2-binary>=2.9.12`
- `passlib[bcrypt]>=1.7.4`, `python-jose[cryptography]>=3.5.0`
- `Pillow>=10.0.0`, `openpyxl>=3.1.5`, `fpdf2>=2.8.2`, `pypdf>=5.0.0`, `reportlab>=4.0.0`

---

## 5. Managed PostgreSQL Strategy & Database Migrations

> [!IMPORTANT]
> PostgreSQL is NEVER hosted within Vercel serverless instances. A managed cloud PostgreSQL database must be provisioned.

### Recommended Providers
1. **Neon Serverless PostgreSQL** (Native Vercel integration, autoscaling, connection pooling)
2. **Supabase PostgreSQL**
3. **AWS RDS / Aurora Serverless v2**
4. **Google Cloud SQL for PostgreSQL**

### Database URL Format
The database connection string must follow:
```
postgresql://<db_user>:<db_password>@<db_host>:5432/<db_name>?sslmode=require
```
*Note: The platform automatically normalizes legacy `postgres://` connection strings to `postgresql://`.*

### Running Migrations Safely
Alembic migration sequence consists of **10 revisions** across **18 tables**:
```bash
# Execute against the remote managed PostgreSQL instance
cd backend
set DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<db>?sslmode=require
alembic upgrade head
```

> [!CAUTION]
> NEVER execute `alembic downgrade base` or `DROP TABLE` commands against any staging or production database.

---

## 6. Complete Environment Variable Inventory

| Variable Name | Classification | Environment | Target | Purpose / Requirements |
| :--- | :--- | :--- | :--- | :--- |
| `DATABASE_URL` | REQUIRED / PRIVATE | Production / Preview | Backend | Managed PostgreSQL connection string |
| `JWT_SECRET_KEY` | REQUIRED / PRIVATE | Production / Preview | Backend | 64-character hex key (`openssl rand -hex 32`) |
| `JWT_REFRESH_SECRET_KEY` | REQUIRED / PRIVATE | Production / Preview | Backend | 64-character hex key for refresh tokens |
| `ALGORITHM` | OPTIONAL / PRIVATE | All | Backend | Defaults to `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | OPTIONAL / PRIVATE | All | Backend | Defaults to `60` minutes |
| `REFRESH_TOKEN_EXPIRE_DAYS` | OPTIONAL / PRIVATE | All | Backend | Defaults to `7` days |
| `ENVIRONMENT` | REQUIRED / PRIVATE | Production / Preview | Backend | Set to `production` |
| `DEBUG` | REQUIRED / PRIVATE | Production / Preview | Backend | Set to `False` |
| `CORS_ORIGINS` | REQUIRED / PRIVATE | Production / Preview | Backend | Comma-separated allowed URLs or custom domains |
| `GOOGLE_CLIENT_ID` | OPTIONAL / PRIVATE | Production / Preview | Backend | Google Cloud OAuth 2.0 Web Client ID |
| `GOOGLE_CLIENT_SECRET` | OPTIONAL / PRIVATE | Production / Preview | Backend | Google Cloud OAuth 2.0 Client Secret |
| `VITE_GOOGLE_CLIENT_ID` | OPTIONAL / PUBLIC | Production / Preview | Frontend | Client-side Google OAuth Web Client ID |
| `VITE_API_BASE_URL` | OPTIONAL / PUBLIC | Production / Preview | Frontend | Defaults to `/api` for same-origin |
| `EMAIL_PROVIDER` | OPTIONAL / PRIVATE | Production / Preview | Backend | `CONSOLE`, `SMTP`, or `SENDGRID` |
| `SMTP_HOST` | OPTIONAL / PRIVATE | Production / Preview | Backend | Hostname of SMTP mail relay |
| `SMTP_PORT` | OPTIONAL / PRIVATE | Production / Preview | Backend | Typically `587` (STARTTLS) |
| `SMTP_USER` | OPTIONAL / PRIVATE | Production / Preview | Backend | SMTP username |
| `SMTP_PASSWORD` | OPTIONAL / PRIVATE | Production / Preview | Backend | SMTP secret password |
| `SMS_PROVIDER` | OPTIONAL / PRIVATE | Production / Preview | Backend | `CONSOLE` (default) or `TWILIO` |
| `TWILIO_ACCOUNT_SID` | OPTIONAL / PRIVATE | Production / Preview | Backend | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | OPTIONAL / PRIVATE | Production / Preview | Backend | Twilio Auth Token |
| `SMS_FROM` | OPTIONAL / PRIVATE | Production / Preview | Backend | Approved Twilio Sender phone number |
| `STORAGE_PROVIDER` | OPTIONAL / PRIVATE | Production / Preview | Backend | `local`, `s3`, `gcs`, or `vercel_blob` |

---

## 7. Third-Party Integration Configuration

### Google OAuth 2.0
1. Navigate to **Google Cloud Console** > **APIs & Services** > **Credentials**.
2. Configure Authorized JavaScript Origins:
   - `https://<your-vercel-project>.vercel.app`
   - Custom domain (if configured)
3. Set `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID` to matching client IDs.

### Email Verification
- In production, set `EMAIL_PROVIDER=SMTP` and supply valid SMTP credentials.
- Verification links are constructed using `FRONTEND_URL/verify-email?token=<token>`.

### SMS / Twilio OTP
- For real cellular delivery, set `SMS_PROVIDER=TWILIO` with valid Twilio credentials.
- If unconfigured, the system runs safely in `CONSOLE` simulation mode without breaking authentication workflows.

### Object Storage for Uploads
- Vercel Serverless execution environments have ephemeral filesystems.
- For permanent persistence of skin analysis photos, configure external object storage (AWS S3, Cloudinary, or Vercel Blob) as defined in `backend/.env.production.example`.

---

## 8. ML Model Deployment & Inference Performance

- **Model**: PyTorch EfficientNet-B0 (`ml/models/skin_condition_improved.pth`, ~15.61 MB).
- **Target Architecture**: 8 clinical categories mapped to legacy skin metrics.
- **Serverless Resilience**:
  - The runtime gracefully detects PyTorch availability.
  - If PyTorch CPU is loaded into memory, full tensor forward passes execute.
  - If serverless packaging boundaries constrain heavy PyTorch installation, the backend activates heuristic analysis fallback without crashing or disrupting application workflows.

---

## 9. Step-by-Step Vercel Deployment Workflow

### Step 1: Link Project via Vercel CLI
```bash
npx vercel link
```
Confirm linking to your authorized Vercel team/account.

### Step 2: Set Environment Variables
```bash
# Add critical secrets to Vercel
npx vercel env add DATABASE_URL production
npx vercel env add JWT_SECRET_KEY production
npx vercel env add JWT_REFRESH_SECRET_KEY production
npx vercel env add ENVIRONMENT production
```

### Step 3: Create Preview Deployment First
```bash
npx vercel
```
Inspect build logs, verify that the frontend build succeeds, and obtain the Preview URL.

### Step 4: Validate Preview URL
- Test `/health` -> `{"status": "healthy"}`
- Test `/readiness` -> `{"status": "ready", "database": "connected"}`
- Test user registration and login in the browser.
- Verify 0 JavaScript errors in browser console.

### Step 5: Deploy to Production
```bash
npx vercel --prod
```

---

## 10. Rollback & Troubleshooting Procedures

### Instant Rollback
```bash
# List previous deployments
npx vercel ls

# Rollback to specific deployment ID
npx vercel rollback <deployment-id>
```

### Common Issues & Remedies
1. **500 Internal Server Error on /api**: Check Vercel Function logs via dashboard or `npx vercel logs <url>`. Verify `DATABASE_URL` is accessible from cloud IP ranges (allow `0.0.0.0/0` in PostgreSQL security groups).
2. **Database SSL Handshake Failure**: Append `?sslmode=require` to `DATABASE_URL`.
3. **CORS Errors**: Ensure requests use relative `/api` paths or verify `CORS_ORIGINS` includes your deployment domain.

---

## 11. Security & Compliance Reminder

> [!WARNING]
> **Non-Medical Disclaimer**: This application is an AI cosmetic wellness and personalized skincare planner. It is **NOT** a medical diagnostic device and does not replace professional dermatological consultation. Do not claim medical diagnosis in marketing, documentation, or user interfaces.
