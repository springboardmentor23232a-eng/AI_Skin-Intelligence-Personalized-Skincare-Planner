# 🚀 Production Deployment & Environment Configuration Guide

This document provides instructions for deploying the **AI Skin Intelligence Platform** to production servers, configuring environment variables, running background tasks, and deploying with Docker.

---

## 1. Prerequisites & Environment Setup

### Required Runtimes
- **Python**: `v3.11+` / `v3.13`
- **Node.js**: `v18+` / `v20+`
- **PostgreSQL**: `v16+` / `v18`

---

## 2. Local Production Setup

### 2.1 Backend Deployment
1. Navigate to backend folder:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   pip install python-multipart
   ```
3. Set environment variables (`.env`):
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/skincaredb
   SECRET_KEY=your_super_secret_jwt_key_here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   ```
4. Start Uvicorn ASGI production server:
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
   ```

### 2.2 Frontend Build & Deployment
1. Navigate to dashboard folder:
   ```bash
   cd skin-dashboard
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Run Vite production build:
   ```bash
   npm run build
   ```
4. Serve the generated `dist/` production folder using NGINX or static server.

---

## 3. Docker Containerized Deployment

A multi-container setup is available via Docker:

```dockerfile
# backend/Dockerfile
FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt python-multipart
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

To launch with Docker Compose:
```bash
docker-compose up --build -d
```
