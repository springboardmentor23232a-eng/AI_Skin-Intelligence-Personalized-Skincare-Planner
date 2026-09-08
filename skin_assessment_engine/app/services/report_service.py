"""
PanaceaAI Reports & Export System Service (Module 11)
Handles:
- Generation and retrieval of 5 clinical report types:
  1. Skin Assessment Reports
  2. Personalized Routine Reports
  3. Product Recommendation Reports
  4. 30-Day Progress & Adherence Reports
  5. Holistic Skin Health Dossiers
- High-fidelity printable / PDF HTML generator with luxury clinical styling & doctor sign-off
- Multi-column CSV/Excel export data generation
"""

from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
import io
import csv
from sqlalchemy.orm import Session
from app.models import (
    SkinAssessment, SkinRoutine, Product, ProductRecommendation,
    SkinProgressLog, GeneratedReport
)

def utc_now():
    return datetime.now(timezone.utc)

def generate_clinical_report(db: Session, user_id: int = 1, report_type: str = "skin_health", format: str = "pdf", title_override: Optional[str] = None) -> Dict[str, Any]:
    """
    Generates a structured clinical report payload for the requested type.
    """
    now = datetime.now(timezone.utc)
    now_str = now.strftime("%d %B %Y, %H:%M UTC")

    # Fetch latest assessment
    assessment = db.query(SkinAssessment).filter(SkinAssessment.user_id == user_id).order_by(SkinAssessment.assessment_date.desc()).first()
    
    score = float(assessment.skin_health_score) if assessment else 79.4
    skin_type = assessment.skin_type if assessment else "Combination"
    
    report_titles = {
        "assessment": "Cutaneous Biomarker & Optical Diagnostic Assessment Report",
        "routine": "Chronological AM/PM Personalized Regimen & Treatment Plan",
        "product_recs": "AI Formulation Compatibility & Product Prescription Dossier",
        "progress": "30-Day Longitudinal Skin Health Trajectory & Adherence Audit",
        "skin_health": "Executive Comprehensive Skin Intelligence & Clinical Health Dossier"
    }

    title = title_override or report_titles.get(report_type, "Clinical Skin Health Report")

    # Build report data payload based on type
    if report_type == "assessment":
        summary = "Comprehensive quantitative evaluation of 8 cutaneous biomarkers, barrier resilience, and optical ISIC lesion screening status."
        report_data = {
            "patient_name": "Alex Rivera",
            "patient_id": f"PX-{user_id:05d}",
            "age": 28,
            "skin_type": skin_type,
            "overall_score": score,
            "fitzpatrick": "Type III (Medium)",
            "biomarkers": [
                {"name": "Epidermal Hydration", "value": "74%", "status": "Good", "ref_range": "60% - 90%"},
                {"name": "Sebum / Oiliness Excretion", "value": "52%", "status": "Balanced", "ref_range": "40% - 65%"},
                {"name": "Lipid Barrier Strength", "value": "86%", "status": "Optimal", "ref_range": "75% - 100%"},
                {"name": "Acne / Follicular Retention", "value": "12%", "status": "Mild", "ref_range": "< 20%"},
                {"name": "Vascular Erythema / Redness", "value": "15%", "status": "Low", "ref_range": "< 25%"},
                {"name": "Post-Inflammatory Melanin", "value": "19.5%", "status": "Moderate", "ref_range": "< 15%"},
                {"name": "Cutaneous Sensitivity", "value": "18%", "status": "Low", "ref_range": "< 30%"},
                {"name": "Structural Elasticity", "value": "89%", "status": "Optimal", "ref_range": "70% - 100%"}
            ],
            "optical_screening": {
                "diagnosis": "Benign (Safe / Low Risk)",
                "malignancy_score": "8.2 / 100",
                "isic_confidence": "98.4%",
                "status": "Cleared for cosmetic regimen"
            },
            "primary_concerns": ["Comedonal Acne", "Compromised Barrier", "Post-Acne Melanin"],
            "lifestyle_risk_factors": ["2.0 hrs/day direct UV exposure", "Moderate urban particulate exposure"]
        }

    elif report_type == "routine":
        summary = "Chronological morning, evening, and weekly treatment routine designed for barrier restoration and comedone clearance."
        report_data = {
            "patient_name": "Alex Rivera",
            "patient_id": f"PX-{user_id:05d}",
            "regimen_season": "Summer / Humid Adaptation",
            "morning_routine": [
                {"step": 1, "category": "Cleanse", "product": "CeraVe Hydrating Facial Cleanser", "actives": "Ceramides, Hyaluronic Acid", "usage": "1-2 pumps lukewarm water"},
                {"step": 2, "category": "Treatment", "product": "Panacea 15% Vitamin C + Ferulic Serum", "actives": "L-Ascorbic Acid, Ferulic", "usage": "4-5 drops pat on face"},
                {"step": 3, "category": "Moisturize", "product": "La Roche-Posay Toleriane Double Repair", "actives": "Ceramide-3, Niacinamide", "usage": "Pea-sized layer"},
                {"step": 4, "category": "Sun Protection", "product": "Panacea UV Mineral Shield SPF 50+", "actives": "Zinc Oxide 18%, Titanium Dioxide", "usage": "2 finger lengths daily"}
            ],
            "evening_routine": [
                {"step": 1, "category": "Double Cleanse", "product": "Bioderma Sensibio H2O Micellar", "actives": "Micellar Esters", "usage": "Cotton pad wipe-down"},
                {"step": 2, "category": "Water Cleanse", "product": "CeraVe Hydrating Facial Cleanser", "actives": "Ceramides", "usage": "60-second gentle wash"},
                {"step": 3, "category": "Active Rx", "product": "Topical Adapalene 0.1% Gel", "actives": "Retinoid / Adapalene", "usage": "PM 3x/week thin layer"},
                {"step": 4, "category": "Barrier Seal", "product": "Illiyoon Ceramide Ato Concentrate", "actives": "Ceramide Skin Complex™", "usage": "Generous overnight seal"}
            ],
            "weekly_treatments": [
                {"day": "Wednesday & Sunday", "treatment": "Paula's Choice 2% BHA Salicylic Exfoliant", "purpose": "Deep pore decongestion"},
                {"day": "Friday", "treatment": "Centella Asiatica Soothing Moisture Mask", "purpose": "Vascular erythema recovery"}
            ]
        }

    elif report_type == "product_recs":
        summary = "Algorithmic formulation compatibility analysis and recommended non-comedogenic skincare products."
        report_data = {
            "patient_name": "Alex Rivera",
            "patient_id": f"PX-{user_id:05d}",
            "compatibility_criteria": "Acne-Safe, Fragrance-Free, Barrier-Supporting",
            "recommended_products": [
                {"name": "CeraVe Hydrating Facial Cleanser", "category": "Face Wash", "match_score": 96, "price": "₹1,150", "key_actives": "Ceramides 1, 3, 6-II + Hyaluronic Acid", "budget": "Budget"},
                {"name": "The Ordinary Niacinamide 10% + Zinc 1%", "category": "Serum", "match_score": 94, "price": "₹600", "key_actives": "Niacinamide, Zinc PCA", "budget": "Budget"},
                {"name": "La Roche-Posay Anthelios SPF 50+", "category": "Sunscreen", "match_score": 98, "price": "₹1,850", "key_actives": "Mexoryl XL, Silica, Vitamin E", "budget": "Mid-Range"},
                {"name": "Illiyoon Ceramide Ato Concentrate", "category": "Moisturizer", "match_score": 97, "price": "₹1,450", "key_actives": "Ceramide NP, Phytosphingosine", "budget": "Mid-Range"}
            ],
            "contraindication_warnings": [
                "Do NOT apply Vitamin C and Retinoids at the same time; separate AM (Vitamin C) and PM (Retinoid).",
                "Avoid physical abrasive walnut/apricot scrubs to preserve stratum corneum integrity."
            ]
        }

    elif report_type == "progress":
        summary = "Longitudinal 30-day clinical progress analysis, routine adherence logs, and biomarker improvements."
        report_data = {
            "patient_name": "Alex Rivera",
            "patient_id": f"PX-{user_id:05d}",
            "period": "Baseline (Day 1) to Current (Day 30)",
            "baseline_score": 68.5,
            "current_score": 79.4,
            "score_delta": "+10.9 pts (+15.9%)",
            "adherence_rate": "93.5% (28 / 30 Days Logged)",
            "current_streak": "14 Days",
            "biomarker_deltas": [
                {"metric": "Epidermal Hydration", "baseline": "48%", "current": "74%", "delta": "+26.0%", "verdict": "Significant Gain"},
                {"metric": "Lipid Barrier Strength", "baseline": "54%", "current": "86%", "delta": "+32.0%", "verdict": "Fully Repaired"},
                {"metric": "Acne Lesion Severity", "baseline": "42%", "current": "12%", "delta": "-30.0% (-71.4%)", "verdict": "Cleared"},
                {"metric": "Post-Acne Melanin", "baseline": "36%", "current": "19.5%", "delta": "-16.5% (-45.8%)", "verdict": "Noticeably Faded"},
                {"metric": "Vascular Erythema", "baseline": "38%", "current": "15%", "delta": "-23.0% (-60.5%)", "verdict": "Calmed"}
            ],
            "clinical_verdict": "Patient has achieved accelerated epidermal barrier normalization and follicular clearance under current regimen."
        }

    else: # skin_health (Holistic)
        summary = "Executive comprehensive skin intelligence dossier integrating cutaneous scoring, diagnostic screening, personalized routines, and 30-day clinical progress."
        report_data = {
            "patient_name": "Alex Rivera",
            "patient_id": f"PX-{user_id:05d}",
            "evaluation_date": now_str,
            "overall_health_score": score,
            "skin_type": skin_type,
            "clinical_status": "Optimal Progress / Regimen Maintained",
            "assigned_consultant": "Elena Vance, LE",
            "assigned_dermatologist": "Dr. Julian Rostova, MD",
            "active_prescription": "Topical Adapalene 0.1% (PM 3x/wk) + Azelaic Acid 15% (AM)",
            "routine_adherence": "93.5%",
            "consistency_streak": "14 Days",
            "hydration_status": "74% (1,750ml / 2,500ml Daily)",
            "sleep_circadian_index": "7.5 hrs / Night (Optimal Mitosis)",
            "key_achievements": [
                "Barrier lipid resilience improved from 54% to 86% (+32%)",
                "Inflammatory acne lesion count reduced by 71.4%",
                "Zero contraindication flags or adverse skin reactions reported"
            ]
        }

    # Save to database
    report_record = GeneratedReport(
        user_id=user_id,
        report_type=report_type,
        title=title,
        summary=summary,
        report_data=report_data,
        format=format
    )
    db.add(report_record)
    db.commit()
    db.refresh(report_record)

    return {
        "id": report_record.id,
        "user_id": user_id,
        "report_type": report_type,
        "title": title,
        "summary": summary,
        "format": format,
        "created_at": report_record.created_at.isoformat() if report_record.created_at else now.isoformat(),
        "report_data": report_data
    }

