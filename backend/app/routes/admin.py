from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc

from app.db.session import get_db
from app.models import (
    User, UserRole, SkinProfile, SkinAssessment, SkincareRoutine,
    Consultation, ClinicalReview, Notification, AdminAuditLog,
    ProductRecommendation
)
from app.auth import get_current_user, require_roles
from app.schemas_admin import (
    AdminUserSummary,
    AdminUserListResponse,
    AdminUserDetail,
    AdminUserStatusUpdate,
    AdminUserRoleUpdate,
    AdminAuditLogResponse,
    AdminAuditLogListResponse,
    AdminStatsResponse
)

router = APIRouter(prefix="/api/admin", tags=["admin"])

ALLOWED_ROLES = {"USER", "SKINCARE_CONSULTANT", "DERMATOLOGIST", "ADMIN"}


def build_user_summary(user: User, db: Session) -> AdminUserSummary:
    assessment_count = db.query(SkinAssessment).filter(SkinAssessment.user_id == user.id).count()
    routine_count = db.query(SkincareRoutine).filter(SkincareRoutine.user_id == user.id).count()
    consultation_count = db.query(Consultation).filter(
        or_(Consultation.patient_id == user.id, Consultation.consultant_id == user.id)
    ).count()

    return AdminUserSummary(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        role=user.role,
        provider=user.provider,
        is_active=bool(user.is_active),
        is_blocked=bool(user.is_blocked),
        is_verified=bool(user.is_verified),
        blocked_reason=user.blocked_reason,
        blocked_at=user.blocked_at,
        blocked_by=user.blocked_by,
        last_login_at=user.last_login_at,
        created_at=user.created_at,
        updated_at=user.updated_at,
        assessment_count=assessment_count,
        routine_count=routine_count,
        consultation_count=consultation_count
    )


# =========================================================
# 1. LIVE ADMIN TELEMETRY / STATISTICS
# =========================================================

