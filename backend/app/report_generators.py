"""
Module 11 Phase 3 - PDF Report Generation
Professional PDF generation for all report types using ReportLab.
"""

import io
from datetime import datetime
from typing import Optional, Dict, Any, List

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.platypus.tableofcontents import TableOfContents


def _create_pdf_doc(buffer: io.BytesIO, title: str) -> SimpleDocTemplate:
    """Create a PDF document with standard formatting."""
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=18
    )
    return doc


def _get_styles():
    """Get standard PDF styles."""
    styles = getSampleStyleSheet()
    
    # Custom styles
    styles.add(ParagraphStyle(
        name='CustomTitle',
        parent=styles['Title'],
        fontSize=18,
        spaceAfter=30,
        textColor=colors.HexColor('#2563eb')
    ))
    
    styles.add(ParagraphStyle(
        name='SectionHeader',
        parent=styles['Heading2'],
        fontSize=14,
        spaceAfter=12,
        textColor=colors.HexColor('#1f2937')
    ))
    
    styles.add(ParagraphStyle(
        name='SubHeader',
        parent=styles['Heading3'],
        fontSize=12,
        spaceAfter=8,
        textColor=colors.HexColor('#374151')
    ))
    
    return styles


def _add_header(story: List, report_title: str):
    """Add standard header to PDF."""
    styles = _get_styles()
    
    # App title
    app_title = "AI Skin Intelligence & Personalized Skincare Planner"
    story.append(Paragraph(app_title, styles['CustomTitle']))
    
    # Report title
    story.append(Paragraph(report_title, styles['SectionHeader']))
    
    # Generated date
    generated_date = f"Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}"
    story.append(Paragraph(generated_date, styles['Normal']))
    story.append(Spacer(1, 20))


def _add_no_data_message(story: List, message: str = "No data is currently available for this report."):
    """Add no data message to PDF."""
    styles = _get_styles()
    story.append(Paragraph(message, styles['Normal']))


def _safe_value(value: Any) -> str:
    """Convert any value to a ReportLab-safe string representation."""
    if value is None:
        return ""
    elif isinstance(value, str):
        return value
    elif isinstance(value, (int, float)):
        return str(value)
    elif isinstance(value, bool):
        return "Yes" if value else "No"
    elif isinstance(value, (list, tuple)):
        if not value:
            return ""
        items = []
        for item in value:
            if isinstance(item, dict):
                items.append("[Complex data]")
            elif isinstance(item, (list, tuple)):
                items.append(f"[{len(item)} items]")
            else:
                items.append(str(item))
        if len(items) > 5:
            return f"{len(items)} items total"
        return ", ".join(items)
    elif isinstance(value, dict):
        if not value:
            return ""
        parts = []
        for k, v in list(value.items())[:3]:
            key_name = str(k).replace('_', ' ').title()
            val_str = _safe_value(v) if not isinstance(v, dict) else "[nested]"
            parts.append(f"{key_name}: {val_str}")
        if len(value) > 3:
            return "; ".join(parts) + f"; ... and {len(value) - 3} more"
        return "; ".join(parts)
    else:
        try:
            return str(value)
        except:
            return "[unrenderable]"


