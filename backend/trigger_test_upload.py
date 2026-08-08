import os
import httpx
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import User
from app.services import auth_service

DATABASE_URL = "postgresql://postgres:SVECW%402024@localhost:5432/skin_intelligence"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

user = db.query(User).filter(User.role == "USER").first()
if not user:
    print("No user with role USER found in db.")
    exit(1)

print(f"User email selected for test: {user.email}")
token_payload = {"sub": user.email, "role": user.role}
token = auth_service.create_access_token(data=token_payload)

# Select test image
img_path = r"c:\Users\LAXMI PRANEETHA\OneDrive\Desktop\AI-Skin\ml\skin_type_classification_dataset\test\combination\combination_-_0bc5ca1194a13cfd7b9a_jpg.rf.0c21ccb4c6c58bf8aacd4d27c5042db9.jpg"
if not os.path.exists(img_path):
    print(f"Test image not found at: {img_path}")
    exit(1)

print(f"Uploading file: {img_path}")
with open(img_path, "rb") as f:
    files = {"image": ("test.jpg", f.read(), "image/jpeg")}
    headers = {"Authorization": f"Bearer {token}"}
    
    print("Sending POST /api/assessment request...")
    r = httpx.post("http://localhost:8000/api/assessment", files=files, headers=headers, timeout=30.0)
    
    print("\n--- RESPONSE RESULT ---")
    print("Status Code:", r.status_code)
    try:
        print("JSON Response:", r.json())
    except Exception:
        print("Raw text response:", r.text)
