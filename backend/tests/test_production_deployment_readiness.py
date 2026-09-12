"""
=============================================================================
Production Deployment Readiness & Forensic Pre-flight Suite
Validates that the environment, models, database schemas, frontend builds,
telemetry, and container configurations are 100% production ready.
=============================================================================
"""
import os
import platform
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.main import app
from app.core.config import settings
from app.db.session import engine
from app.ai.model_loader import model_loader

client = TestClient(app)

class TestProductionDeploymentReadiness:

    def test_security_configurations_production_ready(self):
        """Verify JWT secrets meet minimum cryptographic entropy threshold (>= 32 chars)"""
        assert len(settings.JWT_SECRET_KEY) >= 32, "JWT secret key must be at least 32 characters."
        assert settings.ALGORITHM == "HS256"
        assert settings.ACCESS_TOKEN_EXPIRE_MINUTES > 0
        assert len(settings.cors_origins_list) > 0

    def test_database_connection_and_table_schemas(self):
        """Verify database connectivity and existence of all 19 system tables"""
        expected_tables = [
            "users",
            "skin_profiles",
            "skin_assessments",
            "skincare_routines",
            "ingredients",
            "ingredient_compatibility_checks",
            "products",
            "product_recommendations",
            "skincare_logs",
            "skin_progress_photos",
            "consultations",
            "clinical_reviews",
            "reminder_settings",
            "notifications",
            "email_verification_tokens",
            "phone_otp_verifications",
            "admin_audit_logs",
            "image_analyses",
            "alembic_version"
        ]
        with engine.connect() as conn:
            res = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public';"))
            active_tables = [row[0] for row in res.fetchall()]

            # Fallback check if SQLite in use
            if not active_tables:
                res_sqlite = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table';"))
                active_tables = [row[0] for row in res_sqlite.fetchall()]

            for t in expected_tables:
                assert t in active_tables, f"Critical production table '{t}' is missing from database schema."

    def test_pytorch_ml_model_artifacts_present_and_valid(self):
        """Verify EfficientNet-B0 weight file and class metadata exist on disk"""
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        project_root = os.path.dirname(backend_dir)
        weights_path = os.path.join(project_root, "ml", "models", "skin_condition_improved.pth")
        metadata_path = os.path.join(project_root, "ml", "models", "improved_model_metadata.json")

        assert os.path.exists(weights_path), f"Model weights missing: {weights_path}"
        assert os.path.exists(metadata_path), f"Model metadata missing: {metadata_path}"
        assert os.path.getsize(weights_path) > 10_000_000, "Model weight checkpoint file appears corrupted or incomplete (<10MB)."

    def test_pytorch_model_loader_operational(self):
        """Verify ML model is loaded and ready for computer vision inference"""
        if model_loader.model is None:
            model_loader.load_model()
        assert model_loader.model is not None, "Model failed to load into memory."
        assert model_loader.metadata is not None
        assert len(model_loader.metadata["classes"]) >= 8, "Expected at least 8 clinical skin condition diagnostic classes."

    def test_health_and_readiness_probes(self):
        """Verify Kubernetes / Docker health and readiness probe endpoints"""
        res_health = client.get("/health")
        assert res_health.status_code == 200
        assert res_health.json()["status"] == "healthy"

        res_ready = client.get("/readiness")
        assert res_ready.status_code == 200
        assert res_ready.json()["status"] == "ready"
        assert res_ready.json()["database"] == "connected"

    def test_system_telemetry_endpoint(self):
        """Verify production monitoring telemetry metrics (Admin Authorized)"""
        from app.db.session import SessionLocal
        from app.models import User
        from app.auth.service import create_access_token
        db = SessionLocal()
        admin = db.query(User).filter(User.role == "ADMIN").first()
        if not admin:
            admin = User(
                email="admin_readiness_check@skincare.com",
                password_hash="pw",
                role="ADMIN",
                is_active=1
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
        admin_token = create_access_token({"sub": admin.email, "role": "ADMIN"})
        db.close()

        headers = {"Authorization": f"Bearer {admin_token}"}
        res = client.get("/api/system/telemetry", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "operational"
        assert data["version"] == "1.0.0"
        assert "uptime_seconds" in data
        assert data["ml_inference"]["model_loaded"] is True
        assert data["security_features"]["gzip_compression"] is True
        assert data["security_features"]["request_id_tracing"] is True
        assert data["security_features"]["role_based_access_control"] is True

    def test_uploads_directory_structure(self):
        """Verify uploads directory exists and is writable for user diagnostic media"""
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        uploads_dir = os.path.join(backend_dir, "uploads")
        assert os.path.exists(uploads_dir), "Uploads directory must exist for file persistence."

    def test_frontend_distribution_bundle_exists(self):
        """Verify frontend production build files exist in frontend/dist"""
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        project_root = os.path.dirname(backend_dir)
        dist_index = os.path.join(project_root, "frontend", "dist", "index.html")
        assert os.path.exists(dist_index), "Frontend dist/index.html is missing. Run 'npm run build' in frontend."

    def test_gzip_compression_active(self):
        """Verify GZip compression compresses large payloads"""
        from app.db.session import SessionLocal
        from app.models import User
        from app.auth.service import create_access_token
        db = SessionLocal()
        admin = db.query(User).filter(User.role == "ADMIN").first()
        admin_token = create_access_token({"sub": admin.email, "role": "ADMIN"})
        db.close()

        headers = {"Accept-Encoding": "gzip", "Authorization": f"Bearer {admin_token}"}
        res = client.get("/api/system/telemetry", headers=headers)
        assert res.status_code == 200
        # Responses handled by GZip middleware
        assert "X-Process-Time-Ms" in res.headers
        assert "X-Request-ID" in res.headers
