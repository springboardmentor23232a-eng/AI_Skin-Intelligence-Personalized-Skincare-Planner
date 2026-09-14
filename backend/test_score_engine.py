from fastapi.testclient import TestClient
from app.main import app
import random

client = TestClient(app)

def run_score_tests():
    print("--- 1. Testing Registration and Login ---")
    rand_id = random.randint(100000, 999999)
    email = f"score_tester_{rand_id}@demo.com"
    password = "password123"
    
    reg_res = client.post("/api/auth/register", json={
        "name": f"Score Tester {rand_id}",
        "email": email,
        "password": password,
        "role": "USER"
    })
    assert reg_res.status_code == 201, f"Reg failed: {reg_res.text}"
    
    login_res = client.post("/api/auth/login", json={
        "email": email,
        "password": password
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"Logged in successfully. User: {email}")
    
    print("\n--- 2. Testing Score Endpoint for New User without Profile (Must be 'Not yet available') ---")
    score_res = client.get("/api/score/current", headers=headers)
    assert score_res.status_code == 200, f"Score GET failed: {score_res.text}"
    score_data = score_res.json()
    print("Initial Score Data:", score_data)
    assert score_data["overall_score"] is None, "New user without profile must NOT have overall_score"
    assert score_data["status"] == "Not yet available"
    assert score_data["has_profile"] is False
    assert score_data["has_score"] is False
    print("PASS: Score correctly shows 'Not yet available' for unprofiled user.")
    
    print("\n--- 3. Verifying GET /api/score/current does not insert records into DB for unprofiled user ---")
    hist_empty_res = client.get("/api/score/history", headers=headers)
    assert hist_empty_res.status_code == 200
    assert len(hist_empty_res.json()) == 0, "No score records should exist before profile completion!"
    
    # Calculate without profile should fail with 400
    calc_fail = client.post("/api/score/calculate", headers=headers)
    assert calc_fail.status_code == 400, "Calculate without profile must return 400"
    print("PASS: No database records created and direct calculate correctly blocked for unprofiled user.")
    
    print("\n--- 4. Creating 28-Question Profile with Known Values ---")
    profile_payload = {
        "age_group": "25–34",
        "skin_type": "Combination",
        "sensitivity": "Not sensitive",
        "concerns": ["None"],
        "acne_severity": "None",
        "oiliness": "Slightly oily",
        "dryness": "Not dry",
        "redness_frequency": "Never",
        "has_routine": "Yes",
        "current_products": ["Cleanser", "Moisturizer", "Sunscreen"],
        "routine_frequency": "Every day",
        "skincare_irritation": "No",
        "active_ingredients": ["Niacinamide"],
        "sleep_hours": "7–8",
        "water_intake": "2–3 L",
        "stress_level": "Low",
        "exercise_frequency": "5+ times/week",
        "outdoor_hours": "1–2 hours",
        "climate": "Moderate",
        "pollution_exposure": "Low",
        "sunlight_exposure": "Moderate",
        "has_allergies": "No",
        "avoid_ingredients": "",
        "has_allergic_reaction": "No",
        "skincare_time": "5–10 minutes",
        "routine_preference": "Moderate",
        "budget": "Moderate",
        "skincare_goal": "Maintain healthy skin"
    }
    
    prof_res = client.post("/api/routine/profile", json=profile_payload, headers=headers)
    assert prof_res.status_code == 200, f"Profile save failed: {prof_res.text}"
    print("PASS: 28-Question Profile saved.")
    
    print("\n--- 5. Explicitly Calculating Score via POST /api/score/calculate ---")
    calc_res = client.post("/api/score/calculate", headers=headers)
    assert calc_res.status_code == 200, f"Recalculate failed: {calc_res.text}"
    calc_data = calc_res.json()
    print("Recalculated Score Data:", calc_data)
    assert calc_data["overall_score"] >= 85, f"Expected high score, got {calc_data['overall_score']}"
    assert calc_data["status"] == "Excellent"
    assert calc_data["sleep_score"] == 100.0
    assert calc_data["hydration_score"] == 100.0
    assert calc_data["has_profile"] is True
    assert calc_data["has_score"] is True
    print("PASS: Weighted scoring calculated accurately after profile.")
    
    print("\n--- 6. Logging Daily Checklist Adherence ---")
    log_res = client.post("/api/score/checklist-log", json={
        "completed_count": 5,
        "total_count": 5
    }, headers=headers)
    assert log_res.status_code == 201, f"Checklist log failed: {log_res.text}"
    print("PASS: Checklist log stored. Result:", log_res.json())
    
    print("\n--- 7. Checking Score History Logs ---")
    hist_res = client.get("/api/score/history", headers=headers)
    assert hist_res.status_code == 200, f"History fetch failed: {hist_res.text}"
    history = hist_res.json()
    print(f"History records count: {len(history)}")
    assert len(history) >= 1, "Expected at least 1 history record after calculate!"
    print("PASS: Score history tracking verified.")

    print("\n=======================================================")
    print("ALL MODULE 7 BACKEND SCORE ENGINE TESTS PASSED!")
    print("=======================================================")

if __name__ == "__main__":
    run_score_tests()

