"""
Run once to populate demo ingredients & products:

    python -m app.seed_data

This seed file uses INR prices and product-specific image URLs.
"""

from app.database import SessionLocal, Base, engine
from app.models.ingredient import Ingredient
from app.models.product import Product


Base.metadata.create_all(bind=engine)


# ============================================================
# INGREDIENTS
# ============================================================

INGREDIENTS = [
    dict(
        name="Retinoid",
        category="retinoid",
        good_for=["wrinkles", "fine_lines", "acne"],
        avoid_if=["pregnant", "sensitive_skin"],
        interacts_badly_with=["AHAs/BHAs", "Vitamin C"],
        description="Vitamin A derivative that boosts cell turnover and collagen production.",
    ),

    dict(
        name="Niacinamide",
        category="niacinamide",
        good_for=["oily_skin", "dark_spots", "redness"],
        avoid_if=[],
        interacts_badly_with=[],
        description="Reduces oil production, redness, and supports the skin barrier.",
    ),

    dict(
        name="Vitamin C",
        category="vitamin_c",
        good_for=["hyperpigmentation", "dark_spots"],
        avoid_if=[],
        interacts_badly_with=["Retinoid"],
        description="Antioxidant that brightens skin and helps fade dark spots.",
    ),

    dict(
        name="Hyaluronic Acid",
        category="hyaluronic_acid",
        good_for=["dry_skin"],
        avoid_if=[],
        interacts_badly_with=[],
        description="Humectant that draws and holds moisture in the skin.",
    ),

    dict(
        name="Salicylic Acid",
        category="salicylic_acid",
        good_for=["acne", "oily_skin"],
        avoid_if=["dry_skin", "sensitive_skin"],
        interacts_badly_with=["Retinoid"],
        description="BHA that exfoliates inside pores and helps reduce breakouts.",
    ),

    dict(
        name="Ceramides",
        category="ceramides",
        good_for=["dry_skin", "sensitive_skin", "redness"],
        avoid_if=[],
        interacts_badly_with=[],
        description="Lipids that restore and strengthen the skin barrier.",
    ),

    dict(
        name="Peptides",
        category="peptides",
        good_for=["wrinkles", "fine_lines"],
        avoid_if=[],
        interacts_badly_with=[],
        description="Amino acid chains that support collagen and skin firmness.",
    ),

    dict(
        name="AHAs/BHAs",
        category="ahas_bhas",
        good_for=["uneven_skin_tone", "dark_spots"],
        avoid_if=["sensitive_skin"],
        interacts_badly_with=["Retinoid"],
        description="Chemical exfoliants that resurface skin and improve uneven tone.",
    ),
]


# ============================================================
# PRODUCTS
# ============================================================

