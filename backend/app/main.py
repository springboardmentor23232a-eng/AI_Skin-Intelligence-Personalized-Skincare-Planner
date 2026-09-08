import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import engine, Base
from app import models
from app.routers import users, assessment, routine, ingredients, products, scoring

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

@app.get("/")
def home():
    return {
        "message": "Welcome to AI Skin Intelligence Backend!"
    }