# Production Release Checklist

**AI Skin Intelligence - Module 12.8**  
**Deployment Date:** _______________  
**Prepared By:** _______________

---

## PRE-DEPLOYMENT VERIFICATION

### Code & Build
- [ ] Git working tree clean (no uncommitted changes for Module 12 scope)
- [ ] Frontend `npm run build` passes (no errors, bundle < 500 kB chunks)
- [ ] Backend import test passes (`python -c "from app.main import app"`)
- [ ] requirements.txt valid UTF-8 and all dependencies present

### Environment Configuration
- [ ] Environment variables identified and documented (see DEPLOYMENT_GUIDE.md)
- [ ] Secrets NOT committed (checked .env, .env.local, config files)
- [ ] VITE_API_BASE_URL configured for production environment
- [ ] SECRET_KEY ready to generate (use `secrets.token_urlsafe(32)`)

### Security Review
- [ ] CORS configuration reviewed (whitelist verified)
- [ ] Security headers middleware present and enabled
- [ ] RBAC authorization verified (require_role middleware working)
- [ ] File upload validation verified (image validation before permanent save)
- [ ] JWT authentication mandatory (SECRET_KEY required)
- [ ] No hardcoded secrets in source code

### Database & Indexes
- [ ] Database configuration verified (DATABASE_URL environment-driven)
- [ ] Composite index `ix_routine_logs_user_date` defined in models.py
- [ ] Index will be created on first backend startup via `Base.metadata.create_all()`

### Known Limitations Acknowledged
- [ ] Vision AI models NOT included (image assessment will fail until provided)
- [ ] Render free tier: cold starts expected (30+ seconds after 15 min inactivity)
- [ ] No Docker used (using Render native Python runtime)

---

## RENDER BACKEND DEPLOYMENT

### Pre-Deployment
- [ ] PostgreSQL database created on Render with name `skin_ai_db`
- [ ] PostgreSQL connection string copied (will be set as DATABASE_URL)
- [ ] Render service configuration reviewed (render.yaml valid)

### Service Configuration
- [ ] Backend service name: `ai-skin-intelligence-api`
- [ ] Python runtime: `3.11`
- [ ] Build command: `pip install -r backend/requirements.txt`
- [ ] Start command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Environment Variables Set
- [ ] `DATABASE_URL` = PostgreSQL connection string
- [ ] `SECRET_KEY` = Generated secure key
- [ ] `ALGORITHM` = `HS256`
- [ ] `ACCESS_TOKEN_EXPIRE_MINUTES` = `43200`
- [ ] `ALLOWED_ORIGINS` = Will set after frontend deployed
- [ ] `GOOGLE_CLIENT_ID` = (Not required - OAuth not implemented)

### Post-Deployment
- [ ] Health endpoint returns 200: `GET /` → `{"message": "Welcome to AI Skin Intelligence Backend!"}`
- [ ] Backend URL noted: `https://ai-skin-intelligence-api.onrender.com`
- [ ] Render logs checked for errors (no `CRITICAL` or `ERROR` messages)
- [ ] Initial request successful (service not crashed on startup)

---

## VERCEL FRONTEND DEPLOYMENT

### Pre-Deployment
- [ ] Vercel account ready
- [ ] Project created in Vercel dashboard
- [ ] Git repository connected to Vercel

### Deployment Configuration
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Install command: `npm install`
- [ ] Node version: `18` or later

### Environment Variables Set
- [ ] `VITE_API_BASE_URL` = Backend URL from Render (e.g., `https://ai-skin-intelligence-api.onrender.com`)

### Post-Deployment
- [ ] Frontend deployed successfully (green status in Vercel)
- [ ] Frontend URL noted: `https://yourproject.vercel.app`
- [ ] Homepage loads without errors
- [ ] No 404s in Network tab for critical resources

