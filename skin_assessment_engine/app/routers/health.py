from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db

router = APIRouter(tags=["Health"])

@router.get("/health")
@router.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint to verify database connectivity and engine telemetry."""
    db_status = "Connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"Disconnected: {str(e)}"

    return {
        "status": "online",
        "service": "PanaceaAI Skin Assessment Engine (Module 3)",
        "engine_version": "1.0.0",
        "database": db_status,
        "features": [
            "Skin Health Scoring",
            "Concern Identification & Prioritization",
            "Rule-Based Risk Factor Analysis",
            "Assessment History & Trends"
        ],
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
