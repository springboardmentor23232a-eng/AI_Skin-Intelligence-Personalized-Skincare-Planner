import sys
import os
import secrets
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text

# Add current dir to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.main import app
from app.core.config import settings
from app.db.session import engine, Base

client = TestClient(app)

print("="*70)
print("     UNIFIED END-TO-END SYSTEM VERIFICATION SUITE (PHASES 1-3)     ")
print("="*70)

# 1. Database Connection & Table Check
try:
    with engine.connect() as conn:
        res = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public';"))
        tables = [row[0] for row in res.fetchall()]
        print(f"[OK] 1. PostgreSQL DB Connected. Active Tables: {tables}")
        assert "users" in tables
        assert "skin_profiles" in tables
        assert "skin_assessments" in tables
        assert "skincare_routines" in tables
        assert "ingredients" in tables
        assert "ingredient_compatibility_checks" in tables
        assert "products" in tables
        assert "product_recommendations" in tables


except Exception as e:
    print(f"[FAIL] DB Connection failed: {e}")
    sys.exit(1)

# 2. FastAPI Healthcheck Endpoint
res_root = client.get("/")
print(f"[OK] 2. Root Healthcheck Status: {res_root.status_code} - {res_root.json()}")
assert res_root.status_code == 200

# 3. Authentication & JWT Test
rand_str = secrets.token_hex(4)
email = f"e2e_full_{rand_str}@skincare.com"
pwd = "Password123!"

res_reg = client.post("/api/auth/register", json={
    "full_name": "E2E Unified User",
    "email": email,
    "password": pwd,
    "role": "USER"
})
print(f"[OK] 3. Registration Status: {res_reg.status_code}")
assert res_reg.status_code == 201

res_login = client.post("/api/auth/login", json={"email": email, "password": pwd})
print(f"[OK] 4. Login JWT Status: {res_login.status_code}")
assert res_login.status_code == 200
token = res_login.json()["access_token"]
refresh_token = res_login.json()["refresh_token"]
headers = {"Authorization": f"Bearer {token}"}

res_me = client.get("/api/auth/me", headers=headers)
print(f"[OK] 5. Auth /me Protected Route: {res_me.json()['email']} ({res_me.json()['role']})")
assert res_me.status_code == 200

res_refresh = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
print(f"[OK] 6. Refresh Token API: {res_refresh.status_code}")
assert res_refresh.status_code == 200

# 4. Skin Profile CRUD
res_prof_create = client.post("/api/profile", headers=headers, json={
    "full_name": "E2E Unified User",
    "age": 28,
    "gender": "Female",
    "skin_type": "Combination",
    "skin_tone": "Medium",
    "concerns": ["Acne / Breakouts", "Hyperpigmentation"],
    "allergies": "Fragrance",
    "sensitivities": "High UV",
    "lifestyle": "Active",
    "sleep_quality": "7-8 Hours",
    "water_intake": 3.0,
    "stress_level": "Moderate",
    "climate": "Temperate",
    "uv_exposure": "Moderate"
})
print(f"[OK] 7. Profile Create Status: {res_prof_create.status_code} (Age: {res_prof_create.json()['age']})")
assert res_prof_create.status_code == 201

res_prof_get = client.get("/api/profile", headers=headers)
print(f"[OK] 8. Profile Fetch Status: {res_prof_get.status_code} (Water Intake: {res_prof_get.json()['water_intake']}L)")
assert res_prof_get.status_code == 200

res_prof_put = client.put("/api/profile", headers=headers, json={
    "water_intake": 3.5,
    "stress_level": "Low"
})
print(f"[OK] 9. Profile Update Status: {res_prof_put.status_code} (New Water Intake: {res_prof_put.json()['water_intake']}L)")
assert res_prof_put.status_code == 200

# 5. Skin Assessment Engine
res_assess = client.post("/api/assessment", headers=headers, json={
    "acne": 35,
    "hyperpigmentation": 25,
    "dryness": 20,
    "oiliness": 40,
    "redness": 15,
    "sensitivity": 15,
    "wrinkles": 10,
    "fine_lines": 15,
    "dark_spots": 25,
    "uneven_tone": 20
})
assess_data = res_assess.json()
print(f"[OK] 10. AI Assessment Executed: Score={assess_data['overall_score']}%, Risk='{assess_data['risk_level']}', Priority='{assess_data['concern_priority']}'")
assert res_assess.status_code == 201

res_history = client.get("/api/assessment/history", headers=headers)
print(f"[OK] 11. Assessment History Count: {len(res_history.json())}")
assert res_history.status_code == 200

# 6. AI Personalized Routine Generator
res_gen_routines = client.post("/api/routines/generate", headers=headers)
routines = res_gen_routines.json()
print(f"[OK] 12. AI Routines Generated: Count={len(routines)}")
assert res_gen_routines.status_code == 201
assert len(routines) == 5

routine_types = [r["routine_type"] for r in routines]
print(f"      Routines Generated: {routine_types}")
assert "MORNING" in routine_types
assert "EVENING" in routine_types
assert "WEEKLY" in routine_types
assert "MONTHLY" in routine_types
assert "SEASONAL" in routine_types

# 7. Ingredient Intelligence & Safety Checker
res_seed_ing = client.post("/api/ingredients/seed")
print(f"[OK] 13. Ingredient Seed Check: {res_seed_ing.status_code}")
assert res_seed_ing.status_code == 201

res_ings = client.get("/api/ingredients")
ings = res_ings.json()
print(f"[OK] 14. Ingredient Directory Count: {len(ings)} (First: '{ings[0]['name']}')")
assert res_ings.status_code == 200
assert len(ings) >= 12

