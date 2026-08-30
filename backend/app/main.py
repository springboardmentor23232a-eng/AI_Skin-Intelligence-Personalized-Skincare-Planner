from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.exceptions import register_exception_handlers
from app.routers import auth, profile, assessment, routine, consultant, ingredients, products
from app.logging_config import logger
from app.database import engine, Base, SessionLocal
from app.models import Ingredient, Product
import app.models

# Auto-create SQLAlchemy database tables on application start
Base.metadata.create_all(bind=engine)

# Initialize FastAPI App
app = FastAPI(
    title="AI Skin Intelligence & Personalized Skincare Planner API",
    description="Backend API services managing User Authentication, RBAC, and Skin Assessments.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS Origins allowed lists
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]
if not origins or "*" in origins:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True if "*" not in origins else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register global centralized exception handlers
register_exception_handlers(app)

# Include Router endpoints
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(assessment.router)
app.include_router(routine.router)
app.include_router(consultant.router)
app.include_router(ingredients.router)
app.include_router(products.router)

@app.on_event("startup")
def seed_ingredients():
    db = SessionLocal()
    try:
        if db.query(Ingredient).count() == 0:
            logger.info("Seeding initial ingredients data...")
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
                    precautions="Avoid using with retinoids or other strong acids in the same routine step. Can be drying, follow with a good moisturizer.",
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
            logger.info("Successfully seeded 8 initial ingredients into PostgreSQL database.")
    except Exception as e:
        logger.error(f"Failed to seed ingredients: {e}")
        db.rollback()
    finally:
        db.close()


