import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_user_sharing_preferences():
    """Test retrieving user data sharing consent permissions."""
    response = client.get("/clinical/user/sharing-preferences?user_id=1")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    prefs = data["preferences"]
    assert prefs["user_id"] == 1
    assert "consultant" in prefs
    assert "doctor" in prefs
    assert prefs["consultant"]["biomarkers"] is True
    assert len(data["specialists"]) >= 2


def test_update_user_sharing_preferences():
    """Test updating user sharing preferences."""
    payload = {
        "user_id": 1,
        "consultant": {
            "shared": True,
            "photos_and_lesions": False,
            "medical_and_rx_history": False
        },
        "doctor": {
            "shared": True,
            "medical_and_rx_history": True
        }
    }
    response = client.post("/clinical/user/sharing-preferences", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["preferences"]["consultant"]["photos_and_lesions"] is False


def test_consultant_dossier_redaction_on_revoked_consent():
    """Test that consultant dossier redacts photos and prescriptions when consent is revoked."""
    # Ensure user 1 has photos_and_lesions = False for consultant
    client.post("/clinical/user/sharing-preferences", json={
        "user_id": 1,
        "consultant": {"photos_and_lesions": False, "medical_and_rx_history": False}
    })

    response = client.get("/clinical/patient-dossier/1?role=consultant")
    assert response.status_code == 200
    data = response.json()
    dossier = data["dossier"]
    
    # Progress comparison photos should be restricted
    assert dossier["progress_comparison"]["restricted"] is True
    assert "Patient has not granted permission" in dossier["progress_comparison"]["reason"]

    # Active prescription should be confidential for consultant
    assert "Restricted" in dossier["clinical_record"]["active_prescription"]


def test_dermatologist_dossier_authorized_access():
    """Test that dermatologist receives full access when authorized."""
    response = client.get("/clinical/patient-dossier/1?role=dermatologist")
    assert response.status_code == 200
    data = response.json()
    dossier = data["dossier"]
    assert "restricted" not in dossier["biomarker_assessment"] or dossier["biomarker_assessment"]["restricted"] is False
    assert "Adapalene" in dossier["clinical_record"]["active_prescription"]


def test_book_consultation():
    """Test booking a specialist consultation."""
    payload = {
        "user_id": 1,
        "specialist_id": 3,
        "specialist_name": "Dr. Julian Rostova, MD",
        "specialist_role": "dermatologist",
        "type": "Urgent Rosacea Assessment",
        "notes": "Redness flare-up evaluation."
    }
    response = client.post("/clinical/user/book-consultation", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["appointment"]["specialist_name"] == "Dr. Julian Rostova, MD"
    assert data["appointment"]["status"] == "confirmed"