PRODUCTS = [

    # ========================================================
    # FACE WASH
    # ========================================================

    dict(
        name="Salicylic Acid + LHA 2% Cleanser",
        brand="Minimalist",
        category="face_wash",
        key_ingredients=["Salicylic Acid", "LHA"],
        suitable_skin_types=["oily", "combination"],
        age_groups=["teen", "20s", "30s", "40s", "50+"],
        targets_concerns=["acne", "oily_skin", "blackheads"],
        price=299,
        description="Salicylic acid and LHA cleanser designed for acne-prone and oily skin.",
        purchase_url="https://beminimalist.co/",
        retailer="Minimalist",
        rating=4.3,
        review_count=5000,
        is_bestseller=True,
        image_url="https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=800&q=80",
    ),

    dict(
        name="B12 + Oat Extract 6.5% Gentle Cleanser",
        brand="Minimalist",
        category="face_wash",
        key_ingredients=["Oat Extract"],
        suitable_skin_types=["dry", "normal", "sensitive"],
        age_groups=["teen", "20s", "30s", "40s", "50+"],
        targets_concerns=["dry_skin", "sensitive_skin"],
        price=299,
        description="Gentle cleanser designed for dry, dehydrated and sensitive skin.",
        purchase_url="https://beminimalist.co/",
        retailer="Minimalist",
        rating=4.3,
        review_count=1500,
        is_bestseller=False,
        image_url="https://images.unsplash.com/photo-1556229010-aa3d0f7e1b0e?auto=format&fit=crop&w=800&q=80",
    ),

    # ========================================================
    # SERUM
    # ========================================================

    dict(
        name="Niacinamide 10% Face Serum",
        brand="Minimalist",
        category="serum",
        key_ingredients=["Niacinamide"],
        suitable_skin_types=["oily", "combination", "normal"],
        age_groups=["teen", "20s", "30s", "40s", "50+"],
        targets_concerns=["oily_skin", "dark_spots", "redness", "acne"],
        price=599,
        description="10% niacinamide serum for acne marks, oil control and uneven skin tone.",
        purchase_url="https://beminimalist.co/",
        retailer="Minimalist",
        rating=4.4,
        review_count=10000,
        is_bestseller=True,
        image_url="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
    ),

    dict(
        name="Vitamin C 10% Face Serum",
        brand="Minimalist",
        category="serum",
        key_ingredients=["Vitamin C"],
        suitable_skin_types=["all"],
        age_groups=["teen", "20s", "30s", "40s", "50+"],
        targets_concerns=["dark_spots", "hyperpigmentation", "uneven_skin_tone"],
        price=299,
        description="Vitamin C serum designed to improve dullness, spots and uneven skin tone.",
        purchase_url="https://beminimalist.co/",
        retailer="Minimalist",
        rating=4.3,
        review_count=7000,
        is_bestseller=True,
        image_url="https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=800&q=80",
    ),

    dict(
        name="Salicylic Acid 2% Face Serum",
        brand="Minimalist",
        category="serum",
        key_ingredients=["Salicylic Acid"],
        suitable_skin_types=["oily", "combination"],
        age_groups=["teen", "20s", "30s", "40s", "50+"],
        targets_concerns=["acne", "oily_skin", "blackheads"],
        price=549,
        description="2% salicylic acid serum for acne-prone and oily skin.",
        purchase_url="https://beminimalist.co/",
        retailer="Minimalist",
        rating=4.4,
        review_count=6000,
        is_bestseller=True,
        image_url="https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80",
    ),

    # ========================================================
    # MOISTURIZER
    # ========================================================

    dict(
        name="Vitamin B5 10% Moisturizer",
        brand="Minimalist",
        category="moisturizer",
        key_ingredients=["Vitamin B5"],
        suitable_skin_types=["oily", "combination", "normal"],
        age_groups=["teen", "20s", "30s", "40s", "50+"],
        targets_concerns=["dry_skin", "dehydrated_skin", "damaged_barrier"],
        price=349,
        description="Lightweight moisturizer for hydration and skin barrier support.",
        purchase_url="https://beminimalist.co/",
        retailer="Minimalist",
        rating=4.4,
        review_count=6000,
        is_bestseller=True,
        image_url="https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=800&q=80",
    ),

    dict(
        name="Marula Oil 5% Face Moisturizer",
        brand="Minimalist",
        category="moisturizer",
        key_ingredients=["Marula Oil"],
        suitable_skin_types=["dry", "normal"],
        age_groups=["20s", "30s", "40s", "50+"],
        targets_concerns=["dry_skin", "dehydrated_skin"],
        price=299,
        description="Moisturizer designed for dry skin, flakiness and tightness.",
        purchase_url="https://beminimalist.co/",
        retailer="Minimalist",
        rating=4.3,
        review_count=2000,
        is_bestseller=True,
        image_url="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80",
    ),

    # ========================================================
    # SUNSCREEN
    # ========================================================

    dict(
        name="SPF 50 Sunscreen",
        brand="Minimalist",
        category="sunscreen",
        key_ingredients=["UV Filters", "Niacinamide"],
        suitable_skin_types=["all"],
        age_groups=["teen", "20s", "30s", "40s", "50+"],
        targets_concerns=["uv_damage", "hyperpigmentation"],
        price=399,
        description="Broad-spectrum SPF 50 sunscreen for daily UV protection.",
        purchase_url="https://beminimalist.co/",
        retailer="Minimalist",
        rating=4.2,
        review_count=8000,
        is_bestseller=True,
        image_url="https://images.unsplash.com/photo-1556229010-aa3d0f7e1b0e?auto=format&fit=crop&w=800&q=80",
    ),

    # ========================================================
    # TONER
    # ========================================================

    dict(
        name="Polyhydroxy Acid (PHA) 3% Face Toner",
        brand="Minimalist",
        category="toner",
        key_ingredients=["PHA"],
        suitable_skin_types=["normal", "dry", "sensitive"],
        age_groups=["20s", "30s", "40s", "50+"],
        targets_concerns=["uneven_skin_tone", "dehydrated_skin", "enlarged_pores"],
        price=399,
        description="Gentle PHA toner designed for pores, texture and dehydrated skin.",
        purchase_url="https://beminimalist.co/",
        retailer="Minimalist",
        rating=4.2,
        review_count=2500,
        is_bestseller=False,
        image_url="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=800&q=80",
    ),

    # ========================================================
    # TREATMENT
    # ========================================================

    dict(
        name="Retinol 0.3% Face Serum",
        brand="Minimalist",
        category="treatment",
        key_ingredients=["Retinoid"],
        suitable_skin_types=["normal", "combination", "oily"],
        age_groups=["20s", "30s", "40s", "50+"],
        targets_concerns=["wrinkles", "fine_lines", "uneven_skin_tone"],
        price=599,
        description="0.3% retinol serum designed for fine lines, wrinkles and loss of elasticity.",
        purchase_url="https://beminimalist.co/",
        retailer="Minimalist",
        rating=4.2,
        review_count=4000,
        is_bestseller=True,
        image_url="https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=800&q=80",
    ),

    dict(
        name="AHA PHA BHA 32% Face Peel",
        brand="Minimalist",
        category="treatment",
        key_ingredients=["AHAs/BHAs"],
        suitable_skin_types=["normal", "oily"],
        age_groups=["20s", "30s", "40s"],
        targets_concerns=["hyperpigmentation", "dark_spots", "uneven_skin_tone"],
        price=699,
        description="High-strength exfoliating peel for dullness, pigmentation and uneven texture.",
        purchase_url="https://beminimalist.co/",
        retailer="Minimalist",
        rating=4.1,
        review_count=3000,
        is_bestseller=False,
        image_url="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80",
    ),

    # ========================================================
    # FACE MASK
    # ========================================================

    dict(
        name="Hydrating Ceramide Face Mask",
        brand="DemoCare",
        category="mask",
        key_ingredients=["Ceramides", "Hyaluronic Acid"],
        suitable_skin_types=["dry", "normal", "sensitive"],
        age_groups=["teen", "20s", "30s", "40s", "50+"],
        targets_concerns=["dry_skin", "sensitive_skin", "redness"],
        price=449,
        description="Hydrating face mask designed to support the skin barrier.",
        purchase_url="https://www.amazon.in/",
        retailer="Amazon India",
        rating=4.3,
        review_count=740,
        is_bestseller=False,
        image_url="https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=800&q=80",
    ),
]
# ============================================================
# SEED FUNCTION
# ============================================================

def seed():
    db = SessionLocal()

    try:
        # ----------------------------------------------------
        # INGREDIENTS
        # ----------------------------------------------------

        for ingredient_data in INGREDIENTS:
            existing = (
                db.query(Ingredient)
                .filter(Ingredient.name == ingredient_data["name"])
                .first()
            )

            if existing:
                for key, value in ingredient_data.items():
                    setattr(existing, key, value)
            else:
                db.add(Ingredient(**ingredient_data))

        # ----------------------------------------------------
        # PRODUCTS
        # ----------------------------------------------------

        for product_data in PRODUCTS:
            existing = (
                db.query(Product)
                .filter(Product.name == product_data["name"])
                .first()
            )

            if existing:
                # Update existing product
                for key, value in product_data.items():
                    if hasattr(existing, key):
                        setattr(existing, key, value)

            else:
                # Add new product
                db.add(Product(**product_data))

        db.commit()

        print(
            f"Successfully seeded/updated "
            f"{len(INGREDIENTS)} ingredients and "
            f"{len(PRODUCTS)} products."
        )

    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed()