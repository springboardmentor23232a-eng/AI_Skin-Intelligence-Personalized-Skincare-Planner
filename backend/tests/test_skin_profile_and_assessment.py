PROFILE_PAYLOAD = {
    "skin_type": "oily", "age_group": "20s",
    "skin_concerns": ["acne", "oily_skin", "dark_spots"],
    "allergies": [], "sensitivities": [],
    "sleep_quality": "average", "sleep_hours": 6.5,
    "water_intake_liters": 1.8, "lifestyle_habits": ["high-stress"],
    "environmental_exposure": "high",
}


def test_assessment_requires_profile_first(client, registered_user):
    res = client.post("/api/assessment/run", headers=registered_user["headers"])
    assert res.status_code == 400


def test_create_profile_then_assess(client, registered_user):
    res = client.post("/api/skin-profile", json=PROFILE_PAYLOAD, headers=registered_user["headers"])
    assert res.status_code == 200
    assert res.json()["skin_type"] == "oily"

    res = client.post("/api/assessment/run", headers=registered_user["headers"])
    assert res.status_code == 200
    body = res.json()
    assert set(body["identified_concerns"]) == set(PROFILE_PAYLOAD["skin_concerns"])
    assert 0 <= body["condition_score"] <= 100
    assert "High sun/pollution exposure" in body["risk_factors"]


def test_routine_generation_targets_concerns(client, registered_user):
    client.post("/api/skin-profile", json=PROFILE_PAYLOAD, headers=registered_user["headers"])
    res = client.post("/api/routine/generate", headers=registered_user["headers"])
    assert res.status_code == 200
    body = res.json()
    evening_categories = [s["category"] for s in body["evening_routine"]]
    assert "Treatment" in evening_categories  # acne -> Salicylic Acid in evening
