import pytest
import os
import jwt
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure test DB environment
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_skin_assessment.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

import app.models
from app.main import app
from app.database import Base, get_db

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

from app.services.routine_engine import (
    generate_personalized_routine_data,
    generate_morning_routine,
    generate_evening_routine,
    generate_weekly_treatment_plan,
    generate_seasonal_recommendations,
    evaluate_adaptive_updates,
    filter_safe_ingredients,
    SeasonEnum
)

client = TestClient(app)



def test_morning_routine_categories_sequence():
    """Verify Morning routine sequence follows: 🧼 Cleansing -> 💧 Treatment -> 🧴 Moisturizing -> ☀️ Sun Protection"""
    steps = generate_morning_routine(
        skin_type="Oily",
        concerns=["Acne & Breakouts"],
        health_score=78.0,
        allergies=[],
        sensitivities=[],
        lifestyle={"sun_exposure_hours": 3.0}
    )
    
    assert len(steps) == 4
    assert steps[0].category == "🧼 Cleansing"
    assert steps[1].category == "💧 Treatment"
    assert steps[2].category == "🧴 Moisturizing"
    assert steps[3].category == "☀️ Sun Protection"
    assert "SPF 50+" in steps[3].title or "SPF" in steps[3].title

def test_evening_routine_categories_sequence():
    """Verify Evening routine sequence follows: 🧼 Cleansing -> ✨ Exfoliation -> 💧 Treatment -> 🧴 Moisturizing -> 🌙 Night Care"""
    steps = generate_evening_routine(
        skin_type="Combination",
        concerns=["Wrinkles"],
        health_score=80.0,
        allergies=[],
        sensitivities=[],
        lifestyle={"makeup_usage": "Light"}
    )
    
    assert len(steps) == 5
    assert steps[0].category == "🧼 Cleansing"
    assert steps[1].category == "✨ Exfoliation"
    assert steps[2].category == "💧 Treatment"
    assert steps[3].category == "🧴 Moisturizing"
    assert steps[4].category == "🌙 Night Care"

def test_allergy_and_sensitivity_ingredient_filtering():
    """Verify allergy/sensitivity filtering removes forbidden ingredients."""
    candidates = ["Salicylic Acid 2%", "Fragrance (Parfum)", "Niacinamide", "Essential Oils"]
    allergies = ["Fragrance (Parfum)", "Essential Oils"]
    sensitivities = []
    
    safe = filter_safe_ingredients(candidates, allergies, sensitivities)
    assert "Fragrance (Parfum)" not in safe
    assert "Essential Oils" not in safe
    assert "Niacinamide" in safe

def test_weekly_treatment_plan():
    """Verify multi-day weekly treatment plan is created."""
    plan = generate_weekly_treatment_plan(
        skin_type="Combination",
        concerns=["Acne"],
        health_score=75.0
    )
    assert len(plan) >= 3
    days = [item.day for item in plan]
    assert any("Wednesday" in d for d in days)
    assert any("Friday" in d for d in days)

def test_seasonal_recommendations():
    """Verify seasonal adjustments differ for Summer vs Winter."""
    summer_tips = generate_seasonal_recommendations(SeasonEnum.SUMMER, "Oily")
    winter_tips = generate_seasonal_recommendations(SeasonEnum.WINTER, "Dry")

    assert "Summer" in summer_tips.season
    assert "Winter" in winter_tips.season
    assert any("SPF" in adj or "gel" in adj for adj in summer_tips.routine_adjustments)
    assert any("Ceramides" in adj or "humidifier" in adj or "cream" in adj for adj in winter_tips.routine_adjustments)

def test_adaptive_routine_barrier_safeguard():
    """Verify high sensitivity triggers Barrier Repair Safeguard mode."""
    adaptive = evaluate_adaptive_updates(
        current_health_score=40.0,
        previous_health_score=65.0,
        sensitivity_level=80.0
    )
    assert "Barrier Repair" in adaptive.mode
    assert len(adaptive.adjustments_made) > 0

def test_fastapi_generate_routine_endpoint():
    """Test REST API endpoint POST /routine/generate"""
    payload = {
        "user_id": 1,
        "season": "Summer",
        "allergies": ["Fragrance"],
        "sensitivities": ["Alcohol Denat"]
    }
    response = client.post("/routine/generate", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert len(data["morning_routine"]) == 4
    assert len(data["evening_routine"]) == 5
    assert data["season"] == "Summer"

def test_fastapi_get_user_routine_endpoint():
    """Test REST API endpoint GET /routine/user/1"""
    response = client.get("/routine/user/1")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "morning_routine" in data
