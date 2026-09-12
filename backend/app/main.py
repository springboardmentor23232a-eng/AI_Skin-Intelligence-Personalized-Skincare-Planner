import time
import uuid
import logging
import platform
import os
from datetime import datetime
from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db.session import engine, Base, get_db, DATABASE_URL
from app.core.config import settings
from app.auth.router import router as auth_router
from app.routes.modules import router as modules_router
from app.routes.phase3 import router as phase3_router
from app.routes.phase4 import router as phase4_router
from app.routes.phase5 import router as phase5_router
from app.routes.phase6 import router as phase6_router
from app.routes.phase7 import router as phase7_router
from app.routes.image_analysis import router as image_analysis_router
from app.routes.admin import router as admin_router

APP_START_TIME = time.time()

# Setup structured logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [ReqID: %(name)s] %(message)s"
)
logger = logging.getLogger("api.telemetry")

# Ensure database tables exist in PostgreSQL / SQLite
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
        logger.info("PyTorch ML Model loaded successfully into runtime memory.")
    except Exception as e:
        logger.warning(f"PyTorch ML Model pre-loading deferred or failed: {e}")

# Add GZip compression middleware (compresses responses >= 1000 bytes)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Configure Security Headers, Request ID & Response Latency Middleware
@app.middleware("http")
async def add_security_headers_and_timing(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request.state.request_id = request_id
    start_time = time.time()

    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000

    # Inject Request Correlation, Latency & Security Headers
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    # Structured request-completion logging
    client_ip = request.client.host if request.client else "unknown"
    logger.info(
        f"REQ [{request_id[:8]}] {request.method} {request.url.path} "
        f"status={response.status_code} ip={client_ip} latency={process_time:.2f}ms"
    )
    return response

# Configure CORS using dynamic settings list
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "Content-Type", "Content-Length", "X-Process-Time-Ms", "X-Request-ID"],
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
app.include_router(admin_router)

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

from app.auth import require_roles
from app.models import User

@app.get("/api/system/telemetry")
def system_telemetry(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_roles("ADMIN"))
):
    """Production telemetry & health monitoring endpoint (Restricted to Administrators)"""
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "disconnected"

    uptime = time.time() - APP_START_TIME
    ml_loaded = model_loader.model is not None

    return {
        "service": "AI Skin Intelligence Platform",
        "status": "operational",
        "version": "1.0.0",
        "uptime_seconds": round(uptime, 2),
        "timestamp": datetime.utcnow().isoformat(),
        "runtime": {
            "environment_mode": "development" if "localhost" in settings.BACKEND_URL else "production",
            "database_engine": "sqlite" if "sqlite" in DATABASE_URL else "postgresql",
            "database_status": db_status
        },
        "ml_inference": {
            "model_architecture": "EfficientNet-B0",
            "model_loaded": ml_loaded,
            "device": str(model_loader.device) if hasattr(model_loader, "device") else "cpu"
        },
        "security_features": {
            "cors_configured": True,
            "gzip_compression": True,
            "security_headers": True,
            "request_id_tracing": True,
            "role_based_access_control": True
        }
    }
