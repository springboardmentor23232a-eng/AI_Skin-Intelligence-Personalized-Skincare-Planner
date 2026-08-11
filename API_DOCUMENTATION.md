# 📡 Complete API Reference & Endpoint Specifications

This document lists all RESTful API endpoints, request methods, authorization headers, payload schemas, and response formats available in the **AI Skin Intelligence & Personalized Skincare Planner API**.

---

## 1. Authentication & User Account APIs (`/api/auth`)

### 1.1 Register User Account
- **Endpoint**: `POST /api/auth/register`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "full_name": "Jane Doe",
  "email": "jane@skincare.com",
  "password": "Password123!"
}
```
- **Response** (`201 Created`):
```json
{
  "access_token": "eyJhbGciOiJIUzI1Ni...",
  "refresh_token": "eyJhbGciOiJIUzI1Ni...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "full_name": "Jane Doe",
    "email": "jane@skincare.com",
    "role": "USER",
    "provider": "LOCAL"
  }
}
```

### 1.2 User Login
- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
```json
{
  "email": "jane@skincare.com",
  "password": "Password123!"
}
```
- **Response** (`200 OK`): Returns JWT access and refresh tokens.

### 1.3 Fetch Current Authenticated User (`/me`)
- **Endpoint**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response** (`200 OK`): Returns user profile and assigned role.

---

## 2. AI Skin Image Analysis APIs (`/api/image-analysis`)

### 2.1 Multipart Image File Upload
- **Endpoint**: `POST /api/image-analysis/upload`
- **Headers**: `Authorization: Bearer <access_token>`, `Content-Type: multipart/form-data`
- **Form Data**: `file` (Binary Image File)
- **Response** (`200 OK`):
```json
{
  "id": 12,
  "original_filename": "skin_scan.png",
  "stored_filename": "d3b07384-883a-4ef6.jpg",
  "upload_source": "GALLERY",
  "upload_time": "2026-08-05T17:09:20Z",
  "prediction": {
    "metrics": {
      "Acne": 76.0,
      "Redness": 95.0,
      "Dryness": 80.0
    },
    "summary": "AI scan completed successfully.",
    "priority_concern": "Redness"
  },
  "confidence": 0.92,
  "processing_time": 26.71,
  "status": "COMPLETED",
  "image_url": "/uploads/d3b07384-883a-4ef6.jpg"
}
```

### 2.2 Live Webcam Frame Analysis
- **Endpoint**: `POST /api/image-analysis/webcam`
- **Request Body (Form Data)**:
  - `image_data`: Base64 data URL string (`data:image/jpeg;base64,...`)
  - `filename`: String (e.g. `webcam_frame.jpg`)
- **Response** (`200 OK`): Returns JSON diagnostic scan result.

### 2.3 Fetch Image Scan History
- **Endpoint**: `GET /api/image-analysis/history`
- **Headers**: `Authorization: Bearer <access_token>`
- **Response** (`200 OK`): List of user's past image analysis scans sorted chronologically.

---

## 3. Core Skincare Intelligence APIs (`/api/*`)

### 3.1 Execute AI Assessment
- **Endpoint**: `POST /api/assessment/execute`
- **Request Body**:
```json
{
  "metrics": {
    "acne": 35,
    "dryness": 40,
    "oiliness": 20,
    "redness": 15,
    "sensitivity": 25
  }
}
```
- **Response** (`200 OK`): Overall score (0-100%), risk level, priority areas.

### 3.2 Check Ingredient Safety Compatibility
- **Endpoint**: `POST /api/ingredients/check-compatibility`
- **Request Body**:
```json
{
  "ingredient_names": ["AHA Complex", "Retinol"]
}
```
- **Response** (`200 OK`):
```json
{
  "is_safe": false,
  "conflict_count": 1,
  "conflicts": [
    {
      "ingredient_a": "AHA Complex",
      "ingredient_b": "Retinol",
      "conflict_level": "HIGH",
      "description": "Severe skin barrier irritation. Do not layer in same routine."
    }
  ]
}
```

---

## 4. Reports & Data Export API (`/api/reports/export`)

- **Endpoint**: `GET /api/reports/export?format=pdf` (or `format=csv`, `format=xlsx`)
- **Headers**: `Authorization: Bearer <access_token>`
- **Response** (`200 OK`): Binary stream with `Content-Disposition: attachment; filename=skincare_report.pdf`.
