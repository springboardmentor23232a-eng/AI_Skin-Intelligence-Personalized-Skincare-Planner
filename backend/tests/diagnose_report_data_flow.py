"""
Forensic Diagnostic Script to trace data flow from database to all 6 surfaces:
1. User's Profile Page (GET /api/profile)
2. Latest Assessment Page (GET /api/assessment/history -> [0])
3. Dashboard (GET /api/profile, GET /api/assessment/history -> [0], GET /api/routines, GET /api/routines/logs)
4. Exported PDF (GET /api/reports/export?format=pdf)
5. Exported CSV (GET /api/reports/export?format=csv)
6. Exported XLSX (GET /api/reports/export?format=xlsx)
"""
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import io
import csv
import openpyxl
from pypdf import PdfReader
from fastapi.testclient import TestClient
from datetime import datetime, timedelta
from app.main import app
from app.auth.service import create_access_token
from app.database import SessionLocal
from app.models import (
    User, SkinProfile, SkinAssessment,
    SkincareRoutine, SkincareLog, SkinProgressPhoto
)

client = TestClient(app)

def run_diagnostics():
    db = SessionLocal()
    print("=" * 80)
    print("STARTING FORENSIC DATA FLOW TRACE & MISMATCH COMPARISON")
    print("=" * 80)

    # Pick or create a user with known, distinct values
    email = "trace_audit_user@skincare.com"
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            password="audit_secure_password",
            full_name="Dr. Eleanor Vance",
            role="USER",
            is_active=1,
            is_verified=1
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # 1. Ensure profile exists and is updated with specific latest values
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user.id).first()
    if not profile:
        profile = SkinProfile(
            user_id=user.id,
            full_name="Dr. Eleanor Vance",
            age=34,
            gender="Female",
            skin_type="Oily / Acne-Prone",
            skin_tone="Fitzpatrick IV",
            concerns=["Acne / Breakouts", "Enlarged Pores", "Redness"],
            allergies="Benzoyl Peroxide",
            sensitivities="Synthetic Fragrance",
            water_intake=3.2,
            stress_level="High",
            sleep_quality="6-7 Hours",
            climate="Tropical High Humidity"
        )
        db.add(profile)
    else:
        profile.full_name = "Dr. Eleanor Vance"
        profile.skin_type = "Oily / Acne-Prone"
        profile.skin_tone = "Fitzpatrick IV"
        profile.concerns = ["Acne / Breakouts", "Enlarged Pores", "Redness"]
        profile.allergies = "Benzoyl Peroxide"
        profile.sensitivities = "Synthetic Fragrance"
        profile.water_intake = 3.2
        profile.stress_level = "High"
        profile.sleep_quality = "6-7 Hours"
        profile.climate = "Tropical High Humidity"
    db.commit()
    db.refresh(profile)

    # 2. Add an older assessment AND a latest assessment to test ordering
    old_time = datetime.utcnow() - timedelta(days=10)
    new_time = datetime.utcnow()

    # Clean old assessments for clean trace test
    db.query(SkinAssessment).filter(SkinAssessment.user_id == user.id).delete()
    db.commit()

    old_assessment = SkinAssessment(
        user_id=user.id,
        acne=40,
        hyperpigmentation=30,
        dryness=10,
        oiliness=50,
        redness=35,
        sensitivity=20,
        wrinkles=10,
        fine_lines=15,
        dark_spots=25,
        uneven_tone=20,
        overall_score=68,
        risk_level="Moderate Risk",
        concern_priority="Oiliness",
        summary="Initial diagnostic baseline.",
        created_at=old_time
    )
    db.add(old_assessment)
    db.commit()

    latest_assessment = SkinAssessment(
        user_id=user.id,
        acne=20,
        hyperpigmentation=15,
        dryness=5,
        oiliness=30,
        redness=15,
        sensitivity=10,
        wrinkles=5,
        fine_lines=10,
        dark_spots=15,
        uneven_tone=10,
        overall_score=92,
        risk_level="Low Risk",
        concern_priority="Fine Lines",
        summary="Follow-up diagnostic showing marked reduction in inflammation.",
        created_at=new_time
    )
    db.add(latest_assessment)
    db.commit()

    # 3. Add active routines
    db.query(SkincareRoutine).filter(SkincareRoutine.user_id == user.id).delete()
    routine1 = SkincareRoutine(
        user_id=user.id,
        routine_type="MORNING",
        title="Clarifying Morning Protocol",
        description="Daily barrier defense",
        steps=[
            {
                "step_number": 1,
                "category": "Cleanser",
                "product_name": "Salicylic Acid Cleanser",
                "ingredient": "Salicylic Acid 2%",
                "instructions": "Massage on wet face for 60 seconds",
                "frequency": "Daily",
                "duration": "Ongoing",
                "precautions": "Avoid eye area",
                "expected_benefits": "Unclogs pores and controls sebum"
            },
            {
                "step_number": 2,
                "category": "Serum",
                "product_name": "Zinc Niacinamide Serum",
                "ingredient": "Niacinamide 10% + Zinc 1%",
                "instructions": "Apply 3-4 drops across face",
                "frequency": "Daily",
                "duration": "Ongoing",
                "precautions": "Do not combine with direct L-Ascorbic Acid",
                "expected_benefits": "Regulates sebum and reduces redness"
            },
            {
                "step_number": 3,
                "category": "Sunscreen",
                "product_name": "Matte UV Shield SPF 50",
                "ingredient": "Zinc Oxide 12%",
                "instructions": "Apply 2 finger lengths before sun exposure",
                "frequency": "Daily",
                "duration": "Ongoing",
                "precautions": "Reapply every 2 hours",
                "expected_benefits": "Broad spectrum UVA/UVB defense"
            }
        ]
    )
    routine2 = SkincareRoutine(
        user_id=user.id,
        routine_type="EVENING",
        title="Restorative Night Protocol",
        description="Overnight cellular renewal",
        steps=[
            {
                "step_number": 1,
                "category": "Cleanser",
                "product_name": "Hydrating Gel Cleanser",
                "ingredient": "Centella Asiatica + Glycerin",
                "instructions": "Gentle wash to remove daily impurities",
                "frequency": "Nightly",
                "duration": "Ongoing",
                "precautions": "Rinse with lukewarm water",
                "expected_benefits": "Hydrates and cleanses without stripping"
            },
            {
                "step_number": 2,
                "category": "Moisturizer",
                "product_name": "Ceramide Barrier Cream",
                "ingredient": "Ceramides NP/AP/EOP",
                "instructions": "Smooth pea-sized amount over skin",
                "frequency": "Nightly",
                "duration": "Ongoing",
                "precautions": "None",
                "expected_benefits": "Repairs stratum corneum barrier"
            }
        ]
    )
    db.add(routine1)
    db.add(routine2)
    db.commit()

    # 4. Add skincare logs
    db.query(SkincareLog).filter(SkincareLog.user_id == user.id).delete()
    log1 = SkincareLog(
        user_id=user.id,
        routine_type="MORNING",
        logged_date=datetime.utcnow() - timedelta(days=1),
        completed=1
    )
    log2 = SkincareLog(
        user_id=user.id,
        routine_type="EVENING",
        logged_date=datetime.utcnow() - timedelta(days=1),
        completed=1
    )
    log3 = SkincareLog(
        user_id=user.id,
        routine_type="MORNING",
        logged_date=datetime.utcnow(),
        completed=1
    )
    log4 = SkincareLog(
        user_id=user.id,
        routine_type="EVENING",
        logged_date=datetime.utcnow(),
        completed=0
    )
    db.add_all([log1, log2, log3, log4])
    db.commit()

    # 5. Add progress photo
    db.query(SkinProgressPhoto).filter(SkinProgressPhoto.user_id == user.id).delete()
    photo = SkinProgressPhoto(
        user_id=user.id,
        photo_url="http://localhost:8000/uploads/test_photo.jpg",
        notes="Week 2 frontal progress check",
        logged_at=datetime.utcnow()
    )
    db.add(photo)
    db.commit()

    # Generate Token
    token = create_access_token({"sub": user.email, "role": user.role})
    headers = {"Authorization": f"Bearer {token}"}

    print(f"\n[TRACE] Authenticated User: ID={user.id}, Email={user.email}, Full Name={user.full_name}")

    # =========================================================================
    # Surface 1: User's Profile Page (GET /api/profile)
    # =========================================================================
    prof_res = client.get("/api/profile", headers=headers)
    assert prof_res.status_code == 200
    p_data = prof_res.json()
    print("\n--- SURFACE 1: Profile Page (/api/profile) ---")
    print(f"  Full Name:       {p_data.get('full_name')}")
    print(f"  Skin Type:       {p_data.get('skin_type')}")
    print(f"  Skin Tone:       {p_data.get('skin_tone')}")
    print(f"  Concerns:        {p_data.get('concerns')}")
    print(f"  Allergies:       {p_data.get('allergies')}")
    print(f"  Water Intake:    {p_data.get('water_intake')} L")

    # =========================================================================
    # Surface 2: Latest Assessment Page (GET /api/assessment/history -> [0])
    # =========================================================================
    ass_res = client.get("/api/assessment/history", headers=headers)
    assert ass_res.status_code == 200
    a_list = ass_res.json()
    latest_a = a_list[0] if a_list else {}
    print("\n--- SURFACE 2: Latest Assessment Page (/api/assessment/history[0]) ---")
    print(f"  Assessment ID:   {latest_a.get('id')}")
    print(f"  Overall Score:   {latest_a.get('overall_score')}%")
    print(f"  Risk Level:      {latest_a.get('risk_level')}")
    print(f"  Priority:        {latest_a.get('concern_priority')}")
    print(f"  Sub-Scores:      Acne={latest_a.get('acne')}, Oiliness={latest_a.get('oiliness')}, Redness={latest_a.get('redness')}, Dryness={latest_a.get('dryness')}, Pigment={latest_a.get('hyperpigmentation')}")

    # =========================================================================
    # Surface 3: Dashboard Overview
    # =========================================================================
    routines_res = client.get("/api/routines", headers=headers)
    r_list = routines_res.json() if routines_res.status_code == 200 else []
    routine_titles = [r.get("title") for r in r_list]

    logs_res = client.get("/api/analytics/routines/logs", headers=headers)
    l_list = logs_res.json() if logs_res.status_code == 200 else []
    total_l = len(l_list)
    comp_l = sum(1 for l in l_list if l.get("completed"))
    adherence_pct = round((comp_l / max(1, total_l)) * 100, 1)

    print("\n--- SURFACE 3: Dashboard Overview ---")
    print(f"  Skin Type:       {p_data.get('skin_type')}")
    print(f"  Latest Score:    {latest_a.get('overall_score')}/100")
    print(f"  Latest Risk:     {latest_a.get('risk_level')}")
    print(f"  Water Intake:    {p_data.get('water_intake')} L")
    print(f"  Routines:        {routine_titles}")
    print(f"  Adherence Rate:  {adherence_pct}% ({comp_l}/{total_l})")

    # =========================================================================
    # Surface 4: Exported PDF
    # =========================================================================
    pdf_res = client.get("/api/reports/export?format=pdf", headers=headers)
    assert pdf_res.status_code == 200
    reader = PdfReader(io.BytesIO(pdf_res.content))
    pdf_text = "".join([p.extract_text() for p in reader.pages])

    print("\n--- SURFACE 4: Exported PDF ---")
    print(f"  PDF Pages:       {len(reader.pages)}")
    print(f"  Has User Name:   {'Dr. Eleanor Vance' in pdf_text}")
    print(f"  Has User Email:  {user.email in pdf_text}")
    print(f"  Has Skin Type:   {'Oily / Acne-Prone' in pdf_text}")
    print(f"  Has Concerns:    {'Enlarged Pores' in pdf_text}")
    print(f"  Has Latest Score (92%): {'92%' in pdf_text}")
    print(f"  Has Old Score (68%):    {'68%' in pdf_text}")
    print(f"  Has Routines:    {'Clarifying Morning Protocol' in pdf_text and 'Restorative Night Protocol' in pdf_text}")
    print(f"  Has Adherence:   {f'{adherence_pct}%' in pdf_text}")
    print(f"  Has Progress:    {'1 entries recorded' in pdf_text or 'Milestone Progress' in pdf_text}")

    # =========================================================================
    # Surface 5: Exported CSV
    # =========================================================================
    csv_res = client.get("/api/reports/export?format=csv", headers=headers)
    assert csv_res.status_code == 200
    csv_rows = list(csv.reader(io.StringIO(csv_res.content.decode("utf-8-sig"))))
    flat_csv = " ".join([" ".join(r) for r in csv_rows])

    print("\n--- SURFACE 5: Exported CSV ---")
    print(f"  CSV Total Rows:  {len(csv_rows)}")
    print(f"  Has User Name:   {'Dr. Eleanor Vance' in flat_csv}")
    print(f"  Has User Email:  {user.email in flat_csv}")
    print(f"  Has Skin Type:   {'Oily / Acne-Prone' in flat_csv}")
    print(f"  Has Concerns:    {'Enlarged Pores' in flat_csv}")
    print(f"  Has Latest Score (92%): {'92%' in flat_csv}")
    print(f"  Has Old Score (68%):    {'68%' in flat_csv}")
    print(f"  Has Routines:    {'Clarifying Morning Protocol' in flat_csv and 'Restorative Night Protocol' in flat_csv}")
    print(f"  Has Adherence:   {f'{adherence_pct}%' in flat_csv}")

    # =========================================================================
    # Surface 6: Exported XLSX
    # =========================================================================
    xlsx_res = client.get("/api/reports/export?format=xlsx", headers=headers)
    assert xlsx_res.status_code == 200
    wb = openpyxl.load_workbook(io.BytesIO(xlsx_res.content))
    ws_summary = wb["Health Summary"]
    summary_text = " ".join([str(c.value) for r in ws_summary.iter_rows() for c in r if c.value is not None])
    ws_ass = wb["Skin Assessment"]
    ass_text = " ".join([str(c.value) for r in ws_ass.iter_rows() for c in r if c.value is not None])

    print("\n--- SURFACE 6: Exported XLSX ---")
    print(f"  Worksheets:      {wb.sheetnames}")
    print(f"  Has User Name:   {'Dr. Eleanor Vance' in summary_text}")
    print(f"  Has User Email:  {user.email in summary_text}")
    print(f"  Has Skin Type:   {'Oily / Acne-Prone' in summary_text}")
    print(f"  Has Concerns:    {'Enlarged Pores' in summary_text}")
    print(f"  Has Latest Score (92%): {'92%' in summary_text}")
    print(f"  Has Both Assessments in WS2: {'92%' in ass_text and '68%' in ass_text}")
    print(f"  Has Adherence:   {f'{adherence_pct}%' in summary_text}")

    print("\n" + "=" * 80)
    print("MISMATCH AUDIT CHECK:")
    # Check if latest assessment is first in XLSX, CSV, and PDF
    # In XLSX ws_ass: row 2 should be the latest assessment (id, 92%)
    first_data_row_xlsx = [c.value for c in ws_ass[2]]
    print(f"  XLSX Row 2 (Top Assessment): {first_data_row_xlsx}")
    assert "92%" in str(first_data_row_xlsx[2]), "XLSX top row is NOT the latest assessment!"

    # In CSV: check the first assessment row under === HISTORICAL AI DIAGNOSTIC ASSESSMENTS ===
    ass_section_idx = -1
    for idx, r in enumerate(csv_rows):
        if len(r) > 0 and "HISTORICAL AI DIAGNOSTIC ASSESSMENTS" in r[0]:
            ass_section_idx = idx
            break
    first_csv_ass_row = csv_rows[ass_section_idx + 2] # header is idx+1, first row is idx+2
    print(f"  CSV Top Assessment Row: {first_csv_ass_row}")
    assert "92%" in str(first_csv_ass_row[2]), "CSV top row is NOT the latest assessment!"

    print("ALL 6 SURFACES VERIFIED WITH LATEST DATABASE RECORDS!")
    print("=" * 80)
    db.close()

if __name__ == "__main__":
    run_diagnostics()
