import time
from datetime import datetime
from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import text
import os

from app.db.session import engine, Base, get_db
from app.core.config import settings
from app.auth.router import router as auth_router
from app.routes.modules import router as modules_router
from app.routes.phase3 import router as phase3_router
from app.routes.phase4 import router as phase4_router
from app.routes.phase5 import router as phase5_router
from app.routes.phase6 import router as phase6_router
from app.routes.phase7 import router as phase7_router
from app.routes.image_analysis import router as image_analysis_router

# Ensure database tables exist in PostgreSQL
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Skin Intelligence Dashboard API",
    description="FastAPI Backend for Skin Intelligence Dashboard with PostgreSQL, JWT Authentication & Google OAuth",
    version="1.0.0"
)

from app.ai.model_loader import model_loader

# Ensure uploads folder exists and mount it
uploads_path = os.path.join(os.path.dirname(__file__), "..", "uploads")
os.makedirs(uploads_path, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")

@app.on_event("startup")
def startup_event():
    try:
        model_loader.load_model()
    except Exception as e:
        print(f"[Warning] PyTorch ML Model pre-loading deferred or failed: {e}")



# Configure Security Headers & Response Latency Middleware
@app.middleware("http")
async def add_security_headers_and_timing(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000

    # Inject Latency & Security Headers
    response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Configure CORS using dynamic settings list
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(modules_router)
app.include_router(phase3_router)
app.include_router(phase4_router)
app.include_router(phase5_router)
app.include_router(phase6_router)
app.include_router(phase7_router)
app.include_router(image_analysis_router)



@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "service": "AI Skin Intelligence Dashboard API",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }


@app.get("/readiness")
def readiness_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "ready",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Database readiness check failed: {str(e)}"
        )
