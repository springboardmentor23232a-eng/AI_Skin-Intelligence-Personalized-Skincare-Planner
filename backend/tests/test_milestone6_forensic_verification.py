import time
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.db.session import SessionLocal
from app.models import Product

client = TestClient(app)

@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_milestone6_profile_change_and_personalization():
    """
    Requirement 10: Profile Change Test
    TEST USER A: Oily, Acne, Budget: ₹1,500, Sensitivity: Moderate
    TEST USER B: Dry, Dryness, Budget: ₹4,000, Sensitivity: High
    """
    # 1. Register and setup Test User A
    ts = int(time.time() * 1000)
    email_a = f"user_a_{ts}@skintest.com"
    reg_a = client.post("/api/auth/register", json={
        "full_name": "User A (Oily/Acne)",
        "email": email_a,
        "password": "Password123!",
        "role": "USER"
    })
    token_a = reg_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    client.post("/api/profile", json={
        "full_name": "User A (Oily/Acne)",
        "age": 24,
        "gender": "Female",
        "skin_type": "Oily",
        "skin_tone": "Type III",
        "concerns": ["Acne / Breakouts", "Oiliness & Enlarged Pores"],
        "allergies": "",
        "sensitivities": "Alcohol"
    }, headers=headers_a)

    client.post("/api/assessment", json={
        "acne": 70, "oiliness": 80, "hyperpigmentation": 30, "dryness": 10,
        "redness": 20, "sensitivity": 30, "wrinkles": 5, "fine_lines": 5,
        "dark_spots": 10, "uneven_tone": 15
    }, headers=headers_a)

    # 2. Register and setup Test User B
    email_b = f"user_b_{ts}@skintest.com"
    reg_b = client.post("/api/auth/register", json={
        "full_name": "User B (Dry/Dryness)",
        "email": email_b,
        "password": "Password123!",
        "role": "USER"
    })
    token_b = reg_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    client.post("/api/profile", json={
        "full_name": "User B (Dry/Dryness)",
        "age": 32,
        "gender": "Male",
        "skin_type": "Dry",
        "skin_tone": "Type I",
        "concerns": ["Dryness & Dehydration", "Sensitivity"],
        "allergies": "fragrance",
        "sensitivities": "fragrance"
    }, headers=headers_b)

    client.post("/api/assessment", json={
        "acne": 5, "oiliness": 10, "hyperpigmentation": 15, "dryness": 85,
        "redness": 50, "sensitivity": 75, "wrinkles": 20, "fine_lines": 20,
        "dark_spots": 10, "uneven_tone": 20
    }, headers=headers_b)

    # 3. Generate Recommendations for User A
    res_a = client.post("/api/recommendations/generate", json={"budget_tier": "LOW"}, headers=headers_a)
    assert res_a.status_code == 201
    data_a = res_a.json()
    items_a = data_a["recommended_products"]
    assert len(items_a) > 0

    top_a = items_a[0]
    # Check that top recommendation for User A fits Oily/Acne profile
    assert any(st.lower() in ["oily", "all", "combination"] for st in top_a["product"]["suitable_skin_types"])
    assert len(top_a["match_reasons"]) > 0
    print(f"\nUser A Top Match: {top_a['product']['brand']} {top_a['product']['name']} ({top_a['suitability_score']}%)")
    print(f"Reasons: {top_a['match_reasons']}")

    # 4. Generate Recommendations for User B
    res_b = client.post("/api/recommendations/generate", json={"budget_tier": "ALL"}, headers=headers_b)
    assert res_b.status_code == 201
    data_b = res_b.json()
    items_b = data_b["recommended_products"]
    assert len(items_b) > 0

    top_b = items_b[0]
    # Check that top recommendation for User B fits Dry profile
    assert any(st.lower() in ["dry", "all", "normal", "sensitive"] for st in top_b["product"]["suitable_skin_types"])
    assert len(top_b["match_reasons"]) > 0
    print(f"\nUser B Top Match: {top_b['product']['brand']} {top_b['product']['name']} ({top_b['suitability_score']}%)")
    print(f"Reasons: {top_b['match_reasons']}")

    # Top recommendations should be distinct based on personality/skin profile
    assert top_a["product"]["id"] != top_b["product"]["id"] or top_a["suitability_score"] != top_b["suitability_score"]


