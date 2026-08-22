import sys
import os

# Add backend directory to sys.path
sys.path.append(r"c:\Users\LAXMI PRANEETHA\OneDrive\Desktop\AI-Skin\backend")

from app.database import SessionLocal
from app.models import Ingredient

def seed():
    db = SessionLocal()
    try:
        count = db.query(Ingredient).count()
        print(f"Current seeded count: {count}")
        if count == 0:
            print("Database is empty. Seeding initial ingredients...")
            initial_ingredients = [
                Ingredient(
                    name="Retinoids",
                    category="Retinoids",
                    short_description="Vitamin A derivatives that promote cell turnover and boost collagen production.",
                    benefits=["Promotes cell turnover", "Reduces fine lines and wrinkles", "Improves skin elasticity"],
                    suitable_skin_types=["Oily", "Dry", "Combination", "Normal"],
                    common_concerns=["Aging", "Fine lines/wrinkles", "Acne", "Uneven skin tone", "Post-acne marks"],
                    usage_guidance="Apply a pea-sized amount in the evening on completely dry skin. Start by using 1-2 times a week, gradually increasing frequency as skin adapts.",
                    precautions="Avoid mixing with exfoliating acids (AHAs/BHAs) or Vitamin C in the same routine step. Always apply broad-spectrum sunscreen the following morning.",
                    typical_frequency="2-3 times per week or nightly as tolerated",
                    irritation_level="High"
                ),
                Ingredient(
                    name="Niacinamide",
                    category="Niacinamide",
                    short_description="A versatile form of Vitamin B3 that strengthens the skin barrier and refines pores.",
                    benefits=["Regulates sebum production", "Strengthens skin barrier", "Minimizes open pores", "Reduces redness"],
                    suitable_skin_types=["Oily", "Dry", "Combination", "Normal", "Sensitive"],
                    common_concerns=["Excess oil", "Open pores", "Redness", "Dehydration", "Post-acne marks"],
                    usage_guidance="Can be safely applied morning and evening. Highly compatible with most other actives, especially Hyaluronic Acid.",
                    precautions="Extremely low risk. If applying with highly acidic L-Ascorbic Acid formulas, consider separating them by time of day to avoid temporary flushing.",
                    typical_frequency="Daily (AM and PM)",
                    irritation_level="Low"
                ),
                Ingredient(
                    name="Vitamin C",
                    category="Vitamin C",
                    short_description="A powerful antioxidant that brightens dark spots and protects against environmental free radicals.",
                    benefits=["Brightens complexion", "Fades dark spots and pigmentation", "Neutralizes free radicals"],
                    suitable_skin_types=["Oily", "Dry", "Combination", "Normal"],
                    common_concerns=["Dark spots", "Pigmentation", "Uneven skin tone", "Dullness"],
                    usage_guidance="Recommended for morning use under sunscreen. Apply after cleansing and toning, before moisturizing.",
                    precautions="May cause temporary tingling. Avoid applying at the same time as retinoids or strong exfoliating acids. Always overlay broad-spectrum SPF.",
                    typical_frequency="Every morning",
                    irritation_level="Medium"
                ),
                Ingredient(
                    name="Hyaluronic Acid",
                    category="Hyaluronic Acid",
                    short_description="A humectant that attracts and binds moisture to the skin for instant plumping.",
                    benefits=["Intensely hydrates", "Plumps fine lines", "Soothes skin barrier"],
                    suitable_skin_types=["Oily", "Dry", "Combination", "Normal", "Sensitive"],
                    common_concerns=["Dehydration", "Dryness", "Fine lines/wrinkles"],
                    usage_guidance="Apply to damp skin morning and evening. Layer immediately with a moisturizer to lock in hydration.",
                    precautions="Extremely safe. If applied in very dry climates, must be sealed with an occlusive moisturizer to prevent transepidermal water loss.",
                    typical_frequency="Daily (AM and PM)",
                    irritation_level="Low"
                ),
                Ingredient(
                    name="Salicylic Acid",
                    category="Salicylic Acid",
                    short_description="An oil-soluble beta hydroxy acid (BHA) that penetrates deep into pores to clear blockages.",
                    benefits=["Clears blackheads and whiteheads", "Exfoliates pore linings", "Controls excessive oil"],
                    suitable_skin_types=["Oily", "Combination", "Normal"],
                    common_concerns=["Acne", "Blackheads", "Whiteheads", "Excess oil", "Open pores"],
                    usage_guidance="Apply after cleansing. Use as a spot treatment or all-over exfoliant. Start with 2-3 times per week.",
                    precautions="Avoid using with retinoids or other strong active acids in the same routine step. Can be drying, follow with a good moisturizer.",
                    typical_frequency="2-3 times per week",
                    irritation_level="Medium"
                ),
                Ingredient(
                    name="Ceramides",
                    category="Ceramides",
                    short_description="Essential lipids that restore the skin's natural protective barrier and lock in moisture.",
                    benefits=["Repairs skin barrier", "Locks in moisture", "Prevents environmental damage", "Alleviates irritation"],
                    suitable_skin_types=["Oily", "Dry", "Combination", "Normal", "Sensitive"],
                    common_concerns=["Dryness", "Dehydration", "Redness", "Irritation", "Flakiness"],
                    usage_guidance="Ideal for both morning and evening routines. Highly recommended to layer after using strong active treatments.",
                    precautions="Virtually no precautions. Suitable for all skin types and conditions, including compromised barriers.",
                    typical_frequency="Daily (AM and PM)",
                    irritation_level="Low"
                ),
                Ingredient(
                    name="Peptides",
                    category="Peptides",
                    short_description="Amino acid chains that signal collagen production to firm and smooth the skin.",
                    benefits=["Firms skin elasticity", "Reduces wrinkles", "Supports barrier recovery"],
                    suitable_skin_types=["Oily", "Dry", "Combination", "Normal", "Sensitive"],
                    common_concerns=["Aging", "Fine lines/wrinkles", "Elasticity loss"],
                    usage_guidance="Apply morning and evening. Highly compatible with other actives like Niacinamide and Hyaluronic Acid.",
                    precautions="Extremely safe. Avoid combining with strong copper peptides and highly acidic exfoliants in the same step.",
                    typical_frequency="Daily (AM and PM)",
                    irritation_level="Low"
                ),
                Ingredient(
                    name="AHAs/BHAs",
                    category="AHAs/BHAs",
                    short_description="Alpha and beta hydroxy acids that chemically exfoliate the skin surface and pores.",
                    benefits=["Exfoliates dead skin cells", "Brightens uneven skin tone", "Smooths skin texture"],
                    suitable_skin_types=["Oily", "Dry", "Combination", "Normal"],
                    common_concerns=["Uneven skin tone", "Post-acne marks", "Dullness", "Blackheads", "Flakiness"],
                    usage_guidance="Apply in the evening after cleansing. Start with 1-2 times a week. Follow with hydrating moisturizers.",
                    precautions="Avoid using with retinoids or other strong active acids. Increases sun sensitivity; daily sunscreen use is mandatory.",
                    typical_frequency="2-3 times per week in evening",
                    irritation_level="Medium to High"
                )
            ]
            db.add_all(initial_ingredients)
            db.commit()
            print("Successfully seeded 8 ingredients.")
        else:
            print("Database already contains data.")
    except Exception as e:
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
