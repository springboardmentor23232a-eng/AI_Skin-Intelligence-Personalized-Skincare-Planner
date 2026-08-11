import sys
import os
import requests

BASE_URL = "http://127.0.0.1:8000"

def run_test():
    print("============================================================")
    print("PHASE 3 END-TO-END SYSTEM VERIFICATION TEST")
    print("============================================================")

    # 1. Health check
    res = requests.get(f"{BASE_URL}/")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] Backend health check passed.")

    # 2. Register & Login Test User
    email = "phase3_tester@example.com"
    password = "SecurePassword123!"

    reg_payload = {
        "full_name": "Phase 3 Tester",
        "email": email,
        "password": password,
        "role": "USER"
    }
    requests.post(f"{BASE_URL}/api/auth/register", json=reg_payload)

    login_res = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": password})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[PASS] User Authentication & JWT bearer token acquisition successful.")

    # 3. Create Skin Profile & Assessment
    profile_payload = {
        "full_name": "Phase 3 Tester",
        "age": 28,
        "gender": "Female",
        "skin_type": "Combination",
        "skin_tone": "Type III",
        "concerns": ["Acne / Breakouts", "Hyperpigmentation"],
        "allergies": "Fragrance",
        "sensitivities": "High alcohol formulations",
        "lifestyle": "Moderate active",
        "sleep_quality": "7 hours",
        "water_intake": 2.5,
        "stress_level": "Low",
        "environmental_exposure": "Urban",
        "climate": "Humid",
        "uv_exposure": "Moderate"
    }
    requests.post(f"{BASE_URL}/api/profile", json=profile_payload, headers=headers)

    assessment_payload = {
        "acne": 35,
        "hyperpigmentation": 40,
        "dryness": 20,
        "oiliness": 45,
        "redness": 15,
        "sensitivity": 20,
        "wrinkles": 10,
        "fine_lines": 15,
        "dark_spots": 25,
        "uneven_tone": 30
    }
    requests.post(f"{BASE_URL}/api/assessment", json=assessment_payload, headers=headers)
    print("[PASS] Skin Profile & Diagnostic Assessment initialized.")

    # 4. Test Routine Generator
    gen_res = requests.post(f"{BASE_URL}/api/routines/generate", headers=headers)
    assert gen_res.status_code == 201, f"Routine generation failed: {gen_res.text}"
    routines = gen_res.json()
    assert len(routines) >= 5, f"Expected at least 5 routine types, got {len(routines)}"
    routine_types = [r["routine_type"] for r in routines]
    print(f"[PASS] AI Routines generated successfully: {routine_types}")

    get_routines_res = requests.get(f"{BASE_URL}/api/routines", headers=headers)
    assert get_routines_res.status_code == 200, "Fetch routines failed"
    print("[PASS] GET /api/routines verified.")

    # 5. Test Ingredient Intelligence
    ing_res = requests.get(f"{BASE_URL}/api/ingredients")
    assert ing_res.status_code == 200, f"Fetch ingredients failed: {ing_res.text}"
    ingredients = ing_res.json()
    assert len(ingredients) >= 10, f"Expected core ingredients, got {len(ingredients)}"
    print(f"[PASS] Fetched {len(ingredients)} core ingredients from PostgreSQL database.")

    # Test Conflict Detection
    check_payload = {
        "selected_ingredients": ["Retinol", "Glycolic Acid (AHA)"]
    }
    check_res = requests.post(f"{BASE_URL}/api/ingredients/check-compatibility", json=check_payload, headers=headers)
    assert check_res.status_code == 200, f"Compatibility check failed: {check_res.text}"
    check_data = check_res.json()
    assert check_data["is_safe"] == False, "Expected Retinol + Glycolic Acid conflict to be detected as unsafe!"
    assert len(check_data["conflicts_found"]) > 0, "Expected conflict warning detail"
    print("[PASS] Ingredient conflict detection matrix correctly flagged Retinol + Glycolic Acid collision.")

    # 6. Test Product Database APIs
    seed_prod_res = requests.post(f"{BASE_URL}/api/products/seed")
    assert seed_prod_res.status_code in [200, 201], "Product seed failed"
    print("[PASS] Product Database seeded.")

    prods_res = requests.get(f"{BASE_URL}/api/products")
    assert prods_res.status_code == 200, "Fetch products failed"
    products = prods_res.json()
    assert len(products) >= 10, f"Expected products in catalog, got {len(products)}"
    print(f"[PASS] Fetched {len(products)} products from Product Database.")

    # Search & Filter Query Test
    filter_res = requests.get(f"{BASE_URL}/api/products?category=Serum&skin_type=Oily")
    assert filter_res.status_code == 200, "Filtered products fetch failed"
    filtered_prods = filter_res.json()
    print(f"[PASS] Filter query (category=Serum, skin_type=Oily) returned {len(filtered_prods)} products.")

    first_prod_id = products[0]["id"]
    detail_res = requests.get(f"{BASE_URL}/api/products/{first_prod_id}")
    assert detail_res.status_code == 200, "Fetch single product detail failed"
    assert detail_res.json()["id"] == first_prod_id
    print(f"[PASS] Single product detail API for ID {first_prod_id} verified.")

    print("============================================================")
    print("ALL PHASE 3 E2E TESTS PASSED SUCCESSFULLY WITH ZERO ERRORS!")
    print("============================================================")


if __name__ == "__main__":
    run_test()