### Update Backend CORS
- [ ] Update Render backend `ALLOWED_ORIGINS` environment variable
- [ ] Set to frontend URL: `https://yourproject.vercel.app`
- [ ] Trigger manual redeploy of backend for changes to take effect

---

## SMOKE TESTS (Post-Deployment)

### Authentication Tests
- [ ] **User Registration:** Create new account with email/password
- [ ] **User Login:** Login with created account
- [ ] **JWT Token:** Verify token stored in localStorage
- [ ] **Auto-Logout:** Verify logout clears token and redirects to login

### User Workflow
- [ ] **Dashboard Access:** USER can access `/dashboard/user`
- [ ] **Assessment:** USER can start new assessment
- [ ] **Questionnaire:** USER can fill out health questionnaire
- [ ] **Dashboard Data:** USER dashboard shows assessment history

### Consultant Workflow
- [ ] **Consultant Login:** CONSULTANT can login
- [ ] **Consultant Access:** CONSULTANT can access `/dashboard/consultant`
- [ ] **User List:** CONSULTANT can see list of users
- [ ] **Recommendations:** CONSULTANT can provide recommendations

### Dermatologist Workflow
- [ ] **Dermatologist Login:** DERMATOLOGIST can login
- [ ] **Dermatologist Access:** DERMATOLOGIST can access `/dashboard/dermatologist`
- [ ] **Review Assessments:** DERMATOLOGIST can review user assessments
- [ ] **Provide Analysis:** DERMATOLOGIST can add analysis/recommendations

### Admin Workflow
- [ ] **Admin Login:** ADMIN can login
- [ ] **Admin Access:** ADMIN can access `/dashboard/admin`
- [ ] **View Users:** ADMIN can see user management dashboard
- [ ] **View Analytics:** ADMIN can see application analytics

### Feature Tests
- [ ] **Reports:** User can generate and download reports
- [ ] **Products Page:** Products load from backend
- [ ] **Ingredients:** Ingredient information displays correctly
- [ ] **Notifications:** Notification system works (if enabled)

### Security Tests
- [ ] **CORS Working:** No CORS errors in browser console
- [ ] **Security Headers:** Response headers include security headers
  - [ ] `X-Content-Type-Options: nosniff`
  - [ ] `X-Frame-Options: DENY`
  - [ ] `Content-Security-Policy` present
- [ ] **403 Forbidden:** Unauthorized role access returns 403
- [ ] **401 Unauthorized:** Missing token returns 401

### Expected Known Failures (NOT bugs)
- ⚠️ **Image Assessment:** Will fail if Vision AI models not present (KNOWN LIMITATION)
- ⚠️ **Cold Start:** First request after idle period may take 30+ seconds (Render free tier)
- ⚠️ **Data 404s:** Endpoints return 404 if test user has no assessment data (expected)

---

## ROLLBACK CHECKLIST

### If Critical Issues Found

- [ ] **Option 1 - Revert Render:** Go to Deployments, select previous version, click Deploy
- [ ] **Option 2 - Revert Vercel:** Go to Deployments, select previous version, click Promote
- [ ] **Option 3 - Suspend Service:** Render → Backend → Suspend (stop accepting traffic)
- [ ] **Notify Users:** If extended outage expected

---

## Final Approval

| Role | Sign-Off | Date |
|------|----------|------|
| Developer | ________________ | ________ |
| QA/Tester | ________________ | ________ |
| Operations | ________________ | ________ |

---

## Deployment Notes

**What was deployed:**
- Backend FastAPI application (Module 12.8 + all previous modules)
- Frontend React/Vite application (Module 12.8 + all previous modules)
- PostgreSQL database (Render managed)

**What was NOT deployed:**
- Docker (using Render native Python runtime)
- Google OAuth (not implemented - email/password only)
- Vision AI models (must be provided separately)

**Production Ready:** ✅ YES / ❌ NO

---

**Created: Module 12.8 - Production Release Readiness**
