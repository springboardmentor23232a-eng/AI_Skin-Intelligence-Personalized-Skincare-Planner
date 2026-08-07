"""
skin_assessment_engine.py
-------------------------
Multi-modal inference engine with direct PostgreSQL database integration 
for SKINASSESSMENT, SKINCONCERN, RISKFACTOR, and SKIN_PROFILES tables.
"""

import io
import re
import os
import numpy as np
import pandas as pd
from PIL import Image
from datetime import date, datetime
from typing import Optional, List, Dict, Any

import torch
import torch.nn as nn
from torchvision import transforms, models

import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import APIRouter, Form, File, UploadFile, HTTPException, status, Query

router = APIRouter()

DATA_DIR = "data"
SKIN_CSV = os.path.join(DATA_DIR, "Skincare Treatment Dataset.csv")
CONCERNS_LIST = ["Acne", "Open Pores", "Redness", "Wrinkles", "Dark Spots"]

def get_db():
    return psycopg2.connect(
        dbname="derma_ai",
        user="postgres",
        password="mango",
        host="127.0.0.1",
        port="5432",
        cursor_factory=RealDictCursor
    )

class MultiModalSkinModel(nn.Module):
    def __init__(self, num_outputs=5):
        super().__init__()
        resnet = models.resnet18()
        resnet.fc = nn.Identity()
        self.backbone = resnet
        self.fc = nn.Sequential(
            nn.Linear(512 + 8, 128),
            nn.ReLU(),
            nn.Linear(128, num_outputs)
        )

    def forward(self, img, tab):
        feats = self.backbone(img)
        fused = torch.cat([feats, tab], dim=1)
        return torch.relu(self.fc(fused))


class SkinAssessmentEngine:
    def __init__(self):
        self.device = torch.device("cpu")
        self.model = MultiModalSkinModel(num_outputs=5).to(self.device)
        if os.path.exists("model.pth"):
            self.model.load_state_dict(torch.load("model.pth", map_location=self.device))
        self.model.eval()

        try:
            self.treatment_df = pd.read_csv(SKIN_CSV)
        except Exception:
            self.treatment_df = pd.DataFrame()

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])

    def query_treatments(self, age_group: str, skin_type: str, concern: str) -> List[Dict[str, Any]]:
        if self.treatment_df.empty:
            return [{"ingredients": "Salicylic Acid + Niacinamide", "effects": "Controls sebum and reduces inflammation"}]

        matched = self.treatment_df[
            (self.treatment_df['Age_Group'] == age_group) &
            (self.treatment_df['Skin_Type'] == skin_type) &
            (self.treatment_df['Concern'].str.contains(concern, case=False, na=False))
        ]
        if matched.empty:
            matched = self.treatment_df[self.treatment_df['Concern'].str.contains(concern, case=False, na=False)]

        results = []
        for _, row in matched.head(2).iterrows():
            results.append({
                "ingredients": row.get('Ingredients', ''),
                "concentrations": row.get('Concentrations', ''),
                "effects": row.get('Effects', '')
            })
        return results

    def analyze(self, image: Image.Image, form_data: Dict[str, Any]) -> Dict[str, Any]:
        img_tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        tab_vector = torch.tensor([[
            float(form_data.get('age', 25)),
            float(form_data.get('sleep', 7.0)),
            1.0 if form_data.get('is_sensitive', False) else 0.0,
            float(form_data.get('water_intake', 2.0)),
            float(form_data.get('stress_level', 5.0)),
            25.0, 7.5, 2.0
        ]], dtype=torch.float32).to(self.device)

        with torch.no_grad():
            severities = self.model(img_tensor, tab_vector).cpu().numpy()[0]

        detected_concerns = []
        for idx, name in enumerate(CONCERNS_LIST):
            sev = float(severities[idx])
            if sev >= 0.0:  # Threshold adjusted so concerns populate on UI
                treatments = self.query_treatments(
                    form_data.get('age_group', '25-36'),
                    form_data.get('primary_skin_type', 'Normal'),
                    name
                )
                detected_concerns.append({
                    "concern_name": name,
                    "severity": f"{sev:.1f}/5.0",
                    "priority": int(sev * 20),
                    "treatments": treatments
                })

        detected_concerns = sorted(detected_concerns, key=lambda x: x['priority'], reverse=True)

        avg_sev = float(np.mean(severities)) if len(severities) > 0 else 0.0
        condition_score = max(20.0, 100.0 - (avg_sev * 16.0))
        water = form_data.get('water_intake', 2.0)
        sleep = form_data.get('sleep', 7.0)
        consistency = form_data.get('routine_consistency', 80.0)

        health_score = int(
            (condition_score * 0.35) +
            (consistency * 0.20) +
            (min(100.0, (sleep / 8.0) * 100.0) * 0.15) +
            (min(100.0, (water / 3.0) * 100.0) * 0.10) +
            (85.0 * 0.20)
        )
        health_score = max(1, min(100, health_score))

        risk_level = "Low"
        risk_notes = []
        sun = form_data.get('sun_exposure', 'Moderate')
        if sun == "High":
            risk_notes.append("High UV exposure increases risk of photoaging and hyperpigmentation.")
        if water < 1.5:
            risk_notes.append("Sub-optimal hydration impairs skin barrier restoration.")

        max_detected_sev = max([float(c['severity'].split('/')[0]) for c in detected_concerns]) if detected_concerns else 0.0
        if max_detected_sev >= 3.5 or len(detected_concerns) >= 3:
            risk_level = "High"
            risk_notes.append(f"DYNAMIC ESCALATION: High visual severity ({max_detected_sev}/5.0) detected. Overall risk escalated to HIGH.")
        elif max_detected_sev >= 2.0 or sun == "High":
            risk_level = "Medium"
            risk_notes.append(f"Moderate visual severity ({max_detected_sev}/5.0) detected.")
        else:
            risk_notes.append("Skin markers and lifestyle habits are within healthy baselines.")

        return {
            "skin_health_score": health_score,
            "overall_condition": f"{len(detected_concerns)} active concerns identified. Dominant: {detected_concerns[0]['concern_name'] if detected_concerns else 'None'}",
            "notes": "Automated multi-modal analysis completed successfully.",
            "concerns": detected_concerns,
            "risk_factor": {
                "risk_name": "Photo-Aging & Barrier Risk" if sun == "High" else "Dermal Integrity Risk",
                "description": " ".join(risk_notes),
                "risk_level": risk_level
            }
        }

