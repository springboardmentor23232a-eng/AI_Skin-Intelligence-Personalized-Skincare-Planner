import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.session import get_db, Base
from app.models import User, SkinProfile, SkinAssessment, SkincareRoutine, Ingredient
from app.auth import create_access_token

# Setup test DB
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_gaps.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

client = None

@pytest.fixture(scope="module")
def setup_test_users():
    global client
    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    db = TestingSessionLocal()
    db.query(User).delete()
    db.query(SkinProfile).delete()
    db.query(SkinAssessment).delete()
    db.query(SkincareRoutine).delete()
    db.commit()

    user_a = User(full_name="User Alpha", email="gap_user_a@example.com", password="hashedpassword", role="USER")
    user_b = User(full_name="User Beta", email="gap_user_b@example.com", password="hashedpassword", role="USER")
    db.add(user_a)
    db.add(user_b)
    db.commit()
    db.refresh(user_a)
    db.refresh(user_b)

    # User A Profile with Allergies & Lifestyle
    profile_a = SkinProfile(
        user_id=user_a.id,
        full_name="User Alpha",
        age=30,
        gender="Female",
        skin_type="Oily",
        skin_tone="Fair",
        concerns=["Acne / Breakouts", "Hyperpigmentation"],
        allergies="Retinol, Salicylic",
        sensitivities="Fragrance",
        lifestyle="High Stress",
        sleep_quality="Poor",
        water_intake=1.5,
        stress_level="High",
        uv_exposure="High",
        climate="Humid"
    )
    db.add(profile_a)
    db.commit()

    token_a = create_access_token(data={"sub": user_a.email, "role": user_a.role})
    token_b = create_access_token(data={"sub": user_b.email, "role": user_b.role})

    db.close()
    yield {
        "user_a": user_a,
        "token_a": token_a,
        "user_b": user_b,
        "token_b": token_b
    }
    app.dependency_overrides.clear()

def test_no_previous_assessment_behavior(setup_test_users):
    headers = {"Authorization": f"Bearer {setup_test_users['token_a']}"}
    
    # 1st Assessment (Baseline)
    res_ass1 = client.post("/api/assessment", json={
        "acne": 80,
        "hyperpigmentation": 60,
        "dryness": 30,
        "oiliness": 70,
        "redness": 40,
        "sensitivity": 30,
        "wrinkles": 20,
        "fine_lines": 20,
        "dark_spots": 50,
        "uneven_tone": 40
    }, headers=headers)
    assert res_ass1.status_code == 201

    # Generate Routine with single assessment
    res_gen = client.post("/api/routines/generate", headers=headers)
    assert res_gen.status_code == 201
    routines = res_gen.json()
    assert len(routines) == 5
    assert routines[0]["adapted_from_previous_assessment"] is False
    assert routines[0]["adaptation_summary"] is None

def test_sequential_assessment_adaptive_routine(setup_test_users):
    headers = {"Authorization": f"Bearer {setup_test_users['token_a']}"}
    
    # 2nd Assessment (Acne improved 80 -> 40, sensitivity increased 30 -> 60)
    res_ass2 = client.post("/api/assessment", json={
        "acne": 40,
        "hyperpigmentation": 50,
        "dryness": 30,
        "oiliness": 40,
        "redness": 40,
        "sensitivity": 60,
        "wrinkles": 20,
        "fine_lines": 20,
        "dark_spots": 40,
        "uneven_tone": 30
    }, headers=headers)
    assert res_ass2.status_code == 201

    # Generate Adaptive Routine
    res_gen = client.post("/api/routines/generate", headers=headers)
    assert res_gen.status_code == 201
    routines = res_gen.json()
    assert len(routines) == 5
    
    morning = next(r for r in routines if r["routine_type"] == "MORNING")
    evening = next(r for r in routines if r["routine_type"] == "EVENING")
    
    assert morning["adapted_from_previous_assessment"] is True
    assert "Acne severity improved" in morning["adaptation_summary"]
    assert "Sensitivity increased" in morning["adaptation_summary"]

    # Verify Evening step active frequency adapted to 2x/week due to acne improvement
    repair_step = evening["steps"][1]
    assert "2 Times / Week" in repair_step["frequency"]

def test_lifestyle_integration(setup_test_users):
    headers = {"Authorization": f"Bearer {setup_test_users['token_a']}"}
    res = client.get("/api/routines", headers=headers)
    assert res.status_code == 200
    routines = res.json()
    morning = next(r for r in routines if r["routine_type"] == "MORNING")
    evening = next(r for r in routines if r["routine_type"] == "EVENING")

    # High UV exposure check
    spf_step = morning["steps"][3]
    assert "Strict reapplication every 2 hours mandatory" in spf_step["precautions"]

    # Low water intake check (< 2.0L)
    moisturizer_step = morning["steps"][2]
    assert "Below 2.0L target" in moisturizer_step["expected_benefits"]

    # High Stress / Short Sleep check
    cream_step = evening["steps"][2]
    assert "cortisol-soothing lipid guidance" in cream_step["expected_benefits"]

def test_manual_routine_editing_and_authorization(setup_test_users):
    headers_a = {"Authorization": f"Bearer {setup_test_users['token_a']}"}
    headers_b = {"Authorization": f"Bearer {setup_test_users['token_b']}"}

    routines = client.get("/api/routines", headers=headers_a).json()
    routine_id = routines[0]["id"]
    original_steps = routines[0]["steps"]

    # Add Step, Modify Step, Reorder Step
    modified_steps = list(original_steps)
    modified_steps[0]["category"] = "Modified Deep Cleanser"
    modified_steps.append({
        "step_number": len(modified_steps) + 1,
        "category": "Custom Treatment Step",
        "ingredient": "Azelaic Acid 15%",
        "instructions": "Apply directly on blemishes.",
        "frequency": "Daily",
        "duration": "1 Minute",
        "precautions": "Patch test first.",
        "expected_benefits": "Fades post-acne marks."
    })

    # Unauthorized edit attempt by User B
    res_unauth = client.put(f"/api/routines/{routine_id}", json={
        "steps": modified_steps
    }, headers=headers_b)
    assert res_unauth.status_code == 404

    # Authorized edit by User A
    res_edit = client.put(f"/api/routines/{routine_id}", json={
        "title": "Customized Morning Protocol",
        "steps": modified_steps
    }, headers=headers_a)
    assert res_edit.status_code == 200
    updated = res_edit.json()
    assert updated["title"] == "Customized Morning Protocol"
    assert len(updated["steps"]) == len(original_steps) + 1
    assert updated["steps"][0]["category"] == "Modified Deep Cleanser"

def test_personal_profile_allergy_matching(setup_test_users):
    headers_a = {"Authorization": f"Bearer {setup_test_users['token_a']}"}
    
    # User A profile has "Retinol, Salicylic" in allergies
    res_check = client.post("/api/ingredients/check-compatibility", json={
        "selected_ingredients": ["Retinol", "Hyaluronic Acid"]
    }, headers=headers_a)
    assert res_check.status_code == 200
    data = res_check.json()
    assert "user_allergy_conflicts" in data
    assert "Retinol" in data["user_allergy_conflicts"]

    # Check pair without personal allergy conflict
    res_check_clean = client.post("/api/ingredients/check-compatibility", json={
        "selected_ingredients": ["Niacinamide", "Hyaluronic Acid"]
    }, headers=headers_a)
    assert res_check_clean.status_code == 200
    data_clean = res_check_clean.json()
    assert len(data_clean["user_allergy_conflicts"]) == 0
