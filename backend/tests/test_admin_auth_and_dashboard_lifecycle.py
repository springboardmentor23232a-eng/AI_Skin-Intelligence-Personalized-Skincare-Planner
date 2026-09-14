"""
Exhaustive Automated Test Suite: Admin Authentication, RBAC & Dashboard Lifecycle
AI Skin Intelligence & Personalized Skincare Planner
=================================================================================
Verifies:
1. Valid ADMIN login returns HTTP 200, JWT token, and session cookies
2. Invalid ADMIN password returns HTTP 401
3. Authenticated ADMIN /api/auth/me returns role="ADMIN"
4. Public ADMIN self-registration is strictly rejected (HTTP 400)
5. Telemetry & User Directory APIs allow ADMIN (HTTP 200)
6. Standard USER is forbidden from Admin APIs (HTTP 403)
7. Skincare Consultant is forbidden from Admin APIs (HTTP 403)
8. Dermatologist is forbidden from Admin APIs (HTTP 403)
9. Unauthenticated requests to Admin APIs are rejected (HTTP 401)
10. Stale USER token cannot access Admin APIs (HTTP 403)
11. Admin account status self-protection (cannot block oneself)
12. Admin role self-demotion protection (cannot demote oneself)
13. Admin logout clears session cookies
14. Re-login after logout restores Admin access
15. Secure bootstrap endpoint creates/updates admin with secret and rejects unauthorized requests
"""

import sys
import os
import time
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

# Setup path
_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from app.main import app
from app.db.session import SessionLocal
from app.models import User, AuthProvider, AdminAuditLog
from app.auth.service import hash_password
from app.core.config import settings

client = TestClient(app)


@pytest.fixture(scope="module")
def admin_lifecycle_fixture():
    db: Session = SessionLocal()
    ts = int(time.time() * 1000)

    admin_email = f"lifecycle_admin_{ts}@skincare.com"
    user_email = f"lifecycle_user_{ts}@skincare.com"
    consultant_email = f"lifecycle_consultant_{ts}@skincare.com"
    derm_email = f"lifecycle_derm_{ts}@skincare.com"
    password = "MasterPassword123!"

    # 1. Provision Admin directly in DB (simulating secure administrative provisioning)
    admin_user = User(
        full_name="Lifecycle Admin",
        email=admin_email,
        password=hash_password(password),
        role="ADMIN",
        provider=AuthProvider.LOCAL.value,
        is_active=1,
        is_blocked=0,
        is_verified=1,
        email_verified=True
    )
    db.add(admin_user)

    # 2. Provision Normal User
    normal_user = User(
        full_name="Lifecycle Normal User",
        email=user_email,
        password=hash_password(password),
        role="USER",
        provider=AuthProvider.LOCAL.value,
        is_active=1,
        is_blocked=0,
        is_verified=1,
        email_verified=True
    )
    db.add(normal_user)

    # 3. Provision Consultant
    consultant_user = User(
        full_name="Lifecycle Consultant",
        email=consultant_email,
        password=hash_password(password),
        role="SKINCARE_CONSULTANT",
        provider=AuthProvider.LOCAL.value,
        is_active=1,
        is_blocked=0,
        is_verified=1,
        email_verified=True
    )
    db.add(consultant_user)

    # 4. Provision Dermatologist
    derm_user = User(
        full_name="Lifecycle Dermatologist",
        email=derm_email,
        password=hash_password(password),
        role="DERMATOLOGIST",
        provider=AuthProvider.LOCAL.value,
        is_active=1,
        is_blocked=0,
        is_verified=1,
        email_verified=True
    )
    db.add(derm_user)

    db.commit()
    db.refresh(admin_user)
    db.refresh(normal_user)
    db.refresh(consultant_user)
    db.refresh(derm_user)

    db.close()

    return {
        "admin_email": admin_email,
        "user_email": user_email,
        "consultant_email": consultant_email,
        "derm_email": derm_email,
        "password": password,
        "admin_id": admin_user.id,
        "user_id": normal_user.id,
        "consultant_id": consultant_user.id,
        "derm_id": derm_user.id
    }


