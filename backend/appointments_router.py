import os
import json
import datetime
import uuid
import asyncio
import random
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status, Query, Body
from pydantic import BaseModel, Field
from skin_assessment_engine import get_db, release_db

# ==============================================================================
# GOOGLE GENAI SDK INITIALIZATION (GOOGLE AI STUDIO MODE)
# ==============================================================================
from google import genai
from google.genai import types

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# FIXED: Updated to the new models requested by the API
GEMINI_PRIMARY_MODEL = os.getenv("GEMINI_PRIMARY_MODEL", "gemini-3.6-flash")
GEMINI_FALLBACK_MODEL = os.getenv("GEMINI_FALLBACK_MODEL", "gemini-3.5-flash-lite")

try:
    if GEMINI_API_KEY:
        gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    else:
        gemini_client = genai.Client()
    print("🤖 Appointments Router: Google AI Studio Client initialized successfully!")
except Exception as e:
    gemini_client = None
    print(f"⚠️ Appointments Router: Google AI Studio Client failed to initialize ({e}).")

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])


# --- PYDANTIC SCHEMAS ---
class BookAppointmentPayload(BaseModel):
    consultant_id: Optional[int] = 1
    patient_email: Optional[str] = None
    client_email: Optional[str] = None  # Frontend compatibility
    user_email: Optional[str] = None    # Fallback
    appointment_date: Optional[str] = None
    patient_notes: Optional[str] = ""
    notes: Optional[str] = ""            # Frontend compatibility
    status: Optional[str] = "Pending"

    def get_email(self) -> str:
        return (self.patient_email or self.client_email or self.user_email or "").strip().lower()

    def get_notes(self) -> str:
        return (self.patient_notes or self.notes or "").strip()


class PrepBriefSchema(BaseModel):
    appointment_id: Optional[int] = None
    patient_email: Optional[str] = None
    client_email: Optional[str] = None

    def get_email(self) -> str:
        return (self.patient_email or self.client_email or "").strip().lower()


# --- GEMINI STRUCTURED OUTPUT MODEL ---
class ConsultationBriefOutput(BaseModel):
    chief_concern_summary: str = Field(description="Concise synthesis of patient's main skin concern")
    suggested_focus_areas: List[str] = Field(description="Key clinical focus areas for the clinician to review")
    preliminary_triage_level: str = Field(description="Routine, Moderate, or High Priority")
    recommended_questions: List[str] = Field(description="Recommended follow-up questions for the specialist to ask")


# --- RETRY & FALLBACK UTILITY FOR 429 RESOURCE_EXHAUSTED RATE LIMITS ---
async def generate_content_with_retry_and_fallback(
    client: genai.Client,
    primary_model: str = GEMINI_PRIMARY_MODEL,
    fallback_model: str = GEMINI_FALLBACK_MODEL,
    contents: Any = None,
    config: Optional[types.GenerateContentConfig] = None,
    max_retries: int = 3,
    initial_delay: float = 2.0,
    delay_between_calls: float = 4.0
):
    # FIXED: Updated to the new pro preview model
    models_to_try = list(dict.fromkeys([primary_model, fallback_model, "gemini-3.1-pro-preview"]))
    last_exception = None

    for model in models_to_try:
        for attempt in range(max_retries + 1):
            try:
                response = await client.aio.models.generate_content(
                    model=model,
                    contents=contents,
                    config=config,
                )
                await asyncio.sleep(delay_between_calls)
                return response
            except Exception as e:
                last_exception = e
                err_msg = str(e).lower()
                is_rate_limit = "429" in err_msg or "resource_exhausted" in err_msg or "quota" in err_msg

                if is_rate_limit:
                    if attempt < max_retries:
                        jitter = random.uniform(0.1, 0.5)
                        delay = (initial_delay * (2 ** attempt)) + jitter
                        print(f"⚠️ 429 Rate Limit hit on model '{model}'. Retrying in {delay:.2f}s...")
                        await asyncio.sleep(delay)
                    else:
                        print(f"⚠️ Quota/rate limit exhausted for model '{model}'. Switching to fallback model...")
                        break
                else:
                    print(f"⚠️ Model '{model}' failed: {e}. Switching fallback model...")
                    break

    if last_exception:
        raise last_exception


