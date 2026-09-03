import sys, os
import time
from datetime import date
from fastapi.testclient import TestClient

_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from app.main import app

client = TestClient(app)

def create_authenticated_user(name="Module7 User"):
    test_email = f"mod7_{int(time.time() * 1000000)}@skincare.com"
    reg_res = client.post("/api/auth/register", json={
        "full_name": name,
        "email": test_email,
        "password": "Password123!",
        "role": "USER"
    })
    assert reg_res.status_code == 201, f"Failed to register user: {reg_res.text}"
    token = reg_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_module7_weight_validation_and_scoring_engine():
    """
    Forensic Test: Verifies the 5-factor weighted scoring model:
    Condition = 35%
    Lifestyle = 20%
    Sleep = 15%
    Routine = 20%
    Hydration = 10%
    Total = 100%
    """
    headers = create_authenticated_user("Weight Test User")

    # 1. Setup Profile with controlled inputs:
    # Lifestyle: Low stress -> 90
    # Sleep: 8+ hours -> 95
    # Hydration: 3.2 L -> 95
    profile_payload = {
        "full_name": "Weight Test User",
        "age": 28,
        "gender": "Female",
        "skin_type": "Combination",
        "skin_tone": "Medium",
        "concerns": ["Acne / Breakouts"],
        "allergies": "None",
        "sensitivities": "None",
        "lifestyle": "Active",
        "sleep_quality": "8+ hours",
        "water_intake": 3.2,
        "stress_level": "Low",
        "environmental_exposure": "Indoor",
        "climate": "Temperate",
        "uv_exposure": "Low"
    }
    p_res = client.post("/api/profile", json=profile_payload, headers=headers)
    assert p_res.status_code == 201, f"Profile create failed: {p_res.text}"

    # 2. Add Skincare Logs: 10 completed out of 10 -> 100% adherence
    for i in range(10):
        client.post("/api/analytics/routines/logs", json={
            "routine_type": f"MORNING_{i}",
            "logged_date": str(date.today()),
            "completed": True,
            "notes": "Done"
        }, headers=headers)

    # 3. Create Assessment with mild concerns (severity near 0):
    # Condition raw_score near 100
    mild_assessment = {
        "acne": 5,
        "hyperpigmentation": 5,
        "dryness": 5,
        "oiliness": 5,
        "redness": 5,
        "sensitivity": 5,
        "wrinkles": 0,
        "fine_lines": 0,
        "dark_spots": 0,
        "uneven_tone": 5
    }
    res = client.post("/api/assessment", json=mild_assessment, headers=headers)
    assert res.status_code == 201
    data = res.json()

    # Verify score is high, risk is Low Risk, within range
    assert 35 <= data["overall_score"] <= 99
    assert data["overall_score"] >= 90
    assert data["risk_level"] == "Low Risk"

