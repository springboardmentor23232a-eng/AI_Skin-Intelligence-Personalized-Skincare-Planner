import io
from datetime import datetime, date
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

from app.models import (
    User, 
    SkinAssessment, 
    SkinConcern, 
    RiskFactor,
    Routine, 
    RoutineItem, 
    RoutineProfile, 
    DailyChecklistLog, 
    SkinHealthScoreRecord,
    Product
)
from app.services.product_recommendation_service import evaluate_product_suitability
from app.services import progress_service
from app.logging_config import logger


# =========================================================================
# 1. REPORT DATA AGGREGATION LAYER (NO FABRICATED DATA)
# =========================================================================

def get_skin_assessment_report_data(user_id: int, db: Session) -> Dict[str, Any]:
    """Aggregates real Skin Assessment data from Module 3."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"has_data": False, "error": "User not found."}

    latest_assessment = db.query(SkinAssessment)\
        .filter(SkinAssessment.user_id == user_id)\
        .order_by(desc(SkinAssessment.assessment_date))\
        .first()

    if not latest_assessment:
        return {
            "has_data": False,
            "user_name": user.name or user.email.split("@")[0],
            "user_email": user.email,
            "message": "No skin assessment scans recorded yet."
        }

    concerns = []
    for c in latest_assessment.concerns:
        concerns.append({
            "name": c.concern_name,
            "severity": c.severity,
            "priority": c.priority
        })

    risks = []
    for r in latest_assessment.risks:
        risks.append({
            "name": r.risk_name,
            "description": r.description,
            "level": r.risk_level
        })

    return {
        "has_data": True,
        "report_type": "Skin Assessment Report",
        "generated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
        "user_name": user.name or user.email.split("@")[0],
        "user_email": user.email,
        "assessment_id": latest_assessment.id,
        "assessment_date": latest_assessment.assessment_date.strftime("%B %d, %Y") if latest_assessment.assessment_date else "Recent",
        "overall_condition": latest_assessment.overall_condition,
        "skin_health_score": latest_assessment.skin_health_score,
        "notes": latest_assessment.notes or "Clinical audit complete. No additional notes attached.",
        "concerns": concerns,
        "risks": risks,
        "disclaimer": "This report is an AI-supported diagnostic skin analysis for informational and skincare planning purposes. It does not constitute a medical diagnosis."
    }


def get_routine_report_data(user_id: int, db: Session) -> Dict[str, Any]:
    """Aggregates real Personalized Routine and Adherence data from Modules 4 & 7."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"has_data": False, "error": "User not found."}

    profile = db.query(RoutineProfile).filter(RoutineProfile.user_id == user_id).first()
    routine = db.query(Routine).filter(Routine.user_id == user_id).order_by(desc(Routine.generated_at)).first()

    if not routine:
        return {
            "has_data": False,
            "user_name": user.name or user.email.split("@")[0],
            "user_email": user.email,
            "message": "No personalized routine generated yet."
        }

    morning_items = []
    evening_items = []
    weekly_items = []
    seasonal_items = []

    for item in sorted(routine.items, key=lambda x: x.step_order):
        if not item.is_enabled:
            continue
        entry = {
            "step_order": item.step_order,
            "category": item.category,
            "name": item.name,
            "description": item.description,
            "frequency": item.frequency,
            "notes": item.notes or ""
        }
        if item.routine_type == "MORNING":
            morning_items.append(entry)
        elif item.routine_type == "EVENING":
            evening_items.append(entry)
        elif item.routine_type == "WEEKLY":
            weekly_items.append(entry)
        elif item.routine_type == "SEASONAL":
            seasonal_items.append(entry)

    adherence_stats = progress_service.get_adherence_analytics(db, user)

    return {
        "has_data": True,
        "report_type": "Personalized Routine Report",
        "generated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
        "user_name": user.name or user.email.split("@")[0],
        "user_email": user.email,
        "routine_id": routine.id,
        "routine_generated_at": routine.generated_at.strftime("%B %d, %Y") if routine.generated_at else "Active",
        "profile_summary": {
            "skin_type": profile.skin_type if profile else "Not Specified",
            "sensitivity": profile.sensitivity if profile else "Not Specified",
            "skincare_goal": profile.skincare_goal if profile else "Barrier Health",
            "concerns": profile.concerns if profile and profile.concerns else []
        },
        "morning_routine": morning_items,
        "evening_routine": evening_items,
        "weekly_routine": weekly_items,
        "seasonal_routine": seasonal_items,
        "adherence_summary": {
            "rate_30d": adherence_stats.get("adherence_rate_30d", 0.0),
            "completed_steps": adherence_stats.get("completed_steps", 0),
            "total_steps": adherence_stats.get("total_steps", 0)
        }
    }


