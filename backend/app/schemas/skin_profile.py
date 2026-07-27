import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class SkinProfileBase(BaseModel):
    skin_type: Optional[str] = None
    age_group: Optional[str] = None
    skin_concerns: List[str] = []
    allergies: List[str] = []
    sensitivities: List[str] = []
    sleep_quality: Optional[str] = None
    sleep_hours: float = 7.0
    water_intake_liters: float = 2.0
    lifestyle_habits: List[str] = []
    environmental_exposure: Optional[str] = None


class SkinProfileCreate(SkinProfileBase):
    pass


class SkinProfileOut(SkinProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID
    updated_at: datetime

    class Config:
        from_attributes = True