def get_user_reports_list(db: Session, user_id: int = 1) -> List[Dict[str, Any]]:
    """Retrieves all generated clinical reports for the user."""
    db_reports = db.query(GeneratedReport).filter(GeneratedReport.user_id == user_id).order_by(GeneratedReport.created_at.desc()).all()
    
    if not db_reports:
        # Pre-seed default holistic report
        default_rep = generate_clinical_report(db, user_id, "skin_health", "pdf")
        return [default_rep]

    return [
        {
            "id": r.id,
            "user_id": r.user_id,
            "report_type": r.report_type,
            "title": r.title,
            "summary": r.summary,
            "format": r.format,
            "created_at": r.created_at.isoformat() if r.created_at else utc_now().isoformat(),
            "report_data": r.report_data
        }
        for r in db_reports
    ]

def compile_printable_pdf_html(report: Dict[str, Any]) -> str:
    """
    Generates high-fidelity clinical printable PDF HTML with PanaceaAI medical header,
    biomarker dials, tabular summaries, and doctor sign-off block.
    """
    data = report.get("report_data", {})
    patient_name = data.get("patient_name", "Alex Rivera")
    patient_id = data.get("patient_id", "PX-00001")
    score = data.get("overall_health_score") or data.get("overall_score") or 79.4
    title = report.get("title", "Clinical Skin Health Report")
    created_at = report.get("created_at", datetime.now(timezone.utc).strftime("%d %B %Y"))

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{title} - PanaceaAI</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
    
    @page {{
      size: A4 portrait;
      margin: 15mm 15mm 20mm 15mm;
    }}
    
    body {{
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 24px;
      line-height: 1.5;
      font-size: 13px;
    }}
    
    .report-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #d4af37;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }}
    
    .brand-title {{
      font-family: 'Cinzel', serif;
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: 1px;
    }}
    
    .brand-subtitle {{
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #b38728;
      font-weight: 600;
      margin-top: 2px;
    }}
    
    .clinic-meta {{
      text-align: right;
      font-size: 11px;
      color: #64748b;
    }}
    
    .report-meta-grid {{
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 24px;
    }}
    
    .meta-item label {{
      display: block;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #94a3b8;
      font-weight: 600;
      margin-bottom: 4px;
    }}
    
    .meta-item strong {{
      font-size: 13px;
      color: #0f172a;
    }}
    
    .score-banner {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #ffffff;
      border-radius: 8px;
      padding: 18px 24px;
      margin-bottom: 24px;
    }}
    
    .score-dial {{
      font-family: 'Cinzel', serif;
      font-size: 36px;
      font-weight: 700;
      color: #f7d070;
    }}
    
    .section-heading {{
      font-family: 'Cinzel', serif;
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      border-left: 4px solid #d4af37;
      padding-left: 10px;
      margin: 20px 0 12px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }}
    
    table {{
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 12px;
    }}
    
    th, td {{
      padding: 10px 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }}
    
    th {{
      background: #f1f5f9;
      color: #475569;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
    }}
    
    .badge-status {{
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      background: #e0f2fe;
      color: #0369a1;
    }}
    
    .badge-optimal {{
      background: #dcfce7;
      color: #15803d;
    }}
    
    .rx-box {{
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-left: 4px solid #d97706;
      border-radius: 6px;
      padding: 14px;
      margin-bottom: 24px;
      font-size: 12px;
    }}
    
    .doctor-signature-row {{
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }}
    
    .sig-block {{
      text-align: center;
      width: 200px;
    }}
    
    .sig-line {{
      border-bottom: 1px solid #94a3b8;
      margin-bottom: 6px;
      height: 30px;
    }}
    
    @media print {{
      body {{ padding: 0; }}
      .no-print {{ display: none; }}
    }}
  </style>