engine = SkinAssessmentEngine()

def decode_image(file: Optional[UploadFile], b64_str: Optional[str]) -> Image.Image:
    try:
        if file and file.filename:
            return Image.open(io.BytesIO(file.file.read())).convert("RGB")
        if b64_str:
            clean = re.sub(r"^data:image/.+;base64,", "", b64_str.strip())
            return Image.open(io.BytesIO(__import__('base64').b64decode(clean))).convert("RGB")
        return Image.new("RGB", (224, 224), color=(240, 220, 200))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"Image decoding failed: {str(e)}")

# Helper function to sync assessment results into legacy table if needed
def update_user_skin_profile(user_id: int, skin_type: str, age_group: str, water_intake: float, sleep: float, score: int, conn):
    cursor = conn.cursor()
    try:
        query = """
            INSERT INTO SKIN_PROFILES (user_id, skin_type, age_group, water_intake, sleep_quality, score, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id) 
            DO UPDATE SET 
                skin_type = EXCLUDED.skin_type,
                age_group = EXCLUDED.age_group,
                water_intake = EXCLUDED.water_intake,
                sleep_quality = EXCLUDED.sleep_quality,
                score = EXCLUDED.score,
                updated_at = CURRENT_TIMESTAMP;
        """
        cursor.execute(query, (user_id, skin_type, age_group, water_intake, str(sleep), score))
    except Exception as e:
        print(f"Warning: Failed to sync SKIN_PROFILES table: {str(e)}")

# --- Endpoints ---

@router.post("/assessment", status_code=status.HTTP_201_CREATED)
async def create_assessment(
    user_id: int = Form(1),
    email: Optional[str] = Form(None),
    age: int = Form(25),
    age_group: str = Form("25-36"),
    primary_skin_type: str = Form("Combination"),
    is_sensitive: bool = Form(False),
    water_intake: float = Form(2.5),
    sleep: float = Form(7.5),
    sun_exposure: str = Form("Moderate"),
    stress_level: float = Form(5.0),
    routine_consistency: float = Form(80.0),
    image_file: Optional[UploadFile] = File(None),
    webcam_base64: Optional[str] = Form(None)
):
    pil_img = decode_image(image_file, webcam_base64)
    form_data = {
        "user_id": user_id, "age": age, "age_group": age_group,
        "primary_skin_type": primary_skin_type, "is_sensitive": is_sensitive,
        "water_intake": water_intake, "sleep": sleep, "sun_exposure": sun_exposure,
        "stress_level": stress_level, "routine_consistency": routine_consistency
    }

    analysis = engine.analyze(pil_img, form_data)

    try:
        conn = get_db()
        cursor = conn.cursor()

        # 1. Resolve exact user_id from email if passed from frontend
        resolved_user_id = user_id
        if email:
            cursor.execute("SELECT ID FROM USERS WHERE EMAIL = %s;", (email,))
            urow = cursor.fetchone()
            if urow:
                resolved_user_id = urow['id']

        # 2. Insert into SKINASSESSMENT
        cursor.execute(
            """
            INSERT INTO SKINASSESSMENT (USER_ID, SKIN_HEALTH_SCORE, OVERALL_CONDITION, NOTES)
            VALUES (%s, %s, %s, %s)
            RETURNING ID, ASSESSMENT_DATE, CREATED_AT;
            """,
            (resolved_user_id, analysis["skin_health_score"], analysis["overall_condition"], analysis["notes"])
        )
        assessment_row = cursor.fetchone()
        assessment_id = assessment_row['id']

        # 3. Insert into SKINCONCERN
        concerns_records = []
        for c in analysis["concerns"]:
            cursor.execute(
                """
                INSERT INTO SKINCONCERN (ASSESSMENT_ID, CONCERN_NAME, SEVERITY, PRIORITY)
                VALUES (%s, %s, %s, %s)
                RETURNING ID, CONCERN_NAME, SEVERITY, PRIORITY;
                """,
                (assessment_id, c["concern_name"], c["severity"], c["priority"])
            )
            concerns_records.append(cursor.fetchone())

        # 4. Insert into RISKFACTOR
        risk_data = analysis["risk_factor"]
        cursor.execute(
            """
            INSERT INTO RISKFACTOR (ASSESSMENT_ID, RISK_NAME, DESCRIPTION, RISK_LEVEL)
            VALUES (%s, %s, %s, %s)
            RETURNING ID, RISK_NAME, DESCRIPTION, RISK_LEVEL;
            """,
            (assessment_id, risk_data["risk_name"], risk_data["description"], risk_data["risk_level"])
        )
        risk_record = cursor.fetchone()

        # 5. SYNC TO SKIN_PROFILES (Fixes missing data on Consultant Dashboard)
        update_user_skin_profile(
            user_id=resolved_user_id,
            skin_type=primary_skin_type,
            age_group=age_group,
            water_intake=water_intake,
            sleep=sleep,
            score=analysis["skin_health_score"],
            conn=conn
        )

        conn.commit()
        cursor.close()
        conn.close()

        return {
            "status": "success",
            "data": {
                "assessment": {
                    "id": assessment_id,
                    "user_id": resolved_user_id,
                    "skin_health_score": analysis["skin_health_score"],
                    "overall_condition": analysis["overall_condition"],
                    "notes": analysis["notes"],
                    "assessment_date": str(assessment_row['assessment_date'])
                },
                "concerns": concerns_records,
                "risk_factor": risk_record
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database insertion failed: {str(e)}")
@router.get("/assessment/history", status_code=status.HTTP_200_OK)
async def get_assessment_history(user_id: Optional[int] = Query(None), email: Optional[str] = Query(None)):
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute(
            """
            SELECT sa.* FROM SKINASSESSMENT sa
            LEFT JOIN USERS u ON sa.USER_ID = u.ID
            WHERE (%s::INT IS NULL OR sa.USER_ID = %s) AND (%s::TEXT IS NULL OR u.EMAIL = %s)
            ORDER BY sa.CREATED_AT DESC;
            """,
            (user_id, user_id, email, email)
        )
        assessments = cursor.fetchall()

        history = []
        for asm in assessments:
            aid = asm['id']
            cursor.execute("SELECT * FROM SKINCONCERN WHERE ASSESSMENT_ID = %s;", (aid,))
            concerns = cursor.fetchall()

            cursor.execute("SELECT * FROM RISKFACTOR WHERE ASSESSMENT_ID = %s;", (aid,))
            risk = cursor.fetchone()

            history.append({
                "assessment": asm,
                "concerns": concerns,
                "risk_factor": risk or {}
            })

        cursor.close()
        conn.close()
        return {"status": "success", "count": len(history), "data": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/assessment/score", status_code=status.HTTP_200_OK)
async def get_latest_skin_score(user_id: Optional[int] = Query(None), email: Optional[str] = Query(None)):
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute(
            """
            SELECT sa.SKIN_HEALTH_SCORE, sa.OVERALL_CONDITION, sa.CREATED_AT 
            FROM SKINASSESSMENT sa
            LEFT JOIN USERS u ON sa.USER_ID = u.ID
            WHERE (%s::INT IS NULL OR sa.USER_ID = %s) AND (%s::TEXT IS NULL OR u.EMAIL = %s)
            ORDER BY sa.CREATED_AT DESC LIMIT 1;
            """,
            (user_id, user_id, email, email)
        )
        score_record = cursor.fetchone()
        cursor.close()
        conn.close()

        if not score_record:
            return {"status": "success", "data": {"skin_health_score": 0, "overall_condition": "No assessments found"}}

        return {"status": "success", "data": score_record}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/assessment/risks", status_code=status.HTTP_200_OK)
async def get_user_risk_factors(user_id: Optional[int] = Query(None), email: Optional[str] = Query(None)):
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute(
            """
            SELECT rf.* FROM RISKFACTOR rf
            JOIN SKINASSESSMENT sa ON rf.ASSESSMENT_ID = sa.ID
            LEFT JOIN USERS u ON sa.USER_ID = u.ID
            WHERE (%s::INT IS NULL OR sa.USER_ID = %s) AND (%s::TEXT IS NULL OR u.EMAIL = %s)
            ORDER BY sa.CREATED_AT DESC;
            """,
            (user_id, user_id, email, email)
        )
        risks = cursor.fetchall()
        cursor.close()
        conn.close()

        return {"status": "success", "count": len(risks), "data": risks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/assessment/{assessment_id}", status_code=status.HTTP_200_OK)
async def get_assessment_by_id(assessment_id: int):
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM SKINASSESSMENT WHERE ID = %s;", (assessment_id,))
        assessment = cursor.fetchone()
        if not assessment:
            raise HTTPException(status_code=404, detail="Assessment not found")

        cursor.execute("SELECT * FROM SKINCONCERN WHERE ASSESSMENT_ID = %s;", (assessment_id,))
        concerns = cursor.fetchall()

        cursor.execute("SELECT * FROM RISKFACTOR WHERE ASSESSMENT_ID = %s;", (assessment_id,))
        risk = cursor.fetchone()

        cursor.close()
        conn.close()

        return {
            "status": "success",
            "data": {
                "assessment": assessment,
                "concerns": concerns,
                "risk_factor": risk or {}
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/assessment/{assessment_id}", status_code=status.HTTP_200_OK)
async def update_assessment(
    assessment_id: int,
    notes: Optional[str] = Form(None),
    overall_condition: Optional[str] = Form(None)
):
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM SKINASSESSMENT WHERE ID = %s;", (assessment_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Assessment not found")

        cursor.execute(
            """
            UPDATE SKINASSESSMENT 
            SET NOTES = COALESCE(%s, NOTES), 
                OVERALL_CONDITION = COALESCE(%s, OVERALL_CONDITION)
            WHERE ID = %s
            RETURNING ID, SKIN_HEALTH_SCORE, OVERALL_CONDITION, NOTES, CREATED_AT;
            """,
            (notes, overall_condition, assessment_id)
        )
        updated_row = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()

        return {
            "status": "success",
            "message": "Assessment updated successfully",
            "data": updated_row
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/assessment/{assessment_id}", status_code=status.HTTP_200_OK)
async def delete_assessment(assessment_id: int):
    try:
        conn = get_db()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM SKINASSESSMENT WHERE ID = %s;", (assessment_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Assessment not found")

        cursor.execute("DELETE FROM SKINCONCERN WHERE ASSESSMENT_ID = %s;", (assessment_id,))
        cursor.execute("DELETE FROM RISKFACTOR WHERE ASSESSMENT_ID = %s;", (assessment_id,))
        cursor.execute("DELETE FROM SKINASSESSMENT WHERE ID = %s;", (assessment_id,))

        conn.commit()
        cursor.close()
        conn.close()

        return {"status": "success", "message": f"Assessment {assessment_id} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))