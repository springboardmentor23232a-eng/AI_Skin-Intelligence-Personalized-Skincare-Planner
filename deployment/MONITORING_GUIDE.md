# AI Skin Intelligence - Production Monitoring Guide

**Environment:** Vercel (Frontend) + Render (Backend) + PostgreSQL  
**Last Updated:** Module 12.8

---

## Quick Health Checks

### Backend Health Check

**Endpoint:** `GET /` (no authentication required)

**Expected Response (200 OK):**
```json
{
  "message": "Welcome to AI Skin Intelligence Backend!"
}
```

**Test Command:**
```bash
curl https://your-backend-url.onrender.com/
```

### Frontend Health Check

**Test:** Visit `https://your-frontend-url.vercel.app` in browser

**Expected:** Homepage loads without console errors

**Check in DevTools:**
- Console: No red errors
- Network: All resources load successfully
- Application tab: Can see localStorage/cookies

### Database Health Check

**Access Render PostgreSQL Dashboard:**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your PostgreSQL instance
3. Check:
   - **Status:** should show "Available"
   - **Connections:** should be reasonable (< 10 for light usage)
   - **Storage:** monitor free space

**SQL Health Check (if you have external access):**
```sql
SELECT VERSION();
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM assessments;
```

---

## Authentication Monitoring

### JWT Token Health

**Verify JWT secret is set:**
```bash
# In Render dashboard, check that SECRET_KEY exists in Environment
```

**Monitor token failures:**
- Look for `401 Could not validate credentials` in logs
- Usually indicates:
  - Missing JWT secret
  - Token expired (tokens expire after 30 days by default)
  - User session cleared

**Test authentication flow:**
1. Go to frontend login page
2. Create test account or login
3. Verify redirect to dashboard
4. Check browser Network tab: Authorization header present

### RBAC Verification

**Test role-based access:**

**USER role test:**
1. Login as USER
2. Should access: `/dashboard/user`, `/dashboard/user/assessment`, etc.
3. Should NOT access: `/dashboard/consultant`, `/dashboard/dermatologist`

**CONSULTANT role test:**
1. Login as CONSULTANT
2. Should access: `/dashboard/consultant`
3. Should NOT access: `/dashboard/user/assessment` (403 Forbidden)

**Expected 403 response:**
```json
{
  "detail": "Access Denied: Role 'USER' is not authorized to access this resource."
}
```

---

## Error Monitoring

### Log Locations

**Render Backend Logs:**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your backend service
3. Click **"Logs"** tab
4. Monitor for errors in real-time

**What to watch for:**
```
[ERROR] Database connection failed
[ERROR] Image validation or assessment failed
[ERROR] Failed to save permanent image
[ERROR] CORS error
[CRITICAL] SECRET_KEY environment variable is not set
```

**Vercel Frontend Logs:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Deployments** → Select latest
4. Check **"Logs"** for build warnings/errors

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `401 Could not validate credentials` | Bad token or missing SECRET_KEY | Check SECRET_KEY in Render |
| `CORS error: blocked by CORS policy` | Frontend domain not in ALLOWED_ORIGINS | Update ALLOWED_ORIGINS in Render |
| `Database connection refused` | DATABASE_URL wrong or DB down | Verify PostgreSQL status |
| `ModuleNotFoundError: No module named 'app'` | Build command failed | Check requirements.txt, redeploy |
| `GET /uploads/* 404` | Image upload failed or wrong path | Check upload validation logs |

---

## CORS Troubleshooting

### Verify CORS Configuration

**Backend CORS check:**
```bash
curl -H "Origin: https://your-vercel-domain.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS https://your-backend-url.onrender.com/
```

**Expected headers in response:**
```
Access-Control-Allow-Origin: https://your-vercel-domain.vercel.app
Access-Control-Allow-Methods: *
Access-Control-Allow-Headers: *
```

### Fix CORS Issues

**If CORS error in browser:**
1. Check actual frontend domain: Look at browser address bar
2. Go to Render backend → Environment
3. Verify `ALLOWED_ORIGINS` matches exactly (case-sensitive)
4. If using Vercel with custom domain, update ALLOWED_ORIGINS accordingly
5. Trigger manual deploy to apply changes

**Common mistake:** 
- Frontend: `https://myapp.vercel.app`
- ALLOWED_ORIGINS: `https://myapp-production.vercel.app` ❌

---

## JWT/Authentication Troubleshooting

### Token Debugging

**Check if token is present:**
1. Login successfully
2. Open DevTools → Application → LocalStorage
3. Look for `token` or `auth_token` key
4. Should contain JWT (looks like `eyJhbGc...`)

**If token missing:**
- Check Network tab: Did login request return 200?
- Check browser console for errors
- Check backend logs for auth errors

**If token present but still 401:**
- Token may be expired (30-day default)
- SECRET_KEY changed (invalidates all tokens)
- User record was deleted from database
- User role changed mid-session

### Fix Authentication Issues

1. **Clear browser cache:**
   ```javascript
   // In browser console:
   localStorage.clear();
   sessionStorage.clear();
   ```
2. **Logout and re-login**
3. **Check backend SECRET_KEY** in Render environment
4. **Check user exists in database**

---

## Upload/AI Troubleshooting

### Image Assessment Failures

**Common error message:**
```
"Image validation or assessment failed"
or
"Unable to complete and save assessment"
```

