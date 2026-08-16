from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.routes.assessment import router as assessment_router
from app.routes.skin_classifier import router as skin_classifier_router
from app.routes.routine import router as routine_router

# Create FastAPI app
app = FastAPI(
    title="Skin Assessment Engine API",
    description="Rule-based skin health assessment and analysis engine",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(assessment_router, prefix="/api", tags=["assessments"])
app.include_router(skin_classifier_router, prefix="/api", tags=["skin-classifier"])
app.include_router(routine_router, prefix="/api", tags=["routines"])

# Startup event - Initialize database
@app.on_event("startup")
async def startup_event():
    try:
        init_db()
    except Exception as e:
        print(f"Warning: Database initialization failed: {e}")
        print("API will start but database operations will not work until DB is configured")

# Root endpoint
@app.get("/")
def root():
    return {
        "message": "Skin Assessment Engine API",
        "version": "1.0.0",
        "status": "running"
    }

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