def generate_assessment_pdf(assessment_data: Optional[Dict[str, Any]]) -> io.BytesIO:
    """Generate Assessment Report PDF."""
    buffer = io.BytesIO()
    doc = _create_pdf_doc(buffer, "Skin Assessment Report")
    story = []
    styles = _get_styles()
    
    _add_header(story, "Skin Assessment Report")
    
    if not assessment_data:
        _add_no_data_message(story, "No assessment data is currently available.")
    else:
        # Assessment Date
        if assessment_data.get('assessment_time'):
            story.append(Paragraph("Assessment Information", styles['SectionHeader']))
            story.append(Paragraph(f"<b>Assessment Date:</b> {assessment_data['assessment_time']}", styles['Normal']))
            story.append(Spacer(1, 12))
        
        # Skin Type
        if assessment_data.get('predicted_skin_type'):
            story.append(Paragraph("Skin Analysis", styles['SectionHeader']))
            story.append(Paragraph(f"<b>Predicted Skin Type:</b> {assessment_data['predicted_skin_type']}", styles['Normal']))
        
        # Health Score
        if assessment_data.get('health_score') is not None:
            story.append(Paragraph(f"<b>Health Score:</b> {assessment_data['health_score']}", styles['Normal']))
        
        # Overall Condition
        if assessment_data.get('overall_condition'):
            story.append(Paragraph(f"<b>Overall Condition:</b> {assessment_data['overall_condition']}", styles['Normal']))
        
        story.append(Spacer(1, 12))
        
        # Skin Properties
        skin_properties = assessment_data.get('skin_properties', {})
        if skin_properties:
            story.append(Paragraph("Skin Properties", styles['SectionHeader']))
            if skin_properties.get('sensitivity'):
                story.append(Paragraph(f"<b>Sensitivity:</b> {skin_properties['sensitivity']}", styles['Normal']))
            story.append(Spacer(1, 12))
        
        # Concerns
        concerns = assessment_data.get('concerns')
        if concerns:
            story.append(Paragraph("Identified Concerns", styles['SectionHeader']))
            if isinstance(concerns, list):
                for concern in concerns:
                    concern_text = _safe_value(concern)
                    story.append(Paragraph(f"• {concern_text}", styles['Normal']))
            else:
                story.append(Paragraph(f"• {_safe_value(concerns)}", styles['Normal']))
            story.append(Spacer(1, 12))
        
        # Vision Predicted Concern
        if assessment_data.get('vision_predicted_concern'):
            story.append(Paragraph("AI Vision Analysis", styles['SectionHeader']))
            story.append(Paragraph(f"<b>Detected Concern:</b> {assessment_data['vision_predicted_concern']}", styles['Normal']))
            story.append(Spacer(1, 12))
        
        # Recommendations
        recommendations = assessment_data.get('recommendations')
        if recommendations:
            story.append(Paragraph("Recommendations", styles['SectionHeader']))
            if isinstance(recommendations, list):
                for rec in recommendations:
                    rec_text = _safe_value(rec)
                    story.append(Paragraph(f"• {rec_text}", styles['Normal']))
            else:
                story.append(Paragraph(_safe_value(recommendations), styles['Normal']))
    
    doc.build(story)
    buffer.seek(0)
    return buffer


def generate_routine_pdf(routine_data: Optional[Dict[str, Any]]) -> io.BytesIO:
    """Generate Routine Report PDF."""
    buffer = io.BytesIO()
    doc = _create_pdf_doc(buffer, "Routine Report")
    story = []
    styles = _get_styles()
    
    _add_header(story, "Skincare Routine Report")
    
    if not routine_data:
        _add_no_data_message(story, "No routine data is currently available.")
    else:
        routine = routine_data.get('routine', {})
        
        # Morning Routine
        morning_routine = routine.get('morning_routine', [])
        if morning_routine:
            story.append(Paragraph("Morning Routine", styles['SectionHeader']))
            
            # Create table data
            table_data = [['Step', 'Product/Action', 'Category']]
            for i, step in enumerate(morning_routine, 1):
                name = step.get('name', 'N/A')
                category = step.get('category', 'N/A')
                table_data.append([str(i), name, category])
            
            # Create table
            table = Table(table_data, colWidths=[0.5*inch, 3*inch, 1.5*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(table)
            story.append(Spacer(1, 20))
        
        # Evening Routine
        evening_routine = routine.get('evening_routine', [])
        if evening_routine:
            story.append(Paragraph("Evening Routine", styles['SectionHeader']))
            
            # Create table data
            table_data = [['Step', 'Product/Action', 'Category']]
            for i, step in enumerate(evening_routine, 1):
                name = step.get('name', 'N/A')
                category = step.get('category', 'N/A')
                table_data.append([str(i), name, category])
            
            # Create table
            table = Table(table_data, colWidths=[0.5*inch, 3*inch, 1.5*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(table)
            story.append(Spacer(1, 20))
        
        # Adherence Summary
        adherence_summary = routine_data.get('adherence_summary', {})
        if adherence_summary:
            story.append(Paragraph("Adherence Summary", styles['SectionHeader']))
            
            total_logs = adherence_summary.get('total_logs', 0)
            avg_adherence = adherence_summary.get('average_adherence', 0)
            
            story.append(Paragraph(f"<b>Total Routine Logs:</b> {total_logs}", styles['Normal']))
            story.append(Paragraph(f"<b>Average Adherence:</b> {avg_adherence}%", styles['Normal']))
    
    doc.build(story)
    buffer.seek(0)
    return buffer


def generate_product_pdf(product_data: Optional[Dict[str, Any]]) -> io.BytesIO:
    """Generate Product Recommendation Report PDF."""
    buffer = io.BytesIO()
    doc = _create_pdf_doc(buffer, "Product Recommendation Report")
    story = []
    styles = _get_styles()
    
    _add_header(story, "Product Recommendation Report")
    
    if not product_data:
        _add_no_data_message(story, "No product data is currently available.")
    else:
        # User Profile
        user_profile = product_data.get('user_profile', {})
        if user_profile:
            story.append(Paragraph("User Profile", styles['SectionHeader']))
            
            if user_profile.get('skin_type'):
                story.append(Paragraph(f"<b>Skin Type:</b> {user_profile['skin_type']}", styles['Normal']))
            
            if user_profile.get('sensitivity'):
                story.append(Paragraph(f"<b>Sensitivity:</b> {user_profile['sensitivity']}", styles['Normal']))
            
            concerns = user_profile.get('concerns', [])
            if concerns:
                story.append(Paragraph("<b>Primary Concerns:</b>", styles['Normal']))
                for concern in concerns:
                    story.append(Paragraph(f"• {concern}", styles['Normal']))
            
            story.append(Spacer(1, 20))
        
        # Purchase Summary
        purchase_summary = product_data.get('purchase_summary', {})
        if purchase_summary:
            story.append(Paragraph("Purchase Summary", styles['SectionHeader']))
            total_purchases = purchase_summary.get('total_purchases', 0)
            story.append(Paragraph(f"<b>Total Purchases:</b> {total_purchases}", styles['Normal']))
            story.append(Spacer(1, 12))
        
        # Purchase History
        purchase_history = product_data.get('purchase_history', [])
        if purchase_history:
            story.append(Paragraph("Purchase History", styles['SectionHeader']))
            
            # Create table
            table_data = [['Product Name', 'Purchase Date', 'Quantity']]
            for purchase in purchase_history[:10]:  # Limit to recent 10
                name = purchase.get('product_name', 'N/A')
                date = purchase.get('purchase_date', 'N/A')
                quantity = purchase.get('quantity', 'N/A')
                table_data.append([name, str(date), str(quantity)])
            
            if len(table_data) > 1:
                table = Table(table_data, colWidths=[3*inch, 1.5*inch, 1*inch])
                table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black)
                ]))
                story.append(table)
    
    doc.build(story)
    buffer.seek(0)
    return buffer


