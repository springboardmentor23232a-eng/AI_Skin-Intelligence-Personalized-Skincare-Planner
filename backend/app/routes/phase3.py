from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import User, SkinProfile, SkinAssessment, SkincareRoutine, Ingredient, IngredientCompatibilityCheck, Product
from app.auth import get_current_user
from app.schemas_phase3 import (
    SkincareRoutineResponse,
    IngredientResponse,
    CompatibilityCheckRequest,
    CompatibilityCheckResponse,
    ProductCreate,
    ProductResponse
)


router = APIRouter(prefix="/api", tags=["phase3"])

# =========================================================
# SEED DATA: 12 CORE INGREDIENTS DEFINITION
# =========================================================

CORE_INGREDIENTS_DATA = [
    {
        "name": "Niacinamide",
        "category": "Vitamin B3 / Antioxidant",
        "description": "Versatile water-soluble vitamin that strengthens skin barrier, reduces sebum secretion, and minimizes pore visibility.",
        "benefits": ["Soothes redness", "Controls oil secretion", "Fades hyperpigmentation", "Strengthens skin barrier"],
        "side_effects": ["Mild flushing at high concentrations (>10%)"],
        "suitable_skin_types": ["Oily", "Combination", "Dry", "Sensitive", "Normal"],
        "suitable_skin_concerns": ["Acne / Breakouts", "Hyperpigmentation", "Oiliness & Enlarged Pores", "Redness & Rosacea"],
        "usage_time": "BOTH",
        "compatible_ingredients": ["Hyaluronic Acid", "Ceramides", "Peptides", "Azelaic Acid", "Salicylic Acid"],
        "conflicting_ingredients": ["L-Ascorbic Acid (Pure Vitamin C) at high concentration"],
        "safety_warnings": "Safe for daily use morning and evening. Start at 2-5% concentration for sensitive skin."
    },
    {
        "name": "Vitamin C (L-Ascorbic Acid)",
        "category": "Antioxidant",
        "description": "Potent antioxidant that neutralizes free radicals, boosts collagen synthesis, and brightens dark spots.",
        "benefits": ["Brightens skin tone", "Protects against UV damage", "Fades sun spots", "Boosts collagen production"],
        "side_effects": ["Tingling sensation", "Mild redness", "Oxidizes quickly if exposed to air"],
        "suitable_skin_types": ["Normal", "Combination", "Dry", "Oily"],
        "suitable_skin_concerns": ["Hyperpigmentation", "Dark Spots", "Uneven Texture", "Fine Lines & Wrinkles"],
        "usage_time": "MORNING",
        "compatible_ingredients": ["Vitamin E", "Ferulic Acid", "Hyaluronic Acid", "Sunscreen"],
        "conflicting_ingredients": ["Retinol", "Glycolic Acid", "Salicylic Acid", "Niacinamide (High Concentration)"],
        "safety_warnings": "Use in morning under SPF 50. Do not combine directly with Retinol or AHA/BHA in same step."
    },
    {
        "name": "Retinol",
        "category": "Vitamin A / Cell Communicating",
        "description": "Gold-standard anti-aging derivative that accelerates cellular turnover, reduces fine lines, and clears clogged pores.",
        "benefits": ["Smooths fine lines and wrinkles", "Boosts cell turnover", "Improves skin texture", "Unclogs pores"],
        "side_effects": ["Dryness", "Peeling/Flaking", "Photosensitivity", "Purging initial 2-4 weeks"],
        "suitable_skin_types": ["Normal", "Combination", "Oily", "Dry"],
        "suitable_skin_concerns": ["Fine Lines & Wrinkles", "Acne / Breakouts", "Uneven Texture", "Hyperpigmentation"],
        "usage_time": "NIGHT",
        "compatible_ingredients": ["Hyaluronic Acid", "Ceramides", "Niacinamide", "Peptides"],
        "conflicting_ingredients": ["Vitamin C", "Glycolic Acid", "Salicylic Acid", "Benzoyl Peroxide"],
        "safety_warnings": "Apply strictly at night. Always apply daily broad-spectrum SPF sunscreen. Avoid during pregnancy."
    },
    {
        "name": "Hyaluronic Acid",
        "category": "Humectant",
        "description": "Powerful humectant capable of holding up to 1000 times its weight in water, providing deep multi-layer hydration.",
        "benefits": ["Instant plumping effect", "Deep hydration", "Reduces dry lines", "Soothes irritated skin"],
        "side_effects": ["Can draw moisture out if applied in desert-dry air without occlusive layer"],
        "suitable_skin_types": ["Dry", "Sensitive", "Combination", "Oily", "Normal"],
        "suitable_skin_concerns": ["Dryness & Dehydration", "Fine Lines & Wrinkles", "Sensitivity"],
        "usage_time": "BOTH",
        "compatible_ingredients": ["All ingredients (Retinol, Vitamin C, Niacinamide, AHA/BHA, Ceramides)"],
        "conflicting_ingredients": [],
        "safety_warnings": "Apply onto damp skin followed immediately by a moisturizer to lock in hydration."
    },
    {
        "name": "Ceramides",
        "category": "Lipid / Barrier Repair",
        "description": "Essential epidermal lipids that restore skin barrier integrity, prevent transepidermal water loss, and soothe inflammation.",
        "benefits": ["Restores skin barrier", "Prevents moisture loss", "Soothes eczema and scaling", "Protects against irritants"],
        "side_effects": ["None"],
        "suitable_skin_types": ["Dry", "Sensitive", "Combination", "Normal", "Oily"],
        "suitable_skin_concerns": ["Dryness & Dehydration", "Redness & Rosacea", "Sensitivity"],
        "usage_time": "BOTH",
        "compatible_ingredients": ["All ingredients (Especially Retinol, Acids, Hyaluronic Acid, Niacinamide)"],
        "conflicting_ingredients": [],
        "safety_warnings": "Ideal for pairing with potent actives like Retinol or Acids to minimize barrier disruption."
    },
    {
        "name": "Salicylic Acid (BHA)",
        "category": "Beta Hydroxy Acid / Exfoliant",
        "description": "Oil-soluble beta hydroxy acid that penetrates deep into hair follicles to dissolve sebum and unclog pores.",
        "benefits": ["Dissolves pore blockage", "Reduces active acne", "Calms inflammation", "Refines pore size"],
        "side_effects": ["Mild dryness", "Tingling", "Peeling if overused"],
        "suitable_skin_types": ["Oily", "Combination"],
        "suitable_skin_concerns": ["Acne / Breakouts", "Oiliness & Enlarged Pores", "Uneven Texture"],
        "usage_time": "BOTH",
        "compatible_ingredients": ["Niacinamide", "Hyaluronic Acid", "Ceramides", "Azelaic Acid"],
        "conflicting_ingredients": ["Retinol", "Vitamin C", "Glycolic Acid"],
        "safety_warnings": "Use 2-3 times per week initially. Do not layer with other strong chemical exfoliants or Retinol."
    },
    {
        "name": "Glycolic Acid (AHA)",
        "category": "Alpha Hydroxy Acid / Exfoliant",
        "description": "Smallest molecule AHA that gently unbinds dead stratum corneum skin cells, brightening complexion and texture.",
        "benefits": ["Exfoliates surface skin", "Brightens dull skin", "Improves hyperpigmentation", "Smooths texture"],
        "side_effects": ["Stinging", "Redness", "Increased sun sensitivity"],
        "suitable_skin_types": ["Normal", "Combination", "Dry", "Oily"],
        "suitable_skin_concerns": ["Hyperpigmentation", "Uneven Texture", "Dark Spots", "Fine Lines & Wrinkles"],
        "usage_time": "NIGHT",
        "compatible_ingredients": ["Hyaluronic Acid", "Ceramides", "Niacinamide"],
        "conflicting_ingredients": ["Retinol", "Vitamin C", "Salicylic Acid", "Lactic Acid"],
        "safety_warnings": "Always wear SPF during the day. Limit usage to 1-2 times weekly for beginners."
    },
    {
        "name": "Lactic Acid (AHA)",
        "category": "Alpha Hydroxy Acid / Hydrating Exfoliant",
        "description": "Larger molecule AHA derived from milk/fermentation that provides gentle surface exfoliation with built-in hydration.",
        "benefits": ["Gentle exfoliation", "Improves skin hydration", "Fades mild discoloration", "Smoother texture"],
        "side_effects": ["Mild tingling"],
        "suitable_skin_types": ["Sensitive", "Dry", "Normal", "Combination"],
        "suitable_skin_concerns": ["Dryness & Dehydration", "Hyperpigmentation", "Sensitivity", "Uneven Texture"],
        "usage_time": "NIGHT",
        "compatible_ingredients": ["Hyaluronic Acid", "Ceramides", "Niacinamide", "Peptides"],
        "conflicting_ingredients": ["Retinol", "Vitamin C", "Glycolic Acid", "Salicylic Acid"],
        "safety_warnings": "Softer alternative to Glycolic Acid for sensitive or dry skin types."
    },
    {
        "name": "AHA Complex",
        "category": "Alpha Hydroxy Acid Mixture",
        "description": "Blended formulation of Glycolic, Lactic, and Mandelic acids designed for comprehensive multi-depth surface exfoliation.",
        "benefits": ["Comprehensive surface renewal", "Enhanced radiance", "Refines rough patches", "Evens skin tone"],
        "side_effects": ["Temporary redness", "Mild peeling"],
        "suitable_skin_types": ["Normal", "Combination", "Oily"],
        "suitable_skin_concerns": ["Uneven Texture", "Hyperpigmentation", "Dark Spots"],
        "usage_time": "NIGHT",
        "compatible_ingredients": ["Hyaluronic Acid", "Ceramides", "Centella Asiatica"],
        "conflicting_ingredients": ["Retinol", "Vitamin C", "BHA Complex"],
        "safety_warnings": "Use max 1-2 times per week at night. Follow with barrier repair moisturizer."
    },
    {
        "name": "BHA Complex",
        "category": "Beta Hydroxy Acid Mixture",
        "description": "Concentrated Salicylic acid & Betaine Salicylate blend tailored for clearing severe comedones and blackheads.",
        "benefits": ["Deep pore purification", "Blackhead reduction", "Sebum regulation", "Prevents breakouts"],
        "side_effects": ["Initial purging", "Dryness around nose/mouth"],
        "suitable_skin_types": ["Oily", "Combination"],
        "suitable_skin_concerns": ["Acne / Breakouts", "Oiliness & Enlarged Pores"],
        "usage_time": "BOTH",
        "compatible_ingredients": ["Niacinamide", "Hyaluronic Acid", "Ceramides"],
        "conflicting_ingredients": ["Retinol", "Vitamin C", "AHA Complex"],
        "safety_warnings": "Spot test before full face application. Ensure rich hydration layer afterwards."
    },
    {
        "name": "Peptides",
        "category": "Amino Acid Chains / Signal Peptides",
        "description": "Short chains of amino acids that signal skin cells to produce fresh collagen, elastin, and structural proteins.",
        "benefits": ["Firms skin structure", "Reduces line depth", "Accelerates wound healing", "Improves elasticity"],
        "side_effects": ["Extremely rare"],
        "suitable_skin_types": ["Dry", "Normal", "Combination", "Sensitive", "Oily"],
        "suitable_skin_concerns": ["Fine Lines & Wrinkles", "Sensitivity", "Uneven Texture"],
        "usage_time": "BOTH",
        "compatible_ingredients": ["Hyaluronic Acid", "Niacinamide", "Ceramides", "Retinol"],
        "conflicting_ingredients": ["Strong Direct Acids (Unbuffered Glycolic Acid)"],
        "safety_warnings": "Excellent non-irritating alternative or booster for anti-aging routines."
    },
    {
        "name": "Azelaic Acid",
        "category": "Dicarboxylic Acid / Anti-Inflammatory",
        "description": "Naturally occurring dicarboxylic acid with potent anti-microbial, anti-inflammatory, and tyrosinase-inhibiting properties.",
        "benefits": ["Reduces rosacea redness", "Treats inflammatory acne", "Fades post-inflammatory hyperpigmentation", "Smooths skin"],
        "side_effects": ["Mild itchiness or tingling upon initial application"],
        "suitable_skin_types": ["Sensitive", "Oily", "Combination", "Dry", "Normal"],
        "suitable_skin_concerns": ["Redness & Rosacea", "Acne / Breakouts", "Hyperpigmentation", "Dark Spots"],
        "usage_time": "BOTH",
        "compatible_ingredients": ["Niacinamide", "Hyaluronic Acid", "Ceramides", "Salicylic Acid"],
        "conflicting_ingredients": ["High-strength AHA/BHA mixtures in same application step"],
        "safety_warnings": "Safe during pregnancy under medical consultation. Highly effective for redness and acne spots."
    }
]

