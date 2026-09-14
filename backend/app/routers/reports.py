from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.dependencies.auth import get_current_user
from app.services import report_service
from app.logging_config import logger

router = APIRouter(prefix="/api/reports", tags=["Reports & Export System"])


def resolve_target_user(current_user: User, user_id: Optional[int], db: Session) -> User:
    """
    Enforces RBAC and data ownership for report generation.
    - Standard USER can only generate/view reports for themselves.
    - CONSULTANT, DOCTOR/DERMATOLOGIST, and ADMIN can generate reports for valid clients/patients.
    """
    if user_id is None or user_id == current_user.id:
        return current_user

    allowed_roles = {"CONSULTANT", "DOCTOR", "DERMATOLOGIST", "ADMIN"}
    if current_user.role not in allowed_roles:
        logger.warning(f"Unauthorized report access attempt: user {current_user.id} ({current_user.role}) attempted to access user {user_id}'s report")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You can only view your own reports."
        )

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target client/patient with ID {user_id} was not found."
        )

    # Practitioners should only access client/patient records with role USER
    if current_user.role in {"CONSULTANT", "DOCTOR", "DERMATOLOGIST"} and target_user.role != "USER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Practitioners can only access client/patient reports."
        )

    return target_user


# =========================================================================
# 1. REPORT DATA / PREVIEW ENDPOINTS (JSON)
# =========================================================================

