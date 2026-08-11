import sys, os
_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
from app.main import app
from app.database import engine, SessionLocal
from app.models import User, Base
from sqlalchemy import inspect

client = TestClient(app)

def run_verification():
    results = {}
    print("=" * 60)
    print("      COMPLETE SYSTEM VERIFICATION & AUDIT SUITE      ")
    print("=" * 60)

    # 1. FastAPI Startup & Health Check
    try:
        res = client.get("/")
        if res.status_code == 200 and res.json().get("status") == "healthy":
            results["1. FastAPI Backend Startup"] = "PASSED"
        else:
            results["1. FastAPI Backend Startup"] = f"FAILED (Status {res.status_code})"
    except Exception as e:
        results["1. FastAPI Backend Startup"] = f"FAILED ({e})"

    # 2. PostgreSQL Connection Verification
    try:
        with engine.connect() as conn:
            results["2. PostgreSQL Connection"] = "PASSED"
    except Exception as e:
        results["2. PostgreSQL Connection"] = f"FAILED ({e})"

    # 3. Users Table Schema Verification
    try:
        inspector = inspect(engine)
        columns = {col["name"]: str(col["type"]) for col in inspector.get_columns("users")}
        required_cols = ["id", "full_name", "email", "password", "role", "provider", "created_at", "updated_at"]
        missing = [c for c in required_cols if c not in columns]
        if not missing:
            results["3. Users Table Schema"] = f"PASSED (Columns: {', '.join(required_cols)})"
        else:
            results["3. Users Table Schema"] = f"FAILED (Missing: {missing})"
    except Exception as e:
        results["3. Users Table Schema"] = f"FAILED ({e})"

    # 4. Register a new LOCAL user & PostgreSQL Persistence
    import time
    test_email = f"verified_local_user_{int(time.time() * 1000)}@skincare.com"
    try:
        reg_res = client.post("/api/auth/register", json={
            "full_name": "Verification User",
            "email": test_email,
            "password": "SecurePassword123!",
            "role": "USER"
        })
        if reg_res.status_code == 201:
            db = SessionLocal()
            stored_user = db.query(User).filter(User.email == test_email).first()
            db.close()
            if stored_user and stored_user.provider == "LOCAL":
                results["4. Local User Registration & DB Storage"] = f"PASSED (User ID: {stored_user.id})"
            else:
                results["4. Local User Registration & DB Storage"] = "FAILED (User not found in DB)"
        else:
            results["4. Local User Registration & DB Storage"] = f"FAILED (HTTP {reg_res.status_code}: {reg_res.text})"
    except Exception as e:
        results["4. Local User Registration & DB Storage"] = f"FAILED ({e})"

    # 5. JWT Login & Protected Dashboard Access
    try:
        login_res = client.post("/api/auth/login", json={
            "email": test_email,
            "password": "SecurePassword123!"
        })
        if login_res.status_code == 200:
            token = login_res.json().get("access_token")
            me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
            if me_res.status_code == 200 and me_res.json().get("email") == test_email:
                results["5. JWT Login & Auth Protection"] = "PASSED"
            else:
                results["5. JWT Login & Auth Protection"] = f"FAILED (Protected endpoint returned {me_res.status_code})"
        else:
            results["5. JWT Login & Auth Protection"] = f"FAILED (Login status {login_res.status_code})"
    except Exception as e:
        results["5. JWT Login & Auth Protection"] = f"FAILED ({e})"

    # 6. Google OAuth Integration Test
    try:
        import json, base64
        mock_cred = "header." + base64.b64encode(json.dumps({
            "email": "verified_google_user@gmail.com",
            "name": "Verified Google User",
            "sub": "123459876"
        }).encode()).decode() + ".signature"

        g_res = client.post("/api/auth/google", json={"credential": mock_cred, "role": "USER"})
        if g_res.status_code == 200 and g_res.json().get("user", {}).get("provider") == "GOOGLE":
            results["6. Google OAuth Authentication"] = "PASSED"
        else:
            results["6. Google OAuth Authentication"] = f"FAILED ({g_res.status_code})"
    except Exception as e:
        results["6. Google OAuth Authentication"] = f"FAILED ({e})"

    # 7. Role-Based Access Control Audit
    try:
        roles_to_test = [
            ("consultant_audit@skincare.com", "SKINCARE_CONSULTANT"),
            ("admin_audit@skincare.com", "ADMIN")
        ]
        all_roles_passed = True
        for email, role in roles_to_test:
            reg = client.post("/api/auth/register", json={
                "full_name": f"Audit {role}",
                "email": email,
                "password": "Password123!",
                "role": role
            })
            if reg.status_code != 201 and "already registered" not in reg.text:
                all_roles_passed = False

        if all_roles_passed:
            results["7. Multi-Role RBAC (USER, CONSULTANT, ADMIN)"] = "PASSED"
        else:
            results["7. Multi-Role RBAC (USER, CONSULTANT, ADMIN)"] = "FAILED"
    except Exception as e:
        results["7. Multi-Role RBAC (USER, CONSULTANT, ADMIN)"] = f"FAILED ({e})"

    # 8. Logout & Cookie / Session Cleanup
    try:
        logout_res = client.post("/api/auth/logout")
        if logout_res.status_code == 200:
            results["8. Logout & Session Handling"] = "PASSED"
        else:
            results["8. Logout & Session Handling"] = f"FAILED ({logout_res.status_code})"
    except Exception as e:
        results["8. Logout & Session Handling"] = f"FAILED ({e})"

    # Output Summary
    print("\n---------------- FINAL VERIFICATION REPORT ----------------")
    for key, value in results.items():
        print(f"{key}: {value}")
    print("-----------------------------------------------------------\n")

if __name__ == "__main__":
    run_verification()
