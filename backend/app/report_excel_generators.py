"""
Module 11 Phase 4 - Excel Report Generation
Professional Excel generation for all report types using openpyxl.
"""

import io
from datetime import datetime, date
from typing import Optional, Dict, Any, List, Union

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils.dataframe import dataframe_to_rows
from openpyxl.worksheet.worksheet import Worksheet


def _excel_safe_value(value: Any) -> Union[str, int, float, bool, None]:
    """
    Convert any value to an Excel-safe scalar value.
    
    Args:
        value: Any value that might be written to an Excel cell
        
    Returns:
        Excel-compatible scalar value (str, int, float, bool, or None)
    """
    if value is None:
        return ""
    
    # Already Excel-compatible types
    if isinstance(value, (str, int, float, bool)):
        return value
    
    # Date/datetime objects
    if isinstance(value, (datetime, date)):
        return value
    
    # List/tuple - convert to readable multiline text
    if isinstance(value, (list, tuple)):
        if not value:
            return ""
        
        # Convert each item safely
        safe_items = []
        for item in value:
            if isinstance(item, dict):
                # For dict items in lists, show key-value pairs
                dict_text = []
                for k, v in item.items():
                    dict_text.append(f"{k}: {_excel_safe_value(v)}")
                safe_items.append("; ".join(dict_text))
            else:
                safe_items.append(str(_excel_safe_value(item)))
        
        return "\n".join(safe_items)
    
    # Dictionary - convert to readable key-value text
    if isinstance(value, dict):
        if not value:
            return ""
        
        dict_lines = []
        for key, val in value.items():
            safe_val = _excel_safe_value(val)
            if isinstance(val, (list, dict)) and safe_val:
                # Multi-line value, indent it
                indented_val = "\n".join(f"  {line}" for line in str(safe_val).split("\n") if line.strip())
                dict_lines.append(f"{key}:\n{indented_val}")
            else:
                dict_lines.append(f"{key}: {safe_val}")
        
        return "\n".join(dict_lines)
    
    # Everything else - convert to string
    return str(value)


def _safe_cell_write(ws: Worksheet, row: int, col: int, value: Any) -> None:
    """
    Safely write a value to an Excel cell, converting complex types as needed.
    
    Args:
        ws: The worksheet
        row: Row number (1-indexed)
        col: Column number (1-indexed)  
        value: The value to write
    """
    safe_value = _excel_safe_value(value)
    ws.cell(row=row, column=col, value=safe_value)


def _create_workbook(title: str) -> Workbook:
    """Create a new Excel workbook with standard formatting."""
    wb = Workbook()
    ws = wb.active
    ws.title = "Report"
    return wb


def _add_header(ws: Worksheet, report_title: str):
    """Add standard header to Excel worksheet."""
    # App title
    ws['A1'] = "AI Skin Intelligence & Personalized Skincare Planner"
    ws['A1'].font = Font(size=14, bold=True)
    
    # Report title
    ws['A2'] = report_title
    ws['A2'].font = Font(size=12, bold=True)
    
    # Generated date
    ws['A3'] = f"Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}"
    ws['A3'].font = Font(size=10)
    
    # Add spacing
    return 5  # Starting row for content


def _format_header_row(ws: Worksheet, row: int, num_cols: int):
    """Format a header row with styling."""
    header_fill = PatternFill(start_color="366092", end_color="366092", fill_type="solid")
    header_font = Font(color="FFFFFF", bold=True)
    
    for col in range(1, num_cols + 1):
        cell = ws.cell(row=row, column=col)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="left")


def _auto_size_columns(ws: Worksheet):
    """Auto-size columns to fit content."""
    for column in ws.columns:
        max_length = 0
        column_letter = column[0].column_letter
        
        for cell in column:
            try:
                if len(str(cell.value)) > max_length:
                    max_length = len(str(cell.value))
            except:
                pass
        
        adjusted_width = min(max_length + 2, 50)  # Cap at 50 characters
        ws.column_dimensions[column_letter].width = adjusted_width


def _add_no_data_message(ws: Worksheet, start_row: int, message: str = "No data is currently available for this report."):
    """Add no data message to Excel worksheet."""
    ws.cell(row=start_row, column=1, value=message)
    ws.cell(row=start_row, column=1).font = Font(italic=True)


