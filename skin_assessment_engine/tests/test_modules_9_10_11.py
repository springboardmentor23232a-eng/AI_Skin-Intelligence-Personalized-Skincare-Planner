import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

os.environ["DATABASE_URL"] = "sqlite:///./test_skin_assessment.db"

from app.main import app
from app.database import Base, get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_skin_assessment.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_and_teardown_db():
    Base.metadata.create_all(bind=engine)
    yield
    # Keep tables intact or drop if needed

client = TestClient(app)

# =========================================================================
# MODULE 9: DASHBOARD & ANALYTICS TESTS
# =========================================================================

def test_user_dashboard_analytics():
    """Verify User Dashboard returns weighted 5-factor skin health score and checklist."""
    response = client.get("/dashboard/user/1")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["user_id"] == 1
    assert "overall_health_score" in data
    assert len(data["score_breakdown"]) == 5
    assert "daily_checklist" in data
    assert data["daily_checklist"]["total_steps"] >= 4
    assert data["current_streak"] >= 1
    assert "hydration_intake_ml" in data
    assert "sleep_hours" in data

def test_daily_checklist_toggle():
    """Verify toggling morning/evening skincare checklist items."""
    payload = {
        "user_id": 1,
        "routine_type": "morning",
        "step_id": "am_spf",
        "completed": True
    }
    response = client.post("/dashboard/checklist/toggle", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["step_id"] == "am_spf"
    assert data["completed"] is True
    assert "completion_pct" in data

def test_consultant_dashboard_analytics():
    """Verify Consultant Dashboard returns client roster, adherence metrics, and risk distribution."""
    response = client.get("/dashboard/consultant?consultant_id=2")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["total_clients"] >= 3
    assert len(data["clients"]) >= 3
    assert "skin_type_distribution" in data
    assert "top_concerns" in data

def test_dermatologist_dashboard_analytics():
    """Verify Dermatologist Dashboard returns patient triage, ISIC lesion screening, and condition severities."""
    response = client.get("/dashboard/dermatologist?doctor_id=3")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["total_patients"] >= 3
    assert len(data["patients"]) >= 3
    assert "optical_lesion_metrics" in data
    assert data["optical_lesion_metrics"]["benign_screened_pct"] >= 90.0

def test_admin_dashboard_analytics():
    """Verify Admin Dashboard returns user distributions, 12 microservices telemetry, and audit logs."""
    response = client.get("/dashboard/admin")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["total_users"] >= 1000
    assert len(data["microservices_status"]) == 12
    assert "top_recommended_products" in data
    assert len(data["recent_audit_logs"]) >= 1


# =========================================================================
# MODULE 10: NOTIFICATION & REMINDER SYSTEM TESTS
# =========================================================================

def test_get_notifications_with_categories():
    """Verify notifications retrieval and category filtering."""
    response = client.get("/notifications/user/1")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["total_count"] >= 3
    assert "unread_count" in data

    # Filter by category
    resp_routine = client.get("/notifications/user/1?category=routine")
    assert resp_routine.status_code == 200
    data_routine = resp_routine.json()
    for notif in data_routine["notifications"]:
        assert notif["category"] == "routine"

def test_mark_notification_as_read():
    """Verify single notification mark-read."""
    response = client.patch("/notifications/1/read")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True

def test_reminder_preferences():
    """Verify getting and updating reminder preferences."""
    resp_get = client.get("/notifications/reminders/1")
    assert resp_get.status_code == 200
    pref = resp_get.json()
    assert "morning_routine_time" in pref
    assert "hydration_target_ml" in pref

    # Update
    resp_put = client.put("/notifications/reminders/1", json={"hydration_target_ml": 3000, "enable_sleep_reminders": True})
    assert resp_put.status_code == 200
    updated = resp_put.json()
    assert updated["hydration_target_ml"] == 3000

def test_product_replenishment_tracking():
    """Verify product replenishment calculations and low-stock alerts."""
    response = client.get("/notifications/replenishment/1")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["active_items"]) >= 3
    assert "low_stock_alerts_count" in data

def test_hydration_and_sleep_logging():
    """Verify quick hydration intake and circadian sleep logging."""
    # Hydration
    resp_hyd = client.post("/notifications/hydration/log", json={"user_id": 1, "amount_ml": 250})
    assert resp_hyd.status_code == 200
    hyd_data = resp_hyd.json()
    assert hyd_data["success"] is True
    assert hyd_data["total_intake_ml"] >= 250

    # Sleep
    resp_sleep = client.post("/notifications/sleep/log", json={"user_id": 1, "sleep_hours": 8.0, "sleep_quality": "Optimal"})
    assert resp_sleep.status_code == 200
    sleep_data = resp_sleep.json()
    assert sleep_data["success"] is True
    assert sleep_data["circadian_repair_score"] >= 80.0


# =========================================================================
# MODULE 11: REPORTS & EXPORT SYSTEM TESTS
# =========================================================================

def test_generate_clinical_reports_all_types():
    """Verify generating each of the 5 report types."""
    report_types = ["assessment", "routine", "product_recs", "progress", "skin_health"]
    for rep_type in report_types:
        payload = {
            "user_id": 1,
            "report_type": rep_type,
            "format": "pdf"
        }
        response = client.post("/reports/generate", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["report_type"] == rep_type
        assert "report_data" in data
        assert len(data["report_data"]) > 0

def test_export_report_pdf_html():
    """Verify PDF printable HTML compilation."""
    response = client.get("/reports/1/pdf")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert "PanaceaAI" in response.text
    assert "Clinical Dermatology & Skin Intelligence Platform" in response.text
    assert "Alex Rivera" in response.text

def test_export_csv_data():
    """Verify structured CSV data exports."""
    csv_types = ["progress", "routine_logs", "products", "client_assessments"]
    for ctype in csv_types:
        response = client.get(f"/reports/export/{ctype}")
        assert response.status_code == 200
        assert "text/csv" in response.headers["content-type"]
        assert len(response.text.strip().split("\n")) >= 2
