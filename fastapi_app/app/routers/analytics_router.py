from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.security import get_current_user, get_optional_current_user, AuthenticatedUser
from app.engine.analytics_engine import AnalyticsEngine
from app.schemas.analytics import UserAnalyticsResponse, SystemAnalyticsResponse

router = APIRouter(prefix="", tags=["Skincare Analytics Engine"])

# 1. GET /analytics/user - Get personal skin analytics
@router.get(
    "/analytics/user",
    response_model=UserAnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Personal Skincare Analytics",
    description="Returns skin health score trajectory, moisture trendline, routine compliance %, and concern improvement metrics."
)
def get_user_analytics(
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    return AnalyticsEngine.get_user_analytics(db, current_user.id)

# 2. GET /analytics/system - Get system-wide admin/clinical analytics
@router.get(
    "/analytics/system",
    response_model=SystemAnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get System-Wide Skincare Analytics",
    description="Returns system aggregate statistics, overall user scores, concern distributions, and active user metrics (Admin/Consultant/Doctor)."
)
def get_system_analytics(
    db: Session = Depends(get_db),
    current_user: AuthenticatedUser = Depends(get_optional_current_user)
):
    return AnalyticsEngine.get_system_analytics(db)
