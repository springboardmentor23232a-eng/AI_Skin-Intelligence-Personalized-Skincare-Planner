from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import HTMLResponse, PlainTextResponse
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.schemas import (
    ReportGenerateRequest,
    ReportListResponse,
    ReportItem,
    ReportPDFExportResponse,
    CSVExportResponse
)
from app.services.report_service import (
    generate_clinical_report,
    get_user_reports_list,
    compile_printable_pdf_html,
    generate_csv_export
)
from app.models import GeneratedReport

router = APIRouter(tags=["Module 11: Reports & Export System"])

@router.post("/generate", response_model=ReportItem)
def generate_report(req: ReportGenerateRequest, db: Session = Depends(get_db)):
    """
    Generate a new structured clinical report of the requested type:
    - assessment: Skin Assessment Diagnostic Report
    - routine: Personalized Routine & Schedule Plan
    - product_recs: Formulation Compatibility & Product Recs
    - progress: 30-Day Longitudinal Progress & Adherence
    - skin_health: Executive Comprehensive Skin Health Dossier
    """
    return generate_clinical_report(
        db=db,
        user_id=req.user_id,
        report_type=req.report_type,
        format=req.format,
        title_override=req.title_override
    )

@router.get("/user/{user_id}", response_model=ReportListResponse)
def list_reports(user_id: int = 1, db: Session = Depends(get_db)):
    """
    List all generated reports for a user.
    """
    reports = get_user_reports_list(db, user_id)
    return {
        "success": True,
        "user_id": user_id,
        "total_reports": len(reports),
        "reports": reports
    }

@router.get("/{report_id}", response_model=ReportItem)
def get_report_detail(report_id: int, db: Session = Depends(get_db)):
    """
    Retrieve full details and JSON payload of a specific report.
    """
    rep = db.query(GeneratedReport).filter(GeneratedReport.id == report_id).first()
    if not rep:
        # Generate default fallback
        rep_dict = generate_clinical_report(db, 1, "skin_health", "pdf")
        return rep_dict
    
    return {
        "id": rep.id,
        "user_id": rep.user_id,
        "report_type": rep.report_type,
        "title": rep.title,
        "summary": rep.summary,
        "format": rep.format,
        "created_at": rep.created_at.isoformat() if rep.created_at else "",
        "report_data": rep.report_data
    }

@router.get("/{report_id}/pdf")
def export_report_pdf(report_id: int, db: Session = Depends(get_db)):
    """
    Return luxury printable clinical PDF HTML layout for preview and browser 1-click printing / PDF saving.
    """
    rep = db.query(GeneratedReport).filter(GeneratedReport.id == report_id).first()
    if not rep:
        rep_dict = generate_clinical_report(db, 1, "skin_health", "pdf")
    else:
        rep_dict = {
            "id": rep.id,
            "user_id": rep.user_id,
            "report_type": rep.report_type,
            "title": rep.title,
            "summary": rep.summary,
            "format": rep.format,
            "created_at": rep.created_at.strftime("%d %B %Y") if rep.created_at else "24 Nov 2025",
            "report_data": rep.report_data
        }
    
    html = compile_printable_pdf_html(rep_dict)
    return HTMLResponse(content=html, status_code=200)

@router.get("/export/{export_type}")
def export_csv_data(export_type: str = "progress"):
    """
    Export structured CSV file data:
    - progress: 30-day biomarker & adherence telemetry
    - routine_logs: daily AM/PM checklist compliance logs
    - products: curated product recommendations catalog
    - client_assessments: clinical patient records
    """
    res = generate_csv_export(export_type)
    headers = {
        "Content-Disposition": f"attachment; filename={res['filename']}",
        "Content-Type": "text/csv"
    }
    return Response(content=res["csv_content"], media_type="text/csv", headers=headers)