# Safe check
res_safe_check = client.post("/api/ingredients/check-compatibility", headers=headers, json={
    "selected_ingredients": ["Niacinamide", "Hyaluronic Acid", "Ceramides"]
})
print(f"[OK] 15. Safe Ingredient Compatibility Check: is_safe={res_safe_check.json()['is_safe']}")
assert res_safe_check.json()["is_safe"] is True

# Unsafe check
res_unsafe_check = client.post("/api/ingredients/check-compatibility", headers=headers, json={
    "selected_ingredients": ["Retinol", "Glycolic Acid (AHA)"]
})
print(f"[OK] 16. Unsafe Conflict Alert Check: is_safe={res_unsafe_check.json()['is_safe']}, conflicts={len(res_unsafe_check.json()['conflicts_found'])}")
assert res_unsafe_check.json()["is_safe"] is False
assert len(res_unsafe_check.json()["conflicts_found"]) >= 1

# 8. Product Database Module
res_seed_prods = client.post("/api/products/seed")
print(f"[OK] 17. Product Database Seed Check: {res_seed_prods.status_code}")
assert res_seed_prods.status_code in [200, 201]

res_prods = client.get("/api/products")
prods = res_prods.json()
print(f"[OK] 18. Product Catalog Fetch: {len(prods)} products retrieved")
assert res_prods.status_code == 200
assert len(prods) >= 12

# 9. AI Product Recommendation Engine (Phase 4)
res_rec = client.post("/api/recommendations/generate", headers=headers, json={"budget_tier": "ALL"})
print(f"[OK] 19. AI Product Recommendation Engine Generated (Match Score: {res_rec.json()['overall_match_score']}%)")
assert res_rec.status_code == 201

res_hist = client.get("/api/recommendations/history", headers=headers)
print(f"[OK] 20. Stored Recommendation History Sessions: {len(res_hist.json())}")
assert res_hist.status_code == 200

# 10. Phase 5 Skin Health Analytics & Tracker
res_log_routine = client.post("/api/analytics/routines/logs", headers=headers, json={
    "routine_type": "MORNING",
    "completed": True,
    "notes": "Feels good."
})
print(f"[OK] 21. Logged Routine completion: {res_log_routine.status_code}")
assert res_log_routine.status_code == 201

res_get_logs = client.get("/api/analytics/routines/logs", headers=headers)
print(f"[OK] 22. Fetched daily routine logs: {len(res_get_logs.json())}")
assert res_get_logs.status_code == 200
assert res_get_logs.json()[0]["routine_type"] == "MORNING"

res_create_progress = client.post("/api/analytics/progress", headers=headers, json={
    "photo_url": "https://example.com/progress.jpg",
    "notes": "Acne clearing up"
})
print(f"[OK] 23. Created skin progress entry: {res_create_progress.status_code}")
assert res_create_progress.status_code == 201

res_get_progress = client.get("/api/analytics/progress", headers=headers)
print(f"[OK] 24. Fetched progress diary entries: {len(res_get_progress.json())}")
assert res_get_progress.status_code == 200

res_trends = client.get("/api/analytics/history", headers=headers)
print(f"[OK] 25. Fetched skin health diagnostics trends: {len(res_trends.json()['trends'])}")
assert res_trends.status_code == 200

# 11. Phase 6 Clinical Workspace APIs
rand_staff = secrets.token_hex(4)
res_reg_staff = client.post("/api/auth/register", json={
    "full_name": "Dr. Staff Test",
    "email": f"staff_{rand_staff}@skincare.com",
    "password": pwd,
    "role": "DERMATOLOGIST"
})
assert res_reg_staff.status_code == 201
staff_token = res_reg_staff.json()["access_token"]
staff_headers = {"Authorization": f"Bearer {staff_token}"}

res_clin_stats = client.get("/api/clinical/stats", headers=staff_headers)
print(f"[OK] 26. Clinical Workspace Dashboard Stats fetched (Clients: {res_clin_stats.json()['total_clients']})")
assert res_clin_stats.status_code == 200

res_pat_dir = client.get("/api/clinical/patients", headers=staff_headers)
print(f"[OK] 27. Clinical Patient Directory retrieved (Count: {len(res_pat_dir.json())})")
assert res_pat_dir.status_code == 200

# 12. Phase 7 Notifications, Reminders & Export APIs
res_rem = client.get("/api/reminders/settings", headers=headers)
print(f"[OK] 28. Reminder preferences fetched: {len(res_rem.json())} active")
assert res_rem.status_code == 200

res_trig = client.post("/api/reminders/trigger", headers=headers)
print(f"[OK] 29. Triggered reminder engine: {len(res_trig.json()['reminders'])} notifications generated")
assert res_trig.status_code == 200

res_notif = client.get("/api/notifications", headers=headers)
print(f"[OK] 30. Notification Center items retrieved (Unread: {res_notif.json()['unread_count']})")
assert res_notif.status_code == 200

res_export_csv = client.get("/api/reports/export?format=csv", headers=headers)
print(f"[OK] 31. Exported CSV report stream (Content-Type: {res_export_csv.headers['content-type']})")
assert res_export_csv.status_code == 200

res_export_pdf = client.get("/api/reports/export?format=pdf", headers=headers)
print(f"[OK] 32. Exported Clinical PDF report stream (Content-Type: {res_export_pdf.headers['content-type']})")
assert res_export_pdf.status_code == 200

# 13. Logout Test
res_logout = client.post("/api/auth/logout")
print(f"[OK] 33. Logout API Status: {res_logout.status_code}")
assert res_logout.status_code == 200

print("\n" + "="*70)
print("     ALL PHASES (1, 2, 3, 4, 5, 6 & 7) FULL E2E VERIFICATION PASSED 100%     ")
print("="*70)


