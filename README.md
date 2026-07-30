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