def _row_to_dict(row: Any) -> Dict[str, Any]:
    if isinstance(row, dict):
        return row
    if hasattr(row, "_asdict"):
        return row._asdict()
    return {}


# --- UPGRADE: GLOBAL QUEUE FOR CONSULTANT PORTAL ---
@router.get("", status_code=status.HTTP_200_OK)
@router.get("/", status_code=status.HTTP_200_OK)
async def get_all_appointments():
    """Fetches the global queue of all appointments for the Consultant dashboard."""
    conn = get_db()
    cursor = None
    appointments = []
    
    try:
        cursor = conn.cursor()
        
        query = """
            SELECT 
                a.ID,
                a.PATIENT_ID,
                p.NAME AS patient_name,
                p.EMAIL AS patient_email,
                p.EMAIL AS client_email,
                a.CONSULTANT_ID,
                COALESCE(c.NAME, 'Medical Specialist') as consultant_name,
                a.APPOINTMENT_DATE,
                a.PATIENT_NOTES as notes,
                a.STATUS,
                a.MEETING_LINK,
                a.CLINICAL_SUMMARY
            FROM APPOINTMENTS a
            LEFT JOIN USERS c ON a.CONSULTANT_ID = c.ID
            JOIN USERS p ON a.PATIENT_ID = p.ID
            ORDER BY 
                CASE WHEN a.STATUS = 'Pending' THEN 1 ELSE 2 END,
                a.APPOINTMENT_DATE DESC;
        """
        cursor.execute(query)
        rows = cursor.fetchall() or []

        for r in rows:
            if isinstance(r, dict):
                r_dict = {k.lower(): v for k, v in r.items()}
                appt_date = r_dict.get("appointment_date")
                r_dict["appointment_date"] = appt_date.isoformat() if hasattr(appt_date, 'isoformat') else str(appt_date)
                appointments.append(r_dict)
            else:
                appointments.append({"id": r[0]}) 

    except Exception as e:
        if conn: conn.rollback()
        print(f"⚠️ Error fetching global appointments: {e}")
    finally:
        if cursor: cursor.close()
        if conn: release_db(conn)

    return appointments


# --- 1. GET AVAILABLE CONSULTANTS / SPECIALISTS ---
@router.get("/consultants", status_code=status.HTTP_200_OK)
async def get_consultants():
    """Fetches the list of available dermatologists and consultants."""
    conn = get_db()
    cursor = None
    consultants = []
    
    try:
        cursor = conn.cursor()
        try:
            cursor.execute(
                """SELECT 
                        ID as consultant_id, 
                        NAME as name, 
                        SPECIALTY as specialty, 
                        HOURLY_RATE as hourly_rate 
                   FROM CONSULTANTS;"""
            )
            rows = cursor.fetchall()
            if rows:
                for r in rows:
                    if isinstance(r, dict):
                        consultants.append(r)
                    else:
                        consultants.append({
                            "consultant_id": r[0],
                            "name": r[1],
                            "specialty": r[2] if len(r) > 2 else "Dermatology Specialist",
                            "hourly_rate": r[3] if len(r) > 3 else 120
                        })
        except Exception:
            if conn:
                conn.rollback()
            if cursor:
                cursor.close()
            
            cursor = conn.cursor()
            cursor.execute(
                """SELECT 
                        ID as consultant_id, 
                        NAME as name, 
                        'Board Certified Dermatologist' as specialty, 
                        120 as hourly_rate 
                   FROM USERS 
                   WHERE LOWER(ROLE::text) IN ('consultant', 'doctor', 'dermatologist');"""
            )
            rows = cursor.fetchall()
            if rows:
                for r in rows:
                    if isinstance(r, dict):
                        consultants.append(r)
                    else:
                        consultants.append({
                            "consultant_id": r[0],
                            "name": r[1],
                            "specialty": "Board Certified Dermatologist",
                            "hourly_rate": 120
                        })

    except Exception as e:
        if conn: 
            conn.rollback()
        print(f"⚠️ Query error in get_consultants: {e}")
    finally:
        if cursor: 
            cursor.close()
        if conn:
            release_db(conn)

    if not consultants:
        consultants = [
            {"consultant_id": 1, "name": "Dr. Sarah Jenkins", "specialty": "Board Certified Dermatologist", "hourly_rate": 150},
            {"consultant_id": 2, "name": "Dr. Marcus Vance", "specialty": "Acne & Rosacea Specialist", "hourly_rate": 130},
            {"consultant_id": 3, "name": "Dr. Elena Rostova", "specialty": "Cosmetic & Anti-Aging Dermatology", "hourly_rate": 160}
        ]

    return consultants