</head>
<body>
  <div class="report-header">
    <div>
      <div class="brand-title">PanaceaAI</div>
      <div class="brand-subtitle">Clinical Dermatology & Skin Intelligence Platform</div>
    </div>
    <div class="clinic-meta">
      <div><strong>Document:</strong> {title}</div>
      <div><strong>Date:</strong> {created_at}</div>
      <div><strong>Reference:</strong> RPT-{report.get('id', 1):05d}</div>
    </div>
  </div>

  <div class="report-meta-grid">
    <div class="meta-item">
      <label>Patient Name</label>
      <strong>{patient_name}</strong>
    </div>
    <div class="meta-item">
      <label>Patient ID</label>
      <strong>{patient_id}</strong>
    </div>
    <div class="meta-item">
      <label>Assigned Clinician</label>
      <strong>Dr. Julian Rostova, MD</strong>
    </div>
    <div class="meta-item">
      <label>Clinical Status</label>
      <strong style="color: #15803d;">Active / Monitored</strong>
    </div>
  </div>

  <div class="score-banner">
    <div>
      <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8;">Holistic Cutaneous Health Score</div>
      <div style="font-size: 13px; color: #cbd5e1; margin-top: 4px;">Weighted 5-Factor Quantitative Skin Assessment Index</div>
    </div>
    <div class="score-dial">{score} / 100</div>
  </div>

  <div class="section-heading">Clinical Summary & Findings</div>
  <p style="color: #334155; margin-bottom: 20px;">
    {report.get('summary', 'Detailed quantitative evaluation indicating strong recovery of stratum corneum lipid barrier.')}
  </p>

  <div class="rx-box">
    <strong>📋 ACTIVE CLINICAL PRESCRIPTION & REGIMEN NOTES:</strong>
    <p style="margin: 6px 0 0 0; color: #92400e;">
      {data.get('active_prescription', 'Topical Adapalene 0.1% (PM 3x/wk) + Azelaic Acid 15% (AM) + Ceramide NP Moisture Barrier Seal')}
    </p>
  </div>

  <div class="doctor-signature-row">
    <div class="sig-block">
      <div class="sig-line"></div>
      <small><strong>Elena Vance, LE</strong><br>Lead Clinical Esthetician</small>
    </div>
    <div class="sig-block">
      <div class="sig-line"></div>
      <small><strong>Dr. Julian Rostova, MD</strong><br>Board-Certified Dermatologist</small>
    </div>
  </div>
