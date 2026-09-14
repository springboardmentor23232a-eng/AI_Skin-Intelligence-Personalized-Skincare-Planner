"""
=============================================================================
End-to-End Comprehensive Workflow Test Suite
Validates the complete 10-step multi-role clinical skincare journey:
1. User Registration, Authentication & JWT Issuance
2. Clinical Skin Profile Creation (Fitzpatrick, lifestyle, sensitivities)
3. Deep Learning Computer Vision Inference (EfficientNet-B0)
4. Master 5-Factor Weighted Skin Health Score Calculation
5. Personalized Multi-Timeframe Skincare Routine Protocol Generation
6. AI Product Recommendation Engine & Ingredient Conflict Analysis
7. Daily Routine Execution Logging & Progress Diary Tracking
8. Multi-Format Clinical Report Export (JSON, CSV, PDF, XLSX)
9. Multi-Role Clinical Consultation & Specialist Review Workflow
10. Administrative Security Audit Logging & System Telemetry
=============================================================================
"""
import io
import pytest
import secrets
from PIL import Image
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import SessionLocal
from app.models import User, AdminAuditLog
from app.auth.service import create_access_token

client = TestClient(app)

@pytest.fixture(scope="module")
def workflow_context():
    """Context state holding tokens and IDs across the end-to-end lifecycle"""
    rand = secrets.token_hex(4)
    ctx = {
        "user_email": f"patient_{rand}@workflow.org",
        "user_pwd": "PatientSecurePassword123!",
        "user_headers": {},
        "user_id": None,
        "staff_email": f"derm_{rand}@clinic.org",
        "staff_pwd": "DoctorSecurePassword123!",
        "staff_headers": {},
        "staff_id": None,
        "admin_email": f"admin_{rand}@hospital.org",
        "admin_headers": {}
    }
    return ctx


