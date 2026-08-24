import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "online"


# --- Module 5: Ingredient Intelligence Tests ---

def test_ingredient_analysis():
    payload = {
        "ingredient_names": ["Retinol", "Glycolic Acid", "Ceramide NP"],
        "skin_type": "Combination",
        "sensitivities": ["Fragrance"],
        "allergies": ["Parabens"],
        "active_concerns": ["Fine Lines", "Acne"]
    }
    response = client.post("/ingredient/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["analyzed_count"] == 3
    assert len(data["interactions"]) >= 1 # Conflict between Retinol & Glycolic Acid
    assert any(item["ingredient"] == "Retinol" for item in data["suitability_breakdown"])


def test_ingredient_categories():
    response = client.get("/ingredient/categories")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["total_categories"] >= 5
    categories = [cat["category"] for cat in data["categories"]]
    assert "Retinoids" in categories
    assert "Niacinamide" in categories
    assert "Vitamin C" in categories
    assert "Hyaluronic Acid" in categories
    assert "Ceramides" in categories


# --- Module 6: Product Recommendation Engine Tests ---

def test_product_recommendations():
    payload = {
        "category": "Moisturizer",
        "budget_tier": "Budget",
        "skin_type": "Dry",
        "active_concerns": ["Barrier Impairment", "Dryness"],
        "allergies": []
    }
    response = client.post("/product/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["category_filter"] == "Moisturizer"
    assert len(data["recommendations"]) > 0
    top_match = data["recommendations"][0]
    assert top_match["product"]["category"] == "Moisturizer"
    assert top_match["suitability_score"] >= 70.0


def test_product_comparison():
    payload = {
        "product_ids": [101, 102]
    }
    response = client.post("/product/compare", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["products_compared"] == 2
    assert "Best Choice" in data["winner_recommendation"]


def test_alternative_products():
    response = client.get("/product/alternatives/102")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["original_product_id"] == 102
    assert len(data["safer_alternatives"]) >= 1


# --- Module 7: Skin Health Scoring Engine Tests ---

def test_weighted_skin_health_scoring():
    payload = {
        "user_id": 1,
        "skin_condition_score": 80.0, # 35% -> 28.0
        "lifestyle_habits_score": 80.0, # 20% -> 16.0
        "sleep_quality_score": 70.0,   # 15% -> 10.5
        "routine_consistency_score": 90.0, # 20% -> 18.0
        "hydration_level_score": 80.0   # 10% -> 8.0
        # Expected Total = 28 + 16 + 10.5 + 18 + 8 = 80.5
    }
    response = client.post("/scoring/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["overall_skin_health_score"] == 80.5
    assert len(data["breakdown"]) == 5
    # Verify exact 35/20/15/20/10 weight labels
    weights = [b["weight_label"] for b in data["breakdown"]]
    assert weights == ["35%", "20%", "15%", "20%", "10%"]


def test_score_trend():
    response = client.get("/scoring/trend/1")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["trend_status"] == "Improving"
    assert len(data["timeline"]) == 3


def test_routine_adherence():
    payload = {
        "user_id": 1,
        "routine_type": "Morning",
        "steps_completed": 4,
        "total_steps": 4,
        "notes": "Completed morning cleansing, serum, moisturizer & SPF."
    }
    response = client.post("/scoring/adherence", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["adherence_percentage"] == 100.0
    assert data["consistency_score_boost"] == 2.5
