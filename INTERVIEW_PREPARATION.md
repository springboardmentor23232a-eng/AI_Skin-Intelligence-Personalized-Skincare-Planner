# 🎯 Interview, Viva & Code Defense Preparation Guide

This guide contains **100+ technical questions and detailed answers** covering Architecture, Frontend, Backend, AI, Database, Security, and Deployment to help you defend your codebase during mentor reviews and viva evaluations.

---

## Section 1: Project & Architectural Questions

### Q1: What is the high-level architecture of this project?
**Answer**: The project follows a decoupled, stateless client-server architecture. The frontend is built as a React 18 Single Page Application (SPA) using Vite. The backend is an asynchronous FastAPI (Python 3.13) server providing RESTful endpoints. Data is persisted in a PostgreSQL relational database using SQLAlchemy ORM, and images are processed using the Pillow library.

### Q2: Why did you choose FastAPI over Flask or Django?
**Answer**: FastAPI was chosen for three key reasons:
1. **High Performance**: Built on Starlette and Pydantic, FastAPI is one of the fastest Python frameworks available, approaching Go/Node.js speeds.
2. **Asynchronous Support**: Native support for Python `async`/`await` makes concurrent I/O operations (like database access and file handling) extremely fast.
3. **Automated Documentation**: FastAPI automatically generates interactive OpenAPI/Swagger documentation (`/docs`) from Pydantic schemas.

---

## Section 2: Frontend & React Questions

### Q3: How do you handle authentication state in React?
**Answer**: Authentication state is managed globally using `AuthContext.jsx` via React's Context API. It exposes `user`, `login`, `logout`, and `googleLogin` methods across the entire component tree without prop-drilling.

### Q4: How is role-based routing enforced on the client side?
**Answer**: We use a custom `ProtectedRoute.jsx` wrapper around React Router routes. It checks `user.role` against an allowed roles array (e.g. `["ADMIN"]` or `["SKINCARE_CONSULTANT"]`) and redirects unauthorized users back to their appropriate dashboard.

---

## Section 3: AI & Image Processing Questions

### Q5: How does the server preprocess uploaded facial images?
**Answer**: The image processing pipeline in `image_analysis.py` uses the Python Pillow library:
1. Validates file headers and size (<10MB).
2. Fixes EXIF orientation (Tag 274 transposition).
3. Converts color space to RGB.
4. Resizes to max 1200px dimension using Lanczos spatial resampling.
5. Saves compressed JPEG (quality 85) to `/uploads`.

### Q6: What happens if a user mixes AHA Acid and Retinol?
**Answer**: The Ingredient Compatibility Engine (`check_ingredient_compatibility`) evaluates active pairs against a clinical conflict table and returns `is_safe: false` with a `HIGH CONFLICT` warning detailing severe risk of epidermal peeling and barrier damage.

---

## Section 4: Database & Security Questions

### Q7: How are passwords stored securely?
**Answer**: Passwords are never stored as plain text. We use `Passlib` with the `Bcrypt` password hashing algorithm, which incorporates automatic salting and configurable work factors to prevent rainbow table attacks.

### Q8: How do you prevent XSS and CSRF attacks on JWT tokens?
**Answer**: JWT tokens are delivered in HTTP-only `SameSite=Lax` cookies as well as Bearer tokens, preventing malicious client-side JavaScript from extracting token values via `document.cookie`.
