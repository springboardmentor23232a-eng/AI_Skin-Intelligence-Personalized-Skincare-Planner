from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app import models
from app.routers import users, assessment

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Skin Intelligence API")

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

@app.get("/")
def home():
    return {
        "message": "Welcome to AI Skin Intelligence Backend!"
    }