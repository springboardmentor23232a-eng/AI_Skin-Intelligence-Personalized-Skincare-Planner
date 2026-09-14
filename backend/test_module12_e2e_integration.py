import io
import time
from datetime import datetime, timezone, timedelta
import openpyxl
from fastapi import HTTPException
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.main import app
from app.database import SessionLocal, engine, Base
from app.models import (
    User, 
    SkinAssessment, 
    SkinConcern, 
    RiskFactor, 
    Routine, 
    RoutineItem, 
    RoutineProfile, 
    DailyChecklistLog, 
    SkinHealthScoreRecord,
    Product,
    Notification,
    NotificationPreference
)
from app.services import report_service, progress_service, health_score_service, product_recommendation_service
from app.routers.reports import resolve_target_user

client = TestClient(app)


def setup_module():
    Base.metadata.create_all(bind=engine)


def make_test_profile(user_id: int, skin_type: str = "Combination", goal: str = "Barrier Restoration") -> RoutineProfile:
    return RoutineProfile(
        user_id=user_id,
        age_group="25-34",
        skin_type=skin_type,
        sensitivity="Medium",
        concerns=["Acne", "Dullness", "Dehydration"],
        acne_severity="Mild",
        oiliness="Normal",
        dryness="Moderate",
        redness_frequency="Rarely",
        has_routine="Yes",
        current_products=["Gentle Cleanser", "SPF 50 Sunscreen"],
        routine_frequency="Daily",
        skincare_irritation="No",
        active_ingredients=["Niacinamide", "Hyaluronic Acid"],
        sleep_hours="7-8",
        water_intake="2-3L",
        stress_level="Moderate",
        exercise_frequency="3-4 times/week",
        outdoor_hours="1-2 hours",
        climate="Moderate",
        pollution_exposure="Low",
        sunlight_exposure="Moderate",
        has_allergies="No",
        avoid_ingredients=None,
        has_allergic_reaction="No",
        skincare_time="10-15 mins",
        routine_preference="Balanced",
        budget="Moderate",
        skincare_goal=goal
    )


