# Environment Variables Configuration

This document describes all environment variables required for the AI Skin Intelligence application across different deployment environments.

## Frontend Environment Variables

Frontend variables are prefixed with `VITE_` and are included in the production build.

### Required Frontend Variables

#### `VITE_API_BASE_URL`
- **Description:** Base URL of the backend API
- **Format:** `https://example.com` (HTTPS required for production)
- **Local Development:** `http://127.0.0.1:8000`
- **Vercel Production:** `https://api.yourdomain.com` (will be set when backend is deployed to Render)
- **Used by:** All frontend API requests

#### `VITE_GOOGLE_CLIENT_ID`
- **Description:** Google OAuth 2.0 Client ID for authentication
- **Format:** Alphanumeric string ending with `.apps.googleusercontent.com`
- **Source:** Google Cloud Console → OAuth 2.0 Client IDs
- **Local Development:** Development Google OAuth app Client ID
- **Vercel Production:** Production Google OAuth app Client ID (with Vercel domain as authorized origin)
- **Security:** This is a public Client ID (safe to include in frontend)
- **Used by:** Google authentication flows in LoginPage and RegisterPage

## Backend Environment Variables

Backend variables are sensitive and must NEVER be committed to Git. They must be set in the deployment platform's secret management system.

### Required Backend Variables

#### `DATABASE_URL`
- **Description:** PostgreSQL connection string
- **Format:** `postgresql://username:password@host:port/database_name`
- **Local Development:** Points to local PostgreSQL instance
- **Render Production:** Will be provided by Render PostgreSQL add-on
- **Security:** Contains credentials - MUST be kept secret
- **Used by:** `backend/app/database.py` for database connection

#### `SECRET_KEY`
- **Description:** JWT secret key for token signing and verification
- **Format:** Long random string (minimum 32 characters, preferably 64+)
- **Local Development:** Any strong random string for testing
- **Render Production:** Must be a strong, cryptographically secure random string
- **Security:** CRITICAL - Must be unique per environment, never shared
- **Used by:** `backend/app/jwt_handler.py` and `backend/app/dependencies.py`
- **Generation:** `python -c "import secrets; print(secrets.token_urlsafe(32))"`

#### `ALGORITHM`
- **Description:** JWT algorithm for token signing
- **Format:** `HS256` (HMAC with SHA-256)
- **Default Value:** `HS256` (recommended)
- **Used by:** `backend/app/jwt_handler.py` and `backend/app/dependencies.py`

#### `ACCESS_TOKEN_EXPIRE_MINUTES`
- **Description:** JWT token expiration time in minutes
- **Format:** Integer (e.g., `43200` for 30 days)
- **Default Value:** `43200` (30 days)
- **Local Development:** Can be lower for testing (e.g., `1440` for 1 day)
- **Production Recommendation:** `43200` (30 days) or adjust based on security requirements
- **Used by:** `backend/app/jwt_handler.py`

#### `GOOGLE_CLIENT_ID`
- **Description:** Google OAuth 2.0 Client ID (backend-side, for reference/validation)
- **Format:** Alphanumeric string ending with `.apps.googleusercontent.com`
- **Note:** Backend currently stores for reference; actual OAuth validation happens frontend-side
- **Security:** This is a public Client ID (safe to include)
- **Used by:** Documentation/reference in backend

#### `ALLOWED_ORIGINS`
- **Description:** Comma-separated list of allowed CORS origins
- **Format:** `https://example.com,https://api.example.com`
- **Local Development:** `http://localhost:5173,http://127.0.0.1:5173`
- **Vercel Production:** `https://yourdomain.vercel.app`
- **Used by:** `backend/app/main.py` CORS middleware
- **Security:** Only origins that should access the API

## Environment Setup by Deployment Target

### Local Development

**Frontend (.env):**
```
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_GOOGLE_CLIENT_ID=<development-google-client-id>
```

**Backend (.env):**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/skin_ai_db
SECRET_KEY=<local-development-secret-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200
GOOGLE_CLIENT_ID=<development-google-client-id>
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Vercel Frontend Deployment

**Vercel Environment Variables (Project Settings → Environment Variables):**

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | `https://backend-service.render.com` (set after Render backend deployed) |
| `VITE_GOOGLE_CLIENT_ID` | Production Google OAuth Client ID |

### Render Backend Deployment

**Render Environment Variables (Environment section in Render dashboard):**

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Provided by Render PostgreSQL add-on |
| `SECRET_KEY` | Generate: `python -c "import secrets; print(secrets.token_urlsafe(32))"` |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `43200` |
| `GOOGLE_CLIENT_ID` | Production Google OAuth Client ID |
| `ALLOWED_ORIGINS` | `https://yourdomain.vercel.app` |

## Security Guidelines

1. **Never commit .env files** - Add `.env` and `.env.local` to `.gitignore`
2. **Use strong secrets** - Generate using cryptographic randomness
3. **Rotate secrets regularly** - Especially in production
4. **Environment separation** - Use different secrets for dev, staging, production
5. **Principle of least privilege** - Each origin/service gets only required access
6. **Audit access** - Log and monitor environment variable usage

## Deployment Checklist

- [ ] Generate production `SECRET_KEY`
- [ ] Configure Render PostgreSQL and get `DATABASE_URL`
- [ ] Set all backend environment variables in Render dashboard
- [ ] Register Vercel domain with Google OAuth as authorized origin
- [ ] Set frontend environment variables in Vercel dashboard
- [ ] Test backend health check endpoint
- [ ] Test frontend → backend API connectivity
- [ ] Verify CORS allows Vercel frontend domain
- [ ] Test authentication flow end-to-end

## Troubleshooting

**"Could not validate credentials"** - Check `SECRET_KEY` matches between token creation and verification

**CORS error** - Verify Vercel frontend domain is in `ALLOWED_ORIGINS`

**Database connection failed** - Verify `DATABASE_URL` format and PostgreSQL instance is running

**Google OAuth fails** - Check `VITE_GOOGLE_CLIENT_ID` matches Google OAuth app settings

---

**Last Updated:** Module 12.2  
**Next Review:** Before first production deployment
