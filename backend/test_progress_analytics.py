from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import SkinAssessment, SkinConcern, RiskFactor, SkinHealthScoreRecord, DailyChecklistLog
import random
from datetime import datetime, timedelta

client = TestClient(app)

def run_progress_tests():
    print("--- 1. Testing Registration and Authentication ---")
    rand_id = random.randint(100000, 999999)
    email = f"progress_tester_{rand_id}@demo.com"
    password = "password123"
    
    reg_res = client.post("/api/auth/register", json={
        "name": f"Progress Tester {rand_id}",
        "email": email,
        "password": password,
        "role": "USER"
    })
    assert reg_res.status_code == 201
    
    login_res = client.post("/api/auth/login", json={
        "email": email,
        "password": password
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    user_id = reg_res.json()["id"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"Logged in successfully. User: {email} (ID: {user_id})")
    
    print("\n--- 2. Testing Summary on New User (Zero State) ---")
    sum_res = client.get("/api/progress/summary", headers=headers)
    assert sum_res.status_code == 200, f"Summary failed: {sum_res.text}"
    summary = sum_res.json()
    print("New User Summary:", summary)
    assert summary["total_scans_count"] == 0
    assert len(summary["overview_metrics"]) == 3
    print("PASS: Zero state summary handled cleanly.")

    print("\n--- 3. Injecting Historical Assessments & Scores into PostgreSQL ---")
    db = SessionLocal()
    try:
        # Create Assessment 1 (Baseline - 20 days ago)
        date_1 = datetime.utcnow() - timedelta(days=20)
        a1 = SkinAssessment(
            user_id=user_id,
            assessment_date=date_1,
            skin_health_score=72,
            overall_condition="Good",
            notes="Baseline scan",
            created_at=date_1
        )
        db.add(a1)
        db.commit()
        db.refresh(a1)
        
        c1_1 = SkinConcern(assessment_id=a1.id, concern_name="Acne", severity=3.5, priority="HIGH")
        c1_2 = SkinConcern(assessment_id=a1.id, concern_name="Redness", severity=2.8, priority="MEDIUM")
        db.add_all([c1_1, c1_2])
        
        # Create Assessment 2 (Current - today)
        date_2 = datetime.utcnow()
        a2 = SkinAssessment(
            user_id=user_id,
            assessment_date=date_2,
            skin_health_score=84,
            overall_condition="Good",
            notes="Follow-up scan",
            created_at=date_2
        )
        db.add(a2)
        db.commit()
        db.refresh(a2)
        
        c2_1 = SkinConcern(assessment_id=a2.id, concern_name="Acne", severity=1.8, priority="LOW") # Improved!
        c2_2 = SkinConcern(assessment_id=a2.id, concern_name="Redness", severity=1.2, priority="LOW") # Improved!
        db.add_all([c2_1, c2_2])
        
        # Create Module 7 Score 1 (15 days ago)
        hs1 = SkinHealthScoreRecord(
            user_id=user_id,
            overall_score=75,
            condition_score=72.0,
            lifestyle_score=70.0,
            sleep_score=80.0,
            routine_score=75.0,
            hydration_score=80.0,
            calculated_at=date_1
        )
        # Create Module 7 Score 2 (today)
        hs2 = SkinHealthScoreRecord(
            user_id=user_id,
            overall_score=88,
            condition_score=84.0,
            lifestyle_score=85.0,
            sleep_score=90.0,
            routine_score=90.0,
            hydration_score=95.0,
            calculated_at=date_2
        )
        db.add_all([hs1, hs2])
        
        # Create Checklist Logs across past 10 days
        for i in range(10):
            log_date = datetime.utcnow() - timedelta(days=i)
            l = DailyChecklistLog(
                user_id=user_id,
                completed_count=4,
                total_count=5,
                completion_rate=0.8,
                logged_at=log_date
            )
            db.add(l)
            
        a1_id = a1.id
        a2_id = a2.id
        db.commit()
        print("PASS: Historical records seeded.")
    finally:
        db.close()

    print("\n--- 4. Testing Populated Progress Summary ---")
    sum_res2 = client.get("/api/progress/summary", headers=headers)
    assert sum_res2.status_code == 200
    summary2 = sum_res2.json()
    print("Populated Summary:", summary2)
    assert summary2["current_overall_score"] == 88
    assert summary2["previous_overall_score"] == 75
    assert summary2["overall_delta"] == 13
    assert "Score improved" in summary2["overall_status"]
    assert summary2["current_condition_score"] == 84
    assert summary2["condition_delta"] == 12
    assert summary2["total_scans_count"] == 2
    assert summary2["adherence_7d"] == 80.0
    print("PASS: Summary KPIs calculated accurately.")

    print("\n--- 5. Testing Progress Trends with Date Ranges ---")
    for r in ["7d", "30d", "3m", "6m", "all"]:
        trend_res = client.get(f"/api/progress/trends?range={r}", headers=headers)
        assert trend_res.status_code == 200
        data = trend_res.json()
        print(f"Trend Range {r}: has_data={data['has_data']}, points={len(data['trend_points'])}, concern_trends={len(data['concern_trends'])}")
        assert data["has_data"] is True
    print("PASS: Trend filtering works across all ranges.")

    print("\n--- 6. Testing Routine Adherence Analytics ---")
    adh_res = client.get("/api/progress/adherence", headers=headers)
    assert adh_res.status_code == 200
    adh_data = adh_res.json()
    print("Adherence Data:", adh_data)
    assert adh_data["adherence_rate_7d"] == 80.0
    assert adh_data["completed_steps"] == 40
    assert adh_data["total_steps"] == 50
    assert adh_data["missed_steps"] == 10
    assert adh_data["am_adherence_rate"] == 80.0
    assert adh_data["pm_adherence_rate"] == 80.0
    print("PASS: Adherence analytics verified.")

    print("\n--- 7. Testing Before & After Comparison ---")
    comp_res = client.get(f"/api/progress/comparison?earlier_id={a1_id}&later_id={a2_id}&type=assessment", headers=headers)
    assert comp_res.status_code == 200
    comp_data = comp_res.json()
    print("Comparison Data:", comp_data)
    assert comp_data["condition_delta"] == 12.0
    assert len(comp_data["concerns_comparison"]) == 2
    for c in comp_data["concerns_comparison"]:
        assert c["status"] == "Improved", f"Expected Improved status, got {c['status']}"
        assert c["delta"] < 0, f"Expected severity decrease (negative delta), got {c['delta']}"
    print("PASS: Concern severity delta comparison accurately calculated.")

    print("\n--- 8. Testing Available Snapshots Dropdown List ---")
    snap_res = client.get("/api/progress/snapshots", headers=headers)
    assert snap_res.status_code == 200
    snapshots = snap_res.json()
    print("Snapshots count:", len(snapshots))
    assert len(snapshots) >= 4
    print("PASS: Snapshots list returned.")

    print("\n=======================================================")
    print("ALL MODULE 8 PROGRESS ANALYTICS BACKEND TESTS PASSED!")
    print("=======================================================")

if __name__ == "__main__":
    run_progress_tests()
