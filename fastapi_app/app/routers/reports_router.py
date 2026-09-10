from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
import io

from app.engine.report_engine import SkincareReportEngine

router = APIRouter(prefix="/reports", tags=["Module 11: Reports & Export System"])

@router.get("/assessment", summary="Get Skin Assessment Report")
def get_assessment_report(
    user_name: str = Query("Akash Prajapati", description="User Full Name"),
    export: str = Query(None, description="Set to 'pdf' or 'excel' for direct download")
):
    report_data = SkincareReportEngine.get_skin_assessment_report(user_name)
    if export == "pdf":
        pdf_bytes = SkincareReportEngine.generate_pdf("assessment", report_data)
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=Skin_Assessment_Report_{report_data['report_id']}.pdf"}
        )
    elif export == "excel":
        excel_bytes = SkincareReportEngine.generate_excel("assessment", report_data)
        return StreamingResponse(
            io.BytesIO(excel_bytes),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=Skin_Assessment_Report_{report_data['report_id']}.xlsx"}
        )
    return report_data

@router.get("/routine", summary="Get Routine Plan Report")
def get_routine_report(
    user_name: str = Query("Akash Prajapati", description="User Full Name"),
    export: str = Query(None, description="Set to 'pdf' or 'excel' for direct download")
):
    report_data = SkincareReportEngine.get_routine_report(user_name)
    if export == "pdf":
        pdf_bytes = SkincareReportEngine.generate_pdf("routine", report_data)
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=Routine_Plan_Report_{report_data['report_id']}.pdf"}
        )
    elif export == "excel":
        excel_bytes = SkincareReportEngine.generate_excel("routine", report_data)
        return StreamingResponse(
            io.BytesIO(excel_bytes),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=Routine_Plan_Report_{report_data['report_id']}.xlsx"}
        )
    return report_data

@router.get("/products", summary="Get Product Recommendation Report")
def get_product_recommendations_report(
    user_name: str = Query("Akash Prajapati", description="User Full Name"),
    export: str = Query(None, description="Set to 'pdf' or 'excel' for direct download")
):
    report_data = SkincareReportEngine.get_product_recommendation_report(user_name)
    if export == "pdf":
        pdf_bytes = SkincareReportEngine.generate_pdf("products", report_data)
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=Product_Recommendations_Report_{report_data['report_id']}.pdf"}
        )
    elif export == "excel":
        excel_bytes = SkincareReportEngine.generate_excel("products", report_data)
        return StreamingResponse(
            io.BytesIO(excel_bytes),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=Product_Recommendations_Report_{report_data['report_id']}.xlsx"}
        )
    return report_data

@router.get("/progress", summary="Get Progress Tracking Report")
def get_progress_report(
    user_name: str = Query("Akash Prajapati", description="User Full Name"),
    export: str = Query(None, description="Set to 'pdf' or 'excel' for direct download")
):
    report_data = SkincareReportEngine.get_progress_report(user_name)
    if export == "pdf":
        pdf_bytes = SkincareReportEngine.generate_pdf("progress", report_data)
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=Progress_Report_{report_data['report_id']}.pdf"}
        )
    elif export == "excel":
        excel_bytes = SkincareReportEngine.generate_excel("progress", report_data)
        return StreamingResponse(
            io.BytesIO(excel_bytes),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=Progress_Report_{report_data['report_id']}.xlsx"}
        )
    return report_data

@router.get("/health", summary="Get 360° Skin Health Report")
def get_skin_health_report(
    user_name: str = Query("Akash Prajapati", description="User Full Name"),
    export: str = Query(None, description="Set to 'pdf' or 'excel' for direct download")
):
    report_data = SkincareReportEngine.get_skin_health_report(user_name)
    if export == "pdf":
        pdf_bytes = SkincareReportEngine.generate_pdf("health", report_data)
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=Skin_Health_Report_{report_data['report_id']}.pdf"}
        )
    elif export == "excel":
        excel_bytes = SkincareReportEngine.generate_excel("health", report_data)
        return StreamingResponse(
            io.BytesIO(excel_bytes),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=Skin_Health_Report_{report_data['report_id']}.xlsx"}
        )
    return report_data

@router.get("/export/pdf", summary="Direct PDF Export by Type")
def download_pdf_export(
    type: str = Query("assessment", description="Report Type: assessment, routine, products, progress, health"),
    user_name: str = Query("Akash Prajapati")
):
    report_type = type.lower()
    if report_type == "routine":
        data = SkincareReportEngine.get_routine_report(user_name)
    elif report_type == "products":
        data = SkincareReportEngine.get_product_recommendation_report(user_name)
    elif report_type == "progress":
        data = SkincareReportEngine.get_progress_report(user_name)
    elif report_type == "health":
        data = SkincareReportEngine.get_skin_health_report(user_name)
    else:
        data = SkincareReportEngine.get_skin_assessment_report(user_name)

    pdf_bytes = SkincareReportEngine.generate_pdf(report_type, data)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Skincare_{type.title()}_Report_{data.get('report_id', 'export')}.pdf"}
    )

@router.get("/export/excel", summary="Direct Excel Export by Type")
def download_excel_export(
    type: str = Query("assessment", description="Report Type: assessment, routine, products, progress, health"),
    user_name: str = Query("Akash Prajapati")
):
    report_type = type.lower()
    if report_type == "routine":
        data = SkincareReportEngine.get_routine_report(user_name)
    elif report_type == "products":
        data = SkincareReportEngine.get_product_recommendation_report(user_name)
    elif report_type == "progress":
        data = SkincareReportEngine.get_progress_report(user_name)
    elif report_type == "health":
        data = SkincareReportEngine.get_skin_health_report(user_name)
    else:
        data = SkincareReportEngine.get_skin_assessment_report(user_name)

    excel_bytes = SkincareReportEngine.generate_excel(report_type, data)
    return StreamingResponse(
        io.BytesIO(excel_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=Skincare_{type.title()}_Report_{data.get('report_id', 'export')}.xlsx"}
    )
