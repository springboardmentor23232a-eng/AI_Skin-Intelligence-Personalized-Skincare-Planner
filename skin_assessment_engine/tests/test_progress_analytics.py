import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_progress_history_endpoint():
    """Test retrieving historical skin progress checkpoints"""
    response = client.get("/progress/history/1")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["total_checkpoints"] >= 4
    assert data["overall_improvement_pts"] > 0
    assert len(data["history"]) >= 4
    # Check baseline vs current
    baseline = data["history"][0]
    current = data["history"][-1]
    assert baseline["tag"] == "Baseline (Day 1)"
    assert current["tag"] == "Current (Day 30)"
    assert current["overall_skin_health_score"] > baseline["overall_skin_health_score"]


def test_progress_log_create_endpoint():
    """Test creating a new progress checkpoint"""
    payload = {
        "user_id": 1,
        "checkpoint_title": "Interim Assessment Checkpoint",
        "tag": "Milestone",
        "overall_skin_health_score": 80.2,
        "hydration_level": 76.0,
        "oiliness_level": 50.0,
        "sensitivity_level": 16.0,
        "acne_severity": 10.0,
        "pigmentation_score": 18.0,
        "wrinkles_score": 10.0,
        "barrier_strength": 88.0,
        "redness_reactivity": 14.0,
        "photo_url": "assets/hero_skin_scan.png",
        "routine_adherence_rate": 98.0,
        "clinical_notes": "Continuous barrier consolidation, healthy glow observed.",
        "key_improvements": ["+28% Hydration", "-76% Acne Severity"],
        "active_concerns_snapshot": ["Maintenance"]
    }
    response = client.post("/progress/log", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["checkpoint"]["overall_skin_health_score"] == 80.2


def test_routine_adherence_analytics_endpoint():
    """Test routine adherence analytics, streaks and 30-day compliance matrix"""
    response = client.get("/progress/adherence/1")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["current_streak_days"] >= 14
    assert data["monthly_compliance_pct"] >= 80.0
    assert len(data["calendar_30_days"]) == 30
    assert len(data["adherence_insights"]) > 0


def test_daily_adherence_checkin_endpoint():
    """Test daily routine checkin logging and streak update"""
    payload = {
        "user_id": 1,
        "morning_completed": 4,
        "morning_total": 4,
        "evening_completed": 5,
        "evening_total": 5,
        "water_intake_ml": 2500,
        "sunscreen_reapplied": 2,
        "notes": "Completed full AM & PM routine with SPF 50."
    }
    response = client.post("/progress/adherence/checkin", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["compliance_pct"] == 100.0
    assert data["current_streak_days"] >= 1


def test_before_after_comparison_endpoint():
    """Test optical before/after comparison computation"""
    payload = {
        "user_id": 1,
        "baseline_checkpoint_id": 1,
        "current_checkpoint_id": 4
    }
    response = client.post("/progress/compare", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["days_elapsed"] == 30
    assert data["score_delta"] > 0
    assert len(data["biomarker_deltas"]) >= 5
    assert any("Hydration" in d["parameter"] for d in data["biomarker_deltas"])
    assert any("Acne" in d["parameter"] for d in data["biomarker_deltas"])
    assert len(data["top_positive_drivers"]) > 0


def test_trend_analysis_endpoint():
    """Test 60-day historical and 30-day AI predictive forecast trend analysis"""
    response = client.get("/progress/trends/1?timeframe=30d")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["timeframe"] == "30d"
    assert data["improvement_velocity_pts_per_week"] > 0
    assert data["projected_score_30d"] > 80.0
    assert len(data["trajectory_curve"]) >= 50
    # Verify projected points are flagged
    has_projected = any(p["is_projected"] is True for p in data["trajectory_curve"])
    has_historical = any(p["is_projected"] is False for p in data["trajectory_curve"])
    assert has_projected is True
    assert has_historical is True


def test_improvement_analysis_endpoint():
    """Test clinical improvement analysis and recommendation verdict"""
    response = client.get("/progress/improvement-analysis/1")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["top_improving_factors"]) > 0
    assert "ai_dermatologist_verdict" in data
    assert len(data["next_stage_routine_adjustments"]) > 0


def test_progress_summary_endpoint():
    """Test executive progress dashboard summary bundle"""
    response = client.get("/progress/summary/1")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["current_health_score"] >= 70.0
    assert "latest_comparison" in data
    assert "quick_trends" in data
    assert len(data["active_milestones"]) >= 3
