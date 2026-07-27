PROFILE_PAYLOAD = {
    "skin_type": "oily", "age_group": "20s",
    "skin_concerns": ["acne", "oily_skin"],
    "allergies": ["Niacinamide"], "sensitivities": [],
    "sleep_quality": "good", "sleep_hours": 8,
    "water_intake_liters": 2.5, "lifestyle_habits": ["exercise"],
    "environmental_exposure": "low",
}


def test_products_exclude_allergens(client, registered_user):
    client.post("/api/skin-profile", json=PROFILE_PAYLOAD, headers=registered_user["headers"])
    res = client.get("/api/products/recommendations", headers=registered_user["headers"])
    assert res.status_code == 200
    for product in res.json():
        assert "Niacinamide" not in product["key_ingredients"]


def test_progress_log_computes_score(client, registered_user):
    client.post("/api/skin-profile", json=PROFILE_PAYLOAD, headers=registered_user["headers"])
    res = client.post("/api/progress/log", json={
        "routine_followed_morning": True,
        "routine_followed_evening": True,
        "skin_condition_note": "clearer today",
    }, headers=registered_user["headers"])
    assert res.status_code == 200
    body = res.json()
    assert body["skin_health_score"] is not None
    assert 0 <= body["skin_health_score"] <= 100


def test_progress_history_returns_logs(client, registered_user):
    client.post("/api/skin-profile", json=PROFILE_PAYLOAD, headers=registered_user["headers"])
    client.post("/api/progress/log", json={"routine_followed_morning": True, "routine_followed_evening": False}, headers=registered_user["headers"])
    res = client.get("/api/progress/history", headers=registered_user["headers"])
    assert res.status_code == 200
    assert len(res.json()) == 1


def test_dashboard_reflects_state(client, registered_user):
    client.post("/api/skin-profile", json=PROFILE_PAYLOAD, headers=registered_user["headers"])
    client.post("/api/assessment/run", headers=registered_user["headers"])
    client.post("/api/routine/generate", headers=registered_user["headers"])
    res = client.get("/api/dashboard/user", headers=registered_user["headers"])
    assert res.status_code == 200
    body = res.json()
    assert body["has_profile"] is True
    assert body["has_routine"] is True