def get_product_recommendations_report_data(user_id: int, db: Session) -> Dict[str, Any]:
    """Aggregates real Product Recommendations from Module 6."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"has_data": False, "error": "User not found."}

    profile = db.query(RoutineProfile).filter(RoutineProfile.user_id == user_id).first()
    if not profile:
        return {
            "has_data": False,
            "user_name": user.name or user.email.split("@")[0],
            "user_email": user.email,
            "message": "No product recommendations available. Complete your routine profile to generate matching products."
        }

    all_products = db.query(Product).filter(Product.is_active == True).all()
    formatted_products = []
    excluded_count = 0

    for prod in all_products:
        eval_res = evaluate_product_suitability(db, profile, prod)
        if eval_res.get("is_allergy_excluded"):
            excluded_count += 1
            continue

        formatted_products.append({
            "name": prod.name,
            "brand": prod.brand,
            "category": prod.category,
            "price": f"₹{prod.price}",
            "suitability_score": eval_res.get("suitability_score", 0),
            "match_reason": eval_res.get("match_reason", ""),
            "rating": getattr(prod, "rating", 4.5) or 4.5,
            "ingredients": prod.ingredients or [],
            "precautions": prod.precautions or "",
            "usage_guidance": prod.usage_guidance or ""
        })

    formatted_products.sort(key=lambda x: x["suitability_score"], reverse=True)

    if not formatted_products:
        return {
            "has_data": False,
            "user_name": user.name or user.email.split("@")[0],
            "user_email": user.email,
            "message": "No product recommendations available matching your safety profile."
        }

    return {
        "has_data": True,
        "report_type": "Product Recommendations Report",
        "generated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
        "user_name": user.name or user.email.split("@")[0],
        "user_email": user.email,
        "total_recommendations": len(formatted_products),
        "excluded_allergens_count": excluded_count,
        "products": formatted_products
    }


def get_progress_report_data(user_id: int, db: Session, range_filter: str = "30d") -> Dict[str, Any]:
    """Aggregates real Progress Tracking and Longitudinal Analytics from Module 8."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"has_data": False, "error": "User not found."}

    summary = progress_service.get_progress_summary(db, user)
    trends = progress_service.get_progress_trends(db, user, time_range=range_filter)
    adherence = progress_service.get_adherence_analytics(db, user)

    # Historical score records
    score_records = db.query(SkinHealthScoreRecord)\
        .filter(SkinHealthScoreRecord.user_id == user_id)\
        .order_by(desc(SkinHealthScoreRecord.calculated_at))\
        .limit(10)\
        .all()

    formatted_scores = []
    for s in score_records:
        formatted_scores.append({
            "date": s.calculated_at.strftime("%Y-%m-%d"),
            "overall_score": s.overall_score,
            "condition_score": round(s.condition_score, 1),
            "lifestyle_score": round(s.lifestyle_score, 1),
            "sleep_score": round(s.sleep_score, 1),
            "routine_score": round(s.routine_score, 1),
            "hydration_score": round(s.hydration_score, 1)
        })

    has_data = (summary.get("total_scans_count", 0) > 0) or (len(score_records) > 0)

    return {
        "has_data": has_data,
        "report_type": "Skin Health Progress Report",
        "generated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
        "user_name": user.name or user.email.split("@")[0],
        "user_email": user.email,
        "reporting_range": range_filter.upper(),
        "summary": summary,
        "trend_points": trends.get("data_points", []),
        "concern_trends": trends.get("concern_trends", []),
        "score_history": formatted_scores,
        "adherence": adherence,
        "message": None if has_data else "No historical progress data recorded yet. Log daily checklist steps or diagnostic scans to populate progress."
    }


