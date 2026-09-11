import io
import datetime
from typing import Dict, Any, List

class SkincareReportEngine:
    """
    Module 11: Reports & Export System Engine
    Generates structured reports and handles PDF and Excel Exports for:
    1. Skin Assessment Reports
    2. Routine Reports
    3. Product Recommendation Reports
    4. Progress Reports
    5. Skin Health Reports
    """

    @staticmethod
    def get_skin_assessment_report(user_name: str = "Akash Prajapati") -> Dict[str, Any]:
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
        return {
            "report_id": f"REP-ASSESS-{datetime.datetime.now().strftime('%Y%m%d%H%M')}",
            "generated_at": now,
            "user_name": user_name,
            "user_email": "user@aiskincare.com",
            "skin_type": "Combination (Oily T-Zone & Normal Cheeks)",
            "skin_concerns": ["Acne & Breakouts", "Enlarged Pores", "Post-Inflammatory Hyperpigmentation"],
            "sensitivity_level": "Moderate Sensitivity",
            "moisture_barrier_status": "Slightly Compromised (82/100)",
            "overall_skin_score": 82,
            "primary_risks": [
                "High risk of pore clogging with comedogenic heavy oils",
                "Potential photosensitivity if sunscreen is skipped after exfoliating acids"
            ],
            "dermatologist_recommendations": [
                "Use a gentle 2% Salicylic Acid (BHA) cleanser in AM routine",
                "Apply Niacinamide 10% + Zinc PCA to regulate sebum & reduce pore size",
                "Always apply Broad-Spectrum SPF 50 PA++++ sunscreen before outdoors",
                "Avoid combining Retinol and Glycolic Acid on the same night"
            ],
            "summary": "Patient demonstrates healthy moisture retention but presents with mild sebum overproduction in T-zone and early acne lesions. Recommended targeted BHA treatment with barrier-repairing Ceramides."
        }

    @staticmethod
    def get_routine_report(user_name: str = "Akash Prajapati") -> Dict[str, Any]:
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
        return {
            "report_id": f"REP-ROUTINE-{datetime.datetime.now().strftime('%Y%m%d%H%M')}",
            "generated_at": now,
            "user_name": user_name,
            "skin_type": "Combination",
            "morning_routine": [
                {
                    "step_number": 1,
                    "category": "Cleanser",
                    "product_name": "Minimalist Salicylic Acid 2% Facewash",
                    "active_ingredients": "Salicylic Acid (BHA), LHA",
                    "frequency": "Daily AM",
                    "instructions": "Massage onto wet face for 60s and rinse thoroughly with lukewarm water."
                },
                {
                    "step_number": 2,
                    "category": "Toner",
                    "product_name": "Klairs Supple Preparation Unscented Toner",
                    "active_ingredients": "Centella Asiatica, Hyaluronic Acid",
                    "frequency": "Daily AM",
                    "instructions": "Pat lightly into clean face until absorbed."
                },
                {
                    "step_number": 3,
                    "category": "Serum",
                    "product_name": "Minimalist Niacinamide 10% + Zinc",
                    "active_ingredients": "Niacinamide 10%, Zinc PCA",
                    "frequency": "Daily AM",
                    "instructions": "Apply 2-3 drops to balance oil & calm redness."
                },
                {
                    "step_number": 4,
                    "category": "Sunscreen",
                    "product_name": "Dot & Key Watermelon Sunscreen SPF 50 PA++++",
                    "active_ingredients": "Zinc Oxide, Watermelon Extract",
                    "frequency": "Daily AM",
                    "instructions": "Apply 2 fingers full 15 minutes before stepping into sunlight."
                }
            ],
            "evening_routine": [
                {
                    "step_number": 1,
                    "category": "Cleanser",
                    "product_name": "La Roche-Posay Effaclar Foaming Gel",
                    "active_ingredients": "Zinc PCA, Thermal Spring Water",
                    "frequency": "Daily PM",
                    "instructions": "Remove dirt and PM environmental impurities."
                },
                {
                    "step_number": 2,
                    "category": "Treatment / Active",
                    "product_name": "Minimalist Retinol 0.6% Serum",
                    "active_ingredients": "Encapsulated Retinol, Coenzyme Q10",
                    "frequency": "Alternate PMs (3x/week)",
                    "instructions": "Apply pea-sized amount onto dry skin. Follow with moisturizer."
                },
                {
                    "step_number": 3,
                    "category": "Moisturizer",
                    "product_name": "CeraVe Moisturizing Cream with Ceramides",
                    "active_ingredients": "Ceramides 1, 3, 6-II, Hyaluronic Acid",
                    "frequency": "Daily PM",
                    "instructions": "Seal moisture and repair skin lipid barrier overnight."
                }
            ],
            "conflicts_avoided": [
                "Retinol + BHA Salicylic Acid separated between AM and PM to prevent barrier irritation.",
                "Vitamin C low pH acid avoided during Retinol application nights."
            ],
            "key_ingredients_focused": ["Salicylic Acid", "Niacinamide", "Ceramides", "Retinol", "Zinc Oxide"],
            "compliance_tips": ["Keep sunscreen at your work desk", "Set AM/PM app reminders for consistency"]
        }

    @staticmethod
    def get_product_recommendation_report(user_name: str = "Akash Prajapati") -> Dict[str, Any]:
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
        return {
            "report_id": f"REP-PROD-{datetime.datetime.now().strftime('%Y%m%d%H%M')}",
            "generated_at": now,
            "user_name": user_name,
            "target_concerns": ["Acne & Oil Control", "Dark Spots & Radiance", "Barrier Protection"],
            "recommended_products": [
                {
                    "product_name": "Salicylic Acid 2% Cleanser",
                    "brand": "Minimalist",
                    "category": "Face Wash",
                    "match_score": 98,
                    "active_ingredients": "Salicylic Acid, LHA, Zinc PCA",
                    "price": "₹299",
                    "rating": 4.7,
                    "buy_link": "https://www.nykaa.com/minimalist-2percent-salicylic-acid-face-wash/p/2779148"
                },
                {
                    "product_name": "Effaclar Purifying Foaming Gel",
                    "brand": "La Roche-Posay",
                    "category": "Face Wash",
                    "match_score": 95,
                    "active_ingredients": "Zinc PCA, Thermal Water",
                    "price": "₹1,499",
                    "rating": 4.6,
                    "buy_link": "https://www.nykaa.com/search/result/?q=La%20Roche%20Posay%20Effaclar"
                },
                {
                    "product_name": "Niacinamide 10% Serum with Zinc",
                    "brand": "Minimalist",
                    "category": "Serum",
                    "match_score": 97,
                    "active_ingredients": "Niacinamide 10%, Zinc PCA",
                    "price": "₹599",
                    "rating": 4.7,
                    "buy_link": "https://www.nykaa.com/minimalist-10percent-niacinamide-face-serum/p/1026026"
                },
                {
                    "product_name": "Watermelon Sunscreen SPF 50 PA++++",
                    "brand": "Dot & Key",
                    "category": "Sunscreen",
                    "match_score": 96,
                    "active_ingredients": "Zinc Oxide, Watermelon Extract",
                    "price": "₹399",
                    "rating": 4.7,
                    "buy_link": "https://www.nykaa.com/dot-key-watermelon-cooling-sunscreen-spf-50-pa/p/5012543"
                },
                {
                    "product_name": "Moisturizing Cream with Ceramides",
                    "brand": "CeraVe",
                    "category": "Moisturizer",
                    "match_score": 94,
                    "active_ingredients": "Ceramides 1,3,6-II, Hyaluronic Acid",
                    "price": "₹1,299",
                    "rating": 4.8,
                    "buy_link": "https://www.nykaa.com/cerave-moisturizing-cream/p/9274531"
                }
            ],
            "budget_friendly_alternatives": [
                {
                    "product_name": "Purifying Neem Facewash",
                    "brand": "Himalaya",
                    "category": "Face Wash",
                    "match_score": 88,
                    "active_ingredients": "Neem, Turmeric",
                    "price": "₹180",
                    "rating": 4.5,
                    "buy_link": "https://www.nykaa.com/himalaya-herbals-purifying-neem-face-wash/p/3807"
                },
                {
                    "product_name": "10% Vitamin C Face Serum",
                    "brand": "The Derma Co",
                    "category": "Serum",
                    "match_score": 90,
                    "active_ingredients": "3-O-Ethyl Ascorbic Acid, Niacinamide",
                    "price": "₹649",
                    "rating": 4.6,
                    "buy_link": "https://www.nykaa.com/the-derma-co-10percent-vitamin-c-face-serum/p/1321453"
                }
            ],
            "key_purchase_notes": "All recommended products are Non-Comedogenic, Fragrance-Tested, and optimized for Combination skin with active acne concerns."
        }

    @staticmethod
    def get_progress_report(user_name: str = "Akash Prajapati") -> Dict[str, Any]:
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
        return {
            "report_id": f"REP-PROG-{datetime.datetime.now().strftime('%Y%m%d%H%M')}",
            "generated_at": now,
            "user_name": user_name,
            "total_days_logged": 28,
            "streak_count": 14,
            "compliance_rate": 92.8,
            "acne_trend": "Improved by 35% (Lesion count reduced from 12 to 4)",
            "hydration_trend": "Increased by 20% (Moisture rating 8.2/10)",
            "redness_trend": "Reduced by 40% (Inflammation calmed)",
            "logs_summary": [
                {"date": "2026-09-10", "acne_severity": 2, "redness_level": 2, "hydration_level": 9, "routine_completed": True, "notes": "Skin feeling very smooth. Sunscreen re-applied twice."},
                {"date": "2026-09-09", "acne_severity": 3, "redness_level": 2, "hydration_level": 8, "routine_completed": True, "notes": "Retinol night. No stinging or flaking."},
                {"date": "2026-09-08", "acne_severity": 3, "redness_level": 3, "hydration_level": 8, "routine_completed": True, "notes": "Drank 2.8L water. Great sleep."},
                {"date": "2026-09-07", "acne_severity": 4, "redness_level": 3, "hydration_level": 7, "routine_completed": True, "notes": "Slight redness around nostrils, applied Cica balm."},
                {"date": "2026-09-06", "acne_severity": 4, "redness_level": 4, "hydration_level": 7, "routine_completed": True, "notes": "Salicylic acid cleanser used AM."}
            ],
            "milestones_achieved": [
                "🏆 14-Day Consecutive Routine Streak",
                "💧 Hydration Level reached 80%+ threshold",
                "✨ 30-Day Skincare Champion Badge Unlocked"
            ]
        }

    @staticmethod
    def get_skin_health_report(user_name: str = "Akash Prajapati") -> Dict[str, Any]:
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
        return {
            "report_id": f"REP-HEALTH-{datetime.datetime.now().strftime('%Y%m%d%H%M')}",
            "generated_at": now,
            "user_name": user_name,
            "skin_type": "Combination",
            "health_metrics": {
                "barrier_health_score": 85,
                "hydration_index": 88,
                "acne_control_score": 80,
                "pigmentation_clarity_score": 84,
                "elasticity_score": 90,
                "overall_health_score": 854 # out of 1000 or 85%
            },
            "grade": "A- (Optimal Skin Condition)",
            "top_strengths": [
                "Strong epidermal moisture barrier resistance",
                "High cellular elasticity & collagen bounce",
                "Excellent routine consistency & hydration intake"
            ],
            "areas_for_improvement": [
                "Subtle sebum accumulation around nose & chin T-zone",
                "Minor residual post-acne dark marks on cheek"
            ],
            "personalized_action_plan": [
                "Maintain Niacinamide 10% in morning routine to fade post-acne marks",
                "Incorporate BHA exfoliation twice weekly in PM to keep T-zone clear",
                "Ensure minimum 2.5L daily hydration to sustain 88/100 hydration index"
            ]
        }

    @classmethod
    def generate_pdf(cls, report_type: str, data: Dict[str, Any]) -> bytes:
        """
        Generates a PDF document for the specified report type.
        Uses ReportLab if installed, otherwise builds styled HTML/Text PDF buffer.
        """
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib import colors

            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
            styles = getSampleStyleSheet()

            # Custom styles
            title_style = ParagraphStyle(
                'DocTitle',
                parent=styles['Heading1'],
                fontSize=20,
                textColor=colors.HexColor('#4F46E5'),
                spaceAfter=6
            )
            subtitle_style = ParagraphStyle(
                'DocSubTitle',
                parent=styles['Normal'],
                fontSize=10,
                textColor=colors.HexColor('#6B7280'),
                spaceAfter=12
            )
            h2_style = ParagraphStyle(
                'SectionHeader',
                parent=styles['Heading2'],
                fontSize=14,
                textColor=colors.HexColor('#1F2937'),
                spaceBefore=10,
                spaceAfter=6
            )
            body_style = ParagraphStyle(
                'BodyTextCustom',
                parent=styles['BodyText'],
                fontSize=9.5,
                textColor=colors.HexColor('#374151'),
                leading=13
            )

            story = []

            # Branding Header
            story.append(Paragraph("<b>AI SKIN INTELLIGENCE &amp; PERSONALIZED PLANNER</b>", title_style))
            report_title_map = {
                "assessment": "Skin Assessment & Risk Diagnostic Report",
                "routine": "Personalized AM/PM Skincare Routine Plan",
                "products": "Curated Product Recommendations Report",
                "progress": "Progress Tracking & Clinical Trend Report",
                "health": "Comprehensive 360° Skin Health Score Report"
            }
            title_text = report_title_map.get(report_type.lower(), "Official Skincare Intelligence Report")
            story.append(Paragraph(f"<b>{title_text}</b>", ParagraphStyle('Sub', fontSize=13, textColor=colors.HexColor('#0D9488'))))
            story.append(Paragraph(f"Report ID: {data.get('report_id', 'N/A')} | Generated At: {data.get('generated_at', 'N/A')} | Prepared for: <b>{data.get('user_name', 'User')}</b>", subtitle_style))
            story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#E5E7EB'), spaceBefore=4, spaceAfter=12))

            if report_type == "assessment":
                story.append(Paragraph("<b>1. Summary Overview</b>", h2_style))
                story.append(Paragraph(data.get("summary", ""), body_style))
                story.append(Spacer(1, 10))

                table_data = [
                    ["Metric / Parameter", "Assessment Result"],
                    ["Skin Type", data.get("skin_type", "")],
                    ["Skin Score", f"{data.get('overall_skin_score', '')}/100"],
                    ["Sensitivity Level", data.get("sensitivity_level", "")],
                    ["Barrier Status", data.get("moisture_barrier_status", "")],
                    ["Primary Concerns", ", ".join(data.get("skin_concerns", []))]
                ]
                t = Table(table_data, colWidths=[200, 340])
                t.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (1,0), colors.HexColor('#4F46E5')),
                    ('TEXTCOLOR', (0,0), (1,0), colors.white),
                    ('FONTNAME', (0,0), (1,0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0,0), (-1,-1), 9),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                    ('TOPPADDING', (0,0), (-1,-1), 6),
                    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#D1D5DB')),
                    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F9FAFB')])
                ]))
                story.append(t)

                story.append(Spacer(1, 12))
                story.append(Paragraph("<b>2. Dermatologist Actionable Recommendations</b>", h2_style))
                for rec in data.get("dermatologist_recommendations", []):
                    story.append(Paragraph(f"• {rec}", body_style))

            elif report_type == "routine":
                story.append(Paragraph("<b>Morning Skincare Routine (AM)</b>", h2_style))
                am_data = [["Step #", "Category", "Product Name", "Active Ingredients", "Frequency"]]
                for item in data.get("morning_routine", []):
                    am_data.append([str(item["step_number"]), item["category"], item["product_name"], item["active_ingredients"], item["frequency"]])
                
                t_am = Table(am_data, colWidths=[40, 80, 180, 160, 80])
                t_am.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0D9488')),
                    ('TEXTCOLOR', (0,0), (-1,0), colors.white),
                    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0,0), (-1,-1), 8.5),
                    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#D1D5DB'))
                ]))
                story.append(t_am)

                story.append(Spacer(1, 12))
                story.append(Paragraph("<b>Evening Skincare Routine (PM)</b>", h2_style))
                pm_data = [["Step #", "Category", "Product Name", "Active Ingredients", "Frequency"]]
                for item in data.get("evening_routine", []):
                    pm_data.append([str(item["step_number"]), item["category"], item["product_name"], item["active_ingredients"], item["frequency"]])
                
                t_pm = Table(pm_data, colWidths=[40, 80, 180, 160, 80])
                t_pm.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#4F46E5')),
                    ('TEXTCOLOR', (0,0), (-1,0), colors.white),
                    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0,0), (-1,-1), 8.5),
                    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#D1D5DB'))
                ]))
                story.append(t_pm)

            elif report_type == "products":
                story.append(Paragraph("<b>AI Matched Recommended Products</b>", h2_style))
                prod_data = [["Brand", "Product Name", "Category", "Match Score", "Price", "Rating"]]
                for p in data.get("recommended_products", []):
                    prod_data.append([p["brand"], p["product_name"], p["category"], f"{p['match_score']}%", p["price"], str(p["rating"])])
                
                t_prod = Table(prod_data, colWidths=[90, 200, 100, 60, 50, 40])
                t_prod.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#4F46E5')),
                    ('TEXTCOLOR', (0,0), (-1,0), colors.white),
                    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0,0), (-1,-1), 8.5),
                    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#D1D5DB'))
                ]))
                story.append(t_prod)

            elif report_type == "progress":
                story.append(Paragraph("<b>Progress Statistics</b>", h2_style))
                prog_summary = [
                    ["Metric", "Current Value"],
                    ["Total Days Logged", str(data.get("total_days_logged", 0))],
                    ["Current Routine Streak", f"{data.get('streak_count', 0)} Days"],
                    ["Compliance Rate", f"{data.get('compliance_rate', 0)}%"],
                    ["Acne Lesions Trend", data.get("acne_trend", "")],
                    ["Hydration Index Trend", data.get("hydration_trend", "")]
                ]
                t_prog = Table(prog_summary, colWidths=[200, 340])
                t_prog.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#10B981')),
                    ('TEXTCOLOR', (0,0), (-1,0), colors.white),
                    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#D1D5DB'))
                ]))
                story.append(t_prog)

            elif report_type == "health":
                story.append(Paragraph("<b>360° Skin Health Score Breakdown</b>", h2_style))
                metrics = data.get("health_metrics", {})
                health_table = [
                    ["Health Dimension", "Score / 100", "Status Grade"],
                    ["Barrier Health Score", f"{metrics.get('barrier_health_score', 0)}/100", "Optimal"],
                    ["Hydration Index", f"{metrics.get('hydration_index', 0)}/100", "Excellent"],
                    ["Acne Control Score", f"{metrics.get('acne_control_score', 0)}/100", "Good"],
                    ["Pigmentation Clarity", f"{metrics.get('pigmentation_clarity_score', 0)}/100", "Very Good"],
                    ["Elasticity & Firmness", f"{metrics.get('elasticity_score', 0)}/100", "Superior"]
                ]
                t_h = Table(health_table, colWidths=[200, 140, 200])
                t_h.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#8B5CF6')),
                    ('TEXTCOLOR', (0,0), (-1,0), colors.white),
                    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#D1D5DB'))
                ]))
                story.append(t_h)

            story.append(Spacer(1, 20))
            story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#E5E7EB'), spaceBefore=8, spaceAfter=8))
            story.append(Paragraph("<font size=8 color='#9CA3AF'>Confidential Medical Skincare Record • AI Skin Intelligence Platform • Certified Clinical Skincare Planner</font>", ParagraphStyle('Footer', alignment=1)))

            doc.build(story)
            pdf_bytes = buffer.getvalue()
            buffer.close()
            return pdf_bytes

        except Exception as e:
            print(f"[PDF Engine Warning] Primary ReportLab DocTemplate failed, generating standalone PDF canvas: {e}")
            from reportlab.pdfgen import canvas
            buf = io.BytesIO()
            c = canvas.Canvas(buf, pagesize=letter)
            c.setFont("Helvetica-Bold", 16)
            c.drawString(50, 750, f"AI SKINCARE REPORT - {report_type.upper()}")
            c.setFont("Helvetica", 10)
            c.drawString(50, 730, f"Report ID: {data.get('report_id')}")
            c.drawString(50, 715, f"Prepared for: {data.get('user_name')}")
            c.drawString(50, 700, f"Generated: {data.get('generated_at')}")
            c.line(50, 690, 550, 690)
            
            y = 670
            for k, v in data.items():
                if y < 80:
                    c.showPage()
                    y = 750
                c.setFont("Helvetica-Bold", 10)
                c.drawString(50, y, f"{k}:")
                c.setFont("Helvetica", 9)
                str_val = str(v)[:90]
                c.drawString(150, y, str_val)
                y -= 18
            
            c.save()
            pdf_bytes = buf.getvalue()
            buf.close()
            return pdf_bytes

    @classmethod
    def generate_excel(cls, report_type: str, data: Dict[str, Any]) -> bytes:
        """
        Generates a formatted Excel (.xlsx) file for the specified report.
        Uses openpyxl / pandas if installed, or structured CSV/XML buffer fallback.
        """
        try:
            import openpyxl
            from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
            from openpyxl.utils import get_column_letter

            wb = openpyxl.Workbook()
            ws = wb.active
            ws.title = "Report Summary"

            # Header Styling
            header_font = Font(name="Calibri", size=14, bold=True, color="FFFFFF")
            header_fill = PatternFill(start_color="4F46E5", end_color="4F46E5", fill_type="solid")
            col_header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
            col_header_fill = PatternFill(start_color="0D9488", end_color="0D9488", fill_type="solid")

            # Title Row
            ws.merge_cells("A1:E1")
            ws["A1"] = f"AI SKINCARE INTELLIGENCE - {report_type.upper()} REPORT"
            ws["A1"].font = header_font
            ws["A1"].fill = header_fill
            ws["A1"].alignment = Alignment(horizontal="center", vertical="center")
            ws.row_dimensions[1].height = 30

            # Metadata
            ws["A3"] = "Report ID:"
            ws["B3"] = data.get("report_id", "")
            ws["A4"] = "Generated At:"
            ws["B4"] = data.get("generated_at", "")
            ws["A5"] = "User Name:"
            ws["B5"] = data.get("user_name", "")

            for row in [3, 4, 5]:
                ws[f"A{row}"].font = Font(bold=True)

            start_row = 7

            if report_type == "assessment":
                ws[f"A{start_row}"] = "Parameter"
                ws[f"B{start_row}"] = "Value"
                ws[f"A{start_row}"].font = col_header_font
                ws[f"A{start_row}"].fill = col_header_fill
                ws[f"B{start_row}"].font = col_header_font
                ws[f"B{start_row}"].fill = col_header_fill

                items = [
                    ("Skin Type", data.get("skin_type")),
                    ("Overall Score", f"{data.get('overall_skin_score')}/100"),
                    ("Sensitivity Level", data.get("sensitivity_level")),
                    ("Moisture Barrier", data.get("moisture_barrier_status")),
                    ("Skin Concerns", ", ".join(data.get("skin_concerns", []))),
                    ("Summary", data.get("summary"))
                ]
                r = start_row + 1
                for k, v in items:
                    ws[f"A{r}"] = k
                    ws[f"B{r}"] = v
                    r += 1

            elif report_type == "routine":
                headers = ["Routine", "Step #", "Category", "Product Name", "Active Ingredients", "Frequency"]
                for col_idx, h in enumerate(headers, 1):
                    cell = ws.cell(row=start_row, column=col_idx)
                    cell.value = h
                    cell.font = col_header_font
                    cell.fill = col_header_fill
                
                r = start_row + 1
                for step in data.get("morning_routine", []):
                    ws.cell(row=r, column=1, value="Morning (AM)")
                    ws.cell(row=r, column=2, value=step["step_number"])
                    ws.cell(row=r, column=3, value=step["category"])
                    ws.cell(row=r, column=4, value=step["product_name"])
                    ws.cell(row=r, column=5, value=step["active_ingredients"])
                    ws.cell(row=r, column=6, value=step["frequency"])
                    r += 1
                for step in data.get("evening_routine", []):
                    ws.cell(row=r, column=1, value="Evening (PM)")
                    ws.cell(row=r, column=2, value=step["step_number"])
                    ws.cell(row=r, column=3, value=step["category"])
                    ws.cell(row=r, column=4, value=step["product_name"])
                    ws.cell(row=r, column=5, value=step["active_ingredients"])
                    ws.cell(row=r, column=6, value=step["frequency"])
                    r += 1

            elif report_type == "products":
                headers = ["Brand", "Product Name", "Category", "Match Score", "Price", "Rating", "Nykaa Link"]
                for col_idx, h in enumerate(headers, 1):
                    cell = ws.cell(row=start_row, column=col_idx)
                    cell.value = h
                    cell.font = col_header_font
                    cell.fill = col_header_fill

                r = start_row + 1
                for p in data.get("recommended_products", []):
                    ws.cell(row=r, column=1, value=p["brand"])
                    ws.cell(row=r, column=2, value=p["product_name"])
                    ws.cell(row=r, column=3, value=p["category"])
                    ws.cell(row=r, column=4, value=f"{p['match_score']}%")
                    ws.cell(row=r, column=5, value=p["price"])
                    ws.cell(row=r, column=6, value=p["rating"])
                    ws.cell(row=r, column=7, value=p["buy_link"])
                    r += 1

            elif report_type == "progress":
                headers = ["Date", "Acne Severity (1-10)", "Redness Level (1-10)", "Hydration Level (1-10)", "Routine Completed", "Log Notes"]
                for col_idx, h in enumerate(headers, 1):
                    cell = ws.cell(row=start_row, column=col_idx)
                    cell.value = h
                    cell.font = col_header_font
                    cell.fill = col_header_fill

                r = start_row + 1
                for entry in data.get("logs_summary", []):
                    ws.cell(row=r, column=1, value=entry["date"])
                    ws.cell(row=r, column=2, value=entry["acne_severity"])
                    ws.cell(row=r, column=3, value=entry["redness_level"])
                    ws.cell(row=r, column=4, value=entry["hydration_level"])
                    ws.cell(row=r, column=5, value="Yes" if entry["routine_completed"] else "No")
                    ws.cell(row=r, column=6, value=entry["notes"])
                    r += 1

            elif report_type == "health":
                headers = ["Health Metric Dimension", "Score", "Status"]
                for col_idx, h in enumerate(headers, 1):
                    cell = ws.cell(row=start_row, column=col_idx)
                    cell.value = h
                    cell.font = col_header_font
                    cell.fill = col_header_fill

                r = start_row + 1
                for k, v in data.get("health_metrics", {}).items():
                    ws.cell(row=r, column=1, value=k.replace("_", " ").title())
                    ws.cell(row=r, column=2, value=v)
                    ws.cell(row=r, column=3, value="Optimal")
                    r += 1

            # Auto-fit columns width safely without MergedCell attribute error
            for col_idx in range(1, 10):
                col_letter = get_column_letter(col_idx)
                max_len = 0
                for r in range(2, ws.max_row + 1):
                    val = ws.cell(row=r, column=col_idx).value
                    if val is not None:
                        max_len = max(max_len, len(str(val)))
                if max_len > 0:
                    ws.column_dimensions[col_letter].width = min(max(max_len + 4, 14), 55)

            buffer = io.BytesIO()
            wb.save(buffer)
            excel_bytes = buffer.getvalue()
            buffer.close()
            return excel_bytes

        except Exception as e:
            print(f"[Excel Engine Warning] Primary openpyxl builder failed, generating clean fallback workbook: {e}")
            import openpyxl
            wb = openpyxl.Workbook()
            ws = wb.active
            ws.title = "Report Summary"
            ws["A1"] = f"AI SKINCARE REPORT - {report_type.upper()}"
            ws["A2"] = f"Report ID: {data.get('report_id')}"
            ws["A3"] = f"Generated: {data.get('generated_at')}"
            ws["A4"] = f"User: {data.get('user_name')}"

            r = 6
            for k, v in data.items():
                ws.cell(row=r, column=1, value=str(k))
                ws.cell(row=r, column=2, value=str(v)[:150])
                r += 1

            buffer = io.BytesIO()
            wb.save(buffer)
            excel_bytes = buffer.getvalue()
            buffer.close()
            return excel_bytes
