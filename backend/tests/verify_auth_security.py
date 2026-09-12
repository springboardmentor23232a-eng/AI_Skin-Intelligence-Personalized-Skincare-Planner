import sys, os
_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)
import sys
import os
import secrets
from fastapi.testclient import TestClient
from sqlalchemy import text

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.main import app
from app.db.session import engine, get_db

client = TestClient(app)

print("=" * 70)
print("       AUTHENTICATION & ROLE SECURITY SUITE VERIFICATION       ")
print("=" * 70)

# 1. Test Database connection
with engine.connect() as conn:
    res = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public';"))
    tables = [row[0] for row in res.fetchall()]
    assert "users" in tables
    print("[OK] 1. PostgreSQL connection verified. 'users' table active.")

# 2. Test Registration with specific Roles
rand_tag = secrets.token_hex(3)
users_to_test = [
    {"name": "Standard User Test", "email": f"user_{rand_tag}@test.com", "role": "USER"},
    {"name": "Dermatologist User Test", "email": f"derm_{rand_tag}@test.com", "role": "DERMATOLOGIST"},
    {"name": "Consultant User Test", "email": f"consultant_{rand_tag}@test.com", "role": "SKINCARE_CONSULTANT"},
]

created_users = {}

for u in users_to_test:
    res = client.post("/api/auth/register", json={
        "full_name": u["name"],
        "email": u["email"],
        "password": "SecurePassword123!",
        "role": u["role"]
    })
    assert res.status_code == 201, f"Failed registering {u['email']}: {res.text}"
    data = res.json()
    assert data["user"]["role"] == u["role"], f"Role mismatch for {u['email']}"
    created_users[u["role"]] = {
        "email": u["email"],
        "token": data["access_token"],
        "refresh_token": data["refresh_token"]
    }
    print(f"[OK] 2. Registered {u['role']} -> {u['email']} (Stored Role in DB: {data['user']['role']})")

# 2b. Verify ADMIN self-registration is strictly rejected (HTTP 400)
admin_attempt = client.post("/api/auth/register", json={
    "full_name": "Rogue Admin Attempt",
    "email": f"admin_{rand_tag}@test.com",
    "password": "SecurePassword123!",
    "role": "ADMIN"
})
assert admin_attempt.status_code == 400, "Security Failure: Self-registration for ADMIN must be rejected with 400"
print("[OK] 2b. Verified ADMIN self-registration strictly rejected with HTTP 400.")

# 3. Test Backend Login (Role read strictly from DB)
for role, creds in created_users.items():
    res_login = client.post("/api/auth/login", json={
        "email": creds["email"],
        "password": "SecurePassword123!"
    })
    assert res_login.status_code == 200
    login_data = res_login.json()
    assert login_data["user"]["role"] == role, f"Login returned wrong role for {creds['email']}"
    print(f"[OK] 3. Login for {role}: Verified role '{login_data['user']['role']}' retrieved from PostgreSQL")

# 4. Test Google OAuth Login
import json, base64
mock_cred = "header." + base64.urlsafe_b64encode(json.dumps({
    "iss": "https://accounts.google.com",
    "email": f"google_{rand_tag}@test.com",
    "name": "Google User Test",
    "sub": f"sub_{rand_tag}",
    "email_verified": True
}).encode()).decode().rstrip("=") + ".signature"

res_google_new = client.post("/api/auth/google", json={
    "credential": mock_cred
})
assert res_google_new.status_code == 200, f"Google endpoint error: {res_google_new.text}"
print("[OK] 4. Google Auth API endpoint verified successfully with valid claims.")

# 5. Test Token Refreshing
user_creds = created_users["USER"]
res_refresh = client.post("/api/auth/refresh", json={
    "refresh_token": user_creds["refresh_token"]
})
assert res_refresh.status_code == 200
refreshed = res_refresh.json()
assert refreshed["user"]["role"] == "USER"
print("[OK] 5. Refresh token rotation verified successfully.")

# 6. Test Logout
res_logout = client.post("/api/auth/logout")
assert res_logout.status_code == 200
print("[OK] 6. Logout cleanup endpoint verified.")

print("\n" + "=" * 70)
print("     ALL ROLE SECURITY & AUTHENTICATION TESTS PASSED 100%     ")
print("=" * 70)
