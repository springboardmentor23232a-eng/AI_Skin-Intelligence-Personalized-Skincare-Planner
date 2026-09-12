from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field


class AdminUserSummary(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    provider: str
    is_active: bool
    is_blocked: bool
    is_verified: bool
    blocked_reason: Optional[str] = None
    blocked_at: Optional[datetime] = None
    blocked_by: Optional[int] = None
    last_login_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    assessment_count: int = 0
    routine_count: int = 0
    consultation_count: int = 0

    class Config:
        from_attributes = True


class AdminUserListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    users: List[AdminUserSummary]


class AdminUserDetail(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    provider: str
    is_active: bool
    is_blocked: bool
    is_verified: bool
    blocked_reason: Optional[str] = None
    blocked_at: Optional[datetime] = None
    blocked_by: Optional[int] = None
    blocked_by_name: Optional[str] = None
    last_login_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    profile: Optional[Dict[str, Any]] = None
    assessments_count: int = 0
    recent_assessments: List[Dict[str, Any]] = []
    routines_count: int = 0
    routines: List[Dict[str, Any]] = []
    consultations_count: int = 0
    consultations: List[Dict[str, Any]] = []
    audit_trail: List[Dict[str, Any]] = []

    class Config:
        from_attributes = True


class AdminUserStatusUpdate(BaseModel):
    status: str = Field(..., description="Target status: ACTIVE, BLOCKED, or DEACTIVATED")
    reason: Optional[str] = Field(None, description="Optional explanation or suspension reason")


class AdminUserRoleUpdate(BaseModel):
    role: str = Field(..., description="Target role: USER, SKINCARE_CONSULTANT, DERMATOLOGIST, or ADMIN")


class AdminAuditLogResponse(BaseModel):
    id: int
    admin_user_id: Optional[int] = None
    admin_name: Optional[str] = None
    admin_email: Optional[str] = None
    target_user_id: Optional[int] = None
    target_user_name: Optional[str] = None
    target_user_email: Optional[str] = None
    action: str
    previous_value: Optional[str] = None
    new_value: Optional[str] = None
    reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AdminAuditLogListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    logs: List[AdminAuditLogResponse]


class AdminStatsResponse(BaseModel):
    total_users: int
    total_consultants: int
    total_dermatologists: int
    total_administrators: int
    active_accounts: int
    blocked_accounts: int
    deactivated_accounts: int
    total_assessments: int
    total_routines: int
    total_recommendations: int
    total_consultations: int
    total_reviews: int
    total_notifications: int
    total_audit_logs: int
    system_status: str
    timestamp: datetime
