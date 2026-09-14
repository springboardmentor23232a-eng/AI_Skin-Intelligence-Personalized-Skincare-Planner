"""
Professional 7-Page PDF Technical Project Documentation Generator
Project: AI Skin Intelligence & Personalized Skincare Planner
Output: AI_Skin_Intelligence_Personalized_Skincare_Planner_7_Page_Document.pdf
Meets all Master Prompt specifications: Exactly 7 pages, A4 portrait, verified implementation details.
"""

import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, 
    PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas

# --- Geometry Setup (A4 Portrait) ---
PAGE_WIDTH, PAGE_HEIGHT = A4  # 595.28 x 841.89 pt
LEFT_MARGIN = 50.4    # 0.70 inch
RIGHT_MARGIN = 50.4   # 0.70 inch
TOP_MARGIN = 46.8     # 0.65 inch
BOTTOM_MARGIN = 43.2  # 0.60 inch
PRINTABLE_WIDTH = PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN   # 494.48 pt
PRINTABLE_HEIGHT = PAGE_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN # 751.89 pt

# --- Curated Professional Color Palette ---
NAVY_DARK    = colors.HexColor("#0F172A")  # Slate 900
NAVY_PRIMARY = colors.HexColor("#1E293B")  # Slate 800
BLUE_ACCENT  = colors.HexColor("#0284C7")  # Sky 600
BLUE_DARK    = colors.HexColor("#0369A1")  # Sky 700
BLUE_LIGHT   = colors.HexColor("#F0F9FF")  # Sky 50
BLUE_MED     = colors.HexColor("#BAE6FD")  # Sky 200
TEAL_ACCENT  = colors.HexColor("#0D9488")  # Teal 600
TEAL_LIGHT   = colors.HexColor("#F0FDFA")  # Teal 50
SLATE_LIGHT  = colors.HexColor("#F8FAFC")  # Slate 50
SLATE_BORDER = colors.HexColor("#CBD5E1")  # Slate 300
SLATE_TEXT   = colors.HexColor("#334155")  # Slate 700
SLATE_MUTED  = colors.HexColor("#64748B")  # Slate 500
AMBER_BG     = colors.HexColor("#FFFBEB")  # Amber 50
AMBER_BORDER = colors.HexColor("#F59E0B")  # Amber 500
AMBER_TEXT   = colors.HexColor("#92400E")  # Amber 800
GREEN_BG     = colors.HexColor("#F0FDF4")  # Emerald 50
GREEN_BORDER = colors.HexColor("#10B981")  # Emerald 500
GREEN_TEXT   = colors.HexColor("#065F46")  # Emerald 800
WHITE        = colors.HexColor("#FFFFFF")

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and stamp total pages,
    running headers, and running footers on every page.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count):
        self.saveState()
        
        # Running Header (Top)
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(NAVY_PRIMARY)
        self.drawString(LEFT_MARGIN, PAGE_HEIGHT - 28, "AI Skin Intelligence & Personalized Skincare Planner")
        
        self.setFont("Helvetica", 7.5)
        self.setFillColor(SLATE_MUTED)
        self.drawRightString(PAGE_WIDTH - RIGHT_MARGIN, PAGE_HEIGHT - 28, "Comprehensive Project Documentation | Mentor Evaluation")
        
        self.setStrokeColor(SLATE_BORDER)
        self.setLineWidth(0.5)
        self.line(LEFT_MARGIN, PAGE_HEIGHT - 32, PAGE_WIDTH - RIGHT_MARGIN, PAGE_HEIGHT - 32)
        
        # Running Footer (Bottom)
        self.setStrokeColor(SLATE_BORDER)
        self.setLineWidth(0.5)
        self.line(LEFT_MARGIN, 34, PAGE_WIDTH - RIGHT_MARGIN, 34)
        
        self.setFont("Helvetica", 7.5)
        self.setFillColor(SLATE_MUTED)
        self.drawString(LEFT_MARGIN, 22, "Academic Engineering Documentation | Verified Source Implementation | Docker Staging Ready")
        
        # Required format: Page X of 7
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(NAVY_PRIMARY)
        self.drawRightString(PAGE_WIDTH - RIGHT_MARGIN, 22, page_str)
        
        self.restoreState()


