from fastapi import FastAPI

from app.database import engine, Base
from app import models
from app.routers import users

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(users.router)


@app.get("/")
def home():
    return {
        "message": "Welcome to AI Skin Intelligence Backend!"
    }