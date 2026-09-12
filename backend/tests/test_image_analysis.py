import sys, os
_backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)
import base64
import io
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app
from app.auth.service import create_access_token
from app.models import User
from app.db.session import SessionLocal


client = TestClient(app)

def test_image_analysis_e2e():
    db = SessionLocal()
    user = db.query(User).filter(User.email == "test_img_user@skincare.com").first()
    if not user:
        user = User(full_name="Image Scanner", email="test_img_user@skincare.com", password="Password123!", role="USER")
        db.add(user)
        db.commit()
        db.refresh(user)
    db.close()

    token = create_access_token(data={"sub": user.email})
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Test Webcam Upload Route
    img = Image.new('RGB', (150, 150), color = 'red')
    buffered = io.BytesIO()
    img.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    dummy_jpg_base64 = f"data:image/jpeg;base64,{img_str}"

    webcam_payload = {
        "image_data": dummy_jpg_base64,
        "filename": "webcam_test.jpg"
    }

    webcam_res = client.post("/api/image-analysis/webcam", data=webcam_payload, headers=headers)
    assert webcam_res.status_code == 200

    webcam_data = webcam_res.json()
    assert webcam_data["upload_source"] == "WEBCAM"
    assert "prediction" in webcam_data
    analysis_id = webcam_data["id"]

    # 4. Test History Route
    history_res = client.get("/api/image-analysis/history", headers=headers)
    assert history_res.status_code == 200
    assert len(history_res.json()) >= 1

    # 5. Test Get Detail Route
    detail_res = client.get(f"/api/image-analysis/{analysis_id}", headers=headers)
    assert detail_res.status_code == 200
    assert detail_res.json()["id"] == analysis_id

    # 6. Test Delete Route
    delete_res = client.delete(f"/api/image-analysis/{analysis_id}", headers=headers)
    assert delete_res.status_code == 200

    print("[OK] Image Analysis E2E backend integration test passed successfully!")

if __name__ == "__main__":
    test_image_analysis_e2e()
