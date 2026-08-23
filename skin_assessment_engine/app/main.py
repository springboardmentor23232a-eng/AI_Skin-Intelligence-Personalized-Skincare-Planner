from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
import app.models # Register all ORM models with Base
from app.routers import assessment, health, routine

# Create DB tables automatically on startup
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
    ## PanaceaAI Skin Intelligence & Routine Engine (Modules 3 & 4)
    
    API for analyzing skin profiles, calculating Skin Health Scores (0-100),
    identifying skin concerns, evaluating risk factors, and generating personalized routines.
    
    ### Routine Generator Endpoints
    * **POST** `/routine/generate` - Generate personalized AM/PM, weekly & seasonal routine
    * **GET** `/routine/user/{user_id}` - Retrieve active user routine
    * **GET** `/routine/{id}` - Fetch specific routine details
    * **POST** `/routine/adapt` - Trigger adaptive routine update on skin score changes
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

# Mount Routers (Supports /assessment, /routine, and /api/v1 prefix)
app.include_router(assessment.router, prefix="/assessment")
app.include_router(assessment.router, prefix="/api/v1/assessment")
app.include_router(assessment.router, prefix="/api/assessment")

app.include_router(routine.router, prefix="/routine")
app.include_router(routine.router, prefix="/api/v1/routine")
app.include_router(routine.router, prefix="/api/routine")

app.include_router(health.router)

@app.get("/")
def root():
    return {
        "message": "Welcome to PanaceaAI Skin Intelligence Engine API",
        "docs": "/docs",
        "health": "/health",
        "endpoints": [
            "POST /assessment",
            "GET /assessment",
            "POST /routine/generate",
            "GET /routine/user/{user_id}",
            "POST /routine/adapt"
        ]
    }

