from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
import app.models # Register all ORM models with Base
from app.routers import assessment, health, routine, ingredient, product, scoring, progress, clinical, chat

# Create DB tables automatically on startup
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
    ## PanaceaAI Skin Intelligence Engine (Modules 3, 4, 5, 6, 7, 8 & Clinical Portals)
    
    Complete API for skin assessments, personalized routine generation, ingredient intelligence,
    product recommendation & comparison, weighted skin health scoring, progress tracking & analytics,
    clinician patient dossiers, and Clinical Chat & Lumina AI.
    
    ### Key Endpoints:
    * **Module 5**: `/ingredient/analyze`, `/ingredient/categories`, `/ingredient/{name}`
    * **Module 6**: `/product/recommend`, `/product/compare`, `/product/alternatives/{id}`
    * **Module 7**: `/scoring/calculate`, `/scoring/trend/{user_id}`, `/scoring/adherence`
    * **Module 8**: `/progress/history/{user_id}`, `/progress/adherence/{user_id}`, `/progress/compare`, `/progress/trends/{user_id}`, `/progress/summary/{user_id}`
    * **Clinical Portals**: `/clinical/consultant/clients`, `/clinical/dermatologist/patients`, `/clinical/patient-dossier/{user_id}`
    * **Clinical Chat**: `/chat/conversations`, `/chat/messages`, `/chat/send`, `/chat/mark-read`
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

app.include_router(progress.router, prefix="/progress")
app.include_router(progress.router, prefix="/api/v1/progress")
app.include_router(progress.router, prefix="/api/progress")

app.include_router(clinical.router, prefix="/clinical")
app.include_router(clinical.router, prefix="/api/v1/clinical")
app.include_router(clinical.router, prefix="/api/clinical")

app.include_router(chat.router, prefix="/chat")
app.include_router(chat.router, prefix="/api/v1/chat")
app.include_router(chat.router, prefix="/api/chat")

app.include_router(health.router)

@app.get("/")
def root():
    return {
        "message": "Welcome to PanaceaAI Skin Intelligence Engine API",
        "docs": "/docs",
        "health": "/health",
        "modules": [
            "Module 3: Skin Assessment",
            "Module 4: Personalized Routine Generator",
            "Module 5: Ingredient Intelligence",
            "Module 6: Product Recommendation Engine",
            "Module 7: Skin Health Scoring Engine",
            "Module 8: Progress Tracking & Analytics"
        ]
    }


