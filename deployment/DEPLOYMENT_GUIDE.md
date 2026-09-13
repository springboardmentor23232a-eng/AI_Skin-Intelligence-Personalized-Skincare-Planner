# AI Skin Intelligence - Production Deployment Guide

**Target Architecture:** Vercel (Frontend) + Render (Backend) + PostgreSQL  
**Last Updated:** Module 12.7  
**No Docker Required**

---

## Overview

This guide covers deploying the AI Skin Intelligence application to production using:
- **Frontend:** Vercel (React/Vite SPA)
- **Backend:** Render (FastAPI Python service)  
- **Database:** Render PostgreSQL (managed)

The application has been optimized for performance (Module 12.6) with code splitting, lazy loading, and database query optimizations.

---

## Prerequisites

### Accounts Required
1. [Vercel Account](https://vercel.com) (Free tier sufficient)
2. [Render Account](https://render.com) (PostgreSQL requires paid plan ~$7/month)
3. [Google Cloud Console](https://console.cloud.google.com) (for OAuth)
4. GitHub repository with the codebase

### Local Requirements
- Node.js 18+ 
- Python 3.11+
- Git

---

## Deployment Order

**IMPORTANT:** Deploy in this exact order to ensure proper environment variable configuration.

1. [PostgreSQL Database Setup](#1-postgresql-database-setup)
2. [Backend API Deployment](#2-backend-api-deployment)  
3. [Google OAuth Configuration](#3-google-oauth-configuration)
4. [Frontend Deployment](#4-frontend-deployment)
5. [Post-Deployment Testing](#5-post-deployment-testing)

---

## 1. PostgreSQL Database Setup

### Step 1.1: Create Database on Render

1. Log into [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure database:
   ```
   Name: ai_skin_db
   Database: skin_ai_db  
   User: postgres
   Region: Select closest to your users
   PostgreSQL Version: 15 (latest)
   Plan: Starter ($7/month minimum for PostgreSQL)
   ```

4. Click **"Create Database"**
5. **Save the connection details** - you'll need the Database URL

### Step 1.2: Note Database Connection Info

After creation, go to the database dashboard and note:
- **Internal Database URL** (starts with `postgresql://`)
- **External Database URL** (for local testing if needed)

**Example format:**
```
postgresql://postgres:password@host.render.com:5432/skin_ai_db
```

---

## 2. Backend API Deployment

### Step 2.1: Create Backend Service on Render

1. In Render Dashboard, click **"New +"** → **"Web Service"** 
2. Connect your GitHub repository
3. Configure service:
   ```
   Name: ai-skin-intelligence-api
   Region: Same as your database
   Branch: main (or your production branch)
   Runtime: Python 3
   Build Command: pip install -r backend/requirements.txt
   Start Command: cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
   Plan: Starter ($7/month) or higher
   ```

### Step 2.2: Configure Environment Variables

In the service's **Environment** section, add these variables:

| Variable Name | Value | Notes |
|---------------|-------|--------|
| `DATABASE_URL` | _Connect to database_ | Use "Add from Database" → select ai_skin_db |
| `SECRET_KEY` | _Generate strong key_ | See generation instructions below |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `43200` | 30 days token expiry |
| `ALLOWED_ORIGINS` | `https://yourdomain.vercel.app` | Replace with actual Vercel domain |
| `GOOGLE_CLIENT_ID` | _From Google Console_ | Set after Step 3 |

### Step 2.3: Generate SECRET_KEY

**CRITICAL:** Generate a cryptographically strong secret key:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Example output:** `abc123def456ghi789jkl012mno345pqr678stu901vwx234yz`

Copy this value and paste it as the `SECRET_KEY` environment variable in Render.

### Step 2.4: Deploy Backend

1. Click **"Create Web Service"**
2. Wait for deployment to complete (~5-10 minutes)
3. Note your backend URL: `https://ai-skin-intelligence-api.onrender.com`

### Step 2.5: Verify Backend Health

Test the backend is running:
```bash
curl https://ai-skin-intelligence-api.onrender.com
```

Expected response:
```json
{"message": "Welcome to AI Skin Intelligence Backend!"}
```

---

## 3. Google OAuth Configuration

⚠️ **IMPORTANT:** Google OAuth is **NOT currently implemented** in the backend.

The frontend contains placeholder code for Google OAuth, but there is no backend `/auth/google` endpoint. 

**Current Status:**
- ❌ Backend endpoint: MISSING
- ❌ Google auth logic: NOT IMPLEMENTED
- ⚠️ Frontend code: Present but non-functional

**You can skip this step** and use email/password authentication only.

**If you want to implement Google OAuth in the future:**
Contact the development team for implementation of:
1. `/auth/google` backend endpoint
2. Token exchange and user creation logic
3. Google user profile integration

### (Skipped - Not Required for Production)

---

## 4. Frontend Deployment

### Step 4.1: Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure build settings:
   ```
   Framework Preset: Vite
   Root Directory: . (leave empty for root)
   Build Command: npm run build  
   Output Directory: dist
   Install Command: npm install
   ```

### Step 4.2: Configure Environment Variables

In Vercel project settings → **Environment Variables**, add:

| Variable Name | Value | Environment |
|---------------|--------|-------------|
| `VITE_API_BASE_URL` | `https://ai-skin-intelligence-api.onrender.com` | Production |

**Note:** Google OAuth is not currently implemented, so `VITE_GOOGLE_CLIENT_ID` is not required.

### Step 4.3: Update ALLOWED_ORIGINS

**IMPORTANT:** After Vercel deployment, update your Render backend:

1. Go to Render backend service → Environment 
2. Update `ALLOWED_ORIGINS` to your actual Vercel domain:
   ```
   https://ai-skin-intelligence.vercel.app
   ```
3. Trigger a manual deploy to apply changes

### Step 4.4: Deploy Frontend

1. Click **"Deploy"** 
2. Wait for deployment (~2-3 minutes)
3. Your frontend will be available at: `https://projectname.vercel.app`

---

## 5. Post-Deployment Testing

### Step 5.1: Basic Health Checks

**Backend API:**
```bash
curl https://ai-skin-intelligence-api.onrender.com
```

**Frontend:**
- Visit `https://yourdomain.vercel.app`
- Verify homepage loads
- Check browser console for errors

### Step 5.2: Authentication Flow Test

1. **Registration Test:**
   - Go to `/register`
   - Try creating a new account
   - Verify email validation works

2. **Login Test:**
   - Go to `/login` 
   - Test email/password login
   - Test Google OAuth login

3. **Protected Routes Test:**
   - After login, verify dashboard loads
   - Test navigation between protected pages

### Step 5.3: API Connectivity Test

After successful login, verify:
- Dashboard loads user data
- Product recommendations work
- Reports can be generated
- No CORS errors in browser console

### Step 5.4: Database Verification

Check that the database has the correct schema:
1. Connect to Render PostgreSQL using the external URL
2. Verify tables exist:
   ```sql
   \dt
   ```
3. Check the composite index from Module 12.6:
   ```sql
   \d routine_logs
   ```
   Should show `ix_routine_logs_user_date` index

---

## Environment Variables Reference

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `https://api.yourdomain.com` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID | `123.apps.googleusercontent.com` |

### Backend (Render)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `SECRET_KEY` | JWT signing key | `abc123...` (32+ chars) |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry | `43200` (30 days) |
| `ALLOWED_ORIGINS` | CORS allowed origins | `https://yourdomain.vercel.app` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `123.apps.googleusercontent.com` |

---

## Performance Optimizations Included

The deployed application includes **Module 12.6 performance optimizations:**

### Frontend Optimizations
- **Code Splitting:** 37 lazy-loaded chunks instead of single bundle
- **Bundle Size:** Reduced from 585kB to 318kB (45.7% smaller)  
- **Lazy Loading:** Dashboard pages load on-demand
- **Memoization:** Expensive calculations cached

### Backend Optimizations  
- **Database Queries:** N+1 patterns eliminated in 3 endpoints
- **Composite Indexes:** Optimized routine log queries
- **Query Consolidation:** Single queries instead of multiple roundtrips

### Expected Performance
- **Initial Load:** ~97kB gzipped JavaScript
- **Route Navigation:** Instant with lazy loading
- **API Responses:** Faster due to query optimization
- **Build Time:** ~1.7s production build

---

## Security Features Enabled

✅ **Authentication:** JWT token-based with 30-day expiry  
✅ **Authorization:** Role-based access control (RBAC)  
✅ **CORS:** Restricted to frontend domain only  
✅ **Security Headers:** X-Content-Type-Options, X-Frame-Options, CSP, HSTS  
✅ **File Upload Security:** Extension, size, and content validation  
✅ **Input Validation:** Malformed requests rejected  
✅ **Secret Management:** Environment-based, no hardcoded secrets  

---

## Known Limitations

### Vision AI Functionality
**IMPORTANT:** The skin assessment image analysis requires Vision AI model files that are not included in the repository.

**Impact:** 
- Valid image uploads will fail during assessment
- All other functionality works correctly
- Users can complete text-based assessments

**Resolution Options:**
1. **Contact Development Team:** For Vision AI model files
2. **Mock Implementation:** Replace Vision AI with placeholder responses
3. **External API:** Integrate with commercial skin analysis APIs

**Files Affected:**
- `backend/ml/models/vision_model.keras` (missing)
- `backend/ml/models/class_names.json` (missing)

### First-Time Render Deployment
- **Cold Start Delay:** First request may take 30+ seconds after inactivity
- **Auto-Sleep:** Free tier services sleep after 15 minutes of inactivity
- **Solution:** Upgrade to paid tier for production use

---

## Troubleshooting

### Common Issues

**1. CORS Error: "Access to fetch blocked"**
```
Cause: ALLOWED_ORIGINS doesn't include frontend domain
Fix: Update backend ALLOWED_ORIGINS environment variable
```

**2. Authentication Error: "Could not validate credentials"**
```  
Cause: SECRET_KEY mismatch or missing
Fix: Ensure SECRET_KEY is set and consistent
```

**3. Database Connection Error**
```
Cause: DATABASE_URL incorrect or database not running
Fix: Verify DATABASE_URL format and database service status
```

**4. Google OAuth Error**
```
Cause: Vercel domain not authorized in Google Console
Fix: Add actual Vercel domain to authorized origins
```

**5. Build Failure: "Module not found"**
```
Cause: Missing dependencies or import path issues
Fix: Verify all dependencies in package.json/requirements.txt
```

### Debug Steps

**Backend Issues:**
1. Check Render service logs
2. Verify environment variables are set
3. Test database connectivity
4. Check file permissions

**Frontend Issues:**
1. Check browser console for errors
2. Verify Vercel build logs
3. Test API connectivity with browser network tab
4. Verify environment variables in Vercel dashboard

### Support Resources

- **Render Documentation:** [docs.render.com](https://docs.render.com)
- **Vercel Documentation:** [vercel.com/docs](https://vercel.com/docs)
- **FastAPI Documentation:** [fastapi.tiangolo.com](https://fastapi.tiangolo.com)
- **Vite Documentation:** [vitejs.dev](https://vitejs.dev)

---

## Maintenance

### Regular Tasks

**Security:**
- Rotate `SECRET_KEY` quarterly
- Monitor access logs
- Update dependencies regularly

**Performance:**
- Monitor Render service metrics
- Check Vercel build times and bundle sizes
- Review database query performance

**Backup:**
- Render PostgreSQL includes automatic backups
- Export critical data regularly
- Document configuration changes

### Scaling Considerations

**Traffic Growth:**
- Render: Upgrade service tier
- Vercel: Automatic scaling (monitor usage)
- Database: Upgrade PostgreSQL plan

**Feature Additions:**
- Update environment variables as needed
- Monitor bundle size with new features
- Test performance after major changes

---

## Deployment Checklist

### Pre-Deployment
- [ ] Code committed to main branch
- [ ] Frontend build passes locally: `npm run build`
- [ ] Backend imports successfully: `python -c "from app.main import app"`
- [ ] Environment variables documented
- [ ] Google OAuth app configured

### Deployment Steps
- [ ] Create PostgreSQL database on Render
- [ ] Deploy backend service to Render
- [ ] Configure all backend environment variables
- [ ] Verify backend health endpoint
- [ ] Configure Google OAuth with production domains
- [ ] Deploy frontend to Vercel
- [ ] Configure frontend environment variables  
- [ ] Update backend ALLOWED_ORIGINS with Vercel domain
- [ ] Test authentication flow end-to-end
- [ ] Verify all major features work

### Post-Deployment
- [ ] Monitor service health for 24 hours
- [ ] Document any issues encountered
- [ ] Update team with new URLs and credentials
- [ ] Schedule first security review

---

**Deployment Guide Complete**  
**Target Architecture:** ✅ Vercel + Render + PostgreSQL  
**Performance Optimized:** ✅ Module 12.6 included  
**Security Hardened:** ✅ Module 12.5.1 included  
**No Docker Required:** ✅ Platform-native deployment