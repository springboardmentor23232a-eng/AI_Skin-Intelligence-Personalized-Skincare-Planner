import json
import base64
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import User

client = TestClient(app)

def test_google_oauth_backend_endpoint():
    """Verify backend Google OAuth endpoint with formatted ID token payload."""
    db = SessionLocal()
    try:
        # Construct valid JWT ID token format with test payload
        header = base64.urlsafe_b64encode(json.dumps({"alg": "RS256", "typ": "JWT"}).encode()).decode().rstrip("=")
        payload = base64.urlsafe_b64encode(json.dumps({
            "iss": "https://accounts.google.com",
            "aud": "test_google_client_id.apps.googleusercontent.com",
            "sub": "109876543210987654321",
            "email": "google_unit_test@skincare.com",
            "email_verified": True,
            "name": "Google OAuth Unit Test User"
        }).encode()).decode().rstrip("=")
        signature = "mock_signature_hash"
        mock_id_token = f"{header}.{payload}.{signature}"

        response = client.post("/api/auth/google", json={
            "credential": mock_id_token
        })

        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == "google_unit_test@skincare.com"
        assert data["user"]["provider"] == "GOOGLE"

        # Verify DB persistence
        db_user = db.query(User).filter(User.email == "google_unit_test@skincare.com").first()
        assert db_user is not None
        assert db_user.provider == "GOOGLE"
    finally:
        db.close()

def test_google_oauth_missing_credential():
    """Verify rejection of empty Google credential payload."""
    response = client.post("/api/auth/google", json={
        "credential": ""
    })
    assert response.status_code == 400
