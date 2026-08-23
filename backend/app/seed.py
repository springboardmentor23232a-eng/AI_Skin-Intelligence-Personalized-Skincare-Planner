"""
Seeds the database with demo data: one user of each role, sample
ingredients, and sample products. Run after the API/DB containers are up:

    python -m app.seed
"""
from app.database import SessionLocal, Base, engine
from app import models
from app.auth import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()

DEMO_PASSWORD = "Password@123"


def get_or_create_user(email, full_name, role):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        user = models.User(
            full_name=full_name, email=email, role=role,
            hashed_password=hash_password(DEMO_PASSWORD),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user


def seed_users():
    u = get_or_create_user("user@aiskin.com", "Demo User", "user")
    c = get_or_create_user("consultant@aiskin.com", "Demo Consultant", "consultant")
    d = get_or_create_user("dermatologist@aiskin.com", "Demo Dermatologist", "dermatologist")
    a = get_or_create_user("admin@aiskin.com", "Demo Admin", "admin")

    if not db.query(models.SkinProfile).filter(models.SkinProfile.user_id == u.id).first():
        db.add(models.SkinProfile(
            user_id=u.id, skin_type="combination", age_group="18-25",
            lifestyle_habits="exercise, balanced diet", sleep_quality=6,
            water_intake_liters=1.8, environmental_exposure="moderate pollution",
            hydration_level=6,
        ))

    for prof_id, client_id in [(c.id, u.id), (d.id, u.id)]:
        if not db.query(models.ClientLink).filter(
            models.ClientLink.professional_id == prof_id, models.ClientLink.client_id == client_id
        ).first():
            db.add(models.ClientLink(professional_id=prof_id, client_id=client_id))

    db.commit()
    print("Seeded demo users: user@aiskin.com / consultant@aiskin.com / "
          "dermatologist@aiskin.com / admin@aiskin.com  (password: Password@123)")


def seed_ingredients():
    if db.query(models.Ingredient).count() > 0:
        return
    ingredients = [
        dict(name="Retinol", category="retinoid",
             description="Vitamin A derivative that boosts cell turnover and reduces fine lines.",
             good_for="wrinkles,fine lines,acne", avoid_if="pregnancy,sensitive skin",
             interacts_badly_with="Vitamin C,AHA/BHA"),
        dict(name="Niacinamide", category="niacinamide",
             description="Reduces oil production, redness, and improves barrier function.",
             good_for="oily skin,redness,acne", avoid_if="", interacts_badly_with=""),
        dict(name="Vitamin C", category="vitamin_c",
             description="Antioxidant that brightens skin and fades dark spots.",
             good_for="hyperpigmentation,dullness,dark spots", avoid_if="",
             interacts_badly_with="Retinol"),
        dict(name="Hyaluronic Acid", category="hyaluronic_acid",
             description="Humectant that draws moisture into the skin.",
             good_for="dry skin,dehydration", avoid_if="", interacts_badly_with=""),
        dict(name="Salicylic Acid", category="aha_bha",
             description="BHA that exfoliates inside pores, great for acne and oily skin.",
             good_for="acne,oily skin,blackheads", avoid_if="dry skin,sensitive skin",
             interacts_badly_with="Retinol"),
        dict(name="Ceramides", category="ceramides",
             description="Lipids that restore and strengthen the skin barrier.",
             good_for="dry skin,sensitive skin,barrier repair", avoid_if="", interacts_badly_with=""),
        dict(name="Peptides", category="peptides",
             description="Amino acid chains that support collagen production.",
             good_for="wrinkles,fine lines,firmness", avoid_if="", interacts_badly_with=""),
        dict(name="Glycolic Acid", category="aha_bha",
             description="AHA that exfoliates the skin surface for smoother, brighter skin.",
             good_for="dullness,uneven skin tone,fine lines", avoid_if="sensitive skin",
             interacts_badly_with="Retinol"),
    ]
    for i in ingredients:
        db.add(models.Ingredient(**i))
    db.commit()
    print(f"Seeded {len(ingredients)} ingredients.")


def seed_products():
    if db.query(models.Product).count() > 0:
        return
    products = [
        dict(name="Gentle Foaming Cleanser", brand="AI Skin Basics", category="face_wash", price=399.0,
             suitable_skin_types="oily,combination,normal", targets_concerns="acne,oily skin",
             key_ingredients="Salicylic Acid"),
        dict(name="Hydrating Cream Cleanser", brand="AI Skin Basics", category="face_wash", price=349.0,
             suitable_skin_types="dry,sensitive,normal", targets_concerns="dry skin,sensitive skin",
             key_ingredients="Ceramides"),
        dict(name="Oil-Free Gel Moisturizer", brand="AI Skin Derma", category="moisturizer", price=499.0,
             suitable_skin_types="oily,combination", targets_concerns="oily skin",
             key_ingredients="Niacinamide,Hyaluronic Acid"),
        dict(name="Ceramide Repair Cream", brand="AI Skin Derma", category="moisturizer", price=649.0,
             suitable_skin_types="dry,sensitive", targets_concerns="dry skin,barrier repair",
             key_ingredients="Ceramides,Peptides"),
        dict(name="Broad Spectrum SPF 50 Sunscreen", brand="AI Skin Sunshield", category="sunscreen", price=549.0,
             suitable_skin_types="oily,dry,combination,normal,sensitive", targets_concerns="uv exposure,pigmentation",
             key_ingredients=""),
        dict(name="10% Niacinamide Serum", brand="AI Skin Derma", category="serum", price=599.0,
             suitable_skin_types="oily,combination", targets_concerns="oily skin,redness,acne",
             key_ingredients="Niacinamide"),
        dict(name="Vitamin C Brightening Serum", brand="AI Skin Glow", category="serum", price=699.0,
             suitable_skin_types="normal,combination,dry", targets_concerns="hyperpigmentation,dullness,dark spots",
             key_ingredients="Vitamin C"),
        dict(name="Hyaluronic Acid Hydra Serum", brand="AI Skin Glow", category="serum", price=549.0,
             suitable_skin_types="dry,dehydrated,normal", targets_concerns="dry skin,dehydration",
             key_ingredients="Hyaluronic Acid"),
        dict(name="Balancing Toner", brand="AI Skin Basics", category="toner", price=299.0,
             suitable_skin_types="oily,combination,normal", targets_concerns="oily skin",
             key_ingredients=""),
        dict(name="Retinol Night Treatment", brand="AI Skin Derma", category="treatment", price=799.0,
             suitable_skin_types="normal,combination,oily", targets_concerns="wrinkles,fine lines,acne",
             key_ingredients="Retinol"),
        dict(name="Clay Purifying Mask", brand="AI Skin Glow", category="mask", price=449.0,
             suitable_skin_types="oily,combination", targets_concerns="oily skin,acne",
             key_ingredients="Salicylic Acid"),
        dict(name="Soothing Centella Gel Mask", brand="AI Skin Derma", category="mask", price=399.0,
             suitable_skin_types="sensitive,normal", targets_concerns="redness,sensitive skin",
             key_ingredients=""),
    ]
    for p in products:
        db.add(models.Product(**p))
    db.commit()
    print(f"Seeded {len(products)} products.")


if __name__ == "__main__":
    seed_users()
    seed_ingredients()
    seed_products()
    db.close()
    print("Database seeding complete.")
