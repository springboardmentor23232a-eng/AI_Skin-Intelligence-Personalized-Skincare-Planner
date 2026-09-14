import sys
import os
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
    calculate_routine_consistency_score,
    compute_skin_health_breakdown,
    WEIGHT_SKIN_CONDITION,
    WEIGHT_LIFESTYLE,
    WEIGHT_SLEEP,
    WEIGHT_ROUTINE,
    WEIGHT_HYDRATION,
    TOTAL_WEIGHT
)

client = TestClient(app)


def get_unique_user(prefix: str):
    email = f"{prefix}_{int(time.time() * 1000000)}@skincare.com"
    reg_res = client.post("/api/auth/register", json={
        "full_name": f"{prefix.capitalize()} Tester",
        "email": email,
        "password": "Password123!",
        "role": "USER"
    })
    assert reg_res.status_code == 201, f"Failed registration: {reg_res.text}"
    token = reg_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# =====================================================================
# 1. 10 SCENARIO TESTS AS REQUIRED BY PRODUCTION-READINESS AUDIT
# =====================================================================

def test_scenario_1_new_user_incomplete_profile():
    """Scenario 1: New user with incomplete profile receives baseline & honest estimate notice."""
    headers = get_unique_user("scenario1")
    res = client.get("/api/scoring/skin-health", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert data["confidence_level"] == "Initial Baseline"
    assert data["profile_completeness"] < 50.0
    assert len(data["missing_items"]) >= 5
    assert "Skin type" in data["missing_items"]
    # Score must be realistic baseline, not artificially inflated 85-90
    assert 50.0 <= data["overall_score"] <= 65.0


def test_scenario_2_dry_skin_user():
    """Scenario 2: Dry-skin user is impacted appropriately by elevated dryness."""
    headers = get_unique_user("scenario2_dry")
    client.post("/api/profile", json={
        "full_name": "Dry Skin User", "age": 30, "gender": "Female",
        "skin_type": "Dry", "skin_tone": "Fair", "concerns": ["Dryness"],
        "allergies": "None", "sensitivities": "None", "lifestyle": "Moderate",
        "sleep_quality": "7-8 hours", "water_intake": 2.0, "stress_level": "Moderate",
        "environmental_exposure": "Indoor", "climate": "Arid", "uv_exposure": "Moderate"
    }, headers=headers)

    class MockProfile:
        skin_type = "Dry"
        concerns = ["Dryness"]

    class MockOilyProfile:
        skin_type = "Oily"
        concerns = ["Oiliness"]

    assessment_data = {
        "acne": 10, "hyperpigmentation": 10, "dryness": 75, "oiliness": 10,
        "redness": 15, "sensitivity": 15, "wrinkles": 10, "fine_lines": 40,
        "dark_spots": 10, "uneven_tone": 10
    }

    dry_cond_score = calculate_skin_condition_score(assessment_data, profile=MockProfile)
    oily_cond_score = calculate_skin_condition_score(assessment_data, profile=MockOilyProfile)

    # Dry skin condition must be more severely impacted by dryness than oily skin
    assert dry_cond_score < oily_cond_score
    assert dry_cond_score <= 78.0


def test_scenario_3_oily_skin_user():
    """Scenario 3: Oily-skin user: moderate sebum is not penalized as an acute defect."""
    class MockOily:
        skin_type = "Oily"
        concerns = []

    class MockDry:
        skin_type = "Dry"
        concerns = []

    # Moderate oiliness with no other severe issues
    mild_oil_assessment = {
        "acne": 5, "hyperpigmentation": 5, "dryness": 5, "oiliness": 30,
        "redness": 5, "sensitivity": 5, "wrinkles": 5, "fine_lines": 5,
        "dark_spots": 5, "uneven_tone": 5
    }

    score_oily = calculate_skin_condition_score(mild_oil_assessment, profile=MockOily)
    assert score_oily >= 88.0, f"Moderate natural sebum for oily skin should not be heavily penalized: {score_oily}"


def test_scenario_4_sensitive_skin_user():
    """Scenario 4: Sensitive-skin user has heightened sensitivity to redness and reactivity."""
    class MockSensitive:
        skin_type = "Sensitive"
        concerns = ["Redness", "Sensitivity"]

    class MockNormal:
        skin_type = "Normal"
        concerns = []

    reactive_assessment = {
        "acne": 10, "hyperpigmentation": 10, "dryness": 10, "oiliness": 10,
        "redness": 70, "sensitivity": 75, "wrinkles": 10, "fine_lines": 10,
        "dark_spots": 10, "uneven_tone": 10
    }

    score_sensitive = calculate_skin_condition_score(reactive_assessment, profile=MockSensitive)
    score_normal = calculate_skin_condition_score(reactive_assessment, profile=MockNormal)

    assert score_sensitive < score_normal
    assert score_normal - score_sensitive >= 4.0


def test_scenario_5_user_with_active_acne_concern():
    """Scenario 5: User with declared acne concern is more responsive to breakout severity."""
    class MockAcneConcern:
        skin_type = "Normal"
        concerns = ["Acne / Breakouts"]

    class MockNoConcern:
        skin_type = "Normal"
        concerns = []

    breakout_assessment = {
        "acne": 55, "hyperpigmentation": 10, "dryness": 10, "oiliness": 10,
        "redness": 10, "sensitivity": 10, "wrinkles": 10, "fine_lines": 10,
        "dark_spots": 10, "uneven_tone": 10
    }

    score_concern = calculate_skin_condition_score(breakout_assessment, profile=MockAcneConcern)
    score_unconcerned = calculate_skin_condition_score(breakout_assessment, profile=MockNoConcern)

    assert score_concern < score_unconcerned


def test_scenario_6_user_with_poor_sleep():
    """Scenario 6: Poor sleep (<6 hours) drops sleep factor score to 60.0."""
    class MockPoorSleep:
        sleep_quality = "<6 hours"

    class MockGoodSleep:
        sleep_quality = "8+ hours"

    score_poor = calculate_sleep_score(MockPoorSleep)
    score_good = calculate_sleep_score(MockGoodSleep)

    assert score_poor == 60.0
    assert score_good == 95.0
    assert score_good - score_poor == 35.0


def test_scenario_7_user_with_poor_hydration():
    """Scenario 7: Poor hydration (<1L) drops hydration factor score to 50.0."""
    class MockDehydrated:
        water_intake = 0.8

    class MockHydrated:
        water_intake = 3.2

    score_low = calculate_hydration_score(MockDehydrated)
    score_high = calculate_hydration_score(MockHydrated)

    assert score_low == 50.0
    assert score_high == 95.0
    assert score_high - score_low == 45.0


def test_scenario_8_user_with_inconsistent_routine():
    """Scenario 8: Inconsistent routine logs reflect low adherence percentage."""
    headers = get_unique_user("scenario8_routine")

    # Log 1 complete out of 10
    client.post("/api/analytics/routines/logs", json={
        "routine_type": "MORNING", "logged_date": str(date.today()),
        "completed": True, "notes": "Only 1 done"
    }, headers=headers)
    for i in range(9):
        client.post("/api/analytics/routines/logs", json={
            "routine_type": f"MISSED_{i}", "logged_date": str(date.today()),
            "completed": False, "notes": "Missed"
        }, headers=headers)

    res = client.get("/api/scoring/skin-health", headers=headers)
    data = res.json()
    assert data["factors"]["routine_consistency"]["score"] == 10.0
    assert data["factors"]["routine_consistency"]["weighted_contribution"] == 2.0


def test_scenario_9_user_with_strong_profile_completion():
    """Scenario 9: Complete profile + assessment + routines reaches Full Personalization."""
    headers = get_unique_user("scenario9_complete")

    client.post("/api/profile", json={
        "full_name": "Full Profile User", "age": 29, "gender": "Female",
        "skin_type": "Combination", "skin_tone": "Medium", "concerns": ["Fine Lines"],
        "allergies": "None", "sensitivities": "None", "lifestyle": "Active",
        "sleep_quality": "8+ hours", "water_intake": 2.5, "stress_level": "Low",
        "environmental_exposure": "Indoor", "climate": "Temperate", "uv_exposure": "Low"
    }, headers=headers)

    client.post("/api/assessment", json={
        "acne": 10, "hyperpigmentation": 10, "dryness": 15, "oiliness": 20,
        "redness": 10, "sensitivity": 10, "wrinkles": 10, "fine_lines": 15,
        "dark_spots": 10, "uneven_tone": 10
    }, headers=headers)

    client.post("/api/analytics/routines/logs", json={
        "routine_type": "MORNING", "logged_date": str(date.today()),
        "completed": True, "notes": "Done"
    }, headers=headers)

    res = client.get("/api/scoring/skin-health", headers=headers)
    data = res.json()

    assert data["profile_completeness"] == 100.0
    assert data["confidence_level"] == "Full Personalization"
    assert len(data["missing_items"]) == 0
    assert data["skin_type_context"] == "Combination"


def test_scenario_10_two_different_users_distinct_scores():
    """Scenario 10: Two distinct users with different profiles and conditions receive distinct scores."""
    headers_user_a = get_unique_user("scenario10_user_a")
    headers_user_b = get_unique_user("scenario10_user_b")

    # User A: Dry skin + severe dryness + poor hydration (0.7L) + poor sleep (<6h)
    client.post("/api/profile", json={
        "full_name": "User A", "age": 35, "gender": "Female",
        "skin_type": "Dry", "skin_tone": "Fair", "concerns": ["Dryness", "Aging"],
        "allergies": "None", "sensitivities": "None", "lifestyle": "Sedentary",
        "sleep_quality": "<6 hours", "water_intake": 0.7, "stress_level": "High",
        "environmental_exposure": "Outdoor", "climate": "Dry", "uv_exposure": "High"
    }, headers=headers_user_a)

    client.post("/api/assessment", json={
        "acne": 10, "hyperpigmentation": 20, "dryness": 85, "oiliness": 5,
        "redness": 30, "sensitivity": 40, "wrinkles": 50, "fine_lines": 60,
        "dark_spots": 20, "uneven_tone": 30
    }, headers=headers_user_a)

    # User B: Oily skin + optimal sleep (8+h) + optimal hydration (3.2L) + consistent routines
    client.post("/api/profile", json={
        "full_name": "User B", "age": 24, "gender": "Male",
        "skin_type": "Oily", "skin_tone": "Medium", "concerns": ["Acne"],
        "allergies": "None", "sensitivities": "None", "lifestyle": "Active",
        "sleep_quality": "8+ hours", "water_intake": 3.2, "stress_level": "Low",
        "environmental_exposure": "Indoor", "climate": "Temperate", "uv_exposure": "Low"
    }, headers=headers_user_b)

    client.post("/api/assessment", json={
        "acne": 25, "hyperpigmentation": 10, "dryness": 10, "oiliness": 30,
        "redness": 10, "sensitivity": 10, "wrinkles": 5, "fine_lines": 5,
        "dark_spots": 10, "uneven_tone": 10
    }, headers=headers_user_b)

    for i in range(5):
        client.post("/api/analytics/routines/logs", json={
            "routine_type": f"ROUTINE_{i}", "logged_date": str(date.today()),
            "completed": True, "notes": "Consistent"
        }, headers=headers_user_b)

    res_a = client.get("/api/scoring/skin-health", headers=headers_user_a)
    res_b = client.get("/api/scoring/skin-health", headers=headers_user_b)

    data_a = res_a.json()
    data_b = res_b.json()

    # Scores must be substantially different reflecting actual data
    assert data_a["overall_score"] != data_b["overall_score"]
    assert data_a["overall_score"] < data_b["overall_score"]
    assert data_b["overall_score"] - data_a["overall_score"] >= 15.0
    assert data_a["factors"]["sleep_quality"]["score"] == 60.0
    assert data_b["factors"]["sleep_quality"]["score"] == 95.0
    assert data_a["factors"]["hydration"]["score"] == 50.0
    assert data_b["factors"]["hydration"]["score"] == 95.0


# =====================================================================
# 2. COMPLETE USER LIFECYCLE FLOW AUDIT
# =====================================================================

def test_complete_user_lifecycle_flow():
    """
    Simulates complete user flow:
    Register -> Login -> Complete Profile -> Select Skin Type -> Select Concerns
    -> Submit Assessment -> View Skin Health Score -> View Analytics
    -> Update Profile -> Recalculate Score -> Verify Score Shifts Dynamically.
    """
    # 1. Register
    email = f"lifecycle_{int(time.time() * 1000000)}@skincare.com"
    reg_res = client.post("/api/auth/register", json={
        "full_name": "Lifecycle Tester",
        "email": email,
        "password": "Password123!",
        "role": "USER"
    })
    assert reg_res.status_code == 201

    # 2. Login
    login_res = client.post("/api/auth/login", json={
        "email": email,
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Initial Score Check (Unconfigured Baseline)
    score_pre_profile = client.get("/api/scoring/skin-health", headers=headers).json()
    assert score_pre_profile["confidence_level"] == "Initial Baseline"

    # 4. Complete Profile (Dry skin, mild concerns, active lifestyle, 8+ hrs sleep, 2.5L water)
    prof_res = client.post("/api/profile", json={
        "full_name": "Lifecycle Tester",
        "age": 28,
        "gender": "Female",
        "skin_type": "Dry",
        "skin_tone": "Medium",
        "concerns": ["Dryness", "Fine Lines"],
        "allergies": "None",
        "sensitivities": "None",
        "lifestyle": "Active",
        "sleep_quality": "8+ hours",
        "water_intake": 2.5,
        "stress_level": "Low",
        "environmental_exposure": "Indoor",
        "climate": "Moderate",
        "uv_exposure": "Low"
    }, headers=headers)
    assert prof_res.status_code == 201

    # 5. Submit Initial Skin Assessment
    assess_res = client.post("/api/assessment", json={
        "acne": 10, "hyperpigmentation": 15, "dryness": 30, "oiliness": 10,
        "redness": 10, "sensitivity": 10, "wrinkles": 10, "fine_lines": 20,
        "dark_spots": 10, "uneven_tone": 15
    }, headers=headers)
    assert assess_res.status_code == 201
    initial_overall = assess_res.json()["overall_score"]

    # 6. View Skin Health Score
    score_post_assess = client.get("/api/scoring/skin-health", headers=headers).json()
    assert score_post_assess["skin_type_context"] == "Dry"
    assert score_post_assess["factors"]["sleep_quality"]["score"] == 95.0
    assert score_post_assess["factors"]["hydration"]["score"] == 85.0
    assert score_post_assess["overall_score"] >= 80.0

    # 7. View Analytics Trends
    trends_res = client.get("/api/analytics/history", headers=headers)
    assert trends_res.status_code == 200
    assert len(trends_res.json()["trends"]) >= 1

    # 8. Update Profile: Drastically reduce sleep and water intake (simulate life stress)
    update_prof_res = client.put("/api/profile", json={
        "full_name": "Lifecycle Tester",
        "age": 28,
        "gender": "Female",
        "skin_type": "Dry",
        "skin_tone": "Medium",
        "concerns": ["Dryness", "Fine Lines"],
        "allergies": "None",
        "sensitivities": "None",
        "lifestyle": "Sedentary",
        "sleep_quality": "<6 hours",
        "water_intake": 0.6,
        "stress_level": "High",
        "environmental_exposure": "Indoor",
        "climate": "Moderate",
        "uv_exposure": "Low"
    }, headers=headers)
    assert update_prof_res.status_code == 200

    # 9. Recalculate Score & Verify Dynamic Shift
    recalc_score = client.get("/api/scoring/skin-health", headers=headers).json()
    assert recalc_score["overall_score"] < score_post_assess["overall_score"]
    assert recalc_score["factors"]["sleep_quality"]["score"] == 60.0
    assert recalc_score["factors"]["hydration"]["score"] == 50.0
    assert recalc_score["factors"]["lifestyle"]["score"] <= 70.0
    score_drop = round(score_post_assess["overall_score"] - recalc_score["overall_score"], 1)
    assert score_drop >= 10.0, f"Expected noticeable score drop due to poor sleep & dehydration, got {score_drop}"