# =========================================================
# SEED DATABASE ENDPOINT
# =========================================================

@router.post("/ingredients/seed", status_code=status.HTTP_201_CREATED)
def seed_ingredients(db: Session = Depends(get_db)):
    added = 0
    for data in CORE_INGREDIENTS_DATA:
        existing = db.query(Ingredient).filter(Ingredient.name == data["name"]).first()
        if not existing:
            ing = Ingredient(
                name=data["name"],
                category=data["category"],
                description=data["description"],
                benefits=data["benefits"],
                side_effects=data["side_effects"],
                suitable_skin_types=data["suitable_skin_types"],
                suitable_skin_concerns=data["suitable_skin_concerns"],
                usage_time=data["usage_time"],
                compatible_ingredients=data["compatible_ingredients"],
                conflicting_ingredients=data["conflicting_ingredients"],
                safety_warnings=data["safety_warnings"]
            )
            db.add(ing)
            added += 1
    db.commit()
    return {"message": f"Successfully seeded {added} ingredients into PostgreSQL database"}

# =========================================================
# MODULE 1: AI ROUTINE GENERATION APIs
# =========================================================

@router.post("/routines/generate", response_model=List[SkincareRoutineResponse], status_code=status.HTTP_201_CREATED)
def generate_routines(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    assessment = db.query(SkinAssessment).filter(SkinAssessment.user_id == current_user.id).order_by(SkinAssessment.created_at.desc()).first()

    skin_type = profile.skin_type if profile else "Combination"
    concerns = profile.concerns if profile and profile.concerns else ["Acne / Breakouts", "Hyperpigmentation"]
    allergies = profile.allergies if profile and profile.allergies else "None"
    water_intake = profile.water_intake if profile else 2.0
    uv = profile.uv_exposure if profile else "Moderate"
    climate = profile.climate if profile else "Temperate"
    score = assessment.overall_score if assessment else 80
    risk = assessment.risk_level if assessment else "Low Risk"

    # Wipe existing routines for fresh AI generation
    db.query(SkincareRoutine).filter(SkincareRoutine.user_id == current_user.id).delete()
    db.commit()

    # 1. MORNING ROUTINE
    morning_steps = [
        {
            "step_number": 1,
            "category": "Cleanser",
            "ingredient": "Gentle Hydrating Cleanser",
            "instructions": "Massage 1 pump onto damp skin for 60 seconds with lukewarm water. Rinse thoroughly.",
            "frequency": "Daily (Every Morning)",
            "duration": "1 Minute",
            "precautions": "Avoid hot water which strips natural skin barrier lipids.",
            "expected_benefits": "Removes overnight sebum buildup while maintaining surface moisture balance."
        },
        {
            "step_number": 2,
            "category": "Antioxidant Treatment",
            "ingredient": "Niacinamide 5% + Hyaluronic Acid Serum",
            "instructions": "Dispense 3-4 drops evenly across face and neck. Gently pat until absorbed.",
            "frequency": "Daily (Every Morning)",
            "duration": "30 Seconds",
            "precautions": f"Avoid if allergic to: {allergies}" if allergies != "None" else "Patch test before first use.",
            "expected_benefits": "Controls oil secretion, reduces inflammation, and strengthens skin barrier."
        },
        {
            "step_number": 3,
            "category": "Hydrating Moisturizer",
            "ingredient": "Ceramides & Peptide Daily Gel Cream",
            "instructions": "Apply a nickel-sized amount evenly to lock in active hydrating serum.",
            "frequency": "Daily (Every Morning)",
            "duration": "30 Seconds",
            "precautions": "Ensure skin is clean and serum is set.",
            "expected_benefits": f"Sustains moisture levels for {water_intake}L daily water target."
        },
        {
            "step_number": 4,
            "category": "UV Photoprotection",
            "ingredient": "Broad Spectrum Mineral SPF 50+ Sunscreen",
            "instructions": "Apply 2 finger lengths generously over face, ears, and neck 15 mins before sun exposure.",
            "frequency": "Daily (Reapply every 2 hours outdoors)",
            "duration": "1 Minute",
            "precautions": f"Essential for {uv} UV exposure and {climate} climate.",
            "expected_benefits": "Prevents hyperpigmentation darkening, photo-aging, and collagen breakdown."
        }
    ]

    # 2. EVENING ROUTINE
    evening_steps = [
        {
            "step_number": 1,
            "category": "Double Cleanse",
            "ingredient": "Micellar Oil Cleanser followed by Foaming Cleanser",
            "instructions": "Step 1: Massage cleansing oil on dry face to dissolve SPF. Step 2: Wash with gentle cleanser.",
            "frequency": "Daily (Every Evening)",
            "duration": "2 Minutes",
            "precautions": "Rinse completely; no residue should remain.",
            "expected_benefits": "Thoroughly purifies heavy sunscreen, urban pollution, and excess sebum."
        },
        {
            "step_number": 2,
            "category": "Targeted Repair Active",
            "ingredient": "Retinol 0.3% OR Azelaic Acid 10% (Based on Concern)",
            "instructions": "Apply pea-sized amount to completely dry skin. Avoid delicate eye corners and lips.",
            "frequency": "3 Times / Week (Mon, Wed, Fri)",
            "duration": "1 Minute",
            "precautions": "Do not mix with AHA/BHA in same night. Always use SPF next morning.",
            "expected_benefits": f"Targets primary concerns: {', '.join(concerns[:2])}. Accelerates cellular renewal."
        },
        {
            "step_number": 3,
            "category": "Barrier Overnight Cream",
            "ingredient": "Rich Ceramide & Lipid Repair Balm",
            "instructions": "Warm between fingertips and press firmly onto face to seal active repair ingredients.",
            "frequency": "Daily (Every Evening)",
            "duration": "1 Minute",
            "precautions": "Use extra layer on dry or sensitive areas.",
            "expected_benefits": "Restores stratum corneum integrity overnight and prevents transepidermal water loss."
        }
    ]

    # 3. WEEKLY ROUTINE
    weekly_steps = [
        {
            "step_number": 1,
            "category": "Exfoliating Treatment",
            "ingredient": "Salicylic Acid 2% (BHA) or Lactic Acid 5% (AHA)",
            "instructions": "Apply liquid exfoliant after cleansing on dry skin. Leave on for 10 mins before moisturizing.",
            "frequency": "1-2 Times per Week (Sunday Night)",
            "duration": "10 Minutes",
            "precautions": "Pause Retinol on exfoliation nights to prevent irritation.",
            "expected_benefits": "Dissolves dead skin cell buildup, unblocks pores, and enhances product absorption."
        },
        {
            "step_number": 2,
            "category": "Hydrating Sheet Mask",
            "ingredient": "Hyaluronic Acid & Centella Soothing Mask",
            "instructions": "Apply mask sheet onto face for 15 minutes. Remove and pat remaining essence.",
            "frequency": "Once per Week",
            "duration": "15 Minutes",
            "precautions": "Do not leave mask to dry completely on skin.",
            "expected_benefits": "Rapid surge of deep hydration and neuro-sensory skin calming."
        }
    ]

    # 4. MONTHLY ROUTINE
    monthly_steps = [
        {
            "step_number": 1,
            "category": "Deep Pore Detox",
            "ingredient": "Kaolin & Bentonite Clay Treatment",
            "instructions": "Apply thin layer to T-zone. Leave for 8-10 minutes until tacky, then wash with warm washcloth.",
            "frequency": "Once per Month (End of Month)",
            "duration": "10 Minutes",
            "precautions": "Do not let clay crack completely; rinse while slightly damp.",
            "expected_benefits": "Draws out deep micro-impurities and resets pore congestion."
        },
        {
            "step_number": 2,
            "category": "Progress Audit Check",
            "ingredient": "AI Skin Assessment Re-Evaluation",
            "instructions": "Re-run full 10-parameter skin assessment sliders in dashboard to recalibrate health score.",
            "frequency": "Monthly",
            "duration": "5 Minutes",
            "precautions": "Take photo in consistent indoor lighting.",
            "expected_benefits": f"Tracks progress toward improving current overall score ({score}%) and risk rating ({risk})."
        }
    ]

    # 5. SEASONAL ROUTINE
    seasonal_steps = [
        {
            "step_number": 1,
            "category": f"Climate Adaptation ({climate})",
            "ingredient": "Humid / Dry Climate Barrier Tuning Fluid",
            "instructions": f"Switch texture based on weather: Light gel for {climate} humid seasons, thick balm for cold dry months.",
            "frequency": "Seasonal Transition",
            "duration": "Daily adjustment",
            "precautions": "Increase hydration when heating or air conditioning is active.",
            "expected_benefits": "Maintains optimum skin hydration coefficient despite external seasonal shifts."
        }
    ]

    routines_to_create = [
        SkincareRoutine(
            user_id=current_user.id,
            routine_type="MORNING",
            title="🌞 Daily Morning Protection & Hydration Protocol",
            description="Focused on antioxidant shield, moisture lock, and UV photoprotection.",
            steps=morning_steps
        ),
        SkincareRoutine(
            user_id=current_user.id,
            routine_type="EVENING",
            title="🌙 Daily Evening Deep Repair & Active Treatment",
            description="Focused on double cleansing, cellular renewal actives, and barrier restoration.",
            steps=evening_steps
        ),
        SkincareRoutine(
            user_id=current_user.id,
            routine_type="WEEKLY",
            title="✨ Weekly Exfoliation & Deep Hydration Reset",
            description="Targeted pore clearance and intense soothing hydration recovery.",
            steps=weekly_steps
        ),
        SkincareRoutine(
            user_id=current_user.id,
            routine_type="MONTHLY",
            title="🔬 Monthly Pore Detox & Progress Re-Evaluation",
            description="Deep clay detox and AI skin diagnostic trend tracking.",
            steps=monthly_steps
        ),
        SkincareRoutine(
            user_id=current_user.id,
            routine_type="SEASONAL",
            title="🌡️ Climate & Seasonal Adaptive Protocol",
            description=f"Environmental adjustment protocol customized for {climate} conditions and {uv} UV levels.",
            steps=seasonal_steps
        )
    ]

    for r in routines_to_create:
        db.add(r)
    db.commit()

    created_routines = db.query(SkincareRoutine).filter(SkincareRoutine.user_id == current_user.id).all()
    return created_routines

@router.get("/routines", response_model=List[SkincareRoutineResponse])
def get_routines(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    routines = db.query(SkincareRoutine).filter(SkincareRoutine.user_id == current_user.id).all()
    return routines

@router.get("/routines/{routine_type}", response_model=SkincareRoutineResponse)
def get_routine_by_type(
    routine_type: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    routine = db.query(SkincareRoutine).filter(
        SkincareRoutine.user_id == current_user.id,
        SkincareRoutine.routine_type == routine_type.upper()
    ).first()
    if not routine:
        raise HTTPException(status_code=404, detail=f"Routine type '{routine_type}' not found. Please click Generate Routine.")
    return routine

@router.delete("/routines/{routine_id}", status_code=status.HTTP_200_OK)
def delete_routine(
    routine_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    routine = db.query(SkincareRoutine).filter(
        SkincareRoutine.id == routine_id,
        SkincareRoutine.user_id == current_user.id
    ).first()
    if not routine:
        raise HTTPException(status_code=404, detail="Routine not found")
    db.delete(routine)
    db.commit()
    return {"message": "Routine deleted successfully"}

# =========================================================
# MODULE 2: INGREDIENT INTELLIGENCE & CHECKER APIs
# =========================================================

@router.get("/ingredients", response_model=List[IngredientResponse])
def get_ingredients(db: Session = Depends(get_db)):
    # Auto-seed if database ingredients table is empty
    count = db.query(Ingredient).count()
    if count == 0:
        for data in CORE_INGREDIENTS_DATA:
            ing = Ingredient(
                name=data["name"],
                category=data["category"],
                description=data["description"],
                benefits=data["benefits"],
                side_effects=data["side_effects"],
                suitable_skin_types=data["suitable_skin_types"],
                suitable_skin_concerns=data["suitable_skin_concerns"],
                usage_time=data["usage_time"],
                compatible_ingredients=data["compatible_ingredients"],
                conflicting_ingredients=data["conflicting_ingredients"],
                safety_warnings=data["safety_warnings"]
            )
            db.add(ing)
        db.commit()

    ingredients = db.query(Ingredient).order_by(Ingredient.name.asc()).all()
    return ingredients

@router.get("/ingredients/{ingredient_id}", response_model=IngredientResponse)
def get_ingredient_detail(ingredient_id: int, db: Session = Depends(get_db)):
    ing = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not ing:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return ing

@router.post("/ingredients/check-compatibility", response_model=CompatibilityCheckResponse)
def check_ingredient_compatibility(
    payload: CompatibilityCheckRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    selected = payload.selected_ingredients
    if len(selected) < 2:
        raise HTTPException(status_code=400, detail="Please select at least 2 ingredients to evaluate compatibility.")

    # Fetch DB records for selected names
    db_ingredients = db.query(Ingredient).filter(Ingredient.name.in_(selected)).all()
    ing_map = {ing.name.lower(): ing for ing in db_ingredients}

    conflicts = []
    
    # Conflict Rules Matrix Evaluation
    for i in range(len(selected)):
        for j in range(i + 1, len(selected)):
            name_a = selected[i]
            name_b = selected[j]
            ing_a = ing_map.get(name_a.lower())

            # Check if name_b is in ing_a's conflicting list or known active conflicts
            if ing_a and ing_a.conflicting_ingredients:
                for conflict_term in ing_a.conflicting_ingredients:
                    if conflict_term.lower() in name_b.lower() or name_b.lower() in conflict_term.lower():
                        conflicts.append({
                            "ingredient_a": name_a,
                            "ingredient_b": name_b,
                            "warning": f"Combining {name_a} with {name_b} can cause severe skin irritation, peeling, or neutralize efficacy.",
                            "risk_level": "HIGH CONFLICT WARNING"
                        })

    # Hardcoded known active conflict pairs for safety
    known_conflicts = [
        ("Retinol", "Glycolic Acid (AHA)"),
        ("Retinol", "Salicylic Acid (BHA)"),
        ("Retinol", "Vitamin C (L-Ascorbic Acid)"),
        ("Vitamin C (L-Ascorbic Acid)", "Glycolic Acid (AHA)"),
        ("Vitamin C (L-Ascorbic Acid)", "Salicylic Acid (BHA)"),
        ("Glycolic Acid (AHA)", "Salicylic Acid (BHA)"),
        ("AHA Complex", "Retinol"),
        ("BHA Complex", "Retinol")
    ]

    for pair_a, pair_b in known_conflicts:
        if any(pair_a.lower() in s.lower() for s in selected) and any(pair_b.lower() in s.lower() for s in selected):
            # Check if already recorded
            already_found = any(
                (c["ingredient_a"].lower() in pair_a.lower() and c["ingredient_b"].lower() in pair_b.lower()) or
                (c["ingredient_a"].lower() in pair_b.lower() and c["ingredient_b"].lower() in pair_a.lower())
                for c in conflicts
            )
            if not already_found:
                conflicts.append({
                    "ingredient_a": pair_a,
                    "ingredient_b": pair_b,
                    "warning": f"Dermatological conflict: Direct layering of {pair_a} and {pair_b} in the same routine destabilizes skin pH and compromises lipid barrier.",
                    "risk_level": "HIGH CONFLICT WARNING"
                })

    is_safe = (len(conflicts) == 0)

    if is_safe:
        recommendation = f"✅ Excellent Synergy! The selected combination ({', '.join(selected)}) is safe for concurrent use. Ensure proper sun protection."
    else:
        recommendation = f"⚠️ Conflict Alert Detected! Found {len(conflicts)} unsafe interaction(s). Separate these active ingredients between Morning and Evening routines or alternate days."

    audit_check = IngredientCompatibilityCheck(
        user_id=current_user.id,
        selected_ingredients=selected,
        is_safe=1 if is_safe else 0,
        conflicts_found=conflicts,
        recommendation=recommendation
    )
    db.add(audit_check)
    db.commit()
    db.refresh(audit_check)

    return audit_check


# =========================================================
# MODULE 3: PRODUCT DATABASE APIs
# =========================================================

CORE_PRODUCTS_DATA = [
    {
        "brand": "CeraVe",
        "name": "Hydrating Facial Cleanser",
        "category": "Cleanser",
        "price": 14.99,
        "rating": 4.8,
        "active_ingredients": ["Ceramides", "Hyaluronic Acid"],
        "suitable_skin_types": ["Normal", "Dry", "Sensitive"],
        "suitable_concerns": ["Dryness & Dehydration", "Sensitivity"],
        "description": "Non-foaming cleanser that removes dirt and makeup while preserving natural moisture barrier with essential ceramides.",
        "usage_instructions": "Massage onto wet skin morning and night, rinse with warm water.",
        "image_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80"
    },
    {
        "brand": "La Roche-Posay",
        "name": "Effaclar Purifying Foaming Gel Cleanser",
        "category": "Cleanser",
        "price": 16.99,
        "rating": 4.7,
        "active_ingredients": ["Zinc PCA", "Thermal Spring Water"],
        "suitable_skin_types": ["Oily", "Combination"],
        "suitable_concerns": ["Acne / Breakouts", "Oiliness & Enlarged Pores"],
        "description": "Gentle oil-free facial wash designed to cleanse impurities and diminish excess sebum without drying.",
        "usage_instructions": "Lather with warm water, gently massage into T-zone, and rinse completely.",
        "image_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80"
    },
    {
        "brand": "The Ordinary",
        "name": "Niacinamide 10% + Zinc 1%",
        "category": "Serum",
        "price": 6.00,
        "rating": 4.6,
        "active_ingredients": ["Niacinamide", "Zinc PCA"],
        "suitable_skin_types": ["Oily", "Combination", "Normal"],
        "suitable_concerns": ["Acne / Breakouts", "Oiliness & Enlarged Pores", "Hyperpigmentation"],
        "description": "High-strength vitamin and mineral formula to reduce appearance of skin blemishes and congestion.",
        "usage_instructions": "Apply 3 drops to entire face morning and evening before heavy creams.",
        "image_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80"
    },
    {
        "brand": "Paula's Choice",
        "name": "Skin Perfecting 2% BHA Liquid Exfoliant",
        "category": "Treatment",
        "price": 34.00,
        "rating": 4.9,
        "active_ingredients": ["Salicylic Acid (BHA)", "Green Tea Extract"],
        "suitable_skin_types": ["Oily", "Combination", "Normal"],
        "suitable_concerns": ["Acne / Breakouts", "Oiliness & Enlarged Pores", "Uneven Texture"],
        "description": "Fluid leave-on exfoliant that unclogs pores, smooths wrinkles, and evens out skin tone rapidly.",
        "usage_instructions": "Apply once or twice daily after cleansing and toning with a cotton pad.",
        "image_url": "https://images.unsplash.com/photo-1608248597262-838d78078696?w=500&q=80"
    },
    {
        "brand": "SkinCeuticals",
        "name": "C E Ferulic Combination Antioxidant Treatment",
        "category": "Serum",
        "price": 182.00,
        "rating": 4.9,
        "active_ingredients": ["Vitamin C (L-Ascorbic Acid)", "Vitamin E", "Ferulic Acid"],
        "suitable_skin_types": ["Dry", "Normal", "Combination"],
        "suitable_concerns": ["Hyperpigmentation", "Dark Spots", "Fine Lines & Wrinkles"],
        "description": "Advanced antioxidant treatment that protects against environmental damage and brightens complexions.",
        "usage_instructions": "Apply 4-5 drops in the morning to dry face, neck, and chest under sunscreen.",
        "image_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80"
    },
    {
        "brand": "Neutrogena",
        "name": "Hydro Boost Water Gel",
        "category": "Moisturizer",
        "price": 19.99,
        "rating": 4.6,
        "active_ingredients": ["Hyaluronic Acid", "Glycerin"],
        "suitable_skin_types": ["Oily", "Combination", "Normal"],
        "suitable_concerns": ["Dryness & Dehydration"],
        "description": "Oil-free gel moisturizer that absorbs instantly to deliver long-lasting hydration.",
        "usage_instructions": "Apply smoothly over face and neck daily morning and night.",
        "image_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80"
    },
    {
        "brand": "EltaMD",
        "name": "UV Clear Broad-Spectrum SPF 46",
        "category": "Sunscreen",
        "price": 41.00,
        "rating": 4.8,
        "active_ingredients": ["Zinc Oxide", "Niacinamide", "Hyaluronic Acid"],
        "suitable_skin_types": ["Acne-Prone", "Sensitive", "Combination", "Oily"],
        "suitable_concerns": ["Acne / Breakouts", "Redness & Rosacea", "Sensitivity"],
        "description": "Dermatologist-recommended oil-free sunscreen that calms and protects sensitive, prone skin.",
        "usage_instructions": "Apply generously 15 minutes before sun exposure. Reapply at least every 2 hours.",
        "image_url": "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=500&q=80"
    },
    {
        "brand": "The Inkey List",
        "name": "Retinol Serum",
        "category": "Serum",
        "price": 12.99,
        "rating": 4.5,
        "active_ingredients": ["Retinol", "Granactive Retinoid", "Squalane"],
        "suitable_skin_types": ["Normal", "Combination", "Oily"],
        "suitable_concerns": ["Fine Lines & Wrinkles", "Uneven Texture", "Acne / Breakouts"],
        "description": "Slow-release Retinol formula that targets fine lines and wrinkles with minimal irritation risk.",
        "usage_instructions": "Use in the evening routine. Apply a pea-sized amount after cleansing.",
        "image_url": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&q=80"
    },
    {
        "brand": "COSRX",
        "name": "Advanced Snail 96 Mucin Power Essence",
        "category": "Toner",
        "price": 15.00,
        "rating": 4.8,
        "active_ingredients": ["Snail Secretion Filtrate", "Hyaluronic Acid"],
        "suitable_skin_types": ["Dry", "Sensitive", "Normal", "Combination"],
        "suitable_concerns": ["Dryness & Dehydration", "Sensitivity", "Redness & Rosacea"],
        "description": "Lightweight hydrating essence that repairs damaged skin barrier and soothes redness.",
        "usage_instructions": "Pat onto damp face after cleansing and toning before applying heavy serums.",
        "image_url": "https://images.unsplash.com/photo-1608248597262-838d78078696?w=500&q=80"
    },
    {
        "brand": "Ordinary",
        "name": "Glycolic Acid 7% Toning Solution",
        "category": "Toner",
        "price": 13.00,
        "rating": 4.7,
        "active_ingredients": ["Glycolic Acid (AHA)", "Aloe Vera", "Tasmanian Pepperberry"],
        "suitable_skin_types": ["Normal", "Oily", "Combination"],
        "suitable_concerns": ["Hyperpigmentation", "Uneven Texture", "Dark Spots"],
        "description": "Exfoliating toning solution that offers mild exfoliation for improved skin radiance.",
        "usage_instructions": "Use ideally in the evening, no more than once per day. Soak cotton pad and sweep across face.",
        "image_url": "https://images.unsplash.com/photo-1608248597262-838d78078696?w=500&q=80"
    },
    {
        "brand": "La Roche-Posay",
        "name": "Cicaplast Baume B5+ Soothing Balm",
        "category": "Moisturizer",
        "price": 17.99,
        "rating": 4.9,
        "active_ingredients": ["Panthenol (Vitamin B5)", "Madecassoside (Centella)", "Shea Butter"],
        "suitable_skin_types": ["Dry", "Sensitive", "Normal"],
        "suitable_concerns": ["Sensitivity", "Redness & Rosacea", "Dryness & Dehydration"],
        "description": "Multi-purpose therapeutic balm that soothes cracked, chapped skin and restores compromised skin barrier.",
        "usage_instructions": "Apply twice daily to clean dry skin. Can be applied to body, face, and lips.",
        "image_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80"
    },
    {
        "brand": "Ordinary",
        "name": "Azelaic Acid Suspension 10%",
        "category": "Treatment",
        "price": 11.10,
        "rating": 4.6,
        "active_ingredients": ["Azelaic Acid"],
        "suitable_skin_types": ["Sensitive", "Oily", "Combination", "Normal"],
        "suitable_concerns": ["Redness & Rosacea", "Acne / Breakouts", "Hyperpigmentation"],
        "description": "Multi-functional brightening cream formula that targets blemishes and evens out skin tone.",
        "usage_instructions": "Apply to face AM and/or PM to improve visible brightness and texture.",
        "image_url": "https://images.unsplash.com/photo-1608248597262-838d78078696?w=500&q=80"
    }
]


@router.post("/products/seed", status_code=status.HTTP_201_CREATED)
def seed_products(db: Session = Depends(get_db)):
    added = 0
    for data in CORE_PRODUCTS_DATA:
        existing = db.query(Product).filter(
            Product.brand == data["brand"],
            Product.name == data["name"]
        ).first()
        if not existing:
            prod = Product(
                brand=data["brand"],
                name=data["name"],
                category=data["category"],
                price=data["price"],
                rating=data["rating"],
                active_ingredients=data["active_ingredients"],
                suitable_skin_types=data["suitable_skin_types"],
                suitable_concerns=data["suitable_concerns"],
                description=data["description"],
                usage_instructions=data["usage_instructions"],
                image_url=data["image_url"]
            )
            db.add(prod)
            added += 1
    db.commit()
    return {"message": f"Successfully seeded {added} products into PostgreSQL database"}


@router.get("/products", response_model=List[ProductResponse])
def get_products(
    category: Optional[str] = Query(None, description="Filter by product category"),
    skin_type: Optional[str] = Query(None, description="Filter by suitable skin type"),
    concern: Optional[str] = Query(None, description="Filter by suitable concern"),
    search: Optional[str] = Query(None, description="Search term for name or brand"),
    max_price: Optional[float] = Query(None, description="Maximum price filter"),
    db: Session = Depends(get_db)
):
    # Auto-seed if database products table is empty
    if db.query(Product).count() == 0:
        for data in CORE_PRODUCTS_DATA:
            prod = Product(
                brand=data["brand"],
                name=data["name"],
                category=data["category"],
                price=data["price"],
                rating=data["rating"],
                active_ingredients=data["active_ingredients"],
                suitable_skin_types=data["suitable_skin_types"],
                suitable_concerns=data["suitable_concerns"],
                description=data["description"],
                usage_instructions=data["usage_instructions"],
                image_url=data["image_url"]
            )
            db.add(prod)
        db.commit()

    query = db.query(Product)

    if category and category != "All":
        query = query.filter(Product.category == category)

    if max_price:
        query = query.filter(Product.price <= max_price)

    products = query.order_by(Product.rating.desc(), Product.brand.asc()).all()

    # In-memory filter for JSON list fields if specified
    filtered = []
    for p in products:
        match = True
        if skin_type and skin_type != "All":
            if not any(skin_type.lower() in st.lower() for st in p.suitable_skin_types):
                match = False
        if concern and concern != "All":
            if not any(concern.lower() in sc.lower() for sc in p.suitable_concerns):
                match = False
        if search:
            search_term = search.lower()
            if search_term not in p.name.lower() and search_term not in p.brand.lower() and search_term not in p.description.lower():
                match = False
        if match:
            filtered.append(p)

    return filtered


@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product_detail(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ["ADMIN", "SKINCARE_CONSULTANT"]:
        raise HTTPException(status_code=403, detail="Only Admins or Skincare Consultants can create new product entries.")

    prod = Product(
        brand=payload.brand,
        name=payload.name,
        category=payload.category,
        price=payload.price,
        rating=payload.rating,
        active_ingredients=payload.active_ingredients,
        suitable_skin_types=payload.suitable_skin_types,
        suitable_concerns=payload.suitable_concerns,
        description=payload.description,
        usage_instructions=payload.usage_instructions,
        image_url=payload.image_url
    )
    db.add(prod)
    db.commit()
    db.refresh(prod)
    return prod