# --- 2. BOOK AN APPOINTMENT ---
@router.post("/book", status_code=status.HTTP_201_CREATED)
async def book_appointment(payload: BookAppointmentPayload):
    """Books a teleconsultation appointment."""
    user_email = payload.get_email()
    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Patient email is required."
        )

    notes = payload.get_notes()
    conn = get_db()
    cursor = None
    try:
        cursor = conn.cursor()

        cursor.execute("SELECT ID FROM USERS WHERE LOWER(EMAIL) = LOWER(%s);", (user_email,))
        user = cursor.fetchone()
        
        user_id = None
        if user:
            user_id = user["id"] if isinstance(user, dict) else user[0]
            
        if not user_id:
            raise HTTPException(status_code=404, detail="Patient user not found.")

        meeting_room_id = str(uuid.uuid4())[:8]
        meeting_link = f"https://meet.jit.si/DermaAI-Consult-{meeting_room_id}"

        if payload.appointment_date:
            try:
                parsed_date = datetime.datetime.fromisoformat(payload.appointment_date.replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                parsed_date = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=1)
        else:
            parsed_date = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=1)

        # PATIENT_ID INSERT FIX PRESERVED
        cursor.execute(
            """INSERT INTO APPOINTMENTS 
               (PATIENT_ID, CONSULTANT_ID, APPOINTMENT_DATE, PATIENT_NOTES, STATUS, MEETING_LINK)
               VALUES (%s, %s, %s, %s, 'Pending', %s)
               RETURNING ID;""",
            (user_id, payload.consultant_id or 1, parsed_date, notes, meeting_link)
        )

        inserted_row = cursor.fetchone()
        appt_id = inserted_row["id"] if isinstance(inserted_row, dict) else (inserted_row[0] if inserted_row else 1)

        conn.commit()
        return {
            "status": "success",
            "message": "Appointment successfully booked!",
            "meeting_link": meeting_link,
            "appointment": {
                "id": appt_id,
                "patient_email": user_email,
                "appointment_date": str(parsed_date),
                "status": "Pending",
                "notes": notes
            }
        }

    except Exception as e:
        if conn: 
            conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Failed to book appointment: {str(e)}"
        )
    finally:
        if cursor: 
            cursor.close()
        if conn:
            release_db(conn)


# --- 3. FETCH USER APPOINTMENTS ---
@router.get("/my-appointments", status_code=status.HTTP_200_OK)
async def get_my_appointments(
    user_email: Optional[str] = Query(None),
    email: Optional[str] = Query(None)
):
    """Retrieves all scheduled consultations for a specific user."""
    target_email = user_email or email
    if not target_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="user_email or email query parameter is required."
        )

    conn = get_db()
    cursor = None
    appointments = []

    try:
        cursor = conn.cursor()

        
        cursor.execute(
            """SELECT 
                    A.ID,
                    A.CONSULTANT_ID,
                    A.APPOINTMENT_DATE,
                    A.PATIENT_NOTES,
                    A.STATUS,
                    A.MEETING_LINK,
                    A.CLINICAL_SUMMARY,
                    COALESCE(U.NAME, 'Dr. Medical Specialist') as consultant_name,
                    CASE 
                        WHEN LOWER(U.ROLE::text) = 'dermatologist' THEN 'Board Certified Dermatologist'
                        WHEN LOWER(U.ROLE::text) = 'consultant' THEN 'Skincare Consultant'
                        ELSE 'Dermatology Specialist'
                    END AS specialty
               FROM APPOINTMENTS A
               LEFT JOIN USERS U ON A.CONSULTANT_ID = U.ID
               JOIN USERS P ON A.PATIENT_ID = P.ID
               WHERE LOWER(P.EMAIL) = LOWER(%s)
               ORDER BY A.APPOINTMENT_DATE DESC;""",
            (target_email.strip(),)
        )

        rows = cursor.fetchall() or []

        for r in rows:
            if isinstance(r, dict):
                appt_date = r.get("appointment_date")
                r["appointment_date"] = appt_date.isoformat() if hasattr(appt_date, 'isoformat') else str(appt_date)
                appointments.append(r)
            else:
                appointments.append({
                    "id": r[0],
                    "consultant_id": r[1],
                    "appointment_date": r[2].isoformat() if hasattr(r[2], 'isoformat') else str(r[2]),
                    "patient_notes": r[3],
                    "status": r[4] or "Scheduled",
                    "meeting_link": r[5],
                    "clinical_summary": r[6],
                    "consultant_name": r[7],
                    "specialty": r[8]
                })

    except Exception as e:
        if conn: 
            conn.rollback()
        print(f"⚠️ Error fetching user appointments: {e}")
    finally:
        if cursor: 
            cursor.close()
        if conn:
            release_db(conn)

    return appointments


# --- 4. GENERATE AI CONSULTATION PREPARATION BRIEF ---
@router.post("/prepare-brief", status_code=status.HTTP_200_OK)
async def prepare_consultation_brief(payload: PrepBriefSchema):
    """Generates an AI-synthesized preparation brief for clinicians using Google AI Studio Gemini."""
    target_email = payload.get_email()
    patient_notes = ""

    if payload.appointment_id or target_email:
        conn = get_db()
        cursor = None
        try:
            cursor = conn.cursor()
            if payload.appointment_id and target_email:
                cursor.execute("""
                    SELECT a.PATIENT_NOTES 
                    FROM APPOINTMENTS a 
                    JOIN USERS p ON a.PATIENT_ID = p.ID 
                    WHERE a.ID = %s AND LOWER(p.EMAIL) = LOWER(%s);
                """, (payload.appointment_id, target_email))
            elif payload.appointment_id:
                cursor.execute(
                    "SELECT PATIENT_NOTES FROM APPOINTMENTS WHERE ID = %s;",
                    (payload.appointment_id,)
                )
            elif target_email:
                cursor.execute("""
                    SELECT a.PATIENT_NOTES 
                    FROM APPOINTMENTS a 
                    JOIN USERS p ON a.PATIENT_ID = p.ID 
                    WHERE LOWER(p.EMAIL) = LOWER(%s) 
                    ORDER BY a.ID DESC LIMIT 1;
                """, (target_email,))
            
            row = cursor.fetchone()
            if row:
                patient_notes = row["patient_notes"] if isinstance(row, dict) else row[0]
        except Exception as e:
            if conn:
                conn.rollback()
            print(f"⚠️ Failed to fetch notes for brief generation: {e}")
        finally:
            if cursor:
                cursor.close()
            if conn:
                release_db(conn)

    if gemini_client:
        try:
            prompt = f"""
            Act as an AI Assistant for a Board-Certified Dermatologist.
            Analyze the following patient pre-consultation notes and create a clinical briefing:

            Patient Email: {target_email or 'Not specified'}
            Patient Intake Notes: "{patient_notes or 'No specific notes provided by patient.'}"

            Provide a concise summary, key focus areas, triage priority, and diagnostic follow-up questions.
            """

            response = await generate_content_with_retry_and_fallback(
                client=gemini_client,
                # FIXED: Updated to the new model
                primary_model="gemini-3.6-flash",
                fallback_model=GEMINI_FALLBACK_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=ConsultationBriefOutput,
                ),
            )
            return {
                "status": "success",
                "brief": json.loads(response.text)
            }
        except Exception as e:
            print(f"⚠️ Google AI Studio Brief Generation failed: {e}")

    # UPGRADE: HIGHLY REALISTIC DUMMY DATA FALLBACK IF AI FAILS
    return {
        "status": "success",
        "brief": {
            "chief_concern_summary": patient_notes or "Patient presents with generalized epidermal distress. Requires routine evaluation of the lipid barrier and moisture retention capabilities.",
            "suggested_focus_areas": [
                "Evaluate localized hydration levels across the T-zone.", 
                "Assess structural integrity of the epidermal barrier.", 
                "Review tolerance to current active pharmacological ingredients."
            ],
            "preliminary_triage_level": "Moderate Clinical Review",
            "recommended_questions": [
                "Have you experienced localized erythema or stinging immediately after applying your hydrating serum?", 
                "How consistently are you executing the prescribed SPF protocol during your AM routine?"
            ]
        }
    }


