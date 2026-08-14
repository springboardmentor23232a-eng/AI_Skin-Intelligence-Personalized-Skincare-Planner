import sys
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# Include current directory in path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base
from app.routers import assessment_router, routine_router, gemini_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables if they do not exist
    try:
        Base.metadata.create_all(bind=engine)
        print("[FastAPI Skin Engine] Database tables created/verified successfully.")
    except Exception as e:
        print(f"[FastAPI Skin Engine Warning] Could not auto-create database tables: {e}")
    yield
    # Shutdown logic
    print("[FastAPI Skin Engine] Shutting down clean.")

app = FastAPI(
    title="AI Skin Intelligence - Assessment & Routine Generation Engine API",
    description="Module 3 & 4: Rule-Based Skin Health Assessment Engine & Personalized Skincare Routine Generation System (Morning, Evening, Weekly, Seasonal).",
    version="1.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"}
    )

# Register Routers
app.include_router(assessment_router)
app.include_router(routine_router.router)
app.include_router(gemini_router.router)

# Health Check & Root Info
@app.get("/", tags=["Health & Info"])
@app.get("/health", tags=["Health & Info"])
def health_check():
    return {
        "status": "HEALTHY",
        "service": "Module 3: Skin Assessment Engine API",
        "version": "1.0.0",
        "swagger_docs": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
