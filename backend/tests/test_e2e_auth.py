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

client = TestClient(app)

def run_e2e_tests():
    print("--- 1. Testing Database & SQLAlchemy Table Creation ---")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    print("Database session initialized successfully.")
    db.close()

    base_url = "/api/auth"

    print("\n--- 2. Testing GET / (Root Health Check) ---")
    res = client.get("/")
    print("Root Health Check Status:", res.status_code, res.json())
    assert res.status_code == 200

    print("\n--- 3. Testing User Registration (USER role) ---")
    user_payload = {
        "full_name": "Test User",
        "email": "user@skincare.com",
        "password": "Password123!",
        "role": "USER"
    }
    res = client.post(f"{base_url}/register", json=user_payload)
    print("User Register Status:", res.status_code)
    if res.status_code == 201:
        data = res.json()
        print("Access Token Generated:", data.get("access_token")[:30] + "...")
        print("User Created in PostgreSQL:", data.get("user"))

    print("\n--- 4. Testing Consultant Registration (SKINCARE_CONSULTANT role) ---")
    consultant_payload = {
        "full_name": "Dr. Sarah Dermatologist",
        "email": "consultant@skincare.com",
        "password": "Password123!",
        "role": "SKINCARE_CONSULTANT"
    }
    res = client.post(f"{base_url}/register", json=consultant_payload)
    print("Consultant Register Status:", res.status_code)

    print("\n--- 5. Testing Admin Registration (ADMIN role) ---")
    admin_payload = {
        "full_name": "System Administrator",
        "email": "admin@skincare.com",
        "password": "Password123!",
        "role": "ADMIN"
    }
    res = client.post(f"{base_url}/register", json=admin_payload)
    print("Admin Register Status:", res.status_code)

    print("\n--- 6. Testing User Login (JWT) ---")
    login_res = client.post(f"{base_url}/login", json={
        "email": "user@skincare.com",
        "password": "Password123!"
    })
    print("Login Status:", login_res.status_code)
    assert login_res.status_code == 200
    login_data = login_res.json()
    token = login_data["access_token"]
    refresh_token = login_data["refresh_token"]

    print("\n--- 7. Testing Protected /me Endpoint ---")
    me_res = client.get(f"{base_url}/me", headers={"Authorization": f"Bearer {token}"})
    print("/me Status:", me_res.status_code)
    print("/me User Profile:", me_res.json())
    assert me_res.status_code == 200

    print("\n--- 8. Testing Refresh Token API ---")
    refresh_res = client.post(f"{base_url}/refresh", json={"refresh_token": refresh_token})
    print("Refresh Token Status:", refresh_res.status_code)
    assert refresh_res.status_code == 200
    print("New Access Token:", refresh_res.json()["access_token"][:30] + "...")

    print("\n--- 9. Testing Google OAuth Login ---")
    import json, base64
    mock_cred = "header." + base64.b64encode(json.dumps({
        "email": "google_test_user@gmail.com",
        "name": "Google Test User",
        "sub": "987654321"
    }).encode()).decode() + ".signature"

    google_res = client.post(f"{base_url}/google", json={
        "credential": mock_cred,
        "role": "USER"
    })
    print("Google Auth Status:", google_res.status_code)
    print("Google User Response:", google_res.json().get("user"))
    assert google_res.status_code == 200

    print("\n--- 10. Testing Logout API ---")
    logout_res = client.post(f"{base_url}/logout")
    print("Logout Response:", logout_res.json())
    assert logout_res.status_code == 200

    print("\nSUCCESS: ALL BACKEND & JWT AUTH API TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_e2e_tests()
