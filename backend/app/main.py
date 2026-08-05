from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.exceptions import register_exception_handlers
from app.routers import auth, profile
from app.logging_config import logger

# Initialize FastAPI App
app = FastAPI(
    title="AI Skin Intelligence & Personalized Skincare Planner API",
    description="Backend API services managing Module 1: User Authentication & Role-Based Access Control.",
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

@app.get("/", tags=["Health Check"])
async def health_check():
    """Simple API status health check ping endpoint."""
    logger.info("Health check ping received")
    return {
        "success": True,
        "message": "AI Skin Intelligence API is running successfully.",
        "version": "1.0.0"
    }
