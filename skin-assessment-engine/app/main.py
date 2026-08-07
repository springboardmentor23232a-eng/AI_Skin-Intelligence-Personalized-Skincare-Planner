from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import assessment
from . import users
from . import google_auth
from . import dashboard

from .database import engine, Base
from . import models


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Skin Assessment Engine",
    description="AI Skin Health Assessment API",
    version="1.0"
)


# CORS SETTINGS

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(assessment.router)

app.include_router(users.router)

app.include_router(google_auth.router)

app.include_router(dashboard.router)



@app.get("/")
def home():

    return {
        "message":"Skin Assessment Engine is running"
    }