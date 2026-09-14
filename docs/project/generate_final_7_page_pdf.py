"""
=============================================================================
MASTER PROJECT DOCUMENTATION GENERATOR: EXACTLY 7 PAGES
Project: AI Skin Intelligence & Personalized Skincare Planner
Deliverable: docs/project/AI_Skin_Intelligence_Personalized_Skincare_Planner_Final_7_Page.pdf

Target Audience: Mentors, Faculty, Evaluators, Technical Interviewers, Non-Technical Readers
Author: Senior Technical Documentation Engineer & Software Architect
Standard: A4 Portrait, Clean Academic Layout, Zero Secrets, Scientifically Conservative
=============================================================================
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
LEFT_MARGIN = 36.0    # 0.50 in
RIGHT_MARGIN = 36.0   # 0.50 in
TOP_MARGIN = 34.0     # ~0.47 in
BOTTOM_MARGIN = 34.0  # ~0.47 in
PRINTABLE_WIDTH = PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN   # 523.28 pt
PRINTABLE_HEIGHT = PAGE_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN # 773.89 pt

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
INDIGO_BG    = colors.HexColor("#EEF2FF")  # Indigo 50
INDIGO_LINE  = colors.HexColor("#6366F1")  # Indigo 500

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
        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(NAVY_PRIMARY)
        self.drawString(LEFT_MARGIN, PAGE_HEIGHT - 22, "AI SKIN INTELLIGENCE & PERSONALIZED SKINCARE PLANNER")
        
        self.setFont("Helvetica", 7.0)
        self.setFillColor(SLATE_MUTED)
        self.drawRightString(PAGE_WIDTH - RIGHT_MARGIN, PAGE_HEIGHT - 22, "Final Technical Project Documentation | Mentor & Evaluator Review")
        
        self.setStrokeColor(SLATE_BORDER)
        self.setLineWidth(0.5)
        self.line(LEFT_MARGIN, PAGE_HEIGHT - 26, PAGE_WIDTH - RIGHT_MARGIN, PAGE_HEIGHT - 26)
        
        # Running Footer (Bottom)
        self.setStrokeColor(SLATE_BORDER)
        self.setLineWidth(0.5)
        self.line(LEFT_MARGIN, 26, PAGE_WIDTH - RIGHT_MARGIN, 26)
        
        self.setFont("Helvetica", 7.0)
        self.setFillColor(SLATE_MUTED)
        self.drawString(LEFT_MARGIN, 15, "Production URL: https://ai-skin-intelligence-lakshmi-narayana-jampa.vercel.app | Cloud-Native Layered Architecture")
        
        # Page Number: Page X of 7
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(NAVY_PRIMARY)
        self.drawRightString(PAGE_WIDTH - RIGHT_MARGIN, 15, page_str)
        
        self.restoreState()


def get_document_styles():
    """Generates a cohesive, beautifully proportioned typography palette."""
    styles = getSampleStyleSheet()
    
    # Doc Main Title
    styles.add(ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=21,
        textColor=NAVY_DARK,
        spaceAfter=2
    ))
    styles.add(ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=BLUE_DARK,
        spaceAfter=3
    ))
    
    # Page Main Heading
    styles.add(ParagraphStyle(
        'PageHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13.5,
        leading=16.5,
        textColor=NAVY_DARK,
        spaceBefore=0,
        spaceAfter=2
    ))
    styles.add(ParagraphStyle(
        'PageSubhead',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.0,
        leading=10.5,
        textColor=SLATE_MUTED,
        spaceAfter=4
    ))
    
    # Section Heading
    styles.add(ParagraphStyle(
        'SecHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12.0,
        textColor=NAVY_PRIMARY,
        spaceBefore=3,
        spaceAfter=2
    ))
    
    # Sub-section Heading
    styles.add(ParagraphStyle(
        'SubSecHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11.0,
        textColor=BLUE_DARK,
        spaceBefore=2,
        spaceAfter=1.5
    ))

    # Standard Body
    styles.add(ParagraphStyle(
        'BodyStandard',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.0,
        leading=10.5,
        textColor=SLATE_TEXT,
        alignment=TA_LEFT
    ))
    styles.add(ParagraphStyle(
        'BodyJustify',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.0,
        leading=10.5,
        textColor=SLATE_TEXT,
        alignment=TA_JUSTIFY
    ))
    styles.add(ParagraphStyle(
        'BodySmall',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.4,
        leading=9.6,
        textColor=SLATE_TEXT
    ))
    styles.add(ParagraphStyle(
        'BodyMuted',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.0,
        leading=9.0,
        textColor=SLATE_MUTED
    ))
    
    # Feature Block Styles
    styles.add(ParagraphStyle(
        'FeatureTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.8,
        leading=11.0,
        textColor=NAVY_PRIMARY
    ))
    styles.add(ParagraphStyle(
        'FeatureText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.6,
        leading=9.8,
        textColor=SLATE_TEXT
    ))
    
    # Table Content Styles
    styles.add(ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=WHITE,
        alignment=TA_LEFT
    ))
    styles.add(ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.3,
        leading=9.3,
        textColor=SLATE_TEXT
    ))
    styles.add(ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.3,
        leading=9.3,
        textColor=NAVY_PRIMARY
    ))
    styles.add(ParagraphStyle(
        'TableCellCenter',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.0,
        leading=8.8,
        textColor=SLATE_TEXT,
        alignment=TA_CENTER
    ))
    styles.add(ParagraphStyle(
        'TableCellCenterBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.0,
        leading=8.8,
        textColor=NAVY_PRIMARY,
        alignment=TA_CENTER
    ))
    
    # Badge / Callout Styles
    styles.add(ParagraphStyle(
        'DisclaimerText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.3,
        leading=9.3,
        textColor=NAVY_PRIMARY,
        alignment=TA_CENTER
    ))

    return styles


def create_meta_banner(styles, width):
    """Creates top metadata strip for Page 1."""
    text = (
        "<b>Live Production URL:</b> <font color='#0284C7'><u>https://ai-skin-intelligence-lakshmi-narayana-jampa.vercel.app</u></font> &nbsp;|&nbsp; "
        "<b>Production Alias:</b> <font color='#0284C7'><u>https://ai-skin-intelligence-gilt.vercel.app</u></font><br/>"
        "<b>Stack:</b> React 18 + Vite &nbsp;|&nbsp; Python FastAPI &nbsp;|&nbsp; Neon PostgreSQL &nbsp;|&nbsp; "
        "EfficientNet-B0 (Repo Checkpoint) &nbsp;|&nbsp; Fallback Inference on Vercel Serverless"
    )
    p = Paragraph(text, styles['BodySmall'])
    t = Table([[p]], colWidths=[width])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BLUE_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.5, BLUE_MED),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    return t


def create_feature_box(title, what, how, why, example, styles, width, accent_color=BLUE_ACCENT, bg_color=SLATE_LIGHT):
    """Creates a standardized 4-part feature explanation block as mandated by the prompt."""
    content = [
        Paragraph(f"<b>{title}</b>", styles['FeatureTitle']),
        Spacer(1, 1.5),
        Paragraph(f"<b>What it does:</b> {what}", styles['FeatureText']),
        Paragraph(f"<b>How it works:</b> {how}", styles['FeatureText']),
        Paragraph(f"<b>Why it is useful:</b> {why}", styles['FeatureText']),
        Paragraph(f"<b>Example:</b> <font color='#0369A1'><i>{example}</i></font>", styles['FeatureText']),
    ]
    t = Table([[content]], colWidths=[width])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_color),
        ('BOX', (0,0), (-1,-1), 0.5, SLATE_BORDER),
        ('LINELEFT', (0,0), (0,0), 3.5, accent_color),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    return t


def create_disclaimer_box(text, styles, width):
    """Creates prominent medical disclaimer callout."""
    p = Paragraph(f"<b>IMPORTANT CLINICAL &amp; REGULATORY NOTICE:</b><br/>{text}", styles['DisclaimerText'])
    t = Table([[p]], colWidths=[width])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), AMBER_BG),
        ('BOX', (0,0), (-1,-1), 0.8, AMBER_BORDER),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    return t


# =============================================================================
# BUILD MASTER 7-PAGE DOCUMENT
# =============================================================================

def generate_final_7_page_pdf():
    output_dir = os.path.join(os.getcwd(), "docs", "project")
    os.makedirs(output_dir, exist_ok=True)
    pdf_path = os.path.join(output_dir, "AI_Skin_Intelligence_Personalized_Skincare_Planner_Final_7_Page.pdf")
    
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=LEFT_MARGIN,
        rightMargin=RIGHT_MARGIN,
        topMargin=TOP_MARGIN,
        bottomMargin=BOTTOM_MARGIN
    )
    
    styles = get_document_styles()
    story = []
    col_w2 = (PRINTABLE_WIDTH - 8) / 2.0
    col_w8 = PRINTABLE_WIDTH / 8.0
    
    # -------------------------------------------------------------------------
    # PAGE 1 — PROJECT OVERVIEW
    # -------------------------------------------------------------------------
    story.append(Paragraph("AI Skin Intelligence &amp; Personalized Skincare Planner", styles['DocTitle']))
    story.append(Paragraph("Comprehensive Technical Documentation &amp; System Evaluation Report &nbsp;|&nbsp; 7-Page Master Architecture Review", styles['DocSubtitle']))
    story.append(Spacer(1, 1))
    story.append(create_meta_banner(styles, PRINTABLE_WIDTH))
    story.append(Spacer(1, 4))
    
    # Executive Summary
    exec_summary_text = (
        "<b>Executive Summary:</b> The <b>AI Skin Intelligence &amp; Personalized Skincare Planner</b> is an end-to-end, "
        "cloud-deployed multi-user web application engineered to eliminate speculative, trial-and-error cosmetic regimens "
        "by delivering data-driven, individualized skincare planning. By synthesizing visual machine learning assessment, "
        "a 12-factor biological and environmental profile (skin type, age tier, lifestyle pacing, sleep hygiene, hydration, UV index), "
        "and chemical ingredient contraindication intelligence, the platform generates chronobiological morning, evening, "
        "weekly, and seasonal routines with verified product recommendations. Built on a resilient stack featuring a React 18 SPA, "
        "a FastAPI asynchronous REST core, and Neon Managed PostgreSQL, the system guarantees cryptographic authentication, "
        "multi-tenant data isolation, longitudinal progress tracking, and multi-format clinical exports while operating under "
        "a transparent, scientifically conservative non-medical advisory mandate."
    )
    story.append(Paragraph(exec_summary_text, styles['BodyJustify']))
    story.append(Spacer(1, 4))
    
    # Diagram 1: System Workflow Flowchart
    story.append(Paragraph("<b>System Architecture Workflow &amp; User Progression Flow:</b>", styles['SecHeading']))
    
    d1_c1 = Paragraph("<b>1. Profile</b><br/><font size=6.2 color='#334155'>12-factor wizard</font>", styles['TableCellCenter'])
    d1_c2 = Paragraph("<b>2. Skin Scan</b><br/><font size=6.2 color='#334155'>AI / Fallback</font>", styles['TableCellCenter'])
    d1_c3 = Paragraph("<b>3. AI Logic</b><br/><font size=6.2 color='#334155'>Concern priority</font>", styles['TableCellCenter'])
    d1_c4 = Paragraph("<b>4. Scoring</b><br/><font size=6.2 color='#334155'>5-Factor Score</font>", styles['TableCellCenter'])
    d1_c5 = Paragraph("<b>5. Routine</b><br/><font size=6.2 color='#334155'>AM/PM schedule</font>", styles['TableCellCenter'])
    d1_c6 = Paragraph("<b>6. Products</b><br/><font size=6.2 color='#334155'>INR matches</font>", styles['TableCellCenter'])
    d1_c7 = Paragraph("<b>7. Diary</b><br/><font size=6.2 color='#334155'>Checklist &amp; photo</font>", styles['TableCellCenter'])
    d1_c8 = Paragraph("<b>8. Reports</b><br/><font size=6.2 color='#334155'>PDF, CSV, XLSX</font>", styles['TableCellCenter'])
    
    flow_table = Table([[d1_c1, d1_c2, d1_c3, d1_c4, d1_c5, d1_c6, d1_c7, d1_c8]], colWidths=[col_w8]*8)
    flow_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), SLATE_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.5, BLUE_ACCENT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, SLATE_BORDER),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 2),
        ('RIGHTPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(flow_table)
    story.append(Spacer(1, 4))
    
    # 2-Column Structured Overview: Problem & Solution | Target Users & Outcomes
    p1_left = [
        Paragraph("<b>1. Problem Statement &amp; Market Need</b>", styles['SubSecHeading']),
        Paragraph(
            "&bull;&nbsp;<b>Consumer Confusion &amp; Active Stacking:</b> Consumers frequently suffer from product overuse, "
            "chemical contraindications (e.g. stacking Retinoids with direct AHA/BHA acids), and adverse barrier reactions caused by unverified advice.<br/>"
            "&bull;&nbsp;<b>Static, Generic Formulations:</b> Mass-market retail platforms recommend products based strictly on coarse skin categories "
            "(oily vs dry), ignoring sleep deficit, systemic hydration, environmental UV pollution, and localized climate.<br/>"
            "&bull;&nbsp;<b>Absence of Longitudinal Tracking:</b> Users lack systematic tooling to track whether active cosmetic ingredients "
            "produce empirical skin health improvements over 30 to 90-day biological cellular turnover cycles.",
            styles['BodySmall']
        ),
        Spacer(1, 4),
        Paragraph("<b>2. Proposed Solution &amp; Innovation</b>", styles['SubSecHeading']),
        Paragraph(
            "&bull;&nbsp;<b>Multidimensional Diagnostic Synthesis:</b> Unifies visual condition classification with personal lifestyle habits to establish an objective baseline.<br/>"
            "&bull;&nbsp;<b>Automated Chemical Safety Engine:</b> Evaluates 8 cosmetic active families, detects dangerous chemical conflicts, and cross-references declared personal allergies.<br/>"
            "&bull;&nbsp;<b>Adaptive Chronobiological Planning:</b> Formulates AM protection routines (antioxidants, SPF) and PM cellular repair routines (retinoids, peptides) that dynamically adapt between assessments.",
            styles['BodySmall']
        )
    ]
    
    p1_right = [
        Paragraph("<b>3. Target User Roles &amp; Ecosystem</b>", styles['SubSecHeading']),
        Paragraph(
            "&bull;&nbsp;<b>Skincare Consumers:</b> Everyday individuals seeking customized routines, allergen protection, INR budget curation, and daily compliance tracking.<br/>"
            "&bull;&nbsp;<b>Skincare Consultants:</b> Wellness advisors reviewing client profiles, managing recommendations, and monitoring longitudinal adherence.<br/>"
            "&bull;&nbsp;<b>Dermatologists:</b> Medical practitioners reviewing longitudinal photo records, clinical logs, and objective score trajectories.<br/>"
            "&bull;&nbsp;<b>System Administrators:</b> Platform engineers overseeing role authorization, data telemetry, security audits, and catalog integrity.",
            styles['BodySmall']
        ),
        Spacer(1, 4),
        Paragraph("<b>4. Key Verified Project Outcomes</b>", styles['SubSecHeading']),
        Paragraph(
            "&bull;&nbsp;<b>Live Cloud Production:</b> Publicly accessible web application on Vercel backed by managed Neon PostgreSQL with zero cross-tenant leakage.<br/>"
            "&bull;&nbsp;<b>Empirical Health Metric:</b> Strictly bounded 5-factor scoring model ([0.0, 100.0]) combining clinical, lifestyle, sleep, and compliance factors.<br/>"
            "&bull;&nbsp;<b>INR Budget &amp; Retail Routing:</b> Commercial recommendation engine supporting Indian Rupee tiers (Budget, Mid, Premium) with live multi-store links.<br/>"
            "&bull;&nbsp;<b>Verified Zero-Secret Codebase:</b> Full test suite pass (161/161 automated tests, 28/28 cloud E2E checks) with zero hardcoded credentials.",
            styles['BodySmall']
        )
    ]
    
    p1_table = Table([[p1_left, p1_right]], colWidths=[col_w2, col_w2])
    p1_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(p1_table)
    story.append(Spacer(1, 4))
    
    # Why Project is Useful Card
    why_useful_text = (
        "<b>Why This Project Is Useful:</b> Skincare is biologically personal and chemically complex. By uniting computer vision heuristics, "
        "relational ingredient safety rules, and longitudinal adherence tracking in an accessible web interface, the platform bridges the divide between "
        "expensive clinical dermatology consultations and inaccessible mass-market guesswork. It gives consumers evidence-based routine sovereignty while "
        "providing clinical professionals with structured, user-scoped progress records."
    )
    why_table = Table([[Paragraph(why_useful_text, styles['BodySmall'])]], colWidths=[PRINTABLE_WIDTH])
    why_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), TEAL_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.5, TEAL_ACCENT),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(why_table)
    story.append(PageBreak())

    # -------------------------------------------------------------------------
    # PAGE 2 — SYSTEM ARCHITECTURE & TECHNOLOGY
    # -------------------------------------------------------------------------
    story.append(Paragraph("2. System Architecture &amp; Technology Stack", styles['PageHeading']))
    story.append(Paragraph("Decoupled Multi-Tier Cloud Topology, Serverless Edge Routing, and Component Reconciliation", styles['PageSubhead']))
    story.append(Spacer(1, 2))
    
    arch_overview_p = Paragraph(
        "<b>Architectural Strategy:</b> The application employs a cloud-native layered architecture optimized for rapid sub-second edge response, "
        "strict data segregation, and resilient serverless execution. The presentation layer is a React 18 single-page application (SPA) bundled via Vite. "
        "API calls route over TLS 1.3 to a high-performance Python FastAPI service bridged to Vercel Serverless via an ASGI wrapper. Data persistence is governed "
        "by Neon Serverless PostgreSQL with connection pooling and schema versioning via Alembic. External authentication integrates Google OAuth 2.0.",
        styles['BodyJustify']
    )
    story.append(arch_overview_p)
    story.append(Spacer(1, 4))
    
    # Diagram 2: System Architecture Schematic (Table-based vector representation)
    story.append(Paragraph("<b>End-to-End System Architecture &amp; Data Communication Topology:</b>", styles['SecHeading']))
    
    arch_t_w = PRINTABLE_WIDTH
    tier_client = Paragraph("<b>CLIENT PRESENTATION LAYER (Web Browser / Mobile Viewport)</b><br/><font size=6.8 color='#334155'>React 18.2 SPA &nbsp;|&nbsp; Vite Build Pipeline &nbsp;|&nbsp; Axios Client &nbsp;|&nbsp; AuthContext (JWT) &nbsp;|&nbsp; Responsive Vanilla CSS &amp; Bootstrap 5</font>", styles['TableCellCenter'])
    tier_edge = Paragraph("<b>EDGE ROUTING &amp; CDN HOSTING (Vercel Serverless Global Platform)</b><br/><font size=6.8 color='#334155'>Global Edge Anycast &nbsp;|&nbsp; HTTPS / TLS 1.3 Termination &nbsp;|&nbsp; Static Asset CDN &nbsp;|&nbsp; Same-Origin `/api` Route Proxy &nbsp;|&nbsp; GZip / Brotli</font>", styles['TableCellCenter'])
    tier_api = Paragraph("<b>APPLICATION BACKEND SERVICE (FastAPI ASGI Service &mdash; Python 3.11)</b><br/><font size=6.8 color='#334155'>Pydantic v2 Validation &nbsp;|&nbsp; PBKDF2 Password Hashing &nbsp;|&nbsp; JWT Token Lifecycle &nbsp;|&nbsp; RBAC Dependencies &nbsp;|&nbsp; Recommendation Core</font>", styles['TableCellCenter'])
    tier_db = Paragraph("<b>MANAGED DATA PERSISTENCE LAYER (Neon Serverless PostgreSQL 16)</b><br/><font size=6.8 color='#334155'>18 Application Tables + Alembic Migration Tracking &nbsp;|&nbsp; Foreign Key Tenant Scoping (<code>user_id</code>) &nbsp;|&nbsp; B-Tree Indexing &nbsp;|&nbsp; SQLAlchemy 2.0 ORM</font>", styles['TableCellCenter'])
    
    tier_ext_active = Paragraph("<b>CURRENTLY ACTIVE EXTERNAL SERVICES</b><br/><font size=6.5 color='#065F46'>&bull;&nbsp;<b>Google OAuth 2.0:</b> Verified Production Domain Origin<br/>&bull;&nbsp;<b>In-Memory Generators:</b> ReportLab (PDF), openpyxl (XLSX), pandas (CSV)</font>", styles['TableCell'])
    tier_ext_future = Paragraph("<b>EXTERNAL CONFIGURATION REQUIRED / FUTURE SERVICES</b><br/><font size=6.5 color='#92400E'>&bull;&nbsp;<b>Persistent Media Storage:</b> AWS S3 / Cloudflare R2 / Vercel Blob<br/>&bull;&nbsp;<b>Live Carrier Messaging:</b> Twilio (Cellular SMS), SendGrid (SMTP Email)<br/>&bull;&nbsp;<b>Dedicated AI GPU Cluster:</b> Full PyTorch EfficientNet Inference Container / Service</font>", styles['TableCell'])
    
    arch_flow_table = Table([
        [tier_client],
        [Paragraph("<font color='#0284C7'><b>&darr; HTTPS / JSON REST API Communication</b></font>", styles['TableCellCenterBold'])],
        [tier_edge],
        [Paragraph("<font color='#0284C7'><b>&darr; ASGI Serverless Bridge Proxy (`api/index.py`)</b></font>", styles['TableCellCenterBold'])],
        [tier_api],
        [Paragraph("<font color='#0284C7'><b>&darr; SQLAlchemy ORM Connection Pool (`asyncpg` / Session Engine)</b></font>", styles['TableCellCenterBold'])],
        [tier_db],
        [Table([[tier_ext_active, tier_ext_future]], colWidths=[(arch_t_w-16)/2.0, (arch_t_w-16)/2.0])]
    ], colWidths=[arch_t_w])
    
    arch_flow_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), BLUE_LIGHT),
        ('BOX', (0,0), (0,0), 0.5, BLUE_ACCENT),
        ('BACKGROUND', (0,2), (0,2), SLATE_LIGHT),
        ('BOX', (0,2), (0,2), 0.5, SLATE_BORDER),
        ('BACKGROUND', (0,4), (0,4), INDIGO_BG),
        ('BOX', (0,4), (0,4), 0.5, INDIGO_LINE),
        ('BACKGROUND', (0,6), (0,6), GREEN_BG),
        ('BOX', (0,6), (0,6), 0.5, GREEN_BORDER),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(arch_flow_table)
    story.append(Spacer(1, 4))
    
    # Technology Reconciliation Table: Implemented vs Planned
    story.append(Paragraph("<b>Technology Stack Reconciliation: Implemented Production Stack vs Original Proposal:</b>", styles['SecHeading']))
    
    tech_hdr = [
        Paragraph("<b>Architecture Layer</b>", styles['TableHeader']),
        Paragraph("<b>Actual Implemented Technology</b>", styles['TableHeader']),
        Paragraph("<b>Original Proposed Stack</b>", styles['TableHeader']),
        Paragraph("<b>Current Status &amp; Architectural Role</b>", styles['TableHeader'])
    ]
    tech_rows = [
        tech_hdr,
        [
            Paragraph("<b>Frontend SPA</b>", styles['TableCellBold']),
            Paragraph("React 18.2, Vite 5, JavaScript, Vanilla CSS, Bootstrap 5", styles['TableCell']),
            Paragraph("React.js, Next.js, Tailwind CSS", styles['TableCell']),
            Paragraph("<font color='#065F46'><b>IMPLEMENTED &amp; VERIFIED:</b></font> Fast Vite build (1.33s), zero compilation errors.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Backend API</b>", styles['TableCellBold']),
            Paragraph("Python 3.11, FastAPI 0.115, Pydantic v2, Uvicorn ASGI", styles['TableCell']),
            Paragraph("FastAPI, Python", styles['TableCell']),
            Paragraph("<font color='#065F46'><b>IMPLEMENTED &amp; VERIFIED:</b></font> 84 REST endpoints registered, async request lifecycle.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Database</b>", styles['TableCellBold']),
            Paragraph("Neon Serverless PostgreSQL 16, SQLAlchemy 2.0, Alembic", styles['TableCell']),
            Paragraph("PostgreSQL (Primary) + MongoDB (Secondary)", styles['TableCell']),
            Paragraph("<font color='#065F46'><b>IMPLEMENTED &amp; VERIFIED:</b></font> 18 application tables plus alembic_version migration tracking; user-scoped records.", styles['TableCell'])
        ],
        [
            Paragraph("<b>AI Vision Core</b>", styles['TableCellBold']),
            Paragraph("PyTorch EfficientNet-B0 (Repo Checkpoint) + Deterministic Fallback (Vercel)", styles['TableCell']),
            Paragraph("TensorFlow, Scikit-learn, PyTorch", styles['TableCell']),
            Paragraph("<font color='#92400E'><b>PARTIALLY VERIFIED:</b></font> 8-class model in repo (15.6MB); Vercel uses deterministic fallback.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Authentication</b>", styles['TableCellBold']),
            Paragraph("JWT (HS256 access/refresh), PBKDF2-SHA256, Google OAuth", styles['TableCell']),
            Paragraph("JWT Authentication, OAuth2", styles['TableCell']),
            Paragraph("<font color='#065F46'><b>IMPLEMENTED &amp; VERIFIED:</b></font> Google OAuth origin whitelisted for Vercel production.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Cloud &amp; DevOps</b>", styles['TableCellBold']),
            Paragraph("Vercel Serverless Production + Docker Compose Verified", styles['TableCell']),
            Paragraph("AWS / Azure, Docker", styles['TableCell']),
            Paragraph("<font color='#065F46'><b>IMPLEMENTED &amp; VERIFIED:</b></font> Cloud-native layered architecture; public on Vercel.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Media Storage</b>", styles['TableCellBold']),
            Paragraph("Serverless Ephemeral (`/tmp` uploads buffer)", styles['TableCell']),
            Paragraph("Persistent Cloud Object Storage", styles['TableCell']),
            Paragraph("<font color='#92400E'><b>CONFIG REQUIRED:</b></font> Persistent S3 / Vercel Blob bucket needed for long-term photos.", styles['TableCell'])
        ],
        [
            Paragraph("<b>Notifications</b>", styles['TableCellBold']),
            Paragraph("In-App Notification Center + Server Console Simulation", styles['TableCell']),
            Paragraph("External Cellular SMS &amp; SMTP Email", styles['TableCell']),
            Paragraph("<font color='#92400E'><b>CONFIG REQUIRED:</b></font> App logic verified; requires live Twilio/SendGrid credentials.", styles['TableCell'])
        ],
    ]
    
    t_tech = Table(tech_rows, colWidths=[65, 160, 130, 168.28])
    t_tech.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, SLATE_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, SLATE_LIGHT]),
    ]))
    story.append(t_tech)
    story.append(PageBreak())

    # -------------------------------------------------------------------------
    # PAGE 3 — AUTHENTICATION, ROLES & USER PROFILE
    # -------------------------------------------------------------------------
    story.append(Paragraph("3. Authentication, Roles &amp; User Profile Management", styles['PageHeading']))
    story.append(Paragraph("Role-Based Access Control, Session Governance, and Multi-Dimensional Baseline Profiling", styles['PageSubhead']))
    story.append(Spacer(1, 2))
    
    # Feature 1: Authentication & RBAC (Prompt format)
    f1 = create_feature_box(
        title="FEATURE 1 &mdash; USER AUTHENTICATION &amp; ROLE-BASED ACCESS CONTROL (RBAC)",
        what="Provides secure identity verification, cryptographic session management, and granular permission enforcement across 4 discrete system roles.",
        how="Issues short-lived HS256 JWT access tokens paired with secure rotating refresh tokens. Passwords are salted and hashed using PBKDF2-HMAC-SHA256 (100,000 rounds). Google OAuth credentials are token-verified server-side. FastAPI dependencies enforce role-based guards on every protected API endpoint.",
        why="Prevents credential interception, enforces the principle of least privilege, protects administrative infrastructure, and provides distinct user experiences.",
        example="A registered consumer logs in, receives a scoped JWT, and can view their personal routines. Attempting to call `/api/system/telemetry` or admin user rosters returns an immediate HTTP 403 Forbidden.",
        styles=styles,
        width=PRINTABLE_WIDTH,
        accent_color=BLUE_ACCENT,
        bg_color=BLUE_LIGHT
    )
    story.append(f1)
    story.append(Spacer(1, 4))
    
    # Diagram 3: Role Diagram & Registration Gate
    story.append(Paragraph("<b>Role Authorization Hierarchy &amp; Public Registration Gate:</b>", styles['SecHeading']))
    
    role_user = Paragraph("<b>ROLE: USER</b><br/><font size=6.4 color='#334155'>&bull;&nbsp;<b>Registration:</b> Immediate Active<br/>&bull;&nbsp;<b>Capabilities:</b> Complete 12-factor wizard, upload assessment photos, generate routines, browse INR products, log daily compliance, export reports.</font>", styles['TableCell'])
    role_consult = Paragraph("<b>ROLE: SKINCARE_CONSULTANT</b><br/><font size=6.4 color='#334155'>&bull;&nbsp;<b>Registration:</b> Verification Required<br/>&bull;&nbsp;<b>Capabilities:</b> Access client portfolios, review baseline assessments, customize product regimens, provide professional notes.</font>", styles['TableCell'])
    role_derm = Paragraph("<b>ROLE: DERMATOLOGIST</b><br/><font size=6.4 color='#334155'>&bull;&nbsp;<b>Registration:</b> Verification Required<br/>&bull;&nbsp;<b>Capabilities:</b> Inspect patient records, audit photo timelines, review diagnostic histories, provide medical guidance.</font>", styles['TableCell'])
    role_admin = Paragraph("<b>ROLE: ADMIN</b><br/><font size=6.4 color='#92400E'>&bull;&nbsp;<b>Registration:</b> STRICTLY FORBIDDEN<br/>&bull;&nbsp;<b>Capabilities:</b> User management, system telemetry, audit logs, catalog curation (Must be provisioned by authorized admin).</font>", styles['TableCell'])
    
    col_w4 = PRINTABLE_WIDTH / 4.0
    role_table = Table([[role_user, role_consult, role_derm, role_admin]], colWidths=[col_w4]*4)
    role_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), SLATE_LIGHT),
        ('BOX', (0,0), (0,0), 0.5, BLUE_ACCENT),
        ('BACKGROUND', (1,0), (1,0), SLATE_LIGHT),
        ('BOX', (1,0), (1,0), 0.5, TEAL_ACCENT),
        ('BACKGROUND', (2,0), (2,0), SLATE_LIGHT),
        ('BOX', (2,0), (2,0), 0.5, INDIGO_LINE),
        ('BACKGROUND', (3,0), (3,0), AMBER_BG),
        ('BOX', (3,0), (3,0), 1.0, AMBER_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(role_table)
    story.append(Spacer(1, 4))
    
    # Feature 2: Skin Profile Management (Prompt format)
    f2 = create_feature_box(
        title="FEATURE 2 &mdash; COMPREHENSIVE SKIN PROFILE MANAGEMENT",
        what="Captures, serializes, and persists a 12-dimensional biological, lifestyle, and environmental baseline for individualized skincare planning.",
        how="A structured frontend wizard captures user parameters into the `skin_profiles` PostgreSQL table with Pydantic validation. The data model records physiological attributes, habits, and environmental exposure metrics that serve as input weights for the routine and recommendation engines.",
        why="Eliminates the flaw of one-size-fits-all skincare. A person with oily skin in high UV exposure requires fundamentally different care than an oily-skin user in dry, indoor air.",
        example="A 28-year-old female declares 'Dry' skin, high screen exposure, 5 hours sleep, and a 'Fragrance' allergy. The system penalizes fragranced items and prioritizes ceramide barrier moisturizers.",
        styles=styles,
        width=PRINTABLE_WIDTH,
        accent_color=TEAL_ACCENT,
        bg_color=TEAL_LIGHT
    )
    story.append(f2)
    story.append(Spacer(1, 4))
    
    # The 12 Profile Inputs Breakdown
    story.append(Paragraph("<b>The 12 Baseline Profile Dimensions &amp; Their Personalization Impact:</b>", styles['SecHeading']))
    
    profile_p1 = Paragraph(
        "&bull;&nbsp;<b>1. Skin Type:</b> Dry, Oily, Normal, Combination, or Sensitive. Determines baseline lipid and moisture requirements.<br/>"
        "&bull;&nbsp;<b>2. Age Group:</b> Under 18, 18-29, 30-45, 46+. Dictates cellular turnover rate and collagen support requirements.<br/>"
        "&bull;&nbsp;<b>3. Primary Concerns:</b> Acne, Hyperpigmentation, Wrinkles, Redness, Pores, Uneven Tone. Drives active ingredient selection.<br/>"
        "&bull;&nbsp;<b>4. Known Allergies:</b> Declared sensitivities (Fragrance, Alcohol, Nuts, Parabens). Applies severe recommendation penalties.<br/>"
        "&bull;&nbsp;<b>5. Skin Sensitivity Rating:</b> Self-reported barrier reactivity tier (1-5). Dictates active chemical concentration caps.<br/>"
        "&bull;&nbsp;<b>6. Daily Water Intake:</b> Daily fluid consumption in liters. Directly influences the Hydration component of the Health Score.",
        styles['BodySmall']
    )
    profile_p2 = Paragraph(
        "&bull;&nbsp;<b>7. Sleep Hygiene:</b> Average nocturnal sleep hours. Informs cellular repair weighting and night treatment intensity.<br/>"
        "&bull;&nbsp;<b>8. Sun &amp; UV Exposure:</b> Daily outdoor exposure index. Controls broad-spectrum SPF rating and antioxidant boosting.<br/>"
        "&bull;&nbsp;<b>9. Stress &amp; Lifestyle Pace:</b> Daily stress tier. Modulates cortisol-related inflammation and barrier soothing factors.<br/>"
        "&bull;&nbsp;<b>10. Routine Experience:</b> Skincare experience level (Novice to Advanced). Restricts advanced chemical exfoliants for novices.<br/>"
        "&bull;&nbsp;<b>11. Cosmetic Makeup Usage:</b> Frequency of cosmetic use. Informs double-cleansing requirements and micellar oil inclusion.<br/>"
        "&bull;&nbsp;<b>12. Environmental Climate:</b> Local ambient humidity and temperature. Adapts seasonal routine weightings.",
        styles['BodySmall']
    )
    
    profile_table = Table([[profile_p1, profile_p2]], colWidths=[col_w2, col_w2])
    profile_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 1),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
    ]))
    story.append(profile_table)
    story.append(PageBreak())

    # -------------------------------------------------------------------------
    # PAGE 4 — AI SKIN INTELLIGENCE & PERSONALIZATION
    # -------------------------------------------------------------------------
    story.append(Paragraph("4. AI Skin Intelligence &amp; Personalization Engine", styles['PageHeading']))
    story.append(Paragraph("Diagnostic Vision Inference, Algorithmic Routine Synthesis, Ingredient Safety &amp; Health Scoring", styles['PageSubhead']))
    story.append(Spacer(1, 2))
    
    # Feature 3: AI Skin Assessment Engine (Prompt format)
    f3 = create_feature_box(
        title="FEATURE 3 &mdash; AI-ASSISTED SKIN ASSESSMENT ENGINE",
        what="Performs visual condition analysis on uploaded facial photographs to detect dermatological conditions, prioritize concerns, and evaluate barrier integrity.",
        how="Preprocesses images to 224x224x3 normalized tensors. Locally, executes PyTorch EfficientNet-B0 trained on 8 clinical condition classes: (1) Acneiform &amp; Follicular Disorders, (2) Eczematous &amp; Inflammatory Dermatitis, (3) Infections &amp; Infestations, (4) Papulosquamous Disorders, (5) Trauma &amp; Insect Bites, (6) Urticaria &amp; Reactive Rashes, (7) Vascular &amp; Purpuric Conditions, and (8) Other Clinical Disorders. In serverless production on Vercel, executes a deterministic fallback due to package limits. Maps predictions into 6 condition indicators (Acne, Redness, Dryness, Oiliness, Sensitivity, Hyperpigmentation).",
        why="Replaces subjective consumer self-assessment with standardized visual feature extraction, alerting users to subtle barrier degradation or redness.",
        example="An image exhibiting cheek erythema produces a prioritized concern of 'Urticaria &amp; Reactive Rashes' mapped to Redness (75% confidence), tuning subsequent routine steps to favor soothing panthenol over harsh scrubs.",
        styles=styles,
        width=PRINTABLE_WIDTH,
        accent_color=BLUE_ACCENT,
        bg_color=BLUE_LIGHT
    )
    story.append(f3)
    story.append(Spacer(1, 2.5))
    
    # AI Deployment Status Notice + Medical Disclaimer
    ai_status_text = (
        "<b>AI Model Deployment Notice:</b> Production currently uses the fallback inference path on Vercel, while the trained 8-class EfficientNet-B0 model "
        "(15.61 MB, 84.2% validation accuracy, 0.825 macro F1 from model metadata) is preserved in <code>ml/models/</code> and can be deployed through a dedicated containerized service.<br/>"
        "<b>Medical Disclaimer:</b> This platform is an AI-assisted skincare intelligence system and is not a substitute for professional medical diagnosis or treatment."
    )
    story.append(create_disclaimer_box(ai_status_text, styles, PRINTABLE_WIDTH))
    story.append(Spacer(1, 2.5))
    
    # Feature 4: Personalized Routine Generator (Prompt format)
    f4 = create_feature_box(
        title="FEATURE 4 &mdash; PERSONALIZED ROUTINE GENERATOR",
        what="Synthesizes assessment outputs and profile constraints into tailored Morning (AM), Evening (PM), Weekly, Seasonal, and Adaptive regimens.",
        how="Applies chronobiological rules: AM routines prioritize environmental protection (Cleansing, Antioxidants, Moisturizing, Broad-Spectrum Sun Protection); PM routines prioritize cellular repair (Double Cleanse, Targeted Actives, Barrier Creams). Adaptive routine logic detects deltas between Assessment N and N-1 to tune active frequencies.",
        why="Skincare efficacy requires chronological discipline. Applying photosensitizing Retinoids in the morning causes UV damage; skipping evening moisturizers impairs nocturnal recovery.",
        example="A dry, sensitive profile receives an AM routine of Gentle Milk Cleanser + Hyaluronic Acid + Ceramide Cream + Mineral SPF 50, and a PM routine adding 2% Niacinamide, strictly omitting harsh AHA peels.",
        styles=styles,
        width=PRINTABLE_WIDTH,
        accent_color=TEAL_ACCENT,
        bg_color=TEAL_LIGHT
    )
    story.append(f4)
    story.append(Spacer(1, 2.5))
    
    # Feature 5: Ingredient Intelligence
    f5_what = "Evaluates chemical active compatibility, detects dangerous contraindications, explains biochemical actions, and cross-references user allergies."
    f5_how = "Maintains a curated active database (Retinoids, Niacinamide, Vitamin C, Hyaluronic Acid, Salicylic Acid, Ceramides, Peptides, AHAs/BHAs). Cross-checks routine combinations for dangerous interactions (e.g. Retinol + Direct L-Ascorbic Acid) and applies a severe -40 point penalty for declared allergens."
    f5_why = "Prevents chemical burns, contact dermatitis, and barrier disruption caused by stacking incompatible actives."
    f5_ex = "Flagging: 'Potential conflict: Retinol and Glycolic Acid (AHA) should not be layered simultaneously in the PM routine to prevent barrier peeling.'"
    
    f5 = create_feature_box(
        title="FEATURE 5 &mdash; INGREDIENT INTELLIGENCE &amp; CHEMICAL CONFLICT DETECTION",
        what=f5_what, how=f5_how, why=f5_why, example=f5_ex,
        styles=styles, width=PRINTABLE_WIDTH, accent_color=INDIGO_LINE, bg_color=INDIGO_BG
    )
    story.append(f5)
    story.append(Spacer(1, 2.5))
    
    # Feature 7: Skin Health Scoring Engine
    f7_title = "FEATURE 7 &mdash; SKIN HEALTH SCORING ENGINE (5-FACTOR DETERMINISTIC MODEL)"
    f7_formula = "<b>Overall Skin Health Score = 35% Skin Condition Assessment + 20% Lifestyle Habits + 15% Sleep Quality + 20% Routine Consistency + 10% Hydration Level</b>"
    f7_desc = (
        "The Skin Health Score is a bounded [0.0, 100.0] composite metric synthesizing objective condition assessment and personal habits:<br/>"
        "&bull;&nbsp;<b>35% Skin Condition Assessment:</b> Evaluates active concerns (acne, redness, dryness, sensitivity) and barrier harmony.<br/>"
        "&bull;&nbsp;<b>20% Lifestyle Habits:</b> Evaluates daily stress tier, physical activity level, and outdoor sun/UV exposure.<br/>"
        "&bull;&nbsp;<b>20% Routine Consistency:</b> Evaluates historical compliance against scheduled morning and evening routine steps.<br/>"
        "&bull;&nbsp;<b>15% Sleep Quality:</b> Evaluates nocturnal restorative sleep duration (optimal: 7-9 hours; penalized below 6 hours).<br/>"
        "&bull;&nbsp;<b>10% Hydration Level:</b> Evaluates daily water intake (optimal: &ge; 2.5 liters/day).<br/>"
        "<i>Missing Data Handling:</i> Unrecorded inputs use neutral baselines (Condition=60, Lifestyle=55, Sleep=55, Hydration=55). This score is an empirical wellness metric, not a clinical medical diagnosis."
    )
    f7_content = [
        Paragraph(f"<b>{f7_title}</b>", styles['FeatureTitle']),
        Spacer(1, 1),
        Paragraph(f7_formula, styles['TableCellBold']),
        Spacer(1, 1),
        Paragraph(f7_desc, styles['BodySmall'])
    ]
    t_f7 = Table([[f7_content]], colWidths=[PRINTABLE_WIDTH])
    t_f7.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), GREEN_BG),
        ('BOX', (0,0), (-1,-1), 0.5, GREEN_BORDER),
        ('LINELEFT', (0,0), (0,0), 3.5, GREEN_BORDER),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_f7)
    story.append(Spacer(1, 3))
    
    # Diagram 4: AI Personalization Flow Diagram (Mandated in prompt)
    story.append(Paragraph("<b>Visual Diagram: AI Personalization &amp; Routine Formulation Pipeline:</b>", styles['SecHeading']))
    
    p_box1 = Paragraph("<b>1. Input Vector</b><br/><font size=6 color='#334155'>Facial Photo + 12-Factor Wizard</font>", styles['TableCellCenter'])
    p_box2 = Paragraph("<b>2. AI Inference</b><br/><font size=6 color='#334155'>EfficientNet / Fallback Heuristics</font>", styles['TableCellCenter'])
    p_box3 = Paragraph("<b>3. Health Score</b><br/><font size=6 color='#334155'>5-Factor Weighted Synthesis</font>", styles['TableCellCenter'])
    p_box4 = Paragraph("<b>4. Safety Engine</b><br/><font size=6 color='#334155'>Chemical Conflicts &amp; Allergies</font>", styles['TableCellCenter'])
    p_box5 = Paragraph("<b>5. Regimen Output</b><br/><font size=6 color='#334155'>AM / PM / Weekly Regimen</font>", styles['TableCellCenter'])
    
    col_w5 = PRINTABLE_WIDTH / 5.0
    diag4_table = Table([[p_box1, p_box2, p_box3, p_box4, p_box5]], colWidths=[col_w5]*5)
    diag4_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), SLATE_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.5, INDIGO_LINE),
        ('INNERGRID', (0,0), (-1,-1), 0.5, SLATE_BORDER),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 2),
        ('RIGHTPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(diag4_table)
    story.append(PageBreak())

    # -------------------------------------------------------------------------
    # PAGE 5 — PRODUCTS, DASHBOARDS, PROGRESS & REPORTS
    # -------------------------------------------------------------------------
    story.append(Paragraph("5. Products, Dashboards, Progress Tracking &amp; Reports", styles['PageHeading']))
    story.append(Paragraph("Algorithmic Product Recommendations, Multi-Role Workspaces, Longitudinal Analytics, and Data Export", styles['PageSubhead']))
    story.append(Spacer(1, 2))
    
    # Feature 6: Product Recommendation Engine (Prompt format)
    f6 = create_feature_box(
        title="FEATURE 6 &mdash; ALGORITHMIC PRODUCT RECOMMENDATION ENGINE",
        what="Computes personalized product suitability scores, supports side-by-side comparison, recommends cost-effective alternatives, and enforces budget caps.",
        how="Evaluates catalog formulations against user profile vectors and condition scores. Computes percentage match scores, filters products into Indian Rupee tiers (Budget &le; INR 1,500, Mid-Range INR 1,500 - 4,000, Premium INR 4,000+), and provides verified direct product/store links (Nykaa, Tira, Purplle, Amazon.in).",
        why="Directs users to commercially accessible, clinically rational products without vendor bias or commercial distortion.",
        example="For an oily, acne-prone profile, the engine ranks *Paula's Choice 2% BHA* at 94.7% match, while for a dry, barrier-impaired profile it assigns *Cicaplast Baume B5+* at 99.7% and highlights an INR 1,946 cheaper alternative.",
        styles=styles,
        width=PRINTABLE_WIDTH,
        accent_color=BLUE_ACCENT,
        bg_color=BLUE_LIGHT
    )
    story.append(f6)
    story.append(Spacer(1, 2.5))
    
    story.append(Paragraph(
        "<b>Important Architectural Clarification:</b> The platform performs <i>algorithmic suitability matching</i> against catalog metadata; "
        "it does <b>NOT</b> claim to recognize commercial product bottles or cosmetic packaging from camera photographs.",
        styles['BodyMuted']
    ))
    story.append(Spacer(1, 3))
    
    # Feature 8: Progress Tracking & Feature 9: Dashboards (2 Columns)
    f8_left = [
        Paragraph("<b>FEATURE 8 &mdash; PROGRESS TRACKING &amp; DIARY</b>", styles['SubSecHeading']),
        Paragraph(
            "&bull;&nbsp;<b>What it does:</b> Logs daily routine adherence, records periodic selfie check-ins, tracks skin health score trends, and records user-scoped chronological progress records and uploaded images.<br/>"
            "&bull;&nbsp;<b>How it works:</b> Users complete daily checklist items and upload progress photos. Logs are timestamped in PostgreSQL, generating longitudinal trajectory charts.<br/>"
            "&bull;&nbsp;<b>Why it is useful:</b> Correlates habit compliance with observable barrier recovery rather than assessing skin on a single isolated day.<br/>"
            "&bull;&nbsp;<b>Example:</b> A user tracking compliance over 21 days observes their Skin Health Score rise from 62 to 78, confirming barrier stabilization.",
            styles['BodySmall']
        ),
        Spacer(1, 3),
        Paragraph("<b>FEATURE 10 &mdash; NOTIFICATIONS &amp; REMINDERS</b>", styles['SubSecHeading']),
        Paragraph(
            "&bull;&nbsp;<b>What it does:</b> Dispatches morning/evening routine reminders, hydration nudges, and product replenishment alerts.<br/>"
            "&bull;&nbsp;<b>How it works:</b> Evaluates user schedule preferences. In production Vercel, dispatches in-app notifications and server console logs (live cellular SMS and SMTP require external provider API keys).<br/>"
            "&bull;&nbsp;<b>Why it is useful:</b> Prevents routine abandonment and reinforces consistent skincare habits.",
            styles['BodySmall']
        )
    ]
    
    f9_right = [
        Paragraph("<b>FEATURE 9 &mdash; MULTI-ROLE DASHBOARDS (AUDITED)</b>", styles['SubSecHeading']),
        Paragraph(
            "&bull;&nbsp;<b>User Dashboard (<font color='#065F46'>VERIFIED</font>):</b> Displays composite Skin Health Score, active AM/PM routines, top product recommendations, daily checklist, and progress analytics.<br/>"
            "&bull;&nbsp;<b>Consultant Dashboard (<font color='#065F46'>VERIFIED ARCHITECTURE</font>):</b> Client management directory, assessment report review, and routine customization oversight.<br/>"
            "&bull;&nbsp;<b>Dermatologist Dashboard (<font color='#065F46'>VERIFIED ARCHITECTURE</font>):</b> Clinical patient directory, diagnostic photo timeline, and longitudinal condition trend inspection.<br/>"
            "&bull;&nbsp;<b>Admin Dashboard (<font color='#065F46'>VERIFIED &amp; HARDENED</font>):</b> User roster, RBAC authorization, system telemetry probe, and platform security status.",
            styles['BodySmall']
        ),
        Spacer(1, 3),
        Paragraph("<b>FEATURE 11 &mdash; REPORTS &amp; MULTI-FORMAT EXPORT</b>", styles['SubSecHeading']),
        Paragraph(
            "&bull;&nbsp;<b>What it does:</b> Compiles comprehensive skin assessments, regimens, and diary logs into downloadable PDF, CSV, and XLSX formats.<br/>"
            "&bull;&nbsp;<b>How it works:</b> Generates in-memory binary streams via ReportLab, openpyxl, and pandas; streams directly to client browser.<br/>"
            "&bull;&nbsp;<b>Why it is useful:</b> Allows users to share portable, formatted records with dermatologists or personal physicians.",
            styles['BodySmall']
        )
    ]
    
    p5_split_table = Table([[f8_left, f9_right]], colWidths=[col_w2, col_w2])
    p5_split_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 1),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
    ]))
    story.append(p5_split_table)
    story.append(Spacer(1, 3))
    
    # Diagram 5: End-to-End User Journey Diagram
    story.append(Paragraph("<b>End-to-End User Operational Journey:</b>", styles['SecHeading']))
    
    j1 = Paragraph("<b>1. Authentication</b><br/><font size=6 color='#334155'>Register / Google</font>", styles['TableCellCenter'])
    j2 = Paragraph("<b>2. Profile Wizard</b><br/><font size=6 color='#334155'>12-factor data</font>", styles['TableCellCenter'])
    j3 = Paragraph("<b>3. Skin Scan</b><br/><font size=6 color='#334155'>AI / Fallback</font>", styles['TableCellCenter'])
    j4 = Paragraph("<b>4. Scoring</b><br/><font size=6 color='#334155'>5-Factor Score</font>", styles['TableCellCenter'])
    j5 = Paragraph("<b>5. Routine</b><br/><font size=6 color='#334155'>AM/PM regimen</font>", styles['TableCellCenter'])
    j6 = Paragraph("<b>6. Products</b><br/><font size=6 color='#334155'>INR matches</font>", styles['TableCellCenter'])
    j7 = Paragraph("<b>7. Diary</b><br/><font size=6 color='#334155'>Daily compliance</font>", styles['TableCellCenter'])
    j8 = Paragraph("<b>8. Export</b><br/><font size=6 color='#334155'>PDF, CSV, XLSX</font>", styles['TableCellCenter'])
    
    journey_table = Table([[j1, j2, j3, j4, j5, j6, j7, j8]], colWidths=[col_w8]*8)
    journey_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), TEAL_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.5, TEAL_ACCENT),
        ('INNERGRID', (0,0), (-1,-1), 0.5, SLATE_BORDER),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 2),
        ('RIGHTPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(journey_table)
    story.append(Spacer(1, 3))
    
    # Product Catalog Architecture Card
    cat_text = (
        "<b>Commercial Catalog Architecture &amp; Direct Store Integration:</b> The catalog comprises 13 verified commercial products from 9 leading dermatological "
        "and cosmetic brands (<i>CeraVe, La Roche-Posay, Paula's Choice, The Ordinary, SkinCeuticals, EltaMD, COSRX, The Inkey List, Neutrogena</i>). "
        "Each product record contains normalized active ingredient percentages, target skin concerns, contraindications, and verified direct product/store links across 4 major "
        "beauty retailers: <b>Nykaa, Tira Beauty, Purplle, and Amazon.in</b>. Deep links open securely in new browser tabs with strict <code>rel='noopener noreferrer'</code> attributes (no affiliate tracking)."
    )
    cat_table = Table([[Paragraph(cat_text, styles['BodySmall'])]], colWidths=[PRINTABLE_WIDTH])
    cat_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), SLATE_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.5, SLATE_BORDER),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(cat_table)
    story.append(PageBreak())

    # -------------------------------------------------------------------------
    # PAGE 6 — SECURITY, DATABASE, PERFORMANCE & TESTING
    # -------------------------------------------------------------------------
    story.append(Paragraph("6. Security, Database, Performance &amp; Testing Evidence", styles['PageHeading']))
    story.append(Paragraph("Data Persistence, Multi-User Isolation, Official Evaluation Metrics, and Empirical Benchmark Evidence", styles['PageSubhead']))
    story.append(Spacer(1, 2))
    
    # Database Persistence & Multi-User Isolation
    p6_sec_text = (
        "<b>Database Persistence &amp; Session Lifecycle:</b> User data is stored in Neon Managed Serverless PostgreSQL across 18 application tables "
        "(plus alembic_version migration tracking). The PostgreSQL relational schema enforces foreign-key relationships and user-scoped records. "
        "<b>Logging out does NOT delete user database records.</b> When a user authenticates again, the system verifies their credentials, extracts "
        "their unique <code>user_id</code> from the JWT session, and restores their exact dashboard state.<br/>"
        "<b>Multi-User Isolation:</b> Strict tenant segregation is enforced at the database query layer: all private records are queried with "
        "<code>WHERE user_id = current_user.id</code>. User B cannot access, read, or mutate User A's private records (returning HTTP 403 Forbidden or 404 Not Found). "
        "Dedicated penetration tests validated zero unauthorized cross-tenant leakage across all endpoints.<br/>"
        "<b>Google Authentication Security:</b> The frontend receives a verified Google ID token and posts it to the backend. The backend validates "
        "the cryptographic token against Google's public keys, provisions or matches the user, and issues a standard JWT session. Production Google "
        "OAuth configuration was verified with the production domain registered as an authorized JavaScript origin. Zero secrets are exposed."
    )
    story.append(Paragraph(p6_sec_text, styles['BodySmall']))
    story.append(Spacer(1, 2.5))
    
    # Official Project Evaluation Metrics Defined (from Original PDF)
    story.append(Paragraph("<b>Official Project Evaluation Metric Framework (Original Scope Definitions):</b>", styles['SecHeading']))
    
    m_p1 = Paragraph(
        "&bull;&nbsp;<b>Skin Assessment Metrics:</b> Skin concern classification accuracy, skin scoring consistency across repeat scans, and clinical recommendation relevance.<br/>"
        "&bull;&nbsp;<b>Product Recommendation Metrics:</b> Product suitability accuracy, recommendation precision (% matching declared constraints), and user satisfaction score.<br/>"
        "&bull;&nbsp;<b>Progress Tracking Metrics:</b> Routine adherence tracking accuracy, longitudinal improvement quality, and user daily compliance rate.",
        styles['BodySmall']
    )
    m_p2 = Paragraph(
        "&bull;&nbsp;<b>Analytics Metrics:</b> Skin health scoring consistency over time, recommendation effectiveness, and 30-day user retention rate.<br/>"
        "&bull;&nbsp;<b>System Performance Metrics:</b> API response time, dashboard loading latency, recommendation generation duration, and concurrent user capacity.",
        styles['BodySmall']
    )
    m_table = Table([[m_p1, m_p2]], colWidths=[col_w2, col_w2])
    m_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 1),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
    ]))
    story.append(m_table)
    story.append(Spacer(1, 2.5))
    
    # Verified Quantitative Results Table
    story.append(Paragraph("<b>Actual Verified Quantitative Results (Local Benchmarks &amp; Production Audits):</b>", styles['SecHeading']))
    
    bench_hdr = [
        Paragraph("<b>Evaluated Dimension</b>", styles['TableHeader']),
        Paragraph("<b>Empirical Measurement</b>", styles['TableHeader']),
        Paragraph("<b>Test Harness &amp; Environment</b>", styles['TableHeader']),
        Paragraph("<b>Classification &amp; Source Traceability</b>", styles['TableHeader'])
    ]
    bench_rows = [
        bench_hdr,
        [
            Paragraph("<b>Reported AI Accuracy</b>", styles['TableCellBold']),
            Paragraph("<b>84.2%</b> validation accuracy", styles['TableCell']),
            Paragraph("SCIN clinical category metadata", styles['TableCell']),
            Paragraph("<code>improved_model_metadata.json:18</code> (Reported in Metadata)", styles['TableCell'])
        ],
        [
            Paragraph("<b>Reported Macro F1</b>", styles['TableCellBold']),
            Paragraph("<b>0.825</b> macro F1 score", styles['TableCell']),
            Paragraph("SCIN clinical category metadata", styles['TableCell']),
            Paragraph("<code>improved_model_metadata.json:19</code> (Reported in Metadata)", styles['TableCell'])
        ],
        [
            Paragraph("<b>Local Model Benchmark</b>", styles['TableCellBold']),
            Paragraph("<b>P50: 56.37 ms</b> &nbsp;|&nbsp; <b>P95: 79.77 ms</b>", styles['TableCell']),
            Paragraph("30 CPU cycles, 224x224x3 tensor", styles['TableCell']),
            Paragraph("LOCAL MODEL BENCHMARK (PyTorch CPU, Measured Locally)", styles['TableCell'])
        ],
        [
            Paragraph("<b>Production Cloud Latency</b>", styles['TableCellBold']),
            Paragraph("<b>P50: 506.8 ms</b> &nbsp;|&nbsp; <b>P95: 757.1 ms</b>", styles['TableCell']),
            Paragraph("Live Vercel Serverless HTTP roundtrip", styles['TableCell']),
            Paragraph("PRODUCTION CLOUD HTTP BENCHMARK (Cloud Measured)", styles['TableCell'])
        ],
        [
            Paragraph("<b>Production Cloud E2E</b>", styles['TableCellBold']),
            Paragraph("<b>28 / 28 PASS (100.0%)</b>", styles['TableCell']),
            Paragraph("Live cloud endpoint verification suite", styles['TableCell']),
            Paragraph("Cloud Staging Readiness Audit (Cloud Verified)", styles['TableCell'])
        ],
        [
            Paragraph("<b>Automated Pytest Suite</b>", styles['TableCellBold']),
            Paragraph("<b>161 / 161 PASS (100.0%)</b>", styles['TableCell']),
            Paragraph("Automated Testing &amp; Security Verification", styles['TableCell']),
            Paragraph("backend/tests/ (12 test modules, 161 tests)", styles['TableCell'])
        ],
        [
            Paragraph("<b>Database Query Time</b>", styles['TableCellBold']),
            Paragraph("<b>0.43 ms - 1.08 ms</b> mean latency", styles['TableCell']),
            Paragraph("PostgreSQL 16 warm cache queries", styles['TableCell']),
            Paragraph("<code>benchmark_results_raw.json:374</code> (Measured Locally)", styles['TableCell'])
        ],
        [
            Paragraph("<b>Frontend Build Time</b>", styles['TableCellBold']),
            Paragraph("<b>1.33 seconds</b> (Vite production)", styles['TableCell']),
            Paragraph("Node 20 / Vite compiler, 0 errors", styles['TableCell']),
            Paragraph("Frontend Production Build Check (Local / CI)", styles['TableCell'])
        ],
    ]
    
    t_bench = Table(bench_rows, colWidths=[105, 125, 140, 153.28])
    t_bench.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, SLATE_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, SLATE_LIGHT]),
    ]))
    story.append(t_bench)
    story.append(Spacer(1, 2.5))
    
    # Project Goals vs Current Status Table
    story.append(Paragraph("<b>Project Engineering Goals vs Current Verified Implementation Status:</b>", styles['SecHeading']))
    
    goals_hdr = [
        Paragraph("<b>Functional Area</b>", styles['TableHeader']),
        Paragraph("<b>Original Engineering Goal</b>", styles['TableHeader']),
        Paragraph("<b>Current Implementation &amp; Verification Status</b>", styles['TableHeader'])
    ]
    goals_rows = [
        goals_hdr,
        [Paragraph("<b>Authentication</b>", styles['TableCellBold']), Paragraph("Secure account access &amp; RBAC", styles['TableCell']), Paragraph("<font color='#065F46'><b>VERIFIED:</b></font> JWT, Google OAuth, PBKDF2 hashing, 4 roles active.", styles['TableCell'])],
        [Paragraph("<b>Data Persistence</b>", styles['TableCellBold']), Paragraph("Preserve user records across sessions", styles['TableCell']), Paragraph("<font color='#065F46'><b>VERIFIED:</b></font> Neon PostgreSQL permanently retains all user data across logins.", styles['TableCell'])],
        [Paragraph("<b>User Isolation</b>", styles['TableCellBold']), Paragraph("Prevent cross-user private data access", styles['TableCell']), Paragraph("<font color='#065F46'><b>VERIFIED:</b></font> Strict <code>user_id</code> scoping; penetration tests confirmed zero leakage.", styles['TableCell'])],
        [Paragraph("<b>Skin Assessment</b>", styles['TableCellBold']), Paragraph("Identify and prioritize skin concerns", styles['TableCell']), Paragraph("<font color='#065F46'><b>IMPLEMENTED:</b></font> Fallback active on Vercel; EfficientNet weights preserved.", styles['TableCell'])],
        [Paragraph("<b>Personalized Routine</b>", styles['TableCellBold']), Paragraph("Generate chronobiological regimens", styles['TableCell']), Paragraph("<font color='#065F46'><b>VERIFIED:</b></font> AM/PM/Weekly/Seasonal generator and adaptive engine functional.", styles['TableCell'])],
        [Paragraph("<b>Product Recommendation</b>", styles['TableCellBold']), Paragraph("Curate suitable products by budget", styles['TableCell']), Paragraph("<font color='#065F46'><b>VERIFIED:</b></font> 13 catalog items, INR budget filters, 4 verified store buy links.", styles['TableCell'])],
        [Paragraph("<b>Skin Health Score</b>", styles['TableCellBold']), Paragraph("Consistent, bounded 5-factor scoring", styles['TableCell']), Paragraph("<font color='#065F46'><b>VERIFIED:</b></font> Strictly bounded [0, 100], sum of weights = 1.00, median baselines.", styles['TableCell'])],
        [Paragraph("<b>Progress Analytics</b>", styles['TableCellBold']), Paragraph("Track improvement and score trajectory", styles['TableCell']), Paragraph("<font color='#065F46'><b>VERIFIED:</b></font> Daily compliance checklist, historical photo diary queries active.", styles['TableCell'])],
        [Paragraph("<b>Image Storage</b>", styles['TableCellBold']), Paragraph("Permanent cloud storage for photos", styles['TableCell']), Paragraph("<font color='#92400E'><b>FUTURE CONFIG:</b></font> Ephemeral <code>/tmp</code> on serverless; requires AWS S3 / Cloud Blob.", styles['TableCell'])],
    ]
    t_goals = Table(goals_rows, colWidths=[110, 160, 253.28])
    t_goals.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY_PRIMARY),
        ('GRID', (0,0), (-1,-1), 0.5, SLATE_BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 1.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.5),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [WHITE, SLATE_LIGHT]),
    ]))
    story.append(t_goals)
    story.append(Spacer(1, 3))
    
    # Diagram 6: Multi-User Isolation & Scoping Schematic (Mandated in prompt)
    iso_a = Paragraph("<b>USER A SESSION (JWT Token: user_id=101)</b><br/><font size=6.2 color='#334155'>FastAPI Dependency: <code>current_user.id == 101</code> &rarr; <code>SELECT * FROM routines WHERE user_id=101</code> &rarr; <b>User A Private Records Only</b></font>", styles['TableCell'])
    iso_cross = Paragraph("<b>CROSS-TENANT ATTACK (User B attempts reading User A records)</b><br/><font size=6.2 color='#92400E'>Request with Token B (<code>user_id=102</code>) &rarr; SQL Filter blocks mismatch &rarr; <b>BLOCKED: 403 Forbidden / 404 (0 Leaks)</b></font>", styles['TableCell'])
    iso_b = Paragraph("<b>USER B SESSION (JWT Token: user_id=102)</b><br/><font size=6.2 color='#334155'>FastAPI Dependency: <code>current_user.id == 102</code> &rarr; <code>SELECT * FROM routines WHERE user_id=102</code> &rarr; <b>User B Private Records Only</b></font>", styles['TableCell'])
    
    iso_table = Table([[iso_a], [iso_cross], [iso_b]], colWidths=[PRINTABLE_WIDTH])
    iso_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), BLUE_LIGHT),
        ('BACKGROUND', (0,1), (-1,1), AMBER_BG),
        ('BACKGROUND', (0,2), (-1,2), TEAL_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.5, SLATE_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, SLATE_BORDER),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))
    story.append(Paragraph("<b>Visual Diagram: Multi-User Data Isolation &amp; Relational Foreign-Key Scoping Flow:</b>", styles['SecHeading']))
    story.append(iso_table)
    story.append(PageBreak())

    # -------------------------------------------------------------------------
    # PAGE 7 — PROJECT RESULTS, LIMITATIONS & FUTURE SCOPE
    # -------------------------------------------------------------------------
    story.append(Paragraph("7. Project Results, Limitations &amp; Future Scope", styles['PageHeading']))
    story.append(Paragraph("Completed Engineering Milestones, Honest Technical Disclosures, and Strategic Roadmap", styles['PageSubhead']))
    story.append(Spacer(1, 2))
    
    # Project Achievements Summary
    achieve_text = (
        "<b>Summary of Verified Achievements:</b> The project has successfully translated a 15-page academic architecture specification into an "
        "active, cloud-deployed production system. Key verified achievements include: (1) Live public Vercel production deployment backed by managed "
        "Neon PostgreSQL; (2) Persistent multi-user database architecture with zero cross-tenant leakage; (3) Multi-tiered RBAC enforcing strict role separation; "
        "(4) Google OAuth 2.0 integration configured with production domain whitelisting; (5) Multidimensional skin profiling across 12 distinct lifestyle/biological "
        "factors; (6) Defensive skin assessment pipeline pairing trained 8-class PyTorch weights with deterministic serverless fallback; (7) Chronobiological routine "
        "generator with chemical conflict and allergy detection; (8) Algorithmic product recommendation engine supporting Indian Rupee (INR) budget filtering "
        "and product/store links; (9) Bounded 5-factor Skin Health Scoring engine; (10) Longitudinal progress tracking diary with user-scoped records; "
        "(11) In-memory multi-format report exports (PDF, CSV, XLSX); and (12) Automated Testing &amp; Security Verification with 161/161 automated test passes, "
        "28/28 cloud E2E checks, and zero leaked credentials."
    )
    story.append(Paragraph(achieve_text, styles['BodySmall']))
    story.append(Spacer(1, 3))
    
    # Current Limitations (5 Explicit Disclosures)
    story.append(Paragraph("<b>Explicit Current Limitations &amp; Technical Constraints:</b>", styles['SecHeading']))
    
    lim_1 = Paragraph(
        "<b>1. Serverless PyTorch Fallback:</b> The full PyTorch and torchvision runtime packages exceed standard Vercel serverless deployment size "
        "constraints. As a result, <b>production Vercel currently uses the fallback inference path</b>, while the fully trained 8-class EfficientNet-B0 model "
        "(<code>skin_condition_improved.pth</code>, 15.61 MB) is preserved in the repository and ready for deployment via a dedicated containerized inference service.",
        styles['BodySmall']
    )
    lim_2 = Paragraph(
        "<b>2. Ephemeral Photo Storage:</b> User diagnostic upload photos are currently stored in the serverless container's <code>/tmp</code> buffer. "
        "Because serverless runtimes are stateless, long-term photo timeline durability requires the configuration of an external cloud object storage bucket "
        "(such as AWS S3, Cloudflare R2, or Vercel Blob).",
        styles['BodySmall']
    )
    lim_3 = Paragraph(
        "<b>3. Console Notification Delivery:</b> While routine reminder and alert business logic is fully verified in code, production currently executes "
        "in <code>CONSOLE</code> simulation mode. Delivering live cellular SMS or external SMTP emails requires provisioning active Twilio or SendGrid API credentials.",
        styles['BodySmall']
    )
    lim_4 = Paragraph(
        "<b>4. Professional Account Verification Workflow:</b> The Skincare Consultant and Dermatologist roles are architected to require administrative "
        "verification before clinical capabilities are activated. Self-registration places requests into a pending verification queue.",
        styles['BodySmall']
    )
    lim_5 = Paragraph(
        "<b>5. Non-Medical Advisory Scope:</b> The platform operates strictly as an AI-assisted cosmetic intelligence planner. <b>It does not claim clinical "
        "efficacy, disease diagnosis, or dermatologist replacement</b>, and includes appropriate advisory disclaimers on all diagnostic outputs.",
        styles['BodySmall']
    )
    
    lim_table = Table([[lim_1], [lim_2], [lim_3], [lim_4], [lim_5]], colWidths=[PRINTABLE_WIDTH])
    lim_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), AMBER_BG),
        ('BOX', (0,0), (-1,-1), 0.5, AMBER_BORDER),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('INNERGRID', (0,0), (-1,-1), 0.5, SLATE_BORDER),
    ]))
    story.append(lim_table)
    story.append(Spacer(1, 3))
    
    # Future Scope & Strategic Roadmap
    story.append(Paragraph("<b>Future Scope &amp; Strategic Expansion Roadmap:</b>", styles['SecHeading']))
    
    fut_p1 = Paragraph(
        "&bull;&nbsp;<b>Dedicated AI Inference Microservice:</b> Deploy the trained EfficientNet-B0 PyTorch model on a dedicated GPU microservice "
        "(AWS SageMaker, Google Cloud Vertex AI, or Modal) with low-latency REST endpoints to serve full convolutional inference in production.<br/>"
        "&bull;&nbsp;<b>Persistent Cloud Object Storage:</b> Integrate AWS S3 or Cloudflare R2 with pre-signed access URLs to provide durable, secure progress photo timelines.<br/>"
        "&bull;&nbsp;<b>Clinical Dermatologist Collaboration:</b> Conduct blinded clinical trials with certified dermatologists to independently evaluate classification accuracy and recommendation efficacy across diverse Fitzpatrick skin types.",
        styles['BodySmall']
    )
    fut_p2 = Paragraph(
        "&bull;&nbsp;<b>Native Mobile Application:</b> Develop cross-platform iOS and Android mobile apps using React Native, utilizing on-device camera hardware for direct lighting-calibrated facial scans.<br/>"
        "&bull;&nbsp;<b>Live Carrier Messaging:</b> Connect production Twilio SMS and SendGrid SMTP gateways for real-time mobile routine alerts and replenishment reminders.<br/>"
        "&bull;&nbsp;<b>Continuous Feedback Learning Loop:</b> Ingest longitudinal user tolerance logs and adherence outcomes to dynamically fine-tune recommendation suitability scores.",
        styles['BodySmall']
    )
    fut_table = Table([[fut_p1, fut_p2]], colWidths=[col_w2, col_w2])
    fut_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 1),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
    ]))
    story.append(fut_table)
    story.append(Spacer(1, 4))
    
    # Final Architectural Conclusion
    conclusion_text = (
        "<b>Final Architectural Conclusion:</b><br/>"
        "The <b>AI Skin Intelligence &amp; Personalized Skincare Planner</b> successfully unifies <b>Artificial Intelligence, Dermatological Personalization, "
        "Chemical Ingredient Intelligence, Algorithmic Recommendation, Longitudinal Progress Tracking, and Cloud-Native Layered Architecture</b> into a single, "
        "resilient, and accessible platform. By grounding cosmetic regimens in multidimensional biological baselines, enforcing active chemical contraindications, "
        "and maintaining strict multi-tenant isolation with verifiable persistence, the system provides a robust, scalable engineering foundation for the future "
        "of intelligent, consumer-centric skincare technology."
    )
    t_conclusion = Table([[Paragraph(conclusion_text, styles['BodySmall'])]], colWidths=[PRINTABLE_WIDTH])
    t_conclusion.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BLUE_LIGHT),
        ('BOX', (0,0), (-1,-1), 1.0, BLUE_ACCENT),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_conclusion)
    story.append(Spacer(1, 3))
    
    # Verification Signature & Provenance Strip
    sig_text = (
        "<b>Repository Verification Provenance:</b> Git Branch: <code>durga-laskshmi-narayana-jampa</code> &nbsp;|&nbsp; "
        "Production Status: <b>Live &amp; Verified on Vercel</b> &nbsp;|&nbsp; Neon PostgreSQL: <b>Active (18 App Tables + alembic_version)</b> &nbsp;|&nbsp; "
        "Pytest Suite: <b>161 / 161 PASS</b> &nbsp;|&nbsp; Cloud E2E: <b>28 / 28 PASS</b> &nbsp;|&nbsp; Security Audit: <b>0 Live Secrets</b>"
    )
    t_sig = Table([[Paragraph(sig_text, styles['BodySmall'])]], colWidths=[PRINTABLE_WIDTH])
    t_sig.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), SLATE_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.5, SLATE_BORDER),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_sig)
    
    # Build Document
    print(f"Building master 7-page PDF at: {pdf_path}")
    doc.build(story, canvasmaker=NumberedCanvas)
    print("PDF build completed successfully.")
    return pdf_path


if __name__ == "__main__":
    generate_final_7_page_pdf()
