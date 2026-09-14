"""
Module 12: API validation & end-to-end workflow testing.

Uses an isolated in-memory SQLite database (via a shared StaticPool connection)
so tests never touch your real Postgres data, and run without any external
services. Run with:  pytest -v   (from the backend/ folder, venv active)
"""
import os

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-secret-key-not-for-production")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

TEST_ENGINE = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=TEST_ENGINE, autoflush=False, autocommit=False)


@pytest.fixture(scope="session", autouse=True)
def _create_tables():
    Base.metadata.create_all(bind=TEST_ENGINE)
    yield
    Base.metadata.drop_all(bind=TEST_ENGINE)


def _override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = _override_get_db


@pytest.fixture()
def client():
    return TestClient(app)


@pytest.fixture()
def auth_headers(client):
    """Registers a fresh user and returns Authorization headers for it."""
    email = "pytest.user@example.com"
    resp = client.post("/api/auth/register", json={
        "full_name": "Pytest User",
        "email": email,
        "password": "TestPass123!",
        "role": "user",
    })
    assert resp.status_code in (201, 400)  # 400 if already registered by a previous test run
    if resp.status_code == 400:
        login = client.post("/api/auth/login", data={"username": email, "password": "TestPass123!"})
        token = login.json()["access_token"]
    else:
        token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
