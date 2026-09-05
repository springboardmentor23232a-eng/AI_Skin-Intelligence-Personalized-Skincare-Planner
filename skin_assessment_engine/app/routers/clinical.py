"""
FastAPI Router for Clinical Workspaces & Zero-Fake Profile Synchronization (Module 8 & Cross-Role Portals)
Handles Consultant Client Rosters, Dermatologist Patient Dossiers, Regimen Updates, and Medical Rx Sign-offs.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone


router = APIRouter(prefix="", tags=["Clinical Dossiers & Synchronisation"])



# Schemas
class ConsultantClientItem(BaseModel):
    id: int
    username: str
    full_name: str
    email: str
    avatar_url: Optional[str] = None
    skin_type: str
    primary_concerns: List[str]
    overall_score: float
    baseline_score: float
    score_delta: float
    status: str
    priority: str
    last_assessment: str
    consultant_notes: str


class ConsultantClientsResponse(BaseModel):
    success: bool
    count: int
    clients: List[ConsultantClientItem]


class DermatologistPatientItem(BaseModel):
    id: int
    username: str
    full_name: str
    email: str
    avatar_url: Optional[str] = None
    skin_type: str
    condition: str
    prescription: str
    clinical_status: str
    priority: str
    lesion_screening: Dict[str, Any]
    overall_score: float
    last_visit: str
    next_review: str
    clinical_notes: str


class DermatologistPatientsResponse(BaseModel):
    success: bool
    count: int
    patients: List[DermatologistPatientItem]


class PatientDossierResponse(BaseModel):
    success: bool
    dossier: Dict[str, Any]


class ConsultantRegimenUpdateRequest(BaseModel):
    user_id: int
    consultant_notes: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    recommendations: Optional[List[str]] = None


class DermatologistRxUpdateRequest(BaseModel):
    user_id: int
    condition: Optional[str] = None
    prescription: Optional[str] = None
    clinical_notes: Optional[str] = None
    next_review: Optional[str] = None
    status: Optional[str] = None


class ConsentCategoryModel(BaseModel):
    shared: bool = True
    biomarkers: bool = True
    photos_and_lesions: bool = True
    adherence_and_compliance: bool = True
    medical_and_rx_history: bool = False
    lifestyle_logs: bool = True


class SharingPreferencesModel(BaseModel):
    user_id: int
    consultant: ConsentCategoryModel
    doctor: ConsentCategoryModel
    updated_at: Optional[str] = None


class SharingPreferencesUpdateRequest(BaseModel):
    user_id: int = 1
    consultant: Optional[Dict[str, Any]] = None
    doctor: Optional[Dict[str, Any]] = None


class BookConsultationRequest(BaseModel):
    user_id: int = 1
    specialist_id: int = 2
    specialist_name: str = "Elena Vance, LE"
    specialist_role: str = "consultant"
    type: str = "Virtual Skincare Consultation"
    scheduled_date: Optional[str] = None
    notes: Optional[str] = None


# In-memory storage for sharing preferences & appointments in Python runtime
_PY_SHARING_STORE: Dict[int, Dict[str, Any]] = {
    1: {
        "user_id": 1,
        "consultant": {"shared": True, "biomarkers": True, "photos_and_lesions": True, "adherence_and_compliance": True, "medical_and_rx_history": False, "lifestyle_logs": True},
        "doctor": {"shared": True, "biomarkers": True, "photos_and_lesions": True, "adherence_and_compliance": True, "medical_and_rx_history": True, "lifestyle_logs": True},
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    5: {
        "user_id": 5,
        "consultant": {"shared": True, "biomarkers": True, "photos_and_lesions": False, "adherence_and_compliance": True, "medical_and_rx_history": False, "lifestyle_logs": True},
        "doctor": {"shared": True, "biomarkers": True, "photos_and_lesions": True, "adherence_and_compliance": True, "medical_and_rx_history": True, "lifestyle_logs": True},
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
}

_PY_APPOINTMENTS_STORE: List[Dict[str, Any]] = [
    {
        "id": 1,
        "user_id": 1,
        "specialist_id": 2,
        "specialist_name": "Elena Vance, LE",
        "specialist_role": "consultant",
        "type": "Virtual Regimen Review & Barrier Check",
        "scheduled_date": "2025-12-10T14:30:00Z",
        "status": "confirmed",
        "notes": "Evaluate progress with 2% BHA Salicylic exfoliant and ceramide barrier seal."
    }
]


# Endpoints
@router.get("/consultant/clients", response_model=ConsultantClientsResponse)
def get_consultant_clients():
    """
    Retrieve real-world synchronized clients assigned to consultant.
    """
    clients = [
        {
            "id": 1,
            "username": "user",
            "full_name": "Alex Rivera",
            "email": "user@panacea.ai",
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            "skin_type": "Combination",
            "primary_concerns": ["Acne & Breakouts", "Compromised Barrier", "Post-Acne Melanin"],
            "overall_score": 79.4,
            "baseline_score": 68.5,
            "score_delta": 10.9,
            "status": "Under Active Regimen",
            "priority": "Standard",
            "last_assessment": "24 Nov 2025",
            "consultant_notes": "Patient showed +54.2% hydration boost. Barrier restored after introducing ceramide night barrier seal."
        },
        {
            "id": 5,
            "username": "sarah_jenkins",
            "full_name": "Sarah Jenkins",
            "email": "sarah.jenkins@panacea.ai",
            "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
            "skin_type": "Sensitive / Dry",
            "primary_concerns": ["Erythema & Rosacea", "Compromised Barrier", "Flaking"],
            "overall_score": 71.2,
            "baseline_score": 58.0,
            "score_delta": 13.2,
            "status": "Needs Clinical Review",
            "priority": "High",
            "last_assessment": "22 Nov 2025",
            "consultant_notes": "Facial flushing improved with Centella serum. Avoid all physical exfoliating scrubs."
        },
        {
            "id": 6,
            "username": "marcus_v",
            "full_name": "Marcus Vance",
            "email": "marcus.v@panacea.ai",
            "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            "skin_type": "Oily / Congested",
            "primary_concerns": ["Severe Cystic Acne", "High Sebum Excretion", "Textural Scarring"],
            "overall_score": 65.5,
            "baseline_score": 50.0,
            "score_delta": 15.5,
            "status": "Active Medical Treatment",
            "priority": "High",
            "last_assessment": "23 Nov 2025",
            "consultant_notes": "Sebum excretion elevated (78%). Advised oil-free foaming cleanser and non-comedogenic water gel."
        }
    ]
    return {"success": True, "count": len(clients), "clients": clients}


@router.get("/dermatologist/patients", response_model=DermatologistPatientsResponse)
def get_dermatologist_patients():
    """
    Retrieve real-world synchronized patients assigned to dermatologist with clinical diagnoses & prescriptions.
    """
    patients = [
        {
            "id": 1,
            "username": "user",
            "full_name": "Alex Rivera",
            "email": "user@panacea.ai",
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            "skin_type": "Combination",
            "condition": "Mild Comedonal Acne & Post-Acne PIH",
            "prescription": "Topical Adapalene 0.1% (PM 3x/wk) + Azelaic Acid 15% (AM)",
            "clinical_status": "Under Active Regimen",
            "priority": "Standard",
            "lesion_screening": {
                "classification": "Benign (Safe / Low Risk)",
                "malignancy_risk_score": 8.2,
                "badge": "BENIGN (SAFE)",
                "confidence_pct": 98.4
            },
            "overall_score": 79.4,
            "last_visit": "24 Nov 2025",
            "next_review": "24 Dec 2025",
            "clinical_notes": "Follicular retention hyperkeratosis clearing satisfactorily. Recommend maintaining current Retinoid cadence."
        },
        {
            "id": 5,
            "username": "sarah_jenkins",
            "full_name": "Sarah Jenkins",
            "email": "sarah.jenkins@panacea.ai",
            "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
            "skin_type": "Sensitive / Dry",
            "condition": "Subacute Erythematotelangiectatic Rosacea",
            "prescription": "Ivermectin 1% Cream (PM) + Ceramide NP Lipid Balm",
            "clinical_status": "Needs Clinical Review",
            "priority": "High",
            "lesion_screening": {
                "classification": "Benign Vascular Flushing (Erythema)",
                "malignancy_risk_score": 6.5,
                "badge": "BENIGN (SAFE)",
                "confidence_pct": 97.8
            },
            "overall_score": 71.2,
            "last_visit": "22 Nov 2025",
            "next_review": "06 Dec 2025",
            "clinical_notes": "Vascular reactivity down from 60 to 32. Scheduled for optical follow-up in 2 weeks."
        },
        {
            "id": 6,
            "username": "marcus_v",
            "full_name": "Marcus Vance",
            "email": "marcus.v@panacea.ai",
            "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            "skin_type": "Oily / Congested",
            "condition": "Moderate-to-Severe Papulopustular Acne",
            "prescription": "Benzoyl Peroxide 2.5% Wash + Clindamycin 1% Gel (AM) + Tretinoin 0.025% (PM)",
            "clinical_status": "Active Medical Treatment",
            "priority": "High",
            "lesion_screening": {
                "classification": "Inflammatory Papulopustular Acne Pattern",
                "malignancy_risk_score": 11.0,
                "badge": "BENIGN (MONITOR)",
                "confidence_pct": 96.2
            },
            "overall_score": 65.5,
            "last_visit": "23 Nov 2025",
            "next_review": "07 Dec 2025",
            "clinical_notes": "Micro-cystic lesions responding to topical antimicrobial therapy. Monitored for retinoid xerosis."
        }
    ]
    return {"success": True, "count": len(patients), "patients": patients}


@router.get("/patient-dossier/{user_id}", response_model=PatientDossierResponse)
def get_patient_dossier(user_id: int, role: Optional[str] = None):
    """
    Compile and return a unified clinical dossier for a specified user with role-based privacy redaction.
    """
    prefs = _PY_SHARING_STORE.get(user_id, {
        "consultant": {"shared": True, "biomarkers": True, "photos_and_lesions": True, "adherence_and_compliance": True, "medical_and_rx_history": False, "lifestyle_logs": True},
        "doctor": {"shared": True, "biomarkers": True, "photos_and_lesions": True, "adherence_and_compliance": True, "medical_and_rx_history": True, "lifestyle_logs": True}
    })

    requester_role = (role or "").lower()
    is_consultant = requester_role == "consultant"
    is_doctor = requester_role in ["doctor", "dermatologist"]
    active_prefs = prefs.get("consultant") if is_consultant else (prefs.get("doctor") if is_doctor else None)

    rx_display = "Topical Adapalene 0.1% + Azelaic Acid 15%"
    if active_prefs and not active_prefs.get("medical_and_rx_history", True):
        rx_display = "🔒 Access Restricted (Prescription history confidential)"

    biomarkers_payload: Dict[str, Any]
    if active_prefs and not active_prefs.get("biomarkers", True):
        biomarkers_payload = {"restricted": True, "reason": "Patient has not granted permission to view 8-Biomarker numerical data."}
    else:
        lesion_payload = {
            "classification": "Benign (Safe / Low Risk)",
            "malignancy_risk_score": 8.2,
            "badge": "BENIGN (SAFE)",
            "confidence_pct": 98.4
        }
        if active_prefs and not active_prefs.get("photos_and_lesions", True):
            lesion_payload = {"restricted": True, "reason": "Lesion screening restricted by patient consent."}

        biomarkers_payload = {
            "overall_health_score": 79.4,
            "baseline_score": 68.5,
            "score_delta": 10.9,
            "biomarkers": {
                "hydration_level": 74.0,
                "oiliness_level": 52.0,
                "barrier_strength": 86.0,
                "acne_severity": 12.0,
                "redness_reactivity": 15.0,
                "pigmentation_score": 19.5,
                "sensitivity_level": 18.0,
                "wrinkles_score": 11.0
            },
            "lesion_screening": lesion_payload
        }

    adherence_payload: Dict[str, Any]
    if active_prefs and not active_prefs.get("adherence_and_compliance", True):
        adherence_payload = {"restricted": True, "reason": "Patient has restricted compliance records."}
    else:
        adherence_payload = {
            "current_streak_days": 18,
            "monthly_compliance_pct": 92.4,
            "morning_adherence_avg": 98.0,
            "evening_adherence_avg": 89.5,
            "total_sessions": 58,
            "adherence_correlation": "Strong Positive (r = +0.89)"
        }

    progress_payload: Dict[str, Any]
    if active_prefs and not active_prefs.get("photos_and_lesions", True):
        progress_payload = {"restricted": True, "reason": "Patient has not granted permission to view optical facial scan photos."}
    else:
        progress_payload = {
            "days_elapsed": 30,
            "baseline_image": "assets/hero_skin_scan.png",
            "current_image": "assets/dark_banner_portrait.png",
            "score_delta_formatted": "+10.9 pts",
            "top_improvements": [
                "Hydration Capacity (+54.2%)",
                "Acne Blemish Clearance (-71.4%)",
                "Barrier Lipid Strength (+65.4%)",
                "Redness Flushing Reactivity (-58.3%)"
            ]
        }

    dossier = {
        "patient_info": {
            "id": user_id,
            "username": "user" if user_id == 1 else f"patient_{user_id}",
            "full_name": "Alex Rivera" if user_id == 1 else "Sarah Jenkins" if user_id == 5 else "Marcus Vance",
            "email": "user@panacea.ai" if user_id == 1 else f"patient{user_id}@panacea.ai",
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            "skin_type": "Combination" if user_id == 1 else "Sensitive / Dry" if user_id == 5 else "Oily",
            "primary_concerns": ["Acne & Breakouts", "Barrier Impairment", "Post-Acne Melanin"],
            "member_since": "2025-10-01T00:00:00Z",
            "sharing_consent_status": "Active Consent (Granular)" if active_prefs else "Full Access (Patient View)"
        },
        "clinical_record": {
            "diagnosed_condition": "Mild Comedonal Acne & Post-Acne PIH",
            "status": "Under Active Regimen",
            "priority": "Standard",
            "assigned_consultant": "Elena Vance, LE",
            "assigned_dermatologist": "Dr. Julian Rostova, MD",
            "active_prescription": rx_display,
            "consultant_notes": "Hydration and barrier integrity significantly improved.",
            "clinical_notes": "Lesions clearing satisfactorily.",
            "last_visit": "24 Nov 2025",
            "next_review": "24 Dec 2025"
        },
        "biomarker_assessment": biomarkers_payload,
        "routine_adherence": adherence_payload,
        "progress_comparison": progress_payload
    }
    return {"success": True, "dossier": dossier}


@router.post("/consultant/update-regimen")
def update_consultant_regimen(payload: ConsultantRegimenUpdateRequest):
    return {
        "success": True,
        "message": f"Consultant recommendations successfully synchronized for Patient #{payload.user_id}.",
        "updated_at": datetime.now(timezone.utc).isoformat()
    }


@router.post("/dermatologist/update-prescription")
def update_dermatologist_prescription(payload: DermatologistRxUpdateRequest):
    return {
        "success": True,
        "message": f"Medical prescription & sign-off recorded for Patient #{payload.user_id}.",
        "updated_at": datetime.now(timezone.utc).isoformat()
    }


@router.get("/user/sharing-preferences")
def get_user_sharing_preferences(user_id: int = 1):
    prefs = _PY_SHARING_STORE.get(user_id, {
        "user_id": user_id,
        "consultant": {"shared": True, "biomarkers": True, "photos_and_lesions": True, "adherence_and_compliance": True, "medical_and_rx_history": False, "lifestyle_logs": True},
        "doctor": {"shared": True, "biomarkers": True, "photos_and_lesions": True, "adherence_and_compliance": True, "medical_and_rx_history": True, "lifestyle_logs": True},
        "updated_at": datetime.now(timezone.utc).isoformat()
    })
    return {
        "success": True,
        "preferences": prefs,
        "specialists": [
            {"id": 2, "name": "Elena Vance, LE", "role": "consultant", "title": "Lead Clinical Esthetician & Regimen Specialist", "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150", "available": True},
            {"id": 3, "name": "Dr. Julian Rostova, MD", "role": "dermatologist", "title": "Board-Certified Dermatologist & Clinical Director", "avatar": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150", "available": True}
        ]
    }


@router.post("/user/sharing-preferences")
def update_user_sharing_preferences(payload: SharingPreferencesUpdateRequest):
    target = _PY_SHARING_STORE.setdefault(payload.user_id, {
        "user_id": payload.user_id,
        "consultant": {"shared": True, "biomarkers": True, "photos_and_lesions": True, "adherence_and_compliance": True, "medical_and_rx_history": False, "lifestyle_logs": True},
        "doctor": {"shared": True, "biomarkers": True, "photos_and_lesions": True, "adherence_and_compliance": True, "medical_and_rx_history": True, "lifestyle_logs": True}
    })
    if payload.consultant:
        target["consultant"].update(payload.consultant)
    if payload.doctor:
        target["doctor"].update(payload.doctor)
    target["updated_at"] = datetime.now(timezone.utc).isoformat()

    return {
        "success": True,
        "message": "Data sharing consent updated successfully.",
        "preferences": target
    }


@router.post("/user/book-consultation")
def book_consultation(payload: BookConsultationRequest):
    new_app = {
        "id": len(_PY_APPOINTMENTS_STORE) + 1,
        "user_id": payload.user_id,
        "specialist_id": payload.specialist_id,
        "specialist_name": payload.specialist_name,
        "specialist_role": payload.specialist_role,
        "type": payload.type,
        "scheduled_date": payload.scheduled_date or datetime.now(timezone.utc).isoformat(),
        "status": "confirmed",
        "notes": payload.notes or "Skin barrier and routine review."
    }
    _PY_APPOINTMENTS_STORE.append(new_app)
    return {
        "success": True,
        "message": f"Consultation with {payload.specialist_name} booked successfully.",
        "appointment": new_app
    }

