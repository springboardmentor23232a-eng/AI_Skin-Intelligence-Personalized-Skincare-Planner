import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import engine, Base
from app import models
from app.routers import users, assessment, routine, ingredients, products, scoring, consultant, dermatologist, admin, notifications, hydration, sleep, products_purchase, reminders
from app.reminder_scheduler import start_scheduler, stop_scheduler

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Skin Intelligence API")

# Ensure uploads directory structure exists and mount static files
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(os.path.join(UPLOADS_DIR, "assessments"), exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# Configure CORS Middleware to allow requests from React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(assessment.router)
app.include_router(routine.router)
app.include_router(ingredients.router)
app.include_router(products.router)
app.include_router(scoring.router)
app.include_router(consultant.router)
app.include_router(dermatologist.router)
app.include_router(admin.router)
app.include_router(notifications.router)
app.include_router(hydration.router)
app.include_router(sleep.router)
app.include_router(products_purchase.router)
app.include_router(reminders.router)


@app.on_event("startup")
def on_startup():
    start_scheduler()


@app.on_event("shutdown")
def on_shutdown():
    stop_scheduler()


@app.get("/")
def home():
    return {
        "message": "Welcome to AI Skin Intelligence Backend!"
    }