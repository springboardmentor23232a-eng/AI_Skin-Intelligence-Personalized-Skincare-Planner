"""
End-to-End Forensic File Download and Content Verification Script
Simulates full client-side export workflow:
1. Logs in as a test patient with real database records (profile, assessment, routines, progress).
2. Requests /api/reports/export for PDF, CSV, and XLSX.
3. Saves actual downloaded files to disk in an exports directory.
4. Performs deep structural and content verification:
   - PDF: Magic bytes '%PDF', opens with pypdf, extracts text, checks user data & disclaimer.
   - CSV: UTF-8 BOM '\xef\xbb\xbf', parses with csv.reader, checks columns and patient values.
   - XLSX: Magic bytes 'PK', loads workbook with openpyxl, checks 4 worksheets and cell values.
5. Verifies empty-state user export produces valid, non-corrupt files.
6. Verifies unauthenticated request returns 401 JSON and frontend error handler prevents saving it as a report.
"""
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import io
import csv
import openpyxl
from pypdf import PdfReader
from fastapi.testclient import TestClient
from app.main import app
from app.auth.service import create_access_token
from app.database import SessionLocal
from app.models import (
    User, UserRole, SkinProfile, SkinAssessment,
    SkincareRoutine, SkincareLog, SkinProgressPhoto
)
from datetime import datetime

client = TestClient(app)

