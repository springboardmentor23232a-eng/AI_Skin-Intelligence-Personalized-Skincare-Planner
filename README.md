# PanaceaAI — AI Skin Intelligence & Personalized Skincare Planner

> **An enterprise-grade, full-stack AI Skin Intelligence and Telehealth platform featuring multi-parameter cutaneous biomarker analysis, optical lesion classification, personalized skincare routine planning, 30-day progress analytics, docked clinic messaging & Lumina AI assistant, and multi-role clinical synchronization backed by PostgreSQL and FastAPI microservices.**

---

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg?logo=nodedotjs)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.19-lightgrey.svg?logo=express)](https://expressjs.com/)
[![Python](https://img.shields.io/badge/Python-v3.10+-blue.svg?logo=python)](https://python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-v0.111-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v16-4169E1.svg?logo=postgresql)](https://postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg?logo=docker)](https://www.docker.com/)
[![Tests](https://img.shields.io/badge/Tests-106%2F106%20Passing-brightgreen.svg)](test/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features & Modules](#-key-features--modules)
  - [1. User & Patient Portal](#1-user--patient-portal)
  - [2. Progress Tracking & Analytics Lab](#2-progress-tracking--analytics-lab)
  - [3. Clinic Telehealth Messenger & Lumina AI](#3-clinic-telehealth-messenger--lumina-ai)
  - [4. Skincare Consultant & Dermatologist Portals](#4-skincare-consultant--dermatologist-portals)
  - [5. Products Explorer & Dupe Finder Engine](#5-products-explorer--dupe-finder-engine)
  - [6. Optical ML Scanner & Ingredient Safety Checker](#6-optical-ml-scanner--ingredient-safety-checker)
  - [7. Platform Administrator Control Center](#7-platform-administrator-control-center)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Option A: Docker Compose (Quick Start)](#option-a-docker-compose-quick-start)
  - [Option B: Manual Local Setup](#option-b-manual-local-setup)
- [Default Seed Accounts](#-default-seed-accounts)
- [API Endpoints Reference](#-api-endpoints-reference)
  - [Express Backend Platform (Port 3000)](#express-backend-platform-port-3000)
  - [Skin Assessment & Analytics Microservice (Port 8000)](#skin-assessment--analytics-microservice-port-8000)
- [Environment Variables](#-environment-variables)
- [Running Automated Tests](#-running-automated-tests)
- [License & Acknowledgments](#-license--acknowledgments)

---

## 🚀 Overview

**PanaceaAI** is an end-to-end clinical skincare intelligence application designed to bridge the gap between AI diagnostic models, consumers, certified estheticians, and board-certified dermatologists.

It integrates:
- A high-performance **Node.js Express backend** handling JWT authentication, Google OAuth 2.0, PostgreSQL relational persistence, and real-time telehealth chat.
- A **Vanilla JS/CSS SPA frontend** with luxury editorial aesthetics, responsive mobile breakpoints, sticky comparison docks, and docked popup messengers.
- A **Python FastAPI Microservice** executing algorithmic biomarker scoring, ISIC lesion screening, 30-day predictive trajectory forecasting, ingredient contraindication checks, and intelligent product recommendation algorithms.

---

## ✨ Key Features & Modules

### 1. User & Patient Portal
- **Algorithmic Skin Health Score (0–100)**: Multi-parameter weighted score evaluation covering hydration, sebum, acne, barrier resilience, erythema, UV exposure, and stress.
- **Adaptive Routine Engine**: AM/PM chronological regimens, custom routine step creation, and weekly treatment schedules.
- **Granular Data Sharing Matrix**: Patients choose exactly which data modules (Biomarkers, Facial Photos, Routine Adherence, Medical Rx History) are visible to their assigned consultant vs doctor.
- **Consultation Scheduling**: Book live encrypted telehealth or clinic reviews with assigned specialists.

### 2. Progress Tracking & Analytics Lab
- **30-Day Routine Adherence & Compliance Heatmap**: Daily habit compliance calendar tracking morning/evening completion streaks and behavioral consistency.
- **Interactive Before & After Comparison Slider**: Dual-layer visual and biomarker matrix comparing baseline vs current clinical status.
- **30-Day AI Predictive Forecast Curves**: Longitudinal biomarker trajectory modeling with weekly velocity gains and AI clinical verdicts.
- **Biomarker Delta Badges**: Real-time indicators of hydration gain (+26%), barrier strength (+32%), and acne lesion clearance (-71.4%).

### 3. Clinic Telehealth Messenger & Lumina AI
- **Docked Floating Messenger Popup (`#floating-messenger-dock`)**:
  - Omnipresent floating button at bottom-right with an interactive gold pulse dot.
  - Expands into a 380px x 540px docked card with minimize, expand to full-page, contact switching, and typing indicator.
  - 1-click prompt pills for instant queries (`✨ BHA + Adapalene`, `🛡️ Barrier Repair`, `🌅 Routine Order`, `💊 Retinoid Purging`).
- **Dedicated 3-Pane Full-Screen Telehealth Studio (`/chat` route)**:
  - **Left Pane**: Conversations Directory & Contacts Roster with search and category filters (*All*, *Care Team*, *Lumina AI*).
  - **Center Pane**: Active Message Stream with encrypted message cards, read receipts (`✓✓`), audio voice note simulator, and photo attachments.
  - **Right Pane**: Live Cutaneous Telemetry Snapshot, active digital prescriptions (Rx), and 1-click video telehealth booking.
- **Lumina AI Skincare Copilot**:
  - Context-aware engine evaluating active acid/retinoid contraindications, barrier repair guidelines, acne care, and specialist triage in real time.

### 4. Skincare Consultant & Dermatologist Portals
- **Zero-Fake Data Synchronization**: Active patient rosters derived directly from PostgreSQL database records.
- **Interactive Clinical Patient Dossier**:
  - Tab 1: 8-Cutaneous Biomarkers & Optical ISIC Lesion Screening.
  - Tab 2: 30-Day Longitudinal Progress & Routine Compliance Heatmaps.
  - Tab 3: Board-Certified Medical Prescriptions (Rx) and Esthetician Regimen Builder Notes.
- **RBAC Privacy Redactions**: Automatically redacts confidential medical prescriptions or sensitive photos if restricted by the patient.

### 5. Products Explorer & Dupe Finder Engine
- **Master 20+ Curated Products Catalog**: Real-world e-commerce links (Amazon, Nykaa, Flipkart), active ingredients, and suitability matching badges.
- **Sticky Compare Floating Dock**: Select up to 4 formulations and launch a side-by-side ingredient and clinical matrix modal.
- **Smart Dupe & Alternative Finder**: Instant recommendations for budget-friendly alternatives, fragrance-free options, and high-potency upgrades.

### 6. Optical ML Scanner & Ingredient Safety Checker
- **Optical Skin Photo Analyzer & Live Webcam Scan**: Automated facial biomarker extraction and ISIC binary lesion risk screening with progress bar animation.
- **Ingredient Contraindication Matrix**: Analyze chemical safety and compatibility when layering actives (e.g. Vitamin C + Retinol, BHA + Adapalene).

### 7. Platform Administrator Control Center
- **User Account Management**: Admin verification and approval for newly registered accounts, role elevation, and user deletion.
- **Microservices Layer Monitor**: Live telemetry for 12 microservice endpoints across ports 3000 and 8000.
- **Security & Audit Trail**: Real-time system access and security logs.

---

## 🏗️ System Architecture

```
                               ┌──────────────────────────────────────────────┐
                               │       Web Browser Client (Modern SPA)        │
                               │  User / Consultant / Dermatologist / Admin   │
                               └──────────────────────┬───────────────────────┘
                                                      │
                                        HTTP / REST   │ (Port 3000)
                                                      ▼
                               ┌──────────────────────────────────────────────┐
                               │       Express Platform Server (Node.js)      │
                               │  - JWT Auth, RBAC Guards, Google OAuth 2.0   │
                               │  - Multi-Role Clinic Telehealth Chat Stream  │
                               │  - Lumina AI Real-Time Skincare Engine       │
                               │  - Clinical Patient Dossiers & Sharing Matrix│
                               └──────────────┬───────────────────────────────┘
                                              │
                        ┌─────────────────────┴─────────────────────┐
                        │                                           │
                        ▼ (Port 8000)                               ▼ (Port 5432)
      ┌───────────────────────────────────┐       ┌───────────────────────────────────┐
      │  FastAPI Analytics Microservice   │       │        PostgreSQL Database        │
      │  - Cutaneous Biomarker Scoring    │──────►│  - users & user_profiles          │
      │  - ISIC Optical Lesion Classifier │       │  - assessments & biomarkers       │
      │  - 30-Day Progress & Adherence    │       │  - clinical_records & sharing_pref│
      │  - Ingredient Safety & Dupes      │       │  - chat_messages & appointments   │
      │  - Telehealth Chat Microservice   │       │  - master_products_catalog        │
      └───────────────────────────────────┘       └───────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend UI** | HTML5, Vanilla CSS3, ES6 Modules | Editorial luxury design, glassmorphism, docked floating messenger, zero external UI frameworks |
| **Platform Server** | Node.js (v18+), Express (v4.19) | REST APIs, JWT Auth, Bcrypt password hashing, Telehealth Chat APIs, RBAC Middleware |
| **Microservices Engine** | Python (3.10+), FastAPI, Pydantic | Quantitative cutaneous scoring, ISIC lesion screening, Progress forecast engine, Chat router |
| **Database** | PostgreSQL (v16) / In-Memory Pool | Multi-table relational schema with auto-seeding engine and real-world clinical records |
| **Security & Auth** | JWT, BcryptJS, Google OAuth 2.0 | Role-based authorization, unauthenticated action interception, and seamless redirect handling |
| **Testing** | Node test runner, Pytest | 106 automated tests across Node.js and Python microservices with 100% pass rate |

---

## 📁 Project Directory Structure

```
AI_Skin_Project/
├── server/                           # Node.js Express Backend Platform
│   ├── config/                       # DB configuration (pg pool & in-memory fallback)
│   ├── db/                           # SQL schemas (schema.sql) & seed engine (seed.js)
│   ├── middleware/                   # JWT verification & RBAC authorization middleware
│   ├── routes/                       # Auth, Clinical Sync, Telehealth Chat, & Admin routes
│   └── index.js                      # Express application entry point
├── skin_assessment_engine/           # Python FastAPI Microservice
│   ├── app/                          # FastAPI application package
│   │   ├── routers/                  # Assessment, Clinical, Progress, & Chat routers
│   │   ├── services/                 # Biomarker scoring, Progress analytics, & ML models
│   │   ├── models.py & schemas.py    # Pydantic validation models
│   │   └── main.py                   # FastAPI app mount
│   ├── tests/                        # Pytest automated test suite (50 tests)
│   ├── requirements.txt              # Python dependencies
│   └── schema.sql                    # Microservice database schema
├── js/                               # Frontend ES6 Client Modules
│   ├── api.js                        # Unified API client for Express (3000) & FastAPI (8000)
│   ├── app.js                        # Main SPA orchestrator, auth guards, messenger controller
│   ├── auth.js                       # Client-side session and role management
│   ├── dashboards.js                 # HTML view renderers (User, Consultant, Doctor, Admin, Chat)
│   └── mockData.js                   # Clinical fallback datasets and quotes
├── css/                              # Global Styling & Component Systems
│   └── style.css                     # Vanilla CSS styling with luxury dark & editorial themes
├── test/                             # Node.js Automated Test Suites (56 tests)
│   ├── dashboard.test.js             # View rendering & formula tests
│   ├── server.test.js                # Auth, JWT, & RBAC tests
│   ├── routine.test.js               # Personalized routine planner tests
│   ├── products.test.js              # Products catalog & comparison tests
│   ├── progress.test.js              # Progress analytics & adherence tests
│   ├── clinical_sync.test.js         # Multi-role dossier sync tests
│   ├── consultation_sharing.test.js  # Patient privacy & sharing matrix tests
│   └── chat.test.js                  # Telehealth chat & Lumina AI tests
├── assets/                           # Product imagery, logos, and medical icons
├── Dockerfile                        # Platform Web/Server container
├── docker-compose.yml                # Multi-container orchestration (Node, FastAPI, Postgres)
├── index.html                        # Primary SPA entry page
├── package.json                      # Node.js manifest & scripts
└── README.md                         # Project documentation
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

### Option A: Docker Compose (Quick Start)

Run the complete multi-tier system with a single command:

```bash
# Clone repository
git clone https://github.com/springboardmentor23232a-eng/AI_Skin-Intelligence-Personalized-Skincare-Planner.git
cd AI_Skin-Intelligence-Personalized-Skincare-Planner

# Start containers in detached mode
docker-compose up --build -d
```

#### Service Access URLs:
- 🌐 **Web Platform & Express API**: [http://localhost:3000](http://localhost:3000)
- 🐍 **FastAPI Skin Assessment & Chat Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 🗄️ **PostgreSQL Relational Database**: `localhost:5432` (`panacea_skin_db`)

To stop all services:
```bash
docker-compose down
```

---

### Option B: Manual Local Setup

#### 1. Setup PostgreSQL Database
```sql
CREATE DATABASE panacea_skin_db;
```

#### 2. Setup Node.js Express Backend
```bash
# Install dependencies
npm install

# Start Express server (auto-seeds database on start)
npm start
```
The server will run on [http://localhost:3000](http://localhost:3000).

#### 3. Setup Python FastAPI Engine
In a separate terminal:
```bash
cd skin_assessment_engine

# Create & activate virtual environment
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Start FastAPI microservice
uvicorn app.main:app --reload --port 8000
```
Interactive API documentation will be live at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 🔑 Default Seed Accounts

The platform includes pre-seeded accounts for all system roles:

| Role | Username | Password | Email | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **User / Patient** | `user` | `user123` | `user@panacea.ai` | User Dashboard, Skin Assessment, Progress Lab, Chat & Lumina AI |
| **Skincare Consultant** | `consultant` | `consultant123` | `consultant@panacea.ai` | Consultant Workspace, Client Roster, Regimen Builder Notes |
| **Dermatologist Doctor** | `doctor` | `doctor123` | `doctor@panacea.ai` | Clinical Portal, Patient Dossiers, Prescription (Rx) Authorization |
| **Platform Administrator** | `admin` | `admin123` | `admin@panacea.ai` | System Control Center, User Verification, Microservices Monitor |

---

## 🔌 API Endpoints Reference

### Express Backend Platform (Port 3000)

| HTTP Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account (submits for admin approval) |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `POST` | `/api/auth/google` | Public | Google OAuth 2.0 credential verification |
| `GET` | `/api/clinical/consultant/clients` | Consultant | Get synchronized client roster |
| `GET` | `/api/clinical/dermatologist/patients` | Doctor | Get synchronized medical patient roster |
| `GET` | `/api/clinical/patient-dossier/:userId` | Clinicians | Retrieve full patient medical dossier (with RBAC redactions) |
| `POST` | `/api/clinical/consultant/update-regimen` | Consultant | Save esthetician regimen notes |
| `POST` | `/api/clinical/dermatologist/update-prescription` | Doctor | Authorize and sign medical prescription (Rx) |
| `GET` | `/api/clinical/user/sharing-preferences` | User | Retrieve data sharing permissions matrix |
| `POST` | `/api/clinical/user/sharing-preferences` | User | Update consent permissions for care team |
| `POST` | `/api/clinical/user/book-consultation` | User | Schedule telehealth appointment |
| `GET` | `/api/chat/conversations` | Authenticated | Retrieve user conversation channels |
| `GET` | `/api/chat/messages` | Authenticated | Retrieve message history for active contact |
| `POST` | `/api/chat/send` | Authenticated | Send message (triggers Lumina AI reply if recipient is AI) |
| `POST` | `/api/chat/mark-read` | Authenticated | Mark channel messages as read |
| `GET` | `/api/admin/users` | Admin | List all platform registered users |
| `PUT` | `/api/admin/users/:id/approve` | Admin | Approve pending user account |

### Skin Assessment & Analytics Microservice (Port 8000)

| HTTP Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/assessment` | Calculate 8-biomarker score, risk rules, and save assessment |
| `GET` | `/assessment/history` | Retrieve historical assessment timeline |
| `POST` | `/progress/log` | Record longitudinal progress checkpoint |
| `GET` | `/progress/history/{userId}` | Retrieve 30-day progress history |
| `GET` | `/progress/adherence/{userId}` | Calculate habit adherence percentage and streak |
| `POST` | `/progress/compare` | Dual-checkpoint Before & After comparison verdict |
| `GET` | `/progress/trends/{userId}` | 30-day predictive trajectory curve generation |
| `POST` | `/ingredient/analyze` | Active chemical contraindication and safety checker |
| `POST` | `/product/recommend` | Suitability scoring engine for product catalog |
| `POST` | `/product/compare` | Side-by-side formulation matrix generator |
| `GET` | `/chat/conversations` | FastAPI chat conversation channels |
| `POST` | `/chat/send` | Send message & generate Lumina AI response |
| `GET` | `/health` | Microservice health check and DB ping |

---

## ⚙️ Environment Variables

### Root Platform (`.env`)
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/panacea_skin_db
JWT_SECRET=panacea_ai_skin_intelligence_jwt_secret_key_2026_super_secret
JWT_EXPIRES_IN=24h
GOOGLE_CLIENT_ID=435046043372-n2nmis20orleg8q57rh6o0muo7qpi0c3.apps.googleusercontent.com
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

Run the complete test suites to verify platform integrity:

### 1. Node.js Express & Database Test Suite (56 Tests)
```bash
npm run test:all
```
*Executes all unit, RBAC security, routine, product comparison, progress tracking, clinical sync, and telehealth chat tests.*

### 2. Python FastAPI Microservice Test Suite (50 Tests)
```bash
cd skin_assessment_engine
python -m pytest tests/ -v
```
*Executes all scoring algorithm, ISIC classifier, progress analytics, ingredient contraindication, and chat engine tests.*

**Overall Pass Rate**: **106 / 106 Tests Passing (100%)**

---

## 📄 License & Acknowledgments

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

<p align="center">
  <b>PanaceaAI</b> — Developed by <b>Manish Kumar</b> for <b>Infosys Springboard Project</b><br>
  Contact: <a href="mailto:moonknight4550@gmail.com">moonknight4550@gmail.com</a>
</p>
