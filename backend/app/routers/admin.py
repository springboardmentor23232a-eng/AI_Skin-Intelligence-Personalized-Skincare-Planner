import json
import os
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, inspect, text

from ..database import get_db, engine
from ..config import settings
from ..models import (
    User, RoleName, Role, SkinAssessment, Appointment,
    ActivityLog, Product,
)
from ..schemas import (
    UserOut, RoleUpdate, ActiveStatusUpdate, AdminStats,
    ProductIn, ProductOut,
)
from ..auth import require_roles

router = APIRouter(prefix="/api/admin", tags=["admin"])
admin_only = require_roles(RoleName.admin)

BACKUP_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "backups")
os.makedirs(BACKUP_DIR, exist_ok=True)

# Static permission matrix backing the admin "Manage Permissions" screen.
ROLE_PERMISSIONS = {
    "user": ["view_own_profile", "run_skin_scan", "book_appointment", "message_provider", "download_own_reports"],
    "consultant": ["view_assigned_users", "view_ai_reports", "recommend_products", "message_user", "add_notes"],
    "dermatologist": ["view_assigned_patients", "view_ai_predictions", "add_diagnosis", "upload_prescription", "manage_treatment_plan"],
    "admin": ["manage_users", "manage_roles", "manage_products", "view_system_logs", "backup_database", "manage_permissions"],
}


# ---------- Users ----------

