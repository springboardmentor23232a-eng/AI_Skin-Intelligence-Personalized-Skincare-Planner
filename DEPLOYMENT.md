# 🚀 AI Skin Care Platform - Complete Production Deployment Guide

This document provides step-by-step instructions to take your **AI Skin Care Platform** from local development to a live, publicly accessible web application with a shareable URL (e.g. `https://your-app.vercel.app`).

---

## 📑 Deployment Options

We recommend two primary production deployment methods:

| Deployment Option | Best For | Included Files | Live URL Output |
| :--- | :--- | :--- | :--- |
| **Option A: Vercel + Managed Database (Recommended)** | Fastest setup, global CDN speed | `vercel.json` | `https://ai-skin-intelligence.vercel.app` |
| **Option B: Render.com (1-Click PaaS)** | Easy full-stack container host | `render.yaml` | `https://skin-ai-frontend.onrender.com` |
| **Option C: Docker Compose (VPS / AWS / DigitalOcean)** | Maximum control, self-hosted | `docker-compose.prod.yml` | `https://yourdomain.com` |

---

## 🌐 Option A: Vercel + Cloud Database Deployment (Step-by-Step)

### Step 1: Create a Free Managed PostgreSQL Database
Instead of relying on local PostgreSQL on VS Code, set up a cloud-hosted PostgreSQL database accessible worldwide:

1. Sign up for a free cloud database on **[Neon.tech](https://neon.tech)** or **[Supabase.com](https://supabase.com)** or **[Render.com](https://render.com)**.
2. Create a database named `skin_ai_db`.
3. Copy your database Connection String:
   `postgresql://postgres_user:your_password@ep-cool-pool-12345.us-east-2.aws.neon.tech/skin_ai_db?sslmode=require`

---

### Step 2: Deploy Backend APIs to Render or Railway
Deploy the Express API and FastAPI Engine so they are running 24/7 on the web:

1. Push your repository to **GitHub**.
2. Go to **[Render.com](https://dashboard.render.com)** -> New -> **Blueprint**.
3. Connect your GitHub repository. Render will automatically detect `render.yaml` and provision:
   - Node.js Express API
   - Python FastAPI Engine
   - Cloud PostgreSQL Database
4. Once deployed, Render will provide public HTTPS URLs for your backends:
   - Backend API URL: `https://skin-ai-backend.onrender.com`
   - FastAPI Engine URL: `https://skin-ai-engine.onrender.com`

---

### Step 3: Deploy Frontend to Vercel (Get Your Live Shareable Link!)

1. Install the Vercel CLI or open **[Vercel Dashboard](https://vercel.com/new)**.
2. Connect your GitHub repository.
3. Update `vercel.json` with your live API URLs from Step 2:
   ```json
   {
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "https://skin-ai-backend.onrender.com/api/$1"
       },
       {
         "src": "/engine/(.*)",
         "dest": "https://skin-ai-engine.onrender.com/$1"
       }
     ]
   }
   ```
4. Click **Deploy**.
5. Vercel will generate your live production app link:
   👉 **`https://ai-skin-care.vercel.app`**

🎉 **Anyone on any laptop or phone can now open this link and use your AI Skin Care platform without running VS Code!**

---

## 🐳 Option B: Docker Compose Deployment (Self-Hosted VPS)

If hosting on a Linux server (Ubuntu / Debian / AWS EC2 / DigitalOcean Droplet):

```bash
# 1. Clone repository on server
git clone https://github.com/your-username/AI-Skin-Care.git
cd AI-Skin-Care

# 2. Copy environment file and set secrets
cp .env.example .env

# 3. Start containers in detached mode
docker compose -f docker-compose.prod.yml up -d --build

# 4. Check status
docker compose ps
```

The app will be live at `http://<your-vps-ip>`!

---

## 🔒 Security & Checklist Before Launch

- [x] CORS configuration set to allow origin domains.
- [x] API URLs refactored from hardcoded `127.0.0.1` to dynamic resolution (`js/config.js`).
- [ ] Set a strong `JWT_SECRET` and `SESSION_SECRET` in environment variables.
- [ ] Configure Google OAuth Client ID and Redirect URI in Google Cloud Console (`https://your-backend.com/auth/google/callback`).

---

## 💡 Troubleshooting & Support

- **Database Connection Error**: Verify `DATABASE_URL` includes `?sslmode=require` for Neon/Supabase cloud DBs.
- **CORS Blocked**: Ensure `CORS_ORIGINS` includes your Vercel URL `https://ai-skin-care.vercel.app`.
