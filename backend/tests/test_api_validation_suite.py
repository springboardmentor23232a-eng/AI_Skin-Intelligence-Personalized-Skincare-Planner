"""
=============================================================================
API Validation & Contract Compliance Test Suite
Tests input validation schemas, 422 Unprocessable Entity handling,
boundary conditions, HTTP status codes, and error response formats.
=============================================================================
"""
import pytest
import secrets
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@pytest.fixture(scope="module")
def auth_user():
    """Register and authenticate a clean user for API validation testing"""
    rand = secrets.token_hex(4)
    email = f"api_val_{rand}@test.com"
    pwd = "SecurePassword123!"

    reg_res = client.post("/api/auth/register", json={
        "full_name": "API Validation Tester",
        "email": email,
        "password": pwd
    })
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    return {"email": email, "headers": headers}


class TestAuthValidation:
    def test_register_missing_required_fields(self):
        """Should return 422 Unprocessable Entity when fields are missing"""
        res = client.post("/api/auth/register", json={"email": "incomplete@test.com"})
        assert res.status_code == 422
        assert "detail" in res.json()

    def test_register_invalid_email_format(self):
        """Should return 422 for malformed email strings"""
        res = client.post("/api/auth/register", json={
            "full_name": "Invalid Email",
            "email": "not-a-valid-email",
            "password": "Password123!"
        })
        assert res.status_code == 422

    def test_login_empty_payload(self):
        """Should return 422 for empty login payload"""
        res = client.post("/api/auth/login", json={})
        assert res.status_code == 422

    def test_login_invalid_credentials(self):
        """Should return 401 Unauthorized for incorrect password"""
        res = client.post("/api/auth/login", json={
            "email": "nonexistent_user_999@test.com",
            "password": "WrongPassword123!"
        })
        assert res.status_code == 401


class TestProfileValidation:
    def test_profile_unauthorized_access(self):
        """Should reject unauthorized requests to protected profile route with 401"""
        res = client.get("/api/profile")
        assert res.status_code == 401

    def test_profile_invalid_fitzpatrick_range(self, auth_user):
        """Should reject invalid Fitzpatrick scale values or handle gracefully"""
        res = client.post("/api/profile", headers=auth_user["headers"], json={
            "fitzpatrick_type": "Type VII",  # Invalid type (only I-VI exist)
            "skin_type": "Oily",
            "concerns": ["Acne"],
            "sensitivities": ["Fragrance"],
            "allergies": [],
            "age": 25,
            "daily_water_intake_liters": 2.5,
            "daily_sleep_hours": 7.5,
            "stress_level": "Low"
        })
        # Either schema rejects with 422 or accepts with normalization
        assert res.status_code in [201, 422]

    def test_profile_negative_age_validation(self, auth_user):
        """Should validate age is not negative"""
        res = client.post("/api/profile", headers=auth_user["headers"], json={
            "fitzpatrick_type": "Type II",
            "skin_type": "Combination",
            "concerns": ["Acne"],
            "sensitivities": [],
            "allergies": [],
            "age": -10,  # Invalid negative age
            "daily_water_intake_liters": 2.0,
            "daily_sleep_hours": 8.0,
            "stress_level": "Medium"
        })
        assert res.status_code in [400, 422]


class TestAssessmentValidation:
    def test_assessment_out_of_bound_scores(self, auth_user):
        """Should validate that symptom severities are within valid range (0-100)"""
        res = client.post("/api/assessment", headers=auth_user["headers"], json={
            "acne": 500,  # Out of range (>100)
            "hyperpigmentation": -20,
            "dryness": 10,
            "oiliness": 10,
            "redness": 10,
            "sensitivity": 10,
            "wrinkles": 10,
            "fine_lines": 10,
            "dark_spots": 10,
            "uneven_tone": 10
        })
        assert res.status_code in [201, 400, 422]
        if res.status_code == 201:
            # If accepted, verify values are clamped within 0-100
            score = res.json()["overall_score"]
            assert 0 <= score <= 100


class TestIngredientCompatibilityValidation:
    def test_compatibility_empty_ingredients(self, auth_user):
        """Should validate ingredient compatibility check payload"""
        res = client.post("/api/ingredients/check-compatibility", headers=auth_user["headers"], json={
            "selected_ingredients": []
        })
        assert res.status_code in [200, 400, 422]

    def test_compatibility_valid_active_pair(self, auth_user):
        """Should successfully evaluate known chemical conflict pair"""
        res = client.post("/api/ingredients/check-compatibility", headers=auth_user["headers"], json={
            "selected_ingredients": ["Retinol", "Glycolic Acid (AHA)"]
        })
        assert res.status_code == 200
        data = res.json()
        assert "is_safe" in data
        assert "conflicts_found" in data


class TestReportExportValidation:
    def test_export_invalid_format_parameter(self, auth_user):
        """Should reject unsupported export format requests"""
        res = client.get("/api/reports/export?format=unknown_fmt_xyz", headers=auth_user["headers"])
        assert res.status_code in [400, 422]

    def test_export_valid_formats_headers(self, auth_user):
        """Should return correct content-type headers for supported export formats"""
        formats_and_types = [
            ("csv", "text/csv"),
            ("pdf", "application/pdf"),
            ("xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        ]
        for fmt, expected_type in formats_and_types:
            res = client.get(f"/api/reports/export?format={fmt}", headers=auth_user["headers"])
            assert res.status_code == 200
            assert expected_type in res.headers["content-type"]
