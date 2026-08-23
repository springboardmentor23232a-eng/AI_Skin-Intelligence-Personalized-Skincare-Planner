from fastapi import FastAPI
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
)

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


@app.get("/")
def root():
    return {
        "message": f"{settings.APP_NAME} API is running.",
        "docs": "/docs",
    }


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