def generate_progress_pdf(progress_data: Optional[Dict[str, Any]]) -> io.BytesIO:
    """Generate Progress Report PDF."""
    buffer = io.BytesIO()
    doc = _create_pdf_doc(buffer, "Progress Report")
    story = []
    styles = _get_styles()
    
    _add_header(story, "Progress Report")
    
    if not progress_data:
        _add_no_data_message(story, "No progress data is currently available.")
    else:
        # Assessment Summary
        assessment_summary = progress_data.get('assessment_summary', {})
        if assessment_summary:
            story.append(Paragraph("Assessment Progress", styles['SectionHeader']))
            
            total_assessments = assessment_summary.get('total_assessments', 0)
            first_score = assessment_summary.get('first_score', 0)
            latest_score = assessment_summary.get('latest_score', 0)
            score_change = assessment_summary.get('score_change', 0)
            
            story.append(Paragraph(f"<b>Total Assessments:</b> {total_assessments}", styles['Normal']))
            story.append(Paragraph(f"<b>First Score:</b> {first_score}", styles['Normal']))
            story.append(Paragraph(f"<b>Latest Score:</b> {latest_score}", styles['Normal']))
            story.append(Paragraph(f"<b>Score Change:</b> {score_change:+.1f}", styles['Normal']))
            story.append(Spacer(1, 12))
        
        # Adherence Summary
        adherence_summary = progress_data.get('adherence_summary', {})
        if adherence_summary:
            story.append(Paragraph("Routine Adherence", styles['SectionHeader']))
            
            total_logs = adherence_summary.get('total_logs', 0)
            avg_adherence = adherence_summary.get('average_adherence', 0)
            
            story.append(Paragraph(f"<b>Total Routine Logs:</b> {total_logs}", styles['Normal']))
            story.append(Paragraph(f"<b>Average Adherence:</b> {avg_adherence}%", styles['Normal']))
            story.append(Spacer(1, 12))
        
        # Hydration Summary
        hydration_summary = progress_data.get('hydration_summary', {})
        if hydration_summary:
            story.append(Paragraph("Hydration Tracking", styles['SectionHeader']))
            
            total_logs = hydration_summary.get('total_logs', 0)
            avg_glasses = hydration_summary.get('average_glasses', 0)
            
            story.append(Paragraph(f"<b>Total Hydration Logs:</b> {total_logs}", styles['Normal']))
            story.append(Paragraph(f"<b>Average Daily Glasses:</b> {avg_glasses}", styles['Normal']))
            story.append(Spacer(1, 12))
        
        # Sleep Summary
        sleep_summary = progress_data.get('sleep_summary', {})
        if sleep_summary:
            story.append(Paragraph("Sleep Tracking", styles['SectionHeader']))
            
            total_logs = sleep_summary.get('total_logs', 0)
            avg_hours = sleep_summary.get('average_hours', 0)
            
            story.append(Paragraph(f"<b>Total Sleep Logs:</b> {total_logs}", styles['Normal']))
            story.append(Paragraph(f"<b>Average Sleep Hours:</b> {avg_hours}", styles['Normal']))
    
    doc.build(story)
    buffer.seek(0)
    return buffer


