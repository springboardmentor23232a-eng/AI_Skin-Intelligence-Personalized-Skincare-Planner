import sys
import os
import time
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from app.main import app
from app.db.session import SessionLocal
from app.models import User, AdminAuditLog, SkinAssessment, SkincareLog, SkincareRoutine

client = TestClient(app)


@pytest.fixture(scope="module")
def setup_test_actors():
    db: Session = SessionLocal()
    ts = int(time.time() * 1000)

    # 1. Register Admin (initial registration as USER, subsequently promoted via DB in accordance with privilege escalation prevention)
    admin_res = client.post("/api/auth/register", json={
        "full_name": f"Admin Actor {ts}",
        "email": f"admin_actor_{ts}@skincare.com",
        "password": "Password123!",
        "role": "USER"
    })
    assert admin_res.status_code == 201
    admin_token = admin_res.json()["access_token"]
    admin_id = admin_res.json()["user"]["id"]

    # 2. Register Standard User A
    user_a_res = client.post("/api/auth/register", json={
        "full_name": f"User A {ts}",
        "email": f"user_a_{ts}@skincare.com",
        "password": "Password123!",
        "role": "USER"
    })
    assert user_a_res.status_code == 201
    user_a_token = user_a_res.json()["access_token"]
    user_a_refresh = user_a_res.json()["refresh_token"]
    user_a_id = user_a_res.json()["user"]["id"]
    user_a_email = user_a_res.json()["user"]["email"]

    # 3. Register Consultant
    consultant_res = client.post("/api/auth/register", json={
        "full_name": f"Consultant Actor {ts}",
        "email": f"consultant_actor_{ts}@skincare.com",
        "password": "Password123!",
        "role": "SKINCARE_CONSULTANT"
    })
    assert consultant_res.status_code == 201

    # 4. Register Dermatologist
    derm_res = client.post("/api/auth/register", json={
        "full_name": f"Derm Actor {ts}",
        "email": f"derm_actor_{ts}@skincare.com",
        "password": "Password123!",
        "role": "DERMATOLOGIST"
    })
    assert derm_res.status_code == 201

    # In accordance with privilege escalation protection, self-registration forces role='USER'.
    # Update roles directly in DB for privileged test actors and re-login to issue valid tokens:
    db.query(User).filter(User.id == admin_id).update({"role": "ADMIN"})
    db.query(User).filter(User.email == f"consultant_actor_{ts}@skincare.com").update({"role": "SKINCARE_CONSULTANT"})
    db.query(User).filter(User.email == f"derm_actor_{ts}@skincare.com").update({"role": "DERMATOLOGIST"})
    db.commit()

    admin_login = client.post("/api/auth/login", json={"email": f"admin_actor_{ts}@skincare.com", "password": "Password123!"})
    admin_token = admin_login.json()["access_token"]

    consultant_login = client.post("/api/auth/login", json={"email": f"consultant_actor_{ts}@skincare.com", "password": "Password123!"})
    consultant_token = consultant_login.json()["access_token"]

    derm_login = client.post("/api/auth/login", json={"email": f"derm_actor_{ts}@skincare.com", "password": "Password123!"})
    derm_token = derm_login.json()["access_token"]

    db.close()

    return {
        "admin_token": admin_token,
        "admin_id": admin_id,
        "user_a_token": user_a_token,
        "user_a_refresh": user_a_refresh,
        "user_a_id": user_a_id,
        "user_a_email": user_a_email,
        "consultant_token": consultant_token,
        "derm_token": derm_token,
    }


def test_rbac_admin_endpoints_denied_for_non_admins(setup_test_actors):
    user_headers = {"Authorization": f"Bearer {setup_test_actors['user_a_token']}"}
    consultant_headers = {"Authorization": f"Bearer {setup_test_actors['consultant_token']}"}
    derm_headers = {"Authorization": f"Bearer {setup_test_actors['derm_token']}"}

    # Standard USER accessing /api/admin/users
    res_user = client.get("/api/admin/users", headers=user_headers)
    assert res_user.status_code == 403

    # Consultant accessing /api/admin/users
    res_consultant = client.get("/api/admin/users", headers=consultant_headers)
    assert res_consultant.status_code == 403

    # Dermatologist accessing /api/admin/users
    res_derm = client.get("/api/admin/users", headers=derm_headers)
    assert res_derm.status_code == 403

    # Unauthenticated accessing /api/admin/users (fresh client with no session cookies)
    unauth_client = TestClient(app)
    res_unauth = unauth_client.get("/api/admin/users")
    assert res_unauth.status_code == 401


