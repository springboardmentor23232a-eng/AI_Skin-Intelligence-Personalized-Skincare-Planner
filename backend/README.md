# AI Skincare Planner - FastAPI Backend (Module 1: Auth & RBAC)

This is the FastAPI backend for user registration, JWT login, and Google OAuth2 integration with role-based access controls.

---

## 1. Setup Instructions

### Prerequisites
- Python 3.10 or higher
- PostgreSQL running locally with database `skin_intelligence`

### Installation
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create a Python virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - On Windows (Command Prompt):
     ```cmd
     venv\Scripts\activate
     ```
   - On Windows (PowerShell):
     ```powershell
     .\venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

---

## 2. Configuration (Environment Variables)

"Manual Step Required"
1. Copy `.env.example` to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in the placeholders:
   - `DATABASE_URL`: Set to `postgresql://<user>:<password>@localhost:5432/skin_intelligence`.
   - `JWT_SECRET`: Generate a secure key using `openssl rand -hex 32` or similar.
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Add Google OAuth2 values if testing Google SSO.

---

## 3. Running the Server

Start the development server:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.
You can view the interactive Swagger docs at `http://localhost:8000/docs`.
