import sys, os
_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
from app.main import app
from app.db.session import engine, SessionLocal
from app.models import User, SkinProfile, SkinAssessment
import time

client = TestClient(app)

def test_phase2():
    print("=" * 65)
    print("      PHASE 2 BACKEND & POSTGRESQL VERIFICATION SUITE      ")
    print("=" * 65)

    test_email = f"phase2_user_{int(time.time() * 1000)}@skincare.com"

    # 1. Register User
    reg_res = client.post("/api/auth/register", json={
        "full_name": "Phase2 Test User",
        "email": test_email,
        "password": "Password123!",
        "role": "USER"
    })
    assert reg_res.status_code == 201, f"Registration failed: {reg_res.text}"
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[OK] Step 1: User Registered & JWT Issued")

    # 2. Create Skin Profile (POST /api/profile)
    profile_payload = {
        "full_name": "Phase2 Test User",
        "age": 28,
        "gender": "Female",
        "skin_type": "Combination",
        "skin_tone": "Medium",
        "concerns": ["Acne / Breakouts", "Hyperpigmentation"],
        "allergies": "Fragrance",
        "sensitivities": "High UV",
        "lifestyle": "Active",
        "sleep_quality": "7-8 Hours",
        "water_intake": 2.5,
        "stress_level": "Moderate",
        "environmental_exposure": "Urban",
        "climate": "Temperate",
        "uv_exposure": "Moderate"
    }
    create_prof = client.post("/api/profile", json=profile_payload, headers=headers)
    assert create_prof.status_code == 201, f"Create Profile failed: {create_prof.text}"
    print(f"[OK] Step 2: Skin Profile Created (Age: {create_prof.json()['age']}, Type: {create_prof.json()['skin_type']})")

    # 3. Read Skin Profile (GET /api/profile)
    get_prof = client.get("/api/profile", headers=headers)
    assert get_prof.status_code == 200, f"Get Profile failed: {get_prof.text}"
    print("[OK] Step 3: Skin Profile Retrieved from PostgreSQL")

    # 4. Update Skin Profile (PUT /api/profile)
    update_prof = client.put("/api/profile", json={"water_intake": 3.0, "lifestyle": "High Activity"}, headers=headers)
    assert update_prof.status_code == 200, f"Update Profile failed: {update_prof.text}"
    assert update_prof.json()["water_intake"] == 3.0
    print("[OK] Step 4: Skin Profile Updated (New Water Intake: 3.0L)")

    # 5. Create Skin Assessment (POST /api/assessment)
    assessment_payload = {
        "acne": 35,
        "hyperpigmentation": 20,
        "dryness": 40,
        "oiliness": 30,
        "redness": 15,
        "sensitivity": 20,
        "wrinkles": 10,
        "fine_lines": 15,
        "dark_spots": 25,
        "uneven_tone": 25
    }
    create_ass = client.post("/api/assessment", json=assessment_payload, headers=headers)
    assert create_ass.status_code == 201, f"Create Assessment failed: {create_ass.text}"
    ass_data = create_ass.json()
    print(f"[OK] Step 5: Skin Assessment Executed (Score: {ass_data['overall_score']}%, Risk: {ass_data['risk_level']})")

    # 6. Read Assessment History (GET /api/assessment/history)
    get_hist = client.get("/api/assessment/history", headers=headers)
    assert get_hist.status_code == 200, f"Get History failed: {get_hist.text}"
    assert len(get_hist.json()) >= 1
    print(f"[OK] Step 6: Assessment History Retrieved ({len(get_hist.json())} record(s))")

    # 7. Query PostgreSQL DB Directly
    db = SessionLocal()
    db_prof = db.query(SkinProfile).filter(SkinProfile.full_name == "Phase2 Test User").first()
    db_ass = db.query(SkinAssessment).filter(SkinAssessment.user_id == db_prof.user_id).first()
    db.close()

    assert db_prof is not None, "Profile not found in PostgreSQL"
    assert db_ass is not None, "Assessment not found in PostgreSQL"
    print(f"[OK] Step 7: Direct PostgreSQL Inspection Confirmed (Profile ID: {db_prof.id}, Assessment ID: {db_ass.id})")

    print("\n=============================================================")
    print("      ALL PHASE 2 BACKEND & DATABASE TESTS PASSED 100%       ")
    print("=============================================================")

if __name__ == "__main__":
    test_phase2()
