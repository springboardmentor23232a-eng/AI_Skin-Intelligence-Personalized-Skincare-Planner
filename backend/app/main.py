import logging
import time
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app.config import settings
from app import models  # noqa: F401  (ensures models are registered before create_all)

from app.routers import (
    auth_router,
    users,
    assessment,
    routine,
    ingredient,
    product,
    progress,
    dashboard,
    notifications,
    gemini_router,
    reports,
)

# ---------------------------------------------------------------------------
# Module 12: Monitoring & logging setup — every request gets a correlation ID
# and a timed log line; unhandled exceptions are always logged with it.
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("aiskin")

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered Skin Intelligence & Personalized Skincare Platform API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_logging_and_security_headers(request: Request, call_next):
    request_id = str(uuid.uuid4())[:8]
    start = time.time()
    try:
        response = await call_next(request)
    except Exception:
        logger.exception(f"[{request_id}] Unhandled error on {request.method} {request.url.path}")
        raise
    duration_ms = round((time.time() - start) * 1000, 1)
    logger.info(f"[{request_id}] {request.method} {request.url.path} -> {response.status_code} ({duration_ms}ms)")

    # Module 12: baseline security hardening headers on every response.
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(auth_router.router)
app.include_router(users.router)
app.include_router(assessment.router)
app.include_router(routine.router)
app.include_router(ingredient.router)
app.include_router(product.router)
app.include_router(progress.router)
app.include_router(dashboard.router)
app.include_router(notifications.router)
app.include_router(gemini_router.router)
app.include_router(reports.router)


@app.get("/")
def root():
    return {
        "message": f"{settings.APP_NAME} API is running.",
        "docs": "/docs",
    }


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
