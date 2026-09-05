import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_consultant_clients():
    """Test consultant clients retrieval with synchronized scores."""
    response = client.get("/clinical/consultant/clients")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["count"] >= 3
    clients = data["clients"]
    alex = next((c for c in clients if c["username"] == "user"), None)
    assert alex is not None
    assert alex["full_name"] == "Alex Rivera"
    assert alex["skin_type"] == "Combination"
    assert alex["overall_score"] == 79.4


def test_get_dermatologist_patients():
    """Test dermatologist patients retrieval with diagnoses and prescriptions."""
    response = client.get("/clinical/dermatologist/patients")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["count"] >= 3
    patients = data["patients"]
    alex = next((p for p in patients if p["username"] == "user"), None)
    assert alex is not None
    assert "Adapalene" in alex["prescription"]
    assert alex["lesion_screening"]["badge"] == "BENIGN (SAFE)"


def test_get_patient_dossier():
    """Test unified patient clinical dossier compilation."""
    response = client.get("/clinical/patient-dossier/1")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    dossier = data["dossier"]
    assert dossier["patient_info"]["full_name"] == "Alex Rivera"
    assert dossier["biomarker_assessment"]["overall_health_score"] == 79.4
    assert dossier["biomarker_assessment"]["biomarkers"]["hydration_level"] == 74.0
    assert dossier["routine_adherence"]["current_streak_days"] == 18


def test_update_consultant_regimen():
    """Test updating consultant recommendations."""
    payload = {
        "user_id": 1,
        "consultant_notes": "Hydration optimized; maintain barrier cream.",
        "status": "Regimen Adjusted",
        "priority": "Standard"
    }
    response = client.post("/clinical/consultant/update-regimen", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "Patient #1" in data["message"]


def test_update_dermatologist_prescription():
    """Test updating medical prescription by dermatologist."""
    payload = {
        "user_id": 1,
        "condition": "Mild Comedonal Acne",
        "prescription": "Topical Adapalene 0.1% + Azelaic Acid 15%",
        "clinical_notes": "Clinical clearance progressing smoothly.",
        "next_review": "24 Dec 2025",
        "status": "Under Active Regimen"
    }
    response = client.post("/clinical/dermatologist/update-prescription", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "prescription" in data["message"]