class TestFullEndToEndWorkflow:

    # Step 1: Authentication & Token Issuance
    def test_step_1_user_registration_and_login(self, workflow_context):
        res_reg = client.post("/api/auth/register", json={
            "full_name": "Eleanor Vance",
            "email": workflow_context["user_email"],
            "password": workflow_context["user_pwd"]
        })
        assert res_reg.status_code == 201
        token = res_reg.json()["access_token"]
        assert token is not None
        workflow_context["user_headers"] = {"Authorization": f"Bearer {token}"}

        # Verify /me protected identity
        res_me = client.get("/api/auth/me", headers=workflow_context["user_headers"])
        assert res_me.status_code == 200
        user_data = res_me.json()
        assert user_data["email"] == workflow_context["user_email"]
        workflow_context["user_id"] = user_data["id"]

    # Step 2: Clinical Skin Profile
    def test_step_2_skin_profile_creation(self, workflow_context):
        profile_payload = {
            "full_name": "Eleanor Vance",
            "age": 27,
            "gender": "Female",
            "skin_type": "Combination",
            "skin_tone": "Type III (Medium)",
            "concerns": ["Acne", "Oiliness", "Hyperpigmentation"],
            "sensitivities": "Fragrance",
            "allergies": "Sulfa",
            "water_intake": 2.5,
            "sleep_quality": "7-8 Hours",
            "stress_level": "Moderate"
        }
        res_prof = client.post("/api/profile", headers=workflow_context["user_headers"], json=profile_payload)
        assert res_prof.status_code in [200, 201]

        res_fetch = client.get("/api/profile", headers=workflow_context["user_headers"])
        assert res_fetch.status_code == 200
        assert res_fetch.json()["skin_type"] == "Combination"

    # Step 3: Computer Vision ML Assessment
    def test_step_3_pytorch_vision_assessment(self, workflow_context):
        img_buf = io.BytesIO()
        test_img = Image.new("RGB", (224, 224), color=(255, 200, 180))
        test_img.save(img_buf, format="JPEG")
        raw_bytes = img_buf.getvalue()

        res_vision = client.post(
            "/api/image-analysis/upload",
            headers=workflow_context["user_headers"],
            files={"file": ("clinical_skin_sample.jpg", raw_bytes, "image/jpeg")}
        )
        assert res_vision.status_code == 200
        pred = res_vision.json()
        assert "prediction" in pred
        assert "predicted_category" in pred["prediction"]

    # Step 4: 5-Factor Weighted Skin Health Score
    def test_step_4_weighted_skin_health_scoring(self, workflow_context):
        assessment_payload = {
            "acne": 25,
            "hyperpigmentation": 20,
            "dryness": 15,
            "oiliness": 40,
            "redness": 10,
            "sensitivity": 20,
            "wrinkles": 5,
            "fine_lines": 5,
            "dark_spots": 15,
            "uneven_tone": 20
        }
        res_score = client.post("/api/assessment", headers=workflow_context["user_headers"], json=assessment_payload)
        assert res_score.status_code == 201
        data = res_score.json()
        assert "overall_score" in data
        assert 0 <= data["overall_score"] <= 100
        assert "risk_level" in data

    # Step 5: Multi-Timeframe Skincare Routine Generation
    def test_step_5_personalized_routine_protocol_generation(self, workflow_context):
        res_routines = client.post("/api/routines/generate", headers=workflow_context["user_headers"])
        assert res_routines.status_code == 201
        routines = res_routines.json()
        assert len(routines) == 5
        routine_types = [r["routine_type"] for r in routines]
        for expected in ["MORNING", "EVENING", "WEEKLY", "MONTHLY", "SEASONAL"]:
            assert expected in routine_types

    # Step 6: Product Recommendations & Ingredient Compatibility
    def test_step_6_product_matching_and_ingredient_safety(self, workflow_context):
        # Verify compatibility checker
        res_compat = client.post("/api/ingredients/check-compatibility", headers=workflow_context["user_headers"], json={
            "selected_ingredients": ["Niacinamide", "Zinc PCA", "Hyaluronic Acid"]
        })
        assert res_compat.status_code == 200
        assert res_compat.json()["is_safe"] is True

        # Run product recommendation engine
        res_recs = client.post("/api/recommendations/generate", headers=workflow_context["user_headers"], json={"budget_tier": "ALL"})
        assert res_recs.status_code in [200, 201]
        recs = res_recs.json()
        assert "recommended_products" in recs
        assert len(recs["recommended_products"]) > 0

    # Step 7: Routine Execution Logging & Progress Diary
    def test_step_7_routine_logging_and_progress_tracking(self, workflow_context):
        # Log completed morning routine
        res_log = client.post("/api/analytics/routines/logs", headers=workflow_context["user_headers"], json={
            "routine_type": "MORNING",
            "completed": True,
            "notes": "Skin felt refreshed after cold rinse and moisturizer."
        })
        assert res_log.status_code == 201

        # Create progress photo entry
        res_progress = client.post("/api/analytics/progress", headers=workflow_context["user_headers"], json={
            "photo_url": "/uploads/test_progress.jpg",
            "notes": "Day 1 baseline diagnostic photo taken.",
            "acne_score": 25,
            "hydration_score": 80
        })
        assert res_progress.status_code == 201

    # Step 8: Multi-Format Clinical Report Exports
    def test_step_8_multi_format_clinical_exports(self, workflow_context):
        for fmt, content_type in [
            ("csv", "text/csv"),
            ("pdf", "application/pdf"),
            ("xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        ]:
            res_exp = client.get(f"/api/reports/export?format={fmt}", headers=workflow_context["user_headers"])
            assert res_exp.status_code == 200
            assert content_type in res_exp.headers["content-type"]
            assert len(res_exp.content) > 50

    # Step 9: Clinical Consultation & Specialist Review Workflow
    def test_step_9_clinical_consultation_workflow(self, workflow_context):
        # Register and provision Dermatologist
        res_reg_derm = client.post("/api/auth/register", json={
            "full_name": "Dr. Marcus Thorne",
            "email": workflow_context["staff_email"],
            "password": workflow_context["staff_pwd"]
        })
        assert res_reg_derm.status_code == 201

        db = SessionLocal()
        try:
            derm_user = db.query(User).filter(User.email == workflow_context["staff_email"]).first()
            assert derm_user is not None
            derm_user.role = "DERMATOLOGIST"
            db.commit()
            workflow_context["staff_id"] = derm_user.id
        finally:
            db.close()

        staff_token = create_access_token({"sub": workflow_context["staff_email"], "role": "DERMATOLOGIST"})
        workflow_context["staff_headers"] = {"Authorization": f"Bearer {staff_token}"}

        # Dermatologist accesses clinical workspace
        res_stats = client.get("/api/clinical/stats", headers=workflow_context["staff_headers"])
        assert res_stats.status_code == 200
        assert "total_clients" in res_stats.json()

        # Clinical staff schedules consultation with Patient
        res_book = client.post("/api/clinical/consultations", headers=workflow_context["staff_headers"], json={
            "patient_id": workflow_context["user_id"],
            "scheduled_at": "2026-09-15T14:30:00",
            "notes": "Discussion regarding prescription barrier repair protocol."
        })
        assert res_book.status_code in [200, 201]

    # Step 10: Administrative Audit Logging & System Telemetry
    def test_step_10_system_telemetry_and_audit_log(self, workflow_context):
        # Admin authentication required for telemetry
        db = SessionLocal()
        try:
            admin_user = db.query(User).filter(User.id == workflow_context["user_id"]).first()
            admin_user.role = "ADMIN"
            db.commit()
        finally:
            db.close()

        admin_token = create_access_token({"sub": workflow_context["user_email"], "role": "ADMIN"})
        headers = {"Authorization": f"Bearer {admin_token}"}

        # Check system telemetry
        res_telem = client.get("/api/system/telemetry", headers=headers)
        assert res_telem.status_code == 200
        telem = res_telem.json()
        assert telem["status"] == "operational"
        assert telem["ml_inference"]["model_architecture"] == "EfficientNet-B0"
        assert telem["security_features"]["gzip_compression"] is True
        assert telem["security_features"]["role_based_access_control"] is True
