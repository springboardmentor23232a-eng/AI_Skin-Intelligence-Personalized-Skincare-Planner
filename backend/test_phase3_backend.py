import sys
import os
import secrets
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add current dir to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.main import app
from app.core.config import settings
from app.db.session import Base, get_db

client = TestClient(app)

print("="*65)
print("      PHASE 3 BACKEND, ROUTINES & INGREDIENT SUITE      ")
print("="*65)

# Test 1: Seed Ingredients
res_seed = client.post("/api/ingredients/seed")
print(f"[OK] Step 1: Ingredient Seeding Status: {res_seed.status_code} - {res_seed.json()}")
assert res_seed.status_code == 201

# Test 2: List Ingredients
res_ing = client.get("/api/ingredients")
ingredients = res_ing.json()
print(f"[OK] Step 2: Retrieved {len(ingredients)} Core Ingredients from PostgreSQL")
assert res_ing.status_code == 200
assert len(ingredients) >= 12

# Test 3: Get Ingredient Detail
ing_id = ingredients[0]["id"]
res_detail = client.get(f"/api/ingredients/{ing_id}")
print(f"[OK] Step 3: Fetched Ingredient Detail for '{res_detail.json()['name']}' ({res_detail.json()['category']})")
assert res_detail.status_code == 200

# Setup Test User for Routines & Auth
rand_str = secrets.token_hex(4)
email = f"phase3_user_{rand_str}@skincare.com"
password = "Password123!"

res_reg = client.post("/api/auth/register", json={
    "full_name": "Phase 3 Test User",
    "email": email,
    "password": password,
    "role": "USER"
})
assert res_reg.status_code == 201
token = res_reg.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Create Skin Profile & Assessment for Test User
client.post("/api/profile", headers=headers, json={
    "full_name": "Phase 3 Test User",
    "age": 30,
    "gender": "Female",
    "skin_type": "Combination",
    "skin_tone": "Medium",
    "concerns": ["Acne / Breakouts", "Hyperpigmentation"],
    "allergies": "Fragrance",
    "water_intake": 2.5,
    "climate": "Temperate",
    "uv_exposure": "Moderate"
})

client.post("/api/assessment", headers=headers, json={
    "acne": 40,
    "hyperpigmentation": 35,
    "dryness": 20,
    "oiliness": 45,
    "redness": 15,
    "sensitivity": 20,
    "wrinkles": 10,
    "fine_lines": 15,
    "dark_spots": 30,
    "uneven_tone": 25
})

# Test 4: Generate Personalized AI Routines
res_gen = client.post("/api/routines/generate", headers=headers)
routines = res_gen.json()
print(f"[OK] Step 4: Generated {len(routines)} AI Routines (Morning, Evening, Weekly, Monthly, Seasonal)")
assert res_gen.status_code == 201
assert len(routines) == 5

# Test 5: Fetch Routines by Type
res_morning = client.get("/api/routines/MORNING", headers=headers)
morning_routine = res_morning.json()
clean_title = morning_routine['title'].encode('ascii', 'ignore').decode('ascii')
print(f"[OK] Step 5: Retrieved MORNING Routine: '{clean_title.strip()}' with {len(morning_routine['steps'])} steps")
assert res_morning.status_code == 200

# Test 6: Ingredient Safety Compatibility Checker (Safe Combination)
res_safe = client.post("/api/ingredients/check-compatibility", headers=headers, json={
    "selected_ingredients": ["Niacinamide", "Hyaluronic Acid", "Ceramides"]
})
safe_report = res_safe.json()
print(f"[OK] Step 6: Compatibility Check (Niacinamide + HA + Ceramides): is_safe={safe_report['is_safe']}, conflicts={len(safe_report['conflicts_found'])}")
assert safe_report["is_safe"] is True

# Test 7: Ingredient Safety Compatibility Checker (Unsafe Combination)
res_unsafe = client.post("/api/ingredients/check-compatibility", headers=headers, json={
    "selected_ingredients": ["Retinol", "Glycolic Acid (AHA)", "Vitamin C (L-Ascorbic Acid)"]
})
unsafe_report = res_unsafe.json()
print(f"[OK] Step 7: Compatibility Warning Test (Retinol + AHA + Vitamin C): is_safe={unsafe_report['is_safe']}, conflicts={len(unsafe_report['conflicts_found'])}")
assert unsafe_report["is_safe"] is False
assert len(unsafe_report["conflicts_found"]) >= 1

print("\n" + "="*65)
print("      ALL PHASE 3 BACKEND & DATABASE TESTS PASSED 100%       ")
print("="*65)
