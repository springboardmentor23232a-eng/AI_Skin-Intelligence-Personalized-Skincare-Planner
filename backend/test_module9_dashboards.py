import random
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import User, SkinAssessment, SkinConcern, RiskFactor, RoutineProfile, Routine, DailyChecklistLog

client = TestClient(app)


def run_module9_tests():
    print("=======================================================")
    print("RUNNING MODULE 9: DASHBOARDS & ANALYTICS TEST SUITE")
    print("=======================================================")
    
    rand_id = random.randint(100000, 999999)
    
    # 1. Create Test Admin
    admin_email = f"admin_{rand_id}@demo.com"
    admin_res = client.post("/api/auth/register", json={
        "name": f"Admin {rand_id}",
        "email": admin_email,
        "password": "Password123!",
        "role": "ADMIN"
    })
    assert admin_res.status_code == 201
    
    admin_login = client.post("/api/auth/login", json={
        "email": admin_email,
        "password": "Password123!"
    })
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("PASS: Admin registered and authenticated.")

    # 2. Create Test Dermatologist / Doctor
    derm_email = f"doctor_{rand_id}@demo.com"
    derm_res = client.post("/api/auth/register", json={
        "name": f"Dr. Dermatologist {rand_id}",
        "email": derm_email,
        "password": "Password123!",
        "role": "DOCTOR"
    })
    assert derm_res.status_code == 201
    
    derm_login = client.post("/api/auth/login", json={
        "email": derm_email,
        "password": "Password123!"
    })
    derm_token = derm_login.json()["access_token"]
    derm_headers = {"Authorization": f"Bearer {derm_token}"}
    print("PASS: Dermatologist registered and authenticated.")

    # 3. Create Test Consultant
    cons_email = f"consultant_{rand_id}@demo.com"
    cons_res = client.post("/api/auth/register", json={
        "name": f"Consultant {rand_id}",
        "email": cons_email,
        "password": "Password123!",
        "role": "CONSULTANT"
    })
    assert cons_res.status_code == 201
    
    cons_login = client.post("/api/auth/login", json={
        "email": cons_email,
        "password": "Password123!"
    })
    cons_token = cons_login.json()["access_token"]
    cons_headers = {"Authorization": f"Bearer {cons_token}"}
    print("PASS: Consultant registered and authenticated.")

    # 4. Create Standard User / Patient
    user_email = f"user_patient_{rand_id}@demo.com"
    user_res = client.post("/api/auth/register", json={
        "name": f"Patient {rand_id}",
        "email": user_email,
        "password": "Password123!",
        "role": "USER"
    })
    assert user_res.status_code == 201
    user_id = user_res.json()["id"]
    
    user_login = client.post("/api/auth/login", json={
        "email": user_email,
        "password": "Password123!"
    })
    user_token = user_login.json()["access_token"]
    user_headers = {"Authorization": f"Bearer {user_token}"}
    print("PASS: Patient user registered and authenticated.")

    # 5. Seed clinical assessment for Patient
    db = SessionLocal()
    try:
        a = SkinAssessment(
            user_id=user_id,
            skin_health_score=68,
            overall_condition="Moderate",
            notes=""
        )
        db.add(a)
        db.commit()
        db.refresh(a)
        
        c1 = SkinConcern(assessment_id=a.id, concern_name="Acne Vulgaris", severity=3.8, priority="HIGH")
        c2 = SkinConcern(assessment_id=a.id, concern_name="Hyperpigmentation", severity=2.5, priority="MEDIUM")
        r1 = RiskFactor(assessment_id=a.id, risk_name="Barrier Disruption", description="Severe dryness", risk_level="HIGH")
        db.add_all([c1, c2, r1])
        db.commit()
        print("PASS: Seeded diagnostic assessment with HIGH priority concerns.")
    finally:
        db.close()

    print("\n--- 6. Testing Dermatologist Portal Endpoints ---")
    d_dash = client.get("/api/dermatologist/dashboard", headers=derm_headers)
    assert d_dash.status_code == 200
    d_dash_data = d_dash.json()
    print("Dermatologist Dashboard:", d_dash_data)
    assert d_dash_data["total_patients"] >= 1
    assert d_dash_data["high_risk_count"] >= 1
    assert len(d_dash_data["critical_cases"]) >= 1

    d_pat = client.get("/api/dermatologist/patients", headers=derm_headers)
    assert d_pat.status_code == 200
    patients_list = d_pat.json()
    print("Patient Insights count:", len(patients_list))
    assert len(patients_list) >= 1

    d_cond = client.get("/api/dermatologist/conditions", headers=derm_headers)
    assert d_cond.status_code == 200
    conditions = d_cond.json()
    print("Condition Reports count:", len(conditions))
    assert len(conditions) >= 1

    d_ana = client.get("/api/dermatologist/analytics", headers=derm_headers)
    assert d_ana.status_code == 200
    d_analytics = d_ana.json()
    print("Dermatologist Analytics:", d_analytics)
    assert "treatment_success_rate" in d_analytics
    assert "disease_distribution" in d_analytics

    print("\n--- 7. Testing Admin Portal Endpoints ---")
    a_dash = client.get("/api/admin/dashboard", headers=admin_headers)
    assert a_dash.status_code == 200
    a_dash_data = a_dash.json()
    print("Admin Dashboard Stats:", a_dash_data)
    assert a_dash_data["total_users"] >= 1
    assert a_dash_data["total_doctors"] >= 1
    assert a_dash_data["total_consultants"] >= 1
    assert a_dash_data["total_admins"] >= 1

    a_users = client.get("/api/admin/users", headers=admin_headers)
    assert a_users.status_code == 200
    user_list = a_users.json()
    print("Admin User Directory count:", len(user_list))
    assert len(user_list) >= 4

    # Test Role Update
    update_res = client.put(f"/api/admin/users/{user_id}/role", json={"role": "CONSULTANT"}, headers=admin_headers)
    assert update_res.status_code == 200
    assert update_res.json()["role"] == "CONSULTANT"
    print("PASS: Admin successfully updated user role.")

    # Revert back to USER
    revert_res = client.put(f"/api/admin/users/{user_id}/role", json={"role": "USER"}, headers=admin_headers)
    assert revert_res.status_code == 200

    a_ana = client.get("/api/admin/analytics", headers=admin_headers)
    assert a_ana.status_code == 200
    admin_analytics = a_ana.json()
    print("Admin Platform Analytics:", admin_analytics)
    assert len(admin_analytics["registrations_chart"]) == 7

    a_rec = client.get("/api/admin/recommendation-metrics", headers=admin_headers)
    assert a_rec.status_code == 200
    rec_metrics = a_rec.json()
    print("Recommendation Metrics:", rec_metrics)
    assert rec_metrics["total_active_products"] >= 1

    a_sys = client.get("/api/admin/system-health", headers=admin_headers)
    assert a_sys.status_code == 200
    sys_health = a_sys.json()
    print("System Health Diagnostics:", sys_health)
    assert sys_health["database_status"] == "Connected (PostgreSQL)"

    print("\n--- 8. Testing Consultant Portal Endpoints ---")
    c_dash = client.get("/api/consultant/dashboard", headers=cons_headers)
    assert c_dash.status_code == 200
    
    c_prog = client.get("/api/consultant/progress-summary", headers=cons_headers)
    assert c_prog.status_code == 200
    cons_prog = c_prog.json()
    print("Consultant Progress Summary:", cons_prog)
    assert "total_clients" in cons_prog
    assert "category_chart" in cons_prog

    print("\n--- 9. Testing RBAC Security Restrictions ---")
    # Standard user cannot access admin or dermatologist endpoints
    unauth_admin = client.get("/api/admin/dashboard", headers=user_headers)
    assert unauth_admin.status_code == 403
    print("PASS: Unauthorized access to Admin portal blocked (HTTP 403 Forbidden).")

    unauth_derm = client.get("/api/dermatologist/dashboard", headers=user_headers)
    assert unauth_derm.status_code == 403
    print("PASS: Unauthorized access to Dermatologist portal blocked (HTTP 403 Forbidden).")

    unauth_cons = client.get("/api/consultant/dashboard", headers=user_headers)
    assert unauth_cons.status_code == 403
    print("PASS: Unauthorized access to Consultant portal blocked (HTTP 403 Forbidden).")

    print("\n=======================================================")
    print("ALL MODULE 9 DASHBOARD & ANALYTICS BACKEND TESTS PASSED!")
    print("=======================================================")


if __name__ == "__main__":
    run_module9_tests()
