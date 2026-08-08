from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .config import settings
from .routers import (
    auth, profile, skin_profile, assessment,
    recommendations, appointments, consultant,
    dermatologist, admin, products_reports, lifestyle,
    messages,
)

# Create all tables (for local/dev use; use Alembic migrations in production)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Skin Intelligence & Personalized Skincare Planner",
    description="Full-stack AI-powered skincare platform with User, Consultant, "
                 "Dermatologist and Admin roles.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN, "http://localhost:5500", "http://127.0.0.1:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(skin_profile.router)
app.include_router(assessment.router)
app.include_router(recommendations.router)
app.include_router(appointments.router)
app.include_router(consultant.router)
app.include_router(dermatologist.router)
app.include_router(admin.router)
app.include_router(products_reports.router)
app.include_router(lifestyle.router)
app.include_router(messages.router)


@app.get("/")
def root():
    return {
        "message": "AI Skin Intelligence & Personalized Skincare Planner API",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "ok"}
