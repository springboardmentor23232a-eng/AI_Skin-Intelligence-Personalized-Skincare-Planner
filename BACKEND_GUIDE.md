# ⚡ Backend Micro-Services & API Architecture Guide (`backend`)

This guide documents the FastAPI backend structure, API routers, database integration, ORM models, image processing pipeline, and error-handling mechanisms.

---

## 1. Backend Folder Structure

```
backend/
├── app/
│   ├── auth/                  # Authentication Module
│   │   ├── router.py          # /api/auth registration, login, refresh, logout
│   │   ├── schemas.py         # Pydantic schemas for auth payloads
│   │   └── service.py         # Password hashing, JWT token creation & validation
│   ├── db/
│   │   └── session.py         # PostgreSQL SQLAlchemy engine & SessionLocal provider
│   ├── models.py              # SQLAlchemy ORM Model definitions
│   ├── routes/                # Micro-Service API Routers
│   │   ├── image_analysis.py  # Image upload, webcam Base64, processing, & AI scan router
│   │   ├── phase3.py          # Profile, Assessment, Routines, Ingredients, Recommendations
│   │   ├── phase4.py          # Daily Routine Logs & Progress Photo Diary
│   │   ├── phase5.py          # Clinical Workspace, Consultant & Dermatologist Triage
│   │   ├── phase6.py          # Notifications & Automated Reminder Engine
│   │   └── phase7.py          # Multi-Format PDF, CSV, Excel Export Streamer
│   └── schemas_*.py           # Pydantic validation schemas per domain
├── uploads/                   # Local file storage directory for processed image scans
├── requirements.txt           # Python backend dependencies (FastAPI, SQLAlchemy, Pillow, etc.)
├── verify_all_phases.py       # Unified 33-item E2E system verification test suite
└── test_image_analysis.py     # Image Analysis module E2E integration test
```

---

## 2. API Router Map & Micro-Services

### 2.1 Image Analysis Module (`image_analysis.py`)
- **`POST /api/image-analysis/upload`**: Accepts Multipart form-data image file uploads.
- **`POST /api/image-analysis/webcam`**: Accepts Base64 encoded JPEG/PNG strings from browser camera frames.
- **`GET /api/image-analysis/history`**: Returns historical facial scans for the authenticated user.
- **`DELETE /api/image-analysis/{id}`**: Removes scan record and deletes image file from `/uploads`.

### 2.2 Core Skincare Engine (`phase3.py`)
- **`POST /api/profile` & `GET /api/profile`**: Manages clinical skin profiles.
- **`POST /api/assessment/execute`**: Computes health scores, risk ratings, and barrier priorities.
- **`POST /api/routines/generate`**: Dynamically generates 5-tier adaptive regimens (`MORNING`, `EVENING`, `WEEKLY`, `MONTHLY`, `SEASONAL`).
- **`POST /api/ingredients/check-compatibility`**: Runs chemical safety analysis on active pairs.
- **`POST /api/recommendations/generate`**: Matches products against user profiles with formula match scores.

### 2.3 Clinical Workspace & Medical Triage (`phase5.py`)
- **`GET /api/clinical/stats`**: Provides aggregate clinical statistics for providers.
- **`GET /api/clinical/patients`**: Filterable patient directory (search, risk levels, Fitzpatrick scales).
- **`POST /api/clinical/consultations`**: Logs clinical consultation notes.

### 2.4 Data Exporter Engine (`phase7.py`)
- **`GET /api/reports/export`**: Streamed response returning `text/csv`, `application/pdf`, or `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.

---

## 3. Server-Side Image Processing Pipeline (`Pillow`)

```python
# Processing Pipeline Logic in image_analysis.py
def process_and_save_image(image_bytes: bytes, filename: str) -> tuple[str, int, int]:
    image = Image.open(io.BytesIO(image_bytes))
    
    # 1. Orientation Fix (EXIF Tag 274)
    image = ImageOps.exif_transpose(image)
    
    # 2. RGB Conversion
    if image.mode in ("RGBA", "P"):
        image = image.convert("RGB")
        
    # 3. Spatial Resizing (Lanczos Filter)
    image.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
    
    # 4. Optimized JPEG Compression
    output_filename = f"{uuid.uuid4()}.jpg"
    output_path = os.path.join(UPLOAD_DIR, output_filename)
    image.save(output_path, "JPEG", quality=85, optimize=True)
    
    return output_filename, image.width, image.height
```

---

## 4. Error Handling & Validation

- **Pydantic Validation**: Automatically rejects malformed JSON or invalid parameter types with `422 Unprocessable Entity`.
- **FastAPI HTTPExceptions**: Returns standardized JSON error envelopes:
```json
{
  "detail": "Unsupported file type. Please upload JPEG, PNG, WEBP, or HEIC."
}
```