def generate_skin_health_pdf(health_data: Optional[Dict[str, Any]]) -> io.BytesIO:
    """Generate Skin Health Report PDF."""
    buffer = io.BytesIO()
    doc = _create_pdf_doc(buffer, "Skin Health Report")
    story = []
    styles = _get_styles()
    
    _add_header(story, "Comprehensive Skin Health Report")
    
    if not health_data:
        _add_no_data_message(story, "No skin health data is currently available.")
    else:
        # Overall Score
        overall_score = health_data.get('overall_score', 0)
        category = health_data.get('category', 'Unknown')
        
        story.append(Paragraph("Overall Skin Health", styles['SectionHeader']))
        story.append(Paragraph(f"<b>Overall Score:</b> {overall_score}", styles['Normal']))
        story.append(Paragraph(f"<b>Health Category:</b> {category}", styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Factor Scores
        factor_scores = health_data.get('factor_scores', {})
        if factor_scores:
            story.append(Paragraph("Health Factor Breakdown", styles['SectionHeader']))
            
            # Create table for factor scores
            table_data = [['Health Factor', 'Score']]
            for factor, score in factor_scores.items():
                factor_name = factor.replace('_', ' ').title()
                table_data.append([factor_name, str(score)])
            
            table = Table(table_data, colWidths=[3*inch, 1*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(table)
            story.append(Spacer(1, 20))
        
        # Assessment Summary
        assessment_summary = health_data.get('assessment_summary', {})
        if assessment_summary:
            story.append(Paragraph("Latest Assessment Summary", styles['SectionHeader']))
            
            if assessment_summary.get('predicted_skin_type'):
                story.append(Paragraph(f"<b>Skin Type:</b> {assessment_summary['predicted_skin_type']}", styles['Normal']))
            
            if assessment_summary.get('overall_condition'):
                story.append(Paragraph(f"<b>Overall Condition:</b> {assessment_summary['overall_condition']}", styles['Normal']))
            
            story.append(Spacer(1, 12))
        
        # Routine Adherence
        routine_adherence = health_data.get('routine_adherence', {})
        if routine_adherence:
            story.append(Paragraph("Routine Adherence", styles['SectionHeader']))
            
            avg_percentage = routine_adherence.get('average_percentage', 0)
            total_logs = routine_adherence.get('total_logs', 0)
            
            story.append(Paragraph(f"<b>Average Adherence:</b> {avg_percentage}%", styles['Normal']))
            story.append(Paragraph(f"<b>Total Routine Logs:</b> {total_logs}", styles['Normal']))
            story.append(Spacer(1, 12))
        
        # Hydration
        hydration = health_data.get('hydration', {})
        if hydration:
            story.append(Paragraph("Hydration Tracking", styles['SectionHeader']))
            
            avg_glasses = hydration.get('average_glasses', 0)
            total_logs = hydration.get('total_logs', 0)
            
            story.append(Paragraph(f"<b>Average Daily Glasses:</b> {avg_glasses}", styles['Normal']))
            story.append(Paragraph(f"<b>Total Hydration Logs:</b> {total_logs}", styles['Normal']))
            story.append(Spacer(1, 12))
        
        # Sleep
        sleep = health_data.get('sleep', {})
        if sleep:
            story.append(Paragraph("Sleep Tracking", styles['SectionHeader']))
            
            avg_hours = sleep.get('average_hours', 0)
            total_logs = sleep.get('total_logs', 0)
            
            story.append(Paragraph(f"<b>Average Sleep Hours:</b> {avg_hours}", styles['Normal']))
            story.append(Paragraph(f"<b>Total Sleep Logs:</b> {total_logs}", styles['Normal']))
            story.append(Spacer(1, 12))
        
        # Recommendations
        recommendations = health_data.get('recommendations')
        if recommendations:
            story.append(Paragraph("Recommendations", styles['SectionHeader']))
            
            if isinstance(recommendations, list):
                for rec in recommendations:
                    story.append(Paragraph(f"• {_safe_value(rec)}", styles['Normal']))
            else:
                story.append(Paragraph(_safe_value(recommendations), styles['Normal']))
    
    doc.build(story)
    buffer.seek(0)
    return buffer