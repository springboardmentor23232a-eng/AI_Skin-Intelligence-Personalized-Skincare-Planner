from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.core.config import settings
from app.database import Base, engine
from app.models import (
    user,
    skin_profile,
    assessment,
    skin_concern,
    risk_factor,
    routine,
    ingredient,
    product,
    progress,
    notification,
    recommendation,
    checklist,
)

from app.routers import (
    auth,
    users,
    skin_profile as skin_profile_router,
    assessment as assessment_router,
    routine as routine_router,
    ingredient as ingredient_router,
    product as product_router,
    progress as progress_router,
    dashboard,
    notification as notification_router,
    reports,
    admin,
    clients,
    recommendations,
    checklist as checklist_router,
    oauth as oauth_router,
)

app = FastAPI(
    title="AI Skin Intelligence & Personalized Skincare Planner API",
    description="Personalized skincare routines, ingredient intelligence, product recommendations, and progress tracking.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Required by Authlib to store OAuth state/nonce between the login redirect and callback
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

# Create tables on startup (use Alembic migrations for production)
Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(skin_profile_router.router)
app.include_router(assessment_router.router)
app.include_router(routine_router.router)
app.include_router(ingredient_router.router)
app.include_router(product_router.router)
app.include_router(progress_router.router)
app.include_router(dashboard.router)
app.include_router(notification_router.router)
app.include_router(reports.router)
app.include_router(admin.router)
app.include_router(clients.router)
app.include_router(recommendations.router)
app.include_router(checklist_router.router)
app.include_router(oauth_router.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "AI Skin Intelligence & Personalized Skincare Planner"}


@app.get("/health")
def health():
    return {"status": "healthy"}