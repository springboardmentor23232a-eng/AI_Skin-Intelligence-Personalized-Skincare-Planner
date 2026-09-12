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

@pytest.fixture
def auth_headers_user1():
    email = f"prod_user1_{int(time.time() * 1000)}@skincare.com"
    reg_res = client.post("/api/auth/register", json={
        "full_name": "Oily Skin User",
        "email": email,
        "password": "Password123!",
        "role": "USER"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create profile
    client.post("/api/profile", json={
        "full_name": "Oily Skin User",
        "age": 25,
        "gender": "Female",
        "skin_type": "Oily",
        "skin_tone": "Medium",
        "concerns": ["Acne / Breakouts", "Oiliness & Enlarged Pores"],
        "allergies": "",
        "sensitivities": ""
    }, headers=headers)

    return headers


@pytest.fixture
def auth_headers_user2():
    email = f"prod_user2_{int(time.time() * 1000)}@skincare.com"
    reg_res = client.post("/api/auth/register", json={
        "full_name": "Dry Skin User",
        "email": email,
        "password": "Password123!",
        "role": "USER"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create profile
    client.post("/api/profile", json={
        "full_name": "Dry Skin User",
        "age": 30,
        "gender": "Male",
        "skin_type": "Dry",
        "skin_tone": "Fair",
        "concerns": ["Dryness & Dehydration", "Sensitivity"],
        "allergies": "fragrance",
        "sensitivities": "fragrance"
    }, headers=headers)

    return headers


def test_product_schema_has_purchase_url(auth_headers_user1):
    response = client.get("/api/products", headers=auth_headers_user1)
    assert response.status_code == 200
    products = response.json()
    assert len(products) > 0
    # Verify purchase_url field exists in product response
    first = products[0]
    assert "purchase_url" in first


def test_personalized_recommendations_differ(auth_headers_user1, auth_headers_user2):
    # Generate for Oily user
    res1 = client.post("/api/recommendations/generate", json={"budget_tier": "ALL"}, headers=auth_headers_user1)
    assert res1.status_code == 201
    data1 = res1.json()
    top_prod_1 = data1["recommended_products"][0]["product"]

    # Generate for Dry user
    res2 = client.post("/api/recommendations/generate", json={"budget_tier": "ALL"}, headers=auth_headers_user2)
    assert res2.status_code == 201
    data2 = res2.json()
    top_prod_2 = data2["recommended_products"][0]["product"]

    # Top recommended products should match their respective skin type suitability
    assert any(st in top_prod_1["suitable_skin_types"] for st in ["Oily", "Normal", "Combination"])
    assert any(st in top_prod_2["suitable_skin_types"] for st in ["Dry", "Normal", "Sensitive", "Combination"])


def test_product_comparison_and_best_match(auth_headers_user1, db_session: Session):
    products = db_session.query(Product).limit(3).all()
    prod_ids = [p.id for p in products]

    res = client.post("/api/recommendations/compare", json={"product_ids": prod_ids}, headers=auth_headers_user1)
    assert res.status_code == 200
    data = res.json()

    assert "comparison" in data
    assert "best_match_product_id" in data
    assert len(data["comparison"]) == 3
    assert data["best_match_product_id"] in prod_ids
    assert "recommendation_note" in data
