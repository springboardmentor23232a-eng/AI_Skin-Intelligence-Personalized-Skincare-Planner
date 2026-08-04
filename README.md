# AI Skincare Platform - Module 1 Complete Guide

Developed by **Akash Prajapati**

Personalized Skincare & Skill Assessment Platform integrated with **Node.js, Express.js, PostgreSQL (`pg`), JWT Authentication, Google OAuth2, and Role-Based Access Control (RBAC)**.

---

## 🚀 Module 1 Features Implemented

- ✔ **User Registration** with validation (Name, Email format, Password strength & Phone).
- ✔ **User Login** with BCrypt password comparison & JWT issue.
- ✔ **PostgreSQL Database** connection via `node-postgres (pg)` on port `7410`.
- ✔ **Automatic Users Table Creation** with roles (`USER`, `WELLNESS_COACH`, `ADMIN`) and providers (`LOCAL`, `GOOGLE`).
- ✔ **JWT Authentication** (24h expiry, payload: `id`, `name`, `email`, `role`).
- ✔ **Google OAuth2 Login** flow with automatic user provision.
- ✔ **Role-Based Access Control (RBAC)** middleware enforcing permissions across dashboards:
  - `USER`: User Dashboard (`/user`), Profile (`/profile`), AI Assessment (`/assessment`), Wellness (`/wellness`).
  - `WELLNESS_COACH`: Coach Dashboard (`/consultant`), Assigned Users, Consultation Requests.
  - `ADMIN`: Admin Dashboard (`/admin`), Manage Users, System Analytics.
- ✔ **User Profile Management** APIs (`GET /api/profile` and `PUT /api/profile`) supporting `name`, `email`, `profile_picture`, `bio`, `phone` updates while keeping `role` and `provider` immutable.
- ✔ **Protected Routes & Interceptor** handling automatic logout on 401 token expiration.
- ✔ **Security Best Practices**: BCrypt password hashing, Parameterized SQL queries, Helmet headers, CORS, Express Validator, Morgan Logger.

---

## 🔬 Module 3: Skin Assessment Engine Features Implemented

- ✔ **Python FastAPI Backend Service**: Production-ready, modular architecture (`fastapi_app/`) running on port `8000`.
- ✔ **PostgreSQL Database Schema**: DDL & SQLAlchemy models for `SkinAssessment`, `SkinConcern`, and `RiskFactor` tables.
- ✔ **Rule-Based Skin Assessment Engine**: Accepts 15 clinical & lifestyle parameters (Skin Type, Oiliness, Dryness, Acne, Pigmentation, Redness, Wrinkles, Dark Spots, Sun Exposure, Water Intake, Sleep Hours, Stress Level, Smoking, Alcohol, Age) and generates:
  1. **Skin Health Score (0-100)**
  2. **Overall Condition Rating** (`Excellent`, `Good`, `Moderate`, `Poor`)
  3. **Identified Skin Concerns** with **Severity** (`Low`, `Medium`, `High`) and **Priority** (`Low`, `Medium`, `High`, `Critical`)
  4. **Risk Factors Analysis** with Risk Name, Description, and **Risk Level** (`Low`, `Medium`, `High`, `Critical`)
- ✔ **Full CRUD APIs**:
  - `POST /assessment`: Create & calculate new assessment
  - `GET /assessment`: List assessments (RBAC filtered)
  - `GET /assessment/{id}`: Get detailed assessment by ID
  - `PUT /assessment/{id}`: Update assessment notes, diagnosis, or recommendations
  - `DELETE /assessment/{id}`: Delete assessment (Admin / Owner authorized)
  - `GET /assessment/history`: Chronological user history
  - `GET /assessment/score`: Latest score & condition
  - `GET /assessment/risks`: Latest risk factor breakdown
  - `GET /assessment/stats`: System-wide statistics
- ✔ **JWT Protection & Shared Auth**: Utilizes the shared `JWT_SECRET` for interoperability with logged-in user tokens.
- ✔ **Interactive Dashboards Integration**:
  - **User Dashboard**: Dedicated *Skin Assessment* section with interactive form modal, score gauge, condition tag, concerns breakdown, risk factors analysis, and interactive assessment history table.
  - **Consultant Dashboard**: Allows consultants to review assigned users' assessments, analyze AI results, and save personalized recommendations.
  - **Dermatologist Dashboard**: Clinical portal for reviewing risk analysis and adding medical diagnoses, prescriptions, and treatment notes.
  - **Admin Dashboard**: System administration tab for viewing global assessment stats, inspecting all records, and managing/deleting assessments.
- ✔ **Interactive Swagger Documentation**: Accessible at `http://localhost:8000/docs`.
- ✔ **Containerization & Docker Support**: `Dockerfile` for FastAPI, `Dockerfile.backend` for Express, and multi-container `docker-compose.yml`.
- ✔ **Postman Collection**: `postman_collection_module3.json` provided with pre-configured requests.