@app.on_event("startup")
def seed_products():
    db = SessionLocal()
    try:
        if db.query(Product).count() == 0:
            logger.info("Seeding initial products data...")
            initial_products = [
                Product(
                    name="Hydrating Gentle Skin Cleanser",
                    brand="Cetaphil",
                    category="Face Wash",
                    description="A creamy, non-foaming cleanser that gently removes dirt and makeup while preserving the skin's moisture barrier.",
                    price=350,
                    ingredients=["Hyaluronic Acid", "Ceramides", "Water", "Glycerin"],
                    suitable_skin_types=["Dry", "Sensitive", "Normal", "Combination"],
                    suitable_concerns=["Dryness", "Dehydration", "Redness", "Irritation"],
                    benefits=["Gently cleanses", "Retains essential moisture", "Soothes irritated skin"],
                    usage_guidance="Apply to wet skin, massage gently, and rinse thoroughly. Safe for morning and evening routines.",
                    precautions="Avoid direct contact with eyes. If irritation occurs, discontinue use.",
                    irritation_level="Low"
                ),
                Product(
                    name="Salicylic Acid Active Clearing Cleanser",
                    brand="The Ordinary",
                    category="Face Wash",
                    description="An active exfoliating cleanser designed to clear clogged pores, minimize excess sebum, and target blemishes.",
                    price=499,
                    ingredients=["Salicylic Acid", "Water", "Coco-Betaine", "Glycerin"],
                    suitable_skin_types=["Oily", "Combination"],
                    suitable_concerns=["Acne", "Blackheads", "Whiteheads", "Excess oil", "Open pores"],
                    benefits=["Exfoliates pore linings", "Controls excessive oil", "Reduces active blemishes"],
                    usage_guidance="Lather a small amount between wet palms. Massage onto facial areas, focusing on congested zones, and rinse.",
                    precautions="Can be drying. Avoid using with retinoids or other strong active exfoliating acids in the same step.",
                    irritation_level="Medium"
                ),
                Product(
                    name="Effaclar Foaming Gel Cleanser",
                    brand="La Roche-Posay",
                    category="Face Wash",
                    description="A purifying foaming wash formulated specifically for oily and acne-prone skin types to reduce shine.",
                    price=850,
                    ingredients=["Niacinamide", "Water", "Zinc PCA", "Citric Acid"],
                    suitable_skin_types=["Oily", "Combination", "Normal"],
                    suitable_concerns=["Excess oil", "Open pores", "Blemish marks"],
                    benefits=["Deeply purifies pores", "Regulates shine", "Soothes active breakouts"],
                    usage_guidance="Apply to damp face morning and night. Work into a soft foam and rinse with lukewarm water.",
                    precautions="For external use only. Follow with a barrier-supportive moisturizer.",
                    irritation_level="Low"
                ),
                Product(
                    name="Daily Moisture Barrier Restoration Lotion",
                    brand="Cetaphil",
                    category="Moisturizer",
                    description="A lightweight lotion that delivers rapid, long-lasting hydration and locks in essential lipids.",
                    price=420,
                    ingredients=["Ceramides", "Glycerin", "Water", "Dimethicone"],
                    suitable_skin_types=["Normal", "Dry", "Sensitive"],
                    suitable_concerns=["Dryness", "Dehydration", "Barrier damage"],
                    benefits=["Restores skin barrier", "Locks in hydration", "Restores soft texture"],
                    usage_guidance="Apply liberally to face and neck as often as needed, especially after cleansing.",
                    precautions="None. Extremely safe and suitable for highly compromised barriers.",
                    irritation_level="Low"
                ),
                Product(
                    name="Hydro Boost Water Gel Moisturizer",
                    brand="Neutrogena",
                    category="Moisturizer",
                    description="A refreshing gel cream that instantly floods dry skin with hydration and locks it in.",
                    price=950,
                    ingredients=["Hyaluronic Acid", "Water", "Dimethicone", "Glycerin"],
                    suitable_skin_types=["Oily", "Combination", "Normal"],
                    suitable_concerns=["Dehydration", "Dryness", "Dullness"],
                    benefits=["Provides oil-free hydration", "Plumps skin texture", "Quick absorption"],
                    usage_guidance="Smooth evenly over face and neck daily after cleansing. Can be layered under makeup.",
                    precautions="None. Highly compatible, non-comedogenic oil-free formula.",
                    irritation_level="Low"
                ),
                Product(
                    name="Ceramide Barrier Relief Balm",
                    brand="Minimalist",
                    category="Moisturizer",
                    description="A rich, nourishing cream packed with skin-identical ceramides and peptides to calm skin redness and scaling.",
                    price=599,
                    ingredients=["Ceramides", "Peptides", "Water", "Squalane"],
                    suitable_skin_types=["Dry", "Sensitive", "Normal", "Combination"],
                    suitable_concerns=["Dryness", "Redness", "Irritation", "Barrier damage"],
                    benefits=["Soothes facial redness", "Accelerates barrier healing", "Deeply locks in moisture"],
                    usage_guidance="Massage a dime-sized amount onto dry face and neck. Ideal as the final step in your evening routine.",
                    precautions="Do not apply directly to open wounds.",
                    irritation_level="Low"
                ),
                Product(
                    name="Matte Mineral Sunscreen SPF 50",
                    brand="Minimalist",
                    category="Sunscreen",
                    description="A broad-spectrum physical sunscreen that leaves a clean, non-greasy matte finish while regulating oil production.",
                    price=399,
                    ingredients=["Water", "Zinc Oxide", "Titanium Dioxide", "Niacinamide"],
                    suitable_skin_types=["Oily", "Combination", "Normal"],
                    suitable_concerns=["Sun protection", "Excess oil", "Dark spots"],
                    benefits=["Protects against UV damage", "Oil control", "Zero white cast finish"],
                    usage_guidance="Apply generously to face and neck 15 minutes before sun exposure. Reapply every 2 hours.",
                    precautions="Always cleanse thoroughly at night to prevent mineral residue buildup.",
                    irritation_level="Low"
                ),
                Product(
                    name="Ceramide Comfort Sun Shield SPF 50",
                    brand="Re'equil",
                    category="Sunscreen",
                    description="A comforting sunscreen lotion that hydrates dry skin and reinforces the moisture barrier while blocking UV rays.",
                    price=699,
                    ingredients=["Water", "Zinc Oxide", "Hyaluronic Acid", "Ceramides"],
                    suitable_skin_types=["Dry", "Normal", "Sensitive", "Combination"],
                    suitable_concerns=["Sun protection", "Dryness", "Dehydration"],
                    benefits=["Prevents sunburn", "Deeply hydrates", "Calms sun-induced heat"],
                    usage_guidance="Apply as the final step of your morning skincare routine. Blend evenly across exposed areas.",
                    precautions="None. Safe for highly sensitive skin profiles.",
                    irritation_level="Low"
                ),
                Product(
                    name="Aura Bright 10% Niacinamide Serum",
                    brand="Minimalist",
                    category="Serum",
                    description="A concentrated skin-refining serum that targets excess oil production, enlarged pores, and hyperpigmentation.",
                    price=599,
                    ingredients=["Niacinamide", "Zinc PCA", "Water", "Hyaluronic Acid"],
                    suitable_skin_types=["Oily", "Combination", "Normal", "Sensitive", "Dry"],
                    suitable_concerns=["Excess oil", "Open pores", "Redness", "Dark spots", "Pigmentation", "Post-acne marks"],
                    benefits=["Controls oil production", "Fades dark spots", "Improves skin barrier"],
                    usage_guidance="Apply 2-3 drops morning and evening after cleansing and toning. Pat gently until absorbed.",
                    precautions="If facial flushing occurs when layered with active acids, alternate AM/PM usage.",
                    irritation_level="Low"
                ),
                Product(
                    name="Radiant Glow 10% Vitamin C Serum",
                    brand="Minimalist",
                    category="Serum",
                    description="A highly stable Vitamin C formulation that fights dullness, boosts collagen, and fades dark patches.",
                    price=699,
                    ingredients=["Vitamin C", "Water", "Centella Asiatica Extract", "Glycerin"],
                    suitable_skin_types=["Normal", "Dry", "Combination", "Oily"],
                    suitable_concerns=["Dark spots", "Pigmentation", "Uneven skin tone", "Dullness"],
                    benefits=["Brightens dull skin tone", "Fades dark circles", "Boosts antioxidant defenses"],
                    usage_guidance="Apply 2-3 drops in the morning on clean skin. Always follow with sunscreen.",
                    precautions="Slight tingling is normal. Do not layer concurrently with strong exfoliating acids or retinoids in the same step.",
                    irritation_level="Medium"
                ),
                Product(
                    name="Multi-Peptide Youth Recovery Serum",
                    brand="The Ordinary",
                    category="Serum",
                    description="A collagen-boosting peptide complex designed to firm skin, smooth fine lines, and target loss of elasticity.",
                    price=1200,
                    ingredients=["Peptides", "Hyaluronic Acid", "Water", "Glycerin"],
                    suitable_skin_types=["Dry", "Normal", "Combination", "Sensitive"],
                    suitable_concerns=["Aging", "Fine lines/wrinkles", "Elasticity loss"],
                    benefits=["Smooths wrinkles", "Firms skin structure", "Soothes dehydration lines"],
                    usage_guidance="Apply a few drops to the face in the morning and evening before creams.",
                    precautions="Do not mix with strong direct acids or high-strength Vitamin C in the same routine step.",
                    irritation_level="Low"
                ),
                Product(
                    name="BHA Pore Refining 2% Toner",
                    brand="Paula's Choice",
                    category="Toner",
                    description="A fluid leave-on exfoliant that unclogs open pores, minimizes blackheads, and refines texture.",
                    price=1100,
                    ingredients=["Salicylic Acid", "Water", "Green Tea Extract", "Glycerin"],
                    suitable_skin_types=["Oily", "Combination"],
                    suitable_concerns=["Acne", "Blackheads", "Whiteheads", "Excess oil", "Open pores"],
                    benefits=["Deeply clears blackheads", "Refines pore texture", "Smooths skin roughness"],
                    usage_guidance="Apply with a cotton pad or palms over clean face 2-3 times per week at night.",
                    precautions="Always use broad-spectrum SPF during the day. Avoid direct eye contact.",
                    irritation_level="Medium"
                ),
                Product(
                    name="Hydrating Milky Rice Toner",
                    brand="I'm From",
                    category="Toner",
                    description="A nourishing double-layered rice extract toner that delivers rich hydration and brightens dullness.",
                    price=950,
                    ingredients=["Water", "Rice Extract", "Niacinamide", "Glycerin"],
                    suitable_skin_types=["Dry", "Normal", "Sensitive", "Combination"],
                    suitable_concerns=["Dryness", "Dehydration", "Dullness", "Redness"],
                    benefits=["Delivers deep hydration", "Creates a natural glow", "Soothes skin scaling"],
                    usage_guidance="Shake well before use. Pat gently onto face and neck after cleansing morning and night.",
                    precautions="None. Gentle and highly supportive for dry or sensitive skin profiles.",
                    irritation_level="Low"
                ),
                Product(
                    name="0.3% Retinol Youth Renewal Cream",
                    brand="Minimalist",
                    category="Treatment Products",
                    description="A stable retinol treatment designed to target signs of aging, smooth fine lines, and fade post-acne blemishes.",
                    price=599,
                    ingredients=["Retinoids", "Water", "Squalane", "Ceramides"],
                    suitable_skin_types=["Normal", "Oily", "Combination", "Dry"],
                    suitable_concerns=["Aging", "Fine lines/wrinkles", "Acne", "Post-acne marks"],
                    benefits=["Boosts collagen production", "Refines skin texture", "Fades dark marks"],
                    usage_guidance="Apply a pea-sized amount in the evening on dry skin. Start with twice a week and scale up.",
                    precautions="Do not layer with exfoliating acids or Vitamin C in the same routine step. Use sunscreen daily.",
                    irritation_level="High"
                ),
                Product(
                    name="AHA 10% Lactic Acid Exfoliating Serum",
                    brand="The Ordinary",
                    category="Treatment Products",
                    description="A high-strength superficial peeling formulation containing lactic acid and hyaluronic acid to smooth texture.",
                    price=750,
                    ingredients=["AHA", "AHAs/BHAs", "Water", "Lactic Acid", "Glycerin"],
                    suitable_skin_types=["Normal", "Oily", "Dry", "Combination"],
                    suitable_concerns=["Uneven skin tone", "Post-acne marks", "Dullness", "Rough texture"],
                    benefits=["Exfoliates surface skin", "Brightens dark patches", "Hydrates while exfoliating"],
                    usage_guidance="Apply once daily in the evening. Can be diluted with other treatments to reduce strength.",
                    precautions="Do not use on sensitive, peeling, or compromised skin. Limit sun exposure during use.",
                    irritation_level="Medium"
                ),
                Product(
                    name="Jeju Volcanic Pore Clay Mask",
                    brand="Innisfree",
                    category="Face Masks",
                    description="A deep-cleansing clay mask that absorbs excess sebum and clears congested pores.",
                    price=850,
                    ingredients=["Water", "Kaolin Clay", "Salicylic Acid", "Glycerin"],
                    suitable_skin_types=["Oily", "Combination"],
                    suitable_concerns=["Excess oil", "Blackheads", "Whiteheads", "Open pores"],
                    benefits=["Absorbs excess oil", "Deep cleanses pores", "Smooths skin texture"],
                    usage_guidance="After cleansing, apply onto dry face, avoiding eye and lip areas. Rinse off with warm water after 10 minutes.",
                    precautions="Use no more than 1-2 times per week. Follow with a hydrated moisturizer.",
                    irritation_level="Medium"
                ),
                Product(
                    name="Hyaluronic Hydrating Sheet Mask",
                    brand="L'Oreal",
                    category="Face Masks",
                    description="A thin micro-fiber mask drenched in pure hyaluronic acid to instantly revive dehydrated skin.",
                    price=150,
                    ingredients=["Water", "Hyaluronic Acid", "Glycerin", "Panthenol"],
                    suitable_skin_types=["Dry", "Normal", "Sensitive", "Combination", "Oily"],
                    suitable_concerns=["Dryness", "Dehydration", "Fine lines"],
                    benefits=["Restores instant plumpness", "Locks in dewiness", "Cools skin temperature"],
                    usage_guidance="Unfold mask and apply to clean face. Leave on for 15 minutes, remove, and pat remaining serum.",
                    precautions="None. Safe, soothing, and highly hydrating.",
                    irritation_level="Low"
                )
            ]
            db.add_all(initial_products)
            db.commit()
            logger.info("Successfully seeded 17 initial products in PostgreSQL database.")
    except Exception as e:
        logger.error(f"Failed to seed products: {e}")
        db.rollback()
    finally:
        db.close()

@app.get("/", tags=["Health Check"])
async def health_check():
    """Simple API status health check ping endpoint."""
    logger.info("Health check ping received")
    return {
        "success": True,
        "message": "AI Skin Intelligence API is running successfully.",
        "version": "1.0.0"
    }
