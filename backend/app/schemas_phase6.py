from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict


class ConsultationCreate(BaseModel):
    patient_id: int
    scheduled_at: Optional[datetime] = None
    notes: Optional[str] = None
    treatment_recommendations: Optional[str] = None


class ConsultationUpdate(BaseModel):
    status: Optional[str] = None  # PENDING, COMPLETED, CANCELLED
    notes: Optional[str] = None
    treatment_recommendations: Optional[str] = None
    scheduled_at: Optional[datetime] = None


class ConsultationResponse(BaseModel):
    id: int
    patient_id: int
    patient_name: str
    patient_email: str
    consultant_id: int
    consultant_name: str
    scheduled_at: datetime
    status: str
    notes: Optional[str] = None
    treatment_recommendations: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ClinicalReviewCreate(BaseModel):
    patient_id: int
    recommendation_id: Optional[int] = None
    status: str = "APPROVED"  # APPROVED, REJECTED, MODIFIED
    custom_routine: Optional[Any] = None
    recommended_products: Optional[Any] = None
    clinical_notes: Optional[str] = None


class ClinicalReviewResponse(BaseModel):
    id: int
    patient_id: int
    reviewer_id: int
    reviewer_name: str
    recommendation_id: Optional[int] = None
    status: str
    custom_routine: Optional[Any] = None
    recommended_products: Optional[Any] = None
    clinical_notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PatientSummary(BaseModel):
    id: int
    full_name: str
    email: str
    age: Optional[int] = None
    gender: Optional[str] = None
    skin_type: Optional[str] = None
    skin_tone: Optional[str] = None
    concerns: List[str] = []
    latest_overall_score: Optional[int] = None
    latest_risk_level: Optional[str] = None
    total_assessments: int = 0
    last_assessment_date: Optional[datetime] = None
    allergies: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
