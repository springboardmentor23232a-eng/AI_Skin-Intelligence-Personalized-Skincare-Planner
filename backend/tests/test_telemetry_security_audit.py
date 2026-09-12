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
from app.models import User
from app.auth.service import create_access_token

client = TestClient(app)


@pytest.fixture(scope="module")
def telemetry_test_actors():
    db: Session = SessionLocal()
    ts = int(time.time() * 1000)

    # 1. Standard User
    user = User(
        full_name=f"Telem User {ts}",
        email=f"telem_user_{ts}@skincare.com",
        password="hashed_pw",
        role="USER",
        is_active=1
    )
    # 2. Consultant
    consultant = User(
        full_name=f"Telem Consultant {ts}",
        email=f"telem_consultant_{ts}@skincare.com",
        password="hashed_pw",
        role="SKINCARE_CONSULTANT",
        is_active=1
    )
    # 3. Dermatologist
    derm = User(
        full_name=f"Telem Derm {ts}",
        email=f"telem_derm_{ts}@skincare.com",
        password="hashed_pw",
        role="DERMATOLOGIST",
        is_active=1
    )
    # 4. Admin
    admin = User(
        full_name=f"Telem Admin {ts}",
        email=f"telem_admin_{ts}@skincare.com",
        password="hashed_pw",
        role="ADMIN",
        is_active=1
    )

    db.add_all([user, consultant, derm, admin])
    db.commit()

    tokens = {
        "user": create_access_token({"sub": user.email, "role": "USER"}),
        "consultant": create_access_token({"sub": consultant.email, "role": "SKINCARE_CONSULTANT"}),
        "dermatologist": create_access_token({"sub": derm.email, "role": "DERMATOLOGIST"}),
        "admin": create_access_token({"sub": admin.email, "role": "ADMIN"})
    }
    db.close()
    return tokens


def test_telemetry_anonymous_access_rejected():
    """Anonymous external requests must be rejected with 401 Unauthorized"""
    res = client.get("/api/system/telemetry")
    assert res.status_code == 401
    assert "Not authenticated" in res.json().get("detail", "")


def test_telemetry_standard_user_access_forbidden(telemetry_test_actors):
    """Standard USER role must be rejected with 403 Forbidden"""
    headers = {"Authorization": f"Bearer {telemetry_test_actors['user']}"}
    res = client.get("/api/system/telemetry", headers=headers)
    assert res.status_code == 403
    assert "not authorized" in res.json().get("detail", "")


def test_telemetry_consultant_access_forbidden(telemetry_test_actors):
    """Consultant role must be rejected with 403 Forbidden"""
    headers = {"Authorization": f"Bearer {telemetry_test_actors['consultant']}"}
    res = client.get("/api/system/telemetry", headers=headers)
    assert res.status_code == 403
    assert "not authorized" in res.json().get("detail", "")


def test_telemetry_dermatologist_access_forbidden(telemetry_test_actors):
    """Dermatologist role must be rejected with 403 Forbidden"""
    headers = {"Authorization": f"Bearer {telemetry_test_actors['dermatologist']}"}
    res = client.get("/api/system/telemetry", headers=headers)
    assert res.status_code == 403
    assert "not authorized" in res.json().get("detail", "")


def test_telemetry_admin_access_authorized_and_no_secrets_exposed(telemetry_test_actors):
    """ADMIN role must be authorized with 200 OK and response must not leak secrets or private details"""
    headers = {"Authorization": f"Bearer {telemetry_test_actors['admin']}"}
    res = client.get("/api/system/telemetry", headers=headers)
    assert res.status_code == 200
    data = res.json()

    # Core operational metrics present
    assert data["status"] == "operational"
    assert data["service"] == "AI Skin Intelligence Platform"
    assert "uptime_seconds" in data
    assert data["ml_inference"]["model_architecture"] == "EfficientNet-B0"
    assert data["security_features"]["role_based_access_control"] is True

    # Forensic check: Ensure no secrets, tokens, credentials, or private user data are exposed
    json_str = str(data).lower()
    assert "secret" not in json_str or "secret_key" not in json_str
    assert "password" not in json_str
    assert "token" not in json_str
    assert "api_key" not in json_str
    assert "credential" not in json_str
    # Verify no raw host OS build strings (anti-fingerprinting)
    assert "windows-11" not in json_str
    assert "stepping" not in json_str