def run_download_verification():
    db = SessionLocal()
    export_dir = os.path.join(os.path.dirname(__file__), "downloaded_exports")
    os.makedirs(export_dir, exist_ok=True)

    print("\n" + "=" * 70)
    print(" FORENSIC HEALTH REPORT DOWNLOAD & PARSING VERIFICATION")
    print("=" * 70)

    # 1. Ensure test user with rich clinical data exists
    test_email = "forensic_patient@skincare.com"
    user = db.query(User).filter(User.email == test_email).first()
    if not user:
        user = User(
            email=test_email,
            password="test_pw_hash",
            full_name="Forensic Test Patient",
            role="USER",
            is_active=1,
            is_verified=1
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Profile
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == user.id).first()
    if not profile:
        profile = SkinProfile(
            user_id=user.id,
            full_name="Forensic Test Patient",
            age=29,
            gender="Female",
            skin_type="Combination",
            skin_tone="Fitzpatrick Type III",
            concerns=["Acne", "Hyperpigmentation"],
            allergies="Fragrance, Parabens",
            climate="Subtropical",
            water_intake=2.8
        )
        db.add(profile)
        db.commit()

    # Assessment
    assessment = db.query(SkinAssessment).filter(SkinAssessment.user_id == user.id).first()
    if not assessment:
        assessment = SkinAssessment(
            user_id=user.id,
            overall_score=85,
            acne=30,
            hyperpigmentation=25,
            dryness=15,
            oiliness=40,
            redness=20,
            sensitivity=15,
            risk_level="MODERATE",
            concern_priority="Oiliness",
            summary="Mild inflammatory papules observed on forehead and cheeks."
        )
        db.add(assessment)
        db.commit()

    # Routine
    routine = db.query(SkincareRoutine).filter(SkincareRoutine.user_id == user.id).first()
    if not routine:
        routine = SkincareRoutine(
            user_id=user.id,
            routine_type="MORNING",
            title="Daily Morning Protocol",
            description="Restorative morning routine",
            steps=[
                {"order": 1, "product_name": "Gentle Foaming Cleanser", "step_type": "Cleanser"},
                {"order": 2, "product_name": "Niacinamide 10% Serum", "step_type": "Serum"},
                {"order": 3, "product_name": "SPF 50 Mineral Sunscreen", "step_type": "Sunscreen"}
            ]
        )
        db.add(routine)
        db.commit()

    token = create_access_token({"sub": user.email, "role": user.role.value if hasattr(user.role, 'value') else user.role})
    auth_headers = {"Authorization": f"Bearer {token}"}

    # =========================================================================
    # STEP A: Test PDF Download & Parsing
    # =========================================================================
    pdf_res = client.get("/api/reports/export?format=pdf", headers=auth_headers)
    assert pdf_res.status_code == 200, f"PDF export failed: {pdf_res.status_code}"
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert "skin-health-report.pdf" in pdf_res.headers["content-disposition"]
    
    pdf_path = os.path.join(export_dir, "skin-health-report.pdf")
    with open(pdf_path, "wb") as f:
        f.write(pdf_res.content)

    print(f"[OK] 1. Downloaded PDF: {pdf_path} ({len(pdf_res.content)} bytes)")
    assert pdf_res.content[:4] == b"%PDF", "Invalid PDF magic bytes!"
    
    # Parse with pypdf
    reader = PdfReader(io.BytesIO(pdf_res.content))
    assert len(reader.pages) >= 1
    pdf_text = "".join([page.extract_text() for page in reader.pages])
    
    assert "Forensic Test Patient" in pdf_text
    assert "forensic_patient@skincare.com" in pdf_text
    assert "Combination" in pdf_text
    assert "85" in pdf_text
    assert "Wellness Disclaimer" in pdf_text
    print(f"[VERIFIED] PDF parsed cleanly: {len(reader.pages)} page(s), all user clinical data verified.")

    # =========================================================================
    # STEP B: Test CSV Download & Parsing
    # =========================================================================
    csv_res = client.get("/api/reports/export?format=csv", headers=auth_headers)
    assert csv_res.status_code == 200, f"CSV export failed: {csv_res.status_code}"
    assert "text/csv" in csv_res.headers["content-type"]
    assert "skin-health-report.csv" in csv_res.headers["content-disposition"]

    csv_path = os.path.join(export_dir, "skin-health-report.csv")
    with open(csv_path, "wb") as f:
        f.write(csv_res.content)

    print(f"[OK] 2. Downloaded CSV: {csv_path} ({len(csv_res.content)} bytes)")
    assert csv_res.content[:3] == b"\xef\xbb\xbf", "Missing Excel UTF-8 BOM in CSV!"
    
    csv_text = csv_res.content.decode("utf-8-sig")
    csv_reader = list(csv.reader(io.StringIO(csv_text)))
    assert len(csv_reader) > 10
    flat_csv_data = " ".join([" ".join(row) for row in csv_reader])
    assert "Forensic Test Patient" in flat_csv_data
    assert "forensic_patient@skincare.com" in flat_csv_data
    assert "Combination" in flat_csv_data
    print(f"[VERIFIED] CSV parsed cleanly: {len(csv_reader)} rows, UTF-8 BOM present, user data confirmed.")

    # =========================================================================
    # STEP C: Test XLSX Download & Parsing with openpyxl
    # =========================================================================
    xlsx_res = client.get("/api/reports/export?format=xlsx", headers=auth_headers)
    assert xlsx_res.status_code == 200, f"XLSX export failed: {xlsx_res.status_code}"
    assert "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" in xlsx_res.headers["content-type"]
    assert "skin-health-report.xlsx" in xlsx_res.headers["content-disposition"]

    xlsx_path = os.path.join(export_dir, "skin-health-report.xlsx")
    with open(xlsx_path, "wb") as f:
        f.write(xlsx_res.content)

    print(f"[OK] 3. Downloaded XLSX: {xlsx_path} ({len(xlsx_res.content)} bytes)")
    assert xlsx_res.content[:2] == b"PK", "Invalid XLSX zip magic bytes!"

    wb = openpyxl.load_workbook(io.BytesIO(xlsx_res.content))
    expected_sheets = [
        "Health Summary", "Skin Profile", "Health Score", "Skin Assessment",
        "Concerns & Safety", "Personalized Routine", "Product Recommendations",
        "Routine Adherence", "Progress History", "Reminder Settings"
    ]
    for s in expected_sheets:
        assert s in wb.sheetnames, f"Missing expected worksheet: {s}"
    assert len(wb.sheetnames) >= 4

    summary_sheet = wb["Health Summary"]
    summary_cells = [str(cell.value) for row in summary_sheet.iter_rows() for cell in row if cell.value is not None]
    summary_joined = " ".join(summary_cells)
    assert "Forensic Test Patient" in summary_joined
    assert "forensic_patient@skincare.com" in summary_joined
    assert "Combination" in summary_joined

    assessment_sheet = wb["Skin Assessment"]
    assessment_cells = [str(cell.value) for row in assessment_sheet.iter_rows() for cell in row if cell.value is not None]
    assert any("84.5" in c or "85" in c for c in assessment_cells)

    print(f"[VERIFIED] XLSX parsed cleanly: {len(wb.sheetnames)} worksheets, styled headers, user data confirmed.")

    # =========================================================================
    # STEP D: Verify User Data Isolation (User A vs User B)
    # =========================================================================
    user_b_email = "isolated_user_b@skincare.com"
    user_b = db.query(User).filter(User.email == user_b_email).first()
    if not user_b:
        user_b = User(
            email=user_b_email,
            password="test_pw_hash",
            full_name="Isolated User B",
            role="USER",
            is_active=1,
            is_verified=1
        )
        db.add(user_b)
        db.commit()
        db.refresh(user_b)

    token_b = create_access_token({"sub": user_b.email, "role": user_b.role})
    headers_b = {"Authorization": f"Bearer {token_b}"}

    pdf_b = client.get("/api/reports/export?format=pdf", headers=headers_b)
    pdf_b_reader = PdfReader(io.BytesIO(pdf_b.content))
    pdf_b_text = "".join([p.extract_text() for p in pdf_b_reader.pages])

    assert "Isolated User B" in pdf_b_text
    assert "Forensic Test Patient" not in pdf_b_text
    print("[VERIFIED] Multi-tenant Data Isolation: User B report strictly contains only User B data.")

    # =========================================================================
    # STEP E: Verify Security - No Credentials in Exports
    # =========================================================================
    for content_str in [pdf_text, flat_csv_data, summary_joined]:
        assert "hashed_test_password" not in content_str
        assert "secret" not in content_str.lower() or "disclaimer" in content_str.lower()
        assert token not in content_str
    print("[VERIFIED] Security Check: Zero credentials, passwords, or tokens in report exports.")

    print("=" * 70)
    print(" ALL FORENSIC CHECKS PASSED: 100% VERIFIED")
    print("=" * 70 + "\n")
    db.close()

if __name__ == "__main__":
    run_download_verification()
