"""
Module 11 — Reports & Export System.

Small, generic helpers for turning a title + a set of (heading, rows) sections
into a downloadable PDF or Excel file. Kept generic so every report type
(skin assessment, routine, product recommendations, progress, skin health)
can reuse the same rendering code instead of hand-rolling layout per report.
"""
import io
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill


def build_pdf(title: str, subtitle: str, sections: list[tuple[str, list[str], list[list]]]) -> bytes:
    """
    sections: list of (heading, column_headers, rows) — rows is a list of lists of cell values.
    Returns raw PDF bytes.
    """
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=1.5 * cm, bottomMargin=1.5 * cm)
    styles = getSampleStyleSheet()
    heading_style = ParagraphStyle("SectionHeading", parent=styles["Heading2"], textColor=colors.HexColor("#1f4d3d"))

    story = [
        Paragraph(title, styles["Title"]),
        Paragraph(subtitle, styles["Normal"]),
        Paragraph(f"Generated {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", styles["Normal"]),
        Spacer(1, 0.6 * cm),
    ]

    for heading, columns, rows in sections:
        story.append(Paragraph(heading, heading_style))
        story.append(Spacer(1, 0.2 * cm))
        if not rows:
            story.append(Paragraph("No data available.", styles["Normal"]))
        else:
            table_data = [columns] + [[str(c) if c is not None else "" for c in row] for row in rows]
            table = Table(table_data, repeatRows=1)
            table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f4d3d")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f2f6f4")]),
            ]))
            story.append(table)
        story.append(Spacer(1, 0.6 * cm))

    doc.build(story)
    return buf.getvalue()


def build_excel(title: str, sections: list[tuple[str, list[str], list[list]]]) -> bytes:
    """
    sections: list of (sheet_name, column_headers, rows). Each section becomes its own sheet
    (sheet names truncated/sanitized to Excel's 31-char limit).
    Returns raw XLSX bytes.
    """
    wb = Workbook()
    wb.remove(wb.active)
    header_fill = PatternFill(start_color="1F4D3D", end_color="1F4D3D", fill_type="solid")
    header_font = Font(color="FFFFFF", bold=True)

    for heading, columns, rows in sections:
        sheet_name = heading[:31] or "Sheet"
        ws = wb.create_sheet(title=sheet_name)
        ws.append(columns)
        for cell in ws[1]:
            cell.fill = header_fill
            cell.font = header_font
        for row in rows:
            ws.append([str(c) if c is not None else "" for c in row])
        for col_cells in ws.columns:
            length = max((len(str(c.value)) for c in col_cells if c.value is not None), default=10)
            ws.column_dimensions[col_cells[0].column_letter].width = min(max(length + 2, 10), 50)

    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()
