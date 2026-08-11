import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
from app.main import app
import time
from datetime import date

client = TestClient(app)


def test_phase5():
    print("=" * 65)
    print("      PHASE 5 BACKEND & DATABASE VERIFICATION SUITE      ")
    print("=" * 65)

    test_email = f"phase5_user_{int(time.time() * 1000)}@skincare.com"

    # 1. Register & Login User
    reg_res = client.post("/api/auth/register", json={
        "full_name": "Phase5 Test User",
        "email": test_email,
        "password": "Password123!",
        "role": "USER"
    })
    assert reg_res.status_code == 201, f"Registration failed: {reg_res.text}"
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[OK] Step 1: User Registered & JWT Issued")

    # 2. Add Skin Assessment to check history trends later
    assess_payload = {
        "acne": 40,
        "hyperpigmentation": 30,
        "dryness": 20,
        "oiliness": 50,
        "redness": 10,
        "sensitivity": 20,
        "wrinkles": 10,
        "fine_lines": 15,
        "dark_spots": 25,
        "uneven_tone": 20
    }
    assess_res = client.post("/api/assessment", json=assess_payload, headers=headers)
    assert assess_res.status_code == 201, f"Assessment failed: {assess_res.text}"
    print("[OK] Step 2: Skin Assessment Created")

    # 3. Log Skincare Routine
    log_payload = {
        "routine_type": "MORNING",
        "logged_date": str(date.today()),
        "completed": True,
        "notes": "Skin feels hydrated."
    }
    log_res = client.post("/api/analytics/routines/logs", json=log_payload, headers=headers)
    assert log_res.status_code == 201, f"Routine logging failed: {log_res.text}"
    log_data = log_res.json()
    assert log_data["routine_type"] == "MORNING"
    assert log_data["completed"] is True
    print("[OK] Step 3: Skincare Routine Logged Successfully")

    # 4. Get Routine Logs
    get_logs_res = client.get("/api/analytics/routines/logs", headers=headers)
    assert get_logs_res.status_code == 200
    logs = get_logs_res.json()
    assert len(logs) == 1
    assert logs[0]["notes"] == "Skin feels hydrated."
    print("[OK] Step 4: Skincare Routine Logs Fetched Successfully")

    # 5. Log Skin Progress Entry (Photo & Notes)
    progress_payload = {
        "photo_url": "https://example.com/photos/before.jpg",
        "notes": "Day 1 before starting new serum.",
        "associated_assessment_id": assess_res.json()["id"]
    }
    progress_res = client.post("/api/analytics/progress", json=progress_payload, headers=headers)
    assert progress_res.status_code == 201, f"Progress entry failed: {progress_res.text}"
    print("[OK] Step 5: Skin Progress Photo Entry Logged")

    # 6. Fetch Progress Entry History
    get_progress_res = client.get("/api/analytics/progress", headers=headers)
    assert get_progress_res.status_code == 200
    progress_history = get_progress_res.json()
    assert len(progress_history) == 1
    assert progress_history[0]["photo_url"] == "https://example.com/photos/before.jpg"
    print("[OK] Step 6: Progress Entry History Fetched Successfully")

    # 7. Get Skin Health Trends
    trends_res = client.get("/api/analytics/history", headers=headers)
    assert trends_res.status_code == 200
    trends_data = trends_res.json()
    assert "trends" in trends_data
    assert len(trends_data["trends"]) == 1
    assert trends_data["trends"][0]["overall_score"] == assess_res.json()["overall_score"]
    print("[OK] Step 7: Skin Health Trends History Fetched Successfully")

    print("\n" + "=" * 65)
    print("      ALL PHASE 5 BACKEND & DATABASE TESTS PASSED 100%       ")
    print("=" * 65)


if __name__ == "__main__":
    test_phase5()