def build_pdf():
    pdf_filename = "AI_Skin_Intelligence_Personalized_Skincare_Planner_7_Page_Document.pdf"
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=A4,
        leftMargin=LEFT_MARGIN,
        rightMargin=RIGHT_MARGIN,
        topMargin=TOP_MARGIN,
        bottomMargin=BOTTOM_MARGIN
    )

    styles = getSampleStyleSheet()
    
    # Main Title: 20-22 pt
    styles.add(ParagraphStyle(
        'MainDocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=22,
        textColor=NAVY_DARK,
        spaceAfter=2
    ))
    styles.add(ParagraphStyle(
        'MainDocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=12,
        textColor=BLUE_DARK,
        spaceAfter=4
    ))
    # Page Title: 15-17 pt
    styles.add(ParagraphStyle(
        'PageHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15.5,
        leading=18,
        textColor=NAVY_DARK,
        spaceAfter=2
    ))
    styles.add(ParagraphStyle(
        'PageSubheading',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.8,
        leading=11,
        textColor=SLATE_MUTED,
        spaceAfter=4
    ))
    # Section Heading: 11-13 pt
    styles.add(ParagraphStyle(
        'SecHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=13,
        textColor=NAVY_PRIMARY,
        spaceBefore=3,
        spaceAfter=2
    ))
    # Body Text: 9.5-10.5 pt
    styles.add(ParagraphStyle(
        'BodyStandard',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.2,
        leading=11.6,
        textColor=SLATE_TEXT,
        alignment=TA_LEFT
    ))
    styles.add(ParagraphStyle(
        'BodyStandardBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.2,
        leading=11.6,
        textColor=NAVY_PRIMARY
    ))
    styles.add(ParagraphStyle(
        'BulletPoint',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.8,
        leading=11,
        textColor=SLATE_TEXT,
        leftIndent=9,
        firstLineIndent=-9,
        spaceAfter=1.5
    ))
    # Tables: 8-9 pt
    styles.add(ParagraphStyle(
        'TblHead',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.2,
        leading=10,
        textColor=NAVY_DARK
    ))
    styles.add(ParagraphStyle(
        'TblCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.0,
        leading=9.8,
        textColor=SLATE_TEXT
    ))
    styles.add(ParagraphStyle(
        'TblCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.0,
        leading=9.8,
        textColor=NAVY_PRIMARY
    ))
    styles.add(ParagraphStyle(
        'TblCellCenter',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=6.9,
        leading=8.3,
        textColor=SLATE_TEXT,
        alignment=TA_CENTER
    ))
    # Card / Box Text
    styles.add(ParagraphStyle(
        'CardHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.8,
        leading=10.8,
        textColor=NAVY_PRIMARY
    ))
    styles.add(ParagraphStyle(
        'CardText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.2,
        leading=10.2,
        textColor=SLATE_TEXT
    ))
    styles.add(ParagraphStyle(
        'AlertCardHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.8,
        leading=10.8,
        textColor=AMBER_TEXT
    ))
    styles.add(ParagraphStyle(
        'AlertCardText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.2,
        leading=10.2,
        textColor=AMBER_TEXT
    ))

    # Helper function for bordered cards / callout boxes
    def make_card(title, body, bg=SLATE_LIGHT, border=SLATE_BORDER, title_style='CardHeading', body_style='CardText', width=PRINTABLE_WIDTH, padding=3):
        content = []
        if title:
            content.append(Paragraph(title, styles[title_style]))
            content.append(Spacer(1, 1.5))
        content.append(Paragraph(body, styles[body_style]))
        
        t = Table([[content]], colWidths=[width])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), bg),
            ('BOX', (0,0), (-1,-1), 0.7, border),
            ('TOPPADDING', (0,0), (-1,-1), padding),
            ('BOTTOMPADDING', (0,0), (-1,-1), padding),
            ('LEFTPADDING', (0,0), (-1,-1), 5),
            ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ]))
        return t

    # Helper function for horizontal workflow diagram
    def make_flow_strip(steps, width=PRINTABLE_WIDTH):
        cols = []
        col_w = width / len(steps)
        for i, step in enumerate(steps):
            cols.append(Paragraph(f"<font color='{BLUE_DARK.hexval()}'><b>[{i+1}]</b></font><br/>{step}", styles['TblCellCenter']))
        t = Table([cols], colWidths=[col_w]*len(steps))
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), SLATE_LIGHT),
            ('BOX', (0,0), (-1,-1), 0.6, SLATE_BORDER),
            ('INNERGRID', (0,0), (-1,-1), 0.5, SLATE_BORDER),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 2.5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
            ('LEFTPADDING', (0,0), (-1,-1), 2),
            ('RIGHTPADDING', (0,0), (-1,-1), 2),
        ]))
        return t

    story = []

    # =========================================================================
    # PAGE 1 — PROJECT OVERVIEW
    # =========================================================================
    p1_items = []
    p1_items.append(Paragraph("AI Skin Intelligence &amp; Personalized Skincare Planner", styles['MainDocTitle']))
    p1_items.append(Paragraph("AI-Powered Personalized Skin Assessment, Routine Planning, Ingredient Intelligence and Product Recommendation Platform", styles['MainDocSubtitle']))
    p1_items.append(HRFlowable(width="100%", thickness=1.5, color=BLUE_ACCENT, spaceAfter=4, spaceBefore=0))

    # A, B & C: Overview, Problem & Solution
    p1_intro = (
        "<b>Project Overview:</b> Skincare selection varies between individuals because human skin responds dynamically to "
        "<b>skin type</b> (oily, dry, combination, sensitive), active <b>skin concerns</b> (acne, hyperpigmentation, redness), "
        "individual <b>sensitivity thresholds</b>, daily <b>lifestyle stress</b>, <b>sleep quality</b>, fluid <b>hydration</b>, "
        "<b>environmental exposure</b> (UV index, ambient climate), and personal <b>preferences</b>. Generic over-the-counter advice "
        "fails to unify these heterogeneous factors. The AI Skin Intelligence platform bridges this divide by combining computer vision "
        "skin assessment with personalized profiling, active ingredient intelligence, and chronobiological routine planning."
    )
    p1_items.append(Paragraph(p1_intro, styles['BodyStandard']))
    p1_items.append(Spacer(1, 3))

    prob_html = "<b>Problem Statement:</b> Generic skincare advice ignores individual biology, triggering product abandonment, wasted spending, or acute skin barrier damage."
    sol_html = "<b>Proposed Solution:</b> Combines EfficientNet-B0 computer vision with lifestyle profiling, ingredient safety rules, and budget-tailored product recommendations."
    ps_table = Table([[Paragraph(prob_html, styles['CardText']), Paragraph(sol_html, styles['CardText'])]], colWidths=[PRINTABLE_WIDTH*0.49, PRINTABLE_WIDTH*0.49])
    ps_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), AMBER_BG),
        ('BOX', (0,0), (0,0), 0.7, AMBER_BORDER),
        ('BACKGROUND', (1,0), (1,0), GREEN_BG),
        ('BOX', (1,0), (1,0), 0.7, GREEN_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    p1_items.append(ps_table)
    p1_items.append(Spacer(1, 2.5))

    # D. Project Objectives (6 concise objectives in 2 columns)
    p1_items.append(Paragraph("Project Objectives", styles['SecHeading']))
    obj_col1 = [
        "• <b>Analyze Skin Images:</b> Classify skin conditions via EfficientNet-B0 PyTorch CNN.",
        "• <b>Build Personalized Profile:</b> Synthesize skin type, concerns, sleep, and hydration.",
        "• <b>Generate Skincare Routines:</b> Build dynamic morning, evening, weekly, and seasonal tiers."
    ]
    obj_col2 = [
        "• <b>Check Ingredient Compatibility:</b> Flag biochemical conflicts (e.g. Retinol + BHA).",
        "• <b>Recommend Matched Products:</b> Filter catalog by suitability score, budget, and allergies.",
        "• <b>Track Progress &amp; Reports:</b> Calculate 5-factor health score; stream PDF/CSV/XLSX exports."
    ]
    obj_table = Table([[Paragraph("<br/>".join(obj_col1), styles['BulletPoint']), Paragraph("<br/>".join(obj_col2), styles['BulletPoint'])]], colWidths=[PRINTABLE_WIDTH*0.5, PRINTABLE_WIDTH*0.5])
    obj_table.setStyle(TableStyle([
        ('TOPPADDING', (0,0), (-1,-1), 1),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
        ('LEFTPADDING', (0,0), (-1,-1), 2),
        ('RIGHTPADDING', (0,0), (-1,-1), 2),
    ]))
    p1_items.append(obj_table)
    p1_items.append(Spacer(1, 2))

    # E. Major Features Grid (4x3 table)
    p1_items.append(Paragraph("Platform Feature Matrix", styles['SecHeading']))
    feat_data = [
        [Paragraph("<b>Authentication &amp; Security</b><br/><font color='#64748B'>JWT HS256, Google OAuth, verified tokens.</font>", styles['TblCell']),
         Paragraph("<b>AI Skin Assessment</b><br/><font color='#64748B'>EfficientNet-B0 across 8 clinical categories.</font>", styles['TblCell']),
         Paragraph("<b>User Skin Profile</b><br/><font color='#64748B'>Dermatological baseline, habits, climate.</font>", styles['TblCell'])],
        [Paragraph("<b>Personalized Routines</b><br/><font color='#64748B'>5 Tiers: AM, PM, Weekly, Monthly, Seasonal.</font>", styles['TblCell']),
         Paragraph("<b>Ingredient Intelligence</b><br/><font color='#64748B'>Biochemical safety &amp; conflict detection.</font>", styles['TblCell']),
         Paragraph("<b>Product Recommendations</b><br/><font color='#64748B'>Catalog matching with allergy penalties.</font>", styles['TblCell'])],
        [Paragraph("<b>Skin Health Score</b><br/><font color='#64748B'>5-Factor weighted formula (0–100).</font>", styles['TblCell']),
         Paragraph("<b>Analytics &amp; Diary</b><br/><font color='#64748B'>Adherence trends, timeline, photo tracking.</font>", styles['TblCell']),
         Paragraph("<b>Clinical Reports &amp; Alerts</b><br/><font color='#64748B'>PDF/CSV/XLSX streams, reminder alerts.</font>", styles['TblCell'])],
        [Paragraph("<b>Role-Based Access (RBAC)</b><br/><font color='#64748B'>4 Roles: USER, CONSULTANT, DERM, ADMIN.</font>", styles['TblCell']),
         Paragraph("<b>Admin Telemetry &amp; Logs</b><br/><font color='#64748B'>Audit logging, user controls, live telemetry.</font>", styles['TblCell']),
         Paragraph("<b>Docker Containerization</b><br/><font color='#64748B'>3-container stack: NGINX, FastAPI, PostgreSQL.</font>", styles['TblCell'])]
    ]
    feat_table = Table(feat_data, colWidths=[PRINTABLE_WIDTH/3]*3)
    feat_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), SLATE_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.6, SLATE_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, SLATE_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING', (0,0), (-1,-1), 3),
        ('RIGHTPADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    p1_items.append(feat_table)
    p1_items.append(Spacer(1, 2))

    # F. Technology Stack Table
    p1_items.append(Paragraph("Implemented Production Technology Stack", styles['SecHeading']))
    tech_data = [
        [Paragraph("Layer", styles['TblHead']), Paragraph("Technology", styles['TblHead']), Paragraph("Implementation Details &amp; Production Role", styles['TblHead'])],
        [Paragraph("Frontend UI", styles['TblCellBold']), Paragraph("React 18 + Vite", styles['TblCell']), Paragraph("Modular Single Page Application, responsive CSS design tokens, Axios client.", styles['TblCell'])],
        [Paragraph("Backend API", styles['TblCellBold']), Paragraph("FastAPI (Python 3.11)", styles['TblCell']), Paragraph("Asynchronous REST API, Pydantic v2 schemas, automated OpenAPI/Swagger docs.", styles['TblCell'])],
        [Paragraph("AI / ML Engine", styles['TblCellBold']), Paragraph("PyTorch + EfficientNet-B0", styles['TblCell']), Paragraph("Transfer-learned CNN, CPU inference (~29ms latency), 8 skin concern classes.", styles['TblCell'])],
        [Paragraph("Database &amp; ORM", styles['TblCellBold']), Paragraph("PostgreSQL 15 + SQLAlchemy", styles['TblCell']), Paragraph("18 relational tables, connection pooling, ACID compliance, Alembic migrations.", styles['TblCell'])],
        [Paragraph("Authentication", styles['TblCellBold']), Paragraph("JWT + Google OAuth", styles['TblCell']), Paragraph("HS256 access tokens, cryptographic OAuth2 ID token verification, RBAC guards.", styles['TblCell'])],
        [Paragraph("Web Server &amp; Gateway", styles['TblCellBold']), Paragraph("NGINX Alpine", styles['TblCell']), Paragraph("Reverse proxy on port 80, static SPA bundle serving, security header injection.", styles['TblCell'])],
        [Paragraph("Containerization", styles['TblCellBold']), Paragraph("Docker &amp; Docker Compose", styles['TblCell']), Paragraph("Multi-stage lean containers, unprivileged appuser (UID 10001), healthchecks.", styles['TblCell'])],
    ]
    tech_table = Table(tech_data, colWidths=[PRINTABLE_WIDTH*0.20, PRINTABLE_WIDTH*0.28, PRINTABLE_WIDTH*0.52])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BLUE_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.6, SLATE_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, SLATE_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 1.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
        ('LEFTPADDING', (0,0), (-1,-1), 3.5),
        ('RIGHTPADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    p1_items.append(tech_table)
    p1_items.append(Spacer(1, 2))

    # G. Architecture Flow
    p1_items.append(Paragraph("System Architecture Dataflow", styles['SecHeading']))
    arch_strip = ["USER", "REACT FRONTEND", "NGINX GATEWAY", "FASTAPI BACKEND", "AI + RULES ENGINE", "POSTGRESQL DB"]
    p1_items.append(make_flow_strip(arch_strip))
    p1_items.append(Spacer(1, 2.5))

    # Academic Project Context Card (fills bottom perfectly)
    endorse_box = make_card(
        "Academic Project Context &amp; Evaluator Overview",
        "• <b>Academic Presentation:</b> Capstone Engineering Project prepared for College Mentor review.<br/>"
        "• <b>Engineering Principles:</b> Defensive architectural design, zero fabricated claims, strict data isolation, and Docker containerization.<br/>"
        "• <b>Verification Level:</b> 100% verified local Docker multi-container stack, 161 backend pytest tests passing, and 36 unified phase checks passing.",
        bg=SLATE_LIGHT, border=BLUE_ACCENT, title_style='CardHeading', body_style='CardText', padding=2.5
    )
    p1_items.append(endorse_box)

    story.extend(p1_items)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 2 — USER JOURNEY: LOGIN, VERIFICATION AND PROFILE
    # =========================================================================
    p2_items = []
    p2_items.append(Paragraph("User Journey: Login, Verification and Profile", styles['PageHeading']))
    p2_items.append(Paragraph("Comprehensive onboarding workflow establishing authenticated identity, verified channels, and personalized baseline parameters.", styles['PageSubheading']))
    p2_items.append(HRFlowable(width="100%", thickness=1, color=BLUE_ACCENT, spaceAfter=4, spaceBefore=0))

    # Section A: Application Entry Flow
    p2_items.append(Paragraph("Application Entry &amp; Authentication Flow", styles['SecHeading']))
    entry_steps = ["User Browser", "Open Application", "Login / Register", "Authentication (JWT)", "User Dashboard"]
    p2_items.append(make_flow_strip(entry_steps))
    p2_items.append(Spacer(1, 2.5))

    # Section B, C & D: Registration, Login & Google OAuth
    p2_items.append(Paragraph("Registration, Login &amp; Google OAuth Federation", styles['SecHeading']))
    p2_items.append(Paragraph(
        "<b>User Registration:</b> Standard self-registration requires full name, email, and password. The backend strictly defaults "
        "to <code>role='USER'</code> (privileged roles like CONSULTANT or ADMIN cannot be self-assigned). Passwords are cryptographically "
        "hashed via PBKDF2-HMAC-SHA256 (100,000 iterations, 16-byte random salt). Accounts initialize with <code>email_verified=False</code>.<br/>"
        "<b>Credential Login:</b> Validates email and timing-safe password hash. Issues an HS256 JWT access token (1440-min expiry) and refresh token. "
        "Protected endpoints authenticate via <code>Authorization: Bearer &lt;token&gt;</code>. Suspended users are immediately blocked via <code>is_blocked</code>.<br/>"
        "<b>Google OAuth Federation:</b> Verifies Google ID tokens cryptographically, extracting verified email and subject ID. "
        "<i>(Note: Google OAuth in production requires external Google Client ID and domain configuration; dev mock fallback active for tests.)</i>",
        styles['BodyStandard']
    ))
    p2_items.append(Spacer(1, 2.5))

    # Section E & F: Email & Phone Verification Channels
    p2_items.append(Paragraph("Multi-Channel Identity Verification", styles['SecHeading']))
    verif_data = [
        [Paragraph("Channel", styles['TblHead']), Paragraph("Security Architecture &amp; Implementation Details", styles['TblHead']), Paragraph("Operational Boundary &amp; Status", styles['TblHead'])],
        [Paragraph("Email Verification", styles['TblCellBold']), 
         Paragraph("Generates a single-use 32-byte cryptographic token (SHA-256 stored in <code>email_verification_tokens</code>). 24h expiry prevents replay attacks. Rate-limited to 1 request per 60s to block mailbox flooding.", styles['TblCell']),
         Paragraph("<font color='#059669'><b>Active / Verified</b></font><br/>Token lifecycle verified.", styles['TblCell'])],
        [Paragraph("Phone (SMS) OTP", styles['TblCellBold']), 
         Paragraph("Issues a secure 6-digit numeric OTP (SHA-256 stored in <code>phone_otp_verifications</code>). 10-minute expiration, max 5 incorrect attempts, max 3 requests per 10 minutes.", styles['TblCell']),
         Paragraph("<font color='#D97706'><b>Configuration Required</b></font><br/>Real SMS delivery requires external Twilio configuration.", styles['TblCell'])],
    ]
    verif_table = Table(verif_data, colWidths=[PRINTABLE_WIDTH*0.22, PRINTABLE_WIDTH*0.53, PRINTABLE_WIDTH*0.25])
    verif_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SLATE_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.6, SLATE_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, SLATE_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING', (0,0), (-1,-1), 3.5),
        ('RIGHTPADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    p2_items.append(verif_table)
    p2_items.append(Spacer(1, 2.5))

    # Section G: User Profile
    p2_items.append(Paragraph("User Profile Model &amp; Personalization Inputs", styles['SecHeading']))
    p2_items.append(Paragraph(
        "Downstream personalization relies on 4 baseline profile dimensions captured during onboarding in <code>skin_profiles</code>:",
        styles['BodyStandard']
    ))
    p2_items.append(Spacer(1, 1.5))

    profile_cards = [
        [Paragraph("<b>Dermatological Baseline</b><br/><font color='#64748B'>• Skin Type: Dry, Oily, Combination, Normal, Sensitive<br/>• Concerns: Acne, Redness, Hyperpigmentation, Dryness<br/>• Allergies &amp; Sensitivities (Fragrance, Essential Oils)</font>", styles['TblCell']),
         Paragraph("<b>Lifestyle &amp; Physiological Habits</b><br/><font color='#64748B'>• Hydration: Daily fluid volume in liters (target: 2.0L+)<br/>• Sleep Quality: Nocturnal rest supporting cell repair<br/>• Stress Level: Cortisol impact on skin lipid barrier</font>", styles['TblCell'])],
        [Paragraph("<b>Environmental Exposure</b><br/><font color='#64748B'>• Solar UV Index: Daily outdoor sun exposure hours<br/>• Local Climate: Arid, Humid, Temperate, or Cold<br/>• Urban Pollution: Environmental oxidative stress</font>", styles['TblCell']),
         Paragraph("<b>Regimen Preferences &amp; Constraints</b><br/><font color='#64748B'>• Budget Tier: Low (&lt;INR 1500), Medium, or Premium<br/>• Texture Preferences: Gel, Cream, Serum, Balm<br/>• Active Tolerance: Frequency limits for retinoids/acids</font>", styles['TblCell'])]
    ]
    pcard_table = Table(profile_cards, colWidths=[PRINTABLE_WIDTH*0.5, PRINTABLE_WIDTH*0.5])
    pcard_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), SLATE_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.6, SLATE_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, SLATE_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING', (0,0), (-1,-1), 3.5),
        ('RIGHTPADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    p2_items.append(pcard_table)
    p2_items.append(Spacer(1, 2))

    prof_strip = ["USER PROFILE", "LIFESTYLE HABITS", "ENVIRONMENTAL CONTEXT", "PERSONALIZATION INPUTS"]
    p2_items.append(make_flow_strip(prof_strip))
    p2_items.append(Spacer(1, 2.5))

    # Section H: Dashboard Features
    p2_items.append(Paragraph("Centralized User Dashboard Features", styles['SecHeading']))
    dash_box = make_card(
        "Implemented Dashboard Capabilities",
        "• <b>Real-Time Skin Health Score:</b> Visual gauge displaying overall score and individual 5-factor component breakdowns.<br/>"
        "• <b>Active Routine Quick-Access:</b> Direct view of Morning (cleanser, serum, SPF) and Evening (cleanse, repair, balm) protocols.<br/>"
        "• <b>Diagnostic Actions:</b> Instant buttons to launch AI Skin Assessment, verify ingredient compatibility, and browse matched products.<br/>"
        "• <b>Compliance Diary &amp; Alerts:</b> Daily routine checkbox logging, hydration goal tracking, and notification center inbox.",
        bg=SLATE_LIGHT, border=BLUE_ACCENT, title_style='CardHeading', body_style='CardText', padding=2.5
    )
    p2_items.append(dash_box)
    p2_items.append(Spacer(1, 2.5))

    # Privacy & Data Isolation Card
    priv_box = make_card(
        "Privacy, Data Isolation &amp; Boundary Enforcement",
        "• <b>Strict Tenant Isolation:</b> Database foreign keys bind all assessments, routines, and logs to authenticated <code>user_id</code>.<br/>"
        "• <b>Cross-User Protection:</b> User A cannot access or modify User B's diagnostic records. Confirmed by integration tests.<br/>"
        "• <b>Protected Telemetry:</b> Telemetry endpoints strictly reject anonymous (401) and standard user (403) calls; only ADMIN permitted.",
        bg=SLATE_LIGHT, border=SLATE_BORDER, title_style='CardHeading', body_style='CardText', padding=2.5
    )
    p2_items.append(priv_box)

    story.extend(p2_items)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 3 — AI SKIN ASSESSMENT & SKIN INTELLIGENCE
    # =========================================================================
    p3_items = []
    p3_items.append(Paragraph("AI Skin Assessment &amp; Skin Intelligence", styles['PageHeading']))
    p3_items.append(Paragraph("Deep learning computer vision evaluates dermatological skin condition categories to augment personalized planning.", styles['PageSubheading']))
    p3_items.append(HRFlowable(width="100%", thickness=1, color=BLUE_ACCENT, spaceAfter=4, spaceBefore=0))

    # Section A & B: AI Input & Pipeline
    p3_items.append(Paragraph("Computer Vision Assessment Pipeline", styles['SecHeading']))
    p3_items.append(Paragraph(
        "<b>Image Ingestion:</b> The user captures or uploads a close-up facial photograph via web file picker or webcam (JPEG, PNG). "
        "The image is submitted to the inference endpoint (<code>/api/image-analysis/upload</code> or <code>/api/assessments/scan</code>):",
        styles['BodyStandard']
    ))
    p3_items.append(Spacer(1, 2))

    # Clean flow strip without awkward line breaks
    ai_flow = ["SKIN IMAGE", "PREPROCESSING", "EFFICIENTNET-B0", "PYTORCH INFERENCE", "8 CATEGORIES", "ASSESSMENT RESULT", "PERSONALIZATION ENGINE"]
    p3_items.append(make_flow_strip(ai_flow))
    p3_items.append(Spacer(1, 2.5))

    # Section C: Model Architecture Table
    p3_items.append(Paragraph("Model Architecture &amp; Configured Classes", styles['SecHeading']))
    ai_meta_data = [
        [Paragraph("Specification", styles['TblHead']), Paragraph("Technical Detail", styles['TblHead']), Paragraph("Dermatological Category Classes (8 Configured Classes)", styles['TblHead'])],
        [Paragraph("Architecture", styles['TblCellBold']), Paragraph("EfficientNet-B0 (Inverted Bottleneck MBConv)", styles['TblCell']), Paragraph("1. Acneiform &amp; Follicular Disorders (Acne, Folliculitis)", styles['TblCell'])],
        [Paragraph("Framework", styles['TblCellBold']), Paragraph("PyTorch 2.x (Torchvision, CPU-optimized)", styles['TblCell']), Paragraph("2. Eczematous &amp; Inflammatory Dermatitis (Eczema, Atopic)", styles['TblCell'])],
        [Paragraph("Model Checkpoint", styles['TblCellBold']), Paragraph("<code>skin_condition_improved.pth</code> (15.61 MB)", styles['TblCell']), Paragraph("3. Infections &amp; Infestations (Fungal, Bacterial, Viral)", styles['TblCell'])],
        [Paragraph("Model Metadata", styles['TblCellBold']), Paragraph("<code>improved_model_metadata.json</code> (v2.0.0)", styles['TblCell']), Paragraph("4. Other Clinical Disorders", styles['TblCell'])],
        [Paragraph("Input Dimensions", styles['TblCellBold']), Paragraph("224 × 224 × 3 (Normalized to ImageNet mean/std)", styles['TblCell']), Paragraph("5. Papulosquamous Disorders (Psoriasis, Lichen Planus)", styles['TblCell'])],
        [Paragraph("Model Footprint", styles['TblCellBold']), Paragraph("5.3M Parameters (Lean, efficient CPU execution)", styles['TblCell']), Paragraph("6. Trauma &amp; Insect Bites", styles['TblCell'])],
        [Paragraph("Execution Mode", styles['TblCellBold']), Paragraph("CPU-supported inference (device-agnostic loader)", styles['TblCell']), Paragraph("7. Urticaria &amp; Reactive Rashes<br/>8. Vascular &amp; Purpuric Conditions (Rosacea, Erythema)", styles['TblCell'])],
    ]
    ai_meta_table = Table(ai_meta_data, colWidths=[PRINTABLE_WIDTH*0.25, PRINTABLE_WIDTH*0.35, PRINTABLE_WIDTH*0.40])
    ai_meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SLATE_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.6, SLATE_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, SLATE_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 1.8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.8),
        ('LEFTPADDING', (0,0), (-1,-1), 3.5),
        ('RIGHTPADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    p3_items.append(ai_meta_table)
    p3_items.append(Spacer(1, 2.5))

    # Section D: How AI Result Is Used
    p3_items.append(Paragraph("Synthesis with User Profile &amp; Lifestyle Context", styles['SecHeading']))
    p3_items.append(Paragraph(
        "Computer vision classifications are synthesized with questionnaire responses to eliminate optical artifacts (e.g. poor lighting, camera glare):<br/>"
        "<b>Multimodal Synthesis Formula:</b><br/>"
        "<code>Personalized Skincare Intelligence = AI Assessment + User Profile + Lifestyle Rhythms + Sleep + Hydration + Environment</code><br/>"
        "If the model detects surface oiliness but the profile reveals chronic water deficiency and dry air conditioning, the engine identifies "
        "surface dehydration overproduction and prescribes hydrating humectants (Hyaluronic Acid) rather than harsh drying agents.",
        styles['BodyStandard']
    ))
    p3_items.append(Spacer(1, 2.5))

    # Section E & F: Model Metrics & Docker Performance
    p3_items.append(Paragraph("Empirical Model Metrics &amp; Docker Benchmark", styles['SecHeading']))
    ai_perf_data = [
        [Paragraph("Performance Dimension", styles['TblHead']), Paragraph("Verified Value", styles['TblHead']), Paragraph("Source / Environment", styles['TblHead']), Paragraph("Scientific Classification / Label", styles['TblHead'])],
        [Paragraph("Validation Accuracy", styles['TblCellBold']), Paragraph("<b>84.2%</b>", styles['TblCell']), Paragraph("<code>improved_model_metadata.json</code>", styles['TblCell']), Paragraph("<font color='#0284C7'><b>Reported Model Validation Metric</b></font>", styles['TblCell'])],
        [Paragraph("Macro F1-Score", styles['TblCellBold']), Paragraph("<b>0.825</b>", styles['TblCell']), Paragraph("<code>improved_model_metadata.json</code>", styles['TblCell']), Paragraph("<font color='#0284C7'><b>Reported Model Validation Metric</b></font>", styles['TblCell'])],
        [Paragraph("CPU Latency (P50)", styles['TblCellBold']), Paragraph("<b>29.45 ms</b>", styles['TblCell']), Paragraph("Docker Backend Container (30 runs)", styles['TblCell']), Paragraph("<font color='#059669'><b>Local Docker Benchmark</b></font>", styles['TblCell'])],
        [Paragraph("CPU Latency (P95)", styles['TblCellBold']), Paragraph("<b>36.07 ms</b>", styles['TblCell']), Paragraph("Docker Backend Container (30 runs)", styles['TblCell']), Paragraph("<font color='#059669'><b>Local Docker Benchmark</b></font>", styles['TblCell'])],
        [Paragraph("Inference Determinism", styles['TblCellBold']), Paragraph("<b>100.0%</b>", styles['TblCell']), Paragraph("Identical outputs on fixed tensor input", styles['TblCell']), Paragraph("<font color='#059669'><b>Engineering Verification</b></font>", styles['TblCell'])],
    ]
    ai_perf_table = Table(ai_perf_data, colWidths=[PRINTABLE_WIDTH*0.28, PRINTABLE_WIDTH*0.18, PRINTABLE_WIDTH*0.28, PRINTABLE_WIDTH*0.26])
    ai_perf_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BLUE_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.6, SLATE_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, SLATE_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 1.8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.8),
        ('LEFTPADDING', (0,0), (-1,-1), 3.5),
        ('RIGHTPADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    p3_items.append(ai_perf_table)
    p3_items.append(Spacer(1, 1.5))
    p3_items.append(Paragraph(
        "<font size=7 color='#64748B'><i>Note: Reported metrics reflect model validation on the SCIN dataset. "
        "Independent clinical/test-dataset validation is not established. Local Docker benchmark reflects containerized CPU execution.</i></font>",
        styles['BodyStandard']
    ))
    p3_items.append(Spacer(1, 2.5))

    # Section G: Safety Note
    safety_box = make_card(
        "MANDATORY CLINICAL SAFETY NOTICE &amp; SCOPE LIMITATION",
        "<b>The AI assessment is intended to support personalized skincare planning and does not replace professional medical evaluation.</b> "
        "The platform provides AI-assisted cosmetic skin-condition assessment and decision-support guidance. It does NOT provide clinical "
        "dermatological diagnosis, oncology screening, or medical prescriptions. Users with persistent rashes, atypical lesions, or severe "
        "inflammatory conditions must consult a board-certified dermatologist.",
        bg=AMBER_BG, border=AMBER_BORDER, title_style='AlertCardHeading', body_style='AlertCardText', padding=2.5
    )
    p3_items.append(safety_box)

    story.extend(p3_items)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 4 — PERSONALIZATION, ROUTINES, INGREDIENTS & PRODUCTS
    # =========================================================================
    p4_items = []
    p4_items.append(Paragraph("Personalized Skincare Intelligence", styles['PageHeading']))
    p4_items.append(Paragraph("Translating multidimensional assessment data into chronobiological routines, ingredient safety rules, and curated products.", styles['PageSubheading']))
    p4_items.append(HRFlowable(width="100%", thickness=1, color=BLUE_ACCENT, spaceAfter=4, spaceBefore=0))

    # Section A: Personalization Flow
    p4_items.append(Paragraph("Personalization Engine Architecture", styles['SecHeading']))
    pers_flow = ["USER PROFILE", "AI ASSESSMENT", "LIFESTYLE", "SKIN CONCERNS", "RULES ENGINE", "ROUTINES &amp; PRODUCTS"]
    p4_items.append(make_flow_strip(pers_flow))
    p4_items.append(Spacer(1, 2.5))

    # Section B: Routine Generation
    p4_items.append(Paragraph("Multi-Tier Chronobiological Skincare Routines", styles['SecHeading']))
    routine_data = [
        [Paragraph("Routine Tier", styles['TblHead']), Paragraph("Chronobiological Objective", styles['TblHead']), Paragraph("Step Sequence &amp; Formulation Order", styles['TblHead'])],
        [Paragraph("Morning (AM)", styles['TblCellBold']), Paragraph("Antioxidant defense, moisture retention, broad-spectrum UV shielding.", styles['TblCell']), Paragraph("<b>1. Cleanse:</b> Gentle Cleanser → <b>2. Treatment:</b> Niacinamide 5% + HA → <b>3. Moisturize:</b> Ceramide Cream → <b>4. Protect:</b> Mineral SPF 50+", styles['TblCell'])],
        [Paragraph("Evening (PM)", styles['TblCellBold']), Paragraph("Deep cleansing, targeted cellular turnover, barrier restoration.", styles['TblCell']), Paragraph("<b>1. Double Cleanse:</b> Micellar Oil + Gentle Cleanser → <b>2. Targeted Active:</b> Retinol 0.3% OR Azelaic 10% → <b>3. Repair:</b> Lipid Night Balm", styles['TblCell'])],
        [Paragraph("Weekly", styles['TblCellBold']), Paragraph("Stratum corneum exfoliation &amp; intensive moisture replenishment.", styles['TblCell']), Paragraph("1–2× weekly: Gentle Lactic/Salicylic Acid exfoliation OR Deep Hydration Mask (scheduled strictly on non-retinoid nights).", styles['TblCell'])],
        [Paragraph("Monthly", styles['TblCellBold']), Paragraph("Periodic barrier audit, tolerance check, and active progression.", styles['TblCell']), Paragraph("Skin diagnostic re-assessment questionnaire, pore purifying clay treatment, and active strength progression review.", styles['TblCell'])],
        [Paragraph("Seasonal", styles['TblCellBold']), Paragraph("Adapting to temperature, ambient humidity, and UV index shifts.", styles['TblCell']), Paragraph("Winter: Shift to richer lipid occlusives; Summer: Shift to non-comedogenic lightweight gels and sweat-resistant SPF 50+.", styles['TblCell'])],
    ]
    routine_table = Table(routine_data, colWidths=[PRINTABLE_WIDTH*0.18, PRINTABLE_WIDTH*0.35, PRINTABLE_WIDTH*0.47])
    routine_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SLATE_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.6, SLATE_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, SLATE_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 1.8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.8),
        ('LEFTPADDING', (0,0), (-1,-1), 3.5),
        ('RIGHTPADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    p4_items.append(routine_table)
    p4_items.append(Spacer(1, 2.5))

    # Section C: Adaptive Routines & Customization
    p4_items.append(Paragraph("Adaptive Regimens &amp; Manual Customization", styles['SecHeading']))
    p4_items.append(Paragraph(
        "Routines adapt dynamically upon re-assessment: <b>(a) Acne Delta:</b> If acne improves, active treatment frequency is reduced "
        "from 3x to 2x/week; if increased, targeted treatment is prioritized; <b>(b) Sensitivity Delta:</b> If redness spikes, exfoliating acids "
        "are paused in favor of barrier repair lipids (Ceramides, Panthenol); <b>(c) Manual Editing:</b> Users can customize step details, "
        "frequencies, and instructions via <code>PUT /api/routines/{id}</code>.",
        styles['BodyStandard']
    ))
    p4_items.append(Spacer(1, 2.5))

    # Section D: Ingredient Intelligence & Safety Rules
    p4_items.append(Paragraph("Ingredient Intelligence &amp; Contraindication Matrix", styles['SecHeading']))
    ing_data = [
        [Paragraph("Active Ingredient Pair", styles['TblHead']), Paragraph("Safety Status", styles['TblHead']), Paragraph("Biochemical Interaction &amp; Implemented Safety Rule", styles['TblHead'])],
        [Paragraph("Retinol + Salicylic Acid (BHA)", styles['TblCellBold']), 
         Paragraph("<font color='#DC2626'><b>INCOMPATIBLE / UNSAFE</b></font>", styles['TblCell']), 
         Paragraph("<b>Implemented Rule:</b> Direct concurrent layering causes acute barrier exfoliation, peeling, and irritation. The engine flags this pair as unsafe and splits them into alternating evenings.", styles['TblCell'])],
        [Paragraph("Niacinamide + Hyaluronic Acid", styles['TblCellBold']), 
         Paragraph("<font color='#059669'><b>SAFE &amp; SYNERGISTIC</b></font>", styles['TblCell']), 
         Paragraph("<b>Implemented Rule:</b> Highly synergistic. Hyaluronic acid supplies humectant hydration while Niacinamide upregulates ceramide synthesis and calms redness.", styles['TblCell'])],
        [Paragraph("Vitamin C + AHA/BHA", styles['TblCellBold']), 
         Paragraph("<font color='#D97706'><b>CAUTION / SEPARATION</b></font>", styles['TblCell']), 
         Paragraph("<b>Implemented Rule:</b> Both require low acidic pH; concurrent application triggers stinging. Recommended for separation: Vitamin C in AM, AHA/BHA in PM.", styles['TblCell'])],
    ]
    ing_table = Table(ing_data, colWidths=[PRINTABLE_WIDTH*0.28, PRINTABLE_WIDTH*0.22, PRINTABLE_WIDTH*0.50])
    ing_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SLATE_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.6, SLATE_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, SLATE_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 1.8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.8),
        ('LEFTPADDING', (0,0), (-1,-1), 3.5),
        ('RIGHTPADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    p4_items.append(ing_table)
    p4_items.append(Spacer(1, 1))
    p4_items.append(Paragraph(
        "<font size=7 color='#64748B'><i>Note: Implemented rule engine covers primary dermatological contraindications. Does not claim exhaustive coverage of all chemical compounds.</i></font>",
        styles['BodyStandard']
    ))
    p4_items.append(Spacer(1, 2.5))

    # Section E & F: Product Recommendation vs Recognition
    p4_items.append(Paragraph("Product Recommendation Engine vs Product Recognition", styles['SecHeading']))
    rec_flow = ["USER PROFILE", "SKIN CONCERNS", "ROUTINE STEPS", "INGREDIENT RULES", "BUDGET CEILING", "PRODUCT CATALOG", "RECOMMENDED PRODUCTS"]
    p4_items.append(make_flow_strip(rec_flow))
    p4_items.append(Spacer(1, 2))

    rec_box = make_card(
        "CRITICAL ARCHITECTURAL DISTINCTION: RECOMMENDATION VS RECOGNITION",
        "• <b>Product Recommendation (IMPLEMENTED &amp; VERIFIED):</b> The recommendation engine evaluates user profile needs, "
        "active skin concerns, and budget tiers against a verified catalog of skincare formulations. Formulations are ranked on a 0–100 suitability "
        "scale (Skin Type: 35pts, Concerns: 35pts, Rating: 15pts, Synergy: 15pts), with strict <b>-40 point penalties</b> for user allergens.<br/>"
        "• <b>Product Recognition (OUT OF CURRENT SCOPE):</b> Identifying physical commercial product bottles from optical camera photographs is a separate "
        "computer vision task and is <b>NOT</b> implemented in this project.",
        bg=SLATE_LIGHT, border=BLUE_ACCENT, title_style='CardHeading', body_style='CardText', padding=2.5
    )
    p4_items.append(rec_box)

    story.extend(p4_items)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 5 — SKIN HEALTH SCORE + ANALYTICS + PROGRESS + REPORTS
    # =========================================================================
    p5_items = []
    p5_items.append(Paragraph("Skin Health Score, Progress Tracking &amp; Reports", styles['PageHeading']))
    p5_items.append(Paragraph("Empirical 5-factor wellness scoring, longitudinal diary analytics, and multi-format clinical report generation.", styles['PageSubheading']))
    p5_items.append(HRFlowable(width="100%", thickness=1, color=BLUE_ACCENT, spaceAfter=4, spaceBefore=0))

    # Section A: Skin Health Score
    p5_items.append(Paragraph("Mathematical Formulation of the Skin Health Score", styles['SecHeading']))
    p5_items.append(Paragraph(
        "The platform computes a deterministic <b>Skin Health Score</b> bounded strictly between 0 and 100. "
        "The score is derived from a 5-factor weighted model verified in <code>app/services/skin_health_scoring.py</code>:",
        styles['BodyStandard']
    ))
    p5_items.append(Spacer(1, 1.5))

    eq_box = make_card(
        "5-Factor Skin Health Score Equation",
        "<b>Skin Health Score</b> = [ 0.35 * Condition ] + [ 0.20 * Lifestyle ] + [ 0.15 * Sleep ] + [ 0.20 * Routine ] + [ 0.10 * Hydration ]",
        bg=BLUE_LIGHT, border=BLUE_DARK, title_style='CardHeading', body_style='CardText', padding=2.5
    )
    p5_items.append(eq_box)
    p5_items.append(Spacer(1, 2))

    score_weights = [
        [Paragraph("Score Dimension", styles['TblHead']), Paragraph("Weight", styles['TblHead']), Paragraph("Evaluation Metric &amp; Derivation", styles['TblHead']), Paragraph("Personalization &amp; Baseline", styles['TblHead'])],
        [Paragraph("Skin Condition", styles['TblCellBold']), Paragraph("<b>35% (0.35)</b>", styles['TblCell']), Paragraph("AI concern severity, acute erythema, dryness, and barrier reactivity.", styles['TblCell']), Paragraph("Dry skin prioritizes moisture dehydration; Sensitive skin prioritizes erythema/reactivity.", styles['TblCell'])],
        [Paragraph("Lifestyle Rhythms", styles['TblCellBold']), Paragraph("<b>20% (0.20)</b>", styles['TblCell']), Paragraph("Stress level, physical activity frequency, and environmental pollution.", styles['TblCell']), Paragraph("Elevated stress penalizes recovery; active lifestyle boosts microcirculation.", styles['TblCell'])],
        [Paragraph("Sleep Quality", styles['TblCellBold']), Paragraph("<b>15% (0.15)</b>", styles['TblCell']), Paragraph("Nocturnal sleep duration against 7–9 hour cellular regeneration window.", styles['TblCell']), Paragraph("Penalizes chronic sleep deficit (&lt;6h) which impairs epidermal barrier repair.", styles['TblCell'])],
        [Paragraph("Routine Consistency", styles['TblCellBold']), Paragraph("<b>20% (0.20)</b>", styles['TblCell']), Paragraph("14-day compliance adherence: Morning SPF and evening cleanse/treatment.", styles['TblCell']), Paragraph("Derived from <code>skincare_logs</code>: (completed_logs / total_logs) * 100.", styles['TblCell'])],
        [Paragraph("Hydration Level", styles['TblCellBold']), Paragraph("<b>10% (0.10)</b>", styles['TblCell']), Paragraph("Daily fluid intake evaluated against 2.0–2.5 L/day dermatological guideline.", styles['TblCell']), Paragraph("Linear scale: water_intake / 2.0 * 100, clamped to 100.0 max.", styles['TblCell'])],
        [Paragraph("<b>Total System Weight</b>", styles['TblCellBold']), Paragraph("<b>100% (1.00)</b>", styles['TblCell']), Paragraph("Bounded strictly to [0.0, 100.0]. Missing values use neutral baseline handling.", styles['TblCell']), Paragraph("<b>Intended for wellness tracking, NOT a clinical diagnosis.</b>", styles['TblCell'])],
    ]
    score_table = Table(score_weights, colWidths=[PRINTABLE_WIDTH*0.22, PRINTABLE_WIDTH*0.14, PRINTABLE_WIDTH*0.36, PRINTABLE_WIDTH*0.28])
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SLATE_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.6, SLATE_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, SLATE_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 1.8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.8),
        ('LEFTPADDING', (0,0), (-1,-1), 3.5),
        ('RIGHTPADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    p5_items.append(score_table)
    p5_items.append(Spacer(1, 1))
    p5_items.append(Paragraph(
        "<font size=7 color='#64748B'><i>IMPORTANT: Termed 'Skin Health Score', NOT 'Clinical Health Score'. Intended for personalized wellness and tracking.</i></font>",
        styles['BodyStandard']
    ))
    p5_items.append(Spacer(1, 2.5))

    # Section B & C: Analytics & Progress Tracking
    p5_items.append(Paragraph("Longitudinal Analytics &amp; Progress Diary", styles['SecHeading']))
    p5_items.append(Paragraph(
        "Epidermal barrier restoration follows a 28-to-40-day biological cycle. The analytics engine (<code>/api/analytics/*</code>) "
        "tracks longitudinal improvements across three verified modules:",
        styles['BodyStandard']
    ))
    p5_items.append(Spacer(1, 1.5))

    ana_flow = ["SKIN ASSESSMENT", "STORED HISTORY (DB)", "ANALYTICS ENGINE", "PROGRESS TIMELINE", "USER INSIGHTS"]
    p5_items.append(make_flow_strip(ana_flow))
    p5_items.append(Spacer(1, 2))

    p5_items.append(Paragraph(
        "• <b>Historical Assessment Trends:</b> Visual tracking of overall score trajectory and individual concern deltas (acne, redness, dryness).<br/>"
        "• <b>Routine Compliance Logs:</b> Daily morning and evening checklist logging in <code>skincare_logs</code> measuring regimen adherence rate.<br/>"
        "• <b>Progress Photo Diary:</b> User diagnostic photographs stored in <code>skin_progress_photos</code> linked to assessments for visual comparison.",
        styles['BodyStandard']
    ))
    p5_items.append(Spacer(1, 2.5))

    # Section D & E: Reports & Notifications
    p5_items.append(Paragraph("Multi-Format Clinical Reports &amp; Notification Engine", styles['SecHeading']))
    report_data = [
        [Paragraph("Export Format", styles['TblHead']), Paragraph("MIME Type / Engine", styles['TblHead']), Paragraph("Document Contents &amp; Intended Clinical Use Case", styles['TblHead']), Paragraph("Verification Status", styles['TblHead'])],
        [Paragraph("<b>PDF Clinical Report</b>", styles['TblCellBold']), Paragraph("<code>application/pdf</code><br/>ReportLab 5.x", styles['TblCell']), Paragraph("Structured clinical summary: profile overview, AI concern breakdown, morning/evening routine tables, and active ingredient list.", styles['TblCell']), Paragraph("<font color='#059669'><b>Verified Stream</b></font><br/>P50 = 49.8ms in Docker", styles['TblCell'])],
        [Paragraph("<b>CSV Timeseries</b>", styles['TblCellBold']), Paragraph("<code>text/csv</code><br/>Streaming response", styles['TblCell']), Paragraph("Tabular dump of historical skin scores, hydration entries, sleep metrics, and routine compliance dates for spreadsheet analysis.", styles['TblCell']), Paragraph("<font color='#059669'><b>Verified Stream</b></font><br/>13.1 KB payload verified", styles['TblCell'])],
        [Paragraph("<b>XLSX Workbook</b>", styles['TblCellBold']), Paragraph("<code>application/vnd.ms-excel</code><br/>OpenPyXL", styles['TblCell']), Paragraph("Multi-tab structured workbook separating user profile, historical assessments, routine steps, and recommended product catalog.", styles['TblCell']), Paragraph("<font color='#059669'><b>Verified Stream</b></font><br/>19.0 KB payload verified", styles['TblCell'])],
    ]
    report_table = Table(report_data, colWidths=[PRINTABLE_WIDTH*0.22, PRINTABLE_WIDTH*0.22, PRINTABLE_WIDTH*0.38, PRINTABLE_WIDTH*0.18])
    report_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SLATE_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.6, SLATE_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, SLATE_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 1.8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.8),
        ('LEFTPADDING', (0,0), (-1,-1), 3.5),
        ('RIGHTPADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    p5_items.append(report_table)
    p5_items.append(Spacer(1, 1.5))
    p5_items.append(Paragraph(
        "<b>Notification Center:</b> In-app alerts notify users of Morning/Evening routines, hydration targets, and seasonal profile reviews. "
        "External SMS/email delivery requires configured third-party providers (Twilio / SendGrid); operates in console fallback when unconfigured.",
        styles['BodyStandard']
    ))

    story.extend(p5_items)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 6 — SECURITY + ROLES + DATABASE + ARCHITECTURE
    # =========================================================================
    p6_items = []
    p6_items.append(Paragraph("Security, Roles &amp; Technical Architecture", styles['PageHeading']))
    p6_items.append(Paragraph("Hardened multi-tier architecture implementing defense-in-depth, strict RBAC, and relational database modeling.", styles['PageSubheading']))
    p6_items.append(HRFlowable(width="100%", thickness=1, color=BLUE_ACCENT, spaceAfter=4, spaceBefore=0))

    # Section A: RBAC Table
    p6_items.append(Paragraph("Role-Based Access Control (RBAC) Architecture", styles['SecHeading']))
    rbac_data = [
        [Paragraph("Role Name", styles['TblHead']), Paragraph("Authorized Capabilities &amp; Purpose", styles['TblHead']), Paragraph("Security Enforcement &amp; Scope", styles['TblHead'])],
        [Paragraph("USER", styles['TblCellBold']), Paragraph("Personal skin assessment, routine generation, product browsing, personal analytics, and PDF reports.", styles['TblCell']), Paragraph("Strictly isolated to owned records via <code>user_id</code> database foreign keys.", styles['TblCell'])],
        [Paragraph("SKINCARE_CONSULTANT", styles['TblCellBold']), Paragraph("Authorized review of assigned client skin profiles, custom routine overrides, and consultation notes.", styles['TblCell']), Paragraph("Requires role claim; access restricted to explicit client-consultant assignments.", styles['TblCell'])],
        [Paragraph("DERMATOLOGIST", styles['TblCellBold']), Paragraph("Authorized clinical workspace access, review of AI diagnostic categories, and clinical reviews.", styles['TblCell']), Paragraph("Requires verified practitioner status; manages clinical review workflows.", styles['TblCell'])],
        [Paragraph("ADMIN", styles['TblCellBold']), Paragraph("Administrative system operations: user account controls, telemetry inspection, and audit logging.", styles['TblCell']), Paragraph("Full platform governance; protected by <code>require_roles('ADMIN')</code> middleware.", styles['TblCell'])],
    ]
    rbac_table = Table(rbac_data, colWidths=[PRINTABLE_WIDTH*0.25, PRINTABLE_WIDTH*0.45, PRINTABLE_WIDTH*0.30])
    rbac_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SLATE_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.6, SLATE_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, SLATE_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 1.8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.8),
        ('LEFTPADDING', (0,0), (-1,-1), 3.5),
        ('RIGHTPADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    p6_items.append(rbac_table)
    p6_items.append(Spacer(1, 2.5))

    # Section B & C: Security Architecture & Multi-User Isolation
    p6_items.append(Paragraph("Security Architecture &amp; Multi-User Isolation", styles['SecHeading']))
    sec_flow = ["USER", "AUTHENTICATION", "JWT VALIDATION", "ROLE CHECK (RBAC)", "PROTECTED API", "USER-OWNED DATA"]
    p6_items.append(make_flow_strip(sec_flow))
    p6_items.append(Spacer(1, 2))

    sec_cards = [
        [Paragraph("<b>JWT Authentication &amp; Password Security</b><br/><font color='#64748B'>• JWT tokens signed with HS256 algorithm and 1440-minute expiry.<br/>• PBKDF2-HMAC-SHA256 password hashing with 100k rounds &amp; salt.<br/>• Google OAuth2 ID token cryptographic backend signature verification.</font>", styles['TblCell']),
         Paragraph("<b>Telemetry Hardening &amp; Endpoint Protection</b><br/><font color='#64748B'>• <code>/api/system/telemetry</code> strictly restricted to authenticated ADMIN.<br/>• Rejects anonymous (401) and standard user (403) requests.<br/>• Rate limiting on contact OTP endpoints prevents brute-force attacks.</font>", styles['TblCell'])],
        [Paragraph("<b>Multi-User Isolation (Tenant Boundaries)</b><br/><font color='#64748B'>• User A (<code>user_id=1</code>) can never read or mutate User B's records.<br/>• Foreign key cascades isolate assessments, routines, logs, and photos.<br/>• Cross-tenant penetration verified: returns 404/403 on illegal access.</font>", styles['TblCell']),
         Paragraph("<b>Container &amp; HTTP Infrastructure Defense</b><br/><font color='#64748B'>• Backend runs under unprivileged <code>appuser</code> (UID 10001).<br/>• NGINX headers: X-Frame-Options: DENY, nosniff, XSS-Protection: 1.<br/>• Read-only bind mount for ML model weights prevents runtime tampering.</font>", styles['TblCell'])]
    ]
    sec_table = Table(sec_cards, colWidths=[PRINTABLE_WIDTH*0.5, PRINTABLE_WIDTH*0.5])
    sec_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), SLATE_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.6, SLATE_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, SLATE_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING', (0,0), (-1,-1), 3.5),
        ('RIGHTPADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    p6_items.append(sec_table)
    p6_items.append(Spacer(1, 2.5))

    # Section D: Relational Database Architecture (18 exact tables from models.py)
    p6_items.append(Paragraph("PostgreSQL Relational Database Schema (18 Tables)", styles['SecHeading']))
    db_clusters = [
        [Paragraph("Cluster Domain", styles['TblHead']), Paragraph("Actual Database Tables (from models.py)", styles['TblHead']), Paragraph("Relational Integrity &amp; Foreign Keys", styles['TblHead'])],
        [Paragraph("Identity &amp; Auth", styles['TblCellBold']), Paragraph("<code>users</code>, <code>email_verification_tokens</code>, <code>phone_otp_verifications</code>, <code>admin_audit_logs</code>", styles['TblCell']), Paragraph("Unique email index, password hashes, foreign key cascade to User.", styles['TblCell'])],
        [Paragraph("Profile &amp; State", styles['TblCellBold']), Paragraph("<code>skin_profiles</code>", styles['TblCell']), Paragraph("1-to-1 relationship with User; stores baseline skin, habits, and climate.", styles['TblCell'])],
        [Paragraph("AI &amp; Assessment", styles['TblCellBold']), Paragraph("<code>skin_assessments</code>, <code>image_analyses</code>", styles['TblCell']), Paragraph("Stores raw class probabilities, concern tags, and calculated health score.", styles['TblCell'])],
        [Paragraph("Routines &amp; Plans", styles['TblCellBold']), Paragraph("<code>skincare_routines</code>", styles['TblCell']), Paragraph("1-to-many routine structure (AM, PM, Weekly, Monthly, Seasonal).", styles['TblCell'])],
        [Paragraph("Ingredients", styles['TblCellBold']), Paragraph("<code>ingredients</code>, <code>ingredient_compatibility_checks</code>", styles['TblCell']), Paragraph("Active ingredient benefits, side effects, conflicts, and audit log checks.", styles['TblCell'])],
        [Paragraph("Product Catalog", styles['TblCellBold']), Paragraph("<code>products</code>, <code>product_recommendations</code>", styles['TblCell']), Paragraph("Catalog items, suitability scores, purchase links, and budget tiers.", styles['TblCell'])],
        [Paragraph("Diary &amp; Analytics", styles['TblCellBold']), Paragraph("<code>skincare_logs</code>, <code>skin_progress_photos</code>", styles['TblCell']), Paragraph("Daily morning/evening checklist adherence and historical progress photos.", styles['TblCell'])],
        [Paragraph("Clinical Workspace", styles['TblCellBold']), Paragraph("<code>consultations</code>, <code>clinical_reviews</code>", styles['TblCell']), Paragraph("Patient-consultant bookings, clinical notes, and routine overrides.", styles['TblCell'])],
        [Paragraph("Notifications", styles['TblCellBold']), Paragraph("<code>notifications</code>, <code>reminder_settings</code>", styles['TblCell']), Paragraph("Categorized alerts (ROUTINE, HYDRATION, SLEEP) and daily reminder times.", styles['TblCell'])],
    ]
    db_table = Table(db_clusters, colWidths=[PRINTABLE_WIDTH*0.22, PRINTABLE_WIDTH*0.45, PRINTABLE_WIDTH*0.33])
    db_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SLATE_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.6, SLATE_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, SLATE_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 1.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
        ('LEFTPADDING', (0,0), (-1,-1), 3.5),
        ('RIGHTPADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    p6_items.append(db_table)
    p6_items.append(Spacer(1, 2))

    # Section E: System Architecture Diagram
    p6_items.append(Paragraph("Physical Tiered System Architecture", styles['SecHeading']))
    sys_strip = ["USER BROWSER", "REACT + VITE SPA", "NGINX (PORT 80)", "FASTAPI (PORT 8000)", "AI MODEL / RULES", "POSTGRESQL (PORT 5432)"]
    p6_items.append(make_flow_strip(sys_strip))
    p6_items.append(Spacer(1, 1.5))
    p6_items.append(Paragraph(
        "<font size=7 color='#64748B'><i>External Integrations (where configured): Google OAuth2 Federation, Email SMTP Gateway, Twilio SMS Provider, Cloud Object Storage.</i></font>",
        styles['BodyStandard']
    ))

    story.extend(p6_items)
    story.append(PageBreak())

    # =========================================================================
    # PAGE 7 — COMPLETE WORKFLOW, DOCKER & VERIFICATION
    # =========================================================================
    p7_items = []
    p7_items.append(Paragraph("Complete Project Workflow, Docker &amp; Verification", styles['PageHeading']))
    p7_items.append(Paragraph("Full 18-step execution lifecycle, verified multi-container Docker topology, and empirical verification scorecard.", styles['PageSubheading']))
    p7_items.append(HRFlowable(width="100%", thickness=1, color=BLUE_ACCENT, spaceAfter=3, spaceBefore=0))

    # Section A: Complete 18-Step End-to-End Workflow (Grid of 6 rows x 3 cols)
    p7_items.append(Paragraph("Complete 18-Step End-to-End Execution Workflow", styles['SecHeading']))
    wf_steps = [
        ("1. Open Application", "User loads web client; NGINX serves Vite React SPA on port 80."),
        ("2. Register / Login", "User authenticates via email/password or OAuth; receives JWT token."),
        ("3. Verify Identity", "Email verification token and phone OTP safeguard user accounts."),
        ("4. Create Skin Profile", "User logs baseline skin type, tone, concerns, and sensitivities."),
        ("5. Enter Lifestyle Info", "User enters daily water intake, sleep quality, stress level, and UV."),
        ("6. Upload Skin Image", "User captures or uploads a close-up facial photo for AI assessment."),
        ("7. AI Skin Assessment", "EfficientNet-B0 infers probabilities across 8 condition categories."),
        ("8. Generate Concerns", "Personalization engine joins AI findings with questionnaire targets."),
        ("9. Calculate Health Score", "Deterministic 5-factor formula computes [0–100] barrier score."),
        ("10. Generate Routines", "Engine builds morning, evening, weekly, monthly, seasonal tiers."),
        ("11. Check Compatibility", "Rule engine checks active pairs, flagging Retinol + BHA conflicts."),
        ("12. Recommend Products", "Catalog matching ranks items by suitability, budget, and allergies."),
        ("13. Track Daily Progress", "User logs routine step execution and progress photos in daily diary."),
        ("14. View Analytics", "User tracks longitudinal score trends, acne delta, and adherence."),
        ("15. Generate Reports", "User or clinician exports clinical summaries via PDF, CSV, or XLSX."),
        ("16. Receive Notifications", "In-app alerts remind users of morning SPF, water, and evening care."),
        ("17. Adapt Routines", "Re-assessments recalibrate active treatment frequencies dynamically."),
        ("18. Long-Term Care", "User maintains barrier health with routine consistency and reviews.")
    ]
    
    wf_rows = []
    for i in range(0, len(wf_steps), 3):
        row = []
        for j in range(3):
            if i+j < len(wf_steps):
                st, sd = wf_steps[i+j]
                row.append(Paragraph(f"<b>{st}</b><br/><font color='#64748B'>{sd}</font>", styles['TblCell']))
            else:
                row.append(Paragraph("", styles['TblCell']))
        wf_rows.append(row)
    
    wf_table = Table(wf_rows, colWidths=[PRINTABLE_WIDTH/3]*3)
    wf_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), SLATE_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.6, SLATE_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, SLATE_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 1.2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.2),
        ('LEFTPADDING', (0,0), (-1,-1), 3),
        ('RIGHTPADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    p7_items.append(wf_table)
    p7_items.append(Spacer(1, 2))

    # Section B: Docker Multi-Container Architecture
    p7_items.append(Paragraph("Docker Architecture &amp; Verification Scorecard", styles['SecHeading']))
    doc_strip = ["DOCKER COMPOSE", "PostgreSQL 15 Container", "FastAPI Backend Container", "React + NGINX Container", "PyTorch AI Model Loading"]
    p7_items.append(make_flow_strip(doc_strip))
    p7_items.append(Spacer(1, 1.5))

    # Section C: Verification Scorecard (Grouped 11-row compact table)
    score_data = [
        [Paragraph("Subsystem / Component", styles['TblHead']), Paragraph("Status", styles['TblHead']), Paragraph("Empirical Verification Details &amp; Operational Boundary", styles['TblHead'])],
        [Paragraph("Docker Compose Stack", styles['TblCellBold']), Paragraph("<font color='#059669'><b>VERIFIED</b></font>", styles['TblCell']), Paragraph("3 containers (db, backend, frontend) healthy; internal bridge network; healthchecks pass.", styles['TblCell'])],
        [Paragraph("FastAPI Backend &amp; NGINX", styles['TblCellBold']), Paragraph("<font color='#059669'><b>VERIFIED</b></font>", styles['TblCell']), Paragraph("Python 3.11-slim, unprivileged appuser (UID 10001); NGINX reverse proxies port 80 to 8000.", styles['TblCell'])],
        [Paragraph("PostgreSQL Database", styles['TblCellBold']), Paragraph("<font color='#059669'><b>VERIFIED</b></font>", styles['TblCell']), Paragraph("PostgreSQL 15-alpine healthy; 18 tables initialized; persistent volume storage verified.", styles['TblCell'])],
        [Paragraph("AI Model Loading &amp; Inference", styles['TblCellBold']), Paragraph("<font color='#059669'><b>VERIFIED</b></font>", styles['TblCell']), Paragraph("EfficientNet-B0 loaded on CPU; P50 = 29.45ms, P95 = 36.07ms latency; 8 classes classified.", styles['TblCell'])],
        [Paragraph("Authentication &amp; RBAC", styles['TblCellBold']), Paragraph("<font color='#059669'><b>VERIFIED</b></font>", styles['TblCell']), Paragraph("JWT HS256 auth, 4 roles enforced, tenant data isolation verified (401/403/200 tests pass).", styles['TblCell'])],
        [Paragraph("Routines &amp; Ingredients", styles['TblCellBold']), Paragraph("<font color='#059669'><b>VERIFIED</b></font>", styles['TblCell']), Paragraph("5 routine tiers; dynamic adaptation; contraindications flag Retinol + Salicylic Acid.", styles['TblCell'])],
        [Paragraph("Recommendations &amp; Score", styles['TblCellBold']), Paragraph("<font color='#059669'><b>VERIFIED</b></font>", styles['TblCell']), Paragraph("Catalog suitability ranking (0–100); 5-factor formula (0.35C+0.20L+0.15S+0.20R+0.10H).", styles['TblCell'])],
        [Paragraph("Analytics &amp; Clinical Reports", styles['TblCellBold']), Paragraph("<font color='#059669'><b>VERIFIED</b></font>", styles['TblCell']), Paragraph("Diary logs and trend history; streamed PDF, CSV, and XLSX report downloads verified.", styles['TblCell'])],
        [Paragraph("Restart Recovery", styles['TblCellBold']), Paragraph("<font color='#059669'><b>VERIFIED</b></font>", styles['TblCell']), Paragraph("<code>docker compose down</code> followed by <code>up -d</code> restored all containers without data loss.", styles['TblCell'])],
        [Paragraph("External Cellular SMS", styles['TblCellBold']), Paragraph("<font color='#D97706'><b>CONFIG REQUIRED</b></font>", styles['TblCell']), Paragraph("Console fallback active; real cellular SMS requires external Twilio SID credentials.", styles['TblCell'])],
        [Paragraph("Cloud &amp; Clinical Validation", styles['TblCellBold']), Paragraph("<font color='#0284C7'><b>NEXT STAGE</b></font>", styles['TblCell']), Paragraph("Docker verified locally; cloud deployment (AWS/GCP) and clinical trials are future scope.", styles['TblCell'])],
    ]
    score_table = Table(score_data, colWidths=[PRINTABLE_WIDTH*0.25, PRINTABLE_WIDTH*0.22, PRINTABLE_WIDTH*0.53])
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BLUE_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.6, SLATE_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, SLATE_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 1.2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.2),
        ('LEFTPADDING', (0,0), (-1,-1), 3.5),
        ('RIGHTPADDING', (0,0), (-1,-1), 3.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    p7_items.append(score_table)
    p7_items.append(Spacer(1, 1.5))

    # Section D & E: Current Project Status & Future Scope
    stat_html = (
        "<b>Current Project Status:</b> Local Docker runtime verification has been completed. The application, database, "
        "AI inference pipeline, authentication, authorization, personalization workflow, reporting, and major security controls have "
        "been verified in the local containerized environment. Cloud deployment, production-domain configuration, and external service "
        "validation are subsequent stages."
    )
    fut_html = (
        "<b>Future Project Scope:</b><br/>"
        "• Cloud deployment on AWS ECS / GCP Cloud Run with production HTTPS domains.<br/>"
        "• Integration of production Twilio SMS and transactional email gateways.<br/>"
        "• Scalable cloud object storage migration (AWS S3 / Google Cloud Storage).<br/>"
        "• Retraining on larger diverse datasets and independent clinical trials."
    )
    status_table = Table([[Paragraph(stat_html, styles['CardText']), Paragraph(fut_html, styles['CardText'])]], colWidths=[PRINTABLE_WIDTH*0.5, PRINTABLE_WIDTH*0.5])
    status_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), SLATE_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.6, SLATE_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, SLATE_BORDER),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    p7_items.append(status_table)
    p7_items.append(Spacer(1, 1.5))

    # Section F: Final Summary Box
    final_summary_box = make_card(
        "FINAL PROJECT SUMMARY &amp; CONCLUSION",
        "The AI Skin Intelligence &amp; Personalized Skincare Planner combines computer vision, user profiling, personalization logic, "
        "skincare ingredient intelligence, product recommendation, and progress tracking into one integrated platform. The system transforms "
        "user-specific information and AI-assisted skin assessment into personalized skincare planning while applying authentication, "
        "authorization, and data-isolation controls. The current local Docker environment has been verified, with cloud deployment and "
        "external service configuration remaining as the next stage.",
        bg=SLATE_LIGHT, border=BLUE_ACCENT, title_style='CardHeading', body_style='CardText', padding=2.5
    )
    p7_items.append(final_summary_box)

    story.extend(p7_items)

    # Build Document
    print(f"Building {pdf_filename}...")
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF build complete: {pdf_filename}")

if __name__ == "__main__":
    build_pdf()
