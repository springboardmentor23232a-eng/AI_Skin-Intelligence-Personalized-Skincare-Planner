from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AppointmentCreate(BaseModel):
    dermatologist_id: Optional[UUID] = None
    consultant_id: Optional[UUID] = None

    appointment_date: datetime
    consultation_type: str = "video"
    reason: Optional[str] = None


class AppointmentStatusUpdate(BaseModel):
    status: str


class AppointmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    patient_id: UUID
    dermatologist_id: Optional[UUID] = None
    consultant_id: Optional[UUID] = None
    appointment_date: datetime
    consultation_type: str
    reason: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime


class AppointmentWithUsersOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    patient_id: UUID
    dermatologist_id: Optional[UUID] = None
    consultant_id: Optional[UUID] = None

    appointment_date: datetime
    consultation_type: str
    reason: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    patient_name: Optional[str] = None
    patient_email: Optional[str] = None

    dermatologist_name: Optional[str] = None
    dermatologist_email: Optional[str] = None

    consultant_name: Optional[str] = None
    consultant_email: Optional[str] = None