@router.get("/skin-assessment")
async def get_skin_assessment_report_preview(
    user_id: Optional[int] = Query(None, description="Target client/patient ID (practitioners/admin only)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves real Skin Assessment report data for preview."""
    target_user = resolve_target_user(current_user, user_id, db)
    logger.info(f"Report Preview: skin-assessment for user {target_user.id} requested by {current_user.email}")
    return report_service.get_skin_assessment_report_data(target_user.id, db)


@router.get("/routine")
async def get_routine_report_preview(
    user_id: Optional[int] = Query(None, description="Target client/patient ID (practitioners/admin only)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves real Routine & Adherence report data for preview."""
    target_user = resolve_target_user(current_user, user_id, db)
    logger.info(f"Report Preview: routine for user {target_user.id} requested by {current_user.email}")
    return report_service.get_routine_report_data(target_user.id, db)


@router.get("/products")
async def get_product_recommendations_report_preview(
    user_id: Optional[int] = Query(None, description="Target client/patient ID (practitioners/admin only)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves real Product Recommendations report data for preview."""
    target_user = resolve_target_user(current_user, user_id, db)
    logger.info(f"Report Preview: products for user {target_user.id} requested by {current_user.email}")
    return report_service.get_product_recommendations_report_data(target_user.id, db)


@router.get("/progress")
async def get_progress_report_preview(
    user_id: Optional[int] = Query(None, description="Target client/patient ID (practitioners/admin only)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves real Progress Tracking report data for preview."""
    target_user = resolve_target_user(current_user, user_id, db)
    logger.info(f"Report Preview: progress for user {target_user.id} requested by {current_user.email}")
    return report_service.get_progress_report_data(target_user.id, db)


@router.get("/skin-health")
async def get_skin_health_report_preview(
    user_id: Optional[int] = Query(None, description="Target client/patient ID (practitioners/admin only)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves real Skin Health Score report data for preview."""
    target_user = resolve_target_user(current_user, user_id, db)
    logger.info(f"Report Preview: skin-health for user {target_user.id} requested by {current_user.email}")
    return report_service.get_skin_health_report_data(target_user.id, db)


# =========================================================================
# 2. PDF EXPORT ENDPOINTS
# =========================================================================

@router.get("/skin-assessment/export/pdf")
async def export_skin_assessment_pdf(
    user_id: Optional[int] = Query(None, description="Target client/patient ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generates and exports professional Skin Assessment PDF report."""
    target_user = resolve_target_user(current_user, user_id, db)
    data = report_service.get_skin_assessment_report_data(target_user.id, db)
    pdf_bytes = report_service.generate_pdf_report(data, report_type="skin_assessment")
    
    date_str = datetime.utcnow().strftime("%Y-%m-%d")
    filename = f"skin_assessment_report_{target_user.id}_{date_str}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@router.get("/routine/export/pdf")
async def export_routine_pdf(
    user_id: Optional[int] = Query(None, description="Target client/patient ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generates and exports professional Skincare Routine PDF report."""
    target_user = resolve_target_user(current_user, user_id, db)
    data = report_service.get_routine_report_data(target_user.id, db)
    pdf_bytes = report_service.generate_pdf_report(data, report_type="routine")
    
    date_str = datetime.utcnow().strftime("%Y-%m-%d")
    filename = f"routine_report_{target_user.id}_{date_str}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@router.get("/products/export/pdf")
async def export_products_pdf(
    user_id: Optional[int] = Query(None, description="Target client/patient ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generates and exports Product Recommendations PDF report."""
    target_user = resolve_target_user(current_user, user_id, db)
    data = report_service.get_product_recommendations_report_data(target_user.id, db)
    pdf_bytes = report_service.generate_pdf_report(data, report_type="products")
    
    date_str = datetime.utcnow().strftime("%Y-%m-%d")
    filename = f"product_recommendations_report_{target_user.id}_{date_str}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@router.get("/progress/export/pdf")
async def export_progress_pdf(
    user_id: Optional[int] = Query(None, description="Target client/patient ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generates and exports Progress Tracking & Analytics PDF report."""
    target_user = resolve_target_user(current_user, user_id, db)
    data = report_service.get_progress_report_data(target_user.id, db)
    pdf_bytes = report_service.generate_pdf_report(data, report_type="progress")
    
    date_str = datetime.utcnow().strftime("%Y-%m-%d")
    filename = f"progress_report_{target_user.id}_{date_str}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@router.get("/skin-health/export/pdf")
async def export_skin_health_pdf(
    user_id: Optional[int] = Query(None, description="Target client/patient ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generates and exports Skin Health Score Diagnostic PDF report."""
    target_user = resolve_target_user(current_user, user_id, db)
    data = report_service.get_skin_health_report_data(target_user.id, db)
    pdf_bytes = report_service.generate_pdf_report(data, report_type="skin_health")
    
    date_str = datetime.utcnow().strftime("%Y-%m-%d")
    filename = f"skin_health_report_{target_user.id}_{date_str}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


# =========================================================================
# 3. EXCEL EXPORT ENDPOINTS (WHERE STRUCTURED / TABULAR)
# =========================================================================

@router.get("/routine/export/excel")
async def export_routine_excel(
    user_id: Optional[int] = Query(None, description="Target client/patient ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Exports structured AM/PM routines and adherence logs to Excel."""
    target_user = resolve_target_user(current_user, user_id, db)
    data = report_service.get_routine_report_data(target_user.id, db)
    excel_bytes = report_service.generate_routine_excel(data)
    
    date_str = datetime.utcnow().strftime("%Y-%m-%d")
    filename = f"routine_report_{target_user.id}_{date_str}.xlsx"
    
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@router.get("/products/export/excel")
async def export_products_excel(
    user_id: Optional[int] = Query(None, description="Target client/patient ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Exports structured product recommendation catalogue & suitability criteria to Excel."""
    target_user = resolve_target_user(current_user, user_id, db)
    data = report_service.get_product_recommendations_report_data(target_user.id, db)
    excel_bytes = report_service.generate_products_excel(data)
    
    date_str = datetime.utcnow().strftime("%Y-%m-%d")
    filename = f"product_recommendations_{target_user.id}_{date_str}.xlsx"
    
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@router.get("/progress/export/excel")
async def export_progress_excel(
    user_id: Optional[int] = Query(None, description="Target client/patient ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Exports longitudinal progress trends and concern history to multi-sheet Excel."""
    target_user = resolve_target_user(current_user, user_id, db)
    data = report_service.get_progress_report_data(target_user.id, db)
    excel_bytes = report_service.generate_progress_excel(data)
    
    date_str = datetime.utcnow().strftime("%Y-%m-%d")
    filename = f"progress_report_{target_user.id}_{date_str}.xlsx"
    
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )


@router.get("/skin-health/export/excel")
async def export_skin_health_excel(
    user_id: Optional[int] = Query(None, description="Target client/patient ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Exports Skin Health Score mathematical component weights and logs to Excel."""
    target_user = resolve_target_user(current_user, user_id, db)
    data = report_service.get_skin_health_report_data(target_user.id, db)
    excel_bytes = report_service.generate_skin_health_excel(data)
    
    date_str = datetime.utcnow().strftime("%Y-%m-%d")
    filename = f"skin_health_report_{target_user.id}_{date_str}.xlsx"
    
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