def test_admin_user_directory_search_filter(setup_test_actors):
    admin_headers = {"Authorization": f"Bearer {setup_test_actors['admin_token']}"}

    # 1. List users
    res = client.get("/api/admin/users?page=1&page_size=10", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert "users" in data
    assert data["total"] >= 4

    # 2. Search by User A email
    search_res = client.get(f"/api/admin/users?search={setup_test_actors['user_a_email']}", headers=admin_headers)
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert any(u["email"] == setup_test_actors["user_a_email"] for u in search_data["users"])

    # 3. Filter by role
    role_res = client.get("/api/admin/users?role=SKINCARE_CONSULTANT", headers=admin_headers)
    assert role_res.status_code == 200
    role_data = role_res.json()
    assert all(u["role"] == "SKINCARE_CONSULTANT" for u in role_data["users"])


def test_admin_user_detail_view(setup_test_actors):
    admin_headers = {"Authorization": f"Bearer {setup_test_actors['admin_token']}"}
    user_id = setup_test_actors["user_a_id"]

    res = client.get(f"/api/admin/users/{user_id}", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == user_id
    assert data["email"] == setup_test_actors["user_a_email"]
    assert "assessments_count" in data
    assert "routines_count" in data


def test_block_user_and_enforcement(setup_test_actors):
    admin_headers = {"Authorization": f"Bearer {setup_test_actors['admin_token']}"}
    user_id = setup_test_actors["user_a_id"]
    user_email = setup_test_actors["user_a_email"]
    user_token = setup_test_actors["user_a_token"]
    user_refresh = setup_test_actors["user_a_refresh"]

    # 1. Block User A
    block_res = client.patch(f"/api/admin/users/{user_id}/status", json={
        "status": "BLOCKED",
        "reason": "Security verification audit triggered."
    }, headers=admin_headers)
    assert block_res.status_code == 200
    block_data = block_res.json()
    assert block_data["is_blocked"] is True
    assert block_data["blocked_reason"] == "Security verification audit triggered."

    # 2. Confirm blocked user login fails
    login_res = client.post("/api/auth/login", json={
        "email": user_email,
        "password": "Password123!"
    })
    assert login_res.status_code == 403
    assert "suspended" in login_res.json()["detail"].lower()

    # 3. Confirm blocked user refresh-token fails
    refresh_res = client.post("/api/auth/refresh", json={
        "refresh_token": user_refresh
    })
    assert refresh_res.status_code == 403

    # 4. Confirm protected API requests fail for blocked user
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {user_token}"})
    assert me_res.status_code == 403
    assert "suspended" in me_res.json()["detail"].lower()


def test_unblock_user_restores_access(setup_test_actors):
    admin_headers = {"Authorization": f"Bearer {setup_test_actors['admin_token']}"}
    user_id = setup_test_actors["user_a_id"]
    user_email = setup_test_actors["user_a_email"]

    # 1. Unblock User A
    unblock_res = client.patch(f"/api/admin/users/{user_id}/status", json={
        "status": "ACTIVE",
        "reason": "Security review completed; account restored."
    }, headers=admin_headers)
    assert unblock_res.status_code == 200
    unblock_data = unblock_res.json()
    assert unblock_data["is_blocked"] is False

    # 2. Confirm User A can log in again
    login_res = client.post("/api/auth/login", json={
        "email": user_email,
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    new_token = login_res.json()["access_token"]

    # 3. Confirm protected API access restored
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {new_token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == user_email


def test_admin_self_block_prevention(setup_test_actors):
    admin_headers = {"Authorization": f"Bearer {setup_test_actors['admin_token']}"}
    admin_id = setup_test_actors["admin_id"]

    # Attempt to block self
    self_block_res = client.patch(f"/api/admin/users/{admin_id}/status", json={
        "status": "BLOCKED",
        "reason": "Testing self-blocking prevention."
    }, headers=admin_headers)
    assert self_block_res.status_code == 400
    assert "cannot block or deactivate their own account" in self_block_res.json()["detail"].lower()


def test_change_role_and_audit_log(setup_test_actors):
    admin_headers = {"Authorization": f"Bearer {setup_test_actors['admin_token']}"}
    user_id = setup_test_actors["user_a_id"]

    # 1. Promote User A to SKINCARE_CONSULTANT
    role_res = client.patch(f"/api/admin/users/{user_id}/role", json={
        "role": "SKINCARE_CONSULTANT"
    }, headers=admin_headers)
    assert role_res.status_code == 200
    assert role_res.json()["role"] == "SKINCARE_CONSULTANT"

    # 2. Check Audit Log was recorded
    audit_res = client.get(f"/api/admin/audit-logs?target_user_id={user_id}&action=CHANGE_ROLE", headers=admin_headers)
    assert audit_res.status_code == 200
    logs = audit_res.json()["logs"]
    assert len(logs) >= 1
    assert logs[0]["action"] == "CHANGE_ROLE"
    assert logs[0]["previous_value"] == "USER"
    assert logs[0]["new_value"] == "SKINCARE_CONSULTANT"


def test_adherence_analytics_endpoint(setup_test_actors):
    user_token = setup_test_actors["user_a_token"]
    headers = {"Authorization": f"Bearer {user_token}"}

    res = client.get("/api/analytics/adherence", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "daily" in data
    assert "weekly" in data
    assert "monthly" in data
    assert "morning_rate" in data
    assert "evening_rate" in data
    assert "current_streak" in data


def test_improvement_analysis_endpoint(setup_test_actors):
    user_token = setup_test_actors["user_a_token"]
    headers = {"Authorization": f"Bearer {user_token}"}

    res = client.get("/api/analytics/improvements", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "has_sufficient_history" in data
    assert "disclaimer" in data


def test_telemetry_stats_endpoint(setup_test_actors):
    admin_headers = {"Authorization": f"Bearer {setup_test_actors['admin_token']}"}

    res = client.get("/api/admin/stats", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_users"] >= 4
    assert data["total_administrators"] >= 1
    assert data["system_status"] == "OPERATIONAL"