def test_budget_tier_filtering():
    """Requirement 8: Budget filtering with INR tiers (Low <= 1500, Medium 1500-4000, Premium > 4000)"""
    ts = int(time.time() * 1000)
    email = f"budget_user_{ts}@skintest.com"
    reg = client.post("/api/auth/register", json={
        "full_name": "Budget User",
        "email": email,
        "password": "Password123!",
        "role": "USER"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    client.post("/api/profile", json={
        "full_name": "Budget User", "age": 28, "gender": "Female",
        "skin_type": "Normal", "skin_tone": "Medium",
        "concerns": ["Uneven Texture"], "allergies": "", "sensitivities": ""
    }, headers=headers)

    # Low Budget Filter: price * 85 <= 1500
    res_low = client.post("/api/recommendations/generate", json={"budget_tier": "LOW"}, headers=headers)
    assert res_low.status_code == 201
    for item in res_low.json()["recommended_products"]:
        inr_price = item["product"]["price"] * 85.0 if item["product"]["price"] < 300 else item["product"]["price"]
        assert inr_price <= 1500.0, f"Product {item['product']['name']} price {inr_price} exceeds 1500 INR"

    # Medium Budget Filter: 1500 < price * 85 <= 4000
    res_med = client.post("/api/recommendations/generate", json={"budget_tier": "MEDIUM"}, headers=headers)
    assert res_med.status_code == 201
    for item in res_med.json()["recommended_products"]:
        inr_price = item["product"]["price"] * 85.0 if item["product"]["price"] < 300 else item["product"]["price"]
        assert 1500.0 < inr_price <= 4000.0, f"Product {item['product']['name']} price {inr_price} not in 1500-4000 INR"


def test_comparison_best_match_and_multi_store_links(db_session: Session):
    """Requirements 4, 5, 6, 7: Comparison, Personalized Best Match, Multi-store links"""
    products = db_session.query(Product).limit(3).all()
    p_ids = [p.id for p in products]

    ts = int(time.time() * 1000)
    email = f"comp_user_{ts}@skintest.com"
    reg = client.post("/api/auth/register", json={
        "full_name": "Comp User", "email": email, "password": "Password123!", "role": "USER"
    })
    headers = {"Authorization": f"Bearer {reg.json()['access_token']}"}

    client.post("/api/profile", json={
        "full_name": "Comp User", "age": 26, "gender": "Female",
        "skin_type": "Oily", "skin_tone": "Type II",
        "concerns": ["Acne / Breakouts"], "allergies": "", "sensitivities": ""
    }, headers=headers)

    res = client.post("/api/recommendations/compare", json={"product_ids": p_ids}, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "comparison" in data
    assert "best_match_product_id" in data
    assert data["best_match_product_id"] in p_ids

    # Verify multi-store links exist
    for item in data["comparison"]:
        assert item["purchase_url"] is not None
        assert isinstance(item["purchase_links"], dict)
        assert len(item["purchase_links"]) > 0
        for store, url in item["purchase_links"].items():
            assert url.startswith("http://") or url.startswith("https://")


def test_product_alternatives_inr_reasons(db_session: Session):
    """Requirement 9: Alternative product suggestions with INR difference"""
    first_prod = db_session.query(Product).first()
    ts = int(time.time() * 1000)
    email = f"alt_user_{ts}@skintest.com"
    reg = client.post("/api/auth/register", json={
        "full_name": "Alt User", "email": email, "password": "Password123!", "role": "USER"
    })
    headers = {"Authorization": f"Bearer {reg.json()['access_token']}"}

    res = client.get(f"/api/recommendations/alternatives/{first_prod.id}", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "alternatives" in data
    for alt in data["alternatives"]:
        assert "₹" in alt["reason"] or "Same price point" in alt["reason"] or "Shares active" in alt["reason"]
