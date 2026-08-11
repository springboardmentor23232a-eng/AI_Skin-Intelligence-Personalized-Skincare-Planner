import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_phase8():
    print("=" * 65)
    print("      PHASE 8 PRODUCTION READINESS & HARDENING SUITE      ")
    print("=" * 65)

    # 1. Test Health Check Endpoint
    health_res = client.get("/health")
    assert health_res.status_code == 200
    assert health_res.json()["status"] == "healthy"
    print("[OK] Step 1: Healthcheck API (/health) responding correctly")

    # 2. Test DB Readiness Endpoint
    ready_res = client.get("/readiness")
    assert ready_res.status_code == 200
    assert ready_res.json()["status"] == "ready"
    assert ready_res.json()["database"] == "connected"
    print("[OK] Step 2: Database Readiness API (/readiness) validated against live PostgreSQL")

    # 3. Test Security Headers & Processing Latency Header
    root_res = client.get("/")
    assert root_res.status_code == 200
    headers = root_res.headers
    assert headers["x-content-type-options"] == "nosniff"
    assert headers["x-frame-options"] == "DENY"
    assert headers["x-xss-protection"] == "1; mode=block"
    assert "strict-transport-security" in headers
    assert "x-process-time-ms" in headers
    print(f"[OK] Step 3: Security Headers & Latency Metric Verified (Latency: {headers['x-process-time-ms']}ms)")

    # 4. Test OpenAPI / Swagger Documentation Route
    docs_res = client.get("/docs")
    assert docs_res.status_code == 200
    print("[OK] Step 4: OpenAPI Swagger Documentation endpoint verified (/docs)")

    print("\n" + "=" * 65)
    print("   ALL PHASE 8 PRODUCTION READINESS & SECURITY TESTS PASSED 100%   ")
    print("=" * 65)


if __name__ == "__main__":
    test_phase8()