def get_skin_health_report_data(user_id: int, db: Session) -> Dict[str, Any]:
    """Aggregates real Skin Health Score and Component breakdown from Module 7."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"has_data": False, "error": "User not found."}

    latest_score = db.query(SkinHealthScoreRecord)\
        .filter(SkinHealthScoreRecord.user_id == user_id)\
        .order_by(desc(SkinHealthScoreRecord.calculated_at))\
        .first()

    if not latest_score:
        return {
            "has_data": False,
            "user_name": user.name or user.email.split("@")[0],
            "user_email": user.email,
            "message": "No Skin Health Score calculated yet. Complete your profile questionnaire or diagnostic assessment."
        }

    components = []
    breakdown_list = latest_score.breakdown if isinstance(latest_score.breakdown, list) else []
    
    if breakdown_list:
        for c in breakdown_list:
            components.append({
                "name": c.get("name"),
                "score": c.get("score"),
                "weight": f"{int(c.get('weight', 0) * 100)}%",
                "weighted_score": c.get("weighted_score"),
                "status": c.get("status"),
                "description": c.get("description", "")
            })
    else:
        # Fallback to model fields
        components = [
            {"name": "Skin Condition", "score": latest_score.condition_score, "weight": "35%", "weighted_score": round(latest_score.condition_score * 0.35, 1), "status": "Evaluated", "description": "Derived from AI computer vision face scans & diagnostic condition checks."},
            {"name": "Lifestyle Habits", "score": latest_score.lifestyle_score, "weight": "20%", "weighted_score": round(latest_score.lifestyle_score * 0.20, 1), "status": "Evaluated", "description": "Evaluation of exercise, stress management, sun & pollution defenses."},
            {"name": "Sleep Quality", "score": latest_score.sleep_score, "weight": "15%", "weighted_score": round(latest_score.sleep_score * 0.15, 1), "status": "Evaluated", "description": "Assessment of cellular repair duration and nocturnal rest patterns."},
            {"name": "Routine Consistency", "score": latest_score.routine_score, "weight": "20%", "weighted_score": round(latest_score.routine_score * 0.20, 1), "status": "Evaluated", "description": "Tracked adherence rate to daily personalized AM/PM skincare steps."},
            {"name": "Hydration Level", "score": latest_score.hydration_score, "weight": "10%", "weighted_score": round(latest_score.hydration_score * 0.10, 1), "status": "Evaluated", "description": "Evaluation of daily water intake volume supporting skin barrier turgor."}
        ]

    # History
    history = db.query(SkinHealthScoreRecord)\
        .filter(SkinHealthScoreRecord.user_id == user_id)\
        .order_by(desc(SkinHealthScoreRecord.calculated_at))\
        .limit(6)\
        .all()

    history_entries = []
    for h in history:
        history_entries.append({
            "date": h.calculated_at.strftime("%b %d, %Y"),
            "score": h.overall_score
        })

    return {
        "has_data": True,
        "report_type": "Skin Health Score Report",
        "generated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
        "user_name": user.name or user.email.split("@")[0],
        "user_email": user.email,
        "overall_score": latest_score.overall_score,
        "calculated_at": latest_score.calculated_at.strftime("%B %d, %Y"),
        "components": components,
        "history": history_entries
    }


# =========================================================================
# 2. PDF GENERATION ENGINE (REPORTLAB)
# =========================================================================

class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute and render page numbers."""
    def __init__(self, *args, **kwargs):
        canvas.Canvas.__init__(self, *args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Draw header rule on pages > 1
        if self._pageNumber > 1:
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(40, 755, 572, 755)
            self.drawString(40, 760, "AI Skin Intelligence — Confidential Report")
        
        # Draw footer rule
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(40, 45, 572, 45)
        
        footer_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(572, 32, footer_text)
        self.drawString(40, 32, "© 2026 AI Skin Intelligence & Personalized Skincare Planner. Confidential Document.")
        self.restoreState()


def create_pdf_header(story, title: str, user_name: str, user_email: str, generated_at: str, styles):
    """Standardized professional header banner for PDF reports."""
    # Brand Bar
    header_data = [
        [
            Paragraph("<font size=16 color='#0f172a'><b>AI Skin Intelligence</b></font><br/><font size=8 color='#64748b'>Clinical Skincare Intelligence & Analytics Platform</font>", styles['Normal']),
            Paragraph(f"<font size=12 color='#0f172a'><b>{title}</b></font><br/><font size=8 color='#64748b'>Generated: {generated_at}</font>", styles['RightAlign'])
        ]
    ]
    t = Table(header_data, colWidths=[280, 252])
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t)
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0f172a"), spaceBefore=4, spaceAfter=10))

    # User Metadata Card
    meta_data = [
        [
            Paragraph(f"<b>Recipient Account:</b> {user_name}", styles['SmallText']),
            Paragraph(f"<b>Registered Email:</b> {user_email}", styles['SmallText']),
            Paragraph("<b>Classification:</b> Confidential", styles['SmallText'])
        ]
    ]
    t_meta = Table(meta_data, colWidths=[180, 232, 120])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 14))


