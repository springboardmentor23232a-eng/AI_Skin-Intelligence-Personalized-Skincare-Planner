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
    ingredient_router, product_router, progress_router, analytics_router, scoring_router
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
                Product(brand="Himalaya", name="Purifying Neem Facewash", category="Face Wash", active_ingredients="Neem, Turmeric", target_skin_types="Oily, Combination, Acne Prone", target_concerns="Acne, Excess Oil, Bacteria", price=180.0, rating=4.5, reviews_count=3200, image_url="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300", buy_url="https://www.nykaa.com", nykaa_url="https://www.nykaa.com/himalaya-herbals-purifying-neem-face-wash/p/3807", amazon_url="https://www.amazon.in/dp/B006LXCW6U"),
                Product(brand="Minimalist", name="Salicylic Acid 2% LHA Cleanser / Facewash", category="Face Wash", active_ingredients="Salicylic Acid (BHA), LHA, Zinc PCA", target_skin_types="Oily, Combination, Acne Prone", target_concerns="Acne, Blackheads, Sebum Control", price=299.0, rating=4.7, reviews_count=1890, image_url="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300", buy_url="https://beminimalist.co", nykaa_url="https://www.nykaa.com/minimalist-2percent-salicylic-acid-face-wash/p/2779148", amazon_url="https://www.amazon.in/dp/B095K46DQC"),
                Product(brand="La Roche-Posay", name="Effaclar Purifying Foaming Gel Facewash", category="Face Wash", active_ingredients="Zinc PCA, Thermal Spring Water", target_skin_types="Oily, Combination, Sensitive", target_concerns="Acne, Sebum Control, Pores", price=1499.0, rating=4.6, reviews_count=890, image_url="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300", buy_url="https://www.laroche-posay.us", nykaa_url="https://www.nykaa.com/search/result/?q=La%20Roche%20Posay%20Effaclar", amazon_url="https://www.amazon.in/dp/B002P3L97E"),
                Product(brand="Dot & Key", name="Cica Clarifying Green Clay Facemask", category="Face Masks", active_ingredients="Centella Asiatica (Cica), French Green Clay, Niacinamide", target_skin_types="Oily, Combination, Sensitive", target_concerns="Acne, Redness, Excess Sebum", price=450.0, rating=4.6, reviews_count=920, image_url="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300", buy_url="https://www.dotandkey.com", nykaa_url="https://www.nykaa.com/dot-key-cica-night-reset-face-mask/p/1098485", amazon_url="https://www.amazon.in/dp/B08XPWX3LK"),
                Product(brand="Plum", name="Green Tea Clear Face Mask", category="Face Masks", active_ingredients="Green Tea Extract, Kaolin Clay, Glycolic Acid", target_skin_types="Oily, Combination", target_concerns="Acne, Blemishes, Deep Pore Detox", price=490.0, rating=4.5, reviews_count=1450, image_url="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300", buy_url="https://plumgoodness.com", nykaa_url="https://www.nykaa.com/plum-green-tea-clear-face-mask/p/23984", amazon_url="https://www.amazon.in/dp/B01E3C8B7M"),
                Product(brand="Innisfree", name="Super Volcanic Pore Clay Facemask 2X", category="Face Masks", active_ingredients="Volcanic Cluster Spheres, AHA (Lactic Acid)", target_skin_types="Oily, Combination", target_concerns="Enlarged Pores, Excess Sebum, Deep Cleansing", price=1100.0, rating=4.8, reviews_count=2150, image_url="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300", buy_url="https://www.innisfree.com", nykaa_url="https://www.nykaa.com/innisfree-super-volcanic-pore-clay-mask-2x/p/375253", amazon_url="https://www.amazon.in/dp/B07DN8H4F6"),
                Product(brand="Minimalist", name="Niacinamide 10% Serum with Zinc", category="Serum", active_ingredients="Niacinamide (Vitamin B3), Zinc PCA, Matmarine", target_skin_types="Oily, Combination, Normal", target_concerns="Acne Marks, Enlarged Pores, Redness", price=599.0, rating=4.7, reviews_count=1240, image_url="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300", buy_url="https://beminimalist.co", nykaa_url="https://www.nykaa.com/minimalist-10percent-niacinamide-face-serum/p/1026026", amazon_url="https://www.amazon.in/dp/B08F9MKW33"),
                Product(brand="The Derma Co", name="10% Vitamin C Face Serum", category="Serum", active_ingredients="3-O-Ethyl Ascorbic Acid 10%, Niacinamide, Hyaluronic Acid", target_skin_types="All Skin Types, Combination", target_concerns="Dullness, Dark Spots, Hyperpigmentation", price=649.0, rating=4.6, reviews_count=1680, image_url="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300", buy_url="https://thedermaco.com", nykaa_url="https://www.nykaa.com/the-derma-co-10percent-vitamin-c-face-serum/p/1321453", amazon_url="https://www.amazon.in/dp/B08L7V89P5"),
                Product(brand="Dot & Key", name="Watermelon Sunscreen SPF 50 PA++++", category="Sunscreen", active_ingredients="Zinc Oxide, Watermelon Extract, Hyaluronic Acid", target_skin_types="All Skin Types, Combination", target_concerns="UV Protection, Sunburn, Dullness", price=399.0, rating=4.7, reviews_count=980, image_url="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300", buy_url="https://www.dotandkey.com", nykaa_url="https://www.nykaa.com/dot-key-watermelon-cooling-sunscreen-spf-50-pa/p/5012543", amazon_url="https://www.amazon.in/dp/B09V7N72TL"),
                Product(brand="Foxtale", name="Dewy Sunscreen SPF 50 PA++++", category="Sunscreen", active_ingredients="Niacinamide, Vitamin E, Broad Spectrum UV Filters", target_skin_types="Dry, Normal, Combination", target_concerns="UV Damage, Dehydration, Sunburn", price=345.0, rating=4.6, reviews_count=870, image_url="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300", buy_url="https://foxtale.in", nykaa_url="https://www.nykaa.com/foxtale-dewy-sunscreen-spf-50-pa/p/6345891", amazon_url="https://www.amazon.in/dp/B0B5D7M759"),
                Product(brand="CeraVe", name="Moisturizing Cream with Ceramides", category="Moisturizer", active_ingredients="Essential Ceramides (1, 3, 6-II), Hyaluronic Acid", target_skin_types="Dry, Normal, Sensitive", target_concerns="Dehydration, Compromised Barrier, Flakiness", price=1299.0, rating=4.8, reviews_count=2100, image_url="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=300", buy_url="https://www.cerave.com", nykaa_url="https://www.nykaa.com/cerave-moisturizing-cream/p/9274531", amazon_url="https://www.amazon.in/dp/B000Q2RP7I"),
                Product(brand="Paula's Choice", name="2% BHA Liquid Exfoliant", category="Treatment Products", active_ingredients="Salicylic Acid (BHA) 2%, Green Tea Extract", target_skin_types="Oily, Combination", target_concerns="Blackheads, Acne, Rough Texture", price=2700.0, rating=4.9, reviews_count=3400, image_url="https://images.unsplash.com/photo-1608248597461-7110196238b6?w=300", buy_url="https://www.paulaschoice.com", nykaa_url="https://www.nykaa.com/paula-s-choice-skin-perfecting-2percent-bha-liquid-exfoliant/p/576088", amazon_url="https://www.amazon.in/dp/B00949CTQQ"),
                Product(brand="Klairs", name="Supple Preparation Unscented Facial Toner", category="Toner", active_ingredients="Centella Asiatica, Hyaluronic Acid, Beta-Glucan", target_skin_types="Sensitive, Dry, Combination", target_concerns="Dehydration, Redness, Irritation", price=1430.0, rating=4.8, reviews_count=1540, image_url="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300", buy_url="https://www.nykaa.com", nykaa_url="https://www.nykaa.com/dear-klairs-supple-preparation-unscented-toner/p/354747", amazon_url="https://www.amazon.in/dp/B07B64G96B"),
                Product(brand="Minimalist", name="PHA 3% Gentle Face Toner", category="Toner", active_ingredients="Gluconolactone (PHA) 3%, Salicylic Acid, Niacinamide", target_skin_types="Sensitive, All Skin Types", target_concerns="Pores, Mild Exfoliation, Hydration", price=399.0, rating=4.6, reviews_count=1120, image_url="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300", buy_url="https://beminimalist.co", nykaa_url="https://www.nykaa.com/minimalist-3percent-pha-face-toner/p/1321450", amazon_url="https://www.amazon.in/dp/B08F9N1G2X"),
                Product(brand="Minimalist", name="Benzoyl Peroxide 2.5% Spot Treatment", category="Treatment Products", active_ingredients="Benzoyl Peroxide 2.5%, Glycolic Acid", target_skin_types="Oily, Combination, Acne Prone", target_concerns="Acne, Blemishes, Active Pimples", price=299.0, rating=4.5, reviews_count=840, image_url="https://images.unsplash.com/photo-1608248597461-7110196238b6?w=300", buy_url="https://beminimalist.co", nykaa_url="https://www.nykaa.com/minimalist-benzoyl-peroxide-cream/p/2779150", amazon_url="https://www.amazon.in/dp/B095K5LMNO")
            ]
            db.add_all(initial_products)
        else:
            # Check if Toner & Treatment Products exist, if not add them
            toner_exists = db.query(Product).filter(Product.category.ilike("%toner%")).first()
            if not toner_exists:
                db.add_all([
                    Product(brand="Klairs", name="Supple Preparation Unscented Facial Toner", category="Toner", active_ingredients="Centella Asiatica, Hyaluronic Acid, Beta-Glucan", target_skin_types="Sensitive, Dry, Combination", target_concerns="Dehydration, Redness, Irritation", price=1430.0, rating=4.8, reviews_count=1540, image_url="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300", buy_url="https://www.nykaa.com", nykaa_url="https://www.nykaa.com/dear-klairs-supple-preparation-unscented-toner/p/354747", amazon_url="https://www.amazon.in/dp/B07B64G96B"),
                    Product(brand="Minimalist", name="PHA 3% Gentle Face Toner", category="Toner", active_ingredients="Gluconolactone (PHA) 3%, Salicylic Acid, Niacinamide", target_skin_types="Sensitive, All Skin Types", target_concerns="Pores, Mild Exfoliation, Hydration", price=399.0, rating=4.6, reviews_count=1120, image_url="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300", buy_url="https://beminimalist.co", nykaa_url="https://www.nykaa.com/minimalist-3percent-pha-face-toner/p/1321450", amazon_url="https://www.amazon.in/dp/B08F9N1G2X"),
                    Product(brand="Minimalist", name="Benzoyl Peroxide 2.5% Spot Treatment", category="Treatment Products", active_ingredients="Benzoyl Peroxide 2.5%, Glycolic Acid", target_skin_types="Oily, Combination, Acne Prone", target_concerns="Acne, Blemishes, Active Pimples", price=299.0, rating=4.5, reviews_count=840, image_url="https://images.unsplash.com/photo-1608248597461-7110196238b6?w=300", buy_url="https://beminimalist.co", nykaa_url="https://www.nykaa.com/minimalist-benzoyl-peroxide-cream/p/2779150", amazon_url="https://www.amazon.in/dp/B095K5LMNO")
                ])

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
app.include_router(scoring_router.router)

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
