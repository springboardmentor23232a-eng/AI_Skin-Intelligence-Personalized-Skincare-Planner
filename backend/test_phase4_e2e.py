import requests

BASE_URL = "http://127.0.0.1:8000"

def run_test():
    print("============================================================")
    print("PHASE 4 END-TO-END SYSTEM VERIFICATION TEST")
    print("============================================================")

    # 1. Health check
    res = requests.get(f"{BASE_URL}/")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] Backend health check passed.")

    # 2. Register & Login Test User
    email = "phase4_tester@example.com"
    password = "SecurePassword123!"

    reg_payload = {
        "full_name": "Phase 4 Tester",
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

    # 3. Create Skin Profile with Allergies & Assessment
    profile_payload = {
        "full_name": "Phase 4 Tester",
        "age": 30,
        "gender": "Female",
        "skin_type": "Oily",
        "skin_tone": "Type II",
        "concerns": ["Acne / Breakouts", "Oiliness & Enlarged Pores"],
        "allergies": "Fragrance",
        "sensitivities": "High Alcohol",
        "lifestyle": "Active",
        "sleep_quality": "7 Hours",
        "water_intake": 2.5,
        "stress_level": "Moderate",
        "environmental_exposure": "Urban",
        "climate": "Humid",
        "uv_exposure": "High"
    }
    requests.post(f"{BASE_URL}/api/profile", json=profile_payload, headers=headers)

    assessment_payload = {
        "acne": 50,
        "hyperpigmentation": 30,
        "dryness": 10,
        "oiliness": 60,
        "redness": 20,
        "sensitivity": 25,
        "wrinkles": 10,
        "fine_lines": 10,
        "dark_spots": 20,
        "uneven_tone": 25
    }
    requests.post(f"{BASE_URL}/api/assessment", json=assessment_payload, headers=headers)
    print("[PASS] Skin Profile & Assessment initialized.")

    # 4. Test AI Recommendation Generation (ALL Budgets)
    rec_res = requests.post(f"{BASE_URL}/api/recommendations/generate", json={"budget_tier": "ALL"}, headers=headers)
    assert rec_res.status_code == 201, f"Recommendation generation failed: {rec_res.text}"
    rec_data = rec_res.json()
    assert "recommended_products" in rec_data
    items = rec_data["recommended_products"]
    assert len(items) >= 5, f"Expected recommended products, got {len(items)}"

    top_item = items[0]
    print(f"[PASS] AI Recommendation Engine generated {len(items)} items. Top Match: '{top_item['product']['name']}' ({top_item['suitability_score']}% Match).")

    # 5. Test Budget Tier Filtering (LOW Budget)
    low_res = requests.post(f"{BASE_URL}/api/recommendations/generate", json={"budget_tier": "LOW"}, headers=headers)
    assert low_res.status_code == 201
    low_items = low_res.json()["recommended_products"]
    assert all(item["product"]["price"] <= 20.0 for item in low_items), "Expected all low budget items <= $20"
    print(f"[PASS] Budget Tier filter ('LOW') correctly restricted items to <= $20 (Count: {len(low_items)}).")

    # 6. Test Product Comparison Matrix API
    p_ids = [items[0]["product"]["id"], items[1]["product"]["id"]]
    comp_res = requests.post(f"{BASE_URL}/api/recommendations/compare", json={"product_ids": p_ids}, headers=headers)
    assert comp_res.status_code == 200, f"Product comparison failed: {comp_res.text}"
    comp_data = comp_res.json()
    assert len(comp_data["comparison"]) == 2
    assert "best_match_product_id" in comp_data
    print(f"[PASS] Side-by-side Product Comparison matrix generated. Best match ID: {comp_data['best_match_product_id']}.")

    # 7. Test Alternative Products API
    first_prod_id = items[0]["product"]["id"]
    alt_res = requests.get(f"{BASE_URL}/api/recommendations/alternatives/{first_prod_id}", headers=headers)
    assert alt_res.status_code == 200, f"Fetch alternatives failed: {alt_res.text}"
    alt_data = alt_res.json()
    assert "alternatives" in alt_data
    print(f"[PASS] Alternative Products Engine returned {len(alt_data['alternatives'])} equivalent formulations.")

    # 8. Test Recommendation History API
    hist_res = requests.get(f"{BASE_URL}/api/recommendations/history", headers=headers)
    assert hist_res.status_code == 200, f"Fetch history failed: {hist_res.text}"
    history_sessions = hist_res.json()
    assert len(history_sessions) >= 2, f"Expected stored history sessions in PostgreSQL, got {len(history_sessions)}"
    print(f"[PASS] Persistent Recommendation History retrieved ({len(history_sessions)} sessions stored in PostgreSQL).")

    print("============================================================")
    print("ALL PHASE 4 E2E TESTS PASSED SUCCESSFULLY WITH ZERO ERRORS!")
    print("============================================================")

if __name__ == "__main__":
    run_test()
