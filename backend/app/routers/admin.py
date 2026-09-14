from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models import User
from app.dependencies.rbac import RoleChecker
from app.services import admin_service
from app.logging_config import logger

router = APIRouter(prefix="/api/admin", tags=["Admin Portal"])

admin_clearance = RoleChecker(["ADMIN"])


class RoleUpdatePayload(BaseModel):
    role: str


@router.get("/dashboard")
async def get_dashboard(
    db: Session = Depends(get_db),
    current_admin: User = Depends(admin_clearance)
):
    """Returns platform overview counters and administrative telemetry."""
    logger.info(f"API Admin GET /api/admin/dashboard: admin={current_admin.email}")
    return admin_service.get_admin_dashboard_stats(db)


@router.get("/users")
async def get_users(
    search: Optional[str] = None,
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin: User = Depends(admin_clearance)
):
    """Retrieves full user management directory with search and role filters."""
    logger.info(f"API Admin GET /api/admin/users: admin={current_admin.email}, search={search}, role={role}")
    return admin_service.get_admin_users_list(db, search=search, role_filter=role)


@router.put("/users/{user_id}/role")
async def update_role(
    user_id: int,
    payload: RoleUpdatePayload,
    db: Session = Depends(get_db),
    current_admin: User = Depends(admin_clearance)
):
    """Updates user permission role."""
    logger.info(f"API Admin PUT /api/admin/users/{user_id}/role: new_role={payload.role} by admin={current_admin.email}")
    return admin_service.update_user_role(db, user_id=user_id, new_role=payload.role)


@router.delete("/users/{user_id}")
async def remove_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(admin_clearance)
):
    """Deletes a user account with cascade protection."""
    logger.info(f"API Admin DELETE /api/admin/users/{user_id}: by admin={current_admin.email}")
    return admin_service.delete_user(db, user_id=user_id, current_admin=current_admin)


@router.get("/analytics")
async def get_analytics(
    db: Session = Depends(get_db),
    current_admin: User = Depends(admin_clearance)
):
    """Returns platform growth curve and active interactions statistics."""
    logger.info(f"API Admin GET /api/admin/analytics: admin={current_admin.email}")
    return admin_service.get_platform_analytics(db)


@router.get("/recommendation-metrics")
async def get_recommendation_metrics(
    db: Session = Depends(get_db),
    current_admin: User = Depends(admin_clearance)
):
    """Audits product catalog and ingredient interaction counts."""
    logger.info(f"API Admin GET /api/admin/recommendation-metrics: admin={current_admin.email}")
    return admin_service.get_recommendation_metrics(db)


@router.get("/system-health")
async def get_system_health(
    db: Session = Depends(get_db),
    current_admin: User = Depends(admin_clearance)
):
    """Returns database ping latency, health indicators, and table audits."""
    logger.info(f"API Admin GET /api/admin/system-health: admin={current_admin.email}")
    return admin_service.get_system_health(db)


@router.post("/notifications/broadcast")
async def broadcast_notification(
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
    current_admin: User = Depends(admin_clearance)
):
    """Broadcasts a platform announcement to all users or specific roles."""
    from app.services import notification_service
    title = payload.get("title")
    message = payload.get("message")
    if not title or not message:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Title and message are required.")
    
    count = notification_service.broadcast_platform_notification(
        admin_user_id=current_admin.id,
        title=title,
        message=message,
        priority=payload.get("priority", "NORMAL"),
        target_role=payload.get("target_role", "ALL"),
        target_user_id=payload.get("target_user_id"),
        action_url=payload.get("action_url"),
        db=db
    )
    return {
        "success": True,
        "recipients_count": count,
        "message": f"Broadcast delivered to {count} recipient(s)."
    }