def generate_assessment_excel(assessment_data: Optional[Dict[str, Any]]) -> io.BytesIO:
    """Generate Assessment Report Excel."""
    wb = _create_workbook("Skin Assessment Report")
    ws = wb.active
    
    current_row = _add_header(ws, "Skin Assessment Report")
    
    if not assessment_data:
        _add_no_data_message(ws, current_row)
    else:
        # Assessment Information
        ws.cell(row=current_row, column=1, value="Assessment Information")
        ws.cell(row=current_row, column=1).font = Font(size=12, bold=True)
        current_row += 1
        
        if assessment_data.get('assessment_time'):
            ws.cell(row=current_row, column=1, value="Assessment Date:")
            _safe_cell_write(ws, current_row, 2, assessment_data['assessment_time'])
            current_row += 1
        
        # Skin Analysis
        current_row += 1
        ws.cell(row=current_row, column=1, value="Skin Analysis")
        ws.cell(row=current_row, column=1).font = Font(size=12, bold=True)
        current_row += 1
        
        if assessment_data.get('predicted_skin_type'):
            ws.cell(row=current_row, column=1, value="Predicted Skin Type:")
            _safe_cell_write(ws, current_row, 2, assessment_data['predicted_skin_type'])
            current_row += 1
        
        if assessment_data.get('health_score') is not None:
            ws.cell(row=current_row, column=1, value="Health Score:")
            _safe_cell_write(ws, current_row, 2, assessment_data['health_score'])
            current_row += 1
        
        if assessment_data.get('overall_condition'):
            ws.cell(row=current_row, column=1, value="Overall Condition:")
            _safe_cell_write(ws, current_row, 2, assessment_data['overall_condition'])
            current_row += 1
        
        # Skin Properties
        skin_properties = assessment_data.get('skin_properties', {})
        if skin_properties:
            current_row += 1
            ws.cell(row=current_row, column=1, value="Skin Properties")
            ws.cell(row=current_row, column=1).font = Font(size=12, bold=True)
            current_row += 1
            
            if skin_properties.get('sensitivity'):
                ws.cell(row=current_row, column=1, value="Sensitivity:")
                _safe_cell_write(ws, current_row, 2, skin_properties['sensitivity'])
                current_row += 1
        
        # Concerns
        concerns = assessment_data.get('concerns')
        if concerns:
            current_row += 1
            ws.cell(row=current_row, column=1, value="Identified Concerns")
            ws.cell(row=current_row, column=1).font = Font(size=12, bold=True)
            current_row += 1
            
            ws.cell(row=current_row, column=1, value="Concerns:")
            _safe_cell_write(ws, current_row, 2, concerns)
            current_row += 1
        
        # Vision Analysis
        if assessment_data.get('vision_predicted_concern'):
            current_row += 1
            ws.cell(row=current_row, column=1, value="AI Vision Analysis")
            ws.cell(row=current_row, column=1).font = Font(size=12, bold=True)
            current_row += 1
            
            ws.cell(row=current_row, column=1, value="Detected Concern:")
            _safe_cell_write(ws, current_row, 2, assessment_data['vision_predicted_concern'])
            current_row += 1
        
        # Recommendations
        recommendations = assessment_data.get('recommendations')
        if recommendations:
            current_row += 1
            ws.cell(row=current_row, column=1, value="Recommendations")
            ws.cell(row=current_row, column=1).font = Font(size=12, bold=True)
            current_row += 1
            
            ws.cell(row=current_row, column=1, value="Recommendations:")
            _safe_cell_write(ws, current_row, 2, recommendations)
            current_row += 1
    
    _auto_size_columns(ws)
    
    # Save to BytesIO
    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer


def generate_routine_excel(routine_data: Optional[Dict[str, Any]]) -> io.BytesIO:
    """Generate Routine Report Excel."""
    wb = _create_workbook("Skincare Routine Report")
    ws = wb.active
    
    current_row = _add_header(ws, "Skincare Routine Report")
    
    if not routine_data:
        _add_no_data_message(ws, current_row)
    else:
        routine = routine_data.get('routine', {})
        
        # Morning Routine
        morning_routine = routine.get('morning_routine', [])
        if morning_routine:
            ws.cell(row=current_row, column=1, value="Morning Routine")
            ws.cell(row=current_row, column=1).font = Font(size=12, bold=True)
            current_row += 2
            
            # Headers
            ws.cell(row=current_row, column=1, value="Step")
            ws.cell(row=current_row, column=2, value="Product/Action")
            ws.cell(row=current_row, column=3, value="Category")
            _format_header_row(ws, current_row, 3)
            current_row += 1
            
            # Data
            for i, step in enumerate(morning_routine, 1):
                ws.cell(row=current_row, column=1, value=i)
                _safe_cell_write(ws, current_row, 2, step.get('name', 'N/A'))
                _safe_cell_write(ws, current_row, 3, step.get('category', 'N/A'))
                current_row += 1
            
            current_row += 1
        
        # Evening Routine
        evening_routine = routine.get('evening_routine', [])
        if evening_routine:
            ws.cell(row=current_row, column=1, value="Evening Routine")
            ws.cell(row=current_row, column=1).font = Font(size=12, bold=True)
            current_row += 2
            
            # Headers
            ws.cell(row=current_row, column=1, value="Step")
            ws.cell(row=current_row, column=2, value="Product/Action")
            ws.cell(row=current_row, column=3, value="Category")
            _format_header_row(ws, current_row, 3)
            current_row += 1
            
            # Data
            for i, step in enumerate(evening_routine, 1):
                ws.cell(row=current_row, column=1, value=i)
                _safe_cell_write(ws, current_row, 2, step.get('name', 'N/A'))
                _safe_cell_write(ws, current_row, 3, step.get('category', 'N/A'))
                current_row += 1
            
            current_row += 1
        
        # Adherence Summary
        adherence_summary = routine_data.get('adherence_summary', {})
        if adherence_summary:
            ws.cell(row=current_row, column=1, value="Adherence Summary")
            ws.cell(row=current_row, column=1).font = Font(size=12, bold=True)
            current_row += 1
            
            total_logs = adherence_summary.get('total_logs', 0)
            avg_adherence = adherence_summary.get('average_adherence', 0)
            
            ws.cell(row=current_row, column=1, value="Total Routine Logs:")
            _safe_cell_write(ws, current_row, 2, total_logs)
            current_row += 1
            
            ws.cell(row=current_row, column=1, value="Average Adherence:")
            _safe_cell_write(ws, current_row, 2, f"{avg_adherence}%")
            current_row += 1
    
    _auto_size_columns(ws)
    
    # Save to BytesIO
    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer


def generate_product_excel(product_data: Optional[Dict[str, Any]]) -> io.BytesIO:
    """Generate Product Recommendation Report Excel."""
    wb = _create_workbook("Product Recommendation Report")
    ws = wb.active
    
    current_row = _add_header(ws, "Product Recommendation Report")
    
    if not product_data:
        _add_no_data_message(ws, current_row)
    else:
        # User Profile
        user_profile = product_data.get('user_profile', {})
        if user_profile:
            ws.cell(row=current_row, column=1, value="User Profile")
            ws.cell(row=current_row, column=1).font = Font(size=12, bold=True)
            current_row += 1
            
            if user_profile.get('skin_type'):
                ws.cell(row=current_row, column=1, value="Skin Type:")
                _safe_cell_write(ws, current_row, 2, user_profile['skin_type'])
                current_row += 1
            
            if user_profile.get('sensitivity'):
                ws.cell(row=current_row, column=1, value="Sensitivity:")
                _safe_cell_write(ws, current_row, 2, user_profile['sensitivity'])
                current_row += 1
            
            concerns = user_profile.get('concerns', [])
            if concerns:
                ws.cell(row=current_row, column=1, value="Primary Concerns:")
                _safe_cell_write(ws, current_row, 2, concerns)
                current_row += 1
            
            current_row += 1
        
        # Purchase Summary
        purchase_summary = product_data.get('purchase_summary', {})
        if purchase_summary:
            ws.cell(row=current_row, column=1, value="Purchase Summary")
            ws.cell(row=current_row, column=1).font = Font(size=12, bold=True)
            current_row += 1
            
            total_purchases = purchase_summary.get('total_purchases', 0)
            ws.cell(row=current_row, column=1, value="Total Purchases:")
            _safe_cell_write(ws, current_row, 2, total_purchases)
            current_row += 2
        
        # Purchase History
        purchase_history = product_data.get('purchase_history', [])
        if purchase_history:
            ws.cell(row=current_row, column=1, value="Purchase History")
            ws.cell(row=current_row, column=1).font = Font(size=12, bold=True)
            current_row += 2
            
            # Headers
            ws.cell(row=current_row, column=1, value="Product Name")
            ws.cell(row=current_row, column=2, value="Purchase Date")
            ws.cell(row=current_row, column=3, value="Quantity")
            _format_header_row(ws, current_row, 3)
            current_row += 1
            
            # Data (limit to recent 50 entries)
            for purchase in purchase_history[:50]:
                _safe_cell_write(ws, current_row, 1, purchase.get('product_name', 'N/A'))
                _safe_cell_write(ws, current_row, 2, purchase.get('purchase_date', 'N/A'))
                _safe_cell_write(ws, current_row, 3, purchase.get('quantity', 'N/A'))
                current_row += 1
    
    _auto_size_columns(ws)
    
    # Save to BytesIO
    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer


def generate_progress_excel(progress_data: Optional[Dict[str, Any]]) -> io.BytesIO:
    """Generate Progress Report Excel."""
    wb = _create_workbook("Progress Report")
    ws = wb.active
    
    current_row = _add_header(ws, "Progress Report")
    
    if not progress_data:
        _add_no_data_message(ws, current_row)
    else:
        # Assessment Summary
        assessment_summary = progress_data.get('assessment_summary', {})
        if assessment_summary:
            ws.cell(row=current_row, column=1, value="Assessment Progress")
            ws.cell(row=current_row, column=1).font = Font(size=12, bold=True)
            current_row += 1
            
            total_assessments = assessment_summary.get('total_assessments', 0)
            first_score = assessment_summary.get('first_score', 0)
            latest_score = assessment_summary.get('latest_score', 0)
            score_change = assessment_summary.get('score_change', 0)
            
            ws.cell(row=current_row, column=1, value="Total Assessments:")
            _safe_cell_write(ws, current_row, 2, total_assessments)
            current_row += 1
            
            ws.cell(row=current_row, column=1, value="First Score:")
            _safe_cell_write(ws, current_row, 2, first_score)
            current_row += 1
            
            ws.cell(row=current_row, column=1, value="Latest Score:")
            _safe_cell_write(ws, current_row, 2, latest_score)
            current_row += 1
            
            ws.cell(row=current_row, column=1, value="Score Change:")
            _safe_cell_write(ws, current_row, 2, f"{score_change:+.1f}")
            current_row += 2
        
        # Routine Adherence
        adherence_summary = progress_data.get('adherence_summary', {})
        if adherence_summary:
            ws.cell(row=current_row, column=1, value="Routine Adherence")
            ws.cell(row=current_row, column=1).font = Font(size=12, bold=True)
            current_row += 1
            
            total_logs = adherence_summary.get('total_logs', 0)
            avg_adherence = adherence_summary.get('average_adherence', 0)
            
            ws.cell(row=current_row, column=1, value="Total Routine Logs:")
            _safe_cell_write(ws, current_row, 2, total_logs)
            current_row += 1
            
            ws.cell(row=current_row, column=1, value="Average Adherence:")
            _safe_cell_write(ws, current_row, 2, f"{avg_adherence}%")
            current_row += 2
        
        # Hydration Summary
        hydration_summary = progress_data.get('hydration_summary', {})
        if hydration_summary:
            ws.cell(row=current_row, column=1, value="Hydration Tracking")
            ws.cell(row=current_row, column=1).font = Font(size=12, bold=True)
            current_row += 1
            
            total_logs = hydration_summary.get('total_logs', 0)
            avg_glasses = hydration_summary.get('average_glasses', 0)
            
            ws.cell(row=current_row, column=1, value="Total Hydration Logs:")
            _safe_cell_write(ws, current_row, 2, total_logs)
            current_row += 1
            
            ws.cell(row=current_row, column=1, value="Average Daily Glasses:")
            _safe_cell_write(ws, current_row, 2, avg_glasses)
            current_row += 2
        
        # Sleep Summary
        sleep_summary = progress_data.get('sleep_summary', {})
        if sleep_summary:
            ws.cell(row=current_row, column=1, value="Sleep Tracking")
            ws.cell(row=current_row, column=1).font = Font(size=12, bold=True)
            current_row += 1
            
            total_logs = sleep_summary.get('total_logs', 0)
            avg_hours = sleep_summary.get('average_hours', 0)
            
            ws.cell(row=current_row, column=1, value="Total Sleep Logs:")
            _safe_cell_write(ws, current_row, 2, total_logs)
            current_row += 1
            
            ws.cell(row=current_row, column=1, value="Average Sleep Hours:")
            _safe_cell_write(ws, current_row, 2, avg_hours)
            current_row += 1
    
    _auto_size_columns(ws)
    
    # Save to BytesIO
    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer


def generate_skin_health_excel(health_data: Optional[Dict[str, Any]]) -> io.BytesIO:
    """Generate Skin Health Report Excel."""
    wb = _create_workbook("Comprehensive Skin Health Report")
    ws = wb.active
    
    current_row = _add_header(ws, "Comprehensive Skin Health Report")
    
    if not health_data:
        _add_no_data_message(ws, current_row)
    else:
        # Overall Score
        overall_score = health_data.get('overall_score', 0)
        category = health_data.get('category', 'Unknown')
        
        ws.cell(row=current_row, column=1, value="Overall Skin Health")
        ws.cell(row=current_row, column=1).font = Font(size=12, bold=True)
        current_row += 1
        
        ws.cell(row=current_row, column=1, value="Overall Score:")
        _safe_cell_write(ws, current_row, 2, overall_score)
        current_row += 1
        
        ws.cell(row=current_row, column=1, value="Health Category:")
        _safe_cell_write(ws, current_row, 2, category)
        current_row += 2
        
        # Factor Scores
        factor_scores = health_data.get('factor_scores', {})
        if factor_scores:
            ws.cell(row=current_row, column=1, value="Health Factor Breakdown")
            ws.cell(row=current_row, column=1).font = Font(size=12, bold=True)
            current_row += 2
            
            # Headers
            ws.cell(row=current_row, column=1, value="Health Factor")
            ws.cell(row=current_row, column=2, value="Score")
            _format_header_row(ws, current_row, 2)
            current_row += 1
            
            # Data
            for factor, score in factor_scores.items():
                factor_name = factor.replace('_', ' ').title()
                ws.cell(row=current_row, column=1, value=factor_name)
                _safe_cell_write(ws, current_row, 2, score)
                current_row += 1
            
            current_row += 1
        
        # Assessment Summary
        assessment_summary = health_data.get('assessment_summary', {})
        if assessment_summary:
            ws.cell(row=current_row, column=1, value="Latest Assessment Summary")
            ws.cell(row=current_row, column=1).font = Font(size=12, bold=True)
            current_row += 1
            
            if assessment_summary.get('predicted_skin_type'):
                ws.cell(row=current_row, column=1, value="Skin Type:")
                _safe_cell_write(ws, current_row, 2, assessment_summary['predicted_skin_type'])
                current_row += 1
            
            if assessment_summary.get('overall_condition'):
                ws.cell(row=current_row, column=1, value="Overall Condition:")
                _safe_cell_write(ws, current_row, 2, assessment_summary['overall_condition'])
                current_row += 2
        
        # Routine Adherence
        routine_adherence = health_data.get('routine_adherence', {})
        if routine_adherence:
            ws.cell(row=current_row, column=1, value="Routine Adherence")
            ws.cell(row=current_row, column=1).font = Font(size=12, bold=True)
            current_row += 1
            
            avg_percentage = routine_adherence.get('average_percentage', 0)
            total_logs = routine_adherence.get('total_logs', 0)
            
            ws.cell(row=current_row, column=1, value="Average Adherence:")
            _safe_cell_write(ws, current_row, 2, f"{avg_percentage}%")
            current_row += 1
            
            ws.cell(row=current_row, column=1, value="Total Routine Logs:")
            _safe_cell_write(ws, current_row, 2, total_logs)
            current_row += 2
        
        # Hydration
        hydration = health_data.get('hydration', {})
        if hydration:
            ws.cell(row=current_row, column=1, value="Hydration Tracking")
            ws.cell(row=current_row, column=1).font = Font(size=12, bold=True)
            current_row += 1
            
            avg_glasses = hydration.get('average_glasses', 0)
            total_logs = hydration.get('total_logs', 0)
            
            ws.cell(row=current_row, column=1, value="Average Daily Glasses:")
            _safe_cell_write(ws, current_row, 2, avg_glasses)
            current_row += 1
            
            ws.cell(row=current_row, column=1, value="Total Hydration Logs:")
            _safe_cell_write(ws, current_row, 2, total_logs)
            current_row += 2
        
        # Sleep
        sleep = health_data.get('sleep', {})
        if sleep:
            ws.cell(row=current_row, column=1, value="Sleep Tracking")
            ws.cell(row=current_row, column=1).font = Font(size=12, bold=True)
            current_row += 1
            
            avg_hours = sleep.get('average_hours', 0)
            total_logs = sleep.get('total_logs', 0)
            
            ws.cell(row=current_row, column=1, value="Average Sleep Hours:")
            _safe_cell_write(ws, current_row, 2, avg_hours)
            current_row += 1
            
            ws.cell(row=current_row, column=1, value="Total Sleep Logs:")
            _safe_cell_write(ws, current_row, 2, total_logs)
            current_row += 2
        
        # Recommendations
        recommendations = health_data.get('recommendations')
        if recommendations:
            ws.cell(row=current_row, column=1, value="Recommendations")
            ws.cell(row=current_row, column=1).font = Font(size=12, bold=True)
            current_row += 1
            
            ws.cell(row=current_row, column=1, value="Recommendations:")
            _safe_cell_write(ws, current_row, 2, recommendations)
            current_row += 1
    
    _auto_size_columns(ws)
    
    # Save to BytesIO
    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer