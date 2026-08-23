import pytest
import os
import jwt
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Set testing environment variables before importing app
os.environ["DATABASE_URL"] = "sqlite:///./test_skin_assessment.db"

from app.main import app
from app.database import Base, get_db
from app.config import settings
from app.services.scoring_engine import calculate_skin_health_score
from app.services.concern_engine import identify_and_prioritize_concerns
from app.services.risk_engine import evaluate_risk_factors

# Test SQLite Engine Setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_skin_assessment.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_and_teardown_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def auth_headers():
    token = jwt.encode(
        {"id": 1, "username": "test_user", "role": "user"},
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    return {"Authorization": f"Bearer {token}"}

client = TestClient(app)


# --- Unit Tests for Engines ---

def test_scoring_engine_extended_criteria():
    data = {
        "hydration_level": 75.0,
        "oiliness_level": 50.0,
        "sensitivity_level": 15.0,
        "acne_severity": 5.0,
        "pigmentation_score": 10.0,
        "wrinkles_score": 5.0,
        "sun_exposure_hours": 1.5,
        "spf_frequency": "Daily",
        "sleep_hours": 8.0,
        "stress_level": 2,
        "climate_environment": "Temperate & Balanced",
        "water_intake_liters": 2.5,
        "exfoliation_frequency": "1-2 Times/Week",
        "fitzpatrick_phototype": "Type III (Medium)",
        "makeup_usage": "Light Minimal Makeup",
        "primary_skin_goal": "Barrier Repair & Hydration"
    }
    score, condition, breakdown = calculate_skin_health_score(data)
    assert score >= 85.0
    assert condition == "Optimal Skin Condition"
    assert len(breakdown["breakdown"]) == 5
    assert "clinical_recommendation" in breakdown["breakdown"][0]


def test_risk_engine_extended_rules():
    data = {
        "hydration_level": 40.0,
        "oiliness_level": 50.0,
        "sensitivity_level": 40.0,
        "acne_severity": 30.0,
        "pigmentation_score": 25.0,
        "wrinkles_score": 10.0,
        "sun_exposure_hours": 3.0,
        "spf_frequency": "Occasional",
        "sleep_hours": 6.0,
        "stress_level": 5,
        "climate_environment": "High Urban Pollution",
        "water_intake_liters": 1.0,
        "exfoliation_frequency": "Daily / Over-Exfoliated",
        "fitzpatrick_phototype": "Type V (Dark Brown)",
        "makeup_usage": "Full Coverage / Daily Heavy"
    }
    risks = evaluate_risk_factors(data)
    risk_names = [r["risk_name"] for r in risks]
    assert "Over-Exfoliation & Epidermal Desquamation Damage" in risk_names
    assert "Urban Particulate Matter (PM2.5) Oxidative Stress" in risk_names
    assert "Post-Inflammatory Hyperpigmentation (PIH) Vulnerability" in risk_names


def test_create_assessment_with_extended_criteria(auth_headers):
    payload = {
        "skin_type": "Combination",
        "hydration_level": 60.0,
        "oiliness_level": 55.0,
        "sensitivity_level": 25.0,
        "acne_severity": 40.0,
        "pigmentation_score": 30.0,
        "wrinkles_score": 15.0,
        "sun_exposure_hours": 3.0,
        "spf_frequency": "Occasional",
        "sleep_hours": 6.5,
        "stress_level": 6,
        "climate_environment": "Hot & Humid (Tropical)",
        "water_intake_liters": 3.0,
        "exfoliation_frequency": "1-2 Times/Week",
        "fitzpatrick_phototype": "Type IV (Olive / Brown)",
        "makeup_usage": "Light Minimal Makeup",
        "primary_skin_goal": "Acne & Pore Clearing",
        "notes": "Testing extended clinical assessment API payload"
    }
    response = client.post("/assessment", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["water_intake_liters"] == 3.0
    assert data["climate_environment"] == "Hot & Humid (Tropical)"
    assert data["fitzpatrick_phototype"] == "Type IV (Olive / Brown)"
    assert len(data["concerns"]) > 0
    assert len(data["risk_factors"]) > 0


def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    res = response.json()
    assert res["status"] == "online"


def test_get_history_api_with_regression_trend(auth_headers):
    client.post("/assessment", json={"skin_type": "Normal", "hydration_level": 40.0}, headers=auth_headers)
    client.post("/assessment", json={"skin_type": "Normal", "hydration_level": 60.0}, headers=auth_headers)
    client.post("/assessment", json={"skin_type": "Normal", "hydration_level": 85.0}, headers=auth_headers)

    response = client.get("/assessment/history", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["total_assessments"] == 3
    assert data["score_trend"] == "Improving"


def test_invalid_enum_validation(auth_headers):
    payload = {
        "skin_type": "InvalidSkinTypeChoice",
        "hydration_level": 50.0
    }
    response = client.post("/assessment", json=payload, headers=auth_headers)
    assert response.status_code == 422