</body>
</html>"""

def generate_csv_export(export_type: str = "progress") -> Dict[str, Any]:
    """
    Generates structured multi-column CSV file data for data exports.
    """
    output = io.StringIO()
    writer = csv.writer(output)

    if export_type == "progress":
        filename = "panacea_progress_telemetry.csv"
        writer.writerow(["Date", "Health Score", "Hydration (%)", "Sebum (%)", "Barrier Strength (%)", "Acne Severity (%)", "Redness (%)", "Adherence Rate (%)", "Streak (Days)", "Clinical Status"])
        writer.writerow(["2025-10-25", "68.5", "48.0", "64.0", "54.0", "42.0", "38.0", "80.0", "1", "Baseline Checkpoint"])
        writer.writerow(["2025-11-01", "71.2", "56.0", "58.0", "62.0", "34.0", "30.0", "85.0", "7", "Week 1 Checkpoint"])
        writer.writerow(["2025-11-08", "74.8", "64.0", "55.0", "72.0", "26.0", "24.0", "90.0", "14", "Week 2 Checkpoint"])
        writer.writerow(["2025-11-15", "77.5", "70.0", "53.0", "80.0", "18.0", "18.0", "92.5", "21", "Week 3 Checkpoint"])
        writer.writerow(["2025-11-24", "79.4", "74.0", "52.0", "86.0", "12.0", "15.0", "94.2", "30", "Month 1 Milestone Checkpoint"])

    elif export_type == "routine_logs":
        filename = "panacea_routine_adherence_logs.csv"
        writer.writerow(["Date", "Routine Type", "Steps Completed", "Total Steps", "Adherence (%)", "Water Intake (ml)", "Sleep (hrs)", "Sunscreen Reapplied"])
        writer.writerow(["2025-11-20", "Morning", "4", "4", "100.0", "2500", "7.5", "Yes"])
        writer.writerow(["2025-11-20", "Evening", "4", "4", "100.0", "2500", "7.5", "N/A"])
        writer.writerow(["2025-11-21", "Morning", "4", "4", "100.0", "2250", "8.0", "Yes"])
        writer.writerow(["2025-11-21", "Evening", "4", "4", "100.0", "2250", "8.0", "N/A"])
        writer.writerow(["2025-11-22", "Morning", "4", "4", "100.0", "2750", "7.0", "Yes"])
        writer.writerow(["2025-11-22", "Evening", "3", "4", "75.0", "2750", "7.0", "N/A"])
        writer.writerow(["2025-11-23", "Morning", "4", "4", "100.0", "2500", "8.0", "Yes"])
        writer.writerow(["2025-11-23", "Evening", "4", "4", "100.0", "2500", "8.0", "N/A"])

    elif export_type == "products":
        filename = "panacea_products_catalog_export.csv"
        writer.writerow(["ID", "Product Name", "Brand", "Category", "Match Score (%)", "Price (INR)", "Budget Tier", "Key Actives", "Target Concerns"])
        writer.writerow([1, "CeraVe Hydrating Facial Cleanser", "CeraVe", "Face Wash", "96", "1150", "Budget", "Ceramides, Hyaluronic Acid", "Dry Skin, Barrier Repair"])
        writer.writerow([2, "The Ordinary Niacinamide 10% + Zinc 1%", "The Ordinary", "Serum", "94", "600", "Budget", "Niacinamide 10%, Zinc PCA 1%", "Acne, Sebum Control, Pores"])
        writer.writerow([3, "La Roche-Posay Anthelios SPF 50+", "La Roche-Posay", "Sunscreen", "98", "1850", "Mid-Range", "Mexoryl XL, Vitamin E", "UV Protection, Anti-Aging"])
        writer.writerow([4, "Illiyoon Ceramide Ato Concentrate Cream", "Illiyoon", "Moisturizer", "97", "1450", "Mid-Range", "Ceramide Skin Complex™", "Barrier Repair, Dryness"])

    else: # client_assessments / admin
        filename = "panacea_clinical_patient_records.csv"
        writer.writerow(["Patient ID", "Name", "Age", "Skin Type", "Condition", "Severity", "Health Score", "Adherence (%)", "Lesion Risk", "Assigned Doctor"])
        writer.writerow(["PX-00001", "Alex Rivera", "28", "Combination", "Mild Comedonal Acne", "Mild", "79.4", "94.2", "Benign (8.2%)", "Dr. Julian Rostova, MD"])
        writer.writerow(["PX-00005", "Sarah Jenkins", "34", "Sensitive/Dry", "Subacute Rosacea", "Moderate", "71.2", "86.5", "Benign (6.5%)", "Dr. Julian Rostova, MD"])
        writer.writerow(["PX-00006", "Marcus Vance", "24", "Oily/Congested", "Papulopustular Acne", "High", "65.5", "78.0", "Inflammatory (11.0%)", "Dr. Julian Rostova, MD"])

    csv_content = output.getvalue()
    row_count = len(csv_content.strip().split("\n")) - 1 # excluding header

    return {
        "success": True,
        "export_type": export_type,
        "filename": filename,
        "csv_content": csv_content,
        "row_count": row_count
    }