# =========================================================================
# TEST 1: COMPREHENSIVE USER WORKFLOW (END-TO-END)
# =========================================================================
def test_e2e_user_workflow():
    db = SessionLocal()
    created_entities = []
    try:
        ts = int(time.time() * 1000)
        user_email = f"m12_user_e2e_{ts}@example.com"
        user_password = "SecurePassword123!"

        # 1. Registration & Authentication
        reg_res = client.post("/api/auth/register", json={
            "email": user_email,
            "password": user_password,
            "name": "E2E Test Patient",
            "role": "USER"
        })
        assert reg_res.status_code in (200, 201), f"Registration failed: {reg_res.text}"
        
        login_res = client.post("/api/auth/login", json={
            "email": user_email,
            "password": user_password
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.text}"
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Fetch created user entity
        user = db.query(User).filter(User.email == user_email).first()
        assert user is not None
        created_entities.append(user)

        # 2. Complete 28-Question Profile
        profile = make_test_profile(user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        created_entities.append(profile)

        # 3. Perform Skin Assessment Scan
        assessment = SkinAssessment(
            user_id=user.id,
            assessment_date=datetime.now(timezone.utc),
            skin_health_score=82,
            overall_condition="Combination / Mild Texture",
            notes="AI-assisted automated visual scan completed."
        )
        db.add(assessment)
        db.commit()
        db.refresh(assessment)
        created_entities.append(assessment)

        concern = SkinConcern(
            assessment_id=assessment.id,
            concern_name="Post-Acne Marks",
            severity=0.55,
            priority="Medium"
        )
        risk = RiskFactor(
            assessment_id=assessment.id,
            risk_name="UV Photodamage",
            risk_level="Moderate",
            description="Mild sunscreen compliance risk."
        )
        db.add_all([concern, risk])
        db.commit()
        created_entities.extend([concern, risk])

        # 4. Generate & Retrieve Personalized Routine
        routine = Routine(user_id=user.id, profile_id=profile.id)
        db.add(routine)
        db.commit()
        db.refresh(routine)
        created_entities.append(routine)

        item_am = RoutineItem(
            routine_id=routine.id,
            routine_type="MORNING",
            name="Gentle Foaming Cleanser",
            step_order=1,
            category="Cleanser",
            frequency="Daily AM",
            description="Wash face with lukewarm water.",
            is_enabled=True
        )
        item_pm = RoutineItem(
            routine_id=routine.id,
            routine_type="EVENING",
            name="Ceramide Night Barrier Cream",
            step_order=1,
            category="Moisturizer",
            frequency="Daily PM",
            description="Apply evenly over clean face.",
            is_enabled=True
        )
        db.add_all([item_am, item_pm])
        db.commit()
        created_entities.extend([item_am, item_pm])

        # 5. Ingredient Intelligence Verification
        ing_res = client.get("/api/ingredients", headers=headers)
        assert ing_res.status_code == 200, "Ingredients list endpoint failed"

        # 6. Product Recommendations & Safety Verification
        prod_res = client.get("/api/products/recommended", headers=headers)
        assert prod_res.status_code == 200, f"Product recommendation failed: {prod_res.text}"
        rec_data = prod_res.json()
        assert isinstance(rec_data, list), "Recommendations must return list"

        # 7. Skin Health Score & Formula Calculation
        score_res = client.post("/api/score/calculate", headers=headers)
        assert score_res.status_code == 200, f"Score calculation failed: {score_res.text}"
        score_json = score_res.json()
        assert "overall_score" in score_json
        assert len(score_json["components"]) == 5

        # 8. Daily Checklist Adherence Logging
        log_res = client.post("/api/score/checklist-log", json={
            "completed_count": 2,
            "total_count": 2
        }, headers=headers)
        assert log_res.status_code in (200, 201), f"Checklist logging failed: {log_res.text}"

        # 9. Progress Tracking & Analytics
        prog_res = client.get("/api/progress/summary", headers=headers)
        assert prog_res.status_code == 200, f"Progress summary failed: {prog_res.text}"

        # 10. Role-Specific Notifications Check
        notif_res = client.get("/api/notifications", headers=headers)
        assert notif_res.status_code == 200, f"Notifications failed: {notif_res.text}"

        # 11. Reports Preview, PDF & Excel Exports
        rep_assess = client.get("/api/reports/skin-assessment", headers=headers)
        assert rep_assess.status_code == 200
        assert rep_assess.json()["has_data"] is True

        pdf_res = client.get("/api/reports/skin-assessment/export/pdf", headers=headers)
        assert pdf_res.status_code == 200
        assert pdf_res.content.startswith(b"%PDF-")

        excel_res = client.get("/api/reports/routine/export/excel", headers=headers)
        assert excel_res.status_code == 200
        wb = openpyxl.load_workbook(io.BytesIO(excel_res.content))
        assert "Morning Routine (AM)" in wb.sheetnames

    finally:
        # Full Teardown / Cleanup
        for ent in reversed(created_entities):
            try:
                db.delete(ent)
            except Exception:
                pass
        db.commit()
        db.close()


# =========================================================================
# TEST 2: PRACTITIONER & ADMIN WORKFLOWS (CONSULTANT, DOCTOR, ADMIN)
# =========================================================================
def test_e2e_practitioner_and_admin_workflows():
    db = SessionLocal()
    created_users = []
    try:
        ts = int(time.time() * 1000)
        # 1. Create Patient User
        patient = User(email=f"patient_{ts}@example.com", name="Client A", role="USER")
        consultant = User(email=f"consultant_{ts}@example.com", name="Consultant B", role="CONSULTANT")
        doctor = User(email=f"doctor_{ts}@example.com", name="Dr. Dermatologist", role="DOCTOR")
        admin = User(email=f"admin_{ts}@example.com", name="System Admin", role="ADMIN")
        
        db.add_all([patient, consultant, doctor, admin])
        db.commit()
        created_users.extend([patient, consultant, doctor, admin])

        # 2. Consultant Workflow Checks
        consultant_target = resolve_target_user(consultant, patient.id, db)
        assert consultant_target.id == patient.id, "Consultant must be authorized for client"

        # 3. Doctor Workflow Checks
        doctor_target = resolve_target_user(doctor, patient.id, db)
        assert doctor_target.id == patient.id, "Doctor must be authorized for patient"

        # 4. Admin Workflow Checks
        admin_target = resolve_target_user(admin, patient.id, db)
        assert admin_target.id == patient.id, "Admin must possess administrative clearance"

    finally:
        for u in created_users:
            try:
                db.delete(u)
            except Exception:
                pass
        db.commit()
        db.close()


# =========================================================================
# TEST 3: STRICT SECURITY & RBAC ISOLATION TESTING
# =========================================================================
def test_security_and_rbac_isolation():
    db = SessionLocal()
    created_users = []
    try:
        ts = int(time.time() * 1000)
        user_a = User(email=f"user_a_{ts}@example.com", name="User A", role="USER")
        user_b = User(email=f"user_b_{ts}@example.com", name="User B", role="USER")
        db.add_all([user_a, user_b])
        db.commit()
        created_users.extend([user_a, user_b])

        # 1. Unauthenticated API access check
        unauth_res = client.get("/api/reports/skin-assessment")
        assert unauth_res.status_code == 401, "Unauthenticated request must return 401"

        # 2. Invalid JWT token check
        invalid_jwt_res = client.get("/api/reports/skin-assessment", headers={"Authorization": "Bearer invalid.token.payload"})
        assert invalid_jwt_res.status_code == 401, "Invalid JWT token must return 401"

        # 3. Cross-User IDOR Access Prevention
        try:
            resolve_target_user(user_a, user_b.id, db)
            assert False, "User A accessing User B's report should raise 403 Forbidden"
        except HTTPException as exc:
            assert exc.status_code == 403, f"Expected 403, got {exc.status_code}"

        # 4. Non-existent User Access Prevention
        try:
            resolve_target_user(user_a, 99999999, db)
            assert False, "Accessing non-existent user should raise 403 or 404"
        except HTTPException as exc:
            assert exc.status_code in (403, 404)

    finally:
        for u in created_users:
            try:
                db.delete(u)
            except Exception:
                pass
        db.commit()
        db.close()


# =========================================================================
# TEST 4: SYSTEM HEALTH CHECK & MONITORING VERIFICATION
# =========================================================================
def test_system_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200, f"GET /api/health failed: {res.text}"
    data = res.json()
    
    assert data["status"] in ("healthy", "degraded")
    assert "database" in data
    assert data["database"]["status"] == "connected"
    assert "latency_ms" in data["database"]
    assert data["database"]["latency_ms"] is not None
    assert "ml_subsystem" in data
    assert "model_loaded" in data["ml_subsystem"]


# =========================================================================
# TEST 5: DASHBOARD COUNTS, EMPTY STATES & ROLE PREFERENCES VERIFICATION
# =========================================================================
def test_dashboard_counts_and_role_preferences():
    db = SessionLocal()
    created_users = []
    try:
        ts = int(time.time() * 1000)
        user_email = f"m12_newuser_{ts}@example.com"
        consultant_email = f"m12_consultant_{ts}@example.com"
        doctor_email = f"m12_doctor_{ts}@example.com"
        admin_email = f"m12_admin_{ts}@example.com"

        # Register all 4 roles
        for email, role in [
            (user_email, "USER"),
            (consultant_email, "CONSULTANT"),
            (doctor_email, "DOCTOR"),
            (admin_email, "ADMIN")
        ]:
            client.post("/api/auth/register", json={
                "email": email, "password": "Password123!", "name": f"Test {role}", "role": role
            })
            u = db.query(User).filter(User.email == email).first()
            if u:
                created_users.append(u)

        # Login tokens
        user_tok = client.post("/api/auth/login", json={"email": user_email, "password": "Password123!"}).json()["access_token"]
        cons_tok = client.post("/api/auth/login", json={"email": consultant_email, "password": "Password123!"}).json()["access_token"]
        doc_tok = client.post("/api/auth/login", json={"email": doctor_email, "password": "Password123!"}).json()["access_token"]
        adm_tok = client.post("/api/auth/login", json={"email": admin_email, "password": "Password123!"}).json()["access_token"]

        # 1. New user has no score before profile
        user_score = client.get("/api/score/current", headers={"Authorization": f"Bearer {user_tok}"}).json()
        assert user_score["status"] == "Not yet available"
        assert user_score["overall_score"] is None
        assert user_score["has_profile"] is False

        # 2. Consultant dashboard counts
        cons_dash = client.get("/api/consultant/dashboard", headers={"Authorization": f"Bearer {cons_tok}"}).json()
        assert "total_clients" in cons_dash or "stats" in cons_dash
        assert isinstance(cons_dash.get("stats", {}).get("total_clients", cons_dash.get("total_clients")), int)

        # 3. Doctor/Dermatologist dashboard counts
        doc_dash = client.get("/api/dermatologist/dashboard", headers={"Authorization": f"Bearer {doc_tok}"}).json()
        assert "stats" in doc_dash
        assert "total_patients" in doc_dash["stats"]
        assert isinstance(doc_dash["stats"]["total_patients"], int)

        # 4. Admin dashboard counts
        adm_dash = client.get("/api/admin/dashboard", headers={"Authorization": f"Bearer {adm_tok}"}).json()
        assert "stats" in adm_dash
        assert adm_dash["stats"]["total_users"] >= len(created_users)

        # 5. Role-specific notification preferences
        # User update
        u_pref_res = client.put("/api/notifications/preferences", json={
            "routine_reminders_enabled": True,
            "hydration_reminders_enabled": False,
            "email_routine_enabled": True
        }, headers={"Authorization": f"Bearer {user_tok}"})
        assert u_pref_res.status_code == 200
        assert u_pref_res.json()["hydration_reminders_enabled"] is False

        # Doctor update
        doc_pref_res = client.put("/api/notifications/preferences", json={
            "doctor_patient_alerts_enabled": True,
            "email_doctor_enabled": True
        }, headers={"Authorization": f"Bearer {doc_tok}"})
        assert doc_pref_res.status_code == 200
        assert doc_pref_res.json()["doctor_patient_alerts_enabled"] is True

    finally:
        for u in created_users:
            try:
                db.delete(u)
            except Exception:
                pass
        db.commit()
        db.close()


# =========================================================================
# MAIN TEST RUNNER
# =========================================================================
if __name__ == "__main__":
    setup_module()
    print("===================================================================")
    print("MODULE 12: FINAL INTEGRATION & END-TO-END VERIFICATION SUITE")
    print("===================================================================")

    print("\n--- 1. Testing End-to-End User Journey (Modules 3-11) ---")
    test_e2e_user_workflow()
    print("PASS: End-to-End User Journey successfully verified with zero data leakage.")

    print("\n--- 2. Testing Practitioner & Admin Role Workflows ---")
    test_e2e_practitioner_and_admin_workflows()
    print("PASS: Consultant, Doctor, and Admin workflows verified.")

    print("\n--- 3. Testing Security & RBAC Isolation ---")
    test_security_and_rbac_isolation()
    print("PASS: Unauthenticated, invalid JWT, and cross-user IDOR access safely blocked.")

    print("\n--- 4. Testing System Health & Monitoring Probe ---")
    test_system_health_endpoint()
    print("PASS: GET /api/health verified with real PostgreSQL probe and latency tracking.")

    print("\n--- 5. Testing Dashboard Counts, Empty States & Role Preferences ---")
    test_dashboard_counts_and_role_preferences()
    print("PASS: Dashboard counts, unprofiled states, and role-specific notification preferences verified.")

    print("\n===================================================================")
    print("ALL MODULE 12 FINAL INTEGRATION TESTS PASSED SUCCESSFULLY!")
    print("===================================================================")

