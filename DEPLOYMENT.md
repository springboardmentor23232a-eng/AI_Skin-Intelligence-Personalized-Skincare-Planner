# 🌐 Production Deployment Guide

This guide details instructions for deploying the **AI Skin Intelligence & Personalized Skincare Platform** to production environments (AWS ECS, Render, Railway, DigitalOcean).

---

## 🏗️ Production Architecture Overview
- **Database**: Managed PostgreSQL (AWS RDS / Render Postgres / DigitalOcean Managed DB)
- **Backend Service**: Containerized FastAPI app running on Uvicorn behind Gunicorn
- **Frontend SPA**: Containerized NGINX serving static React assets with client-side SPA routing

---

## 🚀 Deployment Instructions

### 1. Render / Railway Deployment
1. **Database**: Create a Managed PostgreSQL Instance and record the `DATABASE_URL`.
2. **Backend**:
   - Create a Web Service pointing to `backend/Dockerfile`.
   - Set environment variables:
     - `DATABASE_URL` = `${POSTGRESQL_URL}`
     - `JWT_SECRET_KEY` = `[Random 64-char Hex]`
     - `JWT_REFRESH_SECRET_KEY` = `[Random 64-char Hex]`
     - `CORS_ORIGINS` = `https://your-frontend.onrender.com`
3. **Frontend**:
   - Create a Web Service pointing to `skin-dashboard/Dockerfile`.
   - Configure NGINX proxy or environment base URL.

### 2. AWS (ECS + RDS + S3 + CloudFront)
1. **Database**: AWS RDS PostgreSQL 16 (Multi-AZ).
2. **Backend Container**: Push `backend/Dockerfile` image to AWS ECR and deploy as an ECS Fargate Task behind an Application Load Balancer (ALB).
3. **Frontend SPA**: Deploy `dist/` build to AWS S3 and serve globally via AWS CloudFront CDN.

---

## 🔒 Security Hardening Checklist
- Ensure `JWT_SECRET_KEY` and `JWT_REFRESH_SECRET_KEY` are populated with secure 256-bit keys.
- Enforce SSL/TLS HTTPS certificates across all domain endpoints.
- Configure CORS origins list to restrict access to trusted domain origins only.
