# 🗄️ Database Architecture & Schema Specifications

This document outlines the PostgreSQL database schema, table definitions, foreign key relationships, indexes, data types, and Alembic migration practices.

---

## 1. Relational Database Schema Overview

The database is built on **PostgreSQL** using **SQLAlchemy ORM** declarative base models in `backend/app/models.py`.

```
                    +--------------------+
                    |       users        |
                    +--------------------+
                    | id (PK, Serial)    |
                    | email (VARCHAR)    |
                    | password (VARCHAR) |
                    | role (VARCHAR)     |
                    | provider (VARCHAR) |
                    +--------------------+
                              |
       +----------------------+----------------------+----------------------+
       | 1                    | 1                    | 1                    | 1
       | 1                    | *                    | *                    | *
+---------------+      +------------------+   +------------------+   +------------------+
| skin_profiles |      | skin_assessments |   | skincare_routines|   |  image_analyses  |
+---------------+      +------------------+   +------------------+   +------------------+
| id (PK)       |      | id (PK)          |   | id (PK)          |   | id (PK)          |
| user_id (FK)  |      | user_id (FK)     |   | user_id (FK)     |   | user_id (FK)     |
| skin_type     |      | overall_score    |   | routine_type     |   | stored_filename  |
| fitzpatrick   |      | risk_level       |   | steps (JSON)     |   | prediction (JSON) |
+---------------+      +------------------+   +------------------+   +------------------+
```

---

## 2. Table Specifications

### 2.1 Table: `users`
- Stores authentication credentials, full names, roles, and provider types.
- **Indexes**: `id` (PK), `email` (UNIQUE).

### 2.2 Table: `skin_profiles`
- Stores clinical user profiles.
- **Fields**: `id` (PK), `user_id` (FK -> `users.id`), `age`, `skin_type`, `fitzpatrick_scale`, `primary_concern`, `water_intake`.

### 2.3 Table: `image_analyses`
- Stores facial computer vision scans.
- **Fields**: `id` (PK), `user_id` (FK -> `users.id`), `original_filename`, `stored_filename`, `upload_source` (`WEBCAM` / `GALLERY`), `prediction` (JSON metrics dictionary), `confidence` (FLOAT), `processing_time` (FLOAT), `status` (VARCHAR).

### 2.4 Table: `ingredients` & `ingredient_compatibility_checks`
- Stores active chemical directory (`AHA Complex`, `Retinol`, `Niacinamide`, `Salicylic Acid`) and logged user conflict checks.

### 2.5 Table: `skincare_routines` & `skincare_logs`
- Stores generated 5-tier regimens and daily completion logs (`completed`: boolean).

---

## 3. Data Integrity & Constraints
- **Foreign Keys**: All child tables enforce `ON DELETE CASCADE` foreign keys back to `users.id`.
- **Enumerations**: `UserRole` (`USER`, `SKINCARE_CONSULTANT`, `DERMATOLOGIST`, `ADMIN`) and `AuthProvider` (`LOCAL`, `GOOGLE`).