@router.get("/users", response_model=list[UserOut])
def manage_users(
    role: RoleName | None = None,
    current_user: User = Depends(admin_only),
    db: Session = Depends(get_db),
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.order_by(User.created_at.desc()).all()


@router.get("/consultants", response_model=list[UserOut])
def manage_consultants(current_user: User = Depends(admin_only), db: Session = Depends(get_db)):
    return db.query(User).filter(User.role == RoleName.consultant).all()


@router.get("/dermatologists", response_model=list[UserOut])
def manage_dermatologists(current_user: User = Depends(admin_only), db: Session = Depends(get_db)):
    return db.query(User).filter(User.role == RoleName.dermatologist).all()


@router.put("/users/{user_id}/role", response_model=UserOut)
def update_user_role(
    user_id: str,
    payload: RoleUpdate,
    current_user: User = Depends(admin_only),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = payload.role
    db.add(ActivityLog(user_id=current_user.id, action="role_change", details=f"{user_id} -> {payload.role.value}"))
    db.commit()
    db.refresh(user)
    return user


@router.put("/users/{user_id}/status", response_model=UserOut)
def update_user_status(
    user_id: str,
    payload: ActiveStatusUpdate,
    current_user: User = Depends(admin_only),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = payload.is_active
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=204)
def delete_user(
    user_id: str,
    current_user: User = Depends(admin_only),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        db.delete(user)
        db.commit()
    return None


# ---------- Roles ----------

@router.get("/roles")
def list_roles(current_user: User = Depends(admin_only), db: Session = Depends(get_db)):
    roles = db.query(Role).all()
    if not roles:
        # seed default role metadata on first access
        defaults = [
            Role(name="user", description="Skincare platform end user"),
            Role(name="consultant", description="Skincare consultant reviewing AI reports"),
            Role(name="dermatologist", description="Licensed dermatologist for medical diagnosis"),
            Role(name="admin", description="Platform administrator"),
        ]
        db.add_all(defaults)
        db.commit()
        roles = defaults
    return [{"id": r.id, "name": r.name, "description": r.description} for r in roles]


# ---------- Products ----------

@router.get("/products", response_model=list[ProductOut])
def list_products(current_user: User = Depends(admin_only), db: Session = Depends(get_db)):
    return db.query(Product).order_by(Product.created_at.desc()).all()


@router.post("/products", response_model=ProductOut, status_code=201)
def create_product(
    payload: ProductIn,
    current_user: User = Depends(admin_only),
    db: Session = Depends(get_db),
):
    product = Product(**payload.dict())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/products/{product_id}", response_model=ProductOut)
def update_product(
    product_id: str,
    payload: ProductIn,
    current_user: User = Depends(admin_only),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/products/{product_id}", status_code=204)
def delete_product(
    product_id: str,
    current_user: User = Depends(admin_only),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product:
        db.delete(product)
        db.commit()
    return None


# ---------- Analytics / AI logs / Reports ----------

@router.get("/analytics", response_model=AdminStats)
def dashboard_analytics(current_user: User = Depends(admin_only), db: Session = Depends(get_db)):
    total_users = db.query(User).filter(User.role == RoleName.user).count()
    total_consultants = db.query(User).filter(User.role == RoleName.consultant).count()
    total_dermatologists = db.query(User).filter(User.role == RoleName.dermatologist).count()
    total_assessments = db.query(SkinAssessment).count()
    total_appointments = db.query(Appointment).count()

    avg_health = db.query(func.avg(SkinAssessment.skin_health_score)).scalar() or 0.0
    avg_risk = db.query(func.avg(SkinAssessment.risk_score)).scalar() or 0.0

    return AdminStats(
        total_users=total_users,
        total_consultants=total_consultants,
        total_dermatologists=total_dermatologists,
        total_assessments=total_assessments,
        total_appointments=total_appointments,
        avg_skin_health_score=round(float(avg_health), 1),
        avg_risk_score=round(float(avg_risk), 1),
    )


@router.get("/ai-logs")
def ai_logs(
    limit: int = 50,
    current_user: User = Depends(admin_only),
    db: Session = Depends(get_db),
):
    logs = (
        db.query(ActivityLog)
        .filter(ActivityLog.action == "assessment_created")
        .order_by(ActivityLog.created_at.desc())
        .limit(limit)
        .all()
    )
    return [{"id": l.id, "user_id": l.user_id, "assessment_id": l.details, "created_at": l.created_at} for l in logs]


@router.get("/activity-logs")
def activity_logs(
    limit: int = 100,
    current_user: User = Depends(admin_only),
    db: Session = Depends(get_db),
):
    """Also serves as the 'System Logs' screen."""
    logs = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(limit).all()
    return [
        {"id": l.id, "user_id": l.user_id, "action": l.action, "details": l.details, "created_at": l.created_at}
        for l in logs
    ]


# ---------- Roles & Permissions ----------

@router.get("/permissions")
def list_permissions(current_user: User = Depends(admin_only)):
    """Static role -> permission matrix backing the admin 'Manage Permissions' screen."""
    return ROLE_PERMISSIONS


# ---------- Database Backup ----------

@router.post("/backup")
def create_backup(current_user: User = Depends(admin_only), db: Session = Depends(get_db)):
    """Dumps every table's rows to a timestamped JSON file (DB-engine agnostic)."""
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"backup_{timestamp}.json"
    path = os.path.join(BACKUP_DIR, filename)

    inspector = inspect(engine)
    dump = {}
    for table_name in inspector.get_table_names():
        rows = db.execute(text(f'SELECT * FROM "{table_name}"')).mappings().all()

        def _serialize(v):
            if isinstance(v, datetime):
                return v.isoformat()
            return v

        dump[table_name] = [{k: _serialize(v) for k, v in row.items()} for row in rows]

    with open(path, "w") as f:
        json.dump(dump, f, indent=2, default=str)

    db.add(ActivityLog(user_id=current_user.id, action="database_backup", details=filename))
    db.commit()

    return {"filename": filename, "created_at": timestamp, "tables": list(dump.keys())}


@router.get("/backups")
def list_backups(current_user: User = Depends(admin_only)):
    files = sorted(os.listdir(BACKUP_DIR), reverse=True)
    results = []
    for fname in files:
        fpath = os.path.join(BACKUP_DIR, fname)
        results.append({
            "filename": fname,
            "size_bytes": os.path.getsize(fpath),
            "created_at": datetime.utcfromtimestamp(os.path.getmtime(fpath)).isoformat(),
        })
    return results
