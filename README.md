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

## 🛠️ PostgreSQL Setup

1. **Start PostgreSQL Service** (Host: `localhost`, Port: `7410`).
2. **Database Credentials**:
   - **Database**: `ai_skincare`
   - **Username**: `postgres`
   - **Password**: `asdfghjkl`
3. **Execute SQL Schema** (Optional - Automatically created by `backend/config/db.js`):
   ```bash
   psql -h localhost -p 7410 -U postgres -d ai_skincare -f database.sql
   ```

---

## ⚙️ Environment Variables (`.env`)

```env
PORT=5000
DB_HOST=localhost
DB_PORT=7410
DB_NAME=ai_skincare
DB_USER=postgres
DB_PASSWORD=asdfghjkl

# JWT Authentication
JWT_SECRET=ai_skincare_super_secret_jwt_key_2026_module1
JWT_EXPIRATION=24h

# Google OAuth2 Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

---

## 💻 Running the Application Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Both Backend & Frontend Concurrently (Recommended)
```bash
npm run dev
```
- **React Frontend**: http://localhost:5173
- **Express Backend API**: http://localhost:5000/api

### 3. Run Backend Only
```bash
npm run server
```

### 4. Run Frontend Only
```bash
npm run client
```

---

## 🔑 Preset Credentials for Testing

| Role | Email | Password | Allowed Dashboards |
| :--- | :--- | :--- | :--- |
| **SUPER ADMIN** | `akp73733@gmail.com` | `#Prem@123` | All Roles & Dashboards |
| **USER** | `john@gmail.com` | `Password@123` | `/user`, `/profile`, `/assessment`, `/wellness` |
| **WELLNESS_COACH** | `coach@wellness.com` | `Password@123` | `/consultant`, `/user`, `/profile` |
| **ADMIN** | `admin@wellness.com` | `Password@123` | `/admin`, `/consultant`, `/user`, `/profile` |

---

## 📑 Postman API Collection

Import the included file `postman_collection.json` into Postman to test:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `GET /api/profile`
- `PUT /api/profile`
