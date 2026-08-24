from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
import app.models # Register all ORM models with Base
from app.routers import assessment, health, routine, ingredient, product, scoring

# Create DB tables automatically on startup
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
    ## PanaceaAI Skin Intelligence Engine (Modules 3, 4, 5, 6, 7)
    
    Complete API for skin assessments, personalized routine generation, ingredient intelligence,
    product recommendation & comparison, and weighted skin health scoring.
    
    ### Key Endpoints:
    * **Module 5**: `/ingredient/analyze`, `/ingredient/categories`, `/ingredient/{name}`
    * **Module 6**: `/product/recommend`, `/product/compare`, `/product/alternatives/{id}`
    * **Module 7**: `/scoring/calculate`, `/scoring/trend/{user_id}`, `/scoring/adherence`
    """,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for cross-origin frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(assessment.router, prefix="/assessment")
app.include_router(assessment.router, prefix="/api/v1/assessment")
app.include_router(assessment.router, prefix="/api/assessment")

app.include_router(routine.router, prefix="/routine")
app.include_router(routine.router, prefix="/api/v1/routine")
app.include_router(routine.router, prefix="/api/routine")

app.include_router(ingredient.router, prefix="/ingredient")
app.include_router(ingredient.router, prefix="/api/v1/ingredient")
app.include_router(ingredient.router, prefix="/api/ingredient")

app.include_router(product.router, prefix="/product")
app.include_router(product.router, prefix="/api/v1/product")
app.include_router(product.router, prefix="/api/product")

app.include_router(scoring.router, prefix="/scoring")
app.include_router(scoring.router, prefix="/api/v1/scoring")
app.include_router(scoring.router, prefix="/api/scoring")

app.include_router(health.router)

@app.get("/")
def root():
    return {
        "message": "Welcome to PanaceaAI Skin Intelligence Engine API",
        "docs": "/docs",
        "health": "/health",
        "modules": ["Module 3: Skin Assessment", "Module 4: Personalized Routine Generator", "Module 5: Ingredient Intelligence", "Module 6: Product Recommendation Engine", "Module 7: Skin Health Scoring Engine"]
    }