@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(
    current_admin: User = Depends(require_roles("ADMIN")),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_consultants = db.query(User).filter(User.role == "SKINCARE_CONSULTANT").count()
    total_dermatologists = db.query(User).filter(User.role == "DERMATOLOGIST").count()
    total_administrators = db.query(User).filter(User.role == "ADMIN").count()
    active_accounts = db.query(User).filter(User.is_active == 1, User.is_blocked == 0).count()
    blocked_accounts = db.query(User).filter(User.is_blocked == 1).count()
    deactivated_accounts = db.query(User).filter(User.is_active == 0, User.is_blocked == 0).count()

    total_assessments = db.query(SkinAssessment).count()
    total_routines = db.query(SkincareRoutine).count()
    total_recommendations = db.query(ProductRecommendation).count()
    total_consultations = db.query(Consultation).count()
    total_reviews = db.query(ClinicalReview).count()
    total_notifications = db.query(Notification).count()
    total_audit_logs = db.query(AdminAuditLog).count()

    return AdminStatsResponse(
        total_users=total_users,
        total_consultants=total_consultants,
        total_dermatologists=total_dermatologists,
        total_administrators=total_administrators,
        active_accounts=active_accounts,
        blocked_accounts=blocked_accounts,
        deactivated_accounts=deactivated_accounts,
        total_assessments=total_assessments,
        total_routines=total_routines,
        total_recommendations=total_recommendations,
        total_consultations=total_consultations,
        total_reviews=total_reviews,
        total_notifications=total_notifications,
        total_audit_logs=total_audit_logs,
        system_status="OPERATIONAL",
        timestamp=datetime.utcnow()
    )


# =========================================================
# 2. USER ACCOUNT DIRECTORY & SEARCH / FILTER / PAGINATION
# =========================================================

@router.get("/users", response_model=AdminUserListResponse)
def list_users(
    search: Optional[str] = Query(None, description="Search by full name or email"),
    role: Optional[str] = Query(None, description="Filter by role: USER, SKINCARE_CONSULTANT, DERMATOLOGIST, ADMIN"),
    status: Optional[str] = Query(None, description="Filter by status: ACTIVE, BLOCKED, DEACTIVATED"),
    is_verified: Optional[bool] = Query(None, description="Filter by verification status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Page size"),
    sort_by: str = Query("created_at", description="Field to sort by: created_at, full_name, email, role, last_login_at"),
    sort_dir: str = Query("desc", description="Sort direction: asc or desc"),
    current_admin: User = Depends(require_roles("ADMIN")),
    db: Session = Depends(get_db)
):
    query = db.query(User)

    # 1. Search filter
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(or_(User.full_name.ilike(term), User.email.ilike(term)))

    # 2. Role filter
    if role and role.strip() and role.strip().upper() != "ALL":
        query = query.filter(User.role == role.strip().upper())

    # 3. Status filter
    if status and status.strip() and status.strip().upper() != "ALL":
        st = status.strip().upper()
        if st == "BLOCKED":
            query = query.filter(User.is_blocked == 1)
        elif st == "DEACTIVATED":
            query = query.filter(and_(User.is_active == 0, User.is_blocked == 0))
        elif st == "ACTIVE":
            query = query.filter(and_(User.is_active == 1, User.is_blocked == 0))

    # 4. Verification filter
    if is_verified is not None:
        query = query.filter(User.is_verified == (1 if is_verified else 0))

    # 5. Sorting
    sort_column = getattr(User, sort_by, User.created_at)
    if sort_dir.lower() == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    total = query.count()
    total_pages = max(1, (total + page_size - 1) // page_size)
    offset = (page - 1) * page_size
    users = query.offset(offset).limit(page_size).all()

    summary_list = [build_user_summary(u, db) for u in users]

    return AdminUserListResponse(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        users=summary_list
    )


# =========================================================
# 3. DETAILED USER PROFILE & RELATIONSHIP VIEW
# =========================================================

@router.get("/users/{user_id}", response_model=AdminUserDetail)
def get_user_detail(
    user_id: int,
    current_admin: User = Depends(require_roles("ADMIN")),
    db: Session = Depends(get_db)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Blocked by admin name lookup
    blocked_by_name = None
    if target_user.blocked_by:
        admin_blocker = db.query(User).filter(User.id == target_user.blocked_by).first()
        if admin_blocker:
            blocked_by_name = admin_blocker.full_name

    # Profile
    profile_data = None
    if target_user.profile:
        p = target_user.profile
        profile_data = {
            "age": p.age,
            "gender": p.gender,
            "skin_type": p.skin_type,
            "skin_tone": p.skin_tone,
            "concerns": p.concerns,
            "allergies": p.allergies,
            "sensitivities": p.sensitivities,
            "lifestyle": p.lifestyle,
            "sleep_quality": p.sleep_quality,
            "water_intake": p.water_intake,
            "climate": p.climate
        }

    # Assessments
    assessments_count = db.query(SkinAssessment).filter(SkinAssessment.user_id == target_user.id).count()
    recent_assessments = []
    assessments = db.query(SkinAssessment).filter(
        SkinAssessment.user_id == target_user.id
    ).order_by(SkinAssessment.created_at.desc()).limit(5).all()

    for a in assessments:
        recent_assessments.append({
            "id": a.id,
            "overall_score": a.overall_score,
            "risk_level": a.risk_level,
            "concern_priority": a.concern_priority,
            "acne": a.acne,
            "dryness": a.dryness,
            "redness": a.redness,
            "created_at": a.created_at.isoformat()
        })

    # Routines
    routines_count = db.query(SkincareRoutine).filter(SkincareRoutine.user_id == target_user.id).count()
    routines = []
    for r in target_user.routines:
        routines.append({
            "id": r.id,
            "routine_type": r.routine_type,
            "title": r.title,
            "steps_count": len(r.steps) if isinstance(r.steps, list) else 0,
            "created_at": r.created_at.isoformat()
        })

    # Consultations
    consultations_query = db.query(Consultation).filter(
        or_(Consultation.patient_id == target_user.id, Consultation.consultant_id == target_user.id)
    ).order_by(Consultation.scheduled_at.desc()).limit(10).all()

    consultations = []
    for c in consultations_query:
        other_user = c.consultant if c.patient_id == target_user.id else c.patient
        consultations.append({
            "id": c.id,
            "role_in_consultation": "Patient" if c.patient_id == target_user.id else "Consultant",
            "counterparty_name": other_user.full_name if other_user else "Unknown",
            "counterparty_email": other_user.email if other_user else "Unknown",
            "status": c.status,
            "scheduled_at": c.scheduled_at.isoformat()
        })

    # Audit Trail
    audit_trail_logs = db.query(AdminAuditLog).filter(
        AdminAuditLog.target_user_id == target_user.id
    ).order_by(AdminAuditLog.created_at.desc()).limit(15).all()

    audit_trail = []
    for log in audit_trail_logs:
        audit_trail.append({
            "id": log.id,
            "action": log.action,
            "admin_name": log.admin.full_name if log.admin else "System",
            "previous_value": log.previous_value,
            "new_value": log.new_value,
            "reason": log.reason,
            "created_at": log.created_at.isoformat()
        })

    return AdminUserDetail(
        id=target_user.id,
        full_name=target_user.full_name,
        email=target_user.email,
        role=target_user.role,
        provider=target_user.provider,
        is_active=bool(target_user.is_active),
        is_blocked=bool(target_user.is_blocked),
        is_verified=bool(target_user.is_verified),
        blocked_reason=target_user.blocked_reason,
        blocked_at=target_user.blocked_at,
        blocked_by=target_user.blocked_by,
        blocked_by_name=blocked_by_name,
        last_login_at=target_user.last_login_at,
        created_at=target_user.created_at,
        updated_at=target_user.updated_at,
        profile=profile_data,
        assessments_count=assessments_count,
        recent_assessments=recent_assessments,
        routines_count=routines_count,
        routines=routines,
        consultations_count=len(consultations_query),
        consultations=consultations,
        audit_trail=audit_trail
    )


# =========================================================
# 4. ACCOUNT STATUS MANAGEMENT (BLOCK / UNBLOCK / DEACTIVATE)
# =========================================================

@router.patch("/users/{user_id}/status", response_model=AdminUserSummary)
def update_user_status(
    user_id: int,
    payload: AdminUserStatusUpdate,
    current_admin: User = Depends(require_roles("ADMIN")),
    db: Session = Depends(get_db)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    new_status = payload.status.strip().upper()
    if new_status not in {"ACTIVE", "BLOCKED", "DEACTIVATED"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Allowed values: ACTIVE, BLOCKED, DEACTIVATED"
        )

    # Security Rule 1: Admin cannot block or deactivate themselves
    if target_user.id == current_admin.id and new_status in {"BLOCKED", "DEACTIVATED"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot block or deactivate their own account."
        )

    # Security Rule 2: Cannot block or deactivate the final active administrator
    if target_user.role == "ADMIN" and new_status in {"BLOCKED", "DEACTIVATED"}:
        active_admins_remaining = db.query(User).filter(
            User.role == "ADMIN",
            User.is_active == 1,
            User.is_blocked == 0,
            User.id != target_user.id
        ).count()
        if active_admins_remaining == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Action denied: Cannot block or deactivate the platform's last active administrator."
            )

    prev_status = "BLOCKED" if target_user.is_blocked else ("ACTIVE" if target_user.is_active else "DEACTIVATED")

    # If status didn't change, return
    if prev_status == new_status:
        return build_user_summary(target_user, db)

    action = "STATUS_UPDATE"
    reason = payload.reason.strip() if payload.reason else "Administrative status update"

    if new_status == "BLOCKED":
        action = "BLOCK_USER"
        target_user.is_blocked = 1
        target_user.blocked_reason = reason
        target_user.blocked_at = datetime.utcnow()
        target_user.blocked_by = current_admin.id
    elif new_status == "ACTIVE":
        action = "UNBLOCK_USER" if target_user.is_blocked else "REACTIVATE_USER"
        target_user.is_blocked = 0
        target_user.is_active = 1
        target_user.blocked_reason = None
        target_user.blocked_at = None
        target_user.blocked_by = None
    elif new_status == "DEACTIVATED":
        action = "DEACTIVATE_USER"
        target_user.is_active = 0
        target_user.is_blocked = 0

    target_user.updated_at = datetime.utcnow()

    # Create Audit Log entry
    audit_entry = AdminAuditLog(
        admin_user_id=current_admin.id,
        target_user_id=target_user.id,
        action=action,
        previous_value=prev_status,
        new_value=new_status,
        reason=reason,
        created_at=datetime.utcnow()
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(target_user)

    return build_user_summary(target_user, db)


# =========================================================
# 5. ROLE MANAGEMENT
# =========================================================

@router.patch("/users/{user_id}/role", response_model=AdminUserSummary)
def update_user_role(
    user_id: int,
    payload: AdminUserRoleUpdate,
    current_admin: User = Depends(require_roles("ADMIN")),
    db: Session = Depends(get_db)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    new_role = payload.role.strip().upper()
    if new_role not in ALLOWED_ROLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role '{payload.role}'. Allowed roles: {', '.join(sorted(ALLOWED_ROLES))}"
        )

    old_role = target_user.role

    # Security Rule: Administrators cannot modify their own role
    if current_admin.id == target_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Action denied: Administrators cannot modify their own role."
        )

    # Security Rule: If demoting an ADMIN, ensure at least one other active admin exists
    if old_role == "ADMIN" and new_role != "ADMIN":
        other_active_admins = db.query(User).filter(
            User.role == "ADMIN",
            User.is_active == 1,
            User.is_blocked == 0,
            User.id != target_user.id
        ).count()
        if other_active_admins == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Action denied: Cannot demote the platform's last active administrator."
            )

    target_user.role = new_role
    target_user.updated_at = datetime.utcnow()

    # Create Audit Log
    audit_entry = AdminAuditLog(
        admin_user_id=current_admin.id,
        target_user_id=target_user.id,
        action="CHANGE_ROLE",
        previous_value=old_role,
        new_value=new_role,
        reason=f"Role changed from {old_role} to {new_role}",
        created_at=datetime.utcnow()
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(target_user)

    return build_user_summary(target_user, db)


# =========================================================
# 6. SAFE DELETION / ACCOUNT TERMINATION
# =========================================================

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_admin: User = Depends(require_roles("ADMIN")),
    db: Session = Depends(get_db)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Security Rule 1: Admin cannot delete themselves
    if target_user.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot delete their own account."
        )

    # Security Rule 2: Cannot delete the last administrator
    if target_user.role == "ADMIN":
        other_admins = db.query(User).filter(
            User.role == "ADMIN",
            User.id != target_user.id
        ).count()
        if other_admins == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Action denied: Cannot delete the platform's last administrator."
            )

    # Soft deletion: deactivate, block, and preserve historical records
    target_user.is_active = 0
    target_user.is_blocked = 1
    target_user.blocked_reason = "Account terminated by administrator"
    target_user.blocked_at = datetime.utcnow()
    target_user.blocked_by = current_admin.id
    target_user.updated_at = datetime.utcnow()

    audit_entry = AdminAuditLog(
        admin_user_id=current_admin.id,
        target_user_id=target_user.id,
        action="DELETE_USER",
        previous_value="ACTIVE" if target_user.is_active else "INACTIVE",
        new_value="TERMINATED",
        reason="Account safely deactivated and access terminated by administrator",
        created_at=datetime.utcnow()
    )
    db.add(audit_entry)
    db.commit()

    return {
        "message": f"Account for {target_user.email} has been safely terminated and access revoked.",
        "user_id": target_user.id
    }


# =========================================================
# 7. READ-ONLY AUDIT LOG STREAM
# =========================================================

@router.get("/audit-logs", response_model=AdminAuditLogListResponse)
def get_audit_logs(
    action: Optional[str] = Query(None, description="Filter by action: BLOCK_USER, UNBLOCK_USER, CHANGE_ROLE, etc."),
    target_user_id: Optional[int] = Query(None, description="Filter by target user ID"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Page size"),
    current_admin: User = Depends(require_roles("ADMIN")),
    db: Session = Depends(get_db)
):
    query = db.query(AdminAuditLog)

    if action and action.strip() and action.strip().upper() != "ALL":
        query = query.filter(AdminAuditLog.action == action.strip().upper())

    if target_user_id is not None:
        query = query.filter(AdminAuditLog.target_user_id == target_user_id)

    total = query.count()
    total_pages = max(1, (total + page_size - 1) // page_size)
    offset = (page - 1) * page_size

    logs = query.order_by(desc(AdminAuditLog.created_at)).offset(offset).limit(page_size).all()

    log_responses = []
    for l in logs:
        admin_name = l.admin.full_name if l.admin else "System"
        admin_email = l.admin.email if l.admin else None
        target_name = l.target_user.full_name if l.target_user else "Unknown"
        target_email = l.target_user.email if l.target_user else None

        log_responses.append(
            AdminAuditLogResponse(
                id=l.id,
                admin_user_id=l.admin_user_id,
                admin_name=admin_name,
                admin_email=admin_email,
                target_user_id=l.target_user_id,
                target_user_name=target_name,
                target_user_email=target_email,
                action=l.action,
                previous_value=l.previous_value,
                new_value=l.new_value,
                reason=l.reason,
                created_at=l.created_at
            )
        )

    return AdminAuditLogListResponse(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        logs=log_responses
    )
