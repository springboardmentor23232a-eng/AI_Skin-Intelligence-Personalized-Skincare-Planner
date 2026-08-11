import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
from app.main import app
import time

client = TestClient(app)


def test_phase6():
    print("=" * 65)
    print("      PHASE 6 CLINICAL WORKSPACE VERIFICATION SUITE      ")
    print("=" * 65)

    timestamp = int(time.time() * 1000)
    consultant_email = f"consultant_{timestamp}@skincare.com"
    dermatologist_email = f"derm_{timestamp}@skincare.com"
    patient_email = f"patient_{timestamp}@skincare.com"
    user_email = f"normal_user_{timestamp}@skincare.com"
    pwd = "Password123!"

    # 1. Register Staff Users
    res_cons = client.post("/api/auth/register", json={
        "full_name": "Dr. Sarah Consultant",
        "email": consultant_email,
        "password": pwd,
        "role": "SKINCARE_CONSULTANT"
    })
    assert res_cons.status_code == 201
    token_cons = res_cons.json()["access_token"]
    headers_cons = {"Authorization": f"Bearer {token_cons}"}

    res_derm = client.post("/api/auth/register", json={
        "full_name": "Dr. Alex Dermatologist",
        "email": dermatologist_email,
        "password": pwd,
        "role": "DERMATOLOGIST"
    })
    assert res_derm.status_code == 201
    token_derm = res_derm.json()["access_token"]
    headers_derm = {"Authorization": f"Bearer {token_derm}"}

    res_pat = client.post("/api/auth/register", json={
        "full_name": "Clinical Patient One",
        "email": patient_email,
        "password": pwd,
        "role": "USER"
    })
    assert res_pat.status_code == 201
    token_pat = res_pat.json()["access_token"]
    headers_pat = {"Authorization": f"Bearer {token_pat}"}
    me_res = client.get("/api/auth/me", headers=headers_pat)
    patient_id = me_res.json()["id"]

    res_user = client.post("/api/auth/register", json={
        "full_name": "Normal User",
        "email": user_email,
        "password": pwd,
        "role": "USER"
    })
    headers_user = {"Authorization": f"Bearer {res_user.json()['access_token']}"}

    print("[OK] Step 1: Staff & Patient Users Registered")

    # 2. Verify RBAC Security (Normal User should be rejected from Clinical APIs)
    rbac_res = client.get("/api/clinical/stats", headers=headers_user)
    print(f"[OK] Step 2: RBAC Enforcement Checked (Normal user status: {rbac_res.status_code})")
    assert rbac_res.status_code == 403

    # 3. Clinical Dashboard Stats
    stats_res = client.get("/api/clinical/stats", headers=headers_cons)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    print(f"[OK] Step 3: Clinical Dashboard Stats (Total Clients: {stats['total_clients']})")

    # 4. Patient Directory Search
    patients_res = client.get("/api/clinical/patients", headers=headers_cons)
    assert patients_res.status_code == 200
    patients = patients_res.json()
    print(f"[OK] Step 4: Patient Directory Retreived (Count: {len(patients)})")
    assert len(patients) >= 1

    # 5. Schedule Consultation
    sched_payload = {
        "patient_id": patient_id,
        "notes": "Initial skincare consultation & barrier audit.",
        "treatment_recommendations": "Recommend hydrating cleanser and Niacinamide."
    }
    sched_res = client.post("/api/clinical/consultations", json=sched_payload, headers=headers_cons)
    assert sched_res.status_code == 201
    consultation_id = sched_res.json()["id"]
    print(f"[OK] Step 5: Consultation Scheduled (ID: {consultation_id})")

    # 6. Update Consultation
    update_res = client.put(f"/api/clinical/consultations/{consultation_id}", json={
        "status": "COMPLETED",
        "notes": "Consultation completed. Patient barrier is healthy."
    }, headers=headers_cons)
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "COMPLETED"
    print("[OK] Step 6: Consultation Status Updated to COMPLETED")

    # 7. Submit Clinical Review / Override
    review_payload = {
        "patient_id": patient_id,
        "status": "APPROVED",
        "clinical_notes": "Clinical override: Approved 2% BHA solution for evening use.",
        "custom_routine": {"morning": ["Cleanser", "SPF 50"], "evening": ["Cleanser", "BHA 2%"]}
    }
    review_res = client.post("/api/clinical/reviews", json=review_payload, headers=headers_derm)
    assert review_res.status_code == 201
    print(f"[OK] Step 7: Clinical Review Submitted by Dermatologist (Status: {review_res.json()['status']})")

    # 8. Fetch Full Patient Clinical Profile
    profile_res = client.get(f"/api/clinical/patients/{patient_id}", headers=headers_derm)
    assert profile_res.status_code == 200
    p_data = profile_res.json()
    assert len(p_data["consultations"]) >= 1
    assert len(p_data["clinical_reviews"]) >= 1
    print(f"[OK] Step 8: Full Patient Clinical Profile Retreived for '{p_data['patient']['full_name']}'")

    print("\n" + "=" * 65)
    print("      ALL PHASE 6 BACKEND & CLINICAL WORKSPACE TESTS PASSED 100%      ")
    print("=" * 65)


if __name__ == "__main__":
    test_phase6()
