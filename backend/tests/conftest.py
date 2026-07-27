"""
Pytest fixtures for API tests.

Tests run against a real PostgreSQL database (models use Postgres-specific
UUID/ARRAY column types, so SQLite mocking isn't viable here). Point
TEST_DATABASE_URL at a throwaway database before running:

    createdb skincare_test
    export TEST_DATABASE_URL=postgresql://skincare:skincare@localhost:5432/skincare_test
    pytest
"""
import os
import uuid

import pytest
from fastapi.testclient import TestClient

os.environ.setdefault(
    "DATABASE_URL",
    os.environ.get("TEST_DATABASE_URL", "postgresql://skincare:skincare@localhost:5432/skincare_test"),
)
os.environ.setdefault("SECRET_KEY", "test-secret")
os.environ.setdefault("MONGO_URL", "mongodb://localhost:27017")

from app.main import app  # noqa: E402
from app.database import Base, engine  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client():
    return TestClient(app)


@pytest.fixture()
def registered_user(client):
    email = f"user_{uuid.uuid4().hex[:8]}@example.com"
    password = "pass1234"
    client.post("/api/auth/register", json={
        "full_name": "Test User", "email": email, "password": password, "role": "user",
    })
    res = client.post("/api/auth/login", data={"username": email, "password": password})
    token = res.json()["access_token"]
    return {"email": email, "password": password, "token": token, "headers": {"Authorization": f"Bearer {token}"}}
