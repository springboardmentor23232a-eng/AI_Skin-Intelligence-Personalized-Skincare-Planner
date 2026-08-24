## System Architecture & Repository Structure

## Overview
This repository contains the source code for an AI Skin Intelligence & Personalized Skincare Planner. The system leverages Machine Learning to provide personalized skin assessments, intelligent ingredient analysis, and dynamic skincare routines. It features a robust role-based access control (RBAC) architecture, catering to four distinct user types: Patients (Users), Consultants, Dermatologists, and Administrators.

---

## High-Level Architecture

The platform follows a modular, monolithic architecture with clear separation of concerns between the presentation layer (Dashboards), API routing (Backend), and computational modules (AI Engines).

### 1. Presentation Layer (Frontend)
The frontend relies on role-specific HTML views. By compartmentalizing dashboards, the platform ensures secure and isolated user experiences.

*   **`user_dashboard/`**: The patient-facing interface. Includes tools for personal skin assessments, routine planning, ingredient risk analysis, and appointment scheduling.
*   **`dermatologist_dashboard/`**: The clinical interface. Provides deep patient insights, progress tracking, and capabilities for generating formal treatment recommendations.
*   **`consultant_dashboard/`**: The advisor interface. Allows skincare consultants to monitor client progress, manage appointments, and view basic skin reports.
*   **`admin_dashboard/`**: The administrative interface. Handles system reports, account approvals, user management, and overall platform settings.
*   **Root Entry Points**: Role-based landing pages (`index.html`, `admin.html`, `user_dashboard.html`, etc.) route users to their respective environments post-authentication.

### 2. Application Layer (Backend Routers)
The backend routes manage API requests, database interactions, and state management.

*   **`app.py` & `main.py`**: The primary entry points that bootstrap the application and register routing schemas.
*   **`*_router.py`**: Domain-specific API controllers (e.g., `appointments_router.py`, `dermatologist_router.py`, `ingredient_router.py`). These abstract the HTTP request logic away from core application functionality.

### 3. AI & Computation Engines (Machine Learning)
The computational core translates user data (like images and ingredient lists) into actionable intelligence.

*   **`skin_assessment_engine.py`**: Processes uploaded images and survey data to evaluate skin conditions.
*   **`ml_engine.py`**: Houses the primary inference logic and AI models for general predictions.
*   **`ingredient_engine.py`**: Cross-references product compositions against safety databases to flag risks (e.g., allergens, comedogenic ratings).
*   **`routine_engine.py`**: Dynamically generates tailored AM/PM skincare regimens based on the assessment outputs.
*   **`train_model.py`**: An MLOps utility script used to ingest new dataset iterations and re-train the underlying neural networks.

### 4. Data Layer
*   **`DB.sql`**: The master relational database schema. Defines tables for users, appointments, tracking metrics, and ingredient mappings.
*   **`data/`**: The local storage directory used for maintaining the active database (e.g., SQLite) as well as temporary/persistent file storage (such as image uploads).

---

## 📂 Directory Structure

```text
├── admin_dashboard/                # Admin portal HTML interface files
│   ├── account_approvals.html
│   ├── platform_settings.html
│   ├── recommendation_monitoring.html
│   ├── system_reports.html
│   └── user_management.html
├── consultant_dashboard/           # Consultant portal HTML interface files
│   ├── appointments.html
│   ├── client_profiles.html
│   ├── progress_monitoring.html
│   ├── recommendations.html
│   └── skin_reports.html
├── data/                           # Local database store and runtime file storage
├── dermatologist_dashboard/        # Dermatologist portal HTML interface files
│   ├── patient_insights.html
│   ├── progress.html
│   ├── skin_condition_report.html
│   └── treatment_recommendations.html
├── user_dashboard/                 # Patient/User portal HTML interface files
│   ├── appointments.html
│   ├── assessment_history.html
│   ├── checklist.html
│   ├── ingredient_intelligence.html
│   ├── product_recommendations.html
│   ├── progress.html
│   ├── risk_analysis.html
│   ├── routine_planner.html
│   └── skin_assessment.html
├── admin.html                      # Root landing page for Admins
├── app.py                          # Application backend entry point
├── appointments_router.py          # API endpoints for appointments
├── consultant_dashboard.html       # Root landing page for Consultants
├── DB.sql                          # Primary database relational schema definitions
├── dermatologist_dashboard.html    # Root landing page for Dermatologists
├── dermatologist_router.py         # API endpoints for dermatologist logic
├── index.html                      # Core project welcome/login portal
├── ingredient_engine.py            # Computational engine for ingredient analysis
├── ingredient_router.py            # API endpoints for ingredient lookups
├── main.py                         # Secondary or alternative system entry point
├── ml_engine.py                    # Core Machine Learning prediction logic
├── progress_router.py              # API endpoints for user tracking data
├── routine_engine.py               # Computational engine for skin routine builders
├── routine_router.py               # API endpoints for user routines
├── skin_assessment_engine.py       # Core image/data parsing for skin analysis
├── train_model.py                  # Script used to re-train the AI/ML weights
└── user_dashboard.html             # Root landing page for Users
```
architecture.md
Displaying architecture.md.
