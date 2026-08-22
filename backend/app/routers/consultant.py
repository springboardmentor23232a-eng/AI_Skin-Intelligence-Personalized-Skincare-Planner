from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, SkinAssessment, RoutineProfile, Routine
from app.dependencies.auth import get_current_user
from app.dependencies.rbac import RoleChecker
from app.schemas import (
    UserResponse,
    RoutineProfileResponse,
    RoutineResponse,
    SkinAssessmentResponse
)
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/consultant", tags=["Consultant Portal"])

# Security clearance validator
consultant_clearance = RoleChecker(["CONSULTANT", "DOCTOR", "ADMIN"])

# Pydantic Schemas for Consultant Response Payloads
class ConsultantDashboardStats(BaseModel):
    total_clients: int
    pending_reviews: int
    completed_consultations: int

class RecentAssessmentQueueItem(BaseModel):
    id: int
    user_id: int
    clientName: str
    concern: str
    photo: Optional[str] = None
    date: datetime

class ConsultantDashboardResponse(BaseModel):
    stats: ConsultantDashboardStats
    pending_queue: List[RecentAssessmentQueueItem]

class ClientOverview(BaseModel):
    id: int
    name: Optional[str] = None
    email: str
    skin_type: Optional[str] = None
    concerns: List[str] = []
    latest_score: Optional[int] = None
    has_active_routine: bool = False
    created_at: datetime

class ClientDetailResponse(BaseModel):
    id: int
    name: Optional[str] = None
    email: str
    role: str
    provider: str
    created_at: datetime
    routine_profile: Optional[RoutineProfileResponse] = None
    current_routine: Optional[RoutineResponse] = None
    assessments: List[SkinAssessmentResponse] = []

@router.get("/dashboard", response_model=ConsultantDashboardResponse)
async def get_consultant_dashboard_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(consultant_clearance)
):
    """Fetches real database counters and recent diagnostic assessments for the dashboard."""
    # 1. Total clients: count of users with role 'USER'
    total_clients = db.query(User).filter(User.role == "USER").count()
    
    # 2. Pending reviews: assessments where notes/comments are NULL or empty
    pending_reviews = db.query(SkinAssessment).filter(
        (SkinAssessment.notes == None) | (SkinAssessment.notes == "")
    ).count()
    
    # 3. Fetch pending assessments list
    pending_records = db.query(SkinAssessment).filter(
        (SkinAssessment.notes == None) | (SkinAssessment.notes == "")
    ).order_by(SkinAssessment.created_at.desc()).limit(5).all()
    
    pending_queue = []
    for r in pending_records:
        client_name = r.user.name if r.user and r.user.name else r.user.email
        # Prioritized concern name
        concern_str = "General Skin Audit"
        if r.concerns:
            sorted_concerns = sorted(r.concerns, key=lambda c: c.priority)
            if sorted_concerns:
                concern_str = sorted_concerns[0].concern_name
                
        pending_queue.append(RecentAssessmentQueueItem(
            id=r.id,
            user_id=r.user_id,
            clientName=client_name,
            concern=concern_str,
            photo=None, # In case of locally saved images
            date=r.created_at
        ))
        
    return {
        "stats": {
            "total_clients": total_clients,
            "pending_reviews": pending_reviews,
            "completed_consultations": 0 # Not implemented yet
        },
        "pending_queue": pending_queue
    }

@router.get("/clients", response_model=List[ClientOverview])
async def list_clients(
    db: Session = Depends(get_db),
    current_user: User = Depends(consultant_clearance)
):
    """Retrieves all registered clients with their core profile questionnaire indicators."""
    clients = db.query(User).filter(User.role == "USER").order_by(User.name.asc()).all()
    
    overview_list = []
    for c in clients:
        skin_type = None
        concerns = []
        if c.routine_profile:
            skin_type = c.routine_profile.skin_type
            concerns = c.routine_profile.concerns or []
            
        latest_score = None
        if c.assessments:
            sorted_assessments = sorted(c.assessments, key=lambda a: a.created_at, reverse=True)
            if sorted_assessments:
                latest_score = sorted_assessments[0].skin_health_score
                
        has_routine = len(c.routines) > 0
            
        overview_list.append(ClientOverview(
            id=c.id,
            name=c.name if c.name else c.email.split("@")[0],
            email=c.email,
            skin_type=skin_type,
            concerns=concerns,
            latest_score=latest_score,
            has_active_routine=has_routine,
            created_at=c.created_at
        ))
    return overview_list

@router.get("/clients/{user_id}", response_model=ClientDetailResponse)
async def get_client_details(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(consultant_clearance)
):
    """Retrieves detailed questionnaire data, active routine, and assessment scan logs of a specific client."""
    client = db.query(User).filter((User.id == user_id) & (User.role == "USER")).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Client profile not found."
        )
        
    # Get active routine (most recent)
    active_routine = db.query(Routine).filter(Routine.user_id == user_id).order_by(Routine.generated_at.desc()).first()
    
    # Get all assessments
    assessments = db.query(SkinAssessment).filter(SkinAssessment.user_id == user_id).order_by(SkinAssessment.created_at.desc()).all()
    
    return {
        "id": client.id,
        "name": client.name,
        "email": client.email,
        "role": client.role,
        "provider": client.provider,
        "created_at": client.created_at,
        "routine_profile": client.routine_profile,
        "current_routine": active_routine,
        "assessments": assessments
    }

from app.schemas import (
    UserResponse,
    RoutineProfileResponse,
    RoutineResponse,
    SkinAssessmentResponse,
    SkinConcernResponse,
    RiskFactorResponse
)

class ConsultantAssessmentResponse(BaseModel):
    id: int
    user_id: int
    client_name: str
    client_email: str
    assessment_date: datetime
    skin_health_score: int
    overall_condition: str
    notes: Optional[str] = None
    created_at: datetime
    concerns: List[SkinConcernResponse] = []
    risks: List[RiskFactorResponse] = []

    class Config:
        from_attributes = True

@router.get("/assessments", response_model=List[ConsultantAssessmentResponse])
async def list_all_assessments(
    db: Session = Depends(get_db),
    current_user: User = Depends(consultant_clearance)
):
    """Returns a list of all client assessments in the database for Consultant Reports auditing."""
    assessments = db.query(SkinAssessment).order_by(SkinAssessment.created_at.desc()).all()
    
    response_list = []
    for r in assessments:
        client_name = r.user.name if r.user and r.user.name else r.user.email.split("@")[0]
        client_email = r.user.email if r.user else ""
        
        response_list.append({
            "id": r.id,
            "user_id": r.user_id,
            "client_name": client_name,
            "client_email": client_email,
            "assessment_date": r.assessment_date,
            "skin_health_score": r.skin_health_score,
            "overall_condition": r.overall_condition,
            "notes": r.notes,
            "created_at": r.created_at,
            "concerns": r.concerns,
            "risks": r.risks
        })
    return response_list