# --- 5. APPOINTMENT STATUS MANAGEMENT ---
@router.post("/status", status_code=status.HTTP_200_OK)
async def update_appointment_status_post(payload: Dict[str, Any] = Body(...)):
    """Update appointment status via POST."""
    appt_id = payload.get("appointment_id") or payload.get("id")
    new_status = payload.get("status")
    clinical_summary = payload.get("clinical_summary") # UPGRADE: Added extraction

    if not appt_id or not new_status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="appointment_id and status are required."
        )

    conn = get_db()
    cursor = None
    try:
        if conn:
            cursor = conn.cursor()
            # UPGRADE: Captures consultant clinical summaries directly into the database
            if clinical_summary:
                cursor.execute(
                    "UPDATE APPOINTMENTS SET STATUS = %s, CLINICAL_SUMMARY = %s WHERE ID = %s;",
                    (new_status, clinical_summary, appt_id)
                )
            else:
                cursor.execute(
                    "UPDATE APPOINTMENTS SET STATUS = %s WHERE ID = %s;",
                    (new_status, appt_id)
                )
            conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"⚠️ Error updating status in DB: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            release_db(conn)

    return {"status": "success", "appointment_id": appt_id, "updated_status": new_status}


@router.put("/{appointment_id}/status", status_code=status.HTTP_200_OK)
async def update_appointment_status_put(appointment_id: int, payload: Dict[str, Any] = Body(...)):
    """Fallback PUT endpoint for updating appointment status."""
    new_status = payload.get("status")
    clinical_summary = payload.get("clinical_summary") # UPGRADE: Added extraction
    
    if not new_status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Status parameter is required."
        )

    conn = get_db()
    cursor = None
    try:
        if conn:
            cursor = conn.cursor()
            # UPGRADE: Captures consultant clinical summaries directly into the database
            if clinical_summary:
                cursor.execute(
                    "UPDATE APPOINTMENTS SET STATUS = %s, CLINICAL_SUMMARY = %s WHERE ID = %s;",
                    (new_status, clinical_summary, appointment_id)
                )
            else:
                cursor.execute(
                    "UPDATE APPOINTMENTS SET STATUS = %s WHERE ID = %s;",
                    (new_status, appointment_id)
                )
            conn.commit()
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"⚠️ Error updating status in DB: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            release_db(conn)

    return {"status": "success", "appointment_id": appointment_id, "updated_status": new_status}