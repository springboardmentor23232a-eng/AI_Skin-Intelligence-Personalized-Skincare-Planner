# 🛠️ Installation & Local Setup Guide

Follow this step-by-step guide to install, configure, and run the **AI Skin Intelligence & Personalized Skincare Platform** locally.

---

## 📋 Prerequisites
- **Node.js**: v18+ or v20+
- **Python**: v3.10+ or v3.11+
- **PostgreSQL**: v14+ (or running PostgreSQL service on port 5432)
- **Docker & Docker Compose**: (Optional, for containerized execution)

---

## 🚀 Quickstart using Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/your-username/skin-intelligence-platform.git
cd skin-intelligence-platform

# 2. Start the complete container stack (PostgreSQL + FastAPI + Vite NGINX)
docker-compose up --build -d

# 3. Access the application
# Frontend Web App:  http://localhost:80
# Backend API:        http://localhost:8000
# OpenAPI Docs:       http://localhost:8000/docs
```

---

## 🔧 Manual Step-by-Step Installation

### Step 1: PostgreSQL Database Configuration
Create a PostgreSQL database named `skin_db` and verify access:
```sql
CREATE DATABASE skin_db;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE skin_db TO postgres;
```

### Step 2: Backend Setup (FastAPI)
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Alembic Database Migrations
alembic upgrade head

# Start FastAPI development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Step 3: Frontend Setup (React / Vite)
```bash
# Navigate to frontend directory
cd skin-dashboard

# Install npm dependencies
npm install

# Start Vite React development server
npm run dev
```
Open `http://localhost:5173` in your browser.