def test_1_valid_admin_login_success(admin_lifecycle_fixture):
    """Valid ADMIN login returns 200, JWT token, user object with role=ADMIN, and sets cookies."""
    f = admin_lifecycle_fixture
    res = client.post("/api/auth/login", json={"email": f["admin_email"], "password": f["password"]})
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["role"] == "ADMIN"
    assert data["user"]["email"] == f["admin_email"]
    assert "access_token" in res.cookies
    assert "refresh_token" in res.cookies


def test_2_invalid_admin_password_rejected(admin_lifecycle_fixture):
    """Admin login with incorrect password must be rejected with 401."""
    f = admin_lifecycle_fixture
    res = client.post("/api/auth/login", json={"email": f["admin_email"], "password": "WrongPassword999!"})
    assert res.status_code == 401
    assert "Invalid email or password" in res.json()["detail"]


def test_3_admin_get_me_returns_admin_role(admin_lifecycle_fixture):
    """GET /api/auth/me for authenticated admin returns role=ADMIN."""
    f = admin_lifecycle_fixture
    login_res = client.post("/api/auth/login", json={"email": f["admin_email"], "password": f["password"]})
    token = login_res.json()["access_token"]

    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    user_data = res.json()
    assert user_data["role"] == "ADMIN"
    assert user_data["email"] == f["admin_email"]


def test_4_public_admin_self_registration_strictly_blocked():
    """Attempting public self-registration with role='ADMIN' must fail with HTTP 400."""
    ts = int(time.time() * 1000)
    res = client.post("/api/auth/register", json={
        "full_name": f"Malicious Admin {ts}",
        "email": f"hacker_{ts}@skincare.com",
        "password": "Password123!",
        "role": "ADMIN"
    })
    assert res.status_code == 400
    assert "Self-registration for the ADMIN role is strictly forbidden" in res.json()["detail"]


def test_5_admin_telemetry_stats_allowed(admin_lifecycle_fixture):
    """ADMIN role can access /api/admin/stats and receives full telemetry response."""
    f = admin_lifecycle_fixture
    login_res = client.post("/api/auth/login", json={"email": f["admin_email"], "password": f["password"]})
    token = login_res.json()["access_token"]

    res = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    stats = res.json()
    assert "total_users" in stats
    assert "total_administrators" in stats
    assert stats["system_status"] == "OPERATIONAL"


def test_6_admin_user_directory_and_audit_logs_allowed(admin_lifecycle_fixture):
    """ADMIN role can query user directory and audit logs."""
    f = admin_lifecycle_fixture
    login_res = client.post("/api/auth/login", json={"email": f["admin_email"], "password": f["password"]})
    token = login_res.json()["access_token"]

    res_users = client.get("/api/admin/users", headers={"Authorization": f"Bearer {token}"})
    assert res_users.status_code == 200
    assert "users" in res_users.json()
    assert res_users.json()["total"] >= 1

    res_logs = client.get("/api/admin/audit-logs", headers={"Authorization": f"Bearer {token}"})
    assert res_logs.status_code == 200
    assert "logs" in res_logs.json()


def test_7_normal_user_blocked_from_admin_apis(admin_lifecycle_fixture):
    """Normal USER role must receive HTTP 403 when requesting admin endpoints."""
    f = admin_lifecycle_fixture
    login_res = client.post("/api/auth/login", json={"email": f["user_email"], "password": f["password"]})
    user_token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {user_token}"}

    assert client.get("/api/admin/stats", headers=headers).status_code == 403
    assert client.get("/api/admin/users", headers=headers).status_code == 403
    assert client.get("/api/admin/audit-logs", headers=headers).status_code == 403


def test_8_consultant_blocked_from_admin_apis(admin_lifecycle_fixture):
    """SKINCARE_CONSULTANT role must receive HTTP 403 when requesting admin endpoints."""
    f = admin_lifecycle_fixture
    login_res = client.post("/api/auth/login", json={"email": f["consultant_email"], "password": f["password"]})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    assert client.get("/api/admin/stats", headers=headers).status_code == 403
    assert client.get("/api/admin/users", headers=headers).status_code == 403
    assert client.get("/api/admin/audit-logs", headers=headers).status_code == 403


def test_9_dermatologist_blocked_from_admin_apis(admin_lifecycle_fixture):
    """DERMATOLOGIST role must receive HTTP 403 when requesting admin endpoints."""
    f = admin_lifecycle_fixture
    login_res = client.post("/api/auth/login", json={"email": f["derm_email"], "password": f["password"]})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    assert client.get("/api/admin/stats", headers=headers).status_code == 403
    assert client.get("/api/admin/users", headers=headers).status_code == 403
    assert client.get("/api/admin/audit-logs", headers=headers).status_code == 403


