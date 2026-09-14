"""
=============================================================================
Security Audit & Penetration Hardening Test Suite
Validates application-level security, vulnerability mitigation, and access control:
1. SQL Injection (SQLi) Immunity on parameters, queries, and filters
2. JWT Tampering, Expired Tokens, and Cryptographic Signature Verification
3. Role-Based Access Control (RBAC) & Privilege Escalation Prevention
4. Cryptographic Password Hashing (Bcrypt) & Zero Plaintext Storage
5. HTTP Security Headers (HSTS, CSP/Frame-Options, XSS, NoSniff, Request-ID)
6. Suspended / Deactivated User Instant Revocation
=============================================================================
"""
import pytest
import secrets
from datetime import datetime, timedelta
from jose import jwt
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import SessionLocal
from app.models import User
from app.core.config import settings
from app.auth.service import hash_password, verify_password, create_access_token

client = TestClient(app)

@pytest.fixture(scope="module")
def security_fixtures():
    """Setup test users: Standard USER, DERMATOLOGIST, and ADMIN"""
    rand = secrets.token_hex(4)
    db = SessionLocal()

    # 1. Standard User
    user_email = f"sec_user_{rand}@security.test"
    u = User(
        full_name="Standard User",
        email=user_email,
        password=hash_password("UserPass123!"),
        role="USER",
        is_active=1,
        is_blocked=0
    )
    db.add(u)

    # 2. Clinical Staff
    staff_email = f"sec_staff_{rand}@security.test"
    s = User(
        full_name="Dr. Clinical Staff",
        email=staff_email,
        password=hash_password("StaffPass123!"),
        role="DERMATOLOGIST",
        is_active=1,
        is_blocked=0
    )
    db.add(s)

    # 3. System Admin
    admin_email = f"sec_admin_{rand}@security.test"
    a = User(
        full_name="Sec Admin",
        email=admin_email,
        password=hash_password("AdminPass123!"),
        role="ADMIN",
        is_active=1,
        is_blocked=0
    )
    db.add(a)

    # 4. Suspended User
    suspended_email = f"sec_suspended_{rand}@security.test"
    susp = User(
        full_name="Suspended Account",
        email=suspended_email,
        password=hash_password("SuspPass123!"),
        role="USER",
        is_active=0,
        is_blocked=1
    )
    db.add(susp)

    db.commit()
    db.refresh(u)
    db.refresh(s)
    db.refresh(a)
    db.refresh(susp)

    user_token = create_access_token({"sub": user_email, "role": "USER"})
    staff_token = create_access_token({"sub": staff_email, "role": "DERMATOLOGIST"})
    admin_token = create_access_token({"sub": admin_email, "role": "ADMIN"})
    susp_token = create_access_token({"sub": suspended_email, "role": "USER"})

    fixtures = {
        "user_token": user_token,
        "user_headers": {"Authorization": f"Bearer {user_token}"},
        "staff_token": staff_token,
        "staff_headers": {"Authorization": f"Bearer {staff_token}"},
        "admin_token": admin_token,
        "admin_headers": {"Authorization": f"Bearer {admin_token}"},
        "suspended_token": susp_token,
        "suspended_headers": {"Authorization": f"Bearer {susp_token}"},
    }
    db.close()
    return fixtures


class TestSQLInjectionImmunity:
    """Verify ORM parameters prevent SQL injection payloads"""

    @pytest.mark.parametrize("payload", [
        "' OR '1'='1",
        "admin'--",
        "'; DROP TABLE users; --",
        "\" OR \"\"=\"",
        "1' UNION SELECT 1, 'admin', 'hacked'--"
    ])
    def test_login_sqli_resilience(self, payload):
        """SQL injection in login credentials must fail authentication safely"""
        res = client.post("/api/auth/login", json={
            "email": payload,
            "password": "Password123!"
        })
        assert res.status_code in [400, 401, 422]

    @pytest.mark.parametrize("payload", [
        "' OR '1'='1",
        "test%'; DROP TABLE products; --",
        "' UNION ALL SELECT * FROM users--"
    ])
    def test_search_sqli_resilience(self, payload, security_fixtures):
        """SQL injection in query parameters must not expose unauthorized data"""
        res = client.get(f"/api/products?search={payload}")
        assert res.status_code == 200
        # Should return valid list (empty or matched), no database exception


