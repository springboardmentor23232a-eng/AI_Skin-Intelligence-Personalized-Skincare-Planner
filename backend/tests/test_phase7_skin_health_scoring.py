import sys, os
import time
from datetime import date
from fastapi.testclient import TestClient

_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from app.main import app
from app.services.skin_health_scoring import (
    calculate_skin_condition_score,
    calculate_lifestyle_score,
    calculate_sleep_score,
    calculate_hydration_score,
    WEIGHT_SKIN_CONDITION,
    WEIGHT_LIFESTYLE,
    WEIGHT_SLEEP,
    WEIGHT_ROUTINE,
    WEIGHT_HYDRATION,
    TOTAL_WEIGHT,
    CALCULATION_VERSION
)

client = TestClient(app)


def register_user(name: str):
    email = f"phase7_{int(time.time() * 1000000)}@skincare.com"
    res = client.post("/api/auth/register", json={
        "full_name": name,
        "email": email,
        "password": "Password123!",
        "role": "USER"
    })
    assert res.status_code == 201, f"Failed registration: {res.text}"
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ==========================================
# 1. UNIT & FORMULA VERIFICATION TESTS
# ==========================================

def test_phase7_formula_weights_sum_to_one():
    """Verify that all 5 factor weights mathematically sum to exactly 1.0 (100%)."""
    computed_sum = round(
        WEIGHT_SKIN_CONDITION + WEIGHT_LIFESTYLE + WEIGHT_SLEEP + WEIGHT_ROUTINE + WEIGHT_HYDRATION,
        4
    )
    assert computed_sum == 1.0, f"Factor weights do not sum to 1.0: {computed_sum}"
    assert TOTAL_WEIGHT == 1.0
    assert WEIGHT_SKIN_CONDITION == 0.35
    assert WEIGHT_LIFESTYLE == 0.20
    assert WEIGHT_SLEEP == 0.15
    assert WEIGHT_ROUTINE == 0.20
    assert WEIGHT_HYDRATION == 0.10


def test_phase7_unit_factor_scoring_logic():
    """Verify individual factor normalization logic."""
    perfect_skin = {
        "acne": 0, "hyperpigmentation": 0, "dryness": 0, "oiliness": 0,
        "redness": 0, "sensitivity": 0, "wrinkles": 0, "fine_lines": 0,
        "dark_spots": 0, "uneven_tone": 0
    }
    assert calculate_skin_condition_score(perfect_skin) == 100.0

    class MockProfile:
        def __init__(self, sq, wi, sl, ls="Active", st="Normal", concerns=None):
            self.sleep_quality = sq
            self.water_intake = wi
            self.stress_level = sl
            self.lifestyle = ls
            self.skin_type = st
            self.concerns = concerns or []

    # Sleep quality
    assert calculate_sleep_score(MockProfile("8+ hours", 2.5, "Low")) == 95.0
    assert calculate_sleep_score(MockProfile("7-8 hours", 2.5, "Low")) == 85.0
    assert calculate_sleep_score(MockProfile("6-7 hours", 2.5, "Low")) == 75.0
    assert calculate_sleep_score(MockProfile("<6 hours", 2.5, "Low")) == 60.0

    # Hydration
    assert calculate_hydration_score(MockProfile("8+ hours", 3.5, "Low")) == 95.0
    assert calculate_hydration_score(MockProfile("8+ hours", 2.2, "Low")) == 85.0
    assert calculate_hydration_score(MockProfile("8+ hours", 1.2, "Low")) == 65.0
    assert calculate_hydration_score(MockProfile("8+ hours", 0.5, "Low")) == 50.0


def test_phase7_skin_type_personalization():
    """Verify that different skin types personalize condition severity calculations."""
    class MockSkinProfile:
        def __init__(self, skin_type, concerns=None):
            self.skin_type = skin_type
            self.concerns = concerns or []

    # Dry skin is disproportionately affected by high dryness
    dry_profile = MockSkinProfile("Dry")
    oily_profile = MockSkinProfile("Oily")

    dehydrated_assessment = {
        "acne": 10, "hyperpigmentation": 10, "dryness": 80, "oiliness": 10,
        "redness": 10, "sensitivity": 10, "wrinkles": 10, "fine_lines": 50,
        "dark_spots": 10, "uneven_tone": 10
    }

    score_for_dry = calculate_skin_condition_score(dehydrated_assessment, profile=dry_profile)
    score_for_oily = calculate_skin_condition_score(dehydrated_assessment, profile=oily_profile)
    assert score_for_dry < score_for_oily, f"Dry skin should be more impacted by severe dryness than oily skin: {score_for_dry} vs {score_for_oily}"

    # Sensitive skin is disproportionately affected by redness & sensitivity
    sensitive_profile = MockSkinProfile("Sensitive")
    normal_profile = MockSkinProfile("Normal")

    reactive_assessment = {
        "acne": 10, "hyperpigmentation": 10, "dryness": 10, "oiliness": 10,
        "redness": 80, "sensitivity": 85, "wrinkles": 10, "fine_lines": 10,
        "dark_spots": 10, "uneven_tone": 10
    }

    score_sensitive = calculate_skin_condition_score(reactive_assessment, profile=sensitive_profile)
    score_normal = calculate_skin_condition_score(reactive_assessment, profile=normal_profile)
    assert score_sensitive < score_normal, f"Sensitive skin should be more impacted by redness/sensitivity: {score_sensitive} vs {score_normal}"


