import pytest
import base64
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Setup test database environment
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_skin_assessment.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

import app.models
from app.main import app
from app.database import Base, get_db

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_and_teardown_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

from app.services.image_analysis_engine import (
    analyze_skin_image,
    extract_optical_features,
    classify_skin_type_and_disease
)

client = TestClient(app)

def test_optical_feature_extraction():
    """Test computer vision optical feature extraction from raw image bytes."""
    dummy_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4"
    features = extract_optical_features(dummy_bytes)
    
    assert "erythema_index" in features
    assert "gloss_index" in features
    assert "pigment_index" in features
    assert "texture_roughness" in features
    assert "lesion_color_var" in features
    assert "lesion_asymmetry" in features

def test_skin_type_and_disease_classification():
    """Test ML classification logic mapping optical features to skin type and lesion screening."""
    mock_features = {
        "erythema_index": 25.0,
        "gloss_index": 72.0,
        "pigment_index": 30.0,
        "texture_roughness": 40.0,
        "lesion_color_var": 20.0,
        "lesion_asymmetry": 15.0,
        "average_luminance": 140.0
    }
    
    res = classify_skin_type_and_disease(mock_features)
    
    assert res["detected_skin_type"] == "Oily"
    assert res["type_confidence"] >= 75.0
    assert "skin_health_score" in res
    assert "lesion_screening" in res
    assert "conditions_detected" in res
    assert len(res["conditions_detected"]) >= 4

def test_fastapi_scan_image_endpoint():
    """Test REST API endpoint POST /assessment/scan-image."""
    sample_b64 = "data:image/jpeg;base64," + base64.b64encode(b"Sample_Facial_Image_Bytes_For_ML_Testing").decode()
    payload = {
        "image_data": sample_b64
    }
    
    response = client.post("/assessment/scan-image", json=payload)
    assert response.status_code == 201
    
    data = response.json()
    assert data["success"] is True
    assert "detected_skin_type" in data
    assert "skin_health_score" in data
    assert "lesion_screening" in data
    assert "conditions_detected" in data
    assert "generated_routine" in data