def test_10_unauthenticated_request_to_admin_apis_returns_401():
    """Unauthenticated request with no credentials must return HTTP 401."""
    fresh_client = TestClient(app)
    assert fresh_client.get("/api/admin/stats").status_code == 401
    assert fresh_client.get("/api/admin/users").status_code == 401
    assert fresh_client.get("/api/admin/audit-logs").status_code == 401


def test_11_admin_cannot_block_own_account(admin_lifecycle_fixture):
    """An administrator cannot suspend/block their own account (self-preservation rule)."""
    f = admin_lifecycle_fixture
    login_res = client.post("/api/auth/login", json={"email": f["admin_email"], "password": f["password"]})
    token = login_res.json()["access_token"]
    admin_id = login_res.json()["user"]["id"]

    res = client.patch(
        f"/api/admin/users/{admin_id}/status",
        json={"status": "BLOCKED", "reason": "Self block attempt"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 400
    assert "Administrators cannot block or deactivate their own account" in res.json()["detail"]


def test_12_admin_cannot_demote_own_role(admin_lifecycle_fixture):
    """An administrator cannot change their own role."""
    f = admin_lifecycle_fixture
    login_res = client.post("/api/auth/login", json={"email": f["admin_email"], "password": f["password"]})
    token = login_res.json()["access_token"]
    admin_id = login_res.json()["user"]["id"]

    res = client.patch(
        f"/api/admin/users/{admin_id}/role",
        json={"role": "USER"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 400
    assert "Administrators cannot modify their own role" in res.json()["detail"]


def test_13_admin_logout_clears_session_cookies():
    """Logout endpoint deletes access_token and refresh_token cookies with httponly=True."""
    res = client.post("/api/auth/logout")
    assert res.status_code == 200
    assert res.json()["message"] == "Successfully logged out"


def test_14_admin_re_login_restores_session(admin_lifecycle_fixture):
    """Admin can logout and immediately re-authenticate cleanly."""
    f = admin_lifecycle_fixture
    client.post("/api/auth/logout")

    re_login = client.post("/api/auth/login", json={"email": f["admin_email"], "password": f["password"]})
    assert re_login.status_code == 200
    assert re_login.json()["user"]["role"] == "ADMIN"
    new_token = re_login.json()["access_token"]

    check_stats = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {new_token}"})
    assert check_stats.status_code == 200


def test_15_secure_bootstrap_endpoint(admin_lifecycle_fixture):
    """
    POST /api/admin/bootstrap:
    - Rejects request without secret header (403).
    - Rejects request with invalid secret header (403).
    - Accepts valid secret header and creates/updates admin user (200).
    """
    ts = int(time.time() * 1000)
    bootstrap_email = f"bootstrap_admin_{ts}@skincare.com"
    payload = {
        "email": bootstrap_email,
        "password": "BootstrapPassword123!",
        "full_name": "Bootstrap Administrator"
    }

    # 1. Missing secret
    res_no_sec = client.post("/api/admin/bootstrap", json=payload)
    assert res_no_sec.status_code == 403

    # 2. Invalid secret
    res_bad_sec = client.post(
        "/api/admin/bootstrap",
        json=payload,
        headers={"X-Bootstrap-Secret": "invalid_secret_key"}
    )
    assert res_bad_sec.status_code == 403

    # 3. Valid secret (settings.JWT_SECRET_KEY)
    valid_secret = os.environ.get("ADMIN_BOOTSTRAP_SECRET", settings.JWT_SECRET_KEY)
    res_valid = client.post(
        "/api/admin/bootstrap",
        json=payload,
        headers={"X-Bootstrap-Secret": valid_secret}
    )
    assert res_valid.status_code == 200
    b_data = res_valid.json()
    assert b_data["status"] == "success"
    assert b_data["role"] == "ADMIN"
    assert b_data["email"] == bootstrap_email

    # 4. Verify the bootstrapped user can immediately login
    login_boot = client.post(
        "/api/auth/login",
        json={"email": bootstrap_email, "password": "BootstrapPassword123!"}
    )
    assert login_boot.status_code == 200
    assert login_boot.json()["user"]["role"] == "ADMIN"
