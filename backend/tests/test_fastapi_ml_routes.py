import sys, os
_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)
import io
import base64
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app
from app.auth.service import create_access_token
from app.models import User, ImageAnalysis
from app.db.session import SessionLocal

client = TestClient(app)

def test_fastapi_ml_upload_route():
    print("\n--- Testing FastAPI POST /api/image-analysis/upload with Real PyTorch ML Model ---")
    db = SessionLocal()
    user = db.query(User).first()
    if not user:
        user = User(full_name="ML Test User", email="ml_test@skincare.com", password="Password123!", role="USER")
        db.add(user)
        db.commit()
        db.refresh(user)
    db.close()

    token = create_access_token(data={"sub": user.email})

    headers = {"Authorization": f"Bearer {token}"}

    # Create dummy JPEG image bytes
    img = Image.new('RGB', (300, 300), color='red')
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    buf.seek(0)

    files = {'file': ('test_skin.jpg', buf, 'image/jpeg')}
    res = client.post("/api/image-analysis/upload", files=files, headers=headers)

    if res.status_code != 200:
        print(f"Error Status Code: {res.status_code}, Body: {res.text}")
    assert res.status_code == 200

    data = res.json()
    assert data["upload_source"] == "GALLERY"
    assert "prediction" in data
    assert "predicted_category" in data["prediction"]
    assert "model" in data["prediction"]
    assert data["prediction"]["model"]["name"] == "EfficientNet-B0"
    assert data["prediction"]["model"]["version"] == "2.0.0"

    print(f"[PASS] Upload Route ML Integration Success:")
    print(f"       Predicted Category: {data['prediction']['predicted_category']}")
    print(f"       Model Confidence: {data['confidence'] * 100:.2f}%")
    print(f"       Processing Time: {data['processing_time']}ms")

def test_fastapi_ml_webcam_route():
    print("\n--- Testing FastAPI POST /api/image-analysis/webcam with Real PyTorch ML Model ---")
    db = SessionLocal()
    user = db.query(User).first()
    token = create_access_token(data={"sub": user.email})

    db.close()
    headers = {"Authorization": f"Bearer {token}"}

    # Create dummy base64 webcam payload
    img = Image.new('RGB', (250, 250), color='blue')
    buf = io.BytesIO()
    img.save(buf, format='JPEG')
    b64_str = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode('utf-8')

    payload = {
        "image_data": b64_str,
        "filename": "webcam_capture_test.jpg"
    }

    res = client.post("/api/image-analysis/webcam", data=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["upload_source"] == "WEBCAM"
    assert "prediction" in data
    assert "predicted_category" in data["prediction"]
    assert data["prediction"]["model"]["version"] == "2.0.0"

    print(f"[PASS] Webcam Route ML Integration Success:")
    print(f"       Predicted Category: {data['prediction']['predicted_category']}")
    print(f"       Model Confidence: {data['confidence'] * 100:.2f}%")

if __name__ == '__main__':
    test_fastapi_ml_upload_route()
    test_fastapi_ml_webcam_route()
    print("\n[ALL FASTAPI ML ROUTE INTEGRATION TESTS PASSED!] ")
