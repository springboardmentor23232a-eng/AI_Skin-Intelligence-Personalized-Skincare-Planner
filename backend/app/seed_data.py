"""
Run once to populate demo ingredients & products:
    python -m app.seed_data
"""
from app.database import SessionLocal, Base, engine
from app.models.ingredient import Ingredient
from app.models.product import Product

Base.metadata.create_all(bind=engine)

INGREDIENTS = [
    dict(name="Retinoid", category="retinoid", good_for=["wrinkles", "fine_lines", "acne"],
         avoid_if=["pregnant", "sensitive_skin"], interacts_badly_with=["AHAs/BHAs", "Vitamin C"],
         description="Vitamin A derivative that boosts cell turnover and collagen production."),
    dict(name="Niacinamide", category="niacinamide", good_for=["oily_skin", "dark_spots", "redness"],
         avoid_if=[], interacts_badly_with=[],
         description="Reduces oil production, redness, and improves skin barrier."),
    dict(name="Vitamin C", category="vitamin_c", good_for=["hyperpigmentation", "dark_spots"],
         avoid_if=[], interacts_badly_with=["Retinoid"],
         description="Antioxidant that brightens skin and fades dark spots."),
    dict(name="Hyaluronic Acid", category="hyaluronic_acid", good_for=["dry_skin"],
         avoid_if=[], interacts_badly_with=[],
         description="Humectant that draws and holds moisture in the skin."),
    dict(name="Salicylic Acid", category="salicylic_acid", good_for=["acne", "oily_skin"],
         avoid_if=["dry_skin", "sensitive_skin"], interacts_badly_with=["Retinoid"],
         description="BHA that exfoliates inside pores and reduces breakouts."),
    dict(name="Ceramides", category="ceramides", good_for=["dry_skin", "sensitive_skin", "redness"],
         avoid_if=[], interacts_badly_with=[],
         description="Lipids that restore and strengthen the skin barrier."),
    dict(name="Peptides", category="peptides", good_for=["wrinkles", "fine_lines"],
         avoid_if=[], interacts_badly_with=[],
         description="Amino acid chains that support collagen and firmness."),
    dict(name="AHAs/BHAs", category="ahas_bhas", good_for=["uneven_skin_tone", "dark_spots"],
         avoid_if=["sensitive_skin"], interacts_badly_with=["Retinoid"],
         description="Chemical exfoliants that resurface skin and even tone."),
]

PRODUCTS = [
    dict(name="Gentle Foaming Cleanser", brand="DermaBasics", category="face_wash",
         key_ingredients=["Ceramides"], suitable_skin_types=["all"], targets_concerns=["sensitive_skin"],
         price=12.99, description="Sulfate-free daily cleanser."),
    dict(name="Niacinamide 10% Serum", brand="ClearLab", category="serum",
         key_ingredients=["Niacinamide"], suitable_skin_types=["oily", "combination"],
         targets_concerns=["oily_skin", "dark_spots", "redness"], price=18.50,
         description="Oil control and brightening serum."),
    dict(name="Vitamin C Brightening Serum", brand="GlowCo", category="serum",
         key_ingredients=["Vitamin C"], suitable_skin_types=["all"],
         targets_concerns=["hyperpigmentation", "dark_spots"], price=24.00,
         description="Antioxidant serum for even tone and radiance."),
    dict(name="Hydra Boost Moisturizer", brand="AquaDerm", category="moisturizer",
         key_ingredients=["Hyaluronic Acid", "Ceramides"], suitable_skin_types=["dry", "normal"],
         targets_concerns=["dry_skin"], price=21.00, description="Deep hydration daily moisturizer."),
    dict(name="Salicylic Acid Spot Treatment", brand="ClearLab", category="treatment",
         key_ingredients=["Salicylic Acid"], suitable_skin_types=["oily", "combination"],
         targets_concerns=["acne"], price=14.75, description="Targeted acne spot treatment."),
    dict(name="Retinol Night Cream", brand="RenewSkin", category="treatment",
         key_ingredients=["Retinoid", "Peptides"], suitable_skin_types=["normal", "combination"],
         targets_concerns=["wrinkles", "fine_lines"], price=32.00, description="Anti-aging night treatment."),
    dict(name="Mineral Sunscreen SPF 50", brand="SunShield", category="sunscreen",
         key_ingredients=[], suitable_skin_types=["all"], targets_concerns=[],
         price=19.99, description="Broad spectrum, non-comedogenic daily SPF."),
    dict(name="AHA/BHA Exfoliating Toner", brand="GlowCo", category="toner",
         key_ingredients=["AHAs/BHAs"], suitable_skin_types=["normal", "oily"],
         targets_concerns=["uneven_skin_tone", "dark_spots"], price=17.25,
         description="Weekly resurfacing toner for brighter, smoother skin."),
]


def seed():
    db = SessionLocal()
    try:
        if db.query(Ingredient).count() == 0:
            for i in INGREDIENTS:
                db.add(Ingredient(**i))
        if db.query(Product).count() == 0:
            for p in PRODUCTS:
                db.add(Product(**p))
        db.commit()
        print(f"Seeded {len(INGREDIENTS)} ingredients and {len(PRODUCTS)} products.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
