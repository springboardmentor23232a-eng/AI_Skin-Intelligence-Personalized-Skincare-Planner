from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.dependencies.rbac import RoleChecker
from app.services import dermatologist_service
from app.logging_config import logger

router = APIRouter(prefix="/api/dermatologist", tags=["Dermatologist Portal"])

dermatologist_clearance = RoleChecker(["DOCTOR", "DERMATOLOGIST", "ADMIN"])


@router.get("/dashboard")
async def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(dermatologist_clearance)
):
    """Fetches high-risk cases queue and clinical workload KPIs."""
    logger.info(f"API Dermatologist GET /api/dermatologist/dashboard: user={current_user.email}")
    return dermatologist_service.get_dermatologist_dashboard_stats(db)


@router.get("/patients")
async def get_patients(
    search: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(dermatologist_clearance)
):
    """Retrieves patient insights, diagnostic concerns, sensitivity, and allergy records."""
    logger.info(f"API Dermatologist GET /api/dermatologist/patients: user={current_user.email}, search={search}, status={status}")
    return dermatologist_service.get_patient_insights_list(db, search=search, status_filter=status)


@router.get("/conditions")
async def get_conditions(
    db: Session = Depends(get_db),
    current_user: User = Depends(dermatologist_clearance)
):
    """Aggregates condition reports with real frequency distributions and severity scores."""
    logger.info(f"API Dermatologist GET /api/dermatologist/conditions: user={current_user.email}")
    return dermatologist_service.get_condition_reports(db)


@router.get("/analytics")
async def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(dermatologist_clearance)
):
    """Returns clinical progress analytics, recovery rates, and category distribution."""
    logger.info(f"API Dermatologist GET /api/dermatologist/analytics: user={current_user.email}")
    return dermatologist_service.get_dermatologist_progress_analytics(db)