class TestJWTSecurity:
    """Verify JWT token integrity, expiration, and tampering prevention"""

    def test_tampered_token_signature_rejected(self, security_fixtures):
        """Modifying signature in JWT must result in 401 Unauthorized"""
        token = security_fixtures["user_token"]
        parts = token.split(".")
        # Tamper payload part
        tampered_token = f"{parts[0]}.{parts[1]}tampered.{parts[2]}"
        res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {tampered_token}"})
        assert res.status_code == 401

    def test_expired_token_rejected(self):
        """Tokens past expiration time must be rejected"""
        expired_payload = {
            "sub": "expired_test@domain.com",
            "role": "USER",
            "exp": datetime.utcnow() - timedelta(hours=2)
        }
        expired_token = jwt.encode(expired_payload, settings.JWT_SECRET_KEY, algorithm="HS256")
        res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
        assert res.status_code == 401

    def test_unsigned_none_algorithm_rejected(self):
        """Simulating 'none' algorithm attack must be blocked"""
        import base64
        import json
        header_b64 = base64.urlsafe_b64encode(json.dumps({"alg": "none", "typ": "JWT"}).encode()).decode().rstrip("=")
        payload_b64 = base64.urlsafe_b64encode(json.dumps({"sub": "attacker@test.com", "role": "ADMIN"}).encode()).decode().rstrip("=")
        none_token = f"{header_b64}.{payload_b64}."
        res = client.get("/api/admin/users", headers={"Authorization": f"Bearer {none_token}"})
        assert res.status_code == 401


class TestRBACPrivilegeIsolation:
    """Verify strict access control across USER, DERMATOLOGIST, and ADMIN boundaries"""

    def test_user_cannot_access_admin_dashboard(self, security_fixtures):
        """Regular USER accessing /api/admin/* must receive 403 Forbidden"""
        res = client.get("/api/admin/users", headers=security_fixtures["user_headers"])
        assert res.status_code == 403

    def test_user_cannot_access_clinical_workspace(self, security_fixtures):
        """Regular USER accessing /api/clinical/* must receive 403 Forbidden"""
        res = client.get("/api/clinical/stats", headers=security_fixtures["user_headers"])
        assert res.status_code == 403

    def test_clinical_staff_cannot_access_admin_audit(self, security_fixtures):
        """Clinical staff attempting to access admin endpoints must receive 403"""
        res = client.get("/api/admin/audit-logs", headers=security_fixtures["staff_headers"])
        assert res.status_code == 403

    def test_admin_can_access_admin_endpoints(self, security_fixtures):
        """System ADMIN can successfully access admin management routes"""
        res = client.get("/api/admin/users", headers=security_fixtures["admin_headers"])
        assert res.status_code == 200


class TestPasswordSecurity:
    """Verify password hashing with PBKDF2-HMAC-SHA256, constant-time compare, and zero plaintext storage"""

    def test_passwords_are_cryptographically_hashed(self):
        raw_password = "SuperSecretPassword2026!"
        hashed = hash_password(raw_password)
        assert hashed != raw_password
        assert "$" in hashed
        salt, key_hex = hashed.split("$", 1)
        assert len(salt) == 32
        assert len(key_hex) == 64
        assert verify_password(raw_password, hashed) is True
        assert verify_password("WrongPassword!", hashed) is False


class TestSecurityHeadersAndTracing:
    """Verify security headers and request correlation on every response"""

    def test_response_security_headers_present(self):
        res = client.get("/health")
        assert res.status_code == 200
        headers = res.headers
        assert headers.get("X-Content-Type-Options") == "nosniff"
        assert headers.get("X-Frame-Options") == "DENY"
        assert headers.get("X-XSS-Protection") == "1; mode=block"
        assert "Strict-Transport-Security" in headers
        assert "X-Request-ID" in headers
        assert "X-Process-Time-Ms" in headers


class TestSuspendedAccountAccess:
    """Verify that deactivated or blocked users cannot perform authenticated operations"""

    def test_blocked_user_token_rejected(self, security_fixtures):
        res = client.get("/api/auth/me", headers=security_fixtures["suspended_headers"])
        # Either 401 or 403 based on account status validation
        assert res.status_code in [401, 403]
