import requests
import base64
import io
from PIL import Image

def test_image_analysis_e2e():
    base_url = "http://127.0.0.1:8000/api"

    
    # 1. Register a test user
    email = "test_img_user@skincare.com"
    reg_payload = {
        "full_name": "Image Scanner",
        "email": email,
        "password": "Password123!"
    }
    requests.post(f"{base_url}/auth/register", json=reg_payload)
    
    # 2. Login to get token
    login_payload = {
        "email": email,
        "password": "Password123!"
    }
    login_res = requests.post(f"{base_url}/auth/login", json=login_payload)
    assert login_res.status_code == 200



    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Test Webcam Upload Route (Pillow dynamic 150x150 image)
    img = Image.new('RGB', (150, 150), color = 'red')
    buffered = io.BytesIO()
    img.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    dummy_jpg_base64 = f"data:image/jpeg;base64,{img_str}"
    
    webcam_payload = {
        "image_data": dummy_jpg_base64,
        "filename": "webcam_test.jpg"
    }

    webcam_res = requests.post(f"{base_url}/image-analysis/webcam", data=webcam_payload, headers=headers)
    assert webcam_res.status_code == 200


    webcam_data = webcam_res.json()
    assert webcam_data["upload_source"] == "WEBCAM"
    assert "Acne" in webcam_data["prediction"]["metrics"]
    analysis_id = webcam_data["id"]
    
    # 4. Test History Route
    history_res = requests.get(f"{base_url}/image-analysis/history", headers=headers)
    assert history_res.status_code == 200
    assert len(history_res.json()) >= 1
    
    # 5. Test Get Detail Route
    detail_res = requests.get(f"{base_url}/image-analysis/{analysis_id}", headers=headers)
    assert detail_res.status_code == 200
    assert detail_res.json()["id"] == analysis_id
    
    # 6. Test Delete Route
    delete_res = requests.delete(f"{base_url}/image-analysis/{analysis_id}", headers=headers)
    assert delete_res.status_code == 200
    
    print("[OK] Image Analysis E2E backend integration test passed successfully!")

if __name__ == "__main__":
    test_image_analysis_e2e()