def test_module7_real_data_sensitivity_scenarios():
    """
    Forensic Test: Isolated sensitivity tests:
    - Hydration change modifies overall score
    - Routine adherence change modifies overall score
    - Sleep quality change modifies overall score
    - Skin condition change modifies overall score
    - Historical assessments calculate improvement deltas
    """
    headers = create_authenticated_user("Sensitivity Test User")

    # Baseline Profile
    base_profile = {
        "full_name": "Sensitivity User",
        "age": 30,
        "gender": "Female",
        "skin_type": "Oily",
        "skin_tone": "Fair",
        "concerns": ["Acne / Breakouts"],
        "allergies": "None",
        "sensitivities": "None",
        "lifestyle": "Moderate",
        "sleep_quality": "<6 hours",  # Low sleep -> 60
        "water_intake": 1.0,           # Low hydration -> 65
        "stress_level": "High Stress", # High stress -> 70
        "environmental_exposure": "Urban",
        "climate": "Humid",
        "uv_exposure": "Moderate"
    }
    client.post("/api/profile", json=base_profile, headers=headers)

    # Single routine log with completed = False -> 0% adherence
    client.post("/api/analytics/routines/logs", json={
        "routine_type": "MORNING",
        "logged_date": str(date.today()),
        "completed": False,
        "notes": "Missed"
    }, headers=headers)

    severe_assessment = {
        "acne": 80,
        "hyperpigmentation": 70,
        "dryness": 60,
        "oiliness": 80,
        "redness": 60,
        "sensitivity": 50,
        "wrinkles": 40,
        "fine_lines": 40,
        "dark_spots": 50,
        "uneven_tone": 50
    }
    res_base = client.post("/api/assessment", json=severe_assessment, headers=headers)
    assert res_base.status_code == 201
    baseline_score = res_base.json()["overall_score"]

    # SCENARIO 1: Increase Hydration only (1.0L -> 3.5L)
    client.put("/api/profile", json={
        **base_profile,
        "water_intake": 3.5
    }, headers=headers)
    res_hydrated = client.post("/api/assessment", json=severe_assessment, headers=headers)
    score_hydrated = res_hydrated.json()["overall_score"]
    # Hydration went from 65 to 95 (+30 * 0.10 = +3 points)
    assert score_hydrated > baseline_score, f"Hydration increase did not increase score: {score_hydrated} vs {baseline_score}"

    # SCENARIO 2: Improve Routine Adherence (0% -> 100%)
    # Overwrite the log to completed = True
    client.post("/api/analytics/routines/logs", json={
        "routine_type": "MORNING",
        "logged_date": str(date.today()),
        "completed": True,
        "notes": "Completed routine!"
    }, headers=headers)
    res_routine = client.post("/api/assessment", json=severe_assessment, headers=headers)
    score_routine = res_routine.json()["overall_score"]
    # Adherence went from 0 to 100 (+100 * 0.20 = +20 points)
    assert score_routine > score_hydrated, f"Routine adherence did not increase score: {score_routine} vs {score_hydrated}"

    # SCENARIO 3: Improve Sleep Quality ("<6 hours" -> "8+ hours")
    client.put("/api/profile", json={
        **base_profile,
        "water_intake": 3.5,
        "sleep_quality": "8+ hours"
    }, headers=headers)
    res_sleep = client.post("/api/assessment", json=severe_assessment, headers=headers)
    score_sleep = res_sleep.json()["overall_score"]
    # Sleep went from 60 to 95 (+35 * 0.15 = +5 points)
    assert score_sleep > score_routine, f"Sleep quality did not increase score: {score_sleep} vs {score_routine}"

    # SCENARIO 4: Improve Skin Condition Assessment (severe -> cleared)
    cleared_assessment = {
        "acne": 10,
        "hyperpigmentation": 10,
        "dryness": 10,
        "oiliness": 15,
        "redness": 10,
        "sensitivity": 10,
        "wrinkles": 10,
        "fine_lines": 10,
        "dark_spots": 10,
        "uneven_tone": 10
    }
    res_cleared = client.post("/api/assessment", json=cleared_assessment, headers=headers)
    score_cleared = res_cleared.json()["overall_score"]
    assert score_cleared > score_sleep, f"Skin clearing did not increase score: {score_cleared} vs {score_sleep}"

    # SCENARIO 5: Verify Skin Improvement Delta in History & Summary
    summary = res_cleared.json()["summary"]
    assert "improved by +" in summary or "Skin health" in summary

    # Check analytics trends endpoint
    trends_res = client.get("/api/analytics/history", headers=headers)
    assert trends_res.status_code == 200
    trends = trends_res.json()["trends"]
    assert len(trends) >= 5
    # The last trend point should reflect improvement delta
    assert "improvement_delta" in trends[-1]
    assert trends[-1]["improvement_delta"] > 0

def test_module7_edge_cases():
    """
    Forensic Test: Edge Cases
    1. User with no skin profile (falls back gracefully)
    2. User with no routine history (defaults adherence safely)
    3. Clamping boundary checks (never < 35, never > 99)
    """
    headers = create_authenticated_user("Edge Case User")

    # 1. New user with NO profile and NO routine logs
    res = client.post("/api/assessment", json={
        "acne": 100,
        "hyperpigmentation": 100,
        "dryness": 100,
        "oiliness": 100,
        "redness": 100,
        "sensitivity": 100,
        "wrinkles": 100,
        "fine_lines": 100,
        "dark_spots": 100,
        "uneven_tone": 100
    }, headers=headers)
    assert res.status_code == 201
    data = res.json()
    # Clamped at minimum 35
    assert data["overall_score"] == 35
    assert data["risk_level"] == "High Priority Alert"

    # 2. Perfect condition
    res_perfect = client.post("/api/assessment", json={
        "acne": 0,
        "hyperpigmentation": 0,
        "dryness": 0,
        "oiliness": 0,
        "redness": 0,
        "sensitivity": 0,
        "wrinkles": 0,
        "fine_lines": 0,
        "dark_spots": 0,
        "uneven_tone": 0
    }, headers=headers)
    assert res_perfect.status_code == 201
    assert res_perfect.json()["overall_score"] <= 99
