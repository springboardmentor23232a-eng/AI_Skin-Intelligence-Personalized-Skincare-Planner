import sys
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# Include current directory in path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base, SessionLocal
from app.routers import (
    assessment_router, routine_router, gemini_router,
    ingredient_router, product_router, progress_router, analytics_router
)
from app.models.ingredient import Ingredient, IngredientConflict
from app.models.product import Product

def seed_database():
    """Seed initial demo ingredients, conflict rules, and products if database is empty."""
    db = SessionLocal()
    try:
        # 1. Seed Ingredients
        if db.query(Ingredient).count() == 0:
            initial_ingredients = [
                Ingredient(name="Salicylic Acid (BHA)", category="EXFOLIANT", comedogenic_rating=0, target_skin_types="Oily, Combination, Acne Prone", target_concerns="Acne, Blackheads, Enlarged Pores", description="Oil-soluble beta hydroxy acid that penetrates deeply into pores.", benefits="Unclogs pores, reduces sebum, smooths texture."),
                Ingredient(name="Retinol (Vitamin A)", category="ACTIVE", comedogenic_rating=0, target_skin_types="Normal, Combination, Oily, Dry", target_concerns="Aging, Hyperpigmentation, Fine Lines", description="Gold-standard anti-aging active that boosts cell turnover.", benefits="Reduces wrinkles, improves firmness, clears stubborn spots."),
                Ingredient(name="Niacinamide (Vitamin B3)", category="ANTIOXIDANT", comedogenic_rating=0, target_skin_types="All Skin Types", target_concerns="Redness, Pores, Oiliness, Barrier Repair", description="Versatile vitamin that strengthens moisture barrier and balances sebum.", benefits="Minimizes pores, calms redness, fades dark spots."),
                Ingredient(name="Vitamin C (L-Ascorbic Acid)", category="ANTIOXIDANT", comedogenic_rating=0, target_skin_types="Dry, Combination, Normal", target_concerns="Dullness, Dark Spots, Hyperpigmentation", description="Potent antioxidant that neutralizes free radicals and brightens tone.", benefits="Boosts radiance, even skin tone, collagen synthesis."),
                Ingredient(name="Hyaluronic Acid", category="MOISTURIZER", comedogenic_rating=0, target_skin_types="Dry, Dehydrated, All Skin Types", target_concerns="Dehydration, Flakiness, Fine Lines", description="Humectant that draws up to 1000x its weight in water into skin.", benefits="Deep hydration, plumping, restores skin bounce."),
                Ingredient(name="Glycolic Acid (AHA)", category="EXFOLIANT", comedogenic_rating=0, target_skin_types="Normal, Combination, Dry", target_concerns="Dullness, Rough Texture, Hyperpigmentation", description="Alpha hydroxy acid that gently dissolves dead surface skin cells.", benefits="Reveals fresh glowing skin, improves clarity."),
                Ingredient(name="Centella Asiatica (Cica)", category="ANTIOXIDANT", comedogenic_rating=0, target_skin_types="Sensitive, Irritated, Acne Prone", target_concerns="Redness, Inflammation, Damaged Barrier", description="Soothing botanical extract rich in madecassoside.", benefits="Calms irritation, speeds wound healing, repairs barrier."),
                Ingredient(name="Coconut Oil", category="MOISTURIZER", comedogenic_rating=4, target_skin_types="Dry Body Skin Only", target_concerns="Dryness", description="Heavy plant oil high in lauric acid.", benefits="Rich occlusive for body, but HIGH COMEDOGENIC RISK for face."),
                Ingredient(name="Zinc Oxide", category="SUNSCREEN", comedogenic_rating=0, target_skin_types="Sensitive, All Skin Types", target_concerns="UV Damage, Sunburn, Redness", description="Mineral sunscreen agent offering broad-spectrum UVA/UVB defense.", benefits="Physical UV shield, anti-inflammatory, reef-safe."),
                Ingredient(name="Squalane", category="MOISTURIZER", comedogenic_rating=0, target_skin_types="Dry, Sensitive, Combination", target_concerns="Dryness, Compromised Barrier", description="Lightweight non-greasy hydrogenated oil bio-identical to skin lipids.", benefits="Locks in moisture without clogging pores.")
            ]
            db.add_all(initial_ingredients)

        # 2. Seed Ingredient Conflicts
        if db.query(IngredientConflict).count() == 0:
            initial_conflicts = [
                IngredientConflict(ingredient_a="Retinol (Vitamin A)", ingredient_b="Salicylic Acid (BHA)", severity="HIGH", warning_message="Combining Retinol and Salicylic Acid simultaneously causes severe skin barrier irritation, dryness, and peeling.", recommendation="Use Salicylic Acid in the morning and Retinol at night, or alternate on different days."),
                IngredientConflict(ingredient_a="Vitamin C (L-Ascorbic Acid)", ingredient_b="Retinol (Vitamin A)", severity="HIGH", warning_message="L-Ascorbic Acid (low pH) and Retinol deactivate each other's effectiveness and increase photosensitivity.", recommendation="Apply Vitamin C in the Morning under sunscreen, and Retinol exclusively at Night."),
                IngredientConflict(ingredient_a="Glycolic Acid (AHA)", ingredient_b="Retinol (Vitamin A)", severity="HIGH", warning_message="Dual strong actives risk severe over-exfoliation and compromise the skin's lipid barrier.", recommendation="Alternate application nights: AHA on Night 1, Retinol on Night 2."),
                IngredientConflict(ingredient_a="Salicylic Acid (BHA)", ingredient_b="Glycolic Acid (AHA)", severity="MEDIUM", warning_message="Double chemical exfoliation can strip natural oils and trigger sensitive redness.", recommendation="Use AHA for surface glow and BHA for pore care on separate days."),
                IngredientConflict(ingredient_a="Niacinamide (Vitamin B3)", ingredient_b="Vitamin C (L-Ascorbic Acid)", severity="LOW", warning_message="High concentration L-Ascorbic Acid combined with Niacinamide can cause temporary facial flushing.", recommendation="Wait 10-15 minutes between applications or use in separate routines.")
            ]
            db.add_all(initial_conflicts)

        # 3. Seed Products
        if db.query(Product).count() == 0:
            initial_products = [
                Product(brand="La Roche-Posay", name="Effaclar Purifying Foaming Gel", category="Cleanser", active_ingredients="Zinc PCA, Thermal Spring Water", target_skin_types="Oily, Combination, Sensitive", target_concerns="Acne, Sebum Control, Pores", price=1499.0, rating=4.6, reviews_count=890, image_url="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300", buy_url="https://www.laroche-posay.us"),
                Product(brand="Minimalist", name="Niacinamide 10% Serum with Zinc", category="Serum", active_ingredients="Niacinamide (Vitamin B3), Zinc PCA, Matmarine", target_skin_types="Oily, Combination, Normal", target_concerns="Acne Marks, Enlarged Pores, Redness", price=599.0, rating=4.7, reviews_count=1240, image_url="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300", buy_url="https://beminimalist.co"),
                Product(brand="CeraVe", name="Moisturizing Cream with Ceramides", category="Moisturizer", active_ingredients="Essential Ceramides (1, 3, 6-II), Hyaluronic Acid", target_skin_types="Dry, Normal, Sensitive", target_concerns="Dehydration, Compromised Barrier, Flakiness", price=1299.0, rating=4.8, reviews_count=2100, image_url="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300", buy_url="https://www.cerave.com"),
                Product(brand="Dot & Key", name="Watermelon Sunscreen SPF 50 PA++++", category="Sunscreen", active_ingredients="Zinc Oxide, Watermelon Extract, Hyaluronic Acid", target_skin_types="All Skin Types, Combination", target_concerns="UV Protection, Sunburn, Dullness", price=399.0, rating=4.7, reviews_count=980, image_url="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300", buy_url="https://www.dotandkey.com"),
                Product(brand="Paula's Choice", name="2% BHA Liquid Exfoliant", category="Exfoliant", active_ingredients="Salicylic Acid (BHA) 2%, Green Tea Extract", target_skin_types="Oily, Combination", target_concerns="Blackheads, Acne, Rough Texture", price=2700.0, rating=4.9, reviews_count=3400, image_url="https://images.unsplash.com/photo-1608248597461-7110196238b6?w=300", buy_url="https://www.paulaschoice.com"),
                Product(brand="The Ordinary", name="Hyaluronic Acid 2% + B5", category="Serum", active_ingredients="Hyaluronic Acid, Vitamin B5 (Panthenol)", target_skin_types="Dry, Dehydrated, All Skin Types", target_concerns="Dehydration, Fine Lines, Dullness", price=700.0, rating=4.6, reviews_count=4500, image_url="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300", buy_url="https://theordinary.com"),
                Product(brand="COSRX", name="Advanced Snail 96 Mucin Power Essence", category="Serum", active_ingredients="Snail Secretion Filtrate 96%, Sodium Hyaluronate", target_skin_types="Sensitive, Dry, Combination", target_concerns="Redness, Dehydration, Damaged Barrier", price=1450.0, rating=4.8, reviews_count=2800, image_url="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300", buy_url="https://www.cosrx.com"),
                Product(brand="Innisfree", name="Super Volcanic Pore Clay Mask 2X", category="Mask", active_ingredients="Volcanic Cluster Spheres, AHA (Lactic Acid)", target_skin_types="Oily, Combination", target_concerns="Enlarged Pores, Excess Sebum, Deep Cleansing", price=1100.0, rating=4.5, reviews_count=1150, image_url="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300", buy_url="https://www.innisfree.com")
            ]
            db.add_all(initial_products)

        db.commit()
        print("[FastAPI Skin Engine] Initial seed data verified successfully.")
    except Exception as e:
        db.rollback()
        print(f"[FastAPI Seed Warning] Failed to seed database: {e}")
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables if they do not exist & seed default data
    try:
        Base.metadata.create_all(bind=engine)
        print("[FastAPI Skin Engine] Database tables created/verified successfully.")
        seed_database()
    except Exception as e:
        print(f"[FastAPI Skin Engine Warning] Could not auto-create/seed database tables: {e}")
    yield
    # Shutdown logic
    print("[FastAPI Skin Engine] Shutting down clean.")

app = FastAPI(
    title="AI Skin Intelligence & Skincare Planner Engine API",
    description="Rule-Based Skin Health Assessment, Personalized Routine Generation, Ingredient Intelligence Engine, Product Recommendation Workflows, Progress Tracking System & Skincare Analytics.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"}
    )

# Register Routers
app.include_router(assessment_router)
app.include_router(routine_router.router)
app.include_router(gemini_router.router)
app.include_router(ingredient_router.router)
app.include_router(product_router.router)
app.include_router(progress_router.router)
app.include_router(analytics_router.router)

# Health Check & Root Info
@app.get("/", tags=["Health & Info"])
@app.get("/health", tags=["Health & Info"])
def health_check():
    return {
        "status": "HEALTHY",
        "service": "AI Skincare Intelligence Engine API",
        "version": "2.0.0",
        "swagger_docs": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