def test_phase7_skin_concerns_personalization():
    """Verify that user's declared profile concerns amplify parameter sensitivity."""
    class MockProfile:
        def __init__(self, concerns):
            self.skin_type = "Normal"
            self.concerns = concerns

    profile_with_acne_concern = MockProfile(["Acne / Breakouts"])
    profile_without_concern = MockProfile([])

    breakout_assessment = {
        "acne": 65, "hyperpigmentation": 10, "dryness": 10, "oiliness": 10,
        "redness": 10, "sensitivity": 10, "wrinkles": 10, "fine_lines": 10,
        "dark_spots": 10, "uneven_tone": 10
    }

    score_acne_focus = calculate_skin_condition_score(breakout_assessment, profile=profile_with_acne_concern)
    score_generic = calculate_skin_condition_score(breakout_assessment, profile=profile_without_concern)
    assert score_acne_focus < score_generic, "User with declared acne concern should have heightened sensitivity to acne severity"


# ==========================================
# 2. ENDPOINT, DATA ISOLATION & COMPLETENESS
# ==========================================

def test_phase7_get_skin_health_score_endpoint():
    """Verify GET /api/scoring/skin-health returns full 5-factor breakdown and completeness metadata."""
    headers = register_user("Personalized User")

    # Set up profile
    client.post("/api/profile", json={
        "full_name": "Personalized User",
        "age": 27,
        "gender": "Female",
        "skin_type": "Combination",
        "skin_tone": "Medium",
        "concerns": ["Fine Lines"],
        "allergies": "None",
        "sensitivities": "None",
        "lifestyle": "Active",
        "sleep_quality": "8+ hours",
        "water_intake": 3.0,
        "stress_level": "Low",
        "environmental_exposure": "Indoor",
        "climate": "Temperate",
        "uv_exposure": "Low"
    }, headers=headers)

    # Log 8 completed routines out of 10
    for i in range(8):
        client.post("/api/analytics/routines/logs", json={
            "routine_type": f"MORNING_{i}",
            "logged_date": str(date.today()),
            "completed": True,
            "notes": "Done"
        }, headers=headers)
    for i in range(2):
        client.post("/api/analytics/routines/logs", json={
            "routine_type": f"EVENING_{i}",
            "logged_date": str(date.today()),
            "completed": False,
            "notes": "Missed"
        }, headers=headers)

    # Post assessment
    client.post("/api/assessment", json={
        "acne": 10, "hyperpigmentation": 10, "dryness": 10, "oiliness": 10,
        "redness": 10, "sensitivity": 10, "wrinkles": 10, "fine_lines": 10,
        "dark_spots": 10, "uneven_tone": 10
    }, headers=headers)

    # Fetch personalized scoring breakdown
    res = client.get("/api/scoring/skin-health", headers=headers)
    assert res.status_code == 200, f"Expected 200 OK: {res.text}"
    data = res.json()

    # Validate consumer contract
    assert "overall_score" in data
    assert "risk_level" in data
    assert "status_label" in data
    assert "factors" in data
    assert "disclaimer" in data
    assert "profile_completeness" in data
    assert "confidence_level" in data
    assert data["profile_completeness"] >= 80.0
    assert data["confidence_level"] == "Full Personalization"
    assert data["skin_type_context"] == "Combination"

    factors = data["factors"]
    assert factors["skin_condition"]["name"] == "Skin Barrier & Condition"
    assert factors["lifestyle"]["name"] == "Lifestyle & Daily Rhythm"
    assert factors["sleep_quality"]["name"] == "Rest & Nighttime Recovery"
    assert factors["routine_consistency"]["name"] == "Daily Routine Consistency"
    assert factors["hydration"]["name"] == "Daily Hydration Balance"

    # Routine adherence should be 8/10 = 80.0%
    assert factors["routine_consistency"]["score"] == 80.0
    assert factors["routine_consistency"]["weighted_contribution"] == 16.0

    # Sleep quality "8+ hours" -> 95.0
    assert factors["sleep_quality"]["score"] == 95.0


def test_phase7_user_data_isolation():
    """Verify strict user isolation: User A's data never bleeds into User B's score."""
    headers_a = register_user("User Alpha")
    headers_b = register_user("User Beta")

    # User A: Perfect habits & severe condition
    client.post("/api/profile", json={
        "full_name": "User Alpha", "age": 25, "gender": "Female",
        "skin_type": "Oily", "skin_tone": "Medium", "concerns": [],
        "allergies": "None", "sensitivities": "None", "lifestyle": "Active",
        "sleep_quality": "8+ hours", "water_intake": 3.5, "stress_level": "Low",
        "environmental_exposure": "Indoor", "climate": "Mild", "uv_exposure": "Low"
    }, headers=headers_a)

    client.post("/api/assessment", json={
        "acne": 90, "hyperpigmentation": 90, "dryness": 90, "oiliness": 90,
        "redness": 90, "sensitivity": 90, "wrinkles": 90, "fine_lines": 90,
        "dark_spots": 90, "uneven_tone": 90
    }, headers=headers_a)

    # User B: No assessment or profile yet
    res_b = client.get("/api/scoring/skin-health", headers=headers_b)
    assert res_b.status_code == 200
    data_b = res_b.json()

    res_a = client.get("/api/scoring/skin-health", headers=headers_a)
    assert res_a.status_code == 200
    data_a = res_a.json()

    # Scores must be completely isolated and distinct
    assert data_a["overall_score"] != data_b["overall_score"]
    assert data_a["factors"]["sleep_quality"]["score"] == 95.0
    # User B receives honest neutral baseline for missing profile
    assert data_b["factors"]["sleep_quality"]["score"] == 55.0
    assert data_b["confidence_level"] == "Initial Baseline"


def test_phase7_unauthenticated_access_rejected():
    """Verify that unauthenticated requests to scoring endpoints return 401."""
    unauth_client = TestClient(app)
    res = unauth_client.get("/api/scoring/skin-health")
    assert res.status_code == 401
    assert "Not authenticated" in res.json()["detail"]