**Causes:**
1. **Missing Vision AI models** (KNOWN LIMITATION)
   - Files needed: `backend/ml/models/vision_model.keras`, `class_names.json`
   - Status: NOT included in repository
   - Solution: Contact development team for model files

2. **Invalid file format:**
   - Check upload accepts: .jpg, .jpeg, .png, .webp
   - File too large (max 10MB)
   - Corrupted image file

3. **File permission issues:**
   - Check `/uploads/assessments/` directory is writable
   - Render might have filesystem constraints

**Workaround while Vision AI is missing:**
- Use text-based assessment questionnaire
- Reports can still be generated from questionnaire data
- Product recommendations work without image

---

## Performance Monitoring

### Response Time Monitoring

**Expected response times:**
- Dashboard load: < 2 seconds
- API calls: < 500ms
- Report generation: < 5 seconds
- File upload: < 10 seconds

**Check performance:**

**Vercel Performance:**
1. Dashboard → Project → Monitoring
2. Look for Real Experience Scores (Web Vitals)

**Render Performance:**
1. Dashboard → Service → Metrics
2. Monitor CPU, Memory, Disk usage

### Cold Start Issues (Render)

**Expected behavior:**
- First request after 15+ minutes inactivity: 30+ seconds delay
- Subsequent requests: normal speed
- This is normal on Render free tier

**Monitor for cold starts:**
1. Check Render logs for startup messages
2. Look for `Booting instance` messages
3. Time the first request in morning

**Permanent solution:** Upgrade to Render paid plan ($7/month minimum)

---

## Database Performance Monitoring

### Query Optimization

**Module 12.6 optimizations included:**
- N+1 query patterns eliminated
- Composite index: `ix_routine_logs_user_date`
- Consolidated assessment queries

**Monitor slow queries:**
1. Connect to Render PostgreSQL (if external access enabled)
2. Run:
   ```sql
   -- Current connections
   SELECT datname, usename, application_name, state FROM pg_stat_activity;
   
   -- Table sizes
   SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
   FROM pg_tables WHERE schemaname != 'pg_catalog' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   ```

**Verify composite index:**
```sql
-- Check indexes
\d routine_logs

-- Should show index: ix_routine_logs_user_date
```

---

## Security Monitoring

### Security Headers Check

**Verify headers are present:**
```bash
curl -I https://your-backend-url.onrender.com/
```

**Expected security headers:**
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: ...
Strict-Transport-Security: max-age=31536000 (on HTTPS)
```

### Authentication Security

**Monitor for:**
- Repeated 401 failures (might indicate brute force)
- Failed registrations
- SQL injection attempts (look for quotes in logs)

**Recommended:**
- Set up alerts for suspicious patterns
- Rotate SECRET_KEY periodically
- Monitor access logs for unusual activity

---

## What to Check After Deployment

### Immediate Checks (First Hour)

- [ ] Backend health endpoint returns 200
- [ ] Frontend homepage loads
- [ ] Can create account
- [ ] Can login
- [ ] Dashboard loads with data
- [ ] No console errors

### Daily Monitoring

- [ ] Backend is running (check Render service status)
- [ ] Database is running (check Render PostgreSQL status)
- [ ] No error spikes in logs
- [ ] Performance is acceptable

### Weekly Monitoring

- [ ] Review error logs for patterns
- [ ] Check database disk usage
- [ ] Verify backups are working
- [ ] Test report generation
- [ ] Test assessments (knowing Vision AI limitation)

### Monthly Monitoring

- [ ] Review access logs
- [ ] Check for security issues
- [ ] Update dependencies if needed
- [ ] Verify all features work end-to-end
- [ ] Document any issues

---

## Rollback Procedure

### If Something Breaks

**Option 1: Revert to Previous Deployment (Fast)**

**Render Backend:**
1. Go to Render Dashboard
2. Select backend service
3. Go to Deployments
4. Find previous successful deployment
5. Click "Deploy" next to it
6. Wait for deployment to complete

**Vercel Frontend:**
1. Go to Vercel Dashboard
2. Select project
3. Go to Deployments
4. Find previous successful deployment
5. Click "..." menu → "Promote to Production"

**Time to rollback:** ~2-5 minutes

### Option 2: Emergency Shutdown

**If backend is causing issues:**
1. Render Dashboard → Backend Service
2. Click "Suspend" to stop the service
3. Users will see "Service Unavailable"
4. Debug and redeploy

### Option 3: Database Rollback

**For data corruption:**
1. Contact Render support (PostgreSQL backups available)
2. Request point-in-time restore
3. Restore from previous backup

---

## Monitoring Checklist

Use this checklist for regular monitoring:

### Daily (5 minutes)
- [ ] Backend returns 200 on /
- [ ] Frontend homepage loads
- [ ] No critical errors in logs

### Weekly (15 minutes)
- [ ] All major endpoints work
- [ ] CORS not blocking requests
- [ ] Authentication works end-to-end
- [ ] Reports generate successfully
- [ ] Database responsive

### Monthly (1 hour)
- [ ] Full user workflow test
- [ ] Consultant workflow test
- [ ] Admin workflow test
- [ ] Performance acceptable
- [ ] Security headers present
- [ ] No leftover test data

---

## Support Resources

- **Render Status:** [status.render.com](https://status.render.com)
- **Vercel Status:** [vercel.com/status](https://vercel.com/status)
- **Render Docs:** [docs.render.com](https://docs.render.com)
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **FastAPI Docs:** [fastapi.tiangolo.com](https://fastapi.tiangolo.com)

---

**Monitoring Guide Complete**