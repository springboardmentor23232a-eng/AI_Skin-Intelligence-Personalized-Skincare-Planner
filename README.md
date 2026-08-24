# 🌟 PanaceaAI — AI Skin Intelligence & Personalized Skincare Planner

> **An AI-powered skincare platform offering multi-parameter skin health analysis, personalized skincare routine planning, role-based dashboards, and consultation management.**

---

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg?logo=nodedotjs)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.19-lightgrey.svg?logo=express)](https://expressjs.com/)
[![Python](https://img.shields.io/badge/Python-v3.10+-blue.svg?logo=python)](https://python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-v0.111-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16-4169E1.svg?logo=postgresql)](https://postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg?logo=docker)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Option A: Docker Compose (Quick Start & Recommended)](#option-a-docker-compose-quick-start--recommended)
  - [Option B: Manual Local Setup](#option-b-manual-local-setup)
- [Default Seed Accounts](#-default-seed-accounts)
- [API Endpoints Reference](#-api-endpoints-reference)
  - [Express Backend Platform (Port 3000)](#express-backend-platform-port-3000)
  - [Skin Assessment Microservice (Port 8000)](#skin-assessment-microservice-port-8000)
- [Environment Variables](#-environment-variables)
- [Running Automated Tests](#-running-automated-tests)
- [License](#-license)

---

## 🚀 Overview

**PanaceaAI** is an end-to-end AI Skin Intelligence & Personalized Skincare Planning platform designed for users, dermatologists, and platform administrators.

It combines a **Node.js Express backend**, a **Vanilla JS/CSS interactive single-page application frontend**, and a **Python FastAPI Skin Assessment Engine microservice** backed by **PostgreSQL**.

---

## ✨ Key Features

### 👤 User Portal
- **AI Skin Health Score (0–100)**: Algorithmic calculation based on 10 skin & lifestyle parameters (hydration, sebum, acne, sensitivity, UV exposure, sleep, stress).
- **Personalized Routine Planner**: AM/PM skincare routines tailored to skin type and active concerns.
- **Scanning & History Tracking**: Timeline analysis with score trends (`Improving`, `Stable`, `Declining`).
- **Consultation Booking**: Schedule virtual or in-person appointments with certified dermatologists.

### 🩺 Dermatologist / Expert Portal
- **Patient Queue Management**: View pending, in-review, and completed consultations.
- **E-Prescriptions & Advice**: Issue custom prescriptions, product recommendations, and routine adjustments.
- **Diagnostic Insights**: Access patient skin assessment breakdown and historical risk factors.

### 🛡️ Admin Control Center
- **User Management**: Approve pending user registrations, manage user roles (`user`, `dermatologist`, `admin`), and toggle account status.
- **Microservices Health Monitor**: Live metrics tracking service uptime, latency, and operational health.
- **Audit & Analytics**: Monitor platform user activity, consultation logs, and system metrics.

---

## 🏗️ System Architecture

```
                               ┌────────────────────────────────┐
                               │     Web Browser Client (SPA)   │
                               │   User / Derm / Admin UI       │
                               └───────────────┬────────────────┘
                                               │
                                 HTTP / REST   │ (Port 3000)
                                               ▼
                               ┌────────────────────────────────┐
                               │ Express Platform API (Node.js)  │
                               │ JWT Auth, OAuth, User/Derm APIs│
                               └───────────────┬────────────────┘
                                               │
                         ┌─────────────────────┴─────────────────────┐
                         │                                           │
                         ▼ (Port 8000)                               ▼ (Port 5432)
       ┌──────────────────────────────────┐        ┌──────────────────────────────────┐
       │ Skin Assessment Engine (FastAPI) │        │     PostgreSQL Database          │
       │ Scoring, Risk Rules, Concerns    │───────►│  Users, Assessments, Consults,   │
       └──────────────────────────────────┘        │  Products, Microservice Logs     │
                                                   └──────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, ES6 Modules | Modern dark-mode responsive glassmorphism SPA |
| **Platform Server** | Node.js (v18+), Express (v4.19) | REST APIs, JWT Auth, Rate Limiting, CORS |
| **AI Assessment Engine** | Python (3.10+), FastAPI, Pydantic | Algorithmic skin scoring, risk rules, taxonomy engine |
| **Database** | PostgreSQL (v16) | Shared relational store with relational schemas |
| **Security** | JWT, BcryptJS, Express-Rate-Limit | Role-Based Access Control (RBAC), OAuth 2.0 |
| **Containerization** | Docker, Docker Compose | Multi-container setup for seamless local & cloud deploy |
| **Testing** | Node test runner, Pytest | Automated integration tests & unit test coverage |

---

## 📁 Project Directory Structure

```
AI_Skin_Project/
├── server/                        # Node.js Express Backend Platform
│   ├── config/                    # DB configuration (pg pool)
│   ├── db/                        # SQL schemas & auto-seed data script
│   ├── middleware/                # JWT verification & RBAC authorization middleware
│   ├── routes/                    # Auth & platform API endpoints
│   └── index.js                   # Express application entry point
├── skin_assessment_engine/        # Python FastAPI Microservice (Module 3)
│   ├── app/                       # FastAPI routes, models, & logic engines
│   ├── tests/                     # Pytest automated test suite
│   ├── Dockerfile                 # Microservice Docker build container
│   ├── requirements.txt           # Python dependencies
│   └── schema.sql                 # Database table schema
├── js/                            # Client-side JavaScript modules
├── css/                           # Global UI stylesheets
├── test/                          # Node.js integration tests
├── Dockerfile                     # Platform web/server Dockerfile
├── docker-compose.yml             # Orchestration for Web, FastAPI, and Postgres
├── index.html                     # Primary SPA entry page
├── package.json                   # Node.js project manifest & scripts
└── README.md                      # Project documentation
```

---

## 🚦 Getting Started

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/) *(Recommended)*
- **OR** for manual local setup:
  - Node.js (v18 or higher)
  - Python (v3.10 or higher)
  - PostgreSQL (v16 or higher)

---

### Option A: Docker Compose (Quick Start & Recommended)

Run the entire application stack (Web Platform, Python FastAPI Microservice, and PostgreSQL Database) with a single command:

```bash
# Clone the repository
git clone https://github.com/your-username/AI_Skin_Project.git
cd AI_Skin_Project

# Start containers in detached mode
docker-compose up --build -d
```

#### Service Access URLs:
- 🌐 **Web Application & Express API**: [http://localhost:3000](http://localhost:3000)
- 🐍 **Skin Assessment Engine (FastAPI Docs)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 🗄️ **PostgreSQL Database**: `localhost:5432` (`panacea_skin_db`)

To stop all running services:
```bash
docker-compose down
```

---

### Option B: Manual Local Setup

#### 1. Setup PostgreSQL Database
Make sure PostgreSQL is running locally and create the database:
```sql
CREATE DATABASE panacea_skin_db;
```

#### 2. Setup Node.js Express Backend
```bash
# Install dependencies
npm install

# Copy environment variables configuration
cp .env.example .env

# Seed database and start Node Express server
npm run db:seed
npm start
```
The Express server will start on [http://localhost:3000](http://localhost:3000).

#### 3. Setup Python FastAPI Engine
Open a new terminal window:
```bash
# Navigate to the Python microservice directory
cd skin_assessment_engine

# Create & activate a virtual environment
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server with Uvicorn
uvicorn app.main:app --reload --port 8000
```
Interactive FastAPI documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 🔑 Default Seed Accounts

The database is pre-populated with test user accounts for all three system roles:

| Role | Username | Password | Email | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **User** | `user` | `user123` | `user@panacea.ai` | User Dashboard, Skin Assessment, Routine Planner |
| **Dermatologist** | `doctor` | `doctor123` | `doctor@panacea.ai` | Dermatologist Dashboard, Patient Consultations |
| **Admin** | `admin` | `admin123` | `admin@panacea.ai` | Admin Control Center, User Approval, Health Monitor |

---

## 🔌 API Endpoints Reference

### Express Backend Platform (Port 3000)

| HTTP Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `POST` | `/api/auth/google` | Public | Google OAuth 2.0 authentication |
| `GET` | `/api/user/profile` | Authenticated | Retrieve current user profile |
| `GET` | `/api/consultations` | User / Derm | List consultations |
| `POST` | `/api/consultations` | User | Create a new consultation request |
| `GET` | `/api/admin/users` | Admin | List all system registered users |
| `PATCH` | `/api/admin/users/:id/approve` | Admin | Approve pending user account |
| `GET` | `/api/health` | Public | Node platform health status check |

### Skin Assessment Microservice (Port 8000)

| HTTP Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/assessment` | Calculate skin health score, risks, & create assessment |
| `GET` | `/assessment` | Retrieve user assessment history |
| `GET` | `/assessment/score` | Get latest overall skin score (0-100) & parameter breakdown |
| `GET` | `/assessment/risks` | Active rule-based risk factor matrix |
| `GET` | `/health` | FastAPI health check & database ping |

---

## ⚙️ Environment Variables

### Root Platform (`.env`)
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/panacea_skin_db
JWT_SECRET=panacea_ai_skin_intelligence_jwt_secret_key_2026_super_secret
JWT_EXPIRES_IN=24h
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Python Engine (`skin_assessment_engine/.env`)
```env
PROJECT_NAME="PanaceaAI Skin Assessment Engine API"
VERSION="1.0.0"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/panacea_skin_db"
JWT_SECRET_KEY="panacea_super_secret_jwt_key_2026_infosys_springboard"
JWT_ALGORITHM="HS256"
```

---

## 🧪 Running Automated Tests

### Node.js Integration Tests
```bash
# Run all Node.js backend & dashboard tests
npm run test:all
```

### Python FastAPI Tests
```bash
cd skin_assessment_engine
python -m pytest tests/ -v
```

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

<p align="center">
  Created by <b>Manish Kumar</b> (Student Email: <a href="mailto:moonknight4550@gmail.com">moonknight4550@gmail.com</a>) for <b>Infosys Springboard Project</b>
</p>