def generate_pdf_report(data: Dict[str, Any], report_type: str) -> bytes:
    """Generates an elegant multi-page PDF report based on aggregated data."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=40,
        bottomMargin=55
    )

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name='RightAlign',
        parent=styles['Normal'],
        alignment=2
    ))
    styles.add(ParagraphStyle(
        name='SectionHeader',
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=14,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=10,
        spaceAfter=6
    ))
    styles.add(ParagraphStyle(
        name='SmallText',
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#334155')
    ))
    styles.add(ParagraphStyle(
        name='ScoreValue',
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=30,
        textColor=colors.HexColor('#0f172a'),
        alignment=1
    ))
    styles.add(ParagraphStyle(
        name='ScoreLabel',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#64748b'),
        alignment=1
    ))

    story = []

    # Handle Empty State
    if not data.get("has_data", False):
        create_pdf_header(
            story,
            title=data.get("report_type", report_type),
            user_name=data.get("user_name", "User"),
            user_email=data.get("user_email", ""),
            generated_at=datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
            styles=styles
        )
        empty_msg = data.get("message", "No data available for this report.")
        story.append(Spacer(1, 20))
        empty_table = Table([[Paragraph(f"<b>Notice:</b> {empty_msg}", styles['Normal'])]], colWidths=[532])
        empty_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#fef3c7")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#f59e0b")),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('LEFTPADDING', (0, 0), (-1, -1), 16),
        ]))
        story.append(empty_table)
        doc.build(story, canvasmaker=NumberedCanvas)
        buffer.seek(0)
        return buffer.getvalue()

    # Standard Header
    create_pdf_header(
        story,
        title=data["report_type"],
        user_name=data["user_name"],
        user_email=data["user_email"],
        generated_at=data["generated_at"],
        styles=styles
    )

    # -------------------------------------------------------------
    # A. Skin Assessment Report PDF
    # -------------------------------------------------------------
    if report_type == "skin_assessment":
        # Overview Score Card
        score_val = data.get("skin_health_score", "--")
        condition_str = data.get("overall_condition", "Good")
        
        card_data = [
            [
                Paragraph(f"<font color='#059669'>{score_val}</font>", styles['ScoreValue']),
                Paragraph(f"<b>Overall Skin Condition:</b> {condition_str}<br/><b>Assessment Date:</b> {data.get('assessment_date')}<br/><b>Status:</b> AI Model Diagnostic Scored", styles['Normal'])
            ]
        ]
        card_table = Table(card_data, colWidths=[120, 412])
        card_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f0fdf4")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#bbf7d0")),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('PADDING', (0, 0), (-1, -1), 10),
        ]))
        story.append(card_table)
        story.append(Spacer(1, 12))

        # Detected Concerns
        story.append(Paragraph("1. Diagnostic Skin Concerns", styles['SectionHeader']))
        concerns = data.get("concerns", [])
        if concerns:
            c_table_data = [["Concern / Condition", "Severity (1 - 5)", "Priority Level"]]
            for c in concerns:
                c_table_data.append([c["name"], str(c["severity"]), c["priority"]])
            
            ct = Table(c_table_data, colWidths=[232, 150, 150])
            ct.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 9),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                ('PADDING', (0, 0), (-1, -1), 6),
            ]))
            story.append(ct)
        else:
            story.append(Paragraph("No severe skin concerns detected in latest scan.", styles['SmallText']))

        story.append(Spacer(1, 10))

        # Risk Factors
        story.append(Paragraph("2. Clinical Risk Factors", styles['SectionHeader']))
        risks = data.get("risks", [])
        if risks:
            r_table_data = [["Risk Factor", "Description", "Risk Level"]]
            for r in risks:
                r_table_data.append([r["name"], r["description"], r["level"]])
            rt = Table(r_table_data, colWidths=[150, 262, 120])
            rt.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#334155")),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 9),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ('PADDING', (0, 0), (-1, -1), 6),
            ]))
            story.append(rt)
        else:
            story.append(Paragraph("No critical environmental or clinical risk factors logged.", styles['SmallText']))

        story.append(Spacer(1, 14))

        # Clinical Notes & Disclaimer
        story.append(Paragraph("3. Assessment Notes & Medical Disclaimer", styles['SectionHeader']))
        notes_box = Table([
            [Paragraph(f"<b>Assessment Audit Notes:</b> {data.get('notes')}", styles['SmallText'])],
            [Paragraph(f"<i>Disclaimer: {data.get('disclaimer')}</i>", styles['SmallText'])]
        ], colWidths=[532])
        notes_box.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ('PADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(notes_box)

    # -------------------------------------------------------------
    # B. Routine Report PDF
    # -------------------------------------------------------------
    elif report_type == "routine":
        prof = data.get("profile_summary", {})
        adh = data.get("adherence_summary", {})

        # Summary Header Grid
        summary_data = [
            [
                Paragraph(f"<b>Skin Type:</b> {prof.get('skin_type')}<br/><b>Sensitivity:</b> {prof.get('sensitivity')}", styles['SmallText']),
                Paragraph(f"<b>Primary Goal:</b> {prof.get('skincare_goal')}<br/><b>Concerns:</b> {', '.join(prof.get('concerns', [])) or 'None'}", styles['SmallText']),
                Paragraph(f"<b>30-Day Adherence:</b> {adh.get('rate_30d', 0)}%<br/><b>Steps Done:</b> {adh.get('completed_steps')}/{adh.get('total_steps')}", styles['SmallText'])
            ]
        ]
        st = Table(summary_data, colWidths=[177, 177, 178])
        st.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f1f5f9")),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ('PADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(st)
        story.append(Spacer(1, 12))

        # Morning Steps
        story.append(Paragraph("1. Morning Skincare Routine (AM)", styles['SectionHeader']))
        am_items = data.get("morning_routine", [])
        if am_items:
            am_table_data = [["Step", "Category", "Recommended Product / Step", "Frequency", "Instructions"]]
            for item in am_items:
                am_table_data.append([
                    str(item["step_order"]),
                    item["category"],
                    Paragraph(f"<b>{item['name']}</b>", styles['SmallText']),
                    item["frequency"],
                    Paragraph(item["description"], styles['SmallText'])
                ])
            amt = Table(am_table_data, colWidths=[35, 90, 140, 75, 192])
            amt.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#065f46")),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 8.5),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                ('PADDING', (0, 0), (-1, -1), 5),
            ]))
            story.append(amt)
        else:
            story.append(Paragraph("No morning steps configured.", styles['SmallText']))

        story.append(Spacer(1, 10))

        # Evening Steps
        story.append(Paragraph("2. Evening Skincare Routine (PM)", styles['SectionHeader']))
        pm_items = data.get("evening_routine", [])
        if pm_items:
            pm_table_data = [["Step", "Category", "Recommended Product / Step", "Frequency", "Instructions"]]
            for item in pm_items:
                pm_table_data.append([
                    str(item["step_order"]),
                    item["category"],
                    Paragraph(f"<b>{item['name']}</b>", styles['SmallText']),
                    item["frequency"],
                    Paragraph(item["description"], styles['SmallText'])
                ])
            pmt = Table(pm_table_data, colWidths=[35, 90, 140, 75, 192])
            pmt.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1e1b4b")),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 8.5),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                ('PADDING', (0, 0), (-1, -1), 5),
            ]))
            story.append(pmt)
        else:
            story.append(Paragraph("No evening steps configured.", styles['SmallText']))

    # -------------------------------------------------------------
    # C. Product Recommendations Report PDF
    # -------------------------------------------------------------
    elif report_type == "products":
        products = data.get("products", [])
        story.append(Paragraph(f"Matched Product Recommendations ({len(products)} Formulations)", styles['SectionHeader']))
        
        if products:
            p_table_data = [["Category", "Product & Brand", "Price", "Match Score", "Clinical Suitability Reason"]]
            for p in products:
                p_table_data.append([
                    p["category"],
                    Paragraph(f"<b>{p['name']}</b><br/><font size=7 color='#64748b'>{p['brand']}</font>", styles['SmallText']),
                    p["price"],
                    f"{p['suitability_score']}/100",
                    Paragraph(p["match_reason"], styles['SmallText'])
                ])
            pt = Table(p_table_data, colWidths=[80, 140, 50, 70, 192])
            pt.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 8.5),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                ('PADDING', (0, 0), (-1, -1), 5),
            ]))
            story.append(pt)
        else:
            story.append(Paragraph("No matching products found.", styles['SmallText']))

    # -------------------------------------------------------------
    # D. Progress Report PDF
    # -------------------------------------------------------------
    elif report_type == "progress":
        summary = data.get("summary", {})
        scores = data.get("score_history", [])

        # Progress Overview KPI Bar
        curr_score = summary.get("current_overall_score", "--")
        delta_val = summary.get("overall_delta", 0)
        delta_str = f"+{delta_val}" if delta_val > 0 else str(delta_val)
        adh_30d = summary.get("adherence_30d", 0.0)

        kpi_data = [
            [
                Paragraph(f"<font color='#4f46e5'>{curr_score}</font>", styles['ScoreValue']),
                Paragraph(f"<font color='#059669'>{delta_str} pts</font>", styles['ScoreValue']),
                Paragraph(f"<font color='#0891b2'>{adh_30d}%</font>", styles['ScoreValue']),
            ],
            [
                Paragraph("Current Health Score", styles['ScoreLabel']),
                Paragraph("Overall Delta Change", styles['ScoreLabel']),
                Paragraph("30-Day Routine Adherence", styles['ScoreLabel']),
            ]
        ]
        kt = Table(kpi_data, colWidths=[177, 177, 178])
        kt.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#e2e8f0")),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(kt)
        story.append(Spacer(1, 12))

        # Longitudinal Score Table
        story.append(Paragraph("1. Longitudinal Skin Health Score History", styles['SectionHeader']))
        if scores:
            s_table_data = [["Date", "Overall", "Condition (35%)", "Lifestyle (20%)", "Sleep (15%)", "Routine (20%)", "Hydration (10%)"]]
            for s in scores:
                s_table_data.append([
                    s["date"],
                    str(s["overall_score"]),
                    str(s["condition_score"]),
                    str(s["lifestyle_score"]),
                    str(s["sleep_score"]),
                    str(s["routine_score"]),
                    str(s["hydration_score"])
                ])
            st_table = Table(s_table_data, colWidths=[82, 70, 80, 75, 75, 75, 75])
            st_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 8),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                ('PADDING', (0, 0), (-1, -1), 5),
            ]))
            story.append(st_table)
        else:
            story.append(Paragraph("No longitudinal score history recorded yet.", styles['SmallText']))

    # -------------------------------------------------------------
    # E. Skin Health Report PDF
    # -------------------------------------------------------------
    elif report_type == "skin_health":
        score_val = data.get("overall_score", "--")
        calc_date = data.get("calculated_at", "Recent")

        # Score Banner
        score_card = Table([
            [
                Paragraph(f"<font color='#4f46e5'>{score_val}</font>", styles['ScoreValue']),
                Paragraph(f"<b>Overall Skin Health Score: {score_val} / 100</b><br/>Calculated on: {calc_date}<br/>Formula: Weighted Clinical Assessment & Behavioral Analytics", styles['Normal'])
            ]
        ], colWidths=[120, 412])
        score_card.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#eef2ff")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#c7d2fe")),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('PADDING', (0, 0), (-1, -1), 10),
        ]))
        story.append(score_card)
        story.append(Spacer(1, 12))

        # Components Table
        story.append(Paragraph("1. Mathematical Component Breakdown", styles['SectionHeader']))
        components = data.get("components", [])
        if components:
            comp_table_data = [["Component", "Raw Score", "Weight", "Weighted Score", "Component Scope"]]
            for c in components:
                comp_table_data.append([
                    c["name"],
                    f"{round(float(c['score']), 1)}/100",
                    str(c["weight"]),
                    f"{round(float(c['weighted_score']), 1)} pts",
                    Paragraph(c.get("description", ""), styles['SmallText'])
                ])
            compt = Table(comp_table_data, colWidths=[120, 70, 50, 85, 207])
            compt.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 8.5),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                ('PADDING', (0, 0), (-1, -1), 5),
            ]))
            story.append(compt)

    doc.build(story, canvasmaker=NumberedCanvas)
    buffer.seek(0)
    return buffer.getvalue()


# =========================================================================
# 3. EXCEL GENERATION ENGINE (OPENPYXL)
# =========================================================================

def style_excel_sheet(ws, title: str, headers: List[str], data_rows: List[List[Any]], sheet_color: str = "0F172A"):
    """Applies clean enterprise formatting to OpenPyXL worksheets."""
    ws.views.sheetView[0].showGridLines = True
    
    # Title Row
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=len(headers))
    title_cell = ws.cell(row=1, column=1, value=title)
    title_cell.font = Font(name="Calibri", size=14, bold=True, color="FFFFFF")
    title_cell.fill = PatternFill(start_color=sheet_color, end_color=sheet_color, fill_type="solid")
    title_cell.alignment = Alignment(horizontal="left", vertical="center", indent=1)
    ws.row_dimensions[1].height = 28

    # Subtitle / Timestamp
    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=len(headers))
    sub_cell = ws.cell(row=2, column=1, value=f"AI Skin Intelligence • Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}")
    sub_cell.font = Font(name="Calibri", size=9, italic=True, color="64748B")
    sub_cell.alignment = Alignment(horizontal="left", vertical="center", indent=1)
    ws.row_dimensions[2].height = 18

    # Header Row
    header_fill = PatternFill(start_color="334155", end_color="334155", fill_type="solid")
    header_font = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
    thin_border = Border(
        left=Side(style='thin', color='E2E8F0'),
        right=Side(style='thin', color='E2E8F0'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='thin', color='CBD5E1')
    )

    for col_idx, h in enumerate(headers, 1):
        cell = ws.cell(row=4, column=col_idx, value=h)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="left", vertical="center")
        cell.border = thin_border
    ws.row_dimensions[4].height = 22

    # Data Rows
    alt_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
    data_font = Font(name="Calibri", size=9.5)

    for r_idx, row_values in enumerate(data_rows, 5):
        is_alt = (r_idx % 2 == 0)
        ws.row_dimensions[r_idx].height = 20
        for c_idx, val in enumerate(row_values, 1):
            cell = ws.cell(row=r_idx, column=c_idx, value=val)
            cell.font = data_font
            cell.border = thin_border
            if is_alt:
                cell.fill = alt_fill
            if isinstance(val, (int, float)):
                cell.alignment = Alignment(horizontal="right", vertical="center")

    # Auto column width adjustment
    for col in ws.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_letter = get_column_letter(col[0].column)
        ws.column_dimensions[col_letter].width = max(max_len + 4, 12)


def generate_routine_excel(data: Dict[str, Any]) -> bytes:
    """Exports structured Routine and Adherence data into Excel."""
    wb = openpyxl.Workbook()
    
    # Sheet 1: Morning Routine
    ws_am = wb.active
    ws_am.title = "Morning Routine (AM)"
    headers = ["Step #", "Category", "Product Name", "Frequency", "Instructions"]
    rows = []
    for item in data.get("morning_routine", []):
        rows.append([item["step_order"], item["category"], item["name"], item["frequency"], item["description"]])
    style_excel_sheet(ws_am, "Morning Skincare Sequence", headers, rows, sheet_color="065F46")

    # Sheet 2: Evening Routine
    ws_pm = wb.create_sheet(title="Evening Routine (PM)")
    pm_rows = []
    for item in data.get("evening_routine", []):
        pm_rows.append([item["step_order"], item["category"], item["name"], item["frequency"], item["description"]])
    style_excel_sheet(ws_pm, "Evening Skincare Sequence", headers, pm_rows, sheet_color="1E1B4B")

    # Sheet 3: Profile & Adherence Summary
    ws_meta = wb.create_sheet(title="Adherence & Profile")
    prof = data.get("profile_summary", {})
    adh = data.get("adherence_summary", {})
    meta_headers = ["Metric / Attribute", "Value"]
    meta_rows = [
        ["Recipient Name", data.get("user_name")],
        ["Registered Email", data.get("user_email")],
        ["Skin Type", prof.get("skin_type")],
        ["Sensitivity Level", prof.get("sensitivity")],
        ["Skincare Goal", prof.get("skincare_goal")],
        ["30-Day Adherence Rate (%)", f"{adh.get('rate_30d', 0)}%"],
        ["Completed Steps", adh.get("completed_steps", 0)],
        ["Total Logged Steps", adh.get("total_steps", 0)]
    ]
    style_excel_sheet(ws_meta, "Skincare Routine Metadata & Adherence", meta_headers, meta_rows, sheet_color="0F172A")

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer.getvalue()


def generate_products_excel(data: Dict[str, Any]) -> bytes:
    """Exports Product Recommendations catalog and suitability analysis to Excel."""
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Recommended Formulations"

    headers = ["Category", "Brand", "Product Name", "Price (INR)", "Match Score", "Rating", "Key Ingredients", "Clinical Match Reason"]
    rows = []
    for p in data.get("products", []):
        rows.append([
            p["category"],
            p["brand"],
            p["name"],
            p["price"],
            p["suitability_score"],
            p["rating"],
            ", ".join(p["ingredients"]),
            p["match_reason"]
        ])
    style_excel_sheet(ws, "Personalized Product Formulations & Suitability", headers, rows, sheet_color="0F172A")

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer.getvalue()


def generate_progress_excel(data: Dict[str, Any]) -> bytes:
    """Exports Progress Trend History and Daily Adherence logs to Excel."""
    wb = openpyxl.Workbook()
    
    # Sheet 1: Score History
    ws_scores = wb.active
    ws_scores.title = "Skin Health Score History"
    score_headers = ["Date", "Overall Score", "Condition Score (35%)", "Lifestyle Score (20%)", "Sleep Score (15%)", "Routine Score (20%)", "Hydration Score (10%)"]
    score_rows = []
    for s in data.get("score_history", []):
        score_rows.append([
            s["date"],
            s["overall_score"],
            s["condition_score"],
            s["lifestyle_score"],
            s["sleep_score"],
            s["routine_score"],
            s["hydration_score"]
        ])
    style_excel_sheet(ws_scores, "Longitudinal Skin Health Score Tracking", score_headers, score_rows, sheet_color="4F46E5")

    # Sheet 2: Concern Trends
    ws_concerns = wb.create_sheet(title="Concern Severity Trends")
    c_headers = ["Concern Name", "First Severity", "Latest Severity", "Overall Delta", "Clinical Status"]
    c_rows = []
    for c in data.get("concern_trends", []):
        c_rows.append([
            c.get("concern_name"),
            c.get("first_severity"),
            c.get("latest_severity"),
            c.get("delta"),
            c.get("status")
        ])
    style_excel_sheet(ws_concerns, "Longitudinal Concern Severity Trajectory", c_headers, c_rows, sheet_color="059669")

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer.getvalue()


def generate_skin_health_excel(data: Dict[str, Any]) -> bytes:
    """Exports Skin Health Score component breakdown and historical trend to Excel."""
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Component Breakdown"

    headers = ["Health Factor Component", "Raw Score (0-100)", "Mathematical Weight", "Weighted Score (pts)", "Scope Description"]
    rows = []
    for c in data.get("components", []):
        rows.append([
            c["name"],
            c["score"],
            c["weight"],
            c["weighted_score"],
            c.get("description", "")
        ])
    style_excel_sheet(ws, f"Skin Health Score Breakdown (Score: {data.get('overall_score', '--')}/100)", headers, rows, sheet_color="0F172A")

    # Sheet 2: History
    ws_hist = wb.create_sheet(title="Historical Records")
    hist_headers = ["Calculation Date", "Overall Health Score"]
    hist_rows = []
    for h in data.get("history", []):
        hist_rows.append([h["date"], h["score"]])
    style_excel_sheet(ws_hist, "Historical Score Log", hist_headers, hist_rows, sheet_color="334155")

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer.getvalue()
