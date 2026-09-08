from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.schemas import (
    UserDashboardAnalyticsResponse,
    ConsultantDashboardAnalyticsResponse,
    DermatologistDashboardAnalyticsResponse,
    AdminDashboardAnalyticsResponse,
    DailyChecklistResponse,
    ChecklistToggleRequest,
    ChecklistToggleResponse
)
from app.services.dashboard_service import (
    get_user_dashboard_analytics,
    get_consultant_dashboard_analytics,
    get_dermatologist_dashboard_analytics,
    get_admin_dashboard_analytics,
    toggle_daily_checklist_step
)

router = APIRouter(tags=["Module 9: Dashboard & Analytics"])

@router.get("/user/{user_id}", response_model=UserDashboardAnalyticsResponse)
def get_user_dashboard(user_id: int = 1, db: Session = Depends(get_db)):
    """
    Fetch comprehensive User Dashboard metrics, weighted score breakdown,
    routine checklist, hydration, sleep, and product counts.
    """
    return get_user_dashboard_analytics(db, user_id)

@router.get("/consultant", response_model=ConsultantDashboardAnalyticsResponse)
def get_consultant_dashboard(consultant_id: int = 2, db: Session = Depends(get_db)):
    """
    Fetch Consultant Dashboard metrics, client profiles roster, skin type distribution,
    and recommendation tracking.
    """
    return get_consultant_dashboard_analytics(db, consultant_id)

@router.get("/dermatologist", response_model=DermatologistDashboardAnalyticsResponse)
def get_dermatologist_dashboard(doctor_id: int = 3, db: Session = Depends(get_db)):
    """
    Fetch Dermatologist Dashboard metrics, patient triage queue, ISIC optical lesion screening,
    and clinical Rx records.
    """
    return get_dermatologist_dashboard_analytics(db, doctor_id)

@router.get("/admin", response_model=AdminDashboardAnalyticsResponse)
def get_admin_dashboard(db: Session = Depends(get_db)):
    """
    Fetch Admin Dashboard metrics, user role statistics, 12-microservice telemetry,
    and audit logs.
    """
    return get_admin_dashboard_analytics(db)

@router.post("/checklist/toggle", response_model=ChecklistToggleResponse)
def toggle_checklist(req: ChecklistToggleRequest, db: Session = Depends(get_db)):
    """
    Toggle a daily skincare checklist item (morning, evening, or weekly)
    and dynamically update daily completion % and streaks.
    """
    return toggle_daily_checklist_step(
        db=db,
        user_id=req.user_id,
        step_id=req.step_id,
        routine_type=req.routine_type,
        completed=req.completed,
        check_date=req.check_date
    )

@router.get("/checklist/{user_id}", response_model=DailyChecklistResponse)
def get_user_checklist(user_id: int = 1, db: Session = Depends(get_db)):
    """
    Fetch the today's skincare checklist for a specific user.
    """
    user_data = get_user_dashboard_analytics(db, user_id)
    return user_data["daily_checklist"]
